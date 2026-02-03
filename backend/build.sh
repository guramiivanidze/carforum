#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Clean up invalid tags (empty slugs/names)
python manage.py cleanup_tags

# Create superuser if none exists
python manage.py create_superuser_if_none
