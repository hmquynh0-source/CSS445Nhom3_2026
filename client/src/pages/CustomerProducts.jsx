import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, X, Plus, Minus, CheckCircle2 } from 'lucide-react';

const CustomerProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tất Cả Hạt');

    // --- STATE CHO ĐẶT HÀNG ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // 1. Lấy danh sách sản phẩm từ Backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                const rawData = res.data.data || [];
                const cleanData = rawData.map(p => ({
                    ...p,
                    displayPrice: p.salePrice || p.price || 0,
                    displayCategory: p.category?.name || "Arabica Nguyên Chất"
                }));
                setProducts(cleanData);
            } catch (err) {
                console.error("Lỗi lấy sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 2. Mở Modal đặt hàng
    const handleOpenOrder = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setOrderSuccess(false);
    };

    // 3. Hàm XÁC NHẬN ĐẶT HÀNG (Kết nối trực tiếp tới Backend)
    const handleConfirmOrder = async () => {
        try {
            if (!selectedProduct) return;

            const orderData = {
                // Khớp với Model: orderCode dạng #RL-xxxx
                orderCode: `#RL-${Math.floor(1000 + Math.random() * 9000)}`,
                // Khớp với Model: Gửi ID sản phẩm
                product: selectedProduct._id,
                // Khớp với Model: Số lượng và tổng tiền
                quantity: quantity,
                totalPrice: selectedProduct.displayPrice * quantity,
                // Trạng thái mặc định để Admin thấy ở trang Duyệt/Xuất kho
                status: 'PROCESSING',
                customerName: "Khách hàng vãng lai"
            };

            const response = await axios.post('http://localhost:5000/api/orders', orderData);

            if (response.data.success) {
                setOrderSuccess(true);
                // Sau 2.5 giây đóng modal để khách tiếp tục mua sắm
                setTimeout(() => {
                    setSelectedProduct(null);
                }, 2500);
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error.response?.data || error.message);
            alert("Lỗi: " + (error.response?.data?.message || "Không thể gửi đơn hàng. Vui lòng kiểm tra Server!"));
        }
    };

    const filteredProducts = products.filter(p =>
        activeTab === 'Tất Cả Hạt' || p.displayCategory === activeTab
    );

    if (loading) return <div className="p-10 text-center font-black text-[#3D2B1F] animate-pulse">ĐANG TẢI DỮ LIỆU...</div>;

    return (
        <div className="relative space-y-10 p-2 bg-[#FDF8F3] min-h-screen">
            {/* Tabs chọn loại hạt */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {['Tất Cả Hạt', 'Arabica Nguyên Chất', 'Robusta Đậm Đà'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab 
                            ? 'bg-[#3D2B1F] text-white shadow-xl scale-105' 
                            : 'bg-white text-[#A89485] border border-[#EFE3D5] hover:border-[#3D2B1F]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid danh sách sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-[45px] p-6 border border-[#EFE3D5] shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="relative aspect-square rounded-[35px] overflow-hidden mb-8 bg-[#FDF8F3]">
                            <img 
                                src={product.image || 'https://via.placeholder.com/300'} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <p className="text-[10px] font-bold text-[#A89485] uppercase tracking-widest">{product.displayCategory}</p>
                            <h3 className="text-2xl font-black text-[#3D2B1F] leading-tight">{product.name}</h3>
                            
                            <div className="flex justify-between items-end pt-6 border-t border-[#FDF8F3] mt-auto">
                                <div>
                                    <p className="text-[10px] font-black text-[#A89485] uppercase">Giá mỗi gói</p>
                                    <p className="text-3xl font-black text-[#3D2B1F]">
                                        {product.displayPrice?.toLocaleString()} 
                                        <span className="text-sm font-bold ml-1">VND</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleOpenOrder(product)}
                                    className="bg-[#3D2B1F] p-5 rounded-[22px] text-white hover:bg-orange-600 transition-all shadow-lg active:scale-90"
                                >
                                    <ShoppingCart size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL ĐẶT HÀNG --- */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl overflow-hidden relative">
                        
                        {/* Nút Đóng */}
                        <button 
                            onClick={() => setSelectedProduct(null)} 
                            className="absolute top-8 right-8 z-10 p-2 bg-[#FDF8F3] rounded-full text-[#3D2B1F] hover:bg-red-50 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {!orderSuccess ? (
                            <div className="p-10 space-y-8">
                                <div className="flex gap-6 items-center">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-inner bg-[#FDF8F3]">
                                        <img src={selectedProduct.image} className="w-full h-full object-cover" alt="Selected" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Xác nhận đơn hàng</span>
                                        <h2 className="text-3xl font-black text-[#3D2B1F] leading-tight">{selectedProduct.name}</h2>
                                    </div>
                                </div>

                                <div className="bg-[#FDF8F3] p-8 rounded-[35px] space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-[#A89485]">Số lượng đặt</span>
                                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-[#EFE3D5]">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                                className="p-2 hover:text-orange-500 transition-colors"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="w-8 text-center font-black text-xl">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(quantity + 1)} 
                                                className="p-2 hover:text-orange-500 transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-[#EFE3D5] pt-6">
                                        <span className="text-lg font-black text-[#3D2B1F]">Tổng tiền:</span>
                                        <span className="text-3xl font-black text-orange-600">
                                            {(selectedProduct.displayPrice * quantity).toLocaleString()} 
                                            <span className="text-sm ml-1">đ</span>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmOrder}
                                    className="w-full bg-[#3D2B1F] py-6 rounded-[25px] text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                                >
                                    Xác nhận và Gửi đơn
                                </button>
                            </div>
                        ) : (
                            /* Giao diện thành công */
                            <div className="p-20 text-center space-y-6 animate-in zoom-in duration-500">
                                <div className="flex justify-center text-green-500">
                                    <CheckCircle2 size={100} strokeWidth={1} className="animate-bounce" />
                                </div>
                                <h2 className="text-3xl font-black text-[#3D2B1F]">ĐẶT HÀNG XONG!</h2>
                                <p className="text-[#A89485] font-medium leading-relaxed">
                                    Đơn hàng của bạn đã được chuyển đến hệ thống.<br/> 
                                    Vui lòng đợi Admin duyệt để xuất kho.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProducts;