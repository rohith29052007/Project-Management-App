# Fix: Module Not Found Error

## ✅ Solution Applied

The error occurred because new dependencies weren't installed. This has been fixed!

## 📋 Next Steps

### 1. Run Database Migrations (IMPORTANT!)

Since we updated the database schema, you need to run migrations:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

When prompted:
- Migration name: `add_auth_and_api_keys`
- Press Enter to confirm

### 2. Update Environment Variables

Make sure your `server/.env` file has:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. Start the Server

```bash
npm run dev
```

The server should now start successfully! 🎉

## 🔍 If You Still Get Errors

1. **Check node_modules exists:**
   ```bash
   ls node_modules/jsonwebtoken
   ls node_modules/bcryptjs
   ```

2. **Reinstall if needed:**
   ```bash
   npm install
   ```

3. **Check Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Verify database connection:**
   - Make sure PostgreSQL is running
   - Check `.env` file has correct credentials

## ✅ What Was Installed

- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- All other dependencies from package.json

---

**The server should now run without errors!**

