# SES Email identity
resource "aws_ses_email_identity" "sender_email" {
  email = var.sender_email
}

# SES Email identity for recipient
resource "aws_ses_email_identity" "recipient_email" {
  email = var.recipient_email
}

# IAM role for EC2 to send emails via SES
resource "aws_iam_role" "ec2_ses_role" {
  name = "ec2-ses-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for SES sending
resource "aws_iam_role_policy" "ec2_ses_policy" {
  name = "ec2-ses-policy"
  role = aws_iam_role.ec2_ses_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM instance profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ses-profile"
  role = aws_iam_role.ec2_ses_role.name
}
