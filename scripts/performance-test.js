#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      requests: [],
      errors: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        totalResponseTime: 0,
      },
    };
  }

  async makeRequest(path, options = {}) {
    const startTime = performance.now();
    const url = `${this.baseUrl}${path}`;
    
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Performance-Tester/1.0',
          ...options.headers,
        },
        timeout: options.timeout || 10000,
      };

      const client = url.startsWith('https') ? https : http;
      
      const req = client.request(url, requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          const result = {
            path,
            method: requestOptions.method,
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            headers: res.headers,
            timestamp: new Date().toISOString(),
          };
          
          resolve(result);
        });
      });
      
      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        reject({
          path,
          method: requestOptions.method,
          error: error.message,
          responseTime,
          timestamp: new Date().toISOString(),
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject({
          path,
          method: requestOptions.method,
          error: 'Request timeout',
          responseTime: options.timeout || 10000,
          timestamp: new Date().toISOString(),
        });
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async runLoadTest(path, concurrency = 10, duration = 30000) {
    console.log(`🚀 Starting load test for ${path}`);
    console.log(`📊 Concurrency: ${concurrency}, Duration: ${duration}ms`);
    
    const startTime = performance.now();
    const promises = [];
    
    // Create concurrent requests
    for (let i = 0; i < concurrency; i++) {
      const promise = this.runContinuousRequests(path, startTime, duration);
      promises.push(promise);
    }
    
    // Wait for all requests to complete
    await Promise.all(promises);
    
    this.calculateSummary();
    this.printResults();
  }

  async runContinuousRequests(path, startTime, duration) {
    while (performance.now() - startTime < duration) {
      try {
        const result = await this.makeRequest(path);
        this.results.requests.push(result);
        this.results.summary.total++;
        this.results.summary.successful++;
        this.results.summary.totalResponseTime += result.responseTime;
        this.results.summary.minResponseTime = Math.min(this.results.summary.minResponseTime, result.responseTime);
        this.results.summary.maxResponseTime = Math.max(this.results.summary.maxResponseTime, result.responseTime);
      } catch (error) {
        this.results.errors.push(error);
        this.results.summary.total++;
        this.results.summary.failed++;
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  calculateSummary() {
    if (this.results.summary.successful > 0) {
      this.results.summary.averageResponseTime = this.results.summary.totalResponseTime / this.results.summary.successful;
    }
    
    if (this.results.summary.minResponseTime === Infinity) {
      this.results.summary.minResponseTime = 0;
    }
  }

  printResults() {
    console.log('\n📈 Performance Test Results');
    console.log('='.repeat(50));
    console.log(`Total Requests: ${this.results.summary.total}`);
    console.log(`Successful: ${this.results.summary.successful}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.successful / this.results.summary.total) * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${this.results.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${this.results.summary.minResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${this.results.summary.maxResponseTime.toFixed(2)}ms`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. ${error.path} - ${error.error}`);
      });
      if (this.results.errors.length > 5) {
        console.log(`... and ${this.results.errors.length - 5} more errors`);
      }
    }
    
    // Response time distribution
    const responseTimes = this.results.requests.map(r => r.responseTime);
    responseTimes.sort((a, b) => a - b);
    
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
    
    console.log('\n📊 Response Time Percentiles:');
    console.log(`P50: ${p50?.toFixed(2) || 0}ms`);
    console.log(`P95: ${p95?.toFixed(2) || 0}ms`);
    console.log(`P99: ${p99?.toFixed(2) || 0}ms`);
  }

  async testEndpoints() {
    const endpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/api/health/detailed', name: 'Detailed Health' },
      { path: '/api/health/ready', name: 'Readiness Check' },
      { path: '/api/health/live', name: 'Liveness Check' },
      { path: '/api/metrics', name: 'Metrics' },
    ];

    console.log('🔍 Testing individual endpoints...\n');

    for (const endpoint of endpoints) {
      try {
        const result = await this.makeRequest(endpoint.path);
        console.log(`✅ ${endpoint.name}: ${result.statusCode} (${result.responseTime.toFixed(2)}ms)`);
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.error}`);
      }
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  const tester = new PerformanceTester(baseUrl);

  if (args.includes('--load-test')) {
    const concurrency = parseInt(args[args.indexOf('--concurrency') + 1]) || 10;
    const duration = parseInt(args[args.indexOf('--duration') + 1]) || 30000;
    const path = args[args.indexOf('--path') + 1] || '/api/health';
    
    await tester.runLoadTest(path, concurrency, duration);
  } else {
    await tester.testEndpoints();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTester;
