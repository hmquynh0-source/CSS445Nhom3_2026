import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaThermometerHalf, FaStopwatch, FaWind, FaFireAlt, FaSyncAlt } from 'react-icons/fa';

const ProcessingPage = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU TỪ MONGODB ---
    const [productsInStock, setProductsInStock] = useState([]); // Chứa dữ liệu từ collection 'categories'
    const [targetProducts, setTargetProducts] = useState([]);   // Chứa dữ liệu từ collection 'products'
    const [history, setHistory] = useState([]);                 // Nhật ký mẻ rang
    const [loading, setLoading] = useState(false);

    // State form nhập liệu
    const [batchForm, setBatchForm] = useState({
        source: '', 
        target: '', 
        weight: '60' 
    });

    // State các thông số máy rang tự động tính toán
    const [calculatedParams, setCalculatedParams] = useState({
        expectedLoss: '12.5',
        temp: 200.0,
        time: "12:00s",
        pressure: 2.0
    });

    // ==========================================
    // 📡 1. LẤY DỮ LIỆU THỰC TẾ TỪ MONGODB (CATEGORIES & PRODUCTS)
    // ==========================================
    const fetchDropdownData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // Khởi chạy song song cả 2 API gọi sang MongoDB
            const [resCategories, resProducts] = await Promise.all([
                axios.get('http://localhost:5000/api/categories', config),
                axios.get('http://localhost:5000/api/products', config)
            ]);

            // Xử lý bóc tách danh mục (Categories) -> Nguồn đầu vào
            if (resCategories.data && resCategories.data.success) {
                setProductsInStock(resCategories.data.data);
            } else if (Array.isArray(resCategories.data)) {
                setProductsInStock(resCategories.data);
            }

            // Xử lý bóc tách sản phẩm (Products) -> Sản phẩm đích
            if (resProducts.data && resProducts.data.success) {
                setTargetProducts(resProducts.data.data);
            } else if (Array.isArray(resProducts.data)) {
                setTargetProducts(resProducts.data);
            }

        } catch (err) {
            console.error("Lỗi đồng bộ dữ liệu Categories/Products từ DB:", err);
            // Dữ liệu dự phòng nếu Backend bị ngắt kết nối (Tránh trắng màn hình)
            setProductsInStock([{ _id: 'cat1', name: 'Arabica' }, { _id: 'cat2', name: 'Robusta' }]);
            setTargetProducts([{ _id: 'prod1', name: 'Cà phê Arabica Rang Vừa' }, { _id: 'prod2', name: 'Cà phê Robusta Rang Đậm' }]);
        }
    };

    // Lấy lịch sử mẻ chế biến thực tế từ Backend
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const res = await axios.get('http://localhost:5000/api/processing/history', config);
            if (res.data && res.data.success) {
                setHistory(res.data.data);
            } else if (Array.isArray(res.data)) {
                setHistory(res.data);
            }
        } catch (err) {
            console.error("Không thể lấy lịch sử từ database:", err);
        }
    };

    // Khởi chạy khi tải trang
    useEffect(() => {
        fetchDropdownData();
        fetchHistory();
    }, []);

    // Tự động gán giá trị mặc định vào Form ngay sau khi DB trả về dữ liệu thành công
    useEffect(() => {
        if (productsInStock.length > 0 || targetProducts.length > 0) {
            setBatchForm(prev => ({
                ...prev,
                source: prev.source || (productsInStock[0] ? productsInStock[0].name : ''),
                target: prev.target || (targetProducts[0] ? targetProducts[0].name : '')
            }));
        }
    }, [productsInStock, targetProducts]);


    // ==========================================
    // 🧠 2. LOGIC TỰ ĐỘNG TÍNH TOÁN THÔNG SỐ THEO KHỐI LƯỢNG VÀ LOẠI HẠT
    // ==========================================
    useEffect(() => {
        const { source, weight } = batchForm;
        const w = parseFloat(weight) || 0;
        if (w <= 0 || !source) return;

        let baseLoss = 13.0; 
        let baseTemp = 195.0; 
        let timePerKg = 12;   

        const lowerSource = source.toLowerCase();
        if (lowerSource.includes('arabica')) {
            baseLoss = 14.2; baseTemp = 205.0; timePerKg = 14;
        } else if (lowerSource.includes('robusta')) {
            baseLoss = 12.1; baseTemp = 190.0; timePerKg = 11;
        } else if (lowerSource.includes('blend')) {
            baseLoss = 13.5; baseTemp = 198.0; timePerKg = 13;
        }

        const calcLoss = Math.max(10, (baseLoss - (w * 0.01))).toFixed(1);
        const calcTemp = (baseTemp + (w * 0.15)).toFixed(1);
        const calcPressure = Math.min(3.0, (1.5 + (w * 0.015))).toFixed(1);

        const totalSeconds = Math.round(w * timePerKg);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        setCalculatedParams({
            expectedLoss: calcLoss,
            temp: parseFloat(calcTemp),
            time: `${minutes}:${seconds < 10 ? '0' : ''}${seconds}s`,
            pressure: parseFloat(calcPressure)
        });
    }, [batchForm.source, batchForm.weight]);

    // Xử lý gửi lệnh chế biến lên Backend
    const handleExecute = async () => {
        if (!batchForm.source || !batchForm.target) {
            alert("Vui lòng chọn đầy đủ Nguồn hạt (Categories) và Sản phẩm đích (Products)!");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const payload = {
                ...batchForm,
                expectedLoss: calculatedParams.expectedLoss,
                temperature: calculatedParams.temp,
                processingTime: calculatedParams.time,
                gasPressure: calculatedParams.pressure
            };

            const res = await axios.post('http://localhost:5000/api/processing/execute', payload, config);
            if (res.data && res.data.success) {
                alert("🚀 Đã vận hành mẻ rang thành công! (Kho nguyên liệu đã giảm, kho thành phẩm đã tăng)");
                // Cập nhật lại lịch sử chế biến và làm mới dữ liệu dropdown để thấy số lượng thay đổi nếu cần
                fetchHistory();
                fetchDropdownData();
            }
        } catch (err) {
            alert("❌ Lỗi thực thi mẻ rang: " + (err.response?.data?.message || "Lỗi kết nối Server"));
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
                            <p style={styles.upperTitle}>SẢN XUẤT & ĐIỀU HÀNH THÔNG MINH</p>
                            <h1 style={styles.mainTitle}>Điều hành Chế biến</h1>
                        </div>
                        <div style={styles.weeklyStats}>
                            <div style={styles.statMini}>
                                <p style={styles.statMiniLabel}>HAO HỤT TÍNH TOÁN</p>
                                <h2 style={{ ...styles.statMiniVal, color: '#D97706' }}>{calculatedParams.expectedLoss}%</h2>
                            </div>
                        </div>
                    </div>

                    <div style={styles.dashboardGrid}>
                        {/* LEFT COLUMN: FORM VÀ THÔNG SỐ TỰ ĐỘNG */}
                        <div style={styles.leftCol}>
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Khởi tạo Mẻ Rang Tự Động</h3>
                                    <span style={{ ...styles.batchTag, backgroundColor: '#E0F2FE', color: '#0369A1' }}>DATABASE LIVE CONNECTED</span>
                                </div>

                                <div style={styles.inputGrid}>
                                    {/* 1. NGUỒN ĐẦU VÀO - MAPPED TỪ CATEGORIES */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>NGUỒN ĐẦU VÀO (COLLECTION: CATEGORIES)</label>
                                        <select
                                            style={styles.select}
                                            value={batchForm.source}
                                            onChange={(e) => setBatchForm({ ...batchForm, source: e.target.value })}
                                        >
                                            {productsInStock.map((cat) => (
                                                <option key={cat._id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* 2. SẢN PHẨM ĐÍCH - MAPPED TỪ PRODUCTS */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>SẢN PHẨM ĐÍCH (COLLECTION: PRODUCTS)</label>
                                        <select
                                            style={styles.select}
                                            value={batchForm.target}
                                            onChange={(e) => setBatchForm({ ...batchForm, target: e.target.value })}
                                        >
                                            {targetProducts.map((prod) => (
                                                <option key={prod._id} value={prod.name}>
                                                    {prod.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* KHỐI LƯỢNG VÀ HAO HỤT */}
                                    <div style={styles.inputGroup}>
                                        <label style={{ ...styles.label, color: '#4F7942' }}>KHỐI LƯỢNG ĐƯA VÀO RANG (KG)</label>
                                        <input
                                            type="number"
                                            value={batchForm.weight}
                                            style={{ ...styles.input, border: '2px solid #4F7942', backgroundColor: '#FFF' }}
                                            onChange={(e) => setBatchForm({ ...batchForm, weight: e.target.value })}
                                            placeholder="Nhập số kg..."
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>TỶ LỆ HAO HỤT TỰ TÍNH (%)</label>
                                        <input
                                            type="text"
                                            value={`${calculatedParams.expectedLoss} %`}
                                            style={{ ...styles.input, color: '#D97706', cursor: 'not-allowed' }}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <button
                                    style={{ ...styles.executeBtn, opacity: loading ? 0.7 : 1 }}
                                    onClick={handleExecute}
                                    disabled={loading}
                                >
                                    <FaFireAlt /> {loading ? "ĐANG TIẾN HÀNH..." : "XÁC NHẬN & VẬN HÀNH MẺ RANG"}
                                </button>
                            </div>

                            {/* PANEL PANEL THÔNG SỐ TỰ ĐỘNG NHẢY SỐ */}
                            <div style={styles.sensorRow}>
                                <div style={styles.sCard}>
                                    <p style={styles.sLabel}>NHIỆT ĐỘ PHÙ HỢP</p>
                                    <h3 style={styles.sValue}>{calculatedParams.temp} °C</h3>
                                </div>
                                <div style={styles.sCard}>
                                    <p style={styles.sLabel}>THỜI GIAN LÝ TƯỞNG</p>
                                    <h3 style={styles.sValue}>{calculatedParams.time}</h3>
                                </div>
                                <div style={styles.sCard}>
                                    <p style={styles.sLabel}>ÁP SUẤT KHÍ ĐỐT</p>
                                    <h3 style={styles.sValue}>{calculatedParams.pressure} bar</h3>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: KHÔI PHỤC VÀ ĐỒNG BỘ LỊCH SỬ CHẾ BIẾN TỪ DB */}
                        <div style={styles.historyCard}>
                            <h3 style={{ fontSize: '18px', margin: '0 0 5px 0', fontWeight: '800' }}>Lịch sử Sản xuất Gần đây</h3>
                            <p style={{ fontSize: '12px', color: '#A89B8D', marginBottom: '20px' }}>Biến động cân bằng kho thực tế</p>

                            <div style={styles.historyList}>
                                {history.length > 0 ? (
                                    history.map((item, idx) => (
                                        <div key={item._id || idx} style={styles.hItem}>
                                            <div style={styles.hRow}>
                                                <div>
                                                    <p style={{ ...styles.hStatus, color: '#4F7942' }}>
                                                        {item.status || "HOÀN TẤT VÀO KHO"}
                                                    </p>
                                                    <h4 style={styles.hId}>{item.batchId}</h4>
                                                    <div style={styles.hRouteDetails}>
                                                        <span><b>Từ:</b> {item.source}</span>
                                                        <span><b>Đến:</b> {item.target}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={styles.hWeight}>{item.weightInfo || `${item.weight} kg`}</p>
                                                    <p style={styles.hLoss}>{item.lossInfo || `${item.expectedLoss}% Loss`}</p>
                                                    <p style={styles.hMetaTime}>
                                                        {item.temperature || item.temperatureInfo || calculatedParams.temp}°C | {item.processingTime || item.timeInfo || calculatedParams.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                                <span style={{ 
                                                    ...styles.hTag, 
                                                    color: item.tagColor || '#4F7942', 
                                                    borderColor: item.tagColor || '#4F7942'
                                                }}>
                                                    {item.tag || "ĐÃ TĂNG THÀNH PHẨM"}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Giao diện hiển thị mặc định hoặc dự phòng khi DB chưa có lịch sử */
                                    <>
                                        <div style={styles.hItem}>
                                            <div style={styles.hRow}>
                                                <div>
                                                    <p style={{ ...styles.hStatus, color: '#4F7942' }}>HOÀN TẤT VÀO KHO</p>
                                                    <h4 style={styles.hId}>BATCH-00942</h4>
                                                    <div style={styles.hRouteDetails}>
                                                        <span><b>Từ:</b> Arabica</span>
                                                        <span><b>Đến:</b> Cà phê Arabica Rang Vừa</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={styles.hWeight}>60kg → Nhập 52.5kg</p>
                                                    <p style={styles.hLoss}>12.5% Loss</p>
                                                    <p style={styles.hMetaTime}>204.0°C | 14:00s</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                                <span style={{ ...styles.hTag, color: '#4F7942', borderColor: '#4F7942' }}>ĐÃ TĂNG THÀNH PHẨM</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button style={styles.viewLogBtn} onClick={fetchHistory}>
                                <FaSyncAlt /> CẬP NHẬT NHẬT KÝ MỚI NHẤT
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

// Cập nhật đầy đủ CSS Styles tương ứng
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
    batchTag: { padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' },
    inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '10px', fontWeight: '700', color: '#A89B8D' },
    select: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#F9F1E7', color: '#3D2B1F', fontWeight: '600', fontSize: '14px' },
    input: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#F9F1E7', fontSize: '16px', fontWeight: '600', color: '#3D2B1F' },
    executeBtn: { width: '100%', backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', cursor: 'pointer' },
    sensorRow: { display: 'flex', gap: '20px' },
    sCard: { flex: 1, backgroundColor: '#FFF', padding: '20px', borderRadius: '15px', borderLeft: '4px solid #3D2B1F', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    sLabel: { fontSize: '10px', fontWeight: '700', color: '#A89B8D', margin: '0 0 5px 0' },
    sValue: { fontSize: '22px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    
    // CSS Lịch sử
    historyCard: { flex: 1.2, backgroundColor: 'white', padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    historyList: { flex: 1, overflowY: 'auto', maxHeight: '450px', paddingRight: '5px' },
    hItem: { padding: '15px 0', borderBottom: '1px solid #F1F1F1' },
    hRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    hStatus: { fontSize: '10px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' },
    hId: { fontSize: '16px', fontWeight: '700', color: '#3D2B1F', margin: '2px 0' },
    hRouteDetails: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: '#6B7280', marginTop: '4px' },
    hWeight: { fontSize: '13px', fontWeight: '700', color: '#3D2B1F', margin: 0 },
    hLoss: { fontSize: '11px', color: '#D97706', fontWeight: '600', margin: '2px 0 0 0' },
    hMetaTime: { fontSize: '10px', color: '#9CA3AF', marginTop: '4px', margin: 0 },
    hTag: { fontSize: '9px', fontWeight: '800', padding: '3px 8px', border: '1px solid', borderRadius: '4px', backgroundColor: '#F0FDF4', letterSpacing: '0.5px' },
    viewLogBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#3D2B1F', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', backgroundColor: '#F9F1E7', borderRadius: '8px', transition: 'all 0.2s' }
};

export default ProcessingPage;