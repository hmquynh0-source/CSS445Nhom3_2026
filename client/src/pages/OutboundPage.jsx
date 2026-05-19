import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaSearch, FaClipboardList, FaExclamationTriangle, FaMapMarkerAlt, FaPlusCircle, FaSpinner, FaTimes, FaMoneyBillWave 
} from 'react-icons/fa';

const OutboundPage = () => {
    const [orders, setOrders] = useState([]); // Danh sách đơn hàng đã duyệt chờ xuất
    const [products, setProducts] = useState([]); // Danh sách sản phẩm cà phê trong DB
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalSubmitting, setModalSubmitting] = useState(false);
    
    // Thêm State phục vụ tìm kiếm nhanh ở cột phải
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        orderCode: '',
        customerName: '',
        productId: '',       
        selectedProduct: null, 
        quantity: '',
        shippingAddress: ''
    });

    // 1. Lấy danh sách các đơn hàng APPROVED từ hệ thống
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/orders?status=APPROVED');
            if (res.data && res.data.success) {
                setOrders(Array.isArray(res.data.data) ? res.data.data : []);
            } else if (res.data && Array.isArray(res.data)) {
                setOrders(res.data);
            }
        } catch (err) {
            console.error("Lỗi lấy lệnh chờ xuất:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Lấy danh sách hạt cà phê để đổ vào ô Select Option
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            if (res.data && res.data.success) {
                setProducts(Array.isArray(res.data.data) ? res.data.data : []);
            } else if (res.data && Array.isArray(res.data)) {
                setProducts(res.data); 
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách hạt cà phê từ Database:", err);
            setProducts([]); 
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    // Logic lọc danh sách đơn hàng theo ô Tìm Kiếm Nhanh (Kiểm tra OrderCode hoặc SKU sản phẩm)
    const filteredOrders = orders.filter(order => {
        if (!order) return false;
        const code = (order.orderCode || '').toLowerCase();
        const customer = (order.customerName || '').toLowerCase();
        const sku = (order.product?.sku || order.product_id?.sku || '').toLowerCase();
        return code.includes(searchTerm.toLowerCase()) || 
               customer.includes(searchTerm.toLowerCase()) || 
               sku.includes(searchTerm.toLowerCase());
    });

    // 3. XỬ LÝ XUẤT KHO CHO ĐƠN CÓ SẴN
    const handleConfirmOutbound = async () => {
        if (!selectedOrder) return alert("Vui lòng chọn một lệnh bốc dỡ từ danh sách!");

        const qty = Number(selectedOrder.quantity) || 0;
        const currentStock = selectedOrder.productStock !== undefined 
            ? selectedOrder.productStock 
            : (selectedOrder.product?.stockQuantity || selectedOrder.product_id?.stockQuantity || 0);

        if (qty > currentStock) {
            return alert(`Không thể xuất kho: Số lượng đặt (${qty} bao) vượt quá tồn kho hiện tại (${currentStock} bao)!`);
        }

        try {
            setSubmitting(true);
            const payload = {
                orderCode: selectedOrder.orderCode,
                customerName: selectedOrder.customerName,
                productId: selectedOrder.product_id?._id || selectedOrder.product?._id || selectedOrder.productId,
                quantity: qty,
                totalPrice: safeGetPrice(selectedOrder),
                shippingAddress: selectedOrder.shippingAddress || "Nhận tại nhà máy"
            };

            const res = await axios.post('http://localhost:5000/api/outbounds', payload);
            
            if (res.data && res.data.success) {
                alert("XUẤT KHO CÀ PHÊ THÀNH CÔNG!\nPhiếu xuất kho đã được lưu và trừ số lượng tồn thực tế.");
                setOrders(orders.filter(o => o._id !== selectedOrder._id));
                setSelectedOrder(null);
            }
        } catch (err) {
            alert("Lỗi xuất kho: " + (err.response?.data?.message || "Không thể kết nối API Outbound. Vui lòng kiểm tra lại Backend!"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelectChange = (e) => {
        const pId = e.target.value;
        const prod = products.find(p => p._id === pId);
        
        if (prod) {
            setFormData(prev => ({
                ...prev,
                productId: pId,
                selectedProduct: prod
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                productId: '',
                selectedProduct: null
            }));
        }
    };

    // 4. XỬ LÝ TẠO PHIẾU XUẤT THỦ CÔNG KHẨN CẤP
    const handleCreateOrderSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.orderCode || !formData.customerName || !formData.productId || !formData.quantity) {
            return alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
        }

        const qty = Number(formData.quantity) || 0;
        const selectedProd = formData.selectedProduct;

        if (selectedProd && qty > (Number(selectedProd.stockQuantity) || 0)) {
            return alert(`Lỗi: Số lượng bốc dỡ (${qty} bao) vượt quá lượng hạt cà phê tồn kho hiện tại (${selectedProd.stockQuantity} bao)!`);
        }

        try {
            setModalSubmitting(true);
            const productPrice = Number(selectedProd?.salePrice) || 0;
            const totalPrice = productPrice * qty;

            const payload = {
                orderCode: formData.orderCode.trim().toUpperCase(),
                customerName: formData.customerName,
                productId: formData.productId, 
                quantity: qty,
                totalPrice: totalPrice, 
                shippingAddress: formData.shippingAddress || "Nhận trực tiếp tại nhà máy"
            };

            const res = await axios.post('http://localhost:5000/api/outbounds', payload);

            if (res.data && res.data.success) {
                alert(`Tạo lệnh xuất ${payload.orderCode} thành công!\nTổng giá trị lô hàng: ${totalPrice.toLocaleString('vi-VN')} VNĐ.`);
                fetchOrders(); 
                setShowCreateModal(false);
                setFormData({ orderCode: '', customerName: '', productId: '', selectedProduct: null, quantity: '', shippingAddress: '' });
            }
        } catch (err) {
            console.error("Chi tiết lỗi Backend phản hồi:", err.response?.data);
            alert("Lỗi Backend: " + (err.response?.data?.message || "Dữ liệu cấu trúc không tương thích. Hãy kiểm tra kĩ Schema!"));
        } finally {
            setModalSubmitting(false);
        }
    };

    const safeGetPrice = (order) => {
        if (!order) return 0;
        if (order.totalPrice && !isNaN(Number(order.totalPrice))) {
            return Number(order.totalPrice);
        }
        
        const qty = Number(order.quantity) || 0;
        const price1 = Number(order.product?.salePrice || order.product?.price);
        const price2 = Number(order.product_id?.salePrice || order.product_id?.price);
        const price3 = Number(order.salePrice || order.price);

        if (!isNaN(price1) && price1 > 0) return price1 * qty;
        if (!isNaN(price2) && price2 > 0) return price2 * qty;
        if (!isNaN(price3) && price3 > 0) return price3 * qty;

        return 0; 
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* PAGE HEADER */}
                <div style={styles.pageHeader}>
                    <div>
                        <p style={styles.upperTitle}>COFFEE COOP INVENTORY</p>
                        <h1 style={styles.mainTitle}>PB08: Xuất Kho Hạt Cà Phê Đã Duyệt</h1>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <button style={styles.btnCreateManual} onClick={() => setShowCreateModal(true)}>
                            <FaPlusCircle /> TẠO ĐƠN XUẤT KHẨN (EMAIL/SĐT)
                        </button>
                        <div>
                            <p style={styles.updateTime}>CẬP NHẬT LÚC {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p style={styles.warehouseName}>Nhà máy: Kho Nông Sản Central Estate A</p>
                        </div>
                    </div>
                </div>

                <div style={styles.gridMain}>
                    {/* LEFT COLUMN */}
                    <div style={styles.leftCol}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>Danh Sách Lô Cà Phê Chờ Xuất</h3>
                                <span style={styles.badge}>{filteredOrders.length} ĐƠN KHỚP BỘ LỌC</span>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={{padding: '10px 0'}}>MÃ VẬN ĐƠN</th>
                                            <th>LOẠI CÀ PHÊ / ĐẠI LÝ</th>
                                            <th>ĐỊA CHỈ GIAO NHẬN</th>
                                            <th>GIÁ TRỊ LÔ HÀNG</th>
                                            <th>NGÀY DUYỆT LỆNH</th>
                                            <th>TRẠNG THÁI</th>
                                            <th style={{textAlign: 'right', paddingRight: '10px'}}>HÀNH ĐỘNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}><FaSpinner className="spinner" /> Đang tải dữ liệu kho...</td></tr>
                                        ) : filteredOrders.map((order) => {
                                            if (!order) return null;
                                            const pName = order.product?.name || order.product_id?.name || "Hạt cà phê nông sản";
                                            return (
                                                <OrderRow 
                                                    key={order._id}
                                                    id={order.orderCode || "N/A"}
                                                    name={pName}
                                                    sub={`Đại lý/Đối tác: ${order.customerName || "Khách mua lẻ"}`}
                                                    address={order.shippingAddress || "Nhận tại nhà máy"}
                                                    price={safeGetPrice(order)} 
                                                    date={order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : "N/A"}
                                                    isSelected={selectedOrder?._id === order._id}
                                                    onSelect={() => setSelectedOrder(order)}
                                                />
                                            );
                                        })}
                                        {!loading && filteredOrders.length === 0 && (
                                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px', color:'#A89B8D'}}>Không có lệnh bốc dỡ nào trùng khớp yêu cầu tìm kiếm</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* XÁC NHẬN SỐ LƯỢNG THỰC XUẤT */}
                        <div style={styles.confirmationCard}>
                            <div style={styles.confirmHeader}>
                                <div style={styles.iconBox}><FaClipboardList /></div>
                                <div>
                                    <h3 style={styles.cardTitle}>Xác Nhận Trọng Lượng Bốc Dỡ Thực Tế</h3>
                                    <p style={styles.cardSub}>Đang xử lý mã lệnh: <strong>{selectedOrder ? selectedOrder.orderCode : "Chưa chọn lệnh"}</strong></p>
                                </div>
                            </div>

                            {selectedOrder ? (
                                <div>
                                    <div style={styles.productItem}>
                                        <div style={styles.productInfo}>
                                            <span style={styles.label}>MÃ PHÂN LOẠI / SKU</span>
                                            <p style={styles.skuText}>{selectedOrder.product?.sku || selectedOrder.product_id?.sku || "N/A"}</p>
                                            <p style={styles.productName}>{selectedOrder.product?.name || selectedOrder.product_id?.name || "N/A"}</p>
                                        </div>
                                        <div style={styles.statMini}>
                                            <span style={styles.label}>SỐ LƯỢNG YÊU CẦU</span>
                                            <p style={styles.valText}>{selectedOrder.quantity || 0} <small>bao</small></p>
                                        </div>
                                        <div style={styles.statMini}>
                                            <span style={styles.label}>TỒN KHO THỰC TẾ</span>
                                            <p style={styles.valTextGreen}>
                                                {selectedOrder.productStock !== undefined ? selectedOrder.productStock : (selectedOrder.product?.stockQuantity || selectedOrder.product_id?.stockQuantity || 0)} <small>bao</small>
                                            </p>
                                        </div>
                                        <div style={styles.inputWrapper}>
                                            <span style={styles.label}>THỰC XUẤT (BAO)</span>
                                            <input type="text" readOnly value={`${selectedOrder.quantity || 0} bao`} style={styles.inputBox} />
                                        </div>
                                    </div>
                                    
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px'}}>
                                        <div style={styles.addressDetailBox}>
                                            <span style={styles.label}><FaMapMarkerAlt color="#3D2B1F"/> ĐỊA ĐIỂM GIAO HÀNG</span>
                                            <p style={styles.addressDetailText}>{selectedOrder.shippingAddress || "Chưa có địa chỉ chi tiết"}</p>
                                        </div>
                                        <div style={styles.priceDetailBox}>
                                            <span style={styles.label}><FaMoneyBillWave color="#4F7942"/> TỔNG TRỊ GIÁ LÔ HÀNG</span>
                                            <p style={styles.priceDetailText}>
                                                {safeGetPrice(selectedOrder).toLocaleString('vi-VN')} VNĐ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FDFCF0', borderRadius: '8px', border: '1px dashed #E5D5C5' }}>
                                    <p style={{ color: '#A89B8D', fontWeight: 'bold' }}>Chọn một mã lệnh bốc dỡ ở danh sách phía trên để kiểm tra số bao tồn, giá tiền và thông tin chi tiết</p>
                                </div>
                            )}

                            <div style={styles.confirmFooter}>
                                <div style={styles.warningBox}>
                                    <FaExclamationTriangle color="#D97706" />
                                    <span>HÀNH ĐỘNG NÀY SẼ TRỪ TỒN KHO HẠT CÀ PHÊ LẬP TỨC TRÊN MODEL OUTBOUNDS</span>
                                </div>
                                <div style={styles.btnGroup}>
                                    <button style={styles.btnCancel} onClick={() => setSelectedOrder(null)}>HỦY BỎ</button>
                                    <button 
                                        style={{...styles.btnConfirm, opacity: (selectedOrder && !submitting) ? 1 : 0.5}} 
                                        disabled={!selectedOrder || submitting}
                                        onClick={handleConfirmOutbound}
                                    >
                                        {submitting ? "ĐANG GHI SỔ..." : "XÁC NHẬN XUẤT KHO"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={styles.rightCol}>
                        <div style={styles.sideCard}>
                            <p style={styles.labelBold}>TÌM NHANH LÔ HÀNG</p>
                            <div style={styles.searchBar}>
                                <FaSearch color="#A89B8D" />
                                <input 
                                    placeholder="Nhập SKU, Mã đơn, Đại lý..." 
                                    style={styles.searchSideInput} 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={styles.darkCard}>
                            <p style={styles.labelWhite}>SỨC CHỨA KHO NÔNG SẢN A</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                <span style={styles.miniLabelWhite}>DUNG TÍCH BỒN CHỨA / PALLET</span>
                                <span style={styles.miniLabelWhite}>78%</span>
                            </div>
                            <div style={styles.progressBar}><div style={styles.progressFill}></div></div>
                            
                            <div style={styles.darkStatRow}>
                                <div style={styles.darkStatItem}>
                                    <span style={styles.miniLabelWhite}>CHỜ BỐC XUẤT</span>
                                    <p style={styles.statLargeWhite}>{orders.length} <small>lệnh</small></p>
                                </div>
                                <div style={styles.darkStatItem}>
                                    <span style={styles.miniLabelWhite}>ẨM MỐC/LỖI</span>
                                    <p style={styles.statLargeGold}>00 <small>mã</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM TẠO ĐƠN THỦ CÔNG */}
            {showCreateModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={{margin: 0, fontSize: '18px', color: '#3D2B1F', fontWeight: '800'}}>Tạo Lệnh Xuất Thủ Công (Đơn Qua Email / Điện Thoại)</h2>
                            <button style={styles.btnCloseModal} onClick={() => setShowCreateModal(false)}><FaTimes /></button>
                        </div>
                        
                        <form onSubmit={handleCreateOrderSubmit} style={styles.modalForm}>
                            <div style={styles.formGridTwo}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Mã vận đơn khẩn cấp <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="orderCode" placeholder="Ví dụ: ORD-COFFEE-99" value={formData.orderCode} onChange={handleInputChange} style={styles.formInput} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Tên đại lý/khách hàng <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="customerName" placeholder="Ví dụ: Cà phê Trung Nguyên - Đại lý Đà Nẵng" value={formData.customerName} onChange={handleInputChange} style={styles.formInput} required />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Chọn loại hạt cà phê trong kho <span style={{color:'red'}}>*</span></label>
                                <select value={formData.productId} onChange={handleProductSelectChange} style={styles.formSelect} required>
                                    <option value="">-- Bấm vào đây để chọn loại cà phê --</option>
                                    {products.map(p => {
                                        const productPrice = Number(p.salePrice) || 0;
                                        return (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (SKU: {p.sku || 'N/A'} - Tồn: {p.stockQuantity || 0} bao - Giá: {productPrice.toLocaleString('vi-VN')}đ)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {formData.selectedProduct && (
                                <div style={styles.autoFilledBox}>
                                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B5D4E'}}>
                                        <span><strong>Mã SKU:</strong> {formData.selectedProduct.sku || 'N/A'}</span>
                                        <span><strong>Đơn giá/bao:</strong> {(Number(formData.selectedProduct.salePrice) || 0).toLocaleString('vi-VN')} đ</span>
                                        <span><strong>Tồn kho hiện tại:</strong> <span style={{color: '#4F7942', fontWeight:'bold'}}>{formData.selectedProduct.stockQuantity || 0} bao</span></span>
                                    </div>
                                </div>
                            )}

                            <div style={styles.formGridTwo}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Số lượng xuất kho (bao) <span style={{color:'red'}}>*</span></label>
                                    <input type="number" name="quantity" placeholder="Ví dụ: 10" value={formData.quantity} onChange={handleInputChange} style={styles.formInput} min="1" required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Tổng trị giá ước tính (VNĐ)</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.selectedProduct && formData.quantity ? ((Number(formData.selectedProduct.salePrice) || 0) * Number(formData.quantity)).toLocaleString('vi-VN') + ' đ' : '0 đ'} 
                                        style={{...styles.formInput, backgroundColor: '#FDFCF0', fontWeight: 'bold', color: '#4F7942', border: '1px solid #4F7942'}} 
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Địa chỉ nhà kho nhận hàng</label>
                                <input type="text" name="shippingAddress" placeholder="Ví dụ: Lô C3, KCN Liên Chiểu, Đà Nẵng" value={formData.shippingAddress} onChange={handleInputChange} style={styles.formInput} />
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" style={styles.btnModalCancel} onClick={() => setShowCreateModal(false)}>HỦY BỎ</button>
                                <button type="submit" style={styles.btnModalSubmit} disabled={modalSubmitting}>
                                    {modalSubmitting ? "ĐANG GHI SỔ..." : "LƯU PHIẾU XUẤT KHO"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrderRow = ({ id, name, sub, address, price, date, onSelect, isSelected }) => (
    <tr style={{...styles.tr, backgroundColor: isSelected ? '#FDFCF0' : 'transparent'}}>
        <td style={styles.idCell}>{id}</td>
        <td>
            <p style={styles.nameCell}>{name}</p>
            <p style={styles.subCell}>{sub}</p>
        </td>
        <td style={styles.addressCell} title={address}>
            <FaMapMarkerAlt style={{marginRight: '4px', fontSize: '11px', color: '#8C7A6B'}} />
            {address.length > 20 ? `${address.substring(0, 20)}...` : address}
        </td>
        <td style={{fontSize: '13px', fontWeight: 'bold', color: '#4F7942'}}>{(Number(price) || 0).toLocaleString('vi-VN')} đ</td>
        <td style={styles.dateCell}>{date}</td>
        <td><span style={styles.statusBadge}>APPROVED</span></td>
        <td style={{textAlign: 'right', paddingRight: '10px'}}>
            <span style={styles.actionCell} onClick={onSelect}>
                {isSelected ? 'ĐANG CHỌN' : 'CHỌN XỬ LÝ'}
            </span>
        </td>
    </tr>
);

// HOÀN THIỆN TOÀN BỘ ĐOẠN CÚ PHÁP STYLES BỊ LỖI CẮT CHỮ CỦA BẠN
const styles = {
    container: { display: 'flex', backgroundColor: '#F9F1E7', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px' },
    content: { flex: 1, padding: '10px 40px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
    upperTitle: { fontSize: '12px', fontWeight: 'bold', color: '#A89B8D', letterSpacing: '1px' },
    mainTitle: { fontSize: '36px', fontWeight: '900', color: '#3D2B1F', margin: '5px 0' },
    updateTime: { fontSize: '12px', fontWeight: 'bold', color: '#3D2B1F' },
    warehouseName: { fontSize: '12px', color: '#A89B8D' },
    btnCreateManual: { backgroundColor: '#4F7942', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(79,121,66,0.3)' },
    gridMain: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#3D2B1F' },
    badge: { backgroundColor: '#D1FAE5', color: '#065F46', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { borderBottom: '1px solid #F1F1F1', textAlign: 'left', fontSize: '10px', color: '#A89B8D', paddingBottom: '10px' },
    tr: { borderBottom: '1px solid #F9F9F9', transition: 'all 0.3s' },
    idCell: { fontWeight: '700', color: '#3D2B1F', fontSize: '14px', padding: '15px 0' },
    nameCell: { fontWeight: '700', fontSize: '14px', margin: 0, color: '#3D2B1F' },
    subCell: { fontSize: '10px', color: '#A89B8D', margin: 0 },
    addressCell: { fontSize: '12px', color: '#5C4033' },
    dateCell: { fontSize: '13px', color: '#6B5D4E' },
    statusBadge: { backgroundColor: '#D1FAE5', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' },
    actionCell: { fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', color: '#3D2B1F' },
    confirmationCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', borderTop: '4px solid #3D2B1F' },
    confirmHeader: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' },
    iconBox: { backgroundColor: '#3D2B1F', color: 'white', padding: '12px', borderRadius: '8px' },
    cardSub: { fontSize: '13px', color: '#6B5D4E', margin: '5px 0' },
    productItem: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', backgroundColor: '#FDFCF0', padding: '20px', borderRadius: '8px' },
    productInfo: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    statMini: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    inputWrapper: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    addressDetailBox: { backgroundColor: '#F5EFEB', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3D2B1F' },
    addressDetailText: { margin: '5px 0 0 0', fontSize: '13px', color: '#3D2B1F', fontWeight: 'bold' },
    priceDetailBox: { backgroundColor: '#EAF2E8', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #4F7942' },
    priceDetailText: { margin: '5px 0 0 0', fontSize: '16px', color: '#4F7942', fontWeight: '900' },
    label: { fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', display: 'block', marginBottom: '4px' },
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
    sideCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    labelBold: { fontSize: '11px', fontWeight: '900', color: '#3D2B1F', marginBottom: '10px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F9F1E7', padding: '10px 14px', borderRadius: '8px' },
    searchSideInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#3D2B1F' },
    darkCard: { backgroundColor: '#3D2B1F', padding: '25px', borderRadius: '12px', color: 'white' },
    labelWhite: { fontSize: '12px', fontWeight: '900', color: '#E5D5C5', margin: 0 },
    miniLabelWhite: { fontSize: '10px', color: '#A89B8D', fontWeight: '600' },
    progressBar: { width: '100%', height: '6px', backgroundColor: '#5C4033', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' },
    progressFill: { width: '78%', height: '100%', backgroundColor: '#4F7942' },
    darkStatRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', borderTop: '1px solid #5C4033', paddingTop: '15px' },
    darkStatItem: { display: 'flex', flexDirection: 'column' },
    statLargeWhite: { fontSize: '22px', fontWeight: 'bold', color: 'white', margin: '5px 0 0 0' },
    statLargeGold: { fontSize: '22px', fontWeight: 'bold', color: '#E5D5C5', margin: '5px 0 0 0' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #F1F1F1', paddingBottom: '15px' },
    btnCloseModal: { border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#A89B8D' },
    modalForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    formLabel: { fontSize: '12px', fontWeight: 'bold', color: '#6B5D4E' },
    formInput: { padding: '10px 14px', border: '1px solid #E5D5C5', borderRadius: '6px', outline: 'none', fontSize: '14px', color: '#3D2B1F' },
    formSelect: { padding: '10px 14px', border: '1px solid #E5D5C5', borderRadius: '6px', outline: 'none', fontSize: '14px', color: '#3D2B1F', backgroundColor: 'white' },
    autoFilledBox: { backgroundColor: '#FDFCF0', padding: '12px', borderRadius: '6px', border: '1px dashed #E5D5C5' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px', borderTop: '1px solid #F1F1F1', paddingTop: '20px' },
    btnModalCancel: { backgroundColor: '#F5EFEB', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#6B5D4E' },
    btnModalSubmit: { backgroundColor: '#4F7942', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default OutboundPage;