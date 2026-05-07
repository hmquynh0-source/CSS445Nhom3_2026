import React, { useState } from 'react';
import { FaCoffee, FaSignOutAlt, FaHome, FaFileAlt, FaStar, FaUpload, FaBars, FaTimes, FaUser, FaCog } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const VendorLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const vendorName = localStorage.getItem('vendorName') || 'Vendor';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorEmail');
    localStorage.removeItem('vendorName');
    localStorage.removeItem('vendorRole');
    localStorage.removeItem('isVendor');
    navigate('/vendor/login', { replace: true });
  };

  const navItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/vendor/orders', label: 'Đơn Hàng', icon: <FaFileAlt /> },
    { path: '/vendor/scorecard', label: 'Bảng Xếp Hạng', icon: <FaStar /> },
    { path: '/vendor/deliveries', label: 'Giao Hàng', icon: <FaUpload /> },
    { path: '/settings', label: 'Cài đặt', icon: <FaCog /> }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Navbar */}
      <nav style={{
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.3rem',
            fontWeight: '800',
            color: '#667eea',
            cursor: 'pointer'
          }}
            onClick={() => navigate('/vendor/dashboard')}
          >
            <FaCoffee style={{ fontSize: '1.8rem' }} />
            <span>Vendor Portal</span>
          </div>

          {/* Desktop Nav */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: location.pathname === item.path ? '#667eea' : 'transparent',
                  color: location.pathname === item.path ? 'white' : '#6B7280',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* User Info & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F3F4F6',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#4B5563'
            }}>
              <FaUser /> {vendorName}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px',
                background: '#FEE2E2',
                color: '#991B1B',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#FECACA'}
              onMouseLeave={(e) => e.target.style.background = '#FEE2E2'}
              title="Đăng xuất"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1F2937',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '4rem'
      }}>
        <p style={{ margin: 0 }}>
          © 2025 Vendor Portal - Nền tảng quản lý đơn hàng cà phê
        </p>
      </footer>
    </div>
  );
};

export default VendorLayout;
