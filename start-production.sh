#!/bin/bash

# Raza Accounting Portal - Production Startup Script

echo "Starting Raza Accounting Portal Production Environment..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Kill any existing processes
pkill -f "next start" 2>/dev/null
pkill -f "vite preview" 2>/dev/null
sleep 3

# Start backend (Next.js production server) on port 3001
echo "Starting backend server on port 3001..."
cd /root/portal2/backend
PORT=3001 npm run start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Build frontend with correct relative paths
echo "Building frontend with relative asset paths..."
cd /root/portal2/frontend
npm run build

# Start frontend (Vue.js production server) on port 3000
echo "Starting frontend production server on port 3000..."
npm run preview -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

# Wait for processes to start
sleep 5

echo ""
echo "🚀 Raza Accounting Portal Production Environment Started!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001/api"
echo "Domain (via Nginx): https://site.dachicorp.com (if DNS configured)"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin@1000"
echo ""
echo "Background PIDs: Frontend($FRONTEND_PID) Backend($BACKEND_PID)"
echo ""