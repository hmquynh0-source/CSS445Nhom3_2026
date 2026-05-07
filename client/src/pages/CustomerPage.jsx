import React from 'react';
import { 
  FaUserPlus, FaFileExport, FaSearch, FaEllipsisV, 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt 
} from 'react-icons/fa';

const CustomersPage = () => {
  return (
    <div style={styles.container}>
      {/* Header Title Section */}
      <div style={styles.headerTitleRow}>
        <div>
          <p style={styles.upperTitle}>QUẢN LÝ QUAN HỆ</p>
          <h1 style={styles.mainTitle}>Danh mục khách hàng & Đối tác</h1>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.exportBtn}><FaFileExport /> Xuất dữ liệu</button>
          <button style={styles.addBtn}><FaUserPlus /> Thêm khách hàng mới</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <StatCard label="TỔNG SỐ KHÁCH HÀNG" value="1,284" trend="+12% tháng này" />
        <StatCard label="ĐỐI TÁC THU MUA CHIẾN LƯỢC" value="42" trend="ỔN ĐỊNH" />
        <StatCard label="TỔNG DOANH THU KỲ VỌNG" value="4.2B" subValue="VND" trend="Q4 Outlook" />
      </div>

      {/* Main Content: List and Detail Split */}
      <div style={styles.mainContentGrid}>
        {/* Left Side: Filter & List */}
        <div style={styles.listSection}>
          <div style={styles.filterBar}>
            <div style={styles.tabs}>
              <span style={styles.tabActive}>Tất cả</span>
              <span style={styles.tab}>Khách hàng thân thiết</span>
              <span style={styles.tab}>Đối tác thu mua</span>
            </div>
            <div style={styles.searchContainer}>
              <FaSearch color="#A89B8D" />
              <input type="text" placeholder="Tìm kiếm..." style={styles.searchInput} />
            </div>
          </div>

          <div style={styles.tableHeader}>
            <span style={{flex: 2}}>THÔNG TIN ĐỐI TÁC</span>
            <span style={{flex: 1}}>PHÂN LOẠI</span>
            <span style={{flex: 1}}>LẦN MUA CUỐI</span>
            <span style={{flex: 1}}>TỔNG GIAO DỊCH</span>
          </div>

          {/* List Items */}
          <CustomerItem 
            initials="BN"
            name="Bean & Brew Network" 
            email="contact@beanbrew.vn"
            type="ĐỐI TÁC THU MUA"
            lastDate="12 Th08, 2023"
            total="842.000.000đ"
          />
          <CustomerItem 
            logo="☕"
            name="Urban Roastery Co." 
            email="info@urbanroast.com"
            type="THÂN THIẾT (VIP)"
            lastDate="Hôm qua"
            total="1.250.000.000đ"
            active
          />
          <CustomerItem 
            initials="HL"
            name="Highland Export Group" 
            email="logistics@highland.vn"
            type="KHÁCH LẺ TIỀM NĂNG"
            lastDate="05 Th07, 2023"
            total="45.500.000đ"
          />
        </div>

        {/* Right Side: Quick Detail View */}
        <aside style={styles.detailSidebar}>
          <div style={styles.detailHeader}>
             <div style={styles.detailAvatar}>☕</div>
             <h3 style={styles.detailName}>Urban Roastery Co.</h3>
             <p style={styles.detailSub}>Đối tác chiến lược khu vực miền Nam</p>
          </div>
          
          <div style={styles.detailInfoBox}>
            <p style={styles.infoTitle}>THÔNG TIN LIÊN HỆ</p>
            <p style={styles.infoItem}><FaUserPlus /> Nguyễn Văn An (Giám đốc)</p>
            <p style={styles.infoItem}><FaPhoneAlt /> +84 902 334 112</p>
            <p style={styles.infoItem}><FaMapMarkerAlt /> 242 Lê Lợi, Quận 1, TP.HCM</p>
          </div>

          <div style={styles.historyBox}>
            <p style={styles.infoTitle}>LỊCH SỬ GIAO DỊCH (GẦN ĐÂY)</p>
            <HistoryItem title="Gửi Arabica Thượng Hạng" date="15/09/2023 • 500kg" />
            <HistoryItem title="Giao hàng Coffee Roaster 2" date="02/09/2023 • 200kg" />
            <p style={styles.debtText}>Thanh toán dư nợ Q2: 28/07/2023</p>
          </div>

          <button style={styles.viewFullBtn}>XEM TOÀN BỘ</button>
          <button style={styles.sendNotiBtn}>GỬI THÔNG BÁO</button>
        </aside>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, subValue, trend }) => (
  <div style={styles.statCard}>
    <p style={styles.statLabel}>{label}</p>
    <h2 style={styles.statValue}>{value} <span style={{fontSize: '14px'}}>{subValue}</span></h2>
    <p style={styles.statTrend}>{trend}</p>
  </div>
);

