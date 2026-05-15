import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaClipboardList, FaBoxes, FaSyncAlt, FaUsers, FaTruck } from 'react-icons/fa';

const API_PRODUCTS = 'http://localhost:5000/api/products';
// Giả sử bạn có thêm các link này, nếu chưa có thì dùng tạm dữ liệu ảo
const API_STATS = 'http://localhost:5000/api/stats'; 

const HomePage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    orderCount: 1284, // Tạm thời
    supplierCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Lấy dữ liệu từ API sản phẩm để tính toán tồn kho
      const res = await axios.get(API_PRODUCTS, { headers });
      const products = res.data?.data || [];

      // Tính toán các con số thực tế
      const stock = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
      const value = products.reduce((sum, p) => sum + ((Number(p.salePrice) || 0) * (Number(p.stockQuantity) || 0)), 0);
      
      // Cập nhật State
      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        totalStock: stock,
        totalValue: value,
      }));

    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Tiêu đề trang */}
      <header>
        <p style={styles.overhead}>Dashboard Overview</p>
        <h1 style={styles.mainTitle}>Quản lý Warehouse</h1>
        <p style={styles.description}>
          Hệ thống đang hiển thị dữ liệu thực tế từ kho hàng của bạn.
        </p>
      </header>

      {/* Grid Stats */}
      <section style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <InfoCard 
          icon={<FaClipboardList />} 
          title="Tổng mã hàng (SKU)" 
          value={stats.totalProducts} 
          subtitle="Sẵn sàng kinh doanh" 
          color="#F0F7ED"
        />
        <InfoCard 
          icon={<FaChartLine />} 
          title="Giá trị kho hàng" 
          value={formatVND(stats.totalValue)} 
          subtitle="Ước tính doanh thu" 
          color="#EBF5FF"
        />
        <InfoCard 
          icon={<FaBoxes />} 
          title="Tổng lượng tồn" 
          value={`${stats.totalStock} bao`} 
          subtitle="Lưu kho hiện tại" 
          color="#FFF9EB"
        />
      </section>

      {/* Khu vực Biểu đồ & Thông tin phụ */}
      <section style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <div>
              <p style={styles.overhead}>Phân tích hoạt động</p>
              <h2 style={styles.chartTitle}>Trạng thái hệ thống</h2>
            </div>
            <button style={styles.btnRefresh} onClick={fetchDashboardData}>
              {loading ? 'ĐANG TẢI...' : 'LÀM MỚI'}
            </button>
          </div>
          
          <div style={styles.chartPlaceholder}>
             <FaSyncAlt size={24} style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} />
             <p style={{ fontSize: '14px' }}>
               {loading ? 'Hệ thống đang kết nối Database...' : 'Dữ liệu đã được đồng bộ hóa.'}
             </p>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          <SummaryCard icon={<FaTruck />} title="Nhà cung cấp" value="12" detail="Đối tác cung ứng cà phê" />
          <SummaryCard icon={<FaUsers />} title="Nhân sự" value="5" detail="Đội ngũ quản lý kho" />
        </div>
      </section>

      {/* Thêm CSS cho hiệu ứng xoay */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// --- Sub-components ---

const InfoCard = ({ icon, title, value, subtitle, color }) => (
  <div style={styles.infoCard}>
    <div style={styles.iconWrapper}>{icon}</div>
    <p style={styles.cardTitle}>{title}</p>
    <h3 style={styles.cardValue}>{value}</h3>
    <div style={{ ...styles.badge, backgroundColor: color }}>
      {subtitle}
    </div>
  </div>
);

const SummaryCard = ({ title, value, detail, icon }) => (
  <div style={styles.summaryCard}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={styles.cardTitle}>{title}</p>
        <span style={{ color: '#8D6D4D' }}>{icon}</span>
    </div>
    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <h3 style={styles.summaryValue}>{value}</h3>
      <span style={styles.statusLabel}>ACTIVE</span>
    </div>
    <p style={styles.summaryDetail}>{detail}</p>
  </div>
);

const styles = {
  overhead: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 'bold', color: '#A68B6D', margin: 0 },
  mainTitle: { marginTop: '8px', fontSize: '36px', fontWeight: 900, color: '#3D2B1F', margin: '8px 0' },
  description: { marginTop: '12px', fontSize: '14px', color: '#7A6352', maxWidth: '600px', lineHeight: '1.6' },
  infoCard: { flex: 1, minWidth: '280px', borderRadius: '32px', border: '1px solid #EFE2D1', backgroundColor: 'white', padding: '28px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' },
  iconWrapper: { height: '56px', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: '#F5EEE6', color: '#8D6D4D', fontSize: '20px' },
  cardTitle: { marginTop: '24px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A68B6D', margin: '24px 0 8px 0' },
  cardValue: { fontSize: '24px', fontWeight: '900', color: '#3D2B1F', margin: '0 0 16px 0' },
  badge: { display: 'inline-block', borderRadius: '20px', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', color: '#4A6741' },
  chartContainer: { flex: 2, minWidth: '400px', borderRadius: '32px', backgroundColor: 'white', padding: '32px', border: '1px solid #F1E9DE', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  chartHeader: { marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { marginTop: '4px', fontSize: '24px', fontWeight: 'bold', color: '#3D2B1F', margin: 0 },
  btnRefresh: { borderRadius: '20px', backgroundColor: '#F8F1E6', border: 'none', padding: '8px 16px', fontSize: '10px', fontWeight: 'black', color: '#8D6D4D', cursor: 'pointer' },
  chartPlaceholder: { height: '300px', borderRadius: '24px', backgroundColor: '#FDFCF7', border: '2px dashed #EADBC4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A68B6D', gap: '12px' },
  summaryCard: { borderRadius: '32px', border: '1px solid #EFE2D1', backgroundColor: 'white', padding: '32px', flex: 1 },
  summaryValue: { fontSize: '40px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
  statusLabel: { fontSize: '10px', fontWeight: 'bold', color: '#4A6741' },
  summaryDetail: { marginTop: '16px', fontSize: '12px', color: '#7A6352', fontStyle: 'italic', opacity: 0.8, margin: 0 }
};

export default HomePage;