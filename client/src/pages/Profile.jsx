import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { token, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Dashboard | Web Socket Lab";
        
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:4000/api/main/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data.user);
            } catch (err) {
                console.error("Failed to fetch profile");
                if (err.response?.status === 404) logout();
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token, logout]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* --- SIDEBAR --- */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-black text-indigo-600 tracking-tight">WS LAB</h1>
                </div>
                
                {/* Placeholder for Conversations List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Conversations</p>
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 text-sm text-center border border-dashed border-gray-300">
                        No active chats yet...
                    </div>
                </div>

                {/* Bottom User Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {profile?.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{profile?.name}</p>
                            <p className="text-xs text-green-500 flex items-center">
                                <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col relative bg-white">
                {/* Header */}
                <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md">
                    <h2 className="font-bold text-gray-800">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400 font-medium">Last seen: {new Date(profile?.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </header>

                {/* Welcome Screen */}
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <div className="inline-block p-4 bg-indigo-50 rounded-3xl mb-6">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4">
                            Welcome, {profile?.name.split(' ')[0]}!
                        </h1>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Select a contact from the sidebar to start a real-time conversation or check your profile settings.
                        </p>
                        <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            New Conversation
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;