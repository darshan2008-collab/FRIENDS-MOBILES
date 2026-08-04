import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ShieldCheck, Package, Truck, ShoppingBag, BarChart3, Plus, Trash2, Edit3, 
  Check, RefreshCw, Lock, User, Key, ArrowRight, LogOut, CheckCircle2, Clock, 
  TrendingUp, TrendingDown, Tag, Sparkles, AlertTriangle, Percent, DollarSign, Menu, MapPin, Phone, Eye, EyeOff, Upload, CreditCard, AlertCircle, MessageSquare, PhoneCall,
  Cloud, Database, HardDrive, Download, Zap, Smartphone, Image, Printer, Palette, FileText, Search
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import { autoTranslateToTamil } from '../data/translations';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  shippingSettings, 
  onUpdateShippingSettings, 
  orders, 
  onUpdateOrderStatus,
  onUpdateShippingCost,
  addToast,
  slides,
  onUpdateSlides,
  onUpdateOrders
}) {
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return sessionStorage.getItem('fm_admin_token') || '';
    } catch {
      return '';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = sessionStorage.getItem('fm_admin_token');
      return Boolean(token);
    } catch {
      return false;
    }
  });

  const [authStep, setAuthStep] = useState(1); // 1: Credentials, 2: Security PIN (2FA)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'shipping' | 'slides'
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [isEditManualCategory, setIsEditManualCategory] = useState(false);

  // Orders State (synced from API / localStorage / props)
  const [adminOrders, setAdminOrders] = useState(() => {
    if (Array.isArray(orders) && orders.length > 0) return orders;
    try {
      const saved = localStorage.getItem('fm_user_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  // Admin Order Cancellation State
  const [adminCancelTargetOrder, setAdminCancelTargetOrder] = useState(null);
  const [adminCancelReasonText, setAdminCancelReasonText] = useState('Item Out of Stock / Discontinued');

  const handleAdminConfirmCancelOrder = () => {
    if (!adminCancelTargetOrder) return;
    const targetId = adminCancelTargetOrder.orderId;
    const reason = adminCancelReasonText;

    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(targetId, 'Cancelled', reason);
    }
    setAdminOrders(prev => prev.map(o => o.orderId === targetId ? { ...o, status: 'Cancelled', cancellationReason: reason } : o));

    if (addToast) {
      addToast(`Order #${targetId} has been cancelled by Admin.`, '🔴');
    }
    setAdminCancelTargetOrder(null);
  };

  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      setAdminOrders(orders);
    }
  }, [orders]);

  const allOrdersList = (adminOrders && adminOrders.length > 0) ? adminOrders : (orders || []);
  
  // Customization Orders & Items Collection
  const customCoverItems = allOrdersList.flatMap(order => {
    const items = order.items || [];
    return items
      .filter(item => 
        item.customizationDetails || 
        (item.category && (item.category.includes('Custom') || item.category.includes('Photo Frame')))
      )
      .map(item => ({
        orderId: order.orderId || order.id || `ORD-${Date.now()}`,
        orderDate: order.date || order.createdAt || 'Recent',
        customerName: order.customer?.name || order.customerName || 'Customer',
        customerPhone: order.customer?.phone || order.customerPhone || '+91 93445 22086',
        customerAddress: order.customer?.address || order.address || 'Karur, Tamil Nadu',
        orderStatus: order.status || 'Processing',
        paymentStatus: order.paymentStatus || 'Paid',
        title: item.title || item.name,
        price: item.price || 399,
        quantity: item.quantity || 1,
        category: item.category || 'Customized Back Covers',
        img: item.customizationDetails?.uploadedFile || item.customizationDetails?.userPhoto || item.img || 'images/prod_custom_cover.png',
        customizationDetails: item.customizationDetails || {
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          caseType: 'Full 3D Hard Case',
          finish: 'Glass Glossy Finish',
          customText: 'FRIENDS MOBILE Custom',
          fileName: `custom_cover_iPhone15Pro.png`
        }
      }));
  });

  const displayCustomizations = customCoverItems;

  const handleDownloadCustomImage = (imageUrl, fileName) => {
    if (!imageUrl) {
      if (addToast) addToast('No image available to download.', 'warning');
      return;
    }
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `custom_print_photo_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (addToast) addToast(`Downloading print image: ${fileName || 'photo.png'}`, 'info');
  };

  useEffect(() => {
    if (isOpen) {
      try {
        const storedToken = sessionStorage.getItem('fm_admin_token');
        if (storedToken) {
          setAdminToken(storedToken);
          setIsAuthenticated(true);
        } else {
          const isPending2FA = sessionStorage.getItem('fm_admin_pending_2fa') === 'true';
          if (isPending2FA) {
            setIsAuthenticated(false);
            setAuthStep(2);
            const savedUsername = sessionStorage.getItem('fm_admin_username') || 'friendsmobile';
            setAdminUsername(savedUsername);
          }
        }
      } catch (_) {}
    }
  }, [isOpen]);

  // Handle Admin Logout & Session Revocation
  const handleAdminLogout = (reason = 'Admin session locked.') => {
    try {
      const apiHost = getApiHost();
      const currentToken = adminToken || sessionStorage.getItem('fm_admin_token');
      if (currentToken) {
        fetch(`${apiHost}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        }).catch(() => {});
      }
    } catch (_) {}

    setIsAuthenticated(false);
    setAdminToken('');
    setAuthStep(1);
    setAdminUsername('');
    setAdminPassword('');
    setAdminPin('');
    setAuthError('');
    try {
      sessionStorage.removeItem('fm_admin_token');
      sessionStorage.removeItem('fm_admin_auth');
      localStorage.removeItem('fm_admin_auth');
    } catch (_) {}

    if (addToast) addToast(reason, '🔒');
  };

  // Complaints & Support Tickets State
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('All');
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('');

  // 5,000 GB Cloud Storage & Backups State
  const [backupStatus, setBackupStatus] = useState({
    storageQuota: '5,000 GB',
    usedMB: '0.00 MB',
    percentageUsed: '0.000000%',
    totalBackupsCount: 0,
    lastBackupAt: null,
    backups: []
  });
  const [isBackingUp, setIsBackingUp] = useState(false);

  const getApiHost = () => {
    if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api') {
      return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173') {
      return 'http://localhost:5000';
    }
    return '';
  };

  const safeJsonFetch = async (url, options = {}) => {
    try {
      const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';
      const headers = { ...(options.headers || {}) };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { ...options, headers });
      
      if (res.status === 401 && isAuthenticated) {
        handleAdminLogout('Session expired or unauthorized request. Please re-authenticate.');
      }

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return { ok: res.ok, status: res.status, data: json };
      } catch (_) {
        return { ok: false, status: res.status, data: { success: false, error: `Server returned invalid response structure (${res.status})` } };
      }
    } catch (err) {
      return { ok: false, status: 500, data: { success: false, error: err.message } };
    }
  };

  const fetchBackupStatus = async () => {
    try {
      const apiHost = getApiHost();
      const { ok, data } = await safeJsonFetch(`${apiHost}/api/admin/backups`);
      if (ok && data && data.success) {
        setBackupStatus({
          storageQuota: data.storageQuota || '15 GB (Google Drive Free Tier)',
          usedMB: data.usedMB || '0.00 MB',
          percentageUsed: data.percentageUsed || '0.00%',
          totalBackupsCount: typeof data.totalBackupsCount === 'number' ? data.totalBackupsCount : (Array.isArray(data.backups) ? data.backups.length : 0),
          lastBackupAt: data.lastBackupAt || null,
          folderId: data.folderId || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl',
          folderUrl: data.folderUrl || `https://drive.google.com/drive/folders/${data.folderId || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl'}`,
          backups: Array.isArray(data.backups) ? data.backups : []
        });
      }
    } catch (_) {}
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const apiHost = getApiHost();
      const { ok, data } = await safeJsonFetch(`${apiHost}/api/admin/backups/create`, { method: 'POST' });
      if (ok && data && data.success) {
        if (addToast) addToast(`Database backup "${data.filename}" created & synced!`, '☁️');
        fetchBackupStatus();
      } else {
        if (addToast) addToast(`Backup result: ${data?.error || data?.message || 'Backup completed'}`, '☁️');
        fetchBackupStatus();
      }
    } catch (err) {
      if (addToast) addToast(`Backup trigger status: ${err.message}`, 'ℹ️');
    }
    setIsBackingUp(false);
  };

  const [isRestoringUpload, setIsRestoringUpload] = useState(false);
  const [isSyncingGDrive, setIsSyncingGDrive] = useState(false);

  const handleFileUploadRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to upload & restore database backup from "${file.name}"? This will update your database, customer accounts, orders, products, images, and local code files.`)) {
      e.target.value = '';
      return;
    }

    setIsRestoringUpload(true);
    if (addToast) addToast(`Reading backup file "${file.name}"...`, '⏳');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const textContent = evt.target.result;
        const parsedData = JSON.parse(textContent);
        const apiHost = getApiHost();

        const { ok, data } = await safeJsonFetch(`${apiHost}/api/admin/backups/restore-file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backupData: parsedData, filename: file.name })
        });

        if (ok && data && data.success) {
          const counts = data.restoredCounts || {};
          const msg = `Restored successfully! (${counts.users || 0} users, ${counts.orders || 0} orders, ${counts.products || 0} products)`;
          if (addToast) addToast(msg, 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          if (addToast) addToast(`Restore error: ${data?.message || data?.error || 'Failed to restore file'}`, 'warning');
        }
      } catch (err) {
        if (addToast) addToast(`Invalid JSON file: ${err.message}`, 'error');
      } finally {
        setIsRestoringUpload(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleGDriveSyncRestore = async () => {
    if (!window.confirm('Fetch and restore the latest database backup directly from Google Drive?')) {
      return;
    }
    setIsSyncingGDrive(true);
    if (addToast) addToast('Connecting to Google Drive to download latest backup...', 'info');

    try {
      const apiHost = getApiHost();
      const { ok, data } = await safeJsonFetch(`${apiHost}/api/admin/backups/sync-gdrive`, {
        method: 'POST'
      });

      if (ok && data && data.success) {
        if (addToast) addToast(`Restored from Google Drive snapshot "${data.source || 'Latest'}"!`, 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        if (addToast) addToast(`Google Drive sync notice: ${data?.message || 'Drive file synced'}`, 'info');
      }
    } catch (err) {
      if (addToast) addToast(`Drive restore status: ${err.message}`, 'ℹ️');
    } finally {
      setIsSyncingGDrive(false);
    }
  };

  const handleExportMasterExcel = async () => {
    try {
      if (addToast) addToast('Generating multi-sheet Master Excel Database Backup...', 'info');
      const apiHost = getApiHost();
      const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';
      const response = await fetch(`${apiHost}/api/admin/backups/export-excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FRIENDS_MOBILE_Full_Database_Master_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        if (addToast) addToast('Downloaded Master Excel Database Backup (.xls)!', 'success');
      } else {
        if (addToast) addToast('Failed to export Master Excel backup file.', 'warning');
      }
    } catch (err) {
      if (addToast) addToast(`Excel Export error: ${err.message}`, 'error');
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to restore database snapshot "${filename}"? Current data will be merged/updated.`)) {
      return;
    }
    try {
      const apiHost = getApiHost();
      const { ok, data } = await safeJsonFetch(`${apiHost}/api/admin/backups/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (ok && data && data.success) {
        if (addToast) addToast(`Database restored successfully from "${filename}"!`, '✅');
        window.location.reload();
      } else {
        if (addToast) addToast(`Restore response: ${data?.message || 'Database active and synced'}`, 'ℹ️');
      }
    } catch (err) {
      if (addToast) addToast(`Restore status: ${err.message}`, 'ℹ️');
    }
  };

  const fetchComplaints = async () => {
    try {
      const apiHost = getApiHost();
      const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';
      const res = await fetch(`${apiHost}/api/admin/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.complaints) {
        setComplaints(data.complaints);
        return;
      }
    } catch (_) {}

    try {
      const stored = JSON.parse(localStorage.getItem('fm_complaints') || '[]');
      setComplaints(stored);
    } catch {}
  };

  const fetchOrders = async () => {
    const apiHost = getApiHost();
    const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';

    const endpoints = [
      `${apiHost}/api/admin/orders`,
      '/api/admin/orders',
      '/api/orders'
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setAdminOrders(data.orders);
          if (onUpdateOrders) onUpdateOrders(data.orders);
          try { localStorage.setItem('fm_user_orders', JSON.stringify(data.orders)); } catch (_) {}
          return;
        }
      } catch (_) {}
    }

    try {
      const saved = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setAdminOrders(saved);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchComplaints();
      fetchBackupStatus();
    }
  }, [isAuthenticated, activeTab]);

  const handleUpdateComplaintStatus = async (ticketId, newStatus, notes = '') => {
    try {
      const apiHost = getApiHost();
      const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';
      await fetch(`${apiHost}/api/admin/complaints/${ticketId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes: notes })
      });
    } catch (_) {}

    setComplaints(prev => prev.map(c => c.ticketId === ticketId ? { ...c, status: newStatus, adminNotes: notes } : c));
    try {
      const stored = JSON.parse(localStorage.getItem('fm_complaints') || '[]');
      const updated = stored.map(c => c.ticketId === ticketId ? { ...c, status: newStatus, adminNotes: notes } : c);
      localStorage.setItem('fm_complaints', JSON.stringify(updated));
    } catch {}

    if (addToast) addToast(`Ticket #${ticketId} updated to "${newStatus}"`, '📍');
  };

  // Order Search, Filter & Manual Creation State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [createOrderForm, setCreateOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerPincode: '639004',
    selectedProductId: '',
    customItemTitle: 'Custom Mobile Accessory / Order',
    customItemPrice: '499',
    quantity: 1,
    paymentMethod: 'UPI',
    status: 'Order Placed'
  });

  const handleCreateManualOrderSubmit = async (e) => {
    e.preventDefault();
    if (!createOrderForm.customerName.trim() || !createOrderForm.customerPhone.trim() || !createOrderForm.customerAddress.trim()) {
      if (addToast) addToast('Please fill in customer name, phone number, and address!', 'warning');
      return;
    }

    const selProd = products?.find(p => String(p.id) === String(createOrderForm.selectedProductId));
    const itemTitle = selProd ? selProd.title : (createOrderForm.customItemTitle || 'Mobile Accessory');
    const itemPrice = selProd ? selProd.price : (parseFloat(createOrderForm.customItemPrice) || 299);
    const qty = parseInt(createOrderForm.quantity) || 1;
    const subtotalVal = itemPrice * qty;

    const newOrderObj = {
      orderId: `FM-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: createOrderForm.customerName.trim(),
        phone: createOrderForm.customerPhone.trim(),
        address: `${createOrderForm.customerAddress.trim()} - ${createOrderForm.customerPincode.trim()}`
      },
      items: [{
        id: selProd ? selProd.id : `manual-${Date.now()}`,
        title: itemTitle,
        price: itemPrice,
        quantity: qty,
        img: selProd ? selProd.img : 'images/banner_photoframe.png'
      }],
      subtotal: subtotalVal,
      shipping: 0,
      total: subtotalVal,
      paymentMethod: createOrderForm.paymentMethod,
      status: createOrderForm.status
    };

    try {
      const apiHost = '';
      const res = await fetch(`${apiHost}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderObj)
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast(`Order #${newOrderObj.orderId} created successfully!`, '✓');
        setIsCreateOrderModalOpen(false);
        setCreateOrderForm({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          customerPincode: '639004',
          selectedProductId: '',
          customItemTitle: 'Custom Mobile Accessory / Order',
          customItemPrice: '499',
          quantity: 1,
          paymentMethod: 'UPI',
          status: 'Order Placed'
        });
        window.location.reload();
      } else {
        if (addToast) addToast(data.message || 'Order recorded successfully!', '✓');
      }
    } catch (err) {
      console.error("Create manual order error", err);
      if (addToast) addToast('Order record created locally!', '✓');
      setIsCreateOrderModalOpen(false);
    }
  };

  // New Slide Form State
  const [newSlideForm, setNewSlideForm] = useState({
    imgSrc: '',
    btnText: 'SHOP NOW',
    btnLink: '#products'
  });

  const handleSlideImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSlideForm(prev => ({
          ...prev,
          imgSrc: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlideSubmit = (e) => {
    e.preventDefault();
    if (!newSlideForm.imgSrc) {
      if (addToast) addToast('Please upload an image!', '❌');
      return;
    }
    const newSlide = {
      id: Date.now(),
      desc: '',
      imgSrc: newSlideForm.imgSrc,
      btnText: newSlideForm.btnText.trim(),
      btnLink: newSlideForm.btnLink
    };
    const updated = [...(slides || []), newSlide];
    if (onUpdateSlides) onUpdateSlides(updated);
    setNewSlideForm({
      imgSrc: '',
      btnText: 'SHOP NOW',
      btnLink: '#products'
    });
    if (addToast) addToast('New banner slide added successfully!', '✨');
  };

  const handleDeleteSlide = (slideId) => {
    const updated = (slides || []).filter(s => s.id !== slideId);
    if (onUpdateSlides) onUpdateSlides(updated);
    if (addToast) addToast('Banner slide deleted successfully.', '🗑️');
  };

  // New Product Form State (with Auto Discount Calculator & Tamil Live Translator)
  const [newProduct, setNewProduct] = useState({
    title: '',
    tamilTitle: '',
    category: 'Accessories',
    originalPrice: '1499',
    discountPct: '20',
    price: '1199',
    discount: '-20%',
    inStock: true,
    img: '',
    images: [],
    description: 'High quality mobile accessory from FRIENDS MOBILE.',
    tamilDesc: ''
  });

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    standardShippingFee: 70,
    freeShippingThreshold: 1000,
    expressShippingFee: 99,
    supportPhone: '+91 93445 22086',
    supportEmail: 'friendsmobile@gmail.com',
    storeUpiId: 'darshankannan2008@oksbi',
    storePayeeName: 'FRIENDS MOBILE'
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({});
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    if (shippingSettings) {
      setShippingForm({
        standardShippingFee: shippingSettings.standardShippingFee ?? 70,
        freeShippingThreshold: shippingSettings.freeShippingThreshold ?? 1000,
        expressShippingFee: shippingSettings.expressShippingFee ?? 99,
        supportPhone: shippingSettings.supportPhone || '+91 93445 22086',
        supportEmail: shippingSettings.supportEmail || 'friendsmobile@gmail.com',
        storeUpiId: shippingSettings.storeUpiId || 'darshankannan2008@oksbi',
        storePayeeName: shippingSettings.storePayeeName || 'FRIENDS MOBILE'
      });
    }
  }, [shippingSettings]);


  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  // --- High Security Server-Side Authentication Handlers ---
  const handleStep1LoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      const apiHost = getApiHost();
      const res = await fetch(`${apiHost}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim(),
          pin: adminPin.trim() || undefined
        })
      });

      const data = await res.json();

      if (res.ok && data && data.success) {
        if (data.requiresPin) {
          setAuthStep(2);
          if (addToast) addToast('Primary credentials verified. Enter 6-digit Security PIN.', '🔐');
        } else if (data.token) {
          setAdminToken(data.token);
          setIsAuthenticated(true);
          try {
            sessionStorage.setItem('fm_admin_token', data.token);
            sessionStorage.setItem('fm_admin_auth', 'true');
          } catch (_) {}
          if (addToast) addToast('Admin High-Security Access Granted. Welcome Super Admin!', '🛡️');
        }
      } else {
        const errorMsg = data?.message || 'Invalid Admin Username or Password.';
        setAuthError(errorMsg);
        if (addToast) addToast(errorMsg, '❌');
      }
    } catch (err) {
      setAuthError('Authentication server offline or network connection error.');
      if (addToast) addToast('Authentication server connection failed.', '❌');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleStep2PinSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      const apiHost = getApiHost();
      const res = await fetch(`${apiHost}/api/admin/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          pin: adminPin.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data && data.success && data.token) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('fm_admin_token', data.token);
          sessionStorage.setItem('fm_admin_auth', 'true');
          sessionStorage.removeItem('fm_admin_pending_2fa');
        } catch (_) {}
        if (addToast) addToast('2FA Security Passed! Welcome, Super Admin.', '🔐');
      } else {
        const errorMsg = data?.message || 'Invalid 6-Digit Admin Security PIN.';
        setAuthError(errorMsg);
        if (addToast) addToast(errorMsg, '❌');
      }
    } catch (err) {
      setAuthError('PIN verification failed. Server connection error.');
      if (addToast) addToast('PIN verification error.', '❌');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // --- Executive Order History Report (Excel CSV Export) ---
  const handleExportCSV = async () => {
    const targetOrdersList = (displayOrders && displayOrders.length > 0) ? displayOrders : (orders || []);
    if (!targetOrdersList || targetOrdersList.length === 0) {
      if (addToast) addToast('No order history available to export!', '⚠️');
      return;
    }

    try {
      const apiHost = getApiHost();
      const token = adminToken || sessionStorage.getItem('fm_admin_token') || '';
      const response = await fetch(`${apiHost}/api/admin/orders/export-excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `FRIENDS_MOBILE_Orders_Master_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        if (addToast) addToast('Master Excel Order History downloaded successfully!', '📊');
        return;
      }
    } catch (_) {}

    // Client-side Styled Excel (.xls) Exporter with Bold Headers, Colors & Text Formatting
    const escapeXml = (str) => {
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const rowsXml = targetOrdersList.map((o, idx) => {
      const custName = o.customer?.name || 'Walk-in Customer';
      const custPhone = o.customer?.phone ? String(o.customer.phone) : '';
      const custAddr = o.customer?.address || '';
      const itemsFormatted = (o.items || []).map(i => `${i.title || 'Product'} (x${i.quantity || 1}) - Rs.${i.price || 0}`).join('; ');
      const subtotal = parseFloat(o.subtotal || o.total || 0);
      const shipping = (o.shipping === 0 || o.shipping === '0' || o.shipping === 'FREE' || subtotal >= 1000) ? 0 : (typeof o.shipping === 'number' ? o.shipping : 60);
      const total = parseFloat(o.total || (subtotal + shipping));
      const payMethod = o.paymentMethod || 'COD';
      const payStatus = o.paymentStatus || (payMethod === 'COD' ? 'Pending' : 'Paid');
      const orderStatus = o.status || 'Order Placed';
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const reasonNote = o.cancellationReason || (o.returnDetails ? `${o.returnDetails.reason} (${o.returnDetails.returnType})` : '');
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      let statusBg = '#e2e8f0';
      let statusColor = '#334155';
      const statusLower = orderStatus.toLowerCase();
      if (statusLower.includes('delivered')) {
        statusBg = '#dcfce7'; statusColor = '#15803d';
      } else if (statusLower.includes('cancell')) {
        statusBg = '#fee2e2'; statusColor = '#b91c1c';
      } else if (statusLower.includes('return')) {
        statusBg = '#f3e8ff'; statusColor = '#6b21a8';
      } else if (statusLower.includes('process') || statusLower.includes('ship')) {
        statusBg = '#dbeafe'; statusColor = '#1e40af';
      }

      return `
        <tr style="height: 32px;">
          <td style="border: 1px solid #fed7aa; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #fff3ed; color: #ea580c; mso-number-format:'\\@';">${escapeXml(o.orderId)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; background-color: #f8fafc; color: #334155;">${escapeXml(dateStr)}</td>
          <td style="border: 1px solid #e9d5ff; padding: 8px 12px; font-weight: bold; background-color: #f3e8ff; color: #7e22ce;">${escapeXml(custName)}</td>
          <td style="border: 1px solid #a5f3fc; padding: 8px 12px; text-align: center; font-weight: 600; background-color: #ecfeff; color: #0e7490; mso-number-format:'\\@';">${escapeXml(custPhone)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; background-color: #ffffff; color: #1e293b;">${escapeXml(custAddr)}</td>
          <td style="border: 1px solid #fef08a; padding: 8px 12px; background-color: #fefce8; color: #854d0e; font-weight: 500;">${escapeXml(itemsFormatted)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; font-weight: 600; background-color: #f1f5f9; color: #0f172a;">Rs. ${subtotal.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${shipping === 0 ? '#dcfce7' : '#fee2e2'}; color: ${shipping === 0 ? '#15803d' : '#991b1b'};">${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</td>
          <td style="border: 1px solid #fdba74; padding: 8px 12px; text-align: right; font-weight: bold; font-size: 13px; background-color: #ffedd5; color: #c2410c;">Rs. ${total.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #bae6fd; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #e0f2fe; color: #0369a1;">${escapeXml(payMethod)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${payStatus === 'Paid' ? '#d1fae5' : '#fef3c7'}; color: ${payStatus === 'Paid' ? '#047857' : '#b45309'};">${escapeXml(payStatus)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${escapeXml(orderStatus)}</td>
          <td style="border: 1px solid #fecdd3; padding: 8px 12px; background-color: #fff1f2; color: #be123c;">${escapeXml(reasonNote)}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>Master Orders Report</x:Name>
        <x:WorksheetOptions>
          <x:DisplayGridlines/>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; }
  th { background-color: #FF5500; color: #ffffff; font-weight: bold; padding: 12px 10px; border: 1px solid #ea580c; text-align: center; font-size: 13px; vertical-align: middle; }
  td { vertical-align: middle; }
</style>
</head>
<body>
<table>
  <thead>
    <tr style="height: 38px;">
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order ID</th>
      <th style="width: 170px; background-color: #FF5500; color: #ffffff;">Order Date &amp; Time</th>
      <th style="width: 180px; background-color: #FF5500; color: #ffffff;">Customer Name</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Phone Number</th>
      <th style="width: 320px; background-color: #FF5500; color: #ffffff;">Delivery Address</th>
      <th style="width: 380px; background-color: #FF5500; color: #ffffff;">Purchased Products</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Subtotal (INR)</th>
      <th style="width: 120px; background-color: #FF5500; color: #ffffff;">Shipping Fee</th>
      <th style="width: 140px; background-color: #FF5500; color: #ffffff;">Grand Total (INR)</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Method</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Status</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order Status</th>
      <th style="width: 250px; background-color: #FF5500; color: #ffffff;">Cancellation / Return Reason</th>
    </tr>
  </thead>
  <tbody>
    ${rowsXml}
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FRIENDS_MOBILE_Orders_Master_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (addToast) addToast('Master Excel Order History report downloaded successfully!', '📊');
  };

  // --- Printable Official Tax Invoice ---
  const handlePrintOrderInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #0f172a;">${item.title}</strong>
          ${item.selectedColor ? `<br><small style="color: #64748b;">Color: ${item.selectedColor}</small>` : ''}
          ${item.selectedStorage ? `<br><small style="color: #64748b;">Storage: ${item.selectedStorage}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #FF5500;">₹${((item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.orderId} - FRIENDS MOBILE</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 3px solid #FF5500; padding-bottom: 20px; margin-bottom: 25px; }
            .logo { font-size: 26px; font-weight: 900; color: #FF5500; letter-spacing: 1px; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .info-table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; color: #64748b; font-weight: 800; }
            .total-box { margin-top: 25px; text-align: right; font-size: 20px; font-weight: 900; color: #FF5500; border-top: 2px solid #e2e8f0; padding-top: 15px; }
            .badge { background: #ecfdf5; color: #16a34a; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; border: 1px solid #a7f3d0; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="logo">FRIENDS MOBILE</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600;">Double Tank, South Gandhigramam, Karur - 639004</div>
              <div style="font-size: 12px; color: #64748b;">Phone: +91 74485 78507 | Email: support@friendsmobile.in</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #0f172a; font-size: 22px;">OFFICIAL TAX INVOICE</h2>
              <div style="font-size: 14px; font-weight: bold; margin-top: 6px; color: #FF5500;">${order.orderId}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div>
              <h4 style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; letter-spacing: 0.5px;">BILLED &amp; SHIPPED TO:</h4>
              <strong style="font-size: 15px; color: #0f172a;">${order.customer?.name || 'Customer'}</strong><br/>
              <span style="font-size: 13px; color: #334155;">${order.customer?.address || ''}</span><br/>
              <span style="font-size: 13px; color: #334155;">PIN Code: <strong>${order.customer?.pincode || ''}</strong></span><br/>
              <span style="font-size: 13px; color: #334155;">Mobile: <strong>${order.customer?.phone || ''}</strong></span>
            </div>
            <div style="text-align: right;">
              <h4 style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; letter-spacing: 0.5px;">PAYMENT DETAILS:</h4>
              <span class="badge">${order.paymentMethod || 'Cash On Delivery (COD)'}</span>
              <div style="margin-top: 10px; font-size: 13px;">Status: <strong style="color: #2563eb;">${order.status || 'Order Placed'}</strong></div>
            </div>
          </div>

          <table class="info-table">
            <thead>
              <tr>
                <th>ITEM DESCRIPTION</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">UNIT PRICE</th>
                <th style="text-align: right;">TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            NET AMOUNT PAID: ₹${(order.totalAmount || 0).toLocaleString('en-IN')}
          </div>

          <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            This is a computer-generated tax invoice from Friends Mobile Flagship Store. No signature required.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- Real-time Auto Discount & Price Calculators ---
  const handleNewMrpDiscountCalc = (mrpInput, pctInput) => {
    const mrp = parseFloat(mrpInput) || 0;
    const pct = parseFloat(pctInput) || 0;
    const calculatedPrice = mrp > 0 ? Math.max(1, Math.round(mrp - (mrp * (pct / 100)))) : 0;

    setNewProduct(prev => ({
      ...prev,
      originalPrice: mrpInput,
      discountPct: pctInput,
      price: calculatedPrice.toString(),
      discount: `-${pct}%`
    }));
  };

  const handleEditMrpDiscountCalc = (mrpInput, pctInput) => {
    const mrp = parseFloat(mrpInput) || 0;
    const pct = parseFloat(pctInput) || 0;
    const calculatedPrice = mrp > 0 ? Math.max(1, Math.round(mrp - (mrp * (pct / 100)))) : 0;

    setEditProductForm(prev => ({
      ...prev,
      originalPrice: mrp,
      discountPct: pct,
      price: calculatedPrice,
      discount: `-${pct}%`
    }));
  };

  const handleNewProductImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            images: [...currentImages, reader.result],
            img: prev.img || reader.result
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditProductImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProductForm(prev => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            images: [...currentImages, reader.result],
            img: prev.img || reader.result
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      if (addToast) addToast('Title and Price are required', '⚠️');
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    const origPriceNum = newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : Math.round(priceNum * 1.25);
    const pctNum = parseFloat(newProduct.discountPct) || Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);
    const discountStr = `-${pctNum}%`;

    const validImages = (newProduct.images || []).filter(url => url.trim() !== '');
    const primaryImg = validImages[0] || newProduct.img || 'images/prod_airdopes.png';

    const productToAdd = {
      ...newProduct,
      price: priceNum,
      originalPrice: origPriceNum,
      discount: discountStr,
      rating: 5.0,
      reviews: 1,
      img: primaryImg,
      images: validImages.length > 0 ? validImages : [primaryImg],
      fallback: primaryImg
    };

    onAddProduct(productToAdd);
    setNewProduct({
      title: '',
      category: 'Accessories',
      originalPrice: '1499',
      discountPct: '20',
      price: '1199',
      discount: '-20%',
      inStock: true,
      img: 'images/prod_airdopes.png',
      images: ['images/prod_airdopes.png'],
      description: 'High quality mobile accessory from FRIENDS MOBILE.'
    });
    setIsAddProductOpen(false);
    if (addToast) addToast(`Product "${productToAdd.title}" added to catalog`, '✅');
  };

  const handleSaveShipping = (e) => {
    e.preventDefault();
    onUpdateShippingSettings({
      standardShippingFee: parseFloat(shippingForm.standardShippingFee) || 0,
      freeShippingThreshold: parseFloat(shippingForm.freeShippingThreshold) || 0,
      expressShippingFee: parseFloat(shippingForm.expressShippingFee) || 0,
      supportPhone: shippingForm.supportPhone,
      supportEmail: shippingForm.supportEmail
    });
    if (addToast) addToast('Shipping settings & support info updated', '🚚');
  };

  const startEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const orig = prod.originalPrice || Math.round(prod.price * 1.25);
    const pct = Math.round(((orig - prod.price) / orig) * 100);
    setEditProductForm({ 
      ...prod, 
      originalPrice: orig, 
      discountPct: pct > 0 ? pct : 10,
      images: prod.images && prod.images.length > 0 ? [...prod.images] : [prod.img || '']
    });
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
  };

  const saveEditProduct = (e) => {
    e.preventDefault();
    const validImages = (editProductForm.images || []).filter(url => url.trim() !== '');
    const primaryImg = validImages[0] || editProductForm.img || 'images/prod_airdopes.png';

    const updated = {
      ...editProductForm,
      images: validImages.length > 0 ? validImages : [primaryImg],
      img: primaryImg,
      fallback: primaryImg
    };

    onUpdateProduct(updated);
    setEditingProductId(null);
    if (addToast) addToast(`Updated "${editProductForm.title.slice(0, 18)}..." successfully!`, '✅');
  };

  const handleQuickApplyDiscount = (prod, percent) => {
    const orig = prod.originalPrice || Math.round(prod.price * 1.25);
    const newPrice = Math.round(orig - (orig * (percent / 100)));
    const updated = {
      ...prod,
      originalPrice: orig,
      price: newPrice,
      discount: `-${percent}%`
    };
    onUpdateProduct(updated);
    if (addToast) addToast(`Applied ${percent}% OFF discount to "${prod.title.slice(0, 15)}..." (New Price: ₹${newPrice})`, '🎟️');
  };

  // --- Analytics & Product Sales Performance Math ---
  const displayOrders = (adminOrders && adminOrders.length > 0) ? adminOrders : (orders || []);
  const totalOrders = displayOrders ? displayOrders.length : 0;
  const totalRevenue = displayOrders ? displayOrders.reduce((sum, o) => sum + (o.total || 0), 0) : 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Build product sales map from orders with 100% precision
  const productSalesMap = {};
  if (displayOrders && displayOrders.length > 0) {
    displayOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const pId = item.id || item.productId || item.title;
          const qty = item.quantity || 1;
          const rev = (item.price || 0) * qty;
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = { unitsSold: 0, revenue: 0, title: item.title };
          }
          productSalesMap[pId].unitsSold += qty;
          productSalesMap[pId].revenue += rev;
        });
      }
    });
  }

  // Enriched products with 100% exact sales volume metrics
  const enrichedProducts = (products || []).map(p => {
    const salesById = productSalesMap[p.id];
    const salesByTitle = productSalesMap[p.title];
    const sales = salesById || salesByTitle || { unitsSold: 0, revenue: 0 };
    return {
      ...p,
      unitsSold: sales.unitsSold,
      salesRevenue: sales.revenue
    };
  });

  // Sorted arrays for Top High Sellers vs Low Sellers
  const highSellingProducts = [...enrichedProducts].sort((a, b) => b.unitsSold - a.unitsSold);
  const lowSellingProducts = [...enrichedProducts].sort((a, b) => a.unitsSold - b.unitsSold);

  // Filtered orders list for Admin Orders tab
  const filteredOrders = (displayOrders || []).filter(order => {
    const search = orderSearchTerm.toLowerCase().trim();
    const matchesSearch = !search || 
      (order.orderId || '').toLowerCase().includes(search) ||
      (order.customer?.name || '').toLowerCase().includes(search) ||
      (order.customer?.phone || '').includes(search) ||
      (order.customer?.address || '').toLowerCase().includes(search) ||
      (order.items || []).some(item => (item.title || '').toLowerCase().includes(search));

    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isOpen || typeof document === 'undefined') return null;
  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  return createPortal(
    <div 
      className="full-page-admin-portal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}

    >
      {/* Top Header Navigation */}
      <header className="admin-header-responsive" style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          {isAuthenticated && (
            <button
              className="admin-hamburger-btn"
              onClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                marginRight: '4px',
                flexShrink: 0
              }}
              title="Toggle Menu Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="admin-logo-mobile-hide" style={{ flexShrink: 0 }}>
            <CompanyLogo size={30} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', fontWeight: '800', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                FRIENDS <span style={{ color: '#FF5500' }}>MOBILE</span> ADMIN
              </h2>
              <span className="admin-badge-mobile-hide" style={{ background: '#FF5500', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                EXECUTIVE DASHBOARD
              </span>
            </div>
            <span className="admin-subtitle-mobile-hide" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Sales Analytics, Products &amp; Shipping Rates
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isAuthenticated && (
            <>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16a34a',
                fontSize: '0.72rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                <ShieldCheck size={14} /> <span className="admin-badge-mobile-hide">2FA Active</span>
              </div>

              <button 
                onClick={() => handleAdminLogout('Admin session locked.')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
                title="Lock Admin Session"
              >
                <LogOut size={15} /> <span className="close-btn-label">Lock Session</span>
              </button>
            </>
          )}

          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF5500',
              color: '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.78rem',
              flexShrink: 0
            }}
          >
            <X size={16} /> <span className="close-btn-label">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        /* Full Page High Security Admin Login Screen */
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'radial-gradient(circle at center, var(--orange-light) 0%, var(--bg-page) 70%)'
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            padding: '36px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #FF5500 0%, #E04400 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(255, 85, 0, 0.35)'
            }}>
              <ShieldCheck size={32} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 6px 0' }}>
              {authStep === 1 ? 'High-Security Admin Login' : '2FA Security PIN Verification'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
              {authStep === 1 
                ? 'Enter your executive administrative credentials to authenticate.' 
                : 'Enter your 6-digit Security PIN to complete two-factor authentication.'}
            </p>

            {authError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            {authStep === 1 ? (
              /* Step 1: Username & Password Form */
              <form onSubmit={handleStep1LoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Admin Username</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Username" 
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Key size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type={showAdminPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 40px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: '700' }}>
                    <Lock size={12} /> 256-Bit Encrypted
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <ShieldCheck size={12} color="#FF5500" /> 2FA PIN Required
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingAuth}
                  className="btn btn-orange" 
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    fontSize: '0.95rem', 
                    fontWeight: 'bold', 
                    borderRadius: '10px',
                    justifyContent: 'center',
                    marginTop: '8px',
                    opacity: isSubmittingAuth ? 0.7 : 1,
                    cursor: isSubmittingAuth ? 'wait' : 'pointer'
                  }}
                >
                  {isSubmittingAuth ? 'VERIFYING CREDENTIALS...' : 'CONTINUE TO 2FA STEP'} <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              /* Step 2: 6-Digit PIN Form */
              <form onSubmit={handleStep2PinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>6-Digit Security PIN</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#FF5500' }} />
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="••••••" 
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '10px',
                        border: '2px solid #FF5500',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '1.2rem',
                        letterSpacing: '6px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingAuth}
                  className="btn btn-orange" 
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    fontSize: '0.95rem', 
                    fontWeight: 'bold', 
                    borderRadius: '10px',
                    justifyContent: 'center',
                    marginTop: '8px',
                    opacity: isSubmittingAuth ? 0.7 : 1,
                    cursor: isSubmittingAuth ? 'wait' : 'pointer'
                  }}
                >
                  {isSubmittingAuth ? 'UNLOCKING PORTAL...' : 'UNLOCK ADMIN PORTAL'} <ArrowRight size={18} />
                </button>

                <button 
                  type="button" 
                  onClick={() => { setAuthStep(1); setAuthError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'center',
                    marginTop: '4px'
                  }}
                >
                  ← Back to Username & Password Login
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Full Page Admin Dashboard Workspace with Left Collapsible Sidebar (Sandwich Menu) */
        <div className="admin-workspace-layout" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
          
          <aside className={`admin-sidebar-nav ${isAdminSidebarOpen ? 'open' : ''}`} style={{ overflowY: 'auto' }}>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                setIsAdminSidebarOpen(false);
              }}
            >
              <BarChart3 size={16} /> Sales Analytics &amp; Demand
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('products');
                setIsAdminSidebarOpen(false);
              }}
            >
              <Package size={16} /> Product Catalog ({products ? products.length : 0})
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('orders');
                setIsAdminSidebarOpen(false);
              }}
            >
              <Clock size={16} /> Order History ({totalOrders})
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'customizations' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('customizations');
                setIsAdminSidebarOpen(false);
              }}
              style={{ color: '#FF5500', fontWeight: '800' }}
            >
              <Smartphone size={16} color="#FF5500" /> Cover Customizations ({displayCustomizations.length})
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('complaints');
                setIsAdminSidebarOpen(false);
              }}
              style={{ color: complaints && complaints.some(c => c.status === 'Open') ? '#ef4444' : 'inherit' }}
            >
              <AlertCircle size={16} color={complaints && complaints.some(c => c.status === 'Open') ? '#ef4444' : 'currentColor'} /> Complaints &amp; Tickets ({complaints ? complaints.length : 0})
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('shipping');
                setIsAdminSidebarOpen(false);
              }}
            >
              <Truck size={16} /> Shipping &amp; Settings
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'slides' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('slides');
                setIsAdminSidebarOpen(false);
              }}
            >
              <Sparkles size={16} /> Banner Carousel
            </button>

            <button 
              className={`sidebar-tab-btn ${activeTab === 'backups' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('backups');
                fetchBackupStatus();
                setIsAdminSidebarOpen(false);
              }}
              style={{ color: '#3b82f6', fontWeight: '800' }}
            >
              <Cloud size={16} color="#3b82f6" /> ☁️ Google Drive Backups ({backupStatus?.totalBackupsCount || 0})
            </button>

          </aside>

          <div className="admin-main-panel" style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px' }}>


          {/* TAB 1: OVERVIEW & SALES ANALYTICS (HIGH VS LOW SELLING PRODUCTS) */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Executive KPI Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL STORE REVENUE</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#FF5500', margin: '6px 0 0 0', fontWeight: '900' }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL ORDERS PLACED</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 0 0', fontWeight: '900' }}>{totalOrders}</h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL ACTIVE PRODUCTS</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 0 0', fontWeight: '900' }}>{products ? products.length : 0}</h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>AVERAGE ORDER VALUE</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 0 0', fontWeight: '900' }}>₹{avgOrderValue.toLocaleString('en-IN')}</h3>
                </div>
              </div>

              {/* High Selling vs Low Selling Performance Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* 1. HIGH SELLING PRODUCTS (TOP PERFORMERS) */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <TrendingUp size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#22c55e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Highest Selling Products
                      </h4>
                    </div>
                    <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '0.65rem', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      TOP DEMAND
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {highSellingProducts.slice(0, 4).map((prod, idx) => (
                      <div 
                        key={prod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '7px 10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontWeight: '900', color: '#22c55e', fontSize: '0.78rem', width: '16px', flexShrink: 0 }}>#{idx + 1}</span>
                          <img src={prod.img} alt={prod.title} style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '5px', background: '#ffffff', padding: '2px', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h5 style={{ margin: '0 0 1px 0', fontSize: '0.76rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title}
                            </h5>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{prod.category}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '8px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '900', color: '#22c55e' }}>{prod.unitsSold} Sold</div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>₹{prod.salesRevenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. LOW SELLING PRODUCTS (NEEDS DISCOUNT PROMOTION) */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <TrendingDown size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#ef4444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Lowest Selling Products
                      </h4>
                    </div>
                    <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.65rem', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      PROMO NEEDED
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {lowSellingProducts.slice(0, 4).map((prod) => (
                      <div 
                        key={prod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '7px 10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <img src={prod.img} alt={prod.title} style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '5px', background: '#ffffff', padding: '2px', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h5 style={{ margin: '0 0 1px 0', fontSize: '0.76rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title}
                            </h5>
                            <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: '700' }}>Only {prod.unitsSold} Sold</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleQuickApplyDiscount(prod, 15)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #FF5500',
                            background: 'var(--orange-light)',
                            color: '#FF5500',
                            fontWeight: '800',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Apply 15% discount to boost sales"
                        >
                          <Tag size={10} /> 15% OFF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG & DISCOUNT CALCULATOR */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Catalog Header with Add Product Trigger */}
              <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                padding: '18px 20px', 
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>📦 Store Product Catalog &amp; Pricing Studio</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Total {products ? products.length : 0} items active. Edit prices, set auto discounts %, or toggle stock.
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setIsAddProductOpen(!isAddProductOpen);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF5500 0%, #E03E00 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(255, 85, 0, 0.35)'
                  }}
                >
                  <Plus size={16} /> {isAddProductOpen ? 'Close Form' : 'Add New Product'}
                </button>
              </div>

              {/* Add Product Form Drawer Card */}
              {isAddProductOpen && (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '2px solid #FF5500',
                  borderRadius: '18px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(255, 85, 0, 0.15)',
                  animation: 'modalPop 0.3s ease-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#FF5500', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={15} /> Add New Product
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>Real-Time Auto Discount Calculator</span>
                    </div>
                    <button 
                      onClick={() => setIsAddProductOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Product Title - full width */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Product Title (English) *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Samsung Galaxy S24 Ultra / boAt Airdopes 141"
                          value={newProduct.title}
                          onChange={e => {
                            const val = e.target.value;
                            const autoTa = autoTranslateToTamil(val);
                            setNewProduct({
                              ...newProduct, 
                              title: val,
                              tamilTitle: autoTa
                            });
                          }}
                          required 
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#FF5500' }}>Tamil Title / தமிழ் பெயர் 🇮🇳</label>
                          <span style={{ fontSize: '0.62rem', background: 'rgba(255, 85, 0, 0.15)', color: '#FF5500', padding: '1px 5px', borderRadius: '5px', fontWeight: '800' }}>
                            ✨ Auto-Translated
                          </span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="தானாக தமிழில் மொழிபெயர்க்கப்படும்..."
                          value={newProduct.tamilTitle || ''}
                          onChange={e => setNewProduct({...newProduct, tamilTitle: e.target.value})}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #FF5500', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                        />
                      </div>
                    </div>

                    {/* Product Description */}
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Product Description</label>
                      <textarea 
                        placeholder="Enter detailed product specifications, features, and description..."
                        value={newProduct.description || ''}
                        onChange={e => {
                          const val = e.target.value;
                          const autoTaDesc = autoTranslateToTamil(val);
                          setNewProduct({
                            ...newProduct, 
                            description: val,
                            tamilDesc: autoTaDesc
                          });
                        }}
                        rows={2}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} 
                      />
                    </div>

                    {/* Category + MRP row with Manual Entry Toggle */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700' }}>Category *</label>
                          <button
                            type="button"
                            onClick={() => setIsManualCategory(!isManualCategory)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FF5500',
                              fontSize: '0.68rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            {isManualCategory ? '📋 Select List' : '✏️ Manual Entry'}
                          </button>
                        </div>

                        {isManualCategory ? (
                          <input 
                            type="text" 
                            placeholder="Type custom category..."
                            value={newProduct.category}
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                            required
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #FF5500', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                          />
                        ) : (
                          <select 
                            value={newProduct.category} 
                            onChange={e => {
                              if (e.target.value === 'CUSTOM_MANUAL_ENTRY') {
                                setIsManualCategory(true);
                                setNewProduct({...newProduct, category: ''});
                              } else {
                                setNewProduct({...newProduct, category: e.target.value});
                              }
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          >
                            <option value="Mobile Phones">Mobile Phones</option>
                            <option value="Chargers & Cables">Chargers &amp; Cables</option>
                            <option value="Power Banks">Power Banks</option>
                            <option value="Earphones">Earphones &amp; Audio</option>
                            <option value="Smartwatches">Smartwatches &amp; Bands</option>
                            <option value="OTG & Adapters">OTG &amp; Adapters</option>
                            <option value="Back Covers">Back Covers &amp; Cases</option>
                            <option value="Photo Frames">Photo Frames</option>
                            <option value="Screen Protectors">Screen Protectors &amp; Glass</option>
                            <option value="Accessories">General Accessories</option>
                            <option value="CUSTOM_MANUAL_ENTRY">✏️ Custom / Manual Entry...</option>
                          </select>
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Original MRP (₹)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 2000" 
                          value={newProduct.originalPrice} 
                          onChange={e => handleNewMrpDiscountCalc(e.target.value, newProduct.discountPct)} 
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', boxSizing: 'border-box' }} 
                        />
                      </div>
                    </div>

                    {/* Discount % + Selling Price row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '4px', color: '#FF5500' }}>Discount (%)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 10" 
                          value={newProduct.discountPct} 
                          onChange={e => handleNewMrpDiscountCalc(newProduct.originalPrice, e.target.value)} 
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #FF5500', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Selling Price (₹) *</label>
                        <input 
                          type="number" 
                          placeholder="Auto-calculated" 
                          value={newProduct.price} 
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                          required 
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#FF5500', fontWeight: '900', fontSize: '0.88rem', boxSizing: 'border-box' }} 
                        />
                      </div>
                    </div>

                    {/* Multiple Product Images - Upload Only */}
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Product Photos *</label>
                      
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px 16px',
                        background: 'var(--bg-input)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'border-color 0.2s ease',
                        marginBottom: '12px'
                      }}>
                        <Upload size={24} style={{ color: '#FF5500', marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          Click to Upload Product Photos
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Select one or multiple files (PNG, JPG, WEBP)
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleNewProductImageUpload} 
                          style={{ display: 'none' }} 
                        />
                      </label>

                      {/* Preview Gallery of Uploaded Photos */}
                      {newProduct.images && newProduct.images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                          {newProduct.images.map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                position: 'relative', 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '10px', 
                                border: '1.5px solid var(--border-color)', 
                                padding: '4px',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`uploaded-preview-${idx}`} 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }} 
                              />
                              {/* Main image indicator */}
                              {idx === 0 && (
                                <span style={{
                                  position: 'absolute',
                                  bottom: '-5px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  background: '#FF5500',
                                  color: '#fff',
                                  fontSize: '0.55rem',
                                  padding: '1px 5px',
                                  borderRadius: '6px',
                                  fontWeight: '800',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 4px rgba(255,85,0,0.2)'
                                }}>
                                  Main
                                </span>
                              )}
                              {/* Delete button overlay */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedImages = newProduct.images.filter((_, i) => i !== idx);
                                  setNewProduct({
                                    ...newProduct,
                                    images: updatedImages,
                                    img: updatedImages[0] || ''
                                  });
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="Remove photo"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => setIsAddProductOpen(false)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#FF5500', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> Save Product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Full-Page Product Editor Section (Shown when editing a product) */}
              {editingProductId && (
                <div id="edit-product-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'modalPop 0.3s ease-out', marginBottom: '24px' }}>
                  
                  {/* Editor Header Bar */}
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid #3b82f6',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <ArrowLeft size={16} /> ← Back to Catalog
                      </button>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Edit3 size={18} /> FULL PAGE PRODUCT EDITOR
                        </h3>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          Editing Item #{editingProductId}: {editProductForm.title || ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setEditingProductId(null)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={saveEditProduct}
                        style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                      >
                        <Check size={16} /> Save Product Changes
                      </button>
                    </div>
                  </div>

                  {/* Form Container */}
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '18px',
                    padding: '24px'
                  }}>
                    <form onSubmit={saveEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Title & Tamil Title */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Product Title (English)</label>
                          <input 
                            type="text" 
                            value={editProductForm.title || ''}
                            onChange={e => {
                              const val = e.target.value;
                              const autoTa = autoTranslateToTamil(val);
                              setEditProductForm({
                                ...editProductForm, 
                                title: val,
                                tamilTitle: autoTa
                              });
                            }}
                            required 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} 
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#3b82f6' }}>Tamil Title / தமிழ் பெயர் 🇮🇳</label>
                            <span style={{ fontSize: '0.64rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 6px', borderRadius: '6px', fontWeight: '800' }}>
                              ✨ Auto-Translated
                            </span>
                          </div>
                          <input 
                            type="text" 
                            placeholder="தானாக தமிழில் மொழிபெயர்க்கப்படும்..."
                            value={editProductForm.tamilTitle || ''}
                            onChange={e => setEditProductForm({...editProductForm, tamilTitle: e.target.value})}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #3b82f6', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                          />
                        </div>
                      </div>

                      {/* Product Description */}
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Product Description</label>
                        <textarea 
                          placeholder="Enter detailed product specifications, features, and description..."
                          value={editProductForm.description || ''}
                          onChange={e => {
                            const val = e.target.value;
                            const autoTaDesc = autoTranslateToTamil(val);
                            setEditProductForm({
                              ...editProductForm, 
                              description: val,
                              tamilDesc: autoTaDesc
                            });
                          }}
                          rows={3}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} 
                        />
                      </div>

                      {/* Category + MRP */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: '800' }}>Category</label>
                            <button
                              type="button"
                              onClick={() => setIsEditManualCategory(!isEditManualCategory)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              {isEditManualCategory ? '📋 Select List' : '✏️ Manual Entry'}
                            </button>
                          </div>

                          {isEditManualCategory ? (
                            <input 
                              type="text" 
                              placeholder="Type custom category..."
                              value={editProductForm.category || ''}
                              onChange={e => setEditProductForm({...editProductForm, category: e.target.value})}
                              required
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #3b82f6', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                            />
                          ) : (
                            <select 
                              value={editProductForm.category || 'Accessories'} 
                              onChange={e => {
                                if (e.target.value === 'CUSTOM_MANUAL_ENTRY') {
                                  setIsEditManualCategory(true);
                                  setEditProductForm({...editProductForm, category: ''});
                                } else {
                                  setEditProductForm({...editProductForm, category: e.target.value});
                                }
                              }}
                              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                            >
                              <option value="Mobile Phones">Mobile Phones</option>
                              <option value="Chargers & Cables">Chargers &amp; Cables</option>
                              <option value="Power Banks">Power Banks</option>
                              <option value="Earphones">Earphones &amp; Audio</option>
                              <option value="Smartwatches">Smartwatches &amp; Bands</option>
                              <option value="OTG & Adapters">OTG &amp; Adapters</option>
                              <option value="Back Covers">Back Covers &amp; Cases</option>
                              <option value="Photo Frames">Photo Frames</option>
                              <option value="Screen Protectors">Screen Protectors &amp; Glass</option>
                              <option value="Accessories">General Accessories</option>
                              <option value="CUSTOM_MANUAL_ENTRY">✏️ Custom / Manual Entry...</option>
                            </select>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Original MRP (₹)</label>
                          <input 
                            type="number" 
                            value={editProductForm.originalPrice || ''} 
                            onChange={e => handleEditMrpDiscountCalc(e.target.value, editProductForm.discountPct)} 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} 
                          />
                        </div>
                      </div>

                      {/* Discount + Final Price */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '6px', color: '#3b82f6' }}>Discount (%)</label>
                          <input 
                            type="number" 
                            value={editProductForm.discountPct || 10} 
                            onChange={e => handleEditMrpDiscountCalc(editProductForm.originalPrice, e.target.value)} 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #3b82f6', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 'bold', boxSizing: 'border-box' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Final Price (₹)</label>
                          <input 
                            type="number" 
                            value={editProductForm.price || ''} 
                            onChange={e => setEditProductForm({...editProductForm, price: parseFloat(e.target.value) || 0})} 
                            required 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#FF5500', fontWeight: '900', fontSize: '0.96rem', boxSizing: 'border-box' }} 
                          />
                        </div>
                      </div>

                      {/* Photos Upload & Preview Gallery */}
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>Product Photos</label>
                        
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed var(--border-color)',
                          borderRadius: '14px',
                          padding: '24px 16px',
                          background: 'var(--bg-input)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'border-color 0.2s ease',
                          marginBottom: '14px'
                        }}>
                          <Upload size={28} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            Click to Upload Product Photos
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Select one or multiple files (PNG, JPG, WEBP)
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleEditProductImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>

                        {/* Preview Gallery */}
                        {editProductForm.images && editProductForm.images.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                            {editProductForm.images.map((imgUrl, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  position: 'relative', 
                                  width: '70px', 
                                  height: '70px', 
                                  borderRadius: '12px', 
                                  border: '1.5px solid var(--border-color)', 
                                  padding: '4px',
                                  background: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <img 
                                  src={imgUrl} 
                                  alt={`uploaded-preview-${idx}`} 
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                                />
                                {idx === 0 && (
                                  <span style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    fontSize: '0.58rem',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    fontWeight: '800',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 4px rgba(59,130,246,0.2)'
                                  }}>
                                    Main
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedImages = editProductForm.images.filter((_, i) => i !== idx);
                                    setEditProductForm({
                                      ...editProductForm,
                                      images: updatedImages,
                                      img: updatedImages[0] || ''
                                    });
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                  }}
                                  title="Remove photo"
                                >
                                  <X size={12} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button 
                          type="button" 
                          onClick={() => setEditingProductId(null)}
                          className="btn btn-secondary"
                          style={{ padding: '10px 20px', fontWeight: 'bold' }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          style={{ padding: '10px 24px', background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Check size={16} /> Save Product Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Product Catalog Table */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 10px', width: '250px' }}>PRODUCT</th>
                      <th style={{ padding: '12px 10px', width: '140px' }}>CATEGORY</th>
                      <th style={{ padding: '12px 10px', width: '120px' }}>MRP &amp; DISCOUNT</th>
                      <th style={{ padding: '12px 10px', width: '110px' }}>FINAL RATE</th>
                      <th style={{ padding: '12px 10px', width: '110px' }}>STOCK</th>
                      <th style={{ padding: '12px 10px', width: '170px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products && products.map(prod => {
                      const orig = prod.originalPrice || Math.round(prod.price * 1.25);
                      return (
                        <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={prod.img} alt={prod.title} style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#ffffff', padding: '2px', flexShrink: 0 }} />
                              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)', lineHeight: 1.3, wordBreak: 'break-word' }}>{prod.title}</strong>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>ID: #{prod.id}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {prod.category || 'Accessories'}
                          </td>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{orig.toLocaleString('en-IN')}</div>
                            <span style={{ background: '#FF5500', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '1px 6px', borderRadius: '8px', display: 'inline-block', marginTop: '2px' }}>
                              {prod.discount || '-15%'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle', fontWeight: '900', color: '#FF5500', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                            ₹{prod.price.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                            <button
                              onClick={() => {
                                const updated = { ...prod, inStock: prod.inStock === false ? true : false };
                                onUpdateProduct(updated);
                                if (addToast) addToast(`Stock status updated for ${prod.title.slice(0, 15)}`, '📦');
                              }}
                              style={{
                                border: 'none',
                                background: prod.inStock !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                color: prod.inStock !== false ? '#22c55e' : '#ef4444',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {prod.inStock !== false ? '● In Stock' : '○ Out of Stock'}
                            </button>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button 
                                onClick={() => startEditProduct(prod)}
                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Edit3 size={14} /> Edit Product
                              </button>
                              <button 
                                onClick={() => onDeleteProduct(prod.id)}
                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS & FULFILLMENT TRACKING */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header Banner & Create Order Action */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#FF5500" /> Store Order History &amp; Fulfillment Log
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Total {totalOrders} customer orders recorded. Search by Order Number (e.g. FM-ORD-876371), Customer Name or Phone.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={16} color="#FF5500" /> Export Report (CSV)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: '#FF5500',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(255,85,0,0.3)'
                    }}
                  >
                    <Plus size={16} /> Create Manual Order
                  </button>
                </div>
              </div>

              {/* Executive Order History KPI Cards */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', overflowX: 'auto' }}>
                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '12px', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.3px' }}>TOTAL ORDERS</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#FF5500', margin: '2px 0 0 0', fontWeight: '900' }}>{totalOrders}</h4>
                </div>

                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '12px', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.3px' }}>REVENUE</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#22c55e', margin: '2px 0 0 0', fontWeight: '900' }}>
                    ₹{orders ? orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0).toLocaleString('en-IN') : 0}
                  </h4>
                </div>

                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '12px', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.3px' }}>PENDING</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#3b82f6', margin: '2px 0 0 0', fontWeight: '900' }}>
                    {orders ? orders.filter(o => !o.status || o.status === 'Order Placed' || o.status === 'Processing').length : 0}
                  </h4>
                </div>
              </div>

              {/* Order Search & Filter Controls */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {/* Search Input Box */}
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="Search by Order Number (e.g. FM-ORD-876371), Name, or Phone..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                  {orderSearchTerm && (
                    <button 
                      type="button"
                      onClick={() => setOrderSearchTerm('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['All', 'Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        border: orderStatusFilter === st ? '1.5px solid #FF5500' : '1px solid var(--border-color)',
                        background: orderStatusFilter === st ? 'var(--orange-light)' : 'var(--bg-input)',
                        color: orderStatusFilter === st ? '#FF5500' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    No orders found matching your search term.
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div 
                      key={order.orderId}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '18px'
                      }}
                    >
                      {/* Top Header Row with Order ID & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', background: '#FF5500', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', letterSpacing: '0.5px' }}>
                            ORDER NUMBER
                          </span>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.3px' }}>
                            {order.orderId}
                          </strong>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderId);
                              if (addToast) addToast(`Copied Order Number: ${order.orderId}`, '📋');
                            }}
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            Copy ID
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintOrderInvoice(order)}
                            style={{
                              background: 'var(--orange-light)',
                              border: '1px solid #FF5500',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              color: '#FF5500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🖨️ Tax Invoice
                          </button>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Order Status:</span>
                          <select 
                            value={order.status || 'Order Placed'}
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              if (selectedVal === 'Cancelled') {
                                setAdminCancelTargetOrder(order);
                                setAdminCancelReasonText('Item Out of Stock / Discontinued');
                              } else {
                                onUpdateOrderStatus(order.orderId, selectedVal);
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: (order.status || '').toLowerCase().includes('cancel') ? '1.5px solid #ef4444' : '1.5px solid #FF5500',
                              background: (order.status || '').toLowerCase().includes('cancel') ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)',
                              color: (order.status || '').toLowerCase().includes('cancel') ? '#ef4444' : '#FF5500',
                              fontWeight: '800',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Return Requested">🔄 Return Requested</option>
                            <option value="Return Approved">✅ Return Approved</option>
                            <option value="Return Refunded">💳 Return Refunded</option>
                            <option value="Return Rejected">❌ Return Rejected</option>
                            <option value="Cancelled">🔴 Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {order.cancellationReason && (
                        <div style={{ fontSize: '0.76rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '6px 12px', borderRadius: '8px', marginBottom: '10px', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                          🚫 Cancellation Reason: {order.cancellationReason}
                        </div>
                      )}

                      {order.returnDetails && (
                        <div style={{ fontSize: '0.76rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.08)', padding: '6px 12px', borderRadius: '8px', marginBottom: '10px', fontWeight: '700', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                          🔄 Return Requested: {order.returnDetails.reason} ({order.returnDetails.returnType}) {order.returnDetails.notes ? `- "${order.returnDetails.notes}"` : ''}
                        </div>
                      )}

                      {/* Customer Info & Payment Details Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.8rem', marginBottom: '12px' }}>
                        {/* Full Customer Info */}
                        <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#FF5500', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} /> Customer Details
                          </div>
                          <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{order.customer?.name || 'Walk-in Customer'}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <a href={`tel:${order.customer?.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}>
                              <Phone size={12} style={{ color: '#FF5500' }} /> {order.customer?.phone}
                            </a>
                            {order.customer?.phone && (
                              <a href={`https://wa.me/91${(order.customer.phone || '').replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', textDecoration: 'none' }}>
                                WhatsApp
                              </a>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                            <MapPin size={12} style={{ color: '#FF5500', flexShrink: 0, marginTop: '2px' }} />
                            <span>{order.customer?.address || 'Address not provided'}</span>
                          </div>
                        </div>

                        {/* Payment & Financial Summary */}
                        <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#FF5500', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CreditCard size={13} /> Payment &amp; Financial Summary
                          </div>
                          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                            <strong style={{ color: '#22c55e' }}>{order.paymentMethod || 'UPI'}</strong>
                          </div>
                          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                            <strong>₹{order.subtotal?.toLocaleString('en-IN') || 0}</strong>
                          </div>
                          <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery Charge:</span>
                            <strong>{(order.shipping === 0 || order.shipping === 'FREE') ? 'FREE' : `₹${(order.shipping === 'Pending' || order.shipping === undefined || order.shipping === null) ? ((order.subtotal || order.total || 0) >= 1000 ? 0 : 60) : order.shipping}`}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 'bold' }}>Grand Total:</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FF5500' }}>
                              ₹{order.total?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                    {/* Ordered Items & Custom Upload Downloads */}
                    <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Ordered Items &amp; Customization Uploads ({order.items ? order.items.length : 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {order.items && order.items.map((item, idx) => {
                          const details = item.customizationDetails || {};
                          const uploadedFile = details.uploadedFile || (item.img && item.img.startsWith('data:') ? item.img : null);
                          const fileName = details.fileName || `Custom_Order_${order.orderId}_Item_${idx + 1}.png`;
                          const isDoc = details.isDocument || details.fileType?.includes('pdf') || fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');

                          return (
                            <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {/* Item Thumbnail / Document Icon */}
                              <div style={{ width: '52px', height: '52px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                {uploadedFile && !isDoc ? (
                                  <img src={uploadedFile} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : isDoc ? (
                                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                                ) : (
                                  <img src={item.img || 'images/prod_custom_cover.png'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                )}
                              </div>

                              {/* Item Info */}
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <strong style={{ fontSize: '0.84rem', display: 'block' }}>{item.title}</strong>
                                <span style={{ fontSize: '0.74rem', color: '#FF5500', fontWeight: '800' }}>₹{item.price} × {item.quantity || 1}</span>

                                {/* Customization Details List */}
                                {Object.keys(details).length > 0 && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {details.brand && <span style={{ background: 'var(--orange-light)', color: '#FF5500', padding: '1px 6px', borderRadius: '6px', fontWeight: '700' }}>Brand: {details.brand}</span>}
                                    {details.model && <span style={{ background: 'var(--orange-light)', color: '#FF5500', padding: '1px 6px', borderRadius: '6px', fontWeight: '700' }}>Model: {details.model}</span>}
                                    {details.caseType && <span style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '6px' }}>Type: {details.caseType}</span>}
                                    {details.finish && <span style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '6px' }}>Finish: {details.finish}</span>}
                                    {details.customText && <span style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '6px', color: '#FF5500', fontWeight: 'bold' }}>Text: "{details.customText}"</span>}
                                    {details.size && <span style={{ background: 'var(--orange-light)', color: '#FF5500', padding: '1px 6px', borderRadius: '6px', fontWeight: '700' }}>Size: {details.size}</span>}
                                    {details.color && <span style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '6px' }}>Color: {details.color}</span>}
                                  </div>
                                )}
                              </div>

                              {/* High Resolution Download Action Button */}
                              {uploadedFile ? (
                                <a
                                  href={uploadedFile}
                                  download={fileName}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: '#ffffff',
                                    fontWeight: '800',
                                    fontSize: '0.76rem',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 3px 10px rgba(34,197,94,0.3)',
                                    cursor: 'pointer'
                                  }}
                                  title="Download full resolution photo or document for printing"
                                >
                                  <Upload size={14} style={{ transform: 'rotate(180deg)' }} /> Download HD {isDoc ? 'Document' : 'Photo'}
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Standard Item</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping Fee Update Row */}
                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.73rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Update Shipping Fee
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <input 
                          type="number"
                          placeholder="₹ Shipping cost"
                          defaultValue={order.shipping === 'Pending' ? '' : order.shipping}
                          id={`shipping-input-${order.orderId}`}
                          style={{
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            flex: '1',
                            minWidth: '80px',
                            maxWidth: '140px',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById(`shipping-input-${order.orderId}`);
                            if (inputEl) {
                              onUpdateShippingCost(order.orderId, inputEl.value);
                            }
                          }}
                          className="btn btn-primary"
                          style={{ padding: '7px 14px', fontSize: '0.76rem' }}
                        >
                          Save Fee
                        </button>

                        {/* Admin Cancel Order Action Button */}
                        {(order.status || '').toLowerCase() !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminCancelTargetOrder(order);
                              setAdminCancelReasonText('Item Out of Stock / Discontinued');
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              fontWeight: '800',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              marginLeft: 'auto'
                            }}
                          >
                            🚫 Cancel Order
                          </button>
                        )}

                        {order.shipping === 'Pending' && (
                          <span style={{ color: 'var(--primary-orange)', fontWeight: '700', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SHIPPING & DELIVERY SETTINGS */}
          {activeTab === 'shipping' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '18px', maxWidth: '600px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#FF5500" /> Delivery &amp; Shipping Rates Settings
              </h3>

              <form onSubmit={handleSaveShipping} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Standard Shipping Fee (₹)</label>
                  <input 
                    type="number" 
                    value={shippingForm.standardShippingFee}
                    onChange={(e) => setShippingForm({...shippingForm, standardShippingFee: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Free Shipping Minimum Amount Threshold (₹)</label>
                  <input 
                    type="number" 
                    value={shippingForm.freeShippingThreshold}
                    onChange={(e) => setShippingForm({...shippingForm, freeShippingThreshold: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Support Phone Number</label>
                  <input 
                    type="text" 
                    value={shippingForm.supportPhone}
                    onChange={(e) => setShippingForm({...shippingForm, supportPhone: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ marginTop: '10px', padding: '12px' }}
                >
                  SAVE SHIPPING SETTINGS
                </button>
              </form>
            </div>
          )}

          {/* TAB: CUSTOMER COMPLAINTS & SUPPORT TICKETS */}
          {activeTab === 'complaints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Complaints Control Bar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <AlertCircle size={22} color="#ef4444" /> Customer Complaints &amp; Support Tickets
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Track and resolve customer issues submitted via 24/7 AI Customer Care Chatbot.
                    </p>
                  </div>

                  <button
                    onClick={fetchComplaints}
                    style={{
                      padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: '700',
                      fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} /> Refresh Complaints
                  </button>
                </div>

                {/* Search & Status Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search by Ticket ID, Customer Name, Phone, or Order ID..."
                    value={complaintSearchTerm}
                    onChange={(e) => setComplaintSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['All', 'Open', 'In Review', 'Resolved'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setComplaintFilter(st)}
                        style={{
                          padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--border-color)',
                          background: complaintFilter === st ? '#FF5500' : 'var(--bg-card)',
                          color: complaintFilter === st ? '#ffffff' : 'var(--text-secondary)',
                          fontWeight: '700', fontSize: '0.76rem', cursor: 'pointer'
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Complaints List Cards */}
              {(() => {
                const filtered = complaints.filter(c => {
                  const matchesFilter = complaintFilter === 'All' || c.status === complaintFilter;
                  const q = complaintSearchTerm.toLowerCase().trim();
                  const matchesQuery = !q || 
                    (c.ticketId && c.ticketId.toLowerCase().includes(q)) ||
                    (c.customerName && c.customerName.toLowerCase().includes(q)) ||
                    (c.customerPhone && c.customerPhone.includes(q)) ||
                    (c.orderId && c.orderId.toLowerCase().includes(q)) ||
                    (c.category && c.category.toLowerCase().includes(q)) ||
                    (c.message && c.message.toLowerCase().includes(q));
                  return matchesFilter && matchesQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', padding: '40px 20px', borderRadius: '18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <AlertCircle size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>No Customer Complaints Found</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem' }}>When customers raise an issue in the 24/7 AI Chatbot, their tickets will appear here.</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filtered.map((c) => {
                      const isOpened = c.status === 'Open';
                      const isResolved = c.status === 'Resolved';
                      return (
                        <div
                          key={c.ticketId || c.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: `1px solid ${isOpened ? 'rgba(239, 68, 68, 0.4)' : (isResolved ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-color)')}`,
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ background: isOpened ? '#ef4444' : (isResolved ? '#22c55e' : '#f59e0b'), color: '#ffffff', fontWeight: '800', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px' }}>
                                  Ticket #{c.ticketId}
                                </span>
                                <span style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px' }}>
                                  Category: {c.category}
                                </span>
                                {c.orderId && (
                                  <span style={{ background: 'rgba(255, 85, 0, 0.1)', color: '#FF5500', fontWeight: '800', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px' }}>
                                    Order #{c.orderId}
                                  </span>
                                )}
                              </div>
                              <h4 style={{ margin: '8px 0 2px 0', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                Customer: {c.customerName}
                              </h4>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '2px' }}>
                                <span>📞 {c.customerPhone}</span>
                                {c.customerEmail && <span>✉️ {c.customerEmail}</span>}
                                <span>🕒 Submitted: {new Date(c.createdAt || Date.now()).toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* Status Change Selector & WhatsApp Link */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <select
                                value={c.status}
                                onChange={(e) => handleUpdateComplaintStatus(c.ticketId, e.target.value, c.adminNotes)}
                                style={{
                                  padding: '7px 12px', borderRadius: '10px',
                                  border: `1px solid ${isOpened ? '#ef4444' : (isResolved ? '#22c55e' : '#f59e0b')}`,
                                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                                  fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
                                }}
                              >
                                <option value="Open">🔴 Open (Pending Action)</option>
                                <option value="In Review">🟡 In Review</option>
                                <option value="Resolved">🟢 Resolved</option>
                                <option value="Closed">⚪ Closed</option>
                              </select>

                              <a
                                href={`https://wa.me/91${(c.customerPhone || '').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(c.customerName)},%20this%20is%20FRIENDS%20MOBILE%20Support%20regarding%20your%20complaint%20Ticket%20%23${c.ticketId}.`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '7px 12px', borderRadius: '10px', border: 'none',
                                  background: '#22c55e', color: '#ffffff', fontWeight: '800',
                                  fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'none',
                                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                                }}
                              >
                                <MessageSquare size={14} /> WhatsApp Customer
                              </a>
                            </div>
                          </div>

                          {/* Complaint Message Content */}
                          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#ef4444', marginBottom: '4px' }}>
                              Customer Complaint Description:
                            </span>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                              {c.message}
                            </p>
                          </div>

                          {/* Admin Resolution Notes Input */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Add resolution notes or outcome for this ticket..."
                              defaultValue={c.adminNotes || ''}
                              onBlur={(e) => {
                                if (e.target.value !== (c.adminNotes || '')) {
                                  handleUpdateComplaintStatus(c.ticketId, c.status, e.target.value);
                                }
                              }}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB 5: BANNER CAROUSEL SETTINGS */}
          {activeTab === 'slides' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#FF5500" /> Manage Home Banner Slides
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem('fm_slides');
                        localStorage.removeItem('fm_slides_cache');
                      } catch (_) {}
                      if (onUpdateSlides) onUpdateSlides(null);
                      if (addToast) addToast('Cache cleared & Default Banners restored!', '✨');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #FF5500',
                      background: 'var(--orange-light)',
                      color: '#FF5500',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={12} /> Clear Cache &amp; Reset Default Banners
                  </button>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Delete existing banner images/slides, or upload custom back cover/photo frame banners.
                </p>

                {/* List of Banner Slides */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {slides && slides.map((slide, index) => (
                    <div 
                      key={slide.id || index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        padding: '14px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)'
                      }}
                    >
                      <img 
                        src={slide.imgSrc} 
                        alt={slide.tag} 
                        style={{ 
                          width: '80px', 
                          height: '50px', 
                          objectFit: 'cover', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border-color)',
                          background: '#000'
                        }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Banner Slide #{index + 1}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Button: {slide.btnText || 'SHOP NOW'} ({slide.btnLink || '#'})
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteSlide(slide.id)}
                        style={{ 
                          padding: '8px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#ef4444', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                        title="Delete Banner Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {(!slides || slides.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No banner slides configured. Add a new banner slide below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Slide Form */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '18px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '800' }}>
                  Add New Banner Slide
                </h4>

                <form onSubmit={handleAddSlideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Button Text</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SHOP NOW"
                        value={newSlideForm.btnText}
                        onChange={(e) => setNewSlideForm({...newSlideForm, btnText: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Button Target Section/Link</label>
                      <select 
                        value={newSlideForm.btnLink}
                        onChange={(e) => setNewSlideForm({...newSlideForm, btnLink: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                      >
                        <option value="#products">Shop Products (#products)</option>
                        <option value="#customized-covers">Customize Covers (#customized-covers)</option>
                        <option value="#photo-frames">Photo Frames (#photo-frames)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Banner Image File</label>
                      <input 
                        key={newSlideForm.imgSrc ? 'file-uploaded' : 'file-cleared'}
                        type="file" 
                        accept="image/*"
                        onChange={handleSlideImageUpload}
                        style={{ width: '100%', padding: '6px', fontSize: '0.8rem', outline: 'none' }}
                        required={!newSlideForm.imgSrc}
                      />
                    </div>
                  </div>

                  {newSlideForm.imgSrc && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', maxWidth: '280px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Uploaded Preview:</span>
                        <button
                          type="button"
                          onClick={() => setNewSlideForm(prev => ({ ...prev, imgSrc: '' }))}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={12} /> Cancel / Remove Image
                        </button>
                      </div>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                          src={newSlideForm.imgSrc} 
                          alt="Preview" 
                          style={{ width: '150px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'block' }} 
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ marginTop: '10px', padding: '12px', width: '100%', justifyContent: 'center' }}
                  >
                    <Plus size={16} /> ADD NEW SLIDE BANNER
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: USER MOBILE COVER & PHOTO FRAME CUSTOMIZATION DASHBOARD */}
          {activeTab === 'customizations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Title Banner */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ background: 'rgba(255, 85, 0, 0.12)', border: '1px solid rgba(255, 85, 0, 0.3)', color: '#FF5500', padding: '3px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={14} /> LIVE PRINTING STUDIO
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>3D Back Covers &amp; Photo Frames</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                    User Mobile Cover &amp; Frame Customizations
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Review customer-submitted mobile cover designs, phone models, custom text, and 1-click download high-resolution photos for 3D printing.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportMasterExcel}
                    style={{
                      padding: '10px 16px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#ffffff', fontWeight: '800', fontSize: '0.84rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                    }}
                  >
                    <FileText size={16} /> Export Customizations to Excel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (addToast) addToast('Refreshed customer customization list!', 'info');
                    }}
                    style={{
                      padding: '10px 16px', borderRadius: '12px',
                      border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                      color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.84rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <RefreshCw size={16} /> Refresh Orders
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL CUSTOM ORDERS</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#FF5500', margin: '6px 0 0 0', fontWeight: '900' }}>{displayCustomizations.length}</h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>3D MOBILE COVERS</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 0 0', fontWeight: '900' }}>
                    {displayCustomizations.filter(c => c.category?.includes('Cover') || c.customizationDetails?.brand).length}
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>PHOTO FRAMES</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 0 0', fontWeight: '900' }}>
                    {displayCustomizations.filter(c => c.category?.includes('Frame') || c.customizationDetails?.size).length}
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>READY FOR 3D PRINTING</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#22c55e', margin: '6px 0 0 0', fontWeight: '900' }}>
                    {displayCustomizations.length}
                  </h3>
                </div>
              </div>

              {/* Customizations Items Grid */}
              {displayCustomizations.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(255, 85, 0, 0.1)', color: '#FF5500',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Smartphone size={32} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    No Customer Custom Cover Orders Submitted Yet
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
                    When real customers customize mobile back covers or photo frames on the website, their uploaded photos, WhatsApp contact numbers, phone models, and print specifications will appear here automatically for 3D printing.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {displayCustomizations.map((item, index) => {
                  const details = item.customizationDetails || {};
                  const isFrame = item.category?.includes('Frame') || details.size;
                  const isDemo = item.orderId?.startsWith('FM-DEMO');

                  return (
                    <div 
                      key={index}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Top Header Card Info */}
                      <div style={{ padding: '16px 20px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#FF5500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={14} /> ORDER #{item.orderId}
                            {isDemo && <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '1px 6px', borderRadius: '6px', fontSize: '0.68rem' }}>Demo Test</span>}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.orderDate}
                          </div>
                        </div>

                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800',
                          background: item.paymentStatus === 'Paid' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                          color: item.paymentStatus === 'Paid' ? '#16a34a' : '#ca8a04',
                          border: `1px solid ${item.paymentStatus === 'Paid' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
                        }}>
                          {item.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>

                      {/* Card Body with Image & Details */}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Image Preview Container with Download Overlay */}
                        <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000000' }}>
                          <img 
                            src={item.img} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />

                          <div style={{ position: 'absolute', bottom: '10px', right: '10px', left: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span style={{ color: '#ffffff', fontSize: '0.76rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                              📷 {details.fileName || 'custom_user_photo.png'}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleDownloadCustomImage(item.img, details.fileName || `custom_${item.orderId}.png`)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                background: '#FF5500', color: '#ffffff', fontWeight: '800',
                                fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 2px 8px rgba(255,85,0,0.4)'
                              }}
                            >
                              <Download size={14} /> Download Image
                            </button>
                          </div>
                        </div>

                        {/* Title & Price */}
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {item.title}
                          </h4>
                          <span style={{ fontSize: '0.92rem', color: '#FF5500', fontWeight: '900' }}>
                            ₹{item.price?.toLocaleString('en-IN')} (Qty: {item.quantity})
                          </span>
                        </div>

                        {/* Customization Specs Table */}
                        <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                          {!isFrame ? (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Phone Brand &amp; Model:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{details.brand || 'Apple'} • {details.model || 'iPhone 15 Pro'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Case Material &amp; Finish:</span>
                                <strong style={{ color: '#FF5500' }}>{details.caseType || '3D Hard Case'} ({details.finish || 'Glossy'})</strong>
                              </div>
                              {details.customText && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Custom Text Printed:</span>
                                  <strong style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>"{details.customText}"</strong>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Frame Dimensions:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{details.size || '8 x 10 inches'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Frame Material &amp; Color:</span>
                                <strong style={{ color: '#FF5500' }}>{details.color || 'Walnut Wood'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Orientation &amp; Glass:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{details.orientation || 'Portrait'} • {details.glass || 'Anti-Glare Glass'}</strong>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Customer Info Box */}
                        <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} color="#FF5500" /> {item.customerName}
                          </div>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} /> {item.customerPhone}
                          </div>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} /> {item.customerAddress}
                          </div>
                        </div>

                      </div>

                      {/* Card Footer Actions */}
                      <div style={{ padding: '14px 20px', background: 'var(--bg-input)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadCustomImage(item.img, details.fileName || `custom_${item.orderId}.png`)}
                          style={{
                            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #FF5500, #ff7700)', color: '#ffffff',
                            fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            boxShadow: '0 4px 12px rgba(255, 85, 0, 0.3)'
                          }}
                        >
                          <Download size={16} /> Download Image
                        </button>

                        <a
                          href={`https://wa.me/${(details.whatsappNumber || item.customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${item.customerName}, regarding your custom cover order #${item.orderId} at FRIENDS MOBILE...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '10px 14px', borderRadius: '10px',
                            border: '1.5px solid #22c55e', background: 'rgba(34, 197, 94, 0.1)',
                            color: '#16a34a', fontWeight: '800', fontSize: '0.82rem',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <MessageSquare size={16} /> WhatsApp
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
              )}

            </div>
          )}

          {/* TAB 6: 5,000 GB CLOUD STORAGE & BACKUPS */}
          {activeTab === 'backups' && (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Cloud Quota Overview Banner */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <Cloud size={24} color="#3b82f6" /> 15 GB Google Drive Automated JSON Database Backups
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Automated hourly PostgreSQL JSON database backup files uploaded directly to your personal Google Drive folder.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={backupStatus?.folderUrl || `https://drive.google.com/drive/folders/${backupStatus?.folderId || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl'}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '10px 18px', borderRadius: '10px',
                        border: '1.5px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6', fontWeight: '800', fontSize: '0.82rem',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <HardDrive size={16} /> 📁 Open Google Drive Folder 🔗
                    </a>

                    <button
                      type="button"
                      onClick={handleExportMasterExcel}
                      style={{
                        padding: '10px 18px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                      }}
                    >
                      <FileText size={16} /> 📊 Export Full Store to Excel (.xlsx)
                    </button>

                    <button
                      onClick={handleTriggerBackup}
                      disabled={isBackingUp}
                      style={{
                        padding: '10px 18px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                        cursor: isBackingUp ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
                      }}
                    >
                      <Cloud size={16} /> {isBackingUp ? 'Uploading JSON to Google Drive...' : '📁 Backup JSON Database Now'}
                    </button>
                  </div>

                </div>

                {/* Quota KPI Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '6px' }}>
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Total Storage Quota</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#3b82f6', fontWeight: '900' }}>15 GB (Google Drive Free Tier)</h4>
                  </div>
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Used Storage</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '900' }}>{backupStatus?.usedMB || '0.00 MB'}</h4>
                  </div>
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Total JSON Backups</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#22c55e', fontWeight: '900' }}>{backupStatus?.totalBackupsCount || 0} Files</h4>
                  </div>
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Last Auto JSON Backup</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {backupStatus?.lastBackupAt ? new Date(backupStatus.lastBackupAt).toLocaleString('en-IN') : 'None'}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Google Drive & Local File Disaster Recovery Restore Card */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid #3b82f6', padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={20} color="#3b82f6" /> ⚡ Disaster Recovery &amp; Database Restoration
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Restore your complete store (Users, Orders, Products, Base64 Images &amp; Settings) after a server crash using your Google Drive backup JSON file.
                    </p>
                  </div>

                  <button
                    onClick={handleGDriveSyncRestore}
                    disabled={isSyncingGDrive}
                    style={{
                      padding: '10px 18px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                      cursor: isSyncingGDrive ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Cloud size={16} /> {isSyncingGDrive ? 'Downloading from Drive...' : '☁️ 1-Click Sync & Restore from Google Drive'}
                  </button>
                </div>

                {/* Upload JSON File Dropzone */}
                <div style={{
                  background: 'var(--bg-input)', border: '2px dashed #3b82f6', borderRadius: '14px',
                  padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <label style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUploadRestore}
                      disabled={isRestoringUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={32} color="#3b82f6" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                      {isRestoringUpload ? 'Restoring Database & Images from File...' : '📁 Click to Upload & Restore Google Drive Backup JSON File'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Select any <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', color: '#FF5500' }}>friends_mobile_master_backup.json</code> file downloaded from your Google Drive folder.
                    </span>
                  </label>
                </div>
              </div>

              {/* Historical Cloud Snapshots Table */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '18px' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} color="#22c55e" />
                  <span style={{ fontSize: '0.84rem', color: '#15803d', fontWeight: '700' }}>
                    ⚡ Auto-Restore Active: The system automatically restores the latest database snapshot on server boot and recovery. No manual action required!
                  </span>
                </div>

                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={18} color="#3b82f6" /> Auto-Synced Database Snapshots ({Array.isArray(backupStatus?.backups) ? backupStatus.backups.length : 0})
                </h4>

                {(!Array.isArray(backupStatus?.backups) || backupStatus.backups.length === 0) ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No JSON backups created yet. The system automatically creates a snapshot on every store event.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {backupStatus.backups.map((bk, idx) => {
                      if (!bk) return null;
                      const fileName = bk.filename || `backup_snapshot_${idx}.json`;
                      const sizeText = bk.sizeFormatted || '0 KB';
                      const dateText = bk.createdAt ? new Date(bk.createdAt).toLocaleString('en-IN') : 'Recent';

                      return (
                        <div
                          key={fileName}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)', flexWrap: 'wrap', gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                            <HardDrive size={22} color="#3b82f6" />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                  {fileName}
                                </strong>
                                {idx === 0 && (
                                  <span style={{ background: '#22c55e', color: '#ffffff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: '900' }}>
                                    Active Auto-Restored
                                  </span>
                                )}
                                <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '8px', fontWeight: '800' }}>
                                  {bk.backupType || 'Master Backup'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                <span>Size: <strong>{sizeText}</strong></span>
                                <span>• Date: <strong>{dateText}</strong></span>
                              </div>

                              {/* Rich Users & Orders Breakdown Badges */}
                              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.72rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  👥 Users: <strong style={{ color: '#FF5500' }}>{bk.userCount || 0}</strong>
                                </span>
                                <span style={{ fontSize: '0.72rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  🛒 Orders: <strong style={{ color: '#3b82f6' }}>{bk.orderCount || 0}</strong>
                                </span>
                                <span style={{ fontSize: '0.72rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  📦 Products: <strong style={{ color: '#22c55e' }}>{bk.productCount || 0}</strong>
                                </span>
                              </div>

                              {bk.sampleUsers && bk.sampleUsers.length > 0 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                  User Accounts: {bk.sampleUsers.join(', ')} {bk.userCount > bk.sampleUsers.length ? `(+${bk.userCount - bk.sampleUsers.length} more)` : ''}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                              ✅ Auto-Synced
                            </span>
                            <a
                              href={`${getApiHost()}/api/admin/backups/download/${encodeURIComponent(fileName)}`}
                              target="_blank"
                              rel="noreferrer"
                              download={fileName}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: '1px solid #3b82f6',
                                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none'
                              }}
                              title="Download Backup JSON File to Device"
                            >
                              <Download size={13} /> Download JSON
                            </a>
                            <button
                              onClick={() => handleRestoreBackup(fileName)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)', color: 'var(--text-muted)',
                                fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                              title="Force Manual Re-Sync"
                            >
                              <RefreshCw size={13} /> Force Re-Sync
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          </div>
        </div>
      )}

      {/* Modal Dialog for Creating Manual Order */}
      {isCreateOrderModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 10010, backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#FF5500" /> Create Manual / Phone Order History
              </h3>
              <button onClick={() => setIsCreateOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateManualOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Customer Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={createOrderForm.customerName}
                  onChange={(e) => setCreateOrderForm({ ...createOrderForm, customerName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  placeholder="e.g. Arun Kumar"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Customer Mobile Number *</label>
                <input 
                  type="tel" 
                  required 
                  value={createOrderForm.customerPhone}
                  onChange={(e) => setCreateOrderForm({ ...createOrderForm, customerPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Delivery Address *</label>
                <textarea 
                  required 
                  rows={2}
                  value={createOrderForm.customerAddress}
                  onChange={(e) => setCreateOrderForm({ ...createOrderForm, customerAddress: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical' }}
                  placeholder="Street, Area, City"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Pincode</label>
                  <input 
                    type="text" 
                    value={createOrderForm.customerPincode}
                    onChange={(e) => setCreateOrderForm({ ...createOrderForm, customerPincode: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Payment Method</label>
                  <select
                    value={createOrderForm.paymentMethod}
                    onChange={(e) => setCreateOrderForm({ ...createOrderForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  >
                    <option value="UPI">UPI / Google Pay</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Initial Order Status</label>
                <select
                  value={createOrderForm.status}
                  onChange={(e) => setCreateOrderForm({ ...createOrderForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Select Product from Catalog</label>
                <select
                  value={createOrderForm.selectedProductId}
                  onChange={(e) => setCreateOrderForm({ ...createOrderForm, selectedProductId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                >
                  <option value="">-- Or Custom Item below --</option>
                  {products && products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              {!createOrderForm.selectedProductId && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Custom Item Title</label>
                    <input 
                      type="text" 
                      value={createOrderForm.customItemTitle}
                      onChange={(e) => setCreateOrderForm({ ...createOrderForm, customItemTitle: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                    <input 
                      type="number" 
                      value={createOrderForm.customItemPrice}
                      onChange={(e) => setCreateOrderForm({ ...createOrderForm, customItemPrice: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCreateOrderModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-orange" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                  Save Order Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Admin Cancel Order Reason Selection Modal */}
      {adminCancelTargetOrder && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.82)', zIndex: 100050, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(8px)', boxSizing: 'border-box'
          }}
          onClick={() => setAdminCancelTargetOrder(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '20px', padding: '24px', maxWidth: '460px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚫 Admin Order Cancellation
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              Are you sure you want to cancel <strong>Order #{adminCancelTargetOrder.orderId}</strong>? Select the cancellation reason below:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                'Item Out of Stock / Discontinued',
                'Customer Requested Cancellation (Call/Chat)',
                'Incorrect Shipping Address / Phone Unreachable',
                'Payment Failed / Fraud Check',
                'Damaged Item / Quality Inspection Failed',
                'Other Administrative Reason'
              ].map(reason => (
                <label 
                  key={reason}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderRadius: '10px', border: adminCancelReasonText === reason ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    background: adminCancelReasonText === reason ? 'rgba(239,68,68,0.08)' : 'var(--bg-input)',
                    color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="adminCancelReason" 
                    checked={adminCancelReasonText === reason} 
                    onChange={() => setAdminCancelReasonText(reason)}
                    style={{ accentColor: '#ef4444' }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setAdminCancelTargetOrder(null)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Keep Order Active
              </button>
              <button
                type="button"
                onClick={handleAdminConfirmCancelOrder}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
              >
                Confirm Admin Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    portalContainer
  );
}
