// Centralized API Base & Host Configuration for Web & Capacitor / Android APK

export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;

  // 1. Exclude live production website and browser dev server
  const host = (window.location.hostname || '').toLowerCase();
  const isWebDevServer = (host === 'localhost' || host === '127.0.0.1') && 
                         (window.location.port === '5173' || window.location.port === '3000' || window.location.port === '5000');
  const isLiveWebsite = host === 'friendsmobile.co.in' || host.endsWith('.friendsmobile.co.in');

  if (isLiveWebsite || isWebDevServer) {
    return false;
  }

  // 2. Explicit Capacitor object / native platform
  if (window.Capacitor?.isNativePlatform?.() || (window.Capacitor && window.Capacitor.getPlatform() !== 'web')) {
    return true;
  }

  // 3. Native app protocols
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
    return true;
  }

  // 4. Android WebView User Agent detection (Always present in Android APK WebViews!)
  const ua = (navigator.userAgent || '').toLowerCase();
  const isAndroidWebView = ua.includes('android') && (ua.includes('wv') || ua.includes('version/'));

  // 5. Capacitor default localhost origin without port
  const isCapacitorLocalhost = host === 'localhost' && !window.location.port;

  return Boolean(isAndroidWebView || isCapacitorLocalhost || window.Capacitor);
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
