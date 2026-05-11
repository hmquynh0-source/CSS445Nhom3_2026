import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { FaThermometerHalf, FaStopwatch, FaWind, FaFireAlt } from 'react-icons/fa';

const ProcessingControlPage = () => {
    const socket = useSocket();
    const [telemetry, setTelemetry] = useState({ temp: 0, pressure: 0, idealTime: "00:00" });
    const [history, setHistory] = useState([]);
    const [batchForm, setBatchForm] = useState({ weight: '60.0', source: 'Arabica' });

    // 1. Lấy dữ liệu ban đầu qua API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/processing/history');
                if (res.data.success) setHistory(res.data.data);
            } catch (err) { console.error("Lỗi lấy dữ liệu:", err); }
        };
        fetchInitialData();
    }, []);

    // 2. Lắng nghe Real-time qua Socket
    useEffect(() => {
        if (!socket) return;

        socket.on('machine_telemetry', (data) => setTelemetry(data));

        socket.on('batch_update', (update) => {
            setHistory(prev => prev.map(item => 
                item.batchId === update.batchId ? { ...item, progress: update.progress } : item
            ));
        });

        socket.on('new_batch_added', (newBatch) => {
            setHistory(prev => [newBatch, ...prev]);
        });

        return () => {
            socket.off('machine_telemetry');
            socket.off('batch_update');
            socket.off('new_batch_added');
        };
    }, [socket]);

    const handleExecute = async () => {
        try {
            await axios.post('http://localhost:5000/api/processing/execute', batchForm);
        } catch (err) { alert("Server error!"); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentPadding}>
                <h1 style={styles.mainTitle}>Điều hành Chế biến <span style={styles.livePulse}>● LIVE</span></h1>
                
                <div style={styles.dashboardGrid}>
                    <div style={styles.leftCol}>
                        {/* FORM KHỞI TẠO */}
                        <div style={styles.formCard}>
                            <h3 style={{marginBottom: '20px'}}>Khởi tạo Lệnh Chế biến</h3>
                            <input 
                                style={styles.input} 
                                value={batchForm.weight} 
                                onChange={(e) => setBatchForm({...batchForm, weight: e.target.value})}
                                placeholder="Khối lượng (kg)"
                            />
                            <button style={styles.executeBtn} onClick={handleExecute}>
                                <FaFireAlt /> THỰC THI MẺ RANG
                            </button>
                        </div>

                        {/* CHỈ SỐ NHẢY REAL-TIME */}
                        <div style={styles.sensorRow}>
                            <SensorCard icon={<FaThermometerHalf color="#D97706"/>} label="NHIỆT ĐỘ" value={`${telemetry.temp}°C`} />
                            <SensorCard icon={<FaWind color="#4F7942"/>} label="ÁP SUẤT" value={`${telemetry.pressure} bar`} />
                            <SensorCard icon={<FaStopwatch color="#3D2B1F"/>} label="THỜI GIAN" value={telemetry.idealTime} />
                        </div>
                    </div>

                    {/* DANH SÁCH LỊCH SỬ REAL-TIME */}
                    <div style={styles.historyCard}>
                        <h3>Lịch sử & Tiến độ</h3>
                        <div style={styles.historyList}>
                            {history.map(item => (
                                <HistoryItem key={item.batchId} {...item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CON ---
const SensorCard = ({ icon, label, value }) => (
    <div style={styles.sCard}>
        {icon} <p style={styles.sLabel}>{label}</p> <h3 style={styles.sValue}>{value}</h3>
    </div>
);

const HistoryItem = ({ id, status, weightInfo, isProcessing, progress, tag, tagColor }) => (
    <div style={styles.hItem}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>{id} <b>{status}</b></span>
            <span>{weightInfo}</span>
        </div>
        {isProcessing && (
            <div style={styles.progressBarBg}>
                <div style={{...styles.progressBarFill, width: progress}}></div>
            </div>
        )}
    </div>
);

// --- STYLES (Rút gọn cho sạch) ---
const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9F1E7', fontFamily: 'Inter, sans-serif' },
    contentPadding: { padding: '40px' },
    mainTitle: { fontSize: '32px', fontWeight: '900', color: '#3D2B1F' },
    livePulse: { color: 'red', fontSize: '14px', verticalAlign: 'middle' },
    dashboardGrid: { display: 'flex', gap: '30px', marginTop: '30px' },
    leftCol: { flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' },
    formCard: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    input: { padding: '12px', width: '100%', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' },
    executeBtn: { width: '100%', backgroundColor: '#3D2B1F', color: 'white', padding: '15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    sensorRow: { display: 'flex', gap: '20px' },
    sCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' },
    sValue: { fontSize: '24px', fontWeight: 'bold' },
    historyCard: { flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px' },
    hItem: { padding: '15px 0', borderBottom: '1px solid #eee' },
    progressBarBg: { height: '6px', backgroundColor: '#eee', borderRadius: '3px', marginTop: '10px' },
    progressBarFill: { height: '100%', backgroundColor: '#4F7942', transition: 'width 0.5s ease' }
};

export default ProcessingControlPage;