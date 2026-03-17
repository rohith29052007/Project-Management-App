import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Middleware imports
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { securityHeaders, apiLimiter, requestSizeLimiter, authLimiter } from './middleware/security.js';
import { requestLogger } from './middleware/logger.js';
import { authenticateSupabase, authenticateSupabaseAny } from './middleware/supabaseAuth.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendError } from './utils/response.js';
import { generateUniqueSlug } from './utils/slugify.js';

// Route imports
import apiKeyRoutes from './routes/apiKeys.js';

// Validation imports
import {
    validateUser,
    validateWorkspace,
    validateProject,
    validateTask,
    validateComment
} from './middleware/validation.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== MIDDLEWARE ====================
app.use(securityHeaders);
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestSizeLimiter);
app.use(requestLogger);

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        auth: 'Supabase'
    }, 'Server is running');
});

// ==================== AUTHENTICATION ROUTES ====================
// Authentication is handled by Supabase on the frontend
// Backend only validates Supabase JWT tokens
// API Key routes for service-to-service communication
app.use('/api/api-keys', apiKeyRoutes);

// ==================== USER ROUTES ====================
// Public route - get user by username (GitHub-like)
app.get('/api/users/:username', asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.params.username },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            createdAt: true
        }
    });
    
    if (!user) {
        return sendError(res, 'User not found', 404);
    }
    
    sendSuccess(res, user);
}));

// Protected route - get all users (admin only in future)
app.get('/api/users', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            updatedAt: true
        }
    });
    sendSuccess(res, users);
}));

// Get user by ID (protected)
app.get('/api/users/id/:id', authenticateSupabaseAny, validateUser.getById, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            createdAt: true,
            workspaces: {
                include: { workspace: true }
            },
            projects: true,
            tasks: true
        }
    });
    
    if (!user) {
        return sendError(res, 'User not found', 404);
    }
    
    sendSuccess(res, user);
}));

// User creation is now handled by /api/auth/register
// This endpoint is removed - use registration instead

// ==================== WORKSPACE ROUTES ====================
// Protected - require authentication
app.get('/api/workspaces', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const workspaces = await prisma.workspace.findMany({
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            projects: {
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    tasks: {
                        include: {
                            assignee: {
                                select: { id: true, name: true, email: true }
                            },
                            comments: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true }
                                    }
                                },
                                orderBy: { createdAt: 'desc' },
                                take: 5 // Limit comments for performance
                            }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    sendSuccess(res, workspaces);
}));

app.get('/api/workspaces/:id', validateWorkspace.getById, asyncHandler(async (req, res) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: req.params.id },
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            projects: {
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    tasks: {
                        include: {
                            assignee: {
                                select: { id: true, name: true, email: true }
                            },
                            comments: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true }
                                    }
                                },
                                orderBy: { createdAt: 'desc' }
                            }
                        }
                    }
                }
            }
        }
    });
    
    if (!workspace) {
        return sendError(res, 'Workspace not found', 404);
    }
    
    sendSuccess(res, workspace);
}));

app.post('/api/workspaces', authenticateSupabaseAny, validateWorkspace.create, asyncHandler(async (req, res) => {
    const { name, description, ownerId, image_url, settings } = req.body;
    
    // Generate unique slug
    const slug = await generateUniqueSlug(prisma, name, 'workspace');
    
    // Verify owner exists
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
        return sendError(res, 'Owner not found', 404);
    }
    
    const workspace = await prisma.workspace.create({
        data: {
            name: name.trim(),
            slug,
            description: description?.trim() || null,
            ownerId,
            image_url: image_url || '',
            settings: settings || {},
            members: {
                create: {
                    userId: ownerId,
                    role: 'ADMIN'
                }
            }
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            projects: true
        }
    });
    
    sendCreated(res, workspace, 'Workspace created successfully');
}));

app.put('/api/workspaces/:id', authenticateSupabaseAny, validateWorkspace.update, asyncHandler(async (req, res) => {
    const { name, description, image_url, settings } = req.body;
    
    // Check if workspace exists
    const existing = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!existing) {
        return sendError(res, 'Workspace not found', 404);
    }
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (settings) updateData.settings = settings;
    
    const workspace = await prisma.workspace.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            projects: {
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    tasks: {
                        include: {
                            assignee: {
                                select: { id: true, name: true, email: true }
                            },
                            comments: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    sendSuccess(res, workspace, 'Workspace updated successfully');
}));

app.delete('/api/workspaces/:id', authenticateSupabaseAny, validateWorkspace.delete, asyncHandler(async (req, res) => {
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) {
        return sendError(res, 'Workspace not found', 404);
    }
    
    await prisma.workspace.delete({
        where: { id: req.params.id }
    });
    
    sendSuccess(res, null, 'Workspace deleted successfully');
}));

// ==================== WORKSPACE MEMBER ROUTES ====================
app.post('/api/workspaces/:workspaceId/members', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const { userId, role, message } = req.body;
    
    // Validate workspace exists
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.workspaceId } });
    if (!workspace) {
        return sendError(res, 'Workspace not found', 404);
    }
    
    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return sendError(res, 'User not found', 404);
    }
    
    const member = await prisma.workspaceMember.create({
        data: {
            userId,
            workspaceId: req.params.workspaceId,
            role: role || 'MEMBER',
            message: message || ''
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, image: true }
            }
        }
    });
    
    sendCreated(res, member, 'Member added successfully');
}));

