#!/bin/bash

# Jenkins deployment script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
DOCKER_REGISTRY=${3:-"your-registry.com"}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo -e "${GREEN}🚀 Jenkins Deployment - VITA WISE API${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Image Tag: ${IMAGE_TAG}${NC}"
echo -e "${YELLOW}Registry: ${DOCKER_REGISTRY}${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    exit 1
fi

# Use docker compose if available, otherwise docker-compose
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# Set environment variables
export DOCKER_REGISTRY=${DOCKER_REGISTRY}
export IMAGE_TAG=${IMAGE_TAG}

# Pull latest images
echo -e "${BLUE}📥 Pulling latest images...${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE pull

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE down || true

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service status
echo -e "${BLUE}📊 Service Status:${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE ps

# Health check
echo -e "${BLUE}🏥 Health Check:${NC}"
if [ "$ENVIRONMENT" = "staging" ]; then
    HEALTH_URL="http://localhost:8081/health"
elif [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="http://localhost:8080/health"
else
    HEALTH_URL="http://localhost:8080/health"
fi

# Wait for health check
for i in {1..10}; do
    if curl -f $HEALTH_URL &> /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for health check... (${i}/10)${NC}"
        sleep 10
    fi
done

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE logs --tail=20

# Cleanup old images
echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 To view logs: $COMPOSE_CMD -f $COMPOSE_FILE logs -f${NC}"
echo -e "${YELLOW}💡 To stop: $COMPOSE_CMD -f $COMPOSE_FILE down${NC}"
