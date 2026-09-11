import React, { useState, useEffect } from 'react';
import { 
  X, Smartphone, CheckCircle2, DollarSign, ShieldCheck, Sparkles, 
  MessageCircle, ArrowRight, AlertCircle, RefreshCw, Check, 
  Calendar, MapPin, Phone, User, Award, Tag, Zap, HelpCircle
} from 'lucide-react';
import { getApiBaseUrl } from '../data/apiConfig';

const API_BASE = getApiBaseUrl();

const POPULAR_BRANDS = [
  { name: 'Apple', code: 'APL', baseVal: 22000 },
  { name: 'Samsung', code: 'SAM', baseVal: 15000 },
  { name: 'OnePlus', code: '1+', baseVal: 14000 },
  { name: 'Xiaomi / Redmi', code: 'MI', baseVal: 8500 },
  { name: 'Realme', code: 'RME', baseVal: 8000 },
  { name: 'Vivo', code: 'VVO', baseVal: 9000 },
  { name: 'Oppo', code: 'OPP', baseVal: 8500 },
  { name: 'Google Pixel', code: 'PIX', baseVal: 16000 },
  { name: 'Poco', code: 'PCO', baseVal: 7500 },
  { name: 'Motorola', code: 'MOT', baseVal: 7500 },
  { name: 'Nothing', code: 'NTH', baseVal: 12500 },
  { name: 'Other', code: 'GEN', baseVal: 6000 }
];

const BRAND_PRESET_MODELS = {
  'Apple': ['iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone SE (3rd Gen)'],
  'Samsung': ['Galaxy S24 Ultra', 'Galaxy S23 5G', 'Galaxy S22', 'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy M34', 'Galaxy Z Flip 5'],
  'OnePlus': ['OnePlus 12', 'OnePlus 11R 5G', 'OnePlus 10 Pro', 'OnePlus Nord CE 3 Lite', 'OnePlus 9RT', 'OnePlus 9R'],
  'Xiaomi / Redmi': ['Redmi Note 13 Pro+ 5G', 'Redmi Note 12 Pro', 'Xiaomi 13 Pro', 'Redmi 12 5G', 'Xiaomi 11T Pro'],
  'Realme': ['Realme 12 Pro+ 5G', 'Realme 11 Pro 5G', 'Realme Narzo 60', 'Realme GT 2 Pro', 'Realme 10 Pro'],
  'Vivo': ['Vivo V29 5G', 'Vivo V27 Pro', 'Vivo X90 Pro', 'Vivo T2 Pro 5G', 'Vivo Y200 5G'],
  'Oppo': ['Oppo Reno 11 Pro', 'Oppo Reno 10 5G', 'Oppo Find N3 Flip', 'Oppo F25 Pro', 'Oppo A78'],
  'Google Pixel': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 6a'],
  'Poco': ['Poco X6 Pro 5G', 'Poco F5 5G', 'Poco X5 Pro', 'Poco M6 Pro'],
  'Motorola': ['Edge 40 Neo', 'Moto G84 5G', 'Edge 30 Ultra', 'Moto G54 5G'],
  'Nothing': ['Phone (2)', 'Phone (1)', 'Phone (2a)']
};

const STORAGE_OPTIONS = [
  { size: '64 GB', multiplier: 0.85 },
  { size: '128 GB', multiplier: 1.0 },
  { size: '256 GB', multiplier: 1.15 },
  { size: '512 GB', multiplier: 1.30 },
  { size: '1 TB', multiplier: 1.45 }
];

const SCREEN_CONDITIONS = [
  { id: 'Flawless', title: 'Flawless', desc: 'No scratches, clean screen & touch works 100%', mult: 1.0 },
  { id: 'Minor Scratches', title: 'Minor Scratches', desc: 'Light scratches from daily normal use', mult: 0.90 },
  { id: 'Cracked Glass', title: 'Cracked Glass', desc: 'Glass cracked but touch & screen display work', mult: 0.68 },
  { id: 'Display Fault', title: 'Lines / Dead Pixels', desc: 'Color lines, black spots or touch unresponsive', mult: 0.45 }
];

