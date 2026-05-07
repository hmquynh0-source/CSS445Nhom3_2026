import React from 'react';
import { FaDownload, FaEllipsisH, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa';

const ReportingPage = () => {
  return (
    <div style={{ padding: '40px', backgroundColor: '#FDFCF0', minHeight: '100%' }}>
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: 0 }}>Báo cáo & Thống kê</h2>
          <p style={{ fontSize: '13px', color: '#7A6352', marginTop: '8px', maxWidth: '600px', lineHeight: '1.6' }}>
            Thông tin chi tiết và các chỉ số chiến lược của Global Coffee Estate. Giao dịch chính xác đòi hỏi sự minh bạch tuyệt đối.
          </p>
        </div>
        
        {/* Date Filter Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#EFE3D5', padding: '4px', borderRadius: '8px' }}>
          <button style={tabBtnStyle(false)}>NGÀY</button>
          <button style={tabBtnStyle(false)}>THÁNG</button>
          <button style={tabBtnStyle(true)}>NĂM</button>
        </div>
      </div>

      {/* --- KPI SUMMARY CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <KpiCard title="TỔNG DOANH THU" value="$1.42M" trend="+12.5% so với năm trước" trendType="up" />
        <KpiCard title="SẢN LƯỢNG TỒN KHO" value="84.2K" subText="Cảnh báo thấp - tấn (Arabica)" isWarning />
        <KpiCard title="CHI PHÍ VẬN HÀNH" value="$320K" trend="-4.2% giảm chi phí" trendType="down" />
        <KpiCard title="TỶ LỆ HOÀN TẤT" value="98.4%" subText="Tiêu chuẩn vàng" isSuccess />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Biểu đồ doanh thu (Placeholder) */}
        <div style={chartBoxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Biểu đồ doanh thu</h4>
              <p style={{ margin: 0, fontSize: '10px', color: '#A89B8D', fontWeight: 'bold' }}>CHU KỲ TÀI CHÍNH 2024</p>
            </div>
            <FaEllipsisH color="#A89B8D" style={{ cursor: 'pointer' }} />
          </div>
          {/* Vùng vẽ biểu đồ */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
            {['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8'].map((month, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '30px', 
                  height: i === 5 ? '150px' : `${40 + (i * 12)}px`, 
                  backgroundColor: i === 5 ? '#3D2B1F' : '#EFE3D5',
                  borderRadius: '4px'
                }}></div>
                <p style={{ fontSize: '9px', fontWeight: 'bold', color: i === 5 ? '#3D2B1F' : '#A89B8D', marginTop: '8px' }}>{month}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cơ cấu tồn kho */}
        <div style={chartBoxStyle}>
          <h4 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800' }}>Cơ cấu tồn kho</h4>
          <ProgressItem label="HẠT ARABICA" percent={65} color="#3D2B1F" />
          <ProgressItem label="ROBUSTA LOẠI A" percent={25} color="#4A6741" />
          <ProgressItem label="QUY TRÌNH DECAF" percent={10} color="#8B5E3C" />
          
          <div style={{ 
            marginTop: '30px', padding: '16px', backgroundColor: '#FDFCF0', 
            borderRadius: '12px', border: '1px dashed #DDB892', fontStyle: 'italic',
            fontSize: '11px', color: '#7A6352', lineHeight: '1.5'
          }}>
            "Lượng tồn kho Arabica đang ở mức tối ưu để duy trì chuỗi cung ứng khu vực Châu Âu."
          </div>
        </div>
      </div>

      {/* --- DETAILED ANALYSIS TABLE --- */}
      <div style={{ backgroundColor: '#F9F1E7', borderRadius: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#3D2B1F', letterSpacing: '1px' }}>PHÂN TÍCH CHI TIẾT ORIGIN</h3>
          <button style={{ ...ghostBtnStyle, fontSize: '11px' }}>
            XUẤT BÁO CÁO <FaDownload style={{ marginLeft: '8px' }} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(61, 43, 31, 0.1)' }}>
              <th style={thStyle}>MÃ SKU / XUẤT XỨ</th>
              <th style={thStyle}>KHỐI LƯỢNG (TẤN)</th>
              <th style={thStyle}>GIÁ TRỊ GIAO DỊCH</th>
              <th style={thStyle}>TRẠNG THÁI</th>
              <th style={thStyle}>XU HƯỚNG</th>
            </tr>
          </thead>
          <tbody>
            <OriginRow sku="COL-AR-24" origin="Colombia Medellin" weight="12,450.00" value="$458,200" status="ỔN ĐỊNH" statusBg="#E8F5E9" statusColor="#4A6741" trend="up" />
            <OriginRow sku="ETH-YI-24" origin="Ethiopia Yirgacheffe" weight="4,120.50" value="$210,050" status="SẮP HẾT" statusBg="#FFF3E0" statusColor="#E65100" trend="flat" />
            <OriginRow sku="VIE-RO-24" origin="Vietnam Robusta G1" weight="28,900.00" value="$512,300" status="ĐANG NHẬP" statusBg="#E3F2FD" statusColor="#1565C0" trend="up" />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KpiCard = ({ title, value, trend, trendType, subText, isWarning, isSuccess }) => (
  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
    <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '12px' }}>{title}</p>
    <div style={{ fontSize: '28px', fontWeight: '900', color: '#3D2B1F', marginBottom: '8px' }}>{value}</div>
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ 
          fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px',
          backgroundColor: trendType === 'up' ? '#E8F5E9' : '#FFEBEE',
          color: trendType === 'up' ? '#4A6741' : '#C62828'
        }}>
          {trendType === 'up' ? <FaArrowUp size={8}/> : <FaArrowDown size={8}/>} {trend}
        </span>
      </div>
    )}
    {subText && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 'bold' }}>
        <span style={{ color: isWarning ? '#E65100' : '#4CAF50' }}>
          {isSuccess && <FaCheckCircle />}
          {isWarning && '⚠️'}
        </span>
        <span style={{ color: isWarning ? '#E65100' : '#A89B8D' }}>{subText}</span>
      </div>
    )}
  </div>
);

