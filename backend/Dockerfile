FROM serversideup/php:8.4-fpm-nginx

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
# --no-scripts: skip package:discover (needs .env, will run at startup)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Create required directories and set permissions for www-data (UID 33)
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port (serversideup image listens on 8080)
EXPOSE 8080

# Run startup script via sh (no chmod needed)
CMD ["sh", "/var/www/html/start.sh"]
