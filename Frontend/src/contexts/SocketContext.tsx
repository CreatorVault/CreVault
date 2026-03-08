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
        // Skip socket connection on Vercel to prevent 404 errors.
        if (socketUrl.includes('vercel.app')) {
            return;
        }

        // First check if the backend is reachable before attempting Socket.IO
        fetch(`${socketUrl}/`, { method: 'GET', signal: AbortSignal.timeout(3000) })
            .then(() => {
                const socketInstance = io(socketUrl, {
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    timeout: 5000,
                    transports: ['websocket', 'polling'],
                });

                socketInstance.on('connect', () => {
                    setIsConnected(true);
                });

                socketInstance.on('disconnect', () => {
                    setIsConnected(false);
                });

                // Suppress connection errors from appearing in console
                socketInstance.on('connect_error', () => {
                    setIsConnected(false);
                });

                socketInstance.io.on('reconnect_failed', () => {
                    setIsConnected(false);
                });

                setSocket(socketInstance);

                // Cleanup on unmount
                return () => {
                    socketInstance.disconnect();
                };
            })
            .catch(() => {
                // Backend not reachable — skip Socket.IO entirely, no console errors
                setIsConnected(false);
            });

        return () => {
            // If socket was created, disconnect it
            setSocket((prev) => {
                if (prev) prev.disconnect();
                return null;
            });
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
