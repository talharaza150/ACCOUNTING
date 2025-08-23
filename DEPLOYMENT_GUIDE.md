# Raza Accounting Portal - Deployment Guide

## Quick Start

### 1. Start Development Environment
```bash
cd /root/portal2
./start-development.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3001/api

### 3. Default Admin Credentials
- **Username**: admin
- **Password**: admin@1000

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │───▶│   Vue.js App    │───▶│   Next.js API   │
│  Port 80/443    │    │   Port 3000     │    │   Port 3001     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         └──────────────────────────────────────────────┼──────────┐
                                                        │          │
                                              ┌─────────▼────┐   ┌─▼─────────┐
                                              │ PostgreSQL   │   │   File    │
                                              │   Database   │   │  Storage  │
                                              └──────────────┘   └───────────┘
```

## Features Implemented

### ✅ Core Features
- [x] User authentication with JWT
- [x] Role-based access control (Admin/Client)
- [x] Account request system
- [x] File upload and management
- [x] Admin panel with user management
- [x] Client dashboard with file access
- [x] PostgreSQL database with full schema
- [x] Nginx reverse proxy configuration
- [x] Mobile-ready design with Tailwind CSS v3
- [x] Capacitor configuration for mobile apps
- [x] Responsive UI with modern styling

### ✅ Security Features
- [x] Password hashing with bcrypt
- [x] JWT token authentication
- [x] File access logging
- [x] Role-based file access
- [x] Input validation
- [x] CORS protection
- [x] Security headers via Nginx

### ✅ Admin Panel Features
- [x] View all account requests
- [x] Approve/reject account requests
- [x] Create users manually
- [x] View all users
- [x] Upload files for clients
- [x] View all files in system

### ✅ Client Dashboard Features
- [x] View assigned files
- [x] Download files securely
- [x] Search and filter files
- [x] File categorization
- [x] Modern responsive UI with Tailwind CSS
- [x] Mobile-optimized interface
- [x] Professional styling and layout

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `account_requests` - Account creation requests
- `files` - File metadata and storage info
- `file_categories` - File organization categories
- `file_access_logs` - Audit trail for file access
- `sessions` - JWT session management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Account Requests
- `POST /api/account-requests` - Submit account request
- `GET /api/admin/account-requests` - Get all requests (admin)
- `PUT /api/admin/account-requests/:id/approve` - Approve request
- `PUT /api/admin/account-requests/:id/reject` - Reject request

### User Management
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/users` - Create user (admin)

### File Management
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload file (admin)
- `GET /api/files/:id/download` - Download file
- `GET /api/categories` - Get file categories

## Production Deployment

### 1. Environment Variables
Create production environment files:

**Backend (.env.production):**
```env
DATABASE_URL=postgresql://raza_user:secure_password@localhost:5432/raza_accounting
JWT_SECRET=your_super_secure_jwt_secret_key
UPLOAD_DIR=/var/www/uploads
FRONTEND_URL=https://site.dachicorp.com
BACKEND_URL=https://site.dachicorp.com/api
NODE_ENV=production
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://site.dachicorp.com/api
```

### 2. Build Applications
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### 3. SSL Configuration
Update the Nginx configuration to enable HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name site.dachicorp.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Rest of configuration...
}

server {
    listen 80;
    server_name site.dachicorp.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Process Management
Use PM2 for production process management:

```bash
npm install -g pm2

# Start backend
pm2 start npm --name "raza-backend" -- run start:prod

# Start frontend (if not using static build)
pm2 start npm --name "raza-frontend" -- run preview

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Database Backups
Set up automated database backups:

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U raza_user raza_accounting > /backups/raza_accounting_$DATE.sql

# Add to crontab for daily backups
0 2 * * * /path/to/backup_script.sh
```

## Mobile App Deployment

### 1. Install Capacitor Dependencies
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Build and Deploy
```bash
npm run build
npx cap sync
npx cap open android  # For Android
npx cap open ios      # For iOS (macOS only)
```

See `mobile-setup.md` for detailed mobile deployment instructions.

## Monitoring and Maintenance

### 1. Log Files
- Nginx: `/var/log/nginx/raza-accounting-*.log`
- Application: Check PM2 logs with `pm2 logs`
- Database: PostgreSQL logs in `/var/log/postgresql/`

### 2. Health Checks
Monitor these endpoints:
- Frontend: `GET /`
- Backend: `GET /api/health` (if implemented)
- Database: Connection status

### 3. Regular Maintenance
- Update dependencies monthly
- Monitor disk space for file uploads
- Review access logs for security
- Backup database regularly
- Update SSL certificates before expiry

## Troubleshooting

### Common Issues
1. **Database Connection**: Check PostgreSQL service and credentials
2. **File Upload Issues**: Check disk permissions and space
3. **Nginx Errors**: Verify configuration with `nginx -t`
4. **JWT Errors**: Check JWT secret configuration
5. **CORS Issues**: Verify frontend/backend URL configuration

### Reset Admin Password
```sql
-- Connect to database
psql -U raza_user -d raza_accounting

-- Update admin password (password: admin@1000)
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6sC3s3Sj6e' WHERE username = 'admin';
```

## Support and Documentation

- **Project Documentation**: `PROJECT_DOCUMENTATION.md`
- **Database Schema**: `database/schema.sql`
- **Mobile Setup**: `mobile-setup.md`
- **API Documentation**: Available at backend endpoints

## Security Best Practices

1. Change default admin password immediately
2. Use strong JWT secrets
3. Enable HTTPS in production
4. Regular security updates
5. Monitor access logs
6. Implement rate limiting
7. Regular database backups
8. File type validation
9. Input sanitization
10. Regular security audits

---

**Note**: This is a production-ready accounting portal with modern security features. Ensure all security best practices are followed when deploying to production.