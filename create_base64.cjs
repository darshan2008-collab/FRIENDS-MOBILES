const fs = require('fs');
const path = require('path');

const lightImgPath = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\bf1f9e73-c00a-4822-a487-499e48615418\\hero_showcase_ai_1784640427247.png';
const darkImgPath = 'C:\\Users\\ELCOT\\.gemini\\antigravity-ide\\brain\\bf1f9e73-c00a-4822-a487-499e48615418\\hero_showcase_dark_ai_1784640456103.png';
const targetJsPath = path.join(__dirname, 'src/assets/heroDeviceBase64.js');

try {
  let lightUri = '';
  let darkUri = '';

  if (fs.existsSync(lightImgPath)) {
    const buf = fs.readFileSync(lightImgPath);
    lightUri = `data:image/png;base64,${buf.toString('base64')}`;
  }

  if (fs.existsSync(darkImgPath)) {
    const buf = fs.readFileSync(darkImgPath);
    darkUri = `data:image/png;base64,${buf.toString('base64')}`;
  }

  const jsContent = `// Auto-generated AI Hero Showcase Base64 Modules
export const HERO_SHOWCASE_LIGHT_BASE64 = "${lightUri}";
export const HERO_SHOWCASE_DARK_BASE64 = "${darkUri}";
export default HERO_SHOWCASE_LIGHT_BASE64;
`;

  if (!lightUri && !darkUri && fs.existsSync(targetJsPath)) {
    console.log('[Base64 Gen] Using existing heroDeviceBase64.js module');
  } else {
    fs.mkdirSync(path.dirname(targetJsPath), { recursive: true });
    fs.writeFileSync(targetJsPath, jsContent);
    console.log('[Base64 Gen] Successfully generated AI hero showcase Base64 module');
  }
} catch (e) {
  console.error('[Base64 Gen Error]:', e.message);
}
