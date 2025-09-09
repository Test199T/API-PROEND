# VITA WISE API Makefile
# Usage: make <command>

.PHONY: help build deploy clean test lint format

# Default target
help: ## Show this help message
	@echo "VITA WISE API - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run start:dev

build: ## Build the application
	npm run build

test: ## Run tests
	npm run test

test:e2e: ## Run e2e tests
	npm run test:e2e

test:cov: ## Run tests with coverage
	npm run test:cov

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

# Docker commands
docker:build: ## Build Docker image
	docker build -t vita-wise-api:latest .

docker:dev: ## Start development with Docker
	docker-compose --profile dev up --build

docker:prod: ## Start production with Docker
	docker-compose -f docker-compose.prod.yml up --build -d

docker:staging: ## Start staging with Docker
	docker-compose -f docker-compose.staging.yml up --build -d

docker:stop: ## Stop Docker containers
	docker-compose down
	docker-compose -f docker-compose.prod.yml down
	docker-compose -f docker-compose.staging.yml down

docker:logs: ## Show Docker logs
	docker-compose logs -f

# Jenkins commands
jenkins:build: ## Build with Jenkins
	@chmod +x scripts/build-jenkins.sh
	./scripts/build-jenkins.sh

jenkins:test: ## Run tests with Jenkins
	@chmod +x scripts/test-jenkins.sh
	./scripts/test-jenkins.sh

jenkins:deploy: ## Deploy with Jenkins
	@chmod +x scripts/deploy-jenkins.sh
	./scripts/deploy-jenkins.sh

jenkins:deploy:staging: ## Deploy to staging with Jenkins
	@chmod +x scripts/deploy-jenkins.sh
	./scripts/deploy-jenkins.sh staging

jenkins:deploy:prod: ## Deploy to production with Jenkins
	@chmod +x scripts/deploy-jenkins.sh
	./scripts/deploy-jenkins.sh production

# Cleanup commands
clean: ## Clean up all resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh all

clean:docker: ## Clean up Docker resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh docker

clean:jenkins: ## Clean up Jenkins resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh jenkins

clean:images: ## Clean up Docker images
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh images

# Health check commands
health: ## Check application health
	curl -f http://localhost:8080/health || echo "Service not running"

health:detailed: ## Check detailed health
	curl -f http://localhost:8080/health/detailed || echo "Service not running"

# Setup commands
setup: ## Initial setup
	@echo "Setting up VITA WISE API..."
	@chmod +x scripts/*.sh
	@cp env.example .env.development
	@cp env.example .env.production
	@echo "✅ Setup completed!"
	@echo "📝 Please update .env.development and .env.production with your values"
	@echo "🔧 Update Jenkins credentials in Jenkins UI"

# Production deployment
deploy:prod: ## Full production deployment
	@echo "🚀 Starting production deployment..."
	@make build
	@make docker:build
	@make jenkins:deploy:prod
	@echo "✅ Production deployment completed!"

# Development deployment
deploy:dev: ## Full development deployment
	@echo "🚀 Starting development deployment..."
	@make docker:dev
	@echo "✅ Development deployment completed!"
