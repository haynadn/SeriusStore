# E-Commerce Website

Website penjualan barang dengan Go backend dan React frontend.

## Tech Stack

- **Backend**: Go (Fiber framework)
- **Frontend**: Vite + React
- **Database**: PostgreSQL
- **Auth**: JWT

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL

### Setup Database

1. Buat database PostgreSQL:
```sql
CREATE DATABASE ecommerce;
```

2. Copy `.env.example` menjadi `.env` dan sesuaikan konfigurasi:
```bash
cd backend
cp .env.example .env
```

### Run Backend

```bash
cd backend
go mod tidy
go run cmd/main.go
```

Server akan berjalan di `http://localhost:8080`

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Membuat Admin User

Untuk membuat admin, daftar user biasa lalu update role melalui database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List semua produk
- `GET /api/products/:id` - Detail produk
- `POST /api/products` - Tambah produk (admin)
- `PUT /api/products/:id` - Update produk (admin)
- `DELETE /api/products/:id` - Hapus produk (admin)

### Categories
- `GET /api/categories` - List semua kategori
- `POST /api/categories` - Tambah kategori (admin)
- `PUT /api/categories/:id` - Update kategori (admin)
- `DELETE /api/categories/:id` - Hapus kategori (admin)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (admin)

### Upload
- `POST /api/upload` - Upload image (admin)

## Deployment ke VPS

Lihat file `docker-compose.yml` untuk deployment dengan Docker.

```bash
docker-compose up -d
```
