import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Loader2, RefreshCw, Plus, AlertTriangle } from 'lucide-react';

const SupplierInventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [systemCategories, setSystemCategories] = useState([]); // Danh mục hạt thật từ DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
    
    // Cấu trúc dữ liệu Form chuẩn để đồng bộ mã ID hệ thống
    const [formData, setFormData] = useState({ 
        _id: '',          // ID của bản ghi kho cung ứng phục vụ chỉnh sửa
        categoryID: '',   // ID gốc của loại hạt từ bảng Categories (Dùng để đồng bộ đơn hàng)
        name: '', 
        quantity: '', 
        description: '' 
    });
    const [submitting, setSubmitting] = useState(false);

    // 1. Tải thông tin kho thực tế của Nhà cung cấp
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token'); 
            const response = await axios.get('http://localhost:5000/api/supplier-stocks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setInventory(response.data.data || []);
            }
            setLoading(false);
        } catch (err) {
            console.error("Lỗi tải thông tin kho cung ứng:", err);
            setError(err.response?.data?.message || 'Không thể kết nối danh mục kho nhà cung cấp.');
            setLoading(false);
        }
    };

    // 2. Tải danh mục hạt thực tế từ MongoDB Atlas (Không dùng mồi dữ liệu ảo)
    const fetchSystemCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/supplier-stocks/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setSystemCategories(response.data.data);
                setError(null);
            } else {
                setSystemCategories([]);
                setError('Hệ thống chưa có danh mục loại hạt nào trong MongoDB. Vui lòng tạo danh mục ở trang Admin.');
            }
        } catch (err) {
            console.error("Lỗi đồng bộ API danh mục gốc:", err);
            setSystemCategories([]);
            setError('Không thể đồng bộ danh mục hạt thật từ MongoDB Atlas. Vui lòng kiểm tra API Backend.');
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchSystemCategories();
    }, []);

    // Hành động khi nhấn nút "Thêm sản phẩm mới"
    const openAddModal = () => {
        setModalMode('add');
        setFormData({ _id: '', categoryID: '', name: '', quantity: '0', description: '' });
        setIsModalOpen(true);
    };

    // Hành động khi nhấn nút "Chỉnh sửa kho"
    const openEditModal = (item) => {
        setModalMode('edit');
        
        // Truy vết lấy mã categoryID gốc dựa trên tên hạt nếu Backend chưa trả về trực tiếp trường categoryID
        const matchedCategory = systemCategories.find(cat => cat.name.toLowerCase().trim() === item.name.toLowerCase().trim());
        
        setFormData({ 
            _id: item._id, // Giữ id kho để gửi lên điều kiện tìm kiếm cập nhật
            categoryID: item.categoryID || (matchedCategory ? matchedCategory._id : ''), // Đảm bảo luôn lấy được mã hạt gốc
            name: item.name, 
            quantity: item.quantity, 
            description: item.description || '' 
        });
        setIsModalOpen(true);
    };

    // 🆕 HÀM MỚI TÍCH HỢP: XỬ LÝ XÓA DÒNG SẢN PHẨM KHỎI KHO CUNG ỨNG
    const handleDeleteItem = async (id, name) => {
        if (!window.confirm(`⚠️ Bạn có chắc chắn muốn xóa loại hạt "${name}" khỏi danh mục cung ứng của mình không? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/supplier-stocks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert(`✅ Đã gỡ bỏ hạt ${name} thành công!`);
                fetchInventory(); // Tải lại giao diện kho mới
            }
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm kho:", err);
            alert(err.response?.data?.message || "Không thể xóa dòng sản phẩm này. Vui lòng kiểm tra lại API Delete.");
        }
    };

    // Lắng nghe thay đổi khi NCC chọn loại hạt từ Dropdown Select hệ thống
    const handleCategoryChange = (e) => {
        const selectedName = e.target.value;
        const targetCategory = systemCategories.find(cat => cat.name === selectedName);
        
        if (targetCategory) {
            setFormData(prev => ({
                ...prev,
                name: targetCategory.name,
                categoryID: targetCategory._id // 🚀 Lấy chính xác mã hạt gốc từ bảng categories đưa vào Form
            }));
        } else {
            setFormData(prev => ({ ...prev, name: '', categoryID: '' }));
        }
    };

    // Xử lý gửi dữ liệu lên Server
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || formData.name === "") {
            alert('Vui lòng lựa chọn một loại hạt từ danh sách danh mục.');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            
            // Nếu thêm mới, kiểm tra trùng tên hạt ngay tại client để tránh sinh rác dữ liệu
            if (modalMode === 'add') {
                const isDuplicate = inventory.some(item => item.name.toLowerCase().trim() === formData.name.toLowerCase().trim());
                if (isDuplicate) {
                    alert(`Loại hạt "${formData.name}" đã tồn tại trong kho của bạn. Hãy bấm nút "Chỉnh sửa kho" để cập nhật số lượng.`);
                    setSubmitting(false);
                    return;
                }
            }

            // Gửi request đồng bộ mã ID và số lượng xuống Backend
            const response = await axios.post(
                'http://localhost:5000/api/supplier-stocks/update',
                {
                    id: formData._id,                 // ID bản ghi kho cung ứng (chỉ có khi Edit)
                    categoryID: formData.categoryID, // Mã ID gốc của danh mục hạt (Bắt buộc dùng để đồng bộ hóa)
                    name: formData.name, 
                    quantity: Number(formData.quantity),
                    description: formData.description
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(modalMode === 'add' ? 'Khai báo hạt mới vào kho thành công!' : 'Cập nhật số lượng kho cung ứng thành công!');
                setIsModalOpen(false);
                fetchInventory(); // Tải lại bảng dữ liệu mới từ CSDL thật
            }
        } catch (err) {
            console.error("Lỗi khi gửi dữ liệu form kho:", err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý kho dữ liệu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                <p className="text-gray-500 text-sm">Đang đồng bộ dữ liệu kho thực tế trực tiếp từ MongoDB Atlas...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 font-medium shadow-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Quản lý kho cung ứng nhà cung cấp</h2>
                        <p className="text-xs text-gray-400 mt-1">Hệ thống khớp mã định danh thời gian thực với Danh mục hạt của Ban quản lý</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={openAddModal}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-xl text-sm font-semibold hover:bg-amber-900 transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Khai báo hạt mới
                        </button>
                        <button onClick={fetchInventory} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            <RefreshCw className="w-4 h-4" /> Làm mới kho
                        </button>
                    </div>
                </div>

                {/* BẢNG DỮ LIỆU HIỂN THỊ KHO THỰC TẾ */}
                <div className="overflow-x-auto mt-6">
                    {inventory.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <p className="text-gray-400 text-sm">Kho hiện tại trống. Vui lòng bấm "Khai báo hạt mới" để bắt đầu cung ứng sản phẩm.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                    <th className="py-4 px-4">Mã Loại Hạt Đồng Bộ (_id)</th>
                                    <th className="py-4 px-4">Tên hạt nhân xanh</th>
                                    <th className="py-4 px-4">Thông tin mô tả lô hàng</th>
                                    <th className="py-4 px-4 text-right">Khối lượng tồn kho (KG)</th>
                                    <th className="py-4 px-4 text-center">Trạng thái kho</th>
                                    <th className="py-4 px-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {inventory.map((item) => {
                                    // Tìm kiếm lấy mã ID của danh mục hệ thống để hiển thị lên bảng thay vì hiển thị ID phụ của bảng kho
                                    const matchedCat = systemCategories.find(c => c.name.toLowerCase().trim() === item.name.toLowerCase().trim());
                                    const displayId = item.categoryID || (matchedCat ? matchedCat._id : item._id);

                                    return (
                                        <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Hiển thị mã _id chuẩn hóa khớp hoàn toàn với danh mục hệ thống để khi check với đơn hàng sẽ trùng khớp */}
                                            <td className="py-4 px-4 font-mono text-xs text-amber-800 bg-amber-50/30 font-bold select-all rounded-lg">{displayId}</td>
                                            <td className="py-4 px-4 font-bold text-gray-800">{item.name}</td>
                                            <td className="py-4 px-4 text-gray-500 max-w-xs truncate" title={item.description}>
                                                {item.description || 'Chưa có ghi chú mô tả'}
                                            </td>
                                            <td className="py-4 px-4 text-right font-bold text-gray-900">
                                                {Number(item.quantity || 0).toLocaleString('vi-VN')} KG
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.quantity > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {item.quantity > 0 ? 'Sẵn sàng cung ứng' : 'Tạm thời hết hàng'}
                                                </span>
                                            </td>
                                            {/* CỘT THAO TÁC CÓ THÊM NÚT XÓA */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                                                    </button>
                                                    
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteItem(item._id, item.name)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL THÊM / CẬP NHẬT KHO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-200">
                        <div className="bg-amber-800 p-4 text-white">
                            <h3 className="font-bold text-lg">
                                {modalMode === 'add' ? 'Khai Báo Dòng Cà Phê Cung Ứng' : 'Cập Nhật Số Lượng Kho'}
                            </h3>
                            <p className="text-amber-200 text-xs mt-1">
                                {modalMode === 'add' ? 'Hệ thống tự động liên kết mã ID từ danh mục tổng' : 'Điều chỉnh khối lượng tồn trữ thực tế của nhà cung cấp'}
                            </p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Mã hạt hệ thống đồng bộ (_id)</label>
                                <input 
                                    type="text" disabled
                                    className="w-full p-3 bg-gray-100 text-gray-500 rounded-lg font-mono border-none focus:outline-none text-xs cursor-not-allowed select-all" 
                                    value={formData.categoryID || "Hệ thống tự động sinh khi lựa chọn loại hạt..."} 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Tên loại hạt nhân xanh *</label>
                                
                                {modalMode === 'add' ? (
                                    <select 
                                        required
                                        className="w-full p-3 bg-[#F4F4F4] rounded-lg font-bold border-none focus:outline-none text-gray-800 text-sm"
                                        value={formData.name}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="">-- Chọn hạt từ danh mục MongoDB Atlas --</option>
                                        {systemCategories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" disabled
                                        className="w-full p-3 bg-gray-100 text-gray-400 rounded-lg font-bold border-none focus:outline-none text-sm cursor-not-allowed" 
                                        value={formData.name} 
                                    />
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Khối lượng sẵn có tại kho (KG) *</label>
                                <input 
                                    type="number" min="0" required
                                    className="w-full p-3 bg-[#F4F4F4] rounded-lg font-bold border-none focus:outline-none text-gray-800 text-sm"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2 text-[#6D5341]">Mô tả chi tiết / Ghi chú lô hàng</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Độ ẩm, sàn hạt, niên vụ thu hoạch..."
                                    className="w-full p-3 bg-[#F4F4F4] rounded-lg font-bold border-none focus:outline-none text-gray-800 text-sm" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                                />
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition">Đóng lại</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition flex items-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />} 
                                    {modalMode === 'add' ? 'Khai báo kho' : 'Xác nhận cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierInventoryPage;