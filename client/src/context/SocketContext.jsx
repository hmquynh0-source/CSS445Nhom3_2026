import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Khởi tạo kết nối
        const newSocket = io('http://localhost:5000', {
            // ✅ QUAN TRỌNG: Cho phép polling trước khi nâng cấp lên websocket
            // Điều này giúp tránh lỗi 404 nếu server chưa kịp sẵn sàng cho ws://
            transports: ['polling', 'websocket'], 
            
            // Đảm bảo thử lại nếu mất kết nối
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket Server với ID:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message);
        });

        setSocket(newSocket);

        // Dọn dẹp khi component unmount
        return () => {
            if (newSocket) {
                newSocket.off('connect');
                newSocket.off('connect_error');
                newSocket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);