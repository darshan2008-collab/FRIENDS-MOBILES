export const DEFAULT_FRAME_SIZES = [
  {
    id: 'frame_4x6',
    label: '4 x 6 inches (Table Desk Frame)',
    dimensions: '4 x 6 inches',
    price: 299,
    originalPrice: 399,
    active: true,
    order: 1
  },
  {
    id: 'frame_6x8',
    label: '6 x 8 inches (Standard Desk / Wall)',
    dimensions: '6 x 8 inches',
    price: 449,
    originalPrice: 599,
    active: true,
    order: 2
  },
  {
    id: 'frame_8x10',
    label: '8 x 10 inches (Wall Frame)',
    dimensions: '8 x 10 inches',
    price: 649,
    originalPrice: 849,
    active: true,
    order: 3
  },
  {
    id: 'frame_12x18',
    label: '12 x 18 inches (Gallery Wall Frame)',
    dimensions: '12 x 18 inches',
    price: 999,
    originalPrice: 1299,
    active: true,
    order: 4
  },
  {
    id: 'frame_18x24',
    label: '18 x 24 inches (Masterpiece Wall Frame)',
    dimensions: '18 x 24 inches',
    price: 1499,
    originalPrice: 1999,
    active: true,
    order: 5
  }
];

export const DEFAULT_CUSTOM_FRAME_FORMULA = {
  basePrice: 150,
  pricePerSqInch: 3.1,
  minPrice: 299,
  maxPrice: 9999,
  allowCustomDimensions: true
};

export const DEFAULT_FRAME_CONFIG = {
  sizes: DEFAULT_FRAME_SIZES,
  formula: DEFAULT_CUSTOM_FRAME_FORMULA
};

/**
 * Calculates price for custom manual dimensions
 */
export function calculateCustomFramePrice(width, height, unit = 'inches', formula = DEFAULT_CUSTOM_FRAME_FORMULA) {
  const f = formula || DEFAULT_CUSTOM_FRAME_FORMULA;
  let w = parseFloat(width) || 0;
  let h = parseFloat(height) || 0;
  if (unit === 'cm') {
    w = w / 2.54;
    h = h / 2.54;
  }
  const sqInches = w * h;
  const minP = Number(f.minPrice) || 299;
  const maxP = Number(f.maxPrice) || 9999;
  if (sqInches <= 0) return minP;

  const baseP = Number(f.basePrice) || 150;
  const rate = Number(f.pricePerSqInch) || 3.1;
  const calculated = Math.round(baseP + sqInches * rate);
  return Math.max(minP, Math.min(maxP, calculated));
}

/**
 * Calculates discount percentage
 */
export function calculateDiscountPct(price, originalPrice) {
  const p = Number(price) || 0;
  const op = Number(originalPrice) || 0;
  if (op > p && op > 0) {
    return `-${Math.round(((op - p) / op) * 100)}%`;
  }
  return '-20%';
}
