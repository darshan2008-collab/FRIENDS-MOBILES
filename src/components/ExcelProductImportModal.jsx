import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, 
  Search, Sliders, Check, RefreshCw, Eye, ArrowRight, Layers, Tag, HelpCircle
} from 'lucide-react';
import { 
  parseExcelProducts, 
  downloadSampleExcelTemplate, 
  STANDARD_CATEGORIES, 
  getDefaultImageForCategory 
} from '../utils/excelProductParser';

const CATEGORY_ICONS = {
  'Mobile Phones': '📱',
  'Chargers & Cables': '⚡',
  'Earphones': '🎧',
  'Smartwatches': '⌚',
  'Power Banks': '🔋',
  'Back Covers': '🛡️',
  'Photo Frames': '🖼️',
  'Screen Protectors': '✨',
  'OTG & Adapters': '🔌',
  'Speakers': '🔊',
  'Accessories': '📦'
};

const CATEGORY_COLORS = {
  'Mobile Phones': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
  'Chargers & Cables': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  'Earphones': { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' },
  'Smartwatches': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  'Power Banks': { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.35)' },
  'Back Covers': { bg: 'rgba(255, 85, 0, 0.15)', text: '#ff7733', border: 'rgba(255, 85, 0, 0.35)' },
  'Photo Frames': { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.35)' },
  'Screen Protectors': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)' },
  'OTG & Adapters': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.35)' },
  'Speakers': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)' },
  'Accessories': { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.35)' }
};

