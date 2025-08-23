# Nginx Proxy Manager - Cache Fix Configuration

Add this to your **Advanced** tab (in addition to your existing API configuration):

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

# Fix cache control for development
location / {
    proxy_pass http://192.168.1.216:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Disable caching for development
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

## Alternative: If above doesn't work, try this minimal version:

```nginx
# Handle API requests to backend  
location /api/ {
    proxy_pass http://192.168.1.216:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;

    proxy_buffering off;
    proxy_request_buffering off;
    client_max_body_size 100M;
}

# Ensure proper mime types
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://192.168.1.216:3000;
    proxy_set_header Host $host;
    expires 1y;
    add_header Cache-Control "public";
}
```