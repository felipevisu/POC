output "fastapi_public_ip" {
  value = aws_instance.fastapi_server.public_ip
}

output "fastapi_public_dns" {
  value = aws_instance.fastapi_server.public_dns
}

output "fastapi_url" {
  value = "http://${aws_instance.fastapi_server.public_ip}:8000"
}
