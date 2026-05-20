import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, Package, Info, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const SupplierApprovalPage = () => {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cấu hình Header chứa Token để vượt qua Middleware protect
    const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    };

    // --- LẤY DỮ LIỆU TỪ BACKEND ---
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/transactions/pending', config);
            
            // Backend trả về dạng { success: true, data: [...] }
            if (response.data && response.data.data) {
                setRequests(response.data.data);
            } else {
                setRequests(Array.isArray(response.data) ? response.data : []);
            }
            setError(null);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu giao dịch pending:", error);
            setError(error.response?.data?.message || "Không thể kết nối lấy dữ liệu thẩm định đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // --- XỬ LÝ PHÊ DUYỆT (Đã đồng bộ hóa với cơ chế bắt lỗi dữ liệu từ Backend) ---
    // --- XỬ LÝ PHÊ DUYỆT CHUẨN HÓA (ĐÃ TÁCH BIỆT LUỒNG LỖI) ---
   const handleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn phê duyệt lô hàng này không?")) return;

    try {
        // 🌟 ĐẢM BẢO dùng axios.post (không phải axios.put) và đúng đường dẫn
        const res = await axios.post(`http://localhost:5000/api/transactions/${id}/approve`, {}, config);
        
        if (res.data.success) {
            alert(`✅ Thành công: ${res.data.message}`);
            // Cập nhật lại state danh sách đơn hàng trên giao diện thành trạng thái mới
            setRequests(requests.map(r => r._id === id ? { ...r, status: 'SUPPLIER_CONFIRMED' } : r));
        }
    } catch (error) {
        console.error("Lỗi xử lý phê duyệt:", error);
        alert(`❌ Thất bại: ${error.response?.data?.message || "Không tìm thấy endpoint API (Lỗi 404)"}`);
    }
};

    // --- XỬ LÝ TỪ CHỐI (Dự phòng trường hợp từ chối đơn hàng) ---
    const handleReject = async (id) => {
        const reason = window.prompt("Vui lòng nhập lý do từ chối tiếp nhận lô hàng này:");
        if (reason === null) return; 
        
        if (!reason.trim()) {
            alert("Bạn bắt buộc phải nhập lý do từ chối!");
            return;
        }

        try {
            // Lưu ý: Hiện tại backend của bạn chưa viết route /reject công khai, đoạn này chạy trực tiếp theo chuẩn chung
            const res = await axios.post(`http://localhost:5000/api/transactions/${id}/reject`, { reason }, config);
            
            if (res.data.success) {
                alert("❌ Đã từ chối tiếp nhận yêu cầu nhập kho này.");
                setRequests(requests.map(r => r._id === id ? { ...r, status: 'REJECTED' } : r));
                setSelectedReq(null);
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện từ chối đơn hàng:", error);
            alert("❌ Không thể thực hiện: " + (error.response?.data?.message || "Yêu cầu từ chối chưa được thiết lập ở Backend"));
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
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#EAE1D6] pb-8">
                <div className="max-w-xl">
                    <h2 className="text-5xl font-serif text-[#3D2B1F] leading-tight mb-4">Phê duyệt yêu cầu nhập hàng</h2>
                    <p className="text-[#A89485] text-sm italic font-medium">Khu vực dành cho Nhà cung cấp: Thẩm định và xác nhận nhập kho nhân xanh.</p>
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
                        <div className="col-span-2">Sản phẩm / Ngày gửi</div>
                        <div className="col-span-1">Số lượng</div>
                        <div className="col-span-1 text-right">Trạng thái</div>
                    </div>
                    
                    {requests.length === 0 ? (
                        <p className="text-center py-20 text-[#A89485] italic">Hiện không có yêu cầu nào cần xử lý hoặc phê duyệt.</p>
                    ) : requests.map((req) => (
                        <div 
                            key={req._id}
                            onClick={() => setSelectedReq(req)}
                            className={`group grid grid-cols-5 items-center p-8 rounded-2xl transition-all cursor-pointer ${
                                selectedReq?._id === req._id ? 'bg-[#F3EDE4] shadow-sm' : 'hover:bg-[#F9F6F2]'
                            }`}
                        >
                            <div className="text-xs font-bold text-[#3D2B1F]">
                                {req.requestId || req.orderId || req._id.slice(-6).toUpperCase()}
                            </div>
                            <div className="col-span-2 text-[11px] font-medium text-[#3D2B1F] leading-relaxed">
                                {req.product?.name || "Sản phẩm không xác định"}
                                <p className="text-[10px] text-[#A89485] mt-1 font-normal">
                                    {new Date(req.createdAt || req.date).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="text-xs font-black text-[#3D2B1F]">
                                {req.quantity} kg
                            </div>
                            <div className="flex justify-end">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-tighter border ${
                                    req.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'
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
                                <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest">Chi tiết thẩm định</p>
                                <h3 className="text-2xl font-serif text-[#3D2B1F] mt-1">{selectedReq.requestId || "Yêu cầu nhập hàng"}</h3>
                                <p className="text-[11px] text-[#A89485]">Nguồn gửi: Quản trị kho hệ thống</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <p className="text-[10px] font-black text-[#A89485] uppercase border-b border-[#F9F6F2] pb-2">Thông tin mặt hàng</p>
                                <ProductDetail 
                                    name={selectedReq.product?.name || "Hạt nhân xanh"} 
                                    qty={`${selectedReq.quantity} kg`} 
                                    price={`${selectedReq.quantity > 0 ? (selectedReq.totalPrice / selectedReq.quantity).toLocaleString() : 0} / kg`} 
                                />
                            </div>

                            <div className="bg-[#F9F6F2] p-6 rounded-2xl mb-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Tổng khối lượng</p>
                                    <p className="text-xl font-bold text-[#3D2B1F]">{selectedReq.quantity} kg</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Giá trị thanh toán</p>
                                    <p className="text-2xl font-black text-[#3D2B1F] leading-none">{selectedReq.totalPrice?.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-[#A89485] mt-1">VND</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {selectedReq.status === 'PENDING' && (
                                    <>
                                        <button 
                                            onClick={() => handleReject(selectedReq._id)}
                                            className="flex-1 py-4 bg-white border border-[#EAE1D6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                                        >
                                            Từ chối
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(selectedReq._id)}
                                            className="flex-[2] py-4 bg-[#3D2B1F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A110B] transition-all flex items-center justify-center gap-2"
                                        >
                                            Phê duyệt nhập kho <Check size={14} />
                                        </button>
                                    </>
                                )}
                                {selectedReq.status === 'APPROVED' && (
                                    <div className="w-full py-4 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase text-center border border-green-200">
                                        Đơn hàng đã hoàn tất nhập kho
                                    </div>
                                )}
                                {selectedReq.status === 'REJECTED' && (
                                    <div className="w-full py-4 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase text-center border border-red-200">
                                        Đơn hàng đã bị từ chối tiếp nhận
                                    </div>
                                )}
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
            <p className="text-[9px] text-[#A89485] font-medium uppercase tracking-tighter">HÀNG ĐÃ KIỂM ĐỊNH CHẤT LƯỢNG</p>
        </div>
        <div className="text-right">
            <p className="text-[11px] font-black text-[#3D2B1F]">{qty}</p>
            <p className="text-[9px] text-[#A89485] font-bold">{price}</p>
        </div>
    </div>
);

export default SupplierApprovalPage;