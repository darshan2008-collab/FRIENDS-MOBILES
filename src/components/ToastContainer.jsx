import React from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Info, Tag, MapPin, 
  Truck, ShoppingBag, Trash2, Mail, Heart, Edit, Lock, Package, Bell, X 
} from 'lucide-react';

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
  const safeToasts = Array.isArray(toasts) ? toasts : [];
  if (safeToasts.length === 0) return null;

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
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none'
      }}
    >
      {safeToasts.map(t => (
        <div 
          key={t.id || Math.random()} 
          className="toast-item"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid #FF5500',
            color: 'var(--text-primary)',
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
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            {getToastIcon(t.icon)}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.message || ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemoveToast && onRemoveToast(t.id)}
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
      ))}
    </div>
  );
}
