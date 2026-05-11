import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // THÊM: userId vào state khởi tạo
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null); // <--- THÊM DÒNG NÀY
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const login = useCallback((userData) => {
        // THÊM: Lấy thêm _id từ userData của backend trả về
        const { token: receivedToken, name, role, _id } = userData;

        if (receivedToken) {
            localStorage.setItem('token', receivedToken);
            localStorage.setItem('userRole', role || 'staff');
            localStorage.setItem('userName', name || 'User');
            localStorage.setItem('userId', _id); // <--- LƯU ID VÀO MÁY

            setToken(receivedToken);
            setUserRole(role || 'staff');
            setUserName(name || 'User');
            setUserId(_id); // <--- CẬP NHẬT STATE ID

            axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId'); // <--- XÓA ID KHI LOGOUT

        setToken(null);
        setUserRole(null);
        setUserName(null);
        setUserId(null); // <--- RESET STATE ID

        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const authValue = useMemo(() => ({
        token,
        userRole,
        userName,
        userId, // <--- ĐƯA userId VÀO CONTEXT ĐỂ TRANG KHÁC DÙNG
        loading,
        isAuthenticated: !!token,
        login,
        logout
    }), [token, userRole, userName, userId, loading, login, logout]);

    return (
        <AuthContext.Provider value={authValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};