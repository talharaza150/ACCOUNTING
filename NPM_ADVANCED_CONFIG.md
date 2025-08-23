# 🛠️ Nginx Proxy Manager Advanced Configuration for Raza Accounting Portal

## ✅ Fixed Configuration for site.dachicorp.com

### Advanced Settings for Proxy Host

Add this configuration to the **Advanced** tab of your proxy host in Nginx Proxy Manager:

```nginx
# Handle API requests
location /api/ {
    proxy_pass http://192.168.1.216:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Handle static assets with proper caching
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://192.168.1.216:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Enable caching for static assets
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;
    
    # Add cache headers
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Main proxy configuration
location / {
    proxy_pass http://192.168.1.216:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Disable caching for development
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📝 Instructions

1. In Nginx Proxy Manager, go to your proxy host for `site.dachicorp.com`
2. Click on the **Edit** button
3. Go to the **Advanced** tab
4. Replace the existing configuration with the one above
5. Click **Save**

## 🔧 Additional Troubleshooting

If you're still experiencing issues:

1. **Restart the development servers**:
   ```bash
   cd /root/portal2
   ./start-development.sh
   ```

2. **Clear browser cache** or try in an incognito/private window

3. **Check browser developer tools**:
   - Open DevTools (F12)
   - Check the Network tab for failed CSS/JS requests
   - Look at the Console tab for any errors

This configuration ensures that:
- API requests are properly routed to the backend (port 3001)
- Static assets (CSS, JS, images) are correctly served
- WebSocket connections work properly for development features