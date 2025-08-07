# Jenkins Pipeline for Sample Application

This directory contains Jenkins pipeline configurations and examples for deploying your sample application to the Kubernetes cluster.

## Pipeline Overview

The Jenkins pipeline will:

1. **Build**: Build the Docker image from your sample application
2. **Test**: Run any tests (if available)
3. **Deploy**: Deploy the application to the `app` namespace
4. **Verify**: Check the deployment status

## Prerequisites

1. Jenkins must be running in the `infra` namespace
2. Docker registry access (for storing built images)
3. Kubernetes access configured in Jenkins

## Jenkins Pipeline Script

The pipeline script (`Jenkinsfile.k8s`) will:

- Clone the repository
- Build the Docker image
- Push to registry
- Deploy to Kubernetes using kubectl

## Setup Instructions

1. **Enable Jenkins in Terraform:**

   ```hcl
   enable_jenkins = true
   enable_ingress = true  # Optional, for web access
   ```

2. **Apply Terraform configuration:**

   ```bash
   terraform apply
   ```

3. **Access Jenkins:**

   ```bash
   # Port forward to access Jenkins
   kubectl port-forward -n infra svc/jenkins 8080:8080

   # Or if ingress is enabled, add to /etc/hosts:
   # 127.0.0.1 jenkins.local
   # Then access: http://jenkins.local
   ```

4. **Login to Jenkins:**

   - Username: `admin`
   - Password: `jenkins123`

5. **Create a new Pipeline job:**
   - Go to "New Item" → "Pipeline"
   - Configure SCM to point to your repository
   - Set pipeline script path to `Jenkinsfile.k8s`

## Sample Deployment Manifest

The pipeline uses the deployment manifest in `k8s-deployment.yaml` to deploy your application to the `app` namespace.

## Environment Variables

Configure these in Jenkins:

- `DOCKER_REGISTRY`: Your Docker registry URL
- `DOCKER_CREDENTIALS_ID`: Jenkins credentials ID for Docker registry
- `KUBECONFIG_CREDENTIALS_ID`: Jenkins credentials ID for Kubernetes config

## Security Notes

- Jenkins runs with appropriate RBAC permissions
- The service account has access to both `app` and `infra` namespaces
- Secrets are managed through Jenkins credentials store
