#!/bin/sh
set -e

echo "🚀 Starting Notes App Backend..."

# Discover packages (skipped during composer install --no-scripts)
php artisan package:discover --ansi

# Cache config & routes with runtime env vars
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (adds new tables/columns only, preserves existing data)
php artisan migrate --force

# Seed default test users
php artisan db:seed --force

# Create storage symlink if not exists
php artisan storage:link || true

# Ensure all generated files are owned by www-data
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ Backend ready"
