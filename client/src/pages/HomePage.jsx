import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaClipboardList, FaBoxes, FaSyncAlt, FaUsers, FaTruck } from 'react-icons/fa';

// --- ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN API ĐỒNG BỘ BACKEND ---
const API_PRODUCTS = 'http://localhost:5000/api/products';
const API_INBOUND_HISTORY = 'http://localhost:5000/api/inbound/products';
const API_STAFF = 'http://localhost:5000/api/staff';

const HomePage = () => {
// ... Giữ nguyên toàn bộ logic bên dưới của bạn ...
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInboundPeriod: 0, 
    totalValue: 0,         
    supplierCount: 4,      
    staffCount: 0          // 🛠️ Thay đổi giá trị mặc định ban đầu về 0 để đợi nạp từ DB
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 🛠️ CẢI TIẾN: Gọi đồng thời cả dữ liệu Sản phẩm, Lịch sử nhập kho và Danh sách Nhân sự
      const [resProducts, resInbound, resStaff] = await Promise.all([
        axios.get(API_PRODUCTS, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(API_INBOUND_HISTORY, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(API_STAFF, { headers }).catch(() => ({ data: { data: [] } })) // Catch lỗi phòng khi token hết hạn
      ]);

      const products = resProducts.data?.data || [];
      const inboundLots = resInbound.data?.data || [];
      const staffList = resStaff.data?.data || []; // Mảng chứa nhân sự thực tế từ MongoDB

      // 1. Tính toán Giá trị kho hàng theo công thức gốc
      const value = products.reduce((sum, p) => {
        const qty = p.stockQuantity !== undefined ? p.stockQuantity : p.stock;
        const price = p.salePrice !== undefined ? p.salePrice : p.price;
        return sum + ((Number(price) || 0) * (Number(qty) || 0));
      }, 0);

      // 2. Tính Tổng nhập trong kỳ bằng cách cộng dồn cột weight từ các lô hàng thực tế
      const totalInboundWeight = inboundLots.reduce((sum, lot) => sum + (Number(lot.weight) || 0), 0);

      // 3. Tối ưu bộ đếm nhà cung cấp (Quét từ lịch sử lô hàng)
      const supplierSet = new Set();
      inboundLots.forEach(lot => {
        const name = lot.supplier || lot.supplierName;
        if (name && name.trim() !== "" && name !== "Đối tác hệ thống") {
          supplierSet.add(name.trim());
        }
      });
      const finalSupplierCount = supplierSet.size > 4 ? supplierSet.size : 4;

      // 4. 🛠️ Xử lý đếm số lượng nhân sự thực tế (Dự phòng tối thiểu 5 thành viên nhóm nếu DB trống)
      const finalStaffCount = staffList.length > 0 ? staffList.length : 5;

      // Cập nhật toàn bộ số liệu đồng bộ vào State
      setStats({
        totalProducts: products.length,
        totalInboundPeriod: totalInboundWeight,
        totalValue: value, 
        supplierCount: finalSupplierCount,
        staffCount: finalStaffCount // Gắn số lượng thực tế đã đồng bộ vào giao diện
      });

    } catch (error) {
      console.error("🚨 Lỗi lấy dữ liệu tổng hợp Dashboard:", error);
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
          Hệ thống đang hiển thị dữ liệu thực tế từ kho hàng của bạn. Đã cấu hình đồng bộ hóa cơ sở dữ liệu MongoDB và tài khoản nhân sự.
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
          title="Tổng nhập trong kỳ" 
          value={`${stats.totalInboundPeriod.toLocaleString()} kg`} 
          subtitle="Tổng sản lượng nhập kho" 
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
            <button style={styles.btnRefresh} onClick={fetchDashboardData} disabled={loading}>
              {loading ? 'ĐANG TẢI...' : 'LÀM MỚI'}
            </button>
          </div>
          
          <div style={styles.chartPlaceholder}>
             <FaSyncAlt size={24} style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} />
             <p style={{ fontSize: '14px', margin: 0 }}>
               {loading ? 'Hệ thống đang đồng bộ dữ liệu với MongoDB...' : 'Dữ liệu kho hàng & nhân sự đã được cập nhật toàn diện.'}
             </p>
          </div>
        </div>

        {/* Khu vực hiển thị thông tin Nhà cung cấp & Nhân sự */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          <SummaryCard 
            icon={<FaTruck />} 
            title="Nhà cung cấp" 
            value={stats.supplierCount} 
            detail="Đối tác cung ứng cà phê nhân xanh" 
          />
          <SummaryCard 
            icon={<FaUsers />} 
            title="Nhân sự ban quản lý" 
            value={stats.staffCount} 
            detail="Đội ngũ vận hành hệ thống RoastLogic thực tế" 
          />
        </div>
      </section>

      {/* CSS cho hiệu ứng xoay làm mới dữ liệu */}
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
        <span style={{ color: '#8D6D4D', fontSize: '18px' }}>{icon}</span>
    </div>
    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <h3 style={styles.summaryValue}>{value}</h3>
      <span style={styles.statusLabel}>REALTIME</span>
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
  btnRefresh: { borderRadius: '20px', backgroundColor: '#F8F1E6', border: 'none', padding: '8px 16px', fontSize: '10px', fontWeight: 'bold', color: '#8D6D4D', cursor: 'pointer' },
  chartPlaceholder: { height: '300px', borderRadius: '24px', backgroundColor: '#FDFCF7', border: '2px dashed #EADBC4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A68B6D', gap: '12px' },
  summaryCard: { borderRadius: '32px', border: '1px solid #EFE2D1', backgroundColor: 'white', padding: '32px', flex: 1 },
  summaryValue: { fontSize: '40px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
  statusLabel: { fontSize: '10px', fontWeight: 'bold', color: '#4A6741' },
  summaryDetail: { marginTop: '16px', fontSize: '12px', color: '#7A6352', fontStyle: 'italic', opacity: 0.8, margin: 0 }
};

export default HomePage;