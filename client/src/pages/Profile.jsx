import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { token, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Directory | Web Socket Lab";
        
        const fetchData = async () => {
            try {
                const [profileRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:4000/api/main/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:4000/api/users/all', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setProfile(profileRes.data.user);
                setUsers(usersRes.data.users);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, logout]);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatLastSeen = (date) => {
        if (!date) return 'Long ago';
        const now = new Date();
        const then = new Date(date);
        const diffInMinutes = Math.floor((now - then) / 60000);
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return then.toLocaleDateString();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* --- SIDEBAR --- */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-indigo-600 tracking-tighter italic">WS LAB</h1>
                </div>
                
                <div className="flex-1 px-6">
                    <div className="bg-indigo-50 rounded-3xl p-6 text-center border-2 border-indigo-100 border-dashed">
                        <p className="text-indigo-900 font-bold text-sm">No Active Chats</p>
                        <p className="text-indigo-400 text-xs mt-1">Search and pick a user to start.</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-white border-2 border-gray-100 rounded-3xl p-4 flex items-center space-x-3 shadow-sm">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold">
                            {profile?.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{profile?.name}</p>
                            <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
                        </div>
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-gray-100 sticky top-0 z-20">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Lab Directory</h2>
                    
                    {/* --- SEARCH BAR WITH BLACK TEXT --- */}
                    <div className="relative w-1/3 group">
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg shadow-indigo-100">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{filteredUsers.length} Members Found</span>
                    </div>
                </header>

                <div className="p-10">
                    <div className="mb-12 text-center md:text-left">
                        <h1 className="text-4xl font-black text-gray-900">Hey {profile?.name.split(' ')[0]}! 👋</h1>
                        <p className="text-gray-500 font-medium mt-1">Connect with lab members in real-time.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map((user) => (
                            <div 
                                key={user._id} 
                                className="group relative bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] hover:border-indigo-600 hover:shadow-[12px_12px_0px_rgba(79,70,229,0.05)] transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="mb-6 relative">
                                        <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-4xl font-black transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-3 ${user.isOnline ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-50 text-gray-300'}`}>
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    </div>
                                    
                                    <h3 className="text-lg font-black text-gray-900 truncate w-full text-center capitalize">
                                        {user.name}
                                    </h3>
                                    
                                    <div className="mt-3 mb-8">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl border-2 ${user.isOnline ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                            {user.isOnline ? 'Online Now' : `Seen ${formatLastSeen(user.lastSeen)}`}
                                        </span>
                                    </div>
                                    
                                    <button className="w-full py-4 bg-gray-900 text-white text-[11px] font-black rounded-2xl active:scale-95 hover:bg-indigo-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-gray-200 hover:shadow-indigo-200">
                                        <span>Start Session</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-24 bg-white border-2 border-gray-100 border-dashed rounded-[3rem]">
                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">No results match your search</p>
                            <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold text-xs underline underline-offset-4">Clear filter</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;