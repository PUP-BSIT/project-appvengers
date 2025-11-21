#!/bin/bash

# iBudget Deployment Script
# This script pulls the latest code from the prod branch and deploys it

set -e  # Exit on error

echo "=========================================="
echo "iBudget Deployment Script"
echo "Started at: $(date)"
echo "=========================================="

# Configuration
APP_DIR="/var/www/ibudget"
BACKUP_DIR="/var/www/ibudget-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKEND_HEALTH_URL="http://localhost:8081/api/categories/all"
MAX_WAIT_TIME=30  # seconds

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Navigate to app directory
cd "$APP_DIR"

echo ""
echo "Step 1: Creating backup of current deployment..."
mkdir -p "$BACKUP_DIR/$TIMESTAMP"
cp backend/appvengers/target/*.jar "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || echo "No existing backend JAR to backup"
cp -r frontend/ibudget/dist "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || echo "No existing frontend build to backup"

echo ""
echo "Step 2: Fetching latest code from prod branch..."
# Reset any local changes before pulling
git reset --hard HEAD
git clean -fd
git fetch origin prod
git checkout prod
git reset --hard origin/prod

echo ""
echo "Step 3: Deploying backend..."
# Stop backend service
systemctl stop ibudget-backend

# The JAR should already be built and in the prod branch
if [ -f "backend/appvengers/target/appvengers-0.0.1-SNAPSHOT.jar" ]; then
    echo "✓ Backend JAR found and ready"
else
    echo "✗ Backend JAR not found! Rolling back..."
    systemctl start ibudget-backend
    exit 1
fi

# Start backend service
systemctl start ibudget-backend

# Wait for backend to start with health check
echo "Waiting for backend to start (max ${MAX_WAIT_TIME}s)..."
# Give backend a moment to initialize before checking
sleep 3
ELAPSED=3
BACKEND_READY=false

while [ $ELAPSED -lt $MAX_WAIT_TIME ]; do
    # Check if backend responds (accept any HTTP response including 403)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_HEALTH_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "000" ] && [ "$HTTP_CODE" != "502" ] && [ "$HTTP_CODE" != "503" ]; then
        BACKEND_READY=true
        echo "✓ Backend health check passed after ${ELAPSED}s (HTTP $HTTP_CODE)"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo "  ... waiting (${ELAPSED}s/${MAX_WAIT_TIME}s)"
done

# Check if backend started successfully
if [ "$BACKEND_READY" = true ] && systemctl is-active --quiet ibudget-backend; then
    echo "✓ Backend service started successfully"
else
    echo "✗ Backend service failed to start! Rolling back..."
    echo ""
    echo "=== Backend Service Status ==="
    systemctl status ibudget-backend --no-pager -l || true
    echo ""
    echo "=== Last 100 lines of backend logs ==="
    journalctl -u ibudget-backend -n 100 --no-pager
    echo ""
    echo "=== Environment File Check ==="
    if [ -f "/etc/ibudget/backend.env" ]; then
        echo "✓ Environment file exists at /etc/ibudget/backend.env"
        echo "Environment variables count: $(grep -c "^[^#]" /etc/ibudget/backend.env 2>/dev/null || echo 0)"
    else
        echo "✗ Environment file NOT FOUND at /etc/ibudget/backend.env"
    fi
    
    # Rollback
    systemctl stop ibudget-backend
    cp "$BACKUP_DIR/$TIMESTAMP"/*.jar backend/appvengers/target/ 2>/dev/null || true
    systemctl start ibudget-backend
    exit 1
fi

echo ""
echo "Step 4: Deploying frontend..."
# The frontend should already be built and in the prod branch
if [ -d "frontend/ibudget/dist/ibudget/browser" ]; then
    echo "✓ Frontend build found and ready"
    # Nginx serves files directly, no restart needed unless config changed
else
    echo "✗ Frontend build not found! Check build artifacts"
    exit 1
fi

echo ""
echo "Step 5: Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "Step 6: Cleanup old backups (keeping last 5)..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "Finished at: $(date)"
echo "=========================================="

echo ""
echo "Service Status:"
systemctl is-active ibudget-backend && echo "✓ Backend: Running" || echo "✗ Backend: Not running"
systemctl is-active nginx && echo "✓ Nginx: Running" || echo "✗ Nginx: Not running"

echo ""
echo "Backend Health:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_HEALTH_URL" 2>/dev/null || echo "000")
echo "Health Check Status: $HTTP_STATUS"

exit 0
