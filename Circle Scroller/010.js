(() => {
'use strict';

/* ==================================================================
   INSTANCE TEARDOWN GUARD
   ------------------------------------------------------------------
   A real browser refresh destroys all JS state, so nothing to do.
   But the GamePad loader re-executes this script without a page
   reload; without this, every run stacks another rAF loop and
   another set of window listeners on top of the previous one.
   ================================================================== */
let __destroyed = false;
if (window.__spinnerApp && typeof window.__spinnerApp.destroy === 'function') {
  try { window.__spinnerApp.destroy(); } catch (e) { console.warn('spinner teardown:', e); }
}

/* ==================================================================
   CONFIG  (defaults / shared constants)
   ================================================================== */
const CFG = {
  text:        ' 🦀⭐🍓🥪🌊⛵🦀⭐🍓🥪🌊⛵ Badger packed his tiny bag, Stripy towel and sun‑hat swag, Waddled down the sandy track, Dreaming of a seaside snack. But on the shore he heard a “Yarr!”. Saw an eyepatch gleaming far - A pirate starfish struck a pose, Saltwater dripping off his toes. ⭐ Oh, the badger and the starfish on a sunny holiday, One wants treasure buried deep, the other loves to play. Digging through the golden sand, a perfect little team, If there’s a jam sandwich waiting, life is truly supreme. ⚓ Starfish waved his tiny arm, “Matey, help me! No alarm - I’ve got treasure, shiny bright, But I can’t dig - it’s quite a sight.” - Badger grinned, “Well that’s my thing, I’ll dig a hole fit for a king. But I’ll need payment for my toil… How ‘bout a jam sandwich for the spoil?” 🥪 Oh, the badger and the starfish on a sunny holiday, One wants treasure buried deep, the other loves to play. Digging through the golden sand, a perfect little team, If there’s a jam sandwich waiting, life is truly supreme. 🍓 So they dug and dug until the sun, Turned the waves to liquid gold. Starfish placed his chest inside, Secrets safe and stories told. Badger munched his sandwich sweet, Jam dripping on his sandy feet - Two new friends upon the shore, Pirate tales forevermore. 🏴‍☠️ Yeah, the badger and the starfish on a sunny holiday, Treasure buried, sandwich eaten, perfect seaside day. If you stroll along that beach, you might just hear them sing - A pirate’s laugh, a badger’s cheer, in harmony they ring.',

  fontWeight:  700,
  fontFamily:  'system-ui, -apple-system, "Segoe UI", sans-serif',

  fillColor: '#f2f2f5',
  fillStops: [
    { pos: 0.20, color: '#222222' },
    { pos: 0.35, color: '#777799' },
    { pos: 0.50, color: '#ffffff' },
    { pos: 0.501, color: '#e09000' },
    { pos: 0.75, color: '#000000' },
    { pos: 0.80, color: '#222222' },
  ],
  fillAnimSpeed: 0,
  fillGradientHalfHeightPct: 0.55,

  strokeEnabled:  true,
  strokeWidthPct: 0.06,
  strokeLineJoin: 'round',
  strokeLineCap:  'round',
  strokeColor: '#000000',
  strokeStops: [
    { pos: 0.0, color: '#ffffff' },
    { pos: 0.50, color: '#000000' },
    { pos: 1.0, color: '#ffffff' },
  ],
  strokeAnimSpeed: 0,
  strokeGradientHalfHeightPct: 0.55,

  fontSizePct:      0.069,
  letterSpacingPct: 0.00,
  radiusPct:        0.25,
  rollRadiusPct:    0.25,

  startVxPct:  -0.003,
  startVyPct:  -0.007,
  gravityPct:   0.00048,

  initialOmega:  0,
  minSpinSpeed: -0.05,
  spinDamp:      0.975,

  gapFraction: 0.05,
  ringOffset:  Math.PI / 2,

  edgeContact: 0.075,
  topOffsetPct: 0.0,

  minBounceTopPct:     0.00,
  minBounceBottomPct:  0.50,
  minBounceSidesPct:   0.01,
  edgeMargin:  0.80,
  restitution: 1.0,
  bounceRandomness: 0.10,

  glyphPad: 0.62,
  glyphEdgeOffsetPct: -0.12,

  reflectionMarginPct: 0.05,
  reflectionBrightness: 0.15,
  reflectionSquish: 0.50,

  trailClearAlpha: 1.0,
  trailClearColor: '#0e0e12',
  trailBgColor:    '#0e0e12',
  trailZoom: 1.0,
  trailZoomOnRing: false,

  cacheEmoji: true,

  ringPoints:  360,
  ringIters:   1,
  ringStiff:   0.18,
  ringDamp:    0.88,

  presetTransitionTime: 1.2,
};

/* ==================================================================
   CONTROLS DECLARATION
   ================================================================== */
const CONTROLS = [
  {
    heading: "📝 Text", openByDefault: true, controls: [
      { icon: "📄", key: "text", special: "text", def: CFG.text, savedInPreset: true,
        label: "Text", canRandomise: false,
        details: "The string that spins around the ring. Emojis are supported." },
      { icon: "🔤", key: "fontFamily", special: "font", def: CFG.fontFamily,
        label: "Font", canRandomise: false,
        details: "Font family for rendered glyphs (uses the font dropdown)." },
    ]
  },
  {
    heading: "🎨 Fill", openByDefault: true, controls: [
      { icon: "🌈", key: "fillStops", special: "gradient", def: CFG.fillStops,
        label: "Fill Gradient", canRandomise: false,
        details: "Click the bar to add a stop. Drag to move. Double-click to remove." },
      { icon: "🎨", key: "fillColor", special: "color", def: CFG.fillColor,
        label: "Fill Colour", canRandomise: false,
        details: "Fallback fill colour when no gradient stops are defined." },
      { icon: "🏎️", key: "fillAnimSpeed", def: CFG.fillAnimSpeed, min: -1, max: 1, step: 0.005,
        label: "Fill Anim Speed", details: "Scroll speed of the fill gradient." },
      { icon: "📏", key: "fillGradientHalfHeightPct", def: CFG.fillGradientHalfHeightPct, min: 0.1, max: 1.5, step: 0.01,
        label: "Fill Grad Half H", details: "Half-height of the fill gradient (× font size)." },
    ]
  },
  {
    heading: "✒️ Stroke", openByDefault: true, controls: [
      { icon: "🌈", key: "strokeStops", special: "gradient", def: CFG.strokeStops,
        label: "Stroke Gradient", canRandomise: false,
        details: "Click the bar to add a stop. Drag to move. Double-click to remove." },
      { icon: "✅", key: "strokeEnabled", special: "bool", def: CFG.strokeEnabled,
        label: "Stroke Enabled", canRandomise: false,
        details: "Draw a stroke around each glyph." },
      { icon: "🎨", key: "strokeColor", special: "color", def: CFG.strokeColor,
        label: "Stroke Colour", canRandomise: false,
        details: "Fallback stroke colour when no gradient stops are defined." },
      { icon: "📏", key: "strokeWidthPct", def: CFG.strokeWidthPct, min: 0, max: 0.4, step: 0.002,
        label: "Stroke Width", details: "Stroke width as a fraction of font size." },
      { icon: "🏎️", key: "strokeAnimSpeed", def: CFG.strokeAnimSpeed, min: -1, max: 1, step: 0.005,
        label: "Stroke Anim Speed", details: "Scroll speed of the stroke gradient." },
      { icon: "📏", key: "strokeGradientHalfHeightPct", def: CFG.strokeGradientHalfHeightPct, min: 0.1, max: 1.5, step: 0.01,
        label: "Stroke Grad Half H", details: "Half-height of the stroke gradient (× font size)." },
    ]
  },
  {
    heading: "📐 Sizes", openByDefault: true, controls: [
      { icon: "🔤", key: "fontSizePct", def: CFG.fontSizePct, min: 0.02, max: 0.15, step: 0.001,
        label: "Font Size", details: "Font size as a fraction of min(W, H)." },
      { icon: "↔️", key: "letterSpacingPct", def: CFG.letterSpacingPct, min: -0.2, max: 0.5, step: 0.005,
        label: "Letter Spacing", details: "Extra gap between letters, × font size." },
      { icon: "⭕", key: "radiusPct", def: CFG.radiusPct, min: 0.01, max: 0.45, step: 0.005,
        label: "Ring Radius", details: "Resting ring radius, × min(W, H)." },
      { icon: "🎡", key: "rollRadiusPct", def: CFG.rollRadiusPct, min: 0.02, max: 0.45, step: 0.005,
        label: "Roll Radius", details: "Radius used for rolling spin on walls." },
    ]
  },
  {
    heading: "🏃 Motion", openByDefault: true, controls: [
      { icon: "⬇️", key: "gravityPct", def: CFG.gravityPct, min: 0, max: 0.002, step: 0.00002,
        label: "Gravity", details: "Downward acceleration, × min(W, H) per frame²." },
      { icon: "➡️", key: "startVxPct", def: CFG.startVxPct, min: -0.02, max: 0.02, step: 0.0005,
        label: "Start Vx", details: "Initial horizontal velocity." },
      { icon: "⬆️", key: "startVyPct", def: CFG.startVyPct, min: -0.02, max: 0.02, step: 0.0005,
        label: "Start Vy", details: "Initial vertical velocity." },
    ]
  },
  {
    heading: "🌀 Angular", openByDefault: false, controls: [
      { icon: "⚡", key: "initialOmega", def: CFG.initialOmega, min: -0.2, max: 0.2, step: 0.002,
        label: "Initial Spin", details: "Initial angular velocity at start." },
      { icon: "🎯", key: "minSpinSpeed", def: CFG.minSpinSpeed, min: -0.2, max: 0.2, step: 0.002,
        label: "Min Spin Speed", details: "Idle spin drift target when not on a wall." },
      { icon: "🛑", key: "spinDamp", def: CFG.spinDamp, min: 0.9, max: 1.0, step: 0.001,
        label: "Spin Damping", details: "Per-frame damping applied to the idle spin drift." },
    ]
  },
  {
    heading: "⭕ Ring Geometry", openByDefault: false, controls: [
      { icon: "✂️", key: "gapFraction", def: CFG.gapFraction, min: 0, max: 1, step: 0.005,
        label: "Gap Fraction", details: "Fraction of the ring left empty (0 = closed ring)." },
      { icon: "↩️", key: "ringOffset", def: CFG.ringOffset, min: -Math.PI, max: Math.PI, step: 0.01,
        label: "Ring Offset", details: "Starting angle of the ring in radians." },
    ]
  },
  {
    heading: "🎾 Edge Behaviour", openByDefault: false, controls: [
      { icon: "🫸", key: "edgeContact", def: CFG.edgeContact, min: 0, max: 0.3, step: 0.005,
        label: "Edge Contact", details: "How far past a wall counts as contact." },
      { icon: "⬆️", key: "topOffsetPct", def: CFG.topOffsetPct, min: 0, max: 1, step: 0.01,
        label: "Top Offset", details: "Fraction of screen height by which the top wall is shifted up." },
      { icon: "🎾", key: "minBounceTopPct", def: CFG.minBounceTopPct, min: 0, max: 1, step: 0.01,
        label: "Min Bounce Top", details: "Min bounce fraction on top wall." },
      { icon: "🎾", key: "minBounceBottomPct", def: CFG.minBounceBottomPct, min: 0, max: 1, step: 0.01,
        label: "Min Bounce Bottom", details: "Min bounce fraction on floor." },
      { icon: "🎾", key: "minBounceSidesPct", def: CFG.minBounceSidesPct, min: 0, max: 1, step: 0.01,
        label: "Min Bounce Sides", details: "Min bounce fraction on side walls." },
      { icon: "📏", key: "edgeMargin", def: CFG.edgeMargin, min: 0.2, max: 1, step: 0.01,
        label: "Edge Margin", details: "How far the ring's body sits inside the play area." },
      { icon: "🏀", key: "restitution", def: CFG.restitution, min: 0.0, max: 1, step: 0.01,
        label: "Restitution", details: "Energy retained after a bounce." },
      { icon: "🎲", key: "bounceRandomness", def: CFG.bounceRandomness, min: 0, max: 0.6, step: 0.01,
        label: "Bounce Randomness", details: "Random energy loss per bounce." },
    ]
  },
  {
    heading: "🔤 Glyph Padding", openByDefault: false, controls: [
      { icon: "📏", key: "glyphPad", def: CFG.glyphPad, min: 0, max: 1.5, step: 0.02,
        label: "Glyph Pad", details: "Extra padding around glyphs (× font size)." },
      { icon: "📐", key: "glyphEdgeOffsetPct", def: CFG.glyphEdgeOffsetPct, min: -0.4, max: 0.6, step: 0.01,
        label: "Edge Offset", details: "Shifts glyphs inward/outward relative to the ring." },
    ]
  },
  {
    heading: "🪞 Reflection", openByDefault: false, controls: [
      { icon: "📏", key: "reflectionMarginPct", def: CFG.reflectionMarginPct, min: 0, max: 0.3, step: 0.005,
        label: "Reflection Margin", details: "Height of the reflected floor band, × screen height." },
      { icon: "💡", key: "reflectionBrightness", def: CFG.reflectionBrightness, min: 0, max: 1, step: 0.02,
        label: "Reflection Brightness", details: "Opacity of the reflected image." },
      { icon: "🗜️", key: "reflectionSquish", def: CFG.reflectionSquish, min: 0.1, max: 1, step: 0.02,
        label: "Reflection Squish", details: "Vertical squash of the reflection (1 = mirror)." },
    ]
  },
  {
    heading: "🌫️ Trails", openByDefault: false, controls: [
      { icon: "🎨", key: "trailBgColor", special: "color", def: CFG.trailBgColor,
        label: "Trail BG Colour", canRandomise: false,
        details: "Background colour when trailClearAlpha is 1." },
      { icon: "🎨", key: "trailClearColor", special: "color", def: CFG.trailClearColor,
        label: "Trail Clear Colour", canRandomise: false,
        details: "Colour of the trail-fade overlay." },
      { icon: "🌫️", key: "trailClearAlpha", def: CFG.trailClearAlpha, min: 0, max: 1, step: 0.01,
        label: "Trail Clear Alpha", details: "Per-frame fade of the trail (1 = no trail)." },
      { icon: "🔍", key: "trailZoom", def: CFG.trailZoom, min: 0.3, max: 2.0, step: 0.001,
        label: "Trail Zoom", details: "Zoom applied to the trail when re-compositing." },
      { icon: "🎯", key: "trailZoomOnRing", special: "bool", def: CFG.trailZoomOnRing,
        label: "Zoom on Ring", canRandomise: false,
        details: "If on, zoom pivots around the ring rather than the screen centre." },
    ]
  },
  {
    heading: "🧵 Soft-Body Ring", openByDefault: false, controls: [
      { icon: "🔢", key: "ringPoints", def: CFG.ringPoints, min: 30, max: 720, step: 1, int: true, canRandomise: false,
        label: "Ring Points", details: "Number of sample points on the ring." },
      { icon: "🔁", key: "ringIters", def: CFG.ringIters, min: 1, max: 10, step: 1, int: true,
        label: "Ring Iterations", details: "Constraint-solver iterations per frame." },
      { icon: "🧵", key: "ringStiff", def: CFG.ringStiff, min: 0.02, max: 0.5, step: 0.01,
        label: "Ring Stiffness", details: "Spring stiffness pulling points back to rest." },
      { icon: "🛑", key: "ringDamp", def: CFG.ringDamp, min: 0.5, max: 1, step: 0.01,
        label: "Ring Damping", details: "Velocity damping of ring points." },
    ]
  },
  {
    heading: "⚙️ Render Quality", openByDefault: false, showExtras: false, controls: [
      { icon: "✅", key: "cacheEmoji", special: "bool", def: CFG.cacheEmoji,
        label: "Cache Emojis", canRandomise: false,
        details: "Cache emoji bitmaps for faster rendering." },
      { icon: "🎞️", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01,
        label: "Preset Transition", savedInPreset: false,
        details: "Seconds over which preset loads animate (0 = instant)." },
    ]
  }
];

/* ==================================================================
   DERIVED TABLES
   ================================================================== */
const CONTROL_BY_KEY = {};
CONTROLS.forEach(g => g.controls.forEach(c => { CONTROL_BY_KEY[c.key] = c; }));

const DEFAULTS = {};
const INT_KEYS = {};
const DISCRETE_KEYS = {};
const STANDALONE_KEYS = {};

Object.keys(CONTROL_BY_KEY).forEach(key => {
  const c = CONTROL_BY_KEY[key];
  DEFAULTS[key] = c.def;
  if (c.int) INT_KEYS[key] = true;
  if (c.discreteSwap) DISCRETE_KEYS[key] = true;
  if (c.savedInPreset === false) STANDALONE_KEYS[key] = true;
});

/* ==================================================================
   RECOMPUTE HOOK
   ================================================================== */
const RECOMPUTE_KEYS = new Set([
  'fontSizePct', 'letterSpacingPct',
  'radiusPct', 'rollRadiusPct',
  'gravityPct', 'startVxPct', 'startVyPct',
  'glyphPad', 'glyphEdgeOffsetPct', 'edgeMargin',
  'reflectionMarginPct', 'reflectionSquish',
  'topOffsetPct',
  'strokeWidthPct',
  'fillGradientHalfHeightPct', 'strokeGradientHalfHeightPct',
  'minBounceTopPct', 'minBounceBottomPct', 'minBounceSidesPct',
  'ringPoints',
]);

/* ==================================================================
   HELPERS
   ================================================================== */
function fmtVal(v) {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(3);
  if (abs >= 0.01) return v.toFixed(4);
  if (abs >= 0.0001) return v.toFixed(6);
  return v.toExponential(3);
}

function deepClone(v) {
  if (v === null || typeof v !== 'object') return v;
  return JSON.parse(JSON.stringify(v));
}

/* ==================================================================
   GLOBAL STATE
   ================================================================== */
const spinners = [];
let selected = null;      // the spinner the control panel edits
let state = null;         // === selected.cfg

let transitionActive = false;
let transitionStartTime = 0;
let transitionDuration = 0;
let transitionSource = null;
let transitionTarget = null;

const gradientEditors = {};

/* ==================================================================
   CANVAS
   ================================================================== */
var canvas = document.createElement("canvas");
var content = document.getElementById("content");
canvas.style.position = 'fixed';
canvas.style.zIndex = -1;
canvas.style.top = 0;
canvas.style.left = 0;
content.appendChild(canvas);

const ctx = canvas.getContext('2d', { alpha: false });
let W = 0, H = 0;
let DPR = 1;

const scratch = document.createElement('canvas');
const sctx    = scratch.getContext('2d');
function resizeScratch() {
  scratch.width  = canvas.width;
  scratch.height = canvas.height;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
function isEmoji(ch) { return EMOJI_RE.test(ch); }

/* ==================================================================
   COLOUR / GRADIENT HELPERS
   ================================================================== */
function parseColor(c) {
  if (typeof c !== 'string') return [255, 255, 255];
  c = c.trim();
  if (c[0] === '#') {
    if (c.length === 4) return [parseInt(c[1]+c[1],16), parseInt(c[2]+c[2],16), parseInt(c[3]+c[3],16)];
    if (c.length === 7) return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  }
  return [255, 255, 255];
}
function lerpColor(a, b, t) {
  const A = parseColor(a), B = parseColor(b);
  return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`;
}
function colorAtCyclic(stops, u) {
  const n = stops.length;
  if (n === 0) return '#ffffff';
  if (n === 1) return stops[0].color;
  if (u <= stops[0].pos) return stops[0].color;
  if (u >= stops[n-1].pos) return stops[n-1].color;
  for (let i = 0; i < n - 1; i++) {
    if (u >= stops[i].pos && u <= stops[i+1].pos) {
      const range = stops[i+1].pos - stops[i].pos;
      const f = range > 1e-9 ? (u - stops[i].pos) / range : 0;
      return lerpColor(stops[i].color, stops[i+1].color, f);
    }
  }
  return stops[n-1].color;
}
function buildGradient(c, y0, y1, stops, t) {
  const grad = c.createLinearGradient(0, y0, 0, y1);
  const n = stops.length;
  if (n < 2 || t === 0) {
    for (const s of stops) grad.addColorStop(s.pos, s.color);
    return grad;
  }
  t = ((t % 1) + 1) % 1;
  const pts = [];
  for (let k = -1; k <= 1; k++) {
    for (let i = 0; i < n; i++) {
      const p = stops[i].pos + k + t;
      if (p >= 0 && p <= 1) pts.push({ pos: p, color: stops[i].color });
    }
  }
  pts.sort((a, b) => a.pos - b.pos);
  const merged = [];
  for (const p of pts) {
    if (merged.length > 0 && Math.abs(merged[merged.length-1].pos - p.pos) < 1e-6) {
      merged[merged.length-1] = p;
    } else { merged.push(p); }
  }
  const uEnd = ((1 - t) % 1 + 1) % 1;
  const endColor = colorAtCyclic(stops, uEnd);
  if (merged.length === 0 || merged[0].pos > 1e-6) merged.unshift({ pos: 0, color: endColor });
  if (merged[merged.length-1].pos < 1 - 1e-6) merged.push({ pos: 1, color: endColor });
  for (const m of merged) grad.addColorStop(m.pos, m.color);
  return grad;
}

/* ==================================================================
   SPINNER  —  one independent circle + its own config instance
   ================================================================== */
class Spinner {
  constructor(cfg) {
    this.cfg  = cfg;
    this.body = { x: 0, y: 0, vx: 0, vy: 0, spin: 0, omega: 0 };

    this.ring = [];
    this.N = 0;
    this.restX = new Float64Array(0);
    this.restY = new Float64Array(0);
    this.segLen = 1;

    this.chars = [];
    this.advances = [];
    this.prefixes = [];
    this.textLen = 0;

    this.cum = new Float64Array(1);
    this.totalCurveLen = 0;
    this.S = { x: 0, y: 0, tx: 1, ty: 0 };

    this.fillAnimTime = 0;
    this.strokeAnimTime = 0;
    this.emojiCache = new Map();

    /* derived (filled by computeSizes) */
    this.radius = 0; this.rollRadius = 1; this.fontSize = 1; this.letterSpacing = 0;
    this.startVx = 0; this.startVy = 0; this.gravity = 0;
    this.pad = 0; this.bodyLim = 0; this.contactR = 1; this.collR = 1;
    this.minSpeedTop = 0; this.minSpeedBottom = 0; this.minSpeedSides = 0;
    this.strokeWidth = 0; this.fillGradHalfH = 1; this.strokeGradHalfH = 1;
    this.marginPx = 0; this.floorY = 0; this.topY = 0;
    this.mass = 1;

    this.computeSizes();
    this.layoutText();
  }

  /* ---------- derived values ---------- */
  computeSizes() {
    const cfg = this.cfg;
    const u = Math.min(W, H);

    this.radius        = u * cfg.radiusPct;
    this.rollRadius    = Math.max(1e-3, u * cfg.rollRadiusPct);
    this.fontSize      = u * cfg.fontSizePct;
    this.letterSpacing = this.fontSize * cfg.letterSpacingPct;

    this.startVx = u * cfg.startVxPct;
    this.startVy = u * cfg.startVyPct;
    this.gravity = u * cfg.gravityPct;

    this.pad             = this.fontSize * (cfg.glyphPad + cfg.glyphEdgeOffsetPct);
    this.bodyLim         = this.radius * cfg.edgeMargin;
    this.contactR        = Math.max(1, this.bodyLim - this.pad);
    /* radius used for circle-vs-circle contact (glyph outer edge) */
    this.collR           = this.radius + this.fontSize * 0.35;
    this.mass            = Math.max(1e-6, this.collR * this.collR);

    this.strokeWidth     = this.fontSize * cfg.strokeWidthPct;
    this.fillGradHalfH   = this.fontSize * cfg.fillGradientHalfHeightPct;
    this.strokeGradHalfH = this.fontSize * cfg.strokeGradientHalfHeightPct;

    this.marginPx = H * cfg.reflectionMarginPct;
    this.floorY   = H - this.marginPx;
    this.topY     = -H * cfg.topOffsetPct;

    const playAreaH = this.floorY - this.topY;
    this.minSpeedTop    = Math.sqrt(Math.max(0, 2 * this.gravity * playAreaH * cfg.minBounceTopPct));
    this.minSpeedBottom = Math.sqrt(Math.max(0, 2 * this.gravity * playAreaH * cfg.minBounceBottomPct));
    this.minSpeedSides  = Math.sqrt(Math.max(0, 2 * this.gravity * W * cfg.minBounceSidesPct));

    const N = Math.max(8, Math.round(cfg.ringPoints));
    this.N = N;
    this.restX = new Float64Array(N);
    this.restY = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      const a = cfg.ringOffset + (k / N) * Math.PI * 2;
      this.restX[k] = Math.cos(a) * this.radius;
      this.restY[k] = Math.sin(a) * this.radius;
    }
    this.segLen = (2 * Math.PI * this.radius) / N;
    this.cum = new Float64Array(N + 1);
    this.totalCurveLen = 0;

    this.emojiCache.clear();
  }

  /* ---------- text layout ---------- */
  layoutText() {
    const cfg = this.cfg;
    ctx.font = `${CFG.fontWeight} ${this.fontSize}px ${cfg.fontFamily}`;
    this.chars = Array.from(cfg.text || '');
    this.advances = [];
    this.prefixes = [];
    let cursor = 0;
    for (const ch of this.chars) {
      this.prefixes.push(cursor);
      const w = ctx.measureText(ch).width;
      this.advances.push(w);
      cursor += w + this.letterSpacing;
    }
    this.textLen = cursor;
  }

  /* ---------- emoji bitmaps ---------- */
  getEmojiBitmap(ch) {
    let entry = this.emojiCache.get(ch);
    if (entry) return entry;

    const cfg = this.cfg;
    ctx.font = `${CFG.fontWeight} ${this.fontSize}px ${cfg.fontFamily}`;
    const m   = ctx.measureText(ch);
    const p   = Math.ceil(this.fontSize * 0.35);
    const w   = Math.ceil(m.width) + p * 2;
    const h   = Math.ceil(this.fontSize * 1.6);

    const c  = document.createElement('canvas');
    c.width  = w;
    c.height = h;
    const cc = c.getContext('2d');
    cc.font         = `${CFG.fontWeight} ${this.fontSize}px ${cfg.fontFamily}`;
    cc.textAlign    = 'center';
    cc.textBaseline = 'middle';
    cc.fillText(ch, w / 2, h / 2);

    entry = { canvas: c, w, h };
    this.emojiCache.set(ch, entry);
    return entry;
  }

  /* ---------- placement ---------- */
  resetBody() {
    this.body.x = W * 0.5;
    this.body.y = (this.topY + this.floorY) * 0.5;
    this.body.vx = this.startVx;
    this.body.vy = this.startVy;
    this.body.spin = 0;
    this.body.omega = this.cfg.initialOmega;
  }

  /* drop in from above the top edge */
  spawnFromTop() {
    const m = this.bodyLim;
    const spanX = Math.max(1, W - 2 * m);
    this.body.x = m + Math.random() * spanX;
    this.body.y = this.topY + m;
    this.body.vx = (Math.random() * 2 - 1) * Math.abs(this.startVx) * 3;
    this.body.vy = Math.max(1, Math.abs(this.startVy));
    this.body.spin = 0;
    this.body.omega = this.cfg.initialOmega;
  }

  clampBody() {
    const m = this.radius * this.cfg.edgeMargin;
    this.body.x = Math.min(Math.max(this.body.x, m), Math.max(m, W - m));
    const lo = this.topY + m;
    const hi = this.floorY - m;
    this.body.y = Math.min(Math.max(this.body.y, lo), Math.max(lo, hi));
  }

  /* ---------- soft ring ---------- */
  initRing() {
    const N = this.N;
    this.ring.length = 0;
    for (let k = 0; k < N; k++) {
      const x = this.body.x + this.restX[k];
      const y = this.body.y + this.restY[k];
      this.ring.push({ x, y, px: x, py: y });
    }
  }

  stepRing() {
    const cfg = this.cfg;
    const N = this.N;
    const minX = this.pad, maxX = W - this.pad;
    const minY = this.topY + this.pad, maxY = this.floorY - this.pad;
    const body = this.body;

    for (let k = 0; k < N; k++) {
      const p  = this.ring[k];
      const ix = body.x + this.restX[k];
      const iy = body.y + this.restY[k];

      const vx = (p.x - p.px) * cfg.ringDamp;
      const vy = (p.y - p.py) * cfg.ringDamp;

      p.px = p.x; p.py = p.y;
      p.x += vx + (ix - p.x) * cfg.ringStiff;
      p.y += vy + (iy - p.y) * cfg.ringStiff;
    }

    for (let it = 0; it < cfg.ringIters; it++) {
      for (let k = 0; k < N; k++) {
        const a = this.ring[k], b = this.ring[(k + 1) % N];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-9;
        const f = ((d - this.segLen) / d) * 0.5;
        dx *= f; dy *= f;
        a.x += dx; a.y += dy;
        b.x -= dx; b.y -= dy;
      }
      for (let k = 0; k < N; k++) {
        const p = this.ring[k];
        if (p.x < minX) p.x = minX; else if (p.x > maxX) p.x = maxX;
        if (p.y < minY) p.y = minY; else if (p.y > maxY) p.y = maxY;
      }
    }
  }

  /* ---------- body integration + wall bounce ---------- */
  stepBody() {
    const cfg  = this.cfg;
    const body = this.body;
    const R    = this.radius;
    const m    = this.bodyLim;
    const topY = this.topY, floorY = this.floorY;
    const pad  = this.pad;

    const loX = m, hiX = W - m, loY = topY + m, hiY = floorY - m;

    const eps = 1.0;
    let onLeft = false, onRight = false, onTop = false, onBot = false;
    const ring = this.ring;
    for (let k = 0; k < ring.length; k++) {
      const p = ring[k];
      if (p.x <= pad + eps)          onLeft  = true;
      if (p.x >= W - pad - eps)      onRight = true;
      if (p.y <= topY + pad + eps)   onTop   = true;
      if (p.y >= floorY - pad - eps) onBot   = true;
      if (onLeft && onRight && onTop && onBot) break;
    }
    const onWall = onLeft || onRight || onTop || onBot;

    body.vy += this.gravity;
    body.x  += body.vx;
    body.y  += body.vy;

    const rnd = () => 1 - Math.random() * cfg.bounceRandomness;

    if (body.x < loX) {
      body.x = loX;
      let v = Math.abs(body.vx) * cfg.restitution;
      if (v < this.minSpeedSides) v = this.minSpeedSides;
      v *= rnd();
      body.vx = v;
    } else if (body.x > hiX) {
      body.x = hiX;
      let v = Math.abs(body.vx) * cfg.restitution;
      if (v < this.minSpeedSides) v = this.minSpeedSides;
      v *= rnd();
      body.vx = -v;
    }

    if (body.y < loY) {
      body.y = loY;
      let v = Math.abs(body.vy) * cfg.restitution;
      if (v < this.minSpeedTop) v = this.minSpeedTop;
      v *= rnd();
      body.vy = v;
    }
    if (body.y > hiY) {
      body.y = hiY;
      let v = Math.abs(body.vy) * cfg.restitution;
      if (v < this.minSpeedBottom) v = this.minSpeedBottom;
      v *= rnd();
      body.vy = -v;
    }

    if (onWall) {
      const lr = this.rollRadius;
      let sum = 0, count = 0;
      if (onLeft)  { sum +=  body.vy / lr; count++; }
      if (onRight) { sum += -body.vy / lr; count++; }
      if (onTop)   { sum += -body.vx / lr; count++; }
      if (onBot)   { sum +=  body.vx / lr; count++; }
      body.omega = sum / count;
    } else {
      body.omega = cfg.minSpinSpeed + (body.omega - cfg.minSpinSpeed) * cfg.spinDamp;
    }

    body.spin += body.omega;
    if (this.textLen > 0) {
      const wrap = this.textLen / R;
      body.spin = ((body.spin % wrap) + wrap) % wrap;
    }
  }

  /* ---------- curve ---------- */
  buildCurve() {
    const N = this.N, cum = this.cum, ring = this.ring;
    cum[0] = 0;
    for (let k = 0; k < N; k++) {
      const a = ring[k], b = ring[(k + 1) % N];
      cum[k + 1] = cum[k] + Math.hypot(b.x - a.x, b.y - a.y);
    }
    this.totalCurveLen = cum[N];
  }

  sampleAt(t) {
    const N = this.N, cum = this.cum, ring = this.ring, S = this.S;
    t -= Math.floor(t);
    const target = t * this.totalCurveLen;

    let lo = 0, hi = N;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= target) lo = mid + 1; else hi = mid;
    }
    const k = Math.min(N - 1, Math.max(0, lo - 1));
    const a = ring[k], b = ring[(k + 1) % N];
    const seg = cum[k + 1] - cum[k] || 1e-9;
    const u = Math.min(1, Math.max(0, (target - cum[k]) / seg));

    S.x = a.x + (b.x - a.x) * u;
    S.y = a.y + (b.y - a.y) * u;

    const K = Math.max(2, Math.round(N * this.fontSize / (2 * Math.PI * this.radius)));

    const ka = (k - K + N) % N;
    const kb = (k + K) % N;
    let dx = ring[kb].x - ring[ka].x;
    let dy = ring[kb].y - ring[ka].y;
    let l  = Math.hypot(dx, dy);

    if (l < 1e-3) {
      dx = S.tx;
      dy = S.ty;
      l  = Math.hypot(dx, dy) || 1;
    }

    S.tx = dx / l;
    S.ty = dy / l;
    return S;
  }

  /* ---------- draw ---------- */
  drawGlyphs(alphaMul) {
    const cfg = this.cfg;
    if (this.textLen <= 0) return;

    ctx.font = `${CFG.fontWeight} ${this.fontSize}px ${cfg.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const C       = 2 * Math.PI * this.radius;
    const span    = C * (1 - cfg.gapFraction);
    const wStart  = C * cfg.gapFraction * 0.5;
    const fadeArc = Math.min(this.fontSize * 2.5, span * 0.2);
    const scroll  = this.body.spin * this.radius;

    const useFillGrad   = cfg.fillStops   && cfg.fillStops.length   > 1;
    const useStrokeGrad = cfg.strokeStops && cfg.strokeStops.length > 1;

    for (let i = 0; i < this.chars.length; i++) {
      const ch    = this.chars[i];
      const half  = this.advances[i] * 0.5;
      const base  = this.prefixes[i] + half + scroll;
      const emoji = cfg.cacheEmoji && isEmoji(ch);

      const kMin = Math.ceil(-base / this.textLen);
      const kMax = Math.floor((span - base) / this.textLen);

      for (let k = kMin; k <= kMax; k++) {
        const d = base + k * this.textLen;
        if (d < 0 || d > span) continue;

        const edge  = Math.min(d, span - d);
        const alpha = fadeArc > 0 ? Math.min(1, edge / fadeArc) : 1;
        if (alpha <= 0.02) continue;

        const p   = this.sampleAt((wStart + d) / C);
        const ang = Math.atan2(p.ty, p.tx);

        ctx.save();
        ctx.globalAlpha = alpha * alphaMul;
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);

        if (emoji) {
          const bmp = this.getEmojiBitmap(ch);
          ctx.drawImage(bmp.canvas, -bmp.w * 0.5, -bmp.h * 0.5);
        } else {
          if (cfg.strokeEnabled && this.strokeWidth > 0) {
            ctx.lineWidth = this.strokeWidth;
            ctx.lineJoin  = CFG.strokeLineJoin;
            ctx.lineCap   = CFG.strokeLineCap;
            let strokeStyle;
            if (useStrokeGrad) {
              strokeStyle = buildGradient(ctx, -this.strokeGradHalfH, this.strokeGradHalfH,
                                          cfg.strokeStops, this.strokeAnimTime);
            } else if (cfg.strokeStops && cfg.strokeStops.length === 1) {
              strokeStyle = cfg.strokeStops[0].color;
            } else {
              strokeStyle = cfg.strokeColor;
            }
            ctx.strokeStyle = strokeStyle;
            ctx.strokeText(ch, 0, 0);
          }

          let fillStyle;
          if (useFillGrad) {
            fillStyle = buildGradient(ctx, -this.fillGradHalfH, this.fillGradHalfH,
                                      cfg.fillStops, this.fillAnimTime);
          } else if (cfg.fillStops && cfg.fillStops.length === 1) {
            fillStyle = cfg.fillStops[0].color;
          } else {
            fillStyle = cfg.fillColor;
          }
          ctx.fillStyle = fillStyle;
          ctx.fillText(ch, 0, 0);
        }
        ctx.restore();
      }
    }
  }

  updateAnim(dt) {
    const cfg = this.cfg;
    if (cfg.fillAnimSpeed) {
      this.fillAnimTime += dt * cfg.fillAnimSpeed;
      this.fillAnimTime = ((this.fillAnimTime % 1) + 1) % 1;
    }
    if (cfg.strokeAnimSpeed) {
      this.strokeAnimTime += dt * cfg.strokeAnimSpeed;
      this.strokeAnimTime = ((this.strokeAnimTime % 1) + 1) % 1;
    }
  }
}

/* ==================================================================
   CIRCLE-vs-CIRCLE COLLISIONS
   Treated exactly like a wall contact: positional separation,
   restitution bounce, a minimum bounce speed and rolling spin.
   ================================================================== */
function resolveCircleCollisions() {
  for (let i = 0; i < spinners.length; i++) {
    for (let j = i + 1; j < spinners.length; j++) {
      collidePair(spinners[i], spinners[j]);
    }
  }
}

function collidePair(A, B) {
  const a = A.body, b = B.body;

  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = A.collR + B.collR;
  if (dist >= minDist) return;

  if (dist < 1e-6) {
    const ang = Math.random() * Math.PI * 2;
    dx = Math.cos(ang); dy = Math.sin(ang);
    dist = 1e-6;
  }
  const nx = dx / dist, ny = dy / dist;

  const invA = 1 / A.mass, invB = 1 / B.mass;
  const invSum = invA + invB;

  /* --- positional correction (push apart, mass weighted) --- */
  const overlap = minDist - dist;
  a.x -= nx * overlap * (invA / invSum);
  a.y -= ny * overlap * (invA / invSum);
  b.x += nx * overlap * (invB / invSum);
  b.y += ny * overlap * (invB / invSum);

  /* --- relative velocity along the normal --- */
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const vn  = rvx * nx + rvy * ny;
  if (vn >= 0) return;   // already separating

  const e = Math.min(A.cfg.restitution, B.cfg.restitution);
  const minV = Math.min(A.minSpeedSides, B.minSpeedSides) * 0.75;

  let target = -e * vn;
  if (target < minV) target = minV;

  const j = (target - vn) / invSum;

  a.vx -= j * nx * invA;
  a.vy -= j * ny * invA;
  b.vx += j * nx * invB;
  b.vy += j * ny * invB;

  /* --- rolling spin, mirroring the wall contact behaviour --- */
  A.body.omega = ( a.vx * ny - a.vy * nx) / A.rollRadius;
  B.body.omega = (-b.vx * ny + b.vy * nx) / B.rollRadius;
}

/* ==================================================================
   RENDER
   ================================================================== */
function render() {
  ctx.globalAlpha = 1;

  const lead = selected || spinners[0];

  const trailZoom       = lead ? lead.cfg.trailZoom : 1.0;
  const trailClearAlpha = lead ? lead.cfg.trailClearAlpha : 1.0;
  const trailClearColor = lead ? lead.cfg.trailClearColor : '#0e0e12';
  const trailBgColor    = lead ? lead.cfg.trailBgColor : '#0e0e12';

  if (trailZoom !== 1.0) {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, scratch.width, scratch.height);
    sctx.drawImage(canvas, 0, 0);

    const pivotX = (lead && lead.cfg.trailZoomOnRing ? lead.body.x : W / 2) * DPR;
    const pivotY = (lead && lead.cfg.trailZoomOnRing ? lead.body.y : H / 2) * DPR;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.rect(0, 0, scratch.width, scratch.height);
    ctx.clip();
    ctx.globalAlpha = 1;
    ctx.fillStyle = trailClearColor;
    ctx.fillRect(0, 0, scratch.width, scratch.height);
    ctx.globalAlpha = trailClearAlpha;
    ctx.translate(pivotX, pivotY);
    ctx.scale(trailZoom, trailZoom);
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(scratch, 0, 0);
    ctx.restore();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  } else if (trailClearAlpha < 1) {
    ctx.globalAlpha = trailClearAlpha;
    ctx.fillStyle = trailClearColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 1;
    ctx.fillStyle = trailBgColor;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- all glyph rings ---- */
  for (const sp of spinners) sp.drawGlyphs(1.0);

  /* ---- reflections ---- */
  const refl = spinners.filter(sp => sp.marginPx > 0.5 && sp.cfg.reflectionBrightness > 0);
  if (refl.length) {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, scratch.width, scratch.height);
    sctx.drawImage(canvas, 0, 0);

    for (const sp of refl) {
      const cfg = sp.cfg;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = cfg.trailBgColor;
      ctx.fillRect(0, sp.floorY, W, sp.marginPx);
      ctx.restore();

      const squish = Math.max(0.01, cfg.reflectionSquish);
      const srcH   = sp.marginPx / squish;
      const srcY   = sp.floorY - srcH;

      if (srcY > -sp.marginPx) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, sp.floorY, W, sp.marginPx);
        ctx.clip();

        const syDev = Math.max(0, srcY * DPR);
        const shDev = Math.min(scratch.height - syDev, (sp.floorY - Math.max(0, srcY)) * DPR);

        if (shDev > 0) {
          ctx.globalAlpha = cfg.reflectionBrightness;
          ctx.translate(0, sp.floorY);
          ctx.scale(1, -squish);
          ctx.translate(0, -sp.floorY);
          ctx.drawImage(scratch, 0, syDev, scratch.width, shDev, 0, srcY, W, srcH);
        }
        ctx.restore();
      }
    }
  }
}

