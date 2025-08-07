# Output values

output "app_namespace_name" {
  description = "Name of the application namespace"
  value       = kubernetes_namespace.app.metadata[0].name
}

output "infra_namespace_name" {
  description = "Name of the infrastructure namespace"
  value       = kubernetes_namespace.infra.metadata[0].name
}

output "app_service_account_name" {
  description = "Name of the application service account"
  value       = kubernetes_service_account.app_service_account.metadata[0].name
}

output "infra_service_account_name" {
  description = "Name of the infrastructure service account"
  value       = kubernetes_service_account.infra_service_account.metadata[0].name
}

output "nginx_ingress_status" {
  description = "NGINX Ingress Controller deployment status"
  value       = var.enable_ingress ? "Enabled" : "Disabled"
}

output "monitoring_status" {
  description = "Monitoring stack deployment status"
  value       = var.enable_monitoring ? "Enabled" : "Disabled"
}

output "jenkins_status" {
  description = "Jenkins CI/CD server deployment status"
  value       = var.enable_jenkins ? "Enabled" : "Disabled"
}

output "jenkins_access_info" {
  description = "Jenkins access information"
  value = var.enable_jenkins ? {
    username             = "admin"
    password             = "jenkins123"
    port_forward_command = "kubectl port-forward -n ${kubernetes_namespace.infra.metadata[0].name} svc/jenkins 8080:8080"
    url                  = var.enable_ingress ? "http://jenkins.local" : "http://localhost:8080 (after port-forward)"
  } : null
}

output "app_namespace_resource_quota" {
  description = "Resource quota for app namespace"
  value = {
    cpu_requests    = kubernetes_resource_quota.app_resource_quota.spec[0].hard["requests.cpu"]
    memory_requests = kubernetes_resource_quota.app_resource_quota.spec[0].hard["requests.memory"]
    cpu_limits      = kubernetes_resource_quota.app_resource_quota.spec[0].hard["limits.cpu"]
    memory_limits   = kubernetes_resource_quota.app_resource_quota.spec[0].hard["limits.memory"]
    max_pods        = kubernetes_resource_quota.app_resource_quota.spec[0].hard["pods"]
  }
}

output "infra_namespace_resource_quota" {
  description = "Resource quota for infra namespace"
  value = {
    cpu_requests    = kubernetes_resource_quota.infra_resource_quota.spec[0].hard["requests.cpu"]
    memory_requests = kubernetes_resource_quota.infra_resource_quota.spec[0].hard["requests.memory"]
    cpu_limits      = kubernetes_resource_quota.infra_resource_quota.spec[0].hard["limits.cpu"]
    memory_limits   = kubernetes_resource_quota.infra_resource_quota.spec[0].hard["limits.memory"]
    max_pods        = kubernetes_resource_quota.infra_resource_quota.spec[0].hard["pods"]
  }
}
