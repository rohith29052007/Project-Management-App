import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Github, Chrome } from 'lucide-react';
import { signIn, signInWithOAuth, getSession } from '../services/supabase';

const Login = () => {
    const navigate = useNavigate();
    const authCheckRef = useRef(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        if (authCheckRef.current) return;
        authCheckRef.current = true;

        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                const session = await getSession();
                if (session) {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await signIn(formData.email, formData.password);
            if (data?.session) {
                toast.success('Login successful!');
                // Wait for session to fully persist and propagate
                await new Promise(resolve => setTimeout(resolve, 500));
                navigate('/', { replace: true });
            } else {
                throw new Error('Login succeeded but no session returned');
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider) => {
        try {
            setIsLoading(true);
            await signInWithOAuth(provider);
            // Supabase handles the redirect automatically
        } catch (error) {
            toast.error(`${provider} login failed: ${error.message}`);
            console.error('OAuth error:', error);
            setIsLoading(false);
        }
    };

    // Show loading screen during redirect
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-zinc-400">Logging you in...</p>
                </div>
            </div>
        );
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                            <Github className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                        Or{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-400">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => handleOAuthSignIn('google')}
                        disabled={isLoading}
                        className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Chrome className="w-5 h-5" />
                    </button>

                    {/* GitHub */}
                    <button
                        type="button"
                        onClick={() => handleOAuthSignIn('github')}
                        disabled={isLoading}
                        className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Github className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

