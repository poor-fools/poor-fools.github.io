// Starfield for any page carrying <canvas id="stars">. No exports, no deps —
// drop it in with <script src="stars.js" defer></script>.
(() => {
  'use strict';

  const SPEED = 1.35;   // how fast the camera flies
  const COUNT = 300;
  const DEPTH = 1000;
  const FOCAL = 240;

  const cv = document.querySelector('#stars');
  if (!cv) return;

  const ctx = cv.getContext('2d', { alpha: false });
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars = [];
  let w = 0, h = 0, cx = 0, cy = 0;
  let spreadX = 3000, spreadY = 3000;

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  {
    const s = sprite.getContext('2d');
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(.24, 'rgba(255,255,255,.98)');
    g.addColorStop(.46, 'rgba(255,255,255,.34)');
    g.addColorStop(.72, 'rgba(255,255,255,.06)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);
  }

  // in place: a star respawns every time it leaves the frustum, and a fresh
  // object per respawn is pure garbage for the collector to sweep
  const respawn = (s, z) => {
    s.x = (Math.random() - 0.5) * spreadX;
    s.y = (Math.random() - 0.5) * spreadY;
    s.z = z ?? Math.random() * DEPTH;
    s.mag = 0.4 + Math.random() * 0.6;
    return s;
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    cx = w / 2;
    cy = h / 2;
    cv.width = w * dpr;
    cv.height = h * dpr;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // per axis, so a star at max depth still lands inside the viewport
    const reach = DEPTH / FOCAL;
    spreadX = w * reach;
    spreadY = h * reach;
  };

  const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      const k = FOCAL / s.z;
      const x = s.x * k + cx;
      const y = s.y * k + cy;

      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) {
        respawn(s, DEPTH);
        continue;
      }

      const t = 1 - s.z / DEPTH;
      const size = Math.min(4.4 + k * 4.7, 21);
      ctx.globalAlpha = Math.min(1, s.mag * (0.48 + 0.52 * t));
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  };

  let last = 0;
  const frame = (now) => {
    const dt = Math.min((now - last) || 16, 50) / 16;
    last = now;

    for (const s of stars) {
      s.z -= SPEED * dt;
      if (s.z < 1) respawn(s, DEPTH);
    }

    draw();
    requestAnimationFrame(frame);
  };

  const populate = () => { stars = Array.from({ length: COUNT }, () => respawn({})); };

  // setting canvas.width wipes the bitmap, and mobile fires resize every time
  // the URL bar slides — same width, small height delta, not worth a reset
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    lastW = innerWidth;
    lastH = innerHeight;
    resize();
    if (calm) { populate(); draw(); }
  }, { passive: true });

  resize();
  populate();
  if (calm) draw();
  else requestAnimationFrame((t) => { last = t; frame(t); });
})();
