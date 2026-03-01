import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Should match your backend URL
        // Use environment variable for backend URL, fallback to localhost for dev
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Vercel Serverless Functions do not support persistent Socket.IO connections.
        // We disable the socket connection if we detect we are on a Vercel backend to prevent 404 errors.
        if (socketUrl.includes('vercel.app')) {
            console.warn('Real-time features (Socket.IO) are disabled on Vercel Serverless deployment.');
            return;
        }

        const socketInstance = io(socketUrl, {
            // autoConnect: true,
            // transports: ["websocket"] 
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
