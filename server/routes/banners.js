const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

let Banner;
try { Banner = require('../models/Banner'); } catch (_) {}

const bannersFilePath = path.join(__dirname, '../data/banners.json');

function readData(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (_) {}
  return fallback;
}

function writeData(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'WELCOME TO FRIENDS MOBILE',
    titleWhite: 'Your One Stop',
    titleGradient: 'Mobile Destination',
    desc: 'Premium mobile accessories, custom cases & photo frames.',
    imgSrc: '/images/hero_devices_light.png',
    btnText: 'SHOP NOW',
    btnLink: '#products'
  },
  {
    id: 2,
    tag: 'CUSTOM 3D COVERS',
    titleWhite: 'Your Style.',
    titleGradient: 'Your Cover.',
    desc: 'High-definition custom printed back covers for all models.',
    imgSrc: '/images/banner_backcover.png',
    btnText: 'CUSTOMIZE COVER',
    btnLink: '#customized-covers'
  },
  {
    id: 3,
    tag: 'DESIGNER PHOTO FRAMES',
    titleWhite: 'For Every',
    titleGradient: 'Special Memory',
    desc: 'Handcrafted custom wood frames for your special memories.',
    imgSrc: '/images/banner_photoframe.png',
    btnText: 'CREATE FRAME',
    btnLink: '#photo-frames'
  },
  {
    id: 4,
    tag: 'EXCLUSIVE ACCESSORY DEALS',
    titleWhite: 'Up to 40% Off',
    titleGradient: 'Premium Gear',
    desc: 'Get up to 40% off chargers, earbuds & smartwatches.',
    imgSrc: '/images/banner_accessories.png',
    btnText: 'EXPLORE OFFERS',
    btnLink: '#products'
  }
];

// GET /api/banners — Fetch all banner slides
router.get('/', async (req, res) => {
  try {
    if (Banner) {
      const banner = await Banner.findOne({});
      if (banner && banner.slides && banner.slides.length > 0) {
        return res.json({ success: true, slides: banner.slides });
      }
    }
  } catch (err) {
    console.error('[Banners GET Error]', err.message);
  }
  const fileSlides = readData(bannersFilePath, DEFAULT_SLIDES);
  return res.json({ success: true, slides: fileSlides });
});

// PUT /api/banners — Save/Update all banner slides
router.put('/', async (req, res) => {
  try {
    const { slides } = req.body;
    const slidesToSave = Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES;

    writeData(bannersFilePath, slidesToSave);

    if (Banner) {
      try {
        await Banner.deleteMany({});
        await Banner.create({ slides: slidesToSave, updatedAt: new Date() });
      } catch (_) {}
    }

    res.json({ success: true, message: 'Banners saved successfully to database & fallback storage', slides: slidesToSave });
  } catch (err) {
    console.error('[Banners PUT Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to save banners' });
  }
});

const promoCardsFilePath = path.join(__dirname, '../data/promo_cards.json');

const DEFAULT_PROMO_CARDS = [
  {
    id: 'promo_accessories',
    section: 'top_promo',
    tag: 'TRENDING GEAR',
    title: 'PREMIUM ACCESSORIES',
    subtitle: 'Up to 40% OFF on chargers, cases, and tech utilities.',
    highlight: '40% OFF',
    btnText: 'SHOP NOW',
    btnAction: 'shop',
    btnLink: '#products',
    imgSrc: 'images/banner_accessories.png',
    fallbackImg: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop',
    active: true,
    order: 1
  },
  {
    id: 'promo_custom_covers',
    section: 'top_promo',
    tag: '3D PRINTING',
    title: 'Customized Back Covers',
    subtitle: 'Design your custom case with custom images, text, and styles.',
    highlight: '',
    btnText: 'CUSTOMIZE',
    btnAction: 'custom_cover',
    btnLink: '#customized-covers',
    imgSrc: 'images/banner_backcover.png',
    fallbackImg: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop',
    active: true,
    order: 2
  },
  {
    id: 'promo_photo_frames',
    section: 'top_promo',
    tag: 'MEMORIES PRESERVED',
    title: 'Photo Frames',
    subtitle: 'Create high-quality custom glass and wood frames for your special moments.',
    highlight: '',
    btnText: 'ORDER NOW',
    btnAction: 'custom_frame',
    btnLink: '#photo-frames',
    imgSrc: 'images/banner_photoframe.png',
    fallbackImg: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
    active: true,
    order: 3
  },
  {
    id: 'service_repair',
    section: 'service_sell',
    tag: 'DOORSTEP SERVICE',
    title: 'Mobile Repair & Service',
    subtitle: 'Cracked screen, battery drain, or dead phone? Certified doorstep pickup & 24h delivery.',
    highlight: '',
    btnText: 'BOOK SERVICE',
    btnAction: 'repair_service',
    btnLink: '#doorstep-repair',
    imgSrc: 'images/banner_repair_service.png',
    fallbackImg: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?q=80&w=600&auto=format&fit=crop',
    active: true,
    order: 4
  },
  {
    id: 'service_sell',
    section: 'service_sell',
    tag: 'INSTANT CASH',
    title: 'Sell Your Old Phone',
    subtitle: 'Get the best guaranteed cash offer for your used mobile with free doorstep inspection.',
    highlight: '',
    btnText: 'SELL NOW',
    btnAction: 'sell_phone',
    btnLink: '#sell-old-phone',
    imgSrc: 'images/banner_sell_phone.png',
    fallbackImg: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?q=80&w=600&auto=format&fit=crop',
    active: true,
    order: 5
  }
];

// GET /api/banners/promo-cards — Fetch all promotional & service cards
router.get('/promo-cards', async (req, res) => {
  try {
    const cards = readData(promoCardsFilePath, DEFAULT_PROMO_CARDS);
    return res.json({ success: true, cards });
  } catch (err) {
    console.error('[PromoCards GET Error]', err.message);
    return res.json({ success: true, cards: DEFAULT_PROMO_CARDS });
  }
});

// PUT /api/banners/promo-cards — Save/Update promotional & service cards
router.put('/promo-cards', async (req, res) => {
  try {
    const { cards } = req.body;
    const cardsToSave = Array.isArray(cards) && cards.length > 0 ? cards : DEFAULT_PROMO_CARDS;
    writeData(promoCardsFilePath, cardsToSave);
    res.json({ success: true, message: 'Promo cards saved successfully', cards: cardsToSave });
  } catch (err) {
    console.error('[PromoCards PUT Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to save promo cards' });
  }
});

module.exports = router;
