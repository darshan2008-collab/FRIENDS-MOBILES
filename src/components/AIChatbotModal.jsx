import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, User, Sparkles, Package, Truck, Phone, MessageSquare, 
  RefreshCw, ChevronRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, 
  HelpCircle, Smartphone, Frame, ShoppingBag, ArrowRight, Maximize2, Minimize2
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function AIChatbotModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  currentUser, 
  onOpenCustomCover, 
  onOpenCustomFrame,
  onOpenShop,
  onOpenUserAccount,
  addToast 
}) {
  const [isCompactView, setIsCompactView] = useState(false); // Default: false (Full View on Desktop & Mobile)
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! 👋 Welcome to **FRIENDS MOBILE 24/7 AI Customer Assistant**. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '📦 Track My Order',
        '🎨 Custom Back Cover Query',
        '🖼️ Photo Frame Help',
        '🚚 Shipping & COD Info',
        '📞 Connect with Support'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  // AI Knowledge Base Engine & Order Matcher
  const processAIQuery = (queryText) => {
    const text = queryText.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Order ID Tracking (e.g., FM-1001, #1001, 1001, order 123)
    const orderMatch = queryText.match(/(FM-?\d+|#?\d{4,})/i);
    const hasOrderKeyword = text.includes('order') || text.includes('track') || text.includes('status') || text.includes('delivery date');

    if (orderMatch || (hasOrderKeyword && (currentUser || orders.length > 0))) {
      let matchedOrder = null;
      if (orderMatch) {
        const searchedId = orderMatch[0].replace('#', '').toUpperCase();
        matchedOrder = orders.find(o => 
          (o.orderId && o.orderId.toUpperCase().includes(searchedId)) || 
          (o.id && String(o.id).toUpperCase().includes(searchedId))
        );
        if (!matchedOrder) {
          // Check local storage saved user orders
          try {
            const savedOrders = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
            matchedOrder = savedOrders.find(o => 
              (o.orderId && o.orderId.toUpperCase().includes(searchedId)) || 
              (o.id && String(o.id).toUpperCase().includes(searchedId))
            );
          } catch {}
        }
      } else if (orders.length > 0) {
        matchedOrder = orders[0]; // Most recent order
      }

      if (matchedOrder) {
        const estDelivery = matchedOrder.estimatedDelivery || 'Within 2-3 Business Days';
        const trackingNum = matchedOrder.trackingNumber || `FM-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
        const courier = matchedOrder.courier || 'Express BlueDart / DTDC Air Logistics';
        
        return {
          text: `📦 **Order Status Details for ${matchedOrder.orderId || '#FM-' + matchedOrder.id}**:\n\n` +
                `• **Current Status**: 🟢 **${matchedOrder.status || 'Processing in Workshop'}**\n` +
                `• **Items Purchased**: ${Array.isArray(matchedOrder.items) ? matchedOrder.items.map(i => i.title || i.name).join(', ') : 'Mobile Accessory / Custom Item'}\n` +
                `• **Estimated Delivery**: 🚚 **${estDelivery}**\n` +
                `• **Logistics Partner**: ${courier}\n` +
                `• **Tracking ID**: \`${trackingNum}\`\n` +
                `• **Payment**: ${matchedOrder.paymentMethod || 'Cash on Delivery'}\n\n` +
                `Need further modification or address update? Feel free to ask!`,
          quickReplies: ['📍 Update Delivery Address', '💬 Chat on WhatsApp', '🛍️ Browse More Products'],
          orderCard: matchedOrder
        };
      } else if (orderMatch) {
        return {
          text: `⚠️ **Order #${orderMatch[0]} Not Found** in our live system.\n\n` +
                `Please double-check your Order ID (usually starts with **FM-** or found in your SMS/Email invoice).\n\n` +
                `If you placed the order recently, it may take up to 10 minutes to sync. You can also view all your past orders in your account profile!`,
          quickReplies: ['👤 View My Account Orders', '📞 Talk to Human Agent', '📦 Try Another Order ID']
        };
      } else {
        return {
          text: `🔍 Please provide your **Order ID** (e.g., \`FM-1002\` or \`1001\`) so I can check your real-time printing & dispatch status directly from our warehouse!`,
          quickReplies: ['👤 Check My Saved Orders', '💬 WhatsApp Support']
        };
      }
    }

    // 2. Custom Back Cover Queries
    if (text.includes('cover') || text.includes('custom') || text.includes('case') || text.includes('phone cover') || text.includes('printing')) {
      return {
        text: `✨ **3D Custom Phone Cover Studio Details**:\n\n` +
              `• **Price**: Only **₹399** (Flat 20% OFF! Original ₹499).\n` +
              `• **Supported Brands**: Apple iPhone, Samsung, Vivo, Oppo, OnePlus, Realme, Poco, Xiaomi & more.\n` +
              `• **Materials**: 3D Hard Polycarbonate (Full Edge-to-Edge Wrap Print), Soft Gel Silicone TPU & Glass Finish.\n` +
              `• **Print Quality**: High-Definition Anti-Scratch UV Sublimation (Non-fading 5 Year Warranty).\n` +
              `• **Upload Options**: Photos, Custom Text/Names, Logos, or HD Documents (PDF/PSD/PNG).\n\n` +
              `Would you like to open the Custom Cover Studio right now?`,
        quickReplies: ['🎨 Open Cover Studio', '📱 Check Supported Models', '🚚 Delivery Time']
      };
    }

    // 3. Photo Frame Queries
    if (text.includes('frame') || text.includes('photo') || text.includes('gift') || text.includes('picture')) {
      return {
        text: `🖼️ **Custom Photo Frame Studio Details**:\n\n` +
              `• **Prices**: Starting at just **₹499** up to ₹1,499 depending on size.\n` +
              `• **Frame Material**: Premium Solid Wood with Anti-Glare Synthetic Glass Cover.\n` +
              `• **Available Sizes**: Mini Desk Frame (6x8"), Medium Wall Frame (8x10"), Royal Living Room Canvas (12x18").\n` +
              `• **Free Customization**: Add names, dates, quotes & multi-photo collages.\n\n` +
              `Would you like to design your custom photo frame now?`,
        quickReplies: ['🖼️ Open Photo Frame Studio', '🚚 Shipping Charges', '💳 Payment Methods']
      };
    }

    // 4. Shipping, Delivery & Charges
    if (text.includes('shipping') || text.includes('delivery') || text.includes('charge') || text.includes('fast') || text.includes('time') || text.includes('courier')) {
      return {
        text: `🚚 **Shipping & Delivery Timelines**:\n\n` +
              `• **Tamil Nadu (Karur/Madurai/Chennai/Coimbatore)**: 24 - 48 Hours Express Courier.\n` +
              `• **Rest of India**: 3 - 5 Business Days.\n` +
              `• **Standard Shipping Fee**: ₹49 (FREE Shipping on orders above ₹1,000!).\n` +
              `• **Cash on Delivery (COD)**: Available pan-India with zero extra COD fees.\n` +
              `• **Real-Time SMS & WhatsApp Alerts**: Sent automatically once your package is dispatched!`,
        quickReplies: ['📦 Track My Order', '💳 Payment Options', '📍 Showroom Address']
      };
    }

    // 5. Store Location & Contact Info
    if (text.includes('location') || text.includes('store') || text.includes('address') || text.includes('phone') || text.includes('contact') || text.includes('karur') || text.includes('madurai') || text.includes('whatsapp')) {
      return {
        text: `📍 **FRIENDS MOBILE Showroom Details**:\n\n` +
              `• **Flagship Store Address**: South Gandhigramam, Karur / Madurai Highway, Tamil Nadu - 639004.\n` +
              `• **Store Timing**: Mon - Sun: 9:00 AM – 10:00 PM (Open All 7 Days!).\n` +
              `• **Support Phone**: 📞 **+91 74485 78507**\n` +
              `• **WhatsApp Direct Support**: 💬 +91 74485 78507\n` +
              `• **Email**: support@friendsmobile.in\n\n` +
              `You can visit our store for 30-Minute instant custom printing or order online!`,
        quickReplies: ['💬 Chat on WhatsApp', '📞 Call Store directly', '🛍️ View Products']
      };
    }

    // 6. Return, Replacement & Cancellation
    if (text.includes('return') || text.includes('replace') || text.includes('cancel') || text.includes('refund') || text.includes('damage')) {
      return {
        text: `🛡️ **Returns & 100% Satisfaction Guarantee**:\n\n` +
              `• **Damaged/Wrong Item Received**: Free instant replacement within 7 Days! No questions asked.\n` +
              `• **Custom Cover Fit Guarantee**: If the cover doesn't fit your phone model perfectly, we print a replacement free of charge.\n` +
              `• **How to raise return**: Simply send a photo/video of the defect on WhatsApp to **+91 74485 78507**.\n` +
              `• **Refund Processing**: Instant UPI / Bank Refund processed within 24 hours of return approval.`,
        quickReplies: ['💬 Raise WhatsApp Ticket', '👤 My Orders', '📞 Call Support']
      };
    }

    // 7. General Friendly / Dual Theme / Greetings
    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('good morning') || text.includes('good evening')) {
      return {
        text: `Hello! 👋 How can I assist you with your FRIENDS MOBILE shopping today?\n\n` +
              `You can ask me to **track your order**, inquire about **custom 3D covers**, **photo frames**, or **store details**!`,
        quickReplies: ['📦 Track My Order', '🎨 Custom Back Cover', '🖼️ Photo Frames', '📞 Contact Store']
      };
    }

    // Default Intelligence Fallback
    return {
      text: `I'm here to assist you with everything at FRIENDS MOBILE! 🚀\n\n` +
            `Here are a few quick things I can help you with:\n` +
            `• Track live status & delivery date using your **Order ID** (e.g., \`FM-1001\`)\n` +
            `• Custom 3D phone cover designs & model availability\n` +
            `• Designer photo frames & gift options\n` +
            `• Shipping speed, COD policies & showroom details\n\n` +
            `Or speak directly with our team on WhatsApp!`,
      quickReplies: ['📦 Track My Order', '🎨 Custom Cover Studio', '💬 Talk on WhatsApp', '📍 Store Address']
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = processAIQuery(query);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: response.quickReplies,
        orderCard: response.orderCard
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickReplyClick = (replyText) => {
    if (replyText.includes('Open Cover Studio') || replyText.includes('Custom Back Cover')) {
      onClose();
      if (onOpenCustomCover) onOpenCustomCover();
      return;
    }
    if (replyText.includes('Open Photo Frame Studio') || replyText.includes('Photo Frame')) {
      onClose();
      if (onOpenCustomFrame) onOpenCustomFrame();
      return;
    }
    if (replyText.includes('View My Account') || replyText.includes('Check My Saved Orders')) {
      onClose();
      if (onOpenUserAccount) onOpenUserAccount();
      return;
    }
    if (replyText.includes('Browse More Products') || replyText.includes('View Products')) {
      onClose();
      if (onOpenShop) onOpenShop('All');
      return;
    }
    if (replyText.includes('WhatsApp')) {
      window.open('https://wa.me/917448578507', '_blank');
      return;
    }
    if (replyText.includes('Call Store') || replyText.includes('Call Support')) {
      window.location.href = 'tel:+917448578507';
      return;
    }

    handleSendMessage(replyText);
  };

  return (
    <div className={`ai-chatbot-modal-overlay ${isCompactView ? 'compact-overlay' : 'full-view-overlay'}`} onClick={onClose}>
      <div className={`ai-chatbot-container ${isCompactView ? 'compact-container' : 'full-view-container'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
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
              onClick={() => setIsCompactView(!isCompactView)}
              title={isCompactView ? "Switch to Full Screen View" : "Switch to Compact Window"}
            >
              {isCompactView ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button 
              className="ai-reset-btn"
              onClick={() => {
                setMessages([{
                  id: 'welcome-reset',
                  sender: 'bot',
                  text: `Chat reset! 👋 How can I help you today? Enter your Order ID to track your parcel or select an option below:`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  quickReplies: ['📦 Track My Order', '🎨 Custom Back Cover', '🖼️ Photo Frames', '💬 Chat on WhatsApp']
                }]);
              }}
              title="Reset Chat"
            >
              <RefreshCw size={16} />
            </button>
            <button className="ai-close-btn" onClick={onClose} aria-label="Close AI Assistant">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips Ribbon */}
        <div className="ai-chips-ribbon">
          <button className="ai-chip" onClick={() => handleQuickReplyClick('📦 Track My Order')}>
            <Package size={13} color="#FF5500" /> Track Order
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('🎨 Custom Back Cover Query')}>
            <Smartphone size={13} color="#FF5500" /> Custom Cover
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('🖼️ Photo Frame Help')}>
            <Frame size={13} color="#FF5500" /> Photo Frame
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('🚚 Shipping Charges')}>
            <Truck size={13} color="#FF5500" /> Delivery Speed
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('💬 Chat on WhatsApp')}>
            <MessageSquare size={13} color="#22c55e" /> WhatsApp Live
          </button>
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
                  <div className="ai-msg-text">
                    {msg.text.split('\n').map((line, idx) => {
                      if (!line.trim()) return <br key={idx} />;
                      
                      // Bold formatting renderer
                      const renderFormatted = (str) => {
                        const parts = str.split(/(\*\*.*?\*\*|\`.*?\`)/g);
                        return parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                          }
                          if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={pIdx} className="ai-code-inline">{part.slice(1, -1)}</code>;
                          }
                          return part;
                        });
                      };

                      return <p key={idx}>{renderFormatted(line)}</p>;
                    })}
                  </div>

                  {/* Rich Order Card inside Chat Bubble */}
                  {msg.orderCard && (
                    <div className="ai-order-rich-card">
                      <div className="order-rich-header">
                        <div className="order-rich-id">
                          <Package size={16} color="#FF5500" />
                          <span>Order #{msg.orderCard.orderId || msg.orderCard.id}</span>
                        </div>
                        <span className="order-rich-status-badge">
                          {msg.orderCard.status || 'Processing'}
                        </span>
                      </div>
                      <div className="order-rich-body">
                        <div className="order-rich-row">
                          <span>Total Amount:</span>
                          <strong>₹{msg.orderCard.total || msg.orderCard.price || '399'}</strong>
                        </div>
                        <div className="order-rich-row">
                          <span>Est. Delivery:</span>
                          <strong style={{ color: '#22c55e' }}>{msg.orderCard.estimatedDelivery || '2-3 Business Days'}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="ai-msg-timestamp">{msg.timestamp}</div>
                </div>

                {/* Quick Reply Buttons under Bot Messages */}
                {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="ai-quick-replies-wrap">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button 
                        key={rIdx} 
                        className="ai-quick-reply-btn"
                        onClick={() => handleQuickReplyClick(reply)}
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

          {/* Typing Indicator */}
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
            placeholder="Type your Order ID (e.g. FM-1001) or ask a query..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="ai-send-btn"
            disabled={!inputQuery.trim()}
            aria-label="Send Message"
          >
            <Send size={18} />
          </button>
        </form>

        {/* Showroom Direct WhatsApp Banner Footer */}
        <div className="ai-chatbot-footer-hint">
          <span>Need immediate human help?</span>
          <a href="https://wa.me/917448578507" target="_blank" rel="noreferrer">
            <MessageSquare size={13} color="#22c55e" /> WhatsApp Support (+91 74485 78507)
          </a>
        </div>

      </div>
    </div>
  );
}
