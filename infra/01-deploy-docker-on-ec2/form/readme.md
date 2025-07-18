### Run with docker

```bash
docker build -t my-form-app .
docker run -d -p 8000:8000 my-form-app
```

### Run uvicorn

```bash
uvicorn main:app --reload
```

### Access the app
http://127.0.0.1:8000/submit

### Access the Swagger UI
http://127.0.0.1:8000/docs