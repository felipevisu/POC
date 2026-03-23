from decimal import Decimal

import graphene
from graphene_django import DjangoObjectType

from .models import Product, Sale, SaleItem, Salesman, Store

# ---------- Types ----------


class StoreType(DjangoObjectType):
    class Meta:
        model = Store
        fields = "__all__"


class SalesmanType(DjangoObjectType):
    class Meta:
        model = Salesman
        fields = "__all__"


class ProductType(DjangoObjectType):
    class Meta:
        model = Product
        fields = "__all__"


class SaleItemType(DjangoObjectType):
    class Meta:
        model = SaleItem
        fields = "__all__"


class SaleType(DjangoObjectType):
    items = graphene.List(SaleItemType)

    class Meta:
        model = Sale
        fields = "__all__"

    def resolve_items(self, info):
        return self.items.all()


# ---------- Queries ----------


class Query(graphene.ObjectType):
    # Store
    all_stores = graphene.List(StoreType)
    store = graphene.Field(StoreType, id=graphene.ID(required=True))

    # Salesman
    all_salesmen = graphene.List(SalesmanType)
    salesman = graphene.Field(SalesmanType, id=graphene.ID(required=True))

    # Product
    all_products = graphene.List(ProductType)
    product = graphene.Field(ProductType, id=graphene.ID(required=True))

    # Sale
    all_sales = graphene.List(SaleType)
    sale = graphene.Field(SaleType, id=graphene.ID(required=True))

    def resolve_all_stores(self, info):
        return Store.objects.all()

    def resolve_store(self, info, id):
        return Store.objects.filter(pk=id).first()

    def resolve_all_salesmen(self, info):
        return Salesman.objects.select_related("store").all()

    def resolve_salesman(self, info, id):
        return Salesman.objects.select_related("store").filter(pk=id).first()

    def resolve_all_products(self, info):
        return Product.objects.all()

    def resolve_product(self, info, id):
        return Product.objects.filter(pk=id).first()

    def resolve_all_sales(self, info):
        return (
            Sale.objects.select_related("store", "salesman")
            .prefetch_related("items__product")
            .all()
        )

    def resolve_sale(self, info, id):
        return (
            Sale.objects.select_related("store", "salesman")
            .prefetch_related("items__product")
            .filter(pk=id)
            .first()
        )


# ---------- Mutations: Store ----------


class CreateStore(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        address = graphene.String(required=True)
        phone = graphene.String()

    store = graphene.Field(StoreType)

    def mutate(self, info, name, address, phone=""):
        store = Store.objects.create(name=name, address=address, phone=phone)
        return CreateStore(store=store)


class UpdateStore(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        address = graphene.String()
        phone = graphene.String()

    store = graphene.Field(StoreType)

    def mutate(self, info, id, **kwargs):
        store = Store.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(store, key, value)
        store.save()
        return UpdateStore(store=store)


class DeleteStore(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, id):
        Store.objects.filter(pk=id).delete()
        return DeleteStore(ok=True)


# ---------- Mutations: Salesman ----------


class CreateSalesman(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        phone = graphene.String()
        store_id = graphene.ID(required=True)

    salesman = graphene.Field(SalesmanType)

    def mutate(self, info, name, email, store_id, phone=""):
        store = Store.objects.get(pk=store_id)
        salesman = Salesman.objects.create(
            name=name, email=email, phone=phone, store=store
        )
        return CreateSalesman(salesman=salesman)


class UpdateSalesman(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        email = graphene.String()
        phone = graphene.String()
        store_id = graphene.ID()

    salesman = graphene.Field(SalesmanType)

    def mutate(self, info, id, **kwargs):
        salesman = Salesman.objects.get(pk=id)
        if "store_id" in kwargs:
            kwargs["store"] = Store.objects.get(pk=kwargs.pop("store_id"))
        for key, value in kwargs.items():
            setattr(salesman, key, value)
        salesman.save()
        return UpdateSalesman(salesman=salesman)


class DeleteSalesman(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, id):
        Salesman.objects.filter(pk=id).delete()
        return DeleteSalesman(ok=True)


# ---------- Mutations: Product ----------


class CreateProduct(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        price = graphene.Float(required=True)
        stock = graphene.Int()

    product = graphene.Field(ProductType)

    def mutate(self, info, name, price, description="", stock=0):
        product = Product.objects.create(
            name=name,
            description=description,
            price=Decimal(str(price)),
            stock=stock,
        )
        return CreateProduct(product=product)


class UpdateProduct(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        price = graphene.Float()
        stock = graphene.Int()

    product = graphene.Field(ProductType)

    def mutate(self, info, id, **kwargs):
        product = Product.objects.get(pk=id)
        if "price" in kwargs:
            kwargs["price"] = Decimal(str(kwargs["price"]))
        for key, value in kwargs.items():
            setattr(product, key, value)
        product.save()
        return UpdateProduct(product=product)


class DeleteProduct(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, id):
        Product.objects.filter(pk=id).delete()
        return DeleteProduct(ok=True)


# ---------- Mutations: Sale ----------


class SaleItemInput(graphene.InputObjectType):
    product_id = graphene.ID(required=True)
    quantity = graphene.Int(required=True)


class CreateSale(graphene.Mutation):
    class Arguments:
        store_id = graphene.ID(required=True)
        salesman_id = graphene.ID(required=True)
        items = graphene.List(SaleItemInput, required=True)

    sale = graphene.Field(SaleType)

    def mutate(self, info, store_id, salesman_id, items):
        store = Store.objects.get(pk=store_id)
        salesman = Salesman.objects.get(pk=salesman_id)
        sale = Sale.objects.create(store=store, salesman=salesman)

        total = Decimal("0")
        for item_data in items:
            product = Product.objects.get(pk=item_data.product_id)
            sale_item = SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=item_data.quantity,
                unit_price=product.price,
            )
            total += product.price * item_data.quantity

        sale.total = total
        sale.save()
        return CreateSale(sale=sale)


class UpdateSale(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        store_id = graphene.ID()
        salesman_id = graphene.ID()
        items = graphene.List(SaleItemInput)

    sale = graphene.Field(SaleType)

    def mutate(self, info, id, store_id=None, salesman_id=None, items=None):
        sale = Sale.objects.get(pk=id)
        if store_id:
            sale.store = Store.objects.get(pk=store_id)
        if salesman_id:
            sale.salesman = Salesman.objects.get(pk=salesman_id)

        if items is not None:
            sale.items.all().delete()
            total = Decimal("0")
            for item_data in items:
                product = Product.objects.get(pk=item_data.product_id)
                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=item_data.quantity,
                    unit_price=product.price,
                )
                total += product.price * item_data.quantity
            sale.total = total

        sale.save()
        return UpdateSale(sale=sale)


class DeleteSale(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, id):
        Sale.objects.filter(pk=id).delete()
        return DeleteSale(ok=True)


# ---------- Mutation root ----------


class Mutation(graphene.ObjectType):
    # Store
    create_store = CreateStore.Field()
    update_store = UpdateStore.Field()
    delete_store = DeleteStore.Field()
    # Salesman
    create_salesman = CreateSalesman.Field()
    update_salesman = UpdateSalesman.Field()
    delete_salesman = DeleteSalesman.Field()
    # Product
    create_product = CreateProduct.Field()
    update_product = UpdateProduct.Field()
    delete_product = DeleteProduct.Field()
    # Sale
    create_sale = CreateSale.Field()
    update_sale = UpdateSale.Field()
    delete_sale = DeleteSale.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
