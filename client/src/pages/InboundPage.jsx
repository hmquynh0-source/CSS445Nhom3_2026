import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaThList, FaClock, FaCheckCircle, FaWarehouse, FaDollarSign 
} from 'react-icons/fa';

const InboundPage = () => {
  const [categories, setCategories] = useState([]); // Lưu danh mục hạt lấy từ collection categories
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '', // Nơi lưu trữ _id của danh mục hạt (ví dụ: '6a043293...') để gửi lên Backend
    supplierId: '', 
    quantity: '',
    price: '65000', 
    note: ''
  });

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Gọi chính xác API lấy dữ liệu từ collection categories, transactions và suppliers
      const [resCat, resTrans, resSupp] = await Promise.all([
        axios.get('http://localhost:5000/api/categories', config),
        axios.get('http://localhost:5000/api/transactions', config),
        axios.get('http://localhost:5000/api/suppliers', config)
      ]);

      // Cập nhật danh sách loại hạt lấy từ MongoDB Compass (categories)
      setCategories(resCat.data?.data || resCat.data || []);
      setSuppliers(resSupp.data?.data || resSupp.data || []);
      setHistory(resTrans.data?.data || resTrans.data || []);
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    }
  };

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmInbound = async () => {
    const { productId, supplierId, quantity, price, note } = formData;
    
    // Kiểm tra validation phía Client trước khi gửi đi
    if (!productId || !supplierId || !quantity || !price) {
      return alert("❌ Lỗi gửi đơn: Vui lòng nhập đầy đủ: Loại nhân xanh, Nhà cung cấp, Số lượng và Giá.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Payload truyền đi đính kèm chính xác ObjectId tương ứng với loại hạt được chọn
      const payload = {
        productId: productId, // Gửi _id danh mục hạt lên trường productId theo thiết kế router.post('/import')
        supplierId: supplierId,
        quantity: Number(quantity),
        price: Number(price),
        note: note || "Yêu cầu nhập kho nhân xanh thô"
      };

      await axios.post('http://localhost:5000/api/transactions/import', payload, config);
      
      alert("🚀 Đã gửi yêu cầu nhập hàng tới Nhà cung cấp thành công!");
      // Reset form trạng thái ban đầu
      setFormData({ productId: '', supplierId: '', quantity: '', price: '65000', note: '' });
      fetchInitialData();
    } catch (error) {
      alert("❌ Lỗi gửi đơn: " + (error.response?.data?.message || error.message));
    } finally { setLoading(false); }
  };

  const handleFinalReceive = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.put(`http://localhost:5000/api/inbound/approve/${id}`, {}, config);
      alert("✅ Đã xác nhận nhập kho & sinh số lô QC thành công!");
      fetchInitialData();
    } catch (error) { 
      alert("❌ Lỗi nhập kho: " + (error.response?.data?.message || error.message)); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F1E7] p-8 font-sans text-[#3D2B1F]">
      <header className="mb-12">
        <h1 className="text-6xl font-black italic tracking-tighter">Nhập kho.</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* FORM PHIẾU NHẬP */}
        <div className="md:col-span-7 bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="font-black uppercase text-[11px] mb-8 text-[#A89B8D] tracking-wider">Chi tiết phiếu nhập thực tế (Theo Danh Mục Cà Phê)</h2>
          <div className="space-y-6">
            
            {/* ĐÃ SỬA: Lấy danh sách hiển thị động từ Collection categories */}
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Loại nhân xanh</label>
              <select name="productId" value={formData.productId} onChange={handleInputChange} className="w-full p-4 bg-[#F4F4F4] rounded-lg font-bold border-none focus:outline-none">
                <option value="">-- Chọn loại hạt cà phê --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ô CHỌN NHÀ CUNG CẤP */}
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Nhà cung cấp đối tác</label>
              <select name="supplierId" value={formData.supplierId} onChange={handleInputChange} className="w-full p-4 bg-[#F4F4F4] rounded-lg font-bold border-none focus:outline-none">
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name || s.supplierName}</option>)}
              </select>
            </div>

            {/* SỐ LƯỢNG & GIÁ NHẬP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Số lượng (Kg)</label>
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Ví dụ: 100" className="w-full p-4 bg-[#F4F4F4] rounded-lg font-bold focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Giá nhập khẩu (VNĐ / Kg)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Ví dụ: 120000" className="w-full p-4 bg-[#F4F4F4] rounded-lg font-bold focus:outline-none text-emerald-700" />
              </div>
            </div>

            <button onClick={handleConfirmInbound} disabled={loading} className="w-full py-5 bg-[#3D2B1F] text-white font-black rounded-lg uppercase tracking-wider hover:bg-[#2A1E15] transition-colors mt-4 shadow-lg">
              {loading ? "Đang gửi tiến trình..." : "Tạo đơn gửi phê duyệt"}
            </button>
          </div>
        </div>

        {/* NHẬT KÝ TIẾN ĐỘ ĐƠN */}
        <div className="md:col-span-5 bg-[#EAE2D8] p-8 rounded-2xl shadow-inner">
          <h3 className="font-black text-xs uppercase mb-6 border-b border-black/10 pb-4 tracking-wider">Nhật ký tiến độ đơn</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs italic text-center text-gray-500 py-4">Chưa có lịch sử giao dịch đơn nào</p>
            ) : (
              history.map((item) => (
                <div key={item._id} className="bg-white/70 p-4 rounded-xl shadow-sm border border-white/40">
                  <div className="flex justify-between items-start mb-1">
                    {/* Hiển thị tên sản phẩm lấy từ DB thông qua lệnh populate('product') của Backend */}
                    <p className="font-black text-[12px] uppercase tracking-tight text-[#3D2B1F]">
                      {item.product?.name || item.productName || "Cà phê nhân thô"}
                    </p>
                    <p className="font-black text-sm text-[#3D2B1F]">{item.quantity?.toLocaleString()} kg</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-gray-500 font-medium">Đơn giá: {Number(item.price || 0).toLocaleString('vi-VN')} đ/kg</span>
                    <span className="text-[11px] font-bold text-emerald-800">Tổng: {((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="border-t border-dashed border-black/5 pt-2 flex items-center justify-between">
                    {item.status === 'COMPLETED' ? (
                      <span className="text-[10px] font-black text-green-700 uppercase bg-green-100 px-2 py-1 rounded flex items-center gap-1 w-full justify-center">
                        <FaCheckCircle /> ✓ Đã vào kho thành công
                      </span>
                    ) : item.status === 'APPROVED' ? (
                      <>
                        <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-100 px-2 py-1 rounded">
                          ✓ NCC Đã duyệt
                        </span>
                        <button onClick={() => handleFinalReceive(item._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3 py-2 rounded-md uppercase shadow-sm transition-colors">
                          Xác nhận nhập kho
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-black text-amber-700 uppercase bg-amber-100 px-2 py-1 rounded animate-pulse w-full text-center py-2">
                        ⏱ Chờ nhà cung cấp phê duyệt (Thủ kho không được tự ý duyệt)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundPage;