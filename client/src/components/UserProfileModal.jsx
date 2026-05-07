import React, { useState } from 'react';
import { FaTimes, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const tabs = ['My Profile', 'Security', 'Notifications', 'Preferences'];

const UserProfileModal = ({ isOpen, onClose }) => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState('My Profile');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const profileData = {
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@roastlogic.com',
    phone: '+84 901 234 567',
    address: '123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh',
    role: 'Quản trị viên hệ thống',
    workPlace: 'Trụ sở chính - Warehouse A',
    joinDate: '12/05/2022',
    level: 'Level 5 (Toàn quyền)',
    notifications: { email: true, system: true, lowStock: false }
  };

  const renderContent = () => {
    if (activeTab === 'Security') {
      return (
        <section className="bg-[#FEF9F2] rounded-[25px] p-8 border border-[#F1E9DE]">
          <h3 className="text-sm font-bold text-[#3D2B1F] mb-6 flex items-center gap-2">🔒 Bảo mật</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#A68B6D] uppercase">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="password123"
                  className="w-full bg-[#FDF8F1] border border-[#EEDDC8] rounded-xl p-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-3.5 text-[#A68B6D]"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#A68B6D] uppercase">Mật khẩu mới</label>
              <input type="password" className="w-full bg-[#FDF8F1] border border-[#EEDDC8] rounded-xl p-3 text-sm" />
            </div>
            <button className="mt-3 bg-[#3D2B1F] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors">
              Cập nhật mật khẩu
            </button>
          </div>
        </section>
      );
    }

    if (activeTab === 'Notifications') {
      return (
        <section className="bg-[#FEF9F2] rounded-[25px] p-8 border border-[#F1E9DE]">
          <h3 className="text-sm font-bold text-[#3D2B1F] mb-6 flex items-center gap-2">🔔 Thông báo</h3>
          <div className="space-y-3">
            {Object.entries(profileData.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EEDDC8]">
                <span className="text-sm text-[#3D2B1F] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input type="checkbox" defaultChecked={value} />
              </label>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'Preferences') {
      return (
        <section className="bg-[#FEF9F2] rounded-[25px] p-8 border border-[#F1E9DE]">
          <h3 className="text-sm font-bold text-[#3D2B1F] mb-6 flex items-center gap-2">⚙️ Tùy chọn</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 border border-[#EEDDC8] text-sm font-semibold text-[#3D2B1F]">Chủ đề sáng</div>
            <div className="rounded-3xl bg-white p-5 border border-[#EEDDC8] text-sm font-semibold text-[#3D2B1F]">Chủ đề tối</div>
          </div>
        </section>
      );
    }

    return (
      <section className="bg-[#FEF9F2] rounded-[25px] p-8 border border-[#F1E9DE]">
        <h3 className="text-sm font-bold text-[#3D2B1F] mb-6 flex items-center gap-2">👤 Thông tin cơ bản</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Họ và tên" value={profileData.name} />
          <Field label="Email" value={profileData.email} readOnly />
          <Field label="Số điện thoại" value={profileData.phone} />
          <Field label="Vị trí công tác" value={profileData.workPlace} />
        </div>
        <div className="mt-6">
          <Field label="Địa chỉ thường trú" value={profileData.address} fullWidth />
        </div>
        <button className="mt-8 bg-[#3D2B1F] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors">
          Lưu thay đổi
        </button>
      </section>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FDF8F1] rounded-[30px] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <aside className="w-full md:w-72 bg-[#F9F1E7] p-8 border-r border-[#EEDDC8]">
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#3D2B1F] tracking-tight">ROASTLOGIC</h2>
              <p className="text-[10px] text-[#A68B6D] font-bold">Precision Estate Management</p>
            </div>
            <button onClick={onClose} className="text-[#7A6352] hover:text-[#3D2B1F]">
              <FaTimes />
            </button>
          </div>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab ? 'bg-white text-[#3D2B1F] shadow-sm' : 'text-[#7A6352] hover:bg-white/60'}`}
              >
                {tab === 'My Profile' ? '👤 ' : ''}{tab}
              </button>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#EEDDC8] space-y-4">
            <button className="text-[#7A6352] text-sm font-medium flex items-center gap-2 hover:text-[#3D2B1F]">❓ Help Center</button>
            <button onClick={onClose} className="text-[#7A6352] text-sm font-medium flex items-center gap-2 hover:text-red-600">🚪 Đóng</button>
          </div>
        </aside>

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#FDF8F1]">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#A68B6D]">Cá nhân</p>
            <h1 className="mt-2 text-3xl font-bold text-[#3D2B1F]">Xin chào, {userName || 'Người dùng'}</h1>
            <p className="mt-3 text-sm text-[#7A6352]">Xem và cập nhật thông tin tài khoản của bạn.</p>
          </header>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const Field = ({ label, value, readOnly, fullWidth }) => (
  <div className={fullWidth ? 'space-y-2 col-span-1 md:col-span-2' : 'space-y-2'}>
    <label className="text-[10px] font-black text-[#A68B6D] uppercase">{label}</label>
    <input
      type="text"
      defaultValue={value}
      readOnly={readOnly}
      className="w-full bg-[#FDF8F1] border border-[#EEDDC8] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#3D2B1F]/10"
    />
  </div>
);

export default UserProfileModal;
