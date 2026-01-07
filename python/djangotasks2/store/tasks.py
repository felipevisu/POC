from django.tasks import task


@task
def process_payment(value):
    print(value)


@task
def update_stock(product_id):
    print(product_id)


@task
def notify_staff(staff_email):
    print(staff_email)


@task
def notify_customer(customer_email):
    print(customer_email)
