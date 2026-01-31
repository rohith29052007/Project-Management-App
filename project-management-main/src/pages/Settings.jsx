import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Key, User, Save, Trash2 } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        location: '',
        website: '',
        image: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                image: user.image || ''
            });
        }
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/api-keys`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setApiKeys(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
        }
    };

    const createApiKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a name for the API key');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/api-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newKeyName })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('API key created! Save it now - it won\'t be shown again.');
                setNewKeyName('');
                fetchApiKeys();
                
                // Show the key to user (only shown once)
                const keyToSave = data.data.key;
                if (confirm(`Your API key: ${keyToSave}\n\nCopy it now - it won't be shown again!`)) {
                    navigator.clipboard.writeText(keyToSave);
                    toast.success('API key copied to clipboard!');
                }
            } else {
                toast.error(data.error || 'Failed to create API key');
            }
        } catch (error) {
            toast.error('Failed to create API key');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteApiKey = async (keyId) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/api-keys/${keyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('API key deleted');
                fetchApiKeys();
            } else {
                toast.error(data.error || 'Failed to delete API key');
            }
        } catch (error) {
            toast.error('Failed to delete API key');
        }
    };

    const updateProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.data));
                toast.success('Profile updated successfully');
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-zinc-800 mb-6">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'profile'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400'
                        }`}
                    >
                        <User className="inline w-4 h-4 mr-2" />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('api-keys')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'api-keys'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400'
                        }`}
                    >
                        <Key className="inline w-4 h-4 mr-2" />
                        API Keys
                    </button>
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
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
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h2>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                            API keys allow you to authenticate with our API. Use them in the <code className="bg-gray-100 dark:bg-zinc-800 px-1 rounded">X-API-Key</code> header.
                        </p>

                        {/* Create New Key */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Name for this key"
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                            <button
                                onClick={createApiKey}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                Generate
                            </button>
                        </div>

                        {/* API Keys List */}
                        <div className="space-y-3">
                            {apiKeys.length === 0 ? (
                                <p className="text-gray-500 dark:text-zinc-400 text-sm">No API keys created yet</p>
                            ) : (
                                apiKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-800 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{key.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-zinc-400 font-mono">
                                                {key.keyPrefix}...
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                                                Created {new Date(key.createdAt).toLocaleDateString()}
                                                {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteApiKey(key.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

