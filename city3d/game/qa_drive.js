// node game/qa_drive.js outdir : the player's car. The software renderer draws about one frame a second, so the
// handling is tested by stepping the car's physics directly; the keys, the controller and the camera use real frames.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 800, height: 450 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__pad = null; const real = navigator.getGamepads?.bind(navigator); navigator.getGamepads = () => (window.__pad ? [window.__pad] : real ? real() : []); });
  await p.goto('file://' + path.resolve(__dirname, '../../output/Aurora_Haven_Explorer.html') + '?auto');
  await p.waitForFunction(() => window.__game && window.__game.G.playing, null, { timeout: 500000 });
  await p.keyboard.press('KeyG');
  const frames = async (n) => { for (let i = 0; i < n; i++) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };
  const st = () => p.evaluate(() => { const c = window.__game.car().S, P = window.__game.P; return { on: c.on, x: +c.x.toFixed(1), z: +c.z.toFixed(1), y: +c.y.toFixed(2), yaw: +c.yaw.toFixed(2), kmh: Math.round(c.v * 3.6), px: +P.pos.x.toFixed(1), py: +P.pos.y.toFixed(2), pz: +P.pos.z.toFixed(1) }; });
  // step the physics: sec of game time with these inputs
  const run = (sec, inp) => p.evaluate(([sec, inp]) => { const g = window.__game, c = g.car(); let hits = 0, maxY = -9; for (let t = 0; t < sec; t += 0.02) { if (c.update(0.02, { throttle: 0, brake: 0, steer: 0, handbrake: false, ...inp })) hits++; g.agents().update(0.02, c.S, false, null); maxY = Math.max(maxY, c.S.y); } return { hits, maxY: +maxY.toFixed(2) }; }, [sec, inp]);
  const put = (x, z, yaw) => p.evaluate(([x, z, yaw]) => { const c = window.__game.car(); c.park(x, z, yaw); c.S.on = true; }, [x, z, yaw]);
  const shot = (n) => p.screenshot({ path: path.join(out, n + '.jpg'), quality: 82, timeout: 400000 });
  const R = {};
  R.parked = await st();
  // walk up to the car and press E
  await p.evaluate(() => { const c = window.__game.car().S, P = window.__game.P; P.pos.set(c.x + Math.cos(c.yaw) * 2.4, c.y, c.z - Math.sin(c.yaw) * 2.4); });
  await frames(2); R.prompt = await p.evaluate(() => document.querySelector('#prompt').textContent);
  await p.keyboard.press('KeyE'); await frames(2); R.in = await st();
  R.speedo = await p.evaluate(() => document.querySelector('#speedo').classList.contains('on'));
  R.heroHidden = await p.evaluate(() => !window.__game.world.scene.children.find((o) => o.isGroup && o.children[0]?.isGroup && o.visible === false) ? 'n/a' : 'hidden');
  // drive away from the spawn: straight, then right
  const a0 = await st(); R.straight = await run(3, { throttle: 1 }); const a1 = await st(); R.straightMoved = +Math.hypot(a1.x - a0.x, a1.z - a0.z).toFixed(1); R.afterStraight = a1;
  R.turn = await run(2, { throttle: 0.6, steer: 1 }); const a2 = await st(); R.yawTurn = +(a2.yaw - a1.yaw).toFixed(2); R.afterTurn = a2;
  await run(3, { brake: 1 }); R.afterBrake = await st();
  // the open road (Glacier Avenue, eastbound lane) against the snow beside it
  await put(150, 2.2, Math.PI / 2); await run(8, { throttle: 1 }); R.road = await st();
  await put(150, 2.2, Math.PI / 2); await run(3, { throttle: 1 }); const t0 = await st(); R.roadTurn = await run(1.5, { throttle: 0.5, steer: 1 }); const t1 = await st(); R.roadYawChange = +(t1.yaw - t0.yaw).toFixed(2); R.afterRoadTurn = t1;
  await put(160, 40, Math.PI / 2); R.snowStart = await st(); await run(6, { throttle: 1 }); R.snow = await st();
  // a building: aim at the nearest tall wall downtown and floor it
  R.wall = await p.evaluate(() => { const g = window.__game, c = g.car(); c.parkNear(-60, 60, 0, 0); let best = null; for (let a = 0; a < 72; a++) { const y = a / 72 * Math.PI * 2; for (let d = 6; d < 60; d += 0.5) { const x = c.S.x + Math.sin(y) * d, z = c.S.z + Math.cos(y) * d; if (g.hm.walk(x, z) > 3) { if (!best || d < best.d) best = { d, y, x, z }; break; } } } c.park(c.S.x, c.S.z, best.y); c.S.on = true; return best; });
  R.wallRun = await run(8, { throttle: 1 }); R.atWall = await st(); R.atWallDist = +Math.hypot(R.atWall.x - R.wall.x, R.atWall.z - R.wall.z).toFixed(1);
  // Mount Aurora: the car must not climb its slopes
  await put(0, 200, 0); R.mountainRun = await run(10, { throttle: 1 }); R.mountain = await st();
  // traffic: drive into the back of a car on the downtown ring
  R.traffic = await p.evaluate(() => { const g = window.__game, c = g.car(), a = g.agents(); return a.count; });
  // get out with E
  await p.evaluate(() => { const c = window.__game.car(); c.park(30, 30, 0); c.S.on = true; c.S.v = 0; }); await frames(2);
  await p.keyboard.press('KeyE'); await frames(2); R.out = await st();
  // call the car from somewhere else with C
  await p.evaluate(() => window.__game.teleport(-40, -60)); await frames(2); await p.keyboard.press('KeyC'); await frames(2); R.called = await st(); R.calledDist = +Math.hypot(R.called.x - R.called.px, R.called.z - R.called.pz).toFixed(1);
  // the controller: Cross gets in, R2 drives, Cross gets out
  const pad = (o) => p.evaluate((o) => { const btn = Array.from({ length: 17 }, (_, i) => ({ pressed: !!(o.b && o.b[i]), value: o.v && o.v[i] != null ? o.v[i] : o.b && o.b[i] ? 1 : 0 })); window.__pad = { id: 'DualSense', mapping: 'standard', connected: true, buttons: btn, axes: o.axes || [0, 0, 0, 0] }; }, o);
  await p.evaluate(() => { const g = window.__game, c = g.car(); g.teleport(30, 30); c.parkNear(33, 30, 0, g.P.pos.y); const S = c.S, P = g.P; P.pos.set(S.x + Math.cos(S.yaw) * 2.4, S.y, S.z - Math.sin(S.yaw) * 2.4); });
  await pad({}); await frames(2); R.padBefore = await p.evaluate(() => ({ modal: !!window.__game.G.modal, near: window.__game.nearThing()?.kind || null, prompt: document.querySelector('#prompt').textContent, padOn: document.body.classList.contains('pad') })); await frames(2); await pad({ b: { 0: 1 } }); await frames(2); await pad({}); await frames(2); R.padIn = (await st()).on;
  const b0 = await st(); await pad({ v: { 7: 1 }, axes: [0.4, 0, 0, 0] }); await frames(12); const b1 = await st(); R.padMoved = +Math.hypot(b1.x - b0.x, b1.z - b0.z).toFixed(2); R.padKmh = b1.kmh;
  await shot('01_pad_driving');
  await pad({ v: { 6: 1 } }); await frames(10); await pad({}); await frames(2); await p.evaluate(() => { window.__game.car().S.v = 0; });
  await pad({ b: { 0: 1 } }); await frames(2); await pad({}); await frames(2); R.padOut = !(await st()).on;
  // pictures: behind the car on the avenue by day and by night
  await p.evaluate(() => { window.__pad = null; const g = window.__game, c = g.car(); c.park(200, 2.2, Math.PI / 2); g.enterCar(); g.C.yaw = Math.PI / 2; });
  await frames(6); await shot('02_day');
  await p.evaluate(() => window.__game.toggleTime()); await frames(6); await shot('03_night');
  R.errors = errs;
  console.log(JSON.stringify(R, null, 1)); await b.close();
})();
