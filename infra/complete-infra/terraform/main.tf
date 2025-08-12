# main.tf - Complete EKS cluster with Jenkins deployment via Helm

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
  }
}

# Variables
variable "region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "jenkins-poc-cluster"
}

# AWS Provider
provider "aws" {
  region = var.region
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"

  # Exclude zones that EKS doesn't support
  exclude_names = ["us-east-1e"]
}

# Create simple VPC for EKS (avoiding default VPC issues)
resource "aws_vpc" "eks" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.cluster_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "eks" {
  vpc_id = aws_vpc.eks.id

  tags = {
    Name = "${var.cluster_name}-igw"
  }
}

# Public Subnets (2 subnets in different AZs for EKS requirement)
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.eks.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                     = "${var.cluster_name}-public-${count.index + 1}"
    "kubernetes.io/role/elb" = "1"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.eks.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks.id
  }

  tags = {
    Name = "${var.cluster_name}-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  count = 2

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# EKS Cluster IAM Role
resource "aws_iam_role" "eks_cluster" {
  name = "${var.cluster_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = aws_subnet.public[*].id
    endpoint_public_access  = true
    endpoint_private_access = false
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# Node Group IAM Role
resource "aws_iam_role" "eks_nodes" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_nodes.name
}

# Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t3.medium"] # Jenkins needs decent resources

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
}

# Get EKS cluster auth data
data "aws_eks_cluster_auth" "main" {
  name = aws_eks_cluster.main.name
}

# Configure Kubernetes Provider
provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}

# Configure Helm Provider
provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}

# Create infra namespace
resource "kubernetes_namespace" "infra" {
  metadata {
    name = "infra"
  }

  depends_on = [aws_eks_node_group.main]
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
  depends_on = [aws_eks_node_group.main]
}

# Get AWS account ID
data "aws_caller_identity" "current" {}

# OIDC Provider for EKS (required for EBS CSI)
data "tls_certificate" "eks" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# IAM Role for EBS CSI Driver
resource "aws_iam_role" "ebs_csi" {
  name = "${var.cluster_name}-ebs-csi"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")}"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ebs_csi" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi.name
}

# Install EBS CSI Driver
resource "aws_eks_addon" "ebs_csi" {
  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "aws-ebs-csi-driver"
  service_account_role_arn = aws_iam_role.ebs_csi.arn

  depends_on = [aws_eks_node_group.main]
}

# Storage Class
resource "kubernetes_storage_class" "jenkins" {
  metadata {
    name = "jenkins-storage"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }
  storage_provisioner = "ebs.csi.aws.com"
  reclaim_policy      = "Retain"
  parameters = {
    type = "gp3"
  }
  volume_binding_mode = "WaitForFirstConsumer"

  depends_on = [aws_eks_addon.ebs_csi]
}

# Deploy Jenkins using Helm - Minimal with Storage
resource "helm_release" "jenkins" {
  name       = "jenkins"
  namespace  = "infra"
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  version    = "5.0.13"

  timeout = 120
  wait    = true

  # Load minimal configuration
  values = [
    file("../jenkins/jenkins-values.yaml")
  ]

  depends_on = [
    kubernetes_namespace.infra,
    kubernetes_storage_class.jenkins,
    aws_eks_addon.ebs_csi
  ]
}

# Install Prometheus (kube-prometheus-stack)
resource "helm_release" "prometheus" {
  name       = "prometheus"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "56.6.0" # Use latest stable version

  values = [
    yamlencode({
      grafana = {
        enabled = false # We'll install Grafana separately
      }
    })
  ]

  depends_on = [kubernetes_namespace.monitoring]
}

# Install Grafana
resource "helm_release" "grafana" {
  name       = "grafana"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  version    = "7.3.9" # Use latest stable version

  values = [
    yamlencode({
      adminPassword = "admin"
      service = {
        type = "LoadBalancer"
      }
    })
  ]

  depends_on = [helm_release.prometheus]
}

# Data source to get the Jenkins LoadBalancer details
data "kubernetes_service" "jenkins" {
  metadata {
    name      = "jenkins"
    namespace = "infra"
  }

  depends_on = [helm_release.jenkins]
}

resource "kubernetes_namespace" "app" {
  metadata {
    name = "app"
  }

  depends_on = [aws_eks_node_group.main]
}

resource "kubernetes_manifest" "jenkins_rbac_app" {
  for_each = {
    for doc in split("---", file("../jenkins/rbac-app.yaml")) :
    yamldecode(doc).metadata.name => yamldecode(doc)
    if doc != "" && can(yamldecode(doc))
  }
  manifest   = each.value
  depends_on = [kubernetes_namespace.app]
}

# Outputs
output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.main.name}"
}

output "jenkins_url" {
  value = "Jenkins will be available at the LoadBalancer URL (see next command)"
}

output "get_jenkins_url_command" {
  value = "kubectl -n infra get svc jenkins -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
}

output "jenkins_admin_password" {
  value     = "admin123"
  sensitive = true
}

output "port_forward_command" {
  value = "kubectl -n infra port-forward service/jenkins 8080:8080"
}

output "jenkins_local_url" {
  value = "After port-forward: http://localhost:8080"
}
