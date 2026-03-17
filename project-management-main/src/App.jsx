import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import AuthCallback from "./pages/AuthCallback";
import { getSession, onAuthStateChange } from "./services/supabase";

// Protected Route Component
const ProtectedRoute = ({ children, isLoading, isAuthenticated }) => {
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check initial authentication status and listen for changes
        const checkAuth = async () => {
            try {
                const session = await getSession();
                setIsAuthenticated(!!session);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                // Add a small delay to prevent flash of loading state
                setTimeout(() => setIsLoading(false), 100);
            }
        };

        checkAuth();

        // Listen to Supabase auth state changes
        const { subscription } = onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return (
        <>
            <Toaster />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* Redirect root to login if not authenticated */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default App;
