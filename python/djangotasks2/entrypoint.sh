#!/bin/sh
set -e

if [ "$1" = 'web' ]; then
    exec python manage.py runserver 0.0.0.0:8000
elif [ "$1" = 'worker' ]; then
    exec python manage.py worker
else
    exec "$@"
fi