const CustomerItem = ({ initials, logo, name, email, type, lastDate, total, active }) => (
  <div style={{...styles.listItem, backgroundColor: active ? '#F9F1E7' : 'transparent'}}>
    <div style={{flex: 2, display: 'flex', alignItems: 'center', gap: '15px'}}>
      <div style={styles.avatar}>{logo || initials}</div>
      <div>
        <p style={styles.itemName}>{name}</p>
        <p style={styles.itemEmail}>{email}</p>
      </div>
    </div>
    <div style={{flex: 1, fontSize: '12px', fontWeight: 'bold', color: '#8B5E3C'}}>{type}</div>
    <div style={{flex: 1, fontSize: '12px', color: '#70645C'}}>{lastDate}</div>
    <div style={{flex: 1, fontSize: '14px', fontWeight: 'bold', color: '#3D2B1F'}}>{total}</div>
  </div>
);

const HistoryItem = ({ title, date }) => (
  <div style={{marginBottom: '15px'}}>
    <p style={{margin: 0, fontSize: '13px', fontWeight: '600', color: '#3D2B1F'}}>{title}</p>
    <p style={{margin: 0, fontSize: '11px', color: '#A89B8D'}}>{date}</p>
  </div>
);

const styles = {
  container: { padding: '10px 0' },
  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
  upperTitle: { fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', letterSpacing: '1px' },
  mainTitle: { fontSize: '32px', fontWeight: '800', color: '#3D2B1F', margin: '5px 0' },
  headerActions: { display: 'flex', gap: '10px' },
  addBtn: { backgroundColor: '#FFFFFF', border: '1px solid #E5D5C5', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  exportBtn: { backgroundColor: 'transparent', border: 'none', color: '#3D2B1F', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  
  statsRow: { display: 'flex', gap: '20px', marginBottom: '40px' },
  statCard: { flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
  statLabel: { fontSize: '10px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '10px' },
  statValue: { fontSize: '28px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
  statTrend: { fontSize: '12px', color: '#4F7942', marginTop: '5px', fontWeight: '600' },

  mainContentGrid: { display: 'flex', gap: '30px' },
  listSection: { flex: 3 },
  filterBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '20px', alignItems: 'center' },
  tabActive: { fontWeight: 'bold', color: '#3D2B1F', borderBottom: '2px solid #3D2B1F', paddingBottom: '5px' },
  tab: { color: '#A89B8D', cursor: 'pointer' },
  searchContainer: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F9F1E7', padding: '8px 15px', borderRadius: '8px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '150px' },

  tableHeader: { display: 'flex', padding: '15px', fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', borderBottom: '1px solid #E5D5C5' },
  listItem: { display: 'flex', padding: '20px 15px', alignItems: 'center', borderBottom: '1px solid #F1F1F1', transition: '0.3s', cursor: 'pointer' },
  avatar: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E5D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3D2B1F' },
  itemName: { margin: 0, fontWeight: 'bold', color: '#3D2B1F' },
  itemEmail: { margin: 0, fontSize: '12px', color: '#A89B8D' },

  detailSidebar: { flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '15px', height: 'fit-content' },
  detailAvatar: { width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#F9F1E7', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
  detailName: { textAlign: 'center', margin: '0 0 5px 0', fontSize: '20px' },
  detailSub: { textAlign: 'center', fontSize: '12px', color: '#A89B8D', margin: '0 0 30px 0' },
  infoTitle: { fontSize: '10px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '15px' },
  infoItem: { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#3D2B1F', marginBottom: '10px' },
  debtText: { fontSize: '11px', color: '#A89B8D', fontStyle: 'italic', marginTop: '10px' },
  viewFullBtn: { width: '100%', padding: '12px', border: '1px solid #E5D5C5', borderRadius: '8px', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
  sendNotiBtn: { width: '100%', border: 'none', backgroundColor: 'transparent', color: '#A89B8D', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

export default CustomersPage;