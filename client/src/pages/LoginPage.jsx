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

    // Lấy đường dẫn trang trước đó người dùng định truy cập (nếu có)
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gọi API (Lưu ý: Nếu port khác 5000 hãy thêm đầy đủ URL)
            const response = await axios.post('http://localhost:5000/api/auth/login', { 
                email, 
                password 
            });

            // 2. Kiểm tra phản hồi dựa trên authController.js của bạn
            if (response.data && response.data.success) {
                const userData = response.data.data; // Chứa { token, name, role, _id }
                
                // 3. Đưa dữ liệu vào AuthContext (Sử dụng 'token' thay vì 'access_token')
                login(userData);

                // 4. Logic điều hướng sau khi đăng nhập thành công
                const userRole = userData.role;

                if (from !== '/') {
                    navigate(from, { replace: true });
                } else {
                    // Điều hướng dựa trên vai trò thực tế từ Backend trả về
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
            // Lấy message lỗi từ backend (Ví dụ: "Tài khoản không tồn tại")
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
                        <p style={styles.labelTitle}>LỰA CHỌN VAI TRÒ</p>
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
                                    {r === 'admin' ? 'Quản Trị Viên' : r === 'supplier' ? 'Nhà Cung Cấp' : 'Khách Hàng'}
                                </button>
                            ))}
                        </div>

                        <h3 style={styles.formHeader}>Đăng Nhập Hệ Thống</h3>
                        <p style={styles.formSub}>Vui lòng nhập thông tin để quản lý danh mục tài sản của bạn.</p>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputBox}>
                                <label style={styles.inputLabel}>EMAIL ĐĂNG KÝ</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>@</span>
                                    <input 
                                        type="email" 
                                        style={styles.inputField} 
                                        placeholder="ten@estate.supply"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={styles.inputBox}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <label style={styles.inputLabel}>MẬT MÃ BẢO MẬT</label>
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

                            <div style={styles.checkboxWrapper}>
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember" style={styles.checkboxLabel}>Duy trì đăng nhập</label>
                            </div>

                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC THỰC →'}
                            </button>
                        </form>

                        <div style={styles.footerInfo}>
                            <p>GIAO DIỆN CHUỖI CUNG ỨNG MÃ HÓA V4.2</p>
                            <div style={styles.socialIcons}>🛡️ 🔒 🌐</div>
                            <Link to="/register" style={styles.registerLink}>Chưa có tài khoản? Đăng ký ngay</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// CSS-in-JS Styles (Giữ nguyên phong cách của bạn)
const styles = {
    pageContainer: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F4F0',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
    },
    mainCard: {
        width: '1000px',
        height: '650px',
        display: 'flex',
        backgroundColor: '#FFF',
        boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    leftSection: {
        flex: 1,
        backgroundImage: 'url("https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
    },
    leftOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(44, 27, 18, 0.7)', 
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFF',
    },
    brandName: { letterSpacing: '3px', fontWeight: 'bold', margin: 0 },
    brandSub: { fontSize: '13px', opacity: 0.8 },
    heroText: { fontSize: '18px', fontWeight: '600', marginBottom: '10px' },
    heroDivider: { width: '40px', height: '2px', backgroundColor: '#8B5E3C', marginBottom: '15px' },
    heroLink: { fontSize: '14px', letterSpacing: '2px', fontWeight: 'bold' },
    
    rightSection: {
        flex: 1,
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
    },
    formContent: { width: '100%' },
    labelTitle: { fontSize: '10px', fontWeight: 'bold', color: '#A89485', letterSpacing: '1px', marginBottom: '15px' },
    roleSwitcher: {
        display: 'flex',
        backgroundColor: '#F2E8DF',
        padding: '4px',
        borderRadius: '4px',
        marginBottom: '40px',
    },
    roleBtn: {
        flex: 1,
        border: 'none',
        padding: '8px 5px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#5C4033',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: '0.3s',
    },
    formHeader: { fontSize: '20px', color: '#2C1B12', margin: '0 0 10px 0' },
    formSub: { fontSize: '13px', color: '#8E7F77', marginBottom: '30px', lineHeight: '1.5' },
    inputBox: { marginBottom: '20px' },
    inputLabel: { fontSize: '12px', fontWeight: 'bold', color: '#5C4033', marginBottom: '8px', display: 'block' },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#EDE0D4',
        borderRadius: '4px',
        padding: '0 15px',
    },
    inputIcon: { color: '#8E7F77', marginRight: '10px' },
    inputField: {
        flex: 1,
        border: 'none',
        backgroundColor: 'transparent',
        padding: '12px 0',
        outline: 'none',
        color: '#2C1B12',
    },
    forgotLink: { fontSize: '10px', fontWeight: 'bold', color: '#2C1B12', cursor: 'pointer' },
    checkboxWrapper: { display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '8px' },
    checkboxLabel: { fontSize: '12px', color: '#8E7F77' },
    submitBtn: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#3D2B1F',
        color: '#FFF',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        letterSpacing: '1px',
    },
    footerInfo: { marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#A89485' },
    socialIcons: { margin: '10px 0', fontSize: '14px', opacity: 0.6 },
    registerLink: { color: '#3D2B1F', textDecoration: 'none', display: 'block', marginTop: '10px', fontWeight: 'bold', fontSize: '12px' },
    errorAlert: { padding: '10px', backgroundColor: '#fde8e8', color: '#c81e1e', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }
};

export default LoginPage;