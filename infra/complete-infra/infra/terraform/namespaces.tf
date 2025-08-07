# Kubernetes Namespaces

# Application Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.app_namespace
    labels = {
      "name"        = var.app_namespace
      "environment" = "production"
      "managed-by"  = "terraform"
    }
    annotations = {
      "description" = "Namespace for application workloads"
    }
  }
}

# Infrastructure Namespace
resource "kubernetes_namespace" "infra" {
  metadata {
    name = var.infra_namespace
    labels = {
      "name"        = var.infra_namespace
      "environment" = "production"
      "managed-by"  = "terraform"
    }
    annotations = {
      "description" = "Namespace for infrastructure components"
    }
  }
}

# Network Policies for App Namespace
resource "kubernetes_network_policy" "app_network_policy" {
  metadata {
    name      = "app-network-policy"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]

    ingress {
      from {
        namespace_selector {
          match_labels = {
            name = var.infra_namespace
          }
        }
      }
    }

    egress {
      to {}
    }
  }
}

# Network Policies for Infra Namespace
resource "kubernetes_network_policy" "infra_network_policy" {
  metadata {
    name      = "infra-network-policy"
    namespace = kubernetes_namespace.infra.metadata[0].name
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]

    ingress {
      from {}
    }

    egress {
      to {}
    }
  }
}
