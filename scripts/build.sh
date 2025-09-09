#!/bin/bash

# Build script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="vita-wise-api"
IMAGE_TAG=${1:-latest}
REGISTRY=${2:-"your-registry.com"}  # Replace with your container registry
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${GREEN}🚀 Building VITA WISE API Docker Image${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Build the Docker image
echo -e "${GREEN}📦 Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Tag for registry
echo -e "${GREEN}🏷️  Tagging image for registry...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE_NAME}

# Push to registry (optional)
if [ "$3" = "push" ]; then
    echo -e "${GREEN}📤 Pushing image to registry...${NC}"
    docker push ${FULL_IMAGE_NAME}
    echo -e "${GREEN}✅ Image pushed successfully!${NC}"
else
    echo -e "${YELLOW}💡 To push to registry, run: $0 $1 $2 push${NC}"
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${YELLOW}Local image: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo -e "${YELLOW}Registry image: ${FULL_IMAGE_NAME}${NC}"
