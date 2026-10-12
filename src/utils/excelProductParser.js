import * as XLSX from 'xlsx';
import { autoTranslateToTamil } from '../data/translations.js';

// Standard Store Categories
export const STANDARD_CATEGORIES = [
  'Mobile Phones',
  'Chargers & Cables',
  'Earphones',
  'Smartwatches',
  'Power Banks',
  'Back Covers',
  'Photo Frames',
  'Screen Protectors',
  'OTG & Adapters',
  'Speakers',
  'Accessories'
];

// Curated Category Image Presets
export const CATEGORY_IMAGE_PRESETS = {
  'Mobile Phones': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
  'Chargers & Cables': 'images/prod_charger.png',
  'Earphones': 'images/prod_airdopes.png',
  'Smartwatches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
  'Power Banks': 'images/prod_powerbank.png',
  'Back Covers': 'images/prod_custom_cover.png',
  'Photo Frames': 'images/banner_photoframe.png',
  'Screen Protectors': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop',
  'OTG & Adapters': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop',
  'Speakers': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop',
  'Accessories': 'images/prod_airdopes.png'
};

// Column Synonyms mapping (handles all formats, case-insensitive, with/without spaces/underscores)
const COLUMN_SYNONYMS = {
  title: [
    'title', 'product_name', 'productname', 'product name', 'name', 'item', 'item_name', 
    'itemname', 'item name', 'model', 'model_name', 'model name', 'heading', 'product', 
    'prod_name', 'prod name', 'device', 'description title', 'பெயர்', 'பொருளின் பெயர்', 'பொருள்'
  ],
  category: [
    'category', 'cat', 'product_category', 'prod_category', 'product category', 
    'type', 'product_type', 'product type', 'department', 'dept', 'group', 
    'classification', 'section', 'வகை', 'பிரிவு', 'கேட்டகரி'
  ],
  price: [
    'price', 'selling_price', 'sellingprice', 'selling price', 'sale_price', 
    'saleprice', 'sale price', 'offer_price', 'offer price', 'deal_price', 
    'final_price', 'our_price', 'our price', 'rate', 'unit_price', 'cost', 
    'net_price', 'amount', 'விலை', 'விற்பனை விலை', 'நிகர விலை'
  ],
  originalPrice: [
    'original_price', 'originalprice', 'original price', 'mrp', 'list_price', 
    'listprice', 'list price', 'regular_price', 'regular price', 'market_price', 
    'market price', 'retail_price', 'retail price', 'old_price', 'old price', 
    'actual_price', 'actual price', 'base_price', 'அசல் விலை', 'அதிகபட்ச சில்லறை விலை'
  ],
  discount: [
    'discount', 'discount_pct', 'discount%', 'discount_percent', 'discount percentage', 
    'discount percent', 'offer%', 'off', 'concession', 'தள்ளுபடி'
  ],
  inStock: [
    'in_stock', 'instock', 'in stock', 'stock', 'qty', 'quantity', 'available', 
    'availability', 'inventory', 'status', 'is_in_stock', 'இருப்பு', 'கையிருப்பு'
  ],
  img: [
    'img', 'image', 'images', 'image_url', 'imageurl', 'image url', 'photo', 
    'picture', 'pic', 'photo_url', 'photourl', 'photo url', 'thumbnail', 'படம்', 'படங்கள்'
  ],
  description: [
    'description', 'desc', 'details', 'specification', 'specifications', 'specs', 
    'features', 'about', 'notes', 'summary', 'விளக்கம்', 'விவரம்'
  ],
  brand: [
    'brand', 'brand_name', 'brand name', 'make', 'company', 'manufacturer', 'vendor', 'பிராண்ட்'
  ],
  rating: [
    'rating', 'stars', 'score', 'மதிப்பீடு'
  ],
  reviews: [
    'reviews', 'review_count', 'review count', 'ratings_count', 'ratings count', 'மதிப்புரை'
  ],
  tamilTitle: [
    'tamil_title', 'tamil title', 'tamil_name', 'tamil name', 'tamil', 'தமிழ் பெயர்'
  ],
  tamilDesc: [
    'tamil_desc', 'tamil desc', 'tamil_description', 'tamil description', 'தமிழ் விவரம்'
  ]
};

