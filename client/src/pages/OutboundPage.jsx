import React from 'react';
import { 
    FaSearch, FaBell, FaCog, FaThLarge, FaChartBar, FaTruck, 
    FaBoxOpen, FaClipboardList, FaPlus, FaQuestionCircle, 
    FaSignOutAlt, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';

const OutboundPage = () => {
    return (
        <div style={styles.container}>
            {/* MAIN CONTENT AREA */}
            <div style={styles.content}>
                {/* Header Title */}
                <div style={styles.pageHeader}>
                    <div>
                        <p style={styles.upperTitle}>INVENTORY MANAGEMENT</p>
                        <h1 style={styles.mainTitle}>PB08: Xuất Kho Hàng Đã Duyệt</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={styles.updateTime}>CẬP NHẬT LÚC 09:45 AM</p>
                        <p style={styles.warehouseName}>Kho: Central Estate Warehouse A</p>
                    </div>
                </div>

                <div style={styles.gridMain}>
                    {/* LEFT COLUMN */}
                    <div style={styles.leftCol}>
                        {/* 1. Danh sách đơn chờ xuất */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>Danh Sách Đơn Chờ Xuất</h3>
                                <span style={styles.badge}>8 ĐƠN ĐÃ DUYỆT</span>
                            </div>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th>MÃ VẬN ĐƠN</th>
                                        <th>KHÁCH HÀNG</th>
                                        <th>NGÀY DUYỆT</th>
                                        <th>TRẠNG THÁI</th>
                                        <th>HÀNH ĐỘNG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <OrderRow id="#EST-2024-001" name="Premium Roast Co." sub="PRIORITY EXPORT" date="Oct 24, 2023" />
                                    <OrderRow id="#EST-2024-004" name="Artisan Beans Ltd." sub="STANDARD DELIVERY" date="Oct 25, 2023" />
                                    <OrderRow id="#EST-2024-009" name="Global Cafe Group" sub="INTERNAL TRANSFER" date="Oct 25, 2023" />
                                </tbody>
                            </table>
                        </div>

                        {/* 2. Xác nhận số lượng thực xuất */}
                        <div style={styles.confirmationCard}>
                            <div style={styles.confirmHeader}>
                                <div style={styles.iconBox}><FaClipboardList /></div>
                                <div>
                                    <h3 style={styles.cardTitle}>Xác Nhận Số Lượng Thực Xuất</h3>
                                    <p style={styles.cardSub}>Đang xử lý đơn: <strong>#EST-2024-001</strong></p>
                                </div>
                            </div>

                            <div style={styles.productItem}>
                                <div style={styles.productInfo}>
                                    <span style={styles.label}>MÃ SẢN PHẨM / SKU</span>
                                    <p style={styles.skuText}>COF-BRA-001</p>
                                    <p style={styles.productName}>Santos Brazil Green Bean</p>
                                </div>
                                <div style={styles.statMini}>
                                    <span style={styles.label}>YÊU CẦU</span>
                                    <p style={styles.valText}>500 <small>kg</small></p>
                                </div>
                                <div style={styles.statMini}>
                                    <span style={styles.label}>TỒN KHO</span>
                                    <p style={styles.valTextGreen}>1,240 <small>kg</small></p>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.label}>THỰC XUẤT</span>
                                    <input type="text" defaultValue="500" style={styles.inputBox} />
                                </div>
                            </div>

                            <div style={styles.productItem}>
                                <div style={styles.productInfo}>
                                    <span style={styles.label}>MÃ SẢN PHẨM / SKU</span>
                                    <p style={styles.skuText}>COF-ETH-002</p>
                                    <p style={styles.productName}>Sidamo Ethiopia Roast</p>
                                </div>
                                <div style={styles.statMini}>
                                    <span style={styles.label}>YÊU CẦU</span>
                                    <p style={styles.valText}>120 <small>kg</small></p>
                                </div>
                                <div style={styles.statMini}>
                                    <span style={styles.label}>TỒN KHO</span>
                                    <p style={styles.valTextGreen}>850 <small>kg</small></p>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.label}>THỰC XUẤT</span>
                                    <input type="text" placeholder="Nhập số..." style={styles.inputBoxEmpty} />
                                </div>
                            </div>

                            <div style={styles.confirmFooter}>
                                <div style={styles.warningBox}>
                                    <FaExclamationTriangle color="#D97706" />
                                    <span>HÀNH ĐỘNG NÀY SẼ CẬP NHẬT TỒN KHO TỨC THÌ</span>
                                </div>
                                <div style={styles.btnGroup}>
                                    <button style={styles.btnCancel}>HỦY BỎ</button>
                                    <button style={styles.btnConfirm}>XÁC NHẬN XUẤT KHO</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) */}
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
                                    <p style={styles.statLargeWhite}>1,204 <small>tấn</small></p>
                                </div>
                                <div style={styles.darkStatItem}>
                                    <span style={styles.miniLabelWhite}>LỖI KIỂM</span>
                                    <p style={styles.statLargeGold}>02 <small>mã</small></p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.quoteCard}>
                            <p style={styles.quoteSub}>THE EDITORIAL INSIGHT</p>
                            <p style={styles.quoteText}>"Độ chính xác là linh hồn của sự xa xỉ trong vận hành."</p>
                        </div>

                        <div style={styles.sideCard}>
                            <p style={styles.labelBold}>NHẬT KÝ MỚI NHẤT</p>
                            <ul style={styles.logList}>
                                <li style={styles.logItem}>
                                    <span style={styles.logDot}></span>
                                    <div>
                                        <p style={styles.logText}>Admin-04 đã xác nhận đơn #EST-2024-002</p>
                                        <span style={styles.logTime}>10 PHÚT TRƯỚC</span>
                                    </div>
                                </li>
                                <li style={styles.logItem}>
                                    <span style={styles.logDot}></span>
                                    <div>
                                        <p style={styles.logText}>Cập nhật tồn kho SKU: COF-BRA-001 (+400)</p>
                                        <span style={styles.logTime}>2 GIỜ TRƯỚC</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderRow = ({ id, name, sub, date }) => (
    <tr style={styles.tr}>
        <td style={styles.idCell}>{id}</td>
        <td>
            <p style={styles.nameCell}>{name}</p>
            <p style={styles.subCell}>{sub}</p>
        </td>
        <td style={styles.dateCell}>{date}</td>
        <td><span style={styles.statusBadge}>APPROVED</span></td>
        <td style={styles.actionCell}>CHỌN XỬ LÝ</td>
    </tr>
);

const styles = {
    container: { display: 'flex', backgroundColor: '#F9F1E7', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px' },
    content: { flex: 1, padding: '20px 40px' },
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
    tr: { borderBottom: '1px solid #F9F9F9' },
    idCell: { fontWeight: '700', color: '#3D2B1F', fontSize: '14px', padding: '15px 0' },
    nameCell: { fontWeight: '700', fontSize: '14px', margin: 0 },
    subCell: { fontSize: '10px', color: '#A89B8D', margin: 0 },
    dateCell: { fontSize: '13px', color: '#6B5D4E' },
    statusBadge: { backgroundColor: '#D1FAE5', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' },
    actionCell: { fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' },

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
    inputBox: { width: '100%', padding: '10px', border: 'none', backgroundColor: '#E5D5C5', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' },
    inputBoxEmpty: { width: '100%', padding: '10px', border: 'none', backgroundColor: '#E5D5C5', borderRadius: '4px', fontStyle: 'italic', color: '#A89B8D' },

    confirmFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' },
    warningBox: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', fontWeight: 'bold', color: '#6B5D4E' },
    btnGroup: { display: 'flex', gap: '15px' },
    btnCancel: { backgroundColor: '#E5D5C5', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    btnConfirm: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },

    // RIGHT SIDEBAR STYLES
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
    quoteText: { fontSize: '16px', fontWeight: '700', fontStyle: 'italic', color: '#3D2B1F', lineHeight: '1.4' },

    logList: { listStyle: 'none', padding: 0, margin: 0 },
    logItem: { display: 'flex', gap: '12px', marginBottom: '20px' },
    logDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F7942', marginTop: '5px' },
    logText: { fontSize: '12px', color: '#3D2B1F', margin: 0, fontWeight: '500' },
    logTime: { fontSize: '10px', color: '#A89B8D', fontWeight: 'bold' }
};

export default OutboundPage;