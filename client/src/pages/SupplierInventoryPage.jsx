import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Download, 
  Filter,
  Plus,
  Edit3,
  FolderPlus,
  X,
  Loader2
} from 'lucide-react';

const SupplierInventoryPage = () => {
  // Quản lý danh sách sản phẩm hạt (được map trực tiếp từ Collection Categories)
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Trạng thái đóng/mở Form Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State lưu trữ dữ liệu Form thao tác
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: 0, description: '' }); // Quản lý form sửa nâng cấp
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // 1. Gọi API lấy dữ liệu thật từ MongoDB khi tải trang
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/categories/supplier-stock');
      const result = await res.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu từ MongoDB, đang chạy data dự phòng: ", err);
      setCategories([
        { _id: "6a0432933747b5f407933269", name: "Robusta G1", description: "Cà phê Robusta đậm đà từ thủ phủ Buôn Ma Thuột", quantity: 1240, status: "SẴN SÀNG" },
        { _id: "6a0432933747b5f40793326c", name: "Arabica Specialty", description: "Cà phê nhân xanh Arabica chất lượng cao", quantity: 856, status: "SẴN SÀNG" },
        { _id: "6a0432933747b5f40793326f", name: "Culi Premium", description: "Hạt phối trộn đặc biệt theo tỷ lệ nhà máy", quantity: 420, status: "DƯỚI ĐỊNH MỨC" },
        { _id: "6a0432933747b5f407933272", name: "Cherry (Excelsa)", description: "Dòng hạt Cherry chua nhẹ độc đáo", quantity: 185, status: "SẴN SÀNG" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Kích hoạt mở modal cập nhật thông tin sản phẩm (Đã nâng cấp điền full thông tin cũ)
  const openEditStockModal = (category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name || '',
      quantity: category.quantity || 0,
      description: category.description || ''
    });
    setIsEditModalOpen(true);
  };

  // 3. Xử lý gửi API PUT cập nhật TÊN + SỐ LƯỢNG + MÔ TẢ lên MongoDB
  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/categories/supplier-stock/${selectedCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editForm.name, 
          quantity: Number(editForm.quantity),
          description: editForm.description
        })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Cập nhật thông tin hạt ${editForm.name} thành công!`);
        setIsEditModalOpen(false);
        fetchCategoriesData(); // Reload table và cập nhật Top Stats đồng bộ
      }
    } catch (err) {
      // Fallback client-side xử lý offline
      setCategories(categories.map(item => 
        item._id === selectedCategory._id 
          ? { 
              ...item, 
              name: editForm.name, 
              quantity: Number(editForm.quantity), 
              description: editForm.description,
              status: Number(editForm.quantity) > 100 ? "SẴN SÀNG" : "DƯỚI ĐỊNH MỨC" 
            } 
          : item
      ));
      setIsEditModalOpen(false);
    }
  };

  // 4. Xử lý gửi API POST tạo mới một loại hạt nhân xanh
  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.name, description: newCategory.description, quantity: 0 })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Đã khởi tạo loại hạt ${newCategory.name} thành công!`);
        setIsCategoryModalOpen(false);
        setNewCategory({ name: '', description: '' });
        fetchCategoriesData();
      }
    } catch (err) {
      const newRow = { _id: Date.now().toString(), name: newCategory.name, description: newCategory.description, quantity: 0, status: "DƯỚI ĐỊNH MỨC" };
      setCategories([...categories, newRow]);
      setIsCategoryModalOpen(false);
      setNewCategory({ name: '', description: '' });
    }
  };

  return (
    <div className="w-full space-y-8 p-1 transition-opacity duration-500 ease-in-out relative">
      
      {/* 1. TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.slice(0, 4).map((item, index) => {
          const trends = [
            { rate: "+12%", up: true },
            { rate: "-2%", up: false },
            { rate: "+8%", up: true },
            { rate: "Ổn định", up: false }
          ];
          const currentTrend = trends[index] || { rate: "Ổn định", up: true };

          return (
            <InventoryQuickStat 
              key={item._id || index}
              label={item.name} 
              value={Number(item.quantity || 0).toLocaleString('vi-VN')} 
              unit="KG" 
              trend={currentTrend.rate} 
              up={currentTrend.up} 
            />
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-4 text-center py-4 text-xs font-bold text-[#A89485] bg-white border border-[#EAE1D6] rounded-2xl">
            Chưa có dữ liệu danh mục để hiển thị thống kê nhanh
          </div>
        )}
      </div>

      {/* THANH THAO TÁC QUẢN TRỊ KHO BIẾN ĐỘNG */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-[#EAE1D6] p-4 rounded-2xl shadow-sm">
        <div className="text-xs font-bold text-[#3D2B1F] uppercase tracking-wide">Bảng điều khiển cung ứng nguồn hạt</div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-[#3D2B1F] text-white px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-sm"
          >
            <FolderPlus size={14}/> Thêm Loại Nhân Xanh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART AREA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#F9F6F2] border border-[#EAE1D6] rounded-[2.5rem] p-8 overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F]">Biến Động Tồn Kho</h3>
                <p className="text-[11px] text-[#A89485] font-medium">Dữ liệu tổng hợp 30 ngày gần nhất</p>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-[#EAE1D6] scale-90 sm:scale-100">
                <button className="px-4 py-1.5 text-[10px] font-bold bg-[#3D2B1F] text-white rounded-md">30 NGÀY</button>
                <button className="px-4 py-1.5 text-[10px] font-bold text-[#A89485] hover:text-[#3D2B1F]">90 NGÀY</button>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2 px-4">
              {[40, 70, 45, 90, 65, 30, 85, 40, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div style={{ height: `${height}%` }} className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${i === 3 || i === 8 ? 'bg-[#3D2B1F]' : 'bg-[#D6C9BA] group-hover:bg-[#A89485]'}`}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegionCard title="Cao Nguyên Lâm Đồng" img="https://images.unsplash.com/photo-1501333190117-bf58ad11cfa5?q=80&w=2070" stats={{ qty: "1,200", moist: "11.5%", s: "S18" }} />
            <RegionCard title="Thủ Phủ Cà Phê" img="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070" stats={{ qty: "800", moist: "13.0%", s: "S16" }} />
          </div>
        </div>

        {/* SIDEBAR INFO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#EAE1D6] rounded-[2.5rem] p-8 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F] mb-6">Lô Hàng Sắp Xuất</h3>
            <div className="space-y-4">
              <IncomingShipment id="#SHP-2904-A" status="ĐANG CHUẨN BỊ" color="green" />
              <IncomingShipment id="#SHP-2105-B" status="KIỂM ĐỊNH" color="orange" />
            </div>
            <button className="w-full mt-6 py-4 border border-[#EAE1D6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3D2B1F] hover:text-white transition-all duration-300">
              Theo dõi hành trình
            </button>
          </div>

          <div className="bg-white border border-[#EAE1D6] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F] mb-6">Lịch Sử Nhập/Xuất</h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EAE1D6]">
              <TimelineItem time="HÔM NAY, 08:45" action="Nhập kho: 20 Tấn Robusta" sub="Hợp tác xã Krông Năng" isNew />
              <TimelineItem time="HÔM QUA, 14:30" action="Xuất kho: 15 Tấn Culi Premium" sub="Nhà rang xay Specialty HCM" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BẢNG THEO DÕI DANH MỤC HẠT THỰC TẾ TỪ MONGODB ATLAS */}
      <div className="bg-[#F9F6F2] border border-[#EAE1D6] rounded-[2.5rem] p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F]">Kho Sản Phẩm Cung Ứng (Theo Categories)</h3>
            <p className="text-[11px] text-[#A89485] mt-1">Dữ liệu kết nối thời gian thực với cơ sở dữ liệu MongoDB Atlas</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[10px] font-bold text-[#A89485] uppercase hover:text-[#3D2B1F]"><Filter size={14}/> Lọc</button>
            <button className="flex items-center gap-2 text-[10px] font-bold text-[#A89485] uppercase hover:text-[#3D2B1F]"><Download size={14}/> Xuất báo cáo</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#8D6D4D] gap-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-xs font-bold">Đang truy xuất danh mục từ MongoDB...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-[10px] font-black text-[#A89485] uppercase tracking-wider border-b border-[#EAE1D6]">
                  <th className="pb-4">MÃ ID DANH MỤC (_id)</th>
                  <th className="pb-4">TÊN HẠT NHÂN XANH</th>
                  <th className="pb-4">CHI TIẾT / MÔ TẢ DÒNG HẠT</th>
                  <th className="pb-4">KHỐI LƯỢNG SẴN CÓ (KG)</th>
                  <th className="pb-4">TRẠNG THÁI NGUỒN</th>
                  <th className="pb-4 text-right">HÀNH ĐỘNG CẬP NHẬT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE1D6]/50 text-xs">
                {categories.map((item) => (
                  <tr key={item._id} className="group hover:bg-white transition-colors cursor-default">
                    <td className="py-5 font-mono text-[10px] text-[#A89485] tracking-tight">{item._id}</td>
                    <td className="py-5 font-black text-[#3D2B1F] text-sm">{item.name}</td>
                    <td className="py-5 text-[#A89485] font-medium max-w-xs truncate">{item.description || "Chưa có mô tả chi tiết"}</td>
                    <td className="py-5 font-black text-[#3D2B1F] text-sm">{Number(item.quantity || 0).toLocaleString('vi-VN')}</td>
                    <td className="py-5">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full whitespace-nowrap ${item.status === 'SẴN SÀNG' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.status || "SẴN SÀNG"}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <button 
                        onClick={() => openEditStockModal(item)}
                        className="p-2 text-[#8D6D4D] hover:text-[#3D2B1F] hover:bg-[#FDF5EC] rounded-lg transition-all inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Edit3 size={12}/> Chỉnh sửa thông tin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL SỬA: ĐÃ ĐƯỢC THAY ĐỔI ĐỂ SỬA ĐƯỢC TÊN + SỐ LƯỢNG + MÔ TẢ ================= */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D6] rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-6 top-6 text-[#A89485] hover:text-[#3D2B1F]">
              <X size={20}/>
            </button>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F] mb-6">
              Chỉnh Sửa Loại Nhân Xanh
            </h3>
            
            <form onSubmit={handleUpdateStockSubmit} className="space-y-4 text-xs">
              {/* Ô sửa Tên hạt */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#A89485] mb-1">Tên loại hạt</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                  className="w-full bg-[#F9F6F2] border border-[#EAE1D6] rounded-xl p-3 text-sm font-bold text-[#3D2B1F] focus:outline-none focus:border-[#3D2B1F]" 
                />
              </div>

              {/* Ô sửa Số lượng tồn kho */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#A89485] mb-1">Số lượng hàng trong kho (KG)</label>
                <input 
                  type="number" 
                  required 
                  value={editForm.quantity} 
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} 
                  className="w-full bg-[#F9F6F2] border border-[#EAE1D6] rounded-xl p-3 text-sm font-bold text-[#3D2B1F] focus:outline-none focus:border-[#3D2B1F]" 
                />
              </div>

              {/* Ô sửa Mô tả dòng hạt */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#A89485] mb-1">Mô tả chi tiết nguồn cung</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                  className="w-full bg-[#F9F6F2] border border-[#EAE1D6] rounded-xl p-3 focus:outline-none focus:border-[#3D2B1F] h-20 resize-none text-[#3D2B1F] font-medium" 
                />
              </div>

              <button type="submit" className="w-full bg-[#3D2B1F] text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all">
                Lưu toàn bộ thay đổi dữ liệu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D6] rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute right-6 top-6 text-[#A89485] hover:text-[#3D2B1F]"><X size={20}/></button>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F] mb-4">Thêm Loại Hạt Nhân Xanh Mới</h3>
            
            <form onSubmit={handleCreateCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#A89485] mb-1">Tên loại hạt (Category Name)</label>
                <input 
                  type="text" 
                  required
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
                  className="w-full bg-[#F9F6F2] border border-[#EAE1D6] rounded-xl p-3 focus:outline-none focus:border-[#3D2B1F]" 
                  placeholder="Ví dụ: Culi Specialty, Liberica..." 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#A89485] mb-1">Mô tả nguồn cung</label>
                <textarea 
                  value={newCategory.description} 
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} 
                  className="w-full bg-[#F9F6F2] border border-[#EAE1D6] rounded-xl p-3 focus:outline-none focus:border-[#3D2B1F] h-20 resize-none" 
                  placeholder="Nhập đặc trưng dòng hạt..." 
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3D2B1F] text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-black transition-all"
              >
                Lưu danh mục nhân xanh mới
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- GIỮ NGUYÊN CÁC SUB-COMPONENTS TĨNH CỦA BẠN ---
const InventoryQuickStat = ({ label, value, unit, trend, up }) => (
  <div className="bg-white border border-[#EAE1D6] p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest mb-2 truncate">{label}</p>
    <div className="flex items-baseline gap-2 mb-2">
      <span className="text-3xl font-bold text-[#3D2B1F]">{value}</span>
      <span className="text-[11px] font-medium text-[#A89485]">{unit}</span>
    </div>
    <div className={`flex items-center gap-1 text-[10px] font-bold ${up ? 'text-green-600' : 'text-orange-600'}`}>
      {trend === "Ổn định" ? null : up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
      {trend} {trend !== "Ổn định" && "tháng này"}
    </div>
  </div>
);

const RegionCard = ({ title, img, stats }) => (
  <div className="relative rounded-[2rem] overflow-hidden h-64 group shadow-md border border-[#EAE1D6]">
    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 flex flex-col justify-end">
      <h4 className="text-white font-serif italic text-xl mb-4">{title}</h4>
      <div className="flex gap-6 border-t border-white/20 pt-4">
        <div><p className="text-[8px] text-white/60 uppercase font-black">Tồn kho</p><p className="text-white font-bold text-xs">{stats.qty} Tấn</p></div>
        <div><p className="text-[8px] text-white/60 uppercase font-black">Độ ẩm</p><p className="text-white font-bold text-xs">{stats.moist}</p></div>
        <div><p className="text-[8px] text-white/60 uppercase font-black">Sàng</p><p className="text-white font-bold text-xs">{stats.s}</p></div>
      </div>
    </div>
  </div>
);

const IncomingShipment = ({ id, status, color }) => (
  <div className="flex items-center justify-between p-4 bg-[#F9F6F2] rounded-2xl border border-[#EAE1D6] hover:bg-white transition-colors duration-300">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}><TrendingUp size={16} /></div>
      <div>
        <p className="text-[11px] font-bold text-[#3D2B1F]">{id}</p>
        <p className="text-[9px] text-[#A89485] font-medium">Dự kiến: 28/10/2026</p>
      </div>
    </div>
    <span className={`text-[8px] font-black px-2 py-1 rounded shadow-sm ${color === 'green' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>{status}</span>
  </div>
);

const TimelineItem = ({ time, action, sub, isNew }) => (
  <div className="pl-8 relative group">
    <div className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${isNew ? 'bg-[#3D2B1F]' : 'bg-[#A89485]'}`}></div>
    <p className="text-[9px] font-bold text-[#A89485] mb-1">{time}</p>
    <p className="text-[11px] font-bold text-[#3D2B1F] group-hover:text-amber-900 transition-colors">{action}</p>
    <p className="text-[10px] italic text-[#A89485]">Từ: {sub}</p>
  </div>
);

export default SupplierInventoryPage;