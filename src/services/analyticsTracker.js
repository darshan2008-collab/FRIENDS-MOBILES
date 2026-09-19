import { getApiHost } from '../data/apiConfig';

let currentSessionId = null;
let currentVisitorId = null;
let sessionStartTime = Date.now();
let heartbeatTimer = null;
let currentPageName = 'Home Catalog';

function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem('fm_visitor_id');
    if (!vid) {
      vid = `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('fm_visitor_id', vid);
    }
    return vid;
  } catch (_) {
    return `vis_${Date.now()}`;
  }
}

function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('fm_session_id');
    if (!sid) {
      sid = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem('fm_session_id', sid);
    }
    return sid;
  } catch (_) {
    return `sess_${Date.now()}`;
  }
}

export function initVisitorTracking() {
  if (typeof window === 'undefined') return;

  currentVisitorId = getOrCreateVisitorId();
  currentSessionId = getOrCreateSessionId();
  sessionStartTime = Date.now();

  const apiHost = getApiHost();
  const referrer = document.referrer || (window.location.search.includes('whatsapp') ? 'WhatsApp' : 'Direct');

  // Initial visit ping
  fetch(`${apiHost}/api/analytics/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: currentSessionId,
      visitorId: currentVisitorId,
      page: currentPageName,
      referrer
    })
  }).catch(() => {});

  // Start periodic 20-second heartbeat
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    sendHeartbeat();
  }, 20000);

  // Send heartbeat on page visibility change or unload
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sendHeartbeat();
    }
  });

  window.addEventListener('beforeunload', () => {
    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const payload = JSON.stringify({
      sessionId: currentSessionId,
      durationSeconds,
      currentPage: currentPageName
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${apiHost}/api/analytics/heartbeat`, payload);
    }
  });
}

export function trackPageView(pageName) {
  if (!pageName) return;
  currentPageName = pageName;
  const apiHost = getApiHost();
  const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

  fetch(`${apiHost}/api/analytics/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: currentSessionId || getOrCreateSessionId(),
      visitorId: currentVisitorId || getOrCreateVisitorId(),
      page: pageName,
      durationSeconds
    })
  }).catch(() => {});
}

function sendHeartbeat() {
  const apiHost = getApiHost();
  const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

  fetch(`${apiHost}/api/analytics/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: currentSessionId || getOrCreateSessionId(),
      durationSeconds,
      currentPage: currentPageName
    })
  }).catch(() => {});
}

export async function fetchLiveTrafficStats() {
  try {
    const apiHost = getApiHost();
    const res = await fetch(`${apiHost}/api/analytics/stats`);
    if (res.ok) {
      const data = await res.json();
      return data?.stats || null;
    }
  } catch (_) {}
  return null;
}
