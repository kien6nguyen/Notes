#!/bin/sh
exec s6-setuidgid www-data php /var/www/html/artisan reverb:start --host=0.0.0.0 --port=8085
