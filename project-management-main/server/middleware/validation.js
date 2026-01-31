import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Validation result handler
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new AppError(errorMessages, 400);
    }
    next();
};

/**
 * User validation rules
 */
export const validateUser = {
    create: [
        body('id').notEmpty().withMessage('User ID is required'),
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('image').optional().isURL().withMessage('Image must be a valid URL'),
        validate
    ],
    getById: [
        param('id').notEmpty().withMessage('User ID is required'),
        validate
    ]
};

/**
 * Workspace validation rules
 */
export const validateWorkspace = {
    create: [
        body('name').trim().notEmpty().withMessage('Workspace name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('slug').trim().notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
        body('ownerId').notEmpty().withMessage('Owner ID is required'),
        body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
        body('image_url').optional().isURL().withMessage('Image URL must be valid'),
        validate
    ],
    update: [
        param('id').notEmpty().withMessage('Workspace ID is required'),
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
        body('image_url').optional().isURL().withMessage('Image URL must be valid'),
        validate
    ],
    getById: [
        param('id').notEmpty().withMessage('Workspace ID is required'),
        validate
    ],
    delete: [
        param('id').notEmpty().withMessage('Workspace ID is required'),
        validate
    ]
};

/**
 * Project validation rules
 */
export const validateProject = {
    create: [
        body('name').trim().notEmpty().withMessage('Project name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('workspaceId').notEmpty().withMessage('Workspace ID is required'),
        body('team_lead').notEmpty().withMessage('Team lead is required'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),
        body('status').optional().isIn(['ACTIVE', 'PLANNING', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).withMessage('Invalid status'),
        body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
        body('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
        body('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
        body('memberIds').optional().isArray().withMessage('Member IDs must be an array'),
        validate
    ],
    update: [
        param('id').notEmpty().withMessage('Project ID is required'),
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),
        body('status').optional().isIn(['ACTIVE', 'PLANNING', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).withMessage('Invalid status'),
        body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
        body('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
        body('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
        validate
    ],
    getById: [
        param('id').notEmpty().withMessage('Project ID is required'),
        validate
    ],
    getAll: [
        query('workspaceId').optional().notEmpty().withMessage('Workspace ID cannot be empty'),
        validate
    ]
};

/**
 * Task validation rules
 */
export const validateTask = {
    create: [
        body('projectId').notEmpty().withMessage('Project ID is required'),
        body('title').trim().notEmpty().withMessage('Task title is required').isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
        body('assigneeId').notEmpty().withMessage('Assignee ID is required'),
        body('due_date').notEmpty().isISO8601().withMessage('Due date is required and must be a valid ISO date'),
        body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
        body('type').optional().isIn(['TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER']).withMessage('Invalid task type'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),
        validate
    ],
    update: [
        param('id').notEmpty().withMessage('Task ID is required'),
        body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
        body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
        body('type').optional().isIn(['TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER']).withMessage('Invalid task type'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),
        body('due_date').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
        validate
    ],
    getById: [
        param('id').notEmpty().withMessage('Task ID is required'),
        validate
    ],
    getAll: [
        query('projectId').optional().notEmpty().withMessage('Project ID cannot be empty'),
        validate
    ]
};

/**
 * Comment validation rules
 */
export const validateComment = {
    create: [
        param('taskId').notEmpty().withMessage('Task ID is required'),
        body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
        body('userId').notEmpty().withMessage('User ID is required'),
        validate
    ],
    getByTaskId: [
        param('taskId').notEmpty().withMessage('Task ID is required'),
        validate
    ],
    delete: [
        param('id').notEmpty().withMessage('Comment ID is required'),
        validate
    ]
};

