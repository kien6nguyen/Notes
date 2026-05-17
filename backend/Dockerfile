FROM serversideup/php:8.4-fpm-nginx

# Switch to root to handle permissions
USER root

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
# --no-scripts: skip package:discover (needs .env, will run at startup)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Create required directories and fix permissions for www-data (UID 33)
RUN mkdir -p storage/logs \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Switch back to www-data for runtime
USER www-data

# Expose port (serversideup image listens on 8080)
EXPOSE 8080

# Run startup script via sh
CMD ["sh", "/var/www/html/start.sh"]
