#!/bin/bash
# filepath: /home/felipe/Documents/POC/infra/complete-infra/jenkins/simple-setup.sh

echo "🚀 Setting up Jenkins for POC Sample Application..."

# Check if Jenkins is installed
if ! helm list -n infra | grep -q jenkins; then
    echo "📦 Installing Jenkins..."
    helm repo add jenkins https://charts.jenkins.io
    helm repo update
    
    helm install jenkins jenkins/jenkins \
        --namespace infra \
        --create-namespace \
        --values ./jenkins/jenkins-values.yaml
    
    echo "⏳ Waiting for Jenkins to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=jenkins -n infra --timeout=300s
else
    echo "✅ Jenkins is already installed"
fi

# Check Jenkins status
echo "📊 Jenkins status:"
kubectl get pods -n infra -l app.kubernetes.io/name=jenkins

# Start port forwarding
echo "🌐 Starting port forward to Jenkins..."
echo "🔗 Jenkins will be available at: http://localhost:8080"
echo "🔐 Login with: admin/admin123"
echo ""
echo "📋 To create the pipeline job:"
echo "1. Go to http://localhost:8080"
echo "2. New Item > Pipeline > Name: 'poc-sample-app-test'"
echo "3. Copy content from: ./jenkins/jobs/sample-app-pipeline.groovy"
echo "4. Save and Build with Parameters"
echo ""
echo "Press Ctrl+C to stop port forwarding"

kubectl port-forward svc/jenkins 8080:8080 -n infra