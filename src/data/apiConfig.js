// Centralized API Base & Host Configuration for Web & Capacitor / Android APK

export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;

  // 1. Explicit Capacitor native platform call (strictly returns true inside native Android/iOS app container)
  try {
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
      if (window.Capacitor.isNativePlatform()) {
        return true;
      }
    }
    if (window.Capacitor && typeof window.Capacitor.getPlatform === 'function') {
      const platform = window.Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        return true;
      }
    }
  } catch (_) {}

  // 2. Custom native protocols used in Capacitor APK
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
    return true;
  }

  // 3. Android Capacitor native WebView origin check (capacitor://localhost or https://localhost strictly without dev port)
  const host = (window.location.hostname || '').toLowerCase();
  const port = window.location.port || '';
  if (host === 'localhost' && !port && typeof window.Capacitor !== 'undefined') {
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('android') && (ua.includes('wv') || ua.includes('capacitor'))) {
      return true;
    }
  }

  // Any standard browser (Chrome, Safari, Firefox, Edge) or website domain is strictly false
  return false;
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
