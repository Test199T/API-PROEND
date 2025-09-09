#!/bin/bash

# Docker Compose deployment script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ "$ENVIRONMENT" = "development" ]; then
    COMPOSE_FILE="docker-compose.yml"
    ENVIRONMENT="dev"
fi

echo -e "${GREEN}🚀 Deploying VITA WISE API with Docker Compose${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Compose file: ${COMPOSE_FILE}${NC}"

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

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
if [ "$ENVIRONMENT" = "dev" ]; then
    $COMPOSE_CMD --profile dev up --build -d
else
    $COMPOSE_CMD -f $COMPOSE_FILE up --build -d
fi

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}📊 Service Status:${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE ps

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
$COMPOSE_CMD -f $COMPOSE_FILE logs --tail=20

# Health check
echo -e "${BLUE}🏥 Health Check:${NC}"
if [ "$ENVIRONMENT" = "dev" ]; then
    HEALTH_URL="http://localhost:3000/health"
else
    HEALTH_URL="http://localhost:8080/health"
fi

if curl -f $HEALTH_URL &> /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but service might still be starting...${NC}"
fi

echo -e "${GREEN}🎉 VITA WISE API deployed successfully!${NC}"
echo -e "${YELLOW}💡 To view logs: $COMPOSE_CMD -f $COMPOSE_FILE logs -f${NC}"
echo -e "${YELLOW}💡 To stop: $COMPOSE_CMD -f $COMPOSE_FILE down${NC}"
echo -e "${YELLOW}💡 To restart: $COMPOSE_CMD -f $COMPOSE_FILE restart${NC}"
