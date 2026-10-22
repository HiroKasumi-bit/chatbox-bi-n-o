// Renders the 3D pictures of the magazine from the city file, using the Eco-Polis 3D Builder
// web app (https://ecopolis3d.netlify.app) in headless Chromium.
//
//   node tools/render_3d.js source/Aurora_Haven_v13.json tools/shots.json renders_raw [name,name,...]
//
// The app's page is fetched and patched on the fly so the script can reach the three.js scene,
// load the city file, then place the camera for every shot in shots.json and save a PNG.
// For the magazine the renders also get soft shadows and a painted sky (with an aurora on some
// shots); the city itself is exactly what the app loads. Run tools/prepare_renders.py afterwards
// to turn the PNGs into the files in assets/renders.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const APP = 'https://ecopolis3d.netlify.app/';

function patchApp(html) {
  const hook = `
        window.__app = {THREE, scene, camera, renderer, controls, cityGroup, snowSystem, gridHelper, setEnvironment, directionalLight, ambientLight, hemiLight};
        window.__done = false;
        THREE.DefaultLoadingManager.onLoad = () => { window.__done = true; };
        function animate() {`;
  if (!html.includes('        function animate() {')) throw new Error('The app has changed: animate() not found');
  return html
    .replace('        function animate() {', hook)
    .replace('new THREE.WebGLRenderer({ antialias: true, alpha: true })', 'new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })')
    .replace(/<script async src="\/.netlify[^>]*><\/script>/, '')
    .replace('</head>', '<style>#top-bar,#bottom-panel,#note-panel,#group-actions{display:none!important}</style></head>');
}

(async () => {
  const [cityFile, shotsFile, outDir, onlyArg] = process.argv.slice(2);
  if (!cityFile || !shotsFile || !outDir) {
    console.error('usage: node tools/render_3d.js <city.json> <shots.json> <out dir> [name,name,...]');
    process.exit(1);
  }
  const shots = JSON.parse(fs.readFileSync(shotsFile, 'utf8'));
  const only = onlyArg ? onlyArg.split(',') : null;
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.setDefaultTimeout(0);
  page.on('dialog', (d) => d.accept());
  page.on('pageerror', (e) => console.log('page error:', e.message));
  await page.route(APP, async (route) => {
    const res = await route.fetch();
    route.fulfill({ response: res, body: patchApp(await res.text()), headers: { ...res.headers(), 'content-type': 'text/html' } });
  });
  await page.goto(APP, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__app, null, { timeout: 60000 });
  await page.setInputFiles('#file-load-project', path.resolve(cityFile));
  await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 1000 });

  // Stop the app's render loop; every shot is rendered once, by hand.
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const a = window.__app;
    const T = a.THREE;
    a.snowSystem.visible = false;
    a.gridHelper.visible = false;
    a.renderer.shadowMap.enabled = true;
    a.renderer.shadowMap.type = T.PCFSoftShadowMap;
    a.renderer.toneMapping = T.NoToneMapping;
    a.cityGroup.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const L = a.directionalLight;
    L.castShadow = true;
    L.shadow.mapSize.set(4096, 4096);
    L.shadow.bias = -0.0004;
    L.shadow.normalBias = 0.03;
    a.scene.add(L.target);
  });

  for (const s of shots) {
    if (only && !only.includes(s.name)) continue;
    const t0 = Date.now();
    const data = await page.evaluate((s) => {
      const a = window.__app;
      const T = a.THREE;
      a.renderer.setPixelRatio(1);
      a.renderer.setSize(s.w, s.h, false);
      a.camera.aspect = s.w / s.h;
      a.camera.fov = s.fov || 45;
      a.camera.near = 0.5;
      a.camera.far = 3000;
      a.camera.position.set(...s.pos);
      a.camera.lookAt(...s.target);
      a.camera.updateProjectionMatrix();
      a.snowSystem.visible = !!s.snow;
      a.ambientLight.intensity = s.amb ?? 0.75;
      a.hemiLight.intensity = s.hemi ?? 0.9;
      a.directionalLight.intensity = s.sunI ?? 2.4;

      const L = a.directionalLight;
      const sun = s.sun || [-60, 90, 50];
      const tg = s.shadowC || s.target;
      L.target.position.set(tg[0], 0, tg[2]);
      L.position.set(tg[0] + sun[0], sun[1], tg[2] + sun[2]);
      const R = s.shadowR || 60;
      const c = L.shadow.camera;
      c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.near = 1; c.far = 600;
      c.updateProjectionMatrix();
      L.target.updateMatrixWorld();

      if (s.sky === 'transparent') {
        a.scene.background = null;
        a.renderer.setClearColor(0x000000, 0);
      } else {
        // Vertical sky gradient, optionally with aurora ribbons: [y, amplitude, waves, phase, height, "r,g,b", alpha].
        const sky = s.sky || ['#9fc3e6', '#eaf3fb'];
        const cv = document.createElement('canvas');
        cv.width = 1024; cv.height = 1024;
        const g = cv.getContext('2d');
        const gr = g.createLinearGradient(0, 0, 0, 1024);
        sky.forEach((col, i) => gr.addColorStop(i / (sky.length - 1), col));
        g.fillStyle = gr;
        g.fillRect(0, 0, 1024, 1024);
        if (s.aurora) {
          g.globalCompositeOperation = 'lighter';
          g.filter = 'blur(10px)';
          for (const [y0, amp, freq, phase, hgt, rgb, alpha] of s.aurora) {
            for (let x = -40; x < 1064; x += 3) {
              const y = y0 * 1024 + Math.sin((x / 1024) * Math.PI * freq + phase) * amp * 1024;
              const h = hgt * 1024 * (0.6 + 0.4 * Math.sin(x / 37 + phase));
              const lg = g.createLinearGradient(0, y - h, 0, y);
              lg.addColorStop(0, `rgba(${rgb},0)`);
              lg.addColorStop(0.75, `rgba(${rgb},${alpha * 0.6})`);
              lg.addColorStop(1, `rgba(${rgb},0)`);
              g.fillStyle = lg;
              g.fillRect(x, y - h, 4, h);
            }
          }
          g.filter = 'none';
          g.globalCompositeOperation = 'source-over';
        }
        const tex = new T.CanvasTexture(cv);
        tex.colorSpace = T.SRGBColorSpace;
        a.scene.background = tex;
      }

      // Optionally render only some named places (used for the tower that overlaps the masthead).
      const hidden = [];
      if (s.onlyNames) {
        a.cityGroup.children.forEach((ch) => {
          const n = (ch.userData.details || {}).name || '';
          if (!s.onlyNames.includes(n) && ch.visible) { ch.visible = false; hidden.push(ch); }
        });
      }
      a.renderer.render(a.scene, a.camera);
      hidden.forEach((ch) => { ch.visible = true; });
      return a.renderer.domElement.toDataURL('image/png');
    }, s);
    fs.writeFileSync(path.join(outDir, `${s.name}.png`), Buffer.from(data.split(',')[1], 'base64'));
    console.log(s.name, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  await browser.close();
})();