/* ==================================================================
   RECOMPUTE
   ================================================================== */
let pendingRecompute = false;
function scheduleRecompute() {
  if (pendingRecompute) return;
  pendingRecompute = true;
  requestAnimationFrame(() => {
    pendingRecompute = false;
    recomputeFromCFG();
  });
}

function recomputeFromCFG() {
  const sp = selected;
  if (!sp) return;
  sp.computeSizes();
  sp.layoutText();
  sp.clampBody();
  sp.initRing();
}

/* ==================================================================
   MAIN LOOP
   ================================================================== */
const STEP = 1 / 60;
let acc = 0, last = 0;
let rafId = 0;

function frame(now) {
  if (__destroyed) return;
  if (!last) last = now;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25;
  acc += dt;

  while (acc >= STEP) {
    for (const sp of spinners) sp.stepBody();
    resolveCircleCollisions();
    for (const sp of spinners) sp.stepRing();
    acc -= STEP;
  }

  for (const sp of spinners) {
    sp.updateAnim(dt);
    sp.buildCurve();
  }

  render();

  if (transitionActive) {
    const tn = Math.min(1, (now - transitionStartTime) / transitionDuration);
    if (tn >= 1) {
      transitionActive = false;
      Object.keys(DEFAULTS).forEach(k => {
        if (STANDALONE_KEYS[k]) return;
        state[k] = transitionTarget[k];
      });
      refreshControlsUI();
      recomputeFromCFG();
      syncGradientEditors();
    } else {
      const te = tn * tn * tn * (tn * (tn * 6 - 15) + 10);
      Object.keys(DEFAULTS).forEach(k => {
        if (STANDALONE_KEYS[k]) return;
        if (DISCRETE_KEYS[k]) return;
        const a = transitionSource[k];
        const b = transitionTarget[k];
        if (typeof a === 'number' && typeof b === 'number') {
          state[k] = a + (b - a) * te;
          if (INT_KEYS[k]) state[k] = Math.round(state[k]);
        }
      });
      scheduleRecompute();
      if ((now | 0) % 4 === 0) refreshControlsUI();
    }
  }

  rafId = requestAnimationFrame(frame);
  /* Let the GamePad loader's cancelAnimationFrame(animationFrameId) work. */
  window.animationFrameId = rafId;
}

