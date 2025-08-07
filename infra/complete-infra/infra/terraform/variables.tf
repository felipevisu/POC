# Variables for Terraform configuration

variable "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = null
}

variable "app_namespace" {
  description = "Name of the application namespace"
  type        = string
  default     = "app"
}

variable "infra_namespace" {
  description = "Name of the infrastructure namespace"
  type        = string
  default     = "infra"
}

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
  default     = "my-cluster"
}

variable "enable_monitoring" {
  description = "Enable monitoring stack (Prometheus, Grafana)"
  type        = bool
  default     = false
}

variable "enable_ingress" {
  description = "Enable NGINX Ingress Controller"
  type        = bool
  default     = false
}

variable "enable_jenkins" {
  description = "Enable Jenkins CI/CD server"
  type        = bool
  default     = false
}
