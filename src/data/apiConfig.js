// Centralized API Base & Host Configuration for Web & Capacitor / Android APK

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api') {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  const isCapacitor = typeof window !== 'undefined' && (
    window.Capacitor !== undefined ||
    (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && window.location.port !== '5173' && window.location.port !== '3000' && window.location.port !== '5000')
  );

  if (isCapacitor) {
    return 'https://friendsmobiles.unitaryx.org/api';
  }

  return '/api';
};

export const getApiHost = () => {
  const base = getApiBaseUrl();
  if (base.startsWith('http')) {
    return base.replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:5000';
  }
  return '';
};
