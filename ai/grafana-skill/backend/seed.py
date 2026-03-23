"""Seed script to populate the database with sample data."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'store_system.settings')
django.setup()

from decimal import Decimal
from store.models import Store, Salesman, Product, Sale, SaleItem

# Stores
s1 = Store.objects.create(name="TechMart", address="Rua Augusta 100, Sao Paulo", phone="11-99999-0001")
s2 = Store.objects.create(name="MegaShop", address="Av. Paulista 500, Sao Paulo", phone="11-99999-0002")

# Salesmen
v1 = Salesman.objects.create(name="Carlos Silva", email="carlos@techmart.com", phone="11-98888-0001", store=s1)
v2 = Salesman.objects.create(name="Ana Souza", email="ana@megashop.com", phone="11-98888-0002", store=s2)
v3 = Salesman.objects.create(name="Pedro Lima", email="pedro@techmart.com", phone="11-98888-0003", store=s1)

# Products
p1 = Product.objects.create(name="Notebook Dell", description="Notebook Dell Inspiron 15", price=Decimal("4500.00"), stock=20)
p2 = Product.objects.create(name="Mouse Logitech", description="Mouse sem fio MX Master", price=Decimal("350.00"), stock=100)
p3 = Product.objects.create(name="Teclado Mecânico", description="Teclado mecânico RGB", price=Decimal("280.00"), stock=50)
p4 = Product.objects.create(name="Monitor 27\"", description="Monitor IPS 4K 27 polegadas", price=Decimal("2200.00"), stock=15)
p5 = Product.objects.create(name="Webcam HD", description="Webcam 1080p com microfone", price=Decimal("190.00"), stock=80)

# Sales
sale1 = Sale.objects.create(store=s1, salesman=v1)
SaleItem.objects.create(sale=sale1, product=p1, quantity=1, unit_price=p1.price)
SaleItem.objects.create(sale=sale1, product=p2, quantity=2, unit_price=p2.price)
sale1.total = p1.price + p2.price * 2
sale1.save()

sale2 = Sale.objects.create(store=s2, salesman=v2)
SaleItem.objects.create(sale=sale2, product=p4, quantity=1, unit_price=p4.price)
SaleItem.objects.create(sale=sale2, product=p3, quantity=1, unit_price=p3.price)
SaleItem.objects.create(sale=sale2, product=p5, quantity=3, unit_price=p5.price)
sale2.total = p4.price + p3.price + p5.price * 3
sale2.save()

print("Seed data created successfully!")
print(f"  Stores: {Store.objects.count()}")
print(f"  Salesmen: {Salesman.objects.count()}")
print(f"  Products: {Product.objects.count()}")
print(f"  Sales: {Sale.objects.count()}")
print(f"  SaleItems: {SaleItem.objects.count()}")
