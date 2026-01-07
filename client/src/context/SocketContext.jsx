import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth(); 

    useEffect(() => {
        // Only connect if we have a valid user and normalized _id
        if (user?._id) {
            const newSocket = io('http://localhost:4000');

            newSocket.on('connect', () => {
                console.log("Connected to Socket. Room ID:", user._id);
                // This tells the backend to run socket.join(user._id)
                newSocket.emit('login', user._id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.off('connect');
                newSocket.close();
            };
        }
    }, [user?._id]); // Re-run if user ID changes or loads

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);