from django.contrib import admin
from .models import Store, Salesman, Product, Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'created_at')
    search_fields = ('name', 'address')


@admin.register(Salesman)
class SalesmanAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'store', 'created_at')
    search_fields = ('name', 'email')
    list_filter = ('store',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'created_at')
    search_fields = ('name',)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'store', 'salesman', 'total', 'created_at')
    list_filter = ('store', 'salesman')
    inlines = [SaleItemInline]
