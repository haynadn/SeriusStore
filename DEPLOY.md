# SeriusStore - Deployment Guide

## Environments

| Environment | Frontend | Backend | URL |
|-------------|----------|---------|-----|
| **Dev**     | :3001    | :8081   | http://103.150.93.10:3001 |
| **Prod**    | :3000    | :8080   | http://103.150.93.10:3000 |

## Branches
- `dev` → Deploy ke Dev environment
- `prod` atau `master` → Deploy ke Prod environment

---

## VPS Initial Setup

### 1. Install Docker
```bash
ssh root@103.150.93.10
curl -fsSL https://get.docker.com | sh
systemctl start docker && systemctl enable docker
apt update && apt install -y docker-compose git curl
```

### 2. Clone Repository
```bash
cd /root
git clone https://github.com/haynadn/SeriusStore.git
cd SeriusStore
```

### 3. Setup GitHub Actions Runner

```bash
# Buat folder runner
mkdir -p /root/actions-runner && cd /root/actions-runner

# Download runner (cek versi terbaru di GitHub)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure (dapatkan token dari GitHub repo > Settings > Actions > Runners)
./config.sh --url https://github.com/haynadn/SeriusStore --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

---

## Manual Deployment

### Deploy Dev
```bash
cd /root/SeriusStore
git checkout dev && git pull
docker-compose -f docker-compose.dev.yml up -d --build
```

### Deploy Prod
```bash
cd /root/SeriusStore
git checkout master && git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Workflow

1. **Development**: Push ke `dev` → Auto deploy ke http://103.150.93.10:3001
2. **Testing**: Test fitur di dev environment
3. **Production**: Merge `dev` ke `master`/`prod` → Auto deploy ke http://103.150.93.10:3000

---

## Useful Commands

```bash
# Status
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Create admin user
docker-compose -f docker-compose.prod.yml exec postgres-prod psql -U postgres -d ecommerce -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
```
