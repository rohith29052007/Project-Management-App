// ============================================
// API SERVICE - NOW USING SUPABASE ONLY
// This file imports and re-exports Supabase services
// All CRUD operations go directly to Supabase
// ============================================

import {
  workspaceService,
  projectService,
  taskService,
  teamService,
  profileService,
  realtimeService,
  analyticsService,
  activityService
} from './supabaseServices';

// Export all Supabase services
export {
  workspaceService,
  projectService,
  taskService,
  teamService,
  profileService,
  realtimeService,
  analyticsService,
  activityService
};

