// Paints a polar-night sky for the magazine renders: a star field, aurora curtains made of
// vertical rays, distant mountains and a misty horizon. Loaded into the Eco-Polis page by
// render_3d.js; window.paintNightSky(opts, w, h, horizonY) returns a canvas of w × h pixels.
//
// Positions in opts are fractions of the picture: x of its width; y and heights of its height,
// or, with opts.relative, of the height of the sky above the horizon.
(function () {
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Smooth 1D value noise in [0, 1].
  function noise1D(seed) {
    const r = rng(seed);
    const v = Array.from({ length: 4096 }, () => r());
    return function (x) {
      const i = Math.floor(x);
      const f = x - i;
      const a = v[((i % 4096) + 4096) % 4096];
      const b = v[(((i + 1) % 4096) + 4096) % 4096];
      const u = f * f * (3 - 2 * f);
      return a + (b - a) * u;
    };
  }

  // Catmull-Rom through [[x, y], ...] points sorted by x; returns y at x.
  function curve(points) {
    return function (x) {
      const p = points;
      if (x <= p[0][0]) return p[0][1];
      if (x >= p[p.length - 1][0]) return p[p.length - 1][1];
      let i = 0;
      while (x > p[i + 1][0]) i++;
      const p0 = p[Math.max(i - 1, 0)];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[Math.min(i + 2, p.length - 1)];
      const t = (x - p1[0]) / (p2[0] - p1[0]);
      const t2 = t * t;
      const t3 = t2 * t;
      return 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
    };
  }

  const rgba = (c, a) => `rgba(${c},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

  function drawCurtain(g, w, h, c, seed, unit) {
    // `unit` is the height that y positions are fractions of: the picture, or the sky above the horizon.
    const base = curve(c.base); // bottom edge of the curtain
    const height = curve(c.height); // height of the rays
    const env = c.fade ? curve(c.fade) : () => 1; // brightness along the curtain
    const n = [0, 1, 2, 3, 4, 5].map((i) => noise1D(seed + i));
    const k = w / 1600;
    const [x0, x1] = c.span || [0, 1];
    for (let px = Math.floor(x0 * w); px < x1 * w; px += 1) {
      const t = px / w;
      // Soft rays over broader folds, gathered into brighter and dimmer patches.
      const fine = 0.6 * n[0](px / (3 * k)) + 0.4 * n[1](px / (11 * k));
      const patch = 0.15 + 0.85 * Math.pow(n[2](px / (55 * k)), 1.3);
      const a = c.intensity * env(t) * Math.pow(fine, c.sharp || 1.6) * patch * 1.5;
      if (a < 0.008) continue;
      const yb = (base(t) + (n[3](px / (35 * k)) - 0.5) * 0.025 + (n[4](px / (5 * k)) - 0.5) * 0.003) * unit;
      const hh = height(t) * unit * (0.8 + 0.35 * n[5](px / (25 * k)));
      // A faint glow just below the lower edge.
      const dg = g.createLinearGradient(0, yb, 0, yb + 0.025 * h);
      dg.addColorStop(0, rgba(c.edge, a * 0.3));
      dg.addColorStop(1, rgba(c.edge, 0));
      g.fillStyle = dg;
      g.fillRect(px, yb, 1, 0.025 * h);
      const gr = g.createLinearGradient(0, yb, 0, yb - hh);
      gr.addColorStop(0, rgba(c.edge, 0));
      gr.addColorStop(0.02, rgba(c.edge, a));
      gr.addColorStop(0.1, rgba(c.low, a * 0.85));
      gr.addColorStop(0.35, rgba(c.low, a * 0.5));
      gr.addColorStop(0.6, rgba(c.mid, a * 0.25));
      gr.addColorStop(0.85, rgba(c.high, a * 0.1));
      gr.addColorStop(1, rgba(c.high, 0));
      g.fillStyle = gr;
      g.fillRect(px, yb - hh, 1, hh + 2);
    }
  }

  function drawStars(g, w, h, horizonY, count, seed) {
    const r = rng(seed);
    for (let i = 0; i < count; i++) {
      const x = r() * w;
      const y = Math.pow(r(), 1.35) * horizonY; // denser towards the top
      const fade = 1 - Math.pow(y / horizonY, 3);
      const big = r() < 0.035;
      const size = (big ? 1.4 + r() * 1.4 : 0.35 + r() * 0.9) * (w / 1600);
      const a = (0.35 + r() * 0.65) * fade;
      const tint = r() < 0.2 ? '200,215,255' : r() < 0.1 ? '255,225,240' : '255,255,255';
      if (big) {
        const gl = g.createRadialGradient(x, y, 0, x, y, size * 5);
        gl.addColorStop(0, rgba(tint, a));
        gl.addColorStop(0.25, rgba(tint, a * 0.35));
        gl.addColorStop(1, rgba(tint, 0));
        g.fillStyle = gl;
        g.fillRect(x - size * 5, y - size * 5, size * 10, size * 10);
      }
      g.fillStyle = rgba(tint, a);
      g.beginPath();
      g.arc(x, y, size, 0, Math.PI * 2);
      g.fill();
    }
  }

  function drawMountains(g, w, h, horizonY, m, seed) {
    const r = rng(seed);
    const n1 = noise1D(seed + 7);
    const n2 = noise1D(seed + 8);
    const [x0, x1] = m.span || [0, 1];
    const peaks = Array.from({ length: m.peaks || 9 }, () => ({ x: x0 + r() * (x1 - x0), hgt: m.minH + r() * (m.maxH - m.minH), wid: 0.05 + r() * 0.12 }));
    const ridge = (px) => {
      const t = px / w;
      let v = 0;
      peaks.forEach((p) => { v = Math.max(v, p.hgt * Math.max(0, 1 - Math.abs(t - p.x) / p.wid)); });
      return v * (1 + (n1(px / (w * 0.01)) - 0.5) * 0.3 + (n2(px / (w * 0.003)) - 0.5) * 0.1);
    };
    const outline = () => {
      g.beginPath();
      g.moveTo(0, horizonY + 6);
      for (let px = 0; px <= w; px += Math.max(1, w / 800)) g.lineTo(px, horizonY - ridge(px) * h);
      g.lineTo(w, horizonY + 6);
      g.closePath();
    };
    const top = horizonY - m.maxH * h;
    const body = g.createLinearGradient(0, top, 0, horizonY);
    body.addColorStop(0, m.colorTop);
    body.addColorStop(1, m.colorBottom);
    outline();
    g.fillStyle = body;
    g.fill();
    if (m.snow) {
      // Snow on the higher peaks, catching the aurora light.
      const sg = g.createLinearGradient(0, top, 0, top + m.maxH * h * 0.55);
      sg.addColorStop(0, rgba(m.snow, 0.75));
      sg.addColorStop(1, rgba(m.snow, 0));
      outline();
      g.fillStyle = sg;
      g.fill();
    }
  }

  window.paintNightSky = function (o, w, h, horizonY) {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    const seed = o.seed || 7;

    // Sky gradient down to the horizon, then the horizon colour below it.
    const sky = g.createLinearGradient(0, 0, 0, horizonY);
    o.sky.forEach((col, i) => sky.addColorStop(i / (o.sky.length - 1), col));
    g.fillStyle = sky;
    g.fillRect(0, 0, w, horizonY);
    g.fillStyle = o.sky[o.sky.length - 1];
    g.fillRect(0, horizonY, w, h - horizonY);

    // Coloured glows near the horizon: [x, y, radius x, radius y, "r,g,b", alpha].
    (o.glows || []).forEach(([gx, gy, rx, ry, col, a]) => {
      g.save();
      g.translate(gx * w, horizonY + gy * h);
      g.scale(1, ry / rx);
      const gl = g.createRadialGradient(0, 0, 0, 0, 0, rx * w);
      gl.addColorStop(0, rgba(col, a));
      gl.addColorStop(1, rgba(col, 0));
      g.fillStyle = gl;
      g.fillRect(-rx * w, -rx * w, rx * w * 2, rx * w * 2);
      g.restore();
    });

    g.globalCompositeOperation = 'lighter';
    drawStars(g, w, h, horizonY, o.stars || 1200, seed);

    // Aurora: draw the curtains on their own layer, then add it twice, once blurred as a glow
    // and once almost sharp for the rays.
    const layer = document.createElement('canvas');
    layer.width = w;
    layer.height = h;
    const lg = layer.getContext('2d');
    lg.globalCompositeOperation = 'lighter';
    (o.curtains || []).forEach((c, i) => drawCurtain(lg, w, h, c, seed * 31 + i * 101, o.relative ? horizonY : h));
    const k = w / 1600;
    g.filter = `blur(${Math.round(42 * k)}px)`;
    // A glow above 1 adds the blurred layer more than once.
    for (let left = o.glow ?? 1; left > 0; left -= 1) {
      g.globalAlpha = Math.min(1, left);
      g.drawImage(layer, 0, 0);
    }
    g.filter = `blur(${Math.max(1, Math.round((o.raysBlur || 3) * k))}px)`;
    g.globalAlpha = o.rays ?? 0.55;
    g.drawImage(layer, 0, 0);
    g.globalAlpha = 1;
    g.filter = 'none';
    g.globalCompositeOperation = 'source-over';

    (o.mountains || []).forEach((m, i) => drawMountains(g, w, h, horizonY, m, seed + 50 + i));

    // Mist along the horizon, in front of the mountains.
    if (o.mist) {
      const [col, a, hgt] = o.mist;
      const mg = g.createLinearGradient(0, horizonY - hgt * h, 0, horizonY + 4);
      mg.addColorStop(0, rgba(col, 0));
      mg.addColorStop(1, rgba(col, a));
      g.fillStyle = mg;
      g.fillRect(0, horizonY - hgt * h, w, hgt * h + 8);
    }
    return cv;
  };
})();
