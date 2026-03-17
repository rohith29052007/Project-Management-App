import { getAccessToken } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await getAccessToken(); // Get Supabase token
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 - unauthorized
            if (response.status === 401) {
                // Supabase handles token refresh automatically
                window.location.href = '/login';
            }
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// User API
export const userAPI = {
    getAll: () => apiRequest('/users'),
    getById: (id) => apiRequest(`/users/${id}`),
    create: (userData) => apiRequest('/users', { method: 'POST', body: userData }),
};

// Workspace API
export const workspaceAPI = {
    getAll: () => apiRequest('/workspaces'),
    getById: (id) => apiRequest(`/workspaces/${id}`),
    create: (workspaceData) => apiRequest('/workspaces', { method: 'POST', body: workspaceData }),
    update: (id, workspaceData) => apiRequest(`/workspaces/${id}`, { method: 'PUT', body: workspaceData }),
    delete: (id) => apiRequest(`/workspaces/${id}`, { method: 'DELETE' }),
    addMember: (workspaceId, memberData) => apiRequest(`/workspaces/${workspaceId}/members`, { method: 'POST', body: memberData }),
    removeMember: (workspaceId, memberId) => apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, { method: 'DELETE' }),
};

// Project API
export const projectAPI = {
    getAll: (workspaceId) => apiRequest(`/projects${workspaceId ? `?workspaceId=${workspaceId}` : ''}`),
    getById: (id) => apiRequest(`/projects/${id}`),
    create: (projectData) => apiRequest('/projects', { method: 'POST', body: projectData }),
    update: (id, projectData) => apiRequest(`/projects/${id}`, { method: 'PUT', body: projectData }),
    delete: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
    addMember: (projectId, memberData) => apiRequest(`/projects/${projectId}/members`, { method: 'POST', body: memberData }),
    removeMember: (projectId, memberId) => apiRequest(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
};

// Task API
export const taskAPI = {
    getAll: (projectId) => apiRequest(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
    getById: (id) => apiRequest(`/tasks/${id}`),
    create: (taskData) => apiRequest('/tasks', { method: 'POST', body: taskData }),
    update: (id, taskData) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: taskData }),
    delete: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};

// Comment API
export const commentAPI = {
    getByTaskId: (taskId) => apiRequest(`/tasks/${taskId}/comments`),
    create: (taskId, commentData) => apiRequest(`/tasks/${taskId}/comments`, { method: 'POST', body: commentData }),
    delete: (id) => apiRequest(`/comments/${id}`, { method: 'DELETE' }),
};

