// client/src/context/DataRefreshContext.jsx
import React, { createContext, useContext, useState, useMemo } from 'react';

// 1. Tạo Context
export const DataRefreshContext = createContext();

// 2. Custom Hook tiện ích
export const useDataRefresh = () => {
    return useContext(DataRefreshContext);
};

// 3. Provider Component
export const DataRefreshProvider = ({ children }) => {
    // State này chỉ cần thay đổi giá trị để kích hoạt useEffect lắng nghe
    const [refreshSignal, setRefreshSignal] = useState(0); 
    
    // Hàm này được gọi trong TransactionsPage sau khi giao dịch thành công
    const triggerRefresh = () => {
        console.log("TRIGGER REFRESH: Kích hoạt tín hiệu làm mới dữ liệu.");
        // Thay đổi giá trị (tăng lên 1) để đảm bảo useEffect được gọi lại
        setRefreshSignal(prev => prev + 1); 
    };

    const value = useMemo(() => ({
        refreshSignal, // Giá trị để lắng nghe
        triggerRefresh // Hàm để kích hoạt làm mới
    }), [refreshSignal]);

    return (
        <DataRefreshContext.Provider value={value}>
            {children}
        </DataRefreshContext.Provider>
    );
};