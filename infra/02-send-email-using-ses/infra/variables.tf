variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
  default     = "ami-020cba7c55df1f615"
}

variable "sender_email" {
  description = "Email address to send from (must be verified in SES)"
  type        = string
  sensitive   = true
}

variable "recipient_email" {
  description = "Email address to receive form submissions"
  type        = string
  sensitive   = true
}