app.delete('/api/workspaces/:workspaceId/members/:memberId', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const member = await prisma.workspaceMember.findUnique({ where: { id: req.params.memberId } });
    if (!member) {
        return sendError(res, 'Member not found', 404);
    }
    
    await prisma.workspaceMember.delete({
        where: { id: req.params.memberId }
    });
    
    sendSuccess(res, null, 'Member removed successfully');
}));

// ==================== PROJECT ROUTES ====================
app.get('/api/projects', authenticateSupabaseAny, validateProject.getAll, asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;
    const where = workspaceId ? { workspaceId } : {};
    
    const projects = await prisma.project.findMany({
        where,
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            workspace: {
                select: { id: true, name: true, slug: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            tasks: {
                include: {
                    assignee: {
                        select: { id: true, name: true, email: true }
                    },
                    comments: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        },
                        take: 3
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    sendSuccess(res, projects);
}));

app.get('/api/projects/:id', validateProject.getById, asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            workspace: {
                select: { id: true, name: true, slug: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            tasks: {
                include: {
                    assignee: {
                        select: { id: true, name: true, email: true, image: true }
                    },
                    comments: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, image: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });
    
    if (!project) {
        return sendError(res, 'Project not found', 404);
    }
    
    sendSuccess(res, project);
}));

app.post('/api/projects', authenticateSupabaseAny, validateProject.create, asyncHandler(async (req, res) => {
    const { name, description, priority, status, start_date, end_date, team_lead, workspaceId, progress, memberIds } = req.body;
    
    // Validate workspace exists
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
        return sendError(res, 'Workspace not found', 404);
    }
    
    // Validate team lead exists
    const lead = await prisma.user.findUnique({ where: { id: team_lead } });
    if (!lead) {
        return sendError(res, 'Team lead not found', 404);
    }
    
    // Validate member IDs if provided
    if (memberIds && memberIds.length > 0) {
        const members = await prisma.user.findMany({
            where: { id: { in: memberIds } }
        });
        if (members.length !== memberIds.length) {
            return sendError(res, 'One or more member IDs are invalid', 400);
        }
    }
    
    // Ensure team lead is in members
    const finalMemberIds = memberIds || [];
    if (!finalMemberIds.includes(team_lead)) {
        finalMemberIds.push(team_lead);
    }
    
    const project = await prisma.project.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null,
            priority: priority || 'MEDIUM',
            status: status || 'ACTIVE',
            start_date: start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            team_lead,
            workspaceId,
            progress: progress || 0,
            members: {
                create: finalMemberIds.map(userId => ({ userId }))
            }
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            workspace: {
                select: { id: true, name: true, slug: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            tasks: true
        }
    });
    
    sendCreated(res, project, 'Project created successfully');
}));

app.put('/api/projects/:id', authenticateSupabaseAny, validateProject.update, asyncHandler(async (req, res) => {
    const { name, description, priority, status, start_date, end_date, progress } = req.body;
    
    // Check if project exists
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) {
        return sendError(res, 'Project not found', 404);
    }
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);
    if (progress !== undefined) updateData.progress = Math.max(0, Math.min(100, progress));
    
    const project = await prisma.project.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
            owner: {
                select: { id: true, name: true, email: true, image: true }
            },
            workspace: {
                select: { id: true, name: true, slug: true }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                }
            },
            tasks: {
                include: {
                    assignee: {
                        select: { id: true, name: true, email: true }
                    },
                    comments: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                }
            }
        }
    });
    
    sendSuccess(res, project, 'Project updated successfully');
}));

app.delete('/api/projects/:id', authenticateSupabaseAny, validateProject.getById, asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
        return sendError(res, 'Project not found', 404);
    }
    
    await prisma.project.delete({
        where: { id: req.params.id }
    });
    
    sendSuccess(res, null, 'Project deleted successfully');
}));

// ==================== PROJECT MEMBER ROUTES ====================
app.post('/api/projects/:projectId/members', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const { userId } = req.body;
    
    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) {
        return sendError(res, 'Project not found', 404);
    }
    
    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return sendError(res, 'User not found', 404);
    }
    
    const member = await prisma.projectMember.create({
        data: {
            userId,
            projectId: req.params.projectId
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, image: true }
            }
        }
    });
    
    sendCreated(res, member, 'Member added successfully');
}));

