pipeline {
    agent {
        label 'built-in'
    }
    
    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to checkout')
    }
    
    environment {
        GITHUB_REPO = "https://github.com/felipevisu/POC-sample-application.git"
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out branch: ${params.BRANCH}"
                    deleteDir()
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${params.BRANCH}"]],
                        userRemoteConfigs: [[url: "${GITHUB_REPO}"]]
                    ])
                }
            }
        }
        
        stage('List Files') {
            steps {
                script {
                    echo "Listing repository contents:"
                    sh "ls -la"
                    
                    echo "Checking if Dockerfile exists:"
                    sh "test -f Dockerfile && echo 'Dockerfile found' || echo 'No Dockerfile found'"
                    
                    echo "Checking Python files:"
                    sh "find . -name '*.py' | head -10"
                }
            }
        }
        
        stage('Check Python') {
            steps {
                script {
                    echo "Checking Python version:"
                    sh "python3 --version || echo 'Python3 not available'"
                    sh "which python3 || echo 'Python3 not in PATH'"
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        success {
            echo 'Repository checkout successful!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}