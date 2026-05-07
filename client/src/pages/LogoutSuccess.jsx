import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft, FaCoffee } from 'react-icons/fa';

const LogoutSuccess = () => {
  const navigate = useNavigate();
  
  // Giả lập dữ liệu phiên làm việc
  const sessionInfo = {
    id: "SESS-EE-2024-9X82B",
    endTime: new Date().toLocaleString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).replace(',', ' —')
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3E9DC', // Màu nền kem nhẹ
      backgroundImage: 'radial-gradient(#DDB892 0.5px, transparent 0.5px)', // Hiệu ứng hạt nhẹ
      backgroundSize: '20px 20px',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    }}>
      {/* Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#8B5E3C', letterSpacing: '2px', margin: 0 }}>
          PRECISION COFFEE LEDGER
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#3D2B1F', marginTop: '5px' }}>
          THE EDITORIAL ESTATE
        </h1>
      </div>

      {/* Card chính */}
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '450px',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(61, 43, 31, 0.1)',
        position: 'relative',
        borderTop: '5px solid #4A6741' // Viền xanh lá phía trên
      }}>
        {/* Icon Success */}
        <div style={{ 
          backgroundColor: '#C5E1A5', 
          width: '50px', 
          height: '50px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <FaCheckCircle size={28} color="#4A6741" />
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#3D2B1F', marginBottom: '16px' }}>
          Hẹn gặp lại bạn
        </h2>
        
        <p style={{ color: '#6D4C41', lineHeight: '1.6', fontSize: '14px', marginBottom: '32px' }}>
          Bạn đã đăng xuất thành công khỏi hệ thống <strong>Editorial Estate</strong>.<br />
          Phiên làm việc của bạn đã được đóng an toàn.
        </p>

        {/* Thông tin Session */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid #EFE3D5', 
          paddingTop: '20px',
          marginBottom: '40px'
        }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '5px' }}>MÃ PHIÊN LÀM VIỆC</p>
            <span style={{ backgroundColor: '#FDF8F3', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#3D2B1F' }}>
              {sessionInfo.id}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '5px' }}>THỜI GIAN KẾT THÚC</p>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3D2B1F' }}>
              {sessionInfo.endTime}
            </span>
          </div>
        </div>

        {/* Nút quay lại */}
        <button 
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#3D2B1F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2A1D15'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3D2B1F'}
        >
          <FaArrowLeft size={14} /> QUAY LẠI ĐĂNG NHẬP
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#A89B8D', cursor: 'pointer' }}>
          Liên hệ hỗ trợ kỹ thuật
        </p>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <FaCoffee color="#A89B8D" />
        <div style={{ width: '100px', height: '1px', backgroundColor: '#DDB892', margin: '15px auto' }}></div>
        <p style={{ fontSize: '10px', color: '#A89B8D', letterSpacing: '1px' }}>
          © 2026 THE EDITORIAL ESTATE. A PRECISION COFFEE LEDGER.
        </p>
      </div>
    </div>
  );
};

export default LogoutSuccess;