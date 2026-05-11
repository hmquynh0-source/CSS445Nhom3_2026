import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBox, 
  FaThList,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const InboundPage = () => {
  // --- QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '', 
    quantity: '',
    price: '65000', // Sửa từ costPrice thành price để khớp Backend
    note: ''
  });

  // --- LẤY DỮ LIỆU TỪ BACKEND ---
  const fetchInitialData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };

      const [resProd, resTrans, resSupp] = await Promise.all([
        axios.get('http://localhost:5000/api/products', config),
        axios.get('http://localhost:5000/api/transactions', config),
        axios.get('http://localhost:5000/api/suppliers', config)
      ]);

      // Xử lý dữ liệu sản phẩm (Lọc nhân xanh)
      const allProducts = resProd.data?.data || resProd.data || [];
      const greenCoffee = allProducts.filter(p => 
        (p.category?.name === "Nhân xanh") || (p.category === "Nhân xanh")
      );
      setProducts(greenCoffee.length > 0 ? greenCoffee : allProducts);

      // Xử lý nhà cung cấp
      setSuppliers(resSupp.data?.data || resSupp.data || []);

      // Xử lý lịch sử (Lấy 8 giao dịch gần nhất)
      const allTrans = resTrans.data?.data || resTrans.data || [];
      setHistory(allTrans.slice(0, 8));

    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- XỬ LÝ SỰ KIỆN ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmInbound = async () => {
    const { productId, supplierId, quantity, price } = formData;

    if (!productId || !supplierId || !quantity || !price) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin: Sản phẩm, Nhà cung cấp, Số lượng và Giá!");
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };

      // PAYLOAD: Đã khớp 100% với file transactionRoutes.js mới
      const payload = {
        productId,
        supplierId,
        quantity: Number(quantity),
        price: Number(price),
        note: formData.note || "Yêu cầu nhập kho nhân xanh hệ thống"
      };

      const response = await axios.post('http://localhost:5000/api/transactions/import', payload, config);

      if (response.data.success) {
        alert(`🚀 Gửi yêu cầu thành công! Đang chờ Nhà cung cấp phê duyệt.`);
        setFormData({ productId: '', supplierId: '', quantity: '', price: '65000', note: '' });
        fetchInitialData(); // Refresh danh sách lịch sử
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi kết nối Server";
      alert("❌ Lỗi: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedProductSKU = products.find(p => p._id === formData.productId)?.sku || "---";

  return (
    <div className="min-h-screen bg-[#F9F1E7] p-4 md:p-8 font-sans text-[#3D2B1F]">

      {/* HEADER SECTION */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black tracking-[0.3em] text-[#A89B8D] mb-3 uppercase">Hệ Thống Phê Duyệt</p>
          <h1 className="text-6xl md:text-7xl font-black italic mb-6 tracking-tighter leading-none">
            Nhập kho.
          </h1>
          <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-lg font-medium italic">
            Tạo phiếu yêu cầu nhập kho. Dữ liệu tồn kho sẽ chỉ được cập nhật sau khi Nhà cung cấp phê duyệt đơn này.
          </p>
        </div>
        <div className="text-right border-l border-[#3D2B1F]/20 pl-8">
          <p className="text-5xl font-black mb-1 tabular-nums">{history.filter(h => h.status === 'PENDING').length}</p>
          <p className="text-[9px] font-black tracking-[0.25em] text-[#A89B8D] uppercase">Đơn đang chờ duyệt</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="md:col-span-8 space-y-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(61,43,31,0.1)] overflow-hidden border border-white">
            <div className="p-6 border-b border-[#F1F1F1] flex justify-between items-center bg-white">
              <h2 className="font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 text-[#A89B8D]">
                <FaThList /> Lập phiếu yêu cầu mới
              </h2>
              {loading && <span className="text-[10px] animate-pulse font-bold text-orange-500">Đang truyền dữ liệu...</span>}
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                
                {/* Inputs Left */}
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">Chọn loại cà phê</label>
                    <select 
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#3D2B1F]/20 transition-all"
                    >
                      <option value="">-- Danh sách nhân xanh --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">Nhà cung cấp đối tác</label>
                    <select 
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#3D2B1F]/20 transition-all"
                    >
                      <option value="">-- Chọn đơn vị cung cấp --</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inputs Right */}
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">Số lượng (KG)</label>
                      <input 
                        name="quantity"
                        type="number" 
                        placeholder="0.0" 
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none focus:bg-[#EAEAEA]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">Đơn giá (VNĐ)</label>
                      <input 
                        name="price"
                        type="number" 
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none focus:bg-[#EAEAEA]" 
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-[#F9F1E7] rounded-xl border border-[#3D2B1F]/5 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-[9px] font-black uppercase text-[#A89B8D] mb-1">Mã tham chiếu SKU</p>
                      <p className="text-sm font-black text-[#3D2B1F] tracking-widest">{selectedProductSKU}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#A89B8D]">
                        <FaBox size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setFormData({productId:'', supplierId:'', quantity:'', price:'65000', note:''})}
                  className="px-14 py-5 bg-[#E5D5C5] hover:bg-[#D9C7B5] transition-colors font-black text-[10px] tracking-[0.25em] rounded-lg uppercase"
                >
                  Làm mới biểu mẫu
                </button>
                <button 
                  onClick={handleConfirmInbound}
                  disabled={loading}
                  className="px-14 py-5 bg-[#3D2B1F] hover:bg-black text-white transition-all font-black text-[10px] tracking-[0.25em] rounded-lg uppercase shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu phê duyệt"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-orange-400">
             <h3 className="font-black text-xs uppercase mb-1 tracking-wider flex items-center gap-2">
               <FaClock className="text-orange-400" /> Tiến độ đơn hàng
             </h3>
             <p className="text-[10px] text-[#A89B8D] font-bold uppercase mt-2">Đang đồng bộ với Nhà Cung Cấp</p>
          </div>

          <div className="bg-[#EAE2D8] p-8 rounded-2xl min-h-[400px]">
            <h3 className="font-black text-xs uppercase tracking-[0.15em] mb-8 border-b border-[#3D2B1F]/10 pb-4">Nhật ký yêu cầu</h3>
            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={item._id || idx} className="flex justify-between items-start border-b border-[#3D2B1F]/5 pb-5 last:border-0">
                  <div className="flex-1 pr-4">
                    <p className="text-[11px] font-black uppercase leading-tight text-[#3D2B1F] mb-2">
                        {item.product?.name || "Sản phẩm ẩn"}
                    </p>
                    <div className="flex items-center gap-2">
                       {item.status === 'PENDING' ? (
                         <span className="flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-600 uppercase">
                           <FaClock size={8} /> Đang chờ
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded bg-green-100 text-green-600 uppercase">
                           <FaCheckCircle size={8} /> Đã duyệt
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#3D2B1F]">+{item.quantity}kg</p>
                    <p className="text-[9px] font-bold text-[#A89B8D] uppercase mt-1 tabular-nums">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-10 opacity-30">
                  <FaExclamationTriangle size={30} className="mb-2" />
                  <p className="text-[10px] font-black uppercase">Chưa có giao dịch</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundPage;