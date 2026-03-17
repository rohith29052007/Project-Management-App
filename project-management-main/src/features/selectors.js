import { createSelector } from 'reselect';

// Base selectors
const selectWorkspaceState = (state) => state.workspace;

// Memoized workspace selectors
export const selectWorkspaces = createSelector(
    [selectWorkspaceState],
    (workspace) => workspace.workspaces
);

export const selectCurrentWorkspace = createSelector(
    [selectWorkspaceState],
    (workspace) => workspace.currentWorkspace
);

export const selectProjects = createSelector(
    [selectCurrentWorkspace],
    (currentWorkspace) => currentWorkspace?.projects || []
);

export const selectWorkspaceWithCurrentWorkspace = createSelector(
    [selectWorkspaceState],
    (workspace) => ({
        workspaces: workspace.workspaces,
        currentWorkspace: workspace.currentWorkspace
    })
);

export const selectTheme = createSelector(
    (state) => state.theme,
    (theme) => theme.theme
);
