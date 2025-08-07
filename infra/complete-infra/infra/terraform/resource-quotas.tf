# Resource Quotas and Limits

# Resource Quota for App Namespace
resource "kubernetes_resource_quota" "app_resource_quota" {
  metadata {
    name      = "app-resource-quota"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  spec {
    hard = {
      "requests.cpu"           = "4"
      "requests.memory"        = "8Gi"
      "limits.cpu"             = "8"
      "limits.memory"          = "16Gi"
      "pods"                   = "10"
      "services"               = "5"
      "secrets"                = "10"
      "configmaps"             = "10"
      "persistentvolumeclaims" = "5"
    }
  }
}

# Resource Quota for Infra Namespace
resource "kubernetes_resource_quota" "infra_resource_quota" {
  metadata {
    name      = "infra-resource-quota"
    namespace = kubernetes_namespace.infra.metadata[0].name
  }
  spec {
    hard = {
      "requests.cpu"           = "6"
      "requests.memory"        = "12Gi"
      "limits.cpu"             = "12"
      "limits.memory"          = "24Gi"
      "pods"                   = "20"
      "services"               = "10"
      "secrets"                = "20"
      "configmaps"             = "20"
      "persistentvolumeclaims" = "10"
    }
  }
}

# Limit Range for App Namespace
resource "kubernetes_limit_range" "app_limit_range" {
  metadata {
    name      = "app-limit-range"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "500m"
        memory = "512Mi"
      }
      default_request = {
        cpu    = "100m"
        memory = "128Mi"
      }
      max = {
        cpu    = "2"
        memory = "4Gi"
      }
      min = {
        cpu    = "50m"
        memory = "64Mi"
      }
    }
  }
}

# Limit Range for Infra Namespace
resource "kubernetes_limit_range" "infra_limit_range" {
  metadata {
    name      = "infra-limit-range"
    namespace = kubernetes_namespace.infra.metadata[0].name
  }
  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "1"
        memory = "1Gi"
      }
      default_request = {
        cpu    = "200m"
        memory = "256Mi"
      }
      max = {
        cpu    = "4"
        memory = "8Gi"
      }
      min = {
        cpu    = "100m"
        memory = "128Mi"
      }
    }
  }
}
