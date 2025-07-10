provider "aws" {
  region = "us-east-1"
}

resource "aws_key_pair" "terraform" {
  key_name   = "fastapi-key"
  public_key = file("./fastapi-key.pub")
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
  ami           = "ami-020cba7c55df1f615"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.terraform.key_name
  security_groups = [aws_security_group.fastapi_sg.name]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io git
    systemctl start docker
    systemctl enable docker

    apt-get install -y git

    sudo mkdir -p /app
    cd /app
    sudo git init
    git config --global --add safe.directory /app
    git remote add origin https://github.com/felipevisu/POC.git
    git config core.sparseCheckout true
    echo infra/form-with-aws-infra/form/ >> .git/info/sparse-checkout
    git pull origin main
    cd infra/form-with-aws-infra/form

    sudo docker build -t fastapi-app .
    sudo docker run -d -p 8000:8000 fastapi-app
  EOF

  tags = {
    Name = "FastAPI Server"
  }
}
