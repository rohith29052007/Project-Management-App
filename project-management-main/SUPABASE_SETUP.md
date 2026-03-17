# Supabase Integration Setup Guide

## Overview
Your project is now integrated with Supabase for authentication. This guide will help you complete the setup.

## 1. Supabase Project Configuration

### Already Done:
✅ Frontend `.env` file created with Supabase credentials
✅ Backend `.env` file created with Supabase credentials
✅ Supabase authentication pages (Login/Register) implemented
✅ Backend middleware updated to validate Supabase JWT tokens
✅ API client updated to use Supabase tokens

### Still TODO:

## 2. Configure OAuth Providers in Supabase Dashboard

### Step 1: Enable OAuth Providers
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **mjjyqivnbteuvyhlobny**
3. Navigate to: **Authentication → Providers**
4. Enable the following:
   - ✅ **Email** (already enabled by default)
   - [ ] **Google**
   - [ ] **GitHub**

### Step 2: Configure Google OAuth

1. In Supabase Dashboard → **Authentication → Providers → Google**
2. Click "Enable Google"
3. Copy your **Supabase Project URL** and **API Key** here if needed
4. In Google Cloud Console:
   - Create OAuth credentials (if not done)
   - Add redirect URI: `https://mjjyqivnbteuvyhlobny.supabase.co/auth/v1/callback`
   - Add frontend URL: `http://localhost:5173` (dev) or `https://yourdomain.com` (prod)
5. Paste Google Client ID and Client Secret into Supabase

### Step 3: Configure GitHub OAuth

1. In Supabase Dashboard → **Authentication → Providers → GitHub**
2. Click "Enable GitHub"
3. In GitHub Settings:
   - Go to Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - **Authorization callback URL**: `https://mjjyqivnbteuvyhlobny.supabase.co/auth/v1/callback`
4. Paste Client ID and Client Secret into Supabase

### Step 4: Configure Redirect URLs

1. In Supabase Dashboard → **Authentication → URL Configuration**
2. Set these Redirect URLs:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/login
   ```
3. For production:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/login
   ```

## 3. Database Schema Setup

Since you chose "Use Supabase auth only", your Prisma schema needs to be updated to use Supabase user IDs.

### Update your Prisma schema:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id // Supabase user ID
  email     String    @unique
  name      String?
  image     String?
  bio       String?
  location  String?
  website   String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  workspaces    WorkspaceMember[]
  projects      ProjectMember[]
  tasks         TaskAssignee[]
  comments      Comment[]
}

model Workspace {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  ownerId     String
  image_url   String?
  settings    Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  members WorkspaceMember[]
  projects Project[]
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  userId      String
  workspaceId String
  role        String    @default("MEMBER")
  message     String?
  createdAt   DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  priority    String    @default("MEDIUM")
  status      String    @default("ACTIVE")
  ownerId     String
  workspaceId String
  progress    Int       @default(0)
  start_date  DateTime?
  end_date    DateTime?
  team_lead   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  owner     User             @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  workspace Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members   ProjectMember[]
  tasks     Task[]

  @@index([workspaceId])
}

model ProjectMember {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  projectId   String
  assigneeId  String
  status      String    @default("TODO")
  type        String    @default("TASK")
  priority    String    @default("MEDIUM")
  due_date    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project  Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User           @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@index([projectId])
  @@index([assigneeId])
}

model TaskAssignee {
  id     String @id @default(cuid())
  userId String

  user User @relation("TaskAssignee", fields: [userId], references: [id], onDelete: Cascade)
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task User @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([userId])
}

model ApiKey {
  id        String    @id @default(cuid())
  userId    String
  name      String
  key       String    @unique
  keyPrefix String
  expiresAt DateTime?
  lastUsed  DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Wait, there's an issue with the schema - let me rewrite it:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id // Supabase user ID
  email     String   @unique
  name      String?
  image     String?
  bio       String?
  location  String?
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  workspaceMembers WorkspaceMember[]
  projectMembers   ProjectMember[]
  tasks            Task[]
  comments         Comment[]
  apiKeys          ApiKey[]
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  ownerId     String
  image_url   String?
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  members  WorkspaceMember[]
  projects Project[]
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  role        String   @default("MEMBER")
  message     String?
  createdAt   DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([workspaceId])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  priority    String   @default("MEDIUM")
  status      String   @default("ACTIVE")
  ownerId     String
  workspaceId String
  progress    Int      @default(0)
  start_date  DateTime?
  end_date    DateTime?
  team_lead   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  workspace Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members   ProjectMember[]
  tasks     Task[]

  @@index([workspaceId])
}

model ProjectMember {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([projectId])
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  projectId   String
  assigneeId  String
  status      String    @default("TODO")
  type        String    @default("TASK")
  priority    String    @default("MEDIUM")
  due_date    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  project  Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User      @relation(fields: [assigneeId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@index([projectId])
  @@index([assigneeId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([userId])
}

model ApiKey {
  id        String    @id @default(cuid())
  userId    String
  name      String
  key       String    @unique
  keyPrefix String
  expiresAt DateTime?
  lastUsed  DateTime?
  createdAt DateTime  @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

## 4. Update Database Connection

1. Create a PostgreSQL database (use Supabase's built-in database)
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management
   ```
3. Or use Supabase's managed database:
   - In Supabase Dashboard → **Settings → Database**
   - Copy the connection string
   - Update `DATABASE_URL` in `.env`

## 5. Initialize Database

Run these commands:

```bash
# Generate Prisma client
npm run prisma:generate

# Create/migrate database schema
npm run prisma:migrate

# Seed with sample data (optional)
npm run prisma:seed
```

## 6. Frontend OAuth Callback Setup

The OAuth callback page is already created at `/auth/callback` in your frontend routing.

## 7. Testing the Setup

### Test Email/Password Authentication:
1. Start your frontend: `npm run dev`
2. Go to `http://localhost:5173/register`
3. Create an account with email and password
4. Check Supabase Dashboard → **Authentication → Users** to see the new user
5. Login with the credentials

### Test OAuth (Google):
1. Make sure Google OAuth is configured in Supabase
2. Click "Google" button on login page
3. You'll be redirected to Google login
4. After successful login, you'll be redirected back to your app

### Test Backend API:
```bash
# 1. Get your access token from browser localStorage after login
# It's automatically stored by Supabase

# 2. Test an API endpoint:
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5000/api/workspaces
```

## 8. Environment Variables Checklist

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@localhost:5432/db

CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 9. Troubleshooting

### "Invalid API credentials"
- Verify SUPABASE_URL and ANON_KEY are correct
- Check Supabase Dashboard → Settings → API to copy correct values

### OAuth redirect not working
- Ensure redirect URLs are registered in Supabase Dashboard
- Check browser console for error messages
- Verify OAuth provider (Google/GitHub) credentials are correct

### Database connection failing
- Ensure DATABASE_URL is correct
- Check PostgreSQL server is running
- Verify database exists

### Token validation failing
- Ensure SUPABASE_URL is correct in backend .env
- Check that Supabase session is properly stored on frontend

## 10. Next Steps

1. ✅ Update Prisma schema with correct relationships
2. ✅ Run database migrations
3. ✅ Configure OAuth providers in Supabase
4. ✅ Test authentication flow (email, Google, GitHub)
5. ✅ Add user profile completion after OAuth signup
6. ✅ Implement role-based access control (RBAC) with Supabase Row-Level Security (RLS)
7. ✅ Add password reset functionality
8. ✅ Deploy to production with proper environment variables

## Useful Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Your Supabase Project](https://app.supabase.com/projects)
