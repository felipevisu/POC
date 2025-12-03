#!/bin/bash

echo "Waiting for PostgreSQL..."

while ! nc -z postgis 5432; do
  sleep 0.5
done

echo "PostgreSQL started"

python manage.py migrate --noinput

exec "$@"
