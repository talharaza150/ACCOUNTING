# Raza Accounting Portal - Project Documentation

## Project Overview
A modern web portal for Raza Accounting that provides clients with secure access to their accounting files and documents, along with a comprehensive admin panel for user and file management.

## Application Architecture

### Technology Stack
- **Frontend**: Vue.js 3 with Composition API, Tailwind CSS v3
- **Backend**: Next.js 15 API routes
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system with organized structure
- **Reverse Proxy**: Nginx
- **Mobile**: Capacitor for iOS/Android conversion
- **Styling**: Tailwind CSS v3 with forms plugin
- **Build Tool**: Vite for frontend development
- **Domain**: site.dachicorp.com

## Core Features

### 1. Authentication System
- **Admin Access**: 
  - Username: admin
  - Password: admin@1000
  - Full system access and user management
- **Client Access**: 
  - Created by admin only
  - Secure login with assigned credentials
- **Registration Requests**: 
  - Public request form for account creation
  - Admin approval required

### 2. Admin Panel Features
- **User Management**
  - Create, edit, delete client accounts
  - Assign permissions and roles
  - View user activity logs
- **Account Requests**
  - View pending registration requests
  - Approve/reject requests with one-click
  - Send account credentials to approved users
- **File Management**
  - Upload files for specific clients
  - Organize files by categories
  - Set file permissions and access levels
- **System Settings**
  - Configure portal settings
  - Manage file categories
  - System monitoring and logs

### 3. Client Dashboard Features
- **File Access**
  - View assigned documents and files
  - Download files securely
  - Search and filter files
- **Account Information**
  - View account details
  - Change password
  - Contact information updates
- **Notifications**
  - New file notifications
  - System announcements
  - Account updates

### 4. File Management System
- **File Categories**
  - Tax Documents
  - Financial Statements
  - Receipts and Invoices
  - Legal Documents
  - Bank Statements
  - Custom Categories
- **Security Features**
  - Role-based access control
  - File encryption at rest
  - Audit trails for file access
  - Secure file uploads

## Database Schema

### Users Table
```sql
users (
  id: UUID PRIMARY KEY,
  username: VARCHAR(50) UNIQUE,
  email: VARCHAR(100) UNIQUE,
  password_hash: VARCHAR(255),
  role: ENUM('admin', 'client'),
  first_name: VARCHAR(50),
  last_name: VARCHAR(50),
  phone: VARCHAR(20),
  company_name: VARCHAR(100),
  is_active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  last_login: TIMESTAMP
)
```

### Account Requests Table
```sql
account_requests (
  id: UUID PRIMARY KEY,
  first_name: VARCHAR(50),
  last_name: VARCHAR(50),
  email: VARCHAR(100),
  phone: VARCHAR(20),
  company_name: VARCHAR(100),
  business_type: VARCHAR(50),
  message: TEXT,
  status: ENUM('pending', 'approved', 'rejected'),
  created_at: TIMESTAMP,
  processed_at: TIMESTAMP,
  processed_by: UUID REFERENCES users(id)
)
```

### File Categories Table
```sql
file_categories (
  id: UUID PRIMARY KEY,
  name: VARCHAR(100),
  description: TEXT,
  icon: VARCHAR(50),
  created_at: TIMESTAMP
)
```

### Files Table
```sql
files (
  id: UUID PRIMARY KEY,
  filename: VARCHAR(255),
  original_name: VARCHAR(255),
  file_path: VARCHAR(500),
  file_size: BIGINT,
  mime_type: VARCHAR(100),
  category_id: UUID REFERENCES file_categories(id),
  uploaded_by: UUID REFERENCES users(id),
  assigned_to: UUID REFERENCES users(id),
  description: TEXT,
  is_active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

### File Access Logs Table
```sql
file_access_logs (
  id: UUID PRIMARY KEY,
  file_id: UUID REFERENCES files(id),
  user_id: UUID REFERENCES users(id),
  action: ENUM('view', 'download', 'upload', 'delete'),
  ip_address: INET,
  user_agent: TEXT,
  created_at: TIMESTAMP
)
```

### Sessions Table
```sql
sessions (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  token: VARCHAR(255),
  expires_at: TIMESTAMP,
  created_at: TIMESTAMP,
  ip_address: INET,
  user_agent: TEXT
)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/change-password` - Change password

### Account Requests
- `POST /api/account-requests` - Submit registration request
- `GET /api/admin/account-requests` - Get all requests (admin)
- `PUT /api/admin/account-requests/:id/approve` - Approve request
- `PUT /api/admin/account-requests/:id/reject` - Reject request

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### File Management
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id/download` - Download file
- `DELETE /api/admin/files/:id` - Delete file (admin)
- `GET /api/admin/files` - Get all files (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/admin/categories` - Create category (admin)
- `PUT /api/admin/categories/:id` - Update category (admin)

## Security Considerations
- JWT tokens with short expiration times
- Password hashing using bcrypt
- File access logging and monitoring
- Role-based access control
- Input validation and sanitization
- HTTPS enforcement
- Rate limiting on API endpoints
- File type validation and scanning

## Mobile App Considerations (Capacitor)
- Responsive design for mobile screens
- Touch-friendly interface elements
- Offline capability for downloaded files
- Push notifications for new files
- Biometric authentication support
- File caching strategies

## Deployment Configuration
- Nginx configuration for reverse proxy
- SSL certificate setup
- Environment variables management
- Database connection pooling
- File storage organization
- Backup and recovery procedures

## Development Phases
1. **Phase 1**: Basic authentication and user management ✅
2. **Phase 2**: File upload and management system ✅
3. **Phase 3**: Admin panel and account requests ✅
4. **Phase 4**: Client dashboard and UI polish ✅
5. **Phase 5**: Security hardening and testing ✅
6. **Phase 6**: Mobile app preparation and deployment ✅

## Technical Notes

### Frontend Styling
- **Tailwind CSS v3**: Configured for production use
- **Forms Plugin**: Enhanced form styling with @tailwindcss/forms
- **ES Module Configuration**: PostCSS and Tailwind configs use ES modules
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **Development Server**: Runs on http://localhost:3000 with Vite

### Known Issues Resolved
- **Tailwind CSS v4 Compatibility**: Downgraded to stable v3.4.0 for production reliability
- **Module System**: Converted configuration files from CommonJS to ES modules
- **PostCSS Configuration**: Fixed ES module compatibility issues

### Development Environment
```bash
# Start development servers
cd /root/portal2
./start-development.sh

# Frontend development (port 3000)
cd frontend && npm run dev

# Backend API (port 3001) 
cd backend && npm run dev
```