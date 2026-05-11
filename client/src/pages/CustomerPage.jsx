import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserPlus, FaFileExport, FaSearch, 
  FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaPaperPlane 
} from 'react-icons/fa';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const CustomersPage = () => {
  const [allCustomers, setAllCustomers] = useState([]);
  const [displayCustomers, setDisplayCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal và Thông báo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [newCust, setNewCust] = useState({
    name: '', email: '', phone: '', address: '', type: 'Khách lẻ tiềm năng', director: ''
  });

  // 1. Lấy dữ liệu từ MongoDB khi vào trang
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setAllCustomers(res.data);
      setDisplayCustomers(res.data);
      if (res.data.length > 0) setSelectedCustomer(res.data[0]);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  // 2. Logic Lọc dữ liệu
  useEffect(() => {
    let filtered = allCustomers;
    if (activeTab !== 'Tất cả') {
      filtered = filtered.filter(c => c.type.includes(activeTab));
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayCustomers(filtered);
  }, [activeTab, searchTerm, allCustomers]);

  // --- LOGIC LƯU KHÁCH HÀNG (API) ---
  const saveCustomer = async (e) => {
    e.preventDefault();
    try {
      // Bổ sung các trường mặc định nếu thiếu
      const dataToSave = {
        ...newCust,
        initials: newCust.name.substring(0, 2).toUpperCase(),
        total: "0đ",
        lastDate: "Vừa xong"
      };

      const response = await axios.post('http://localhost:5000/api/customers', dataToSave);
      
      // Cập nhật state local để hiển thị ngay lập tức
      setAllCustomers([response.data, ...allCustomers]);
      setIsModalOpen(false);
      // Reset form
      setNewCust({ name: '', email: '', phone: '', address: '', type: 'Khách lẻ tiềm năng', director: '' });
      alert("Thêm khách hàng thành công!");
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể lưu vào Database! Vui lòng kiểm tra Server.");
    }
  };

  // --- LOGIC XUẤT FILE WORD ---
  const handleExportWord = () => {
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
            new TableCell({ children: [new Paragraph(c.total || "")] }),
          ],
        })),
      ],
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "DANH SÁCH KHÁCH HÀNG & ĐỐI TÁC", heading: "Heading1" }),
          new Paragraph({ text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}\n` }),
          table
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "Danh_Sach_Khach_Hang.docx");
    });
  };

  // --- LOGIC GỬI THÔNG BÁO ---
  const handleSendNoti = () => {
    if (!msgText.trim()) return alert("Vui lòng nhập nội dung thông báo!");
    alert(`[Hệ thống] Đang gửi đến ${selectedCustomer.email}:\n\n"${msgText}"`);
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
          <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}><FaUserPlus /> Thêm khách hàng mới</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <StatCard label="TỔNG SỐ KHÁCH HÀNG" value={allCustomers.length} trend="+12% tháng này" />
        <StatCard label="ĐỐI TÁC CHIẾN LƯỢC" value={allCustomers.filter(c => c.type === 'Đối tác thu mua').length} trend="ỔN ĐỊNH" />
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
              <FaSearch color="#A89B8D" /><input type="text" placeholder="Tìm kiếm..." style={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
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
                <CustomerItem {...c} active={selectedCustomer?._id === c._id || selectedCustomer?.id === c.id} />
              </div>
            ))
          ) : (
            <div style={{textAlign:'center', padding:'50px', color:'#A89B8D'}}>Chưa có dữ liệu khách hàng.</div>
          )}
        </div>

        <aside style={styles.detailSidebar}>
          {selectedCustomer && (
            <>
              <div style={styles.detailHeader}>
                 <div style={styles.detailAvatar}>{selectedCustomer.logo || selectedCustomer.initials}</div>
                 <h3 style={styles.detailName}>{selectedCustomer.name}</h3>
                 <p style={styles.detailSub}>{selectedCustomer.type}</p>
              </div>
              <div style={styles.detailInfoBox}>
                <p style={styles.infoTitle}>THÔNG TIN LIÊN HỆ</p>
                <p style={styles.infoItem}><FaUserPlus /> <b>{selectedCustomer.director}</b></p>
                <p style={styles.infoItem}><FaPhoneAlt /> {selectedCustomer.phone}</p>
                <p style={styles.infoItem}><FaMapMarkerAlt /> {selectedCustomer.address}</p>
              </div>

              <div style={styles.notiBox}>
                <p style={styles.infoTitle}>GỬI THÔNG BÁO NHANH</p>
                <textarea 
                    style={styles.textArea} 
                    placeholder="Nhập nội dung ưu đãi..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                />
                <button style={styles.sendBtn} onClick={handleSendNoti}>
                    <FaPaperPlane /> Gửi ngay
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3 style={{margin:0}}>Thêm đối tác mới</h3>
              <FaTimes onClick={() => setIsModalOpen(false)} style={{cursor:'pointer'}} />
            </div>
            <form onSubmit={saveCustomer}>
              <input style={styles.input} placeholder="Tên công ty/Khách hàng" required value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}>
                <input style={styles.input} placeholder="Email" type="email" required value={newCust.email} onChange={e => setNewCust({...newCust, email: e.target.value})} />
                <input style={styles.input} placeholder="SĐT" required value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
              </div>
              <input style={styles.input} placeholder="Địa chỉ" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} />
              <input style={styles.input} placeholder="Người đại diện" value={newCust.director} onChange={e => setNewCust({...newCust, director: e.target.value})} />
              
              <label style={{fontSize:'12px', color:'#A89B8D'}}>Phân loại:</label>
              <select style={styles.input} value={newCust.type} onChange={e => setNewCust({...newCust, type: e.target.value})}>
                <option value="Khách lẻ tiềm năng">Khách lẻ tiềm năng</option>
                <option value="Khách hàng thân thiết">Khách hàng thân thiết</option>
                <option value="Đối tác thu mua">Đối tác thu mua</option>
              </select>

              <button type="submit" style={styles.saveBtn}>HOÀN TẤT LƯU DATABASE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, subValue, trend }) => (
  <div style={styles.statCard}>
    <p style={styles.statLabel}>{label}</p>
    <h2 style={styles.statValue}>{value} <span style={{fontSize: '14px'}}>{subValue}</span></h2>
    <p style={styles.statTrend}>{trend}</p>
  </div>
);

const CustomerItem = ({ initials, logo, name, email, type, lastDate, total, active }) => (
  <div style={{...styles.listItem, backgroundColor: active ? '#F9F1E7' : 'transparent'}}>
    <div style={{flex: 2, display: 'flex', alignItems: 'center', gap: '15px'}}>
      <div style={styles.avatar}>{logo || initials}</div>
      <div>
        <p style={styles.itemName}>{name}</p>
        <p style={styles.itemEmail}>{email}</p>
      </div>
    </div>
    <div style={{flex: 1, fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C'}}>{type}</div>
    <div style={{flex: 1, fontSize: '11px', color: '#70645C'}}>{lastDate}</div>
    <div style={{flex: 1, fontSize: '14px', fontWeight: 'bold', color: '#3D2B1F'}}>{total}</div>
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
  avatar: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E5D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  itemName: { margin: 0, fontWeight: 'bold' },
  itemEmail: { margin: 0, fontSize: '12px', color: '#A89B8D' },
  detailSidebar: { flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '15px', height: 'fit-content' },
  detailAvatar: { width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#F9F1E7', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
  detailName: { textAlign: 'center', margin: 0 },
  detailSub: { textAlign: 'center', fontSize: '12px', color: '#A89B8D', marginBottom: '30px' },
  infoTitle: { fontSize: '10px', fontWeight: 'bold', color: '#A89B8D', marginBottom: '10px' },
  infoItem: { fontSize: '13px', marginBottom: '10px' },
  textArea: { width: '100%', height: '80px', borderRadius: '8px', border: '1px solid #E5D5C5', padding: '10px', boxSizing: 'border-box', fontSize: '12px' },
  sendBtn: { width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '450px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #E5D5C5', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '12px', backgroundColor: '#3D2B1F', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default CustomersPage;