/* ==================================================================
   PRESETS
   ================================================================== */
var PRESETS = [
  { name: "Default", iteration: 1, values: {} },
  {
    name: "Slow Spin", iteration: 2, values: {
      minSpinSpeed: -0.01, spinDamp: 0.99, gravityPct: 0.0002,
      restitution: 0.85, bounceRandomness: 0.3, edgeMargin: 0.6
    }
  },
  {
    name: "Hot Bounce", iteration: 3, values: {
      minBounceBottomPct: 0.9, minBounceSidesPct: 0.6, minBounceTopPct: 0.4,
      restitution: 1.0, bounceRandomness: 0.02, gravityPct: 0.0012, edgeMargin: 0.9
    }
  },
  {
    name: "Trail Dream", iteration: 4, values: {
      trailClearAlpha: 0.12, trailZoom: 1.02, trailZoomOnRing: true,
      reflectionBrightness: 0.4, reflectionSquish: 0.35
    }
  },
  {
    name: "Gappy", iteration: 5, values: {
      gapFraction: 0.35, letterSpacingPct: 0.15, fontSizePct: 0.05,
      ringStiff: 0.35, ringDamp: 0.7
    }
  },
  {
    name: "Jelly Ring", iteration: 6, values: {
      ringStiff: 0.05, ringDamp: 0.95, ringIters: 3,
      fontSizePct: 0.08, radiusPct: 0.30
    }
  },
  {
    name: "Lunar", iteration: 7, values: {
      fillColor: '#c9d6ff', strokeColor: '#2a3566',
      trailBgColor: '#050814', trailClearColor: '#050814',
      trailClearAlpha: 0.25, reflectionBrightness: 0.3
    }
  }
];

