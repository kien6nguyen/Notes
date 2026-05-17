FROM serversideup/php:8.4-fpm-nginx

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
# --no-scripts: skip package:discover (needs .env, will run at startup)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Make startup script executable
RUN chmod +x /var/www/html/start.sh

# Expose port (serversideup image listens on 8080)
EXPOSE 8080

# Use our startup script
CMD ["/var/www/html/start.sh"]
