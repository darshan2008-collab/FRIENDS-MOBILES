// Centralized API Base & Host Configuration for Web & Capacitor / Android APK

export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) ||
    (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() !== 'web') ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && window.location.port !== '5173' && window.location.port !== '3000' && window.location.port !== '5000')
  );
};

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api') {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (isNativeApp()) {
    return 'https://friendsmobile.co.in/api';
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
