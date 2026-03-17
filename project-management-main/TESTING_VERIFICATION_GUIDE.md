# Supabase Setup Verification & Testing Guide

## ✅ Verification Checklist

### **1. Verify Tables Exist**
Go to Supabase → Table Editor and confirm you see:
- [ ] profiles
- [ ] workspaces
- [ ] projects
- [ ] tasks
- [ ] team_members
- [ ] activity_log
- [ ] invitations

### **2. Verify RLS is Enabled**
Go to Supabase → SQL Editor and run:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

You should see `rowsecurity = true` for all tables.

### **3. Verify Policies are Created**
Go to Supabase → Authentication → Policies

Check each table has policies (green checkmarks):
- [ ] profiles (3 policies)
- [ ] workspaces (4 policies)
- [ ] projects (4 policies)
- [ ] tasks (4 policies)
- [ ] team_members (2 policies)

---

## 🧪 Testing Your App

### **Test 1: Authentication**
1. Go to https://inspiring-lollipop-e6fb7b.netlify.app/
2. Click **"Sign up with Google"** or **"Sign up with GitHub"**
3. Complete the OAuth flow
4. ✅ Should see your profile in navbar

### **Test 2: Create Workspace**
1. After login, go to dashboard
2. Look for **"New Workspace"** or **"Create Workspace"** button
3. Fill in workspace name
4. ✅ Should be created and you redirected

### **Test 3: Create Project**
1. Inside workspace, find **"New Project"** button
2. Enter project name
3. ✅ Should appear in project list immediately

### **Test 4: Create Task**
1. In project, find **"New Task"** button
2. Enter task title
3. ✅ Should appear in task list

### **Test 5: Assign Task**
1. Click on a task
2. Try to assign it to yourself
3. ✅ Should update without page refresh

### **Test 6: Real-time Updates**
1. Open same project in **2 browser windows**
2. In Window 1: Create a new task
3. In Window 2: Watch for it to **appear instantly** (no refresh needed)
4. ✅ Real-time working!

---

## 🔐 Security Testing

### **Test 7: RLS - Can't See Others' Data**
1. Create a task in your project
2. Get another person to login
3. They should **NOT** see your task (unless added to workspace)
4. ✅ RLS working!

### **Test 8: Team Member Isolation**
1. Create workspace
2. Invite colleague via email
3. They can only see what's shared with them
4. ✅ Workspace isolation working!

---

## 📊 Database Monitoring

### **Check Query Performance**
1. Go to Supabase → Analytics
2. Look at query times
3. Tasks should return in **< 100ms**
4. Complex queries should be **< 500ms**

### **Monitor RLS Violations**
1. Go to Supabase → Logs
2. Look for "permission denied" errors
3. Should see none during normal operation
4. If you see errors, check RLS policies

---

## 🔧 Common Issues & Fixes

### **Issue: "Permission denied" errors**
**Solution:**
```sql
-- Check which policy is blocking
SELECT * FROM auth.uid(); -- Should return your UUID

-- Test query manually:
SELECT * FROM tasks;
-- If this fails, RLS policy needs adjustment
```

### **Issue: "No rows returned" but data exists**
**Solution:**
1. Verify you're a team member of the workspace
2. Check RLS policy logic
3. Example fix:
```sql
ALTER POLICY "Users can view tasks in their projects" 
ON tasks USING (true); -- Temporarily allow all (for testing only)
```

### **Issue: Data not saving**
**Solution:**
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check Supabase logs for database errors
4. Verify user has INSERT permission

### **Issue: Real-time not updating**
**Solution:**
1. Check browser console for connection errors
2. Verify Realtime is enabled: Supabase → Project Settings → Realtime
3. Try page refresh to reconnect
4. Check database hasn't reached connection limit

---

## 📝 Next Steps After Testing

### **If Everything Works:**
1. ✅ Your app is production-ready!
2. [x] Update custom domain (optional)
3. [x] Set up monitoring/analytics
4. [x] Create database backups

### **If You Find Issues:**
1. Check the Common Issues section above
2. Review RLS policies
3. Check Supabase logs for errors
4. Ask for help with specific error messages

---

## 💡 Performance Optimization

### **Database Indexes**
Supabase already created indexes for:
- ✅ projects.workspace_id
- ✅ tasks.project_id
- ✅ team_members.workspace_id
- ✅ tasks.created_by

These ensure queries stay fast!

### **Connection Pooling**
Supabase handles connection pooling automatically. You don't need to manage it.

### **Query Optimization**
Supabase provides query analysis in Analytics tab. Use it to find slow queries.

---

## 📞 Support Resources

**If you encounter issues:**
1. Check Supabase docs: https://supabase.com/docs
2. Check browser console for client errors
3. Check Supabase Logs for database errors
4. Enable verbose logging for debugging

---

## 🎯 Success Criteria

Your setup is successful when:
- ✅ Login with GitHub/Google works
- ✅ Can create workspaces
- ✅ Can create projects
- ✅ Can create tasks
- ✅ Real-time updates work (2 windows test)
- ✅ Can't see other user's private data
- ✅ No "Permission denied" errors in normal flow

If all checks pass, **you're production-ready!** 🚀

---

## 📋 Deployment Checklist

Before going fully live:
- [ ] All tests passing
- [ ] GitHub OAuth configured and working
- [ ] Google OAuth configured and working  
- [ ] Database backups enabled
- [ ] Monitor Supabase dashboard for usage
- [ ] Set up alerts for high database usage
- [ ] Documentation updated with screenshots

---

## 🎉 Final Notes

Your app now has:
- ✅ **Supabase Backend** - No server maintenance
- ✅ **Real-time Database** - Instant updates
- ✅ **Row Level Security** - Built-in access control
- ✅ **OAuth Integration** - GitHub & Google login
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **Free Tier** - No credit card (first 50k rows free!)

You're all set! Start testing and enjoy your production app! 🎊
