#!/bin/bash

# Terraform Kubernetes Infrastructure Deployment Script
# This script helps deploy the Kubernetes infrastructure with proper validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Kubernetes Infrastructure Deployment ===${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Check your kubeconfig."
        exit 1
    fi
    
    # Check if Helm is installed (for optional components)
    if ! command -v helm &> /dev/null; then
        print_warning "Helm is not installed. Optional components (ingress, monitoring) will fail."
    fi
    
    print_status "Prerequisites check completed successfully"
}

# Setup terraform.tfvars if it doesn't exist
setup_tfvars() {
    if [[ ! -f "terraform.tfvars" ]]; then
        print_status "Creating terraform.tfvars from example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "Please edit terraform.tfvars to customize your configuration"
        read -p "Press Enter to continue after editing terraform.tfvars..."
    fi
}

# Deploy infrastructure
deploy() {
    print_status "Starting Terraform deployment..."
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Validate configuration
    print_status "Validating Terraform configuration..."
    terraform validate
    
    # Plan deployment
    print_status "Planning deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    echo
    read -p "Do you want to apply this plan? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Apply the plan
        print_status "Applying Terraform configuration..."
        terraform apply tfplan
        
        # Clean up plan file
        rm -f tfplan
        
        print_status "Deployment completed successfully!"
        
        # Show outputs
        echo
        print_status "Deployment outputs:"
        terraform output
        
    else
        print_status "Deployment cancelled by user"
        rm -f tfplan
        exit 0
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check namespaces
    echo
    print_status "Checking namespaces:"
    kubectl get namespaces app infra
    
    # Check resource quotas
    echo
    print_status "Checking resource quotas:"
    kubectl get resourcequota -n app
    kubectl get resourcequota -n infra
    
    # Check service accounts
    echo
    print_status "Checking service accounts:"
    kubectl get serviceaccounts -n app
    kubectl get serviceaccounts -n infra
    
    # Check optional components
    if kubectl get deployment -n infra nginx-ingress-controller &> /dev/null; then
        print_status "NGINX Ingress Controller is deployed"
    fi
    
    if kubectl get deployment -n infra prometheus-kube-prometheus-prometheus &> /dev/null; then
        print_status "Prometheus monitoring stack is deployed"
    fi
    
    print_status "Verification completed!"
}

# Show useful commands
show_useful_commands() {
    echo
    print_status "Useful commands for managing your infrastructure:"
    echo
    echo "# Check namespace status:"
    echo "kubectl get namespaces"
    echo "kubectl describe namespace app"
    echo "kubectl describe namespace infra"
    echo
    echo "# Check resource usage:"
    echo "kubectl top pods -n app"
    echo "kubectl top pods -n infra"
    echo
    echo "# Access Grafana (if monitoring is enabled):"
    echo "kubectl port-forward -n infra svc/prometheus-grafana 3000:80"
    echo "# Then visit: http://localhost:3000 (admin/admin123)"
    echo
    echo "# Check Ingress (if enabled):"
    echo "kubectl get ingress -A"
    echo
    echo "# View Terraform outputs:"
    echo "terraform output"
}

# Main execution
main() {
    # Change to script directory
    cd "$(dirname "$0")"
    
    check_prerequisites
    setup_tfvars
    deploy
    verify_deployment
    show_useful_commands
    
    echo
    print_status "🎉 Infrastructure deployment completed successfully!"
    print_status "Your Kubernetes cluster now has 'app' and 'infra' namespaces ready for use."
}

# Handle script arguments
case "${1:-}" in
    "deploy")
        main
        ;;
    "destroy")
        print_warning "This will destroy all infrastructure created by Terraform!"
        read -p "Are you sure? Type 'yes' to confirm: " -r
        if [[ $REPLY == "yes" ]]; then
            terraform destroy
            print_status "Infrastructure destroyed successfully"
        else
            print_status "Destroy cancelled"
        fi
        ;;
    "plan")
        check_prerequisites
        terraform plan
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|destroy|plan|verify}"
        echo
        echo "Commands:"
        echo "  deploy  - Deploy the complete infrastructure"
        echo "  destroy - Destroy all infrastructure"
        echo "  plan    - Show deployment plan without applying"
        echo "  verify  - Verify existing deployment"
        exit 1
        ;;
esac
