const fs = require('fs');
const path = require('path');

const currentBrainDir = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\bf1f9e73-c00a-4822-a487-499e48615418';
const prevBrainDir = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\ba8b3a89-250d-4b65-8e8f-b487e5311105';

const targetDirs = [
  path.join(__dirname, 'public/images'),
  path.join(__dirname, 'images'),
  path.join(__dirname, 'frontend/images'),
  path.join(__dirname, 'server/public/images'),
  path.join(__dirname, 'backend/public/images'),
  path.join(__dirname, 'src/assets')
];

const mappings = [
  { srcDir: currentBrainDir, srcFile: 'media__1784618198375.png', destName: 'hero_devices.png' },
  { srcDir: currentBrainDir, srcFile: 'media__1784618198375.png', destName: 'hero_devices_light.png' },
  { srcDir: currentBrainDir, srcFile: 'hero_devices_1784621322754.png', destName: 'hero_devices_3d.png' },
  { srcDir: currentBrainDir, srcFile: 'banner_accessories_1784621338501.png', destName: 'banner_accessories.png' },
  { srcDir: currentBrainDir, srcFile: 'banner_backcover_1784621354653.png', destName: 'banner_backcover.png' },
  { srcDir: prevBrainDir, srcFile: 'banner_photoframe_1784612104537.png', destName: 'banner_photoframe.png' },
  { srcDir: prevBrainDir, srcFile: 'prod_airdopes_1784612122808.png', destName: 'prod_airdopes.png' },
  { srcDir: prevBrainDir, srcFile: 'prod_powerbank_1784612140249.png', destName: 'prod_powerbank.png' },
  { srcDir: prevBrainDir, srcFile: 'prod_charger_1784612158887.png', destName: 'prod_charger.png' },
  { srcDir: prevBrainDir, srcFile: 'prod_neckband_1784612177069.png', destName: 'prod_neckband.png' },
  { srcDir: prevBrainDir, srcFile: 'prod_custom_cover_1784612193827.png', destName: 'prod_custom_cover.png' }
];

function copyAllImages() {
  try {
    targetDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    mappings.forEach(item => {
      const srcPath = path.join(item.srcDir, item.srcFile);
      if (fs.existsSync(srcPath)) {
        targetDirs.forEach(dir => {
          try {
            fs.copyFileSync(srcPath, path.join(dir, item.destName));
          } catch (e) {}
        });
      }
    });
  } catch (err) {
    console.log('[Image Sync] Handled gracefully:', err.message);
  }
}

try {
  copyAllImages();
} catch (e) {}

module.exports = copyAllImages;
