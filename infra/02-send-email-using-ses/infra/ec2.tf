resource "aws_instance" "fastapi_server" {
  ami                  = var.ami_id
  instance_type        = var.instance_type
  security_groups      = [aws_security_group.fastapi_sg.name]
  key_name             = aws_key_pair.fastapi_key.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile("${path.module}/run_application.sh", {
    recipient_email = var.recipient_email
    sender_email    = var.sender_email
    aws_region      = var.region
  })

  tags = {
    Name = "FastAPI Server"
  }
}

output "instance_public_ip" {
  value = aws_instance.fastapi_server.public_ip
}

output "instance_public_dns" {
  value = aws_instance.fastapi_server.public_dns
}
