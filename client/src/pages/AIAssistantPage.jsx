import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRBAC } from '../context/RBACContext';
import { FaRobot, FaPaperPlane, FaHistory, FaClock, FaCheck, FaTrash, FaDownload } from 'react-icons/fa';

const AIAssistantProPage = () => {
    const { userProfile, token } = useAuth();
    const { hasPermission } = useRBAC();
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Conversation templates for quick start
    const templates = [
        {
            title: 'So sánh tồn kho',
            prompt: 'So sánh tồn kho sản phẩm A vs B tháng trước vs tháng này'
        },
        {
            title: 'Dự báo nhập hàng',
            prompt: 'Dự báo cần nhập bao nhiêu sản phẩm X dựa trên biến động bán hàng?'
        },
        {
            title: 'Phân tích NCC',
            prompt: 'Nhà cung cấp nào có tỷ lệ giao hàng đúng hạn cao nhất?'
        },
        {
            title: 'Tối ưu slotting',
            prompt: 'Sản phẩm nào nên để ở kệ gần nhất dựa trên tần suất bán?'
        }
    ];

    // Mock AI response (trong thực tế sẽ gọi API)
    const generateAIResponse = async (userMessage) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const responses = {
            'so sánh': 'Dựa trên dữ liệu:\n- Tháng trước: SP A tồn 150, SP B tồn 200\n- Tháng này: SP A tồn 120 (giảm -20%), SP B tồn 180 (giảm -10%)\n💡 Khuyến nghị: SP A bán nhanh hơn, cân nhắc tăng giá hoặc quảng cáo thêm',
            'dự báo': 'Dựa trên phân tích 3 tháng gần nhất:\n📊 Tốc độ tiêu thụ SP X: 50 cái/ngày\n🎯 Dự báo tháng sau cần nhập: 1,500 cái\n💰 Chi phí: ~150 triệu VNĐ\n✅ Thời điểm nhập lý tưởng: Tuần thứ 1 tháng sau',
            'nhà cung cấp': '🏆 Top 3 NCC có tỷ lệ giao hàng đúng hạn cao nhất:\n1️⃣ NCC A: 98% (150/153 đơn)\n2️⃣ NCC C: 96% (140/146 đơn)\n3️⃣ NCC B: 92% (115/125 đơn)\n⚠️ NCC D chỉ 75% - cảnh báo!',
            'slotting': '📈 Slotting optimization dựa trên ABC analysis:\n🔴 Kệ A1-A5 (gần nhất): Top 20% sản phẩm bán chạy\n🟡 Kệ B1-B10 (giữa): Sản phẩm bình thường\n🔵 Kệ C1-C20 (xa nhất): Sản phẩm bán chậm\n✅ Dự kiến tiết kiệm thời gian picking 30%'
        };

        // Find best matching response
        for (const [key, response] of Object.entries(responses)) {
            if (userMessage.toLowerCase().includes(key)) {
                return response;
            }
        }

        return 'Tôi hiểu câu hỏi của bạn. Có thể bạn muốn hỏi về:\n- So sánh tồn kho giữa các sản phẩm\n- Dự báo nhu cầu và nhập hàng\n- Phân tích hiệu suất nhà cung cấp\n- Tối ưu hóa vị trí lưu trữ\n\nBạn có thể làm rõ thêm để tôi cung cấp câu trả lời chính xác hơn?';
    };

    // Send message
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            content: input,
            timestamp: new Date(),
            tokens: Math.ceil(input.length / 4) // Rough estimate
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Get AI response
            const aiResponse = await generateAIResponse(input);

            const aiMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
                tokens: Math.ceil(aiResponse.length / 4)
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'error',
                content: '❌ Lỗi kết nối. Vui lòng thử lại.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start new conversation
    const handleNewConversation = () => {
        const conv = {
            id: Date.now(),
            title: `Cuộc trò chuyện ${new Date().toLocaleDateString('vi-VN')}`,
            createdAt: new Date(),
            messages: []
        };
        setConversations(prev => [conv, ...prev]);
        setCurrentConversation(conv.id);
        setMessages([]);
    };

    return (
        <div style={containerStyle}>
            {/* Sidebar */}
            <div style={sidebarStyle}>
                <button onClick={handleNewConversation} style={newChatButtonStyle}>
                    ➕ Cuộc trò chuyện mới
                </button>

                <div style={historyStyle}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' }}>
                        <FaHistory style={{ marginRight: '6px' }} /> Lịch sử
                    </h3>
                    {conversations.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: 0 }}>Không có lịch sử</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    setCurrentConversation(conv.id);
                                    setMessages(conv.messages);
                                }}
                                style={{
                                    ...historyItemStyle,
                                    background: currentConversation === conv.id ? '#e0e7ff' : 'transparent'
                                }}
                            >
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1f2937', fontWeight: '500' }}>
                                    {conv.title}
                                </p>
                                <small style={{ color: '#9ca3af' }}>
                                    {new Date(conv.createdAt).toLocaleDateString('vi-VN')}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={mainAreaStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaRobot style={{ fontSize: '1.8rem', color: '#6366f1' }} />
                        <div>
                            <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.3rem' }}>AI Assistant Pro</h1>
                            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
                                🇻🇳 Hỗ trợ tiếng Việt 24/7 • Phân tích dữ liệu • Dự báo nhu cầu
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={messagesContainerStyle}>
                    {messages.length === 0 ? (
                        <div style={welcomeStyle}>
                            <FaRobot style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }} />
                            <h2 style={{ color: '#9ca3af', marginBottom: '1rem' }}>Xin chào! 👋</h2>
                            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Tôi có thể giúp bạn:</p>
                            
                            <div style={templatesGridStyle}>
                                {templates.map((template, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(template.prompt)}
                                        style={templateButtonStyle}
                                    >
                                        <p style={{ fontWeight: '600', color: '#1f2937' }}>{template.title}</p>
                                        <small style={{ color: '#6b7280' }}>{template.prompt}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {messages.map(msg => (
                                <div key={msg.id} style={messageWrapperStyle(msg.type)}>
                                    {msg.type === 'assistant' && (
                                        <FaRobot style={{ fontSize: '1.2rem', color: '#6366f1', marginRight: '12px', flexShrink: 0 }} />
                                    )}
                                    <div style={messageBubbleStyle(msg.type)}>
                                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                            {msg.content}
                                        </p>
                                        <small style={{ marginTop: '8px', display: 'block', opacity: 0.6, fontSize: '0.75rem' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                                            {msg.tokens && ` • ${msg.tokens} tokens`}
                                        </small>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={messageWrapperStyle('assistant')}>
                                    <FaRobot style={{ fontSize: '1.2rem', color: '#6366f1', marginRight: '12px' }} />
                                    <div style={{ ...messageBubbleStyle('assistant'), fontStyle: 'italic' }}>
                                        ✍️ Đang suy nghĩ...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={inputAreaStyle}>
                    <div style={inputWrapperStyle}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            placeholder="Hỏi gì đó (ví dụ: 'Dự báo nhu cầu sản phẩm X tháng sau')"
                            style={inputFieldStyle}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || loading}
                            style={sendButtonStyle}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                    <small style={{ color: '#9ca3af', textAlign: 'center' }}>
                        Hỗ trợ: So sánh dữ liệu • Dự báo • Phân tích NCC • Tối ưu kho hàng
                    </small>
                </div>
            </div>
        </div>
    );
};

// Styles
const containerStyle = { display: 'flex', height: '100vh', background: '#f9fafb' };

const sidebarStyle = {
    width: '280px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
};

const newChatButtonStyle = {
    padding: '12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '1.5rem',
    transition: 'all 0.2s'
};

const historyStyle = { flex: 1 };
const historyItemStyle = {
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.2s'
};

const mainAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'white'
};

const headerStyle = {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(to right, #f9fafb, white)'
};

const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column'
};

const welcomeStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1
};

const templatesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '600px'
};

const templateButtonStyle = {
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
};

const messageWrapperStyle = (type) => ({
    display: 'flex',
    justifyContent: type === 'user' ? 'flex-end' : 'flex-start',
    marginBottom: '1rem',
    alignItems: 'flex-end'
});

const messageBubbleStyle = (type) => ({
    maxWidth: '60%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: type === 'user' ? '#3b82f6' : '#f3f4f6',
    color: type === 'user' ? 'white' : '#1f2937',
    wordWrap: 'break-word'
});

const inputAreaStyle = {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e5e7eb',
    background: '#fafbfc'
};

const inputWrapperStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px'
};

const inputFieldStyle = {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none'
};

const sendButtonStyle = {
    padding: '12px 18px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
};

export default AIAssistantProPage;
