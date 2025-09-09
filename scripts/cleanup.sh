#!/bin/bash

# Cleanup script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="vita-wise"
CLEANUP_TYPE=${1:-all}  # all, docker, k8s, images

echo -e "${GREEN}🧹 VITA WISE API Cleanup Script${NC}"
echo -e "${YELLOW}Cleanup type: ${CLEANUP_TYPE}${NC}"

case $CLEANUP_TYPE in
    "docker")
        echo -e "${BLUE}🐳 Cleaning up Docker resources...${NC}"
        
        # Stop and remove containers
        echo -e "${BLUE}🛑 Stopping containers...${NC}"
        docker-compose down 2>/dev/null || true
        docker compose down 2>/dev/null || true
        
        # Remove containers
        echo -e "${BLUE}🗑️  Removing containers...${NC}"
        docker container prune -f
        
        # Remove volumes
        echo -e "${BLUE}📦 Removing volumes...${NC}"
        docker volume prune -f
        
        echo -e "${GREEN}✅ Docker cleanup completed!${NC}"
        ;;
        
    "k8s")
        echo -e "${BLUE}☸️  Cleaning up Kubernetes resources...${NC}"
        
        # Check if kubectl is available
        if ! command -v kubectl &> /dev/null; then
            echo -e "${RED}❌ kubectl is not installed${NC}"
            exit 1
        fi
        
        # Delete resources
        echo -e "${BLUE}🗑️  Deleting Kubernetes resources...${NC}"
        kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
        
        echo -e "${GREEN}✅ Kubernetes cleanup completed!${NC}"
        ;;
        
    "images")
        echo -e "${BLUE}🖼️  Cleaning up Docker images...${NC}"
        
        # Remove VITA WISE API images
        echo -e "${BLUE}🗑️  Removing VITA WISE API images...${NC}"
        docker images | grep vita-wise-api | awk '{print $3}' | xargs -r docker rmi -f
        
        # Remove dangling images
        echo -e "${BLUE}🧹 Removing dangling images...${NC}"
        docker image prune -f
        
        echo -e "${GREEN}✅ Image cleanup completed!${NC}"
        ;;
        
    "all")
        echo -e "${BLUE}🧹 Full cleanup...${NC}"
        
        # Docker cleanup
        echo -e "${BLUE}🐳 Docker cleanup...${NC}"
        docker-compose down 2>/dev/null || true
        docker compose down 2>/dev/null || true
        docker container prune -f
        docker volume prune -f
        
        # Kubernetes cleanup
        if command -v kubectl &> /dev/null; then
            echo -e "${BLUE}☸️  Kubernetes cleanup...${NC}"
            kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
        fi
        
        # Image cleanup
        echo -e "${BLUE}🖼️  Image cleanup...${NC}"
        docker images | grep vita-wise-api | awk '{print $3}' | xargs -r docker rmi -f
        docker image prune -f
        
        echo -e "${GREEN}✅ Full cleanup completed!${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid cleanup type: ${CLEANUP_TYPE}${NC}"
        echo -e "${YELLOW}Usage: $0 [docker|k8s|images|all]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
