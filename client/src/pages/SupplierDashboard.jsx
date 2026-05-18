import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Warehouse, History, Settings,
    LogOut, Search, Bell, Plus, BarChart3, Box, CheckCircle2,
    UserCircle, FileCheck, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const SupplierDashboard = () => {
    const navigate = useNavigate();
    const { userName, userProfile, logout, isAuthenticated } = useAuth();

    // State quản lý số liệu thực tế từ database
    const [stats, setStats] = useState({
        totalStock: 0,
        shippingCount: 0,
        completedCount: 0
    });
    const [latestOrders, setLatestOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        // --- FETCH SỐ LIỆU THẬT TỪ DATABASE ---
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Tách biệt luồng gọi để tránh việc một API lỗi làm sập luồng API còn lại
                try {
                    const statsRes = await axios.get(`${SOCKET_SERVER_URL}/api/transactions/supplier/dashboard-stats`, config);
                    if (statsRes.data && statsRes.data.success) {
                        setStats(statsRes.data.data);
                    }
                } catch (statsErr) {
                    console.error("❌ Lỗi API thống kê stats:", statsErr.message);
                }

                try {
                    const ordersRes = await axios.get(`${SOCKET_SERVER_URL}/api/transactions/pending`, config);
                    if (ordersRes.data && ordersRes.data.success && Array.isArray(ordersRes.data.data)) {
                        setLatestOrders(ordersRes.data.data.slice(0, 5));
                    } else if (ordersRes.data && Array.isArray(ordersRes.data)) {
                        setLatestOrders(ordersRes.data.slice(0, 5));
                    }
                } catch (ordersErr) {
                    console.error("❌ Lỗi API lấy đơn hàng pending:", ordersErr.message);
                }

            } catch (err) {
                console.error("Lỗi tổng hợp khi kết nối hệ thống:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // --- KẾT NỐI SOCKET REAL-TIME ĐỂ CẬP NHẬT KHI PHÊ DUYỆT ĐƠN ---
        const socket = io(SOCKET_SERVER_URL);

        // Khi trạng thái đơn hàng thay đổi (Được phê duyệt -> đi giao)
        socket.on('update_order_status', (updatedOrder) => {
            setLatestOrders((prevOrders) => {
                if (!Array.isArray(prevOrders)) return [];
                return prevOrders.map(order => order._id === updatedOrder._id ? updatedOrder : order);
            });

            // Gọi lại API thống kê chuẩn để cập nhật tức thì Tổng tồn kho (đã trừ) và Đơn vận chuyển
            axios.get(`${SOCKET_SERVER_URL}/api/transactions/supplier/dashboard-stats`, config)
                .then(res => {
                    if (res.data && res.data.success) setStats(res.data.data);
                })
                .catch(err => console.error("Lỗi cập nhật tự động stats từ socket:", err));
        });

        // Lắng nghe khi có yêu cầu nhập kho / lệnh điều động mới được khởi tạo từ quản trị viên
        socket.on('new_delivery_order', (newOrder) => {
            setLatestOrders((prevOrders) => {
                const safeOrders = Array.isArray(prevOrders) ? prevOrders : [];
                return [newOrder, ...safeOrders.slice(0, 4)];
            });
            
            axios.get(`${SOCKET_SERVER_URL}/api/transactions/supplier/dashboard-stats`, config)
                .then(res => {
                    if (res.data && res.data.success) setStats(res.data.data);
                })
                .catch(err => console.error("Lỗi cập nhật stats khi có đơn mới:", err));
        });

        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Biến phụ trợ giúp việc render mảng đơn hàng luôn an toàn
    const renderOrders = Array.isArray(latestOrders) ? latestOrders : [];

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                .supplier-container { font-family: 'Inter', sans-serif; background-color: #F9F6F2; color: #3D2B1F; }
                .sidebar-supplier { box-shadow: 4px 0 24px rgba(61, 43, 31, 0.03); }
                .btn-supplier { background-color: #3D2B1F; transition: all 0.3s ease; }
                .btn-supplier:hover { background-color: #1A110B; transform: translateY(-1px); }
                .card-stats { border: 1px solid #EAE1D6; transition: transform 0.3s ease; }
                .card-stats:hover { transform: translateY(-5px); background-color: #fff; }
            `}} />

            <div className="supplier-container flex min-h-screen">
                {/* MAIN CONTENT */}
                <main className="flex-1 p-10 overflow-y-auto">
                    
                    {loading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#3D2B1F]">
                            <Loader2 className="animate-spin text-[#3D2B1F]" size={32} />
                            <p className="text-xs font-bold tracking-widest uppercase">Đang đồng bộ số liệu thực từ hệ thống...</p>
                        </div>
                    ) : (
                        <>
                            {/* STATS - HIỂN THỊ SỐ THỰC TẾ TRÁNH CRASH */}
                            <div className="grid grid-cols-3 gap-8 mb-12">
                                <SupplierStatsCard 
                                    icon={<Box size={20} />} 
                                    label="Tổng tồn kho" 
                                    value={`${(Number(stats?.totalStock) || 0).toLocaleString('vi-VN')} kg`} 
                                    sub="Khối lượng sẵn có thực tế từ danh mục hạt" 
                                />
                                <SupplierStatsCard 
                                    icon={<Truck size={20} />} 
                                    label="Đang vận chuyển" 
                                    value={(stats?.shippingCount || 0).toString()} 
                                    sub="Đơn hàng phát lệnh khởi hành (APPROVED)" 
                                />
                                <SupplierStatsCard 
                                    icon={<CheckCircle2 size={20} />} 
                                    label="Hoàn tất tháng" 
                                    value={(stats?.completedCount || 0).toString()} 
                                    sub="Tổng đơn phê duyệt thành công tháng này" 
                                />
                            </div>

                            {/* TABLE LỆNH GIAO HÀNG ĐỘNG */}
                            <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-[#EAE1D6]">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest">Lệnh giao hàng mới nhất</h3>
                                    <button onClick={() => navigate('/supplier/orders')} className="text-[10px] font-bold text-[#A89485] uppercase tracking-wider hover:text-[#3D2B1F]">Xem tất cả</button>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-[10px] font-black text-[#A89485] uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 text-left">Mã vận đơn</th>
                                            <th className="pb-4 text-left">Loại hàng</th>
                                            <th className="pb-4 text-left">Số lượng</th>
                                            <th className="pb-4 text-left">Ngày tạo</th>
                                            <th className="pb-4 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {renderOrders.map((order) => (
                                            <SupplierOrderRow 
                                                key={order._id}
                                                id={order.requestId || `#DO-${order._id.substring(order._id.length - 4).toUpperCase()}`}
                                                type={order.productName || order.product?.name || "Cà phê nhân xanh"} 
                                                qty={`${(order.quantity || 0).toLocaleString('vi-VN')} kg`} 
                                                date={order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : "N/A"} 
                                                status={order.status === 'APPROVED' ? 'Đang vận chuyển' : 'Chờ lấy hàng'} 
                                                onClick={() => navigate(`/supplier/orders/${order.requestId || order._id}`)}
                                            />
                                        ))}
                                        {renderOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8 text-gray-400 font-medium">
                                                    Không có lệnh giao hàng nào hiện tại.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
};

const SupplierStatsCard = ({ icon, label, value, sub }) => (
    <div className="card-stats bg-white/50 p-8 rounded-[2rem]">
        <div className="text-[#3D2B1F] mb-4">{icon}</div>
        <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-bold mb-2">{value}</h4>
        <p className="text-[10px] text-gray-400 font-medium">{sub}</p>
    </div>
);

const SupplierOrderRow = ({ id, type, qty, date, status, onClick }) => (
    <tr 
        onClick={onClick}
        className="border-b border-gray-50 last:border-0 hover:bg-[#F9F6F2]/60 cursor-pointer transition-colors"
    >
        <td className="py-5 font-bold tracking-wider text-[#3D2B1F]">{id}</td>
        <td className="py-5 text-gray-600">{type}</td>
        <td className="py-5 font-bold text-[#3D2B1F]">{qty}</td>
        <td className="py-5 text-[#A89485]">{date}</td>
        <td className="py-5 text-right">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${status === 'Đang vận chuyển' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {status}
            </span>
        </td>
    </tr>
);

export default SupplierDashboard;