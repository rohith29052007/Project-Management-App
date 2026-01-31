import { Prisma } from '@prisma/client';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Prisma-specific errors
 */
export const handlePrismaError = (error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return new AppError('A record with this value already exists', 409);
            case 'P2025':
                return new AppError('Record not found', 404);
            case 'P2003':
                return new AppError('Foreign key constraint failed', 400);
            case 'P2014':
                return new AppError('Invalid ID provided', 400);
            default:
                return new AppError('Database operation failed', 500);
        }
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
        return new AppError('Invalid data provided', 400);
    }
    
    return error;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('Error:', err);

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError || 
        err instanceof Prisma.PrismaClientValidationError) {
        error = handlePrismaError(err);
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token', 401);
    }

    // Default error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

