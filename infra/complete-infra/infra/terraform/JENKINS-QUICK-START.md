# Jenkins Quick Start Guide

This guide will help you quickly deploy and configure Jenkins in your Kubernetes infrastructure.

## Step 1: Enable Jenkins in Terraform

Edit your `terraform.tfvars` file:

```hcl
# Enable Jenkins
enable_jenkins = true

# Optionally enable ingress for web access
enable_ingress = true
```

## Step 2: Deploy the Infrastructure

```bash
# Initialize and apply Terraform
terraform init
terraform apply
```

## Step 3: Access Jenkins

### Option A: Port Forward (Always works)

```bash
kubectl port-forward -n infra svc/jenkins 8080:8080
```

Then access: http://localhost:8080

### Option B: Ingress (if enabled)

```bash
# Add to /etc/hosts
echo "127.0.0.1 jenkins.local" | sudo tee -a /etc/hosts
```

Then access: http://jenkins.local

## Step 4: Login to Jenkins

- **Username**: `admin`
- **Password**: `jenkins123`

## Step 5: Configure Jenkins for Your Sample Application

### 5.1 Create a New Pipeline Job

1. Click "New Item"
2. Enter item name: `sample-application-pipeline`
3. Select "Pipeline" and click OK

### 5.2 Configure the Pipeline

In the Pipeline configuration:

1. **Pipeline Definition**: Pipeline script from SCM
2. **SCM**: Git
3. **Repository URL**: Your repository URL
4. **Script Path**: `infra/terraform/jenkins-pipelines/Jenkinsfile.k8s`

### 5.3 Set Up Docker Registry (Optional)

If you have a Docker registry:

1. Go to "Manage Jenkins" → "Manage Credentials"
2. Add credentials with ID: `docker-registry-creds`
3. Set environment variable `DOCKER_REGISTRY` in pipeline

## Step 6: Run Your First Pipeline

1. Go to your pipeline job
2. Click "Build Now"
3. Monitor the build progress

The pipeline will:

- ✅ Build your sample application
- ✅ Create Docker image
- ✅ Deploy to the `app` namespace
- ✅ Verify deployment

## Sample Application Deployment

Your sample application will be deployed with:

- **Namespace**: `app`
- **Replicas**: 2
- **Service**: ClusterIP on port 80
- **Resources**: CPU and memory limits applied
- **Health Checks**: Liveness and readiness probes

## Verification Commands

```bash
# Check Jenkins pods
kubectl get pods -n infra -l app.kubernetes.io/name=jenkins

# Check sample app deployment
kubectl get deployment -n app sample-application

# Check sample app pods
kubectl get pods -n app -l app=sample-application

# Check sample app service
kubectl get service -n app sample-application

# View application logs
kubectl logs -n app -l app=sample-application
```

## Accessing Your Deployed Application

```bash
# Port forward to your application
kubectl port-forward -n app svc/sample-application 8000:80

# Or if ingress is enabled and configured
# Add to /etc/hosts: 127.0.0.1 app.local
# Access: http://app.local
```

## Troubleshooting

### Jenkins Not Starting

```bash
# Check Jenkins pod status
kubectl describe pod -n infra -l app.kubernetes.io/name=jenkins

# Check Jenkins logs
kubectl logs -n infra -l app.kubernetes.io/name=jenkins
```

### Pipeline Failures

```bash
# Check build logs in Jenkins UI
# Or check pod logs for build agents
kubectl logs -n infra -l jenkins=agent
```

### Docker Registry Issues

```bash
# Verify credentials are set correctly
# Check if registry is accessible from the cluster
```

## Next Steps

1. **Configure Webhooks**: Set up Git webhooks for automatic builds
2. **Add More Stages**: Extend the pipeline with testing, security scans
3. **Multi-Environment**: Deploy to staging/production environments
4. **Monitoring**: Integrate with Prometheus/Grafana for build metrics
5. **Notifications**: Add Slack/email notifications for build status

## Jenkins Configuration Files

- **Main Pipeline**: `jenkins-pipelines/Jenkinsfile.k8s`
- **K8s Manifests**: `jenkins-pipelines/k8s-deployment.yaml`
- **Documentation**: `jenkins-pipelines/README.md`

## Security Best Practices

- ✅ Jenkins runs with minimal required permissions
- ✅ Service accounts are scoped to specific namespaces
- ✅ Secrets are managed through Jenkins credentials
- ✅ Container images use non-root users
- ✅ Resource limits prevent resource exhaustion
