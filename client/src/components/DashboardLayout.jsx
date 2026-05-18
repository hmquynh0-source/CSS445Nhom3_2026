import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaHome, FaBoxOpen, FaUsers,
  FaSignOutAlt, FaSearch, FaCog, FaUserCircle,
  FaChevronDown, FaChevronRight,
  FaArrowAltCircleDown, FaArrowAltCircleUp, FaChartPie,
  FaCogs
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isInboundOpen, setIsInboundOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const isDarkMode = userProfile?.theme === 'dark';

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const isAccountPath = location.pathname.includes('/admin/suppliers') ||
    location.pathname.includes('/admin/customers');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#0F172A' : '#FDFCF0' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: isCollapsed ? '80px' : '260px',
        backgroundColor: isDarkMode ? '#111827' : '#F9F1E7',
        borderRight: '1px solid rgba(61, 43, 31, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!isCollapsed && (
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '18px', color: '#3D2B1F', margin: 0, letterSpacing: '1px' }}>ADMIN PORTAL</h1>
              <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#A89B8D', margin: 0 }}>EDITORIAL ESTATE</p>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaBars size={18} color="#3D2B1F" />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          <MenuItem
            icon={<FaHome />}
            label="Tổng quan"
            active={location.pathname.includes('/admin/home')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/home')}
          />

          <MenuItem
            icon={<FaBoxOpen />}
            label="Sản phẩm"
            active={location.pathname.includes('/admin/products')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/products')}
          />

          {/* --- CHỨC NĂNG MỚI THÊM VÀO --- */}
          <div>
            <MenuItem
              icon={<FaArrowAltCircleDown style={{ color: '#27ae60' }} />}
              label="Quản lý nhập kho"
              collapsed={isCollapsed}
              onClick={() => setIsInboundOpen(!isInboundOpen)} // Nhấn vào để đóng/mở
            />

            {/* Hiển thị menu con nếu isInboundOpen = true và Sidebar không bị thu nhỏ */}
            {isInboundOpen && !isCollapsed && (
              <div style={{ backgroundColor: '#f9f9f9', paddingLeft: '15px' }}>
                <MenuItem
                  label="1. Phiếu nhập kho"
                  onClick={() => navigate('/admin/inbound/orders')}
                  active={location.pathname === '/admin/inbound/orders'}
                />
                <MenuItem
                  label="2. Sản phẩm nhập kho"
                  onClick={() => navigate('/admin/inbound/products')}
                  active={location.pathname === '/admin/inbound/products'}
                />
              </div>
            )}
          </div>

          <MenuItem
            icon={<FaArrowAltCircleUp style={{ color: '#e67e22' }} />}
            label="Xuất kho"
            active={location.pathname.includes('/admin/outbound')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/outbound')}
          />

          <MenuItem
            icon={<FaCogs style={{ color: '#6366f1' }} />}
            label="Chế biến"
            active={location.pathname.includes('/admin/processing')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/processing')}
          />

          <MenuItem
            icon={<FaChartPie />}
            label="Báo cáo"
            active={location.pathname.includes('/admin/reports')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/reports')}
          />
          {/* ------------------------------ */}

          <div>
            <MenuItem
              icon={<FaUsers />}
              label="Quản lý tài khoản"
              active={isAccountPath && !isAccountMenuOpen}
              collapsed={isCollapsed}
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              hasSubmenu
              isOpen={isAccountMenuOpen}
            />

            {!isCollapsed && isAccountMenuOpen && (
              <div style={{
                marginLeft: '20px',
                paddingLeft: '15px',
                borderLeft: '1px solid rgba(61, 43, 31, 0.1)',
                marginTop: '4px',
                marginBottom: '10px'
              }}>
                <SubMenuItem
                  label="Nhà cung cấp"
                  active={location.pathname.includes('/admin/suppliers')}
                  onClick={() => navigate('/admin/suppliers')}
                />
                <SubMenuItem
                  label="Khách hàng"
                  active={location.pathname.includes('/admin/customers')}
                  onClick={() => navigate('/admin/customers')}
                />
                {/* 🛠️ THÊM MỤC QUẢN LÝ NHÂN SỰ VÀO ĐÂY */}
                <SubMenuItem
                  label="Nhân sự ban quản lý"
                  active={location.pathname.includes('/admin/staff')}
                  onClick={() => navigate('/admin/staff')}
                />
              </div>
            )}
          </div>

          <MenuItem
            icon={<FaCog />}
            label="Cài đặt"
            active={location.pathname.includes('/admin/settings')}
            collapsed={isCollapsed}
            onClick={() => navigate('/admin/settings')}
          />
        </nav>

        <div style={{ padding: '15px' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              width: '100%', padding: '12px', backgroundColor: '#D92D20',
              color: 'white', borderRadius: '10px', border: 'none',
              fontWeight: 'bold', fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', transition: '0.3s'
            }}
          >
            <FaSignOutAlt /> {!isCollapsed && "ĐĂNG XUẤT"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '260px',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          backgroundColor: '#F9F1E7',
          padding: '12px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(61, 43, 31, 0.1)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3D2B1F' }}>
            Hệ thống quản trị kho v1.0
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A89B8D' }} />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                style={{
                  backgroundColor: '#F4E9DC', border: 'none', borderRadius: '8px',
                  padding: '8px 12px 8px 35px', width: '250px', outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <FaUserCircle size={24} color="#3D2B1F" />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3D2B1F' }}>ADMIN</span>
            </div>
          </div>
        </header>

        <section style={{ padding: '30px', flex: 1 }}>
          {children}
        </section>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', maxWidth: '400px', width: '90%', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
            <h2 style={{ color: '#3D2B1F', marginTop: 0 }}>Bạn muốn đăng xuất?</h2>
            <p style={{ color: '#70645C', fontSize: '14px' }}>Các thay đổi chưa lưu có thể bị mất.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button onClick={confirmLogout} style={{ flex: 1, backgroundColor: '#3D2B1F', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ĐỒNG Ý</button>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, backgroundColor: '#F4E9DC', color: '#3D2B1F', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>HỦY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... MenuItem và SubMenuItem giữ nguyên ...
const MenuItem = ({ icon, label, active, collapsed, onClick, hasSubmenu, isOpen }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', padding: '12px 16px', marginBottom: '4px',
      cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s',
      backgroundColor: active ? '#3D2B1F' : 'transparent',
      color: active ? '#FFFFFF' : '#3D2B1F',
      justifyContent: 'space-between'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', flex: 1 }}>
      <span style={{ fontSize: '18px', marginRight: collapsed ? '0' : '15px', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {!collapsed && <span style={{ fontWeight: '600', fontSize: '14px' }}>{label}</span>}
    </div>
    {!collapsed && hasSubmenu && (
      <span>{isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}</span>
    )}
  </div>
);

const SubMenuItem = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '8px 12px',
      fontSize: '13px',
      fontWeight: active ? 'bold' : '500',
      color: active ? '#3D2B1F' : '#70645C',
      cursor: 'pointer',
      transition: '0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: active ? '#3D2B1F' : 'transparent', border: active ? 'none' : '1px solid #A89B8D' }}></div>
    {label}
  </div>
);

export default DashboardLayout;