export default function ExcelProductImportModal({
  isOpen,
  onClose,
  onImportProducts,
  addToast,
  existingCategories = []
}) {
  const [file, setFile] = useState(null);
  const [fileBuffer, setFileBuffer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [categoryOverride, setCategoryOverride] = useState('AUTO');
  const [customColumnMap, setCustomColumnMap] = useState({});
  const [showMappingSettings, setShowMappingSettings] = useState(false);
  const [searchPreview, setSearchPreview] = useState('');
  const [previewCategoryFilter, setPreviewCategoryFilter] = useState('ALL');
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState('');

  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileBuffer(null);
      setParsedData(null);
      setCustomColumnMap({});
      setShowMappingSettings(false);
      setSearchPreview('');
      setPreviewCategoryFilter('ALL');
      setParseError('');
      setIsImporting(false);
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Process file buffer with current options
  const processBuffer = (buffer, options = {}) => {
    setIsParsing(true);
    setParseError('');
    try {
      const result = parseExcelProducts(buffer, {
        defaultCategoryOverride: options.categoryOverride !== undefined ? options.categoryOverride : categoryOverride,
        customColumnMap: options.customColumnMap || customColumnMap,
        sheetIndex: options.sheetIndex !== undefined ? options.sheetIndex : selectedSheetIndex
      });
      setParsedData(result);
    } catch (err) {
      console.error('Excel parsing error:', err);
      setParseError(err.message || 'Failed to parse Excel file');
      if (addToast) addToast(`Failed to parse Excel file: ${err.message}`, '⚠️');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle file input / drag drop
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setParseError('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      if (addToast) addToast('Invalid file format. Please upload .xlsx, .xls, or .csv', '⚠️');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseError('');
    setCustomColumnMap({});

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      setFileBuffer(buffer);
      processBuffer(buffer, { categoryOverride: 'AUTO', customColumnMap: {}, sheetIndex: 0 });
    };
    reader.onerror = () => {
      setIsParsing(false);
      setParseError('Error reading uploaded file from disk.');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleCategoryOverrideChange = (newCat) => {
    setCategoryOverride(newCat);
    if (fileBuffer) {
      processBuffer(fileBuffer, { categoryOverride: newCat });
    }
  };

  const handleSheetChange = (sheetIdx) => {
    setSelectedSheetIndex(sheetIdx);
    if (fileBuffer) {
      processBuffer(fileBuffer, { sheetIndex: sheetIdx });
    }
  };

  const handleColumnMappingChange = (colIdx, newField) => {
    const updatedMap = { ...customColumnMap, [colIdx]: newField };
    setCustomColumnMap(updatedMap);
    if (fileBuffer) {
      processBuffer(fileBuffer, { customColumnMap: updatedMap });
    }
  };

  const handleDownloadSample = () => {
    try {
      downloadSampleExcelTemplate();
      if (addToast) addToast('Sample Excel template downloaded successfully!', '📥');
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Failed to download template', '⚠️');
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData || !parsedData.parsedProducts || parsedData.parsedProducts.length === 0) {
      if (addToast) addToast('No valid products to import', '⚠️');
      return;
    }

    setIsImporting(true);
    try {
      if (onImportProducts) {
        await onImportProducts(parsedData.parsedProducts);
      }
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
      if (addToast) addToast('Import failed. Please check catalog.', '⚠️');
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateProductCategory = (prodIndex, newCat) => {
    if (!parsedData || !parsedData.parsedProducts) return;
    const updated = [...parsedData.parsedProducts];
    if (updated[prodIndex]) {
      updated[prodIndex] = {
        ...updated[prodIndex],
        category: newCat,
        img: updated[prodIndex].img && !updated[prodIndex].img.startsWith('http') 
          ? getDefaultImageForCategory(newCat) 
          : updated[prodIndex].img,
        fallback: updated[prodIndex].fallback && !updated[prodIndex].fallback.startsWith('http') 
          ? getDefaultImageForCategory(newCat) 
          : updated[prodIndex].fallback
      };
      setParsedData({
        ...parsedData,
        parsedProducts: updated
      });
      if (addToast) addToast(`Category updated to "${newCat}" for "${updated[prodIndex].title}"`, 'info');
    }
  };

  // Group category counts for quick inspection
  const categoryCounts = (parsedData?.parsedProducts || []).reduce((acc, p) => {
    const c = p.category || 'Accessories';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  // Filter preview products based on search & category filter
  const previewProducts = (parsedData?.parsedProducts || [])
    .map((p, originalIndex) => ({ ...p, originalIndex }))
    .filter(p => {
      if (previewCategoryFilter !== 'ALL' && p.category !== previewCategoryFilter) {
        return false;
      }
      if (!searchPreview.trim()) return true;
      const q = searchPreview.toLowerCase();
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    });

  const availableCategories = Array.from(new Set([...STANDARD_CATEGORIES, ...existingCategories]));

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10005,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'var(--bg-card, #1e1e24)',
        border: '1px solid var(--border-color, #333)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        color: 'var(--text-primary, #ffffff)',
        animation: 'modalPop 0.25s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color, #333)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-modal-header, rgba(255, 255, 255, 0.03))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              color: '#ffffff'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                Bulk Excel / CSV Product Import
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                Upload supplier spreadsheets. Auto-detects product names, prices, categories &amp; images.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadSample}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Download official sample Excel sheet"
            >
              <Download size={14} /> Sample Template (.xlsx)
            </button>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--border-color, #333)',
                background: 'var(--bg-input, rgba(255, 255, 255, 0.05))',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>

          {/* Upload Dropzone (shown when no file or option to re-upload) */}
          {!parsedData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#10b981' : 'var(--border-color, #444)'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: isDragging ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-input, rgba(255, 255, 255, 0.02))',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Upload size={28} />
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                  {isParsing ? 'Processing Excel File...' : 'Choose or Drag & Drop Excel / CSV File'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                  Supports <b>.xlsx</b>, <b>.xls</b>, and <b>.csv</b> formats from any distributor or warehouse.
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.74rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '700'
              }}>
                <CheckCircle2 size={13} /> Any column names &amp; formats automatically recognized
              </div>
            </div>
          )}

          {/* Error Message */}
          {parseError && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed File Dashboard */}
          {parsedData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* File Info & Quick Stats Bar */}
              <div style={{
                background: 'var(--bg-input, rgba(255, 255, 255, 0.03))',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.8rem'
                  }}>
                    XLS
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '0.92rem', display: 'block' }}>
                      {file?.name || 'Uploaded File'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : ''} • Header detected at row {parsedData.headerRowIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Sheet Selector (if multi-sheet) */}
                {parsedData.sheetNames && parsedData.sheetNames.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                      Sheet:
                    </label>
                    <select
                      value={selectedSheetIndex}
                      onChange={(e) => handleSheetChange(parseInt(e.target.value))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #444)',
                        background: 'var(--bg-card, #222)',
                        color: 'var(--text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    >
                      {parsedData.sheetNames.map((sName, sIdx) => (
                        <option key={sIdx} value={sIdx}>{sName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={14} /> {parsedData.validProductsCount} Products Ready
                  </div>

                  <button
                    onClick={() => {
                      setParsedData(null);
                      setFile(null);
                      setFileBuffer(null);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #444)',
                      background: 'none',
                      color: 'var(--text-muted, #94a3b8)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Import Settings Card: Category Strategy & Column Adjustments */}
              <div style={{
                background: 'var(--bg-input, rgba(255, 255, 255, 0.02))',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {/* Category Assignment Strategy */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                    <Tag size={16} color="#FF5500" />
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', display: 'block' }}>
                        Category Assignment Strategy
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        How product categories should be mapped on user page
                      </span>
                    </div>

                    <select
                      value={categoryOverride}
                      onChange={(e) => handleCategoryOverrideChange(e.target.value)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #444)',
                        background: 'var(--bg-card, #222)',
                        color: 'var(--text-primary, #fff)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        marginLeft: 'auto'
                      }}
                    >
                      <option value="AUTO">✨ Auto-Detect from Sheet / Product Title (Recommended)</option>
                      <optgroup label="Or Force All Items to Specific Category:">
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Toggle Column Mapping Details */}
                  <button
                    onClick={() => setShowMappingSettings(!showMappingSettings)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #444)',
                      background: showMappingSettings ? 'rgba(255, 85, 0, 0.15)' : 'none',
                      color: showMappingSettings ? '#FF5500' : 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Sliders size={14} /> {showMappingSettings ? 'Hide Column Mappings' : 'Review / Adjust Column Mappings'}
                  </button>
                </div>

                {/* Column Mapping Grid (Collapsible) */}
                {showMappingSettings && (
                  <div style={{
                    borderTop: '1px solid var(--border-color, #333)',
                    paddingTop: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '10px'
                  }}>
                    {parsedData.detectedHeaders.map((col) => {
                      const currentField = parsedData.columnMapping[col.index] || '';
                      return (
                        <div key={col.index} style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'var(--bg-card, rgba(0,0,0,0.2))',
                          border: '1px solid var(--border-color, #444)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Excel Header: <b>"{col.rawName}"</b>
                          </span>
                          <select
                            value={currentField}
                            onChange={(e) => handleColumnMappingChange(col.index, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #555)',
                              background: 'var(--bg-input, #111)',
                              color: currentField ? '#10b981' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: '700'
                            }}
                          >
                            <option value="">(Ignore Column)</option>
                            <option value="title">📦 Product Title (Required)</option>
                            <option value="category">🏷️ Category</option>
                            <option value="price">💰 Selling Price (₹)</option>
                            <option value="originalPrice">🏷️ Original MRP (₹)</option>
                            <option value="discount">🔥 Discount %</option>
                            <option value="inStock">📦 In Stock (Status/Qty)</option>
                            <option value="brand">🏢 Brand</option>
                            <option value="img">🖼️ Image URL</option>
                            <option value="description">📝 Description</option>
                            <option value="tamilTitle">🇮🇳 Tamil Title</option>
                            <option value="tamilDesc">🇮🇳 Tamil Description</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live Preview Section */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} color="#10b981" />
                    <span style={{ fontSize: '0.86rem', fontWeight: '800' }}>
                      Live Catalog Preview ({previewProducts.length} items)
                    </span>
                  </div>

                  {/* Search within preview */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-input, rgba(255,255,255,0.05))',
                    border: '1px solid var(--border-color, #444)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    width: '240px'
                  }}>
                    <Search size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Filter preview items..."
                      value={searchPreview}
                      onChange={(e) => setSearchPreview(e.target.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary, #fff)',
                        fontSize: '0.78rem',
                        outline: 'none',
                        width: '100%'
                      }}
                    />
                    {searchPreview && (
                      <button 
                        onClick={() => setSearchPreview('')} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Pills Bar - Click to verify how products settled */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin'
                }}>
                  <button
                    type="button"
                    onClick={() => setPreviewCategoryFilter('ALL')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: previewCategoryFilter === 'ALL' ? '1.5px solid #FF5500' : '1px solid var(--border-color, #444)',
                      background: previewCategoryFilter === 'ALL' ? 'rgba(255, 85, 0, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: previewCategoryFilter === 'ALL' ? '#FF5500' : 'var(--text-muted, #94a3b8)',
                      fontWeight: '800',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>All Products</span>
                    <span style={{
                      background: previewCategoryFilter === 'ALL' ? '#FF5500' : 'rgba(255,255,255,0.1)',
                      color: previewCategoryFilter === 'ALL' ? '#fff' : 'inherit',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: '800'
                    }}>
                      {parsedData?.parsedProducts?.length || 0}
                    </span>
                  </button>

                  {Object.entries(categoryCounts).map(([catName, count]) => {
                    const isSelected = previewCategoryFilter === catName;
                    const catStyle = CATEGORY_COLORS[catName] || CATEGORY_COLORS['Accessories'];
                    const icon = CATEGORY_ICONS[catName] || '🏷️';
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setPreviewCategoryFilter(isSelected ? 'ALL' : catName)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: isSelected ? `1.5px solid ${catStyle.text}` : `1px solid ${catStyle.border}`,
                          background: isSelected ? catStyle.bg.replace('0.15', '0.3') : catStyle.bg,
                          color: catStyle.text,
                          fontWeight: '800',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? `0 2px 8px ${catStyle.border}` : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{icon} {catName}</span>
                        <span style={{
                          background: isSelected ? catStyle.text : 'rgba(0,0,0,0.25)',
                          color: isSelected ? '#000' : catStyle.text,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '0.68rem',
                          fontWeight: '900'
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Preview Table */}
                <div style={{
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '12px',
                  overflowX: 'auto',
                  maxHeight: '320px',
                  background: 'var(--bg-card, #1e1e24)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-modal-header, rgba(255, 255, 255, 0.04))', borderBottom: '1px solid var(--border-color, #333)' }}>
                        <th style={{ padding: '10px 12px', width: '40px' }}>#</th>
                        <th style={{ padding: '10px 12px', width: '50px' }}>Image</th>
                        <th style={{ padding: '10px 12px' }}>Product Title</th>
                        <th style={{ padding: '10px 12px' }}>Category</th>
                        <th style={{ padding: '10px 12px' }}>Pricing &amp; Discount</th>
                        <th style={{ padding: '10px 12px' }}>Stock</th>
                        <th style={{ padding: '10px 12px' }}>Brand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewProducts.slice(0, 30).map((prod, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <img
                              src={prod.img || getDefaultImageForCategory(prod.category)}
                              alt={prod.title}
                              onError={(e) => {
                                e.target.src = getDefaultImageForCategory(prod.category);
                              }}
                              style={{
                                width: '36px',
                                height: '36px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #444)',
                                background: '#111'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 12px', maxWidth: '240px' }}>
                            <div style={{ fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prod.title}
                            </div>
                            {prod.tamilTitle && prod.tamilTitle !== prod.title && (
                              <div style={{ fontSize: '0.7rem', color: '#FF5500', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {prod.tamilTitle}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px', minWidth: '160px' }}>
                            {(() => {
                              const catStyle = CATEGORY_COLORS[prod.category] || CATEGORY_COLORS['Accessories'];
                              const icon = CATEGORY_ICONS[prod.category] || '🏷️';
                              return (
                                <select
                                  value={prod.category}
                                  onChange={(e) => handleUpdateProductCategory(prod.originalIndex, e.target.value)}
                                  title="Click to change category for this product"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${catStyle.border}`,
                                    background: catStyle.bg,
                                    color: catStyle.text,
                                    fontWeight: '800',
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    maxWidth: '180px'
                                  }}
                                >
                                  {availableCategories.map((c) => (
                                    <option key={c} value={c} style={{ background: '#1e1e24', color: '#ffffff' }}>
                                      {CATEGORY_ICONS[c] || '🏷️'} {c}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <b style={{ color: '#10b981', fontSize: '0.82rem' }}>₹{prod.price}</b>
                              {prod.originalPrice > prod.price && (
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                  ₹{prod.originalPrice}
                                </span>
                              )}
                              {prod.discount && prod.discount !== '0%' && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#f87171',
                                  fontWeight: '800'
                                }}>
                                  {prod.discount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: prod.inStock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: prod.inStock ? '#10b981' : '#f87171',
                              fontWeight: '800',
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap'
                            }}>
                              {prod.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                            {prod.brand || 'FRIENDS MOBILE'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {previewProducts.length > 30 && (
                    <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', background: 'var(--bg-modal-header)' }}>
                      + {previewProducts.length - 30} more products will be imported into store catalog.
                    </div>
                  )}
                </div>
              </div>

              {/* Warnings Banner if any */}
              {parsedData.warnings && parsedData.warnings.length > 0 && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  fontSize: '0.75rem',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <b>Notice during import:</b>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {parsedData.warnings.slice(0, 3).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color, #333)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-modal-header, rgba(255, 255, 255, 0.03))'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #444)',
              background: 'none',
              color: 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          {parsedData && (
            <button
              onClick={handleConfirmImport}
              disabled={isImporting || !parsedData.validProductsCount}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '10px',
                border: 'none',
                background: isImporting 
                  ? '#6b7280' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: isImporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isImporting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Importing to Store...
                </>
              ) : (
                <>
                  <Check size={16} /> Confirm &amp; Import {parsedData.validProductsCount} Products
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
