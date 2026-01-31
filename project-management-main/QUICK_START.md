# Quick Start Guide

Get your Project Management application up and running in 5 minutes!

## Prerequisites Check

- ✅ Node.js (v18+) installed
- ✅ PostgreSQL installed and running
- ✅ Database created: `project_management`

## Step-by-Step Setup

### 1. Database Setup (2 minutes)

```sql
-- In PostgreSQL, create the database
CREATE DATABASE project_management;
```

### 2. Backend Setup (2 minutes)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure database (edit .env file)
# Update DATABASE_URL with your PostgreSQL credentials

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npm run prisma:seed

# Start backend
npm run dev
```

Backend should be running at `http://localhost:5000` ✅

### 3. Frontend Setup (1 minute)

```bash
# In a new terminal, navigate to project root
cd ..

# Install dependencies
npm install

# Configure environment (create .env file)
# VITE_API_URL=http://localhost:5000/api
# VITE_CLERK_PUBLISHABLE_KEY=your_key_here

# Start frontend
npm run dev
```

Frontend should be running at `http://localhost:5173` ✅

## Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the project management dashboard
3. If you ran the seed script, you'll see sample data
4. Try creating a new project or task to test the API

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file has correct DATABASE_URL
- Run `npm run prisma:generate` again

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep project_management`
- Verify credentials in `server/.env`

## Next Steps

- Read `SETUP.md` for detailed setup instructions
- Check `server/README.md` for API documentation
- Customize the application for your needs!

## One-Command Start (After Initial Setup)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

This starts both frontend and backend servers automatically.

