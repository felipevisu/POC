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
spec:
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
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: "*/${params.BRANCH}"]],
          userRemoteConfigs: [[url: REPO_URL]]
        ])
        sh 'echo "Files:"; ls -1 | head'
      }
    }

    stage('Setup Python Env') {
      steps {
        sh '''
set -e
python --version
pip install --no-cache-dir --upgrade pip
if [ -f requirements.txt ]; then
  echo "[INFO] Installing requirements..."
  pip install --no-cache-dir -r requirements.txt
else
  echo "[WARN] requirements.txt not found"
fi
pip install --no-cache-dir pytest pytest-cov || true
'''
      }
    }

    stage('Run Tests') {
      steps {
        sh '''
set -e
if [ -d tests ]; then
  echo "[INFO] Running pytest in tests/"
  pytest -v --maxfail=1
else
  echo "[WARN] No tests/ directory. Running basic import check."
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
  }

  post {
    success { echo 'Tests passed.' }
    failure { echo 'Tests failed.' }
    always  { echo 'Pipeline completed.' }
  }
}