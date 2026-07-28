// FRIENDS MOBILE - English ↔ Tamil Comprehensive Translation Dictionary
// தமிழ் மற்றும் ஆங்கில மொழிபெயர்ப்பு தரவுத்தளம்

export const productTranslations = {
  'boAt Airdopes 141 Bluetooth Earbuds': 'போட் ஏர்டோப்ஸ் 141 புளூடூத் இயர்பட்ஸ்',
  'Mi 20000mAh Power Bank 3i': 'மி 20000mAh பாஸ்ட் பவர் பேங்க் 3i',
  'Portronics 20W Fast Charger': 'போர்ட்ரானிக்ஸ் 20W வேகமான சார்ஜர்',
  'Realme Wireless 2S Neckband': 'ரியல்மி வயர்லெஸ் 2S நெக்பேண்ட்',
  'Customized Back Cover': '3D கஸ்டமைஸ் பேக் கவர்',
  'Personalized Wooden Frame': 'கஸ்டமைஸ் மர போட்டோ பிரேம்',
  'Premium Glass Frame': 'பிரீமியம் அக்ரிலிக் கிளாஸ் பிரேம்'
};

export const getProductTitle = (product, lang = 'en') => {
  if (!product) return '';
  const title = typeof product === 'string' ? product : (product.title || product.name || '');
  if (!title) return '';
  if (lang !== 'ta') return title;

  const taTitle = (typeof product === 'object' && product.tamilTitle) || productTranslations[title];
  if (taTitle) {
    return taTitle;
  }
  return title;
};

export const getProductDesc = (product, lang = 'en') => {
  if (!product) return '';
  const desc = (typeof product === 'object' && product.description) || '';
  if (lang !== 'ta') return desc;
  return (typeof product === 'object' && product.tamilDesc) || '100% அசல் உத்திரவாதத்துடன் கூடிய உயர்தர பிரண்ட்ஸ் மொபைல் தயாரிப்பு.';
};

