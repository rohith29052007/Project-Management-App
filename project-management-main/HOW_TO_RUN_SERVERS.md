# 🚀 How to Run Backend and Frontend Servers

Complete guide to run both servers for your GitHub-like project management application.

## 📋 Prerequisites

- ✅ Node.js installed
- ✅ PostgreSQL running
- ✅ Database created: `project_management`

## 🔧 Step 1: Database Setup

1. **Create database** (if not done):
```sql
CREATE DATABASE project_management;
```

2. **Update `server/.env`** with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## 🖥️ Step 2: Run Backend Server

### Open Terminal 1 (Backend)

```bash
# Navigate to server directory
cd server

# Install dependencies (if not done)
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
# Name migration: "add_auth_and_api_keys"

# (Optional) Seed database
npm run prisma:seed

# Start backend server
npm run dev
```

✅ **Backend should be running at:** `http://localhost:5000`

You should see:
```
🚀 Server is running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

**Keep this terminal open!** Backend must keep running.

## 🎨 Step 3: Run Frontend Server

### Open Terminal 2 (Frontend) - NEW TERMINAL WINDOW

```bash
# Navigate to project root (if you're in server/, go back)
cd ..

# Or if starting fresh:
cd project-management-main

# Install dependencies (if not done)
npm install

# Create .env file in root directory (if not exists)
# Add this content:
# VITE_API_URL=http://localhost:5000/api
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder

# Start frontend server
npm run dev
```

✅ **Frontend should be running at:** `http://localhost:5173`

You should see:
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 🌐 Step 4: Access Application

1. **Open browser**
2. **Go to:** `http://localhost:5173`
3. **You'll see login page** (since authentication is required)
4. **Click "Create account"** or use existing credentials

## 📝 Quick Command Reference

### Backend (Terminal 1)
```bash
cd server
npm install              # First time only
npm run prisma:generate # First time only
npm run prisma:migrate  # First time only
npm run dev             # Start server
```

### Frontend (Terminal 2)
```bash
cd project-management-main  # Or just cd .. from server
npm install                 # First time only
npm run dev                 # Start server
```

## 🔍 Verify Everything Works

### Test Backend
1. Open: `http://localhost:5000/api/health`
2. Should return: `{"success":true,"data":{"status":"ok",...}}`

### Test Frontend
1. Open: `http://localhost:5173`
2. Should show login page
3. Register a new account
4. Login and access dashboard

## ⚠️ Common Issues

### Backend won't start
- ✅ Check PostgreSQL is running
- ✅ Verify `.env` file has correct DATABASE_URL
- ✅ Run `npm run prisma:generate` again
- ✅ Check port 5000 is not in use

### Frontend can't connect
- ✅ Verify backend is running on port 5000
- ✅ Check `VITE_API_URL` in `.env` matches backend
- ✅ Check browser console for errors

### Database errors
- ✅ Run migrations: `npm run prisma:migrate`
- ✅ Check database exists and credentials are correct

## 🎯 What You'll See

### After Backend Starts:
```
🚀 Server is running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

### After Frontend Starts:
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### In Browser:
- Login/Register page
- After login: Dashboard with projects
- Settings page for API keys

## 🚦 Both Servers Must Run!

**Remember:** You need **TWO terminal windows**:
- **Terminal 1:** Backend server (port 5000)
- **Terminal 2:** Frontend server (port 5173)

Both must be running simultaneously for the app to work!

## 📚 Next Steps

1. Register your account
2. Create a workspace
3. Add projects and tasks
4. Generate API keys in Settings
5. Use API keys for programmatic access

---

**You're all set! Both servers should now be running!** 🎉

