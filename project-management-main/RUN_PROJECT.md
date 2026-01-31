# 🚀 How to Run the Project Management Application

Complete step-by-step guide to get your application running.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** installed and running - [Download](https://www.postgresql.org/download/)
- ✅ **npm** (comes with Node.js)

## 🗄️ Step 1: Set Up Database

1. **Start PostgreSQL** (if not already running)

2. **Open PostgreSQL** (pgAdmin, psql, or your preferred tool)

3. **Create the database:**
   ```sql
   CREATE DATABASE project_management;
   ```

4. **Note your database credentials:**
   - Username (usually `postgres`)
   - Password
   - Host (usually `localhost`)
   - Port (usually `5432`)

## 🔧 Step 2: Configure Backend

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages including the new production-ready dependencies.

3. **Create `.env` file:**
   - Create a new file named `.env` in the `server/` directory
   - Add your database credentials:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/project_management?schema=public"
   DIRECT_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/project_management?schema=public"
   PORT=5000
   NODE_ENV=development
   ```
   **Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials.**

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```
   - When prompted, name your migration (e.g., `init`)
   - Press Enter to confirm

6. **(Optional) Seed database with sample data:**
   ```bash
   npm run prisma:seed
   ```
   This creates sample users, workspace, project, and tasks.

7. **Start the backend server:**
   ```bash
   npm run dev
   ```

   ✅ **Backend should now be running!** You should see:
   ```
   🚀 Server is running on port 5000
   📝 Environment: development
   🔗 Health check: http://localhost:5000/api/health
   ```

   **Keep this terminal open!** The backend needs to keep running.

## 🎨 Step 3: Configure Frontend

1. **Open a NEW terminal window** (keep backend running in the first terminal)

2. **Navigate to project root:**
   ```bash
   cd project-management-main
   ```
   (or just `cd ..` if you're in the server directory)

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create `.env` file:**
   - Create a new file named `.env` in the **root directory** (not in server/)
   - Add the following:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
   ```
   **Note:** The Clerk key can be a placeholder for development.

5. **Start the frontend server:**
   ```bash
   npm run dev
   ```

   ✅ **Frontend should now be running!** You should see:
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

## 🌐 Step 4: Access the Application

1. **Open your web browser**

2. **Navigate to:** `http://localhost:5173`

3. **You should see the Project Management dashboard!**

## ✅ Verify Everything is Working

1. **Check backend health:**
   - Open: `http://localhost:5000/api/health`
   - Should return: `{"success":true,"data":{"status":"ok",...}}`

2. **Check frontend:**
   - Should load the dashboard
   - Check browser console for any errors

3. **Test API connection:**
   - Try creating a workspace or project
   - Check if data persists (refresh page)

## 📝 Quick Command Reference

### Backend Commands (in `server/` directory)
```bash
npm install              # Install dependencies
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed sample data (optional)
npm run prisma:studio   # Open Prisma Studio (database GUI)
npm run dev             # Start development server
npm start               # Start production server
```

### Frontend Commands (in root directory)
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

## 🔍 Troubleshooting

### Backend Issues

**Error: Cannot connect to database**
- ✅ Check PostgreSQL is running
- ✅ Verify credentials in `server/.env`
- ✅ Test connection: `psql -U YOUR_USERNAME -d project_management`

**Error: Prisma Client not generated**
- ✅ Run: `npm run prisma:generate`

**Error: Port 5000 already in use**
- ✅ Change `PORT` in `server/.env` to a different port (e.g., 5001)
- ✅ Update `VITE_API_URL` in frontend `.env` to match

**Error: Module not found**
- ✅ Run: `npm install` again
- ✅ Check you're in the `server/` directory

### Frontend Issues

**Error: Cannot connect to API**
- ✅ Verify backend is running on port 5000
- ✅ Check `VITE_API_URL` in `.env` matches backend URL
- ✅ Check browser console for CORS errors

**Error: Environment variables not loading**
- ✅ Restart Vite dev server after changing `.env`
- ✅ Make sure `.env` is in root directory (not in `src/`)

**Error: Clerk authentication**
- ✅ The app works without Clerk configured
- ✅ Use placeholder key: `VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder`

### Database Issues

**Error: Migration failed**
- ✅ Make sure database exists: `CREATE DATABASE project_management;`
- ✅ Check database connection in `server/.env`
- ✅ Try: `npm run prisma:migrate reset` (⚠️ This deletes all data)

**Error: Seed script failed**
- ✅ Make sure migrations have run successfully
- ✅ Check database connection

## 🎯 What to Expect

### When Backend Starts:
```
🚀 Server is running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

### When Frontend Starts:
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### In Browser:
- Project Management dashboard
- If you ran seed script, you'll see sample data
- You can create workspaces, projects, and tasks

## 🚦 Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Both must be running simultaneously!

## 📚 Next Steps

- Create your first workspace
- Add projects and tasks
- Invite team members
- Explore all features!

## 🆘 Still Having Issues?

1. Check all prerequisites are installed
2. Verify database is running
3. Check `.env` files are configured correctly
4. Review error messages in terminal
5. Check browser console for frontend errors
6. See `QUICK_START.md` or `SETUP.md` for more details

---

**You're all set! Happy coding! 🎉**

