import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, ShoppingBag, Frame, Palette, RotateCw, Shield } from 'lucide-react';

export default function CustomPhotoFrameModal({ isOpen, onClose, onAddToCart, addToast }) {
  const [frameSize, setFrameSize] = useState('6 x 8 inches'); // 4x6 | 6x8 | 8x10 | 12x18 | 18x24
  const [frameColor, setFrameColor] = useState('Classic Walnut Wood'); // 'Classic Walnut Wood' | 'Matte Black' | 'Pure White' | 'Royal Gold'
  const [orientation, setOrientation] = useState('Portrait (Vertical)'); // 'Portrait (Vertical)' | 'Landscape (Horizontal)'
  const [glassType, setGlassType] = useState('Anti-Glare Premium Glass'); // 'Anti-Glare Premium Glass' | 'Crystal Acrylic'
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  if (!isOpen) return null;

  const frameSizes = [
    { label: '4 x 6 inches (Table Desk Frame)', price: 299 },
    { label: '6 x 8 inches (Standard Desk / Wall)', price: 449 },
    { label: '8 x 10 inches (Wall Frame)', price: 649 },
    { label: '12 x 18 inches (Gallery Wall Frame)', price: 999 },
    { label: '18 x 24 inches (Masterpiece Wall Frame)', price: 1499 }
  ];

  const getSelectedPrice = () => {
    const found = frameSizes.find(s => s.label.includes(frameSize.split(' ')[0]));
    return found ? found.price : 449;
  };

  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

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
        if (addToast) addToast(isDoc ? 'PDF/Document uploaded for frame customization!' : 'Photo uploaded in HD quality!', '🖼️');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCartSubmit = (e) => {
    e.preventDefault();
    const finalPrice = getSelectedPrice();

    const customFrameProduct = {
      id: `custom-frame-${Date.now()}`,
      title: `Custom Photo Frame (${frameSize.split(' ')[0]} ${frameSize.split(' ')[1]} ${frameSize.split(' ')[2]})`,
      price: finalPrice,
      originalPrice: Math.round(finalPrice * 1.3),
      category: 'Photo Frames',
      img: uploadedPhoto && !uploadedFileInfo?.isDoc ? uploadedPhoto : 'images/banner_photoframe.png',
      discount: '-25%',
      customizationDetails: {
        size: frameSize,
        color: frameColor,
        orientation,
        glass: glassType,
        userPhoto: uploadedPhoto ? (uploadedFileInfo?.isDoc ? `Document (${uploadedFileInfo.name})` : 'Custom Photo Included') : 'Default Design',
        uploadedFile: uploadedPhoto,
        fileName: uploadedFileInfo ? uploadedFileInfo.name : `custom_frame_${frameSize}.png`,
        fileType: uploadedFileInfo ? uploadedFileInfo.type : 'image/png',
        fileSize: uploadedFileInfo ? uploadedFileInfo.size : '',
        isDocument: uploadedFileInfo ? uploadedFileInfo.isDoc : false
      }
    };

    onAddToCart(customFrameProduct);
    if (addToast) addToast(`Customized Photo Frame (${frameSize}) added to cart!`, '✓');
    onClose();
  };

  const getFrameColorHex = () => {
    if (frameColor.includes('Black')) return '#1B1D22';
    if (frameColor.includes('White')) return '#F8FAFC';
    if (frameColor.includes('Gold')) return '#D4AF37';
    return '#5C3A21'; // Walnut Wood
  };

  return (
    <div className="full-page-customizer-portal" style={{
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
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header */}
      <header className="modal-header-responsive" style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 16px',
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
            <ImageIcon className="modal-header-icon" size={20} color="#ffffff" />
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
              CUSTOM PHOTO FRAME STUDIO
            </h2>
            <span className="modal-header-subtitle" style={{ 
              fontSize: '0.74rem', 
              color: 'var(--text-muted)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Craft personalized photo frames
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

      {/* Main Studio Workspace */}
      <div className="customizer-studio-grid" style={{
        flex: 1,
        padding: '20px 14px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start',
        boxSizing: 'border-box'
      }}>
        
        {/* Left Side: Live Photo Frame Mockup Preview */}
        <div className="studio-preview-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#FF5500', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={15} /> LIVE PHOTO FRAME MOCKUP
          </span>

          {/* Wooden / Glass Outer Frame Container */}
          <div className="photo-frame-canvas" style={{
            position: 'relative',
            width: orientation.includes('Portrait') ? '260px' : '340px',
            maxWidth: '100%',
            height: orientation.includes('Portrait') ? '340px' : '260px',
            maxHeight: '340px',
            background: getFrameColorHex(),
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {/* Inner Mat Border */}
            <div style={{
              width: '100%',
              height: '100%',
              background: '#FFFFFF',
              borderRadius: '4px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {uploadedPhoto ? (
                <img 
                  src={uploadedPhoto} 
                  alt="Custom Photo Frame" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '2px',
                    pointerEvents: 'none'
                  }} 
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748B', padding: '10px' }}>
                  <Upload size={36} color="#FF5500" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 'bold', color: '#1E293B' }}>Upload Family / Memory Photo</p>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>All File Formats Supported</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1.1rem' }}>{frameColor}</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{frameSize} • {orientation}</span>
          </div>
        </div>

        {/* Right Side: Photo Frame Controls */}
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
            Configure Custom Photo Frame
          </h3>

          <form onSubmit={handleAddToCartSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* File Upload Input */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ImageIcon size={15} /> Upload Photo or Document for Frame (HD Image / PDF / DOC / PSD / AI)
              </label>
              <input 
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
                  fontSize: '0.88rem'
                }}
              />
              {uploadedFileInfo && (
                <div style={{ marginTop: '8px', padding: '6px 10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {uploadedFileInfo.name} ({uploadedFileInfo.size})</span>
                  <span style={{ color: '#22c55e', fontWeight: '800' }}>Ready HD</span>
                </div>
              )}
            </div>

            {/* Frame Size Selector */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Frame size={15} /> Select Frame Dimensions &amp; Size
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {frameSizes.map(sizeObj => (
                  <button 
                    type="button"
                    key={sizeObj.label}
                    onClick={() => setFrameSize(sizeObj.label)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: frameSize.includes(sizeObj.label.split(' ')[0]) ? '2px solid #FF5500' : '1px solid var(--border-color)',
                      background: frameSize.includes(sizeObj.label.split(' ')[0]) ? 'var(--orange-light)' : 'var(--bg-input)',
                      color: frameSize.includes(sizeObj.label.split(' ')[0]) ? '#FF5500' : 'var(--text-primary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{sizeObj.label}</span>
                    <span>₹{sizeObj.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Material / Color */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Palette size={15} /> Frame Wood &amp; Color Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['Classic Walnut Wood', 'Matte Black', 'Pure White', 'Royal Gold'].map(col => (
                  <button 
                    type="button"
                    key={col}
                    onClick={() => setFrameColor(col)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: frameColor === col ? '2px solid #FF5500' : '1px solid var(--border-color)',
                      background: frameColor === col ? 'var(--orange-light)' : 'var(--bg-input)',
                      color: frameColor === col ? '#FF5500' : 'var(--text-primary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Orientation */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <RotateCw size={15} /> Frame Orientation
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="orient" checked={orientation.includes('Portrait')} onChange={() => setOrientation('Portrait (Vertical)')} /> Portrait (Vertical)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="orient" checked={orientation.includes('Landscape')} onChange={() => setOrientation('Landscape (Horizontal)')} /> Landscape (Horizontal)
                </label>
              </div>
            </div>

            {/* Glass Protection */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Shield size={15} /> Front Glass Protection
              </label>
              <select 
                value={glassType} 
                onChange={(e) => setGlassType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              >
                <option value="Anti-Glare Premium Glass">Anti-Glare Premium Real Glass</option>
                <option value="Crystal Acrylic Shatterproof">Shatterproof Crystal Acrylic</option>
              </select>
            </div>

            {/* Add to Cart Submit */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Custom Frame Price:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FF5500' }}>₹{getSelectedPrice()}</span>
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
                <ShoppingBag size={18} /> ADD CUSTOM PHOTO FRAME TO CART (₹{getSelectedPrice()})
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
