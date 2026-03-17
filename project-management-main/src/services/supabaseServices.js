/**
 * Supabase Service Functions - Complete Backend
 * Replaces all Node.js API calls
 */

import { supabase } from './supabase';

// ============================================
// WORKSPACE FUNCTIONS
// ============================================

export const workspaceService = {
  // Get all workspaces for current user
  async getWorkspaces() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`owner_id.eq.${user.id},team_members.user_id.eq.${user.id}`, { foreignTable: 'team_members' })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single workspace with full details
  async getWorkspace(workspaceId) {
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        team_members(id, user_id, role, profiles(name, image, username)),
        projects(id, name, slug)
      `)
      .eq('id', workspaceId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new workspace
  async createWorkspace(name, description = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name,
        description,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as team member
    await supabase
      .from('team_members')
      .insert({ workspace_id: data.id, user_id: user.id, role: 'owner' });

    return data;
  },

  // Update workspace
  async updateWorkspace(workspaceId, updates) {
    const { data, error } = await supabase
      .from('workspaces')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', workspaceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete workspace
  async deleteWorkspace(workspaceId) {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) throw error;
  }
};

// ============================================
// PROJECT FUNCTIONS
// ============================================

export const projectService = {
  // Get all projects in workspace
  async getProjects(workspaceId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:owner_id(name, image),
        tasks(id, title, status, priority)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single project
  async getProject(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:owner_id(name, image, username),
        tasks(
          id, title, description, status, priority,
          assigned_to(name, image),
          created_by(name)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create project
  async createProject(workspaceId, projectData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: workspaceId,
        owner_id: user.id,
        ...projectData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update project
  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete project
  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }
};

// ============================================
// TASK FUNCTIONS
// ============================================

export const taskService = {
  // Get tasks for project
  async getTasks(projectId, filters = {}) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to(name, image, username),
        created_by(name, image)
      `)
      .eq('project_id', projectId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single task
  async getTask(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to(name, image, email),
        created_by(name, image),
        project:project_id(name)
      `)
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create task
  async createTask(projectId, taskData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        created_by: user.id,
        ...taskData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update task
  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete task
  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Get tasks assigned to user
  async getMyTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:project_id(name, workspace_id),
        assigned_to(name, image)
      `)
      .eq('assigned_to', user.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }
};

// ============================================
// TEAM MEMBER FUNCTIONS
// ============================================

export const teamService = {
  // Get team members
  async getTeamMembers(workspaceId) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles(name, image, email, username)
      `)
      .eq('workspace_id', workspaceId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add team member
  async addTeamMember(workspaceId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({ workspace_id: workspaceId, user_id: userId, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update team member role
  async updateTeamMemberRole(workspaceId, userId, role) {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .match({ workspace_id: workspaceId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove team member
  async removeTeamMember(workspaceId, userId) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .match({ workspace_id: workspaceId, user_id: userId });

    if (error) throw error;
  },

  // Send invitation
  async sendInvitation(workspaceId, email, role = 'member') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const token = Math.random().toString(36).substring(2, 15);
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        workspace_id: workspaceId,
        email,
        role,
        invited_by: user.id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const profileService = {
  // Get current user profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get user profile by ID
  async getProfileById(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, ...updates })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }
      throw error;
    }
    return data;
  }
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const realtimeService = {
  // Subscribe to project changes
  subscribeToProject(projectId, callback) {
    return supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Subscribe to task changes
  subscribeToTasks(projectId, callback) {
    return supabase
      .channel(`tasks:${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Subscribe to team changes
  subscribeToTeamMembers(workspaceId, callback) {
    return supabase
      .channel(`team:${workspaceId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'team_members', filter: `workspace_id=eq.${workspaceId}` },
        callback
      )
      .subscribe();
  },

  // Unsubscribe
  unsubscribe(channel) {
    return supabase.removeChannel(channel);
  }
};

// ============================================
// ACTIVITY LOG
// ============================================

export const activityService = {
  // Get activity log
  async getActivityLog(workspaceId, limit = 50) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:user_id(name, image)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Log activity
  async logActivity(workspaceId, projectId, taskId, action, entityType, changes = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('activity_log')
      .insert({
        workspace_id: workspaceId,
        project_id: projectId,
        task_id: taskId,
        user_id: user.id,
        action,
        entity_type: entityType,
        changes
      });
  }
};

// ============================================
// ANALYTICS
// ============================================

export const analyticsService = {
  // Get project statistics
  async getProjectStats(projectId) {
    const tasks = await supabase
      .from('tasks')
      .select('status, priority')
      .eq('project_id', projectId);

    if (tasks.error) throw tasks.error;

    const stats = {
      total: tasks.data.length,
      todo: tasks.data.filter(t => t.status === 'todo').length,
      in_progress: tasks.data.filter(t => t.status === 'in_progress').length,
      done: tasks.data.filter(t => t.status === 'done').length,
      high_priority: tasks.data.filter(t => t.priority === 'high').length
    };

    return stats;
  },

  // Get workspace statistics
  async getWorkspaceStats(workspaceId) {
    const projects = await supabase
      .from('projects')
      .select('id')
      .eq('workspace_id', workspaceId);

    const team = await supabase
      .from('team_members')
      .select('id')
      .eq('workspace_id', workspaceId);

    const tasks = await supabase
      .from('tasks')
      .select('status')
      .in('project_id', projects.data?.map(p => p.id) || []);

    if (projects.error) throw projects.error;

    return {
      total_projects: projects.data?.length || 0,
      team_members: team.data?.length || 0,
      total_tasks: tasks.data?.length || 0,
      completed_tasks: tasks.data?.filter(t => t.status === 'done').length || 0
    };
  }
}
