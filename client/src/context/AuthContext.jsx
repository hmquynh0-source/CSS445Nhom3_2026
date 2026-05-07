import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        const storedName = localStorage.getItem('userName');

        if (storedToken) {
            setToken(storedToken);
            setUserRole(storedRole);
            setUserName(storedName);
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData) => {
        const { access_token, name, role } = userData;
        localStorage.setItem('token', access_token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', name);

        setToken(access_token);
        setUserRole(role);
        setUserName(name);
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
        setToken(null);
        setUserRole(null);
        setUserName(null);
    }, []);

    const authValue = useMemo(() => ({
        token,
        userRole,
        userName,
        loading,
        isAuthenticated: !!token,
        login,
        logout
    }), [token, userRole, userName, loading]);

    return (
        <AuthContext.Provider value={authValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};