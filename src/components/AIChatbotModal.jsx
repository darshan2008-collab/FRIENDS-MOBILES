import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, User, Sparkles, Package, Truck, Phone, MessageSquare, 
  RefreshCw, ChevronRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, 
  HelpCircle, Smartphone, Frame, ShoppingBag, ArrowRight, Maximize2, Minimize2,
  Volume2, VolumeX, Languages
} from 'lucide-react';

export default function AIChatbotModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  products = [],
  currentUser, 
  language = 'en',
  onOpenCustomCover, 
  onOpenCustomFrame,
  onOpenShop,
  onOpenUserAccount
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: language === 'ta' 
        ? 'வணக்கம்! 🖐️ பிரண்ட்ஸ் மொபைல் AI உதவி மையத்திற்கு வரவேற்கிறோம். உங்கள் ஆர்டர் டிராக்கிங் அல்லது சந்தேகங்களுக்கு நான் உதவவா?' 
        : 'Welcome to FRIENDS MOBILE 24/7 AI Care! 🚀 How can I assist you today? Enter your Order ID (e.g. FM-1001) to track live shipping:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: language === 'ta' 
        ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 கஸ்டம் கவர்', '🖼️ போட்டோ பிரேம்', '💬 வாட்ஸ்அப் உதவி']
        : ['📦 Track My Order', '🎨 Custom Cover Studio', '🖼️ Photo Frames', '💬 Chat on WhatsApp']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  const speakText = (textToSpeak) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (textOverride = null) => {
    const textToSend = textOverride || inputQuery;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponseText = '';
      const queryLower = textToSend.toLowerCase();

      if (queryLower.includes('order') || queryLower.includes('track') || queryLower.includes('ஆர்டர்') || queryLower.includes('டிராக்கிங்')) {
        botResponseText = language === 'ta'
          ? '📦 உங்கள் ஆர்டர் நிலையை அறிந்துகொள்ள உங்கள் Order ID (எ.கா: FM-1001) உள்ளிடவும் அல்லது உங்கள் கணக்கிற்கு செல்லவும்.'
          : '📦 Enter your 4 or 6 digit Order ID (e.g. FM-1001) to view real-time tracking details and courier partner updates!';
      } else if (queryLower.includes('cover') || queryLower.includes('case') || queryLower.includes('கவர்')) {
        botResponseText = language === 'ta'
          ? '🎨 உங்கள் ஸ்மார்ட்போனிற்கு 3D கஸ்டம் பேக் கவர் டிசைன் செய்ய Custom Cover Studio-வை பார்வையிடவும்.'
          : '🎨 We print 3D HD Custom Phone Back Covers for Apple, Samsung, Vivo, Oppo, OnePlus & Realme!';
      } else if (queryLower.includes('frame') || queryLower.includes('photo') || queryLower.includes('பிரேம்')) {
        botResponseText = language === 'ta'
          ? '🖼️ உயர்தர மர மற்றும் அக்ரிலிக் கிளாஸ் போட்டோ பிரேம்களை உருவாக்க Photo Frame Studio பயன்படுத்தவும்.'
          : '🖼️ Create personalized Walnut Wood and Premium Glass Photo Frames for your memories!';
      } else {
        botResponseText = language === 'ta'
          ? 'நன்றி! எங்கள் வாடிக்கையாளர் சேவைக்குழு உங்களுக்கு உதவ தயார் நிலையில் உள்ளது. மேலும் தகவலுக்கு வாட்ஸ்அப் வழியாக தொடர்பு கொள்ளலாம்.'
          : 'Thank you for reaching out to FRIENDS MOBILE! You can also connect directly with our Madurai store team on WhatsApp (+91 93445 22086).';
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: language === 'ta' 
          ? ['💬 வாட்ஸ்அப் உதவி', '🛍️ கடையில் பார்க்க'] 
          : ['💬 Chat on WhatsApp', '🛍️ Browse Store Catalog']
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      if (isVoiceEnabled) {
        speakText(botResponseText);
      }
    }, 600);
  };

  return (
    <div className="ai-chatbot-modal-overlay full-view-overlay" onClick={onClose}>
      <div className="ai-chatbot-container full-view-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="ai-chatbot-header">
          <div className="ai-chatbot-header-left">
            <div className="ai-bot-avatar">
              <Bot size={22} color="#ffffff" />
              <span className="online-indicator-dot" />
            </div>
            <div>
              <div className="ai-bot-title">
                <strong>FRIENDS MOBILE AI</strong>
                <span className="ai-badge">24/7 Support</span>
              </div>
              <div className="ai-bot-status">Order Tracking &amp; Customer Care</div>
            </div>
          </div>

          <div className="ai-chatbot-header-right">
            <button 
              className="ai-reset-btn"
              onClick={() => {
                const nextState = !isVoiceEnabled;
                setIsVoiceEnabled(nextState);
                if (nextState) speakText(language === 'ta' ? "குரல் சேவை இயக்கப்பட்டது" : "Voice speech enabled");
              }}
              style={{ color: isVoiceEnabled ? '#22c55e' : 'var(--text-muted)' }}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="ai-close-btn" onClick={onClose} aria-label="Close AI Assistant">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="ai-messages-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
              {msg.sender === 'bot' && (
                <div className="ai-msg-avatar">
                  <Bot size={16} color="#ffffff" />
                </div>
              )}

              <div className="ai-msg-content-wrap">
                <div className={`ai-msg-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <div className="ai-msg-timestamp">{msg.timestamp}</div>
                </div>

                {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="ai-quick-replies-wrap">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button 
                        key={rIdx} 
                        className="ai-quick-reply-btn"
                        onClick={() => handleSendMessage(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="ai-user-msg-avatar">
                  {currentUser && currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row bot-row">
              <div className="ai-msg-avatar">
                <Bot size={16} color="#ffffff" />
              </div>
              <div className="ai-msg-bubble bot typing">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          className="ai-chatbot-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input 
            type="text"
            placeholder="Type your Order ID or ask a query..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="ai-send-btn"
            disabled={!inputQuery.trim()}
          >
            <Send size={18} />
          </button>
        </form>

        {/* Footer Hint */}
        <div className="ai-chatbot-footer-hint">
          <span>Need immediate human help?</span>
          <a href="https://wa.me/919344522086" target="_blank" rel="noreferrer">
            <MessageSquare size={13} color="#22c55e" /> WhatsApp Support (+91 93445 22086)
          </a>
        </div>

      </div>
    </div>
  );
}
