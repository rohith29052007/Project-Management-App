# OAuth Setup Guide (Google & GitHub)

This guide helps you configure OAuth providers for the project management application.

## Prerequisites Completed ✅

- ✅ OAuth redirect route (`/auth/callback`) has been added
- ✅ AuthCallback component properly handles OAuth redirects
- ✅ Supabase is configured to detect OAuth sessions from URL

## Required Configuration

### 1. Supabase Dashboard Configuration

Go to https://app.supabase.com and select your project.

#### Add Google OAuth:

1. Navigate to **Authentication** → **Providers**
2. Find and click on **Google**
3. Toggle **Enable** to ON
4. Enter your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
5. Click **Save**

#### Add GitHub OAuth:

1. Navigate to **Authentication** → **Providers**
2. Find and click on **GitHub**
3. Toggle **Enable** to ON
4. Enter your GitHub OAuth credentials:
   - **Client ID**: Get from GitHub Settings
   - **Client Secret**: Get from GitHub Settings
5. Click **Save**

### 2. Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID** → **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (Development)
   - `https://yourdomain.com/auth/callback` (Production)
   - `https://mjjyqivnbteuvyhlobny.supabase.co/auth/v1/callback` (Supabase)
6. Copy **Client ID** and **Client Secret** to Supabase

### 3. GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in the following:
   - **Application name**: Project Management App
   - **Homepage URL**: `http://localhost:5173` (Development)
   - **Authorization callback URL**: `https://mjjyqivnbteuvyhlobny.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** to Supabase

### 4. Environment Variables

Ensure your `.env` files have:

**Frontend (.env)**:
```
VITE_SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:5173
```

**Backend (server/.env)**:
```
SUPABASE_URL=https://mjjyqivnbteuvyhlobny.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

## Testing OAuth

1. Start the application: `npm run dev` (frontend) and `cd server && npm run dev` (backend)
2. Go to http://localhost:5173/login
3. Click the Google or GitHub button
4. Sign in with your credentials
5. You should be redirected to `/auth/callback` then to the dashboard

## Troubleshooting

### Issue: OAuth button redirects but doesn't authenticate

**Solution**: 
- Check if providers are enabled in Supabase dashboard
- Verify redirect URIs are correctly registered in OAuth app settings
- Check browser console for errors (F12 → Console tab)
- Ensure VITE_SUPABASE_URL and VITE_APP_URL are correct

### Issue: "Redirect URI mismatch" error

**Solution**:
- Add the exact redirect URL to your OAuth app settings
- The URL must match exactly (protocol, domain, port, path)
- For development: `http://localhost:5173/auth/callback`
- For production: `https://yourdomain.com/auth/callback`

### Issue: Session not persisting after OAuth

**Solution**:
- Check localStorage in browser DevTools (F12 → Application → Storage)
- Look for `sb-project-auth` entry
- If missing, OAuth provider isn't configured correctly

## Code Changes Made

1. ✅ Added `/auth/callback` route in App.jsx
2. ✅ Updated AuthCallback.jsx to properly handle OAuth redirects
3. ✅ Supabase client configured with `detectSessionInUrl: true`

After OAuth providers are configured in Supabase, the authentication should work immediately!
