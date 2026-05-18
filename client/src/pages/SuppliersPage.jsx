import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRealTimeData } from '../context/RealTimeContext';
import {
    FaPlus, FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaEdit, FaTrash, FaSync
} from 'react-icons/fa';

const SuppliersPage = () => {
    const { token } = useAuth();

    // 1. Cấu hình Header (Memoized để tránh re-render lặp vô tận trong Hook Realtime)
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // 2. Lấy dữ liệu thời gian thực (Cập nhật mỗi 4 giây)
    const { data: apiResponse, loading, refresh: refreshSuppliers } = useRealTimeData(
        'http://localhost:5000/api/suppliers',
        4000,
        config 
    );

    // 3. Bóc tách dữ liệu an toàn
    const suppliers = useMemo(() => {
        if (!apiResponse) return [];
        // Xử lý linh hoạt cho các cấu trúc JSON khác nhau từ Backend
        const rawData = apiResponse.data || apiResponse.suppliers || (Array.isArray(apiResponse) ? apiResponse : []);
        return Array.isArray(rawData) ? rawData : [];
    }, [apiResponse]);

    // State quản lý UI
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

    // Logic tìm kiếm (Memoized)
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone?.includes(searchTerm)
        );
    }, [suppliers, searchTerm]);

    // Xử lý Thêm/Sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert('❌ Vui lòng đăng nhập lại!');

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/suppliers/${editingId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/suppliers', formData, config);
            }
            
            // Ép Hook Real-time cập nhật lại ngay lập tức thay vì chờ 4s
            refreshSuppliers(); 
            handleCancel();
            alert(isEditing ? '✅ Đã cập nhật thông tin' : '✅ Đã thêm đối tác mới');
        } catch (error) {
            alert('❌ Lỗi: ' + (error.response?.data?.message || "Không thể kết nối Server"));
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa đối tác này?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/suppliers/${id}`, config);
            refreshSuppliers();
        } catch (error) {
            alert('❌ Lỗi xóa: ' + (error.response?.data?.message || 'Thất bại'));
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
        setFormData({ name: '', contactName: '', phone: '', email: '', address: '' });
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.headerRow}>
                <div>
                    <p style={styles.overhead}>NETWORK & SUPPLY</p>
                    <h1 style={styles.pageTitle}>Quản lý Nhà cung cấp</h1>
                </div>
                <button style={styles.btnPrimary} onClick={() => { setIsEditing(false); setShowForm(true); }}>
                    <FaPlus /> Thêm đối tác
                </button>
            </div>

            {/* Dashboard Mini */}
            <div style={styles.dashboardGrid}>
                <div style={styles.statBox}>
                    <span style={styles.statLabel}>ĐỐI TÁC HIỆN CÓ</span>
                    <div style={styles.statValue}>{suppliers.length}</div>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statLabel}>TRẠNG THÁI HỆ THỐNG</span>
                    <div style={{ ...styles.statStatus, color: loading ? '#8D6D4D' : '#2D5A27' }}>
                        <FaSync style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} />
                        {loading ? ' Đang đồng bộ...' : ' Đã kết nối Real-time'}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={styles.searchBox}>
                <FaSearch color="#A68B6D" />
                <input
                    placeholder="Tìm theo tên, đại diện hoặc SĐT..."
                    style={styles.searchField}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid hiển thị */}
            <div style={styles.grid}>
                {filteredSuppliers.map(item => (
                    <div key={item._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.businessName}>{item.name}</h3>
                            <div style={styles.cardTools}>
                                <button onClick={() => handleEdit(item)} style={styles.toolBtn}><FaEdit /></button>
                                <button onClick={() => handleDelete(item._id)} style={{...styles.toolBtn, color: '#A94442'}}><FaTrash /></button>
                            </div>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.info}><FaPhoneAlt /> {item.phone || 'N/A'}</div>
                            <div style={styles.info}><FaEnvelope /> {item.email || 'N/A'}</div>
                            <div style={styles.info}><FaMapMarkerAlt /> {item.address}</div>
                        </div>
                        <div style={styles.badge}>Đại diện: {item.contactName}</div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>{isEditing ? 'CẬP NHẬT ĐỐI TÁC' : 'THÊM MỚI ĐỐI TÁC'}</h2>
                        <form onSubmit={handleSubmit}>
                            <label style={styles.formLabel}>Tên doanh nghiệp</label>
                            <input required style={styles.formInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            
                            <label style={styles.formLabel}>Người đại diện</label>
                            <input style={styles.formInput} value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{flex:1}}>
                                    <label style={styles.formLabel}>SĐT</label>
                                    <input style={styles.formInput} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div style={{flex:1}}>
                                    <label style={styles.formLabel}>Email</label>
                                    <input style={styles.formInput} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>

                            <label style={styles.formLabel}>Địa chỉ</label>
                            <input style={styles.formInput} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.btnSave}>Lưu thông tin</button>
                                <button type="button" onClick={handleCancel} style={styles.btnCancel}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    overhead: { fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', color: '#A68B6D', margin: 0 },
    pageTitle: { fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: '5px 0' },
    btnPrimary: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    dashboardGrid: { display: 'flex', gap: '20px', marginBottom: '25px' },
    statBox: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #EAE2D8' },
    statLabel: { fontSize: '10px', color: '#A68B6D', fontWeight: 'bold' },
    statValue: { fontSize: '28px', fontWeight: '900', color: '#3D2B1F' },
    statStatus: { fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #EAE2D8', marginBottom: '25px' },
    searchField: { border: 'none', outline: 'none', flex: 1, fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #F1E9DE', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
    businessName: { fontSize: '18px', fontWeight: 'bold', color: '#3D2B1F', margin: 0 },
    cardTools: { display: 'flex', gap: '5px' },
    toolBtn: { background: '#F8F4F0', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
    info: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666', marginBottom: '8px' },
    badge: { marginTop: '10px', padding: '6px 12px', backgroundColor: '#FDF5EC', borderRadius: '6px', color: '#8D6D4D', fontSize: '12px', fontWeight: 'bold' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '450px' },
    modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#3D2B1F' },
    formLabel: { fontSize: '11px', fontWeight: 'bold', color: '#A68B6D', display: 'block', marginBottom: '5px' },
    formInput: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #DDD', outline: 'none' },
    modalActions: { display: 'flex', gap: '10px' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#EEE', borderRadius: '8px', border: 'none', cursor: 'pointer' }
};

export default SuppliersPage;