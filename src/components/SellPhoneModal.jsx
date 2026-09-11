import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Smartphone, DollarSign, ShieldCheck, 
  MessageSquare, CheckCircle2, 
  MapPin, Phone, User, Calendar, Upload, 
  Image as ImageIcon, Trash2, Plus, Sparkles
} from 'lucide-react';
import { getApiBaseUrl } from '../data/apiConfig';

const API_BASE = getApiBaseUrl();

const PICKUP_SLOTS = [
  'Today - Express Pickup (Within 2 Hours)',
  'Today - Afternoon (2:00 PM - 5:00 PM)',
  'Today - Evening (5:00 PM - 8:30 PM)',
  'Tomorrow - Morning (10:00 AM - 1:00 PM)',
  'Direct Store Drop-off (Karur / Madurai Showroom)'
];

export default function SellPhoneModal({
  isOpen,
  onClose,
  currentUser,
  addToast,
  t = (k) => k
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSellRequest, setCreatedSellRequest] = useState(null);

  // Form fields (Typeable)
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [devicePhotos, setDevicePhotos] = useState([]); // Array of base64 strings

  // Customer contact details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);

  const fileInputRef = useRef(null);

  // Auto-populate user info
  useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerAddress && currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  // Handle body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCreatedSellRequest(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle multiple photo uploads (front, back, sides)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (devicePhotos.length + files.length > 6) {
      if (addToast) addToast('You can upload up to 6 photos of your phone', 'warning');
      return;
    }

    files.forEach(file => {
      if (file.size > 8 * 1024 * 1024) {
        if (addToast) addToast(`${file.name} is larger than 8MB`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDevicePhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (addToast) addToast('Photo(s) added successfully', 'success');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (indexToRemove) => {
    setDevicePhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const getWhatsAppUrl = (request) => {
    const text = `*NEW SELL PHONE / BUYBACK REQUEST - FRIENDS MOBILES*%0A%0A` +
      `*Request ID:* ${request.requestId}%0A` +
      `*Customer:* ${request.customerName} (${request.customerPhone})%0A` +
      `*Device Brand:* ${request.deviceBrand}%0A` +
      `*Device Model:* ${request.deviceModel}%0A` +
      `*Specifications & Condition:* ${request.specifications || 'As inspected'}%0A` +
      `*Pickup Address:* ${request.customerAddress}%0A` +
      `*Slot:* ${request.pickupPreferredDate}%0A` +
      `*Photos Uploaded:* ${request.devicePhotos?.length || 0} image(s)%0A%0A` +
      `_Please inspect and confirm doorstep valuation & instant payment!_`;

    return `https://wa.me/917448578507?text=${text}`;
  };

  const handleSubmitSellRequest = async (e) => {
    e.preventDefault();

    if (!deviceBrand.trim()) {
      if (addToast) addToast('Please enter your phone brand (e.g. Apple, Samsung)', 'warning');
      return;
    }
    if (!deviceModel.trim()) {
      if (addToast) addToast('Please enter your phone model name', 'warning');
      return;
    }
    if (!customerName.trim()) {
      if (addToast) addToast('Please enter your full name', 'warning');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      if (addToast) addToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!customerAddress.trim()) {
      if (addToast) addToast('Please enter your pickup address or town/city', 'warning');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerAddress: customerAddress.trim(),
      deviceBrand: deviceBrand.trim(),
      deviceModel: deviceModel.trim(),
      specifications: specifications.trim() || 'No additional specifications mentioned',
      devicePhotos: devicePhotos,
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
        if (addToast) addToast('Sell request booked! Opening WhatsApp...', 'success');
        window.open(getWhatsAppUrl(data.request), '_blank');
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.warn('API error, falling back to local persistence & WhatsApp:', err.message);
      const fallbackRequest = {
        requestId: `SELL-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'Pending Inspection',
        createdAt: new Date().toISOString()
      };
      setCreatedSellRequest(fallbackRequest);
      if (addToast) addToast('Request created! Connecting to WhatsApp...', 'success');
      window.open(getWhatsAppUrl(fallbackRequest), '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="sell-phone-modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
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
      <div 
        className="sell-phone-modal-container" 
        style={{
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderRadius: 0,
          border: 'none',
          boxShadow: 'none',
          margin: 0,
          padding: 0,
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Sticky Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card, #ffffff)',
          zIndex: 30,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6b00, #ff8c33)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
            }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Sell Your Old Phone
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#ff6b00',
                  background: 'rgba(255, 107, 0, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  Instant Doorstep Payment
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', margin: '2px 0 0' }}>
                Instant Cash Guarantee • Free Doorstep Inspection • 100% Data Safe
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary, #f1f5f9)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
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

        {/* Scrollable Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px 40px',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
            {createdSellRequest ? (
              /* Success Confirmation View */
              <div style={{ textAlign: 'center', padding: '30px 16px' }}>
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
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
                  Our inspection executive will verify your phone and provide instant payment. Keep your phone charged and backed up.
                </p>

                <div style={{
                  background: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '20px',
                  maxWidth: '560px',
                  margin: '0 auto 24px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Request ID:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary-orange, #ff6b00)' }}>
                      #{createdSellRequest.requestId}
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Brand & Model</span>
                      <strong>{createdSellRequest.deviceBrand} {createdSellRequest.deviceModel}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Customer</span>
                      <strong>{createdSellRequest.customerName} ({createdSellRequest.customerPhone})</strong>
                    </div>
                  </div>

                  {createdSellRequest.specifications && (
                    <div style={{ fontSize: '0.82rem', marginBottom: '12px', padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Specifications & Condition</span>
                      <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{createdSellRequest.specifications}</p>
                    </div>
                  )}

                  <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Pickup Address & Slot</span>
                    <strong>{createdSellRequest.customerAddress}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{createdSellRequest.pickupPreferredDate}</div>
                  </div>

                  {createdSellRequest.devicePhotos && createdSellRequest.devicePhotos.length > 0 && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '6px' }}>Uploaded Phone Photos</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {createdSellRequest.devicePhotos.map((photo, pIdx) => (
                          <img 
                            key={pIdx} 
                            src={photo} 
                            alt={`Device Condition ${pIdx + 1}`} 
                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={getWhatsAppUrl(createdSellRequest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-orange"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <MessageSquare size={18} />
                    Open WhatsApp Chat
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* Main Sell Phone Booking Form */
              <form onSubmit={handleSubmitSellRequest} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. UPLOAD PHOTOS OF PHONE CONDITION (ALL SIDES) */}
                <div style={{
                  background: 'var(--bg-secondary, #f8fafc)',
                  border: '1.5px dashed var(--border-color, #cbd5e1)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800 }}>
                      <ImageIcon size={18} style={{ color: 'var(--primary-orange, #ff6b00)' }} />
                      1. Upload Photos of Phone Condition (All Sides)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {devicePhotos.length}/6 Photos
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                    Take or select clear photos of your phone from all angles (Front screen, Back panel, Left/Right edges, Camera lens).
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Thumbnail gallery */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {devicePhotos.map((photo, index) => (
                      <div 
                        key={index}
                        style={{
                          position: 'relative',
                          width: '90px',
                          height: '90px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '2px solid var(--border-color, #cbd5e1)',
                          background: '#000'
                        }}
                      >
                        <img 
                          src={photo} 
                          alt={`Phone Angle ${index + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove Photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {devicePhotos.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '10px',
                          border: '1.5px dashed var(--primary-orange, #ff6b00)',
                          background: 'rgba(255, 107, 0, 0.05)',
                          color: 'var(--primary-orange, #ff6b00)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        <Plus size={20} />
                        Add Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. SMARTPHONE BRAND & MODEL (TYPEABLE INPUTS) */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 16px' }}>
                    2. Smartphone Brand & Model
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={deviceBrand}
                        onChange={(e) => setDeviceBrand(e.target.value)}
                        placeholder="e.g. Apple, Samsung, OnePlus, Vivo, Xiaomi, Realme..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Phone Model Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder="e.g. iPhone 14 Pro, Galaxy S23 Ultra, Redmi Note 12..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PHONE SPECIFICATIONS & CONDITION (TYPEABLE TEXTAREA) */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 6px' }}>
                    3. Phone Specifications & Physical Condition
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                    Type your phone's storage capacity, RAM, color, battery health %, any scratches or defects, and available accessories.
                  </p>

                  <textarea
                    rows={4}
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    placeholder="e.g. 128 GB Storage, 6GB RAM, Blue Color, 89% Battery Health, Screen is clean without scratches, Original box & charger included, Bill available..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* 4. DOORSTEP PICKUP & CONTACT DETAILS */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 16px' }}>
                    4. Doorstep Pickup & Payment Contact
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Your Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your Full Name"
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
                          boxSizing: 'border-box',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      Preferred Inspection Slot
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      <select
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 38px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box'
                        }}
                      >
                        {PICKUP_SLOTS.map((slot, idx) => (
                          <option key={idx} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. SUBMISSION ACTION */}
                <div style={{ paddingTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-orange"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(255, 107, 0, 0.35)',
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <MessageSquare size={20} />
                    {isSubmitting ? 'Registering Sell Request...' : 'Book Doorstep Inspection & Open WhatsApp Chat'}
                  </button>
                  <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Your request will be recorded in our database and instantly sent to our store manager on WhatsApp for inspection & instant payout.
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
