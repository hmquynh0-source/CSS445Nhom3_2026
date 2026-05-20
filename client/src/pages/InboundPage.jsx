import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InboundPage = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quản lý thông tin chung của phiếu
  const [metaData, setMetaData] = useState({
    creator: '',
    location: '',
    sourceDoc: '',
    warehouse: 'Kho Thành Phẩm A',
    date: new Date().toLocaleDateString('vi-VN'),
    receiptNo: `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  });

  // Quản lý danh sách hàng hóa (hỗ trợ nhiều dòng)
  const [items, setItems] = useState([
    { productId: '', supplierId: '', quantity: '', price: '85000' }
  ]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [resCat, resTrans, resSupp] = await Promise.all([
        axios.get('http://localhost:5000/api/categories', config),
        axios.get('http://localhost:5000/api/transactions', config),
        axios.get('http://localhost:5000/api/suppliers', config)
      ]);
      setCategories(resCat.data?.data || resCat.data || []);
      setSuppliers(resSupp.data?.data || resSupp.data || []);
      setHistory(resTrans.data?.data || resTrans.data || []);
    } catch (err) { console.error("Lỗi:", err); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // Xử lý thay đổi thông tin chung
  const handleMetaChange = (e) => {
    setMetaData({ ...metaData, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi từng dòng hàng
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Thêm dòng mới
  const addRow = () => {
    setItems([...items, { productId: '', supplierId: '', quantity: '', price: '85000' }]);
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
  };

  const handleConfirmInbound = async () => {
    // Basic validation
    const isValid = items.every(item => item.productId && item.supplierId && item.quantity);
    if (!isValid) return alert("Vui lòng điền đủ Sản phẩm, Nhà cung cấp và Số lượng ở tất cả các dòng!");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Tùy thuộc vào backend của bạn, có thể bạn cần map qua items để post nhiều lần 
      // hoặc gửi 1 mảng lớn lên api/transactions/create-order
      for (const item of items) {
         await axios.post('http://localhost:5000/api/transactions/import', {
           ...item,
           creator: metaData.creator,
           location: metaData.location
         }, config);
      }
      
      alert("Đã gửi yêu cầu phê duyệt!");
      setItems([{ productId: '', supplierId: '', quantity: '', price: '85000' }]);
      fetchInitialData();
    } catch (error) { 
      alert("Lỗi khi gửi phiếu!"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] p-8 md:p-12 font-sans text-[#3D2B1F]">
      
      {/* ================= THẺ PHIẾU NHẬP KHO CHÍNH ================= */}
      <div className="max-w-5xl mx-auto bg-white p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-[#3D2B1F]">Phiếu Nhập Kho</h1>
            <p className="text-xs italic text-gray-500">Hệ thống quản trị RoastLogic Enterprise</p>
          </div>
          <div className="text-right text-sm space-y-2 text-[#3D2B1F]">
            <div className="flex justify-end items-center gap-2">
              <span className="text-xs">Mã số:</span> 
              <span className="border-b border-dotted border-gray-400 w-32 text-left pb-1 inline-block">{metaData.receiptNo}</span>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-xs">Ngày:</span> 
              <span className="border-b border-dotted border-gray-400 w-32 text-left pb-1 inline-block flex justify-between">
                {metaData.date} <span className="text-gray-400">📅</span>
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin metadata (4 ô chữ) */}
        <div className="grid grid-cols-2 md:gap-x-16 gap-y-6 mb-10 text-[13px]">
          <div className="flex items-end gap-2">
            <span className="uppercase text-gray-500 whitespace-nowrap">Người lập phiếu:</span>
            <input name="creator" value={metaData.creator} onChange={handleMetaChange} className="border-b border-dotted border-gray-400 w-full focus:outline-none bg-transparent pb-1 text-[#3D2B1F]" placeholder="Nhập tên người lập..." />
          </div>
          <div className="flex items-end gap-2">
            <span className="uppercase text-gray-500 whitespace-nowrap">Kho nhận:</span>
            <span className="border-b border-dotted border-gray-400 w-full pb-1 text-[#3D2B1F]">{metaData.warehouse}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="uppercase text-gray-500 whitespace-nowrap">Địa điểm:</span>
            <input name="location" value={metaData.location} onChange={handleMetaChange} className="border-b border-dotted border-gray-400 w-full focus:outline-none bg-transparent pb-1 text-[#3D2B1F]" placeholder="Địa chỉ kho hàng..." />
          </div>
          <div className="flex items-end gap-2">
            <span className="uppercase text-gray-500 whitespace-nowrap">Số chứng từ gốc:</span>
            <input name="sourceDoc" value={metaData.sourceDoc} onChange={handleMetaChange} className="border-b border-dotted border-gray-400 w-full focus:outline-none bg-transparent pb-1 text-[#3D2B1F]" placeholder="..." />
          </div>
        </div>

        {/* Bảng nhập liệu nhiều dòng */}
        <div className="overflow-x-auto">
          <table className="w-full mb-0 border-collapse text-[13px]">
            <thead>
              <tr className="border-y border-[#E5E5E5] uppercase text-[11px] text-gray-600">
                <th className="py-4 font-normal text-center w-12">STT</th>
                <th className="py-4 font-normal text-left w-1/4">Sản phẩm nhập</th>
                <th className="py-4 font-normal text-left w-1/4">Nhà cung cấp</th>
                <th className="py-4 font-normal text-right w-24">Số lượng (kg)</th>
                <th className="py-4 font-normal text-right w-28">Đơn giá</th>
                <th className="py-4 font-normal text-right w-32">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-dotted border-gray-300 hover:bg-gray-50/50">
                  <td className="py-3 text-center text-gray-500">{index + 1}</td>
                  <td className="py-3 pr-4">
                    <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full bg-transparent focus:outline-none appearance-none cursor-pointer">
                      <option value="" disabled>Chọn sản phẩm...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <select value={item.supplierId} onChange={(e) => handleItemChange(index, 'supplierId', e.target.value)} className="w-full bg-transparent focus:outline-none appearance-none cursor-pointer">
                      <option value="" disabled>Chọn NCC...</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.name || s.supplierName}</option>)}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-right bg-transparent focus:outline-none" placeholder="0" />
                  </td>
                  <td className="py-3 text-right">
                    <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-full text-right bg-transparent focus:outline-none" />
                  </td>
                  <td className="py-3 text-right font-medium">
                    {((item.quantity || 0) * (item.price || 0)).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {/* Nút thêm dòng */}
              <tr>
                <td className="py-3 text-center cursor-pointer text-gray-400 hover:text-black font-bold" onClick={addRow}>+</td>
                <td colSpan="5" className="py-3 text-xs italic text-gray-400">Bấm dấu + để thêm dòng mới</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Khối Tổng Cộng */}
        <div className="bg-[#4E392A] text-white flex justify-between items-center px-6 py-4 mt-2">
          <div className="font-bold text-sm tracking-widest uppercase">Tổng cộng</div>
          <div className="text-right">
            <div className="font-bold text-lg">{calculateTotal().toLocaleString('vi-VN')}</div>
            <div className="text-[10px] text-gray-300 uppercase">VNĐ</div>
          </div>
        </div>

        {/* Khu vực Chữ ký */}
        <div className="grid grid-cols-3 gap-4 text-center mt-12 mb-16 text-[12px]">
          <div>
            <p className="font-bold uppercase mb-16">Người lập phiếu</p>
            <p className="italic text-gray-400">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="font-bold uppercase mb-16">Thủ kho</p>
            <p className="italic text-gray-400">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="font-bold uppercase mb-16">Đại diện nhà cung cấp</p>
            <p className="italic text-gray-400">(Ký, họ tên)</p>
          </div>
        </div>

        {/* Nhóm Nút Action */}
        <div className="flex justify-end items-center gap-4 border-t border-gray-100 pt-6">
          <button className="px-8 py-3 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Lưu nháp
          </button>
          <button 
            onClick={handleConfirmInbound} 
            disabled={loading}
            className="px-8 py-3 bg-[#3B82F6] text-white rounded text-sm font-bold uppercase tracking-wide hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu phê duyệt'}
          </button>
        </div>
      </div>

      {/* ================= THẺ LỊCH SỬ ================= */}
      <div className="max-w-5xl mx-auto bg-white p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-lg font-black uppercase text-[#3D2B1F] mb-8 inline-block border-b-2 border-[#3D2B1F] pb-1">
          Lịch sử nhập kho gần đây
        </h2>
        
        <div className="space-y-4">
          {history.length === 0 ? (
             <p className="text-sm italic text-gray-500">Chưa có lịch sử nhập kho nào.</p>
          ) : (
            history.slice(0, 5).map((item, index) => (
              <div key={item._id || index} className="flex flex-wrap md:flex-nowrap items-center justify-between py-3 border-b border-gray-100 text-[13px]">
                <div className="w-full md:w-32 text-gray-500">
                  {new Date(item.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </div>
                <div className="w-full md:w-40 font-medium">
                  {item.referenceNo || 'PNK-20231023-04'}
                </div>
                <div className="w-full md:flex-1 truncate pr-4">
                  {item.supplier?.name || "HTX Nông nghiệp Cao Nguyên"}
                </div>
                <div className="w-full md:w-40">
                  {item.product?.name || "Cà phê Robusta"}
                </div>
                <div className="w-full md:w-24 text-right">
                  {item.quantity?.toLocaleString() || 250} KG
                </div>
                <div className="w-full md:w-28 text-right flex justify-end">
                  {item.status === 'PENDING' ? (
                     <span className="bg-[#FFF4E5] text-[#D97706] text-[10px] font-bold px-3 py-1 rounded-sm">ĐANG CHỜ</span>
                  ) : (
                     <span className="bg-[#E6F4EA] text-[#1E7E34] text-[10px] font-bold px-3 py-1 rounded-sm">ĐÃ NHẬP</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default InboundPage;