app.delete('/api/projects/:projectId/members/:memberId', authenticateSupabaseAny, asyncHandler(async (req, res) => {
    const member = await prisma.projectMember.findUnique({ where: { id: req.params.memberId } });
    if (!member) {
        return sendError(res, 'Member not found', 404);
    }
    
    await prisma.projectMember.delete({
        where: { id: req.params.memberId }
    });
    
    sendSuccess(res, null, 'Member removed successfully');
}));

// ==================== TASK ROUTES ====================
app.get('/api/tasks', authenticateSupabaseAny, validateTask.getAll, asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    const where = projectId ? { projectId } : {};
    
    const tasks = await prisma.task.findMany({
        where,
        include: {
            project: {
                select: { id: true, name: true, workspaceId: true }
            },
            assignee: {
                select: { id: true, name: true, email: true, image: true }
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    sendSuccess(res, tasks);
}));

app.get('/api/tasks/:id', validateTask.getById, asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: {
            project: {
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                }
            },
            assignee: {
                select: { id: true, name: true, email: true, image: true }
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    
    if (!task) {
        return sendError(res, 'Task not found', 404);
    }
    
    sendSuccess(res, task);
}));

app.post('/api/tasks', authenticateSupabaseAny, validateTask.create, asyncHandler(async (req, res) => {
    const { projectId, title, description, status, type, priority, assigneeId, due_date } = req.body;
    
    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        return sendError(res, 'Project not found', 404);
    }
    
    // Validate assignee exists
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!assignee) {
        return sendError(res, 'Assignee not found', 404);
    }
    
    // Validate due date is in the future (optional check)
    const dueDate = new Date(due_date);
    if (dueDate < new Date()) {
        return sendError(res, 'Due date cannot be in the past', 400);
    }
    
    const task = await prisma.task.create({
        data: {
            projectId,
            title: title.trim(),
            description: description?.trim() || null,
            status: status || 'TODO',
            type: type || 'TASK',
            priority: priority || 'MEDIUM',
            assigneeId,
            due_date: dueDate
        },
        include: {
            project: {
                select: { id: true, name: true }
            },
            assignee: {
                select: { id: true, name: true, email: true, image: true }
            },
            comments: true
        }
    });
    
    sendCreated(res, task, 'Task created successfully');
}));

app.put('/api/tasks/:id', authenticateSupabaseAny, validateTask.update, asyncHandler(async (req, res) => {
    const { title, description, status, type, priority, assigneeId, due_date } = req.body;
    
    // Check if task exists
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) {
        return sendError(res, 'Task not found', 404);
    }
    
    // Validate assignee if provided
    if (assigneeId) {
        const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
        if (!assignee) {
            return sendError(res, 'Assignee not found', 404);
        }
    }
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status) updateData.status = status;
    if (type) updateData.type = type;
    if (priority) updateData.priority = priority;
    if (assigneeId) updateData.assigneeId = assigneeId;
    if (due_date) {
        const dueDate = new Date(due_date);
        if (dueDate < new Date()) {
            return sendError(res, 'Due date cannot be in the past', 400);
        }
        updateData.due_date = dueDate;
    }
    
    const task = await prisma.task.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
            project: {
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    }
                }
            },
            assignee: {
                select: { id: true, name: true, email: true, image: true }
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    
    sendSuccess(res, task, 'Task updated successfully');
}));

app.delete('/api/tasks/:id', authenticateSupabaseAny, validateTask.getById, asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) {
        return sendError(res, 'Task not found', 404);
    }
    
    await prisma.task.delete({
        where: { id: req.params.id }
    });
    
    sendSuccess(res, null, 'Task deleted successfully');
}));

// ==================== COMMENT ROUTES ====================
app.get('/api/tasks/:taskId/comments', authenticateSupabaseAny, validateComment.getByTaskId, asyncHandler(async (req, res) => {
    // Validate task exists
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) {
        return sendError(res, 'Task not found', 404);
    }
    
    const comments = await prisma.comment.findMany({
        where: { taskId: req.params.taskId },
        include: {
            user: {
                select: { id: true, name: true, email: true, image: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    sendSuccess(res, comments);
}));

app.post('/api/tasks/:taskId/comments', authenticateSupabaseAny, validateComment.create, asyncHandler(async (req, res) => {
    const { content, userId } = req.body;
    
    // Validate task exists
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) {
        return sendError(res, 'Task not found', 404);
    }
    
    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return sendError(res, 'User not found', 404);
    }
    
    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            userId,
            taskId: req.params.taskId
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, image: true }
            }
        }
    });
    
    sendCreated(res, comment, 'Comment created successfully');
}));

app.delete('/api/comments/:id', authenticateSupabaseAny, validateComment.delete, asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) {
        return sendError(res, 'Comment not found', 404);
    }
    
    await prisma.comment.delete({
        where: { id: req.params.id }
    });
    
    sendSuccess(res, null, 'Comment deleted successfully');
}));

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== SERVER START ====================
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(async () => {
        console.log('HTTP server closed');
        
        await prisma.$disconnect();
        console.log('Database connection closed');
        
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});
