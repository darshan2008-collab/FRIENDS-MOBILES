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
    return res.json({ success: true, slides: DEFAULT_SLIDES });
  } catch (err) {
    console.error('[Banners GET Error]', err.message);
    res.json({ success: true, slides: DEFAULT_SLIDES });
  }
});

// PUT /api/banners — Save/Update all banner slides
router.put('/', async (req, res) => {
  try {
    const { slides } = req.body;
    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'slides array is required' });
    }

    if (Banner) {
      await Banner.deleteMany({});
      await Banner.create({ slides, updatedAt: new Date() });
    }

    res.json({ success: true, message: 'Banners saved successfully to PostgreSQL', slides });
  } catch (err) {
    console.error('[Banners PUT Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to save banners' });
  }
});

module.exports = router;
