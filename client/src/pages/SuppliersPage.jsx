import React from 'react';
import { 
    FaPlus, FaSearch, FaStar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope 
} from 'react-icons/fa';

const SuppliersPage = () => {
    return (
        
        <div style={styles.contentPadding}>
            {/* Title Section */}
            <div style={styles.titleRow}>
                <div>
                    <p style={styles.upperTitle}>CUNG ỨNG THƯỢNG HẠNG</p>
                    <h1 style={styles.mainTitle}>Đối tác Cung ứng</h1>
                    <p style={styles.subDescription}>
                        Quản lý mạng lưới các đồn điền và đại lý chiến lược, đảm bảo nguồn cung cà phê bền vững.
                    </p>
                </div>
                <button style={styles.addSupplierBtn}>
                    <FaPlus /> Thêm mới nhà cung cấp
                </button>
            </div>

            {/* Top Stats & Map Row */}
            <div style={styles.mapGrid}>
                <div style={styles.mapContainer}>
                    <div style={styles.mapOverlay}>
                        <h4 style={{margin: 0, fontSize: '14px'}}>Mạng lưới Vùng Nguyên Liệu</h4>
                        <p style={{fontSize: '11px', opacity: 0.8}}>Hiển thị 12 đồn điền đang hoạt động tại Tây Nguyên.</p>
                    </div>
                    {/* Placeholder cho Map */}
                    <div style={styles.mapPlaceholder}></div>
                </div>
                
                <div style={styles.kpiColumn}>
                    <div style={styles.kpiCard}>
                        <p style={styles.kpiLabel}>TỔNG SẢN LƯỢNG THÁNG</p>
                        <h2 style={styles.kpiValue}>12,450 <span style={{fontSize: '16px'}}>Tấn</span></h2>
                        <p style={styles.kpiTrend}>+8.2% vs Tháng trước</p>
                    </div>
                    <div style={{...styles.kpiCard, backgroundColor: '#3D2B1F', color: '#FFF'}}>
                        <p style={{...styles.kpiLabel, color: '#A89B8D'}}>ĐỘ TIN CẬY TRUNG BÌNH</p>
                        <h2 style={{...styles.kpiValue, color: '#FFF'}}>98.4%</h2>
                        <div style={{display: 'flex', gap: '4px', color: '#D97706'}}>
                            {[1,2,3,4].map(i => <FaStar key={i}/>)}<FaStar style={{opacity: 0.5}}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={styles.filterBar}>
                <div style={styles.filterTabs}>
                    <span style={styles.tabActive}>Tất cả</span>
                    <span style={styles.tab}>Đồn điền</span>
                    <span style={styles.tab}>Đại lý</span>
                    <span style={styles.tab}>Ưu tiên cao</span>
                </div>
                <div style={styles.searchBox}>
                    <FaSearch color="#A89B8D" />
                    <input type="text" placeholder="Tìm kiếm đối tác..." style={styles.searchInput} />
                </div>
            </div>

            {/* Supplier Cards Grid */}
            <div style={styles.cardGrid}>
                <SupplierCard 
                    name="Đồn điền Arabica Cầu Đất" 
                    location="TP. ĐÀ LẠT, LÂM ĐỒNG" 
                    output="850 Tấn" 
                    rating="4.9"
                    status="ĐANG HỢP TÁC"
                    statusColor="#4F7942"
                    image="https://images.unsplash.com/photo-1501333190117-75d3b75f9291?w=100&auto=format&fit=crop"
                />
                <SupplierCard 
                    name="Đại lý Robusta Buôn Ma Thuột" 
                    location="TP. BUÔN MA THUỘT, ĐẮK LẮK" 
                    output="1,200 Tấn" 
                    rating="4.2"
                    status="CẦN KIỂM TRA"
                    statusColor="#D97706"
                    image="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop"
                    contactIcon={<FaEnvelope />}
                />
                <div style={styles.addCard}>
                    <div style={styles.addCircle}><FaPlus /></div>
                    <h4 style={{margin: '15px 0 5px 0'}}>Đăng ký đối tác mới</h4>
                    <p style={{fontSize: '12px', color: '#A89B8D'}}>Mở rộng mạng lưới cung ứng của bạn ngay.</p>
                </div>
            </div>
        </div>
    );
};

