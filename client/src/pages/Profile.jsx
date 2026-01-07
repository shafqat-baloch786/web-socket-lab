import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';

const Profile = () => {
    const { partnerId } = useParams();
    const navigate = useNavigate();
    const { token, logout, user: profile } = useAuth();
    const socket = useSocket();

    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [usersRes, chatsRes] = await Promise.all([
                    axios.get('http://localhost:4000/api/users/all', config),
                    axios.get('http://localhost:4000/api/messages', config)
                ]);
                setUsers(usersRes.data.users);
                setConversations(chatsRes.data.messages);
            } catch (err) {
                console.error("Fetch Error:", err);
                if (err.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };
        if (token && profile) fetchData();
    }, [token, profile, logout]);

    useEffect(() => {
        if (!socket || !profile?._id) return;

        socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isOnline, lastSeen } : u));
        });

        socket.on('newMessage', (msg) => {
            const myId = String(profile._id);
            const partnerOfMsg = String(msg.sender) === myId ? msg.receiver : msg.sender;

            setConversations(prev => {
                const existing = prev.find(c => String(c._id) === String(partnerOfMsg));
                const partnerData = existing?.partnerDetails || users.find(u => String(u._id) === String(partnerOfMsg));
                
                const updatedChat = {
                    _id: partnerOfMsg,
                    lastMessage: msg.content,
                    lastTime: msg.createdAt,
                    partnerDetails: partnerData
                };
                return [updatedChat, ...prev.filter(c => String(c._id) !== String(partnerOfMsg))];
            });
        });

        return () => {
            socket.off('userStatusChanged');
            socket.off('newMessage');
        };
    }, [socket, profile?._id, users]);

    const selectedUser = users.find(u => String(u._id) === String(partnerId));

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

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-indigo-600 tracking-tighter italic">WS LAB</h1>
                </div>
                
                <div className="flex-1 px-4 overflow-y-auto">
                    <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Chats</p>
                    <div className="space-y-3">
                        {conversations.map((chat) => {
                            const isActive = partnerId === chat.partnerDetails?._id;
                            return (
                                <div 
                                    key={chat._id} 
                                    onClick={() => navigate(`/conversation/${chat.partnerDetails?._id}`)}
                                    className={`group p-4 mx-2 rounded-2xl cursor-pointer transition-all border-2
                                        ${isActive ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {chat.partnerDetails?.name ? chat.partnerDetails.name[0].toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={`text-sm font-black truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{chat.partnerDetails?.name}</p>
                                                <span className={`text-[9px] font-bold ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>{formatLastSeen(chat.lastTime)}</span>
                                            </div>
                                            <p className={`text-xs truncate font-medium ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {profile?.name ? profile.name[0].toUpperCase() : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{profile?.name}</p>
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Active</span>
                        </div>
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 relative overflow-hidden">
                {partnerId ? (
                    <ChatWindow 
                        key={partnerId} 
                        partner={selectedUser} 
                        onBack={() => navigate('/profile')} 
                    />
                ) : (
                    <div className="h-full overflow-y-auto">
                        <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-gray-100 sticky top-0 z-20">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Lab Directory</h2>
                            <div className="relative w-1/3 group">
                                <input 
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 focus:border-indigo-600 outline-none transition-all"
                                />
                                <svg className="w-5 h-5 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <div className="bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg">
                                <span className="text-xs font-black text-white uppercase">{users.filter(u => u.isOnline).length} Online</span>
                            </div>
                        </header>

                        <div className="p-10">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-8">Hey {profile?.name?.split(' ')[0]}! 👋</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredUsers.map((user) => (
                                    <div 
                                        key={user._id} 
                                        onClick={() => navigate(`/conversation/${user._id}`)}
                                        className="group bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] hover:border-indigo-600 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="mb-6 relative">
                                            <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-4xl font-black ${user.isOnline ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-50 text-gray-300'}`}>
                                                {user.name[0].toUpperCase()}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 capitalize">{user.name}</h3>
                                        <div className="mt-3 mb-8">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl border-2 ${user.isOnline ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                {user.isOnline ? 'Online Now' : `Seen ${formatLastSeen(user.lastSeen)}`}
                                            </span>
                                        </div>
                                        <button className="w-full py-4 bg-gray-900 text-white text-[11px] font-black rounded-2xl">Send Message</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;