export const translations = {
  en: {
    // Brand & Store Info
    brandName: 'FRIENDS MOBILE',
    storeTagline: 'Madurai Flagship Store • 100% Genuine Products',
    maduraiLocation: 'South Gandhigramam, Karur / Madurai, Tamil Nadu',

    // Header & Navigation
    navHome: 'Home',
    navPhones: 'Mobile Phones',
    navAccessories: 'Accessories',
    navPhotoFrames: 'Photo Frames',
    navCustomCovers: 'Custom Back Covers',
    navServices: 'Services',
    navOffers: 'Offers & Discounts',
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
    switchLanguage: 'Switch Language / மொழி',
    english: 'English',
    tamil: 'தமிழ் (Tamil)',

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
    serviceDelivery: 'Same Day Store Delivery in Madurai / Karur',

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
    contactAddress: 'Double Tank, South Gandhigramam, Karur / Madurai, Tamil Nadu - 639004',
    contactPhone: 'Phone: +91 74485 78507',
    contactEmail: 'Email: support@friendsmobile.in',
    rightsReserved: 'All Rights Reserved. FRIENDS MOBILE Flagship Store.'
  },

  ta: {
    // Brand & Store Info
    brandName: 'பிரண்ட்ஸ் மொபைல்',
    storeTagline: 'மதுரை தலைமை ஷோரூம் • 100% அசல் உத்திரவாத பொருட்கள்',
    maduraiLocation: 'தெற்கு காந்தி கிராமம், கரூர் / மதுரை, தமிழ்நாடு',

    // Header & Navigation
    navHome: 'முகப்பு',
    navPhones: 'மொபைல்கள்',
    navAccessories: 'அக்சஸரீஸ்',
    navPhotoFrames: 'போட்டோ பிரேம்கள்',
    navCustomCovers: 'கஸ்டம் பேக் கவர்',
    navServices: 'சேவைகள்',
    navOffers: 'சலுகைகள் & தள்ளுபடி',
    navContact: 'தொடர்புகொள்ள',
    searchPlaceholder: 'மொபைல் பொருட்கள், பிராண்டுகளை தேடவும்...',
    cart: 'கார்ட்',
    wishlist: 'விருப்பப் பட்டியல்',
    myAccount: 'என் கணக்கு',
    adminPortal: 'அட்மின் போர்டல்',
    loginSignUp: 'லாகின் / பதிவு',
    logout: 'லாக்அவுட்',
    care247: '24/7 உதவி',
    customize: 'கஸ்டமைஸ்',

    // Mobile Drawer & Bottom Navigation
    mobileMenu: 'பட்டி பொருளடக்கம்',
    switchLanguage: 'மொழி மாற்றம் / Language',
    english: 'English (ஆங்கிலம்)',
    tamil: 'தமிழ்',

    // Hero Banners
    heroTitle1: 'உயர்தர மொபைல் அக்சஸரீஸ் & சாதனங்கள்',
    heroSub1: 'போட், மி, ரியல்மி, போர்ட்ரானிக்ஸ் பிராண்டுகளுக்கு 50% வரை சிறப்பு தள்ளுபடி!',
    heroTitle2: 'உங்கள் புகைப்படத்துடன் 3D மொபைல் கவர்',
    heroSub2: 'உங்களுக்கு பிடித்த புகைப்படங்களை மொபைல் கவரில் உயர்தரத்தில் பிரிண்ட் செய்யுங்கள்!',
    heroTitle3: 'கஸ்டம் போட்டோ பிரேம்கள்',
    heroSub3: 'அக்ரிலிக் மற்றும் மர போட்டோ பிரேம்கள் அன்பானவர்களுக்கு பரிசளிக்க',
    shopNow: 'இப்போதே வாங்கவும்',
    exploreCatalog: 'பொருட்களை பார்க்கவும்',

    // Category Grid
    categoriesTitle: 'முக்கிய பொருட்கள் வகைகள்',
    catEarphones: 'இயர்போன்கள் & TWS',
    catPowerBanks: 'பவர் பேங்க்',
    catChargers: 'பாஸ்ட் சார்ஜர்கள் & கேபிள்கள்',
    catCovers: 'கஸ்டமைஸ் பேக் கவர்கள்',
    catFrames: 'போட்டோ பிரேம்கள்',
    catAccessories: 'ஸ்மார்ட் அக்சஸரீஸ்',

    // Trending Products
    trendingTitle: 'அதிகமாக விற்பனையாகும் சிறந்த பொருட்கள்',
    viewAll: 'அனைத்து பொருட்களையும் பார்க்கவும்',
    addToCart: 'கார்ட்டில் சேர்க்கவும்',
    buyNow: 'உடனே வாங்கவும்',
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'இருப்பில் இல்லை',
    off: 'தள்ளுபடி',
    rating: 'மதிப்பீடு',
    reviews: 'மதிப்புரைகள்',

    // Custom Studios
    customCoverStudioTitle: '3D கஸ்டமைஸ் பேக் கவர் ஸ்டுடியோ',
    customCoverSub: 'உங்கள் புகைப்படத்தை பதிவேற்றி உடனடியாக மொபைல் கவர் டிசைன் செய்யுங்கள்!',
    selectMobileBrand: 'மொபைல் பிராண்டை தேர்ந்தெடுக்கவும்',
    selectMobileModel: 'மொபைல் மாடலை தேர்ந்தெடுக்கவும்',
    uploadPhoto: 'புகைப்படத்தை பதிவேற்றவும்',
    coverFinish: 'கவர் ஃபினிஷ் வகை',
    matteFinish: 'மேட் ஃபினிஷ் (ஸ்க்ராட்ச் ப்ரூஃப்)',
    glossyFinish: 'கிளாஸ் கிளாஸி ஃபினிஷ் (பிரீமியம்)',
    previewDesign: '3D கவர் நேரடி தோற்றம்',

    customFrameTitle: 'கஸ்டமைஸ் போட்டோ பிரேம் ஸ்டுடியோ',
    customFrameSub: 'அக்ரிலிக் மற்றும் மர போட்டோ பிரேம்கள் தயாரிக்கவும்',
    frameSize: 'பிரேம் அளவை தேர்ந்தெடுக்கவும்',
    frameMaterial: 'பிரேம் பொருளை தேர்ந்தெடுக்கவும்',

    // Services Section
    servicesTitle: 'எங்கள் ஷோரூம் சிறப்பு சேவைகள்',
    serviceRepair: 'விரைவு மொபைல் சர்வீஸ் & டிஸ்பிளே மாற்றுதல்',
    serviceTempered: '3D கர்வ்ட் டெம்பர்ட் கிளாஸ் பொருத்துதல்',
    serviceCustom: 'உடனடி கஸ்டம் பிரிண்டிங் & பிரேமிங்',
    serviceDelivery: 'மதுரை / கரூர் பகுதிகளில் அன்றைய தினமே டெலிவரி',

    // Trust Badges
    genuineProducts: '100% அசல் தயாரிப்புகள்',
    fastShipping: 'வேகமான எக்ஸ்பிரஸ் டெலிவரி',
    securePayment: '100% பாதுகாப்பான பணம் செலுத்துதல்',
    easyReturns: 'எளிதான 7 நாட்கள் பரிமாற்றம்',

    // Cart Modal
    shoppingCart: 'ஷாப்பிங் கார்ட்',
    emptyCart: 'உங்கள் கார்ட் காலியாக உள்ளது',
    subtotal: 'மொத்த விலை',
    shippingFee: 'டெலிவரி கட்டணம்',
    freeShipping: 'இலவச டெலிவரி',
    grandTotal: 'முழு மொத்த தொகை',
    checkout: 'ஆர்டர் செய்ய தொடரவும்',
    appliedCoupon: 'கூப்பன் இணைக்கப்பட்டது',

    // Order Placement & Auth Modal
    loginTitle: 'வாடிக்கையாளர் லாகின் / பதிவு',
    enterPhone: 'மொபைல் எண்ணை உள்ளிடவும்',
    enterPassword: 'கடவுச்சொல்லை உள்ளிடவும்',
    fullName: 'முழு பெயர்',
    deliveryAddress: 'டெலிவரி முகவரி',
    pincode: 'பின்கோடு',
    placeOrder: 'ஆர்டரை உறுதிசெய்யவும்',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    cashOnDelivery: 'டெலிவரியின் போது பணம் செலுத்துதல் (COD)',
    onlineUpi: 'யுபிஐ / ஆன்லைன் பேமெண்ட்',

    // Footer
    quickLinks: 'விரைவு இணைப்புகள்',
    customerSupport: 'வாடிக்கையாளர் உதவி மையம்',
    contactAddress: 'தெற்கு காந்தி கிராமம், கரூர் / மதுரை, தமிழ்நாடு - 639004',
    contactPhone: 'போன்: +91 74485 78507',
    contactEmail: 'மின்னஞ்சல்: support@friendsmobile.in',
    rightsReserved: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. பிரண்ட்ஸ் மொபைல்.'
  }
};
