import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Send, Bot, Mic, MicOff, Phone, MessageSquare, 
  Volume2, VolumeX, Sparkles, Package, RefreshCw, CreditCard, 
  Palette, Wrench, Gift, AlertTriangle, Search, Frame
} from 'lucide-react';
import { getApiBaseUrl } from '../data/apiConfig';

const API_BASE = getApiBaseUrl();

export default function AIChatbotModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  products = [],
  currentUser, 
  onOpenCustomCover, 
  onOpenCustomFrame,
  onOpenShop,
  onOpenUserAccount,
  onOpenServiceModal,
  addToast
}) {
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Professional Fixed Chart categories with Lucide icons
  const FIXED_CHART_CATEGORIES = [
    { id: 'track_order', label: 'Order Tracking', IconComponent: Package, desc: 'Where is my parcel?' },
    { id: 'returns_cancel', label: 'Returns & Cancellation', IconComponent: RefreshCw, desc: 'Cancel order / 7 days replacement' },
    { id: 'payments_refund', label: 'Payments & Refund', IconComponent: CreditCard, desc: 'COD, UPI & refund status' },
    { id: 'custom_studio', label: 'Custom Covers & Frames', IconComponent: Palette, desc: '3D Photo cases & frames' },
    { id: 'mobile_repair', label: 'Mobile Repair Service', IconComponent: Wrench, desc: '30-Min display repair' },
    { id: 'offers_rewards', label: 'Offers & Reward Points', IconComponent: Gift, desc: 'Coupons & rewards' },
    { id: 'complaint_escalate', label: 'Report Complaint', IconComponent: AlertTriangle, desc: 'Direct owner contact & WhatsApp' }
  ];

  // Initialize welcome message & fixed chart menu when opened
  useEffect(() => {
    if (isOpen) {
      const welcomeText = `Welcome to FRIENDS MOBILE 24/7 Support Center.\n\nPlease select an option from our Fixed Support Chart below or enter your Order ID / query:`;

      const welcomeMsg = {
        id: 'welcome-1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isChartMenu: true,
        quickReplies: [
          'Track My Order',
          'Returns & Cancellation',
          'Payments & Refund',
          'Custom Covers',
          'Report Complaint'
        ]
      };

      setMessages((prev) => {
        if (!prev || prev.length === 0) {
          return [welcomeMsg];
        }
        return prev;
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const stopAllAudio = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = (text || '').replace(/[*_#•`]/g, '').trim();
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Toggle voice recording (Microphone Speech Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (addToast) addToast('Speech recognition is not supported in this browser', 'info');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        if (addToast) addToast('Listening... Speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Process message and generate Fixed Chart responses or Complaint Direct Contact
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

    setTimeout(async () => {
      let botResponseText = '';
      let actionButtons = null;
      let quickReplies = [];
      const queryLower = textToSend.toLowerCase().trim();
      const botMsgId = `bot-${Date.now()}`;

      // COMPLAINT & NEGATIVE REMARKS DETECTOR
      const complaintKeywords = [
        'complaint', 'worst', 'damaged', 'defective', 'broken', 'bad', 'fake', 'wrong', 
        'refund issue', 'delay', 'issue', 'problem', 'remark', 'demark', 'poor', 'scam', 
        'useless', 'terrible', 'cheated', 'unhappy', 'fraud', 'hated'
      ];

      const isComplaint = complaintKeywords.some(kw => queryLower.includes(kw)) || 
                          queryLower.includes('complaint_escalate');

      if (isComplaint) {
        botResponseText = `**FRIENDS MOBILE Direct Customer Care & Store Support**\n\nWe sincerely apologize for any inconvenience caused! For all complaints, remarks, defective items, or urgent support, please contact our helpline numbers directly:\n\n• **Direct Phone Calls**: **+91 93445 22086** / **+91 98424 52208**\n• **WhatsApp Direct Support**: **+91 93445 22086**\n• **Store Hub**: FRIENDS MOBILE 24/7 Care Desk, Madurai & Karur Branches.\n\nOur management team will inspect your issue and resolve it with top priority!`;

        actionButtons = [
          { label: 'Call +91 93445 22086', href: 'tel:+919344522086', type: 'call', IconComponent: Phone },
          { label: 'Chat on WhatsApp', href: 'https://wa.me/919344522086?text=Hello%20FRIENDS%20MOBILE%20I%20have%20a%20complaint', type: 'whatsapp', IconComponent: MessageSquare },
          { label: 'Call +91 98424 52208', href: 'tel:+919842452208', type: 'call', IconComponent: Phone }
        ];

        quickReplies = ['Track My Order', 'Returns & Cancellation', 'Main Support Chart'];

      } else {
        // Consolidated Order List across props, currentUser and localStorage
        const localOrders = [
          ...(Array.isArray(orders) ? orders : []),
          ...(currentUser && Array.isArray(currentUser.orders) ? currentUser.orders : []),
          ...(() => {
            try {
              const s = localStorage.getItem('fm_user_orders');
              return s ? JSON.parse(s) : [];
            } catch { return []; }
          })()
        ];

        // Flexible Order ID Matching (e.g. FM-ORD-876371, ORD-876371, FM-1001, or 4-8 digits)
        const orderMatch = queryLower.match(/(fm(?:-?ord)?-?\d{3,8}|\bord-?\d{3,8}\b|\b\d{4,8}\b)/i);

        if (orderMatch || queryLower.includes('track_order') || queryLower.includes('track') || queryLower.includes('parcel')) {
          if (orderMatch) {
            const orderIdRaw = orderMatch[0].toUpperCase();
            const cleanDigitsOrChars = orderIdRaw.replace(/[^A-Z0-9]/gi, '');

            let foundOrder = localOrders.find(o => {
              if (!o) return false;
              const oId = String(o.orderId || o.id || '').toUpperCase();
              const oClean = oId.replace(/[^A-Z0-9]/gi, '');
              return (
                oId === orderIdRaw ||
                oClean === cleanDigitsOrChars ||
                oId.includes(orderIdRaw) ||
                (cleanDigitsOrChars.length >= 4 && oClean.endsWith(cleanDigitsOrChars)) ||
                (cleanDigitsOrChars.length >= 4 && oClean.includes(cleanDigitsOrChars))
              );
            });

            // If not found locally, fetch from backend tracking endpoint
            if (!foundOrder && cleanDigitsOrChars.length >= 4) {
              try {
                const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderIdRaw)}`);
                if (res.ok) {
                  const data = await res.json();
                  if (data.success && data.order) {
                    foundOrder = data.order;
                  }
                }
              } catch (err) {
                console.warn('API order tracking lookup fallback:', err);
              }
            }

            if (foundOrder) {
              const itemsList = Array.isArray(foundOrder.items) && foundOrder.items.length > 0
                ? foundOrder.items.map(i => `${i.title || i.name || 'Mobile Item'} (x${i.quantity || 1})`).join(', ')
                : (foundOrder.title || 'Mobile Accessories');
              const customerName = foundOrder.customer?.name || foundOrder.customerName || currentUser?.name || 'Valued Customer';
              const orderStatus = foundOrder.status || 'Order Placed';
              const totalAmount = foundOrder.total || foundOrder.amount || foundOrder.subtotal || 0;
              const payMethod = foundOrder.paymentMethod || 'COD';
              const deliveryAddress = foundOrder.customer?.address || currentUser?.address || 'Delivery Address Provided';
              const displayOrderId = foundOrder.orderId || orderIdRaw;

              botResponseText = `**Order Details Found** 📦\n\n• **Order ID**: **${displayOrderId}**\n• **Status**: **${orderStatus}**\n• **Items**: ${itemsList}\n• **Total Amount**: **₹${totalAmount}** (${payMethod})\n• **Customer**: ${customerName}\n• **Delivery Address**: ${deliveryAddress}\n• **Estimated Delivery**: **2-3 Business Days via Express Courier**`;

              actionButtons = [
                { 
                  label: 'Track on WhatsApp', 
                  href: `https://wa.me/919344522086?text=Hello%20FRIENDS%20MOBILE%20Track%20Order%20${encodeURIComponent(displayOrderId)}`, 
                  type: 'whatsapp', 
                  IconComponent: MessageSquare 
                },
                { 
                  label: 'Call +91 93445 22086', 
                  href: 'tel:+919344522086', 
                  type: 'call', 
                  IconComponent: Phone 
                }
              ];
            } else {
              botResponseText = `**Order Status Lookup: ${orderIdRaw}** 📦\n\nYour order details are recorded. If newly placed, our warehouse team is packing it at the FRIENDS MOBILE hub for dispatch.\n\nFor real-time parcel dispatch updates or questions, connect with our care desk directly:`;

              actionButtons = [
                { 
                  label: 'Track on WhatsApp', 
                  href: `https://wa.me/919344522086?text=Hello%20FRIENDS%20MOBILE%20Track%20Order%20${encodeURIComponent(orderIdRaw)}`, 
                  type: 'whatsapp', 
                  IconComponent: MessageSquare 
                },
                { 
                  label: 'Call +91 93445 22086', 
                  href: 'tel:+919344522086', 
                  type: 'call', 
                  IconComponent: Phone 
                }
              ];
            }
          } else {
            // User requested tracking without entering an ID
            const recentOrder = localOrders[0];
            if (recentOrder) {
              const recentId = recentOrder.orderId || recentOrder.id;
              const recentStatus = recentOrder.status || 'Order Placed';
              const recentItems = Array.isArray(recentOrder.items) && recentOrder.items.length > 0
                ? recentOrder.items.map(i => `${i.title || i.name || 'Item'} (x${i.quantity || 1})`).join(', ')
                : (recentOrder.title || 'Mobile Items');

              botResponseText = `**Live Order Tracking (24/7 Care)** 📦\n\nFound your recent order:\n• **Order ID**: **${recentId}**\n• **Status**: **${recentStatus}**\n• **Items**: ${recentItems}\n• **Total**: ₹${recentOrder.total || recentOrder.amount || 0}\n\nEnter your Order ID below (e.g. **${recentId}**) or type any other Tracking Number to track live:`;
              quickReplies = [`Track ${recentId}`, 'Returns & Cancellation', 'Report Complaint'];
            } else {
              botResponseText = `**Order Tracking Care (24/7 Care)** 📦\n\nPlease enter your **Order ID** (e.g. **FM-ORD-876371** or last 6 digits) to view live parcel status.`;
              quickReplies = ['Returns & Cancellation', 'Payments & Refund', 'Report Complaint'];
            }
          }

          if (!quickReplies.length) {
            quickReplies = ['Returns & Cancellation', 'Payments & Refund', 'Report Complaint'];
          }

        } else if (queryLower.includes('returns_cancel') || queryLower.includes('return') || queryLower.includes('cancel')) {
          botResponseText = `**Returns & 7-Day Replacement Policy (Fixed Chart Step 2)**\n\n1. **Cancellation**: Orders can be cancelled before dispatch directly from your 'My Account' area.\n2. **7-Day Replacement**: We offer 100% free replacement for any wrong or defective items within 7 days.\n3. Received a damaged product? Click below to contact management immediately.`;

          quickReplies = ['Report Complaint', 'Track My Order', 'Main Support Chart'];

        } else if (queryLower.includes('payments_refund') || queryLower.includes('payment') || queryLower.includes('refund')) {
          botResponseText = `**Payments & Refund Status (Fixed Chart Step 3)**\n\n• **Cash on Delivery (COD)**: Available for all India pin codes.\n• **Online Payment**: GPay, PhonePe, UPI, Credit/Debit cards accepted.\n• **Refund Timeline**: Refunds for cancelled orders credited within 24-48 hours directly to your UPI/bank.`;

          quickReplies = ['Track My Order', 'Custom Covers', 'Report Complaint'];

        } else if (queryLower.includes('custom_studio') || queryLower.includes('cover') || queryLower.includes('frame')) {
          botResponseText = `**3D Custom Back Cover & Photo Frame Studio (Fixed Chart Step 4)**\n\n• **3D Photo Covers**: Print HD custom back covers for Apple, Samsung, Vivo, Oppo, OnePlus, Realme & Poco!\n• **Wooden & Glass Frames**: Premium photo frames with live 3D preview.`;

          actionButtons = [
            { label: 'Open Cover Studio', onClick: onOpenCustomCover, IconComponent: Palette },
            { label: 'Open Frame Studio', onClick: onOpenCustomFrame, IconComponent: Frame }
          ];

          quickReplies = ['Track My Order', 'Mobile Repair Service', 'Main Support Chart'];

        } else if (queryLower.includes('mobile_repair') || queryLower.includes('repair') || queryLower.includes('service') || queryLower.includes('display')) {
          botResponseText = `**Doorstep Mobile Repair & Executive Service (Fixed Chart Step 5)**\n\n• **Free Doorstep Pickup**: Store executive collects your device directly from your home in Karur & Madurai!\n• **Original Spares**: Broken screen/display, battery draining, charging port, motherboard & camera repairs.\n• **Live Real-time Tracking**: Track repair progress and diagnosis stages online.\n• **Official Service Warranty**: Quality tested before handover!`;

          actionButtons = [
            { 
              label: 'Book Doorstep Repair Pickup', 
              onClick: () => {
                onClose();
                if (onOpenServiceModal) onOpenServiceModal();
              },
              IconComponent: Wrench
            },
            { 
              label: 'Track Repair Status', 
              onClick: () => {
                onClose();
                if (onOpenServiceModal) onOpenServiceModal();
              },
              IconComponent: Search
            }
          ];

          quickReplies = ['Report Complaint', 'Track My Order', 'Main Support Chart'];

        } else if (queryLower.includes('offers_rewards') || queryLower.includes('offer') || queryLower.includes('coupon') || queryLower.includes('reward')) {
          botResponseText = `**Offers & Reward Points Care (Fixed Chart Step 6)**\n\n• **Earn Reward Points**: Earn 1 Friends Reward Point for every ₹10 spent on all purchases automatically!\n• **Claim Redeem Codes**: Open 'My Account' → 'Rewards & Points' tab to redeem your points for discount coupons (e.g. FM-10OFF-XXXX, FM-SAVE100-XXXX).\n• **Apply at Checkout**: Paste your claimed code or click 'Apply' in Cart to enjoy instant discounts!\n• **Promo Codes**: Use code **WELCOME50** or **FRIENDS100** during checkout for instant savings!`;

          quickReplies = ['Track My Order', 'Custom Covers', 'Main Support Chart'];

        } else {
          // Default fallback
          botResponseText = `Thank you for reaching out to FRIENDS MOBILE 24/7 Care.\n\nFor immediate direct support or complaints, please call **+91 93445 22086** / **+91 98424 52208** or message us on WhatsApp.`;

          quickReplies = ['Track My Order', 'Returns & Cancellation', 'Report Complaint', 'Main Support Chart'];
        }
      }

      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: actionButtons,
        quickReplies: quickReplies
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      
      if (isVoiceEnabled) {
        speakText(botResponseText);
      }
    }, 450);
  };

  const formatChatMessage = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lineIdx} style={{ height: '6px' }} />;
      }

      // Helper to parse **bold** text
      const parseBold = (content) => {
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={pIdx} style={{ fontWeight: 700 }}>{boldText}</strong>;
          }
          return part;
        });
      };

      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const bulletContent = line.replace(/^\s*[•-]\s*/, '');
        return (
          <div key={lineIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '3px 0' }}>
            <span style={{ color: '#FF5500', fontWeight: 900, lineHeight: '1.4', userSelect: 'none' }}>•</span>
            <span style={{ flex: 1, lineHeight: '1.4' }}>{parseBold(bulletContent)}</span>
          </div>
        );
      }

      return (
        <div key={lineIdx} style={{ margin: '2px 0', lineHeight: '1.45' }}>
          {parseBold(line)}
        </div>
      );
    });
  };

  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  return createPortal(
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
                <strong>FRIENDS MOBILE AI</strong>
                <span className="ai-badge">24/7 Care</span>
              </div>
              <div className="ai-bot-status">
                Support Chart & Order Help
              </div>
            </div>
          </div>

          <div className="ai-chatbot-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Voice Audio Speaker Toggle */}
            <button
              type="button"
              className="ai-header-btn"
              onClick={() => {
                const nextVoice = !isVoiceEnabled;
                setIsVoiceEnabled(nextVoice);
                if (!nextVoice) stopAllAudio();
              }}
              title={isVoiceEnabled ? 'Mute Voice Assistant' : 'Enable Voice Assistant'}
              style={{
                background: isVoiceEnabled ? '#FF5500' : 'rgba(255, 85, 0, 0.12)',
                border: 'none',
                color: isVoiceEnabled ? '#ffffff' : '#FF5500',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button 
              className="ai-close-btn" 
              onClick={() => {
                stopAllAudio();
                onClose();
              }} 
              aria-label="Close Assistant"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Persistent Fixed Support Chart Ribbon */}
        <div style={{
          background: 'var(--bg-card-secondary, rgba(255, 85, 0, 0.06))',
          borderBottom: '1px solid rgba(255, 85, 0, 0.15)',
          padding: '8px 12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FF5500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} /> Fixed Support Chart:
          </span>
          {FIXED_CHART_CATEGORIES.map(cat => {
            const CatIcon = cat.IconComponent;
            return (
              <button
                key={cat.id}
                onClick={() => handleSendMessage(cat.label)}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid rgba(255, 85, 0, 0.25)',
                  color: 'var(--text-primary, #1e293b)',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {CatIcon && <CatIcon size={13} color="#FF5500" />}
                {cat.label}
              </button>
            );
          })}
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
                  <div className="ai-msg-text-content" style={{ margin: 0 }}>
                    {formatChatMessage(msg.text)}
                  </div>

                  {/* Render Action Buttons inside bubble if available */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {msg.actionButtons.map((act, aIdx) => {
                        const ActIcon = act.IconComponent;
                        return act.href ? (
                          <a
                            key={aIdx}
                            href={act.href}
                            target={act.href.startsWith('http') ? '_blank' : '_self'}
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: act.type === 'whatsapp' ? '#22c55e' : '#FF5500',
                              color: '#ffffff',
                              textDecoration: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            {ActIcon && <ActIcon size={13} />}
                            {act.label}
                          </a>
                        ) : (
                          <button
                            key={aIdx}
                            onClick={act.onClick}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#FF5500',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            {ActIcon && <ActIcon size={13} />}
                            {act.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <span className="ai-msg-timestamp">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Render Quick Reply Options below bot messages */}
                {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="ai-quick-replies-wrap" style={{ marginTop: '6px' }}>
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button 
                        key={rIdx} 
                        className="ai-quick-reply-btn"
                        onClick={() => {
                          if (reply.includes('Main Support Chart')) {
                            setMessages(prev => [...prev, {
                              id: `chart-${Date.now()}`,
                              sender: 'bot',
                              text: '**Fixed Support Chart Menu:**',
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              quickReplies: ['Track My Order', 'Returns & Cancellation', 'Payments & Refund', 'Custom Covers', 'Report Complaint']
                            }]);
                          } else {
                            handleSendMessage(reply);
                          }
                        }}
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

        {/* Input Bar with Speech Recognition Microphone */}
        <form 
          className="ai-chatbot-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <button
            type="button"
            className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? "Listening... Click to stop" : "Speak into Microphone"}
            style={{
              background: isListening ? '#ef4444' : 'rgba(255, 85, 0, 0.1)',
              color: isListening ? '#ffffff' : '#FF5500',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              animation: isListening ? 'pulse 1.2s infinite' : 'none'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input 
            type="text"
            placeholder={
              isListening
                ? 'Listening... Speak in English'
                : 'Type your Order ID or ask a query...'
            }
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

        {/* Footer Direct Contact Helpline */}
        <div className="ai-chatbot-footer-hint">
          <span>Complaints & Store Helpline:</span>
          <a href="tel:+919344522086" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Phone size={13} color="#FF5500" /> +91 93445 22086
          </a>
          <a href="https://wa.me/919344522086" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <MessageSquare size={13} color="#22c55e" /> WhatsApp
          </a>
        </div>

      </div>
    </div>,
    portalContainer
  );
}
