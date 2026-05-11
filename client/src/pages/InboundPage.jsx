import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBox, 
  FaCheckCircle, 
  FaQrcode, 
  FaCloudUploadAlt, 
  FaCalendarAlt, 
  FaThList 
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
    costPrice: '65000', 
    note: ''
  });

  // --- LẤY DỮ LIỆU TỪ BACKEND ---
  const fetchInitialData = async () => {
    try {
      const [resProd, resTrans, resSupp] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/transactions'),
        axios.get('http://localhost:5000/api/suppliers')
      ]);

      // --- SỬA LOGIC LẤY SẢN PHẨM ---
      const allProducts = resProd.data?.data || resProd.data || [];
      const greenCoffee = allProducts.filter(p => 
        (p.category?.name === "Nhân xanh") || (p.category === "Nhân xanh")
      );
      // Nếu lọc xong bị rỗng, lấy tất cả để đảm bảo có dữ liệu chọn
      setProducts(greenCoffee.length > 0 ? greenCoffee : allProducts);

      // --- SỬA LOGIC LẤY NHÀ CUNG CẤP ---
      const allSuppliers = resSupp.data?.data || resSupp.data || [];
      setSuppliers(allSuppliers);

      // --- SỬA LOGIC LỊCH SỬ ---
      const allTrans = resTrans.data?.data || resTrans.data || [];
      setHistory(allTrans.slice(0, 5));

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
    const { productId, supplierId, quantity, costPrice } = formData;

    if (!productId || !supplierId || !quantity) {
      alert("⚠️ Vui lòng chọn Sản phẩm, Nhà cung cấp và nhập Số lượng!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId,
        supplierId,
        type: 'in',
        quantity: parseFloat(quantity),
        costPrice: parseFloat(costPrice),
        note: formData.note || "Nhập kho nhân xanh"
      };

      const response = await axios.post('http://localhost:5000/api/transactions', payload);

      if (response.data.success || response.data) {
        alert(`✅ Nhập kho thành công!`);
        setFormData({ productId: '', supplierId: '', quantity: '', costPrice: '65000', note: '' });
        fetchInitialData(); 
      }
    } catch (error) {
      alert("❌ Lỗi: " + (error.response?.data?.message || "Server không phản hồi"));
    } finally {
      setLoading(false);
    }
  };

  const selectedProductSKU = products.find(p => p._id === formData.productId)?.sku || "N/A";

  // --- GIỮ NGUYÊN GIAO DIỆN CŨ CỦA BẠN ---
  return (
    <div className="min-h-screen bg-[#F9F1E7] p-4 md:p-8 font-sans text-[#3D2B1F]">

      {/* HEADER SECTION */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black tracking-[0.3em] text-[#A89B8D] mb-3 uppercase">Module PB07</p>
          <h1 className="text-6xl md:text-7xl font-black italic mb-6 tracking-tighter leading-none">
            Nhập kho Nhân Xanh.
          </h1>
          <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-lg font-medium italic">
            Hệ thống quản lý chuyên biệt cho hạt cà phê nhân xanh từ nhà cung cấp.
          </p>
        </div>
        <div className="text-right border-l border-[#3D2B1F]/20 pl-8">
          <p className="text-5xl font-black mb-1 tabular-nums">{history.length}</p>
          <p className="text-[9px] font-black tracking-[0.25em] text-[#A89B8D] uppercase">Giao dịch hệ thống</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: FORM NHẬP LIỆU */}
        <div className="md:col-span-8 space-y-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(61,43,31,0.1)] overflow-hidden">
            <div className="p-6 border-b border-[#F1F1F1] flex justify-between bg-white">
              <h2 className="font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
                <FaThList className="text-[#A89B8D]" /> Biểu mẫu nhập kho nhân xanh
              </h2>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                
                {/* Cột 1: Sản phẩm & Nhà cung cấp */}
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                      Chọn sản phẩm (Chỉ nhân xanh)
                    </label>
                    <select 
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#3D2B1F]/10"
                    >
                      <option value="">-- Chọn loại hạt --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                      Nhà cung cấp đối tác
                    </label>
                    <select 
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#3D2B1F]/10"
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cột 2: Số lượng & Thông tin SKU */}
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                        Số lượng (KG)
                      </label>
                      <input 
                        name="quantity"
                        type="number" 
                        placeholder="0.00" 
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                        Giá vốn nhập kho
                      </label>
                      <input 
                        name="costPrice"
                        type="number" 
                        value={formData.costPrice}
                        onChange={handleInputChange}
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold outline-none" 
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-[#F9F1E7] rounded-xl border border-[#3D2B1F]/5 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase text-[#A89B8D] mb-1">Mã định danh SKU</p>
                      <p className="text-sm font-black text-[#3D2B1F]">{selectedProductSKU}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FaBox className="text-[#A89B8D]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút bấm */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setFormData({productId:'', supplierId:'', quantity:'', costPrice:'65000', note:''})}
                  className="px-14 py-5 bg-[#E5D5C5] hover:bg-[#D9C7B5] transition-colors font-black text-[10px] tracking-[0.25em] rounded-lg uppercase"
                >
                  Làm mới
                </button>
                <button 
                  onClick={handleConfirmInbound}
                  disabled={loading}
                  className="px-14 py-5 bg-[#3D2B1F] hover:bg-black text-white transition-all font-black text-[10px] tracking-[0.25em] rounded-lg uppercase shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận nhập kho"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LỊCH SỬ */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
             <h3 className="font-black text-xs uppercase mb-1 tracking-wider">Trạng thái kho</h3>
             <div className="mt-4 p-4 bg-[#4F7942]/10 rounded-lg text-center">
                <p className="text-[10px] font-black text-[#4F7942] uppercase tracking-[0.2em]">Sẵn sàng tiếp nhận</p>
             </div>
          </div>

          <div className="bg-[#EAE2D8] p-8 rounded-2xl min-h-[350px]">
            <h3 className="font-black text-xs uppercase tracking-[0.15em] mb-8">Lịch sử vừa tạo</h3>
            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-[#3D2B1F]/10 pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase leading-tight">
                        {item.product?.name || "Sản phẩm"}
                    </p>
                    <p className="text-[9px] font-bold text-[#A89B8D] uppercase mt-1">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#4F7942]">+{item.quantity}kg</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs opacity-50 italic">Chưa có giao dịch.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundPage;