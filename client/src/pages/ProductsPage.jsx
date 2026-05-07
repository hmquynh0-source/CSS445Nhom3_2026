import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FaPlus, FaSearch, FaPen, FaTimes, FaCamera, FaTrash, 
    FaCoffee, FaSave, FaInfoCircle, FaBox, FaChartBar 
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/products';

const ProductManagement = () => {
    // --- STATE QUẢN LÝ ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tất cả Chủng loại');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form data đầy đủ các trường để tránh lỗi Validation từ MongoDB
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        description: '',
        salePrice: 0,
        costPrice: 0,
        unit: 'Bao 25kg',
        category: '', // Điền ID từ Compass vào đây
        image: ''
    });

    // --- 1. LẤY DỮ LIỆU ---
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- 2. XỬ LÝ ẢNH (FIX LỖI KHÔNG HIỆN ẢNH) ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, image: reader.result }); // Preview & Save Base64
            };
            reader.readAsDataURL(file);
        }
    };

    // --- 3. LƯU & XÓA DỮ LIỆU ---
    const handleSave = async () => {
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${newProduct._id}`, newProduct);
            } else {
                // Đảm bảo các trường số không bị rỗng
                const payload = {
                    ...newProduct,
                    costPrice: Number(newProduct.costPrice),
                    salePrice: Number(newProduct.salePrice)
                };
                await axios.post(API_URL, payload);
            }
            alert("Thành công!");
            setShowModal(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error("Lỗi chi tiết:", error.response?.data);
            alert("Lỗi lưu dữ liệu: " + (error.response?.data?.message || "Kiểm tra Console"));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchProducts();
            } catch (error) {
                alert("Không thể xóa sản phẩm.");
            }
        }
    };

    const resetForm = () => {
        setNewProduct({ name: '', sku: '', description: '', salePrice: 0, costPrice: 0, unit: 'Bao 25kg', category: '', image: '' });
        setIsEditing(false);
    };

    // --- 4. LỌC DỮ LIỆU ---
    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'Tất cả Chủng loại' || p.category?.name === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter]);

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải dữ liệu kho...</div>;

    return (
        <div style={styles.container}>
            {/* THANH THỐNG KÊ (STATS) */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>TỔNG SKU</label>
                    <h2 style={styles.statNumber}>{products.length.toLocaleString()}</h2>
                </div>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>LÔ HÀNG ĐANG HOẠT ĐỘNG</label>
                    <h2 style={styles.statNumber}>42</h2>
                </div>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>TỈ LỆ LẤP ĐẦY KHO</label>
                    <h2 style={styles.statNumber}>84%</h2>
                </div>
                <div style={styles.statCard}>
                    <label style={styles.statLabel}>ĐIỂM CHẤT LƯỢNG TB</label>
                    <h2 style={styles.statNumber}>9.2</h2>
                </div>
            </div>

            {/* HEADER & SEARCH */}
            <div style={styles.topHeader}>
                <div>
                    <h1 style={styles.mainTitle}>Quản lý Sản phẩm</h1>
                    <p style={styles.subTitle}>Theo dõi chính xác bộ sưu tập cà phê thượng hạng của chúng tôi.</p>
                </div>
                <button style={styles.btnCreate} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Tạo Sản phẩm
                </button>
            </div>

            <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                    <FaSearch color="#A89B8D" />
                    <input 
                        style={styles.searchInput} 
                        placeholder="Tìm theo tên hoặc mã SKU..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select style={styles.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option>Tất cả Chủng loại</option>
                    <option>Arabica</option>
                    <option>Robusta</option>
                </select>
            </div>

            {/* GRID SẢN PHẨM */}
            <div style={styles.grid}>
                {filteredProducts.map(product => (
                    <div key={product._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.statusBadge}>CÒN HÀNG</span>
                            {product.image ? (
                                <img src={product.image} style={styles.cardImg} alt="product" />
                            ) : (
                                <div style={styles.noImg}><FaCoffee size={40} color="#DDB892" /></div>
                            )}
                            <span style={styles.skuLabel}>SKU: {product.sku}</span>
                        </div>
                        <div style={styles.cardBody}>
                            <p style={styles.cardCat}>{product.category?.name || 'ARABICA'}</p>
                            <h4 style={styles.cardName}>{product.name}</h4>
                            <div style={styles.cardFooter}>
                                <span style={styles.price}>${product.salePrice}.00</span>
                                <div style={{display:'flex', gap: '8px'}}>
                                    <button style={styles.iconBtn} onClick={() => { setNewProduct(product); setIsEditing(true); setShowModal(true); }}><FaPen size={12}/></button>
                                    <button style={{...styles.iconBtn, color: '#FF4D4D'}} onClick={() => handleDelete(product._id)}><FaTrash size={12}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL TẠO/SỬA SẢN PHẨM */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>{isEditing ? 'Cập nhật Sản phẩm' : 'Tạo Sản phẩm Mới'}</h2>
                            <FaTimes onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
                        </div>

                        <div style={styles.modalBody}>
                            {/* Cột Trái: Thông tin chung */}
                            <div style={{flex: 1.5}}>
                                <div style={styles.sectionCard}>
                                    <h4 style={styles.sectionTitle}><FaInfoCircle/> Thông tin Chung</h4>
                                    <label style={styles.label}>TÊN SẢN PHẨM</label>
                                    <input style={styles.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="VD: Arabica Cầu Đất Special" />
                                    
                                    <div style={{display:'flex', gap:'15px'}}>
                                        <div style={{flex:1}}>
                                            <label style={styles.label}>CHỦNG LOẠI</label>
                                            <input style={styles.input} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Dán ID từ Compass" />
                                        </div>
                                        <div style={{flex:1}}>
                                            <label style={styles.label}>SKU (MÃ SẢN PHẨM)</label>
                                            <input style={styles.input} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="RL-ARB-001" />
                                        </div>
                                    </div>
                                    <label style={styles.label}>MÔ TẢ SẢN PHẨM</label>
                                    <textarea style={{...styles.input, height: '80px'}} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                                </div>
                            </div>

                            {/* Cột Phải: Ảnh & Giá */}
                            <div style={{flex: 1}}>
                                <div style={styles.sectionCard}>
                                    <h4 style={styles.sectionTitle}><FaCamera/> HÌNH ẢNH</h4>
                                    <div style={styles.uploadBox} onClick={() => document.getElementById('fileIn').click()}>
                                        {newProduct.image ? <img src={newProduct.image} style={styles.previewImg} /> : <div style={{textAlign:'center'}}><FaCamera size={30} color="#CCC"/><p style={{fontSize:'12px'}}>TẢI ẢNH LÊN</p></div>}
                                        <input id="fileIn" type="file" hidden onChange={handleImageChange} />
                                    </div>
                                </div>
                                <div style={styles.sectionCard}>
                                    <h4 style={styles.sectionTitle}><FaBox/> Giá & Kho</h4>
                                    <label style={styles.label}>GIÁ BÁN ($/KG)</label>
                                    <input type="number" style={styles.input} value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} />
                                    <label style={styles.label}>ĐƠN VỊ ĐÓNG GÓI</label>
                                    <select style={styles.input} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                                        <option>Bao 25kg</option>
                                        <option>Bao 50kg</option>
                                        <option>Hộp 10kg</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.btnSaveFull} onClick={handleSave}><FaSave/> Lưu sản phẩm</button>
                            <button style={styles.btnCancelFull} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- HỆ THỐNG STYLES ---
const styles = {
    container: { padding: '40px 60px', backgroundColor: '#F9F5F0', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    statsRow: { display: 'flex', gap: '20px', marginBottom: '40px' },
    statCard: { flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
    statLabel: { fontSize: '10px', color: '#A89B8D', fontWeight: 'bold', letterSpacing: '1px' },
    statNumber: { fontSize: '28px', color: '#3D2B1F', margin: '10px 0 0 0' },
    topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    mainTitle: { fontSize: '32px', color: '#3D2B1F', margin: 0, fontWeight: '800' },
    subTitle: { color: '#8C7E6E', fontSize: '14px' },
    btnCreate: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
    toolbar: { display: 'flex', gap: '15px', marginBottom: '30px' },
    searchBox: { flex: 1, backgroundColor: '#EFE3D5', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 15px' },
    searchInput: { border: 'none', backgroundColor: 'transparent', padding: '12px', width: '100%', outline: 'none' },
    select: { padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#EFE3D5', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
    card: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.03)' },
    cardHeader: { position: 'relative', height: '200px', backgroundColor: '#F5F5F5' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    statusBadge: { position: 'absolute', top: '15px', left: '15px', backgroundColor: '#4CAF50', color: 'white', fontSize: '9px', padding: '4px 8px', borderRadius: '4px' },
    skuLabel: { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '4px' },
    cardBody: { padding: '20px' },
    cardCat: { fontSize: '11px', color: '#DDB892', fontWeight: 'bold', margin: 0 },
    cardName: { fontSize: '18px', color: '#3D2B1F', margin: '5px 0 15px 0' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EEE', paddingTop: '15px' },
    price: { fontSize: '20px', fontWeight: '800' },
    iconBtn: { border: 'none', backgroundColor: '#F5F5F5', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
    
    // MODAL STYLES
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#FDFCF0', borderRadius: '25px', width: '900px', padding: '35px', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid #EFE3D5', paddingBottom: '15px' },
    modalBody: { display: 'flex', gap: '30px' },
    sectionCard: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px' },
    sectionTitle: { margin: '0 0 15px 0', fontSize: '13px', color: '#3D2B1F', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #EFE3D5', backgroundColor: '#F9F5F0', boxSizing: 'border-box' },
    uploadBox: { height: '180px', border: '2px dashed #EFE3D5', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden' },
    previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' },
    btnSaveFull: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    btnCancelFull: { backgroundColor: '#EFE3D5', border: 'none', padding: '15px 40px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default ProductManagement;