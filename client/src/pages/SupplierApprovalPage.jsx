import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, Package, Info, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const SupplierApprovalPage = () => {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- LẤY DỮ LIỆU TỪ MONGODB ---
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/supplier-requests');
                setRequests(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // --- XỬ LÝ PHÊ DUYỆT ---
    const handleApprove = async (id) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/supplier-requests/${id}/approve`);
            if (res.data.success) {
                alert("Phê duyệt thành công!");
                // Cập nhật lại danh sách tại chỗ
                setRequests(requests.map(r => r._id === id ? { ...r, status: 'APPROVED' } : r));
                setSelectedReq(null);
            }
        } catch (error) {
            alert("Lỗi khi phê duyệt!");
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FDF8F1]">
            <Loader2 className="animate-spin text-[#3D2B1F] mb-4" size={40} />
            <p className="font-serif italic text-[#A89485]">Đang tải dữ liệu thẩm định...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#EAE1D6] pb-8">
                <div className="max-w-xl">
                    <h2 className="text-5xl font-serif text-[#3D2B1F] leading-tight mb-4">Phê duyệt yêu cầu nhập hàng</h2>
                    <p className="text-[#A89485] text-sm italic font-medium">Thẩm định chi tiết các lô hàng nhân xanh chất lượng cao.</p>
                </div>
                <div className="flex gap-4">
                    <StatBox label="Đang chờ duyệt" value={requests.filter(r => r.status === 'PENDING').length} sub="Yêu cầu" />
                    <StatBox label="Tổng giá trị" value={requests.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toLocaleString()} sub="VND" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* DANH SÁCH BÊN TRÁI */}
                <div className="col-span-7 space-y-2">
                    <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485] px-8 mb-4">
                        <div className="col-span-1">Mã đơn</div>
                        <div className="col-span-2">Nhà kho</div>
                        <div className="col-span-1">Giá trị</div>
                        <div className="col-span-1 text-right">Trạng thái</div>
                    </div>
                    
                    {requests.map((req) => (
                        <div 
                            key={req._id}
                            onClick={() => setSelectedReq(req)}
                            className={`group grid grid-cols-5 items-center p-8 rounded-2xl transition-all cursor-pointer ${
                                selectedReq?._id === req._id ? 'bg-[#F3EDE4] shadow-sm' : 'hover:bg-[#F9F6F2]'
                            }`}
                        >
                            <div className="text-xs font-bold text-[#3D2B1F]">{req.requestId || req._id.slice(-6).toUpperCase()}</div>
                            <div className="col-span-2 text-[11px] font-medium text-[#3D2B1F] leading-relaxed">
                                {req.warehouseName || "Kho Tổng Hệ Thống"}
                                <p className="text-[10px] text-[#A89485] mt-1 font-normal">
                                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="text-xs font-black text-[#3D2B1F]">
                                {req.totalPrice?.toLocaleString()}
                            </div>
                            <div className="flex justify-end">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-tighter ${
                                    req.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-green-50 text-green-600 border border-green-200'
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CHI TIẾT BÊN PHẢI */}
                <div className="col-span-5">
                    {selectedReq ? (
                        <div className="sticky top-8 bg-white border border-[#EAE1D6] rounded-[2.5rem] p-10 shadow-xl shadow-[#3D2B1F]/5 animate-in slide-in-from-right-8">
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest">Chi tiết yêu cầu</p>
                                <h3 className="text-2xl font-serif text-[#3D2B1F] mt-1">{selectedReq.requestId || "REQ-LOGIC"}</h3>
                                <p className="text-[11px] text-[#A89485]">{selectedReq.supplierName || "Nhà cung cấp đối tác"}</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <p className="text-[10px] font-black text-[#A89485] uppercase border-b border-[#F9F6F2] pb-2">Danh mục nhân xanh</p>
                                {/* Nếu bạn có mảng products trong document */}
                                {selectedReq.items?.map((item, idx) => (
                                    <ProductDetail key={idx} name={item.name} qty={`${item.quantity} kg`} price={`${item.price?.toLocaleString()} / kg`} />
                                )) || <p className="text-xs italic">Không có dữ liệu chi tiết mặt hàng</p>}
                            </div>

                            <div className="bg-[#F9F6F2] p-6 rounded-2xl mb-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Khối lượng tổng</p>
                                    <p className="text-xl font-bold text-[#3D2B1F]">{selectedReq.totalWeight || 0} kg</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Giá trị quyết toán</p>
                                    <p className="text-2xl font-black text-[#3D2B1F] leading-none">{selectedReq.totalPrice?.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-[#A89485] mt-1">VND</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-white border border-[#EAE1D6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                                    Từ chối
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedReq._id)}
                                    className="flex-[2] py-4 bg-[#3D2B1F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A110B] transition-all flex items-center justify-center gap-2"
                                >
                                    Phê duyệt nhập kho <Check size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-[#EAE1D6] rounded-[2.5rem] p-20 text-center">
                            <p className="text-xs font-bold text-[#A89485] uppercase tracking-widest leading-relaxed">Chọn một yêu cầu để xem thẩm định chi tiết</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Các Helper Components giữ nguyên bố cục cũ của bạn
const StatBox = ({ label, value, sub }) => (
    <div className="bg-[#F9F6F2] px-6 py-4 rounded-lg min-w-[140px]">
        <p className="text-[9px] font-black text-[#A89485] uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#3D2B1F]">{value}</span>
            <span className="text-[10px] font-bold text-[#A89485]">{sub}</span>
        </div>
    </div>
);

const ProductDetail = ({ name, qty, price }) => (
    <div className="flex justify-between items-center group">
        <div>
            <p className="text-[11px] font-bold text-[#3D2B1F]">{name}</p>
            <p className="text-[9px] text-[#A89485] font-medium uppercase tracking-tighter">HÀNG ĐÃ KIỂM ĐỊNH</p>
        </div>
        <div className="text-right">
            <p className="text-[11px] font-black text-[#3D2B1F]">{qty}</p>
            <p className="text-[9px] text-[#A89485] font-bold">{price}</p>
        </div>
    </div>
);

export default SupplierApprovalPage;