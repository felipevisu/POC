#!/bin/bash
set -e  # Exit on error
set -x  # Debug mode - shows commands as they execute

# Redirect all output to log file
exec > >(tee /var/log/user-data.log) 2>&1

echo "Starting user data script at $(date)"

# Set HOME environment variable for root
export HOME=/root

echo "HOME set to $HOME"

# Update system
apt-get update -y
apt-get install -y docker.io git curl

echo "Packages installed at $(date)"

# Start Docker
systemctl start docker
systemctl enable docker

echo "Docker started at $(date)"

# Add ubuntu user to docker group
usermod -aG docker ubuntu

echo "User added to docker group at $(date)"

# Create app directory
mkdir -p /app
cd /app

echo "App directory created at $(date)"

# Clone repository with sparse checkout
git init
git config --global --add safe.directory /app
git remote add origin https://github.com/felipevisu/POC.git
git config core.sparseCheckout true
echo "infra/form-with-aws-infra/form/" | sudo tee .git/info/sparse-checkout > /dev/null

echo "Git configured at $(date)"

# Pull the code
git pull origin main

echo "Code pulled at $(date)"

# Check if directory exists
ls -la
ls -la infra/form-with-aws-infra/form/

# Navigate to the form directory
cd infra/form-with-aws-infra/form

echo "In form directory at $(date)"

# Build and run Docker container
docker build -t fastapi-app .
docker run -d -p 8000:8000 \
  -e RECIPIENT_EMAIL="${recipient_email}" \
  -e SENDER_EMAIL="${sender_email}" \
  -e AWS_DEFAULT_REGION="${aws_region}" \
  --name fastapi-container fastapi-app

echo "Docker container started at $(date)"

# Show final status
docker ps
netstat -tlnp | grep 8000

echo "User data script completed at $(date)"