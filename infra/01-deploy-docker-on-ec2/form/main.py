from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FormData(BaseModel):
    name: str
    email: str
    phone: str
    message: str

@app.post("/submit")
def submit_form(data: FormData):
    print("Form submitted:")
    print(f"Name: {data.name}")
    print(f"Email: {data.email}")
    print(f"Phone: {data.phone}")
    print(f"Message: {data.message}")
    return {"status": "success", "message": "Form received"}
