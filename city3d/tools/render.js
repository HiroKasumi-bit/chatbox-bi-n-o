// Renders pictures of the self-built Aurora Haven city in headless Chromium.
//
//   node tools/render.js tools/shots.json renders [name,name,...]
//
// The page is served straight from the repository folder through Playwright, so no web
// server is needed. Each shot in shots.json gives the size, camera, look (sun, dusk, night
// or storm) and, for interiors, the set to photograph. Pictures are saved as JPEG, or PNG
// when only part of the scene is drawn on a transparent background.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', '..');
const ORIGIN = 'http://city.local';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

(async () => {
  const [shotsFile, outDir, onlyArg] = process.argv.slice(2);
  const shots = JSON.parse(fs.readFileSync(shotsFile, 'utf8'));
  const only = onlyArg ? onlyArg.split(',') : null;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.setDefaultTimeout(0);
  page.on('pageerror', (e) => console.log('page error:', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`console ${m.type()}:`, m.text()); });
  await page.route(`${ORIGIN}/**`, (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'not found' });
    route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  const t0 = Date.now();
  await page.goto(`${ORIGIN}/city3d/index.html?render`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.cityReady === true, null, { timeout: 600000, polling: 500 });
  console.log(`city built in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  for (const s of shots) {
    if (only && !only.includes(s.name)) continue;
    const t = Date.now();
    const data = await page.evaluate((shot) => window.renderShot(shot), s);
    // Pictures on a transparent background stay PNG; the rest are saved as high-quality JPEG.
    const ext = s.only ? 'png' : 'jpg';
    fs.writeFileSync(path.join(outDir, `${s.name}.${ext}`), Buffer.from(data.split(',')[1], 'base64'));
    console.log(s.name, `${((Date.now() - t) / 1000).toFixed(1)}s`);
  }
  await browser.close();
})();