/**
 * Normalizes text for header matching: removes punctuation, trims, lowercases
 */
function cleanHeaderString(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Infer or match canonical field from a raw column header string
 */
export function identifyColumnField(rawHeader) {
  if (!rawHeader) return null;
  const clean = cleanHeaderString(rawHeader);
  if (!clean) return null;

  // 1. Exact match against synonym dictionary
  for (const [canonicalField, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean === cleanHeaderString(syn)) {
        return canonicalField;
      }
    }
  }

  // 2. Specific keyword disambiguation (high priority order to prevent false positives)
  if (clean.includes('tamil') && (clean.includes('title') || clean.includes('name') || clean.includes('பெயர்'))) {
    return 'tamilTitle';
  }
  if (clean.includes('tamil') && (clean.includes('desc') || clean.includes('விவரம்'))) {
    return 'tamilDesc';
  }
  if (clean.includes('brand') || clean.includes('make') || clean.includes('vendor') || clean.includes('company') || clean.includes('manufacturer') || clean.includes('பிராண்ட்')) {
    return 'brand';
  }
  if (clean.includes('mrp') || clean.includes('original') || clean.includes('list price') || clean.includes('regular price') || clean.includes('retail price') || clean.includes('market price') || clean.includes('actual price') || clean.includes('base price') || clean.includes('old price') || clean.includes('அசல் விலை')) {
    return 'originalPrice';
  }
  if (clean.includes('discount') || clean.includes('offer %') || clean.includes('off %') || clean.includes('தள்ளுபடி')) {
    return 'discount';
  }
  if (clean.includes('stock') || clean.includes('qty') || clean.includes('quantity') || clean.includes('available') || clean.includes('availability') || clean.includes('inventory') || clean.includes('status') || clean.includes('இருப்பு')) {
    return 'inStock';
  }
  if (clean.includes('image') || clean.includes('photo') || clean.includes('picture') || clean.includes('pic') || clean.includes('thumbnail') || clean.includes('img') || clean.includes('படம்')) {
    return 'img';
  }
  if (clean.includes('category') || clean.includes('dept') || clean.includes('department') || clean.includes('type') || clean.includes('group') || clean.includes('section') || clean.includes('வகை') || clean.includes('பிரிவு')) {
    return 'category';
  }
  if (clean.includes('description') || clean.includes('desc') || clean.includes('specification') || clean.includes('specs') || clean.includes('features') || clean.includes('details') || clean.includes('விவரம்')) {
    return 'description';
  }
  if (clean.includes('rate') || clean.includes('selling') || clean.includes('sale price') || clean.includes('our price') || clean.includes('offer price') || clean.includes('price') || clean.includes('cost') || clean.includes('amount') || clean.includes('விலை')) {
    return 'price';
  }
  if (clean.includes('title') || clean.includes('product') || clean.includes('item') || clean.includes('model') || clean.includes('device') || clean.includes('heading') || clean.includes('name') || clean.includes('பெயர்')) {
    return 'title';
  }

  return null;
}

/**
 * Automatically locate header row in a 2D sheet array
 */
function findHeaderRowIndex(rows) {
  let bestRowIndex = 0;
  let highestScore = -1;

  const maxScanRows = Math.min(rows.length, 12);
  for (let r = 0; r < maxScanRows; r++) {
    const row = rows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    let score = 0;
    let hasTitle = false;
    let hasPrice = false;

    for (const cell of row) {
      if (cell === null || cell === undefined || String(cell).trim() === '') continue;
      const field = identifyColumnField(cell);
      if (field) {
        score += 2;
        if (field === 'title') { score += 4; hasTitle = true; }
        if (field === 'price' || field === 'originalPrice') { score += 3; hasPrice = true; }
        if (field === 'category') { score += 3; }
      }
    }

    if (hasTitle && hasPrice) score += 5;

    if (score > highestScore) {
      highestScore = score;
      bestRowIndex = r;
    }
  }

  return highestScore > 0 ? bestRowIndex : 0;
}

