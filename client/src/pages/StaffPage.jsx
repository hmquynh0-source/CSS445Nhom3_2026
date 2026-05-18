import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaUserCheck, FaUserClock, FaUserTimes, FaUserPlus, FaFilter, FaTimes, FaSave } from 'react-icons/fa';

// Cấu hình đường dẫn API chuẩn đến Backend
const API_STAFF = 'http://localhost:5000/api/staff'; 

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States phục vụ bộ lọc nâng cao
  const [filterRole, setFilterRole] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // State lưu trữ dữ liệu 4 thẻ KPI đầu trang
  const [kpi, setKpi] = useState({ total: 0, active: 0, pending: 0, locked: 0 });

  // --- STATES QUẢN LÝ ĐÓNG/MỞ VÀ DỮ LIỆU FORM (MODAL) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null); // Lưu _id của MongoDB khi sửa
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Warehouse Manager',
    department: 'Vận hành',
    status: 'ACTIVE'
  });

  // 1. Hàm gọi API lấy danh sách nhân sự thực tế từ MongoDB
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(API_STAFF, { headers });
      const data = res.data?.data || [];
      
      setStaffList(data);
      setFilteredStaff(data);
      calculateKPI(data);

    } catch (error) {
      console.error("🚨 Thất bại khi kết nối API Backend. Đang dùng dữ liệu mẫu dự phòng:", error);
      // Dữ liệu fallback để test giao diện nếu backend chưa khởi động kịp
      const mockData = [
        { _id: 'mock1', name: 'Nguyễn Thu Thủy', email: 'thuy.nguyen@roastlogic.com', role: 'Warehouse Manager', department: 'Vận hành', joinDate: '12/05/2022', status: 'ACTIVE' },
        { _id: 'mock2', name: 'Trần Minh Quân', email: 'quan.tran@roastlogic.com', role: 'Logistics Coordinator', department: 'Chuỗi cung ứng', joinDate: '28/08/2023', status: 'PENDING' },
        { _id: 'mock3', name: 'Lê Hoàng Nam', email: 'nam.le@roastlogic.com', role: 'QC Inspector', department: 'Kiểm soát chất lượng', joinDate: '15/01/2024', status: 'LOCKED' }
      ];
      setStaffList(mockData);
      setFilteredStaff(mockData);
      calculateKPI(mockData);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm tính toán tự động số liệu KPI hiển thị real-time
  const calculateKPI = (data) => {
    const total = data.length;
    const active = data.filter(s => s.status === 'ACTIVE').length;
    const pending = data.filter(s => s.status === 'PENDING').length;
    const locked = data.filter(s => s.status === 'LOCKED').length;
    setKpi({ total, active, pending, locked });
  };

  // Chạy nạp dữ liệu ngay khi mở trang
  useEffect(() => {
    fetchStaffData();
  }, []);

  // Xử lý bộ lọc đa điều kiện tự động trigger khi state thay đổi
  useEffect(() => {
    let result = [...staffList];
    if (filterRole !== 'all') result = result.filter(s => s.role === filterRole);
    if (filterDept !== 'all') result = result.filter(s => s.department === filterDept);
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus);
    setFilteredStaff(result);
  }, [filterRole, filterDept, filterStatus, staffList]);

  // --- HÀM XỬ LÝ SỰ KIỆN KHỞI CHẠY MODAL THÊM MỚI ---
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentStaffId(null);
    setFormData({
      name: '',
      email: '',
      role: 'Warehouse Manager',
      department: 'Vận hành',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  // --- HÀM XỬ LÝ SỰ KIỆN KHỞI CHẠY MODAL CẬP NHẬT (SỬA) ---
  const handleOpenEditModal = (staff) => {
    setIsEditing(true);
    setCurrentStaffId(staff._id); // Gắn _id MongoDB để tí xử lý PUT
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      status: staff.status
    });
    setIsModalOpen(true);
  };

  // --- HÀM SUBMIT LƯU DỮ LIỆU ĐỒNG BỘ ĐẾN CƠ SỞ DỮ LIỆU THẬT ---
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (isEditing) {
        // LUỒNG CẬP NHẬT (SỬA VÀO DATABASE)
        const res = await axios.put(`${API_STAFF}/${currentStaffId}`, formData, { headers });
        
        // Cập nhật mượt mà State tại Frontend dựa trên dữ liệu thật vừa phản hồi
        const updatedList = staffList.map(item => 
          item._id === currentStaffId ? { ...item, ...formData } : item
        );
        setStaffList(updatedList);
        calculateKPI(updatedList);
      } else {
        // LUỒNG THÊM MỚI (LƯU VÀO DATABASE)
        const res = await axios.post(API_STAFF, formData, { headers });
        
        // Lấy bản ghi thực tế chứa _id sinh ra bởi MongoDB mang về mảng hiển thị
        const savedStaff = res.data?.data || { 
          ...formData, 
          _id: Date.now().toString(), 
          joinDate: new Date().toLocaleDateString('vi-VN') 
        };

        const updatedList = [savedStaff, ...staffList];
        setStaffList(updatedList);
        calculateKPI(updatedList);
      }
      setIsModalOpen(false); // Đóng form nhập liệu thành công
    } catch (err) {
      console.error("🚨 Gặp lỗi khi tiến hành ghi nhận vào DB:", err);
      alert(err.response?.data?.message || "Không thể kết nối đến máy chủ Backend để lưu trữ!");
    }
  };

  // Hàm render nhãn trạng thái đồng bộ màu hệ thống
  const renderStatusBadge = (status) => {
    let bg = '#EFEFEF', color = '#555', text = status;
    if (status === 'ACTIVE') { bg = '#EBF9EB'; color = '#4A6741'; text = 'HOẠT ĐỘNG'; }
    if (status === 'PENDING') { bg = '#FFF5E6'; color = '#B87A1D'; text = 'CHỜ DUYỆT / NGHỈ'; }
    if (status === 'LOCKED') { bg = '#FFEBEB'; color = '#A64444'; text = 'BỊ KHÓA'; }
    return <span style={{ ...styles.badge, backgroundColor: bg, color: color }}>{text}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: 'sans-serif' }}>
      
      {/* Khối Header Trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={styles.mainTitle}>Quản lý Tài khoản Nhân sự</h1>
          <p style={styles.description}>
            Điều hành đội ngũ vận hành và logistics của RoastLogic. Đảm bảo phân quyền chính xác cho các bộ phận QC, Kho vận và Điều phối.
          </p>
        </div>
        <button style={styles.btnAddStaff} onClick={handleOpenAddModal}>
          <FaUserPlus style={{ marginRight: '8px' }} /> Thêm nhân sự mới
        </button>
      </div>

      {/* Khối Thẻ KPI Số Liệu Thực Tế */}
      <section style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <KPICard title="TỔNG SỐ NHÂN VIÊN" value={kpi.total} icon={<FaUsers color="#3D2B1F" />} />
        <KPICard title="ĐANG HOẠT ĐỘNG" value={kpi.active} icon={<FaUserCheck color="#4A6741" />} isGreen />
        <KPICard title="CHỜ PHÊ DUYỆT" value={kpi.pending} icon={<FaUserClock color="#B87A1D" />} />
        <KPICard title="TÀI KHOẢN BỊ KHÓA" value={kpi.locked} icon={<FaUserTimes color="#A64444" />} isRed />
      </section>

      {/* Khối Danh Sách và Bảng Bộ Lọc */}
      <div style={styles.tableContainer}>
        {/* Thanh công cụ lọc nâng cao */}
        <div style={styles.filterBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={styles.filterLabel}><FaFilter /> BỘ LỌC NÂNG CAO:</span>
            <select style={styles.select} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">Tất cả Vai trò</option>
              <option value="Warehouse Manager">Warehouse Manager</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="QC Inspector">QC Inspector</option>
              <option value="Admin">Admin</option>
            </select>
            <select style={styles.select} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="all">Tất cả Bộ phận</option>
              <option value="Vận hành">Vận hành</option>
              <option value="Chuỗi cung ứng">Chuỗi cung ứng</option>
              <option value="Kiểm soát chất lượng">Kiểm soát chất lượng</option>
              <option value="Tổng bộ">Tổng bộ</option>
            </select>
            <select style={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Mọi Trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="PENDING">Chờ phê duyệt / Nghỉ</option>
              <option value="LOCKED">Bị khóa</option>
            </select>
          </div>
          <span style={styles.resultsCount}>HIỂN THỊ {filteredStaff.length} KẾT QUẢ</span>
        </div>

        {/* Khối kết xuất dữ liệu bảng */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8D6D4D' }}>Đang tải dữ liệu nhân sự thực tế...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, paddingLeft: '24px' }}>HỌ VÀ TÊN</th>
                <th style={styles.th}>VAI TRÒ</th>
                <th style={styles.th}>BỘ PHẬN</th>
                <th style={styles.th}>NGÀY GIA NHẬP</th>
                <th style={styles.th}>TRẠNG THÁI</th>
                <th style={{ ...styles.th, paddingRight: '24px', textAlign: 'center' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff._id} style={styles.tbodyRow}>
                  <td style={{ ...styles.td, paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={styles.avatarPlaceholder}>{staff.name ? staff.name.charAt(0) : 'U'}</div>
                      <div>
                        <div style={styles.staffName}>{staff.name}</div>
                        <div style={styles.staffEmail}>{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#3D2B1F' }}>{staff.role}</td>
                  <td style={styles.td}>{staff.department}</td>
                  <td style={styles.td}>{staff.joinDate}</td>
                  <td style={styles.td}>{renderStatusBadge(staff.status)}</td>
                  <td style={{ ...styles.td, paddingRight: '24px', textAlign: 'center' }}>
                    <button style={styles.btnAction} onClick={() => handleOpenEditModal(staff)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL POPUP CỬA SỔ NHẬP LIỆU THÊM MỚI / SỬA TÀI KHOẢN */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#3D2B1F', fontSize: '20px' }}>
                {isEditing ? 'Cập Nhật Tài Khoản Nhân Sự' : 'Thêm Nhân Sự Mới'}
              </h2>
              <button style={styles.btnCloseModal} onClick={() => setIsModalOpen(false)}>
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Họ và Tên</label>
                <input 
                  type="text" 
                  required 
                  style={styles.input} 
                  placeholder="Nhập đầy đủ họ và tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Địa chỉ Email</label>
                <input 
                  type="email" 
                  required 
                  style={styles.input} 
                  placeholder="name@roastlogic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Vai trò (Role)</label>
                  <select 
                    style={styles.input}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Logistics Coordinator">Logistics Coordinator</option>
                    <option value="QC Inspector">QC Inspector</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Bộ phận</label>
                  <select 
                    style={styles.input}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Vận hành">Vận hành</option>
                    <option value="Chuỗi cung ứng">Chuỗi cung ứng</option>
                    <option value="Kiểm soát chất lượng">Kiểm soát chất lượng</option>
                    <option value="Tổng bộ">Tổng bộ</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Trạng thái hoạt động</label>
                <select 
                  style={styles.input}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">HOẠT ĐỘNG (Active)</option>
                  <option value="PENDING">CHỜ DUYỆT / NGHỈ (Pending)</option>
                  <option value="LOCKED">BỊ KHÓA CHẶT (Locked)</option>
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" style={styles.btnSave}>
                  <FaSave style={{ marginRight: '6px' }} /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS THẺ KPI GIAO DIỆN ---
const KPICard = ({ title, value, icon, isGreen, isRed }) => {
  let valColor = '#3D2B1F';
  if (isGreen) valColor = '#4A6741';
  if (isRed) valColor = '#A64444';

  return (
    <div style={styles.kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={styles.kpiTitle}>{title}</p>
        <div>{icon}</div>
      </div>
      <div style={{ marginTop: '12px' }}>
        <h3 style={{ ...styles.kpiValue, color: valColor }}>{value}</h3>
      </div>
    </div>
  );
};

// --- HỆ THỐNG STYLES CSS ĐỒNG BỘ BRAND MÀU CÀ PHÊ ---
const styles = {
  mainTitle: { fontSize: '32px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
  description: { fontSize: '14px', color: '#7A6352', marginTop: '8px', maxWidth: '800px', lineHeight: '1.5' },
  btnAddStaff: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  kpiCard: { flex: 1, minWidth: '220px', backgroundColor: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #EFE2D1', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' },
  kpiTitle: { fontSize: '11px', fontWeight: 'bold', color: '#A68B6D', letterSpacing: '0.05em', margin: 0 },
  kpiValue: { fontSize: '36px', fontWeight: '900', margin: 0 },
  tableContainer: { backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1E9DE', overflow: 'hidden' },
  filterBar: { padding: '20px 24px', borderBottom: '1px solid #F5EEE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  filterLabel: { fontSize: '11px', fontWeight: '900', color: '#A68B6D', display: 'flex', alignItems: 'center', gap: '6px' },
  select: { padding: '8px 16px', borderRadius: '10px', border: '1px solid #EADBC4', backgroundColor: '#FDFCF7', color: '#5A4535', fontSize: '13px', outline: 'none' },
  resultsCount: { fontSize: '11px', fontWeight: 'bold', color: '#A68B6D' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  theadRow: { backgroundColor: '#FFFDF9', borderBottom: '1px solid #F5EEE6' },
  th: { padding: '16px 12px', fontSize: '11px', fontWeight: '900', color: '#A68B6D' },
  tbodyRow: { borderBottom: '1px solid #F8F5F0' },
  td: { padding: '16px 12px', fontSize: '14px', color: '#5A4535', verticalAlign: 'middle' },
  avatarPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F5EEE6', color: '#8D6D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  staffName: { fontWeight: 'bold', color: '#3D2B1F' },
  staffEmail: { fontSize: '12px', color: '#A68B6D', marginTop: '2px' },
  badge: { padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' },
  btnAction: { background: 'none', border: '1px solid #EADBC4', padding: '6px 14px', borderRadius: '8px', color: '#8D6D4D', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  
  // Styles dành cho cửa sổ Popup Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(61, 43, 31, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', borderRadius: '24px', width: '500px', padding: '32px', border: '1px solid #EFE2D1', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F5EEE6', paddingBottom: '16px' },
  btnCloseModal: { background: 'none', border: 'none', color: '#A68B6D', cursor: 'pointer' },
  modalForm: { marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#8D6D4D' },
  input: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #EADBC4', backgroundColor: '#FDFCF7', fontSize: '14px', color: '#3D2B1F', outline: 'none' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #F5EEE6', paddingTop: '20px' },
  btnCancel: { background: 'none', border: '1px solid #EADBC4', color: '#7A6352', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  btnSave: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};

export default StaffPage;