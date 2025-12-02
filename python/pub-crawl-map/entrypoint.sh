#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."

while ! nc -z postgis 5432; do
  sleep 0.5
done

echo "PostgreSQL started"

# Run migrations
python manage.py migrate --noinput

# Start server
exec "$@"
