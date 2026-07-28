import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, User, Mic, MicOff, Phone, MessageSquare, 
  RefreshCw, Volume2, VolumeX, Languages, ShieldCheck, CheckCircle2, 
  AlertTriangle, Package, Truck, ArrowRight, CornerDownRight, Sparkles
} from 'lucide-react';
import { getProductTitle, autoTranslateToTamil } from '../data/translations';

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
  const [botLang, setBotLang] = useState(language);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Amazon / Flipkart style Fixed Chart categories
  const FIXED_CHART_CATEGORIES = botLang === 'ta' ? [
    { id: 'track_order', label: '📦 ஆர்டர் டிராக்கிங்', desc: 'உங்கள் பார்சல் எங்கே உள்ளது?' },
    { id: 'returns_cancel', label: '🔄 ரத்து & மாற்று பாலிசி', desc: 'ஆர்டர் ரத்து / 7 நாள் மாற்றுதல்' },
    { id: 'payments_refund', label: '💳 கட்டணம் & ரீஃபண்ட்', desc: 'COD, UPI & பணம் திரும்புதல்' },
    { id: 'custom_studio', label: '🎨 கஸ்டமைஸ் கவர் & பிரேம்', desc: '3D போட்டோ கவர் & பிரேம்கள்' },
    { id: 'mobile_repair', label: '🛠️ மொபைல் சர்வீஸ்', desc: '30 நிமிட டிஸ்பிளே சர்வீஸ்' },
    { id: 'offers_rewards', label: '🎁 சலுகைகள் & புள்ளிகள்', desc: 'கூப்பன்கள் & ரிவார்ட்ஸ்' },
    { id: 'complaint_escalate', label: '⚠️ புகார்கள் & மேலாளர் உதவி', desc: 'நேரடி எண்கள் & வாட்ஸ்அப்' }
  ] : [
    { id: 'track_order', label: '📦 Order Tracking', desc: 'Where is my parcel?' },
    { id: 'returns_cancel', label: '🔄 Returns & Cancellation', desc: 'Cancel order / 7 days replacement' },
    { id: 'payments_refund', label: '💳 Payments & Refund', desc: 'COD, UPI & refund status' },
    { id: 'custom_studio', label: '🎨 Custom Covers & Frames', desc: '3D Photo cases & frames' },
    { id: 'mobile_repair', label: '🛠️ Mobile Repair Service', desc: '30-Min display repair' },
    { id: 'offers_rewards', label: '🎁 Offers & Reward Points', desc: 'Coupons & rewards' },
    { id: 'complaint_escalate', label: '⚠️ Report Complaint', desc: 'Direct owner contact & WhatsApp' }
  ];

  // Sync initial language when prop updates
  useEffect(() => {
    setBotLang(language);
  }, [language]);

  const hasInitializedRef = useRef(false);

  // Initialize welcome message & fixed chart menu when opened
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const welcomeText = botLang === 'ta'
        ? `வணக்கம்! 🖐️ பிரண்ட்ஸ் மொபைல் 24/7 வாடிக்கையாளர் உதவி மையத்திற்கு வரவேற்கிறோம்.\n\nகீழே உள்ள **பிரதான உதவி வரைபடத்தை (Fixed Support Chart)** பயன்படுத்தவும் அல்லது உங்கள் ஆர்டர் எண் / கேள்விகளை உள்ளிடவும்:`
        : `Welcome to FRIENDS MOBILE 24/7 Support Center! 🚀\n\nPlease select an option from our **Fixed Support Chart** below or enter your Order ID / query:`;

      const welcomeMsg = {
        id: 'welcome-1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isChartMenu: true,
        quickReplies: botLang === 'ta' 
          ? ['📦 ஆர்டர் டிராக்கிங்', '🔄 ரத்து & மாற்று பாலிசி', '💳 கட்டணம் & ரீஃபண்ட்', '🎨 கஸ்டமைஸ் கவர்', '⚠️ புகார்கள் & நேரடி உதவி']
          : ['📦 Track My Order', '🔄 Returns & Cancellation', '💳 Payments & Refund', '🎨 Custom Covers', '⚠️ Report Complaint']
      };

      setMessages([welcomeMsg]);
    }
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const [voices, setVoices] = useState([]);

  // Pre-load Web Speech voices & listen for voice availability
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices() || [];
        setVoices(availableVoices);
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const stopAllAudio = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setSpeakingMsgId(null);
  };

  const getPhoneticTamil = (tamilText) => {
    return tamilText
      .replace(/வணக்கம்/g, 'Vanakkam')
      .replace(/பிரண்ட்ஸ்/g, 'Friends')
      .replace(/மொபைல்/g, 'Mobile')
      .replace(/வாடிக்கையாளர்/g, 'vaadikkaiyaalar')
      .replace(/சேவை/g, 'sevai')
      .replace(/உதவி/g, 'udhavi')
      .replace(/மையத்திற்கு/g, 'maiyathirkku')
      .replace(/வரவேற்கிறோம்/g, 'varaverkirom')
      .replace(/இயக்கப்பட்டது/g, 'iyakkappattadhu')
      .replace(/ஆர்டர்/g, 'order')
      .replace(/டிராக்கிங்/g, 'tracking')
      .replace(/நிலவரம்/g, 'nilavaram')
      .replace(/விபரம்/g, 'vibaram')
      .replace(/கண்டுபிடிக்கப்பட்டது/g, 'kandupadikkappattadhu')
      .replace(/ரத்து/g, 'rathu')
      .replace(/மாற்று/g, 'maattru')
      .replace(/பாலிசி/g, 'policy')
      .replace(/கட்டணம்/g, 'kattanam')
      .replace(/ரீஃபண்ட்/g, 'refund')
      .replace(/புகார்கள்/g, 'pukaarkal')
      .replace(/நேரடி/g, 'neradi')
      .replace(/தொடர்பு/g, 'thodarpu')
      .replace(/சிரமத்திற்கு/g, 'shramathirkku')
      .replace(/மன்னிக்கவும்/g, 'mannikkavum')
      .replace(/தொலைபேசி/g, 'tholaipesi')
      .replace(/எண்கள்/g, 'engkal')
      .replace(/வாட்ஸ்அப்/g, 'WhatsApp')
      .replace(/நிர்வாகக்/g, 'nirvaaga')
      .replace(/குழு/g, 'kuzu')
      .replace(/உடனடியாக/g, 'udhanadiyaga')
      .replace(/தீர்வு/g, 'theervu')
      .replace(/வழங்கும்/g, 'vazangum')
      .replace(/போட்/g, 'boAt')
      .replace(/ஏர்டோப்ஸ்/g, 'Airdopes')
      .replace(/இயர்பட்ஸ்/g, 'Earbuds')
      .replace(/மி/g, 'Mi')
      .replace(/பவர்/g, 'Power')
      .replace(/பேங்க்/g, 'Bank')
      .replace(/போர்ட்ரானிக்ஸ்/g, 'Portronics')
      .replace(/சார்ஜர்/g, 'Charger')
      .replace(/ரியல்மி/g, 'Realme')
      .replace(/நெக்பேண்ட்/g, 'Neckband')
      .replace(/[*_#`~]/g, '');
  };

  // Web Speech API Synthesizer
  // English: Male Strong Voice
  // Tamil: Female Fluent Voice (With Full Phonetic Tamil Fallback)
  const speakText = (textToSpeak, msgId = null, activeLang = botLang) => {
    if (!('speechSynthesis' in window)) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch (_) {}

    setSpeakingMsgId(msgId);

    // Clean text before speaking:
    // Exclude product title/model lines from spoken voice audio so voice stays clean, polite, and natural
    const cleanText = textToSpeak
      .replace(/• (பொருள்|Item|ஆர்டர் எண்|Order ID):.*?\n/gi, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const availVoices = voices.length > 0 ? voices : (window.speechSynthesis.getVoices() || []);

    if (activeLang === 'ta') {
      utterance.lang = 'ta-IN';
      utterance.pitch = 1.15;
      utterance.rate = 0.85;

      const tamilVoice = availVoices.find(v => 
        (v.lang && v.lang.toLowerCase().startsWith('ta')) ||
        (v.name && v.name.toLowerCase().includes('tamil')) ||
        (v.name && v.name.toLowerCase().includes('தமிழ்'))
      );

      if (tamilVoice) {
        utterance.voice = tamilVoice;
      } else {
        // Fallback for Windows SAPI Speech engine: Speak full phonetic Tamil sentence so every sentence word is spoken!
        utterance.lang = 'en-IN';
        utterance.text = getPhoneticTamil(cleanText);
        utterance.pitch = 1.05;
        utterance.rate = 0.88;

        const femaleVoice = availVoices.find(v => 
          (v.lang.includes('en') || v.name.toLowerCase().includes('english')) &&
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || 
           v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('swara'))
        ) || availVoices.find(v => v.lang.includes('en'));

        if (femaleVoice) utterance.voice = femaleVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      utterance.pitch = 0.88; // Deep Strong Male Pitch for English
      utterance.rate = 0.95;  // Confident Male Speed

      const englishMaleVoice = availVoices.find(v => 
        (v.lang.includes('en') || v.name.toLowerCase().includes('english')) &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('george') || 
         v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('guy') || 
         v.name.toLowerCase().includes('james'))
      ) || availVoices.find(v => v.lang.includes('en'));

      if (englishMaleVoice) utterance.voice = englishMaleVoice;
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recording (Microphone Speech Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (addToast) addToast(botLang === 'ta' ? 'உங்கள் உலாவி குரல் உள்ளீட்டை ஆதரிக்கவில்லை' : 'Speech recognition not supported in this browser', 'info');
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
      recognition.lang = botLang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        if (addToast) addToast(botLang === 'ta' ? 'பேசுங்கள், கேட்கிறது...' : 'Listening... Speak now', 'info');
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

    setTimeout(() => {
      let botResponseText = '';
      let actionButtons = null;
      let quickReplies = [];
      const queryLower = textToSend.toLowerCase().trim();
      const botMsgId = `bot-${Date.now()}`;

      // 🚨 COMPLAINT & NEGATIVE REMARKS DETECTOR (STRICT REQUIREMENT)
      const complaintKeywords = [
        'complaint', 'worst', 'damaged', 'defective', 'broken', 'bad', 'fake', 'wrong', 
        'refund issue', 'delay', 'issue', 'problem', 'remark', 'demark', 'poor', 'scam', 
        'useless', 'terrible', 'cheated', 'unhappy', 'fraud', 'hated',
        'புகார்', 'மோசம்', 'பழுது', 'சேதம்', 'பணம் வரவில்லை', 'தாமதம்', 'பிரச்சனை', 
        'கேவலமான', 'மாற்று', 'அவசரம்', 'மோசமான', 'வேஸ்ட்', 'வேலை செய்யவில்லை'
      ];

      const isComplaint = complaintKeywords.some(kw => queryLower.includes(kw)) || 
                          queryLower.includes('complaint_escalate') || 
                          queryLower.includes('புகார்');

      if (isComplaint) {
        botResponseText = botLang === 'ta'
          ? `🚨 **பிரண்ட்ஸ் மொபைல் நேரடி வாடிக்கையாளர் சேவை & மேலாண்மை தொடர்பு**\n\nஉங்களது சிரமத்திற்கு நாங்கள் மிகவும் மன்னிக்கவும்! உங்கள் புகார்கள், குறைபாடுகள் அல்லது அவசர உதவிகளுக்கு பிரண்ட்ஸ் மொபைல் தொலைபேசி எண்களை நேரடியாக தொடர்பு கொள்ளவும்:\n\n• **நேரடி தொலைபேசி எண்கள்**: **+91 93445 22086** / **+91 98424 52208**\n• **வாட்ஸ்அப் நேரடி தொடர்பு**: **+91 93445 22086**\n• **தலைமை கிளை**: 24/7 சேவை மையம், மதுரை & கரூர் பிரண்ட்ஸ் மொபைல்.\n\nஎங்கள் நிர்வாகக் குழு உங்கள் புகாருக்கு உடனடியாக முன்னுரிமை அளித்து தீர்வு வழங்கும்!`
          : `🚨 **FRIENDS MOBILE Direct Customer Care & Store Support**\n\nWe sincerely apologize for any inconvenience caused! For all complaints, remarks, defective items, or urgent support, please contact our helpline numbers directly:\n\n• **Direct Phone Calls**: **+91 93445 22086** / **+91 98424 52208**\n• **WhatsApp Direct Support**: **+91 93445 22086**\n• **Store Hub**: FRIENDS MOBILE 24/7 Care Desk, Madurai & Karur Branches.\n\nOur management team will inspect your issue and resolve it with top priority!`;

        actionButtons = [
          { label: botLang === 'ta' ? '📞 அழைக்க: +91 93445 22086' : '📞 Call +91 93445 22086', href: 'tel:+919344522086', type: 'call' },
          { label: botLang === 'ta' ? '💬 வாட்ஸ்அப் தொடர்பு' : '💬 Chat on WhatsApp', href: 'https://wa.me/919344522086?text=Hello%20FRIENDS%20MOBILE%20I%20have%20a%20complaint', type: 'whatsapp' },
          { label: botLang === 'ta' ? '📞 அழைக்க: +91 98424 52208' : '📞 Call +91 98424 52208', href: 'tel:+919842452208', type: 'call' }
        ];

        quickReplies = botLang === 'ta'
          ? ['📦 ஆர்டர் டிராக்கிங்', '🔄 ரத்து & மாற்று பாலிசி', '📊 பிரதான வரைபடம்']
          : ['📦 Track My Order', '🔄 Returns & Cancellation', '📊 Main Support Chart'];

      } else {
        // FIXED SUPPORT CHART CATEGORIES MATCHING

        // Order ID Matching
        const orderMatch = queryLower.match(/(fm-?\d{3,6}|\b\d{4}\b)/i);

        if (orderMatch || queryLower.includes('track_order') || queryLower.includes('track') || queryLower.includes('ஆர்டர்') || queryLower.includes('டிராக்கிங்')) {
          if (orderMatch) {
            const orderIdClean = orderMatch[0].toUpperCase();
            const foundOrder = orders.find(o => 
              (o.orderId && o.orderId.toUpperCase().includes(orderIdClean)) ||
              (o.id && o.id.toString().includes(orderIdClean))
            );

            if (foundOrder) {
              const itemTitleTa = getProductTitle(foundOrder.items?.[0] || foundOrder.title || 'Mobile Accessory', botLang);
              botResponseText = botLang === 'ta'
                ? `📦 **ஆர்டர் விபரம் கண்டுபிடிக்கப்பட்டது!**\n\n• பொருள்: **${itemTitleTa}**\n• ஆர்டர் எண்: **${foundOrder.orderId || orderIdClean}**\n• நிலை: **${foundOrder.status || 'எக்ஸ்பிரஸ் கொரியர் மூலம் அனுப்பப்பட்டுள்ளது'}**\n• வாடிக்கையாளர்: ${foundOrder.customerName || 'மதிப்பிற்குரிய வாடிக்கையாளர்'}\n• மொத்த தொகை: **₹${foundOrder.total || foundOrder.amount || '1,499'}**\n• எதிர்பார்க்கப்படும் டெலிவரி: **நாளை மாலை**`
                : `📦 **Order Details Found!**\n\n• Item: **${foundOrder.title || 'Mobile Accessory'}**\n• Order ID: **${foundOrder.orderId || orderIdClean}**\n• Status: **${foundOrder.status || 'Dispatched via Express Courier'}**\n• Customer: ${foundOrder.customerName || 'Valued Customer'}\n• Amount: **₹${foundOrder.total || foundOrder.amount || '1,499'}**\n• Estimated Delivery: **Tomorrow Evening**`;
            } else {
              botResponseText = botLang === 'ta'
                ? `📦 **ஆர்டர் ஐடி ${orderIdClean} நிலவரம்:**\n\nஉங்கள் ஆர்டர் மதுரையிலுள்ள பிரண்ட்ஸ் மொபைல் தலைமை மையத்தில் பாதுகாப்பாக பேக் செய்யப்பட்டு அனுப்பத் தயாராக உள்ளது! எக்ஸ்பிரஸ் கொரியர் மூலம் விரைவாக உங்கள் முகவரிக்கு வந்து சேரும்.`
                : `📦 **Order ID ${orderIdClean} Status:**\n\nYour order has been safely packed at FRIENDS MOBILE Madurai hub and is ready for dispatch! It will be delivered via Express Shipping.`;
            }
          } else {
            botResponseText = botLang === 'ta'
              ? `📦 **ஆர்டர் டிராக்கிங் உதவி (Fixed Chart Step 1)**\n\nஉங்கள் ஆர்டர் நிலையை நேரலையாக அறிய கீழே உள்ள உங்கள் ஆர்டரைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் Order ID (எ.கா: **FM-1001**) உள்ளிடவும்.`
              : `📦 **Order Tracking Care (Fixed Chart Step 1)**\n\nPlease select your active order or enter your Order ID (e.g. **FM-1001**) to get live parcel status!`;
          }

          quickReplies = botLang === 'ta'
            ? ['🔄 ரத்து & மாற்று பாலிசி', '💳 கட்டணம் & ரீஃபண்ட்', '⚠️ புகார்கள் & நேரடி உதவி']
            : ['🔄 Returns & Cancellation', '💳 Payments & Refund', '⚠️ Report Complaint'];

        } else if (queryLower.includes('returns_cancel') || queryLower.includes('return') || queryLower.includes('cancel') || queryLower.includes('ரத்து') || queryLower.includes('மாற்று பாலிசி')) {
          botResponseText = botLang === 'ta'
            ? `🔄 **ஆர்டர் ரத்து & 7 நாள் மாற்று பாலிசி (Fixed Chart Step 2)**\n\n1. **ஆர்டர் ரத்து**: அனுப்பப்படுவதற்கு முன் உங்கள் ஆர்டரை 'My Account' பக்கத்தில் நேரடியாக ரத்து செய்யலாம்.\n2. **7 நாள் மாற்று பாலிசி**: தவறான அல்லது பழுதடைந்த பொருட்களுக்கு 7 நாட்களுக்குள் 100% இலவச மாற்று வழங்கப்படுகிறது.\n3. பழுதடைந்த பொருள் வந்தால் உடனடியாக வாட்ஸ்அப்பில் புகாரளிக்கவும்.`
            : `🔄 **Returns & 7-Day Replacement Policy (Fixed Chart Step 2)**\n\n1. **Cancellation**: Orders can be cancelled before dispatch directly from your 'My Account' area.\n2. **7-Day Replacement**: We offer 100% free replacement for any wrong or defective items within 7 days.\n3. Received a damaged product? Click below to contact management immediately.`;

          quickReplies = botLang === 'ta'
            ? ['⚠️ புகார்கள் & நேரடி உதவி', '📦 ஆர்டர் டிராக்கிங்', '📊 பிரதான வரைபடம்']
            : ['⚠️ Report Complaint', '📦 Track My Order', '📊 Main Support Chart'];

        } else if (queryLower.includes('payments_refund') || queryLower.includes('payment') || queryLower.includes('refund') || queryLower.includes('கட்டணம்') || queryLower.includes('ரீஃபண்ட்')) {
          botResponseText = botLang === 'ta'
            ? `💳 **கட்டணம் & ரீஃபண்ட் விவரம் (Fixed Chart Step 3)**\n\n• **கேஷ் ஆன் டெலிவரி (COD)**: அனைத்து பின் கோடுகளுக்கும் கிடைக்கிறது.\n• **ஆன்லைன் பேமெண்ட்**: GPay, PhonePe, UPI, கிரெடிட்/டெபிட் கார்டுகள் ஏற்ப்படும்.\n• **ரீஃபண்ட் காலம்**: ரத்து செய்யப்பட்ட ஆர்டர்களின் தொகை 24-48 மணிநேரத்தில் உங்கள் வங்கி/UPI கணக்கிற்குத் திரும்ப வரும்.`
            : `💳 **Payments & Refund Status (Fixed Chart Step 3)**\n\n• **Cash on Delivery (COD)**: Available for all India pin codes.\n• **Online Payment**: GPay, PhonePe, UPI, Credit/Debit cards accepted.\n• **Refund Timeline**: Refunds for cancelled orders credited within 24-48 hours directly to your UPI/bank.`;

          quickReplies = botLang === 'ta'
            ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 கஸ்டமைஸ் கவர்', '⚠️ புகார்கள் & நேரடி உதவி']
            : ['📦 Track My Order', '🎨 Custom Covers', '⚠️ Report Complaint'];

        } else if (queryLower.includes('custom_studio') || queryLower.includes('cover') || queryLower.includes('frame') || queryLower.includes('கவர்') || queryLower.includes('பிரேம்')) {
          botResponseText = botLang === 'ta'
            ? `🎨 **3D கஸ்டம் கவர் & போட்டோ பிரேம் ஸ்டுடியோ (Fixed Chart Step 4)**\n\n• **3D போட்டோ பேக் கவர்**: Apple, Samsung, Vivo, Oppo, OnePlus, Realme, Poco மாடல்களுக்கு உங்கள் போட்டோவை அச்சிடலாம்.\n• **அக்ரிலிக் & மர போட்டோ பிரேம்கள்**: உயர்தர பிரேம்களை நேரடி 3D முன்னோட்டத்துடன் தயாரிக்கலாம்.`
            : `🎨 **3D Custom Back Cover & Photo Frame Studio (Fixed Chart Step 4)**\n\n• **3D Photo Covers**: Print HD custom back covers for Apple, Samsung, Vivo, Oppo, OnePlus, Realme & Poco!\n• **Wooden & Glass Frames**: Premium photo frames with live 3D preview.`;

          actionButtons = [
            { label: botLang === 'ta' ? '🎨 3D கவர் ஸ்டுடியோ' : '🎨 Open Cover Studio', onClick: onOpenCustomCover },
            { label: botLang === 'ta' ? '🖼️ போட்டோ பிரேம் ஸ்டுடியோ' : '🖼️ Open Frame Studio', onClick: onOpenCustomFrame }
          ];

          quickReplies = botLang === 'ta'
            ? ['📦 ஆர்டர் டிராக்கிங்', '🛠️ மொபைல் சர்வீஸ்', '📊 பிரதான வரைபடம்']
            : ['📦 Track My Order', '🛠️ Mobile Repair Service', '📊 Main Support Chart'];

        } else if (queryLower.includes('mobile_repair') || queryLower.includes('repair') || queryLower.includes('service') || queryLower.includes('சர்வீஸ்')) {
          botResponseText = botLang === 'ta'
            ? `🛠️ **30-நிமிட விரைவு மொபைல் சர்வீஸ் (Fixed Chart Step 5)**\n\nமதுரை & கரூர் பிரண்ட்ஸ் மொபைல் ஷோரூமில் 30 நிமிடங்களில் விரைவு டிஸ்பிளே மாற்றுதல், ஒரிஜினல் பேட்டரி மற்றும் மதர்போர்டு சர்வீஸ் செய்யப்படும்!`
            : `🛠️ **30-Minute Express Repair Service (Fixed Chart Step 5)**\n\nExpress 30-minute display repair, original battery replacement, and motherboard servicing available at FRIENDS MOBILE Madurai & Karur branches!`;

          quickReplies = botLang === 'ta'
            ? ['⚠️ புகார்கள் & நேரடி உதவி', '📦 ஆர்டர் டிராக்கிங்', '📊 பிரதான வரைபடம்']
            : ['⚠️ Report Complaint', '📦 Track My Order', '📊 Main Support Chart'];

        } else if (queryLower.includes('offers_rewards') || queryLower.includes('offer') || queryLower.includes('coupon') || queryLower.includes('சலுகை') || queryLower.includes('கூப்பன்')) {
          botResponseText = botLang === 'ta'
            ? `🎁 **சலுகைகள் & ரிவார்ட் பாயிண்ட்கள் (Fixed Chart Step 6)**\n\n• ₹999க்கு மேற்பட்ட ஆர்டர்களுக்கு **FRIENDS100** கூப்பன் கோட் பயன்படுத்தி ₹100 தள்ளுபடி பெறுங்கள்!\n• ஒவ்வொரு ஆர்டருக்கும் 10 ரிவார்ட் பாயிண்ட்கள் வழங்கப்படும்.`
            : `🎁 **Offers & Reward Points (Fixed Chart Step 6)**\n\n• Use code **FRIENDS100** for ₹100 instant discount on orders above ₹999!\n• Earn 10 reward points on every purchase in your FRIENDS MOBILE account.`;

          quickReplies = botLang === 'ta'
            ? ['📦 ஆர்டர் டிராக்கிங்', '🎨 கஸ்டமைஸ் கவர்', '📊 பிரதான வரைபடம்']
            : ['📦 Track My Order', '🎨 Custom Covers', '📊 Main Support Chart'];

        } else {
          // Default fallback
          botResponseText = botLang === 'ta'
            ? `வணக்கம்! 🖐️ பிரண்ட்ஸ் மொபைல் 24/7 உதவி மையத்தில் உங்கள் கேள்வி பெறப்பட்டது.\n\nநேரடி மனித உதவி அல்லது புகார்களுக்கு தொலைபேசி எண்கள் **+91 93445 22086** / **+91 98424 52208** மற்றும் வாட்ஸ்அப் எண்களை தொடர்பு கொள்ளவும்.`
            : `Thank you for reaching out to FRIENDS MOBILE 24/7 Care! 🚀\n\nFor immediate direct support or complaints, please call **+91 93445 22086** / **+91 98424 52208** or message us on WhatsApp.`;

          quickReplies = botLang === 'ta'
            ? ['📦 ஆர்டர் டிராக்கிங்', '🔄 ரத்து & மாற்று பாலிசி', '⚠️ புகார்கள் & நேரடி உதவி', '📊 பிரதான வரைபடம்']
            : ['📦 Track My Order', '🔄 Returns & Cancellation', '⚠️ Report Complaint', '📊 Main Support Chart'];
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
        speakText(botResponseText, botMsgId, botLang);
      }
    }, 450);
  };

  if (!isOpen) return null;

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
                <strong>{botLang === 'ta' ? 'பிரண்ட்ஸ் மொபைல் AI' : 'FRIENDS MOBILE AI'}</strong>
                <span className="ai-badge">{botLang === 'ta' ? '24/7 குரல் சேவை' : '24/7 Care'}</span>
              </div>
              <div className="ai-bot-status">
                {botLang === 'ta' ? 'குரல் & பிரதான வரைபட உதவி' : 'Voice Assistant & Support Chart'}
              </div>
            </div>
          </div>

          <div className="ai-chatbot-header-right">
            {/* Inline Language Selection Switcher */}
            <button 
              className="ai-lang-pill-btn"
              onClick={() => {
                const nextLang = botLang === 'ta' ? 'en' : 'ta';
                setBotLang(nextLang);
                const switchMsgId = `welcome-${Date.now()}`;
                const announceText = nextLang === 'ta'
                  ? "வணக்கம்! தமிழ் குரல் சேவை இயக்கப்பட்டது. பிரண்ட்ஸ் மொபைல் உதவி மையத்திற்கு வரவேற்கிறோம்."
                  : "English male voice support activated. Welcome to FRIENDS MOBILE support.";

                const switchMsg = {
                  id: switchMsgId,
                  sender: 'bot',
                  text: nextLang === 'ta'
                    ? `வணக்கம்! 🖐️ தமிழ் குரல் சேவை இயக்கப்பட்டது.\n\nபிரண்ட்ஸ் மொபைல் 24/7 வாடிக்கையாளர் உதவி மையத்திற்கு வரவேற்கிறோம். கீழே உள்ள **பிரதான உதவி வரைபடத்தை (Fixed Support Chart)** பயன்படுத்தவும் அல்லது கேள்விகளை உள்ளிடவும்:`
                    : `English voice support activated! 🚀\n\nWelcome to FRIENDS MOBILE 24/7 Support Center. Please select an option from our **Fixed Support Chart** below or enter your query:`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isChartMenu: true,
                  quickReplies: nextLang === 'ta' 
                    ? ['📦 ஆர்டர் டிராக்கிங்', '🔄 ரத்து & மாற்று பாலிசி', '💳 கட்டணம் & ரீஃபண்ட்', '🎨 கஸ்டமைஸ் கவர்', '⚠️ புகார்கள் & நேரடி உதவி']
                    : ['📦 Track My Order', '🔄 Returns & Cancellation', '💳 Payments & Refund', '🎨 Custom Covers', '⚠️ Report Complaint']
                };

                setMessages(prev => [...prev, switchMsg]);
                if (isVoiceEnabled) {
                  speakText(announceText, switchMsgId, nextLang);
                }
              }}
              title="Switch Language / மொழி மாற்றம்"
            >
              <Languages size={15} color="#ffffff" />
              <span>{botLang === 'ta' ? 'தமிழ் (Female Voice)' : 'English (Male Voice)'}</span>
            </button>


            <button 
              className="ai-reset-btn"
              onClick={() => {
                const nextState = !isVoiceEnabled;
                setIsVoiceEnabled(nextState);
                if (nextState) speakText(botLang === 'ta' ? "குரல் ஒலி இயக்கப்பட்டது" : "Voice speech enabled", null, botLang);
                else stopAllAudio();
              }}
              title={isVoiceEnabled ? "Mute Voice Speech" : "Enable Voice Speech"}
              style={{ color: isVoiceEnabled ? '#22c55e' : 'var(--text-muted)' }}
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
            <Sparkles size={13} /> {botLang === 'ta' ? 'பிரதான வரைபடம்:' : 'Fixed Support Chart:'}
          </span>
          {FIXED_CHART_CATEGORIES.map(cat => (
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
                gap: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {cat.label}
            </button>
          ))}
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
                  <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{msg.text}</p>

                  {/* Render Action Buttons inside bubble if available */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {msg.actionButtons.map((act, aIdx) => (
                        act.href ? (
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
                            {act.label}
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span className="ai-msg-timestamp">{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => speakText(msg.text, msg.id, botLang)}
                        style={{ background: 'none', border: 'none', color: speakingMsgId === msg.id ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        title="Listen to Speech synthesis"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
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
                          if (reply.includes('பிரதான வரைபடம்') || reply.includes('Main Support Chart')) {
                            setMessages(prev => [...prev, {
                              id: `chart-${Date.now()}`,
                              sender: 'bot',
                              text: botLang === 'ta' ? '📊 **பிரதான உதவி வரைபடம் (Fixed Support Chart Menu):**' : '📊 **Fixed Support Chart Menu:**',
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              quickReplies: botLang === 'ta' 
                                ? ['📦 ஆர்டர் டிராக்கிங்', '🔄 ரத்து & மாற்று பாலிசி', '💳 கட்டணம் & ரீஃபண்ட்', '🎨 கஸ்டமைஸ் கவர்', '⚠️ புகார்கள் & நேரடி உதவி']
                                : ['📦 Track My Order', '🔄 Returns & Cancellation', '💳 Payments & Refund', '🎨 Custom Covers', '⚠️ Report Complaint']
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
                ? (botLang === 'ta' ? 'கேட்கிறது (தமிழில் பேசுங்கள்)...' : 'Listening (Speak in English)...')
                : (botLang === 'ta' ? 'ஆர்டர் ஐடி (FM-1001) அல்லது கேள்விகளை உள்ளிடவும்...' : 'Type your Order ID or ask a query...')
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

        {/* Footer Direct Contact Hint */}
        <div className="ai-chatbot-footer-hint">
          <span>{botLang === 'ta' ? 'புகார்கள் / நேரடி வாடிக்கையாளர் சேவை:' : 'Complaints & Store Helpline:'}</span>
          <a href="tel:+919344522086" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Phone size={13} color="#FF5500" /> +91 93445 22086
          </a>
          <a href="https://wa.me/919344522086" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <MessageSquare size={13} color="#22c55e" /> WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
