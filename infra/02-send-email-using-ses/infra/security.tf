resource "aws_key_pair" "fastapi_key" {
  key_name   = "fastapi-key"
  public_key = file("~/.ssh/fastapi-key.pub")
}

resource "aws_security_group" "fastapi_sg" {
  name = "fastapi-sg"

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "FastAPI server port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  tags = {
    Name = "FastAPI Security Group"
  }
}
