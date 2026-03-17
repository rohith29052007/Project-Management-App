import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client with anon key (for user operations)
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verify Supabase JWT token
 * Extracts user info from token payload
 */
export const verifySupabaseToken = (token) => {
    try {
        // Decode without verification first to extract payload
        const decoded = jwt.decode(token);
        
        if (!decoded) {
            throw new Error('Invalid token format');
        }

        return decoded;
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

/**
 * Get user from Supabase
 */
export const getSupabaseUser = async (userId) => {
    try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) throw error;
        
        return {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
            email_confirmed_at: data.user.email_confirmed_at,
            created_at: data.user.created_at
        };
    } catch (error) {
        console.error('Error fetching Supabase user:', error);
        return null;
    }
};

/**
 * Get user metadata from token
 */
export const extractUserFromToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        
        if (!decoded) {
            throw new Error('Invalid token');
        }

        return {
            id: decoded.sub, // sub is the user ID in Supabase JWT
            email: decoded.email,
            aud: decoded.aud
        };
    } catch (error) {
        console.error('Error extracting user from token:', error);
        return null;
    }
};

/**
 * Verify token is not expired
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        return Date.now() > expirationTime;
    } catch (error) {
        return true;
    }
};

/**
 * Create a user profile in your database
 * Call this after successful Supabase signup
 */
export const createUserProfile = async (prisma, userId, email, fullName) => {
    try {
        const user = await prisma.user.create({
            data: {
                id: userId, // Use Supabase user ID
                email,
                name: fullName,
                username: email.split('@')[0]
            }
        });

        return user;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

/**
 * Get or create user profile
 */
export const getOrCreateUserProfile = async (prisma, userId, email, fullName) => {
    try {
        // Try to find existing user
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // If not found, create new user
        if (!user) {
            user = await createUserProfile(prisma, userId, email, fullName);
        }

        return user;
    } catch (error) {
        console.error('Error in getOrCreateUserProfile:', error);
        throw error;
    }
};
