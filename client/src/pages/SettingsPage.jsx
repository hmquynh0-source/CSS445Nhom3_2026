import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaLock, FaBell, FaCog, FaCamera, FaCheckCircle, FaShieldAlt, FaTimes, FaGlobe, FaClock } from 'react-icons/fa';
import axios from 'axios'; // Import axios để gọi API

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSaved, setIsSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: 'Nguyễn Minh Trí',
    email: 'tri.nguyen@roastlogic.com',
    phone: '+84 908 123 456',
    address: '123 Đường số 1, TP.HCM',
    role: 'Giám đốc kho vận',
    avatar: 'https://via.placeholder.com/150',
    twoFactor: true,
    language: 'vi',
    timezone: '(GMT+07:00) Bangkok, Hanoi',
    notifications: {
      emailStatus: true,
      emailReport: true,
      pushStock: true,
      pushNewOrder: false
    }
  });

  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC FIX: GỬI DỮ LIỆU ĐẾN SERVER ---
  const onSave = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/update-profile', {
        email: formData.email, // Dùng email để tìm user trong DB
        name: formData.name,
        phone: formData.phone,
        position: formData.role // Lưu 'role' vào trường 'position' của MongoDB
      });

      if (response.data.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối MongoDB! Hãy đảm bảo Server đang chạy.");
    }
  };

  // --- GIỮ NGUYÊN CÁC HÀM RENDER VÀ STYLES CỦA BẠN ---
  const renderProfile = () => (
    <div style={styles.cardContainer}>
      <div style={styles.profileHeader}>
        <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()}>
          <img src={formData.avatar} alt="Avatar" style={styles.avatar} />
          <div style={styles.cameraBtn}><FaCamera size={14} /></div>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
        </div>
        <h2 style={styles.userName}>{formData.name}</h2>
        <p style={styles.userRole}>{formData.role.toUpperCase()}</p>
      </div>

      <div style={styles.inputGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Họ và tên *</label>
          <input style={styles.input} value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email *</label>
          <input style={styles.input} value={formData.email} readOnly />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Số điện thoại</label>
          <input style={styles.input} value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Vị trí</label>
          <select
            style={{ ...styles.input, backgroundColor: '#FDF8F1' }}
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <option value="Giám đốc kho vận">Giám đốc kho vận</option>
            <option value="Nhân viên kho">Nhân viên kho</option>
            <option value="Quản lý đơn hàng">Quản lý đơn hàng</option>
            <option value="Điều phối viên">Điều phối viên</option>
          </select>
        </div>
      </div>
      <button onClick={onSave} style={styles.saveBtn}>Lưu thay đổi</button>
    </div>
  );

  const renderSecurity = () => (
    <div style={styles.cardContainer}>
      <h3 style={styles.sectionTitle}><FaShieldAlt /> Cài đặt bảo mật</h3>
      <div style={styles.securityItem}>
        <div><h4 style={styles.itemTitle}>Đổi mật khẩu</h4><p style={styles.itemDesc}>Lần cuối thay đổi: 3 tháng trước</p></div>
        <button onClick={() => setShowPasswordModal(true)} style={styles.outlineBtn}>Cập nhật</button>
      </div>
      <div style={styles.securityItem}>
        <div><h4 style={styles.itemTitle}>Xác thực 2 lớp (2FA)</h4><p style={styles.itemDesc}>Tăng cường bảo mật qua mã SMS hoặc App</p></div>
        <div style={styles.statusBadge}>ĐANG BẬT</div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div style={styles.cardContainer}>
      <h3 style={styles.sectionTitle}><FaBell /> Tùy chọn thông báo</h3>
      <div style={styles.notifyGrid}>
        <div style={styles.notifyBox}>
          <h4 style={styles.boxTitle}>📩 Email Notifications</h4>
          <label style={styles.checkItem}><input type="checkbox" checked={formData.notifications.emailStatus} onChange={() => { }} /> Trạng thái đơn hàng</label>
          <label style={styles.checkItem}><input type="checkbox" checked={formData.notifications.emailReport} onChange={() => { }} /> Báo cáo tồn kho tuần</label>
        </div>
        <div style={styles.notifyBox}>
          <h4 style={styles.boxTitle}>📱 App Push</h4>
          <label style={styles.checkItem}><input type="checkbox" checked={formData.notifications.pushStock} onChange={() => { }} /> Cảnh báo tồn kho thấp</label>
          <label style={styles.checkItem}><input type="checkbox" checked={formData.notifications.pushNewOrder} onChange={() => { }} /> Lô hàng mới về</label>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div style={styles.cardContainer}>
      <h3 style={styles.sectionTitle}><FaCog /> Cài đặt chung</h3>
      <div style={styles.inputGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}><FaGlobe /> Ngôn ngữ hiển thị</label>
          <select style={styles.input} value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)}>
            <option value="vi">Tiếng Việt (VN)</option>
            <option value="en">English (US)</option>
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}><FaClock /> Múi giờ hệ thống</label>
          <select style={styles.input} value={formData.timezone} onChange={(e) => handleInputChange('timezone', e.target.value)}>
            <option>{formData.timezone}</option>
            <option>(GMT+00:00) UTC</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>QUẢN TRỊ VIÊN</h1>
      <p style={styles.mainSubtitle}>Quản lý các thông tin định danh cá nhân và cấu hình hệ thống.</p>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <button onClick={() => setActiveTab('Profile')} style={{ ...styles.tab, backgroundColor: activeTab === 'Profile' ? '#fff' : 'transparent' }}>Thông tin cá nhân</button>
          <button onClick={() => setActiveTab('Security')} style={{ ...styles.tab, backgroundColor: activeTab === 'Security' ? '#fff' : 'transparent' }}>Bảo mật</button>
          <button onClick={() => setActiveTab('Notifications')} style={{ ...styles.tab, backgroundColor: activeTab === 'Notifications' ? '#fff' : 'transparent' }}>Thông báo</button>
          <button onClick={() => setActiveTab('Preferences')} style={{ ...styles.tab, backgroundColor: activeTab === 'Preferences' ? '#fff' : 'transparent' }}>Cài đặt chung</button>
        </aside>

        <main style={{ flex: 1 }}>
          {activeTab === 'Profile' && renderProfile()}
          {activeTab === 'Security' && renderSecurity()}
          {activeTab === 'Notifications' && renderNotifications()}
          {activeTab === 'Preferences' && renderPreferences()}
        </main>
      </div>

      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Đổi mật khẩu</h3>
              <FaTimes onClick={() => setShowPasswordModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gap: '15px', padding: '20px' }}>
              <input type="password" placeholder="Mật khẩu hiện tại" style={styles.input} />
              <input type="password" placeholder="Mật khẩu mới" style={styles.input} />
              <input type="password" placeholder="Xác nhận mật khẩu mới" style={styles.input} />
              <button style={styles.saveBtn} onClick={() => { alert("Đã cập nhật mật khẩu!"); setShowPasswordModal(false) }}>Cập nhật ngay</button>
            </div>
          </div>
        </div>
      )}

      {isSaved && <div style={styles.toast}><FaCheckCircle /> Lưu thành công vào MongoDB!</div>}
    </div>
  );
};

