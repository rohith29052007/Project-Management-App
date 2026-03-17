import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, initializeOAuthSession, getCurrentUser, extractOAuthUserProfile } from '../services/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Initialize the OAuth session from URL
                await initializeOAuthSession();
                
                // Wait a moment for session to be fully processed
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check if the user has a session after OAuth
                const session = await getSession();

                if (session) {
                    // Get the currently authenticated user with all metadata
                    const user = await getCurrentUser();

                    if (user) {
                        // Extract profile data from OAuth provider
                        const profileData = extractOAuthUserProfile(user);

                        // Store user profile data in localStorage
                        if (profileData) {
                            localStorage.setItem('user', JSON.stringify(profileData));
                            localStorage.setItem('token', session.access_token);
                            console.log('User profile saved:', profileData);
                        }
                    }

                    // User is authenticated, redirect to dashboard
                    navigate('/', { replace: true });
                } else {
                    // If no session, something went wrong, redirect to login
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                // Redirect to login on error
                navigate('/login', { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                <p className="mt-4 text-gray-600 dark:text-zinc-400">Processing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
