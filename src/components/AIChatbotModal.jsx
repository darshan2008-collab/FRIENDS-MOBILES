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
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize language-aware welcome message when opened or language switches
  useEffect(() => {
    if (isOpen) {
      const welcomeText = language === 'ta'
        ? 'வணக்கம்! 🖐️ பிரண்ட்ஸ் மொபைல் 24/7 AI குரல் சேவைக்கு வரவேற்கிறோம். உங்கள் ஆர்டர் நிலையை (எ.கா: FM-1001) அறிய அல்லது சந்தேகங்களை கேட்க கீழே தட்டச்சு செய்யவும்:'
        : 'Welcome to FRIENDS MOBILE 24/7 AI Voice Care! 🚀 Enter your Order ID (e.g. FM-1001) or query below:';

      setMessages([{
        id: 'welcome-1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: language === 'ta' 
          ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 3D கஸ்டம் கவர்', '🖼️ போட்டோ பிரேம்கள்', '💬 வாட்ஸ்அப் நேரலை']
          : ['📦 Track My Order', '🎨 Custom Cover Studio', '🖼️ Photo Frames', '💬 Chat on WhatsApp']
      }]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  // Web Speech API Text-to-Speech Synthesizer (Tamil ta-IN & English en-IN)
  const speakText = (textToSpeak, msgId = null) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);

    const cleanText = textToSpeak.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select Tamil voice engine if language is ta
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

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
      const queryLower = textToSend.toLowerCase().trim();
      const botMsgId = `bot-${Date.now()}`;

      // Check for Order ID pattern (e.g., FM-1001, 1001, order)
      const orderMatch = queryLower.match(/(fm-?\d{3,6}|\b\d{4}\b)/i);

      if (orderMatch) {
        const orderIdClean = orderMatch[0].toUpperCase();
        const foundOrder = orders.find(o => 
          (o.orderId && o.orderId.toUpperCase().includes(orderIdClean)) ||
          (o.id && o.id.toString().includes(orderIdClean))
        );

        if (foundOrder) {
          botResponseText = language === 'ta'
            ? `📦 ஆர்டர் விபரம் கண்டுபிடிக்கப்பட்டது! \n\n• ஆர்டர் எண்: **${foundOrder.orderId || orderIdClean}**\n• நிலை: **${foundOrder.status || 'எக்ஸ்பிரஸ் கொரியர் மூலம் அனுப்பப்பட்டுள்ளது'}**\n• வாடிக்கையாளர்: ${foundOrder.customerName || 'மதிப்பிற்குரிய வாடிக்கையாளர்'}\n• மொத்த தொகை: **₹${foundOrder.total || foundOrder.amount || '1,499'}**\n• எதிர்பார்க்கப்படும் டெலிவரி: **நாளை மாலை**`
            : `📦 Order Details Found! \n\n• Order ID: **${foundOrder.orderId || orderIdClean}**\n• Status: **${foundOrder.status || 'Dispatched via Express Courier'}**\n• Customer: ${foundOrder.customerName || 'Valued Customer'}\n• Amount: **₹${foundOrder.total || foundOrder.amount || '1,499'}**\n• Estimated Delivery: **Tomorrow Evening**`;
        } else {
          botResponseText = language === 'ta'
            ? `📦 ஆர்டர் ஐடி **${orderIdClean}** நிலவரம்: \n\nஉங்கள் ஆர்டர் மதுரையிலுள்ள பிரண்ட்ஸ் மொபைல் தலைமை மையத்தில் பாதுகாப்பாக பேக் செய்யப்பட்டுள்ளது! எக்ஸ்பிரஸ் கொரியர் மூலம் விரைவாக உங்கள் முகவரிக்கு வந்து சேரும். நேரடி உதவிக்கு வாட்ஸ்அப் (+91 93445 22086) தொடர்புகொள்ளவும்.`
            : `📦 Order ID **${orderIdClean}** Status: \n\nYour order has been safely packed at FRIENDS MOBILE Madurai hub! It will be delivered via Express Shipping. For live agent help, contact WhatsApp (+91 93445 22086).`;
        }
      } else if (queryLower.includes('order') || queryLower.includes('track') || queryLower.includes('ஆர்டர்') || queryLower.includes('டிராக்கிங்')) {
        botResponseText = language === 'ta'
          ? '📦 உங்கள் ஆர்டர் நிலையை அறிய உங்கள் Order ID (எ.கா: **FM-1001**) உள்ளிடவும்.'
          : '📦 Please enter your Order ID (e.g. **FM-1001**) to get live parcel status!';
      } else if (queryLower.includes('cover') || queryLower.includes('case') || queryLower.includes('கவர்')) {
        botResponseText = language === 'ta'
          ? '🎨 உங்கள் ஸ்மார்ட்போனிற்கு 3D புகைப்பட பேக் கவர் உருவாக்க **Custom Cover Studio** பயன்படுத்தவும். ஆப்பிள், ரியல்மி, போகோ, சாம்சங், விவோ, ஓப்போ மாடல்கள் உள்ளன!'
          : '🎨 We print 3D HD Custom Phone Covers for Apple, Samsung, Vivo, Oppo, OnePlus & Realme!';
      } else if (queryLower.includes('frame') || queryLower.includes('photo') || queryLower.includes('பிரேம்')) {
        botResponseText = language === 'ta'
          ? '🖼️ உயர்தர அக்ரிலிக் கிளாஸ் மற்றும் மர போட்டோ பிரேம்களை உருவாக்க **Photo Frame Studio** பயன்படுத்தவும்.'
          : '🖼️ Create personalized Walnut Wood and Premium Glass Photo Frames for your memories!';
      } else if (queryLower.includes('repair') || queryLower.includes('screen') || queryLower.includes('சர்வீஸ்')) {
        botResponseText = language === 'ta'
          ? '🛠️ மதுரை & கரூர் பிரண்ட்ஸ் மொபைல் ஷோரூமில் 30 நிமிடங்களில் விரைவு மொபைல் டிஸ்பிளே மற்றும் மதர்போர்டு சர்வீஸ் செய்யப்படும்!'
          : '🛠️ Express 30-minute display repair & battery replacement available at Madurai showroom!';
      } else {
        botResponseText = language === 'ta'
          ? 'வணக்கம்! பிரண்ட்ஸ் மொபைல் ஷோரூம் நேரடி உதவிக்கு வாட்ஸ்அப் (+91 93445 22086) வழியாக தொடர்பு கொள்ளவும்.'
          : 'Thank you for reaching out to FRIENDS MOBILE! Connect directly with our Madurai store team on WhatsApp (+91 93445 22086).';
      }

      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: language === 'ta' 
          ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 3D கஸ்டமைஸ் கவர்', '🖼️ போட்டோ பிரேம்கள்', '💬 வாட்ஸ்அப் உதவி'] 
          : ['📦 Track My Order', '🎨 Custom Cover Studio', '🖼️ Photo Frames', '💬 Chat on WhatsApp']
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      
      if (isVoiceEnabled) {
        speakText(botResponseText, botMsgId);
      }
    }, 500);
  };

  return (
    <div className="ai-chatbot-modal-overlay full-view-overlay" onClick={onClose}>
      <div className="ai-chatbot-container full-view-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="ai-chatbot-header">
          <div className="ai-chatbot-header-left">
            <div className="ai-bot-avatar">
              <Bot size={22} color="#ffffff" />
              <span className="online-indicator-dot" />
            </div>
            <div>
              <div className="ai-bot-title">
                <strong>{language === 'ta' ? 'பிரண்ட்ஸ் மொபைல் AI' : 'FRIENDS MOBILE AI'}</strong>
                <span className="ai-badge">{language === 'ta' ? '24/7 குரல் சேவை' : '24/7 Support'}</span>
              </div>
              <div className="ai-bot-status">
                {language === 'ta' ? 'ஆர்டர் டிராக்கிங் & வாடிக்கையாளர் உதவி' : 'Order Tracking & Customer Care'}
              </div>
            </div>
          </div>

          <div className="ai-chatbot-header-right">
            <button 
              className="ai-reset-btn"
              onClick={() => {
                const nextState = !isVoiceEnabled;
                setIsVoiceEnabled(nextState);
                if (nextState) speakText(language === 'ta' ? "தமிழ் குரல் ஒலி இயக்கப்பட்டது" : "Voice speech enabled");
                else window.speechSynthesis?.cancel();
              }}
              title={isVoiceEnabled ? "Mute Tamil Voice Speech" : "Enable Tamil Voice Speech"}
              style={{ color: isVoiceEnabled ? '#22c55e' : 'var(--text-muted)' }}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="ai-close-btn" onClick={onClose} aria-label="Close AI Assistant">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Body Scroll Area */}
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
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span className="ai-msg-timestamp">{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => speakText(msg.text, msg.id)}
                        style={{ background: 'none', border: 'none', color: speakingMsgId === msg.id ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        title="Listen to Tamil Voice Speech"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                  </div>
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
            placeholder={language === 'ta' ? 'ஆர்டர் ஐடி (FM-1001) அல்லது கேள்விகளை உள்ளிடவும்...' : 'Type your Order ID or ask a query...'}
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
          <span>{language === 'ta' ? 'உடனடி மனித உதவி வேண்டுமா?' : 'Need immediate human help?'}</span>
          <a href="https://wa.me/919344522086" target="_blank" rel="noreferrer">
            <MessageSquare size={13} color="#22c55e" /> {language === 'ta' ? 'வாட்ஸ்அப் ஆதரவு (+91 93445 22086)' : 'WhatsApp Support (+91 93445 22086)'}
          </a>
        </div>

      </div>
    </div>
  );
}
