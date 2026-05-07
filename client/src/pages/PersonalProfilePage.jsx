import React from 'react';
import { Camera, User, Mail, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PersonalProfilePage = () => {
    const { userProfile, userRole } = useAuth();
    const isSupplier = userRole === 'supplier';

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-black uppercase mb-8 text-[#3D2B1F]">
                {isSupplier ? 'Thông tin đối tác' : 'Hồ sơ cá nhân'}
            </h2>
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#EAE1D6] flex gap-10">
                {/* Avatar */}
                <div className="w-1/3 flex flex-col items-center border-r border-[#EAE1D6] pr-10">
                    <div className="w-32 h-32 bg-[#F9F6F2] rounded-full flex items-center justify-center relative border-2 border-[#EAE1D6]">
                        <span className="text-4xl font-bold">{userProfile?.name?.charAt(0)}</span>
                        <button className="absolute bottom-0 right-0 bg-[#3D2B1F] p-2 rounded-full text-white"><Camera size={16}/></button>
                    </div>
                    <p className="mt-4 font-bold text-[#A89485] uppercase text-[10px]">Mã định danh: {isSupplier ? 'SUP-2026' : 'CUS-2026'}</p>
                </div>
                {/* Form */}
                <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#A89485]">Họ và tên</label>
                        <input type="text" defaultValue={userProfile?.name} className="w-full bg-[#F9F6F2] p-4 rounded-2xl outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#A89485]">Email</label>
                        <input type="email" defaultValue={userProfile?.email} className="w-full bg-[#F9F6F2] p-4 rounded-2xl outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#A89485]">Số điện thoại</label>
                        <input type="text" placeholder="Chưa cập nhật" className="w-full bg-[#F9F6F2] p-4 rounded-2xl outline-none" />
                    </div>
                    <button className="col-span-2 mt-4 bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

export default PersonalProfilePage;