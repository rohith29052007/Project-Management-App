import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-project-auth',
        storage: localStorage
    }
});

/**
 * Sign up with email and password
 */
export const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            },
            emailRedirectTo: `${appUrl}/login`
        }
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${appUrl}/auth/callback`
        }
    });

    if (error) throw error;
    return data;
};

/**
 * Get current user session
 */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
};

/**
 * Sign out
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Update user profile
 */
export const updateProfile = async (attributes) => {
    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
    return data;
};

/**
 * Reset password
 */
export const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`
    });

    if (error) throw error;
    return data;
};

/**
 * Update password
 */
export const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
    return data;
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
    const session = await getSession();
    return session?.access_token;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return { subscription };
};

/**
 * Initialize OAuth session - called when auth callback page loads
 * This ensures the OAuth session from URL hash is properly detected and stored
 */
export const initializeOAuthSession = async () => {
    try {
        // Get the current session from the URL (if OAuth redirect contains it)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting OAuth session:', error);
            return null;
        }

        if (session) {
            // Trigger auth state change listeners
            const { data: newSession } = await supabase.auth.getSession();
            return newSession;
        }

        return null;
    } catch (error) {
        console.error('OAuth session initialization error:', error);
        return null;
    }
};

/**
 * Extract user profile data from OAuth provider
 * Handles GitHub, Google, and other OAuth providers
 */
export const extractOAuthUserProfile = (user) => {
    if (!user) return null;

    const userMetadata = user.user_metadata || {};
    const identities = user.identities || [];
    const githubIdentity = identities.find(id => id.provider === 'github');
    const googleIdentity = identities.find(id => id.provider === 'google');

    // Extract provider-specific data
    let profileData = {
        id: user.id,
        email: user.email,
        name: userMetadata.full_name || userMetadata.name || 'User',
        image: userMetadata.avatar_url || userMetadata.picture || null,
        username: userMetadata.username || userMetadata.email?.split('@')[0] || 'user',
        provider: githubIdentity?.provider || googleIdentity?.provider || 'email',
        provider_id: githubIdentity?.id || googleIdentity?.id || null,
        bio: userMetadata.bio || '',
        location: userMetadata.location || '',
        website: userMetadata.website || ''
    };

    // Handle GitHub specific data
    if (githubIdentity?.identity_data) {
        const githubData = githubIdentity.identity_data;
        profileData = {
            ...profileData,
            name: githubData.full_name || githubData.name || profileData.name,
            image: githubData.avatar_url || profileData.image,
            username: githubData.login || profileData.username,
            bio: githubData.bio || profileData.bio,
            location: githubData.location || profileData.location,
            website: githubData.blog || profileData.website
        };
    }

    // Handle Google specific data
    if (googleIdentity?.identity_data) {
        const googleData = googleIdentity.identity_data;
        profileData = {
            ...profileData,
            name: googleData.full_name || googleData.name || profileData.name,
            image: googleData.picture || profileData.image,
            email: googleData.email || profileData.email
        };
    }

    return profileData;
};

/**
 * Get user metadata
 */
export const getUserMetadata = () => {
    const session = localStorage.getItem('sb-project-auth');
    if (session) {
        try {
            const { user } = JSON.parse(session);
            return user?.user_metadata || {};
        } catch (e) {
            return {};
        }
    }
    return {};
};
