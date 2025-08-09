pipeline {
  agent {
    kubernetes {
      label 'py-tests'
      defaultContainer 'python'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: py-tests
  namespace: infra
spec:
  serviceAccountName: jenkins
  restartPolicy: Never
  containers:
    - name: python
      image: python:3.11-slim
      command: ['cat']
      tty: true
      resources:
        requests:
          cpu: "100m"
          memory: "256Mi"
        limits:
          cpu: "500m"
          memory: "512Mi"
"""
    }
  }

  parameters {
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch')
  }

  environment {
    REPO_URL = 'https://github.com/felipevisu/POC-sample-application.git'
    APP_NAMESPACE = 'app'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: "*/${params.BRANCH}"]],
          userRemoteConfigs: [[url: REPO_URL]]
        ])
        sh 'echo "[INFO] Files:"; ls -1 | head'
      }
    }

    stage('Setup Python Env') {
      steps {
        sh '''
set -e
python --version
pip install --no-cache-dir --upgrade pip
[ -f requirements.txt ] && pip install --no-cache-dir -r requirements.txt || echo "[WARN] requirements.txt missing"
pip install --no-cache-dir pytest pytest-cov || true
'''
      }
    }

    stage('Run Tests') {
      steps {
        sh '''
set -e
if [ -d tests ]; then
  echo "[INFO] Running pytest"
  pytest -v --maxfail=1
else
  echo "[WARN] No tests/; basic import check"
  python - <<'EOF'
try:
    import main
    print("Basic import of main OK")
except Exception as e:
    print("Import failed:", e)
    raise
EOF
fi
'''
      }
    }

    stage('Deploy') {
      when { expression { currentBuild.currentResult == null || currentBuild.currentResult == 'SUCCESS' } }
      steps {
        sh '''
set -e
echo "[INFO] Installing git + curl + downloading kubectl"
apt-get update -y >/dev/null
apt-get install -y git curl ca-certificates >/dev/null
curl -sL "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" -o /usr/local/bin/kubectl
chmod +x /usr/local/bin/kubectl

echo "[INFO] Preparing manifest"
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)

cat > k8s-app.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  namespace: ${APP_NAMESPACE}
  labels:
    app: sample-app
  annotations:
    commit-sha: "${COMMIT_SHA}"
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
      annotations:
        commit-sha: "${COMMIT_SHA}"
    spec:
      volumes:
        - name: app-src
          emptyDir: {}
      initContainers:
        - name: fetch-code
          image: alpine/git:latest
          args: ["clone","--depth","1","--branch","${BRANCH}","${REPO_URL}","/app"]
          volumeMounts:
            - name: app-src
              mountPath: /app
      containers:
        - name: app
          image: python:3.11-slim
          workingDir: /app
          command: ["sh","-c"]
          args:
            - |
              pip install --no-cache-dir --upgrade pip && \
              [ -f requirements.txt ] && pip install --no-cache-dir -r requirements.txt || true ; \
              uvicorn main:app --host 0.0.0.0 --port 8000
          ports:
            - containerPort: 8000
          readinessProbe:
            httpGet: { path: /, port: 8000 }
            initialDelaySeconds: 10
          livenessProbe:
            httpGet: { path: /, port: 8000 }
            initialDelaySeconds: 30
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: app-src
              mountPath: /app
---
apiVersion: v1
kind: Service
metadata:
  name: sample-app
  namespace: ${APP_NAMESPACE}
spec:
  selector:
    app: sample-app
  ports:
    - port: 80
      targetPort: 8000
      name: http
      protocol: TCP
  type: ClusterIP
EOF

echo "[INFO] Applying manifests (namespace must already exist: ${APP_NAMESPACE})"
kubectl apply -f k8s-app.yaml
echo "[INFO] Waiting rollout"
kubectl rollout status deploy/sample-app -n ${APP_NAMESPACE} --timeout=120s
kubectl get pods -n ${APP_NAMESPACE} -l app=sample-app -o wide
'''
      }
    }
  }

  post {
    success { echo 'Tests & deploy succeeded.' }
    failure { echo 'Failure (tests or deploy).' }
    always  { echo 'Pipeline finished.' }
  }
}