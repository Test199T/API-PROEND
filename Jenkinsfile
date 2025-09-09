pipeline {
    agent any
    
    environment {
        // Docker configuration
        DOCKER_REGISTRY = 'your-registry.com'  // Replace with your registry
        IMAGE_NAME = 'vita-wise-api'
        IMAGE_TAG = "${BUILD_NUMBER}"
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        
        // Application configuration
        NODE_ENV = 'production'
        PORT = '8080'
        
        // Credentials (configure in Jenkins)
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
        SUPABASE_URL = credentials('supabase-url')
        SUPABASE_ANON_KEY = credentials('supabase-anon-key')
        SUPABASE_SERVICE_ROLE_KEY = credentials('supabase-service-role-key')
        JWT_SECRET = credentials('jwt-secret')
        OPENROUTER_API_KEY = credentials('openrouter-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm ci'
            }
        }
        
        stage('Lint & Format') {
            steps {
                echo '🔍 Running linter...'
                sh 'npm run lint'
                
                echo '✨ Formatting code...'
                sh 'npm run format'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                sh 'npm run test'
            }
            post {
                always {
                    echo '📊 Publishing test results...'
                    publishTestResults testResultsPattern: 'test-results.xml'
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo '🔨 Building application...'
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    def image = docker.build("${FULL_IMAGE_NAME}")
                    echo "✅ Docker image built: ${FULL_IMAGE_NAME}"
                }
            }
        }
        
        stage('Run Security Scan') {
            steps {
                echo '🔒 Running security scan...'
                script {
                    // Run Trivy security scan
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${FULL_IMAGE_NAME}"
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo '📤 Pushing image to registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS}") {
                        docker.image("${FULL_IMAGE_NAME}").push()
                        docker.image("${FULL_IMAGE_NAME}").push("latest")
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '🚀 Deploying to staging...'
                script {
                    // Deploy to staging environment
                    sh """
                        docker-compose -f docker-compose.staging.yml down || true
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production...'
                script {
                    // Deploy to production environment
                    sh """
                        docker-compose -f docker-compose.prod.yml down || true
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Running health check...'
                script {
                    // Wait for application to start
                    sh 'sleep 30'
                    
                    // Run health check
                    sh """
                        curl -f http://localhost:8080/health || exit 1
                        echo "✅ Health check passed!"
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
        
        success {
            echo '🎉 Pipeline completed successfully!'
            // Send success notification
            script {
                if (env.BRANCH_NAME == 'main') {
                    // Send production deployment notification
                    echo "📢 Production deployment successful!"
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notification
            script {
                echo "📢 Deployment failed! Please check the logs."
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings!'
        }
    }
}