/**
 * Parse clean numeric currency / number values
 */
export function parseNumericValue(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Normalize category or infer from title
 */
export function normalizeCategory(rawCat, title = '') {
  const catClean = (rawCat || '').toString().trim().toLowerCase();
  const titleClean = (title || '').toString().trim().toLowerCase();

  // 1. Explicit Category matching
  if (catClean) {
    if (catClean.includes('phone') || catClean.includes('mobile') || catClean.includes('smartphone') || catClean.includes('cell')) {
      return 'Mobile Phones';
    }
    if (catClean.includes('charger') || catClean.includes('cable') || catClean.includes('adapter') || catClean.includes('wire') || catClean.includes('type c') || catClean.includes('type-c')) {
      return 'Chargers & Cables';
    }
    if (catClean.includes('earphone') || catClean.includes('earbud') || catClean.includes('airdope') || catClean.includes('airpod') || catClean.includes('headphone') || catClean.includes('neckband') || catClean.includes('tws') || catClean.includes('audio')) {
      return 'Earphones';
    }
    if (catClean.includes('watch') || catClean.includes('band')) {
      return 'Smartwatches';
    }
    if (catClean.includes('power') || catClean.includes('battery')) {
      return 'Power Banks';
    }
    if (catClean.includes('cover') || catClean.includes('case') || catClean.includes('pouch') || catClean.includes('skin')) {
      return 'Back Covers';
    }
    if (catClean.includes('frame') || catClean.includes('photo')) {
      return 'Photo Frames';
    }
    if (catClean.includes('glass') || catClean.includes('screen') || catClean.includes('guard') || catClean.includes('tempered') || catClean.includes('protector')) {
      return 'Screen Protectors';
    }
    if (catClean.includes('otg') || catClean.includes('hub') || catClean.includes('converter')) {
      return 'OTG & Adapters';
    }
    if (catClean.includes('speaker') || catClean.includes('soundbar') || catClean.includes('sound')) {
      return 'Speakers';
    }
    if (catClean.includes('accessori') || catClean.includes('gadget')) {
      return 'Accessories';
    }

    // Preserve custom category cleanly capitalized
    const words = catClean.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // 2. Infer Category from Product Title if category was blank
  if (titleClean) {
    if (titleClean.includes('iphone') || titleClean.includes('samsung galaxy') || titleClean.includes('oneplus') || 
        titleClean.includes('realme') || titleClean.includes('redmi') || titleClean.includes('vivo') || 
        titleClean.includes('oppo') || titleClean.includes('smartphone') || titleClean.includes('pixel') || 
        titleClean.includes('poco') || titleClean.includes('mobile 5g') || titleClean.includes('5g phone')) {
      return 'Mobile Phones';
    }
    if (titleClean.includes('charger') || titleClean.includes('cable') || titleClean.includes('type-c') || 
        titleClean.includes('type c') || titleClean.includes('lightning') || titleClean.includes('watt') || 
        titleClean.includes('20w') || titleClean.includes('25w') || titleClean.includes('33w') || 
        titleClean.includes('65w') || titleClean.includes('80w') || titleClean.includes('120w') || 
        titleClean.includes('fast charge') || titleClean.includes('power delivery') || titleClean.includes('pd charger')) {
      return 'Chargers & Cables';
    }
    if (titleClean.includes('earbuds') || titleClean.includes('airdopes') || titleClean.includes('airpods') || 
        titleClean.includes('neckband') || titleClean.includes('headphone') || titleClean.includes('earphone') || 
        titleClean.includes('tws') || titleClean.includes('bassheads') || titleClean.includes('anc')) {
      return 'Earphones';
    }
    if (titleClean.includes('smartwatch') || titleClean.includes('smart watch') || titleClean.includes('fitness band') || 
        titleClean.includes('colorfit') || titleClean.includes('fire-boltt') || titleClean.includes('wave call')) {
      return 'Smartwatches';
    }
    if (titleClean.includes('power bank') || titleClean.includes('powerbank') || titleClean.includes('mah') || 
        titleClean.includes('10000mah') || titleClean.includes('20000mah')) {
      return 'Power Banks';
    }
    if (titleClean.includes('back cover') || titleClean.includes('phone case') || titleClean.includes('matte case') || 
        titleClean.includes('silicone case') || titleClean.includes('smoke cover') || titleClean.includes('magnetic cover')) {
      return 'Back Covers';
    }
    if (titleClean.includes('photo frame') || titleClean.includes('acrylic frame') || titleClean.includes('wooden frame')) {
      return 'Photo Frames';
    }
    if (titleClean.includes('tempered glass') || titleClean.includes('screen guard') || titleClean.includes('screen protector') || 
        titleClean.includes('11d') || titleClean.includes('9d') || titleClean.includes('matte glass') || titleClean.includes('uv glass')) {
      return 'Screen Protectors';
    }
    if (titleClean.includes('otg') || titleClean.includes('type c to usb') || titleClean.includes('converter')) {
      return 'OTG & Adapters';
    }
    if (titleClean.includes('speaker') || titleClean.includes('soundbar') || titleClean.includes('party speaker')) {
      return 'Speakers';
    }
  }

  return 'Accessories';
}

/**
 * High-quality fallback image based on category
 */
export function getDefaultImageForCategory(cat) {
  const norm = normalizeCategory(cat);
  return CATEGORY_IMAGE_PRESETS[norm] || 'images/prod_airdopes.png';
}

/**
 * Parse an Excel/CSV file from ArrayBuffer / File
 * 
 * @param {ArrayBuffer|Uint8Array} fileBuffer
 * @param {Object} options - { defaultCategoryOverride: string, customColumnMap: Object, sheetIndex: number }
 */
export function parseExcelProducts(fileBuffer, options = {}) {
  const { defaultCategoryOverride, customColumnMap = {}, sheetIndex = 0 } = options;

  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'array' });
  } catch (err) {
    throw new Error(`Unable to read Excel file: ${err.message}`);
  }

  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Excel workbook contains no sheets');
  }

  const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  // Get raw rows
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length === 0) {
    throw new Error('Excel sheet is empty');
  }

  // 1. Detect header row
  const headerRowIdx = findHeaderRowIndex(rawRows);
  const headerRow = rawRows[headerRowIdx] || [];

  // 2. Build column mapping (column index -> canonical field)
  const columnMapping = {}; // colIdx -> canonical field name
  const detectedHeaders = []; // list of { index, rawName, detectedField }

  headerRow.forEach((cellVal, idx) => {
    const rawName = String(cellVal || '').trim();
    if (!rawName) return;

    // Check if user manually overrode this column
    const override = customColumnMap[idx] || customColumnMap[rawName];
    const detectedField = override || identifyColumnField(rawName);

    if (detectedField) {
      columnMapping[idx] = detectedField;
    }

    detectedHeaders.push({
      index: idx,
      rawName,
      detectedField: detectedField || null
    });
  });

  // Verify at least title column was found
  const mappedFields = Object.values(columnMapping);
  const hasTitleCol = mappedFields.includes('title');

  // If no title column was automatically found, fallback: use column 0 as title if it exists
  if (!hasTitleCol && headerRow.length > 0) {
    columnMapping[0] = 'title';
    if (detectedHeaders[0]) detectedHeaders[0].detectedField = 'title';
  }

  // 3. Process data rows
  const parsedProducts = [];
  const warnings = [];
  const dataRows = rawRows.slice(headerRowIdx + 1);

  dataRows.forEach((row, rowRelIdx) => {
    const rowNum = headerRowIdx + 1 + rowRelIdx + 1; // 1-based row number
    if (!Array.isArray(row) || row.length === 0) return;

    // Extract row data based on column mapping
    const rowObj = {};
    Object.entries(columnMapping).forEach(([colIdx, field]) => {
      const cellVal = row[parseInt(colIdx)];
      rowObj[field] = cellVal !== undefined ? cellVal : '';
    });

    // Check for title
    const rawTitle = (rowObj.title || '').toString().trim();
    if (!rawTitle) {
      // Empty row or row without title, skip
      return;
    }

    // Process Price and MRP
    let price = parseNumericValue(rowObj.price, 0);
    let originalPrice = parseNumericValue(rowObj.originalPrice, 0);
    let discountPct = parseNumericValue(rowObj.discount, 0);

    // If originalPrice wasn't provided, or is less than selling price
    if (price > 0 && (originalPrice === 0 || originalPrice < price)) {
      if (discountPct > 0 && discountPct < 90) {
        originalPrice = Math.round(price / (1 - discountPct / 100));
      } else {
        // Default standard 20% markup
        originalPrice = Math.round(price * 1.25);
        discountPct = 20;
      }
    } else if (price === 0 && originalPrice > 0) {
      if (discountPct > 0) {
        price = Math.round(originalPrice * (1 - discountPct / 100));
      } else {
        price = originalPrice;
      }
    }

    if (price === 0 && originalPrice === 0) {
      warnings.push(`Row ${rowNum}: Product "${rawTitle}" has no price. Set default ₹499.`);
      price = 499;
      originalPrice = 699;
    }

    // Calculate discount display string
    if (discountPct <= 0 && originalPrice > price) {
      discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    const discountStr = discountPct > 0 ? `-${discountPct}%` : '0%';

    // Category determination
    let finalCategory = defaultCategoryOverride && defaultCategoryOverride !== 'AUTO' 
      ? defaultCategoryOverride 
      : normalizeCategory(rowObj.category, rawTitle);

    // Stock determination
    let inStock = true;
    if (rowObj.inStock !== undefined && rowObj.inStock !== '') {
      const stockVal = String(rowObj.inStock).trim().toLowerCase();
      if (['0', 'false', 'no', 'out of stock', 'out', 'outofstock', 'unavailable', 'n'].includes(stockVal)) {
        inStock = false;
      } else if (['1', 'true', 'yes', 'in stock', 'instock', 'available', 'y'].includes(stockVal)) {
        inStock = true;
      } else {
        const numStock = parseFloat(stockVal);
        if (!isNaN(numStock)) inStock = numStock > 0;
      }
    }

    // Image determination
    let rawImg = (rowObj.img || '').toString().trim();
    if (!rawImg || rawImg === '-' || rawImg.toLowerCase() === 'none') {
      rawImg = getDefaultImageForCategory(finalCategory);
    }

    // Description
    let description = (rowObj.description || '').toString().trim();
    if (!description) {
      description = `Genuine high quality ${finalCategory} from FRIENDS MOBILE. Tested & certified for durability.`;
    }

    // Tamil Title & Tamil Description
    const tamilTitle = (rowObj.tamilTitle || '').toString().trim() || autoTranslateToTamil(rawTitle);
    const tamilDesc = (rowObj.tamilDesc || '').toString().trim() || autoTranslateToTamil(description);

    const brand = (rowObj.brand || '').toString().trim();
    const rating = Math.min(5.0, Math.max(1.0, parseNumericValue(rowObj.rating, 4.8)));
    const reviews = Math.max(0, parseInt(parseNumericValue(rowObj.reviews, Math.floor(Math.random() * 50) + 12)));

    parsedProducts.push({
      title: rawTitle,
      tamilTitle,
      category: finalCategory,
      price,
      originalPrice,
      discount: discountStr,
      discountPct,
      inStock,
      img: rawImg,
      images: [rawImg],
      fallback: rawImg,
      description,
      tamilDesc,
      brand,
      rating,
      reviews
    });
  });

  return {
    sheetNames: workbook.SheetNames,
    activeSheet: sheetName,
    headerRowIndex: headerRowIdx,
    detectedHeaders,
    columnMapping,
    parsedProducts,
    totalRows: dataRows.length,
    validProductsCount: parsedProducts.length,
    warnings
  };
}

