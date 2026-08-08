import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Info, Tag, MapPin, 
  Truck, ShoppingBag, Trash2, Mail, Heart, Edit, Lock, Package, Bell, X, Copy, Check 
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

const getToastIcon = (icon) => {
  if (!icon) return <Bell size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
  
  switch (icon) {
    case 'warning':
    case '⚠️':
      return <AlertTriangle size={18} color="#eab308" style={{ flexShrink: 0 }} />;
    case 'success':
    case '🎉':
    case '✨':
    case '✅':
    case '✓':
      return <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />;
    case 'error':
    case '❌':
      return <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />;
    case 'info':
    case '👋':
      return <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />;
    case 'coupon':
    case '🎟️':
      return <Tag size={18} color="#10b981" style={{ flexShrink: 0 }} />;
    case 'map':
    case '📍':
      return <MapPin size={18} color="#3b82f6" style={{ flexShrink: 0 }} />;
    case 'truck':
    case '🚚':
      return <Truck size={18} color="#3b82f6" style={{ flexShrink: 0 }} />;
    case 'cart':
    case '🛍️':
      return <ShoppingBag size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
    case 'trash':
    case '🗑️':
      return <Trash2 size={18} color="#ef4444" style={{ flexShrink: 0 }} />;
    case 'email':
    case '📩':
      return <Mail size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
    case 'wishlist-empty':
    case '🤍':
      return <Heart size={18} color="#ef4444" fill="transparent" style={{ flexShrink: 0 }} />;
    case 'wishlist-full':
    case '❤️':
      return <Heart size={18} color="#ef4444" fill="#ef4444" style={{ flexShrink: 0 }} />;
    case 'edit':
    case '✏️':
    case '✏':
    case '⚙️':
      return <Edit size={18} color="#ffb800" style={{ flexShrink: 0 }} />;
    case 'lock':
    case '🔐':
      return <Lock size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
    case 'package':
    case '📦':
      return <Package size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
    default:
      if (typeof icon !== 'string') return icon;
      return <Bell size={18} color="#FF5500" style={{ flexShrink: 0 }} />;
  }
};

export default function ToastContainer({ toasts = [], onRemoveToast }) {
  const [copiedId, setCopiedId] = useState(null);
  const safeToasts = Array.isArray(toasts) ? toasts : [];
  if (safeToasts.length === 0) return null;

  const handleCopyToastCode = async (e, toastId, code) => {
    if (e) e.stopPropagation();
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedId(toastId);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  return (
    <div 
      className="toast-container" 
      style={{ 
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100099,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none'
      }}
    >
      {safeToasts.map(t => {
        const msgStr = typeof t.message === 'string' ? t.message : '';
        const detectedCode = t.codePayload || (msgStr.match(/FM-[A-Z0-9-]+/) || msgStr.match(/\b(WELCOME100|FRIENDS10|FRIENDS15|FRIENDS20|SUPER200|MEGA50|FREESHIP)\b/))?.[0];
        const isCopied = copiedId === t.id;

        return (
          <div 
            key={t.id || Math.random()} 
            className="toast-item"
            onClick={(e) => detectedCode && handleCopyToastCode(e, t.id, detectedCode)}
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: detectedCode ? '1.5px solid #22c55e' : '1px solid #FF5500',
              color: 'var(--text-primary, #1e293b)',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              fontSize: '0.86rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              pointerEvents: 'auto',
              backdropFilter: 'blur(10px)',
              cursor: detectedCode ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
              {getToastIcon(t.icon)}
              <span style={{ wordBreak: 'break-word', lineHeight: 1.4, flex: 1 }}>
                {t.message || ''}
              </span>
            </div>

            {detectedCode && (
              <button
                type="button"
                onClick={(e) => handleCopyToastCode(e, t.id, detectedCode)}
                style={{
                  background: isCopied ? '#22c55e' : '#FF5500',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                {isCopied ? 'Copied!' : 'Copy Code'}
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRemoveToast) onRemoveToast(t.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '4px',
                flexShrink: 0
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

