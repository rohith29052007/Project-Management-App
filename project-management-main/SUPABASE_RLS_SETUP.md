# Supabase Row Level Security (RLS) Setup Guide

## What is RLS?
Row Level Security ensures users can only access their own data. It's enforced at the database level (most secure).

## Setup Instructions

### **Step 1: Enable RLS on All Tables**

In Supabase SQL Editor, run this:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
```

---

### **Step 2: Create Policies for Each Table**

#### **Profiles Table**
```sql
-- Users can view any profile (for team page)
CREATE POLICY "Public profiles are visible to authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

#### **Workspaces Table**
```sql
-- Users can see workspaces they own or are team members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.workspace_id = workspaces.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Only workspace owner can update
CREATE POLICY "Only owner can update workspace"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only workspace owner can delete
CREATE POLICY "Only owner can delete workspace"
  ON workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Users can create workspaces
CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);
```

#### **Projects Table**
```sql
-- Users can see projects in their workspaces
CREATE POLICY "Users can view projects in their workspace"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.workspace_id = projects.workspace_id
      AND team_members.user_id = auth.uid()
    ) OR
    auth.uid() = owner_id
  );

-- Users can update projects in their workspace
CREATE POLICY "Users can update projects in their workspace"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.workspace_id = projects.workspace_id
      AND team_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.workspace_id = projects.workspace_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can delete own projects
CREATE POLICY "Owner can delete project"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Users can create projects in their workspace
CREATE POLICY "Users can create projects in their workspace"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.workspace_id = projects.workspace_id
      AND team_members.user_id = auth.uid()
    )
  );
```

#### **Tasks Table**
```sql
-- Users can see tasks in projects they have access to
CREATE POLICY "Users can view tasks in their projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.workspace_id = (
        SELECT workspace_id FROM projects WHERE id = p.id
      )
      WHERE p.id = tasks.project_id
      AND tm.user_id = auth.uid()
    )
  );

-- Users can update tasks in their projects
CREATE POLICY "Users can update tasks in their projects"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.workspace_id = (
        SELECT workspace_id FROM projects WHERE id = p.id
      )
      WHERE p.id = tasks.project_id
      AND tm.user_id = auth.uid()
    )
  );

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks in their projects"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.workspace_id = (
        SELECT workspace_id FROM projects WHERE id = p.id
      )
      WHERE p.id = tasks.project_id
      AND tm.user_id = auth.uid()
    )
  );

-- Users can delete own tasks
CREATE POLICY "User can delete own task"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
```

#### **Team Members Table**
```sql
-- Users can see team members in their workspaces
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.workspace_id = team_members.workspace_id
      AND tm.user_id = auth.uid()
    )
  );

-- Only admins/owners can add team members
CREATE POLICY "Admins can manage team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.workspace_id = team_members.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );
```

---

### **Step 3: Test the Setup**

1. Go to Supabase → Authentication → Policies
2. For each table, you should see your policies listed
3. Test that queries work from your frontend

---

## Troubleshooting

**"Permission denied" errors?**
- Make sure RLS is enabled on the table
- Check that the policy matches your user's auth.uid()
- Verify the policy logic

**"No rows returned" when data exists?**
- The RLS policy is correctly restricting access
- Check if user has permission in the policy
- Try testing with `SELECT *` to see if rows are visible

---

## Security Levels

- **Profiles**: Visible to all authenticated users (for team collaboration)
- **Workspaces**: Only visible to team members
- **Projects**: Only visible to workspace members
- **Tasks**: Only visible to project team members
- **Team Members**: Only visible within their workspace
