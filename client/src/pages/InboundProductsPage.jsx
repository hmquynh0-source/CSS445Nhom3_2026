import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRealTimeData } from '../context/RealTimeContext';
import { 
    FaFileCsv, FaChevronRight, FaEdit, 
    FaTint, FaArrowsAlt, FaExclamationTriangle, FaChartLine, FaSync, FaPrint, FaSearchLocation
} from 'react-icons/fa';

const InboundProductsPage = () => {
    const { token } = useAuth();
    const [selectedBatch, setSelectedBatch] = useState(null);

    // State quản lý trạng thái chỉnh sửa thông số QC
    const [isEditing, setIsEditing] = useState(false);
    const [qcForm, setQcForm] = useState({ moisture: '0', screenSize: 'Sàng 18', defects: '0' });

    // Cấu hình header để gửi Token
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // 1. FETCH DỮ LIỆU TỪ BACKEND
    const { data: apiResponse, loading, refresh } = useRealTimeData(
        'http://localhost:5000/api/inbound/products', 
        5000, 
        config
    );

    // 2. XỬ LÝ DỮ LIỆU VÀ TÍNH TOÁN BÁO CÁO (KPI)
    const { batches, stats } = useMemo(() => {
        const rawData = apiResponse?.data || [];
        
        const totalWeight = rawData.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
        const qcPassedCount = rawData.filter(item => item.status === 'QC PASSED').length;
        const qcRate = rawData.length > 0 ? ((qcPassedCount / rawData.length) * 100).toFixed(1) : "0.0";
        
        return { 
            batches: rawData, 
            stats: { totalWeight, qcRate, count: rawData.length } 
        };
    }, [apiResponse]);

    // Tự động chọn lô hàng đầu tiên khi mới load trang
    useEffect(() => {
        if (!selectedBatch && batches.length > 0) {
            setSelectedBatch(batches[0]);
        }
    }, [batches, selectedBatch]);

    // --- FUNCTION 1: XUẤT CSV ---
    const handleExportCSV = () => {
        if (batches.length === 0) return alert("Không có dữ liệu để xuất!");
        const headers = "Mã Lô (LOT),Sản Phẩm,Khối Lượng,Trạng Thái QC,Ngày Nhập\n";
        const rows = batches.map(b => {
            // Lấy tên hiển thị chuẩn để xuất file CSV
            const pName = b.product?.name || b.category?.name || b.productName || "Nhân xanh thô";
            return `${b.batchCode},${pName},${b.weight} kg,${b.status},${new Date(b.importDate || b.createdAt).toLocaleDateString('vi-VN')}`;
        }).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Intake_Ledger_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- FUNCTION 2: MỞ FORM CHỈNH SỬA QC ---
    const handleOpenEdit = () => {
        if (!selectedBatch) return;
        setQcForm({
            moisture: selectedBatch.moisture || '0',
            screenSize: selectedBatch.screenSize || selectedBatch.screen || 'Sàng 18',
            defects: selectedBatch.defects || selectedBatch.defectRate || '0'
        });
        setIsEditing(true);
    };

    // --- FUNCTION 3: LƯU THÔNG SỐ QC LÊN MONGO ---
    const handleSaveQC = async () => {
        try {
            const payload = {
                moisture: qcForm.moisture,
                screen: qcForm.screenSize, 
                defectRate: qcForm.defects
            };
            const res = await axios.put(`http://localhost:5000/api/inbound/update-qc/${selectedBatch.batchCode}`, payload, config);
            if (res.data.success) {
                alert("✅ Cập nhật thông số kiểm định QC thành công!");
                setIsEditing(false);
                refresh(); 
                setSelectedBatch({ ...selectedBatch, moisture: qcForm.moisture, screenSize: qcForm.screenSize, defects: qcForm.defects });
            }
        } catch (err) {
            alert("❌ Lỗi: Không thể cập nhật thông số QC.");
        }
    };

    // --- FUNCTION 4: IN TEM BARCODE LÔ HÀNG ---
    const handlePrintBarcode = () => {
        if (!selectedBatch) return;
        const currentProductName = selectedBatch.product?.name || selectedBatch.category?.name || selectedBatch.productName || "Cà phê nhân xanh";
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>In Tem Mã Lô</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
                    <h3 style="letter-spacing: 2px; margin: 0; color: #888;">ROASTLOGIC WMS</h3>
                    <hr style="border: 1px dashed #ccc; margin: 15px 0 Papayawhip;"/>
                    <h2 style="margin: 5px 0;">MÃ LÔ NHÂN XANH</h2>
                    <h1 style="font-size: 50px; font-weight: 900; letter-spacing: 5px; margin: 10px 0; font-family: monospace;">${selectedBatch.batchCode}</h1>
                    <p style="font-size: 16px; margin: 8px 0;"><b>Loại hạt nhân xanh:</b> ${currentProductName}</p>
                    <p style="font-size: 16px; margin: 8px 0;"><b>Khối lượng:</b> ${selectedBatch.weight} kg</p>
                    <p style="font-size: 14px; margin: 8px 0; color: #666;"><b>Ngày nhập:</b> ${new Date(selectedBatch.createdAt).toLocaleDateString('vi-VN')}</p>
                    <hr style="border: 1px dashed #ccc; margin: 20px 0;"/>
                    <div style="font-size: 12px; font-weight: bold; color: green;">[ QC PASSED - ĐỦ ĐIỀU KIỆN SẢN XUẤT ]</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // --- FUNCTION 5: TRUY XUẤT NGUỒN GỐC ---
    const handleTraceOrigin = async () => {
        if (!selectedBatch) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/inbound/trace/${selectedBatch.batchCode}`, config);
            const trace = res.data.traceData;
            alert(`🔍 [HÀNH TRÌNH TRUY XUẤT NGUỒN GỐC - LÔ ${trace.batchCode}]
--------------------------------------------------
- Chủng loại hạt: ${trace.productName || trace.categoryName || "Cà phê nhân thô"}
- Khối lượng tịnh: ${trace.weight} Kg
- Nhà cung ứng gốc: ${trace.supplierName}
- Thời gian cập kho thực tế: ${new Date(trace.importDate).toLocaleString('vi-VN')}
- Chứng chỉ giám định chất lượng: ${trace.qcStatus} (Đạt tiêu chuẩn xuất xưởng)`);
        } catch (err) {
            alert("⚠️ Không tìm thấy dữ liệu đối tác cung ứng gốc từ lịch sử giao dịch.");
        }
    };

    return (
        <div style={styles.container}>
            {/* Header Thống kê */}
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.pageTitle}>Intake Ledger & QC</h1>
                    <p style={styles.subTitle}>Nhật ký chi tiết các lô hàng đã nhập kho thực tế</p>
                </div>
                <div style={styles.statsOverview}>
                    <div style={styles.statMini}>
                        <p style={styles.statLabel}>TỔNG NHẬP TRONG KỲ</p>
                        <p style={styles.statValue}>{stats.totalWeight.toLocaleString()} kg</p>
                    </div>
                    <div style={styles.statMini}>
                        <p style={styles.statLabel}>TỶ LỆ ĐẠT CHUẨN</p>
                        <p style={{...styles.statValue, color: '#27ae60'}}>{stats.qcRate}%</p>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* CỘT TRÁI: DANH SÁCH LÔ HÀNG */}
                <div style={styles.leftColumn}>
                    <div style={styles.tableHeader}>
                        <h2 style={styles.sectionTitle}>LỊCH SỬ LÔ HÀNG ({stats.count})</h2>
                        <div style={styles.headerActions}>
                            <button style={styles.syncBtn} onClick={() => refresh()}>
                                <FaSync className={loading ? 'fa-spin' : ''} /> LÀM MỚI
                            </button>
                            <button style={styles.darkBtn} onClick={handleExportCSV}><FaFileCsv /> XUẤT CSV</button>
                        </div>
                    </div>

                    <div style={styles.tableBody}>
                        <div style={styles.thead}>
                            <div style={{flex: 1}}>MÃ LÔ (LOT)</div>
                            <div style={{flex: 2}}>LOẠI NHÂN XANH</div>
                            <div style={{flex: 1}}>KHỐI LƯỢNG</div>
                            <div style={{flex: 1.2}}>TRẠNG THÁI QC</div>
                            <div style={{width: 30}}></div>
                        </div>

                        {batches.length === 0 && !loading && (
                            <div style={styles.emptyMsg}>Chưa có dữ liệu. Hãy duyệt phiếu nhập kho để tạo lô hàng.</div>
                        )}

                        {batches.map((item) => {
                            // ĐÃ SỬA: Tự động bóc tách tên từ populate object hoặc chuỗi text dự phòng để hiện rõ loại nhân xanh
                            const displayProductName = item.product?.name || item.category?.name || item.productName || "Cà phê nhân xanh";

                            return (
                                <div 
                                    key={item._id} 
                                    style={{
                                        ...styles.tr, 
                                        backgroundColor: selectedBatch?._id === item._id ? '#FDF5EC' : 'white',
                                        borderLeft: selectedBatch?._id === item._id ? '4px solid #3D2B1F' : '4px solid transparent'
                                    }}
                                    onClick={() => {
                                        setSelectedBatch(item);
                                        setIsEditing(false); 
                                    }}
                                >
                                    <div style={{flex: 1, fontWeight: 'bold', color: '#8D6D4D'}}>{item.batchCode}</div>
                                    <div style={{flex: 2}}>
                                        {/* Hiển thị tên loại nhân xanh rõ ràng */}
                                        <div style={{fontWeight: '700', color: '#3D2B1F'}}>{displayProductName}</div>
                                        <div style={styles.subText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    <div style={{flex: 1, fontWeight: '700'}}>{item.weight} kg</div>
                                    <div style={{flex: 1.2}}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: item.status === 'QC PASSED' ? '#e1f5e9' : '#fff4e5',
                                            color: item.status === 'QC PASSED' ? '#2e7d32' : '#d87b00'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div style={{width: 30}}><FaChevronRight color="#ccc" /></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT KIỂM ĐỊNH */}
                <div style={styles.rightColumn}>
                    {selectedBatch ? (
                        <div style={styles.detailCard}>
                            <div style={styles.detailHeader}>
                                <div>
                                    <p style={styles.detailSub}>CHI TIẾT LÔ HÀNG</p>
                                    <h3 style={styles.detailTitle}>{selectedBatch.batchCode}</h3>
                                    {/* HIỂN THỊ THÊM CHỦNGLOẠI HẠT Ở THẺ CHI TIẾT */}
                                    <p style={{fontSize: '13px', fontWeight: 'bold', color: '#8D6D4D', marginTop: '4px'}}>
                                        Loại hạt: {selectedBatch.product?.name || selectedBatch.category?.name || selectedBatch.productName || "Nhân xanh thô"}
                                    </p>
                                </div>
                                <button style={styles.editBtn} onClick={handleOpenEdit}><FaEdit /></button>
                            </div>

                            {isEditing ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FDFCFB', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #EAE2D8'}}>
                                    <div>
                                        <label style={{fontSize: '10px', fontWeight: '800', color: '#A89B8D', display: 'block', marginBottom: '4px'}}>ĐỘ ẨM (%)</label>
                                        <input type="number" value={qcForm.moisture} onChange={(e) => setQcForm({...qcForm, moisture: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EAE2D8', fontWeight: '700', outline: 'none'}} />
                                    </div>
                                    <div>
                                        <label style={{fontSize: '10px', fontWeight: '800', color: '#A89B8D', display: 'block', marginBottom: '4px'}}>CỠ SÀNG</label>
                                        <select value={qcForm.screenSize} onChange={(e) => setQcForm({...qcForm, screenSize: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EAE2D8', fontWeight: '700', backgroundColor: 'white'}}>
                                            <option value="Sàng 18">Sàng 18</option>
                                            <option value="Sàng 16">Sàng 16</option>
                                            <option value="Sàng 13">Sàng 13</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{fontSize: '10px', fontWeight: '800', color: '#A89B8D', display: 'block', marginBottom: '4px'}}>TỶ LỆ LỖI (%)</label>
                                        <input type="number" value={qcForm.defects} onChange={(e) => setQcForm({...qcForm, defects: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EAE2D8', fontWeight: '700', outline: 'none'}} />
                                    </div>
                                    <div style={{display: 'flex', gap: '8px', marginTop: '5px'}}>
                                        <button onClick={handleSaveQC} style={{flex: 1, padding: '8px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px', cursor: 'pointer'}}>LƯU CHỈNH SỬA</button>
                                        <button onClick={() => setIsEditing(false)} style={{flex: 1, padding: '8px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px', cursor: 'pointer'}}>HỦY</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.qcStats}>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaTint color="#8D6D4D" /> ĐỘ ẨM</div>
                                        <div style={styles.qcValue}>
                                            {selectedBatch.moisture || 0}% 
                                            <span style={{...styles.optimalTag, backgroundColor: '#e1f5e9', color: '#2e7d32'}}>
                                                {Number(selectedBatch.moisture) <= 12.5 ? 'ĐẠT' : 'CAO'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaArrowsAlt color="#8D6D4D" /> CỠ SÀNG</div>
                                        <div style={styles.qcValue}>{selectedBatch.screenSize || selectedBatch.screen || 'Sàng 18'}</div>
                                    </div>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaExclamationTriangle color="#d9534f" /> TỶ LỆ LỖI</div>
                                        <div style={styles.qcValue}>{selectedBatch.defects || selectedBatch.defectRate || 0}%</div>
                                    </div>
                                </div>
                            )}

                            <div style={styles.trendCard}>
                                <p style={styles.trendLabel}><FaChartLine /> Nhân viên duyệt</p>
                                <p style={styles.trendValue}>{selectedBatch.staffName || 'Admin'}</p>
                            </div>

                            <div style={{...styles.actionGrid, marginTop: '20px'}}>
                                <button style={{...styles.inStockBtn, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}} onClick={handlePrintBarcode}>
                                    <FaPrint size={11} /> IN TEM LÔ
                                </button>
                                <button style={{...styles.reportBtn, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}} onClick={handleTraceOrigin}>
                                    <FaSearchLocation size={11} /> TRUY XUẤT
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyDetail}>Chọn một lô để xem thông số</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '25px', backgroundColor: '#F9F7F2', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
    pageTitle: { fontSize: '28px', fontWeight: '800', color: '#3D2B1F', margin: 0 },
    subTitle: { fontSize: '14px', color: '#A89B8D', margin: '5px 0 0 0' },
    statsOverview: { display: 'flex', gap: '15px' },
    statMini: { backgroundColor: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid #EAE2D8', minWidth: '150px' },
    statLabel: { fontSize: '9px', fontWeight: '800', color: '#A89B8D', marginBottom: '4px' },
    statValue: { fontSize: '18px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' },
    leftColumn: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #EAE2D8' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#3D2B1F' },
    headerActions: { display: 'flex', gap: '8px' },
    syncBtn: { padding: '6px 12px', border: '1px solid #EAE2D8', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    darkBtn: { padding: '6px 12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    thead: { display: 'flex', padding: '10px', backgroundColor: '#FDFCFB', color: '#A89B8D', fontSize: '10px', fontWeight: '800' },
    tr: { display: 'flex', padding: '15px 10px', borderBottom: '1px solid #F8F4F0', alignItems: 'center', fontSize: '13px', cursor: 'pointer' },
    subText: { fontSize: '11px', color: '#A89B8D' },
    statusBadge: { padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
    rightColumn: { position: 'sticky', top: '20px' },
    detailCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #EAE2D8' },
    detailHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    detailSub: { fontSize: '10px', fontWeight: '800', color: '#A89B8D', margin: 0 },
    detailTitle: { fontSize: '20px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    editBtn: { background: '#F8F4F0', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
    qcStats: { display: 'flex', flexDirection: 'column', gap: '15px' },
    qcRow: { borderBottom: '1px solid #F8F4F0', paddingBottom: '10px' },
    qcInfo: { fontSize: '10px', fontWeight: '800', color: '#A89B8D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' },
    qcValue: { fontSize: '16px', fontWeight: '900', color: '#3D2B1F', display: 'flex', alignItems: 'center', gap: '8px' },
    optimalTag: { fontSize: '9px', padding: '2px 5px', borderRadius: '3px' },
    trendCard: { backgroundColor: '#FDF5EC', padding: '12px', borderRadius: '8px', border: '1px dashed #EAE2D8', marginTop: '15px' },
    trendLabel: { fontSize: '10px', fontWeight: '800', color: '#A89B8D', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' },
    trendValue: { fontSize: '13px', fontWeight: '700', color: '#3D2B1F', margin: 0 },
    actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    inStockBtn: { padding: '10px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px' },
    reportBtn: { padding: '10px', backgroundColor: '#F1E9DE', color: '#3D2B1F', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px' },
    emptyMsg: { textAlign: 'center', padding: '30px', color: '#A89B8D' },
    emptyDetail: { padding: '30px', textAlign: 'center', color: '#A89B8D', border: '1px dashed #CCC', borderRadius: '16px' }
};

export default InboundProductsPage;