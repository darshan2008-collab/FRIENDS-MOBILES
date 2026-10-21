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
  'Chargers & Cables': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
  'Earphones': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
  'Smartwatches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
  'Power Banks': 'https://images.unsplash.com/photo-1609592424009-f80640857380?q=80&w=600&auto=format&fit=crop',
  'Back Covers': 'images/banner_backcover.png',
  'Photo Frames': 'images/banner_photoframe.png',
  'Screen Protectors': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop',
  'OTG & Adapters': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop',
  'Speakers': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop',
  'Accessories': 'images/banner_accessories.png'
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
 * Normalize category or infer from title with 100% precision.
 * 
 * Strict Classification Hierarchy:
 * 1. Checks specific accessory categories first (Photo Frames, Power Banks, Speakers, Back Covers,
 *    Screen Protectors, Earphones, Smartwatches, OTG & Adapters, Chargers & Cables).
 * 2. If ANY accessory indicator (cover, case, glass, protector, cable, charger, earphone, neckband,
 *    holder, stand, etc.) is found, the product is STRICTLY BLOCKED from being classified as 'Mobile Phones',
 *    even if it mentions iPhone, Samsung Galaxy, OnePlus, Redmi, etc.
 * 3. Mobile Phones: Only assigned when the product is genuinely a smartphone (has phone brand, model,
 *    RAM/storage specs, or smartphone keywords) AND has NO accessory indicators.
 * 4. Supports English and Tamil product titles & categories seamlessly.
 */
