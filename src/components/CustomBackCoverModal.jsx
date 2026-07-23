import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Upload, Plus, AlertCircle, ShoppingCart, Camera, Image, Search, Shield, Sparkles, Type, MessageSquare, ShoppingBag, RefreshCw, CheckCircle2, Crown, Zap, Edit3, ChevronDown, ChevronUp, Move, ZoomIn, RotateCw, Sliders } from 'lucide-react';
import { PHONE_BRANDS, PHONE_MODELS_REGISTRY, findModelSpecs } from '../data/phoneCameraRegistry';

export default function CustomBackCoverModal({ isOpen, onClose, onAddToCart, addToast }) {
  const fileInputRef = useRef(null);
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [isBrandListOpen, setIsBrandListOpen] = useState(false);
  const [phoneModel, setPhoneModel] = useState('');
  const [caseType, setCaseType] = useState('Full 3D Hard Case (Sides + Back Print)'); // 'Full 3D Hard Case' | 'Soft Silicone TPU' | 'Glass Finish'
  const [caseFinish, setCaseFinish] = useState('Matte Finish'); // 'Matte Finish' | 'Glossy Finish'
  const [customText, setCustomText] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customModelInput, setCustomModelInput] = useState('');

  // Sync default model when brand changes
  useEffect(() => {
    setPhoneModel('');
  }, [selectedBrand]);

  if (!isOpen) return null;

  const brandModels = PHONE_MODELS_REGISTRY[selectedBrand] || [];
  const filteredModels = searchTerm.trim() === '' 
    ? brandModels 
    : brandModels.filter(m => m.model.toLowerCase().includes(searchTerm.toLowerCase()));

  // Group models by official brand series
  const seriesGroups = filteredModels.reduce((acc, mObj) => {
    const sName = mObj.series || `${selectedBrand} Models`;
    if (!acc[sName]) acc[sName] = [];
    acc[sName].push(mObj);
    return acc;
  }, {});

  const activeModelSpecs = findModelSpecs(selectedBrand, phoneModel);
  const cameraLayout = activeModelSpecs.layout;
  const canvasWidth = activeModelSpecs.width || '240px';
  const canvasHeight = activeModelSpecs.height || '460px';
  const canvasBorderRadius = activeModelSpecs.radius || '40px';
  const innerImageBorderRadius = activeModelSpecs.radius === '12px' ? '6px' : '30px';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isDoc = file.type === 'application/pdf' || 
                    file.name.toLowerCase().endsWith('.pdf') || 
                    file.name.toLowerCase().endsWith('.doc') || 
                    file.name.toLowerCase().endsWith('.docx') || 
                    file.name.toLowerCase().endsWith('.psd') || 
                    file.name.toLowerCase().endsWith('.ai');

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const fileDataUrl = uploadEvent.target.result;
        setUploadedPhoto(fileDataUrl);
        setUploadedFileInfo({
          name: file.name,
          type: file.type || (isDoc ? 'application/pdf' : 'image/png'),
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          isDoc: isDoc
        });
        if (addToast) addToast(isDoc ? 'PDF/Document uploaded successfully!' : 'Photo uploaded in HD quality!', '📄');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCartSubmit = (e) => {
    e.preventDefault();
    const finalModel = phoneModel === 'Other / Unlisted Model' ? customModelInput : phoneModel;
    if (!finalModel) {
      if (addToast) addToast('Please select or enter your phone model', '⚠️');
      return;
    }

    const customCoverProduct = {
      id: `custom-cover-${Date.now()}`,
      title: `Custom ${selectedBrand} ${finalModel} Back Cover`,
      price: 399,
      originalPrice: 499,
      category: 'Customized Back Covers',
      img: uploadedPhoto && !uploadedFileInfo?.isDoc ? uploadedPhoto : 'images/prod_custom_cover.png',
      discount: '-20%',
      customizationDetails: {
        brand: selectedBrand,
        model: finalModel,
        caseType,
        finish: caseFinish,
        customText,
        userPhoto: uploadedPhoto ? (uploadedFileInfo?.isDoc ? `Document (${uploadedFileInfo.name})` : 'Custom Photo Included') : 'Default Design',
        uploadedFile: uploadedPhoto,
        fileName: uploadedFileInfo ? uploadedFileInfo.name : `custom_cover_${selectedBrand}_${finalModel}.png`,
        fileType: uploadedFileInfo ? uploadedFileInfo.type : 'image/png',
        fileSize: uploadedFileInfo ? uploadedFileInfo.size : '',
        isDocument: uploadedFileInfo ? uploadedFileInfo.isDoc : false
      }
    };

    onAddToCart(customCoverProduct);
    if (addToast) addToast(`Customized Back Cover for ${selectedBrand} ${finalModel} added to cart!`, '🎉');
    onClose();
  };

  const renderBrandLogo = (bName) => {
    const b = (bName || '').toLowerCase();
    if (b.includes('apple')) {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.64c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z" />
        </svg>
      );
    }
    if (b.includes('samsung')) {
      return <div style={{ width: '22px', height: '22px', background: '#034EA2', borderRadius: '50%', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>;
    }
    if (b.includes('realme')) {
      return <div style={{ width: '22px', height: '22px', background: '#FFC800', borderRadius: '5px', color: '#000000', fontSize: '0.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>r</div>;
    }
    if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
      return <div style={{ width: '22px', height: '22px', background: '#FF6700', borderRadius: '5px', color: '#ffffff', fontSize: '0.68rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>mi</div>;
    }
    if (b.includes('motorola') || b.includes('moto')) {
      return <div style={{ width: '22px', height: '22px', background: '#001430', borderRadius: '50%', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>M</div>;
    }
    if (b.includes('vivo')) {
      return (
        <svg viewBox="0 0 80 32" width="28" height="14" fill="none">
          <path d="M6 8 L13 24 L20 8" stroke="#415FFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="28" y1="12" x2="28" y2="24" stroke="#415FFF" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="28" cy="5" r="2.5" fill="#415FFF" />
          <path d="M36 8 L43 24 L50 8" stroke="#415FFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="64" cy="16" r="7" stroke="#415FFF" strokeWidth="5.5" />
        </svg>
      );
    }
    if (b.includes('oppo')) {
      return (
        <svg viewBox="0 0 125 40" width="30" height="14" fill="none">
          <circle cx="20" cy="20" r="10" stroke="#008A5C" strokeWidth="5" />
          <circle cx="48" cy="20" r="10" stroke="#008A5C" strokeWidth="5" />
          <rect x="38" y="20" width="5" height="15" fill="#008A5C" />
          <circle cx="76" cy="20" r="10" stroke="#008A5C" strokeWidth="5" />
          <rect x="66" y="20" width="5" height="15" fill="#008A5C" />
          <circle cx="104" cy="20" r="10" stroke="#008A5C" strokeWidth="5" />
        </svg>
      );
    }
    if (b.includes('oneplus')) {
      return <div style={{ width: '22px', height: '22px', background: '#F5002C', borderRadius: '5px', color: '#ffffff', fontSize: '0.68rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1+</div>;
    }
    if (b.includes('infinix')) {
      return <div style={{ width: '22px', height: '22px', background: '#00c3ff', borderRadius: '5px', color: '#ffffff', fontSize: '0.85rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>∞</div>;
    }
    if (b.includes('tecno')) {
      return <div style={{ width: '22px', height: '22px', background: '#0052D9', borderRadius: '5px', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T</div>;
    }
    if (b.includes('lava')) {
      return <div style={{ width: '22px', height: '22px', background: '#E11D48', borderRadius: '5px', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>L</div>;
    }
    if (b.includes('iqoo')) {
      return <div style={{ width: '22px', height: '22px', background: '#1e293b', border: '1.5px solid #FFDD00', borderRadius: '5px', color: '#FFDD00', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Q</div>;
    }
    if (b.includes('pixel') || b.includes('google')) {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.83-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      );
    }
    if (b.includes('nokia') || b.includes('hmd')) {
      return <div style={{ width: '22px', height: '22px', background: '#124191', borderRadius: '5px', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>N</div>;
    }
    if (b.includes('nothing')) {
      return <div style={{ width: '22px', height: '22px', background: '#090d16', border: '1px solid #ffffff', borderRadius: '50%', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>•</div>;
    }
    return <Smartphone size={18} color="var(--text-muted)" />;
  };

  const renderCameraCutout = () => {
    const lensStyle = {
      background: '#0a0d14',
      borderRadius: '50%',
      border: '2px solid #374151',
      boxShadow: 'inset 0 0 6px rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    };

    const lensGlass = {
      width: '42%',
      height: '42%',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8 70%)',
      opacity: 0.85,
      boxShadow: '0 0 6px #3b82f6'
    };

    switch (cameraLayout) {
      // 1. Apple iPhone Series
      case 'iphone-triple-pro':
        return (
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            width: '84px',
            height: '84px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '2px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.4)',
            zIndex: 10
          }}>
            {/* Top-Left Main 48MP Lens */}
            <div style={{ ...lensStyle, position: 'absolute', top: '9px', left: '9px', width: '27px', height: '27px', border: '2.5px solid #a1a1aa', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }}>
              <div style={{ ...lensGlass, width: '48%', height: '48%', background: 'radial-gradient(circle at 35% 35%, #93c5fd, #1e3a8a 65%, #090d16 100%)', boxShadow: '0 0 8px #3b82f6' }}></div>
            </div>
            
            {/* Bottom-Left Ultra-Wide 48MP Lens */}
            <div style={{ ...lensStyle, position: 'absolute', bottom: '9px', left: '9px', width: '27px', height: '27px', border: '2.5px solid #a1a1aa', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }}>
              <div style={{ ...lensGlass, width: '48%', height: '48%', background: 'radial-gradient(circle at 35% 35%, #93c5fd, #1e3a8a 65%, #090d16 100%)', boxShadow: '0 0 8px #3b82f6' }}></div>
            </div>
            
            {/* Center-Right Telephoto 5x Tetraprism Lens */}
            <div style={{ ...lensStyle, position: 'absolute', top: '28.5px', right: '9px', width: '27px', height: '27px', border: '2.5px solid #a1a1aa', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }}>
              <div style={{ ...lensGlass, width: '48%', height: '48%', background: 'radial-gradient(circle at 35% 35%, #93c5fd, #1e3a8a 65%, #090d16 100%)', boxShadow: '0 0 8px #3b82f6' }}></div>
            </div>
            
            {/* Authentic TrueTone Dual-LED Flash (Top Right) */}
            <div style={{
              position: 'absolute',
              top: '11px',
              right: '15px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef08a 50%, #f59e0b 100%)',
              border: '1.5px solid #ca8a04',
              boxShadow: '0 0 8px rgba(254, 240, 138, 0.8), inset 0 0 2px #fff'
            }}></div>
            
            {/* Authentic Dark LiDAR Depth Scanner (Bottom Right) */}
            <div style={{
              position: 'absolute',
              bottom: '11px',
              right: '15px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#090d16',
              border: '1.5px solid #3f3f46',
              boxShadow: 'inset 0 0 5px #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563eb', opacity: 0.8, boxShadow: '0 0 4px #3b82f6' }}></div>
            </div>
            
            {/* Rear Audio Mic Pinhole (Middle Center) */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#020617',
              border: '1px solid #334155'
            }}></div>
          </div>
        );

      case 'iphone-diagonal-dual':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '66px',
            height: '66px',
            background: 'rgba(21, 25, 34, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '18px',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10
          }}>
            <div style={{ ...lensStyle, position: 'absolute', top: '10px', left: '10px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, position: 'absolute', bottom: '10px', right: '10px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ position: 'absolute', top: '14px', right: '14px', width: '9px', height: '9px', borderRadius: '50%', background: '#ffedd5', border: '1.5px solid #d97706' }}></div>
          </div>
        );

      case 'iphone-vertical-dual':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '58px',
            height: '70px',
            background: 'rgba(21, 25, 34, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '18px',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10
          }}>
            <div style={{ ...lensStyle, position: 'absolute', top: '10px', left: '18px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, position: 'absolute', bottom: '10px', left: '18px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ position: 'absolute', top: '30px', right: '8px', width: '7px', height: '7px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
          </div>
        );

      case 'iphone-pill-dual':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '36px',
            height: '76px',
            background: '#0F1217',
            borderRadius: '18px',
            border: '1.5px solid #374151',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 0'
          }}>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
          </div>
        );

      case 'iphone-single-lens':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ ...lensStyle, width: '24px', height: '24px', border: '2.5px solid #4b5563' }}><div style={lensGlass}></div></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
          </div>
        );

      // 2. Samsung Galaxy Series
      case 'samsung-floating-five':
        return (
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            zIndex: 10,
            display: 'flex',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...lensStyle, width: '24px', height: '24px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '24px', height: '24px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '24px', height: '24px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffedd5', border: '1.5px solid #d97706' }}></div>
              <div style={{ ...lensStyle, width: '14px', height: '14px', border: '1.5px solid #4b5563' }}><div style={{ ...lensGlass, width: '30%', height: '30%' }}></div></div>
              <div style={{ ...lensStyle, width: '14px', height: '14px', border: '1.5px solid #4b5563' }}><div style={{ ...lensGlass, width: '30%', height: '30%' }}></div></div>
            </div>
          </div>
        );

      case 'samsung-floating-triple':
        return (
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ ...lensStyle, width: '22px', height: '22px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
          </div>
        );

      case 'samsung-contour-cut':
        return (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '44px',
            height: '110px',
            background: 'linear-gradient(135deg, #374151, #1f2937)',
            borderBottomRightRadius: '24px',
            borderRight: '2px solid #4b5563',
            borderBottom: '2px solid #4b5563',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '12px 0'
          }}>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
          </div>
        );

      // 3. OnePlus Series
      case 'oneplus-hasselblad-disk':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Frame Bridge */}
            <div style={{ width: '12px', height: '88px', background: 'linear-gradient(180deg, #4b5563, #1f2937)', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}></div>
            {/* Hasselblad Dial */}
            <div style={{
              width: '86px',
              height: '86px',
              background: 'radial-gradient(circle, #1e293b, #0f172a)',
              borderRadius: '50%',
              border: '2.5px solid #475569',
              boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-6px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '6px' }}>
                <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
                <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
                <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ffedd5', border: '1.5px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: '#fff' }}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'oneplus-twin-rings':
        return (
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ ...lensStyle, width: '32px', height: '32px', border: '2.5px solid #475569' }}><div style={{ ...lensGlass, width: '50%', height: '50%' }}></div></div>
            <div style={{ ...lensStyle, width: '32px', height: '32px', border: '2.5px solid #475569' }}><div style={{ ...lensGlass, width: '50%', height: '50%' }}></div></div>
          </div>
        );

      // 4. Vivo & iQOO Series
      case 'vivo-aura-light-square':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '54px',
            height: '90px',
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '16px',
            border: '1.5px solid rgba(255,255,255,0.1)',
            zIndex: 10,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ ...lensStyle, width: '16px', height: '16px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '16px', height: '16px' }}><div style={lensGlass}></div></div>
            </div>
            {/* Aura Light Square Ring */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              border: '2.5px solid #38bdf8',
              boxShadow: '0 0 10px #0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '80%', height: '80%', borderRadius: '6px', background: '#e0f2fe', opacity: 0.9 }}></div>
            </div>
          </div>
        );

      case 'vivo-zeiss-center-circle':
        return (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '90px',
            background: 'radial-gradient(circle, #0f172a, #020617)',
            borderRadius: '50%',
            border: '3px solid #334155',
            boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            </div>
          </div>
        );

      case 'iqoo-porthole-rect':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '64px',
            height: '64px',
            background: '#090d16',
            borderRadius: '18px',
            border: '2px solid #334155',
            zIndex: 10,
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
          }}>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706', margin: 'auto' }}></div>
          </div>
        );

      // 5. Google Pixel Series
      case 'pixel-visor-triple':
        return (
          <div style={{
            position: 'absolute',
            top: '36px',
            left: 0,
            width: '100%',
            height: '46px',
            background: 'linear-gradient(180deg, #334155, #1e293b)',
            borderTop: '2px solid #64748b',
            borderBottom: '2px solid #64748b',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px'
          }}>
            <div style={{
              width: '92px',
              height: '26px',
              background: '#000',
              borderRadius: '14px',
              border: '1.5px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 6px'
            }}>
              <div style={{ ...lensStyle, width: '15px', height: '15px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '15px', height: '15px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '15px', height: '15px' }}><div style={lensGlass}></div></div>
            </div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #f97316' }}></div>
          </div>
        );

      case 'pixel-visor-dual':
        return (
          <div style={{
            position: 'absolute',
            top: '36px',
            left: 0,
            width: '100%',
            height: '44px',
            background: 'linear-gradient(180deg, #334155, #1e293b)',
            borderTop: '2px solid #64748b',
            borderBottom: '2px solid #64748b',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px'
          }}>
            <div style={{
              width: '68px',
              height: '24px',
              background: '#000',
              borderRadius: '12px',
              border: '1.5px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 6px'
            }}>
              <div style={{ ...lensStyle, width: '14px', height: '14px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '14px', height: '14px' }}><div style={lensGlass}></div></div>
            </div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #f97316' }}></div>
          </div>
        );

      // 6. Xiaomi & POCO Series
      case 'xiaomi-leica-square':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '70px',
            height: '70px',
            background: '#090d16',
            borderRadius: '16px',
            border: '2px solid #334155',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
            padding: '6px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
          }}>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706', margin: 'auto' }}></div>
          </div>
        );

      case 'poco-visor-header':
        return (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '84px',
            background: '#090d16',
            borderBottom: '2px solid #334155',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 20px'
          }}>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
          </div>
        );

      // 7. Realme & Oppo Series
      case 'realme-watch-dial':
        return (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '88px',
            height: '88px',
            background: 'radial-gradient(circle, #1e293b, #090d16)',
            borderRadius: '50%',
            border: '3px solid #eab308',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '6px' }}>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706', margin: 'auto' }}></div>
            </div>
          </div>
        );

      case 'oppo-oval-pill':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '52px',
            height: '94px',
            background: 'linear-gradient(180deg, #1e293b, #090d16)',
            borderRadius: '26px',
            border: '2px solid #475569',
            zIndex: 10,
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around'
          }}>
            <div style={{ ...lensStyle, width: '28px', height: '28px', border: '2px solid #e2e8f0' }}><div style={lensGlass}></div></div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ ...lensStyle, width: '12px', height: '12px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '12px', height: '12px' }}><div style={lensGlass}></div></div>
            </div>
          </div>
        );

      // 8. Nothing Phone Series
      case 'nothing-glyph-dual':
        return (
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Dual Lens Ring */}
            <div style={{
              padding: '6px',
              borderRadius: '20px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 0 12px rgba(255,255,255,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#090d16'
            }}>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            </div>
          </div>
        );

      case 'nothing-center-eyes':
        return (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '74px',
            height: '44px',
            background: '#090d16',
            borderRadius: '22px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 0 12px rgba(255,255,255,0.3)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px'
          }}>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
          </div>
        );

      // 9. Budget / Basic Smartphone Layouts
      case 'realme-matrix-triple':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '70px',
            height: '70px',
            background: 'rgba(21, 25, 34, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10
          }}>
            <div style={{ ...lensStyle, position: 'absolute', top: '10px', left: '10px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, position: 'absolute', bottom: '10px', left: '10px', width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, position: 'absolute', top: '24px', right: '10px', width: '20px', height: '20px', border: '1.5px solid #d97706', background: '#ffedd5' }}>
              <div style={{ width: '50%', height: '50%', borderRadius: '50%', background: '#fff' }}></div>
            </div>
          </div>
        );

      case 'moto-raised-square':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '58px',
            height: '58px',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: '18px',
            border: '2px solid #475569',
            boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px'
          }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
            </div>
            <div style={{ ...lensStyle, width: '20px', height: '20px' }}><div style={lensGlass}></div></div>
          </div>
        );

      case 'samsung-dual-drop':
        return (
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ ...lensStyle, width: '22px', height: '22px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px', border: '2px solid #6b7280' }}><div style={lensGlass}></div></div>
          </div>
        );

      case 'infinix-flash-ring':
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '74px',
            height: '74px',
            background: '#090d16',
            borderRadius: '18px',
            border: '2px solid #334155',
            boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
            zIndex: 10,
            padding: '6px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
          }}>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '22px', height: '22px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #38bdf8', boxShadow: '0 0 8px #0284c7', background: '#e0f2fe', margin: 'auto' }}></div>
          </div>
        );

      case 'lava-agni-circle':
        return (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '86px',
            height: '86px',
            background: 'radial-gradient(circle, #1e293b, #0f172a)',
            borderRadius: '50%',
            border: '2.5px solid #64748b',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706', margin: 'auto' }}></div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '36px',
            height: '76px',
            background: '#0F1217',
            borderRadius: '16px',
            border: '1.5px solid #2D333F',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 0'
          }}>
            <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
            <div style={{ ...lensStyle, width: '18px', height: '18px' }}><div style={lensGlass}></div></div>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffedd5', border: '1px solid #d97706' }}></div>
          </div>
        );
    }
  };

  return (
    <div 
      className="cart-drawer-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10008,
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        padding: 0,
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div 
        className="customizer-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          background: 'var(--bg-card)',
          borderRadius: '0px',
          border: 'none',
          boxShadow: 'none',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Navigation Bar */}
        <header className="modal-header-responsive" style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div className="modal-header-logo-badge" style={{ 
              background: '#FF5500', 
              padding: '8px', 
              borderRadius: '10px', 
              display: 'flex', 
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Smartphone className="modal-header-icon" size={20} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 className="modal-header-title" style={{ 
                margin: 0, 
                fontSize: '1rem', 
                fontWeight: '800', 
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                CUSTOM MOBILE BACK COVER STUDIO
              </h2>
              <span className="modal-header-subtitle" style={{ 
                fontSize: '0.74rem', 
                color: 'var(--text-muted)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Design your personalized phone case
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="modal-header-close-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF5500',
              color: '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.82rem',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} /> <span className="close-btn-label">Close</span>
          </button>
        </header>

        {/* Main Studio Body */}
        <div style={{
          padding: '24px 20px',
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>

        {/* Customization Configuration Controls */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '30px 20px',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: '800' }}>
            1. Upload Photo &amp; Select Specifications
          </h3>

          <form onSubmit={handleAddToCartSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Photo Upload Input */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Image size={15} /> Upload Photo or Document (HD Image / PDF / DOC / PSD / AI)
              </label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,application/pdf,.pdf,.doc,.docx,.psd,.ai"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px dashed #FF5500',
                  background: 'var(--orange-light)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
              {uploadedFileInfo && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>📄 {uploadedFileInfo.name} ({uploadedFileInfo.size})</span>
                  <span style={{ color: '#22c55e', fontWeight: '800', flexShrink: 0 }}>Ready HD</span>
                </div>
              )}
            </div>
               {/* Collapsible Smartphone Company Selector */}
            <div>
              <div 
                onClick={() => setIsBrandListOpen(!isBrandListOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 14px',
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: isBrandListOpen ? '14px 14px 0 0' : '14px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                  <Smartphone size={16} color="#FF5500" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Company:</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FF5500', background: 'var(--orange-light)', padding: '3px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderBrandLogo(selectedBrand)}
                    </div>
                    {selectedBrand}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF5500', fontWeight: 'bold', fontSize: '0.78rem', flexShrink: 0 }}>
                  <span>{isBrandListOpen ? 'Close ▴' : 'Change Company ▾'}</span>
                </div>
              </div>

              {isBrandListOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '10px',
                  background: 'var(--bg-input)',
                  borderRadius: '0 0 14px 14px',
                  border: '1.5px solid var(--border-color)',
                  borderTop: 'none',
                  boxSizing: 'border-box'
                }}>
                  {PHONE_BRANDS.map(bObj => {
                    const isSelected = selectedBrand === bObj.name || selectedBrand === bObj.id;
                    return (
                      <button
                        key={bObj.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(bObj.name);
                          setIsBrandListOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #FF5500' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--orange-light)' : 'var(--bg-card)',
                          color: isSelected ? '#FF5500' : 'var(--text-primary)',
                          fontWeight: isSelected ? 'bold' : '600',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 4px 12px rgba(255,85,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderBrandLogo(bObj.name)}
                          </div>
                          <span>{bObj.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 size={16} color="#FF5500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual Smartphone Model Input */}
            <div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={15} /> Enter Your Phone Model
                </label>
              </div>

              {/* Manual Text Input Field */}
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#FF5500' }} />
                <input
                  type="text"
                  required
                  placeholder={`Type your ${selectedBrand} model (e.g. iPhone 15 Pro, S24 Ultra, Vivo V30...)`}
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Case Type: Full 3D or Soft Back */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Shield size={15} /> Case Coverage &amp; Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setCaseType('Full 3D Hard Case (Sides + Back Print)')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: caseType.includes('Full 3D') ? '2px solid #FF5500' : '1px solid var(--border-color)',
                    background: caseType.includes('Full 3D') ? 'var(--orange-light)' : 'var(--bg-input)',
                    color: caseType.includes('Full 3D') ? '#FF5500' : 'var(--text-primary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Full 3D Print (Sides &amp; Back)
                </button>

                <button 
                  type="button"
                  onClick={() => setCaseType('Soft Silicone TPU Transparent Back')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: caseType.includes('Silicone') ? '2px solid #FF5500' : '1px solid var(--border-color)',
                    background: caseType.includes('Silicone') ? 'var(--orange-light)' : 'var(--bg-input)',
                    color: caseType.includes('Silicone') ? '#FF5500' : 'var(--text-primary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Back Print Only (Clear TPU)
                </button>
              </div>
            </div>

            {/* Case Finish */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={15} /> Surface Finish
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="finish" checked={caseFinish === 'Matte Finish'} onChange={() => setCaseFinish('Matte Finish')} /> Matte Finish (Anti-Fingerprint)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="finish" checked={caseFinish === 'Glossy Finish'} onChange={() => setCaseFinish('Glossy Finish')} /> Glossy Finish (Vibrant Shine)
                </label>
              </div>
            </div>

            {/* Remarks / Special Instructions */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <MessageSquare size={15} /> Remarks / Special Instructions (Optional)
              </label>
              <input 
                type="text" 
                placeholder="Enter any remarks or special instructions (optional)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Custom Cover Price:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FF5500' }}>₹399 <s style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>₹499</s></span>
              </div>

              <button 
                type="submit" 
                className="btn btn-orange"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  justifyContent: 'center'
                }}
              >
                <ShoppingBag size={18} /> ADD CUSTOM BACK COVER TO CART (₹399)
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
);
}
