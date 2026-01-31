import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
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

        if (!user) {
            throw new AppError('User not found', 401);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
        }
        next(error);
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
            
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    image: true
                }
            });

            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

/**
 * Verify API key and attach user to request
 */
export const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

        if (!apiKey) {
            throw new AppError('API key required', 401);
        }

        // Hash the provided key
        const crypto = (await import('crypto')).default;
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Find API key in database by hashed key
        const keyRecord = await prisma.apiKey.findFirst({
            where: {
                key: hashedKey
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        image: true
                    }
                }
            }
        });

        if (!keyRecord) {
            throw new AppError('Invalid API key', 401);
        }

        // Check if key is expired
        if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
            throw new AppError('API key expired', 401);
        }

        // Update last used
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsed: new Date() }
        });

        // Attach user to request
        req.user = keyRecord.user;
        req.apiKey = keyRecord;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Combined auth - accepts both JWT and API key
 */
export const authenticateAny = async (req, res, next) => {
    // Try JWT first
    if (req.headers.authorization?.startsWith('Bearer ')) {
        return authenticate(req, res, (err) => {
            if (err) {
                // If JWT fails, try API key
                return authenticateApiKey(req, res, next);
            }
            next();
        });
    }
    
    // Try API key
    if (req.headers['x-api-key']) {
        return authenticateApiKey(req, res, next);
    }

    return next(new AppError('Authentication required', 401));
};

