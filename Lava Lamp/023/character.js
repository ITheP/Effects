// =====================================================================
// lava-character.js
// External character simulation for the lava lamp.
// Exposes window.LavaCharacter.
// Types: 0=Surface, 1=Bounce, 2=Float.
// =====================================================================
(function () {
'use strict';

var TYPE_SURFACE = 0;
var TYPE_BOUNCE  = 1;
var TYPE_FLOAT   = 2;

// ------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------
var DEFAULTS = {
    charText:            "ABCDEFG",
    charSpeed:           6,
    charSpeedLink:       1.0,
    charChangeOnBounce:  0,
    charSize:            0.028,
    charColor:           "#ffffff",
    charOutline:         1,
    charMargin:          0.08,
    charSpawnHeight:     0.6,
    charSpawnX:          0.5,

    charSizeVariance:          0.20,
    charGravityVariance:       0.15,
    charGripVariance:          0.15,
    charRunSpeedVariance:      0.25,
    charStruggleVariance:      0.20,
    charAttractionVariance:    0.20,

    charColorSurface:    "#ffffff",
    charGravity:         1.0,
    charGrip:            1.0,
    charRunSpeed:        0.18,
    charStruggle:        1.0,
    charAttraction:      1.0,

    charColorBounce:     "#ffd24a",
    charBounce:          0.4,
    charBounceMin:       0.85,
    charMinBounceSpeed:  0.15,
    charBounceSpin:      15.0,
    charBounceSpinDrag:  1.5,
    charBounceVariance:      0.20,
    charBounceMinVariance:   0.15,
    charMinBounceSpeedVariance: 0.25,

    charColorFloat:      "#8fd6ff",
    charFloatBounce:     1.0,
    charFloatMinBounce:  0.15,
    charFloatSpin:       30.0,
    charFloatSpinDrag:   1.5,
    charFloatBounceVariance:   0.20,
    charFloatMinBounceVariance: 0.25,
};

var AIR_DRAG        = 1.5;
var TERMINAL_CAP    = 2.0;
var FLOAT_MIN_SPEED = 0.05;
var FLOAT_DRAG      = 0.15;

// ------------------------------------------------------------------
// Input tracking & aim point
// ------------------------------------------------------------------
var keys = { left: false, right: false };
var mouse = { x: 0.5, y: 0.5 };
var aimPoint = { x: 0.5, y: 0.5 };
var canvasEl = null;
var lastEnv = null;

function updateMouseFromEvent(e) {
    if (!canvasEl) {
        canvasEl = document.querySelector('canvas');
        if (!canvasEl) return;
    }
    var rect = canvasEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    var px = (e.clientX - rect.left) / rect.width;
    var py = (e.clientY - rect.top) / rect.height;
    var asp = canvasEl.width / canvasEl.height;
    mouse.x = px * asp;
    mouse.y = 1 - py;
    aimPoint.x = mouse.x;
    aimPoint.y = mouse.y;
}

window.addEventListener('mousemove', updateMouseFromEvent);
window.addEventListener('mousedown', updateMouseFromEvent);
window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { keys.left  = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
});
window.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft')  keys.left  = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// ------------------------------------------------------------------
// Instance array
// ------------------------------------------------------------------
var instances = [];

function createInstance() {
    return {
        x: 0, y: 0, vx: 0, vy: 0,
        type: TYPE_SURFACE,
        attached: false,
        fwdX: 1, fwdY: 0,
        frameIdx: 0, frameTimer: 0, wallCooldown: 0,
        lastSdf: null, _inited: false,
        _spawnSpeed: undefined,
        sizeMul: 1, gravityMul: 1, bounceMul: 1, bounceMinMul: 1,
        minBounceSpeedMul: 1, gripMul: 1, runSpeedMul: 1,
        struggleMul: 1, attractMul: 1,
        floatBounceMul: 1, floatMinBounceMul: 1,
        spin: 0, angle: 0,
        isPlayer: false,
    };
}

function varianceMul(v) {
    if (!v || v <= 0) return 1.0;
    return Math.max(0.1, 1 + (Math.random() * 2 - 1) * v);
}
function rollTraits(inst, st) {
    inst.sizeMul             = varianceMul(st.charSizeVariance);
    inst.gravityMul          = varianceMul(st.charGravityVariance);
    inst.bounceMul           = varianceMul(st.charBounceVariance);
    inst.bounceMinMul        = varianceMul(st.charBounceMinVariance);
    inst.minBounceSpeedMul   = varianceMul(st.charMinBounceSpeedVariance);
    inst.gripMul             = varianceMul(st.charGripVariance);
    inst.runSpeedMul         = varianceMul(st.charRunSpeedVariance);
    inst.struggleMul         = varianceMul(st.charStruggleVariance);
    inst.attractMul          = varianceMul(st.charAttractionVariance);
    inst.floatBounceMul      = varianceMul(st.charFloatBounceVariance);
    inst.floatMinBounceMul   = varianceMul(st.charFloatMinBounceVariance);
}

function effSize(st, inst)       { return st.charSize       * (inst.sizeMul     || 1); }
function effGravity(st, inst)    { return st.charGravity    * (inst.gravityMul  || 1); }
function effBounce(st, inst)     { return Math.max(0, Math.min(1, st.charBounce * (inst.bounceMul || 1))); }
function effBounceMin(st, inst)  { return Math.max(0, Math.min(1, st.charBounceMin * (inst.bounceMinMul || 1))); }
function effMinBounceSpeed(st, inst) {
    return Math.max(0, st.charMinBounceSpeed * (inst.minBounceSpeedMul || 1));
}
function effGrip(st, inst)       { return st.charGrip       * (inst.gripMul     || 1); }
function effRunSpeed(st, inst)   { return st.charRunSpeed   * (inst.runSpeedMul || 1); }
function effStruggle(st, inst)   { return st.charStruggle   * (inst.struggleMul || 1); }
function effAttraction(st, inst) { return st.charAttraction * (inst.attractMul  || 1); }
function effFloatBounce(st, inst) {
    return Math.max(0, st.charFloatBounce * (inst.floatBounceMul || 1));
}
function effFloatMinBounce(st, inst) {
    return Math.max(0, st.charFloatMinBounce * (inst.floatMinBounceMul || 1));
}
function effColor(st, inst) {
    if (inst.type === TYPE_BOUNCE) return st.charColorBounce || st.charColor || "#ffffff";
    if (inst.type === TYPE_FLOAT)  return st.charColorFloat  || st.charColor || "#ffffff";
    return st.charColorSurface || st.charColor || "#ffffff";
}

function resetInstance(inst, env) {
    var st = env.state;

    // ---- Player special spawn ----
    if (inst.isPlayer) {
        var poolLv = (st.poolActive > 0.5) ? (st.poolLevel || 0.1) : 0.1;
        inst.x = env.aspect * 0.5;
        inst.y = poolLv + 0.05;
        inst.vx = 0; inst.vy = 0;
        inst.attached = false;
        inst.fwdX = 1; inst.fwdY = 0;
        inst.frameIdx = 0; inst.frameTimer = 0;
        inst.wallCooldown = 0;
        inst.lastSdf = null;
        inst.spin = 0; inst.angle = 0;
        inst._spawnSpeed = undefined;
        return;
    }

    var type = inst.type || TYPE_SURFACE;
    var runSpeed = effRunSpeed(st, inst);

    inst.attached = false;
    inst.fwdX = (Math.random() < 0.5) ? 1 : -1;
    inst.fwdY = 0;
    inst.frameIdx = 0;
    inst.frameTimer = 0;
    inst.wallCooldown = 0;
    inst.lastSdf = null;
    inst.spin = 0;
    inst.angle = 0;
    inst._spawnSpeed = undefined;

    if (type === TYPE_FLOAT) {
        inst.x = env.aspect * (0.15 + Math.random() * 0.7);
        inst.y = 0.15 + Math.random() * 0.7;
        var ang = Math.random() * Math.PI * 2;
        var sp  = runSpeed * (1.0 + Math.random());
        inst.vx = Math.cos(ang) * sp;
        inst.vy = Math.sin(ang) * sp;
        inst.spin = (Math.random() - 0.5) * 4.0;
        var s0 = sdfAt(inst.x, inst.y, env);
        if (s0.sdf > 0) {
            var p0 = projectToSurface(inst.x, inst.y, env, 8);
            inst.x = p0.x; inst.y = p0.y;
        }
    } else if (type === TYPE_BOUNCE) {
        inst.x = env.aspect * (0.2 + Math.random() * 0.6);
        inst.y = 1.0 + ((st.charSpawnHeight || 0.6) * Math.random());
        inst.vx = (Math.random() - 0.5) * runSpeed * 2;
        inst.vy = 0;
        inst.spin = (Math.random() - 0.5) * 3.0;
    } else {
        var sx = (st.charSpawnX      !== undefined) ? st.charSpawnX      : 0.5;
        var sh = (st.charSpawnHeight !== undefined) ? st.charSpawnHeight : 0.6;
        inst.x = env.aspect * Math.max(0.05, Math.min(0.95, sx + (Math.random() - 0.5) * 0.30));
        inst.y = 1.0 + sh + Math.random() * 0.40;
        inst.vx = 0; inst.vy = 0;
    }
}

function requestSpawn(type) {
    var inst = createInstance();
    inst.type = (type === undefined) ? TYPE_SURFACE : type;
    instances.push(inst);
}
function requestRemove() {
    // Never remove the player
    for (var i = instances.length - 1; i >= 0; i--) {
        if (!instances[i].isPlayer) {
            instances.splice(i, 1);
            return;
        }
    }
}
function resetAllInstances() {
    instances.length = 0;
    var player = createInstance();
    player.type = TYPE_SURFACE;
    player.isPlayer = true;
    instances.push(player);
}
function destroyAll() { instances.length = 0; }

// ------------------------------------------------------------------
// CONTROLS
// ------------------------------------------------------------------
var _subheadingIdx = 0;
function subheading(label) {
    return { special: "subheading", key: "_sh_" + (_subheadingIdx++), label: label, def: 0, savedInPreset: false };
}

var CONTROLS_GROUP = {
    heading: "🐛 Character",
    openByDefault: false,
    showExtras: false,
    controls: [
        { icon: "🔤", key: "charText",           def: DEFAULTS.charText,           special: "text", label: "Characters",         savedInPreset: false, details: "String of characters cycled through." },
        { icon: "🟢", key: "charAddSurface",     special: "button", buttonText: "Add Surface", label: "Surface",  savedInPreset: false, details: "Spawn a Surface-type character.",
          action: function () { requestSpawn(TYPE_SURFACE); } },
        { icon: "🔴", key: "charAddBounce",      special: "button", buttonText: "Add Bounce",  label: "Bounce",   savedInPreset: false, details: "Spawn a Bounce-type character.",
          action: function () { requestSpawn(TYPE_BOUNCE); } },
        { icon: "🔵", key: "charAddFloat",       special: "button", buttonText: "Add Float",   label: "Float",    savedInPreset: false, details: "Spawn a Float-type character.",
          action: function () { requestSpawn(TYPE_FLOAT); } },
        { icon: "➖", key: "charRemove",         special: "button", buttonText: "Remove",      label: "Remove",   savedInPreset: false, details: "Remove the last-spawned character.",
          action: function () { requestRemove(); } },

        { icon: "⏱️", key: "charSpeed",          def: DEFAULTS.charSpeed,          min: 0,    max: 30,  step: 0.1,  label: "Char Speed",        savedInPreset: false, details: "Reference character rate at normal run speed." },
        { icon: "🏃", key: "charSpeedLink",      def: DEFAULTS.charSpeedLink,      min: 0,    max: 3,   step: 0.01, label: "Speed Link",        savedInPreset: false, details: "0 = flat. 1 = proportional to actual speed." },
        { icon: "🎯", key: "charChangeOnBounce", def: DEFAULTS.charChangeOnBounce, special: "bool", label: "Change on Bounce", savedInPreset: false, details: "Change character only on bounces and wall reversals." },

        { icon: "📏", key: "charSize",           def: DEFAULTS.charSize,           min: 0.005,max: 0.15,step: 0.001,label: "Char Size",         savedInPreset: false, details: "Font size (screen height units)." },
        { icon: "📐", key: "charSizeVariance",   def: DEFAULTS.charSizeVariance,   min: 0,    max: 2,   step: 0.01, label: "Size Variance",     savedInPreset: false, details: "Per-instance multiplier on Char Size." },
        { icon: "🎨", key: "charColor",          def: DEFAULTS.charColor,          special: "color", label: "Fallback Colour",      savedInPreset: false, details: "Used if a per-type colour is unset." },
        { icon: "🌑", key: "charOutline",        def: DEFAULTS.charOutline,        special: "bool", label: "Outline",          savedInPreset: false, details: "Dark outline for readability." },
        { icon: "📐", key: "charMargin",         def: DEFAULTS.charMargin,         min: 0,    max: 1,   step: 0.01, label: "Margin",            savedInPreset: false, details: "Gap between glyph baseline and surface (Surface type)." },
        { icon: "🚀", key: "charSpawnHeight",    def: DEFAULTS.charSpawnHeight,    min: 0.1,  max: 3,   step: 0.01, label: "Spawn Height",      savedInPreset: false, details: "Spawn offset above the top of the screen." },
        { icon: "↔️", key: "charSpawnX",        def: DEFAULTS.charSpawnX,         min: 0,    max: 1,   step: 0.01, label: "Spawn X",           savedInPreset: false, details: "Horizontal spawn reference (0 = left, 1 = right)." },

        subheading("🟢 Surface"),
        { icon: "🎨", key: "charColorSurface",   def: DEFAULTS.charColorSurface,   special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Surface type." },
        { icon: "🌍", key: "charGravity",        def: DEFAULTS.charGravity,        min: 0,    max: 20,  step: 0.01, label: "Gravity",           savedInPreset: false, details: "Fall acceleration." },
        { icon: "🌍", key: "charGravityVariance",def: DEFAULTS.charGravityVariance,min: 0,    max: 2,   step: 0.01, label: "Gravity Variance",  savedInPreset: false, details: "Per-instance multiplier on Gravity." },
        { icon: "🖐️", key: "charGrip",          def: DEFAULTS.charGrip,           min: 0,    max: 1,   step: 0.01, label: "Grip",              savedInPreset: false, details: "Attach threshold on landing." },
        { icon: "🖐️", key: "charGripVariance",  def: DEFAULTS.charGripVariance,   min: 0,    max: 2,   step: 0.01, label: "Grip Variance",     savedInPreset: false, details: "Per-instance multiplier on Grip." },
        { icon: "🏃", key: "charRunSpeed",       def: DEFAULTS.charRunSpeed,       min: 0.01, max: 2,   step: 0.01, label: "Run Speed",         savedInPreset: false, details: "Base run speed. Also Float drift reference." },
        { icon: "🏃", key: "charRunSpeedVariance", def: DEFAULTS.charRunSpeedVariance, min: 0, max: 2, step: 0.01, label: "Run Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Run Speed." },
        { icon: "💪", key: "charStruggle",       def: DEFAULTS.charStruggle,       min: 0,    max: 5,   step: 0.01, label: "Struggle",          savedInPreset: false, details: "Uphill slowdown amount." },
        { icon: "💪", key: "charStruggleVariance", def: DEFAULTS.charStruggleVariance, min: 0, max: 2, step: 0.01, label: "Struggle Variance", savedInPreset: false, details: "Per-instance multiplier on Struggle." },
        { icon: "🧲", key: "charAttraction",     def: DEFAULTS.charAttraction,     min: 0.1,  max: 5,   step: 0.01, label: "Attraction",        savedInPreset: false, details: "Surface adhesion." },
        { icon: "🧲", key: "charAttractionVariance", def: DEFAULTS.charAttractionVariance, min: 0, max: 2, step: 0.01, label: "Attraction Variance", savedInPreset: false, details: "Per-instance multiplier on Attraction." },

        subheading("🔴 Bounce"),
        { icon: "🎨", key: "charColorBounce",    def: DEFAULTS.charColorBounce,    special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Bounce type." },
        { icon: "🏀", key: "charBounce",         def: DEFAULTS.charBounce,         min: 0,    max: 1,   step: 0.01, label: "Bounce",            savedInPreset: false, details: "Base restitution." },
        { icon: "🏀", key: "charBounceVariance", def: DEFAULTS.charBounceVariance, min: 0,    max: 2,   step: 0.01, label: "Bounce Variance",   savedInPreset: false, details: "Per-instance multiplier on Bounce." },
        { icon: "🎚️", key: "charBounceMin",     def: DEFAULTS.charBounceMin,      min: 0,    max: 1,   step: 0.01, label: "Bounce Min",        savedInPreset: false, details: "Restitution floor for Bounce type. Set to 1.0 for perpetual bouncing." },
        { icon: "🎚️", key: "charBounceMinVariance", def: DEFAULTS.charBounceMinVariance, min: 0, max: 2, step: 0.01, label: "Bounce Min Variance", savedInPreset: false, details: "Per-instance multiplier on Bounce Min." },
        { icon: "⚡", key: "charMinBounceSpeed", def: DEFAULTS.charMinBounceSpeed, min: 0, max: 2, step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor. Guarantees a minimum bounce height even at low incoming speed. Height ≈ V²/(2g)." },
        { icon: "⚡", key: "charMinBounceSpeedVariance", def: DEFAULTS.charMinBounceSpeedVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charBounceSpin",     def: DEFAULTS.charBounceSpin,     min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charBounceSpinDrag", def: DEFAULTS.charBounceSpinDrag, min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },

        subheading("🔵 Float"),
        { icon: "🎨", key: "charColorFloat",     def: DEFAULTS.charColorFloat,     special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Float type." },
        { icon: "🏀", key: "charFloatBounce",    def: DEFAULTS.charFloatBounce,    min: 0,    max: 3,   step: 0.01, label: "Energy",            savedInPreset: false, details: "Restitution multiplier on the floater's own normal velocity at impact. Above 1.0 GAINS energy (bounded by a per-instance ceiling)." },
        { icon: "🏀", key: "charFloatBounceVariance", def: DEFAULTS.charFloatBounceVariance, min: 0, max: 2, step: 0.01, label: "Energy Variance", savedInPreset: false, details: "Per-instance multiplier on Energy." },
        { icon: "⚡", key: "charFloatMinBounce", def: DEFAULTS.charFloatMinBounce, min: 0,    max: 2,   step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor on mesh impacts. Ensures stationary floaters still get knocked away when a blob engulfs them." },
        { icon: "⚡", key: "charFloatMinBounceVariance", def: DEFAULTS.charFloatMinBounceVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charFloatSpin",      def: DEFAULTS.charFloatSpin,      min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charFloatSpinDrag",  def: DEFAULTS.charFloatSpinDrag,  min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },
    ]
};

// ==================================================================
// FIELD
// ==================================================================
function smoothstep(edge0, edge1, x) {
    var t = (x - edge0) / (edge1 - edge0);
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return t * t * (3 - 2 * t);
}
function fieldAt(px, py, env) {
    var st = env.state, time = env.time, blobs = env.blobs;
    var f = 0, gx = 0, gy = 0;
    var fadeHi = (st.poolActive > 0.5) ? st.poolLevel : 0.02;
    var fadeLo = fadeHi - 0.15;

    if (st.poolActive > 0.5) {
        var tW  = time * st.poolWaveSpeed;
        var ph  = st.poolWave * (0.6 * Math.sin(px * 7.0 + tW * 0.55) + 0.4 * Math.sin(px * 13.0 - tW * 0.90));
        var phP = st.poolWave * (0.6 * 7.0 * Math.cos(px * 7.0 + tW * 0.55) + 0.4 * 13.0 * Math.cos(px * 13.0 - tW * 0.90));
        var surf = st.poolLevel - st.poolSoftness * 2.07944 + ph;
        var soft = Math.max(st.poolSoftness, 0.001);
        var dm   = Math.max(py - surf, 0);
        var pf   = 8.0 * Math.exp(-dm / soft);
        f  += pf;
        gx += (pf / soft) * phP;
        gy += -pf / soft;
    }
    for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        if (b.r < 1e-5) continue;
        var yFade = smoothstep(fadeLo, fadeHi, b.y);
        if (yFade < 0.001) continue;
        var sy = Math.max(b.stretch, 1.0);
        var ang = b.stretchAngle, ca = Math.cos(ang), sa = Math.sin(ang);
        var qx = px - b.x, qy = py - b.y;
        var qrx = qx * ca + qy * sa, qry = -qx * sa + qy * ca;
        var qtx = qrx / sy, qty = qry * sy;
        var d2 = qtx * qtx + qty * qty + 1e-4;
        var r2 = b.r * b.r * yFade;
        f += r2 / d2;
        var inv = 1.0 / (d2 * d2);
        gx += -(r2 * inv) * (2.0 * (qtx * ca / sy - qty * sa * sy));
        gy += -(r2 * inv) * (2.0 * (qtx * sa / sy + qty * ca * sy));
    }
    return { f: f, gx: gx, gy: gy };
}
function sdfAt(px, py, env) {
    var r = fieldAt(px, py, env);
    var glen = Math.sqrt(r.gx * r.gx + r.gy * r.gy) || 1e-9;
    var thr = env.state.fieldThreshold;
    return { sdf: (r.f - thr) / glen, nx: -r.gx / glen, ny: -r.gy / glen, f: r.f, glen: glen };
}
function projectToSurface(px, py, env, maxIter) {
    var x = px, y = py;
    var thr = env.state.fieldThreshold;
    maxIter = maxIter || 6;
    for (var i = 0; i < maxIter; i++) {
        var r = fieldAt(x, y, env);
        var err = r.f - thr;
        var g2 = r.gx * r.gx + r.gy * r.gy;
        if (g2 < 1e-12) break;
        x += -err * r.gx / g2;
        y += -err * r.gy / g2;
        if (Math.abs(err) < 1e-4) break;
    }
    return { x: x, y: y };
}

// ==================================================================
// FRAMES
// ==================================================================
function charList(st) { return (st.charText && st.charText.length > 0) ? st.charText : "ABCDEFG"; }
function advanceFrame(inst, st) {
    var n = charList(st).length;
    if (n > 0) inst.frameIdx = (inst.frameIdx + 1) % n;
}
function bumpFrame(inst, st) {
    if (st.charChangeOnBounce) { advanceFrame(inst, st); inst.frameTimer = 0; }
}
function currentChar(inst, st) {
    var s = charList(st);
    return s.length > 0 ? s.charAt(inst.frameIdx % s.length) : "?";
}

// ==================================================================
// UPDATE
// ==================================================================
function update(inst, dt, env) {
    if (!(dt > 0)) return;
    dt = Math.min(dt, 0.05);
    if (inst.wallCooldown > 0) inst.wallCooldown -= dt;

    if (inst.type === TYPE_FLOAT) updateFloating(inst, dt, env);
    else if (inst.attached)       updateAttached(inst, dt, env);
    else                          updateFalling(inst, dt, env);

    var s = sdfAt(inst.x, inst.y, env);
    if (s.sdf > 0.001) {
        var p = projectToSurface(inst.x, inst.y, env, 8);
        inst.x = p.x; inst.y = p.y;
        s = sdfAt(inst.x, inst.y, env);
    }
    inst.lastSdf = s;

    if (!env.state.charChangeOnBounce) {
        var st = env.state;
        var speedMag = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
        var runRef = Math.max(0.01, effRunSpeed(st, inst));
        var speedNorm = Math.min(3.0, speedMag / runRef);
        var link = st.charSpeedLink || 0;
        var effectiveRate = Math.max(0.1, st.charSpeed * (1 + link * (speedNorm - 1)));
        var interval = 1.0 / Math.max(0.1, effectiveRate);
        inst.frameTimer += dt;
        var guard = 0;
        while (inst.frameTimer >= interval && guard++ < 16) {
            inst.frameTimer -= interval;
            advanceFrame(inst, st);
        }
    }
    if (!isFinite(inst.x) || !isFinite(inst.y)) resetInstance(inst, env);
}

function updateFalling(inst, dt, env) {
    var size = effSize(env.state, inst);
    var maxStep = (size || 0.03) + 0.01;
    var sp = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
    var travel = sp * dt;
    if (travel > maxStep) {
        var n = Math.min(12, Math.ceil(travel / maxStep));
        var sub = dt / n;
        for (var i = 0; i < n; i++) {
            stepFalling(inst, sub, env);
            if (inst.attached) return;
        }
    } else stepFalling(inst, dt, env);
}

function stepFalling(inst, dt, env) {
    var st = env.state;
    var asp = env.aspect;
    var size    = effSize(st, inst);
    var gravity = effGravity(st, inst);
    var bounce  = effBounce(st, inst);
    var grip    = effGrip(st, inst);
    if (inst.type === TYPE_BOUNCE) bounce = Math.max(bounce, effBounceMin(st, inst));

    if (inst.type === TYPE_BOUNCE) {
        var spinDrag = st.charBounceSpinDrag || 0;
        inst.angle += inst.spin * dt;
        if (spinDrag > 0) {
            inst.spin *= Math.exp(-spinDrag * dt);
            if (Math.abs(inst.spin) < 0.02) inst.spin = 0;
        }
    }

    inst.vy -= gravity * dt;

    if (inst.type !== TYPE_BOUNCE) {
        var dragK = Math.exp(-AIR_DRAG * dt);
        inst.vx *= dragK;
        inst.vy *= dragK;
    }

    if (inst.vy < -TERMINAL_CAP) inst.vy = -TERMINAL_CAP;
    if (inst.vy >  TERMINAL_CAP) inst.vy =  TERMINAL_CAP;
    if (inst.vx >  TERMINAL_CAP) inst.vx =  TERMINAL_CAP;
    if (inst.vx < -TERMINAL_CAP) inst.vx = -TERMINAL_CAP;

    inst.x += inst.vx * dt;
    inst.y += inst.vy * dt;

    var margin = Math.max(0.005, size * 0.5);

    if (inst.x < margin) {
        inst.x = margin;
        inst.vx = Math.abs(inst.vx) * bounce;
        if (inst.type === TYPE_BOUNCE) inst.spin += inst.vy * (st.charBounceSpin || 0) * 0.5;
        inst.fwdX = Math.abs(inst.fwdX || 1);
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    } else if (inst.x > asp - margin) {
        inst.x = asp - margin;
        inst.vx = -Math.abs(inst.vx) * bounce;
        if (inst.type === TYPE_BOUNCE) inst.spin += inst.vy * (st.charBounceSpin || 0) * 0.5;
        inst.fwdX = -Math.abs(inst.fwdX || 1);
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    }

    if (inst.y < -0.5) { resetInstance(inst, env); return; }
    if (inst.y > 2.0) { inst.y = 2.0; if (inst.vy > 0) inst.vy = 0; }

    var s = sdfAt(inst.x, inst.y, env);
    if (s.sdf > -0.002) {
        var vn = inst.vx * s.nx + inst.vy * s.ny;
        if (vn < -0.001) {
            var p = projectToSurface(inst.x, inst.y, env, 8);
            inst.x = p.x; inst.y = p.y;
            var s2 = sdfAt(inst.x, inst.y, env);
            var nx = s2.nx, ny = s2.ny;

            var vtBounce = inst.vx * (-ny) + inst.vy * nx;

            inst.vx -= (1 + bounce) * vn * nx;
            inst.vy -= (1 + bounce) * vn * ny;

            if (inst.type === TYPE_BOUNCE) {
                var outN = inst.vx * nx + inst.vy * ny;
                var minOut = effMinBounceSpeed(st, inst);
                if (outN < minOut) {
                    var boost = minOut - outN;
                    inst.vx += boost * nx;
                    inst.vy += boost * ny;
                }
                var eps = Math.max(0.003, size * 0.15);
                inst.x += nx * eps;
                inst.y += ny * eps;
                inst.spin += vtBounce * (st.charBounceSpin || 0);
            }

            bumpFrame(inst, st);

            if (inst.type === TYPE_SURFACE) {
                var normalSpeed = Math.abs(inst.vx * nx + inst.vy * ny);
                if (normalSpeed < grip * 0.35) {
                    inst.attached = true;
                    var tanV = inst.vx * (-ny) + inst.vy * nx;
                    var sx = (inst.fwdX >= 0) ? 1 : -1;
                    if (Math.abs(tanV) > 0.02) sx = (tanV > 0) ? 1 : -1;
                    inst.fwdX = -ny * sx;
                    inst.fwdY =  nx * sx;
                }
            }
        }
    }
}

// ------------------------------------------------------------------
// FLOAT
// ------------------------------------------------------------------
function updateFloating(inst, dt, env) {
    var st  = env.state;
    var asp = env.aspect;
    var size   = effSize(st, inst);
    var bounce = effFloatBounce(st, inst);
    var minOut = effFloatMinBounce(st, inst);
    var edgeBounce = Math.min(1, bounce);
    var spinGain = st.charFloatSpin || 0;
    var spinDrag = st.charFloatSpinDrag || 0;

    if (inst._spawnSpeed === undefined) {
        inst._spawnSpeed = Math.max(0.01, Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy));
    }
    var speedCeiling = inst._spawnSpeed * Math.max(1, bounce) * 2.0;

    inst.angle += inst.spin * dt;
    if (spinDrag > 0) {
        inst.spin *= Math.exp(-spinDrag * dt);
        if (Math.abs(inst.spin) < 0.02) inst.spin = 0;
    }

    var dragK = Math.exp(-FLOAT_DRAG * dt);
    inst.vx *= dragK;
    inst.vy *= dragK;

    inst.x += inst.vx * dt;
    inst.y += inst.vy * dt;

    var margin = Math.max(0.005, size * 0.5);
    if (inst.x < margin) {
        inst.x = margin;
        inst.vx = Math.abs(inst.vx) * edgeBounce;
        inst.spin += inst.vy * spinGain * 0.3;
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    } else if (inst.x > asp - margin) {
        inst.x = asp - margin;
        inst.vx = -Math.abs(inst.vx) * edgeBounce;
        inst.spin -= inst.vy * spinGain * 0.3;
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    }
    if (inst.y < margin) {
        inst.y = margin;
        inst.vy = Math.abs(inst.vy) * edgeBounce;
        inst.spin -= inst.vx * spinGain * 0.3;
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    } else if (inst.y > 1.0 - margin) {
        inst.y = 1.0 - margin;
        inst.vy = -Math.abs(inst.vy) * edgeBounce;
        inst.spin += inst.vx * spinGain * 0.3;
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    }

    var s = sdfAt(inst.x, inst.y, env);
    if (s.sdf > -0.002) {
        var nx = s.nx, ny = s.ny;
        var vn = inst.vx * nx + inst.vy * ny;
        if (vn < 0) {
            var vt = inst.vx * (-ny) + inst.vy * nx;

            inst.vx -= (1 + bounce) * vn * nx;
            inst.vy -= (1 + bounce) * vn * ny;
            inst.spin += vt * spinGain;

            var outN = inst.vx * nx + inst.vy * ny;
            if (outN < minOut) {
                var boost = minOut - outN;
                inst.vx += boost * nx;
                inst.vy += boost * ny;
            }

            var sp = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
            if (sp > speedCeiling) {
                var k = speedCeiling / sp;
                inst.vx *= k; inst.vy *= k;
                sp = speedCeiling;
            }

            var p = projectToSurface(inst.x, inst.y, env, 6);
            var eps = Math.max(0.002, size * 0.15);
            inst.x = p.x + nx * eps;
            inst.y = p.y + ny * eps;

            bumpFrame(inst, st);

            if (sp < FLOAT_MIN_SPEED) {
                if (sp > 1e-6) {
                    var k2 = FLOAT_MIN_SPEED / sp;
                    inst.vx *= k2; inst.vy *= k2;
                } else {
                    inst.vx = nx * FLOAT_MIN_SPEED;
                    inst.vy = ny * FLOAT_MIN_SPEED;
                }
            }
        }
    }
}

// ------------------------------------------------------------------
// SURFACE (attached)
// ------------------------------------------------------------------
function updateAttached(inst, dt, env) {
    var st = env.state;
    var asp = env.aspect;
    var size       = effSize(st, inst);
    var gravity    = effGravity(st, inst);
    var runSpeed   = effRunSpeed(st, inst);
    var struggle   = effStruggle(st, inst);
    var attraction = effAttraction(st, inst);

    var s0 = sdfAt(inst.x, inst.y, env);
    var detachDist = 0.05 * attraction + 0.02;
    if (s0.sdf > detachDist || s0.sdf < -detachDist) {
        inst.attached = false;
        inst.vx = inst.fwdX * runSpeed; inst.vy = inst.fwdY * runSpeed;
        return;
    }
    var p0 = projectToSurface(inst.x, inst.y, env, 6);
    var d0 = Math.hypot(p0.x - inst.x, p0.y - inst.y);
    if (d0 > detachDist * 3) {
        inst.attached = false;
        inst.vx = inst.fwdX * runSpeed; inst.vy = inst.fwdY * runSpeed;
        return;
    }
    inst.x = p0.x; inst.y = p0.y;

    var s = sdfAt(inst.x, inst.y, env);
    var nx = s.nx, ny = s.ny;

    var gravityAway = gravity * Math.max(0, -ny);
    var adhesion    = attraction * 3.0;
    if (gravityAway > adhesion) {
        inst.attached = false;
        inst.vx = inst.fwdX * runSpeed; inst.vy = inst.fwdY * runSpeed;
        return;
    }

    // ---- Player control: consistent winding-direction tangent ----
    // tRight points "visually rightward" (x >= 0). On the lower half of a
    // surface (ny <= 0) we negate it, which reverses the perceived direction
    // but keeps the winding continuous so traversal no longer shudders.
    if (inst.isPlayer) {
        var tRightX = -ny, tRightY = nx;
        if (tRightX < 0) { tRightX = -tRightX; tRightY = -tRightY; }
        if (ny <= 0)     { tRightX = -tRightX; tRightY = -tRightY; }

        var desiredDir = 0;
        if (keys.right) desiredDir += 1;
        if (keys.left)  desiredDir -= 1;
        if (desiredDir !== 0) {
            inst.fwdX = tRightX * desiredDir;
            inst.fwdY = tRightY * desiredDir;
        }
    }

    var dn = inst.fwdX * nx + inst.fwdY * ny;
    inst.fwdX -= dn * nx; inst.fwdY -= dn * ny;
    var fl = Math.hypot(inst.fwdX, inst.fwdY);
    if (fl < 0.05) {
        var sx = (inst.fwdX >= 0) ? 1 : -1;
        inst.fwdX = -ny * sx; inst.fwdY = nx * sx;
        var l2 = Math.hypot(inst.fwdX, inst.fwdY) || 1;
        inst.fwdX /= l2; inst.fwdY /= l2;
    } else { inst.fwdX /= fl; inst.fwdY /= fl; }

    var margin = Math.max(0.005, size * 0.5);
    if (inst.wallCooldown <= 0) {
        if (inst.x < margin && inst.fwdX < 0) {
            inst.fwdX = -inst.fwdX; inst.fwdY = -inst.fwdY;
            bumpFrame(inst, st); inst.wallCooldown = 0.3;
        } else if (inst.x > asp - margin && inst.fwdX > 0) {
            inst.fwdX = -inst.fwdX; inst.fwdY = -inst.fwdY;
            bumpFrame(inst, st); inst.wallCooldown = 0.3;
        }
    }

    var gTx = gravity * nx * ny;
    var gTy = -gravity * nx * nx;
    var uphill = -(gTx * inst.fwdX + gTy * inst.fwdY);
    var speedFactor = 1.0 - uphill * struggle * 0.25;
    speedFactor = Math.max(0.2, Math.min(2.5, speedFactor));
    var speed = runSpeed * speedFactor;

    // ---- Player only moves while a direction key is held ----
    if (inst.isPlayer) {
        if (!keys.left && !keys.right) speed = 0;
    }

    inst.x += inst.fwdX * speed * dt;
    inst.y += inst.fwdY * speed * dt;

    var p1 = projectToSurface(inst.x, inst.y, env, 6);
    var d1 = Math.hypot(p1.x - inst.x, p1.y - inst.y);
    if (d1 > detachDist * 3) {
        inst.attached = false;
        inst.vx = inst.fwdX * speed; inst.vy = inst.fwdY * speed;
        return;
    }
    inst.x = p1.x; inst.y = p1.y;
    inst.vx = inst.fwdX * speed; inst.vy = inst.fwdY * speed;
}

// ==================================================================
// DRAW
// ==================================================================
function draw(inst, ctx, env) {
    var st = env.state;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var asp = W / H;
    var size = effSize(st, inst);
    var s = inst.lastSdf || sdfAt(inst.x, inst.y, env);

    var isSurface = (inst.type === TYPE_SURFACE);
    var margin = (st.charMargin !== undefined) ? st.charMargin : 0.08;
    var offsetX = 0, offsetY = 0, angle = 0;

    if (isSurface && (inst.attached || Math.abs(s.sdf) < size * 2)) {
        offsetX = s.nx * size * margin;
        offsetY = s.ny * size * margin;
        angle = Math.atan2(s.nx, s.ny);
    }
    if (inst.type === TYPE_FLOAT || inst.type === TYPE_BOUNCE) {
        angle = inst.angle || 0;
    }

    var px = ((inst.x + offsetX) / asp) * W;
    var py = (1 - (inst.y + offsetY)) * H;
    var fontSize = Math.max(4, size * H);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.font = "bold " + fontSize.toFixed(1) + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    var ch = currentChar(inst, st);
    if (st.charOutline) {
        ctx.lineWidth = Math.max(1, fontSize * 0.18);
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.strokeText(ch, 0, 0);
    }
    ctx.fillStyle = effColor(st, inst);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
}

function drawAimPoint(ctx, env) {
    var st = env.state;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var asp = W / H;
    var size = st.charSize * 0.8;
    var px = (aimPoint.x / asp) * W;
    var py = (1 - aimPoint.y) * H;
    var fontSize = Math.max(4, size * H);

    ctx.save();
    ctx.translate(px, py);
    ctx.font = "bold " + fontSize.toFixed(1) + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var ch = "+";
    if (st.charOutline) {
        ctx.lineWidth = Math.max(1, fontSize * 0.18);
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.strokeText(ch, 0, 0);
    }
    ctx.fillStyle = "#ff00ff";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
}

// ==================================================================
// BATCH
// ==================================================================
function updateAll(dt, env) {
    lastEnv = env;
    for (var i = 0; i < instances.length; i++) {
        var inst = instances[i];
        if (!inst._inited) {
            rollTraits(inst, env.state);
            resetInstance(inst, env);
            inst._inited = true;
            if (inst.isPlayer) {
                // Initial attach: try to project to the nearest surface.
                var p = projectToSurface(inst.x, inst.y, env, 12);
                var s2 = sdfAt(p.x, p.y, env);
                if (Math.abs(s2.sdf) < 0.15) {
                    inst.x = p.x; inst.y = p.y;
                    inst.attached = true;
                    var tx = -s2.ny, ty = s2.nx;
                    if (tx < 0) { tx = -tx; ty = -ty; }
                    inst.fwdX = tx; inst.fwdY = ty;
                }
                // else: let gravity carry them onto a surface naturally
            }
        }
    }
    for (var i = 0; i < instances.length; i++) update(instances[i], dt, env);

    if (window.LavaProjectile && window.LavaProjectile.updateAll) {
        window.LavaProjectile.updateAll(dt, env);
    }
}
function drawAll(ctx, env) {
    canvasEl = ctx.canvas;
    for (var i = 0; i < instances.length; i++) draw(instances[i], ctx, env);
    drawAimPoint(ctx, env);
    if (window.LavaProjectile && window.LavaProjectile.drawAll) {
        window.LavaProjectile.drawAll(ctx, env);
    }
}

// ==================================================================
// EXPORT
// ==================================================================
window.LavaCharacter = {
    TYPE_SURFACE:      TYPE_SURFACE,
    TYPE_BOUNCE:       TYPE_BOUNCE,
    TYPE_FLOAT:        TYPE_FLOAT,
    defaults:          DEFAULTS,
    controlsGroup:     CONTROLS_GROUP,
    createInstance:    createInstance,
    resetAllInstances: resetAllInstances,
    requestSpawn:      requestSpawn,
    requestRemove:     requestRemove,
    updateAll:         updateAll,
    drawAll:           drawAll,
    destroyAll:        destroyAll,
    count:             function () { return instances.length; },
    destroy:           function () {},

    getPlayer: function () {
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isPlayer) return instances[i];
        }
        return null;
    },
    getAimPoint: function () { return aimPoint; },
    getEnv: function () { return lastEnv; },
    getAspect: function () { return lastEnv ? lastEnv.aspect : 1; },
    sdfAt: function (x, y) {
        return lastEnv ? sdfAt(x, y, lastEnv) : { sdf: -1, nx: 0, ny: 1 };
    },
    projectToSurface: function (x, y, maxIter) {
        return lastEnv ? projectToSurface(x, y, lastEnv, maxIter) : { x: x, y: y };
    },
    keys: keys,
    mouse: mouse,
};

})();