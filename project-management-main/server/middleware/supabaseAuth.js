import { verifySupabaseToken, extractUserFromToken, isTokenExpired } from '../utils/supabase.js';
import { AppError } from './errorHandler.js';

/**
 * Authenticate user with Supabase JWT token
 */
export const authenticateSupabase = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Check if token is expired
        if (isTokenExpired(token)) {
            throw new AppError('Token expired', 401);
        }

        // Extract user from token
        const user = extractUserFromToken(token);

        if (!user) {
            throw new AppError('Invalid token', 401);
        }

        // Store token and user info in request
        req.token = token;
        req.user = {
            id: user.id,
            email: user.email
        };

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
export const optionalAuthSupabase = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            // Check if token is expired
            if (!isTokenExpired(token)) {
                const user = extractUserFromToken(token);
                if (user) {
                    req.token = token;
                    req.user = {
                        id: user.id,
                        email: user.email
                    };
                }
            }
        }

        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

/**
 * Combined auth - accepts Supabase JWT or API key
 */
export const authenticateSupabaseAny = async (req, res, next) => {
    try {
        // Try Supabase JWT first
        if (req.headers.authorization?.startsWith('Bearer ')) {
            return authenticateSupabase(req, res, (err) => {
                if (err) {
                    return next(new AppError('Authentication required', 401));
                }
                next();
            });
        }

        // Try API key
        if (req.headers['x-api-key']) {
            // TODO: Implement API key validation if needed
            return next(new AppError('Authentication required', 401));
        }

        return next(new AppError('Authentication required', 401));
    } catch (error) {
        next(error);
    }
};

/**
 * Verify user ownership of resource
 */
export const verifyOwnership = (getUserId) => {
    return async (req, res, next) => {
        try {
            const resourceUserId = getUserId(req);
            const requestUserId = req.user?.id;

            if (!requestUserId) {
                throw new AppError('Authentication required', 401);
            }

            if (resourceUserId !== requestUserId) {
                throw new AppError('Unauthorized - you do not own this resource', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
