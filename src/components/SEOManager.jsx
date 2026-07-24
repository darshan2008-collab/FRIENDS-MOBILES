import { useEffect } from 'react';

/**
 * SEOManager Component - Amazon/Flipkart Grade Dynamic SEO & Schema.org Controller
 * Updates page title, meta description, canonical URL, and JSON-LD Breadcrumbs dynamically on user navigation.
 */
export default function SEOManager({ 
  selectedProduct, 
  shopCategory, 
  isCustomCoverOpen, 
  isCustomFrameOpen,
  isShopOpen 
}) {
  useEffect(() => {
    let title = 'FRIENDS MOBILE - Customized Back Covers, Phone Cases & Accessories Store India';
    let description = 'Shop 3D Customized Phone Back Covers, iPhone Cases, boAt Bluetooth Earbuds, Fast Chargers, Power Banks & Custom Photo Frames at FRIENDS MOBILE with Cash on Delivery across India.';
    let canonical = 'https://friendsmobile.in/';
    let categoryBreadcrumb = 'Home';

    if (isCustomCoverOpen) {
      title = 'Design 3D Customized Back Cover Online | FRIENDS MOBILE Studio';
      description = 'Create your custom printed phone back cover for iPhone, Samsung, Vivo, Oppo, Realme, OnePlus & Xiaomi. High quality 3D photo prints with fast shipping & COD across India.';
      canonical = 'https://friendsmobile.in/#customized-covers';
      categoryBreadcrumb = 'Customized Back Covers';
    } else if (isCustomFrameOpen) {
      title = 'Customized Photo Frames Online India | FRIENDS MOBILE Studio';
      description = 'Design personalized photo frames with custom photo prints, acrylic frames & gift boxes. Perfect for birthday, anniversary & special occasions.';
      canonical = 'https://friendsmobile.in/#photo-frames';
      categoryBreadcrumb = 'Custom Photo Frames';
    } else if (selectedProduct) {
      const prodName = selectedProduct.title || selectedProduct.name || 'Product';
      const prodPrice = selectedProduct.price ? `₹${selectedProduct.price}` : '';
      const prodCat = selectedProduct.category || 'Accessories';
      title = `Buy ${prodName} ${prodPrice} Online | FRIENDS MOBILE`;
      description = `Order ${prodName} at best price ${prodPrice} from FRIENDS MOBILE. Category: ${prodCat}. Premium quality guarantee & cash on delivery available.`;
      canonical = `https://friendsmobile.in/#product-${selectedProduct.id || 'detail'}`;
      categoryBreadcrumb = prodCat;
    } else if (isShopOpen && shopCategory && shopCategory !== 'All') {
      title = `Shop ${shopCategory} Online | Best Price Mobile Accessories | FRIENDS MOBILE`;
      description = `Explore wide collection of ${shopCategory} at FRIENDS MOBILE. Genuine quality products with warranty, discount offers & fast delivery across India.`;
      canonical = `https://friendsmobile.in/#category-${shopCategory.toLowerCase().replace(/\s+/g, '-')}`;
      categoryBreadcrumb = shopCategory;
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update OpenGraph Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // 4. Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.setAttribute('href', canonical);

    // 5. Inject Dynamic Schema.org BreadcrumbList
    const existingBreadcrumbScript = document.getElementById('dynamic-breadcrumb-jsonld');
    if (existingBreadcrumbScript) {
      existingBreadcrumbScript.remove();
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://friendsmobile.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": categoryBreadcrumb,
          "item": canonical
        }
      ]
    };

    const script = document.createElement('script');
    script.id = 'dynamic-breadcrumb-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

  }, [selectedProduct, shopCategory, isCustomCoverOpen, isCustomFrameOpen, isShopOpen]);

  return null;
}
