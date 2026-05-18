import React, { useState, useEffect } from 'react';
import { FaDownload, FaEllipsisH, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ReportingPage = () => {
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('NĂM');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    kpis: { revenue: "$0", inventory: "0 kg", opCost: "$0", compRate: "0%" },
    chart: [40, 52, 64, 76, 88, 150, 112, 124] // Mảng dữ liệu mặc định ban đầu
  });

  // Hàm tải dữ liệu thật từ Server
  const fetchReport = async (tabName) => {
    setLoading(true);
    try {
      const rangeMap = { 'NGÀY': 'day', 'THÁNG': 'month', 'NĂM': 'year' };
      const res = await axios.get(`http://localhost:5000/api/reports/dynamic?range=${rangeMap[tabName]}`);
      
      if (res.data && res.data.success) {
        setReportData({
          kpis: {
            revenue: res.data.kpis?.revenue || "$0",
            inventory: res.data.kpis?.inventory || "0 kg",
            opCost: res.data.kpis?.opCost || "$0",
            compRate: res.data.kpis?.compRate || "0%"
          },
          // Kiểm tra an toàn: Nếu server có trả về chartData thì lấy, nếu không thì giữ lại mảng cũ hoặc mảng mặc định tránh bị undefined
          chart: Array.isArray(res.data.chartData) ? res.data.chartData : [40, 52, 64, 76, 88, 150, 112, 124]
        });
      }
    } catch (err) {
      console.error("❌ Không thể kết nối API báo cáo:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chạy khi đổi Tab
  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  // Lắng nghe Real-time từ Socket Server
  useEffect(() => {
    if (socket) {
      socket.on('report_update', (update) => {
        setReportData(prev => ({
          ...prev,
          kpis: { 
            ...prev.kpis, 
            // Cập nhật linh hoạt các trường gửi lên từ Socket phát sóng ngầm (như inventory, inboundBatches)
            revenue: update.revenue || prev.kpis.revenue,
            inventory: update.inventory || prev.kpis.inventory,
            compRate: update.compRate || prev.kpis.compRate
          }
        }));
      });
    }
    return () => socket?.off('report_update');
  }, [socket]);

  // Đảm bảo biến chart luôn là một mảng trước khi render nhằm chống lỗi sập map tuyệt đối
  const safeChartData = Array.isArray(reportData?.chart) ? reportData.chart : [];

  return (
    <div style={{ padding: '40px', backgroundColor: '#FDFCF0', minHeight: '100%' }}>
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: 0 }}>Báo cáo & Thống kê</h2>
          <p style={{ fontSize: '13px', color: '#7A6352', marginTop: '8px' }}>
            Dữ liệu trực tiếp từ hệ thống. Đang xem báo cáo theo: <strong>{activeTab}</strong>
          </p>
        </div>
        
        {/* Date Filter Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#EFE3D5', padding: '4px', borderRadius: '8px' }}>
          {['NGÀY', 'THÁNG', 'NĂM'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabBtnStyle(activeTab === tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- KPI SUMMARY CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <KpiCard title="TỔNG DOANH THU" value={reportData.kpis?.revenue || "$0"} trend="+12.5%" trendType="up" />
        <KpiCard title="SẢN LƯỢNG TỒN KHO" value={reportData.kpis?.inventory || "0 kg"} subText="Tổng dung lượng thực tế" isWarning />
        <KpiCard title="CHI PHÍ VẬN HÀNH" value={reportData.kpis?.opCost || "$0"} trend="-4.2%" trendType="down" />
        <KpiCard title="TỶ LỆ HOÀN TẤT" value={reportData.kpis?.compRate || "0%"} subText="Tiêu chuẩn vàng" isSuccess />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div style={chartBoxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Biểu đồ doanh thu</h4>
            <FaEllipsisH color="#A89B8D" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
            {safeChartData.map((h, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '30px', 
                  height: `${Math.min(h, 200)}px`, // Giới hạn chiều cao hiển thị cột tối đa 200px tránh tràn khung
                  backgroundColor: i === safeChartData.length - 1 ? '#3D2B1F' : '#EFE3D5',
                  borderRadius: '4px',
                  transition: 'height 0.6s ease'
                }}></div>
                <p style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '8px' }}>P{i+1}</p>
              </div>
            ))}
            {safeChartData.length === 0 && (
              <p style={{ fontSize: '12px', color: '#A89B8D', textAlign: 'center', width: '100%', pb: '40px' }}>Không có dữ liệu biểu đồ.</p>
            )}
          </div>
        </div>

        <div style={chartBoxStyle}>
          <h4 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800' }}>Cơ cấu tồn kho</h4>
          <ProgressItem label="HẠT ARABICA" percent={65} color="#3D2B1F" />
          <ProgressItem label="ROBUSTA LOẠI A" percent={25} color="#4A6741" />
          <ProgressItem label="QUY TRÌNH DECAF" percent={10} color="#8B5E3C" />
        </div>
      </div>

      {/* --- TABLE (Dữ liệu tĩnh ví dụ) --- */}
      <div style={{ backgroundColor: '#F9F1E7', borderRadius: '24px', padding: '32px' }}>
         <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#3D2B1F', marginBottom: '24px' }}>PHÂN TÍCH CHI TIẾT ORIGIN</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(61, 43, 31, 0.1)' }}>
                <th style={thStyle}>MÃ SKU / XUẤT XỨ</th>
                <th style={thStyle}>KHỐI LƯỢNG (TẤN)</th>
                <th style={thStyle}>GIÁ TRỊ</th>
                <th style={thStyle}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              <OriginRow sku="COL-AR-24" origin="Colombia Medellin" weight="12,450" value="$458,200" status="ỔN ĐỊNH" statusBg="#E8F5E9" statusColor="#4A6741" />
              <OriginRow sku="VIE-RO-24" origin="Vietnam Robusta" weight="28,900" value="$512,300" status="ĐANG NHẬP" statusBg="#E3F2FD" statusColor="#1565C0" />
            </tbody>
         </table>
      </div>
    </div>
  );
};

