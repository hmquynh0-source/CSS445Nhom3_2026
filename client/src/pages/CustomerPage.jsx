import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserPlus, FaFileExport, FaSearch, 
  FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaPaperPlane, FaEdit
} from 'react-icons/fa';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const CustomersPage = () => {
  const [allCustomers, setAllCustomers] = useState([]);
  const [displayCustomers, setDisplayCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal Thêm & Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Phân biệt Thêm hay Sửa
  const [msgText, setMsgText] = useState('');
  
  const [newCust, setNewCust] = useState({
    name: '', email: '', phone: '', address: '', type: 'Khách lẻ tiềm năng', director: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const customersArray = res.data?.data || [];
      setAllCustomers(customersArray);
      setDisplayCustomers(customersArray);
      if (customersArray.length > 0) {
        setSelectedCustomer(customersArray[0]);
      }
    } catch (error) {
      console.error("🚨 Lỗi lấy dữ liệu khách hàng:", error);
      setAllCustomers([]);
      setDisplayCustomers([]);
    }
  };

  useEffect(() => {
    let filtered = Array.isArray(allCustomers) ? allCustomers : [];
    if (activeTab !== 'Tất cả') {
      filtered = filtered.filter(c => c && c.type && c.type.includes(activeTab));
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
        (c.email && c.email.toLowerCase().includes(lowerSearch))
      );
    }
    setDisplayCustomers(filtered);
  }, [activeTab, searchTerm, allCustomers]);

  // Mở modal ở chế độ Sửa và đổ dữ liệu cũ vào form
  const openEditModal = (customer) => {
    setIsEditMode(true);
    setNewCust({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      type: customer.type || 'Khách lẻ tiềm năng',
      director: customer.director || ''
    });
    setIsModalOpen(true);
  };

  // --- LOGIC LƯU HOẶC SỬA KHÁCH HÀNG ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditMode) {
        // --- CHẾ ĐỘ CẬP NHẬT (PUT) ---
        const customerId = selectedCustomer._id || selectedCustomer.id;
        const response = await axios.put(`http://localhost:5000/api/customers/${customerId}`, newCust, { headers });
        const updatedData = response.data?.data || response.data;

        // Cập nhật lại trong danh sách hiển thị cục bộ
        setAllCustomers(prev => prev.map(c => (c._id === customerId || c.id === customerId) ? updatedData : c));
        setSelectedCustomer(updatedData);
        alert("🎉 Cập nhật thông tin đối tác thành công!");
      } else {
        // --- CHẾ ĐỘ THÊM MỚI (POST) ---
        const dataToSave = {
          ...newCust,
          initials: newCust.name ? newCust.name.substring(0, 2).toUpperCase() : 'KH',
          total: "0đ",
          lastDate: "Vừa xong"
        };
        const response = await axios.post('http://localhost:5000/api/customers', dataToSave, { headers });
        const createdCustomer = response.data?.data || response.data;

        setAllCustomers(prev => [createdCustomer, ...prev]);
        setSelectedCustomer(createdCustomer);
        alert("🎉 Thêm đối tác mới thành công!");
      }

      setIsModalOpen(false);
      setNewCust({ name: '', email: '', phone: '', address: '', type: 'Khách lẻ tiềm năng', director: '' });
    } catch (error) {
      console.error("🚨 Lỗi xử lý dữ liệu khách hàng:", error);
      alert(error.response?.data?.message || "Thao tác thất bại! Vui lòng kiểm tra lại server.");
    }
  };

  const handleExportWord = () => {
    if (!displayCustomers.length) return alert("Không có dữ liệu để xuất!");
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Tên Khách Hàng")] }),
            new TableCell({ children: [new Paragraph("Phân Loại")] }),
            new TableCell({ children: [new Paragraph("Số Điện Thoại")] }),
            new TableCell({ children: [new Paragraph("Tổng Giao Dịch")] }),
          ],
        }),
        ...displayCustomers.map(c => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(c.name || "")] }),
            new TableCell({ children: [new Paragraph(c.type || "")] }),
            new TableCell({ children: [new Paragraph(c.phone || "")] }),
            new TableCell({ children: [new Paragraph(c.total || "0đ")] }),
          ],
        })),
      ],
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "DANH SÁCH KHÁCH HÀNG & ĐỐI TÁC WAREHOUSE", heading: "Heading1" }),
          new Paragraph({ text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}\n` }),
          table
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => saveAs(blob, "Danh_Sach_Khach_Hang.docx"));
  };

  const handleSendNoti = () => {
    if (!selectedCustomer) return alert("Vui lòng chọn một đối tác!");
    if (!msgText.trim()) return alert("Vui lòng nhập nội dung!");
    alert(`[Hệ thống] Gửi đến ${selectedCustomer.email}:\n\n"${msgText}"`);
    setMsgText('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerTitleRow}>
        <div>
          <p style={styles.upperTitle}>QUẢN LÝ QUAN HỆ</p>
          <h1 style={styles.mainTitle}>Danh mục khách hàng & Đối tác</h1>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.exportBtn} onClick={handleExportWord}><FaFileExport /> Xuất file Word</button>
          <button style={styles.addBtn} onClick={() => { setIsEditMode(false); setNewCust({ name: '', email: '', phone: '', address: '', type: 'Khách lẻ tiềm năng', director: '' }); setIsModalOpen(true); }}><FaUserPlus /> Thêm khách hàng mới</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <StatCard label="TỔNG SỐ KHÁCH HÀNG" value={allCustomers.length} trend="+12% tháng này" />
        <StatCard label="ĐỐI TÁC CHIẾN LƯỢC" value={allCustomers.filter(c => c && c.type === 'Đối tác thu mua').length} trend="ỔN ĐỊNH" />
        <StatCard label="DOANH THU KỲ VỌNG" value="4.2B" subValue="VND" trend="Q4 Outlook" />
      </div>

      <div style={styles.mainContentGrid}>
        <div style={styles.listSection}>
          <div style={styles.filterBar}>
            <div style={styles.tabs}>
              {['Tất cả', 'Khách hàng thân thiết', 'Đối tác'].map(tab => (
                <span key={tab} style={activeTab === tab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab)}>
                  {tab === 'Khách hàng thân thiết' ? 'Thân thiết' : tab === 'Đối tác' ? 'Đối tác' : tab}
                </span>
              ))}
            </div>
            <div style={styles.searchContainer}>
              <FaSearch color="#A89B8D" />
              <input type="text" placeholder="Tìm kiếm..." style={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div style={styles.tableHeader}>
            <span style={{flex: 2}}>THÔNG TIN ĐỐI TÁC</span>
            <span style={{flex: 1}}>PHÂN LOẠI</span>
            <span style={{flex: 1}}>LẦN MUA CUỐI</span>
            <span style={{flex: 1}}>TỔNG GIAO DỊCH</span>
          </div>

          {displayCustomers.length > 0 ? (
            displayCustomers.map((c) => (
              <div key={c._id || c.id} onClick={() => setSelectedCustomer(c)}>
                <CustomerItem {...c} active={(selectedCustomer?._id === c._id || selectedCustomer?.id === c.id)} />
              </div>
            ))
          ) : (
            <div style={{textAlign:'center', padding:'50px', color:'#A89B8D'}}>Chưa tìm thấy dữ liệu phù hợp.</div>
          )}
        </div>

        <aside style={styles.detailSidebar}>
          {selectedCustomer ? (
            <>
              <div style={styles.detailHeader}>
                 <div style={styles.detailAvatar}>{selectedCustomer.logo || selectedCustomer.initials || 'KH'}</div>
                 <h3 style={styles.detailName}>{selectedCustomer.name}</h3>
                 <p style={styles.detailSub}>{selectedCustomer.type}</p>
              </div>
              
              {/* 🚀 NÚT BẤM CHỈNH SỬA THÔNG TIN KHÁCH HÀNG */}
              <button style={styles.editBtn} onClick={() => openEditModal(selectedCustomer)}>
                <FaEdit /> Chỉnh sửa thông tin
              </button>

              <div style={styles.detailInfoBox}>
                <p style={styles.infoTitle}>THÔNG TIN LIÊN HỆ</p>
                <p style={styles.infoItem}><FaUserPlus /> Đại diện: <b>{selectedCustomer.director || 'Chưa cập nhật'}</b></p>
                <p style={styles.infoItem}><FaPhoneAlt /> SĐT: {selectedCustomer.phone || 'Chưa cập nhật'}</p>
                <p style={styles.infoItem}><FaMapMarkerAlt /> ĐC: {selectedCustomer.address || 'Chưa cập nhật'}</p>
              </div>

              <div style={styles.notiBox}>
                <p style={styles.infoTitle}>GỬI THÔNG BÁO NHANH</p>
                <textarea style={styles.textArea} placeholder="Nhập nội dung ưu đãi..." value={msgText} onChange={(e) => setMsgText(e.target.value)} />
                <button style={styles.sendBtn} onClick={handleSendNoti}><FaPaperPlane /> Gửi ngay</button>
              </div>
            </>
          ) : (
            <div style={{textAlign: 'center', color: '#A89B8D', padding: '20px 0'}}>Vui lòng chọn khách hàng.</div>
          )}
        </aside>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3 style={{margin:0, color: '#3D2B1F'}}>{isEditMode ? "Cập nhật đối tác" : "Thêm đối tác mới"}</h3>
              <FaTimes onClick={() => setIsModalOpen(false)} style={{cursor:'pointer'}} />
            </div>
            <form onSubmit={handleFormSubmit}>
              <input style={styles.input} placeholder="Tên công ty / Khách hàng" required value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}>
                <input style={styles.input} placeholder="Email" type="email" required value={newCust.email} onChange={e => setNewCust({...newCust, email: e.target.value})} />
                <input style={styles.input} placeholder="Số điện thoại" required value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
              </div>
              <input style={styles.input} placeholder="Địa chỉ" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} />
              <input style={styles.input} placeholder="Người đại diện" value={newCust.director} onChange={e => setNewCust({...newCust, director: e.target.value})} />
              
              <label style={{fontSize:'12px', color:'#A89B8D', display: 'block', marginBottom: '5px'}}>Phân loại:</label>
              <select style={styles.input} value={newCust.type} onChange={e => setNewCust({...newCust, type: e.target.value})}>
                <option value="Khách lẻ tiềm năng">Khách lẻ tiềm năng</option>
                <option value="Khách hàng thân thiết">Khách hàng thân thiết</option>
                <option value="Đối tác thu mua">Đối tác thu mua</option>
              </select>

              <button type="submit" style={styles.saveBtn}>
                {isEditMode ? "XÁC NHẬN CẬP NHẬT" : "HOÀN TẤT LƯU DATABASE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, subValue, trend }) => (
  <div style={styles.statCard}>
    <p style={styles.statLabel}>{label}</p>
    <h2 style={styles.statValue}>{value} {subValue && <span style={{fontSize: '14px'}}>{subValue}</span>}</h2>
    <p style={styles.statTrend}>{trend}</p>
  </div>
);

const CustomerItem = ({ initials, logo, name, email, type, lastDate, total, active }) => (
  <div style={{...styles.listItem, backgroundColor: active ? '#F9F1E7' : 'transparent'}}>
    <div style={{flex: 2, display: 'flex', alignItems: 'center', gap: '15px'}}>
      <div style={styles.avatar}>{logo || initials || 'KH'}</div>
      <div>
        <p style={styles.itemName}>{name}</p>
        <p style={styles.itemEmail}>{email}</p>
      </div>
    </div>
    <div style={{flex: 1, fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C'}}>{type || 'Khách lẻ'}</div>
    <div style={{flex: 1, fontSize: '11px', color: '#70645C'}}>{lastDate || 'Vừa xong'}</div>
    <div style={{flex: 1, fontSize: '14px', fontWeight: 'bold', color: '#3D2B1F'}}>{total || '0đ'}</div>
  </div>
);

const styles = {
  container: { padding: '10px 0' },
  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
  upperTitle: { fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', letterSpacing: '1px' },
  mainTitle: { fontSize: '32px', fontWeight: '800', color: '#3D2B1F', margin: '5px 0' },
  headerActions: { display: 'flex', gap: '10px' },
  addBtn: { backgroundColor: '#3D2B1F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  exportBtn: { backgroundColor: 'white', border: '1px solid #E5D5C5', color: '#3D2B1F', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '40px' },
  statCard: { flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
  statLabel: { fontSize: '10px', fontWeight: 'bold', color: '#A89B8D' },
  statValue: { fontSize: '28px', fontWeight: '900', color: '#3D2B1F', margin: 0 },
  statTrend: { fontSize: '12px', color: '#4F7942', fontWeight: '600' },
  mainContentGrid: { display: 'flex', gap: '30px' },
  listSection: { flex: 3 },
  filterBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '20px' },
  tabActive: { fontWeight: 'bold', color: '#3D2B1F', borderBottom: '2px solid #3D2B1F', paddingBottom: '5px', cursor: 'pointer' },
  tab: { color: '#A89B8D', cursor: 'pointer' },
  searchContainer: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F9F1E7', padding: '8px 15px', borderRadius: '8px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none' },
  tableHeader: { display: 'flex', padding: '15px', fontSize: '11px', fontWeight: 'bold', color: '#A89B8D', borderBottom: '1px solid #E5D5C5' },
  listItem: { display: 'flex', padding: '20px 15px', alignItems: 'center', borderBottom: '1px solid #F1F1F1', cursor: 'pointer' },
  avatar: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E5D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3D2B1F' },
  itemName: { margin: 0, fontWeight: 'bold', color: '#3D2B1F' },
  itemEmail: { margin: 0, fontSize: '12px', color: '#A89B8D' },
  detailSidebar: { flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '15px', height: 'fit-content', border: '1px solid #F1E9DE' },
  detailAvatar: { width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#F9F1E7', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold', color: '#3D2B1F' },
  detailName: { textAlign: 'center', margin: 0, color: '#3D2B1F' },
  detailSub: { textAlign: 'center', fontSize: '12px', color: '#A89B8D', marginBottom: '15px' },
  
  // Style nút Edit cao cấp
  editBtn: { width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: '#FFF9F3', color: '#8B5E3C', border: '1px solid #E5D5C5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '12px' },
  
  infoTitle: { fontSize: '10px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '10px', letterSpacing: '0.5px' },
  infoItem: { fontSize: '13px', marginBottom: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' },
  textArea: { width: '100%', height: '80px', borderRadius: '8px', border: '1px solid #E5D5C5', padding: '10px', boxSizing: 'border-box', fontSize: '12px', outline: 'none', resize: 'none' },
  sendBtn: { width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #E5D5C5', boxSizing: 'border-box', outline: 'none' },
  saveBtn: { width: '100%', padding: '12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.5px' }
};

export default CustomersPage;