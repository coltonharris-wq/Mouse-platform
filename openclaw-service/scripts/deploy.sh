#!/bin/bash
# Deployment script for OpenClaw-as-a-Service

set -e

echo "🚀 OpenClaw-as-a-Service Deployment"
echo "===================================="

# Configuration
ENV=${1:-production}
COMPOSE_FILE="deployment/docker-compose.yml"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose required"; exit 1; }

# Create required directories
mkdir -p deployment/ssl
mkdir -p deployment/logs

# Generate environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DB_PASSWORD=$(openssl rand -base64 32)
DATABASE_URL=postgresql://openclaw:${DB_PASSWORD}@postgres:5432/openclaw

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# Security
JWT_SECRET=$(openssl rand -base64 48)
API_KEY_SECRET=$(openssl rand -base64 48)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Orgo VM API
ORGO_API_KEY=your-orgo-api-key
ORGO_WORKSPACE_ID=your-orgo-workspace-id

# Stripe
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
EOF
    echo "⚠️  Please edit .env with your actual API keys"
fi

# Load environment
export $(grep -v '^#' .env | xargs)

# Pull latest images
echo "📦 Pulling images..."
docker-compose -f $COMPOSE_FILE pull

# Build custom images
echo "🔨 Building images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Run database migrations
echo "🗄️  Running database setup..."
docker-compose -f $COMPOSE_FILE up -d postgres redis
sleep 5

# Start services
echo "🚀 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Health check
echo "🏥 Health check..."
sleep 10

if curl -sf http://localhost:8000/health > /dev/null; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check failed, checking logs..."
    docker-compose -f $COMPOSE_FILE logs api --tail=50
fi

# Show status
echo ""
echo "📊 Service Status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "API: http://localhost:8000"
echo "Health: http://localhost:8000/health"
echo ""
echo "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "To stop: docker-compose -f $COMPOSE_FILE down"