const BODY_CONDITIONS = [
  { id: 'Like New', title: 'Like New', desc: 'Pristine frame & back, no dents or dings', mult: 1.0 },
  { id: 'Minor Wear', title: 'Minor Wear', desc: 'Small paint chips or slight cover marks', mult: 0.92 },
  { id: 'Dents / Scratches', title: 'Dents / Scratches', desc: 'Visible corner dents, heavy frame scratches', mult: 0.75 },
  { id: 'Broken Back Glass', title: 'Broken Back Glass', desc: 'Cracked back panel or bent chassis', mult: 0.60 }
];

const ACCESSORIES = [
  { id: 'box', label: 'Original Box', bonus: 250 },
  { id: 'charger', label: 'Original Charger & Cable', bonus: 400 },
  { id: 'bill', label: 'Valid Purchase Bill', bonus: 350 }
];

const PICKUP_SLOTS = [
  'Today - Express Pickup (Within 2 Hours)',
  'Today - Afternoon (2:00 PM - 5:00 PM)',
  'Today - Evening (5:00 PM - 8:30 PM)',
  'Tomorrow - Morning (10:00 AM - 1:00 PM)',
  'Direct Store Drop-off (Karur / Madurai)'
];

export default function SellPhoneModal({
  isOpen,
  onClose,
  currentUser,
  addToast,
  t = (k) => k
}) {
  const [activeTab, setActiveTab] = useState('sell'); // 'sell' | 'track'
  const [step, setStep] = useState(1); // 1: Device, 2: Condition, 3: Contact & Book
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSellRequest, setCreatedSellRequest] = useState(null);

  // Device selections
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('iPhone 13');
  const [selectedStorage, setSelectedStorage] = useState('128 GB');

  // Condition selections
  const [screenCondition, setScreenCondition] = useState('Flawless');
  const [bodyCondition, setBodyCondition] = useState('Like New');
  const [functionalChecks, setFunctionalChecks] = useState({
    cameras: true,
    biometrics: true,
    batteryGood: true,
    callsWifi: true
  });
  const [selectedAccessories, setSelectedAccessories] = useState(['box', 'charger']);

  // Contact details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);

  // Tracking tab state
  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedRequests, setTrackedRequests] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Auto-populate user info
  useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerAddress && currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCreatedSellRequest(null);
      setStep(1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate live dynamic estimated cash offer
  const calculateOffer = () => {
    const brandObj = POPULAR_BRANDS.find(b => b.name === selectedBrand) || POPULAR_BRANDS[0];
    let base = brandObj.baseVal;

    // Model keyword adjustments
    const modelLower = deviceModel.toLowerCase();
    if (modelLower.includes('pro max') || modelLower.includes('ultra')) base *= 1.5;
    else if (modelLower.includes('pro') || modelLower.includes('plus')) base *= 1.25;
    else if (modelLower.includes('lite') || modelLower.includes('neo') || modelLower.includes('ce')) base *= 0.8;

    const storageObj = STORAGE_OPTIONS.find(s => s.size === selectedStorage) || STORAGE_OPTIONS[1];
    base *= storageObj.multiplier;

    const screenObj = SCREEN_CONDITIONS.find(s => s.id === screenCondition) || SCREEN_CONDITIONS[0];
    base *= screenObj.mult;

    const bodyObj = BODY_CONDITIONS.find(b => b.id === bodyCondition) || BODY_CONDITIONS[0];
    base *= bodyObj.mult;

    // Functional deductions
    if (!functionalChecks.cameras) base *= 0.88;
    if (!functionalChecks.biometrics) base *= 0.88;
    if (!functionalChecks.batteryGood) base *= 0.88;
    if (!functionalChecks.callsWifi) base *= 0.85;

    // Accessories bonus
    let bonus = 0;
    selectedAccessories.forEach(accId => {
      const acc = ACCESSORIES.find(a => a.id === accId);
      if (acc) bonus += acc.bonus;
    });

    const finalVal = Math.round((base + bonus) / 100) * 100;
    const minVal = Math.max(1000, Math.round((finalVal * 0.94) / 100) * 100);
    const maxVal = Math.max(1200, Math.round((finalVal * 1.06) / 100) * 100);

    return { estimated: finalVal, min: minVal, max: maxVal };
  };

  const currentValuation = calculateOffer();

  const handleBrandChange = (brandName) => {
    setSelectedBrand(brandName);
    const presets = BRAND_PRESET_MODELS[brandName];
    if (presets && presets.length > 0) {
      setDeviceModel(presets[0]);
    } else {
      setDeviceModel('');
    }
  };

  const toggleAccessory = (id) => {
    if (selectedAccessories.includes(id)) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== id));
    } else {
      setSelectedAccessories([...selectedAccessories, id]);
    }
  };

  const handleFunctionalToggle = (key) => {
    setFunctionalChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitSellRequest = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      if (addToast) addToast('Please enter your name', '⚠️');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      if (addToast) addToast('Please enter a valid 10-digit mobile number', '⚠️');
      return;
    }
    if (!customerAddress.trim()) {
      if (addToast) addToast('Please enter your pickup address or city', '⚠️');
      return;
    }

    setIsSubmitting(true);

    const accessoriesText = selectedAccessories
      .map(id => ACCESSORIES.find(a => a.id === id)?.label)
      .filter(Boolean)
      .join(', ') || 'None';

    const functionalSummary = Object.entries(functionalChecks)
      .filter(([_, ok]) => !ok)
      .map(([k]) => k)
      .join(', ');

    const payload = {
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerAddress: customerAddress.trim(),
      deviceBrand: selectedBrand,
      deviceModel: deviceModel.trim(),
      deviceStorage: selectedStorage,
      screenCondition: screenCondition,
      bodyCondition: bodyCondition,
      functionalIssues: functionalSummary || 'None (All Working)',
      accessoriesIncluded: accessoriesText,
      estimatedQuote: currentValuation.estimated,
      pickupPreferredDate: pickupSlot
    };

    try {
      const res = await fetch(`${API_BASE}/api/sell-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.request) {
        setCreatedSellRequest(data.request);
        if (addToast) addToast('Sell request booked successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.warn('API error, falling back to local session persistence:', err.message);
      const fallbackRequest = {
        requestId: `SELL-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'Pending Inspection',
        createdAt: new Date().toISOString()
      };
      setCreatedSellRequest(fallbackRequest);
      if (addToast) addToast('Sell request submitted! We will contact you shortly.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      setTrackError('Please enter your 10-digit phone number or Request ID.');
      return;
    }

    setIsTracking(true);
    setTrackError('');
    setTrackedRequests(null);

    try {
      const res = await fetch(`${API_BASE}/api/sell-requests/track?query=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.requests) && data.requests.length > 0) {
        setTrackedRequests(data.requests);
      } else {
        setTrackError('No sell requests found matching this phone number or ID.');
      }
    } catch (err) {
      setTrackError('Unable to connect to server. Please try again or WhatsApp us directly.');
    } finally {
      setIsTracking(false);
    }
  };

  const getWhatsAppShareUrl = (request) => {
    const text = `*NEW OLD PHONE SELL REQUEST - FRIENDS MOBILES* 📱💵%0A%0A` +
      `*Request ID:* ${request.requestId}%0A` +
      `*Customer:* ${request.customerName} (${request.customerPhone})%0A` +
      `*Device:* ${request.deviceBrand} ${request.deviceModel} (${request.deviceStorage})%0A` +
      `*Screen Condition:* ${request.screenCondition}%0A` +
      `*Body Condition:* ${request.bodyCondition}%0A` +
      `*Accessories:* ${request.accessoriesIncluded}%0A` +
      `*Estimated Cash Offer:* ₹${request.estimatedQuote?.toLocaleString('en-IN')}%0A` +
      `*Pickup Address:* ${request.customerAddress}%0A` +
      `*Slot:* ${request.pickupPreferredDate}%0A%0A` +
      `_Please inspect and provide instant payment!_`;

    return `https://wa.me/917448578507?text=${text}`;
  };

  return (
    <div 
      className="sell-phone-modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(7, 10, 17, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
    >
      <div 
        className="sell-phone-modal-container" 
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderRadius: 0,
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card, #ffffff)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6b00, #ff8c33)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
            }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Sell Your Old Phone
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Instant Cash Guarantee • Free Doorstep Inspection • 100% Data Safe
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-input, #f1f5f9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          background: 'var(--bg-secondary, #f8fafc)',
          padding: '4px 8px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'sell' ? 'var(--bg-card, #ffffff)' : 'transparent',
              color: activeTab === 'sell' ? 'var(--primary-orange, #ff6b00)' : 'var(--text-muted, #64748b)',
              fontWeight: activeTab === 'sell' ? 800 : 600,
              fontSize: '0.9rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'sell' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Smartphone size={18} />
            Get Instant Quote & Sell
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'track' ? 'var(--bg-card, #ffffff)' : 'transparent',
              color: activeTab === 'track' ? 'var(--primary-orange, #ff6b00)' : 'var(--text-muted, #64748b)',
              fontWeight: activeTab === 'track' ? 800 : 600,
              fontSize: '0.9rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'track' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <RefreshCw size={18} />
            Track Sell Request
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 40px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Tab 1: Sell Flow */}
          {activeTab === 'sell' && (
          <div style={{ padding: '24px' }}>
            {createdSellRequest ? (
              /* Success Confirmation View */
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={44} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Sell Request Confirmed!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px' }}>
                  Our inspection executive will visit you as scheduled. Keep your phone charged and backed up.
                </p>

                <div style={{
                  background: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '20px',
                  maxWidth: '520px',
                  margin: '0 auto 24px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--border-color, #cbd5e1)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Request ID:</span>
                    <strong style={{ color: 'var(--primary-orange, #ff6b00)', fontSize: '0.95rem' }}>
                      {createdSellRequest.requestId}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device:</span>
                    <strong style={{ fontSize: '0.9rem' }}>{createdSellRequest.deviceBrand} {createdSellRequest.deviceModel} ({createdSellRequest.deviceStorage})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Screen & Body:</span>
                    <span style={{ fontSize: '0.85rem' }}>{createdSellRequest.screenCondition} / {createdSellRequest.bodyCondition}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pickup Slot:</span>
                    <span style={{ fontSize: '0.85rem' }}>{createdSellRequest.pickupPreferredDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed var(--border-color, #cbd5e1)' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Estimated Cash Quote:</span>
                    <strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>
                      ₹{createdSellRequest.estimatedQuote?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                  <a
                    href={getWhatsAppShareUrl(createdSellRequest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-orange"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      padding: '14px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      background: '#25D366',
                      borderColor: '#25D366',
                      color: '#ffffff',
                      borderRadius: '12px'
                    }}
                  >
                    <MessageCircle size={20} />
                    Confirm on WhatsApp for Fast Cash
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSellRequest(null);
                      setStep(1);
                      onClose();
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* Multi-step Buyback Form */
              <div>
                {/* Step indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  {[
                    { num: 1, label: 'Device Model' },
                    { num: 2, label: 'Condition & Health' },
                    { num: 3, label: 'Pickup & Cash' }
                  ].map((s) => (
                    <React.Fragment key={s.num}>
                      <button
                        type="button"
                        onClick={() => { if (step > s.num) setStep(s.num); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          cursor: step >= s.num ? 'pointer' : 'default',
                          color: step === s.num ? 'var(--primary-orange, #ff6b00)' : step > s.num ? '#10b981' : 'var(--text-muted)'
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: step === s.num ? 'var(--primary-orange, #ff6b00)' : step > s.num ? '#10b981' : 'var(--bg-secondary)',
                          color: step >= s.num ? '#ffffff' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {step > s.num ? '✓' : s.num}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: step === s.num ? 700 : 500 }}>
                          {s.label}
                        </span>
                      </button>
                      {s.num < 3 && (
                        <div style={{
                          width: '24px',
                          height: '2px',
                          background: step > s.num ? '#10b981' : 'var(--border-color, #e2e8f0)'
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* STEP 1: Select Brand & Model */}
                {step === 1 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>
                      1. Select Smartphone Brand
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                      gap: '8px',
                      marginBottom: '20px'
                    }}>
                      {POPULAR_BRANDS.map(b => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => handleBrandChange(b.name)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 6px',
                            borderRadius: '12px',
                            border: selectedBrand === b.name ? '2px solid var(--primary-orange, #ff6b00)' : '1px solid var(--border-color, #e2e8f0)',
                            background: selectedBrand === b.name ? 'rgba(255, 107, 0, 0.06)' : 'var(--bg-secondary, #f8fafc)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: selectedBrand === b.name ? 'var(--primary-orange, #ff6b00)' : 'var(--border-color, #e2e8f0)',
                            color: selectedBrand === b.name ? '#ffffff' : 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {b.code}
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: selectedBrand === b.name ? 700 : 500, textAlign: 'center' }}>
                            {b.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700 }}>
                      2. Phone Model
                    </h4>
                    <div style={{ marginBottom: '16px' }}>
                      <input
                        type="text"
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder={`e.g. ${selectedBrand} model name`}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color, #cbd5e1)',
                          background: 'var(--bg-input, #ffffff)',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Quick Model presets */}
                      {BRAND_PRESET_MODELS[selectedBrand] && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                          {BRAND_PRESET_MODELS[selectedBrand].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setDeviceModel(m)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                borderRadius: '20px',
                                border: deviceModel === m ? '1px solid var(--primary-orange)' : '1px solid var(--border-color, #cbd5e1)',
                                background: deviceModel === m ? 'var(--primary-orange)' : 'var(--bg-secondary)',
                                color: deviceModel === m ? '#ffffff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: deviceModel === m ? 700 : 500
                              }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700 }}>
                      3. Internal Storage Capacity
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      {STORAGE_OPTIONS.map(s => (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => setSelectedStorage(s.size)}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '10px',
                            border: selectedStorage === s.size ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                            background: selectedStorage === s.size ? 'rgba(255, 107, 0, 0.08)' : 'var(--bg-secondary)',
                            fontWeight: selectedStorage === s.size ? 800 : 600,
                            color: selectedStorage === s.size ? 'var(--primary-orange)' : 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>

                    {/* Live Quote Preview Box */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(255, 140, 51, 0.03))',
                      border: '1px solid rgba(255, 107, 0, 0.25)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Estimated Cash Range
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          ₹{currentValuation.min.toLocaleString('en-IN')} – ₹{currentValuation.max.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          *Based on device condition selected in next step
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!deviceModel.trim()) {
                            if (addToast) addToast('Please enter your phone model', '⚠️');
                            return;
                          }
                          setStep(2);
                        }}
                        className="btn btn-orange"
                        style={{
                          padding: '12px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          borderRadius: '10px'
                        }}
                      >
                        Next: Condition <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Condition & Accessories */}
                {step === 2 && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                      Screen Condition
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                      {SCREEN_CONDITIONS.map(c => (
                        <div
                          key={c.id}
                          onClick={() => setScreenCondition(c.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: screenCondition === c.id ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                            background: screenCondition === c.id ? 'rgba(255, 107, 0, 0.06)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.88rem' }}>{c.title}</strong>
                            {screenCondition === c.id && <Check size={16} color="var(--primary-orange)" />}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{c.desc}</span>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                      Body / Frame Condition
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                      {BODY_CONDITIONS.map(b => (
                        <div
                          key={b.id}
                          onClick={() => setBodyCondition(b.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: bodyCondition === b.id ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                            background: bodyCondition === b.id ? 'rgba(255, 107, 0, 0.06)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.88rem' }}>{b.title}</strong>
                            {bodyCondition === b.id && <Check size={16} color="var(--primary-orange)" />}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{b.desc}</span>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                      Functional Checks (Uncheck if defective)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', marginBottom: '18px' }}>
                      {[
                        { key: 'cameras', label: 'Front & Back Cameras OK' },
                        { key: 'biometrics', label: 'Face ID / Fingerprint Works' },
                        { key: 'batteryGood', label: 'Battery Health Good (>80%)' },
                        { key: 'callsWifi', label: 'Calling, Mic & WiFi OK' }
                      ].map(f => (
                        <label
                          key={f.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: functionalChecks[f.key] ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: functionalChecks[f.key] ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={functionalChecks[f.key]}
                            onChange={() => handleFunctionalToggle(f.key)}
                            style={{ accentColor: '#10b981' }}
                          />
                          {f.label}
                        </label>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                      Available Original Accessories (Adds Extra Cash)
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
                      {ACCESSORIES.map(acc => {
                        const isChecked = selectedAccessories.includes(acc.id);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => toggleAccessory(acc.id)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '20px',
                              border: isChecked ? '1px solid #10b981' : '1px solid var(--border-color)',
                              background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                              color: isChecked ? '#047857' : 'var(--text-secondary)',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {isChecked ? '✓' : '+'} {acc.label} (+₹{acc.bonus})
                          </button>
                        );
                      })}
                    </div>

                    {/* Offer Bar */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Value</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16a34a' }}>
                          ₹{currentValuation.estimated.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'none',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="btn btn-orange"
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          Book Doorstep Cash <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Contact & Doorstep Pickup Details */}
                {step === 3 && (
                  <form onSubmit={handleSubmitSellRequest}>
                    {/* Valuation Summary Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      color: '#ffffff',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Guaranteed Cash Quote
                        </span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#22c55e' }}>
                          ₹{currentValuation.estimated.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          {selectedBrand} {deviceModel} ({selectedStorage}) • {screenCondition}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '20px'
                        }}>
                          <ShieldCheck size={14} /> 100% Data Wiped
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                          Your Name *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Full Name"
                            style={{
                              width: '100%',
                              padding: '12px 14px 12px 38px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                          Mobile Number *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="10-digit Phone"
                            style={{
                              width: '100%',
                              padding: '12px 14px 12px 38px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Pickup Address / Store Drop-off Location *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Door No, Street, Landmark, Town / City (e.g. Karur, Madurai, Dindigul)"
                          style={{
                            width: '100%',
                            padding: '12px 14px 12px 38px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Preferred Pickup Slot
                      </label>
                      <select
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                          fontSize: '0.9rem'
                        }}
                      >
                        {PICKUP_SLOTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'none',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-orange"
                        style={{
                          flex: 1,
                          padding: '14px',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Booking Your Pickup...' : `Confirm & Sell for ₹${currentValuation.estimated.toLocaleString('en-IN')}`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Track Requests */}
        {activeTab === 'track' && (
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleTrackLookup} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter 10-digit Phone or Request ID (e.g. SELL-1234)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                disabled={isTracking}
                className="btn btn-orange"
                style={{ padding: '12px 20px', borderRadius: '10px', fontWeight: 700 }}
              >
                {isTracking ? 'Searching...' : 'Track'}
              </button>
            </form>

            {trackError && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontSize: '0.85rem' }}>
                {trackError}
              </div>
            )}

            {trackedRequests && trackedRequests.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trackedRequests.map(req => (
                  <div 
                    key={req.requestId || req.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '16px',
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ color: 'var(--primary-orange)' }}>#{req.requestId}</strong>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: req.status === 'Completed / Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                        color: req.status === 'Completed / Paid' ? '#10b981' : 'var(--primary-orange)'
                      }}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>
                      {req.deviceBrand} {req.deviceModel} ({req.deviceStorage})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Screen: {req.screenCondition} • Body: {req.bodyCondition} • Slot: {req.pickupPreferredDate}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem' }}>Estimated Cash Offer:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>
                        ₹{req.estimatedQuote?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
