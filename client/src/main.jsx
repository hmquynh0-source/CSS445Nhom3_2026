import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; 
import { SocketProvider } from './context/SocketContext.jsx'; // ✅ Thêm SocketProvider để dùng realtime
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ Thêm future flags để tắt các cảnh báo React Router v6/v7 
        như bạn đã thấy trong console.
    */}
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <AuthProvider>
        {/* ✅ Wrap SocketProvider bên trong AuthProvider 
            để các component con có thể sử dụng useSocket()
        */}
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);