/**
 * Generate and trigger download of a sample Excel template
 */
export function downloadSampleExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Products Template
  const sampleData = [
    [
      'Product Title', 
      'Category', 
      'Selling Price', 
      'Original MRP', 
      'In Stock', 
      'Brand', 
      'Image URL', 
      'Description'
    ],
    [
      'boAt Airdopes 141 Bluetooth Earbuds', 
      'Earphones', 
      1199, 
      1499, 
      'Yes', 
      'boAt', 
      'images/prod_airdopes.png', 
      'True Wireless Earbuds with 42H Playtime, Beast Mode for Low Latency Gaming.'
    ],
    [
      'Samsung 25W Type-C Super Fast Wall Charger', 
      'Chargers & Cables', 
      1299, 
      1699, 
      'Yes', 
      'Samsung', 
      'images/prod_charger.png', 
      'Original 25W PD fast wall adapter compatible with Galaxy devices and Type-C phones.'
    ],
    [
      'Mi 20000mAh Power Bank 3i 18W Fast Charging', 
      'Power Banks', 
      1699, 
      1999, 
      'Yes', 
      'Xiaomi', 
      'images/prod_powerbank.png', 
      'High capacity lithium polymer battery with dual input and triple output ports.'
    ],
    [
      'Noise ColorFit Pulse 2 Max Smartwatch', 
      'Smartwatches', 
      1799, 
      3999, 
      'Yes', 
      'Noise', 
      '', 
      '1.85 inch TFT display with Bluetooth calling, 550 nits brightness & 100 sports modes.'
    ],
    [
      '11D Premium Curved Tempered Glass Screen Guard', 
      'Screen Protectors', 
      199, 
      499, 
      'Yes', 
      'FRIENDS MOBILE', 
      '', 
      'Edge-to-edge 9H hardness tempered glass with oleophobic anti-fingerprint coating.'
    ],
    [
      'Customized 3D Photo Printed Mobile Back Cover', 
      'Back Covers', 
      399, 
      499, 
      'Yes', 
      'FRIENDS MOBILE', 
      'images/prod_custom_cover.png', 
      'Personalized hard matte back cover with fade-proof vibrant sublimation photo print.'
    ]
  ];

  const wsProducts = XLSX.utils.aoa_to_sheet(sampleData);

  // Styling column widths
  wsProducts['!cols'] = [
    { wch: 45 }, // Product Title
    { wch: 22 }, // Category
    { wch: 15 }, // Selling Price
    { wch: 15 }, // Original MRP
    { wch: 12 }, // In Stock
    { wch: 16 }, // Brand
    { wch: 30 }, // Image URL
    { wch: 60 }  // Description
  ];

  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products_Catalog');

  // Sheet 2: Guide & Category Reference
  const guideData = [
    ['FRIENDS MOBILE - EXCEL PRODUCT IMPORT GUIDE'],
    [''],
    ['1. ANY FORMAT SUPPORTED:'],
    ['- Column names can be in English or Tamil (e.g. Title, Name, Product Name, Category, Price, MRP, Stock).'],
    ['- Order of columns does not matter. The system intelligently detects each column.'],
    ['- You can upload .xlsx, .xls, or .csv files.'],
    [''],
    ['2. AUTOMATIC CATEGORY MATCHING:'],
    ['- Standard categories: Mobile Phones, Chargers & Cables, Earphones, Smartwatches, Power Banks, Back Covers, Photo Frames, Screen Protectors, OTG & Adapters, Speakers, Accessories.'],
    ['- If you write "Airpods", "Headphones", or "Neckband", it automatically maps to Earphones.'],
    ['- If you write "Charger" or "Type-C Cable", it automatically maps to Chargers & Cables.'],
    ['- If the category column is left blank, the system automatically detects the category from the Product Title!'],
    ['- Custom categories (e.g. "Gaming Gear") are also fully supported and will appear in the store.'],
    [''],
    ['3. PRICING & DISCOUNTS:'],
    ['- Selling Price is the actual checkout price.'],
    ['- Original MRP is optional. If left blank, MRP will automatically be calculated with a 20-25% discount markup.'],
    [''],
    ['4. IMAGES:'],
    ['- Image URL can be a full web link (https://...) or left blank.'],
    ['- If left blank, a beautiful high-resolution category photo will be assigned automatically.'],
    [''],
    ['Contact FRIENDS MOBILE Karur for any support!']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Guide & Categories');

  // Trigger file download in browser
  XLSX.writeFile(wb, 'Friends_Mobile_Products_Template.xlsx');
}
