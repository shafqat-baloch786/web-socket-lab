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
    
    // Search & Navigation States
    const [showSearch, setShowSearch] = useState(false);
    const [chatSearchTerm, setChatSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0); 
    
    const scrollRef = useRef();
    const matchRefs = useRef([]); 

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
            } catch (err) { console.error("Fetch Error:", err); }
        };
        if (partnerId && token) fetchHistory();
    }, [partnerId, token]);

    // 2. Socket Listener
    useEffect(() => {
        if (!socket) return;
        const handleIncoming = (msg) => {
            const senderId = String(msg.sender?._id || msg.sender);
            const receiverId = String(msg.receiver?._id || msg.receiver);
            if (senderId === String(partnerId) || receiverId === String(partnerId)) {
                setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
            }
        };
        socket.on('newMessage', handleIncoming);
        return () => socket.off('newMessage', handleIncoming);
    }, [socket, partnerId]);

    // 3. Search Logic
    const matches = messages.filter(m => 
        chatSearchTerm && m.content.toLowerCase().includes(chatSearchTerm.toLowerCase())
    );

    useEffect(() => {
        if (matches.length > 0) {
            setActiveIndex(1);
            scrollToMatch(1);
        } else {
            setActiveIndex(0);
        }
    }, [chatSearchTerm]);

    const scrollToMatch = (index) => {
        setTimeout(() => {
            const target = matchRefs.current[index - 1];
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleNext = () => {
        const next = activeIndex >= matches.length ? 1 : activeIndex + 1;
        setActiveIndex(next);
        scrollToMatch(next);
    };

    const handlePrev = () => {
        const prev = activeIndex <= 1 ? matches.length : activeIndex - 1;
        setActiveIndex(prev);
        scrollToMatch(prev);
    };

    const highlightText = (text, highlight, isCurrentMatch) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark key={i} className={`${isCurrentMatch ? 'bg-orange-400' : 'bg-yellow-300'} text-black rounded-sm px-0.5 transition-colors`}>
                            {part}
                        </mark>
                    ) : (part)
                )}
            </span>
        );
    };

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
            setMessages(prev => [...prev, res.data.message]);
            if (onMessageSent) onMessageSent(res.data.message);
        } catch (err) { console.error("Send failed", err); }
    };

    useEffect(() => {
        if (!chatSearchTerm) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, chatSearchTerm]);

    if (!partner) return <div className="flex-1 bg-[#F8FAFC]" />;

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
            <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-4 flex-1">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl md:hidden">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {!showSearch ? (
                        <>
                            <div className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black uppercase shadow-lg shadow-indigo-100">
                                {partner.name?.[0]}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 capitalize tracking-tight">{partner.name}</h3>
                                <div className="flex items-center space-x-1.5">
                                    <div className={`h-2 w-2 rounded-full ${partner.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Online Now</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center flex-1 space-x-2 animate-in slide-in-from-right-4">
                            <div className="relative flex-1">
                                <input autoFocus type="text" placeholder="Search in chat..." value={chatSearchTerm} onChange={(e) => setChatSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-indigo-100 rounded-xl py-2 pl-10 pr-4 text-sm font-bold text-gray-900 outline-none focus:border-indigo-600"
                                />
                                <svg className="w-4 h-4 absolute left-3.5 top-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            {matches.length > 0 && (
                                <div className="flex items-center space-x-1 bg-white border-2 border-gray-100 rounded-xl px-2 py-1 shadow-sm">
                                    <span className="text-[10px] font-black text-gray-500 mx-2">{activeIndex}/{matches.length}</span>
                                    <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-lg text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg></button>
                                    <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-lg text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button onClick={() => { setShowSearch(!showSearch); setChatSearchTerm(''); }} className="ml-4 p-2.5 rounded-xl transition-all text-gray-400 hover:text-indigo-600 hover:bg-gray-50">
                    {showSearch ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                {messages.map((msg, i) => {
                    const isMe = String(msg.sender?._id || msg.sender) === String(user?._id || user?.id);
                    const matchIdx = matches.findIndex(m => m._id === msg._id);
                    const isMatched = matchIdx !== -1;
                    const isCurrent = isMatched && (matchIdx + 1 === activeIndex);

                    return (
                        <div key={msg._id || i} ref={el => { if (isMatched) matchRefs.current[matchIdx] = el; }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border transition-all ${
                                isMe ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none' : 'bg-white border-gray-200 text-gray-800 rounded-tl-none'
                            } ${isCurrent ? 'ring-4 ring-orange-400 border-orange-400' : isMatched ? 'ring-4 ring-yellow-400/30 border-yellow-400' : ''}`}>
                                {highlightText(msg.content, chatSearchTerm, isCurrent)}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <footer className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-6 pr-16 text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button type="submit" className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md active:scale-95 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;