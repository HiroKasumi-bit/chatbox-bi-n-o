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
  page.on('console', (m) => { if (m.text().includes('horizon at')) console.log(m.text()); });
  await page.route(APP, async (route) => {
    const res = await route.fetch();
    route.fulfill({ response: res, body: patchApp(await res.text()), headers: { ...res.headers(), 'content-type': 'text/html' } });
  });
  await page.goto(APP, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__app, null, { timeout: 60000 });
  await page.setInputFiles('#file-load-project', path.resolve(cityFile));
  await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 1000 });

  await page.addScriptTag({ path: path.join(__dirname, 'night_sky.js') });

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

    // A snowfield that runs to the horizon, for the night shots. The city's own "Polar Snow
    // Ground" takes its colour from a palette texture, so the field reuses that material and
    // points every UV at the snow colour of the tile's top face.
    let tile = null;
    let bestArea = -1;
    a.cityGroup.children.forEach((ch) => {
      if (((ch.userData.details || {}).name || '') !== 'Polar Snow Ground') return;
      ch.traverse((o) => {
        if (!o.isMesh) return;
        const b = new T.Box3().setFromObject(o);
        const area = (b.max.x - b.min.x) * (b.max.z - b.min.z);
        if (area > bestArea) { bestArea = area; tile = o; }
      });
    });
    const geo = new T.PlaneGeometry(8000, 8000).rotateX(-Math.PI / 2);
    let mat = new T.MeshStandardMaterial({ color: 0xf2f5f8 });
    let fieldY = -0.06;
    if (tile) {
      const pos = tile.geometry.attributes.position;
      const uv = tile.geometry.attributes.uv;
      let top = 0;
      for (let i = 1; i < pos.count; i++) if (pos.getY(i) > pos.getY(top)) top = i;
      if (uv) {
        const u = uv.getX(top);
        const v = uv.getY(top);
        const uvs = geo.attributes.uv;
        for (let i = 0; i < uvs.count; i++) uvs.setXY(i, u, v);
      }
      mat = tile.material.clone();
      fieldY = new T.Box3().setFromObject(tile).max.y - 0.06;
    }
    const field = new T.Mesh(geo, mat);
    field.position.y = fieldY;
    field.receiveShadow = true;
    field.visible = false;
    a.scene.add(field);
    a.field = field;
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
      a.ambientLight.color.set(s.ambColor || '#ffffff');
      a.hemiLight.color.set(s.hemiSky || '#ffffff');
      a.hemiLight.groundColor.set(s.hemiGround || '#444444');
      a.directionalLight.color.set(s.sunColor || '#ffffff');

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

      a.field.visible = !!s.night;
      a.scene.fog = null;
      if (s.night) {
        // The horizon is where a point at the camera's height, far away, lands on the picture.
        a.camera.updateMatrixWorld();
        const p = a.camera.position.clone();
        const f = new T.Vector3(s.target[0] - p.x, 0, s.target[2] - p.z).normalize();
        const q = p.clone().add(f.multiplyScalar(1e5)).project(a.camera);
        const horizonY = Math.round(((1 - q.y) / 2) * s.h);
        console.log(`${s.name}: horizon at ${(horizonY / s.h).toFixed(3)} of the height`);
        const fogColor = s.night.fogColor || s.night.sky[s.night.sky.length - 1];
        const [near, far] = s.night.fog || [400, 2600];
        a.scene.fog = new T.Fog(fogColor, near, far);
        const tex = new T.CanvasTexture(window.paintNightSky(s.night, s.w, s.h, horizonY));
        tex.colorSpace = T.SRGBColorSpace;
        a.scene.background = tex;
      } else if (s.sky === 'transparent') {
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
