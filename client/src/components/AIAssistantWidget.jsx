import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    FaPaperPlane, FaChevronDown, FaChevronUp, 
    FaTimes, FaSpinner, FaCoffee, FaExclamationTriangle,
    FaBoxOpen, FaTruckLoading, FaChartLine
} from 'react-icons/fa';

const AIAssistantWidget = () => {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối danh sách tin nhắn
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Hàm gửi tin nhắn và lấy dữ liệu thực tế từ Backend
    const handleSendMessage = async (textOverride = null) => {
        const messageText = textOverride || input;
        if (!messageText.trim() || loading) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // GỌI API THẬT (Thay URL nếu backend của bạn chạy port khác)
            const response = await axios.post(
                'http://localhost:5000/api/ai/chat', 
                { message: messageText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: response.data.reply,
                data: response.data.data || null, // Chứa mảng sản phẩm/nhà cung cấp thực tế
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'assistant',
                content: "Hạt Cà Phê đang gặp chút sự cố kết nối với kho dữ liệu. Bạn thử lại sau nhé!",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
                
                {/* 1. CỬA SỔ CHAT */}
                <div style={{
                    position: 'absolute',
                    bottom: isOpen ? '90px' : '0',
                    right: '0',
                    width: '380px',
                    height: isMinimized ? '60px' : '550px',
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 15px 50px rgba(61, 43, 31, 0.25)',
                    display: isOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid #efeae6',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'scale(1)' : 'scale(0.8)',
                    transformOrigin: 'bottom right'
                }}>
                    
                    {/* Header */}
                    <div style={headerStyle} onClick={() => setIsMinimized(!isMinimized)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="pulse-container">
                                <FaCoffee style={{ fontSize: '1.4rem', color: '#f5ebe0' }} />
                                <div className="online-dot"></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Hạt Cà Phê AI</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Đang phân tích kho thực tế</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={headerActionBtn}>
                                {isMinimized ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={headerActionBtn}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Body */}
                            <div style={chatBodyStyle}>
                                {messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', marginTop: '40px', padding: '0 20px' }}>
                                        <div className="floating-icon">☕</div>
                                        <p style={{ color: '#8b735b', fontSize: '0.9rem', fontWeight: '500', marginBottom: '20px' }}>
                                            Chào {user?.name || 'Admin'}! <br/> Mình có thể giúp bạn kiểm tra kho ngay bây giờ.
                                        </p>
                                        
                                        {/* PHẦN GỢI Ý NHANH CỦA BẠN */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#a0aec0', width: '100%' }}>Gợi ý cho bạn:</p>
                                            <button 
                                                onClick={() => handleSendMessage("Sản phẩm nào sắp hết hàng?")}
                                                style={suggestionBtn}
                                            >
                                                <FaExclamationTriangle style={{marginRight: '5px'}}/> Tồn kho thấp?
                                            </button>
                                            <button 
                                                onClick={() => handleSendMessage("Thông tin liên hệ nhà cung cấp")}
                                                style={suggestionBtn}
                                            >
                                                <FaTruckLoading style={{marginRight: '5px'}}/> Nhà cung cấp
                                            </button>
                                            <button 
                                                onClick={() => handleSendMessage("Báo cáo doanh thu hôm nay")}
                                                style={suggestionBtn}
                                            >
                                                <FaChartLine style={{marginRight: '5px'}}/> Doanh thu
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} style={messageWrapperStyle(msg.type)}>
                                            {msg.type === 'assistant' && <div className="avatar-mini">☕</div>}
                                            <div style={messageBoxStyle(msg.type)}>
                                                {msg.content}

                                                {/* HIỂN THỊ DỮ LIỆU THẬT DẠNG CARD (Nếu có data trả về từ API) */}
                                                {msg.data && Array.isArray(msg.data) && (
                                                    <div style={reportContainer}>
                                                        {msg.data.map((item, idx) => (
                                                            <div key={idx} style={reportCard}>
                                                                <div style={{fontWeight: '600', color: '#3d2b1f'}}>{item.name}</div>
                                                                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px'}}>
                                                                    <span>Tồn kho: <b style={{color: item.stockQuantity < 10 ? '#e53e3e' : '#38a169'}}>{item.stockQuantity} {item.unit}</b></span>
                                                                    <span style={{color: '#718096'}}>SKU: {item.sku}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {loading && (
                                    <div style={{ display: 'flex', paddingLeft: '40px' }}>
                                        <div className="typing-dots"><span></span><span></span><span></span></div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={inputAreaStyle}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Hỏi về kho hàng, doanh thu..."
                                    style={inputStyle}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!input.trim() || loading}
                                    style={sendBtnStyle(input)}
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. TRIGGER BUTTON (Bé Hạt Cà Phê Nhảy Nhảy) */}
                {!isOpen && (
                    <div onClick={() => setIsOpen(true)} className="coffee-bean-trigger" style={{ cursor: 'pointer', position: 'relative' }}>
                        <div className="chat-tooltip">Kho hàng thế nào rồi bạn?</div>
                        <div className="bean-shadow"></div>
                        <div className="coffee-bean-avatar">
                            <span style={{ fontSize: '2.2rem' }}>☕</span>
                            <div className="bean-smile"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. CSS ANIMATIONS & EXTRA STYLES */}
            <style>{`
                .coffee-bean-trigger { animation: coffee-bounce 2.5s infinite ease-in-out; }
                @keyframes coffee-bounce {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(8deg); }
                }
                .coffee-bean-avatar {
                    width: 75px; height: 75px; background: #3d2b1f; border: 4px solid #6f4e37;
                    border-radius: 55% 45% 55% 45% / 45% 55% 45% 55%;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 25px rgba(61, 43, 31, 0.3); position: relative; z-index: 2;
                }
                .bean-smile { position: absolute; bottom: 18px; width: 12px; height: 6px; border-bottom: 2px solid white; border-radius: 0 0 10px 10px; }
                .bean-shadow {
                    position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
                    width: 45px; height: 8px; background: rgba(0,0,0,0.15); border-radius: 50%;
                    z-index: 1; animation: shadow-scale 2.5s infinite ease-in-out;
                }
                @keyframes shadow-scale {
                    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
                    50% { transform: translateX(-50%) scale(0.5); opacity: 0.1; }
                }
                .chat-tooltip {
                    position: absolute; left: -180px; top: 15px; background: #3d2b1f; color: white;
                    padding: 8px 15px; border-radius: 12px; font-size: 0.8rem; width: 150px;
                    text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); pointer-events: none;
                }
                .chat-tooltip::after {
                    content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
                    border-left: 8px solid #3d2b1f; border-top: 6px solid transparent; border-bottom: 6px solid transparent;
                }
                .typing-dots span {
                    display: inline-block; width: 6px; height: 6px; background: #8b735b;
                    border-radius: 50%; margin-right: 3px; animation: typing 1s infinite;
                }
                .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .avatar-mini { width: 30px; height: 30px; background: #3d2b1f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
            `}</style>
        </>
    );
};

// --- STYLES OBJECTS ---
const headerStyle = {
    background: 'linear-gradient(135deg, #3d2b1f 0%, #6f4e37 100%)',
    color: 'white', padding: '16px 20px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
};

const chatBodyStyle = {
    flex: 1, overflowY: 'auto', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '15px', background: '#fdfcfb'
};

const inputAreaStyle = {
    padding: '20px', background: 'white', borderTop: '1px solid #f0ede9',
    display: 'flex', gap: '10px'
};

const inputStyle = {
    flex: 1, border: '1px solid #e2e8f0', borderRadius: '30px',
    padding: '10px 20px', outline: 'none', fontSize: '0.9rem'
};

const sendBtnStyle = (input) => ({
    width: '45px', height: '45px', borderRadius: '50%',
    background: input.trim() ? '#3d2b1f' : '#d1d5db',
    color: 'white', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
});

const headerActionBtn = {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
    cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex'
};

const suggestionBtn = {
    fontSize: '0.75rem', background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '20px', padding: '8px 15px', cursor: 'pointer',
    color: '#6f4e37', fontWeight: '600', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center'
};

const messageWrapperStyle = (type) => ({
    display: 'flex', justifyContent: type === 'user' ? 'flex-end' : 'flex-start',
    alignItems: 'flex-end', gap: '8px'
});

const messageBoxStyle = (type) => ({
    maxWidth: '80%', padding: '12px 16px',
    borderRadius: type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    background: type === 'user' ? '#6f4e37' : '#f0ede9',
    color: type === 'user' ? 'white' : '#3d2b1f',
    fontSize: '0.9rem', lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
});

const reportContainer = {
    marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
};

const reportCard = {
    background: 'white', borderRadius: '12px', padding: '10px',
    border: '1px solid #e2e8f0', color: '#3d2b1f'
};

export default AIAssistantWidget;