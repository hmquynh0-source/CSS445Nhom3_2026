import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
    LayoutDashboard, Package, Coffee, FileText, Users, 
    Search, Bell, LogOut, Settings, HelpCircle, 
    Plus, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile, userName, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const userDisplayName = userProfile?.name || userName || 'Khách hàng';

    const menuItems = [
        { icon: <LayoutDashboard size={20}/>, label: "Tổng quan", path: "/customer/dashboard" },
        { icon: <Package size={20}/>, label: "Đơn hàng", path: "/customer/orders" },
        { icon: <Coffee size={20}/>, label: "Sản phẩm", path: "/customer/products" },
        { icon: <FileText size={20}/>, label: "Sổ cái", path: "/customer/ledger" },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#FDF8F3] font-['Inter'] text-[#3D2B1F]">
            {/* SIDEBAR */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EFE3D5] flex flex-col p-6 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} sidebar-shadow`}>
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-widest uppercase text-[#3D2B1F]">RoastLogic</h1>
                        <p className="text-[10px] font-bold text-[#A89485] tracking-tighter uppercase">Estate Member</p>
                    </div>
                    <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scroll">
                    {menuItems.map((item) => (
                        <div 
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                                location.pathname === item.path 
                                ? 'bg-[#3D2B1F] text-white shadow-lg' 
                                : 'text-[#A89485] hover:bg-[#F9F6F4] hover:text-[#3D2B1F]'
                            }`}
                        >
                            <span className={`${location.pathname === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform'}`}>
                                {item.icon}
                            </span>
                            <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="mt-auto space-y-2 pt-6 border-t border-[#EFE3D5]">
                    <button 
                        onClick={() => navigate('/customer/orders/new')}
                        className="w-full bg-[#3D2B1F] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 mb-4 shadow-md"
                    >
                        <Plus size={16} /> Đơn hàng mới
                    </button>
                    
                    <button className="w-full flex items-center gap-4 px-4 py-3 text-[#A89485] font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all">
                        <Settings size={18}/> Cài đặt
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-red-600 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#EFE3D5] flex items-center justify-between px-10 sticky top-0 z-40">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89485] group-focus-within:text-[#3D2B1F] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nhanh đơn hàng..." 
                            className="w-full bg-[#FDF8F3] border-none rounded-full py-2.5 pl-12 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#3D2B1F] focus:bg-white transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer hover:scale-110 transition-transform p-2 bg-[#FDF8F3] rounded-full">
                            <Bell size={20} className="text-[#3D2B1F]" />
                            <span className="absolute top-2 right-2 bg-red-500 w-2 h-2 rounded-full border-2 border-white animate-pulse"></span>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white p-1 pr-5 rounded-full shadow-sm border border-[#EFE3D5] cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 bg-[#3D2B1F] rounded-full flex items-center justify-center text-[#FDF8F3] font-bold text-sm shadow-inner">
                                {userDisplayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tight leading-none">{userDisplayName}</span>
                                <span className="text-[9px] text-[#A89485] font-bold mt-0.5">VIP MEMBER</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* DYNAMIC CONTENT */}
                <main className="flex-1 p-10 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;