const ProgressItem = ({ label, percent, color }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '6px' }}>
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div style={{ height: '8px', backgroundColor: '#F0F0F0', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color }}></div>
    </div>
  </div>
);

const OriginRow = ({ sku, origin, weight, value, status, statusBg, statusColor, trend }) => (
  <tr style={{ borderBottom: '1px solid rgba(61, 43, 31, 0.05)' }}>
    <td style={tdStyle}>
      <div style={{ fontWeight: 'bold', color: '#3D2B1F' }}>{sku}</div>
      <div style={{ fontSize: '10px', color: '#A89B8D' }}>{origin}</div>
    </td>
    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{weight}</td>
    <td style={{ ...tdStyle, fontWeight: '900' }}>{value}</td>
    <td style={tdStyle}>
      <span style={{ fontSize: '9px', fontWeight: '900', padding: '5px 10px', borderRadius: '6px', backgroundColor: statusBg, color: statusColor }}>
        {status}
      </span>
    </td>
    <td style={tdStyle}>
      {trend === 'up' ? <span style={{ color: '#4A6741' }}>📈</span> : <span style={{ color: '#A89B8D' }}>➡</span>}
    </td>
  </tr>
);

// --- STYLES ---
const tabBtnStyle = (active) => ({
  padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
  backgroundColor: active ? 'white' : 'transparent', color: active ? '#3D2B1F' : '#A89B8D', boxShadow: active ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
});

const chartBoxStyle = { backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };
const thStyle = { padding: '16px 8px', fontSize: '10px', color: '#A89B8D', letterSpacing: '1px', fontWeight: 'bold' };
const tdStyle = { padding: '20px 8px', fontSize: '13px', color: '#3D2B1F' };
const ghostBtnStyle = { backgroundColor: 'transparent', color: '#3D2B1F', border: '1px solid rgba(61, 43, 31, 0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default ReportingPage;