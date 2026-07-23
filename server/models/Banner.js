const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  slides: [{
    id: { type: Number, required: true },
    tag: { type: String, default: '' },
    titleWhite: { type: String, default: '' },
    titleGradient: { type: String, default: '' },
    desc: { type: String, default: '' },
    imgSrc: { type: String, default: '' },
    btnText: { type: String, default: 'SHOP NOW' },
    btnLink: { type: String, default: '#products' }
  }],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
