# Market Products API

A simple FastAPI-based REST API that provides endpoints for managing market products. This application serves as a sample for demonstrating containerized API deployment.

## Features

- **List Products**: Get all products with optional filtering by category and stock status
- **Product Details**: Get detailed information about a specific product
- **Health Check**: Simple endpoint to verify API status
- **Interactive Documentation**: Automatic API documentation with Swagger UI

## API Endpoints

### 1. List Products

**GET** `/products`

Returns a list of all available products.

**Query Parameters:**

- `category` (optional): Filter by product category (e.g., "Fruits", "Dairy", "Meat")
- `in_stock` (optional): Filter by stock availability (true/false)

**Example:**

```bash
curl http://localhost:8000/products
curl http://localhost:8000/products?category=Fruits
curl http://localhost:8000/products?in_stock=true
```

### 2. Product Details

**GET** `/products/{product_id}`

Returns detailed information about a specific product.

**Path Parameters:**

- `product_id`: The ID of the product to retrieve

**Example:**

```bash
curl http://localhost:8000/products/1
```

### 3. Health Check

**GET** `/health`

Returns the API health status.

**Example:**

```bash
curl http://localhost:8000/health
```

## Sample Data

The API includes sample data for 8 different products across various categories:

- Fruits (Apples, Bananas)
- Dairy (Milk, Cheese)
- Bakery (Bread)
- Meat (Chicken)
- Seafood (Salmon)
- Vegetables (Broccoli)

## Running the Application

### Option 1: Using Docker (Recommended)

1. **Build the Docker image:**

   ```bash
   docker build -t market-products-api .
   ```

2. **Run the container:**

   ```bash
   docker run -d -p 8000:8000 --name market-api market-products-api
   ```

3. **Access the API:**

   - API Base URL: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - ReDoc Documentation: http://localhost:8000/redoc

4. **Stop the container:**
   ```bash
   docker stop market-api
   docker rm market-api
   ```

### Option 2: Running Locally

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**

   ```bash
   python main.py
   ```

   Or using uvicorn directly:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access the API:**
   - API Base URL: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs

## Testing the API

### Test the list endpoint:

```bash
curl http://localhost:8000/products
```

### Test filtering by category:

```bash
curl http://localhost:8000/products?category=Fruits
```

### Test product details:

```bash
curl http://localhost:8000/products/1
```

### Test health check:

```bash
curl http://localhost:8000/health
```

## Project Structure

```
sample-application/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
└── Readme.md           # This file
```

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI web server
- **Docker**: Containerization platform

## Development

The API includes automatic interactive documentation accessible at `/docs` when running the application. This provides a user-friendly interface to test all endpoints directly from your browser.
