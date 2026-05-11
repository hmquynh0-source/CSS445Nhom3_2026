import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Filter, Search, CreditCard, ChevronRight } from 'lucide-react';

const CustomerLedger = () => {
    const transactions = [
        { id: 'RL-2034', date: '12/05/2026', type: 'Thanh toán đơn', amount: -12450000, status: 'Thành công' },
        { id: 'RL-DEPOSIT', date: '10/05/2026', type: 'Nạp tiền vào ví', amount: 20000000, status: 'Thành công' },
        { id: 'RL-2012', date: '08/05/2026', type: 'Thanh toán đơn', amount: -4500000, status: 'Thành công' },
        { id: 'RL-REFUND', date: '05/05/2026', type: 'Hoàn trả hàng', amount: 1200000, status: 'Đang xử lý' },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Tài chính */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#3D2B1F] p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between h-56 relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Số dư ví RoastLogic</p>
                        <h2 className="text-4xl font-black tracking-tighter">15.240.000 <span className="text-sm font-bold opacity-50">VND</span></h2>
                    </div>
                    <button className="bg-white/20 backdrop-blur-md w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all z-10">
                        Nạp thêm tiền
                    </button>
                    <Wallet size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                </div>

                <div className="bg-white border border-[#EFE3D5] p-8 rounded-[40px] shadow-sm flex flex-col justify-between h-56">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest">Hạn mức công nợ</p>
                        <h2 className="text-4xl font-black text-[#3D2B1F] tracking-tighter">50.000.000 <span className="text-xs opacity-50">VND</span></h2>
                        <div className="w-full bg-[#FDF8F3] h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-[#3D2B1F] h-full" style={{ width: '30%' }}></div>
                        </div>
                        <p className="text-[10px] text-[#A89485] font-bold mt-2">Đã sử dụng 15.000.000đ (30%)</p>
                    </div>
                </div>

                <div className="bg-[#FDF8F3] p-8 rounded-[40px] border border-[#EFE3D5] shadow-sm flex flex-col justify-center items-center text-center space-y-3">
                    <div className="p-4 bg-white rounded-full text-[#3D2B1F] shadow-sm">
                        <CreditCard size={32} />
                    </div>
                    <p className="text-sm font-black text-[#3D2B1F]">Thẻ hội viên hạng Gold</p>
                    <p className="text-[10px] text-[#A89485] font-bold uppercase tracking-widest">Giảm 2% phí vận chuyển</p>
                </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                    <h3 className="text-2xl font-black text-[#3D2B1F] tracking-tight">Lịch sử tài chính</h3>
                    <button className="text-[#A89485] hover:text-[#3D2B1F] text-xs font-black uppercase tracking-widest flex items-center gap-1">
                        Xuất báo cáo <ChevronRight size={16} />
                    </button>
                </div>

                <div className="bg-white rounded-[40px] border border-[#EFE3D5] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#FDF8F3] border-b border-[#EFE3D5]">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase text-[#A89485]">Ngày</th>
                                <th className="p-6 text-[10px] font-black uppercase text-[#A89485]">Mã GD / Nội dung</th>
                                <th className="p-6 text-[10px] font-black uppercase text-[#A89485] text-right">Số tiền (VND)</th>
                                <th className="p-6 text-[10px] font-black uppercase text-[#A89485] text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FDF8F3]">
                            {transactions.map((t, idx) => (
                                <tr key={idx} className="hover:bg-[#FDF8F3]/30 transition-colors">
                                    <td className="p-6 text-sm font-medium text-[#A89485]">{t.date}</td>
                                    <td className="p-6">
                                        <p className="text-sm font-black text-[#3D2B1F]">{t.id}</p>
                                        <p className="text-[10px] font-bold text-[#A89485] uppercase mt-0.5">{t.type}</p>
                                    </td>
                                    <td className={`p-6 text-right font-black text-lg ${t.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${t.status === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {t.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerLedger;