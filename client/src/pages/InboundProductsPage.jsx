import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRealTimeData } from '../context/RealTimeContext';
import { 
    FaFileCsv, FaEdit, FaPlus, FaTrashAlt,
    FaTint, FaArrowsAlt, FaExclamationTriangle, FaChartLine, FaSync, FaPrint, FaSearchLocation, FaCheckCircle
} from 'react-icons/fa';

// Hệ thống danh mục dự phòng cứng nếu API Danh mục gặp sự cố
const DEFAULT_COFFEE_CATEGORIES = [
    { _id: '1', name: 'Arabica' },
    { _id: '2', name: 'Robusta' },
    { _id: '3', name: 'Blend' },
    { _id: '4', name: 'Liberica' },
    { _id: '5', name: 'Moka' }
];

const InboundProductsPage = () => {
    const { token } = useAuth();
    const [selectedBatch, setSelectedBatch] = useState(null);

    // --- STATE QUẢN LÝ POPUP THÊM / SỬA PHIẾU NHẬP ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' hoặc 'EDIT'
    const [systemCategories, setSystemCategories] = useState([]); // Đồng bộ danh mục hạt cà phê

    const [mainForm, setMainForm] = useState({
        requestId: '',
        productName: '', // Lưu tên danh mục hạt được chọn
        quantity: '',
        supplierName: '',
        moisture: '12.0',
        screenSize: 'Sàng 18',
        defects: '1.0'
    });

    // State quản lý trạng thái chỉnh sửa nhanh thông số QC ở cột phải
    const [isEditingQC, setIsEditingQC] = useState(false);
    const [qcForm, setQcForm] = useState({ moisture: '0', screenSize: 'Sàng 18', defects: '0' });
    
    // State xử lý loading cục bộ
    const [isConfirming, setIsConfirming] = useState(false);

    // Cấu hình header gửi Token danh tính
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // 1. FETCH DỮ LIỆU REALTIME TỪ BACKEND CHO LÔ HÀNG
    const { data: apiResponse, loading, refresh } = useRealTimeData(
        'http://localhost:5000/api/inbound', 
        5000, 
        config
    );

    // FETCH DANH MỤC HẠT CÀ PHÊ HỆ THỐNG
    const fetchSystemCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/supplier-stocks/categories', config);
            if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setSystemCategories(response.data.data);
            } else {
                setSystemCategories(DEFAULT_COFFEE_CATEGORIES);
            }
        } catch (err) {
            console.error("Lỗi đồng bộ API danh mục:", err);
            setSystemCategories(DEFAULT_COFFEE_CATEGORIES);
        }
    };

    useEffect(() => {
        fetchSystemCategories();
    }, [token]);

    // 2. XỬ LÝ DỮ LIỆU VÀ TÍNH TOÁN BÁO CÁO (KPI)
    const { batches, stats } = useMemo(() => {
        const rawData = apiResponse?.data || [];
        const totalWeight = rawData.reduce((sum, item) => sum + (Number(item.quantity || item.weight) || 0), 0);
        const qcPassedCount = rawData.filter(item => item.status === 'COMPLETED' || item.status === 'APPROVED').length;
        const qcRate = rawData.length > 0 ? ((qcPassedCount / rawData.length) * 100).toFixed(1) : "0.0";
        
        return { 
            batches: rawData, 
            stats: { totalWeight, qcRate, count: rawData.length } 
        };
    }, [apiResponse]);

    // Tự động đồng bộ lô hàng đang chọn
    useEffect(() => {
        if (!selectedBatch && batches.length > 0) {
            setSelectedBatch(batches[0]);
        } else if (selectedBatch && batches.length > 0) {
            const updated = batches.find(b => b._id === selectedBatch._id);
            if (updated) setSelectedBatch(updated);
        }
    }, [batches, selectedBatch]);

    // --- HÀM 1: MỞ MODAL TẠO MỚI PHIẾU ---
    const openCreateModal = () => {
        setModalMode('CREATE');
        const defaultCategoryName = systemCategories.length > 0 ? systemCategories[0].name : 'Arabica';
        setMainForm({
            requestId: `REQ-${Date.now().toString().slice(-6)}`,
            productName: defaultCategoryName, // Gán loại hạt đầu tiên làm mặc định
            quantity: '',
            supplierName: '',
            moisture: '12.0',
            screenSize: 'Sàng 18',
            defects: '1.0'
        });
        setIsModalOpen(true);
    };

    // --- HÀM 2: MỞ MODAL SỬA PHIẾU ---
    const openEditModal = (batch, e) => {
        e.stopPropagation(); 
        setModalMode('EDIT');
        setSelectedBatch(batch);
        setMainForm({
            ...mainForm,
            _id: batch._id,
            requestId: batch.requestId || batch.batchCode || '',
            productName: batch.product?.name || batch.productName || '',
            quantity: batch.quantity || batch.weight || '',
            supplierName: batch.supplier?.name || batch.supplierName || '',
            moisture: batch.moisture || '12.0',
            screenSize: batch.screenSize || batch.screen || 'Sàng 18',
            defects: batch.defects || batch.defectRate || '1.0'
        });
        setIsModalOpen(true);
    };

    // --- HÀM 3: LƯU FORM (THÊM HOẶC SỬA) ---
    const handleSaveMainForm = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'CREATE') {
                const res = await axios.post('http://localhost:5000/api/inbound', mainForm, config);
                if (res.data.success || res.status === 201) {
                    alert("✅ Thêm mới phiếu nhập kho thành công!");
                }
            } else {
                const res = await axios.put(`http://localhost:5000/api/inbound/${mainForm._id}`, mainForm, config);
                if (res.data.success || res.status === 200) {
                    alert("✅ Cập nhật thông tin phiếu nhập thành công!");
                }
            }
            setIsModalOpen(false);
            refresh();
        } catch (err) {
            alert(`❌ Thất bại: ${err.response?.data?.message || "Lỗi xử lý hệ thống."}`);
        }
    };

    // --- HÀM 4: XÓA PHIẾU NHẬP ---
    const handleDeleteBatch = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa phiếu nhập kho này không? Dữ liệu sẽ mất vĩnh viễn.")) return;
        try {
            const res = await axios.delete(`http://localhost:5000/api/inbound/${id}`, config);
            if (res.data.success || res.status === 200) {
                alert("🗑️ Đã xóa phiếu nhập thành công!");
                setSelectedBatch(null);
                refresh();
            }
        } catch (err) {
            alert("❌ Không thể xóa: " + (err.response?.data?.message || "Lỗi đường truyền."));
        }
    };

    // --- HÀM 5: XUẤT CSV ---
    const handleExportCSV = () => {
        if (batches.length === 0) return alert("Không có dữ liệu để xuất!");
        const headers = "Mã Lô (LOT),Sản Phẩm,Khối Lượng,Trạng Thái Đơn,Ngày Nhập\n";
        const rows = batches.map(b => {
            const pName = b.product?.name || b.category?.name || b.productName || "Nhân xanh thô";
            return `${b.requestId || b.batchCode || 'N/A'},${pName},${b.quantity || b.weight} kg,${b.status},${new Date(b.createdAt).toLocaleDateString('vi-VN')}`;
        }).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Inbound_Ledger_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- HÀM 6: CẬP NHẬT NHANH QC (CỘT PHẢI) ---
    const handleOpenEditQC = () => {
        if (!selectedBatch) return;
        setQcForm({
            moisture: selectedBatch.moisture || '12.0',
            screenSize: selectedBatch.screenSize || selectedBatch.screen || 'Sàng 18',
            defects: selectedBatch.defects || selectedBatch.defectRate || '1.5'
        });
        setIsEditingQC(true);
    };

    const handleSaveQC = async () => {
        try {
            const payload = {
                moisture: qcForm.moisture,
                screen: qcForm.screenSize, 
                defectRate: qcForm.defects
            };
            const targetId = selectedBatch.requestId || selectedBatch.batchCode;
            const res = await axios.put(`http://localhost:5000/api/inbound/update-qc/${targetId}`, payload, config);
            if (res.data.success) {
                alert("✅ Cập nhật thông số kiểm định QC thành công!");
                setIsEditingQC(false);
                refresh(); 
            }
        } catch (err) {
            alert("❌ Lỗi: Hệ thống không phản hồi form QC.");
        }
    };

    // --- HÀM 7: XÁC NHẬN NHẬP KHO THỰC TẾ ---
    const handleConfirmReceipt = async () => {
        if (!selectedBatch) return;
        const targetId = selectedBatch._id;
        const targetProductName = selectedBatch.product?.name || selectedBatch.productName || "Blend";
        const targetQuantity = selectedBatch.quantity || selectedBatch.weight || 0;

        if (!window.confirm(`Bạn có chắc chắn muốn xác nhận nhập kho thực tế cho lô hàng ${targetQuantity} KG hạt ${targetProductName} này không?\nHành động này sẽ chính thức cộng số lượng vào tồn kho hệ thống của Admin.`)) {
            return;
        }

        try {
            setIsConfirming(true);
            const res = await axios.put(`http://localhost:5000/api/inbound/confirm-receipt/${targetId}`, {}, config);
            if (res.data.success) {
                alert(`✅ Thành công: ${res.data.message}`);
                refresh();
            }
        } catch (err) {
            alert(`❌ Không thể xác nhận: ${err.response?.data?.message || "Lỗi hệ thống."}`);
        } finally {
            setIsConfirming(false);
        }
    };

    // --- HÀM 8: IN TEM BARCODE LÔ HÀNG ---
    const handlePrintBarcode = () => {
        if (!selectedBatch) return;
        const currentProductName = selectedBatch.product?.name || selectedBatch.category?.name || selectedBatch.productName || "Cà phê nhân xanh";
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>In Tem Mã Lô</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
                    <h3 style="letter-spacing: 2px; margin: 0; color: #888;">ROASTLOGIC WMS</h3>
                    <hr style="border: 1px dashed #ccc; margin: 15px 0;"/>
                    <h2 style="margin: 5px 0;">MÃ LÔ NHÂN XANH</h2>
                    <h1 style="font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 10px 0; font-family: monospace;">${selectedBatch.requestId || selectedBatch.batchCode}</h1>
                    <p style="font-size: 16px; margin: 8px 0;"><b>Loại hạt nhân xanh:</b> ${currentProductName}</p>
                    <p style="font-size: 16px; margin: 8px 0;"><b>Khối lượng:</b> ${selectedBatch.quantity || selectedBatch.weight} kg</p>
                    <p style="font-size: 14px; margin: 8px 0; color: #666;"><b>Ngày chứng thực:</b> ${new Date(selectedBatch.createdAt).toLocaleDateString('vi-VN')}</p>
                    <hr style="border: 1px dashed #ccc; margin: 20px 0"/>
                    <div style="font-size: 14px; font-weight: bold; color: green;">[ ${selectedBatch.status} - HOÀN TẤT THỦ TỤC ]</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // --- HÀM 9: TRUY XUẤT NGUỒN GỐC ---
    const handleTraceOrigin = () => {
        if (!selectedBatch) return;
        const pName = selectedBatch.product?.name || selectedBatch.productName || "Cà phê nhân thô";
        const supplierName = selectedBatch.supplier?.name || selectedBatch.supplierName || "Nhà cung ứng đối tác";
        const weight = selectedBatch.quantity || selectedBatch.weight || 0;

        alert(`🔍 [HÀNH TRÌNH TRUY XUẤT NGUỒN GỐC - LÔ ${selectedBatch.requestId || 'CHƯA CẤP'}]
--------------------------------------------------
- Chủng loại hạt: ${pName}
- Khối lượng tịnh: ${weight} Kg
- Nhà cung ứng gốc: ${supplierName}
- Trạng thái hiện tại: ${selectedBatch.status === 'COMPLETED' ? 'Đã xếp dỡ vào kho Admin tổng' : 'Đơn hàng mới ở bước bàn giao'}`);
    };

    return (
        <div style={styles.container}>
            {/* Header Thống kê */}
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.pageTitle}>Intake Ledger & QC Management</h1>
                    <p style={styles.subTitle}>Hệ thống quản lý, cập nhật sản phẩm và đối soát quy trình kho vận tổng hợp</p>
                </div>
                <div style={styles.statsOverview}>
                    <div style={styles.statMini}>
                        <p style={styles.statLabel}>TỔNG KHỐI LƯỢNG YÊU CẦU</p>
                        <p style={styles.statValue}>{stats.totalWeight.toLocaleString()} kg</p>
                    </div>
                    <div style={styles.statMini}>
                        <p style={styles.statLabel}>TỶ LỆ XỬ LÝ KHỚP</p>
                        <p style={{...styles.statValue, color: '#27ae60'}}>{stats.qcRate}%</p>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* CỘT TRÁI: DANH SÁCH LÔ HÀNG PHIẾU NHẬP */}
                <div style={styles.leftColumn}>
                    <div style={styles.tableHeader}>
                        <h2 style={styles.sectionTitle}>DANH SÁCH PHIẾU NHẬP KHO ({stats.count})</h2>
                        <div style={styles.headerActions}>
                            <button style={styles.greenBtn} onClick={openCreateModal}>
                                <FaPlus /> THÊM SẢN PHẨM
                            </button>
                            <button style={styles.syncBtn} onClick={() => refresh()}>
                                <FaSync className={loading ? 'fa-spin' : ''} /> LÀM MỚI
                            </button>
                            <button style={styles.darkBtn} onClick={handleExportCSV}><FaFileCsv /> XUẤT CSV</button>
                        </div>
                    </div>

                    <div style={styles.tableBody}>
                        <div style={styles.thead}>
                            <div style={{flex: 1.2}}>MÃ PHIẾU (ID)</div>
                            <div style={{flex: 2}}>LOẠI NHÂN XANH</div>
                            <div style={{flex: 1}}>KHỐI LƯỢNG</div>
                            <div style={{flex: 1.3}}>TRẠNG THÁI ĐƠN</div>
                            <div style={{width: 70, textAlign: 'center'}}>THAO TÁC</div>
                        </div>

                        {batches.length === 0 && !loading && (
                            <div style={styles.emptyMsg}>Hệ thống chưa ghi nhận phiếu nhập kho nào.</div>
                        )}

                        {batches.map((item) => {
                            const displayProductName = item.product?.name || item.productName || "Cà phê nhân xanh";
                            
                            let badgeBg = '#fff4e5';
                            let badgeColor = '#d87b00';
                            if (item.status === 'COMPLETED') {
                                badgeBg = '#e1f5e9'; 
                                badgeColor = '#2e7d32';
                            } else if (item.status === 'APPROVED') {
                                badgeBg = '#e3f2fd'; 
                                badgeColor = '#1565c0';
                            }

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
                                        setIsEditingQC(false); 
                                    }}
                                >
                                    <div style={{flex: 1.2, fontWeight: 'bold', color: '#8D6D4D', fontSize: '12px'}}>{item.requestId || 'REQ-IM-INFO'}</div>
                                    <div style={{flex: 2}}>
                                        <div style={{fontWeight: '700', color: '#3D2B1F'}}>{displayProductName}</div>
                                        <div style={styles.subText}>NCC: {item.supplier?.name || item.supplierName || 'Đối tác cung ứng'}</div>
                                    </div>
                                    <div style={{flex: 1, fontWeight: '700'}}>{item.quantity || item.weight} kg</div>
                                    <div style={{flex: 1.3}}>
                                        <span style={{ ...styles.statusBadge, backgroundColor: badgeBg, color: badgeColor }}>
                                            {item.status === 'APPROVED' ? 'ĐÃ DUYỆT (CHỜ NHẬP)' : item.status}
                                        </span>
                                    </div>
                                    <div style={{width: 70, display: 'flex', gap: '8px', justifyContent: 'center'}} onClick={(e)=>e.stopPropagation()}>
                                        <button style={styles.miniActionBtnEdit} title="Chỉnh sửa thông tin" onClick={(e) => openEditModal(item, e)}><FaEdit /></button>
                                        <button style={styles.miniActionBtnDelete} title="Xóa phiếu" onClick={(e) => handleDeleteBatch(item._id, e)}><FaTrashAlt /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN & XÁC NHẬN NHẬP KHO */}
                <div style={styles.rightColumn}>
                    {selectedBatch ? (
                        <div style={styles.detailCard}>
                            <div style={styles.detailHeader}>
                                <div>
                                    <p style={styles.detailSub}>THÔNG TIN XỬ LÝ LÔ</p>
                                    <h3 style={styles.detailTitle}>{selectedBatch.requestId || 'PHIẾU NHẬP KHO'}</h3>
                                    <p style={{fontSize: '13px', fontWeight: 'bold', color: '#8D6D4D', marginTop: '4px'}}>
                                        Hạt tương ứng: {selectedBatch.product?.name || selectedBatch.productName || "Nhân xanh thô"}
                                    </p>
                                </div>
                                <button style={styles.editBtn} onClick={handleOpenEditQC} title="Chỉnh sửa nhanh thông số chất lượng"><FaEdit /></button>
                            </div>

                            {selectedBatch.status === 'APPROVED' && (
                                <button 
                                    style={styles.confirmReceiptBtn} 
                                    onClick={handleConfirmReceipt}
                                    disabled={isConfirming}
                                >
                                    <FaCheckCircle /> {isConfirming ? 'ĐANG TIẾN HÀNH...' : 'XÁC NHẬN NHẬP KHO'}
                                </button>
                            )}

                            {selectedBatch.status === 'COMPLETED' && (
                                <div style={styles.completedBadgeAlert}>
                                    ✓ ĐÃ NHẬP KHO TỔNG & CỘNG KHỐI LƯỢNG ADMIN
                                </div>
                            )}

                            {isEditingQC ? (
                                <div style={styles.qcEditBox}>
                                    <div>
                                        <label style={styles.miniLabel}>ĐỘ ẨM KIỂM ĐỊNH (%)</label>
                                        <input type="number" value={qcForm.moisture} onChange={(e) => setQcForm({...qcForm, moisture: e.target.value})} style={styles.inputStyle} />
                                    </div>
                                    <div>
                                        <label style={styles.miniLabel}>TIÊU CHUẨN CỠ SÀNG</label>
                                        <select value={qcForm.screenSize} onChange={(e) => setQcForm({...qcForm, screenSize: e.target.value})} style={styles.selectStyle}>
                                            <option value="Sàng 18">Sàng 18 (Xuất khẩu)</option>
                                            <option value="Sàng 16">Sàng 16 (Thương mại)</option>
                                            <option value="Sàng 13">Sàng 13 (Hạt xô)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.miniLabel}>TỶ LỆ TẠP CHẤT / LỖI (%)</label>
                                        <input type="number" value={qcForm.defects} onChange={(e) => setQcForm({...qcForm, defects: e.target.value})} style={styles.inputStyle} />
                                    </div>
                                    <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                                        <button onClick={handleSaveQC} style={styles.submitMiniBtn}>CẬP NHẬT</button>
                                        <button onClick={() => setIsEditingQC(false)} style={styles.cancelMiniBtn}>HỦY</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.qcStats}>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaTint color="#8D6D4D" /> THÔNG SỐ ĐỘ ẨM</div>
                                        <div style={styles.qcValue}>
                                            {selectedBatch.moisture || 12.2}% 
                                            <span style={{...styles.optimalTag, backgroundColor: Number(selectedBatch.moisture || 12.2) <= 12.5 ? '#e1f5e9' : '#ffebee', color: Number(selectedBatch.moisture || 12.2) <= 12.5 ? '#2e7d32' : '#c62828'}}>
                                                {Number(selectedBatch.moisture || 12.2) <= 12.5 ? 'ĐẠT CHUẨN' : 'VƯỢT NGƯỠNG'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaArrowsAlt color="#8D6D4D" /> PHÂN LOẠI SÀNG</div>
                                        <div style={styles.qcValue}>{selectedBatch.screenSize || selectedBatch.screen || 'Sàng 18'}</div>
                                    </div>
                                    <div style={styles.qcRow}>
                                        <div style={styles.qcInfo}><FaExclamationTriangle color="#d9534f" /> TỶ LỆ HẠT LỖI TẠP CHẤT</div>
                                        <div style={styles.qcValue}>{selectedBatch.defects || selectedBatch.defectRate || 1.1}%</div>
                                    </div>
                                </div>
                            )}

                            <div style={styles.trendCard}>
                                <p style={styles.trendLabel}><FaChartLine /> Nhật ký phụ trách kiểm kho</p>
                                <p style={styles.trendValue}>{selectedBatch.user || 'Nhân sự Ban Kho Vận'}</p>
                            </div>

                            <div style={{...styles.actionGrid, marginTop: '20px', display: 'flex', gap: '10px'}}>
                                <button style={styles.inStockBtn} onClick={handlePrintBarcode}>
                                    <FaPrint size={11} /> IN TEM LÔ
                                </button>
                                <button style={styles.reportBtn} onClick={handleTraceOrigin}>
                                    <FaSearchLocation size={11} /> TRUY XUẤT
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyDetail}>Vui lòng chọn một phiếu nhập kho từ danh sách để thực hiện đối soát hoặc xác nhận hàng.</div>
                    )}
                </div>
            </div>

            {/* --- MODAL POPUP: FORM THÊM / SỬA SẢN PHẨM PHIẾU NHẬP --- */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {modalMode === 'CREATE' ? '➕ THÊM SẢN PHẨM VÀO PHIẾU NHẬP MỚI' : '📝 CHỈNH SỬA THÔNG TIN PHIẾU NHẬP KHO'}
                            </h3>
                            <button style={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveMainForm} style={styles.modalForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Mã Phiếu Yêu Cầu (ID)</label>
                                <input type="text" value={mainForm.requestId} onChange={(e)=>setMainForm({...mainForm, requestId: e.target.value})} style={styles.formInput} required disabled={modalMode === 'EDIT'} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Tên Sản Phẩm (Loại hạt nhân xanh)</label>
                                {/* CHUYỂN THÀNH SELECT DROPDOWN ĐỂ CHỈ NHẬP HẠT */}
                                <select 
                                    value={mainForm.productName} 
                                    onChange={(e)=>setMainForm({...mainForm, productName: e.target.value})} 
                                    style={styles.formSelect}
                                >
                                    {systemCategories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Nhà Cung Cấp</label>
                                <input type="text" placeholder="Tên đơn vị đối tác cung ứng" value={mainForm.supplierName} onChange={(e)=>setMainForm({...mainForm, supplierName: e.target.value})} style={styles.formInput} required />
                            </div>
                            <div style={styles.formRow}>
                                <div style={{flex: 1, marginRight: '10px'}}>
                                    <label style={styles.formLabel}>Khối Lượng (Kg)</label>
                                    <input type="number" placeholder="Số lượng nhập" value={mainForm.quantity} onChange={(e)=>setMainForm({...mainForm, quantity: e.target.value})} style={styles.formInput} required />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={styles.formLabel}>Độ Ẩm (%)</label>
                                    <input type="number" step="0.1" value={mainForm.moisture} onChange={(e)=>setMainForm({...mainForm, moisture: e.target.value})} style={styles.formInput} />
                                </div>
                            </div>
                            <div style={styles.formRow}>
                                <div style={{flex: 1, marginRight: '10px'}}>
                                    <label style={styles.formLabel}>Kích Cỡ Sàng</label>
                                    <select value={mainForm.screenSize} onChange={(e)=>setMainForm({...mainForm, screenSize: e.target.value})} style={styles.formSelect}>
                                        <option value="Sàng 18">Sàng 18 (Xuất khẩu)</option>
                                        <option value="Sàng 16">Sàng 16 (Thương mại)</option>
                                        <option value="Sàng 13">Sàng 13 (Hạt xô)</option>
                                    </select>
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={styles.formLabel}>Tỷ Lệ Lỗi / Tạp chất (%)</label>
                                    <input type="number" step="0.1" value={mainForm.defects} onChange={(e)=>setMainForm({...mainForm, defects: e.target.value})} style={styles.formInput} />
                                </div>
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Hủy Bỏ</button>
                                <button type="submit" style={styles.submitBtn}>Xác Nhận Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- HỆ THỐNG CSS-IN-JS HOÀN CHỈNH, MƯỢT MÀ ---
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
    sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    headerActions: { display: 'flex', gap: '8px' },
    greenBtn: { padding: '6px 14px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    syncBtn: { padding: '6px 12px', border: '1px solid #EAE2D8', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    darkBtn: { padding: '6px 12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    thead: { display: 'flex', padding: '10px', backgroundColor: '#FDFCFB', color: '#A89B8D', fontSize: '10px', fontWeight: '800' },
    tr: { display: 'flex', padding: '15px 10px', borderBottom: '1px solid #F8F4F0', alignItems: 'center', fontSize: '13px', cursor: 'pointer' },
    subText: { fontSize: '11px', color: '#A89B8D', marginTop: '2px' },
    statusBadge: { padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
    miniActionBtnEdit: { border: 'none', background: '#e3f2fd', color: '#1565c0', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' },
    miniActionBtnDelete: { border: 'none', background: '#ffebee', color: '#c62828', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' },
    rightColumn: { position: 'sticky', top: '20px' },
    detailCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #EAE2D8' },
    detailHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    detailSub: { fontSize: '10px', fontWeight: '800', color: '#A89B8D', margin: 0 },
    detailTitle: { fontSize: '18px', fontWeight: '900', color: '#3D2B1F', margin: 0, wordBreak: 'break-all' },
    editBtn: { background: '#F8F4F0', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start' },
    confirmReceiptBtn: { width: '100%', padding: '12px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    completedBadgeAlert: { width: '100%', padding: '12px', backgroundColor: '#e1f5e9', color: '#2e7d32', borderRadius: '8px', fontWeight: '800', fontSize: '11px', marginBottom: '20px', textAlign: 'center' },
    qcEditBox: { backgroundColor: '#FDFCFB', padding: '15px', borderRadius: '8px', border: '1px dashed #EAE2D8', display: 'flex', flexDirection: 'column', gap: '10px' },
    miniLabel: { fontSize: '9px', fontWeight: '800', color: '#A89B8D' },
    inputStyle: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #EAE2D8' },
    selectStyle: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #EAE2D8' },
    submitMiniBtn: { padding: '6px 12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
    cancelMiniBtn: { padding: '6px 12px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
    qcStats: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
    qcRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #F8F4F0' },
    qcInfo: { fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' },
    qcValue: { fontSize: '13px', fontWeight: '700', color: '#3D2B1F', display: 'flex', alignItems: 'center', gap: '5px' },
    optimalTag: { fontSize: '9px', padding: '2px 5px', borderRadius: '3px', fontWeight: '800' },
    trendCard: { backgroundColor: '#FDFCFB', padding: '12px', borderRadius: '8px', border: '1px solid #F0EAE1' },
    trendLabel: { fontSize: '11px', color: '#A89B8D', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '5px' },
    trendValue: { fontSize: '13px', fontWeight: '700', color: '#3D2B1F', margin: 0 },
    inStockBtn: { flex: 1, padding: '10px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    reportBtn: { flex: 1, padding: '10px', border: '1px solid #3D2B1F', color: '#3D2B1F', backgroundColor: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    emptyDetail: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px dashed #A89B8D', color: '#A89B8D', textAlign: 'center', fontSize: '13px' },
    emptyMsg: { padding: '20px', textAlign: 'center', color: '#A89B8D', fontSize: '13px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', width: '480px', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle: { fontSize: '14px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
    closeModalBtn: { border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#A89B8D' },
    modalForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    formRow: { display: 'flex', justifyContent: 'space-between' },
    formLabel: { fontSize: '11px', fontWeight: '700', color: '#3D2B1F' },
    formInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE2D8', fontSize: '13px' },
    formSelect: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE2D8', fontSize: '13px', backgroundColor: 'white' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #EAE2D8', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    submitBtn: { padding: '10px 20px', borderRadius: '8px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }
};

export default InboundProductsPage;