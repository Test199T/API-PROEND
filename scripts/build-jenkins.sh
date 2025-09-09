#!/bin/bash

# Jenkins build script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="vita-wise-api"
IMAGE_TAG=${1:-latest}
DOCKER_REGISTRY=${2:-"your-registry.com"}
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${GREEN}🔨 Jenkins Build - VITA WISE API${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run linting
echo -e "${BLUE}🔍 Running linter...${NC}"
npm run lint

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test

# Build application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

# Build Docker image
echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Tag for registry
echo -e "${BLUE}🏷️  Tagging image for registry...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE_NAME}

# Security scan
echo -e "${BLUE}🔒 Running security scan...${NC}"
if command -v trivy &> /dev/null; then
    trivy image --exit-code 0 --severity HIGH,CRITICAL ${FULL_IMAGE_NAME}
else
    echo -e "${YELLOW}⚠️  Trivy not found, skipping security scan${NC}"
fi

# Push to registry
echo -e "${BLUE}📤 Pushing image to registry...${NC}"
docker push ${FULL_IMAGE_NAME}

# Also tag as latest if not already
if [ "$IMAGE_TAG" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
fi

# Cleanup local images
echo -e "${BLUE}🧹 Cleaning up local images...${NC}"
docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true
docker rmi ${FULL_IMAGE_NAME} || true

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${YELLOW}Registry image: ${FULL_IMAGE_NAME}${NC}"
