// FRIENDS MOBILE - English Standard Translation Dictionary

export const productTranslations = {};

export const autoTranslateToTamil = (text) => {
  return text || '';
};

export const getShortTamilName = (englishTitle) => {
  return englishTitle || '';
};

export const getProductTitle = (product) => {
  if (!product) return '';
  return typeof product === 'string' ? product : (product.title || product.name || '');
};

export const getProductDesc = (product) => {
  if (!product) return '';
  return (typeof product === 'object' && product.description) || '';
};

export const translations = {
  en: {
    // Brand & Store Info
    brandName: 'FRIENDS MOBILE',
    storeTagline: 'Karur Flagship Store • 100% Genuine Products',
    maduraiLocation: 'South Gandhigramam, Karur, Tamil Nadu',

    // Header & Navigation
    navHome: 'Home',
    navPhones: 'Mobile Phones',
    navAccessories: 'Accessories',
    navChargers: 'Chargers & Accessories',
    navPhotoFrames: 'Photo Frames',
    navCustomCovers: 'Customized Back Covers',
    navShopAll: 'Shop All Store',
    navServices: 'Services',
    navOffers: 'Offers',
    navContact: 'Contact Us',
    searchPlaceholder: 'Search products, brands and accessories...',
    cart: 'Cart',
    wishlist: 'Wishlist',
    myAccount: 'My Account',
    adminPortal: 'Admin Portal',
    loginSignUp: 'Login / Sign Up',
    logout: 'Logout',
    care247: '24/7 Care',
    customize: 'Customize',

    // Mobile Drawer & Bottom Navigation
    mobileMenu: 'Navigation Menu',

    // Hero Banners
    heroTitle1: 'Premium Mobile Accessories & Gadgets',
    heroSub1: 'Up to 50% OFF on Top Brands boAt, Mi, Realme, Portronics & More!',
    heroTitle2: 'Personalized 3D Photo Back Covers',
    heroSub2: 'Print Your Favorite Memories & Photos on High-Quality Phone Cases!',
    heroTitle3: 'Custom Wooden & Acrylic Photo Frames',
    heroSub3: 'Beautiful Wall & Table Frames Crafted with Precision for Loved Ones',
    shopNow: 'Shop Now',
    exploreCatalog: 'Explore Catalog',

    // Category Grid
    categoriesTitle: 'Browse Top Product Categories',
    catEarphones: 'Earphones & TWS',
    catPowerBanks: 'Power Banks',
    catChargers: 'Fast Chargers & Cables',
    catCovers: 'Custom Back Covers',
    catFrames: 'Custom Photo Frames',
    catAccessories: 'Smart Accessories',

    // Trending Products
    trendingTitle: 'Trending Best Sellers in Store',
    viewAll: 'View All Products',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    off: 'OFF',
    rating: 'Rating',
    reviews: 'Reviews',

    // Custom Studios
    customCoverStudioTitle: '3D Customized Back Cover Studio',
    customCoverSub: 'Upload your photo & preview your personalized mobile cover live!',
    selectMobileBrand: 'Select Phone Brand',
    selectMobileModel: 'Select Phone Model',
    uploadPhoto: 'Upload Your Photo',
    coverFinish: 'Case Finish Style',
    matteFinish: 'Matte Finish (Scratch Proof)',
    glossyFinish: 'Glass Glossy Finish (Premium)',
    previewDesign: 'Live 3D Cover Preview',

    customFrameTitle: 'Personalized Photo Frame Studio',
    customFrameSub: 'Craft high-definition acrylic & wooden frames for any occasion',
    frameSize: 'Select Frame Size',
    frameMaterial: 'Select Frame Material',

    // Services Section
    servicesTitle: 'Our Store Executive Services',
    serviceRepair: 'Express Mobile Repair & Screen Replacement',
    serviceTempered: '3D Curved Tempered Glass Installation',
    serviceCustom: 'Instant Custom Printing & Framing',
    serviceDelivery: 'Same Day Store Delivery in Karur',

    // Trust Badges
    genuineProducts: '100% Original Products',
    fastShipping: 'Fast Express Delivery',
    securePayment: '100% Secure Payment',
    easyReturns: 'Easy 7-Day Exchange',

    // Cart Modal
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is currently empty',
    subtotal: 'Subtotal Amount',
    shippingFee: 'Shipping Charges',
    freeShipping: 'FREE Shipping',
    grandTotal: 'Grand Total Amount',
    checkout: 'Proceed to Checkout',
    appliedCoupon: 'Coupon Applied',

    // Order Placement & Auth Modal
    loginTitle: 'Customer Login / Register',
    enterPhone: 'Enter Mobile Number',
    enterPassword: 'Enter Password',
    fullName: 'Full Name',
    deliveryAddress: 'Delivery Address',
    pincode: 'PIN Code',
    placeOrder: 'Place Order Now',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery (COD)',
    onlineUpi: 'UPI / Online Payment',

    // Footer
    quickLinks: 'Quick Navigation',
    customerSupport: 'Customer Care & Support',
    contactAddress: 'Double Tank, South Gandhigramam, Karur, Tamil Nadu - 639004',
    contactPhone: 'Phone: +91 93445 22086',
    contactEmail: 'Email: support@friendsmobile.in',
    rightsReserved: 'All Rights Reserved. FRIENDS MOBILE Flagship Store.'
  }
};
