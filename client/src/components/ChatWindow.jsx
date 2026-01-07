import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';

const ChatWindow = ({ partner, onBack, onMessageSent }) => {
    const { partnerId } = useParams(); 
    const { token, user } = useAuth(); 
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef();

    // 1. Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/conversation/${partnerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.conversation) {
                    setMessages([...res.data.conversation].reverse());
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        if (partnerId && token) fetchHistory();
    }, [partnerId, token]);

    // 2. REAL-TIME LISTENER FIX
    useEffect(() => {
        if (!socket) return;

        const handleIncoming = (msg) => {
            console.log("ChatWindow heard message!", msg);
            
            const senderId = String(msg.sender?._id || msg.sender);
            const receiverId = String(msg.receiver?._id || msg.receiver);
            const currentPartnerId = String(partnerId);

            // LOGIC: If the message involves the person we are currently talking to
            if (senderId === currentPartnerId || receiverId === currentPartnerId) {
                setMessages((prev) => {
                    const exists = prev.some(m => m._id === msg._id);
                    if (exists) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on('newMessage', handleIncoming);
        return () => socket.off('newMessage', handleIncoming);
    }, [socket, partnerId]); // partnerId here is crucial

    // 3. Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');

        try {
            const res = await axios.post(`http://localhost:4000/api/conversation/${partnerId}`, 
                { content: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // We manually add it to UI for speed
            setMessages(prev => [...prev, res.data.message]);
            if (onMessageSent) onMessageSent(res.data.message);
        } catch (err) {
            console.error("Send failed", err);
        }
    };

    if (!partner) return <div className="flex-1 bg-[#F8FAFC]" />;

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
            {/* Header */}
            <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl md:hidden">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black uppercase shadow-lg shadow-indigo-100">
                        {partner.name?.[0]}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 capitalize">{partner.name}</h3>
                        <div className="flex items-center space-x-1.5">
                            <div className={`h-2 w-2 rounded-full ${partner.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {partner.isOnline ? 'Online Now' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                {messages.map((msg, i) => {
                    const isMe = String(msg.sender?._id || msg.sender) === String(user?._id || user?.id);
                    return (
                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
                                isMe ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none' : 'bg-white border-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <footer className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-6 pr-16 text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button type="submit" className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;