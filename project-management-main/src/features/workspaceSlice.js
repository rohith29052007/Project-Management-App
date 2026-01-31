import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { workspaceAPI, projectAPI, taskAPI, commentAPI } from "../services/api";

// Async thunks
export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchWorkspaces',
    async () => {
        const workspaces = await workspaceAPI.getAll();
        return workspaces;
    }
);

export const fetchWorkspaceById = createAsyncThunk(
    'workspace/fetchWorkspaceById',
    async (id) => {
        const workspace = await workspaceAPI.getById(id);
        return workspace;
    }
);

export const createWorkspace = createAsyncThunk(
    'workspace/createWorkspace',
    async (workspaceData) => {
        const workspace = await workspaceAPI.create(workspaceData);
        return workspace;
    }
);

export const updateWorkspace = createAsyncThunk(
    'workspace/updateWorkspace',
    async ({ id, data }) => {
        const workspace = await workspaceAPI.update(id, data);
        return workspace;
    }
);

export const createProject = createAsyncThunk(
    'workspace/createProject',
    async (projectData) => {
        const project = await projectAPI.create(projectData);
        return project;
    }
);

export const updateProject = createAsyncThunk(
    'workspace/updateProject',
    async ({ id, data }) => {
        const project = await projectAPI.update(id, data);
        return project;
    }
);

export const deleteProject = createAsyncThunk(
    'workspace/deleteProject',
    async (id) => {
        await projectAPI.delete(id);
        return id;
    }
);

export const createTask = createAsyncThunk(
    'workspace/createTask',
    async (taskData) => {
        const task = await taskAPI.create(taskData);
        return task;
    }
);

export const updateTask = createAsyncThunk(
    'workspace/updateTask',
    async ({ id, data }) => {
        const task = await taskAPI.update(id, data);
        return task;
    }
);

export const deleteTask = createAsyncThunk(
    'workspace/deleteTask',
    async (id) => {
        await taskAPI.delete(id);
        return id;
    }
);

export const createComment = createAsyncThunk(
    'workspace/createComment',
    async ({ taskId, data }) => {
        const comment = await commentAPI.create(taskId, data);
        return comment;
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            const workspaceId = action.payload;
            localStorage.setItem("currentWorkspaceId", workspaceId);
            const workspace = state.workspaces.find((w) => w.id === workspaceId);
            if (workspace) {
                state.currentWorkspace = workspace;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch workspaces
        builder
            .addCase(fetchWorkspaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;
                // Set current workspace from localStorage or first workspace
                const savedId = localStorage.getItem("currentWorkspaceId");
                const workspace = action.payload.find((w) => w.id === savedId) || action.payload[0];
                if (workspace) {
                    state.currentWorkspace = workspace;
                }
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch workspace by ID
            .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
                const workspace = action.payload;
            state.workspaces = state.workspaces.map((w) =>
                    w.id === workspace.id ? workspace : w
                );
                if (state.currentWorkspace?.id === workspace.id) {
                    state.currentWorkspace = workspace;
                }
            })
            // Create workspace
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.workspaces.push(action.payload);
                state.currentWorkspace = action.payload;
                localStorage.setItem("currentWorkspaceId", action.payload.id);
            })
            // Update workspace
            .addCase(updateWorkspace.fulfilled, (state, action) => {
                const workspace = action.payload;
                state.workspaces = state.workspaces.map((w) =>
                    w.id === workspace.id ? workspace : w
                );
                if (state.currentWorkspace?.id === workspace.id) {
                    state.currentWorkspace = workspace;
                }
            })
            // Create project
            .addCase(createProject.fulfilled, (state, action) => {
                const project = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects.push(project);
            state.workspaces = state.workspaces.map((w) =>
                        w.id === state.currentWorkspace.id
                            ? { ...w, projects: [...w.projects, project] }
                            : w
            );
                }
            })
            // Update project
            .addCase(updateProject.fulfilled, (state, action) => {
                const project = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                        p.id === project.id ? project : p
                    );
            state.workspaces = state.workspaces.map((w) =>
                        w.id === state.currentWorkspace.id
                            ? {
                                  ...w,
                                  projects: w.projects.map((p) =>
                                      p.id === project.id ? project : p
                                  ),
                              }
                            : w
                    );
                }
            })
            // Delete project
            .addCase(deleteProject.fulfilled, (state, action) => {
                const projectId = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.filter(
                        (p) => p.id !== projectId
                    );
                    state.workspaces = state.workspaces.map((w) =>
                        w.id === state.currentWorkspace.id
                            ? {
                                  ...w,
                                  projects: w.projects.filter((p) => p.id !== projectId),
                              }
                            : w
            );
                }
            })
            // Create task
            .addCase(createTask.fulfilled, (state, action) => {
                const task = action.payload;
                if (state.currentWorkspace) {
                    const project = state.currentWorkspace.projects.find(
                        (p) => p.id === task.projectId
                    );
                    if (project) {
                        project.tasks.push(task);
                        state.workspaces = state.workspaces.map((w) =>
                            w.id === state.currentWorkspace.id
                                ? {
                                      ...w,
                                      projects: w.projects.map((p) =>
                                          p.id === task.projectId
                                              ? { ...p, tasks: [...p.tasks, task] }
                                              : p
                                      ),
                                  }
                                : w
                        );
                    }
                }
            })
            // Update task
            .addCase(updateTask.fulfilled, (state, action) => {
                const task = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                        p.id === task.projectId
                            ? {
                                  ...p,
                                  tasks: p.tasks.map((t) => (t.id === task.id ? task : t)),
                              }
                            : p
                    );
            state.workspaces = state.workspaces.map((w) =>
                        w.id === state.currentWorkspace.id
                            ? {
                                  ...w,
                                  projects: w.projects.map((p) =>
                                      p.id === task.projectId
                                          ? {
                                                ...p,
                                                tasks: p.tasks.map((t) =>
                                                    t.id === task.id ? task : t
                                                ),
                                            }
                                          : p
                                  ),
                              }
                            : w
            );
                }
            })
            // Delete task
            .addCase(deleteTask.fulfilled, (state, action) => {
                const taskId = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
                        ...p,
                        tasks: p.tasks.filter((t) => t.id !== taskId),
                    }));
            state.workspaces = state.workspaces.map((w) =>
                        w.id === state.currentWorkspace.id
                            ? {
                                  ...w,
                                  projects: w.projects.map((p) => ({
                                      ...p,
                                      tasks: p.tasks.filter((t) => t.id !== taskId),
                                  })),
                              }
                            : w
            );
    }
            })
            // Create comment
            .addCase(createComment.fulfilled, (state, action) => {
                const comment = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
                        ...p,
                        tasks: p.tasks.map((t) =>
                            t.id === comment.taskId
                                ? { ...t, comments: [...(t.comments || []), comment] }
                                : t
                        ),
                    }));
                }
            });
    },
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;