// Centralized API Base & Host Configuration for Web & Capacitor / Android APK

export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;

  const host = (window.location.hostname || '').toLowerCase();
  const port = window.location.port || '';

  // 1. If running on any local dev server port (e.g. localhost:3000, 3001, 5173, etc.), it is strictly browser web
  if ((host === 'localhost' || host === '127.0.0.1') && port !== '') {
    return false;
  }

  // 2. If running on live production website or staging domains, it is strictly browser web
  if (host === 'friendsmobile.co.in' || host.endsWith('.friendsmobile.co.in') || host.includes('vercel.app') || host.includes('netlify.app')) {
    return false;
  }

  // 3. Explicit Capacitor native platform check
  if (window.Capacitor?.isNativePlatform?.() || (window.Capacitor && window.Capacitor.getPlatform() !== 'web')) {
    return true;
  }

  // 4. Native app protocols
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
    return true;
  }

  // 5. Android WebView User Agent detection (Present in Android APK WebViews)
  const ua = (navigator.userAgent || '').toLowerCase();
  const isAndroidWebView = ua.includes('android') && (ua.includes('wv') || ua.includes('version/'));

  // 6. Capacitor default native localhost origin without port
  const isCapacitorLocalhost = host === 'localhost' && !port;

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