/* ==================================================================
   SELECTION
   ================================================================== */
function selectSpinner(sp) {
  if (!sp) return;
  selected = sp;
  state = sp.cfg;
  refreshControlsUI();
  syncGradientEditors();
  updateSelLabel();
}

function cycleSelection() {
  if (spinners.length < 2) return;
  const i = spinners.indexOf(selected);
  selectSpinner(spinners[(i + 1) % spinners.length]);
}

function updateSelLabel() {
  const btn = document.getElementById('btn-select-circle');
  if (!btn) return;
  const idx = spinners.indexOf(selected);
  btn.textContent = '◎ ' + (idx + 1) + '/' + spinners.length;
  btn.style.display = spinners.length > 1 ? '' : 'none';
}

function pickSpinner(x, y) {
  let best = null, bestD = Infinity;
  for (const sp of spinners) {
    const d = Math.hypot(x - sp.body.x, y - sp.body.y);
    if (d <= sp.radius + sp.fontSize && d < bestD) { bestD = d; best = sp; }
  }
  return best;
}

/* add a new circle, using a snapshot of the current settings */
function addCircle() {
  if (!state) return;
  const cfg = deepClone(state);
  const sp = new Spinner(cfg);
  sp.spawnFromTop();
  sp.initRing();
  spinners.push(sp);
  selectSpinner(sp);
  updateSelLabel();
}

