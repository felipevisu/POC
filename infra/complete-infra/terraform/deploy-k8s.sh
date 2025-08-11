#!/bin/bash
set -e

echo "🚀 Deploying Jenkins and Kubernetes resources to EKS cluster"

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl is not configured. Please run the kubectl config command from terraform output first."
    echo "Run: terraform output kubectl_config_command"
    exit 1
fi

echo "✅ kubectl is configured"

# Check if cluster is ready
echo "⏳ Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# Create namespaces
echo "📁 Creating namespaces..."
kubectl create namespace infra --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace app --dry-run=client -o yaml | kubectl apply -f -

# Add Jenkins Helm repository
echo "📦 Adding Jenkins Helm repository..."
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Install Jenkins
echo "🔧 Installing Jenkins..."
helm upgrade --install jenkins jenkins/jenkins \
  --namespace infra \
  --values ../jenkins/jenkins-values.yaml \
  --wait --timeout=600s

# Apply RBAC for Jenkins to deploy to app namespace
echo "🔐 Applying RBAC for Jenkins..."
kubectl apply -f ../jenkins/rbac-app.yaml

# Create LoadBalancer service for Jenkins
echo "🌐 Creating LoadBalancer for Jenkins..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: jenkins-lb
  namespace: infra
spec:
  selector:
    app.kubernetes.io/component: jenkins-controller
    app.kubernetes.io/instance: jenkins
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
  type: LoadBalancer
EOF

echo "⏳ Waiting for Jenkins to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/jenkins -n infra

echo "🎉 Jenkins deployment completed!"
echo ""
echo "📊 Deployment Status:"
echo "==================="
kubectl get pods -n infra
kubectl get svc -n infra

echo ""
echo "🔗 Access Jenkins:"
echo "================="

# Try to get LoadBalancer URL
JENKINS_LB=$(kubectl get svc jenkins-lb -n infra -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
if [ -n "$JENKINS_LB" ] && [ "$JENKINS_LB" != "null" ]; then
    echo "LoadBalancer URL: http://$JENKINS_LB"
else
    echo "LoadBalancer is being provisioned. Use port-forward for immediate access:"
fi

echo "Port-forward command: kubectl port-forward svc/jenkins 8080:8080 -n infra"
echo "Login: admin / admin123"
echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Next Steps:"
echo "============="
echo "1. Access Jenkins using one of the methods above"
echo "2. Create a new pipeline job"
echo "3. Copy the pipeline script from: ../jenkins/jobs/aws-eks-deploy-pipeline.groovy"
echo "4. Update the REPO_URL in the pipeline to your FastAPI repository"
echo "5. Run the pipeline to deploy your application!"
