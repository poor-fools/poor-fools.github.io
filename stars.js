// Starfield for any page carrying <canvas id="stars">. No exports, no deps —
// drop it in with <script src="stars.js" defer></script>.
(() => {
  'use strict';

  const SPEED = 1.35;   // how fast the camera flies
  const COUNT = 800;
  const DEPTH = 1000;
  const FOCAL = 240;

  // the field holds no state: every star's position is computed from the wall
  // clock, so navigating between pages picks up exactly where the last page
  // left off instead of respawning 900 stars at random depths. a reload lands
  // in the same place too, and so does another tab.
  const EPOCH  = 1785024000000;         // 2026-07-26; arbitrary, just has to be fixed
  const PERIOD = (DEPTH - 1) / SPEED;   // frame-units for one pass, back to front

  const cv = document.querySelector('#stars');
  if (!cv) return;

  const ctx = cv.getContext('2d', { alpha: false });
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // stands in for Math.random(), keyed on the star, which pass it is making,
  // and which value we want — so x/y/mag are recoverable from the clock rather
  // than carried in memory. k is 0..3 and the stride is 4, so a stream never
  // collides with the next pass's.
  const rnd = (i, c, k) => {
    let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(c * 4 + k, 0xc2b2ae35);
    x ^= x >>> 15;
    x = Math.imul(x, 0x2545f491);
    x ^= x >>> 13;
    return (x >>> 0) / 4294967296;
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

  // t is in frame-units since EPOCH. nothing here reads or writes state, so
  // calling it twice with the same t paints the same sky.
  const render = (t) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const base = t / PERIOD;

    for (let i = 0; i < COUNT; i++) {
      // a fixed per-star offset staggers the field; the integer part is which
      // pass this star is on, and seeds an x/y that lasts until it loops
      const u = base + rnd(i, 0, 3);
      const c = Math.floor(u);
      const z = DEPTH - (u - c) * (DEPTH - 1);

      const k = FOCAL / z;
      const x = (rnd(i, c, 0) - 0.5) * spreadX * k + cx;
      const y = (rnd(i, c, 1) - 0.5) * spreadY * k + cy;

      // no longer recycled when it leaves the frustum — a star that exits the
      // side just idles out its pass unseen, which is what buys the closed
      // form. COUNT carries the difference; see README.
      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;

      const near = 1 - z / DEPTH;
      const size = Math.min(4.4 + k * 4.7, 21);
      const mag  = 0.4 + rnd(i, c, 2) * 0.6;
      ctx.globalAlpha = Math.min(1, mag * (0.48 + 0.52 * near));
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  };

  const clock = () => (Date.now() - EPOCH) / 16;

  // rAF's timestamp is document-relative, so anchor it to the wall clock once
  // rather than calling Date.now() at some arbitrary point inside the frame
  const skew = Date.now() - performance.now();
  const frame = (now) => {
    render((skew + now - EPOCH) / 16);
    requestAnimationFrame(frame);
  };

  // setting canvas.width wipes the bitmap, and mobile fires resize every time
  // the URL bar slides — same width, small height delta, not worth a reset
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    lastW = innerWidth;
    lastH = innerHeight;
    resize();
    if (calm) render(clock());
  }, { passive: true });

  resize();
  if (calm) render(clock());
  else requestAnimationFrame(frame);
})();