/* ==================================================================
   CONTROL PANEL
   ================================================================== */
function buildControlsUI() {
  const list = document.getElementById("controls-list");
  list.innerHTML = "";

  function makeHeading(text, isFirst, group) {
    const head = document.createElement("div");
    head.className = "ctrl-row";
    head.style.gridColumn = "1 / -1";
    head.style.width = "100%";
    head.style.display = "flex";
    head.style.alignItems = "center";
    head.style.justifyContent = "flex-start";
    head.style.margin = "16px 0 6px 0";
    head.style.paddingTop = "12px";
    head.style.fontWeight = "bold";
    head.style.fontSize = "1.1em";
    head.style.color = "#ddd";
    if (!isFirst) head.style.borderTop = "1px solid #555";

    const indicator = document.createElement("span");
    indicator.style.marginRight = "6px";
    indicator.style.opacity = "0.6";
    indicator.style.fontSize = "0.9em";
    indicator.textContent = "▶";
    head.appendChild(indicator);

    const label = document.createElement("span");
    label.textContent = text;
    head.appendChild(label);

    const showExtras = (group.showExtras !== false);
    const btnBox = document.createElement("span");
    btnBox.style.display = showExtras ? "flex" : "none";
    btnBox.style.gap = "4px";
    btnBox.style.marginLeft = "auto";

    if (showExtras) {
      const randBtn = document.createElement("button");
      randBtn.className = "reset-btn";
      randBtn.textContent = "R";
      randBtn.title = "Randomise this group's values";
      randBtn.addEventListener("click", e => {
        e.stopPropagation();
        randomiseGroup(group, randBtn);
      });

      const copyBtn = document.createElement("button");
      copyBtn.className = "reset-btn";
      copyBtn.textContent = "C";
      copyBtn.title = "Copy this group's values";
      copyBtn.addEventListener("click", e => {
        e.stopPropagation();
        copyGroup(group, copyBtn);
      });

      const pasteBtn = document.createElement("button");
      pasteBtn.className = "reset-btn";
      pasteBtn.textContent = "P";
      pasteBtn.title = "Paste values into this group";
      pasteBtn.addEventListener("click", e => {
        e.stopPropagation();
        pasteGroup(group, pasteBtn);
      });

      btnBox.appendChild(randBtn);
      btnBox.appendChild(copyBtn);
      btnBox.appendChild(pasteBtn);
    }

    head.appendChild(btnBox);
    head.style.cursor = "pointer";
    head.style.userSelect = "none";
    return { head, indicator };
  }

  function makeControl(c, container) {
    const key = c.key;
    const current = state[key];

    /* ---- special: text ---- */
    if (c.special === "text") {
      const row = document.createElement("div");
      row.className = "ctrl-row text-row";
      const label = document.createElement("label");
      label.title = "[" + key + "] " + (c.details || "");
      label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
      const ta = document.createElement("textarea");
      ta.value = String(current ?? "");
      ta.dataset.key = key;
      ta.addEventListener("input", () => {
        state[key] = ta.value;
        if (selected) selected.layoutText();
      });
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "↺";
      resetBtn.addEventListener("click", () => {
        state[key] = c.def;
        ta.value = c.def;
        if (selected) selected.layoutText();
      });
      row.appendChild(label);
      row.appendChild(ta);
      row.appendChild(resetBtn);
      container.appendChild(row);
      return;
    }

    /* ---- special: font (handled by the dropdown) ---- */
    if (c.special === "font") return;

    /* ---- special: gradient ---- */
    if (c.special === "gradient") {
      const row = document.createElement("div");
      row.className = "ctrl-row";
      row.style.gridColumn = "1 / -1";
      row.style.display = "block";
      row.style.margin = "6px 0 10px 0";

      const label = document.createElement("label");
      label.title = "[" + key + "] " + (c.details || "");
      label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
      label.style.display = "block";
      label.style.marginBottom = "4px";

      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "↺";
      resetBtn.style.marginLeft = "4px";
      resetBtn.addEventListener("click", () => {
        const copy = deepClone(c.def);
        state[key] = copy;
        if (gradientEditors[key]) gradientEditors[key].setStops(copy);
      });
      label.appendChild(resetBtn);
      row.appendChild(label);

      const mount = document.createElement("div");
      row.appendChild(mount);
      container.appendChild(row);

      const editor = new GradientEditor(mount, {
        stops: state[key],
        minStops: 1,
        maxStops: 16,
        decimals: 3,
        onChange: (newStops) => { state[key] = newStops; },
      });
      gradientEditors[key] = editor;
      return;
    }

    /* ---- special: colour ---- */
    if (c.special === "color") {
      const row = document.createElement("div");
      row.className = "ctrl-row label-wide";
      const label = document.createElement("label");
      label.title = "[" + key + "] " + (c.details || "");
      label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = current;
      colorInput.dataset.key = key;
      colorInput.addEventListener("input", () => {
        state[key] = colorInput.value;
      });
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "↺";
      resetBtn.addEventListener("click", () => {
        state[key] = c.def;
        colorInput.value = c.def;
      });
      row.appendChild(label);
      row.appendChild(colorInput);
      row.appendChild(resetBtn);
      container.appendChild(row);
      return;
    }

    /* ---- special: bool ---- */
    if (c.special === "bool") {
      const row = document.createElement("div");
      row.className = "ctrl-row label-wide";
      const label = document.createElement("label");
      label.title = "[" + key + "] " + (c.details || "");
      label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!current;
      cb.dataset.key = key;
      cb.addEventListener("change", () => {
        state[key] = cb.checked ? 1 : 0;
      });
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "↺";
      resetBtn.addEventListener("click", () => {
        state[key] = c.def;
        cb.checked = !!c.def;
      });
      row.appendChild(label);
      row.appendChild(cb);
      row.appendChild(resetBtn);
      container.appendChild(row);
      return;
    }

    /* ---- normal slider + number ---- */
    const isInt = !!c.int;
    const row = document.createElement("div");
    row.className = "ctrl-row";
    const label = document.createElement("label");
    label.title = "[" + key + "] " + (c.details || "");
    const iconSpan = document.createElement("span");
    iconSpan.style.display = "inline-block";
    iconSpan.style.width = "1.6em";
    iconSpan.style.textAlign = "center";
    iconSpan.style.marginRight = "2px";
    iconSpan.textContent = c.icon || "";
    label.appendChild(iconSpan);
    label.appendChild(document.createTextNode(c.label || key));

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = c.min; slider.max = c.max; slider.step = c.step;
    slider.value = current;
    slider.dataset.key = key;

    const number = document.createElement("input");
    number.type = "number";
    number.step = c.step;
    number.value = isInt ? String(Math.round(current)) : fmtVal(current);
    number.dataset.key = key;

    const resetBtn = document.createElement("button");
    resetBtn.className = "reset-btn";
    resetBtn.textContent = "↺";

    function onValueChange(v) {
      if (isInt) v = Math.round(v);
      state[key] = v;
      if (RECOMPUTE_KEYS.has(key)) scheduleRecompute();
    }

    slider.addEventListener("input", () => {
      const v = parseFloat(slider.value);
      state[key] = isInt ? Math.round(v) : v;
      number.value = isInt ? String(state[key]) : fmtVal(state[key]);
      if (RECOMPUTE_KEYS.has(key)) scheduleRecompute();
    });
    slider.addEventListener("change", () => {
      onValueChange(parseFloat(slider.value));
    });

    number.addEventListener("change", () => {
      let v = parseFloat(number.value);
      if (isNaN(v)) { number.value = fmtVal(state[key]); return; }
      if (isInt) v = Math.max(c.min, Math.min(c.max, Math.round(v)));
      state[key] = v;
      slider.value = v;
      number.value = isInt ? String(v) : fmtVal(v);
      if (RECOMPUTE_KEYS.has(key)) scheduleRecompute();
    });

    resetBtn.addEventListener("click", () => {
      state[key] = c.def;
      slider.value = c.def;
      number.value = isInt ? String(Math.round(c.def)) : fmtVal(c.def);
      if (RECOMPUTE_KEYS.has(key)) scheduleRecompute();
    });

    row.appendChild(label);
    row.appendChild(slider);
    row.appendChild(number);
    row.appendChild(resetBtn);
    container.appendChild(row);
  }

  CONTROLS.forEach((group, gi) => {
    const { head, indicator } = makeHeading(group.heading, gi === 0, group);

    const body = document.createElement("div");
    body.className = "ctrl-group-body";

    let initialCollapsed = !group.openByDefault;
    try {
      const savedMap = JSON.parse(localStorage.getItem("ctrlGroupsCollapsed") || "{}");
      if (group.heading in savedMap) initialCollapsed = !!savedMap[group.heading];
    } catch (_) {}
    if (initialCollapsed) body.classList.add("collapsed");

    group.controls.forEach(c => makeControl(c, body));

    function syncIndicator() {
      indicator.textContent = body.classList.contains("collapsed") ? "▶" : "▼";
    }
    syncIndicator();

    head.addEventListener("click", e => {
      if (e.target.closest("button")) return;
      body.classList.toggle("collapsed");
      syncIndicator();
      try {
        const map = JSON.parse(localStorage.getItem("ctrlGroupsCollapsed") || "{}");
        map[group.heading] = body.classList.contains("collapsed");
        localStorage.setItem("ctrlGroupsCollapsed", JSON.stringify(map));
      } catch (_) {}
    });

    list.appendChild(head);
    list.appendChild(body);
  });
}