// --- GIỮ NGUYÊN STYLES BẠN ĐÃ VIẾT ---
const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#3D2B1F' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', borderBottom: '3px solid #4A6741', display: 'inline-block' },
  mainSubtitle: { fontSize: '14px', color: '#7A6352', marginBottom: '30px' },
  layout: { display: 'flex', gap: '30px' },
  sidebar: { width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' },
  tab: { padding: '15px', textAlign: 'left', border: '1px solid #EEDDC8', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
  cardContainer: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
  profileHeader: { textAlign: 'center', marginBottom: '30px' },
  avatarWrapper: { position: 'relative', width: '120px', margin: '0 auto', cursor: 'pointer' },
  avatar: { width: '120px', height: '120px', borderRadius: '25px', objectFit: 'cover', border: '3px solid #F1E9DE' },
  cameraBtn: { position: 'absolute', bottom: '-10px', right: '-10px', backgroundColor: '#3D2B1F', color: '#fff', padding: '8px', borderRadius: '50%' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#A68B6D', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #EEDDC8', backgroundColor: '#FDF8F1' },
  saveBtn: { backgroundColor: '#3D2B1F', color: '#fff', padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  securityItem: { display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px solid #F1E9DE', borderRadius: '15px', marginBottom: '15px' },
  statusBadge: { color: '#4A6741', fontWeight: 'bold', fontSize: '12px' },
  outlineBtn: { padding: '8px 15px', borderRadius: '8px', border: '1px solid #3D2B1F', background: 'none', cursor: 'pointer' },
  notifyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  notifyBox: { padding: '20px', backgroundColor: '#FDF8F1', borderRadius: '15px' },
  checkItem: { display: 'block', margin: '10px 0', fontSize: '14px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '20px', width: '400px', overflow: 'hidden' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  toast: { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#4A6741', color: '#fff', padding: '15px 25px', borderRadius: '10px', zIndex: 1000 }
};

export default SettingsPage;