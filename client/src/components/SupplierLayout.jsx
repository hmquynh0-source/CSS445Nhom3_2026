import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Warehouse, Settings,
    LogOut, Menu, UserCircle, FileCheck, Plus, Search, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SupplierLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, userProfile, userName } = useAuth();

    const userDisplayName = userProfile?.name || userName || 'Nhà cung cấp';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                .supplier-body { font-family: 'Inter', sans-serif; background-color: #F9F6F2; }
                .sidebar-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .sidebar-shadow { box-shadow: 4px 0 24px rgba(61, 43, 31, 0.03); }
            `}} />

            <div className="supplier-body flex min-h-screen text-[#3D2B1F]">
                {/* SIDEBAR */}
                <aside className={`sidebar-transition sidebar-shadow bg-white border-r border-[#EAE1D6] flex flex-col p-6 sticky top-0 h-screen z-50 ${isCollapsed ? 'w-24' : 'w-64'}`}>
                    {/* LOGO & TOGGLE */}
                    <div className="flex items-center justify-between mb-10 px-2">
                        {!isCollapsed && (
                            <div className="cursor-pointer" onClick={() => navigate('/supplier/dashboard')}>
                                <h1 className="text-xl font-extrabold tracking-widest uppercase text-[#3D2B1F]">RoastLogic</h1>
                                <p className="text-[10px] font-bold text-[#A89485] tracking-tighter">SUPPLIER PORTAL</p>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-[#F9F6F2] rounded-xl text-[#3D2B1F] transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    {/* NAVIGATION MENU */}
                    <nav className="flex-1 space-y-2">
                        <SupplierNavItem
                            icon={<LayoutDashboard size={18} />}
                            label="Bảng điều khiển"
                            active={location.pathname.includes('/supplier/dashboard')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/dashboard')}
                        />
                        <SupplierNavItem
                            icon={<FileCheck size={18} />}
                            label="Phê duyệt đơn hàng"
                            active={location.pathname.includes('/supplier/approvals')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/approvals')}
                        />
                        <SupplierNavItem
                            icon={<Truck size={18} />}
                            label="Lệnh giao hàng"
                            active={location.pathname.includes('/supplier/orders')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/orders')}
                        />
                        <SupplierNavItem
                            icon={<Warehouse size={18} />}
                            label="Quản lý kho"
                            active={location.pathname.includes('/supplier/inventory')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/inventory')}
                        />
                    </nav>

                    {/* BOTTOM MENU */}
                    <div className="mt-auto pt-6 border-t border-[#EAE1D6] space-y-2">
                        {/* {!isCollapsed && (
                            <button className="w-full bg-[#3D2B1F] hover:bg-[#1A110B] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest mb-4 transition-all active:scale-95">
                                <Plus size={16} /> Tạo lô hàng mới
                            </button>
                        )} */}
                        <SupplierNavItem
                            icon={<UserCircle size={18} />}
                            label="Hồ sơ cá nhân"
                            active={location.pathname.includes('/supplier/profile')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/profile')}
                        />
                        <SupplierNavItem
                            icon={<Settings size={18} />}
                            label="Cấu hình"
                            active={location.pathname.includes('/supplier/settings')}
                            collapsed={isCollapsed}
                            onClick={() => navigate('/supplier/settings')}
                        />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all mt-2 overflow-hidden"
                        >
                            <LogOut size={18} className="shrink-0" />
                            {!isCollapsed && <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Đăng xuất</span>}
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* TOPBAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#EAE1D6] flex items-center justify-between px-10 shrink-0 z-40">
                        <div className="relative w-1/3">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89485]" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm mã đơn, lô hàng..."
                                className="w-full bg-[#F9F6F2] border border-transparent rounded-full py-2.5 pl-12 pr-4 text-[11px] outline-none focus:bg-white focus:border-[#EAE1D6] transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2 text-[#A89485] hover:text-[#3D2B1F] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-4 border-l border-[#EAE1D6] pl-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[11px] font-extrabold uppercase tracking-tight">{userDisplayName}</p>
                                    <p className="text-[9px] text-[#A89485] font-bold uppercase tracking-tighter">Đối tác: #SUP-2024</p>
                                </div>
                                <div
                                    className="w-10 h-10 bg-[#3D2B1F] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-all active:scale-90"
                                    onClick={() => navigate('/supplier/profile')}
                                >
                                    {userDisplayName.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};

const SupplierNavItem = ({ icon, label, active = false, collapsed, onClick }) => (
    <div
        onClick={onClick}
        className={`
            flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group
            ${active
                ? 'bg-[#3D2B1F] text-white font-bold shadow-lg shadow-[#3D2B1F]/10'
                : 'text-[#A89485] hover:bg-[#F9F6F2] hover:text-[#3D2B1F]'
            }
        `}
        title={collapsed ? label : ""}
    >
        <div className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        {!collapsed && <span className="text-[12px] font-semibold whitespace-nowrap">{label}</span>}
    </div>
);

export default SupplierLayout;