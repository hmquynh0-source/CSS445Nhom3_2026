import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, X, Truck, MapPin, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerOrders = () => {
    const navigate = useNavigate();
    
    // --- STATE QUẢN LÝ DỮ LIỆU THẬT ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 1. Gọi API lấy danh sách đơn hàng khi load trang
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/orders');
                // Backend trả về { success: true, data: [...] }
                setOrders(res.data.data || []);
            } catch (err) {
                console.error("Lỗi lấy đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // 2. Hàm định dạng màu sắc trạng thái
    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border border-green-200';
            case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'PENDING': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // 3. Logic Tìm kiếm & Lọc (Real-time Filter)
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openDetail = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#3D2B1F]" />
                <p className="text-[#A89485] font-bold text-xs uppercase tracking-widest">Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4">
            {/* TIÊU ĐỀ */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-[#3D2B1F] tracking-tight">Lịch sử Đơn hàng</h1>
                    <p className="text-[#A89485] font-medium italic">Hiển thị các đơn hàng gần đây của bạn.</p>
                </div>
                <button 
                    onClick={() => navigate('/customer/products')}
                    className="bg-[#3D2B1F] text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl active:scale-95"
                >
                    <Plus size={18} /> Đặt hàng mới
                </button>
            </div>

            {/* BỘ LỌC TÌM KIẾM */}
            <div className="bg-white p-5 rounded-[28px] border border-[#EFE3D5] shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89485]" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo mã đơn hàng (VD: #RL-1234)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#FDF8F3] border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3D2B1F]"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#FDF8F3] border-none rounded-xl px-6 py-3.5 text-sm font-black text-[#3D2B1F] outline-none"
                >
                    <option>Tất cả trạng thái</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="PENDING">Chờ xác nhận</option>
                </select>
            </div>

            {/* DANH SÁCH ĐƠN HÀNG */}
            <div className="bg-white rounded-[40px] border border-[#EFE3D5] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDF8F3]">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485]">Mã đơn</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485]">Ngày đặt</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485]">Tổng giá trị</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485]">Trạng thái</th>
                                <th className="p-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FDF8F3]">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-[#FDF8F3]/40 transition-colors group">
                                    <td className="p-6 font-black text-[#3D2B1F]">{order.orderCode}</td>
                                    <td className="p-6 text-sm text-[#A89485] font-bold">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-6 font-black text-[#3D2B1F]">{order.totalPrice?.toLocaleString()}đ</td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            {order.status === 'PROCESSING' ? 'Đang xử lý' : 
                                             order.status === 'COMPLETED' ? 'Hoàn thành' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => openDetail(order)}
                                            className="p-3 bg-white border border-[#EFE3D5] rounded-xl text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all shadow-sm"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-[#A89485] font-bold">
                                        Không tìm thấy đơn hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG (REAL DATA) */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-[#FDF8F3] rounded-full text-[#3D2B1F] hover:rotate-90 transition-transform">
                            <X size={20} />
                        </button>

                        <div className="p-10 space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-[#3D2B1F]">Chi tiết đơn {selectedOrder.orderCode}</h2>
                                <p className="text-[#A89485] text-xs font-bold uppercase mt-1">Trạng thái: {selectedOrder.status}</p>
                            </div>

                            <div className="bg-[#FDF8F3] p-8 rounded-[35px] space-y-6 border border-[#EFE3D5]">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-2xl text-orange-500"><MapPin size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest">Địa điểm nhận hàng</p>
                                        <p className="font-bold text-[#3D2B1F]">Kho Tổng RoastLogic - TP. Đà Nẵng</p>
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-[#EFE3D5] flex justify-between items-center">
                                    <span className="text-lg font-black text-[#3D2B1F]">Tổng thanh toán:</span>
                                    <span className="text-3xl font-black text-orange-600">
                                        {selectedOrder.totalPrice?.toLocaleString()} <span className="text-sm">đ</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-[#3D2B1F] py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                                    In hóa đơn (PDF)
                                </button>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 border border-[#EFE3D5] py-5 rounded-2xl text-[#3D2B1F] font-black uppercase text-[10px] tracking-widest hover:bg-[#FDF8F3] transition-all"
                                >
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;