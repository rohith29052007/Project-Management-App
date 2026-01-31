# 🚀 Complete Setup Guide - GitHub-Like Project Management

Your project now has **GitHub-like authentication, API keys, and database storage**!

## ✨ What's New

### 🔐 Authentication System
- ✅ **Login/Register Pages** - Beautiful GitHub-inspired UI
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt password security
- ✅ **Protected Routes** - All routes require authentication
- ✅ **Auto-logout** - Token validation on each request

### 🔑 API Key Management
- ✅ **Generate API Keys** - Create personal access tokens
- ✅ **GitHub-like Format** - `pm_xxxxxxxxxxxxxxxx`
- ✅ **Key Management UI** - View, name, delete keys
- ✅ **Secure Storage** - Keys hashed in database
- ✅ **Last Used Tracking** - Monitor key usage

### 🗄️ Database Storage
- ✅ **User Authentication** - Passwords, usernames, profiles
- ✅ **API Key Storage** - Secure key management
- ✅ **All Data Persisted** - Workspaces, projects, tasks, comments

## 📋 Setup Steps

### Step 1: Update Database Schema

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
# Name migration: "add_auth_and_api_keys"
```

### Step 2: Install New Dependencies

```bash
cd server
npm install
```

This installs:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

### Step 3: Update Environment Variables

Add to `server/.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### Step 4: Seed Database (Optional)

```bash
npm run prisma:seed
```

This creates users with password: `password123`

### Step 5: Start Backend

```bash
npm run dev
```

### Step 6: Start Frontend

```bash
# In new terminal
cd ..
npm run dev
```

## 🎯 How to Use

### 1. Register a New Account
- Go to `/register`
- Fill in name, email, password
- Username is auto-generated (or provide your own)
- Click "Create account"

### 2. Login
- Go to `/login`
- Enter email and password
- You'll be redirected to dashboard

### 3. Create API Key
- Go to Settings → API Keys
- Enter a name for your key
- Click "Generate"
- **Copy the key immediately** - it won't be shown again!

### 4. Use API Key
```bash
# In headers
X-API-Key: pm_your_api_key_here

# Or in Authorization header
Authorization: Bearer pm_your_api_key_here
```

## 📡 API Authentication

### Using JWT Token (Browser)
```javascript
fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

### Using API Key (Programmatic)
```bash
curl -H "X-API-Key: pm_your_key_here" \
     http://localhost:5000/api/projects
```

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ API keys hashed in database
- ✅ Protected API endpoints
- ✅ Token validation on each request
- ✅ Auto-logout on invalid token

## 📝 Default Test Users

After seeding, you can login with:
- Email: `alexsmith@example.com` / Password: `password123`
- Email: `johnwarrel@example.com` / Password: `password123`
- Email: `oliverwatts@example.com` / Password: `password123`

## 🎨 Features

### User Profile
- Update name, bio, location, website
- GitHub-like username system
- Profile image support

### API Key Management
- Create multiple API keys
- Name your keys for organization
- View last used timestamp
- Delete keys when needed

### Protected Routes
- All app routes require login
- Auto-redirect to login if not authenticated
- Token refresh on each request

## 🚀 You're All Set!

Your project management application now has:
- ✅ Complete authentication system
- ✅ API key generation and management
- ✅ Secure database storage
- ✅ GitHub-like user experience
- ✅ Production-ready backend

**Start the servers and create your account!** 🎉

