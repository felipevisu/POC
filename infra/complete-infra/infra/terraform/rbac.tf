# RBAC (Role-Based Access Control) Configuration

# Service Account for App Namespace
resource "kubernetes_service_account" "app_service_account" {
  metadata {
    name      = "app-service-account"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  automount_service_account_token = true
}

# Role for App Namespace - limited permissions
resource "kubernetes_role" "app_role" {
  metadata {
    namespace = kubernetes_namespace.app.metadata[0].name
    name      = "app-role"
  }

  rule {
    api_groups = [""]
    resources  = ["pods", "services", "configmaps", "secrets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments", "replicasets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

# RoleBinding for App Namespace
resource "kubernetes_role_binding" "app_role_binding" {
  metadata {
    name      = "app-role-binding"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.app_role.metadata[0].name
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.app_service_account.metadata[0].name
    namespace = kubernetes_namespace.app.metadata[0].name
  }
}

# Service Account for Infra Namespace
resource "kubernetes_service_account" "infra_service_account" {
  metadata {
    name      = "infra-service-account"
    namespace = kubernetes_namespace.infra.metadata[0].name
  }
  automount_service_account_token = true
}

# ClusterRole for Infra Namespace - broader permissions
resource "kubernetes_cluster_role" "infra_cluster_role" {
  metadata {
    name = "infra-cluster-role"
  }

  rule {
    api_groups = [""]
    resources  = ["nodes", "namespaces", "pods", "services", "configmaps", "secrets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments", "daemonsets", "replicasets", "statefulsets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  rule {
    api_groups = ["networking.k8s.io"]
    resources  = ["networkpolicies", "ingresses"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  rule {
    api_groups = ["rbac.authorization.k8s.io"]
    resources  = ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]
    verbs      = ["get", "list", "watch"]
  }
}

# ClusterRoleBinding for Infra Namespace
resource "kubernetes_cluster_role_binding" "infra_cluster_role_binding" {
  metadata {
    name = "infra-cluster-role-binding"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.infra_cluster_role.metadata[0].name
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.infra_service_account.metadata[0].name
    namespace = kubernetes_namespace.infra.metadata[0].name
  }
}
