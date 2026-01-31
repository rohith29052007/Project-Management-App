# Project Management Backend Server

This is the backend server for the Project Management application, built with Express.js and Prisma.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

**New dependencies include:**
- `express-validator` - Input validation
- `helmet` - Security headers
- `morgan` - HTTP request logging
- `express-rate-limit` - Rate limiting

### 2. Configure Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE project_management;
```

2. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
PORT=5000
```

### 3. Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate
```

### 4. (Optional) Seed the Database

To populate the database with sample data:

```bash
npm run prisma:seed
```

This will create:
- 3 sample users
- 1 workspace with members
- 1 project with tasks

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create a new workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Projects
- `GET /api/projects` - Get all projects (optional query: `?workspaceId=xxx`)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (optional query: `?projectId=xxx`)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/tasks/:taskId/comments` - Get comments for a task
- `POST /api/tasks/:taskId/comments` - Create a new comment
- `DELETE /api/comments/:id` - Delete comment

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:
- User
- Workspace
- WorkspaceMember
- Project
- ProjectMember
- Task
- Comment

## Development

### Prisma Studio

To view and edit your database using Prisma Studio:

```bash
npm run prisma:studio
```

This will open a web interface at `http://localhost:5555` where you can interact with your database.

### Environment Variables

Make sure to set up your `.env` file with the correct database connection string and other configuration.

