import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';
import { profileService } from '../services/supabaseServices';

const Settings = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        avatar_url: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');


    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            if (user?.id) {
                const profile = await profileService.getProfile(user.id);
                setProfileData({
                    name: profile.name || '',
                    email: profile.email || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    website: profile.website || '',
                    avatar_url: profile.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            // Fallback to localStorage
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                avatar_url: user.avatar_url || ''
            });
        }
    };


    const updateProfile = async () => {
        if (!user?.id) {
            toast.error('User not found. Please login again.');
            return;
        }

        setIsLoading(true);
        try {
            await profileService.updateProfile(user.id, {
                name: profileData.name,
                bio: profileData.bio,
                location: profileData.location,
                website: profileData.website
            });

            // Update localStorage
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

            {/* Profile Tab */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Bio
                            </label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                                placeholder="Tell us about yourself"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                                placeholder="City, Country"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                value={profileData.website}
                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                                placeholder="https://example.com"
                            />
                        </div>

                        <button
                            onClick={updateProfile}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

