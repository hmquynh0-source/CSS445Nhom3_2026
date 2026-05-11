import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

// Thêm tham số config vào hook
export const useRealTimeData = (url, interval = 0, config = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        // Không set loading = true khi đang chạy interval để tránh nháy màn hình
        setError(null);

        try {
            // TRUYỀN CONFIG (TOKEN) VÀO ĐÂY
            const response = await axios.get(url, config);
            if (isMounted.current) {
                setData(response.data);
                setLoading(false);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err);
                setLoading(false);
            }
        }
    }, [url, JSON.stringify(config)]); // Dùng stringify để tránh loop vô tận

    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        if (interval > 0) {
            intervalRef.current = setInterval(fetchData, interval);
        }

        return () => {
            isMounted.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData, interval]);

    return { data, loading, error, refresh };
};