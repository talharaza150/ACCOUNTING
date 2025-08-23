#!/bin/bash

# Raza Accounting Portal - Status Check Script

echo "🔍 Checking Raza Accounting Portal Status..."

# Check if PostgreSQL is running
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not Running"
fi

# Check ports 3000 and 3001
PORT_3000=$(netstat -tlnp | grep :3000 | wc -l)
PORT_3001=$(netstat -tlnp | grep :3001 | wc -l)

if [ $PORT_3000 -gt 0 ]; then
    echo "✅ Frontend (Port 3000): Running"
else
    echo "❌ Frontend (Port 3000): Not Running"
fi

if [ $PORT_3001 -gt 0 ]; then
    echo "✅ Backend (Port 3001): Running"
else
    echo "❌ Backend (Port 3001): Not Running"
fi

# Show process details
echo ""
echo "📋 Process Details:"
ps aux | grep -E "(3000|3001)" | grep -v grep

echo ""
echo "🌐 Network Status:"
netstat -tlnp | grep :300[01]

echo ""
echo "📄 Checking HTML Content:"
curl -k -s https://site.dachicorp.com/ | head -10

echo ""
echo "🔗 Checking Asset Accessibility:"
curl -k -I -s https://site.dachicorp.com/assets/index-DKsi0c_Y.css | head -1