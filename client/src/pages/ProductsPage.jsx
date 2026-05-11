import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FaPlus, FaSearch, FaPen, FaTimes, FaCamera, FaTrash, 
    FaCoffee, FaSave, FaBox, FaCubes
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/products';
const CAT_URL = 'http://localhost:5000/api/categories';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tất cả Chủng loại');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        description: '',
        salePrice: 0,
        stockQuantity: 0,
        unit: 'Bao 25kg',
        category: '',
        image: ''
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem('token'); 
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeader();
            const [prodRes, catRes] = await Promise.all([
                axios.get(API_URL, { headers }),
                axios.get(CAT_URL, { headers })
            ]);

            // Fix theo cấu trúc Controller của bạn: res.data.data
            setProducts(prodRes.data?.data || []);
            setCategories(catRes.data?.data || []);
        } catch (error) {
            console.error("Lỗi fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInitialData(); }, []);

    // Hàm định dạng tiền VNĐ
    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const handleSave = async () => {
        try {
            const headers = getAuthHeader();
            const payload = {
                ...newProduct,
                salePrice: Number(newProduct.salePrice),
                stockQuantity: Number(newProduct.stockQuantity)
            };

            if (isEditing) {
                await axios.put(`${API_URL}/${newProduct._id}`, payload, { headers });
            } else {
                await axios.post(API_URL, payload, { headers });
            }
            setShowModal(false);
            fetchInitialData();
            resetForm();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Kiểm tra kết nối"));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn muốn xóa sản phẩm này?")) {
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
                fetchInitialData();
            } catch (error) { alert("Lỗi khi xóa"); }
        }
    };

    const resetForm = () => {
        setNewProduct({ name: '', sku: '', description: '', salePrice: 0, stockQuantity: 0, unit: 'Bao 25kg', category: '', image: '' });
        setIsEditing(false);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'Tất cả Chủng loại' || (p.category?.name || p.category) === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter]);

    if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Đang tải dữ liệu...</div>;

    return (
        <div style={styles.container}>
            {/* THỐNG KÊ NHANH */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>TỔNG SKU</label>
                    <h2 style={styles.statNumber}>{products.length}</h2>
                </div>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>TỔNG TỒN KHO</label>
                    <h2 style={styles.statNumber}>{products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0)} bao</h2>
                </div>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>GIÁ TRỊ KHO</label>
                    <h2 style={{...styles.statNumber, fontSize: '18px'}}>{formatVND(products.reduce((sum, p) => sum + (p.salePrice * p.stockQuantity), 0))}</h2>
                </div>
            </div>

            {/* HEADER */}
            <div style={styles.topHeader}>
                <div>
                    <h1 style={styles.mainTitle}>Kho Sản phẩm</h1>
                    <p style={styles.subTitle}>Quản lý giá, tồn kho và chủng loại cà phê.</p>
                </div>
                <button style={styles.btnCreate} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Thêm Sản phẩm
                </button>
            </div>

            {/* BỘ LỌC */}
            <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                    <FaSearch color="#A89B8D" />
                    <input style={styles.searchInput} placeholder="Tìm mã SKU hoặc tên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select style={styles.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option>Tất cả Chủng loại</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>

            {/* LƯỚI SẢN PHẨM */}
            <div style={styles.grid}>
                {filteredProducts.map(product => (
                    <div key={product._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            {product.image ? <img src={product.image} style={styles.cardImg} alt="p" /> : <div style={styles.noImg}><FaCoffee size={40} color="#DDB892" /></div>}
                            <span style={styles.skuLabel}>SKU: {product.sku}</span>
                        </div>
                        <div style={styles.cardBody}>
                            <p style={styles.cardCat}>{product.category?.name || 'Chưa phân loại'}</p>
                            <h4 style={styles.cardName}>{product.name}</h4>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <span style={{fontSize:'12px', color:'#8C7E6E'}}><FaBox size={10}/> Tồn: <b>{product.stockQuantity || 0}</b></span>
                                <span style={{fontSize:'12px', color:'#8C7E6E'}}>{product.unit}</span>
                            </div>
                            <div style={styles.cardFooter}>
                                <span style={styles.price}>{formatVND(product.salePrice)}</span>
                                <div style={{display:'flex', gap: '8px'}}>
                                    <button style={styles.iconBtn} onClick={() => { setNewProduct(product); setIsEditing(true); setShowModal(true); }}><FaPen size={12}/></button>
                                    <button style={{...styles.iconBtn, color: '#FF4D4D'}} onClick={() => handleDelete(product._id)}><FaTrash size={12}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm mới vào kho'}</h2>
                            <FaTimes onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{flex: 1.5}}>
                                <div style={styles.sectionCard}>
                                    <label style={styles.label}>TÊN SẢN PHẨM</label>
                                    <input style={styles.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                                    <div style={{display:'flex', gap:'15px'}}>
                                        <div style={{flex:1}}>
                                            <label style={styles.label}>CHỦNG LOẠI</label>
                                            <select style={styles.input} value={typeof newProduct.category === 'object' ? newProduct.category?._id : newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                                <option value="">-- Chọn --</option>
                                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{flex:1}}>
                                            <label style={styles.label}>MÃ SKU</label>
                                            <input style={styles.input} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                                        </div>
                                    </div>
                                    <label style={styles.label}>MÔ TẢ CHI TIẾT</label>
                                    <textarea style={{...styles.input, height: '80px'}} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                                </div>
                            </div>
                            <div style={{flex: 1}}>
                                <div style={styles.sectionCard}>
                                    <label style={styles.label}>HÌNH ẢNH</label>
                                    <div style={styles.uploadBox} onClick={() => document.getElementById('fileIn').click()}>
                                        {newProduct.image ? <img src={newProduct.image} style={styles.previewImg} alt="p" /> : <div><FaCamera size={30} color="#CCC"/><p>TẢI ẢNH</p></div>}
                                        <input id="fileIn" type="file" hidden onChange={(e) => {
                                            const file = e.target.files[0];
                                            const r = new FileReader();
                                            r.onloadend = () => setNewProduct({...newProduct, image: r.result});
                                            if(file) r.readAsDataURL(file);
                                        }} />
                                    </div>
                                </div>
                                <div style={styles.sectionCard}>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <div style={{flex:1.2}}>
                                            <label style={styles.label}>GIÁ BÁN (VNĐ)</label>
                                            <input type="number" style={styles.input} value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} />
                                        </div>
                                        <div style={{flex:1}}>
                                            <label style={styles.label}>SỐ LƯỢNG TỒN</label>
                                            <input type="number" style={styles.input} value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                                        </div>
                                    </div>
                                    <label style={styles.label}>ĐƠN VỊ TÍNH</label>
                                    <select style={styles.input} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                                        <option>Bao 25kg</option>
                                        <option>Bao 50kg</option>
                                        <option>Túi 1kg</option>
                                        <option>Tấn</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.btnSaveFull} onClick={handleSave}><FaSave/> Lưu lại</button>
                            <button style={styles.btnCancelFull} onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px 50px', backgroundColor: '#F9F5F0', minHeight: '100vh' },
    statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
    statCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    statLabel: { fontSize: '10px', color: '#A89B8D', fontWeight: 'bold' },
    statNumber: { fontSize: '24px', color: '#3D2B1F', marginTop: '5px' },
    topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    mainTitle: { fontSize: '28px', color: '#3D2B1F', margin: 0, fontWeight: '800' },
    subTitle: { color: '#8C7E6E', fontSize: '14px' },
    btnCreate: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'10px', fontWeight:'bold' },
    toolbar: { display: 'flex', gap: '15px', marginBottom: '30px' },
    searchBox: { flex: 1, backgroundColor: '#EFE3D5', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 15px' },
    searchInput: { border: 'none', backgroundColor: 'transparent', padding: '12px', width: '100%', outline: 'none' },
    select: { padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#EFE3D5' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    cardHeader: { position: 'relative', height: '180px', backgroundColor: '#F5F5F5' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    noImg: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    skuLabel: { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '4px' },
    cardBody: { padding: '20px' },
    cardCat: { fontSize: '10px', color: '#DDB892', fontWeight: 'bold', textTransform: 'uppercase' },
    cardName: { fontSize: '18px', color: '#3D2B1F', margin: '5px 0 15px 0', height: '45px', overflow: 'hidden' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EEE', paddingTop: '15px' },
    price: { fontSize: '18px', fontWeight: '800' },
    iconBtn: { border: 'none', backgroundColor: '#F5F5F5', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#FDFCF0', borderRadius: '25px', width: '850px', padding: '35px', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' },
    modalBody: { display: 'flex', gap: '30px' },
    sectionCard: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EFE3D5', backgroundColor: '#FDFCF0' },
    uploadBox: { height: '180px', border: '2px dashed #EFE3D5', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden' },
    previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '15px' },
    btnSaveFull: { backgroundColor: '#3D2B1F', color: 'white', padding: '15px 40px', borderRadius: '12px', cursor: 'pointer', border: 'none', fontWeight: 'bold' },
    btnCancelFull: { backgroundColor: '#EFE3D5', padding: '15px 40px', borderRadius: '12px', cursor: 'pointer', border: 'none' }
};

export default ProductManagement;