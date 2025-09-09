#!/bin/bash

# Jenkins test script for VITA WISE API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Jenkins Test - VITA WISE API${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run linting
echo -e "${BLUE}🔍 Running linter...${NC}"
npm run lint

# Run unit tests
echo -e "${BLUE}🧪 Running unit tests...${NC}"
npm run test

# Run e2e tests
echo -e "${BLUE}🧪 Running e2e tests...${NC}"
npm run test:e2e

# Run tests with coverage
echo -e "${BLUE}📊 Running tests with coverage...${NC}"
npm run test:cov

# Check coverage threshold
echo -e "${BLUE}📈 Checking coverage threshold...${NC}"
COVERAGE_THRESHOLD=80
COVERAGE_RESULT=$(npm run test:cov 2>&1 | grep -o 'All files[^%]*' | grep -o '[0-9]*\.[0-9]*%' | head -1 | sed 's/%//')

if [ -n "$COVERAGE_RESULT" ]; then
    if (( $(echo "$COVERAGE_RESULT >= $COVERAGE_THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅ Coverage ${COVERAGE_RESULT}% meets threshold ${COVERAGE_THRESHOLD}%${NC}"
    else
        echo -e "${RED}❌ Coverage ${COVERAGE_RESULT}% below threshold ${COVERAGE_THRESHOLD}%${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine coverage percentage${NC}"
fi

# Security audit
echo -e "${BLUE}🔒 Running security audit...${NC}"
npm audit --audit-level=moderate

# Build test
echo -e "${BLUE}🔨 Testing build...${NC}"
npm run build

echo -e "${GREEN}✅ All tests passed!${NC}"
