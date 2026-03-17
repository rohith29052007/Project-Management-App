import { useState, useRef, useEffect } from 'react'
import { SearchIcon, PanelLeft, LogOut, Settings, Mail, MapPin, Globe } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleTheme } from '../features/themeSlice'
import { selectTheme } from '../features/selectors'
import { MoonIcon, SunIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'
import { signOut } from '../services/supabase'

const Navbar = ({ setIsSidebarOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useSelector(selectTheme);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            // Sign out from Supabase
            await signOut();
            
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Show success message and redirect
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if signOut fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Error logging out');
            navigate('/login');
        }
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            placeholder="Search projects, tasks..."
                            className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
                        <span className="text-sm text-gray-700 dark:text-zinc-300 hidden sm:block">
                            {user.username || user.name || 'User'}
                        </span>
                        
                        {/* Profile Avatar - Click to open menu */}
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="size-7 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 transition cursor-pointer flex-shrink-0"
                            title="View profile"
                        >
                            <img 
                                src={user.image || assets.profile_img_a} 
                                alt="User Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Header with profile info */}
                                <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                                    <div className="flex gap-3">
                                        <img 
                                            src={user.image || assets.profile_img_a} 
                                            alt="User Avatar" 
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {user.name || 'User'}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">
                                                @{user.username || user.email?.split('@')[0] || 'username'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="p-4 space-y-3">
                                    {/* Email */}
                                    {user.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">Email</p>
                                                <p className="text-sm text-gray-700 dark:text-zinc-300 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {user.bio && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0 flex items-center justify-center text-xs">📝</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">Bio</p>
                                                <p className="text-sm text-gray-700 dark:text-zinc-300">
                                                    {user.bio}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {user.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">Location</p>
                                                <p className="text-sm text-gray-700 dark:text-zinc-300 truncate">
                                                    {user.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Website */}
                                    {user.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">Website</p>
                                                <a 
                                                    href={user.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                                                >
                                                    {user.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Provider Info */}
                                    {user.provider && (
                                        <div className="pt-2 text-xs text-gray-500 dark:text-zinc-400">
                                            Signed in with {user.provider === 'email' ? 'Email' : user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Menu Actions */}
                                <div className="border-t border-gray-200 dark:border-zinc-800 p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Logout Button (keep for quick access) */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
