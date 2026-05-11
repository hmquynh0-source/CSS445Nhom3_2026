import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    // Thông tin đăng nhập mẫu cho từng vai trò
    const emailPresets = {
        admin: 'admin@example.com',
        supplier: 'supplier@example.com',
        customer: 'customer@example.com'
    };

    const [email, setEmail] = useState(emailPresets.admin);
    const [password, setPassword] = useState('password123');
    const [role, setRole] = useState('admin'); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gọi API Login
            const response = await axios.post('http://localhost:5000/api/auth/login', { 
                email, 
                password 
            });

            // 2. Kiểm tra phản hồi
            if (response.data && response.data.success) {
                // Lấy data chứa { token, name, role, _id }
                const userData = response.data.data; 
                
                // DEBUG: Kiểm tra xem server có trả về _id không
                console.log("Login Success Data:", userData);

                // 3. Đưa dữ liệu vào AuthContext để lưu LocalStorage
                login(userData);

                // 4. Điều hướng dựa trên vai trò thực tế
                const userRole = userData.role;

                if (from !== '/') {
                    navigate(from, { replace: true });
                } else {
                    if (userRole === 'admin' || userRole === 'manager') {
                        navigate('/admin/home', { replace: true });
                    } else if (userRole === 'supplier') {
                        navigate('/supplier/dashboard', { replace: true });
                    } else if (userRole === 'customer') {
                        navigate('/customer/dashboard', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.mainCard}>
                {/* CỘT TRÁI - BRANDING */}
                <div style={styles.leftSection}>
                    <div style={styles.leftOverlay}>
                        <div style={styles.brandBox}>
                            <h2 style={styles.brandName}>THE ESTATE</h2>
                            <p style={styles.brandSub}>Hệ Thống Quản Trị Logistics</p>
                        </div>
                        
                        <div style={styles.bottomHero}>
                            <p style={styles.heroText}>Nâng tầm giá trị chuỗi cung ứng cà phê.</p>
                            <div style={styles.heroDivider}></div>
                            <p style={styles.heroLink}>TRUY CẬP NỘI BỘ</p>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - FORM ĐĂNG NHẬP */}
                <div style={styles.rightSection}>
                    <div style={styles.formContent}>
                        <p style={styles.labelTitle}>LỰA CHỌN VAI TRÒ NHANH</p>
                        <div style={styles.roleSwitcher}>
                            {['admin', 'supplier', 'customer'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => {
                                        setRole(r);
                                        setEmail(emailPresets[r]);
                                        setPassword('password123');
                                    }}
                                    style={{
                                        ...styles.roleBtn,
                                        backgroundColor: role === r ? '#FFF' : 'transparent',
                                        boxShadow: role === r ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    {r === 'admin' ? 'Quản Trị' : r === 'supplier' ? 'Nhà Cung Cấp' : 'Khách Hàng'}
                                </button>
                            ))}
                        </div>

                        <h3 style={styles.formHeader}>Đăng Nhập</h3>
                        <p style={styles.formSub}>Nhập tài khoản để tiếp tục quản lý đơn hàng.</p>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputBox}>
                                <label style={styles.inputLabel}>EMAIL</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>@</span>
                                    <input 
                                        type="email" 
                                        style={styles.inputField} 
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={styles.inputBox}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <label style={styles.inputLabel}>MẬT KHẨU</label>
                                    <Link to="/forgot-password" style={styles.forgotLink}>QUÊN?</Link>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>🔒</span>
                                    <input 
                                        type="password" 
                                        style={styles.inputField} 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP →'}
                            </button>
                        </form>

                        <div style={styles.footerInfo}>
                            <p>SECURITY VERSION 4.2</p>
                            <Link to="/register" style={styles.registerLink}>Chưa có tài khoản? Đăng ký ngay</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        height: '100vh', width: '100vw', display: 'flex',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F4F0',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    mainCard: {
        width: '1000px', height: '600px', display: 'flex',
        backgroundColor: '#FFF', boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
        borderRadius: '12px', overflow: 'hidden',
    },
    leftSection: {
        flex: 1, backgroundImage: 'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
    },
    leftOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(44, 27, 18, 0.75)', padding: '50px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#FFF',
    },
    brandName: { letterSpacing: '4px', fontWeight: 'bold', margin: 0 },
    brandSub: { fontSize: '12px', opacity: 0.8 },
    heroText: { fontSize: '20px', fontWeight: '600', marginBottom: '10px' },
    heroDivider: { width: '50px', height: '3px', backgroundColor: '#8B5E3C', marginBottom: '15px' },
    heroLink: { fontSize: '13px', letterSpacing: '2px', fontWeight: 'bold', opacity: 0.9 },
    rightSection: { flex: 1, padding: '60px', display: 'flex', alignItems: 'center' },
    formContent: { width: '100%' },
    labelTitle: { fontSize: '10px', fontWeight: 'bold', color: '#A89485', letterSpacing: '1px', marginBottom: '15px' },
    roleSwitcher: {
        display: 'flex', backgroundColor: '#F2E8DF', padding: '5px', borderRadius: '8px', marginBottom: '35px',
    },
    roleBtn: {
        flex: 1, border: 'none', padding: '10px 5px', fontSize: '11px', fontWeight: 'bold',
        color: '#5C4033', borderRadius: '6px', cursor: 'pointer', transition: '0.3s',
    },
    formHeader: { fontSize: '24px', color: '#2C1B12', margin: '0 0 8px 0', fontWeight: '800' },
    formSub: { fontSize: '14px', color: '#8E7F77', marginBottom: '30px' },
    inputBox: { marginBottom: '20px' },
    inputLabel: { fontSize: '11px', fontWeight: '800', color: '#5C4033', marginBottom: '8px', display: 'block' },
    inputWrapper: {
        display: 'flex', alignItems: 'center', backgroundColor: '#F8F1EA', borderRadius: '8px', padding: '0 15px',
    },
    inputIcon: { color: '#A89485', marginRight: '10px' },
    inputField: {
        flex: 1, border: 'none', backgroundColor: 'transparent', padding: '14px 0', outline: 'none', color: '#2C1B12',
    },
    forgotLink: { fontSize: '10px', fontWeight: 'bold', color: '#3D2B1F', textDecoration: 'none' },
    submitBtn: {
        width: '100%', padding: '16px', backgroundColor: '#3D2B1F', color: '#FFF',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
        letterSpacing: '1px', marginTop: '10px', transition: 'all 0.3s hover:bg-black',
    },
    footerInfo: { marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#A89485' },
    registerLink: { color: '#3D2B1F', textDecoration: 'none', display: 'block', marginTop: '12px', fontWeight: 'bold' },
    errorAlert: { 
        padding: '12px', backgroundColor: '#FFF5F5', color: '#E53E3E', 
        borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid #FED7D7' 
    }
};

export default LoginPage;