function isControlRandomisable(c) {
  if (c.canRandomise === false) return false;
  if (c.canRandomise === true) return true;
  if (c.special) return false;
  if (typeof c.min !== "number" || typeof c.max !== "number") return false;
  return true;
}

function randomiseGroup(group, btn) {
  if (!group || !group.controls) return;
  group.controls.forEach(c => {
    if (!isControlRandomisable(c)) return;
    const k = c.key;
    let v;
    if (c.int) {
      const lo = Math.ceil(c.min), hi = Math.floor(c.max);
      v = lo + Math.floor(Math.random() * (hi - lo + 1));
    } else {
      v = c.min + Math.random() * (c.max - c.min);
      if (c.step > 0) {
        v = c.min + Math.round((v - c.min) / c.step) * c.step;
        if (v > c.max) v = c.max;
        if (v < c.min) v = c.min;
      }
    }
    state[k] = v;
  });
  refreshControlsUI();
  recomputeFromCFG();
  if (btn) {
    const old = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = old; }, 400);
  }
}

function refreshControlsUI() {
  if (!state) return;
  Object.keys(DEFAULTS).forEach(key => {
    const v = state[key];
    const isInt = !!INT_KEYS[key];
    const c = CONTROL_BY_KEY[key];
    if (!c) return;
    const val = isInt ? Math.round(v) : v;

    document.querySelectorAll('input[type=range][data-key="' + key + '"]').forEach(s => {
      s.min = c.min; s.max = c.max; s.step = c.step; s.value = val;
    });
    document.querySelectorAll('input[type=number][data-key="' + key + '"]').forEach(n => {
      n.step = c.step; n.value = isInt ? String(val) : fmtVal(val);
    });
    document.querySelectorAll('input[type=color][data-key="' + key + '"]').forEach(ci => {
      ci.value = v;
    });
    document.querySelectorAll('input[type=checkbox][data-key="' + key + '"]').forEach(cb => {
      cb.checked = !!v;
    });
    document.querySelectorAll('textarea[data-key="' + key + '"]').forEach(ta => {
      if (document.activeElement !== ta) ta.value = String(v ?? "");
    });
  });

  const sel = document.getElementById('font-select');
  if (sel && typeof state.fontFamily === 'string') {
    sel.value = state.fontFamily;
    sel.style.fontFamily = fontStackFor(state.fontFamily);
  }
}

