import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainDir = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\ba8b3a89-250d-4b65-8e8f-b487e5311105';
const publicImagesDir = path.resolve(__dirname, 'public/images');
const rootImagesDir = path.resolve(__dirname, 'images');

const imageMap = {
  'hero_devices_1784612051054.png': 'hero_devices.png',
  'hero_devices_light_1784612693889.png': 'hero_devices_light.png',
  'banner_accessories_1784612068714.png': 'banner_accessories.png',
  'banner_backcover_1784612086996.png': 'banner_backcover.png',
  'banner_photoframe_1784612104537.png': 'banner_photoframe.png',
  'prod_airdopes_1784612122808.png': 'prod_airdopes.png',
  'prod_powerbank_1784612140249.png': 'prod_powerbank.png',
  'prod_charger_1784612158887.png': 'prod_charger.png',
  'prod_neckband_1784612177069.png': 'prod_neckband.png',
  'prod_custom_cover_1784612193827.png': 'prod_custom_cover.png'
};

function autoSyncImages() {
  [publicImagesDir, rootImagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const [srcName, destName] of Object.entries(imageMap)) {
    const srcPath = path.join(brainDir, srcName);
    if (fs.existsSync(srcPath)) {
      [publicImagesDir, rootImagesDir].forEach(dir => {
        const destPath = path.join(dir, destName);
        if (!fs.existsSync(destPath)) {
          try {
            fs.copyFileSync(srcPath, destPath);
            console.log(`[Vite Image Sync] Copied ${destName}`);
          } catch (e) {
            console.error(`[Vite Image Sync] Failed ${destName}:`, e.message);
          }
        }
      });
    }
  }
}

autoSyncImages();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-image-sync-plugin',
      buildStart() {
        autoSyncImages();
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
});
