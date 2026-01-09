# ============================================
# Cart Service (Laravel Lumen) - Dockerfile
# ============================================
FROM php:8.2-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Working dir di dalam container
WORKDIR /var/www

# 1) Generate project Lumen di /var/www/src
#    (ini yang bikin folder public/, bootstrap/, dll)
RUN composer create-project --prefer-dist laravel/lumen:^10.0 src

# Pindah ke folder lumen
WORKDIR /var/www/src

# 2) Copy file konfigurasi & routes dari host ke project lumen
#    Host: cart-service/.env        -> Container: /var/www/src/.env
COPY .env .env

#    Host: cart-service/routes/web.php -> Container: /var/www/src/routes/web.php
COPY routes/web.php routes/web.php

# Expose port
EXPOSE 8000

# Jalankan Lumen dengan built-in server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]