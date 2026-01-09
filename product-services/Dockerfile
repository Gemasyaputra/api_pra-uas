#gunakan image node js versi 18
FROM node:18-alpine
# COPY src/ /var/www/html/
# Enable useful Apache modules
# RUN a2enmod rewrite
# RUN docker-php-ext-install pdo_mysql mysqli && docker-php-ext-enable pdo_mysql mysqli

WORKDIR /app

#copy file package.json ke dalam container
COPY package.json . /app/

#install dependencies
RUN npm install

#copy semua file ke dalam container
COPY . .

#expose port 3000 (agar bisa diakses dari luar container)
EXPOSE 3000

#jalankan aplikasi
CMD ["npm", "start"]