import React from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Info, Tag, MapPin, 
  Truck, ShoppingBag, Trash2, Mail, Heart, Edit, Lock, Package, Bell 
} from 'lucide-react';

const getToastIcon = (icon) => {
  if (!icon) return <Bell size={18} color="#FF5500" />;
  
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

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" style={{ zIndex: 99999 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getToastIcon(t.icon)}
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
