import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer, Truck, MapPin, User, Clock, FileText, Navigation, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

const SupplierOrdersPage = () => {
  const { requestId } = useParams(); 
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // --- KẾT NỐI DATABASE ---
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetId = requestId;

        // Nếu không có ID trên URL, đi tìm đơn hàng PENDING đầu tiên trong DB
        if (!targetId) {
          const listRes = await axios.get('http://localhost:5000/api/transactions/pending', config);
          if (listRes.data.success && listRes.data.data.length > 0) {
            targetId = listRes.data.data[0].requestId;
            // Cập nhật URL để đồng bộ (tùy chọn)
            // navigate(`/supplier/orders/${targetId}`, { replace: true });
          } else {
            throw new Error("Không có lệnh giao hàng nào đang chờ xử lý.");
          }
        }

        // Lấy chi tiết đơn hàng theo ID
        const res = await axios.get(`http://localhost:5000/api/transactions/${targetId}`, config);

        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          setError("Không tìm thấy thông tin chi tiết đơn hàng.");
        }
      } catch (err) {
        console.error("Lỗi Fetch:", err);
        setError(err.response?.data?.message || err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [requestId]);

  // Hàm xác nhận giao hàng (Cập nhật APPROVED và cộng kho Admin)
  const handleApprove = async () => {
    if (!window.confirm("Xác nhận lô hàng đã khởi hành? Thao tác này sẽ cập nhật kho của khách hàng.")) return;
    
    try {
      const res = await axios.patch(`http://localhost:5000/api/transactions/${order._id}/approve`, {}, config);
      if (res.data.success) {
        alert("✅ Xác nhận khởi hành thành công!");
        setOrder({ ...order, status: 'APPROVED' });
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xác nhận"));
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDF8F1]">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#3D2B1F] mx-auto mb-4" size={40} />
        <p className="font-serif text-[#3D2B1F] animate-pulse">Đang truy xuất lệnh giao hàng...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="p-20 text-center font-serif bg-[#FDF8F1] min-h-screen flex flex-col items-center justify-center">
      <AlertCircle size={64} className="text-orange-400 mb-6" />
      <h2 className="text-3xl text-[#3D2B1F] mb-4 font-bold">Thông báo hệ thống</h2>
      <p className="text-[#A89485] max-w-md mx-auto mb-8">{error || "Hệ thống không tìm thấy lệnh giao hàng khả dụng."}</p>
      <button 
        onClick={() => window.location.href = '/supplier/dashboard'} 
        className="px-10 py-3 bg-[#3D2B1F] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all"
      >
        Quay lại bảng điều khiển
      </button>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto p-6 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-sm ${order.status === 'APPROVED' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
              {order.status === 'APPROVED' ? 'Vận đơn hoàn tất' : 'Chờ xác nhận xuất kho'}
            </span>
            <span className="text-[10px] font-bold text-[#A89485] uppercase tracking-widest border-l pl-3 border-[#EAE1D6]">
              Type: {order.type === 'in' ? 'Nhập kho' : 'Xuất kho'}
            </span>
          </div>
          <h1 className="text-5xl font-serif text-[#3D2B1F] mt-4 mb-2 tracking-tight">{order.requestId}</h1>
          <p className="text-[#A89485] text-sm font-medium italic flex items-center gap-2">
            <Clock size={14} /> Khởi tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-white border border-[#EAE1D6] text-[#3D2B1F] px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#F9F6F2] transition-all shadow-sm">
            <Printer size={18} /> In chứng từ
          </button>
          {order.status === 'PENDING' && (
            <button onClick={handleApprove} className="flex items-center gap-3 bg-[#3D2B1F] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black shadow-xl shadow-[#3D2B1F]/30 transition-all active:scale-95">
                <Truck size={18} /> Xác nhận khởi hành
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <AddressCard
              type="ĐIỂM ĐI (NHÀ CUNG CẤP)"
              name={order.supplier?.name || "Nông Trại Đối Tác"}
              address={order.supplier?.address || "Khu vực sản xuất liên kết"}
              person={order.user || "BP. Kho vận"}
              role="Người đại diện"
              icon={<MapPin className="text-orange-600" size={24} />}
            />
            <AddressCard
              type="ĐIỂM ĐẾN (HỆ THỐNG)"
              name="KHO TỔNG ROASTLOGIC"
              address="254 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng"
              person="Điều phối viên"
              role="Bộ phận tiếp nhận"
              icon={<Navigation className="text-blue-600" size={24} />}
            />
          </div>

          {/* Product Table Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#EAE1D6] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3D2B1F]"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A89485] mb-8">Chi tiết hàng hóa xuất xưởng</h3>
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-black text-[#3D2B1F] uppercase tracking-widest border-b-2 border-[#F9F6F2]">
                  <th className="text-left pb-6">Thông tin mặt hàng</th>
                  <th className="text-center pb-6">Khối lượng</th>
                  <th className="text-center pb-6">Đơn giá</th>
                  <th className="text-right pb-6 font-serif">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6F2]">
                  <ProductRow
                    name={order.product?.name || "Sản phẩm không tên"}
                    detail={`Mã SKU: ${order.product?.sku || 'N/A'}`}
                    weight={`${order.quantity?.toLocaleString()} KG`}
                    price={`${order.price?.toLocaleString()} đ`}
                    total={`${order.totalPrice?.toLocaleString()} đ`}
                  />
              </tbody>
            </table>
            
            <div className="mt-10 pt-8 border-t border-dashed border-[#EAE1D6] flex justify-end">
                <div className="text-right">
                    <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest mb-1">Tổng thanh toán dự kiến</p>
                    <p className="text-3xl font-serif font-bold text-[#3D2B1F]">{order.totalPrice?.toLocaleString()} <span className="text-sm italic font-sans text-[#A89485]">VNĐ</span></p>
                </div>
            </div>
          </div>

          {/* Logistics Info */}
          <div className="bg-[#F9F6F2] rounded-[2rem] p-8 border border-[#EAE1D6] grid grid-cols-3 gap-6">
              <TransportInfo label="Ghi chú đơn hàng" value={order.notes || "Không có yêu cầu đặc biệt"} />
              <TransportInfo label="Phương thức" value="Đường bộ - Xe tải" />
              <TransportInfo label="Trạng thái kho" value={order.status === 'APPROVED' ? 'Đã trừ tồn kho NCC' : 'Giữ chỗ tồn kho'} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#EAE1D6] shadow-xl shadow-gray-100/50 space-y-10">
            <div className="text-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3D2B1F] mb-2">Quy trình xác nhận</h3>
                <p className="text-[10px] text-[#A89485] italic font-medium">Vui lòng ký xác nhận điện tử trước khi xe rời bãi</p>
            </div>
            
            <SignatureArea label="Đại diện nhà cung cấp" desc="Ký xác nhận đủ số lượng" status={order.status} />
            <SignatureArea label="Đơn vị vận chuyển" desc="Ký xác nhận đã nhận hàng" status={order.status} />
            
            {order.status === 'APPROVED' ? (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-bounce">
                    <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                    <p className="text-green-700 font-black text-xs uppercase tracking-widest">Giao dịch đã hoàn tất</p>
                </div>
            ) : (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-[10px] text-orange-700 font-bold leading-relaxed text-center">
                        Lưu ý: Sau khi xác nhận, hệ thống sẽ tự động cập nhật số liệu vào Kho Tổng.
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const AddressCard = ({ type, name, address, person, role, icon }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE1D6] relative group hover:border-[#3D2B1F] transition-all duration-500 shadow-sm hover:shadow-md">
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity duration-500">{icon}</div>
    <p className="text-[10px] font-black text-[#A89485] uppercase tracking-[0.2em] mb-6">{type}</p>
    <h4 className="text-lg font-bold text-[#3D2B1F] mb-2">{name}</h4>
    <p className="text-xs text-[#A89485] mb-6 leading-relaxed min-h-[40px]">{address}</p>
    <div className="flex items-center gap-4 pt-6 border-t border-[#F9F6F2]">
      <div className="w-10 h-10 bg-[#F9F6F2] rounded-xl flex items-center justify-center border border-[#EAE1D6]">
        <User size={18} className="text-[#3D2B1F]" />
      </div>
      <div>
        <p className="text-xs font-bold text-[#3D2B1F]">{person}</p>
        <p className="text-[9px] text-[#A89485] uppercase font-black tracking-tighter">{role}</p>
      </div>
    </div>
  </div>
);

const ProductRow = ({ name, detail, weight, price, total }) => (
  <tr className="hover:bg-[#F9F6F2]/30 transition-colors group">
    <td className="py-8">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-[#3D2B1F] text-white rounded-2xl flex items-center justify-center italic font-serif text-xl shadow-lg group-hover:scale-110 transition-transform">
          {name?.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-[#3D2B1F]">{name}</p>
          <p className="text-[10px] text-[#A89485] font-black uppercase tracking-widest mt-1">{detail}</p>
        </div>
      </div>
    </td>
    <td className="py-8 text-center font-black text-sm text-[#3D2B1F]">{weight}</td>
    <td className="py-8 text-center text-xs font-bold text-[#A89485]">{price}</td>
    <td className="py-8 text-right font-serif font-bold text-[#3D2B1F] text-lg">{total}</td>
  </tr>
);

const TransportInfo = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-[#A89485] uppercase tracking-widest mb-2 text-center">{label}</p>
    <p className="text-xs font-bold text-[#3D2B1F] text-center">{value}</p>
  </div>
);

const SignatureArea = ({ label, desc, status }) => (
  <div className="space-y-3 text-center">
    <p className="text-[10px] font-black text-[#3D2B1F] uppercase tracking-widest">{label}</p>
    <div className={`h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 group transition-all ${status === 'APPROVED' ? 'bg-gray-50 border-gray-200' : 'bg-white border-[#EAE1D6] hover:border-[#3D2B1F] cursor-pointer'}`}>
      {status === 'APPROVED' ? (
          <div className="text-green-600 flex flex-col items-center">
              <CheckCircle size={24} />
              <p className="text-[8px] mt-1 font-bold">SIGNED DIGITAL</p>
          </div>
      ) : (
          <>
            <FileText size={28} className="text-[#EAE1D6] group-hover:text-[#3D2B1F] transition-colors" />
            <p className="text-[9px] text-[#A89485] italic font-medium px-4">{desc}</p>
          </>
      )}
    </div>
  </div>
);

export default SupplierOrdersPage;