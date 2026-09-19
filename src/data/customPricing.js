export const DEFAULT_CUSTOM_PRICING = {
  hardCase3D: {
    price: 399,
    originalPrice: 499,
    label: 'Full 3D Hard Case (Sides + Back Print)'
  },
  glossyFinish: {
    price: 449,
    originalPrice: 549,
    label: 'Glossy / Glass Finish Case'
  },
  softSilicone: {
    price: 349,
    originalPrice: 449,
    label: 'Soft Silicone TPU Case'
  },
  mobileSkin: {
    price: 299,
    originalPrice: 399,
    label: 'Mobile Skin Wrap (Back & Camera)'
  }
};

/**
 * Calculates current price and original price based on product type, case type, and finish
 */
export function getCustomPrice(pricing = DEFAULT_CUSTOM_PRICING, productType = 'cover', caseType = '', finish = '') {
  const p = pricing || DEFAULT_CUSTOM_PRICING;

  if (productType === 'skin') {
    const skinPricing = p.mobileSkin || DEFAULT_CUSTOM_PRICING.mobileSkin;
    return {
      price: Number(skinPricing.price) || 299,
      originalPrice: Number(skinPricing.originalPrice) || 399,
      discount: Math.round(((Number(skinPricing.originalPrice || 399) - Number(skinPricing.price || 299)) / Number(skinPricing.originalPrice || 399)) * 100)
    };
  }

  // Mobile Back Cover
  if (finish === 'Glossy Finish' || caseType.includes('Glass') || caseType.includes('Glossy')) {
    const glossyPricing = p.glossyFinish || DEFAULT_CUSTOM_PRICING.glossyFinish;
    return {
      price: Number(glossyPricing.price) || 449,
      originalPrice: Number(glossyPricing.originalPrice) || 549,
      discount: Math.round(((Number(glossyPricing.originalPrice || 549) - Number(glossyPricing.price || 449)) / Number(glossyPricing.originalPrice || 549)) * 100)
    };
  }

  if (caseType.includes('Silicone') || caseType.includes('TPU') || caseType.includes('Soft')) {
    const tpuPricing = p.softSilicone || DEFAULT_CUSTOM_PRICING.softSilicone;
    return {
      price: Number(tpuPricing.price) || 349,
      originalPrice: Number(tpuPricing.originalPrice) || 449,
      discount: Math.round(((Number(tpuPricing.originalPrice || 449) - Number(tpuPricing.price || 349)) / Number(tpuPricing.originalPrice || 449)) * 100)
    };
  }

  // Default Full 3D Hard Case
  const hardCasePricing = p.hardCase3D || DEFAULT_CUSTOM_PRICING.hardCase3D;
  return {
    price: Number(hardCasePricing.price) || 399,
    originalPrice: Number(hardCasePricing.originalPrice) || 499,
    discount: Math.round(((Number(hardCasePricing.originalPrice || 499) - Number(hardCasePricing.price || 399)) / Number(hardCasePricing.originalPrice || 499)) * 100)
  };
}
