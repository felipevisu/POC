# Terraform Kubernetes Infrastructure

This Terraform configuration creates a complete Kubernetes infrastructure with two namespaces: **app** and **infra**.

## Features

- ✅ Two isolated namespaces: `app` and `infra`
- ✅ RBAC (Role-Based Access Control) configuration
- ✅ Network policies for security
- ✅ Resource quotas and limits
- ✅ Service accounts for each namespace
- ✅ Optional NGINX Ingress Controller
- ✅ Optional Prometheus monitoring stack

## Prerequisites

1. **Kubernetes cluster** (local or cloud-based)
2. **kubectl** configured with cluster access
3. **Terraform** >= 1.0
4. **Helm** (for optional components)

## Quick Start

1. **Configure your variables:**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your specific values
   ```

2. **Initialize Terraform:**

   ```bash
   terraform init
   ```

3. **Plan the deployment:**

   ```bash
   terraform plan
   ```

4. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Configuration

### Basic Configuration

Edit `terraform.tfvars`:

```hcl
# Kubernetes configuration
kubeconfig_path = "~/.kube/config"
kube_context    = "your-cluster-context"  # Optional

# Namespace names (customize if needed)
app_namespace   = "app"
infra_namespace = "infra"

# Optional components
enable_monitoring = true   # Installs Prometheus & Grafana
enable_ingress    = true   # Installs NGINX Ingress Controller
enable_jenkins    = true   # Installs Jenkins CI/CD server
```

### Namespace Structure

#### App Namespace

- **Purpose**: Application workloads
- **Resources**: Limited CPU/Memory quotas
- **Access**: Restricted permissions
- **Network**: Controlled ingress from infra namespace

#### Infra Namespace

- **Purpose**: Infrastructure components (monitoring, ingress, etc.)
- **Resources**: Higher CPU/Memory quotas
- **Access**: Broader cluster permissions
- **Network**: Full access

## Resource Quotas

### App Namespace Limits

- CPU Requests: 4 cores
- Memory Requests: 8Gi
- CPU Limits: 8 cores
- Memory Limits: 16Gi
- Max Pods: 10

### Infra Namespace Limits

- CPU Requests: 6 cores
- Memory Requests: 12Gi
- CPU Limits: 12 cores
- Memory Limits: 24Gi
- Max Pods: 20

## Optional Components

### NGINX Ingress Controller

Set `enable_ingress = true` to install:

- LoadBalancer service type
- Metrics enabled
- 2 replicas for HA

### Prometheus Monitoring Stack

Set `enable_monitoring = true` to install:

- Prometheus with 15-day retention
- Grafana with default admin/admin123
- 20Gi storage for Prometheus

### Jenkins CI/CD Server

Set `enable_jenkins = true` to install:

- Jenkins with Kubernetes plugin pre-configured
- Persistent storage for Jenkins data
- RBAC permissions for deploying to both namespaces
- Pre-installed plugins for CI/CD workflows
- Default admin credentials (admin/jenkins123)
- Web access via ingress (if enabled) at jenkins.local

## Usage Examples

### Deploy an application to the app namespace:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      serviceAccountName: app-service-account
      containers:
        - name: app
          image: nginx:latest
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

### Access Grafana (if monitoring enabled):

```bash
kubectl port-forward -n infra svc/prometheus-grafana 3000:80
# Access at http://localhost:3000 (admin/admin123)
```

### Access Jenkins (if enabled):

```bash
# Port forward to access Jenkins
kubectl port-forward -n infra svc/jenkins 8080:8080
# Access at http://localhost:8080 (admin/jenkins123)

# Or if ingress is enabled, add to /etc/hosts:
# echo "127.0.0.1 jenkins.local" | sudo tee -a /etc/hosts
# Then access: http://jenkins.local
```

## Outputs

After applying, Terraform will output:

- Namespace names
- Service account names
- Resource quota information
- Component status (enabled/disabled)

## Security Features

1. **Network Policies**: Isolate namespaces with controlled communication
2. **RBAC**: Least-privilege access for each namespace
3. **Resource Limits**: Prevent resource exhaustion
4. **Service Accounts**: Dedicated identities for workloads

## Cleanup

To destroy the infrastructure:

```bash
terraform destroy
```

## Troubleshooting

1. **Kubernetes connection issues:**

   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```

2. **Check namespace status:**

   ```bash
   kubectl get namespaces
   kubectl describe namespace app
   kubectl describe namespace infra
   ```

3. **Verify resource quotas:**
   ```bash
   kubectl describe quota -n app
   kubectl describe quota -n infra
   ```

## Customization

You can customize this configuration by:

- Modifying resource quotas in `resource-quotas.tf`
- Adjusting RBAC permissions in `rbac.tf`
- Adding more optional components in `optional-components.tf`
- Creating additional namespaces following the same pattern
