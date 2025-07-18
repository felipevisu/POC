import os

import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

ses_client = boto3.client(
    "ses", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
)


class FormData(BaseModel):
    name: str
    email: str
    phone: str
    message: str


@app.get("/")
def read_root():
    return {"message": "Form submission API", "status": "running"}


@app.post("/submit")
def submit_form(data: FormData):
    try:
        sender_email = os.environ.get("SENDER_EMAIL")
        recipient_email = os.environ.get("RECIPIENT_EMAIL")

        if not sender_email or not recipient_email:
            raise HTTPException(status_code=500, detail="Email configuration not found")

        subject = f"New Form Submission from {data.name}"
        body = f"""
        You have received a new form submission:
        
        Name: {data.name}
        Email: {data.email}
        Phone: {data.phone}
        Message: {data.message}
        
        Best regards,
        Your Form Application
        """

        response = ses_client.send_email(
            Source=sender_email,
            Destination={"ToAddresses": [recipient_email]},
            Message={"Subject": {"Data": subject}, "Body": {"Text": {"Data": body}}},
        )

        print("Form submitted:")
        print(f"Name: {data.name}")
        print(f"Email: {data.email}")
        print(f"Phone: {data.phone}")
        print(f"Message: {data.message}")
        print(f"SES Message ID: {response['MessageId']}")

        return {
            "status": "success",
            "message": "Form received and email sent",
            "message_id": response["MessageId"],
        }

    except ClientError as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
