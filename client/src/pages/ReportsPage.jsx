import React, { useState, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ReportingPage = () => {
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('NĂM');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    kpis: { revenue: "$0", inventory: "0 kg", opCost: "$0", compRate: "0%" },
    chartData: [40, 52, 64, 76, 88, 150, 112, 124],
    chartLabels: [],
    inventoryBreakdown: [],
    originAnalysis: []
  });

  // Tải dữ liệu từ API báo cáo động
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
          chartData: Array.isArray(res.data.chartData) ? res.data.chartData : [40, 52, 64, 76, 88, 150, 112, 124],
          chartLabels: Array.isArray(res.data.chartLabels) ? res.data.chartLabels : [],
          inventoryBreakdown: Array.isArray(res.data.inventoryBreakdown) ? res.data.inventoryBreakdown : [],
          originAnalysis: Array.isArray(res.data.originAnalysis) ? res.data.originAnalysis : []
        });
      }
    } catch (err) {
      console.error("❌ Không thể kết nối API báo cáo:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  // Lắng nghe dữ liệu Real-time từ Socket
  useEffect(() => {
    if (socket) {
      socket.on('report_update', (update) => {
        setReportData(prev => ({
          ...prev,
          kpis: { 
            ...prev.kpis, 
            revenue: update.revenue || prev.kpis.revenue,
            // inventory: update.inventory || prev.kpis.inventory,
            compRate: update.compRate || prev.kpis.compRate
          }
        }));
      });
    }
    return () => socket?.off('report_update');
  }, [socket]);

  const safeChartData = Array.isArray(reportData?.chartData) ? reportData.chartData : [];
  const safeChartLabels = Array.isArray(reportData?.chartLabels) ? reportData.chartLabels : [];

  // Tính tổng số lượng hạt hiện có trong danh sách phân rã tồn kho để chia tỷ lệ % chính xác
  const totalBreakdownQty = reportData.inventoryBreakdown.reduce((sum, item) => sum + (item.quantity || 0), 0);

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
        
        {/* Bộ lọc mốc thời gian */}
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
        {/* Biểu đồ Doanh thu dạng cột đứng */}
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
                  height: `${Math.min(h, 200)}px`, 
                  backgroundColor: i === safeChartData.length - 1 ? '#3D2B1F' : '#EFE3D5',
                  borderRadius: '4px',
                  transition: 'height 0.6s ease'
                }}></div>
                <p style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '8px' }}>{safeChartLabels[i] || `P${i+1}`}</p>
              </div>
            ))}
            {safeChartData.length === 0 && (
               <p style={{ fontSize: '12px', color: '#A89B8D', textAlign: 'center', width: '100%' }}>Không có dữ liệu biểu đồ.</p>
            )}
          </div>
        </div>

        {/* CƠ CẤU TỒN KHO THEO LOẠI HẠT */}
        <div style={chartBoxStyle}>
          <h4 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800' }}>Cơ cấu tồn kho</h4>
          {reportData.inventoryBreakdown.length > 0 ? (
            reportData.inventoryBreakdown.map((item, index) => {
              // Tính % động theo tổng khối lượng phân rã hạt nhận từ Server
              const percent = totalBreakdownQty > 0 ? Math.round((item.quantity / totalBreakdownQty) * 100) : 0;
              const color = index === 0 ? '#3D2B1F' : index === 1 ? '#4A6741' : '#8B5E3C';
              
              return <ProgressItem key={item.name} label={item.name} percent={percent} color={color} />;
            })
          ) : (
            <p style={{ color: '#A89B8D', fontSize: '13px' }}>Không có dữ liệu phân loại tồn kho.</p>
          )}
        </div>
      </div>

      {/* --- TABLE PHÂN TÍCH ORIGIN --- */}
      <div style={{ backgroundColor: '#F9F1E7', borderRadius: '24px', padding: '32px' }}>
         <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#3D2B1F', marginBottom: '24px' }}>PHÂN TÍCH CHI TIẾT ORIGIN</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(61, 43, 31, 0.1)' }}>
                <th style={thStyle}>XUẤT XỨ</th>
                <th style={thStyle}>KHỐI LƯỢNG (kg)</th>
                <th style={thStyle}>SỐ LÔ</th>
                <th style={thStyle}>ĐỘ ẨM TB</th>
              </tr>
            </thead>
            <tbody>
              {reportData.originAnalysis.length > 0 ? (
                reportData.originAnalysis.map((origin) => (
                  <tr key={origin.origin} style={{ borderBottom: '1px solid rgba(61, 43, 31, 0.05)' }}>
                    <td style={tdStyle}><b>{origin.origin}</b></td>
                    <td style={tdStyle}>{origin.weight.toLocaleString('vi-VN')}</td>
                    <td style={tdStyle}>{origin.batches}</td>
                    <td style={tdStyle}>{origin.avgMoisture}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={tdStyle} colSpan={4}>Không có dữ liệu origin trong khoảng thời gian này.</td>
                </tr>
              )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

// --- CÁC COMPONENT HỖ TRỢ GIAO DIỆN ---
const KpiCard = ({ title, value, trend, trendType }) => (
  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
    <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '12px' }}>{title}</p>
    <div style={{ fontSize: '24px', fontWeight: '900', color: '#3D2B1F', marginBottom: '8px', wordBreak: 'break-all' }}>{value}</div>
    {trend && (
      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', backgroundColor: trendType === 'up' ? '#E8F5E9' : '#FFEBEE', color: trendType === 'up' ? '#4A6741' : '#C62828' }}>
        {trend}
      </span>
    )}
  </div>
);

const ProgressItem = ({ label, percent, color }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '6px' }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span>{percent}%</span>
    </div>
    <div style={{ height: '8px', backgroundColor: '#F0F0F0', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, transition: 'width 0.5s ease' }}></div>
    </div>
  </div>
);

const tabBtnStyle = (active) => ({ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#3D2B1F' : '#A89B8D' });
const chartBoxStyle = { backgroundColor: 'white', padding: '32px', borderRadius: '24px' };
const thStyle = { padding: '16px 8px', fontSize: '10px', color: '#A89B8D' };
const tdStyle = { padding: '20px 8px', fontSize: '13px', color: '#3D2B1F' };

export default ReportingPage;