// --- CÁC SUB-COMPONENTS HỖ TRỢ AN TOÀN ---
const KpiCard = ({ title, value, trend, trendType, subText, isWarning, isSuccess }) => (
  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
    <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '12px' }}>{title}</p>
    <div style={{ fontSize: '24px', fontWeight: '900', color: '#3D2B1F', marginBottom: '8px', wordBreak: 'break-all' }}>{value}</div>
    {trend && <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', backgroundColor: trendType === 'up' ? '#E8F5E9' : '#FFEBEE', color: trendType === 'up' ? '#4A6741' : '#C62828' }}>{trend}</span>}
  </div>
);

const ProgressItem = ({ label, percent, color }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '6px' }}><span>{label}</span><span>{percent}%</span></div>
    <div style={{ height: '8px', backgroundColor: '#F0F0F0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${percent}%`, height: '100%', backgroundColor: color }}></div></div>
  </div>
);

const OriginRow = ({ sku, origin, weight, value, status, statusBg, statusColor }) => (
  <tr style={{ borderBottom: '1px solid rgba(61, 43, 31, 0.05)' }}>
    <td style={tdStyle}><b>{sku}</b><br/><small>{origin}</small></td>
    <td style={tdStyle}>{weight}</td>
    <td style={tdStyle}>{value}</td>
    <td style={tdStyle}><span style={{ fontSize: '9px', padding: '5px 10px', borderRadius: '6px', backgroundColor: statusBg, color: statusColor }}>{status}</span></td>
  </tr>
);

const tabBtnStyle = (active) => ({ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#3D2B1F' : '#A89B8D' });
const chartBoxStyle = { backgroundColor: 'white', padding: '32px', borderRadius: '24px' };
const thStyle = { padding: '16px 8px', fontSize: '10px', color: '#A89B8D' };
const tdStyle = { padding: '20px 8px', fontSize: '13px', color: '#3D2B1F' };

export default ReportingPage;