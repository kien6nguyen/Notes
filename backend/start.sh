#!/bin/sh
set -e

echo "🚀 Starting Notes App Backend..."

# Discover packages (skipped during composer install --no-scripts)
php artisan package:discover --ansi

# Cache config & routes with runtime env vars
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ⚠️ FRESH MIGRATION: wipe all tables and reseed (one-time reset)
php artisan migrate:fresh --force

# Seed default test users
php artisan db:seed --force

# Create storage symlink if not exists
php artisan storage:link || true

# Start Reverb in background
php artisan reverb:start --host=0.0.0.0 --port=8085 &

echo "✅ Backend ready"
