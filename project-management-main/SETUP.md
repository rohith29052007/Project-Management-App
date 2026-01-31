# Complete Setup Guide

This guide will help you set up both the frontend and backend for the Project Management application.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or cloud)
- npm or yarn package manager
- Git

## Step 1: Database Setup

1. Install PostgreSQL if you haven't already
2. Create a new database:
```sql
CREATE DATABASE project_management;
```

3. Note down your database connection details:
   - Host: (usually `localhost`)
   - Port: (usually `5432`)
   - Database name: `project_management`
   - Username: (your PostgreSQL username)
   - Password: (your PostgreSQL password)

## Step 2: Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the `server` directory
   - Add your database connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
   PORT=5000
   ```
   Replace `username` and `password` with your actual PostgreSQL credentials.

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```
   When prompted, name your migration (e.g., "init").

6. (Optional) Seed the database with sample data:
```bash
npm run prisma:seed
```
   This creates sample users, workspaces, projects, and tasks to help you get started.

6. (Optional) Seed the database with initial data:
   You can use Prisma Studio to add initial data:
```bash
npm run prisma:studio
```
   This opens a web interface at `http://localhost:5555` where you can add users, workspaces, etc.

7. Start the backend server:
```bash
npm run dev
```

   Or use the convenience script (Windows):
```bash
start-dev.bat
```

   Or use the convenience script (Linux/Mac):
```bash
chmod +x start-dev.sh
./start-dev.sh
```

The backend should now be running on `http://localhost:5000`. You can test it by visiting `http://localhost:5000/api/health`.

## Step 3: Frontend Setup

1. Navigate back to the root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```
   - If you're using Clerk for authentication, add your publishable key
   - If not using Clerk, you may need to modify the authentication logic

4. Start the frontend development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`.

## Step 4: Verify Setup

1. Open your browser and navigate to `http://localhost:5173`
2. The application should load (you may need to sign in if using Clerk)
3. Check the browser console for any errors
4. Try creating a workspace or project to verify the backend connection

## Troubleshooting

### Backend Issues

- **Database connection errors**: Double-check your `.env` file credentials
- **Prisma errors**: Make sure you've run `prisma:generate` and `prisma:migrate`
- **Port already in use**: Change the PORT in `.env` to a different value

### Frontend Issues

- **API connection errors**: Ensure the backend is running and `VITE_API_URL` is correct
- **CORS errors**: The backend should handle CORS, but if issues persist, check the server.js CORS configuration
- **Environment variables not loading**: Restart the Vite dev server after changing `.env`

### Database Issues

- **Migration errors**: Make sure your database is empty or drop existing tables
- **Schema errors**: Check that your Prisma schema matches the database structure

## Next Steps

1. Add initial data using Prisma Studio or API calls
2. Customize the application to your needs
3. Set up authentication (if using Clerk)
4. Deploy to production (see deployment guides for your chosen platform)

## API Documentation

See `server/README.md` for detailed API endpoint documentation.

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure both servers are running
4. Check that the database is accessible and migrations have run successfully