// Component con
const SupplierCard = ({ name, location, output, rating, status, statusColor, image, contactIcon }) => (
    <div style={styles.sCard}>
        <div style={styles.cardHeader}>
            <img src={image} alt={name} style={styles.cardImg} />
            <span style={{...styles.statusBadge, backgroundColor: `${statusColor}22`, color: statusColor}}>{status}</span>
        </div>
        <h3 style={styles.cardName}>{name}</h3>
        <p style={styles.cardLoc}><FaMapMarkerAlt /> {location}</p>
        
        <div style={styles.cardStats}>
            <div style={styles.cardStatItem}>
                <p style={styles.statLabel}>SẢN LƯỢNG</p>
                <p style={styles.statVal}>{output}</p>
            </div>
            <div style={styles.cardStatItem}>
                <p style={styles.statLabel}>XẾP HẠNG</p>
                <p style={styles.statVal}>{rating} <FaStar size={10} color="#D97706" /></p>
            </div>
        </div>
        <div style={styles.cardFooter}>
            <div style={styles.contactBtn}>
                {contactIcon || <FaPhoneAlt />} <span style={{marginLeft: '8px'}}>Liên hệ</span>
            </div>
            <div style={styles.arrowCircle}>→</div>
        </div>
    </div>
);

const styles = {
    contentPadding: { padding: '10px 0' }, // Giảm padding vì layout ngoài đã có
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
    upperTitle: { fontSize: '11px', fontWeight: '700', color: '#A89B8D', letterSpacing: '1px', margin: 0 },
    mainTitle: { fontSize: '32px', fontWeight: '800', color: '#3D2B1F', margin: '5px 0' },
    subDescription: { fontSize: '14px', color: '#777', maxWidth: '500px', margin: 0, lineHeight: '1.5' },
    addSupplierBtn: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    mapGrid: { display: 'flex', gap: '20px', marginBottom: '40px' },
    mapContainer: { flex: 2, height: '300px', borderRadius: '15px', position: 'relative', overflow: 'hidden', border: '1px solid #E5D5C5' },
    mapOverlay: { position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '8px', zIndex: 1, border: '1px solid #E5D5C5' },
    mapPlaceholder: { width: '100%', height: '100%', backgroundColor: '#E0D5C5', backgroundImage: 'url("https://www.google.com/maps/d/u/0/thumbnail?mid=1z_5lSjTz7_3zFj-8Q9k8W9M-3P8")' },
    kpiColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
    kpiCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    kpiLabel: { fontSize: '10px', fontWeight: '700', color: '#A89B8D', margin: '0 0 10px 0' },
    kpiValue: { fontSize: '28px', fontWeight: '800', color: '#3D2B1F', margin: '0 0 5px 0' },
    kpiTrend: { fontSize: '12px', color: '#4F7942', margin: 0 },
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    filterTabs: { display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '600', color: '#3D2B1F' },
    tabActive: { backgroundColor: '#E5D5C5', padding: '6px 12px', borderRadius: '6px' },
    tab: { color: '#A89B8D', cursor: 'pointer' },
    searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#E5D5C5', padding: '8px 16px', borderRadius: '8px', gap: '10px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '200px' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    sCard: { backgroundColor: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    cardImg: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
    statusBadge: { fontSize: '9px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px' },
    cardName: { fontSize: '18px', fontWeight: '700', color: '#3D2B1F', margin: '0 0 5px 0' },
    cardLoc: { fontSize: '11px', color: '#A89B8D', display: 'flex', alignItems: 'center', gap: '6px' },
    cardStats: { display: 'flex', gap: '20px', margin: '15px 0', padding: '15px 0', borderTop: '1px solid #F1F1F1', borderBottom: '1px solid #F1F1F1' },
    statLabel: { fontSize: '9px', color: '#A89B8D', margin: 0 },
    statVal: { fontSize: '15px', fontWeight: '700', color: '#3D2B1F', margin: 0 },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    contactBtn: { display: 'flex', alignItems: 'center', backgroundColor: '#F9F1E7', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#3D2B1F', fontWeight: '600' },
    arrowCircle: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E5D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    addCard: { border: '2px dashed #E5D5C5', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '220px' },
    addCircle: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#E5D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default SuppliersPage;