export function normalizeCategory(rawCat, title = '') {
  const catClean = (rawCat || '').toString().trim().toLowerCase();
  const titleClean = (title || '').toString().trim().toLowerCase();

  // ACCESSORY INDICATOR SIGNALS
  const isPhotoFrame = /\b(photo\s*frames?|photoframe(s)?|picture\s*frames?|wall\s*frames?|wooden\s*frames?|acrylic\s*frames?|memory\s*frames?|table\s*frames?|collage\s*frames?|personalized\s*frames?|custom\s*frames?|போட்டோ\s*பிரேம்|பிரேம்)\b/i.test(titleClean);

  const isPowerBank = /\b(power\s*banks?|powerbank(s)?|portable\s*charger|battery\s*pack|external\s*battery|\b(10000|20000|30000)\s*mah\b|பவர்\s*பேங்க்)\b/i.test(titleClean);

  const isSpeaker = /\b(speakers?|bluetooth\s*speakers?|soundbars?|sound\s*bars?|party\s*speakers?|wireless\s*speakers?|boombox|subwoofers?|ஸ்பீக்கர்)\b/i.test(titleClean);

  const isBackCover = /\b(back\s*cover|backcover|phone\s*cover|mobile\s*cover|\bcovers?\b|\bcases?\b|phone\s*case|mobile\s*case|hard\s*case|soft\s*case|silicone\s*case|silicon\s*case|tpu\s*case|matte\s*case|smoke\s*case|smoke\s*cover|magnetic\s*case|mag-?safe\s*(case|cover)|flip\s*cover|wallet\s*case|leather\s*case|\bpouch(es)?\b|mobile\s*pouch|bumper\s*case|armor\s*case|rugged\s*case|clear\s*case|clear\s*cover|transparent\s*(case|cover)|printed\s*cover|3d\s*cover|custom\s*cover|\bskins?\b|mobile\s*skin|phone\s*skin|பேக்\s*கவர்|கவர்|கேஸ்)\b/i.test(titleClean);

  const isScreenProtector = /\b(tempered\s*glass|tempered|screen\s*guard|screenguard|screen\s*protector|screenprotector|glass\s*guard|privacy\s*glass|privacy\s*tempered|matte\s*glass|matte\s*tempered|uv\s*glass|uv\s*tempered|camera\s*lens\s*protector|lens\s*protector|camera\s*protector|lens\s*guard|camera\s*guard|hydrogel\s*film|membrane\s*guard|edge\s*to\s*edge\s*tempered|full\s*glue\s*tempered|\b(11d|9d|21d|5d|6d|10d)\b|டெம்பர்டு\s*கிளாஸ்|ஸ்கிரீன்\s*கார்டு|கிளாஸ்)\b/i.test(titleClean);

  const isEarphone = /\b(earphones?|earbuds?|airpods?|airdopes?|earpods?|headphones?|headsets?|neckbands?|tws|true\s*wireless|wireless\s*buds|buds\s*(pro|air|\d+)?|bassheads|in-?ear|over-?ear|handsfree|hands-free|bluetooth\s*earphones?|anc\s*earbuds?|இயர்போன்|இயர்பட்ஸ்|ஹெட்போன்|நெக்பேண்ட்)\b/i.test(titleClean);

  const isSmartwatch = /\b(smart\s*watch(es)?|smartwatch(es)?|fitness\s*bands?|smart\s*bands?|fitness\s*trackers?|activity\s*trackers?|calling\s*watch(es)?|colorfit|watch\s*straps?|ஸ்மார்ட்வாட்ச்|வாட்ச்)\b/i.test(titleClean);

  const isOtgAdapter = /\b(otg(\s*adapter)?|type-?c\s*to\s*usb|usb\s*to\s*type-?c|usb\s*hub|type-?c\s*hub|card\s*reader|sd\s*card\s*reader|audio\s*jack\s*adapter|lightning\s*to\s*3\.5|type-?c\s*to\s*3\.5|ஓடிஜி|கன்வெர்ட்டர்)\b/i.test(titleClean);

  const isChargerOrCable = !isOtgAdapter && !isSpeaker && !isPowerBank && /\b(chargers?|fast\s*charger|super\s*fast\s*charger|wall\s*charger|car\s*charger|wireless\s*charger|charging\s*pad|charging\s*dock|power\s*adapter|cables?|data\s*cable|charging\s*cable|type-?c\s*cable|usb-?c\s*cable|lightning\s*cable|micro\s*usb\s*cable|braided\s*cable|pd\s*cable|power\s*delivery|pd\s*charger|warp\s*charge|vooc|dash\s*charger|dart\s*charger|turbo\s*charger|gan\s*charger|\b(18w|20w|25w|30w|33w|45w|65w|67w|80w|100w|120w)\b|சார்ஜர்|கேபிள்|அடாப்டர்)\b/i.test(titleClean);

  const hasAnyAccessoryIndicator = isBackCover || isScreenProtector || isOtgAdapter || isChargerOrCable || isEarphone || isSmartwatch || isPowerBank || isPhotoFrame || isSpeaker || /\b(holder|stand|tripod|mount|ring\s*light|selfie\s*stick|stylus|sim\s*ejector|cleaning\s*kit)\b/i.test(titleClean);

  // Phone Signals
  const isExplicitPhoneWord = /\b(smartphones?|smart\s*phones?|mobile\s*phones?|cell\s*phones?|cellphones?|handsets?|5g\s*mobile|4g\s*mobile|5g\s*phone|4g\s*phone|android\s*phone|மொபைல்\s*போன்|ஸ்மார்ட்போன்|செல்போன்)\b/i.test(titleClean);

  const isPhoneBrandModel = /\b(iphone(\s*(16|15|14|13|12|11|x|xr|xs|se|8|7|plus|pro|max|mini))?|apple\s*iphone|samsung\s*galaxy|galaxy\s*(s24|s23|s22|s21|s20|a55|a35|a25|a15|a14|a54|a34|m34|m14|m54|f54|f14|z\s*fold|z\s*flip|note\s*\d+)|redmi\s*note|redmi\s*(13|12|11|10|a3|a2|k\d+)|poco\s*(x6|m6|f6|c65|x5|m5)|xiaomi\s*(14|13|12)|oneplus\s*(12|11|10|9|nord|open|12r|11r)|vivo\s*(v30|v29|v27|y200|y28|y17|t3|t2|x100|x90)|iqoo\s*(z9|neo|12|11)|oppo\s*(reno|find|a79|a59|a18|f25|f23)|realme\s*(12|11|10|narzo|c67|c53|p1|gt)|google\s*pixel|pixel\s*(9|8|7|6|5|4|a|pro)|moto\s*(g\d+|edge|razr)|motorola|nothing\s*phone|cmf\s*phone|infinix|tecno|lava\s*(agni|yuva|blaze)|nokia|honor\s*(90|200|magic))\b/i.test(titleClean);

  // 1. Explicit Category matching (with intelligent title disambiguation)
  if (catClean) {
    if (catClean.includes('cover') || catClean.includes('case') || catClean.includes('pouch') || catClean.includes('skin') || catClean.includes('கவர்') || catClean.includes('கேஸ்')) {
      return 'Back Covers';
    }
    if (catClean.includes('glass') || catClean.includes('screen') || catClean.includes('guard') || catClean.includes('tempered') || catClean.includes('protector') || catClean.includes('கிளாஸ்') || catClean.includes('கார்டு')) {
      return 'Screen Protectors';
    }
    if (catClean.includes('earphone') || catClean.includes('earbud') || catClean.includes('airdope') || catClean.includes('airpod') || catClean.includes('headphone') || catClean.includes('neckband') || catClean.includes('tws') || catClean.includes('audio') || catClean.includes('இயர்போன்') || catClean.includes('ஹெட்போன்')) {
      return 'Earphones';
    }
    if (catClean.includes('charger') || catClean.includes('cable') || catClean.includes('adapter') || catClean.includes('wire') || catClean.includes('type c') || catClean.includes('type-c') || catClean.includes('சார்ஜர்') || catClean.includes('கேபிள்')) {
      return 'Chargers & Cables';
    }
    if (catClean.includes('watch') || catClean.includes('band') || catClean.includes('வாட்ச்')) {
      return 'Smartwatches';
    }
    if (catClean.includes('power') || catClean.includes('battery') || catClean.includes('பவர்')) {
      return 'Power Banks';
    }
    if (catClean.includes('frame') || catClean.includes('photo') || catClean.includes('பிரேம்')) {
      return 'Photo Frames';
    }
    if (catClean.includes('otg') || catClean.includes('hub') || catClean.includes('converter') || catClean.includes('ஓடிஜி')) {
      return 'OTG & Adapters';
    }
    if (catClean.includes('speaker') || catClean.includes('soundbar') || catClean.includes('sound') || catClean.includes('ஸ்பீக்கர்')) {
      return 'Speakers';
    }
    if (catClean.includes('phone') || catClean.includes('mobile') || catClean.includes('smartphone') || catClean.includes('cell') || catClean.includes('மொபைல்') || catClean.includes('போன்')) {
      // Disambiguate: if the user categorized as "Mobile" but the title is actually an accessory, prioritize the title accessory!
      if (isBackCover) return 'Back Covers';
      if (isScreenProtector) return 'Screen Protectors';
      if (isOtgAdapter) return 'OTG & Adapters';
      if (isChargerOrCable) return 'Chargers & Cables';
      if (isEarphone) return 'Earphones';
      if (isSmartwatch) return 'Smartwatches';
      if (isPowerBank) return 'Power Banks';
      if (isPhotoFrame) return 'Photo Frames';
      if (isSpeaker) return 'Speakers';
      return 'Mobile Phones';
    }
    if (catClean.includes('accessori') || catClean.includes('gadget')) {
      // If categorized as general accessories, inspect title for precise department
      if (isBackCover) return 'Back Covers';
      if (isScreenProtector) return 'Screen Protectors';
      if (isOtgAdapter) return 'OTG & Adapters';
      if (isChargerOrCable) return 'Chargers & Cables';
      if (isEarphone) return 'Earphones';
      if (isSmartwatch) return 'Smartwatches';
      if (isPowerBank) return 'Power Banks';
      if (isPhotoFrame) return 'Photo Frames';
      if (isSpeaker) return 'Speakers';
      return 'Accessories';
    }

    // Preserve custom category cleanly capitalized
    const words = catClean.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // 2. High-Precision Title-Based Classification
  if (isPhotoFrame) return 'Photo Frames';
  if (isPowerBank) return 'Power Banks';
  if (isSpeaker) return 'Speakers';
  if (isBackCover) return 'Back Covers';
  if (isScreenProtector) return 'Screen Protectors';
  if (isEarphone) return 'Earphones';
  if (isSmartwatch) return 'Smartwatches';
  if (isOtgAdapter) return 'OTG & Adapters';
  if (isChargerOrCable) return 'Chargers & Cables';

  // 3. Mobile Phones check (Guaranteed NO accessory indicator)
  if (!hasAnyAccessoryIndicator) {
    if (isExplicitPhoneWord || isPhoneBrandModel) {
      return 'Mobile Phones';
    }
  }

  return 'Accessories';
}

/**
 * High-quality fallback image based on category
 */
export function getDefaultImageForCategory(cat) {
  const norm = normalizeCategory(cat);
  return CATEGORY_IMAGE_PRESETS[norm] || 'images/banner_accessories.png';
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
      'Apple iPhone 15 (128 GB) - Black', 
      'Mobile Phones', 
      69999, 
      79900, 
      'Yes', 
      'Apple', 
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop', 
      'Dynamic Island, 48MP main camera, USB-C connectivity and all-day battery life.'
    ],
    [
      'Samsung Galaxy S24 5G (8GB RAM, 128GB Storage)', 
      'Mobile Phones', 
      64999, 
      74999, 
      'Yes', 
      'Samsung', 
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop', 
      'Galaxy AI powered smartphone with 50MP triple camera setup and Dynamic AMOLED 2X display.'
    ],
    [
      'iPhone 15 Matte Finish Smoke Back Cover', 
      'Back Covers', 
      349, 
      499, 
      'Yes', 
      'FRIENDS MOBILE', 
      'images/banner_backcover.png', 
      'Shockproof translucent matte case with raised camera bezel and anti-fingerprint coating.'
    ],
    [
      'Samsung Galaxy S24 11D Curved Tempered Glass Guard', 
      'Screen Protectors', 
      199, 
      499, 
      'Yes', 
      'FRIENDS MOBILE', 
      '', 
      'Edge-to-edge 9H hardness tempered glass with oleophobic coating.'
    ],
    [
      'Samsung 25W Type-C Super Fast Wall Charger', 
      'Chargers & Cables', 
      1299, 
      1699, 
      'Yes', 
      'Samsung', 
      '', 
      'Original 25W PD fast wall adapter compatible with Galaxy devices and Type-C phones.'
    ],
    [
      'OnePlus Nord Buds 2 TWS Bluetooth Earbuds', 
      'Earphones', 
      2499, 
      2999, 
      'Yes', 
      'OnePlus', 
      '', 
      'Active Noise Cancellation, 12.4mm dynamic drivers and up to 36 hours total battery.'
    ],
    [
      'Mi 20000mAh Power Bank 3i Fast Charging', 
      'Power Banks', 
      1899, 
      2199, 
      'Yes', 
      'Xiaomi', 
      '', 
      'High capacity lithium polymer battery with triple port output and fast charging.'
    ],
    [
      'Noise ColorFit Pulse 2 Max Bluetooth Calling Smartwatch', 
      'Smartwatches', 
      1799, 
      3999, 
      'Yes', 
      'Noise', 
      '', 
      '1.85 inch high resolution display with Bluetooth calling and 100 sports modes.'
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
