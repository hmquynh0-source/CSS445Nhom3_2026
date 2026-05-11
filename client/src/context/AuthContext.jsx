import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Khởi tạo State từ LocalStorage để giữ trạng thái khi F5 trang web
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
    const [loading, setLoading] = useState(true);

    // 2. Cấu hình Axios mặc định (Silent logic)
    // Mỗi khi token thay đổi, tất cả các yêu cầu axios sau đó sẽ tự kèm theo Token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    // 3. Hàm Đăng nhập (Nhận userData từ res.data.data của Login)
    const login = useCallback((userData) => {
        // Khớp với cấu trúc backend: { _id, name, email, role, token }
        const { token: receivedToken, name, role } = userData;

        if (receivedToken) {
            // Lưu vào LocalStorage
            localStorage.setItem('token', receivedToken);
            localStorage.setItem('userRole', role || 'staff');
            localStorage.setItem('userName', name || 'User');

            // Cập nhật State
            setToken(receivedToken);
            setUserRole(role || 'staff');
            setUserName(name || 'User');

            // Cài đặt header cho các request tương lai
            axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        }
    }, []);

    // 4. Hàm Đăng xuất
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');

        setToken(null);
        setUserRole(null);
        setUserName(null);

        // Xóa sạch header axios
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    // 5. Cung cấp giá trị Context (Dùng useMemo để tối ưu hiệu năng)
    const authValue = useMemo(() => ({
        token,
        userRole,
        userName,
        loading,
        isAuthenticated: !!token,
        login,
        logout
    }), [token, userRole, userName, loading, login, logout]);

    return (
        <AuthContext.Provider value={authValue}>
            {/* Chỉ render app khi đã kiểm tra xong trạng thái loading */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để sử dụng Context nhanh hơn
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};