import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, X, Plus, Minus, CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const CustomerProducts = () => {
    // 1. Lấy thông tin từ AuthContext (Hệ thống đăng nhập của bạn)
    const { userId, userName } = useAuth(); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tất Cả Hạt');

    // State cho Modal đặt hàng
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState(''); 
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
    const [selectedCommuneCode, setSelectedCommuneCode] = useState('');
    const [hamlet, setHamlet] = useState(''); // thôn/tổ/ấp
    const [houseNumber, setHouseNumber] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Lấy danh sách sản phẩm từ Backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                const rawData = res.data.data || [];
                const cleanData = rawData.map(p => ({
                    ...p,
                    displayPrice: p.salePrice || p.price || 0,
                    displayCategory: p.category?.name || "Hạt Cà Phê"
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

    // Lấy dữ liệu tỉnh/huyện/xã từ API công khai (depth=3 trả về wards)
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get('/api/locations/provinces');
                if (res.data && res.data.success) {
                    setProvinces(res.data.data || []);
                    return;
                }
                // Nếu proxy trả về không thành công, thử lấy trực tiếp từ public API
                const fallback = await axios.get('https://provinces.open-api.vn/api/?depth=3');
                setProvinces(fallback.data || []);
            } catch (err) {
                console.error('Lỗi lấy danh sách tỉnh/huyện (proxy failed), thử fallback:', err);
                try {
const fallback = await axios.get('https://provinces.open-api.vn/api/?depth=3');
                    setProvinces(fallback.data || []);
                } catch (err2) {
                    console.error('Lỗi lấy danh sách tỉnh/huyện (fallback cũng lỗi):', err2);
                }
            }
        };
        fetchLocations();
    }, []);

    // 3. Xử lý đặt hàng (Gửi đúng userId cho Backend)
    const handleConfirmOrder = async () => {
        // Lấy ID dự phòng từ LocalStorage nếu Context bị reset
        const finalUserId = userId || localStorage.getItem('userId');
        const finalUserName = userName || localStorage.getItem('userName');

        if (!finalUserId) {
            alert("Vui lòng đăng nhập lại để hệ thống nhận diện tài khoản!");
            return;
        }

        // Validate structured address (prefer structured selects but fallback to free text)
        let finalAddressStr = address.trim();
        const provinceObj = provinces.find(p => String(p.code) === String(selectedProvinceCode));
        const districtObj = (districts || []).find(d => String(d.code) === String(selectedDistrictCode));
        const communeObj = (communes || []).find(c => String(c.code) === String(selectedCommuneCode));

        if (!finalAddressStr) {
            if (!provinceObj || !districtObj || !communeObj || !houseNumber.trim()) {
                alert("Vui lòng cung cấp đầy đủ địa chỉ: tỉnh, huyện, xã và số nhà!");
                return;
            }

            finalAddressStr = `${houseNumber}, ${hamlet ? hamlet + ', ' : ''}${communeObj.name}, ${districtObj.name}, ${provinceObj.name}`;
        }

        setIsSubmitting(true);
        try {
            // Cấu trúc dữ liệu gửi lên (Khớp với req.body của orderRoutes.js bạn đã gửi)
            const orderData = {
                userId: finalUserId,       // KHÓA CHÍNH: Phải là userId
                product: selectedProduct._id,
                quantity: Number(quantity),
                totalPrice: Number(selectedProduct.displayPrice * quantity),
                customerName: finalUserName,
                address: finalAddressStr,
                addressComponents: {
                    province: provinceObj?.name || null,
                    district: districtObj?.name || null,
                    commune: communeObj?.name || null,
                    hamlet: hamlet || null,
                    houseNumber: houseNumber || null
                }
            };

            console.log("🚀 Đang gửi đơn hàng:", orderData);

            const response = await axios.post('http://localhost:5000/api/orders', orderData);

            if (response.data.success) {
                setOrderSuccess(true);
                // Reset form sau 3 giây
                setTimeout(() => {
                    setSelectedProduct(null);
                    setOrderSuccess(false);
                    setAddress('');
                }, 3000);
            }
} catch (error) {
            console.error("❌ Lỗi Backend trả về:", error.response?.data);
            alert("Đặt hàng thất bại: " + (error.response?.data?.message || "Lỗi kết nối"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#FDF8F3]">
            <Loader2 className="animate-spin text-[#3D2B1F]" size={48} />
            <p className="mt-4 font-black text-[#3D2B1F]">ĐANG TẢI DỮ LIỆU...</p>
        </div>
    );

    return (
        <div className="p-6 bg-[#FDF8F3] min-h-screen">
            {/* Thanh lọc sản phẩm */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                {['Tất Cả Hạt', 'Arabica Nguyên Chất', 'Robusta Đậm Đà'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-full text-[12px] font-black uppercase transition-all ${
                            activeTab === tab 
                            ? 'bg-[#3D2B1F] text-white shadow-lg' 
                            : 'bg-white text-[#A89485] border border-[#EFE3D5] hover:border-[#3D2B1F]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid hiển thị sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.filter(p => activeTab === 'Tất Cả Hạt' || p.displayCategory === activeTab).map((product) => (
                    <div key={product._id} className="bg-white rounded-[40px] p-5 border border-[#EFE3D5] hover:shadow-xl transition-all group">
                        <div className="aspect-square rounded-[30px] overflow-hidden mb-6 bg-[#FDF8F3]">
                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt={product.name} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-[#A89485] uppercase">{product.displayCategory}</p>
                            <h3 className="text-xl font-black text-[#3D2B1F]">{product.name}</h3>
                            <div className="flex justify-between items-center pt-4 border-t border-[#FDF8F3]">
                                <p className="text-2xl font-black text-[#3D2B1F]">{product.displayPrice?.toLocaleString()} đ</p>
                                <button 
                                    onClick={() => { setSelectedProduct(product); setQuantity(1); setAddress(''); }}
                                    className="bg-[#3D2B1F] p-4 rounded-2xl text-white hover:bg-orange-700"
                                >
<ShoppingCart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal đặt hàng */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-[#FDF8F3] rounded-full">
                            <X size={20} />
                        </button>

                        {!orderSuccess ? (
                            <div className="p-8 space-y-5">
                                <h2 className="text-2xl font-black text-[#3D2B1F]">Xác nhận đơn hàng</h2>
                                
                                <div className="flex items-center gap-4 bg-[#FDF8F3] p-4 rounded-3xl">
                                    <img src={selectedProduct.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                                    <div>
                                        <p className="font-black text-[#3D2B1F]">{selectedProduct.name}</p>
                                        <p className="text-sm text-orange-600 font-bold">{selectedProduct.displayPrice.toLocaleString()} đ</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#A89485] uppercase flex items-center gap-2 px-1">
                                            <MapPin size={14} /> Địa chỉ giao hàng
                                        </label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <select
                                                    value={selectedProvinceCode}
                                                    onChange={(e) => {
                                                        const code = e.target.value;
                                                        setSelectedProvinceCode(code);
                                                        setSelectedDistrictCode('');
                                                        setSelectedCommuneCode('');
                                                        setHamlet('');
                                                        setHouseNumber('');
                                                        const p = provinces.find(p => String(p.code) === String(code));
setDistricts(p?.districts || []);
                                                        setCommunes([]);
                                                    }}
                                                    className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-3 text-sm outline-none"
                                                >
                                                    <option value="">Chọn tỉnh / thành</option>
                                                    {provinces.map(p => (
                                                        <option key={p.code} value={p.code}>{p.name}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={selectedDistrictCode}
                                                    onChange={(e) => {
                                                        const code = e.target.value;
                                                        setSelectedDistrictCode(code);
                                                        setSelectedCommuneCode('');
                                                        setHamlet('');
                                                        const d = (districts || []).find(d => String(d.code) === String(code));
                                                        setCommunes(d?.wards || d?.communes || []);
                                                    }}
                                                    className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-3 text-sm outline-none"
                                                >
                                                    <option value="">Chọn huyện / quận</option>
                                                    {districts.map(d => (
                                                        <option key={d.code} value={d.code}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <select
                                                    value={selectedCommuneCode}
                                                    onChange={(e) => setSelectedCommuneCode(e.target.value)}
                                                    className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-3 text-sm outline-none"
                                                >
                                                    <option value="">Chọn xã / phường</option>
                                                    {communes.map(c => (
<option key={c.code} value={c.code}>{c.name}</option>
                                                    ))}
                                                </select>

                                                <input
                                                    value={hamlet}
                                                    onChange={(e) => setHamlet(e.target.value)}
                                                    placeholder="Thôn / Tổ / Ấp (tùy chọn)"
                                                    className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-3 text-sm outline-none"
                                                />
                                            </div>

                                            <input
                                                value={houseNumber}
                                                onChange={(e) => setHouseNumber(e.target.value)}
                                                placeholder="Số nhà, tên đường (bắt buộc nếu không nhập địa chỉ tự do)"
                                                className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-3 text-sm outline-none"
                                            />

                                            <textarea
                                                className="w-full bg-[#FDF8F3] border border-[#EFE3D5] rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#3D2B1F]"
                                                placeholder="(Tùy chọn) Ghi chú địa chỉ đầy đủ hoặc hướng dẫn giao hàng..."
                                                rows="2"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                </div>

                                <div className="flex justify-between items-center bg-[#FDF8F3] p-4 rounded-3xl">
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-[#EFE3D5]">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                                        <span className="font-black w-6 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-[#A89485]">TỔNG CỘNG</p>
                                        <p className="text-xl font-black text-orange-600">{(selectedProduct.displayPrice * quantity).toLocaleString()} đ</p>
</div>
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    onClick={handleConfirmOrder}
                                    className="w-full bg-[#3D2B1F] py-4 rounded-2xl text-white font-black uppercase tracking-widest flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "GỬI ĐƠN HÀNG NGAY"}
                                </button>
                            </div>
                        ) : (
                            <div className="p-16 text-center space-y-4">
                                <CheckCircle2 size={80} className="mx-auto text-green-500 animate-bounce" />
                                <h2 className="text-2xl font-black text-[#3D2B1F]">THÀNH CÔNG!</h2>
                                <p className="text-[#A89485] text-sm">Đơn hàng của bạn đã được tiếp nhận.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProducts;
