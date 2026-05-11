import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaTags, FaPlus, FaEdit, FaTrash, FaTimes, 
    FaLayerGroup, FaSave, FaFolderOpen 
} from 'react-icons/fa';


const API_URL = 'http://localhost:5000/api/categories';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem('token'); 
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, { headers: getAuthHeader() });
            // Sắp xếp A-Z theo tên
            const sorted = (res.data?.data || []).sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sorted);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const headers = getAuthHeader();
            if (isEditing) {
                await axios.put(`${API_URL}/${form._id}`, form, { headers });
            } else {
                await axios.post(API_URL, form, { headers });
            }
            setShowModal(false);
            fetchCategories();
            alert("Lưu chủng loại thành công!");
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Xóa chủng loại "${name}"? Thao tác này không thể hoàn tác.`)) {
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
                fetchCategories();
            } catch (error) {
                alert(error.response?.data?.message || "Không thể xóa chủng loại này.");
            }
        }
    };

    const openModal = (cat = null) => {
        if (cat) {
            setIsEditing(true);
            setForm(cat);
        } else {
            setIsEditing(false);
            setForm({ name: '', description: '' });
        }
        setShowModal(true);
    };

    if (loading) return <div style={styles.loading}>Đang tải danh mục...</div>;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}><FaTags color="#3D2B1F" /> Phân loại Sản phẩm</h1>
                    <p style={styles.subtitle}>Quản lý các nhóm sản phẩm (Arabica, Robusta, Máy pha...)</p>
                </div>
                <button style={styles.btnAdd} onClick={() => openModal()}>
                    <FaPlus /> Thêm Chủng loại
                </button>
            </div>

            {/* GRID DANH MỤC */}
            <div style={styles.grid}>
                {categories.length > 0 ? categories.map(cat => (
                    <div key={cat._id} style={styles.card}>
                        <div style={styles.cardIcon}>
                            <FaLayerGroup size={24} color="#DDB892" />
                        </div>
                        <div style={styles.cardInfo}>
                            <h3 style={styles.catName}>{cat.name}</h3>
                            <p style={styles.catDesc}>{cat.description || "Chưa có mô tả chi tiết."}</p>
                            <span style={styles.date}>Tạo ngày: {new Date(cat.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div style={styles.cardActions}>
                            <button style={styles.editBtn} onClick={() => openModal(cat)}><FaEdit /></button>
                            <button style={styles.delBtn} onClick={() => handleDelete(cat._id, cat.name)}><FaTrash /></button>
                        </div>
                    </div>
                )) : (
                    <div style={styles.empty}>
                        <FaFolderOpen size={50} color="#CCC" />
                        <p>Chưa có dữ liệu. Hãy thêm chủng loại đầu tiên!</p>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2>{isEditing ? "🖊️ Sửa Chủng loại" : "➕ Thêm Chủng loại"}</h2>
                            <FaTimes onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
                        </div>
                        <form onSubmit={handleSave}>
                            <label style={styles.label}>TÊN CHỦNG LOẠI</label>
                            <input 
                                style={styles.input} 
                                value={form.name} 
                                onChange={e => setForm({...form, name: e.target.value})} 
                                required 
                                placeholder="VD: Cà phê Rang Xay"
                            />
                            
                            <label style={styles.label}>MÔ TẢ NGẮN</label>
                            <textarea 
                                style={{...styles.input, height: '100px'}} 
                                value={form.description} 
                                onChange={e => setForm({...form, description: e.target.value})} 
                                placeholder="Mô tả về đặc điểm nhóm này..."
                            />

                            <div style={styles.modalFooter}>
                                <button type="submit" style={styles.saveBtn}><FaSave /> Lưu lại</button>
                                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#FDFCF0', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '28px', color: '#3D2B1F', display: 'flex', alignItems: 'center', gap: '15px', margin: 0 },
    subtitle: { color: '#8C7E6E', fontSize: '14px', marginTop: '5px' },
    btnAdd: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' },
    cardIcon: { backgroundColor: '#FDFCF0', padding: '15px', borderRadius: '15px' },
    cardInfo: { flex: 1 },
    catName: { fontSize: '18px', color: '#3D2B1F', margin: '0 0 5px 0' },
    catDesc: { fontSize: '13px', color: '#8C7E6E', margin: '0 0 10px 0', lineHeight: '1.4' },
    date: { fontSize: '11px', color: '#A89B8D' },
    cardActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
    editBtn: { border: 'none', backgroundColor: '#EFE3D5', color: '#3D2B1F', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    delBtn: { border: 'none', backgroundColor: '#FFE5E5', color: '#FF4D4D', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '35px', borderRadius: '25px', width: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #EFE3D5', outline: 'none' },
    modalFooter: { display: 'flex', gap: '10px', marginTop: '10px' },
    saveBtn: { flex: 2, backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    cancelBtn: { flex: 1, backgroundColor: '#EFE3D5', color: '#3D2B1F', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' },
    loading: { padding: '100px', textAlign: 'center', fontSize: '18px', color: '#8C7E6E' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#A89B8D' }
};

export default CategoriesPage;