function syncGradientEditors() {
  if (!state) return;
  Object.keys(gradientEditors).forEach(k => {
    gradientEditors[k].setStops(state[k]);
  });
}

/* ==================================================================
   PRESET MANAGEMENT
   ================================================================== */
const groupClipboard = {};

function copyGroup(group, btn) {
  const vals = {};
  group.controls.forEach(c => { vals[c.key] = deepClone(state[c.key]); });
  groupClipboard[group.heading] = vals;
  if (btn) btn.textContent = "✓";
}

function pasteGroup(group, btn) {
  const vals = groupClipboard[group.heading];
  if (!vals) {
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "—";
      setTimeout(() => { btn.textContent = old; }, 400);
    }
    return;
  }
  group.controls.forEach(c => {
    if (!(c.key in vals)) return;
    let v = deepClone(vals[c.key]);
    if (INT_KEYS[c.key]) v = Math.round(v);
    state[c.key] = v;
  });
  refreshControlsUI();
  recomputeFromCFG();
  syncGradientEditors();
}

function buildPresetDropdown() {
  const sel = document.getElementById("preset-select");
  sel.innerHTML = "";
  PRESETS.forEach((p, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = (p.name || "Unnamed") + " (iter " + (p.iteration || "?") + ")";
    sel.appendChild(opt);
  });
}

