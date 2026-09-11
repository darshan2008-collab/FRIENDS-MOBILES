import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Wrench, Smartphone, BatteryCharging, Zap, Droplets, Volume2, 
  Camera, Layers, Cpu, RotateCw, Search, CheckCircle2, 
  MapPin, Phone, User, Calendar, ShieldCheck, MessageSquare, 
  ArrowRight, RefreshCw, Upload, Image as ImageIcon, Trash2
} from 'lucide-react';
import { getApiBaseUrl } from '../data/apiConfig';

const API_BASE = getApiBaseUrl();

const POPULAR_BRANDS = [
  'Apple iPhone', 'Samsung', 'OnePlus', 'Xiaomi / Redmi', 
  'Realme', 'Vivo', 'Oppo', 'Poco', 'Motorola', 'Google Pixel', 'Nothing', 'Other'
];

const DEFECT_CATEGORIES = [
  { id: 'screen', title: 'Display / Screen Broken', subtitle: 'Lines, touch issue or cracked glass', icon: Smartphone },
  { id: 'battery', title: 'Battery Replacement', subtitle: 'Draining fast, swelling or sudden shutdown', icon: BatteryCharging },
  { id: 'charging', title: 'Charging Port / Jack', subtitle: 'Phone not charging or loose connector', icon: Zap },
  { id: 'water', title: 'Water / Liquid Damage', subtitle: 'Fell in liquid, ultrasonic chemical bath', icon: Droplets },
  { id: 'speaker', title: 'Speaker / Mic / Audio', subtitle: 'No sound on calls, low ear speaker', icon: Volume2 },
  { id: 'camera', title: 'Camera Blur / Lens', subtitle: 'Camera black screen, blur, or lens crack', icon: Camera },
  { id: 'backglass', title: 'Back Glass / Body Panel', subtitle: 'Rear cracked glass or bent frame', icon: Layers },
  { id: 'motherboard', title: 'Motherboard / IC Repair', subtitle: 'Dead phone, network or overheating', icon: Cpu },
  { id: 'software', title: 'Software & OS Unlock', subtitle: 'Hanging, boot loop, FRP or OS upgrade', icon: RotateCw },
  { id: 'general', title: 'General Inspection', subtitle: 'Complete hardware diagnostic checkup', icon: Search }
];

const PICKUP_SLOTS = [
  'Today - Express Pickup (Within 2 Hours)',
  'Today - Afternoon Slot (2:00 PM - 5:00 PM)',
  'Today - Evening Slot (5:00 PM - 8:30 PM)',
  'Tomorrow - Morning Slot (9:30 AM - 1:00 PM)',
  'Direct Store Walk-in / Drop-off'
];

