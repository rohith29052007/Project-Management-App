-- ============================================
-- RECREATE TASKS TABLE WITH CORRECT SCHEMA
-- Option 2: Clean slate with all columns
-- ============================================

-- Step 1: Drop the old tasks table (if it exists)
DROP TABLE IF EXISTS tasks CASCADE;

-- Step 2: Recreate tasks table with correct schema
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date DATE,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- NOW RUN THE RLS POLICIES
-- Copy from SUPABASE_RLS_SETUP.md
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS Policies
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
