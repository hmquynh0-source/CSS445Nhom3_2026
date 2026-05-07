import React from 'react';
import { FaChartLine, FaClipboardList, FaBoxes, FaSyncAlt } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Tiêu đề trang */}
      <header>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 'bold', color: '#A68B6D', margin: 0 }}>
          Dashboard Overview
        </p>
        <h1 style={{ marginTop: '8px', fontSize: '36px', fontWeight: 900, color: '#3D2B1F', margin: '8px 0' }}>
          Quản lý Warehouse
        </h1>
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#7A6352', maxWidth: '600px', lineHeight: '1.6' }}>
          Theo dõi lưu lượng hàng hóa, tối ưu hóa quy trình nhập kho và kiểm soát doanh thu thời gian thực.
        </p>
      </header>

      {/* Grid 3 cột cho Stats - Ép hiển thị ngang bằng Flex */}
      <section style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <InfoCard icon={<FaClipboardList />} title="Đơn hàng" value="1.284" subtitle="+12% so với tháng trước" />
        <InfoCard icon={<FaChartLine />} title="Doanh thu" value="4.2B" subtitle="+8.4% so với tháng trước" />
        <InfoCard icon={<FaBoxes />} title="Hàng tồn" value="15.2T" subtitle="Giảm 2.1% so với tháng trước" />
      </section>

      {/* Khu vực Biểu đồ & Thông tin phụ */}
      <section style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ 
          flex: 2, 
          minWidth: '600px',
          borderRadius: '32px', 
          backgroundColor: 'white', 
          padding: '32px', 
          border: '1px solid #F1E9DE',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', color: '#A68B6D', margin: 0 }}>Phân tích hoạt động</p>
              <h2 style={{ marginTop: '4px', fontSize: '24px', fontWeight: 'bold', color: '#3D2B1F', margin: 0 }}>Hiệu suất vận hành</h2>
            </div>
            <button style={{ 
              borderRadius: '20px', backgroundColor: '#F8F1E6', border: 'none', 
              padding: '8px 16px', fontSize: '10px', fontWeight: 'black', color: '#8D6D4D', cursor: 'pointer' 
            }}>LÀM MỚI</button>
          </div>
          
          <div style={{ 
            height: '300px', borderRadius: '24px', backgroundColor: '#FDFCF7', 
            border: '2px dashed #EADBC4', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', color: '#A68B6D', gap: '12px' 
          }}>
             <FaSyncAlt size={24} className="animate-spin" />
             <p style={{ fontSize: '12px', fontWeight: '500' }}>Hệ thống đang tổng hợp dữ liệu thời gian thực...</p>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          <SummaryCard title="Nhà cung cấp" value="24" detail="Đã kết nối trực tiếp" />
          <SummaryCard title="Nhân sự" value="58" detail="Đang trong ca trực" />
        </div>
      </section>
    </div>
  );
};

// --- Sub-components dùng Style thuần ---

const InfoCard = ({ icon, title, value, subtitle }) => (
  <div style={{ 
    flex: 1, minWidth: '280px', borderRadius: '32px', border: '1px solid #EFE2D1', 
    backgroundColor: 'white', padding: '28px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' 
  }}>
    <div style={{ 
      height: '56px', width: '56px', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', borderRadius: '16px', backgroundColor: '#F5EEE6', color: '#8D6D4D', fontSize: '20px' 
    }}>
      {icon}
    </div>
    <p style={{ marginTop: '24px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A68B6D', margin: '24px 0 8px 0' }}>{title}</p>
    <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: '0 0 16px 0' }}>{value}</h3>
    <div style={{ display: 'inline-block', borderRadius: '20px', backgroundColor: '#F0F7ED', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', color: '#4A6741' }}>
      {subtitle}
    </div>
  </div>
);

const SummaryCard = ({ title, value, detail }) => (
  <div style={{ 
    borderRadius: '32px', border: '1px solid #EFE2D1', backgroundColor: 'white', padding: '32px', flex: 1
  }}>
    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#A68B6D', textTransform: 'uppercase', margin: 0 }}>{title}</p>
    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <h3 style={{ fontSize: '40px', fontWeight: '900', color: '#3D2B1F', margin: 0 }}>{value}</h3>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#4A6741' }}>ACTIVE</span>
    </div>
    <p style={{ marginTop: '16px', fontSize: '12px', color: '#7A6352', fontStyle: 'italic', opacity: 0.8, margin: 0 }}>{detail}</p>
  </div>
);

export default HomePage;