import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaThLarge, FaWarehouse, FaCogs, FaCoffee, FaClipboardList, 
    FaTruck, FaUsers, FaChartBar, FaBrain, FaPlus, FaSearch, 
    FaBell, FaCog, FaThermometerHalf, FaStopwatch, FaWind, FaFireAlt
} from 'react-icons/fa';

const ProcessingPage = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sensors, setSensors] = useState({
        temp: 205.5,
        time: "14:20s",
        pressure: 2.4
    });

    // State cho Form khởi tạo
    const [batchForm, setBatchForm] = useState({
        source: 'Cà phê nhân xanh - Arabica',
        target: 'Rang nhạt (Light Roast)',
        weight: '60.0',
        expectedLoss: '12.5'
    });

    // 1. Giả lập/Lấy dữ liệu cảm biến thời gian thực
    useEffect(() => {
        const interval = setInterval(() => {
            setSensors(prev => ({
                ...prev,
                // Nhiệt độ dao động nhẹ +/- 0.2 độ
                temp: parseFloat((prev.temp + (Math.random() * 0.4 - 0.2)).toFixed(1))
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // 2. Lấy lịch sử mẻ rang từ API
    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/processing/history');
            if (res.data.success) setHistory(res.data.data);
        } catch (err) {
            console.error("Không thể lấy lịch sử:", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // 3. Xử lý khi nhấn nút Thực thi
    const handleExecute = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/processing/execute', batchForm);
            if (res.data.success) {
                alert("Đã khởi tạo lệnh chế biến thành công!");
                fetchHistory(); // Cập nhật lại danh sách bên phải
            }
        } catch (err) {
            alert("Lỗi thực thi: " + (err.response?.data?.message || "Server error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <main style={styles.mainArea}>
                <div style={styles.contentPadding}>
                    <div style={styles.pageHeaderRow}>
                        <div>
                            <p style={styles.upperTitle}>SẢN XUẤT & ĐIỀU HÀNH</p>
                            <h1 style={styles.mainTitle}>Điều hành Chế biến</h1>
                        </div>
                        <div style={styles.weeklyStats}>
                            <div style={styles.statMini}>
                                <p style={styles.statMiniLabel}>HIỆU SUẤT TUẦN</p>
                                <h2 style={styles.statMiniVal}>94.2<span style={{fontSize: '16px'}}>%</span></h2>
                            </div>
                            <div style={styles.statMini}>
                                <p style={styles.statMiniLabel}>HAO HỤT TB</p>
                                <h2 style={styles.statMiniVal}>12.8<span style={{fontSize: '16px'}}>%</span></h2>
                            </div>
                        </div>
                    </div>

                    <div style={styles.dashboardGrid}>
                        {/* LEFT COLUMN */}
                        <div style={styles.leftCol}>
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <h3 style={{margin: 0, fontSize: '18px'}}>Khởi tạo Lệnh Chế biến</h3>
                                    <span style={styles.batchTag}>ID: BATCH-NEW</span>
                                </div>

                                <div style={styles.inputGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>NGUỒN ĐẦU VÀO</label>
                                        <select 
                                            style={styles.select}
                                            value={batchForm.source}
                                            onChange={(e) => setBatchForm({...batchForm, source: e.target.value})}
                                        >
                                            <option>Cà phê nhân xanh - Arabica</option>
                                            <option>Cà phê nhân xanh - Robusta</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>SẢN PHẨM ĐÍCH</label>
                                        <select 
                                            style={styles.select}
                                            value={batchForm.target}
                                            onChange={(e) => setBatchForm({...batchForm, target: e.target.value})}
                                        >
                                            <option>Rang nhạt (Light Roast)</option>
                                            <option>Rang vừa (Medium Roast)</option>
                                            <option>Rang đậm (Dark Roast)</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>KHỐI LƯỢNG (KG)</label>
                                        <input 
                                            type="text" 
                                            value={batchForm.weight} 
                                            style={styles.input} 
                                            onChange={(e) => setBatchForm({...batchForm, weight: e.target.value})}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>TỶ LỆ HAO HỤT DỰ KIẾN (%)</label>
                                        <input 
                                            type="text" 
                                            value={batchForm.expectedLoss} 
                                            style={styles.input} 
                                            onChange={(e) => setBatchForm({...batchForm, expectedLoss: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button 
                                    style={{...styles.executeBtn, opacity: loading ? 0.7 : 1}} 
                                    onClick={handleExecute}
                                    disabled={loading}
                                >
                                    <FaFireAlt /> {loading ? "ĐANG KHỞI TẠO..." : "THỰC THI MẺ RANG"}
                                </button>
                            </div>

                            <div style={styles.sensorRow}>
                                <SensorCard icon={<FaThermometerHalf color="#D97706"/>} label="NHIỆT ĐỘ HIỆN TẠI" value={`${sensors.temp}°C`} />
                                <SensorCard icon={<FaStopwatch color="#3D2B1F"/>} label="THỜI GIAN LÝ TƯỞNG" value={sensors.time} />
                                <SensorCard icon={<FaWind color="#4F7942"/>} label="ÁP SUẤT KHÍ ĐỐT" value={`${sensors.pressure} bar`} />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Recent History */}
                        <div style={styles.historyCard}>
                            <h3 style={{fontSize: '18px', margin: '0 0 5px 0'}}>Lịch sử Gần đây</h3>
                            <p style={{fontSize: '12px', color: '#A89B8D', marginBottom: '20px'}}>Ghi chép các mẻ rang gần nhất</p>
                            
                            <div style={styles.historyList}>
                                {history.length > 0 ? history.map((item, idx) => (
                                    <HistoryItem 
                                        key={idx}
                                        id={item.batchId}
                                        status={item.status} 
                                        weight={item.weightInfo} 
                                        loss={item.lossInfo}
                                        type={item.type}
                                        isProcessing={item.status === 'ĐANG XỬ LÝ'} 
                                        progress={item.progress || "0%"} 
                                        tag={item.tag} 
                                        tagColor={item.tagColor}
                                    />
                                )) : (
                                    /* Dữ liệu mẫu nếu API chưa có đồ */
                                    <>
                                        <HistoryItem 
                                            id="BATCH-00941" status="ĐANG XỬ LÝ" 
                                            weight="60kg → 52.4kg" loss="12.6% Loss" 
                                            isProcessing progress="70%" 
                                        />
                                        <HistoryItem 
                                            id="BATCH-00940" status="HOÀN TẤT • 14:20 TODAY" 
                                            weight="120kg → 106.8kg" type="Light Roast Arabica"
                                            tag="STANDARD" tagColor="#4F7942"
                                        />
                                    </>
                                )}
                            </div>

                            <button style={styles.viewLogBtn}>XEM TOÀN BỘ NHẬT KÝ →</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- GIỮ NGUYÊN CÁC SUB-COMPONENTS VÀ STYLES CỦA BẠN ---
const SensorCard = ({ icon, label, value }) => (
    <div style={styles.sCard}>
        <div style={styles.sIcon}>{icon}</div>
        <p style={styles.sLabel}>{label}</p>
        <h3 style={styles.sValue}>{value}</h3>
    </div>
);

const HistoryItem = ({ id, status, weight, loss, isProcessing, progress, type, tag, tagColor }) => (
    <div style={styles.hItem}>
        <div style={styles.hRow}>
            <div>
                <p style={{...styles.hStatus, color: isProcessing ? '#4F7942' : '#A89B8D'}}>{status}</p>
                <h4 style={styles.hId}>{id}</h4>
            </div>
            <div style={{textAlign: 'right'}}>
                <p style={styles.hWeight}>{weight}</p>
                {loss ? <p style={styles.hLoss}>{loss}</p> : <p style={styles.hType}>{type}</p>}
            </div>
        </div>
        {isProcessing ? (
            <div style={styles.progressBarBg}><div style={{...styles.progressBarFill, width: progress}}></div></div>
        ) : (
            <div style={{textAlign: 'right', marginTop: '5px'}}>
                <span style={{...styles.hTag, color: tagColor, borderColor: tagColor}}>{tag}</span>
            </div>
        )}
    </div>
);

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F9F1E7', fontFamily: 'Inter, sans-serif' },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column' },
    contentPadding: { padding: '30px 40px' },
    pageHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    upperTitle: { fontSize: '11px', fontWeight: '700', color: '#A89B8D', letterSpacing: '1px', margin: 0 },
    mainTitle: { fontSize: '36px', fontWeight: '900', color: '#3D2B1F', margin: '5px 0' },
    weeklyStats: { display: 'flex', gap: '40px' },
    statMini: { textAlign: 'right' },
    statMiniLabel: { fontSize: '10px', color: '#A89B8D', fontWeight: '700', margin: 0 },
    statMiniVal: { fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    dashboardGrid: { display: 'flex', gap: '30px' },
    leftCol: { flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' },
    formCard: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderTop: '5px solid #4F7942', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    batchTag: { backgroundColor: '#F1E9DF', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', color: '#A89B8D' },
    inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '10px', fontWeight: '700', color: '#A89B8D' },
    select: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#F9F1E7', color: '#3D2B1F', fontWeight: '500' },
    input: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#F9F1E7', fontSize: '16px', fontWeight: '600' },
    executeBtn: { width: '100%', backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', cursor: 'pointer', letterSpacing: '1px' },
    sensorRow: { display: 'flex', gap: '20px' },
    sCard: { flex: 1, backgroundColor: '#F9F1E7', padding: '20px', borderRadius: '15px', textAlign: 'left' },
    sLabel: { fontSize: '10px', fontWeight: '700', color: '#A89B8D', margin: '15px 0 5px 0' },
    sValue: { fontSize: '22px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    historyCard: { flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column' },
    historyList: { flex: 1 },
    hItem: { padding: '15px 0', borderBottom: '1px solid #F1F1F1' },
    hRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    hStatus: { fontSize: '9px', fontWeight: '800', margin: 0 },
    hId: { fontSize: '16px', fontWeight: '700', color: '#3D2B1F', margin: '2px 0' },
    hWeight: { fontSize: '13px', fontWeight: '600', color: '#3D2B1F', margin: 0 },
    hLoss: { fontSize: '11px', color: '#D97706', margin: 0 },
    hType: { fontSize: '11px', color: '#A89B8D', margin: 0 },
    progressBarBg: { height: '4px', backgroundColor: '#F1F1F1', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#4F7942' },
    hTag: { fontSize: '8px', fontWeight: '800', padding: '2px 6px', border: '1px solid', borderRadius: '4px' },
    viewLogBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#3D2B1F', fontWeight: '700', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '15px', backgroundColor: '#F9F1E7', borderRadius: '8px' }
};

export default ProcessingPage;