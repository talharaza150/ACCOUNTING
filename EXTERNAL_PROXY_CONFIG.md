# 🌐 External Nginx Proxy Manager Configuration

## ✅ Configuration Applied
The Raza Accounting Portal has been configured to work with your external Nginx Proxy Manager.

### Changes Made
1. **✅ Disabled local nginx** (since you use external proxy manager)
2. **✅ Updated API URLs** to use relative paths (`/api/*`)
3. **✅ Configured backend** for external proxy setup
4. **✅ Updated frontend** to work with proxy routing

## 🔧 Nginx Proxy Manager Setup

### Primary Proxy Host Configuration

#### Basic Settings
```
Domain Names: site.dachicorp.com
Scheme: http
Forward Hostname/IP: 192.168.1.216
Forward Port: 3000
Block Common Exploits: ✅
Websockets Support: ✅
Access List: (optional)
```

#### SSL Settings
```
SSL Certificate: Request New SSL Certificate (Let's Encrypt)
Force SSL: ✅
HTTP/2 Support: ✅
HSTS Enabled: ✅
```

#### Advanced Configuration
Add this to the **Advanced** tab:

```nginx
# Handle API requests to backend
location /api/ {
    proxy_pass http://192.168.1.216:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Timeouts for file uploads
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Buffer settings
    proxy_buffering off;
    proxy_request_buffering off;
    client_max_body_size 100M;
}

# Handle file uploads specifically
location /api/files/upload {
    proxy_pass http://192.168.1.216:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Extended timeouts for file uploads
    proxy_connect_timeout 60s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    
    # Large file support
    client_max_body_size 500M;
    proxy_request_buffering off;
}
```

## 🚀 Services Status

### Backend Services (on 192.168.1.216)
- **✅ PostgreSQL**: Running on port 5432
- **✅ Next.js API**: Running on port 3001
- **✅ Vue.js Frontend**: Running on port 3000
- **❌ Local Nginx**: Disabled (using your external proxy)

### Access Points
- **External Domain**: https://site.dachicorp.com (via your proxy manager)
- **Direct Frontend**: http://192.168.1.216:3000 (for testing)
- **Direct API**: http://192.168.1.216:3001/api (for testing)

## 🧪 Testing Your Proxy Setup

### 1. Test Basic Access
```bash
curl -I https://site.dachicorp.com
```
Should return: `200 OK` with HTML content

### 2. Test API Routing
```bash
curl -X POST https://site.dachicorp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin@1000"}'
```
Should return: JSON with token and user data

### 3. Test Static Assets
```bash
curl -I https://site.dachicorp.com/favicon.ico
```
Should return: `200 OK` with `image/x-icon` content type

## 🔒 Admin Access

Once your proxy is configured:

- **URL**: https://site.dachicorp.com/admin
- **Username**: admin
- **Password**: admin@1000

## 📝 Troubleshooting

### If you see 502 errors:
1. Check that both services are running:
   ```bash
   curl http://192.168.1.216:3000  # Frontend
   curl http://192.168.1.216:3001/api/categories  # Backend
   ```

2. Verify proxy manager can reach the backend server

3. Check NPM logs for connection errors

### If API calls fail:
- Ensure the `/api/` location block is configured in NPM
- Check that port 3001 is accessible from your proxy manager
- Verify no firewall blocking the ports

## ✅ Configuration Complete

The portal is now configured to work seamlessly with your external Nginx Proxy Manager. Once you configure the proxy host settings above, users will be able to access the portal at:

**https://site.dachicorp.com**

All API calls, static assets, and file uploads will be properly routed through your external proxy to the appropriate services on this server.