import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaSearch, FaClipboardList, FaExclamationTriangle 
} from 'react-icons/fa';

const OutboundPage = () => {
    const [orders, setOrders] = useState([]); 
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [loading, setLoading] = useState(true);

    // Lấy danh sách đơn hàng đã duyệt (APPROVED) từ API chuyên dụng của Admin
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/orders?status=APPROVED'); 
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi kết nối API Admin Outbound:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Xử lý xác nhận xuất kho
    const handleConfirmOutbound = async () => {
        if (!selectedOrder) return alert("Vui lòng chọn đơn hàng!");

        try {
            const res = await axios.post(`http://localhost:5000/api/orders/${selectedOrder._id}/confirm-export`);
            
            if (res.data.success) {
                alert("XUẤT KHO THÀNH CÔNG!\nHệ thống đã cập nhật số lượng tồn kho thực tế.");
                setOrders(orders.filter(o => o._id !== selectedOrder._id));
                setSelectedOrder(null);
            }
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Không thể thực hiện xuất kho. Kiểm tra lại tồn kho!"));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.pageHeader}>
                    <div>
                        <p style={styles.upperTitle}>INVENTORY MANAGEMENT</p>
                        <h1 style={styles.mainTitle}>PB08: Xuất Kho Hàng Đã Duyệt</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={styles.updateTime}>CẬP NHẬT LÚC {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p style={styles.warehouseName}>Kho: Central Estate Warehouse A</p>
                    </div>
                </div>

                <div style={styles.gridMain}>
                    <div style={styles.leftCol}>
                        {/* 1. Danh sách đơn chờ xuất */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>Danh Sách Đơn Chờ Xuất</h3>
                                <span style={styles.badge}>{orders.length} ĐƠN ĐÃ DUYỆT</span>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={{padding: '10px 0'}}>MÃ VẬN ĐƠN</th>
                                            <th>SẢN PHẨM / KHÁCH HÀNG</th>
                                            <th>NGÀY DUYỆT</th>
                                            <th>TRẠNG THÁI</th>
                                            <th>HÀNH ĐỘNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Đang tải dữ liệu...</td></tr>
                                        ) : orders.map((order) => (
                                            <OrderRow 
                                                key={order._id}
                                                id={order.orderCode}
                                                name={order.product?.name || order.customerName || "Sản phẩm cà phê"}
                                                sub={`Mã KH: ${order.customerName || "Khách lẻ"}`}
                                                date={new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                                                isSelected={selectedOrder?._id === order._id}
                                                onSelect={() => setSelectedOrder(order)}
                                            />
                                        ))}
                                        {!loading && orders.length === 0 && (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#A89B8D'}}>Không có đơn hàng chờ xuất</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 2. Xác nhận số lượng thực xuất */}
                        <div style={styles.confirmationCard}>
                            <div style={styles.confirmHeader}>
                                <div style={styles.iconBox}><FaClipboardList /></div>
                                <div>
                                    <h3 style={styles.cardTitle}>Xác Nhận Số Lượng Thực Xuất</h3>
                                    <p style={styles.cardSub}>Đang xử lý đơn: <strong>{selectedOrder ? selectedOrder.orderCode : "Chưa chọn đơn"}</strong></p>
                                </div>
                            </div>

                            {selectedOrder ? (
                                <div style={styles.productItem}>
                                    <div style={styles.productInfo}>
                                        <span style={styles.label}>MÃ SẢN PHẨM / SKU</span>
                                        <p style={styles.skuText}>{selectedOrder.product?.sku || "BL-002"}</p>
                                        <p style={styles.productName}>{selectedOrder.product?.name || selectedOrder.customerName}</p>
                                    </div>
                                    <div style={styles.statMini}>
                                        <span style={styles.label}>YÊU CẦU</span>
                                        <p style={styles.valText}>{selectedOrder.quantity} <small>bao</small></p>
                                    </div>
                                    <div style={styles.statMini}>
                                        <span style={styles.label}>TỒN KHO THỰC TẾ</span>
                                        {/* Đọc trường productStock an toàn được bọc hậu từ Backend trả về */}
                                        <p style={styles.valTextGreen}>{selectedOrder.productStock !== undefined ? selectedOrder.productStock : (selectedOrder.product?.stock || 0)} <small>bao</small></p>
                                    </div>
                                    <div style={styles.inputWrapper}>
                                        <span style={styles.label}>THỰC XUẤT</span>
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={`${selectedOrder.quantity} bao`} 
                                            style={styles.inputBox} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FDFCF0', borderRadius: '8px', border: '1px dashed #E5D5C5' }}>
                                    <p style={{ color: '#A89B8D', fontWeight: 'bold' }}>Chọn một vận đơn ở danh sách phía trên để kiểm tra số lượng tồn</p>
                                </div>
                            )}

                            <div style={styles.confirmFooter}>
                                <div style={styles.warningBox}>
                                    <FaExclamationTriangle color="#D97706" />
                                    <span>HÀNH ĐỘNG NÀY SẼ CẬP NHẬT TỒN KHO TỨC THÌ</span>
                                </div>
                                <div style={styles.btnGroup}>
                                    <button style={styles.btnCancel} onClick={() => setSelectedOrder(null)}>HỦY BỎ</button>
                                    <button 
                                        style={{...styles.btnConfirm, opacity: selectedOrder ? 1 : 0.5}} 
                                        disabled={!selectedOrder}
                                        onClick={handleConfirmOutbound}
                                    >
                                        XÁC NHẬN XUẤT KHO
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={styles.rightCol}>
                        <div style={styles.sideCard}>
                            <p style={styles.labelBold}>TÌM NHANH KIỆN HÀNG</p>
                            <div style={styles.searchBar}>
                                <FaSearch color="#A89B8D" />
                                <input placeholder="Nhập SKU hoặc Mã vận đơn..." style={styles.searchSideInput} />
                            </div>
                        </div>

                        <div style={styles.darkCard}>
                            <p style={styles.labelWhite}>TRẠNG THÁI KHO A</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                <span style={styles.miniLabelWhite}>DUNG TÍCH ĐÃ DÙNG</span>
                                <span style={styles.miniLabelWhite}>78%</span>
                            </div>
                            <div style={styles.progressBar}><div style={styles.progressFill}></div></div>
                            
                            <div style={styles.darkStatRow}>
                                <div style={styles.darkStatItem}>
                                    <span style={styles.miniLabelWhite}>CẦN XUẤT</span>
                                    <p style={styles.statLargeWhite}>{orders.length} <small>đơn</small></p>
                                </div>
                                <div style={styles.darkStatItem}>
                                    <span style={styles.miniLabelWhite}>LỖI KIỂM</span>
                                    <p style={styles.statLargeGold}>00 <small>mã</small></p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.quoteCard}>
                            <p style={styles.quoteSub}>THE EDITORIAL INSIGHT</p>
                            <p style={styles.quoteText}>"Độ chính xác là linh hồn của sự xa xỉ trong vận hành."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderRow = ({ id, name, sub, date, onSelect, isSelected }) => (
    <tr style={{...styles.tr, backgroundColor: isSelected ? '#FDFCF0' : 'transparent'}}>
        <td style={styles.idCell}>{id}</td>
        <td>
            <p style={styles.nameCell}>{name}</p>
            <p style={styles.subCell}>{sub}</p>
        </td>
        <td style={styles.dateCell}>{date}</td>
        <td><span style={styles.statusBadge}>APPROVED</span></td>
        <td style={styles.actionCell} onClick={onSelect}>
            {isSelected ? 'ĐANG CHỌN' : 'CHỌN XỬ LÝ'}
        </td>
    </tr>
);

const styles = {
    container: { display: 'flex', backgroundColor: '#F9F1E7', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px' },
    content: { flex: 1, padding: '10px 40px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
    upperTitle: { fontSize: '12px', fontWeight: 'bold', color: '#A89B8D', letterSpacing: '1px' },
    mainTitle: { fontSize: '36px', fontWeight: '900', color: '#3D2B1F', margin: '5px 0' },
    updateTime: { fontSize: '12px', fontWeight: 'bold', color: '#3D2B1F' },
    warehouseName: { fontSize: '12px', color: '#A89B8D' },
    gridMain: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { fontSize: '18px', fontWeight: '800', margin: 0 },
    badge: { backgroundColor: '#D1FAE5', color: '#065F46', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { borderBottom: '1px solid #F1F1F1', textAlign: 'left', fontSize: '10px', color: '#A89B8D' },
    tr: { borderBottom: '1px solid #F9F9F9', transition: 'all 0.3s' },
    idCell: { fontWeight: '700', color: '#3D2B1F', fontSize: '14px', padding: '15px 0' },
    nameCell: { fontWeight: '700', fontSize: '14px', margin: 0 },
    subCell: { fontSize: '10px', color: '#A89B8D', margin: 0 },
    dateCell: { fontSize: '13px', color: '#6B5D4E' },
    statusBadge: { backgroundColor: '#D1FAE5', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' },
    actionCell: { fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', color: '#3D2B1F' },
    confirmationCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', borderTop: '4px solid #3D2B1F' },
    confirmHeader: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' },
    iconBox: { backgroundColor: '#3D2B1F', color: 'white', padding: '12px', borderRadius: '8px' },
    cardSub: { fontSize: '13px', color: '#6B5D4E', margin: '5px 0' },
    productItem: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', backgroundColor: '#FDFCF0', padding: '20px', borderRadius: '8px', marginBottom: '15px' },
    label: { fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', display: 'block', marginBottom: '8px' },
    skuText: { fontSize: '14px', fontWeight: '800', margin: 0 },
    productName: { fontSize: '12px', color: '#6B5D4E', margin: 0 },
    valText: { fontSize: '18px', fontWeight: '800', margin: 0 },
    valTextGreen: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#4F7942' },
    inputBox: { width: '100%', padding: '10px', border: 'none', backgroundColor: '#E5D5C5', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#3D2B1F' },
    confirmFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' },
    warningBox: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', fontWeight: 'bold', color: '#6B5D4E' },
    btnGroup: { display: 'flex', gap: '15px' },
    btnCancel: { backgroundColor: '#E5D5C5', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    btnConfirm: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sideCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px' },
    labelBold: { fontSize: '11px', fontWeight: '900', color: '#3D2B1F', marginBottom: '15px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F9F1E7', padding: '10px', borderRadius: '6px' },
    searchSideInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' },
    darkCard: { backgroundColor: '#3D2B1F', padding: '25px', borderRadius: '12px', color: 'white' },
    labelWhite: { fontSize: '11px', fontWeight: '900', margin: 0 },
    miniLabelWhite: { fontSize: '9px', color: '#A89B8D' },
    progressBar: { height: '4px', backgroundColor: '#4F3E33', borderRadius: '2px', marginTop: '10px' },
    progressFill: { width: '78%', height: '100%', backgroundColor: '#4F7942', borderRadius: '2px' },
    darkStatRow: { display: 'flex', gap: '20px', marginTop: '25px' },
    statLargeWhite: { fontSize: '22px', fontWeight: '800', margin: 0 },
    statLargeGold: { fontSize: '22px', fontWeight: '800', margin: 0, color: '#D97706' },
    quoteCard: { padding: '30px 20px', textAlign: 'center' },
    quoteSub: { fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '10px' },
    quoteText: { fontSize: '16px', fontWeight: '700', fontStyle: 'italic', color: '#3D2B1F', lineHeight: '1.4' }
};

export default OutboundPage;