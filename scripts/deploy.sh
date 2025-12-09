#!/bin/bash

# SeriusStore Deployment Script
# Usage: ./deploy.sh [dev|prod]

ENV=${1:-prod}

echo "🚀 Deploying SeriusStore to $ENV environment..."

cd /root/SeriusStore

# Pull latest changes
git fetch origin
git checkout $ENV 2>/dev/null || git checkout master
git pull

# Select compose file
if [ "$ENV" == "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Deploy
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d --build

# Cleanup
docker image prune -f

echo "✅ Deployment complete!"
echo ""
if [ "$ENV" == "dev" ]; then
    echo "🌐 Frontend: http://103.150.93.10:3001"
    echo "🔧 Backend:  http://103.150.93.10:8081"
else
    echo "🌐 Frontend: http://103.150.93.10:3000"
    echo "🔧 Backend:  http://103.150.93.10:8080"
fi
