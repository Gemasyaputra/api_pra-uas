FROM python:3.11-slim

WORKDIR /app

# Copy requirements terlebih dahulu
COPY requirements.txt .

# Install dependency
RUN pip install --no-cache-dir -r requirements.txt

# Copy semua file aplikasi
COPY . .

# expose port di container
EXPOSE 5002

# jalankan aplikasi
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5002"]
