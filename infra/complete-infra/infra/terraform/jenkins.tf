# Jenkins Configuration for Kubernetes

# Service Account for Jenkins with extended permissions
resource "kubernetes_service_account" "jenkins_extended" {
  count = var.enable_jenkins ? 1 : 0

  metadata {
    name      = "jenkins-extended"
    namespace = kubernetes_namespace.infra.metadata[0].name
    labels = {
      "app.kubernetes.io/name"     = "jenkins"
      "app.kubernetes.io/instance" = "jenkins"
    }
  }
  automount_service_account_token = true
}

# ClusterRole for Jenkins to manage resources across namespaces
resource "kubernetes_cluster_role" "jenkins_cluster_role" {
  count = var.enable_jenkins ? 1 : 0

  metadata {
    name = "jenkins-cluster-role"
  }

  # Permissions for managing pods and deployments
  rule {
    api_groups = [""]
    resources  = ["pods", "pods/exec", "pods/log", "services", "secrets", "configmaps"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments", "replicasets", "statefulsets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }

  # Permissions for namespace management
  rule {
    api_groups = [""]
    resources  = ["namespaces"]
    verbs      = ["get", "list", "watch"]
  }

  # Permissions for ingress management
  rule {
    api_groups = ["networking.k8s.io"]
    resources  = ["ingresses"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

# ClusterRoleBinding for Jenkins
resource "kubernetes_cluster_role_binding" "jenkins_cluster_role_binding" {
  count = var.enable_jenkins ? 1 : 0

  metadata {
    name = "jenkins-cluster-role-binding"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.jenkins_cluster_role[0].metadata[0].name
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.jenkins_extended[0].metadata[0].name
    namespace = kubernetes_namespace.infra.metadata[0].name
  }
}

# ConfigMap for Jenkins configuration
resource "kubernetes_config_map" "jenkins_config" {
  count = var.enable_jenkins ? 1 : 0

  metadata {
    name      = "jenkins-config"
    namespace = kubernetes_namespace.infra.metadata[0].name
  }

  data = {
    "jenkins.yaml" = yamlencode({
      jenkins = {
        systemMessage = "Jenkins on Kubernetes - Ready for CI/CD!"
        numExecutors  = 0
        securityRealm = {
          local = {
            allowsSignup = false
            users = [
              {
                id       = "admin"
                password = "jenkins123"
              }
            ]
          }
        }
        authorizationStrategy = {
          loggedInUsersCanDoAnything = {
            allowAnonymousRead = false
          }
        }
        clouds = [
          {
            kubernetes = {
              name            = "kubernetes"
              serverUrl       = "https://kubernetes.default.svc.cluster.local"
              namespace       = kubernetes_namespace.app.metadata[0].name
              credentialsId   = ""
              jenkinsUrl      = "http://jenkins.${kubernetes_namespace.infra.metadata[0].name}.svc.cluster.local:8080"
              jenkinsTunnel   = "jenkins-agent.${kubernetes_namespace.infra.metadata[0].name}.svc.cluster.local:50000"
              containerCapStr = 10
              podLabels = [
                {
                  key   = "jenkins"
                  value = "agent"
                }
              ]
              templates = [
                {
                  name          = "default"
                  label         = "jenkins-agent"
                  nodeUsageMode = "NORMAL"
                  containers = [
                    {
                      name                  = "jnlp"
                      image                 = "jenkins/inbound-agent:latest"
                      alwaysPullImage       = false
                      workingDir            = "/home/jenkins/agent"
                      command               = ""
                      args                  = ""
                      resourceRequestCpu    = "100m"
                      resourceRequestMemory = "256Mi"
                      resourceLimitCpu      = "500m"
                      resourceLimitMemory   = "512Mi"
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    })
  }
}

# Ingress for Jenkins (if ingress is enabled)
resource "kubernetes_ingress_v1" "jenkins_ingress" {
  count = var.enable_jenkins && var.enable_ingress ? 1 : 0

  metadata {
    name      = "jenkins-ingress"
    namespace = kubernetes_namespace.infra.metadata[0].name
    annotations = {
      "nginx.ingress.kubernetes.io/rewrite-target" = "/"
      "nginx.ingress.kubernetes.io/ssl-redirect"   = "false"
    }
  }

  spec {
    ingress_class_name = "nginx"
    rule {
      host = "jenkins.local"
      http {
        path {
          backend {
            service {
              name = "jenkins"
              port {
                number = 8080
              }
            }
          }
          path      = "/"
          path_type = "Prefix"
        }
      }
    }
  }

  depends_on = [helm_release.jenkins, helm_release.nginx_ingress]
}
