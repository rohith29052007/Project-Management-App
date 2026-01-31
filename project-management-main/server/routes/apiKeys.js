import express from 'express';
import { body, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { generateApiKey, hashApiKey } from '../utils/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/api-keys
 * Get all API keys for current user
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const apiKeys = await prisma.apiKey.findMany({
        where: { userId: req.user.id },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            lastUsed: true,
            expiresAt: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, apiKeys);
}));

/**
 * POST /api/api-keys
 * Create a new API key
 */
router.post('/', 
    authenticate,
    [
        body('name').trim().notEmpty().withMessage('API key name is required').isLength({ min: 1, max: 100 }),
        body('expiresAt').optional().isISO8601().withMessage('Expiration date must be a valid ISO date'),
        validate
    ],
    asyncHandler(async (req, res) => {
        const { name, expiresAt } = req.body;

        // Generate API key
        const { fullKey, prefix } = generateApiKey();
        const hashed = hashApiKey(fullKey);

        // Create API key record
        const apiKey = await prisma.apiKey.create({
            data: {
                userId: req.user.id,
                name: name.trim(),
                key: hashed, // Store hashed version
                keyPrefix: prefix,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                expiresAt: true,
                createdAt: true
            }
        });

        // Return the full key only once (for user to save)
        sendCreated(res, {
            ...apiKey,
            key: fullKey // Only returned on creation
        }, 'API key created successfully. Save this key - it will not be shown again!');
    })
);

/**
 * DELETE /api/api-keys/:id
 * Delete an API key
 */
router.delete('/:id',
    authenticate,
    [
        param('id').notEmpty().withMessage('API key ID is required'),
        validate
    ],
    asyncHandler(async (req, res) => {
        const apiKey = await prisma.apiKey.findUnique({
            where: { id: req.params.id }
        });

        if (!apiKey) {
            throw new AppError('API key not found', 404);
        }

        // Check ownership
        if (apiKey.userId !== req.user.id) {
            throw new AppError('Unauthorized', 403);
        }

        await prisma.apiKey.delete({
            where: { id: req.params.id }
        });

        sendSuccess(res, null, 'API key deleted successfully');
    })
);

export default router;