function loadPreset(idx) {
  const p = PRESETS[idx];
  if (!p) return;

  const target = {};
  Object.keys(DEFAULTS).forEach(key => {
    if (STANDALONE_KEYS[key]) {
      target[key] = state[key];
    } else if (p.values && key in p.values) {
      target[key] = deepClone(p.values[key]);
    } else {
      target[key] = deepClone(DEFAULTS[key]);
    }
  });
  Object.keys(INT_KEYS).forEach(k => { target[k] = Math.round(target[k]); });

  const transitionTime = state.presetTransitionTime;
  if (transitionTime > 0) {
    transitionSource = Object.assign({}, state);
    transitionTarget = target;
    transitionActive = true;
    transitionStartTime = performance.now();
    transitionDuration = transitionTime * 1000;

    ["strokeEnabled", "trailZoomOnRing", "cacheEmoji", "fontFamily", "text"].forEach(k => {
      if (k in target && !STANDALONE_KEYS[k]) state[k] = target[k];
    });
    refreshControlsUI();
    if (selected) selected.layoutText();
  } else {
    transitionActive = false;
    Object.keys(DEFAULTS).forEach(key => {
      if (STANDALONE_KEYS[key]) return;
      state[key] = target[key];
    });
    refreshControlsUI();
    recomputeFromCFG();
    syncGradientEditors();
  }
}

function currentValuesAsJSON() {
  const vals = {};
  Object.keys(DEFAULTS).forEach(key => {
    if (STANDALONE_KEYS[key]) return;
    const v = INT_KEYS[key] ? Math.round(state[key]) : state[key];
    if (JSON.stringify(v) !== JSON.stringify(DEFAULTS[key])) vals[key] = deepClone(v);
  });
  return vals;
}

function setupControlHandlers() {
  document.getElementById("toggle-panel").addEventListener("click", () => {
    document.getElementById("controls-body").classList.toggle("collapsed");
  });

  /* ---- Add Circle button, injected into the presets row ---- */
  const presetsRow = document.getElementById("presets-row");
  if (presetsRow) {
    const addBtn = document.createElement("button");
    addBtn.id = "btn-add-circle";
    addBtn.textContent = "➕ Add";
    addBtn.title = "Spawn a new circle using the current settings";
    addBtn.addEventListener("click", () => addCircle());
    presetsRow.appendChild(addBtn);

    const selBtn = document.createElement("button");
    selBtn.id = "btn-select-circle";
    selBtn.textContent = "◎ 1/1";
    selBtn.title = "Cycle which circle the controls edit";
    selBtn.style.display = "none";
    selBtn.addEventListener("click", () => cycleSelection());
    presetsRow.appendChild(selBtn);
  }

  document.getElementById("btn-load-preset").addEventListener("click", () => {
    loadPreset(parseInt(document.getElementById("preset-select").value, 10));
  });
  document.getElementById("btn-reset-all").addEventListener("click", () => {
    transitionActive = false;
    Object.keys(DEFAULTS).forEach(k => {
      if (STANDALONE_KEYS[k]) return;
      state[k] = deepClone(DEFAULTS[k]);
    });
    Object.keys(INT_KEYS).forEach(k => { state[k] = Math.round(state[k]); });
    refreshControlsUI();
    recomputeFromCFG();
    syncGradientEditors();
  });
  document.getElementById("btn-json").addEventListener("click", () => {
    let maxIter = 0;
    PRESETS.forEach(p => { if (p.iteration > maxIter) maxIter = p.iteration; });
    const nextIter = maxIter + 1;
    const preset = { name: "Preset " + nextIter, iteration: nextIter, values: currentValuesAsJSON() };
    console.log(JSON.stringify(preset, null, 4));
  });
}

/* ==================================================================
   FONT DROPDOWN
   ================================================================== */
const FONT_OPTIONS = [
  { value: 'system-ui, -apple-system, "Segoe UI", sans-serif', label: 'System (Default)' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Press Start 2P', label: 'Press Start 2P' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Bangers', label: 'Bangers' },
  { value: 'Creepster', label: 'Creepster' },
  { value: 'Lobster', label: 'Lobster' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'VT323', label: 'VT323' },
  { value: 'Courier Prime', label: 'Courier Prime' },
  { value: 'Comic Neue', label: 'Comic Neue' },
  { value: 'Bungee Outline', label: 'Bungee Outline' },
  { value: 'Rock Salt', label: 'Rock Salt' },
  { value: 'Henny Penny', label: 'Henny Penny' },
  { value: 'Kablammo', label: 'Kablammo' },
  { value: 'Schoolbell', label: 'Schoolbell' },
  { value: 'Finger Paint', label: 'Finger Paint' },
  { value: 'Indie Flower', label: 'Indie Flower' },
  { value: 'Princess Sofia', label: 'Princess Sofia' },
  { value: 'Lily Script One', label: 'Lily Script One' },
  { value: 'Crafty Girls', label: 'Crafty Girls' },
  { value: 'Mountains of Christmas', label: 'Mountains of Christmas' },
  { value: 'Rubik Storm', label: 'Rubik Storm' },
  { value: 'Rubik Spray Paint', label: 'Rubik Spray Paint' },
];

function fontStackFor(value) {
  if (value.indexOf(',') >= 0) return value;
  return "'" + value + "', monospace";
}

function setupFontDropdown() {
  const sel = document.getElementById("font-select");
  sel.innerHTML = "";

  for (const f of FONT_OPTIONS) {
    const opt = document.createElement("option");
    opt.value = f.value;
    opt.textContent = f.label;
    opt.style.fontFamily = fontStackFor(f.value);
    opt.style.fontSize = "14px";
    sel.appendChild(opt);
  }

  sel.value = state.fontFamily;
  sel.style.fontFamily = fontStackFor(state.fontFamily);

  sel.addEventListener("change", () => {
    const v = sel.value;
    state.fontFamily = v;
    sel.style.fontFamily = fontStackFor(v);
    if (selected) {
      selected.emojiCache.clear();
      selected.layoutText();
    }
  });
}

/* ==================================================================
   RESIZE
   ================================================================== */
let prevUnit = 0;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  resizeScratch();
}

function onResize() {
  if (__destroyed) return;
  const oldUnit = prevUnit;
  const oldW = W, oldH = H;

  resize();

  const newUnit = Math.min(W, H);
  const ru = (oldUnit > 0 && oldW > 0 && oldH > 0) ? newUnit / oldUnit : 1;

  for (const sp of spinners) {
    sp.computeSizes();
    if (oldW > 0 && oldH > 0) {
      sp.body.x *= W / oldW;
      sp.body.y *= H / oldH;
      sp.body.vx *= ru;
      sp.body.vy *= ru;
    }
    sp.layoutText();
    sp.clampBody();
    sp.initRing();
  }

  prevUnit = newUnit;
}
window.addEventListener('resize', onResize);

/* ==================================================================
   NAMED LISTENERS (so they can be removed on teardown)
   ================================================================== */
function onKeyDown(e) {
  if (e.key === 'h' || e.key === 'H') {
    const p = document.getElementById('controls-panel');
    if (p) p.style.display = (p.style.display === 'none') ? '' : 'none';
  }
}

function onCanvasClick(e) {
  const hit = pickSpinner(e.clientX, e.clientY);
  if (hit && hit !== selected) { selectSpinner(hit); return; }
  const p = document.getElementById('controls-panel');
  if (p) p.style.display = (p.style.display === 'none') ? '' : 'none';
}

/* ==================================================================
   BOOT
   ================================================================== */
function init() {
  if (__destroyed) return;

  resize();

  /* first circle from the defaults */
  const cfg = deepClone(DEFAULTS);
  const sp = new Spinner(cfg);
  sp.resetBody();
  sp.initRing();
  spinners.push(sp);
  selected = sp;
  state = sp.cfg;

  prevUnit = Math.min(W, H);

  buildControlsUI();
  buildPresetDropdown();
  setupControlHandlers();
  setupFontDropdown();
  updateSelLabel();

  canvas.addEventListener('click', onCanvasClick);
  window.addEventListener('keydown', onKeyDown);

  rafId = requestAnimationFrame(frame);
  window.animationFrameId = rafId;
}

// =====================================================================
// TEARDOWN HANDLE
// =====================================================================
const api = {
  destroy() {
    __destroyed = true;

    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }

    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    if (canvas) canvas.removeEventListener('click', onCanvasClick);

    spinners.length = 0;   // drops every Spinner, its rings and emoji cache
    selected = null;
    state = null;

    Object.keys(gradientEditors).forEach(k => { delete gradientEditors[k]; });

    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (gradScript && gradScript.parentNode) gradScript.parentNode.removeChild(gradScript);

    // release the scratch backing store too
    scratch.width = 0;
    scratch.height = 0;
  }
};
window.__spinnerApp = api;

// =====================================================================
// BOOT
// =====================================================================
var currentScriptUrl = document.currentScript.src;

var gradScript = document.createElement("script");
gradScript.src = new URL("gradient-editor.js", currentScriptUrl).href;
gradScript.onload = function () {
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
    } else {
        init();
    }
};
gradScript.onerror = function () {
    console.error("Failed to load gradient-editor.js");
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
    } else {
        init();
    }
};

document.head.appendChild(gradScript);
})();