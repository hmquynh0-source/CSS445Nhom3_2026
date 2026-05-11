import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRealTimeData } from '../context/RealTimeContext';
import {
    FaPlus, FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaEdit, FaTrash, FaSync
} from 'react-icons/fa';

const SuppliersPage = () => {
    const { token } = useAuth();

    // 1. Cấu hình Header an toàn (Memoized để tránh re-render vô tận)
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // 2. Lấy dữ liệu thời gian thực
    // TRUYỀN config vào tham số thứ 3 để Hook sử dụng Token khi gọi API
    const { data: apiResponse, loading, refresh: refreshSuppliers } = useRealTimeData(
        'http://localhost:5000/api/suppliers',
        4000,
        config 
    );

    // 3. Xử lý bóc tách mảng suppliers từ response linh hoạt
    const suppliers = useMemo(() => {
        if (!apiResponse) return [];
        
        // Kiểm tra đa luồng: .data (thông dụng), .suppliers (đặc thù), hoặc bản thân response là mảng
        const rawData = apiResponse.data || apiResponse.suppliers || apiResponse;
        return Array.isArray(rawData) ? rawData : [];
    }, [apiResponse]);

    // State cho Form và UI
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactName: '', 
        phone: '',
        email: '',
        address: ''
    });

    // Logic lọc tìm kiếm theo tên NCC hoặc người đại diện
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    // Xử lý Gửi Form (Thêm/Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            alert('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/suppliers/${editingId}`, formData, config);
                alert('✅ Cập nhật đối tác thành công!');
            } else {
                await axios.post('http://localhost:5000/api/suppliers', formData, config);
                alert('✅ Đăng ký đối tác mới thành công!');
            }
            refreshSuppliers();
            handleCancel();
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi kết nối server";
            alert('❌ Thất bại: ' + message);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!token) return alert('❌ Bạn cần đăng nhập để thực hiện!');

        if (window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa đối tác này?')) {
            try {
                await axios.delete(`http://localhost:5000/api/suppliers/${id}`, config);
                refreshSuppliers();
                alert('✅ Đã xóa nhà cung cấp.');
            } catch (error) {
                alert('❌ Lỗi xóa: ' + (error.response?.data?.message || 'Không thể xóa'));
            }
        }
    };

    const handleEdit = (supplier) => {
        setIsEditing(true);
        setEditingId(supplier._id);
        setFormData({
            name: supplier.name || '',
            contactName: supplier.contactName || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', contactName: '', phone: '', email: '', address: '' });
    };

    return (
        <div style={styles.contentPadding}>
            {/* Header Section */}
            <div style={styles.titleRow}>
                <div>
                    <p style={styles.upperTitle}>QUẢN LÝ NGUỒN CUNG</p>
                    <h1 style={styles.mainTitle}>Đối tác Cung ứng</h1>
                    <p style={styles.subDescription}>
                        Đang quản lý <b>{suppliers.length}</b> nhà cung cấp chính thức.
                    </p>
                </div>
                <button style={styles.addSupplierBtn} onClick={() => { setIsEditing(false); setShowForm(true); }}>
                    <FaPlus /> Thêm đối tác mới
                </button>
            </div>

            {/* Stats Dashboard */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <p style={styles.statLabel}>TỔNG NHÀ CUNG CẤP</p>
                    <h2 style={styles.statValue}>{suppliers.length}</h2>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statLabel}>TRẠNG THÁI KẾT NỐI</p>
                    <h2 style={{ ...styles.statValue, color: loading ? '#A89B8D' : '#4F7942', fontSize: '15px' }}>
                        <FaSync className={loading ? 'fa-spin' : ''} style={{marginRight: '8px'}} /> 
                        {loading ? ' Đang đồng bộ...' : ' Đã kết nối thời gian thực'}
                    </h2>
                </div>
            </div>

            {/* Search Bar */}
            <div style={styles.searchBar}>
                <FaSearch color="#A89B8D" />
                <input
                    type="text"
                    placeholder="Tìm theo tên doanh nghiệp hoặc người đại diện..."
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid hiển thị danh sách */}
            <div style={styles.cardGrid}>
                {filteredSuppliers.map(supplier => (
                    <div key={supplier._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardName}>{supplier.name}</h3>
                            <div style={styles.cardActions}>
                                <button onClick={() => handleEdit(supplier)} style={styles.actionBtn} title="Sửa">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(supplier._id)} style={{ ...styles.actionBtn, color: '#D94E33' }} title="Xóa">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div style={styles.infoRow}><FaPhoneAlt size={12} /> <span>{supplier.phone || 'Chưa cập nhật'}</span></div>
                        <div style={styles.infoRow}><FaEnvelope size={12} /> <span>{supplier.email || 'Chưa có email'}</span></div>
                        <div style={styles.infoRow}><FaMapMarkerAlt size={12} /> <span>{supplier.address}</span></div>
                        <div style={styles.contactBadge}>Người đại diện: {supplier.contactName || 'N/A'}</div>
                    </div>
                ))}
            </div>

            {/* Hiển thị khi mảng rỗng */}
            {filteredSuppliers.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#A89B8D' }}>
                    <p>Chưa có dữ liệu nhà cung cấp hoặc không tìm thấy kết quả.</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '800', color: '#3D2B1F' }}>
                            {isEditing ? 'CẬP NHẬT THÔNG TIN ĐỐI TÁC' : 'ĐĂNG KÝ ĐỐI TÁC MỚI'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <label style={styles.label}>Tên doanh nghiệp / Nhà vườn</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} placeholder="VD: Công ty Cà phê Minh Trí" />
                            
                            <label style={styles.label}>Người đại diện liên hệ</label>
                            <input type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} style={styles.input} placeholder="Tên chủ vườn hoặc quản lý" />
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>Số điện thoại</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
                                </div>
                            </div>

                            <label style={styles.label}>Địa chỉ trụ sở</label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={styles.input} />

                            <div style={styles.formButtons}>
                                <button type="submit" style={styles.submitBtn}>Xác nhận lưu</button>
                                <button type="button" onClick={handleCancel} style={styles.cancelBtn}>Hủy bỏ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles chuyên nghiệp theo tone màu Editorial Estate
