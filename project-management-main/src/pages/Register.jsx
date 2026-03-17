import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { signUp, signInWithOAuth, getSession } from '../services/supabase';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                const session = await getSession();
                if (session) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(formData.email, formData.password, formData.name);
            toast.success('Account created! Please check your email to confirm your account.');
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignUp = async (provider) => {
        try {
            setIsLoading(true);
            await signInWithOAuth(provider);
            // Supabase handles the redirect automatically
        } catch (error) {
            toast.error(`${provider} signup failed: ${error.message}`);
            console.error('OAuth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                            <Github className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Full name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

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
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                minLength={8}
                                disabled={isLoading}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                            Must be at least 8 characters
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Confirm password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
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
                            Or sign up with
                        </span>
                    </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => handleOAuthSignUp('google')}
                        disabled={isLoading}
                        className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Chrome className="w-5 h-5" />
                    </button>

                    {/* GitHub */}
                    <button
                        type="button"
                        onClick={() => handleOAuthSignUp('github')}
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

export default Register;

