# Production Port Configuration

## Raza Accounting Portal - Production Setup

This document defines the official production ports for the Raza Accounting Portal application.

### Port Assignments

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend (Vue.js) | 3000 | http://localhost:3000 | Main application interface |
| Backend (Next.js API) | 3001 | http://localhost:3001 | API server |
| PostgreSQL Database | 5432 | localhost:5432 | Database server |

### Environment Configuration

#### Backend (.env.local)
```
DATABASE_URL=postgresql://raza_user:raza_password123@localhost:5432/raza_accounting
JWT_SECRET=raza_accounting_jwt_secret_key_2024_secure
UPLOAD_DIR=/root/portal2/uploads
FRONTEND_URL=https://site.dachicorp.com
BACKEND_URL=https://site.dachicorp.com/api
PORT=3001
```

#### Frontend (.env)
```
VITE_API_BASE_URL=https://site.dachicorp.com/api
```

### Production Startup Commands

1. **Stop all services first:**
   ```bash
   # Kill any processes on our ports
   lsof -ti:3000,3001,5432 | xargs -r kill -9
   
   # Stop any npm/node processes
   pkill -f "npm run"
   pkill -f "next dev"
   pkill -f "vite"
   ```

2. **Start PostgreSQL:**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Start Backend (from /root/portal2/backend):**
   ```bash
   cd /root/portal2/backend
   npm run build
   npm start
   ```

4. **Start Frontend (from /root/portal2/frontend):**
   ```bash
   cd /root/portal2/frontend  
   npm run build
   npm run preview
   ```

### Production Verification

- Frontend accessible at: https://site.dachicorp.com (port 3000)
- Backend API accessible at: https://site.dachicorp.com/api (port 3001)
- Database accessible at: localhost:5432

### Troubleshooting

If authentication fails:
1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Test database connection: `PGPASSWORD=raza_password123 psql -h localhost -U raza_user -d raza_accounting -c "SELECT 1;"`
3. Check backend logs for JWT/auth errors
4. Ensure ports 3000 and 3001 are not blocked by firewall

### Notes

- This is a dedicated production machine for Raza Accounting Portal only
- All services should run on their designated ports consistently  
- No port conflicts should occur with this configuration
- Frontend always on port 3000, Backend always on port 3001
- Domain access maintained through https://site.dachicorp.com