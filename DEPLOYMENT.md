# VITA WISE API - Deployment Guide

คู่มือการ deploy VITA WISE API ด้วย Docker และ Kubernetes

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Environment Configuration](#environment-configuration)
- [Health Checks](#health-checks)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### สำหรับ Docker Deployment
- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM (แนะนำ)
- 2 CPU cores (แนะนำ)

### สำหรับ Kubernetes Deployment
- Kubernetes cluster 1.20+
- kubectl configured
- Container registry access
- 16GB RAM (แนะนำ)
- 4 CPU cores (แนะนำ)

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Clone repository
git clone <your-repo-url>
cd API-PROEND

# Initial setup
make setup

# Update environment files
cp env.example .env.development
cp env.example .env.production
# Edit .env files with your values
```

### 2. Docker Deployment (Development)
```bash
# Start development environment
make docker:dev

# หรือใช้ docker-compose โดยตรง
docker-compose --profile dev up --build
```

### 3. Docker Deployment (Production)
```bash
# Build and start production
make docker:prod

# หรือใช้ docker-compose โดยตรง
docker-compose -f docker-compose.prod.yml up --build -d
```

### 4. Kubernetes Deployment
```bash
# Deploy to Kubernetes
make k8s:deploy

# Deploy with Ingress
make k8s:deploy:ingress
```

## 🐳 Docker Deployment

### Development Environment

```bash
# Start with hot reload
make docker:dev

# View logs
make docker:logs

# Stop services
make docker:stop
```

**Features:**
- Hot reload enabled
- Volume mounting for development
- Port 3000 exposed
- Development dependencies included

### Production Environment

```bash
# Build and start production
make docker:prod

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Features:**
- Multi-stage build for optimization
- Non-root user for security
- Health checks enabled
- Resource limits configured
- Port 8080 exposed

### Docker Commands

```bash
# Build image
make docker:build

# Build with custom tag
./scripts/build.sh v1.0.0 your-registry.com

# Build and push to registry
./scripts/build.sh v1.0.0 your-registry.com push

# Clean up Docker resources
make clean:docker
```

## ☸️ Kubernetes Deployment

### Prerequisites

1. **Update Configuration:**
```bash
# Update k8s/secret.yaml with your base64 encoded values
echo -n "your-supabase-url" | base64
echo -n "your-jwt-secret" | base64
# ... add all your secrets
```

2. **Update Image Registry:**
```bash
# Update k8s/deployment.yaml
# Change: image: vita-wise-api:latest
# To: image: your-registry.com/vita-wise-api:latest
```

### Deploy to Kubernetes

```bash
# Basic deployment
make k8s:deploy

# Deploy with Ingress
make k8s:deploy:ingress

# Check deployment status
make k8s:status

# View logs
make k8s:logs

# Scale deployment
make k8s:scale REPLICAS=5
```

### Kubernetes Resources

| Resource | Description |
|----------|-------------|
| **Namespace** | `vita-wise` - Isolates resources |
| **ConfigMap** | Non-sensitive configuration |
| **Secret** | Sensitive data (API keys, passwords) |
| **Deployment** | Application pods with 3 replicas |
| **Service** | ClusterIP and NodePort services |
| **Ingress** | External access with SSL |
| **HPA** | Auto-scaling based on CPU/Memory |

### Accessing the Application

```bash
# Get service URL
kubectl get services -n vita-wise

# Port forward for testing
kubectl port-forward service/vita-wise-api-service 8080:80 -n vita-wise

# Access via NodePort
curl http://your-node-ip:30080/health
```

## ⚙️ Environment Configuration

### Development (.env.development)
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
# ... other development settings
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
# ... other production settings
```

### Kubernetes Secrets

```bash
# Create secrets manually
kubectl create secret generic vita-wise-secrets \
  --from-literal=SUPABASE_URL="your-url" \
  --from-literal=JWT_SECRET="your-secret" \
  -n vita-wise

# Or update k8s/secret.yaml and apply
kubectl apply -f k8s/secret.yaml
```

## 🏥 Health Checks

### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | General health check | Service status |
| `/health/ready` | Readiness probe | Ready to serve traffic |
| `/health/live` | Liveness probe | Application is alive |
| `/health/detailed` | Detailed diagnostics | Full system status |

### Testing Health Checks

```bash
# Docker
curl http://localhost:8080/health

# Kubernetes
kubectl port-forward service/vita-wise-api-service 8080:80 -n vita-wise
curl http://localhost:8080/health
```

## 📊 Monitoring & Logging

### Docker Logs
```bash
# View logs
make docker:logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
```

### Kubernetes Logs
```bash
# View logs
make k8s:logs

# View logs for specific pod
kubectl logs -f pod-name -n vita-wise

# View logs for all pods
kubectl logs -l app=vita-wise-api -n vita-wise
```

### Monitoring Commands
```bash
# Check pod status
kubectl get pods -n vita-wise

# Check resource usage
kubectl top pods -n vita-wise

# Check events
kubectl get events -n vita-wise --sort-by='.lastTimestamp'
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Build Fails
```bash
# Check Docker daemon
docker info

# Clean up and rebuild
make clean:docker
make docker:build
```

#### 2. Kubernetes Deployment Fails
```bash
# Check cluster connectivity
kubectl cluster-info

# Check pod status
kubectl describe pod pod-name -n vita-wise

# Check logs
kubectl logs pod-name -n vita-wise
```

#### 3. Health Checks Failing
```bash
# Check if application is running
kubectl get pods -n vita-wise

# Check service endpoints
kubectl get endpoints -n vita-wise

# Test health endpoint directly
kubectl port-forward service/vita-wise-api-service 8080:80 -n vita-wise
curl http://localhost:8080/health
```

#### 4. Database Connection Issues
```bash
# Check environment variables
kubectl exec -it pod-name -n vita-wise -- env | grep SUPABASE

# Test database connection
kubectl exec -it pod-name -n vita-wise -- curl http://localhost:8080/health/detailed
```

### Debug Commands

```bash
# Get detailed pod information
kubectl describe pod pod-name -n vita-wise

# Check resource usage
kubectl top pod pod-name -n vita-wise

# Check service endpoints
kubectl get endpoints -n vita-wise

# Check ingress status
kubectl describe ingress vita-wise-api-ingress -n vita-wise
```

### Cleanup Commands

```bash
# Clean up everything
make clean

# Clean up specific resources
make clean:docker
make clean:k8s
make clean:images
```

## 📚 Additional Resources

### Useful Commands

```bash
# View all available commands
make help

# Quick health check
make health

# Detailed health check
make health:detailed

# Full production deployment
make deploy:prod

# Full development deployment
make deploy:dev
```

### File Structure

```
├── Dockerfile                 # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── docker-compose.yml        # Development compose
├── docker-compose.prod.yml   # Production compose
├── k8s/                      # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── scripts/                  # Deployment scripts
│   ├── build.sh
│   ├── deploy-k8s.sh
│   ├── deploy-docker.sh
│   └── cleanup.sh
├── Makefile                  # Command shortcuts
└── DEPLOYMENT.md            # This file
```

## 🆘 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ logs ด้วย commands ข้างต้น
2. ตรวจสอบ health endpoints
3. ตรวจสอบ environment configuration
4. สร้าง issue ใน GitHub repository

---

**Happy Deploying! 🚀**
