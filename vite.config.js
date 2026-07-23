import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run base64 generator synchronously
try {
  require('./create_base64.cjs');
} catch (e) {}

const brainDirCurrent = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\bf1f9e73-c00a-4822-a487-499e48615418';
const brainDirPrev = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\ba8b3a89-250d-4b65-8e8f-b487e5311105';

const targetDirs = [
  path.resolve(__dirname, 'public/images'),
  path.resolve(__dirname, 'images'),
  path.resolve(__dirname, 'frontend/images'),
  path.resolve(__dirname, 'server/public/images'),
  path.resolve(__dirname, 'backend/public/images'),
  path.resolve(__dirname, 'src/assets')
];

function syncAllImagesOnHost() {
  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const mappings = [
    { src: path.join(brainDirCurrent, 'hero_showcase_ai_1784640427247.png'), names: ['hero_devices.png', 'hero_devices_light.png'] },
    { src: path.join(brainDirCurrent, 'hero_showcase_dark_ai_1784640456103.png'), names: ['hero_devices_dark.png'] },
    { src: path.join(brainDirCurrent, 'banner_accessories_1784621338501.png'), names: ['banner_accessories.png'] },
    { src: path.join(brainDirCurrent, 'banner_backcover_1784621354653.png'), names: ['banner_backcover.png'] },
    { src: path.join(brainDirPrev, 'banner_photoframe_1784612104537.png'), names: ['banner_photoframe.png'] },
    { src: path.join(brainDirPrev, 'prod_airdopes_1784612122808.png'), names: ['prod_airdopes.png'] },
    { src: path.join(brainDirPrev, 'prod_powerbank_1784612140249.png'), names: ['prod_powerbank.png'] },
    { src: path.join(brainDirPrev, 'prod_charger_1784612158887.png'), names: ['prod_charger.png'] },
    { src: path.join(brainDirPrev, 'prod_neckband_1784612177069.png'), names: ['prod_neckband.png'] },
    { src: path.join(brainDirPrev, 'prod_custom_cover_1784612193827.png'), names: ['prod_custom_cover.png'] }
  ];

  mappings.forEach(item => {
    if (fs.existsSync(item.src)) {
      item.names.forEach(destName => {
        targetDirs.forEach(dir => {
          try {
            fs.copyFileSync(item.src, path.join(dir, destName));
          } catch (e) {}
        });
      });
    }
  });
}

try {
  syncAllImagesOnHost();
} catch (e) {}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-image-sync-plugin',
      buildStart() {
        try {
          syncAllImagesOnHost();
        } catch (e) {}
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
});
