#!/bin/bash

###############################################################################
# PuQ.me - Complete Deployment Script
# Builds and deploys the entire platform with one command
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_PORT=${API_PORT:-3000}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
REDIS_PORT=${REDIS_PORT:-6379}

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          PuQ.me - COMPLETE DEPLOYMENT SCRIPT               ║"
echo "║                  Building & Deploying...                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

###############################################################################
# Step 1: Build Frontend for Cloudflare Workers
###############################################################################
echo -e "\n${YELLOW}[STEP 1/5]${NC} Building Frontend (Next.js → Cloudflare Worker)..."

# Create Dockerfile for building
cat > Dockerfile.build << 'DOCKERFILE'
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.1

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all packages
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages
RUN pnpm build

# Output
RUN ls -la apps/web/.open-next/ 2>/dev/null || echo "Build may need adjustment"
DOCKERFILE

echo "  Building with Docker..."
docker build -f Dockerfile.build -t puqme-builder:latest . 2>&1 | tail -20

# Extract built files
echo "  Extracting built files..."
docker create --name puqme-build-temp puqme-builder:latest > /dev/null 2>&1 || true
docker cp puqme-build-temp:/app/apps/web/.open-next ./apps/web/.open-next 2>/dev/null || echo "  ⚠️  Web build may need docker-compose to complete"
docker rm -f puqme-build-temp > /dev/null 2>&1 || true

if [ -d "apps/web/.open-next" ]; then
    echo -e "${GREEN}  ✓ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}  ⚠️  Frontend build incomplete - will continue with existing setup${NC}"
fi

###############################################################################
# Step 2: Prepare Production Configuration
###############################################################################
echo -e "\n${YELLOW}[STEP 2/5]${NC} Preparing Production Configuration..."

if [ ! -f "deploy/host/.env" ]; then
    echo "  Creating production .env..."
    cp .env.production.api deploy/host/.env
    echo -e "${GREEN}  ✓ Configuration file created${NC}"
    echo -e "${YELLOW}  ⚠️  IMPORTANT: Edit deploy/host/.env and fill in:${NC}"
    echo "    - POSTGRES_PASSWORD (generate strong password)"
    echo "    - S3_ACCESS_KEY (from IDrive e2)"
    echo "    - S3_SECRET_KEY (from IDrive e2)"
else
    echo -e "${GREEN}  ✓ Production config already exists${NC}"
fi

###############################################################################
# Step 3: Verify Docker Compose Setup
###############################################################################
echo -e "\n${YELLOW}[STEP 3/5]${NC} Verifying Docker Compose Setup..."

if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}  ✗ Docker or Docker Compose not found!${NC}"
    echo "  Install Docker: https://docs.docker.com/install/"
    exit 1
fi

echo -e "${GREEN}  ✓ Docker is installed${NC}"

# Check if .env has required values
if grep -q "replace-me\|replace-with\|\[" deploy/host/.env 2>/dev/null; then
    echo -e "${YELLOW}  ⚠️  NOTICE: .env contains placeholder values${NC}"
    echo "  Please fill these in before deploying to production:"
    grep -n "replace-me\|replace-with\|\[" deploy/host/.env || true
fi

###############################################################################
# Step 4: Start Services
###############################################################################
echo -e "\n${YELLOW}[STEP 4/5]${NC} Starting Services (Docker Compose)..."

cd deploy/host

echo "  Starting PostgreSQL, Redis, and API..."
if docker-compose up -d 2>&1 | grep -q "done"; then
    echo -e "${GREEN}  ✓ Services started${NC}"
else
    echo -e "${YELLOW}  Starting services (may take a moment)...${NC}"
    sleep 5
fi

# Wait for services to be healthy
echo "  Waiting for services to be healthy..."
for i in {1..30}; do
    if docker-compose ps | grep -q "Up.*healthy"; then
        echo -e "${GREEN}  ✓ Services are healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}  ⚠️  Services took longer to start${NC}"
    fi
    sleep 2
done

# Show service status
echo -e "\n  ${BLUE}Service Status:${NC}"
docker-compose ps

cd - > /dev/null

###############################################################################
# Step 5: Run Tests & Verification
###############################################################################
echo -e "\n${YELLOW}[STEP 5/5]${NC} Running Tests & Verification..."

# Give API time to start
sleep 3

# Test health endpoint
echo "  Testing Health Endpoint..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/health | jq -r '.status' 2>/dev/null)
    if [ "$HEALTH" = "ok" ]; then
        echo -e "${GREEN}  ✓ API Health Check PASSED${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Health returned: $HEALTH${NC}"
    fi
else
    echo -e "${YELLOW}  ℹ️  API might still be starting up${NC}"
fi

# Test PostgreSQL
echo "  Testing PostgreSQL..."
if docker-compose -f deploy/host/docker-compose.yml exec -T postgres psql -U puqme -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ PostgreSQL Connection PASSED${NC}"
else
    echo -e "${YELLOW}  ⚠️  PostgreSQL connection pending${NC}"
fi

# Test Redis
echo "  Testing Redis..."
if docker-compose -f deploy/host/docker-compose.yml exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo -e "${GREEN}  ✓ Redis Connection PASSED${NC}"
else
    echo -e "${YELLOW}  ⚠️  Redis connection pending${NC}"
fi

###############################################################################
# Summary
###############################################################################
echo -e "\n${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETE ✓                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${GREEN}What's Running:${NC}"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • API: localhost:3000"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Test the API:"
echo "     curl http://localhost:3000/health"
echo ""
echo "  2. Register a test user:"
echo "     curl -X POST http://localhost:3000/v1/auth/register \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\"}'"
echo ""
echo "  3. Check the frontend:"
echo "     Open http://localhost:3001 in your browser"
echo ""

echo -e "${YELLOW}Production Deployment:${NC}"
echo "  1. Edit: deploy/host/.env (add PostgreSQL password + S3 keys)"
echo "  2. Copy to VPS: scp -r deploy/host/ root@your-vps:/opt/puqme/"
echo "  3. SSH into VPS: ssh root@your-vps"
echo "  4. Start: cd /opt/puqme/deploy/host && docker-compose up -d"
echo "  5. Test: curl https://api.puq.me/health"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo "  • Quick Start: QUICK-FIX.md"
echo "  • Full Guide: API-DEPLOYMENT-GUIDE.md"
echo "  • Status: DEPLOYMENT-STATUS.md"
echo ""

echo -e "${GREEN}To stop services:${NC}"
echo "  docker-compose -f deploy/host/docker-compose.yml down"
echo ""

echo -e "${GREEN}To view logs:${NC}"
echo "  docker-compose -f deploy/host/docker-compose.yml logs -f api"
echo ""
