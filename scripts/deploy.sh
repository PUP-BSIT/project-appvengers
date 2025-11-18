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

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend started successfully
if systemctl is-active --quiet ibudget-backend; then
    echo "✓ Backend service started successfully"
else
    echo "✗ Backend service failed to start! Rolling back..."
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

exit 0
