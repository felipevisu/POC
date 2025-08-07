# Optional Infrastructure Components

# NGINX Ingress Controller (optional)
resource "helm_release" "nginx_ingress" {
  count = var.enable_ingress ? 1 : 0

  name       = "nginx-ingress"
  namespace  = kubernetes_namespace.infra.metadata[0].name
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.7.1"

  values = [
    yamlencode({
      controller = {
        replicaCount = 2
        service = {
          type = "LoadBalancer"
        }
        metrics = {
          enabled = true
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.infra]
}

# Prometheus Monitoring Stack (optional)
resource "helm_release" "prometheus" {
  count = var.enable_monitoring ? 1 : 0

  name       = "prometheus"
  namespace  = kubernetes_namespace.infra.metadata[0].name
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "51.3.0"

  values = [
    yamlencode({
      grafana = {
        enabled       = true
        adminPassword = "admin123"
        service = {
          type = "ClusterIP"
        }
      }
      prometheus = {
        prometheusSpec = {
          retention = "15d"
          storageSpec = {
            volumeClaimTemplate = {
              spec = {
                storageClassName = "standard"
                accessModes      = ["ReadWriteOnce"]
                resources = {
                  requests = {
                    storage = "20Gi"
                  }
                }
              }
            }
          }
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.infra]
}

# Jenkins CI/CD Server (optional)
resource "helm_release" "jenkins" {
  count = var.enable_jenkins ? 1 : 0

  name       = "jenkins"
  namespace  = kubernetes_namespace.infra.metadata[0].name
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  version    = "4.8.3"

  values = [
    yamlencode({
      controller = {
        adminUser     = "admin"
        adminPassword = "jenkins123"
        serviceType   = "ClusterIP"

        # Jenkins Configuration as Code
        JCasC = {
          defaultConfig = true
          configScripts = {
            welcome-message = <<-EOT
              jenkins:
                systemMessage: "Welcome to Jenkins on Kubernetes!"
                securityRealm:
                  local:
                    allowsSignup: false
                    users:
                      - id: admin
                        password: jenkins123
                authorizationStrategy:
                  loggedInUsersCanDoAnything:
                    allowAnonymousRead: false
              EOT
          }
        }

        # Resource limits
        resources = {
          requests = {
            cpu    = "500m"
            memory = "1Gi"
          }
          limits = {
            cpu    = "2"
            memory = "4Gi"
          }
        }

        # Persistent storage
        persistence = {
          enabled      = true
          storageClass = "standard"
          size         = "20Gi"
        }

        # Security context
        securityContext = {
          runAsUser  = 1000
          runAsGroup = 1000
          fsGroup    = 1000
        }

        # Install default plugins
        installPlugins = [
          "kubernetes:4029.v5712230ccb_f8",
          "workflow-aggregator:596.v8c21c963d92d",
          "git:5.0.0",
          "configuration-as-code:1647.ve39ca_b_829b_42",
          "blueocean:1.25.8",
          "pipeline-stage-view:2.25",
          "docker-workflow:563.vd5d2e5c4007f"
        ]
      }

      # Jenkins agent configuration
      agent = {
        enabled = true
        image   = "jenkins/inbound-agent"
        tag     = "latest"
        resources = {
          requests = {
            cpu    = "100m"
            memory = "256Mi"
          }
          limits = {
            cpu    = "500m"
            memory = "512Mi"
          }
        }
      }

      # Service account with proper permissions
      serviceAccount = {
        create = true
        name   = "jenkins"
      }

      # RBAC for Kubernetes plugin
      rbac = {
        create      = true
        readSecrets = true
      }
    })
  ]

  depends_on = [kubernetes_namespace.infra]
}
