import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Hash API key for storage
 */
export const hashApiKey = (apiKey) => {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
};

/**
 * Generate API key
 * Format: pm_xxxxxxxxxxxxxxxx (GitHub-like)
 */
export const generateApiKey = () => {
    const randomBytes = crypto.randomBytes(32);
    const key = `pm_${randomBytes.toString('hex')}`;
    const prefix = key.substring(0, 7); // pm_xxx
    
    return {
        fullKey: key,
        prefix: prefix
    };
};

/**
 * Verify API key
 */
export const verifyApiKey = async (providedKey, storedHash) => {
    const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');
    return providedHash === storedHash;
};

/**
 * Generate username from email or name
 */
export const generateUsername = (email, name) => {
    const base = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '');
    return base.replace(/[^a-z0-9]/g, '').substring(0, 39); // GitHub username rules
};

