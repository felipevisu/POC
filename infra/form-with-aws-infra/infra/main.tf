provider "aws" {
  region = "us-east-1"
}

resource "aws_key_pair" "deployer" {
  key_name   = "fastapi-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_security_group" "fastapi_sg" {
  name        = "fastapi-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "fastapi_server" {
  ami           = "ami-0c94855ba95c71c99"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name
  security_groups = [aws_security_group.fastapi_sg.name]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io git
    systemctl start docker
    systemctl enable docker

    apt-get install -y subversion

    svn export https://github.com/felipevisu/POC/trunk/infra/form-with-aws-infra/form /app
    cd /app
    docker build -t fastapi-app .
    docker run -d -p 8000:8000 fastapi-app
  EOF

  tags = {
    Name = "FastAPI Server"
  }
}
