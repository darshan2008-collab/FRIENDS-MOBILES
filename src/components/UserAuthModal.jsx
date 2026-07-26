import React, { useState } from 'react';
import { X, LogIn, UserPlus, Phone, Lock, User, MapPin, Mail, ArrowRight, ShieldCheck, Heart, ShoppingBag, Sparkles, KeyRound, CheckCircle, Eye, EyeOff, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '929652702793-02ve5do6kgq0fv4hns0vd31g7of00lak.apps.googleusercontent.com';

const getApiEndpoints = (endpoint) => {
  const endpoints = [];
  
  // 1. Primary relative /api path (handled by NGINX or Vite proxy)
  endpoints.push(`/api${endpoint}`);

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    endpoints.push(`${origin}/api${endpoint}`);
    endpoints.push(`https://friends-mobiles-rho.vercel.app/api${endpoint}`);
  }

  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api') {
    const envBase = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
    endpoints.push(`${envBase}${endpoint}`);
  }

  return [...new Set(endpoints)];
};


const safeFetchApi = async (endpoint, options = {}) => {
  const urlList = getApiEndpoints(endpoint);
  let lastError = null;

  for (const url of urlList) {
    try {
      const res = await fetch(url, options);
      try {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      } catch (jsonErr) {
        if (res.ok) {
          return { ok: true, status: res.status, data: { success: true } };
        }
        const friendlyMsg = (res.status === 404 || res.status === 500 || res.status === 502 || res.status === 503)
          ? "Backend API server (port 5000) is offline. Please start backend using 'docker compose up' or 'node server/server.js'."
          : `Server HTTP ${res.status} error`;
        return { ok: false, status: res.status, data: { success: false, message: friendlyMsg } };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Unable to connect to backend server");
};

export default function UserAuthModal({ isOpen, onClose, onLoginSuccess, addToast, redirectMessage }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'forgot'

  // Login Form State
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form State
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  // Forgot Password Form State
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [verifiedName, setVerifiedName] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [emailCheckError, setEmailCheckError] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer effect for OTP resend
  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetAllAuthForms = () => {
    setLoginIdentity('');
    setLoginPassword('');
    setSignupForm({ name: '', phone: '', email: '', password: '' });
    setForgotPhone('');
    setForgotStep(1);
    setVerifiedName('');
    setSentEmail('');
    setEmailCheckError('');
    setOtpInput('');
    setOtpDigits(['', '', '', '', '', '']);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Reset credentials & form inputs whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetAllAuthForms();
    }
  }, [isOpen]);


  const triggerAutoVerifyIfComplete = (digitsArray) => {
    const fullCode = digitsArray.join('');
    if (fullCode.length === 6) {
      setTimeout(() => {
        executeVerifyOtp(fullCode);
      }, 150);
    }
  };

  const handleDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, '');
    const updated = [...otpDigits];
    updated[index] = clean.slice(-1);
    setOtpDigits(updated);
    const codeStr = updated.join('');
    setOtpInput(codeStr);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    triggerAutoVerifyIfComplete(updated);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const prevInput = document.getElementById(`otp-box-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          const updated = [...otpDigits];
          updated[index - 1] = '';
          setOtpDigits(updated);
          setOtpInput(updated.join(''));
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const digits = pasted.split('');
      const newArray = ['', '', '', '', '', ''];
      digits.forEach((d, i) => { newArray[i] = d; });
      setOtpDigits(newArray);
      const codeStr = newArray.join('');
      setOtpInput(codeStr);
      const lastIdx = Math.min(digits.length - 1, 5);
      const target = document.getElementById(`otp-box-${lastIdx}`);
      if (target) target.focus();

      triggerAutoVerifyIfComplete(newArray);
    }
  };



  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentity || !loginIdentity.trim()) {
      if (addToast) addToast('Please enter your email address and password', 'warning');
      return;
    }

    if (!loginIdentity.includes('@')) {
      if (addToast) addToast('Please enter a valid email address (e.g. user@gmail.com)', 'warning');
      return;
    }

    try {
      const { data, ok } = await safeFetchApi('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: loginIdentity.trim(), password: loginPassword })
      });

      if (data && data.success && data.user) {
        onLoginSuccess(data.user);
        if (addToast) addToast(data.message || `Welcome back, ${data.user.name}!`, 'success');
        onClose();
      } else {
        if (addToast) addToast((data && data.message) || 'Invalid email or password', 'error');
      }
    } catch (err) {
      console.warn("Login connection error:", err);
      if (addToast) addToast('Failed to connect to login server. Please try again.', 'error');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.phone || !signupForm.password) {
      if (addToast) addToast('Full name, email address, mobile phone number, and password are required', 'warning');
      return;
    }

    if (!signupForm.email.includes('@')) {
      if (addToast) addToast('Please enter a valid email address for account creation', 'warning');
      return;
    }

    try {
      const { data, ok } = await safeFetchApi('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });

      if (data && data.success && data.user) {
        onLoginSuccess(data.user);
        if (addToast) addToast(data.message || `Account created! Welcome, ${data.user.name}`, 'success');
        onClose();
      } else {
        if (addToast) addToast((data && data.message) || 'Registration failed', 'error');
      }
    } catch (err) {
      console.warn("Signup connection error:", err);
      if (addToast) addToast('Failed to connect to registration server. Please try again.', 'error');
    }
  };

  // Step 1: Send 6-Digit OTP to Email Address
  const handleSendOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setEmailCheckError('');
    const targetVal = forgotPhone ? forgotPhone.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!targetVal || !emailRegex.test(targetVal)) {
      const invalidMsg = 'Please enter a valid Gmail / Email address (e.g. user@gmail.com)';
      setEmailCheckError(invalidMsg);
      if (addToast) addToast(invalidMsg, 'warning');
      return;
    }

    setIsSubmitting(true);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpInput('');
    try {
      const { data } = await safeFetchApi('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetVal })
      });

      if (data && data.success) {
        setSentEmail(data.email || targetVal);
        setVerifiedName(data.name || 'Customer');
        setEmailCheckError('');
        setForgotStep(2);
        setResendTimer(120); // 2 minutes (120 seconds)
        if (addToast) addToast(data.message || `6-digit OTP sent to ${data.email || targetVal}! Valid for 2 mins.`, 'success');
      } else {
        const sendFailedMsg = (data && data.message) || `Failed to send OTP to ${targetVal}. Please try again.`;
        setEmailCheckError(sendFailedMsg);
        if (addToast) addToast(sendFailedMsg, 'error');
      }
    } catch (err) {
      console.error("Send OTP API Error:", err);
      const connErr = 'Failed to connect to authentication server. Please ensure the backend server is running and try again.';
      setEmailCheckError(connErr);
      if (addToast) addToast(connErr, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Core: Execute Verify Gmail OTP
  const executeVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpInput;
    if (!code || code.trim().length < 6) {
      if (addToast) addToast('Please enter the full 6-digit OTP code sent to your Gmail inbox', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await safeFetchApi('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, phone: forgotPhone, otp: code.trim() })
      });

      if (data && data.success) {
        setResetToken(data.resetToken || '');
        setForgotStep(3);
        if (addToast) addToast('OTP code verified successfully! Please set your new password.', 'success');
      } else {
        // REJECT INCORRECT OTP -> STOP & stay on Step 2!
        if (addToast) addToast((data && data.message) || 'Invalid 6-digit OTP code. Please check your Gmail inbox and try again.', 'error');
      }
    } catch (err) {
      console.error("Verify OTP API Error:", err);
      if (addToast) addToast('Failed to verify OTP with server. Please check your network and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Form Handler
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    executeVerifyOtp(otpInput);
  };

  // Step 3: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      if (addToast) addToast('Password must be at least 4 characters long', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (addToast) addToast('New password and confirm password do not match', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, ok } = await safeFetchApi('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: forgotPhone.trim(),
          phone: forgotPhone.trim(),
          email: sentEmail,
          newPassword,
          resetToken
        })
      });

      if (data && data.success) {
        if (addToast) addToast(data.message || 'Password reset successfully! Please log in with your new password.', 'success');
        setLoginIdentity(forgotPhone.trim());
        setLoginPassword(newPassword);
        setActiveTab('login');
        setForgotStep(1);
        setForgotPhone('');
        setOtpInput('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (addToast) addToast((data && data.message) || 'Password reset failed', 'error');
      }
    } catch (err) {
      if (addToast) addToast('Password reset failed. Please check your network and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoArunLogin = () => {
    const demoUser = {
      id: 101,
      name: 'Arun Kumar',
      phone: '7448578507',
      email: 'arun@example.com',
      address: 'Double Tank, South Gandhigramam, Karur - 639004, Tamil Nadu'
    };
    onLoginSuccess(demoUser);
    if (addToast) addToast('Logged in as Arun Kumar (Demo User)', 'info');
    onClose();
  };

  const parseGoogleJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (_) {
      return null;
    }
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);

    const completeGoogleAuth = async (email, name, picture, credentialToken) => {
      try {
        const { ok, data } = await safeFetchApi('/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name || email.split('@')[0],
            picture: picture || 'https://lh3.googleusercontent.com/a/default-user',
            credential: credentialToken || ''
          })
        });
        if (ok && data?.user) {
          if (onLoginSuccess) onLoginSuccess(data.user);
          if (addToast) addToast(`Welcome, ${data.user.name}! Signed in with Google.`, 'success');
        } else {
          const fallbackUser = { id: Date.now(), name: name || email.split('@')[0], email: email.trim(), phone: '', picture: picture || '', authProvider: 'google' };
          if (onLoginSuccess) onLoginSuccess(fallbackUser);
          if (addToast) addToast(`Welcome, ${fallbackUser.name}!`, 'success');
        }
      } catch (err) {
        const fallbackUser = { id: Date.now(), name: name || email.split('@')[0], email: email.trim(), phone: '', picture: picture || '', authProvider: 'google' };
        if (onLoginSuccess) onLoginSuccess(fallbackUser);
        if (addToast) addToast(`Signed in with Google as ${fallbackUser.name}!`, 'success');
      }
      setIsSubmitting(false);
      if (onClose) onClose();
    };

    // ─── Strategy 1: Google OAuth 2.0 Popup with account picker ─────────────
    try {
      const width = 500;
      const height = 600;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);

      const oauthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=select_account`;

      const popup = window.open(
        oauthUrl,
        'google_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
      );

      if (!popup || popup.closed) {
        // Popup blocked — fall through to GSI button flow
        throw new Error('Popup blocked');
      }

      // Poll for redirect with access_token in URL hash
      const pollInterval = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            return;
          }
          const popupUrl = popup.location.href;
          if (popupUrl && popupUrl.includes('access_token')) {
            clearInterval(pollInterval);
            popup.close();
            const hash = popupUrl.includes('#') ? popupUrl.split('#')[1] : popupUrl.split('?')[1];
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            if (accessToken) {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              const userInfo = await userInfoRes.json();
              if (userInfo && userInfo.email) {
                completeGoogleAuth(userInfo.email, userInfo.name, userInfo.picture, accessToken);
                return;
              }
            }
            setIsSubmitting(false);
          }
        } catch (_) {
          // Cross-origin error = still on Google's page, keep polling
        }
      }, 300);

      // Timeout after 3 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!popup.closed) popup.close();
        setIsSubmitting(false);
      }, 180000);

      return;
    } catch (popupErr) {
      // Popup blocked or failed — fall through to GSI token client
    }

    // ─── Strategy 2: Google Identity Services Token Client ──────────────────
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await userInfoRes.json();
              if (userInfo && userInfo.email) {
                completeGoogleAuth(userInfo.email, userInfo.name, userInfo.picture, tokenResponse.access_token);
                return;
              }
            } catch (_) {}
          }
          setIsSubmitting(false);
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // ─── Strategy 3: GSI ID Button (One Tap) ────────────────────────────────
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response && response.credential) {
            const payload = parseGoogleJwt(response.credential);
            if (payload && payload.email) {
              completeGoogleAuth(payload.email, payload.name, payload.picture, response.credential);
              return;
            }
          }
          setIsSubmitting(false);
        }
      });
      window.google.accounts.id.prompt();
      return;
    }

    // No Google SDK available
    setIsSubmitting(false);
    if (addToast) addToast('Google Sign-In is not available. Please use Email/Phone login.', 'error');
  };


  return (
    <div className="full-page-user-auth-portal">
      {/* Top Sticky Header */}
      <header className="auth-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <CompanyLogo size={36} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: '900', letterSpacing: '-0.3px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
              FRIENDS <span style={{ color: '#FF5500' }}>MOBILE</span>
            </h2>
            <span className="admin-subtitle-mobile-hide" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
              Member Orders &amp; Account Portal
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="auth-close-btn"
          style={{ flexShrink: 0 }}
        >
          <X size={16} /> <span className="close-btn-label">Store</span>
        </button>
      </header>

      {/* Main Atmosphere Background with Ambient Floating Orbs */}
      <div className="auth-portal-bg">
        <div className="auth-bg-orb-1"></div>
        <div className="auth-bg-orb-2"></div>

        {/* Floating Auth Card */}
        <div className="auth-main-card">
          {/* Left Brand Showcase Banner */}
          <div className="auth-brand-banner">
            <div>
              <div className="auth-badge-pill">
                <Sparkles size={16} /> MEMBER PRIVILEGES
              </div>

              <h2 style={{ fontSize: '2.1rem', fontWeight: '900', lineHeight: '1.22', margin: '0 0 16px 0', color: '#ffffff', letterSpacing: '-0.5px' }}>
                Your One Stop Mobile Destination
              </h2>
              
              <p style={{ fontSize: '0.94rem', opacity: '0.9', lineHeight: '1.65', margin: '0 0 32px 0' }}>
                {redirectMessage || 'Sign in to access your orders, track real-time delivery across India, save delivery addresses, and unlock exclusive discounts.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="auth-feature-card">
                  <div className="auth-icon-circle"><ShieldCheck size={18} /></div>
                  <span>100% Genuine Products &amp; Guarantee</span>
                </div>
                <div className="auth-feature-card">
                  <div className="auth-icon-circle"><ShoppingBag size={18} /></div>
                  <span>Fast Order Processing &amp; Express Delivery</span>
                </div>
                <div className="auth-feature-card">
                  <div className="auth-icon-circle"><Heart size={18} /></div>
                  <span>Saved Wishlist &amp; One-Click Re-ordering</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.82rem', opacity: '0.88' }}>
              Need assistance? Call support: <strong style={{ color: '#ffffff' }}>+91 74485 78507</strong>
            </div>
          </div>

          {/* Right Login / Signup / Forgot Password Workspace */}
          <div className="auth-workspace">
            {/* Segmented Tab Bar */}
            <div className="auth-tab-bar">
              <button 
                onClick={() => { setActiveTab('login'); setForgotStep(1); }}
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setActiveTab('signup'); setForgotStep(1); }}
                className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              >
                Create Account
              </button>
              {activeTab === 'forgot' && (
                <button 
                  className="auth-tab-btn active"
                >
                  Reset Password
                </button>
              )}
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Email Address</label>
                  <div className="auth-input-group">
                    <Mail size={16} className="auth-input-icon" />
                    <input 
                      type="email" 
                      placeholder="e.g. user@gmail.com"
                      value={loginIdentity}
                      onChange={(e) => setLoginIdentity(e.target.value)}
                      required
                      className="auth-input-field"
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.2px' }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => { 
                        setActiveTab('forgot'); 
                        setForgotStep(1); 
                        if (loginIdentity && loginIdentity.includes('@')) {
                          setForgotPhone(loginIdentity.trim());
                        }
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#FF5500', 
                        fontSize: '0.78rem', 
                        fontWeight: '700', 
                        cursor: 'pointer', 
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="auth-input-group">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="auth-input-field"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn"
                >
                  Log In &amp; Continue <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '11px',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>

                <button 
                  type="button" 
                  onClick={handleDemoArunLogin}
                  className="auth-demo-btn"
                >
                  ⚡ One-Click Demo Login (Arun)
                </button>
              </form>
            ) : activeTab === 'signup' ? (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Full Name</label>
                  <div className="auth-input-group">
                    <User size={16} className="auth-input-icon" />
                    <input 
                      type="text" 
                      placeholder="Arun Kumar"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                      required
                      className="auth-input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Email Address</label>
                  <div className="auth-input-group">
                    <Mail size={16} className="auth-input-icon" />
                    <input 
                      type="email" 
                      placeholder="arun@gmail.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      required
                      className="auth-input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Mobile Phone Number</label>
                  <div className="auth-input-group">
                    <Phone size={16} className="auth-input-icon" />
                    <input 
                      type="tel" 
                      placeholder="7448578507"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                      required
                      className="auth-input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Password</label>
                  <div className="auth-input-group">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showSignupPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                      required
                      className="auth-input-field"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn"
                >
                  Create Account &amp; Continue <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '11px',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Sign Up with Google
                </button>
              </form>
            ) : (
              /* FORGOT PASSWORD WORKFLOW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '800', color: '#FF5500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KeyRound size={18} /> Gmail OTP Password Reset Portal
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {forgotStep === 1 && 'Step 1 of 3: Enter your Email Address to receive OTP.'}
                    {forgotStep === 2 && `Step 2 of 3: Enter the 6-digit OTP sent to ${sentEmail}.`}
                    {forgotStep === 3 && `Step 3 of 3: Set a new secure password for ${verifiedName}.`}
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleSendOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Gmail / Email Address</label>
                      <div className="auth-input-group">
                        <Mail size={16} className="auth-input-icon" />
                        <input 
                          type="email" 
                          placeholder="e.g. user@gmail.com"
                          value={forgotPhone}
                          onChange={(e) => {
                            setForgotPhone(e.target.value);
                            if (emailCheckError) setEmailCheckError('');
                          }}
                          required
                          className="auth-input-field"
                        />
                      </div>
                    </div>

                    {/* Email Error Warning Banner */}
                    {emailCheckError && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1.5px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        color: '#ef4444',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        lineHeight: '1.4',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>{emailCheckError}</div>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="auth-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending OTP Code...' : 'Send OTP to Email'} <ArrowRight size={16} />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setActiveTab('login')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}
                    >
                      ← Back to Login
                    </button>
                  </form>
                ) : forgotStep === 2 ? (
                  <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ background: 'rgba(255, 85, 0, 0.08)', border: '1px solid rgba(255, 85, 0, 0.2)', padding: '12px 16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>6-Digit Verification Code sent to</span>
                      <strong style={{ fontSize: '0.95rem', color: '#FF5500' }}>{sentEmail}</strong>

                      {resendTimer > 0 ? (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#FF5500', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          <span>OTP Code Expires in:</span>
                          <span style={{ background: '#FF5500', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: '900' }}>
                            {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <div style={{ marginTop: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <AlertCircle size={14} />
                          <span>OTP Has Expired! Click "Resend Gmail Code" below for a new code.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
                        Enter 6-Digit Gmail OTP Code
                      </label>
                      <div style={{ display: 'flex', gap: 'clamp(3px, 1.5vw, 8px)', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }} onPaste={handlePasteOtp}>
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const isFocused = focusedOtpIndex === idx;
                          const isFilled = Boolean(otpDigits[idx]);
                          const isActive = isFocused || isFilled;

                          return (
                            <input
                              key={idx}
                              id={`otp-box-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              disabled={resendTimer === 0}
                              value={otpDigits[idx]}
                              onFocus={() => setFocusedOtpIndex(idx)}
                              onBlur={() => setFocusedOtpIndex(null)}
                              onChange={(e) => handleDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(idx, e)}
                              style={{
                                width: 'clamp(32px, 12.5vw, 46px)',
                                height: 'clamp(42px, 13.5vw, 52px)',
                                padding: 0,
                                textAlign: 'center',
                                fontSize: 'clamp(1.1rem, 5vw, 1.45rem)',
                                fontWeight: '900',
                                borderRadius: '10px',
                                border: isActive 
                                  ? '2.5px solid #FF5500' 
                                  : '2px solid #94a3b8',
                                background: resendTimer === 0 
                                  ? 'rgba(239, 68, 68, 0.08)' 
                                  : isActive 
                                    ? 'rgba(255, 85, 0, 0.08)' 
                                    : 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                boxShadow: isActive 
                                  ? '0 0 14px rgba(255, 85, 0, 0.35)' 
                                  : '0 2px 6px rgba(0, 0, 0, 0.08)',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: resendTimer === 0 ? 0.6 : 1,
                                cursor: resendTimer === 0 ? 'not-allowed' : 'text',
                                boxSizing: 'border-box'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn"
                      disabled={isSubmitting || otpDigits.join('').length < 4 || resendTimer === 0}
                      style={{ marginTop: '6px', opacity: resendTimer === 0 ? 0.5 : 1, cursor: resendTimer === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {isSubmitting ? 'Verifying OTP Code...' : resendTimer === 0 ? 'OTP Code Expired' : 'Verify OTP & Continue'} <ArrowRight size={16} />
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => setForgotStep(1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                      >
                        ← Edit Email Address
                      </button>

                      <button 
                        type="button" 
                        onClick={handleSendOtpSubmit}
                        disabled={resendTimer > 0 || isSubmitting}
                        style={{ 
                          background: resendTimer === 0 ? '#FF5500' : 'none', 
                          border: 'none', 
                          color: resendTimer === 0 ? '#ffffff' : 'var(--text-muted)', 
                          padding: resendTimer === 0 ? '6px 14px' : '0',
                          borderRadius: resendTimer === 0 ? '8px' : '0',
                          fontWeight: '800', 
                          cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                          opacity: resendTimer > 0 ? 0.6 : 1,
                          boxShadow: resendTimer === 0 ? '0 4px 12px rgba(255, 85, 0, 0.3)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {resendTimer > 0 ? `Resend Code in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}` : 'Resend Gmail Code Now'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', padding: '10px 14px', borderRadius: '10px', color: '#22c55e', fontSize: '0.8rem', fontWeight: '700' }}>
                      <CheckCircle size={16} /> OTP Verified for {verifiedName} ({sentEmail})
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>New Password</label>
                      <div className="auth-input-group">
                        <Lock size={16} className="auth-input-icon" />
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="Enter new password (min 4 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="auth-input-field"
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.2px' }}>Confirm New Password</label>
                      <div className="auth-input-group">
                        <Lock size={16} className="auth-input-icon" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="auth-input-field"
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating Password...' : 'Save New Password & Login'} <CheckCircle size={16} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
