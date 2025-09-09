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
	@chmod +x scripts/build.sh
	./scripts/build.sh

docker:dev: ## Start development with Docker
	docker-compose --profile dev up --build

docker:prod: ## Start production with Docker
	docker-compose -f docker-compose.prod.yml up --build -d

docker:stop: ## Stop Docker containers
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

docker:logs: ## Show Docker logs
	docker-compose logs -f

# Kubernetes commands
k8s:deploy: ## Deploy to Kubernetes
	@chmod +x scripts/deploy-k8s.sh
	./scripts/deploy-k8s.sh

k8s:deploy:ingress: ## Deploy to Kubernetes with Ingress
	@chmod +x scripts/deploy-k8s.sh
	./scripts/deploy-k8s.sh latest your-registry.com ingress

k8s:status: ## Check Kubernetes deployment status
	kubectl get pods -n vita-wise
	kubectl get services -n vita-wise
	kubectl get ingress -n vita-wise

k8s:logs: ## Show Kubernetes logs
	kubectl logs -f deployment/vita-wise-api -n vita-wise

k8s:scale: ## Scale deployment (usage: make k8s:scale REPLICAS=3)
	kubectl scale deployment vita-wise-api --replicas=$(REPLICAS) -n vita-wise

# Cleanup commands
clean: ## Clean up all resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh all

clean:docker: ## Clean up Docker resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh docker

clean:k8s: ## Clean up Kubernetes resources
	@chmod +x scripts/cleanup.sh
	./scripts/cleanup.sh k8s

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
	@echo "🔧 Update k8s/secret.yaml with your base64 encoded secrets"

# Production deployment
deploy:prod: ## Full production deployment
	@echo "🚀 Starting production deployment..."
	@make build
	@make docker:build
	@make k8s:deploy
	@echo "✅ Production deployment completed!"

# Development deployment
deploy:dev: ## Full development deployment
	@echo "🚀 Starting development deployment..."
	@make docker:dev
	@echo "✅ Development deployment completed!"
