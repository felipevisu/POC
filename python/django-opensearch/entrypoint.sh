#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding database..."
python manage.py seed books --number=100

echo "Ensuring OpenSearch index exists..."
yes | python manage.py opensearch index create || echo "Index already exists, skipping."

echo "Updating OpenSearch..."
yes | python manage.py opensearch index update || echo "Nothing to update"

echo "Starting Django server..."
exec "$@"
