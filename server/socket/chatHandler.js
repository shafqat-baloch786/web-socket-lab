const User = require('../models/User');

const chatSocket = (io, socket) => {
    
    // Triggered when frontend emits 'login'
    const handleLogin = async (userId) => {
        try {
            // if (!userId) return;

            // 1. Update User Status in DB
            const user = await User.findByIdAndUpdate(
                userId,
                { isOnline: true, socketId: socket.id },
                { new: true }
            );

            if (user) {
                // 2. JOIN PRIVATE ROOM (The Industry Standard)
                socket.join(userId.toString());

                // 3. Notify all other users that I am now Online
                socket.broadcast.emit('userStatusChanged', {
                    userId: userId,
                    isOnline: true
                });
            }
        } catch (err) {
            console.error("Socket Login Error:", err);
        }
    };

    // Triggered automatically by Socket.io
    const handleDisconnect = async () => {
        try {
            // Find the user who was using this specific socket
            const user = await User.findOneAndUpdate(
                { socketId: socket.id },
                { isOnline: false, socketId: null, lastSeen: new Date() },
                { new: true }
            );

            if (user) {
                // Notify everyone else that I am now Offline
                socket.broadcast.emit('userStatusChanged', {
                    userId: user._id,
                    isOnline: false,
                    lastSeen: user.lastSeen
                });
            }
        } catch (err) {
            console.error("Socket Disconnect Error:", err);
        }
    };

    // Event Listeners
    socket.on('login', handleLogin);
    socket.on('disconnect', handleDisconnect);
};

module.exports = chatSocket;