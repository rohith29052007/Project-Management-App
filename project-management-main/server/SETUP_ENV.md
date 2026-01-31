# ⚠️ IMPORTANT: Setup Your .env File

The error you're seeing means the `.env` file is missing or incomplete.

## 🔧 Quick Fix

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create `.env` file** (or edit if exists)

3. **Add these variables:**
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/project_management?schema=public"
   DIRECT_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/project_management?schema=public"
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

4. **Replace placeholders:**
   - `YOUR_USERNAME` → Your PostgreSQL username (usually `postgres`)
   - `YOUR_PASSWORD` → Your PostgreSQL password
   - `JWT_SECRET` → A long random string (for production, use a strong secret)

## 📝 Example .env File

If your PostgreSQL username is `postgres` and password is `mypassword`:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/project_management?schema=public"
DIRECT_URL="postgresql://postgres:mypassword@localhost:5432/project_management?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRES_IN=7d
```

## ✅ After Creating .env

1. **Restart the backend server:**
   ```bash
   npm run dev
   ```

2. **The error should be gone!**

## 🔍 Verify Database Connection

Test your connection:
```bash
psql -U YOUR_USERNAME -d project_management
```

If this works, your credentials are correct!

---

**The `.env` file has been created with default values. Update the DATABASE_URL with your actual PostgreSQL credentials!**