const styles = {
    contentPadding: { padding: '10px 0' },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    upperTitle: { fontSize: '10px', fontWeight: '800', color: '#A89B8D', letterSpacing: '2px', margin: 0 },
    mainTitle: { fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: '5px 0', fontFamily: "'Playfair Display', serif" },
    subDescription: { fontSize: '14px', color: '#888' },
    addSupplierBtn: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
    statCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #EAE2D8', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    statLabel: { fontSize: '10px', color: '#A89B8D', fontWeight: '800', marginBottom: '5px' },
    statValue: { fontSize: '24px', fontWeight: '900', color: '#3D2B1F', margin: 0, display: 'flex', alignItems: 'center' },
    searchBar: { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #EAE2D8', gap: '15px', marginBottom: '30px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', flex: 1, fontWeight: '500' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '25px', border: '1px solid #F1E9DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    cardName: { fontSize: '18px', fontWeight: '800', color: '#3D2B1F', margin: 0, flex: 1 },
    infoRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666', marginBottom: '8px' },
    contactBadge: { marginTop: '15px', padding: '8px 12px', backgroundColor: '#F9F1E7', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#3D2B1F', display: 'inline-block' },
    cardActions: { display: 'flex', gap: '8px' },
    actionBtn: { background: '#F5F0EB', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D2B1F' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', padding: '35px', borderRadius: '20px', width: '95%', maxWidth: '480px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#A89B8D', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #EAE2D8', borderRadius: '10px', fontSize: '14px', outline: 'none' },
    formButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
    submitBtn: { flex: 2, padding: '12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#F5F0EB', color: '#3D2B1F', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }
};

export default SuppliersPage;