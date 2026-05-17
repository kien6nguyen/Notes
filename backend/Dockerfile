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

# Copy start script to serversideup auto-run entrypoint directory
RUN cp start.sh /etc/entrypoint.d/99-start.sh \
    && chmod +x /etc/entrypoint.d/99-start.sh

# Inject custom Nginx location block for WebSocket proxying
RUN mkdir -p /etc/nginx/server-opts.d \
    && cp nginx-websocket.conf /etc/nginx/server-opts.d/websocket.conf \
    && chown www-data:www-data /etc/nginx/server-opts.d/websocket.conf \
    && chmod 644 /etc/nginx/server-opts.d/websocket.conf

# Copy Reverb s6 service run script
RUN mkdir -p /etc/services.d/reverb \
    && cp reverb-service.sh /etc/services.d/reverb/run \
    && chmod +x /etc/services.d/reverb/run

# Switch back to www-data for runtime
USER www-data

# Expose port (serversideup image listens on 8080)
EXPOSE 8080
