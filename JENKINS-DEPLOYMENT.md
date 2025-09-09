# VITA WISE API - Jenkins + Docker Deployment Guide

คู่มือการ deploy VITA WISE API ด้วย Jenkins และ Docker

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Jenkins Setup](#jenkins-setup)
- [Pipeline Configuration](#pipeline-configuration)
- [Docker Configuration](#docker-configuration)
- [Deployment Process](#deployment-process)
- [Environment Management](#environment-management)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Jenkins Server**: 2.400+ with Docker plugin
- **Docker Engine**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (for local development)
- **Git**: Latest version

### Required Jenkins Plugins
- Docker Pipeline Plugin
- Git Plugin
- Credentials Plugin
- Build Timeout Plugin
- Timestamper Plugin

## 🚀 Jenkins Setup

### 1. Install Jenkins

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### 2. Configure Jenkins

1. **Access Jenkins**: `http://your-server:8080`
2. **Install suggested plugins**
3. **Create admin user**
4. **Install additional plugins**:
   - Docker Pipeline
   - Git
   - Credentials Binding
   - Build Timeout

### 3. Configure Docker

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

## 🔧 Pipeline Configuration

### 1. Create New Pipeline Job

1. **New Item** → **Pipeline**
2. **Name**: `vita-wise-api-pipeline`
3. **Pipeline script from SCM**
4. **SCM**: Git
5. **Repository URL**: Your Git repository
6. **Script Path**: `Jenkinsfile`

### 2. Configure Credentials

Add the following credentials in Jenkins:

| Credential ID | Type | Description |
|---------------|------|-------------|
| `docker-registry-credentials` | Username/Password | Docker registry access |
| `supabase-url` | Secret text | Supabase URL |
| `supabase-anon-key` | Secret text | Supabase anonymous key |
| `supabase-service-role-key` | Secret text | Supabase service role key |
| `jwt-secret` | Secret text | JWT secret key |
| `openrouter-api-key` | Secret text | OpenRouter API key |
| `git-credentials` | Username/Password | Git repository access |

### 3. Pipeline Triggers

- **SCM Polling**: `H/5 * * * *` (every 5 minutes)
- **Build Periodically**: `0 2 * * *` (daily at 2 AM)
- **GitHub Webhooks** (if using GitHub)

## 🐳 Docker Configuration

### 1. Environment Files

Create environment files for different stages:

#### `.env.staging`
```env
NODE_ENV=staging
PORT=8080
LOG_LEVEL=debug
SUPABASE_URL=your_staging_supabase_url
SUPABASE_ANON_KEY=your_staging_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
JWT_SECRET=your_staging_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

#### `.env.production`
```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
JWT_SECRET=your_production_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Docker Compose Files

#### `docker-compose.staging.yml`
- Port: 8081
- Environment: staging
- Resource limits: Lower
- Debug logging enabled

#### `docker-compose.prod.yml`
- Port: 8080
- Environment: production
- Resource limits: Higher
- Production logging

## 🚀 Deployment Process

### 1. Automatic Deployment

The pipeline automatically deploys based on branch:

- **`develop` branch** → Staging environment
- **`main` branch** → Production environment

### 2. Manual Deployment

```bash
# Deploy to staging
make jenkins:deploy:staging

# Deploy to production
make jenkins:deploy:prod

# Or use scripts directly
./scripts/deploy-jenkins.sh staging
./scripts/deploy-jenkins.sh production
```

### 3. Pipeline Stages

1. **Checkout**: Get source code
2. **Install Dependencies**: `npm ci`
3. **Lint & Format**: Code quality checks
4. **Run Tests**: Unit and e2e tests
5. **Build Application**: `npm run build`
6. **Build Docker Image**: Create container image
7. **Security Scan**: Trivy vulnerability scan
8. **Push to Registry**: Upload image
9. **Deploy**: Deploy to target environment
10. **Health Check**: Verify deployment

## 🌍 Environment Management

### 1. Staging Environment

- **URL**: `http://your-server:8081`
- **Purpose**: Testing and validation
- **Database**: Separate staging database
- **Logs**: Debug level enabled

### 2. Production Environment

- **URL**: `http://your-server:8080`
- **Purpose**: Live application
- **Database**: Production database
- **Logs**: Info level only

### 3. Environment Variables

All sensitive data is managed through Jenkins credentials:

```groovy
environment {
    SUPABASE_URL = credentials('supabase-url')
    JWT_SECRET = credentials('jwt-secret')
    // ... other credentials
}
```

## 📊 Monitoring & Logging

### 1. Application Logs

```bash
# View staging logs
docker-compose -f docker-compose.staging.yml logs -f

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Health Checks

```bash
# Staging health check
curl http://localhost:8081/health

# Production health check
curl http://localhost:8080/health

# Detailed health check
curl http://localhost:8080/health/detailed
```

### 3. Jenkins Build Logs

- Access Jenkins UI
- Navigate to your pipeline
- Click on build number
- View console output

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Build Fails

```bash
# Check Docker daemon
docker info

# Check disk space
df -h

# Clean up Docker
docker system prune -a
```

#### 2. Pipeline Fails at Test Stage

```bash
# Run tests locally
npm run test

# Check test coverage
npm run test:cov

# Fix linting issues
npm run lint --fix
```

#### 3. Deployment Fails

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### 4. Health Check Fails

```bash
# Check if application is running
docker ps | grep vita-wise

# Check port binding
netstat -tlnp | grep 8080

# Test health endpoint
curl -v http://localhost:8080/health
```

### Debug Commands

```bash
# Check Jenkins workspace
ls -la /var/lib/jenkins/workspace/

# Check Docker images
docker images | grep vita-wise

# Check running containers
docker ps | grep vita-wise

# Check resource usage
docker stats
```

## 📚 Useful Commands

### Jenkins Commands

```bash
# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f
```

### Docker Commands

```bash
# Build image
make docker:build

# Run tests
make jenkins:test

# Deploy to staging
make jenkins:deploy:staging

# Deploy to production
make jenkins:deploy:prod

# Clean up
make clean
```

### Pipeline Commands

```bash
# Trigger build manually
curl -X POST http://jenkins-server:8080/job/vita-wise-api-pipeline/build

# Get build status
curl http://jenkins-server:8080/job/vita-wise-api-pipeline/lastBuild/api/json
```

## 🔒 Security Best Practices

### 1. Credentials Management

- Use Jenkins credentials store
- Never hardcode secrets in code
- Rotate credentials regularly
- Use least privilege principle

### 2. Docker Security

- Use non-root user in containers
- Scan images for vulnerabilities
- Keep base images updated
- Use multi-stage builds

### 3. Network Security

- Use internal networks
- Limit exposed ports
- Use reverse proxy
- Enable SSL/TLS

## 📈 Performance Optimization

### 1. Build Optimization

- Use Docker layer caching
- Parallel test execution
- Optimize Dockerfile
- Use .dockerignore

### 2. Deployment Optimization

- Use health checks
- Implement rolling updates
- Monitor resource usage
- Set appropriate limits

## 🆘 Support

If you encounter issues:

1. Check Jenkins build logs
2. Check Docker container logs
3. Verify environment variables
4. Test health endpoints
5. Check resource usage

---

**Happy Deploying with Jenkins! 🚀**
