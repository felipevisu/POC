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
echo "Jenkins status:"
kubectl get pods -n infra -l app.kubernetes.io/name=jenkins

# Allow Jenkins manage app namespace
kubectl apply -f jenkins/rbac-app.yaml

# Run on port 8080
kubectl port-forward svc/jenkins 8080:8080 -n infra