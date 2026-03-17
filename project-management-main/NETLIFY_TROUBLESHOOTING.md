# Netlify Deployment Troubleshooting Guide

## Issue: "Page not found" on Netlify

### Step 1: Check Netlify Build Status
1. Go to https://app.netlify.com/
2. Find your site: **project-management-app90**
3. Check the Deploys tab
4. Look for the latest deploy with status:
   - 🟢 **Published** = Deployment completed (good!)
   - 🟡 **Building** = Still building (wait 2-5 min)
   - 🔴 **Failed** = Build failed (check build logs)

### Step 2: Check Build Logs (if needed)
Click on the failed/latest deploy → **Logs** tab:
- Look for errors in the build output
- Our last commit: `9e54a68` ("Fix: Update to Supabase services...")
- Expected to build successfully (local build works: 8.60s)

### Step 3: Clear Browser Cache & Reload
- **Hard Refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Or use Incognito**: Open in Incognito/Private window
- **Or clear cookies for the site**:
  1. Open DevTools (F12)
  2. Go to Application → Storage → Clear site data

### Step 4: Check Console for Errors
1. Go to your Netlify site URL
2. Open DevTools (F12)
3. Go to **Console** tab
4. Look for any JavaScript errors (red X)
5. Common issues:
   - `Cannot find module` errors
   - `Supabase URL not defined`
   - `CORS errors`

### Step 5: Verify Supabase Configuration
Check if these environment variables are set on Netlify:
- `VITE_SUPABASE_URL` = `https://mjjyqivnbteuvyhlobny.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = Your anon key

To set them on Netlify:
1. Go to Site settings → Build & deploy → Environment
2. Click "Edit variables"
3. Add the two Supabase variables
4. Redeploy the site

### Step 6: Force Manual Redeploy
1. Go to Netlify dashboard
2. Click your site
3. Click "Deploys" tab
4. Click the three dots (...) next to the latest deploy
5. Select "Redeploy"
6. Wait 2-5 minutes for rebuild

### Step 7: Check Netlify Logs
If still failing after redeploy:
1. Go to Functions logs (if applicable)
2. Go to Runtime logs
3. Look for any specific error messages

## Expected Behavior After Fix:
✅ Site should show Login page (not 404)
✅ You can sign up with email or OAuth (GitHub/Google)
✅ After login, Dashboard loads
✅ Can create workspaces, projects, tasks

## If Still Not Working:
Please provide:
1. Screenshot of the error
2. Browser console errors (F12 → Console tab)
3. Netlify build log (last 30 lines)
4. URL you're trying to access
