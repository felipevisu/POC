from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="Market Products API",
    description="A simple API for managing market products",
    version="1.0.0",
)


# Product model
class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: str
    in_stock: bool


# Sample data
PRODUCTS = [
    Product(
        id=1,
        name="Fresh Apples",
        category="Fruits",
        price=2.99,
        description="Fresh red apples from local farms",
        in_stock=True,
    ),
    Product(
        id=2,
        name="Organic Bananas",
        category="Fruits",
        price=1.99,
        description="Organic bananas rich in potassium",
        in_stock=True,
    ),
    Product(
        id=3,
        name="Whole Milk",
        category="Dairy",
        price=3.49,
        description="Fresh whole milk from grass-fed cows",
        in_stock=True,
    ),
    Product(
        id=4,
        name="Bread Loaf",
        category="Bakery",
        price=2.49,
        description="Freshly baked whole wheat bread",
        in_stock=False,
    ),
    Product(
        id=5,
        name="Chicken Breast",
        category="Meat",
        price=8.99,
        description="Fresh boneless chicken breast",
        in_stock=True,
    ),
    Product(
        id=6,
        name="Cheddar Cheese",
        category="Dairy",
        price=4.99,
        description="Aged cheddar cheese block",
        in_stock=True,
    ),
    Product(
        id=7,
        name="Salmon Fillet",
        category="Seafood",
        price=12.99,
        description="Fresh Atlantic salmon fillet",
        in_stock=True,
    ),
    Product(
        id=8,
        name="Broccoli",
        category="Vegetables",
        price=1.79,
        description="Fresh green broccoli crowns",
        in_stock=True,
    ),
]


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Market Products API",
        "endpoints": {
            "list_products": "/products",
            "product_details": "/products/{product_id}",
            "api_docs": "/docs",
        },
    }


@app.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None, in_stock: Optional[bool] = None
):
    """
    Get a list of all products with optional filtering

    - **category**: Filter by product category
    - **in_stock**: Filter by stock availability
    """
    products = PRODUCTS.copy()

    if category:
        products = [p for p in products if p.category.lower() == category.lower()]

    if in_stock is not None:
        products = [p for p in products if p.in_stock == in_stock]

    return products


@app.get("/products/{product_id}", response_model=Product)
async def get_product_details(product_id: int):
    """
    Get detailed information about a specific product

    - **product_id**: The ID of the product to retrieve
    """
    product = next((p for p in PRODUCTS if p.id == product_id), None)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running properly"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
