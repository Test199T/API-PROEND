#!/bin/bash

# Kubernetes deployment script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="vita-wise"
IMAGE_TAG=${1:-latest}
REGISTRY=${2:-"your-registry.com"}  # Replace with your container registry
IMAGE_NAME="vita-wise-api"
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${GREEN}🚀 Deploying VITA WISE API to Kubernetes${NC}"
echo -e "${YELLOW}Namespace: ${NAMESPACE}${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if cluster is accessible
echo -e "${BLUE}🔍 Checking cluster connectivity...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${BLUE}📁 Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap
echo -e "${BLUE}⚙️  Applying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

# Apply Secret (make sure to update with your values)
echo -e "${BLUE}🔐 Applying Secret...${NC}"
echo -e "${YELLOW}⚠️  Make sure to update k8s/secret.yaml with your actual values${NC}"
kubectl apply -f k8s/secret.yaml

# Update deployment with new image
echo -e "${BLUE}🔄 Updating deployment image...${NC}"
kubectl set image deployment/vita-wise-api vita-wise-api=${FULL_IMAGE_NAME} -n ${NAMESPACE} || \
kubectl apply -f k8s/deployment.yaml

# Apply Service
echo -e "${BLUE}🌐 Applying Service...${NC}"
kubectl apply -f k8s/service.yaml

# Apply Ingress (optional)
if [ "$3" = "ingress" ]; then
    echo -e "${BLUE}🔗 Applying Ingress...${NC}"
    kubectl apply -f k8s/ingress.yaml
fi

# Apply HPA
echo -e "${BLUE}📈 Applying HorizontalPodAutoscaler...${NC}"
kubectl apply -f k8s/hpa.yaml

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/vita-wise-api -n ${NAMESPACE} --timeout=300s

# Show deployment status
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE} 2>/dev/null || echo "No ingress configured"

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
kubectl logs -l app=vita-wise-api -n ${NAMESPACE} --tail=10

echo -e "${GREEN}🎉 VITA WISE API deployed successfully!${NC}"
echo -e "${YELLOW}💡 To view logs: kubectl logs -f deployment/vita-wise-api -n ${NAMESPACE}${NC}"
echo -e "${YELLOW}💡 To scale: kubectl scale deployment vita-wise-api --replicas=3 -n ${NAMESPACE}${NC}"
