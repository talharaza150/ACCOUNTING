#!/bin/bash

# Raza Accounting Portal - Development Startup Script

echo "Starting Raza Accounting Portal Development Environment..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "Starting Nginx..."
    sudo systemctl start nginx
fi

# Start backend (Next.js)
echo "Starting backend server on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend (Vue.js)
echo "Starting frontend development server on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 Raza Accounting Portal is starting up..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001/api"
echo "Domain (via Nginx): http://site.dachicorp.com (if DNS configured)"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin@1000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID