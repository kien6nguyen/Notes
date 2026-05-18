#!/bin/sh
echo "🚀 Starting Laravel Queue Worker..."
exec php /var/www/html/artisan queue:work --verbose --tries=3
