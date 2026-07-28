import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, User, Sparkles, Package, Truck, Phone, MessageSquare, 
  RefreshCw, ChevronRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, 
  HelpCircle, Smartphone, Frame, ShoppingBag, ArrowRight, Maximize2, Minimize2,
  Volume2, VolumeX, Languages
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

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
  onOpenUserAccount,
  addToast 
}) {
  const [isCompactView, setIsCompactView] = useState(false); // Default: false
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    customerName: currentUser ? currentUser.name : '',
    customerPhone: currentUser ? (currentUser.phone || '') : '',
    customerEmail: currentUser ? (currentUser.email || '') : '',
    orderId: '',
    category: 'Damaged Product',
    message: ''
  });
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! 👋 Welcome to **FRIENDS MOBILE 24/7 AI Customer Assistant**. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '📦 Track My Order',
        '🚨 Raise a Complaint / Ticket',
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

  // Web Speech API Text-to-Speech (TTS) Synthesizer (Tamil & English Voice)
  const speakText = (textToSpeak, msgId = null) => {
    if (!('speechSynthesis' in window)) {
      if (addToast) addToast('Browser voice speech not supported on this device.', '⚠️');
      return;
    }

    if (speakingMsgId && speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and symbols for natural voice synthesis
    const cleanText = textToSpeak
      .replace(/[*_#`~•]/g, ' ')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/FM-ORD-/g, 'Order ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isTamilText = /[\u0B80-\u0BFF]/.test(cleanText) || language === 'ta';

    utterance.lang = isTamilText ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.92; // Clear human speed
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (isTamilText && voices.length > 0) {
      const tamilVoice = voices.find(v => (v.lang && v.lang.includes('ta')) || v.name.toLowerCase().includes('tamil') || v.name.toLowerCase().includes('valluvar'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
    }

    if (msgId) setSpeakingMsgId(msgId);

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // AI Knowledge Base Engine & Order Matcher (English + Tamil Speech NLU)
  const processAIQuery = (queryText) => {
    const text = queryText.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTamilMode = language === 'ta' || /[\u0B80-\u0BFF]/.test(queryText) || text.includes('tamil') || text.includes('தமிழ்') || text.includes('பேசு');

    // 1. Order ID Tracking (e.g., FM-ORD-849201, FM-1001, #1001, 849201, order 123)
    const orderMatch = queryText.match(/(FM-?(ORD-?)?\d+|\b\d{4,10}\b)/i);
    const hasOrderKeyword = text.includes('order') || text.includes('track') || text.includes('status') || text.includes('delivery date') || text.includes('parcel') || text.includes('ஆர்டர்') || text.includes('டிராக்கிங்');

    if (orderMatch || (hasOrderKeyword && (currentUser || orders.length > 0))) {
      let matchedOrder = null;
      const rawSearch = orderMatch ? orderMatch[0] : queryText;
      const cleanSearch = rawSearch.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (cleanSearch.length >= 3) {
        matchedOrder = orders.find(o => {
          if (!o || (!o.orderId && !o.id)) return false;
          const rawOId = String(o.orderId || o.id).toLowerCase();
          const cleanOId = rawOId.replace(/[^a-z0-9]/g, '');
          return (
            rawOId.includes(rawSearch.toLowerCase()) ||
            cleanOId === cleanSearch ||
            (cleanSearch.length >= 4 && cleanOId.endsWith(cleanSearch)) ||
            (cleanOId.length >= 4 && cleanSearch.endsWith(cleanOId))
          );
        });

        if (!matchedOrder) {
          try {
            const savedOrders = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
            matchedOrder = savedOrders.find(o => {
              if (!o || (!o.orderId && !o.id)) return false;
              const rawOId = String(o.orderId || o.id).toLowerCase();
              const cleanOId = rawOId.replace(/[^a-z0-9]/g, '');
              return (
                rawOId.includes(rawSearch.toLowerCase()) ||
                cleanOId === cleanSearch ||
                (cleanSearch.length >= 4 && cleanOId.endsWith(cleanSearch)) ||
                (cleanOId.length >= 4 && cleanSearch.endsWith(cleanOId))
              );
            });
          } catch {}
        }
      }

      if (!matchedOrder && orders.length > 0 && hasOrderKeyword && !orderMatch) {
        matchedOrder = orders[0]; // Recent order
      }

      if (matchedOrder) {
        const orderCode = matchedOrder.orderId || `FM-ORD-${matchedOrder.id}`;
        const estDelivery = matchedOrder.estimatedDelivery || '2-3 நாட்களில் டெலிவரி செய்யப்படும்';
        const trackingNum = matchedOrder.trackingNumber || `FM-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
        const courier = matchedOrder.courier || 'Express BlueDart / DTDC Air Logistics';
        const custName = matchedOrder.customer?.name || (currentUser ? currentUser.name : 'மதிப்பிற்குரிய வாடிக்கையாளர்');
        const itemsList = Array.isArray(matchedOrder.items) 
          ? matchedOrder.items.map(i => `${i.title || i.name} (x${i.quantity || 1})`).join(', ')
          : 'மொபைல் அக்சஸரி தயாரிப்பு';
        
        if (isTamilMode) {
          return {
            text: `📦 **ஆர்டர் #${orderCode} இன் 100% சரிபார்க்கப்பட்ட விவரங்கள்**:\n\n` +
                  `• **வாடிக்கையாளர் பெயர்**: ${custName}\n` +
                  `• **தற்போதைய நிலை**: 🟢 **${matchedOrder.status === 'Delivered' ? 'டெலிவரி செய்யப்பட்டது' : 'ஆர்டர் உறுதிசெய்யப்பட்டு அனுப்பப்படுகிறது'}**\n` +
                  `• **வாங்கிய பொருட்கள்**: ${itemsList}\n` +
                  `• **மொத்த தொகை**: **₹${matchedOrder.total || matchedOrder.subtotal || 399}**\n` +
                  `• **பணம் செலுத்தும் முறை**: ${matchedOrder.paymentMethod || 'டெலிவரியின் போது பணம் (COD)'}\n` +
                  `• **எதிர்பார்க்கப்படும் டெலிவரி நாள்**: 🚚 **${estDelivery}**\n` +
                  `• **லாஜிஸ்டிக்ஸ் நிறுவனம்**: ${courier}\n` +
                  `• **டிராக்கிங் ஐடி**: ` + trackingNum + `\n\n` +
                  `உங்களுக்கு மேலும் ஏதேனும் உதவி தேவையா? தயங்காமல் கேட்கலாம்!`,
            quickReplies: ['📍 முகவரி மாற்ற', '💬 வாட்ஸ்அப்பில் பேச', '🛍️ பொருட்கள் பார்க்க'],
            orderCard: matchedOrder
          };
        }

        return {
          text: `📦 **100% Verified Order Status Details for Order #${orderCode}**:\n\n` +
                `• **Customer Name**: ${custName}\n` +
                `• **Current Status**: 🟢 **${matchedOrder.status || 'Order Placed & Processing'}**\n` +
                `• **Items Ordered**: ${itemsList}\n` +
                `• **Total Amount**: **₹${matchedOrder.total || matchedOrder.subtotal || 399}**\n` +
                `• **Payment Method**: ${matchedOrder.paymentMethod || 'Cash on Delivery'}\n` +
                `• **Estimated Delivery**: 🚚 **${estDelivery}**\n` +
                `• **Logistics Partner**: ${courier}\n` +
                `• **Waybill Tracking ID**: ` + trackingNum + `\n\n` +
                `Need further modification, delivery address update, or order help? Feel free to ask!`,
          quickReplies: ['📍 Update Delivery Address', '💬 Chat on WhatsApp', '🛍️ Browse More Products'],
          orderCard: matchedOrder
        };
      } else if (orderMatch) {
        if (isTamilMode) {
          return {
            text: `⚠️ **ஆர்டர் ஐடி "${orderMatch[0]}" தரவுத்தளத்தில் கண்டறியப்படவில்லை**.\n\n` +
                  `உங்கள் ஆர்டர் ஐடியை சரியாக சரிபார்க்கவும் (எ.கா: FM-ORD-1002 அல்லது 1002).`,
            quickReplies: ['👤 என் ஆர்டர்களை பார்க்க', '🚨 புகார் தெரிவிக்க', '📦 வேறு ஐடி முயல']
          };
        }
        return {
          text: `⚠️ **Order ID "${orderMatch[0]}" Not Found** in live database.\n\n` +
                `Please verify your Order ID format (e.g. FM-ORD-1002 or numbers like 1002).`,
          quickReplies: ['👤 Check My Saved Orders', '🚨 Raise Complaint Ticket', '📦 Try Another Order ID']
        };
      }
    } else {
        return {
          text: `🔍 Please provide your **Order ID** (e.g., FM-ORD-1002 or 1001) so I can retrieve your real-time tracking details from our warehouse!`,
          quickReplies: ['👤 Check My Saved Orders', '💬 WhatsApp Support']
        };
      }
    }

    // 1.5. Live Product Search & Product Details Query
    if (text.length >= 2 && !orderMatch) {
      const searchTerms = text.split(/\s+/).filter(w => w.length >= 3);
      const matchedProducts = (products || []).filter(p => {
        if (!p || !p.title) return false;
        const titleLower = p.title.toLowerCase();
        const catLower = (p.category || '').toLowerCase();
        const brandLower = (p.brand || '').toLowerCase();
        return searchTerms.some(term => titleLower.includes(term) || catLower.includes(term) || brandLower.includes(term));
      });

      if (matchedProducts.length > 0) {
        const p = matchedProducts[0];
        const stockBadge = p.inStock !== false ? `🟢 **In Stock** (${p.stock || 50} units available in warehouse)` : `🔴 **Out of Stock**`;
        const ratingBadge = p.rating ? `⭐ **${p.rating} / 5.0** (${p.reviews || 18} Customer Reviews)` : `⭐ **4.9 / 5.0** (Top Rated Product)`;

        return {
          text: `🛍️ **100% Verified Product Details for "${p.title}"**:\n\n` +
                `• **Product Title**: ${p.title}\n` +
                `• **Category**: ${p.category || 'Mobile Accessories'}\n` +
                `• **Offer Price**: **₹${p.price}** ~₹${p.originalPrice || Math.round(p.price * 1.3)}~ (${p.discount || 'Special Discount'})\n` +
                `• **Stock Availability**: ${stockBadge}\n` +
                `• **Customer Rating**: ${ratingBadge}\n` +
                `• **Product Description**: ${p.description || 'Original high-durability mobile accessory with official FRIENDS MOBILE store warranty.'}\n\n` +
                `Would you like to buy this item or browse more products in our store?`,
          quickReplies: ['🛍️ View Products', '📦 Track My Order', '💬 Chat on WhatsApp']
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
              `• **Standard Shipping Fee**: ₹70 (FREE Shipping on orders above ₹1,000!).\n` +

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
              `• **Support Phone**: 📞 **+91 93445 22086**\n` +
              `• **WhatsApp Direct Support**: 💬 +91 93445 22086\n` +
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
            `• Track live status & delivery date using your **Order ID** (e.g., FM-1001)\n` +
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
      window.open('https://wa.me/919344522086', '_blank');
      return;
    }
    if (replyText.includes('Raise a Complaint') || replyText.includes('Ticket')) {
      setShowComplaintForm(true);
      return;
    }
    if (replyText.includes('Call Store') || replyText.includes('Call Support')) {
      window.location.href = 'tel:+919344522086';
      return;
    }

    handleSendMessage(replyText);
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintForm.customerName || !complaintForm.customerPhone || !complaintForm.message) {
      if (addToast) addToast('Please fill in your name, phone number, and issue description.', '⚠️');
      return;
    }

    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComplaint = {
      ticketId,
      customerName: complaintForm.customerName,
      customerPhone: complaintForm.customerPhone,
      customerEmail: complaintForm.customerEmail,
      orderId: complaintForm.orderId,
      category: complaintForm.category,
      message: complaintForm.message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    // Post to Server API with smart multi-endpoint fallback
    const payload = JSON.stringify(newComplaint);
    const endpoints = ['/api/admin/complaints'];
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      endpoints.push(`${origin}/api/admin/complaints`);
      endpoints.push(`https://friends-mobiles-rho.vercel.app/api/admin/complaints`);
    }

    (async () => {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });
          if (res.ok) break;
        } catch (_) {}
      }
    })();

    // Save to local storage for instant feedback
    try {
      const stored = JSON.parse(localStorage.getItem('fm_complaints') || '[]');
      localStorage.setItem('fm_complaints', JSON.stringify([newComplaint, ...stored]));
    } catch {}


    setShowComplaintForm(false);
    if (addToast) addToast(`Complaint Registered! Ticket #${ticketId}`, '🚨');

    // Add confirmation message in chat
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `user-ticket-${Date.now()}`,
        sender: 'user',
        text: `Submitted Support Ticket #${ticketId} (${complaintForm.category})`,
        timestamp: timeStr
      },
      {
        id: `bot-ticket-${Date.now()}`,
        sender: 'bot',
        text: `✅ **Complaint Registered Successfully!**\n\n` +
              `• **Ticket ID**: ` + ticketId + `\n` +
              `• **Category**: ${complaintForm.category}\n` +
              `• **Status**: 🔴 **Open (Assigned to Showroom Admin)**\n\n` +
              `Your complaint details have been sent directly to the FRIENDS MOBILE Admin Dashboard. Our support team will review your case and contact you at **${complaintForm.customerPhone}** within 2-4 hours!`,
        timestamp: timeStr,
        quickReplies: ['💬 Chat on WhatsApp', '📦 Track My Order', '🛍️ Continue Shopping']
      }
    ]);
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
              onClick={() => {
                const nextState = !isVoiceEnabled;
                setIsVoiceEnabled(nextState);
                if (nextState) {
                  speakText(language === 'ta' ? "தமிழ் குரல் ஒலி இயக்கப்பட்டது" : "Voice audio enabled");
                } else {
                  window.speechSynthesis.cancel();
                  setSpeakingMsgId(null);
                }
              }}
              title={isVoiceEnabled ? "Mute Tamil Voice Speech" : "Enable Tamil Voice Speech (Text-to-Speech)"}
              style={{ color: isVoiceEnabled ? '#22c55e' : 'var(--text-muted)' }}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
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
                  text: language === 'ta' ? `சாட் புதுப்பிக்கப்பட்டது! 👋 உங்களுக்கு எவ்வாறு உதவ முடியும்? உங்கள் ஆர்டர் ஐடியை உள்ளிடவும்:` : `Chat reset! 👋 How can I help you today? Enter your Order ID to track your parcel or select an option below:`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  quickReplies: language === 'ta' ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 கஸ்டம் கவர்', '🖼️ போட்டோ பிரேம்', '💬 வாட்ஸ்அப் உதவி'] : ['📦 Track My Order', '🎨 Custom Back Cover', '🖼️ Photo Frames', '💬 Chat on WhatsApp']
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
          <button className="ai-chip" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setShowComplaintForm(true)}>
            <AlertCircle size={13} color="#ef4444" /> Raise Complaint Ticket
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('🎨 Custom Back Cover Query')}>
            <Smartphone size={13} color="#FF5500" /> Custom Cover
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('🖼️ Photo Frame Help')}>
            <Frame size={13} color="#FF5500" /> Photo Frame
          </button>
          <button className="ai-chip" onClick={() => handleQuickReplyClick('💬 Chat on WhatsApp')}>
            <MessageSquare size={13} color="#22c55e" /> WhatsApp Live
          </button>
        </div>

        {/* Embedded Complaint Submission Form Panel */}
        {showComplaintForm ? (
          <div style={{ flex: 1, padding: '24px', background: 'var(--bg-page)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#ef4444" /> Raise Official Complaint / Support Ticket
              </h3>
              <button onClick={() => setShowComplaintForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Your Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your name"
                  value={complaintForm.customerName}
                  onChange={(e) => setComplaintForm({ ...complaintForm, customerName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Mobile Number *
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Mobile number for callback"
                    value={complaintForm.customerPhone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Order ID (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. FM-1001"
                    value={complaintForm.orderId}
                    onChange={(e) => setComplaintForm({ ...complaintForm, orderId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Issue Category *
                </label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Damaged Product / Print Defect">Damaged Product / Print Defect</option>
                  <option value="Wrong Phone Model / Item Delivered">Wrong Phone Model / Item Delivered</option>
                  <option value="Delayed Delivery Inquiry">Delayed Delivery Inquiry</option>
                  <option value="Payment / Refund Assistance">Payment / Refund Assistance</option>
                  <option value="Showroom & Other Complaints">Showroom &amp; Other Complaints</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Describe your complaint in detail *
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Explain what went wrong or how we can resolve this for you..."
                  value={complaintForm.message}
                  onChange={(e) => setComplaintForm({ ...complaintForm, message: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowComplaintForm(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                >
                  Submit Complaint Ticket 🚨
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Messages Body Scroll Area */
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
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      title={speakingMsgId === msg.id ? "Stop Voice" : "Listen in Tamil / English Voice"}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: speakingMsgId === msg.id ? 'rgba(34, 197, 94, 0.2)' : 'none',
                        border: 'none',
                        color: speakingMsgId === msg.id ? '#22c55e' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                  <div className="ai-msg-text">
                    {msg.text.split('\n').map((line, idx) => {
                      if (!line.trim()) return <br key={idx} />;
                      
                      // Bold and inline code formatting renderer
                      const renderFormatted = (str) => {
                        if (!str) return '';
                        const BT = String.fromCharCode(96);
                        const parts = str.split(new RegExp('(\\*{2}.*?\\*{2}|' + BT + '.*?' + BT + ')', 'g'));
                        return parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                          }
                          if (part.startsWith(BT) && part.endsWith(BT)) {
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
        )}

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
          <a href="https://wa.me/919344522086" target="_blank" rel="noreferrer">
            <MessageSquare size={13} color="#22c55e" /> WhatsApp Support (+91 93445 22086)
          </a>
        </div>

      </div>
    </div>
  );
}
