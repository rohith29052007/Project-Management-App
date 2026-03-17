# Supabase Integration - Quick Reference

## Your Credentials
```
Project URL: https://mjjyqivnbteuvyhlobny.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Getting Started (3 Steps)

### Step 1: Configure OAuth in Supabase Dashboard
```
1. Go to https://app.supabase.com/projects
2. Select your project
3. Authentication → Providers
4. Enable Google & GitHub
5. Add OAuth app credentials
6. Set redirect URLs
```

See `SUPABASE_SETUP.md` Part 2 for detailed steps.

### Step 2: Update Prisma Schema
Copy the schema from `SUPABASE_SETUP.md` Part 3 into `prisma/schema.prisma`

### Step 3: Run Migrations
```bash
cd server
npm run prisma:migrate
npm run prisma:seed
```

---

## 📁 File Map

### Authentication Files
| File | Purpose |
|------|---------|
| `src/services/supabase.js` | Supabase client & auth functions |
| `src/pages/Login.jsx` | Email & OAuth login |
| `src/pages/Register.jsx` | Email & OAuth signup |
| `src/pages/AuthCallback.jsx` | OAuth redirect handler |
| `src/App.jsx` | Session check & routing |

### Backend Auth
| File | Purpose |
|------|---------|
| `server/middleware/supabaseAuth.js` | JWT validation |
| `server/utils/supabase.js` | Token utilities |
| `server/server.js` | Updated with Supabase |

### Config
| File | Purpose |
|------|---------|
| `.env` | Frontend Supabase creds |
| `server/.env` | Backend Supabase creds |
| `.env.example` | Template |
| `server/.env.example` | Backend template |

---

## 🔑 Key Functions

### Frontend - Supabase Auth
```javascript
// Import
import { 
  signUp, 
  signIn, 
  signInWithOAuth, 
  getSession, 
  signOut,
  getAccessToken 
} from '@/services/supabase'

// Sign up
await signUp('email@example.com', 'password123', 'John Doe')

// Sign in
await signIn('email@example.com', 'password123')

// OAuth
await signInWithOAuth('google')  // or 'github'

// Get token for API
const token = await getAccessToken()

// Check session
const session = await getSession()

// Logout
await signOut()
```

### Backend - Token Validation
```javascript
// import
import { 
  authenticateSupabaseAny,
  authenticateSupabase 
} from '@/middleware/supabaseAuth'

// Use in routes
app.post('/api/tasks', authenticateSupabaseAny, (req, res) => {
  // req.user = { id, email }
  // req.token = JWT access token
})
```

---

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

### Backend (.env)
```env
SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:5173
```

---

## 🔄 Authentication Flow

### Email/Password
```
User enters email & password
→ signIn() calls Supabase
→ Supabase validates & returns session + access_token
→ supabase.js auto-saves to localStorage/sessionStorage
→ Frontend stores token
→ API calls include `Authorization: Bearer {token}`
→ Backend validates token with Supabase
→ Request proceeds
```

### Google/GitHub OAuth
```
User clicks "Google" button
→ signInWithOAuth('google') redirects to Google
→ User logs in with Google
→ Google redirects to http://localhost:5173/auth/callback
→ Supabase exchanges code for session
→ AuthCallback.jsx detects session
→ Redirects to dashboard
→ Same flow as email auth from here
```

---

## ✅ What Works Now

| Feature | Status |
|---------|--------|
| Email signup | ✅ Working |
| Email login | ✅ Working |
| Google OAuth | ⏳ Needs Supabase config |
| GitHub OAuth | ⏳ Needs Supabase config |
| Protected routes | ✅ Working |
| API token validation | ✅ Working |
| Token refresh | ✅ Automatic |
| Logout | ✅ Working |
| Session persistence | ✅ Working |

---

## 🧪 Testing Commands

```bash
# Register
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Get workspaces (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/workspaces

# Create workspace
curl -X POST http://localhost:5000/api/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Workspace"}'
```

---

## 🐛 Troubleshooting

### No token in requests?
```javascript
// Check if you're using getAccessToken()
const token = await getAccessToken()
console.log(token)  // Should print JWT

// Or check Supabase session
const session = await getSession()
console.log(session)  // Should have access_token
```

### 401 Unauthorized?
- Check token is being sent in `Authorization: Bearer TOKEN`
- Verify token is not expired: `isTokenExpired(token)`
- Check `SUPABASE_URL` is correct in backend `.env`

### OAuth not working?
- Verify redirect URLs in Supabase Dashboard
- Check provider (Google/GitHub) credentials
- See `SUPABASE_SETUP.md` Part 2

### User not found in database?
- User creation happens on first successful API call
- Check `server/utils/supabase.js` → `getOrCreateUserProfile()`

---

## 📚 Documentation

- **Setup Guide**: `SUPABASE_SETUP.md`
- **Implementation Summary**: `SUPABASE_IMPLEMENTATION.md`
- **This File**: `SUPABASE_QUICKREF.md`

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| https://app.supabase.com | Supabase Dashboard |
| https://supabase.com/docs/guides/auth | Auth documentation |
| https://supabase.com/docs/guides/auth/social-login | OAuth setup |
| `SUPABASE_SETUP.md` | Your setup checklist |

---

**Status**: ✅ 90% Complete - Just need Supabase OAuth config + database setup
