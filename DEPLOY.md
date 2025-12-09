# SeriusStore - Deployment Guide

## VPS Information
- **IP Address**: 103.150.93.10
- **GitHub Repo**: Your repository

## Prerequisites on VPS
Pastikan VPS sudah terinstall:
- Docker
- Docker Compose
- Git

```bash
# Login ke VPS
ssh root@103.150.93.10

# Install Docker (jika belum)
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Install Docker Compose
apt update && apt install -y docker-compose
```

## Deployment Steps

### 1. Clone Repository
```bash
cd /root
git clone https://github.com/haynadn/SeriusStore.git
cd SeriusStore
```

### 2. Update JWT Secret (PENTING!)
Edit `docker-compose.yml`:
```bash
nano docker-compose.yml
```
Ganti `JWT_SECRET: your-production-secret-key-change-this` dengan secret yang aman.

### 3. Build & Run
```bash
docker-compose up -d --build
```

### 4. Cek Status
```bash
docker-compose ps
docker-compose logs -f
```

## Access
- **Frontend**: http://103.150.93.10:3000
- **Backend API**: http://103.150.93.10:8080

## Create Admin User
```bash
docker-compose exec postgres psql -U postgres -d ecommerce

-- Di dalam PostgreSQL:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
\q
```

## Update Application
```bash
cd /root/portfolio
git pull origin main
docker-compose up -d --build
```

## Stop Application
```bash
docker-compose down
```

## Common Issues

### Port sudah digunakan
```bash
lsof -i :3000
lsof -i :8080
kill -9 <PID>
```

### Lihat logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```
