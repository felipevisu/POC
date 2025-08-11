#!/bin/bash
set -e

echo "🚀 Setting up AWS EKS infrastructure for Jenkins + FastAPI POC"

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it first."
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install it first."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Check AWS credentials
echo "🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi
echo "✅ AWS credentials are configured"

# Navigate to terraform directory
cd terraform

# Initialize Terraform
echo "🏗️  Initializing Terraform..."
terraform init

# Plan the deployment
echo "📋 Planning Terraform deployment..."
terraform plan

# Ask for confirmation
read -p "🤔 Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Apply Terraform
echo "🚀 Deploying infrastructure..."
terraform apply -auto-approve

# Configure kubectl
echo "⚙️  Configuring kubectl..."
CLUSTER_NAME=$(terraform output -raw cluster_name)
AWS_REGION=$(terraform output -raw aws_region || echo "us-west-2")
aws eks --region $AWS_REGION update-kubeconfig --name $CLUSTER_NAME

# Deploy Kubernetes resources
echo "🔧 Deploying Jenkins and Kubernetes resources..."
./deploy-k8s.sh

echo "🎉 Deployment completed!"
echo ""
echo "📊 Infrastructure Details:"
echo "=========================="
echo "Cluster Name: $CLUSTER_NAME"
echo "Region: $AWS_REGION"
echo ""

# Get Jenkins URL
JENKINS_LB=$(kubectl get svc jenkins-lb -n infra -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
if [ "$JENKINS_LB" != "pending" ]; then
    echo "🔗 Jenkins URL: http://$JENKINS_LB"
else
    echo "⏳ Jenkins LoadBalancer is still being created. Check status with:"
    echo "   kubectl get svc jenkins-lb -n infra"
fi

echo "👤 Jenkins Login: admin / admin123"
echo ""
echo "🔧 Useful Commands:"
echo "=================="
echo "# Access Jenkins locally:"
echo "kubectl port-forward svc/jenkins 8080:8080 -n infra"
echo ""
echo "# Check cluster status:"
echo "kubectl get nodes"
echo "kubectl get pods -A"
echo ""
echo "# Destroy infrastructure when done:"
echo "terraform destroy"
echo ""
echo "✅ Setup completed successfully!"
