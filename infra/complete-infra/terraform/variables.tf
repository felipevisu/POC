variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "poc-eks-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
  default     = "1.30"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "github_repo_url" {
  description = "GitHub repository URL for the FastAPI application"
  type        = string
  default     = "https://github.com/felipevisu/POC-sample-application.git"
}

variable "app_image" {
  description = "Docker image for the FastAPI application"
  type        = string
  default     = "sample-app:latest"
}
