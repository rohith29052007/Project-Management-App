import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateToken, hashPassword, comparePassword, generateUsername } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validate registration input
 */
const validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Username can only contain lowercase letters, numbers, and hyphens')
];

/**
 * Validate login input
 */
const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new AppError(errorMessages, 400);
    }

    const { name, email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email.toLowerCase() },
                { username: username || generateUsername(email, name) }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
            throw new AppError('Email already registered', 409);
        }
        throw new AppError('Username already taken', 409);
    }

    // Generate username if not provided
    const finalUsername = username || generateUsername(email, name);
    
    // Check username uniqueness
    const usernameExists = await prisma.user.findUnique({
        where: { username: finalUsername }
    });

    if (usernameExists) {
        // Append random number if username exists
        const uniqueUsername = `${finalUsername}-${Math.floor(Math.random() * 1000)}`;
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                username: uniqueUsername
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                createdAt: true
            }
        });

        const token = generateToken(user.id);

        sendCreated(res, {
            user,
            token
        }, 'User registered successfully');
    } else {
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                username: finalUsername
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                createdAt: true
            }
        });

        const token = generateToken(user.id);

        sendCreated(res, {
            user,
            token
        }, 'User registered successfully');
    }
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new AppError(errorMessages, 400);
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user (without password)
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt
    };

    sendSuccess(res, {
        user: userData,
        token
    }, 'Login successful');
}));

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
    sendSuccess(res, req.user);
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
    const { name, bio, location, website, image } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (image !== undefined) updateData.image = image || '';

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
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
            updatedAt: true
        }
    });

    sendSuccess(res, user, 'Profile updated successfully');
}));

export default router;