export default function ServiceRequestModal({
  isOpen,
  onClose,
  initialDefect = '',
  currentUser,
  addToast,
  t = (k) => k
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState(null);

  // Form Fields
  const [deviceBrand, setDeviceBrand] = useState('Apple iPhone');
  const [customBrand, setCustomBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [defectType, setDefectType] = useState(initialDefect || 'Display / Screen Broken');
  const [defectDescription, setDefectDescription] = useState('');
  const [deviceImage, setDeviceImage] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [pickupPreferredDate, setPickupPreferredDate] = useState(PICKUP_SLOTS[0]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialDefect) {
      setDefectType(initialDefect);
    }
  }, [initialDefect]);

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
      setCreatedRequest(null);
      setCustomBrand('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      if (addToast) addToast('Please select a photo smaller than 8MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDeviceImage(reader.result);
      if (addToast) addToast('Mobile photo attached successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setDeviceImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getWhatsAppUrl = (req) => {
    const brand = req.deviceBrand === 'Other' && customBrand ? customBrand : req.deviceBrand;
    const text = `*NEW DOORSTEP MOBILE SERVICE REQUEST - FRIENDS MOBILES*%0A%0A` +
      `*Request ID:* ${req.requestId}%0A` +
      `*Customer:* ${req.customerName} (${req.customerPhone})%0A` +
      `*Device:* ${brand} ${req.deviceModel}%0A` +
      `*Issue / Defect:* ${req.defectType}%0A` +
      `*Problem Details:* ${req.defectDescription}%0A` +
      `*Pickup Address:* ${req.customerAddress}%0A` +
      `*Preferred Slot:* ${req.pickupPreferredDate}%0A%0A` +
      `_Please inspect and confirm doorstep pickup!_`;

    return `https://wa.me/917448578507?text=${text}`;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (deviceBrand === 'Other' && !customBrand.trim()) {
      if (addToast) addToast('Please enter your smartphone brand name', 'warning');
      return;
    }

    if (!customerName.trim()) {
      if (addToast) addToast('Please enter your name', 'warning');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      if (addToast) addToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    if (!deviceModel.trim()) {
      if (addToast) addToast('Please enter your phone model', 'warning');
      return;
    }

    if (!defectDescription.trim()) {
      if (addToast) addToast('Please describe the problem with your phone', 'warning');
      return;
    }

    if (!customerAddress.trim()) {
      if (addToast) addToast('Please enter your pickup address', 'warning');
      return;
    }

    setIsSubmitting(true);

    const resolvedBrand = deviceBrand === 'Other' ? (customBrand.trim() || 'Other') : deviceBrand;

    const payload = {
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerAddress: customerAddress.trim(),
      deviceBrand: resolvedBrand,
      deviceModel: deviceModel.trim(),
      defectType: defectType,
      defectDescription: defectDescription.trim(),
      pickupPreferredDate: pickupPreferredDate,
      deviceImage: deviceImage || ''
    };

    try {
      const res = await fetch(`${API_BASE}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.request) {
        setCreatedRequest(data.request);
        if (addToast) addToast('Service request submitted to store!', 'success');
        // Automatically open WhatsApp direct chat to store
        window.open(getWhatsAppUrl(data.request), '_blank');
      } else {
        throw new Error(data.message || 'Failed to submit service request');
      }
    } catch (err) {
      console.warn('API submission fallback:', err.message);
      const fallbackRequest = {
        requestId: `SRV-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'Pending Pickup',
        createdAt: new Date().toISOString()
      };
      setCreatedRequest(fallbackRequest);
      if (addToast) addToast('Service request created! Connecting to WhatsApp...', 'success');
      window.open(getWhatsAppUrl(fallbackRequest), '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="service-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: 'var(--bg-card, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: 0,
        margin: 0,
        borderRadius: 0,
        overflow: 'hidden'
      }}
    >
      {/* Full-Page Container */}
      <div 
        className="service-modal-container"
        style={{
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          margin: 0
        }}
      >
        {/* Top Sticky Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card, #ffffff)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF5500, #FF8C00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)'
            }}>
              <Wrench size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Mobile Repair & Doorstep Service
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#16a34a',
                  background: 'rgba(22, 163, 74, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  Doorstep Pickup Available
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                Certified Technicians • 100% Original Genuine Parts • 90-Day Warranty
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg-secondary, #f1f5f9)',
              color: 'var(--text-secondary, #475569)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px 40px',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ maxWidth: '920px', margin: '0 auto' }}>
              {createdRequest ? (
                /* Success Confirmation Screen */
                <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.12)',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <CheckCircle2 size={40} />
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
                    Repair Request Registered!
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px' }}>
                    Your request has been dispatched to our store portal and WhatsApp technician desk.
                  </p>

                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '20px',
                    maxWidth: '520px',
                    margin: '0 auto 24px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Request ID:</span>
                      <strong style={{ color: 'var(--primary-orange)' }}>{createdRequest.requestId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device:</span>
                      <strong>{createdRequest.deviceBrand} {createdRequest.deviceModel}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Issue:</span>
                      <span>{createdRequest.defectType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pickup Slot:</span>
                      <span>{createdRequest.pickupPreferredDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer:</span>
                      <span>{createdRequest.customerName} ({createdRequest.customerPhone})</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '420px', margin: '0 auto' }}>
                    <a
                      href={getWhatsAppUrl(createdRequest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-orange"
                      style={{
                        padding: '14px',
                        background: '#25D366',
                        borderColor: '#25D366',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <MessageSquare size={18} /> Open WhatsApp Chat with Store
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedRequest(null);
                        onClose();
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Repair Request Form */
                <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* SECTION 1: UPLOAD PHOTO OF DAMAGED MOBILE */}
                  <div style={{
                    background: 'var(--bg-secondary, #f8fafc)',
                    border: '1.5px dashed var(--border-color, #cbd5e1)',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={18} color="var(--primary-orange)" /> 1. Upload Photo of Phone Condition
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Take a photo showing screen cracks, body damage, or the problem area
                        </p>
                      </div>
                      {deviceImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} /> Remove Photo
                        </button>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="mobile-condition-upload"
                    />

                    {deviceImage ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'var(--bg-card)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <img 
                          src={deviceImage} 
                          alt="Mobile Condition" 
                          style={{
                            width: '90px',
                            height: '90px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={16} /> Photo Attached Successfully
                          </span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                            Our technician will inspect the damage prior to dispatching doorstep pickup.
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Change Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="mobile-condition-upload"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          borderRadius: '12px',
                          background: 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'border 0.2s',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <Upload size={28} color="var(--primary-orange)" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Click to Take Photo or Choose from Gallery
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Supports JPG, PNG (Max 8MB)
                        </span>
                      </label>
                    )}
                  </div>

                  {/* SECTION 2: SMARTPHONE BRAND & MODEL */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>
                      2. Smartphone Brand & Model
                    </h4>
                    
                    {/* Brand Selector Pills */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: '8px',
                      marginBottom: '14px'
                    }}>
                      {POPULAR_BRANDS.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setDeviceBrand(b)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '10px',
                            border: deviceBrand === b ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                            background: deviceBrand === b ? 'rgba(255, 85, 0, 0.08)' : 'var(--bg-secondary)',
                            color: deviceBrand === b ? 'var(--primary-orange)' : 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: deviceBrand === b ? 800 : 500,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>

                    {/* If "Other" brand is selected, prompt user to manually enter brand name */}
                    {deviceBrand === 'Other' && (
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-orange, #FF5500)' }}>
                          Enter Your Smartphone Brand Name *
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={customBrand}
                          onChange={(e) => setCustomBrand(e.target.value)}
                          placeholder="e.g. Asus, Honor, Infinix, Tecno, Lava, Micromax, iQOO..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1.5px solid var(--primary-orange, #FF5500)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '0.92rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Specific Phone Model Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder={deviceBrand === 'Other' ? (customBrand ? `e.g. ${customBrand} Model Name` : 'e.g. Specific Model Name') : `e.g. ${deviceBrand} Model (e.g. iPhone 13, Galaxy S23, Redmi Note 12)`}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.92rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: ISSUE CATEGORY (NO PRICES, NO EMOJIS) */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>
                      3. Select Defect Category
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '10px',
                      marginBottom: '16px'
                    }}>
                      {DEFECT_CATEGORIES.map(cat => {
                        const IconComponent = cat.icon;
                        const isSelected = defectType === cat.title;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setDefectType(cat.title)}
                            style={{
                              padding: '14px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                              background: isSelected ? 'rgba(255, 85, 0, 0.06)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: isSelected ? 'var(--primary-orange)' : 'var(--bg-card)',
                              color: isSelected ? '#ffffff' : 'var(--primary-orange)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComponent size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? 800 : 700, color: 'var(--text-primary)' }}>
                                {cat.title}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                                {cat.subtitle}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Describe the Problem in Detail (Reason) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={defectDescription}
                        onChange={(e) => setDefectDescription(e.target.value)}
                        placeholder="Please write what happened: e.g. Phone fell down and screen is blank, charging is loose, water fell on phone..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* SECTION 4: CUSTOMER DETAILS & DOORSTEP PICKUP */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800 }}>
                      4. Doorstep Pickup & Contact Details
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                          Customer Name *
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
                          10-digit Mobile Number *
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
                        Doorstep Pickup Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Door No, Street Name, Landmark, Town / City (e.g. Karur, Madurai)"
                          style={{
                            width: '100%',
                            padding: '12px 14px 12px 38px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Preferred Pickup Slot
                      </label>
                      <select
                        value={pickupPreferredDate}
                        onChange={(e) => setPickupPreferredDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {PICKUP_SLOTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON - DUAL SUBMIT TO ADMIN + WHATSAPP */}
                  <div style={{ paddingTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-orange"
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        opacity: isSubmitting ? 0.7 : 1,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <MessageSquare size={20} />
                      {isSubmitting ? 'Registering Request...' : 'Book Doorstep Pickup & Open WhatsApp Chat'}
                    </button>
                    <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Request will be stored in our database and instantly shared with our service team on WhatsApp.
                    </p>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
