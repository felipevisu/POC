# Infra

## Step 1 - Setup in localhost

### Install necessary software

**Dependencies**

```bash
sudo apt-get update
sudo apt-get install -y curl wget apt-transport-https conntrack
```

**Kubectl**

```bash
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

Test it

```bash
kubectl version --client
```

**Minikube**

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Test it

```bash
minikube version
```

Initialize with Driver Docker

```bash
minikube start --driver=docker
```

**Helm**

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Test it

```bash
helm version
```

### Run Jenkins

**Create namespaces**

```bash
kubectl create namespace infra
kubectl create namespace app
```

**Expose Minikue docker daemon**

This lets Jenkins build Docker images directly into Minikube:

```bash
eval $(minikube docker-env)
```

**Install Jenkins using custom file**

```bash
helm repo add jenkins https://charts.jenkins.io
helm repo update

helm install jenkins jenkins/jenkins \
  --namespace infra \
  --create-namespace \
  --values ./jenkins/jenkins-values.yaml
```

**Useful debug commands**

```bash
# See logs
kubectl logs -n infra -l app.kubernetes.io/name=jenkins

# Uninstall Jenkins
helm uninstall jenkins -n infra

# Delete any leftover PVCs (removes Jenkins home data)
kubectl get pvc -n infra
kubectl delete pvc -n infra -l app.kubernetes.io/instance=jenkins

# Remove leftover objects (if any linger)
kubectl delete all,cm,secret,sa,role,rolebinding -n infra -l app.kubernetes.io/instance=jenkins --ignore-not-found
```

**Run jenkins on port 8000**

```bash
kubectl port-forward svc/jenkins 8080:8080 -n infra
```

### Setup my first Job

**Enable multiple executors**

1. Go to: http://localhost:8080
2. Login: admin/admin123
3. Go to: "Manage Jenkins" → "Manage Nodes and Clouds"
4. Click on "Built-In Node" (or "controller")
5. Click "Configure"
6. Set "Number of executors" to 2
7. Usage: Select "Use this node as much as possible"
8. Save

**Create the pipeline**

1. **Click "New Item"**
2. **Enter name**: `poc-sample-app-test`
3. **Select**: "Pipeline"
4. **Click "OK"**
5. **In the job configuration page**:

   - Scroll down to **"Pipeline"** section
   - **Definition**: Select "Pipeline script"
   - **Script**: Copy and paste the entire content from `./jenkins/jobs/poc-sample-app-pipeline.groovy`

6. **Click "Save"**

**Run the first job**

1. **Click "Build with Parameters"**
2. **Enter BRANCH**: `main` (or any branch from your FastAPI repo)
3. **Click "Build"**
