import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader, AlertCircle } from 'lucide-react';
import { getDocumentViewUrl, getOrCreateChatSession, sendChatMessage } from './api';
import './ChatPage.css';

function ChatPage({ user }) {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState('');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // 1. Get Presigned URL for PDF
      const urlRes = await getDocumentViewUrl(docId);
      setPdfUrl(urlRes.data.data);

      // 2. Get or Create Chat Session
      const sessionRes = await getOrCreateChatSession(docId);
      setSession(sessionRes.data.data);
      setMessages(sessionRes.data.data.messages || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending || !session) return;

    const currentMsg = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    // Optimistic UI update for user message
    const tempUserMsg = {
      messId: Date.now(),
      role: 'user',
      content: currentMsg,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await sendChatMessage(session.sessionId, currentMsg);
      // Backend returns the AI response message
      const aiMessage = res.data.data;
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      alert('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      // Revert optimistic update on failure
      setMessages(prev => prev.filter(m => m.messId !== tempUserMsg.messId));
      setInputMsg(currentMsg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <Loader className="spin" />
        <p>Đang chuẩn bị không gian học tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <AlertCircle size={40} />
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Quay lại Trang chủ</button>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft /> Quay lại
          </button>
          <div className="chat-title">
            <h3>{session?.sessionTitle || 'Hỏi đáp tài liệu'}</h3>
          </div>
        </div>
        <div className="chat-header-right">
          <div className="avatar">
            {user?.accountName?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="chat-container">
        
        {/* Left: PDF Viewer */}
        <div className="pdf-viewer-container">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              title="PDF Viewer" 
              className="pdf-iframe"
              frameBorder="0"
            />
          ) : (
            <div className="pdf-empty">
              <AlertCircle />
              <p>Không thể tải PDF.</p>
            </div>
          )}
        </div>

        {/* Right: Chat Panel */}
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <Bot size={40} />
                <h3>Bắt đầu cuộc hội thoại</h3>
                <p>Hãy hỏi tôi bất kỳ điều gì về tài liệu này!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.messId || idx} className={`chat-bubble-wrapper ${isUser ? 'user' : 'ai'}`}>
                    {!isUser && (
                      <div className="chat-avatar ai">
                        <Bot size={18} />
                      </div>
                    )}
                    <div className="chat-bubble">
                      <div className="chat-content">{msg.content}</div>
                      <div className="chat-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {isUser && (
                      <div className="chat-avatar user">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {sending && (
              <div className="chat-bubble-wrapper ai">
                <div className="chat-avatar ai">
                  <Bot size={18} />
                </div>
                <div className="chat-bubble typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Nhập câu hỏi của bạn..." 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={!inputMsg.trim() || sending}>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default ChatPage;
