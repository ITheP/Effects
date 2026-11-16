// =====================================================================
// lava-character.js
// External character simulation for the lava lamp.
// Exposes window.LavaCharacter.
// Manages a dynamic array of characters (Add / Remove from UI).
// Includes per-instance variance for size, gravity, bounce, grip,
// run speed, struggle, and attraction.
// =====================================================================
(function () {
'use strict';

// ------------------------------------------------------------------
// Defaults (merged into main's CFG so they land in `state`)
// ------------------------------------------------------------------
var DEFAULTS = {
    charText:            "ABCDEFG",
    charSpeed:           6,
    charSpeedLink:       0.5,
    charChangeOnBounce:  0,
    charSize:            0.028,
    charColor:           "#ffffff",
    charOutline:         1,
    charMargin:          0.08,
    charGravity:         1.0,
    charBounce:          0.4,
    charGrip:            1.0,
    charRunSpeed:        0.18,
    charStruggle:        1.0,
    charAttraction:      1.0,
    charSpawnHeight:     0.6,
    charSpawnX:          0.5,

    // Per-instance variance (rolled once per spawn)
    charSizeVariance:       0.20,
    charGravityVariance:    0.15,
    charBounceVariance:     0.20,
    charGripVariance:       0.15,
    charRunSpeedVariance:   0.25,
    charStruggleVariance:   0.20,
    charAttractionVariance: 0.20,
};

var AIR_DRAG     = 1.5;
var TERMINAL_CAP = 2.0;

// ------------------------------------------------------------------
// Instance array (managed inside the module)
// ------------------------------------------------------------------
var instances = [];

function createInstance() {
    return {
        x: 0, y: 0,
        vx: 0, vy: 0,
        attached: false,
        fwdX: 1, fwdY: 0,
        frameIdx: 0,
        frameTimer: 0,
        wallCooldown: 0,
        lastSdf: null,
        _inited: false,
        // per-instance trait multipliers (rolled on first update)
        sizeMul: 1,
        gravityMul: 1,
        bounceMul: 1,
        gripMul: 1,
        runSpeedMul: 1,
        struggleMul: 1,
        attractMul: 1,
    };
}

function varianceMul(v) {
    if (!v || v <= 0) return 1.0;
    var m = 1 + (Math.random() * 2 - 1) * v;
    return Math.max(0.1, m);   // never invert or zero
}

function rollTraits(inst, st) {
    inst.sizeMul     = varianceMul(st.charSizeVariance);
    inst.gravityMul  = varianceMul(st.charGravityVariance);
    inst.bounceMul   = varianceMul(st.charBounceVariance);
    inst.gripMul     = varianceMul(st.charGripVariance);
    inst.runSpeedMul = varianceMul(st.charRunSpeedVariance);
    inst.struggleMul = varianceMul(st.charStruggleVariance);
    inst.attractMul  = varianceMul(st.charAttractionVariance);
}

// Effective per-instance values
function effSize(st, inst)       { return st.charSize       * (inst.sizeMul     || 1); }
function effGravity(st, inst)    { return st.charGravity    * (inst.gravityMul  || 1); }
function effBounce(st, inst)     { return Math.max(0, Math.min(1, st.charBounce * (inst.bounceMul || 1))); }
function effGrip(st, inst)       { return st.charGrip       * (inst.gripMul     || 1); }
function effRunSpeed(st, inst)   { return st.charRunSpeed   * (inst.runSpeedMul || 1); }
function effStruggle(st, inst)   { return st.charStruggle   * (inst.struggleMul || 1); }
function effAttraction(st, inst) { return st.charAttraction * (inst.attractMul  || 1); }

function resetInstance(inst, env) {
    var st = env.state;
    var sx = (st.charSpawnX      !== undefined) ? st.charSpawnX      : 0.5;
    var sh = (st.charSpawnHeight !== undefined) ? st.charSpawnHeight : 0.6;

    var jx = (Math.random() - 0.5) * 0.30;
    var jy = Math.random() * 0.40;

    inst.x  = env.aspect * Math.max(0.05, Math.min(0.95, sx + jx));
    inst.y  = 1.0 + sh + jy;
    inst.vx = 0;
    inst.vy = 0;
    inst.attached = false;
    inst.fwdX = (Math.random() < 0.5) ? 1 : -1;
    inst.fwdY = 0;
    inst.frameIdx = 0;
    inst.frameTimer = 0;
    inst.wallCooldown = 0;
    inst.lastSdf = null;
}

function requestSpawn() {
    instances.push(createInstance());
}

function requestRemove() {
    if (instances.length > 0) instances.pop();
}

function resetAllInstances() {
    instances.length = 0;
    requestSpawn();
}

function destroyAll() {
    instances.length = 0;
}

// ------------------------------------------------------------------
// CONTROLS group
// ------------------------------------------------------------------
var CONTROLS_GROUP = {
    heading: "🐛 Character",
    openByDefault: false,
    showExtras: false,
    controls: [
        { icon: "🔤", key: "charText",           def: DEFAULTS.charText,           special: "text", label: "Characters",         savedInPreset: false, details: "String of characters cycled through." },
        { icon: "➕", key: "charAdd",            special: "button", buttonText: "Add",    label: "Add Character",  savedInPreset: false, details: "Spawn another character instance with fresh per-instance traits.",
          action: function (/* state */) { requestSpawn(); } },
        { icon: "➖", key: "charRemove",         special: "button", buttonText: "Remove", label: "Remove Character", savedInPreset: false, details: "Remove the last-spawned character.",
          action: function (/* state */) { requestRemove(); } },
        { icon: "⏱️", key: "charSpeed",          def: DEFAULTS.charSpeed,          min: 0,    max: 30,  step: 0.1,  label: "Char Speed",        savedInPreset: false, details: "Base character changes per second (time mode)." },
        { icon: "🏃", key: "charSpeedLink",      def: DEFAULTS.charSpeedLink,      min: 0,    max: 3,   step: 0.01, label: "Speed Link",        savedInPreset: false, details: "Extra character change rate driven by movement speed. 0 = flat rate." },
        { icon: "🎯", key: "charChangeOnBounce", def: DEFAULTS.charChangeOnBounce, special: "bool", label: "Change on Bounce", savedInPreset: false, details: "Change character only on bounces and wall reversals." },
        { icon: "📏", key: "charSize",           def: DEFAULTS.charSize,           min: 0.005,max: 0.15,step: 0.001,label: "Char Size",         savedInPreset: false, details: "Font size (screen height units)." },
        { icon: "🎨", key: "charColor",          def: DEFAULTS.charColor,          special: "color", label: "Char Colour",      savedInPreset: false, details: "" },
        { icon: "🌑", key: "charOutline",        def: DEFAULTS.charOutline,        special: "bool", label: "Outline",          savedInPreset: false, details: "Dark outline for readability." },
        { icon: "📐", key: "charMargin",         def: DEFAULTS.charMargin,         min: 0,    max: 1,   step: 0.01, label: "Margin",            savedInPreset: false, details: "Gap between glyph baseline and surface, as a fraction of char size." },
        { icon: "🌍", key: "charGravity",        def: DEFAULTS.charGravity,        min: 0,    max: 20,  step: 0.01, label: "Gravity",           savedInPreset: false, details: "Fall acceleration. Air drag gives terminal velocity = gravity / 1.5." },
        { icon: "🏀", key: "charBounce",         def: DEFAULTS.charBounce,         min: 0,    max: 1,   step: 0.01, label: "Bounce",            savedInPreset: false, details: "Restitution on surface contact." },
        { icon: "🖐️", key: "charGrip",          def: DEFAULTS.charGrip,           min: 0,    max: 1,   step: 0.01, label: "Grip",              savedInPreset: false, details: "Normal-speed threshold for attaching after bounce." },
        { icon: "🏃", key: "charRunSpeed",       def: DEFAULTS.charRunSpeed,       min: 0.01, max: 2,   step: 0.01, label: "Run Speed",         savedInPreset: false, details: "Base surface run speed." },
        { icon: "💪", key: "charStruggle",       def: DEFAULTS.charStruggle,       min: 0,    max: 5,   step: 0.01, label: "Struggle",          savedInPreset: false, details: "Uphill slowdown amount." },
        { icon: "🧲", key: "charAttraction",     def: DEFAULTS.charAttraction,     min: 0.1,  max: 5,   step: 0.01, label: "Attraction",        savedInPreset: false, details: "Adhesion budget (× 3). Detaches on undersides when gravity × (-ny) exceeds this." },

        // Per-instance variance — 0 = all identical, higher = more spread
        { icon: "📐", key: "charSizeVariance",       def: DEFAULTS.charSizeVariance,       min: 0, max: 2, step: 0.01, label: "Size Variance",        savedInPreset: false, details: "Per-instance multiplier on Char Size (×1 ± this)." },
        { icon: "🌍", key: "charGravityVariance",    def: DEFAULTS.charGravityVariance,    min: 0, max: 2, step: 0.01, label: "Gravity Variance",     savedInPreset: false, details: "Per-instance multiplier on Gravity." },
        { icon: "🏀", key: "charBounceVariance",     def: DEFAULTS.charBounceVariance,     min: 0, max: 2, step: 0.01, label: "Bounce Variance",      savedInPreset: false, details: "Per-instance multiplier on Bounce (clamped to 0–1)." },
        { icon: "🖐️", key: "charGripVariance",      def: DEFAULTS.charGripVariance,       min: 0, max: 2, step: 0.01, label: "Grip Variance",        savedInPreset: false, details: "Per-instance multiplier on Grip." },
        { icon: "🏃", key: "charRunSpeedVariance",   def: DEFAULTS.charRunSpeedVariance,   min: 0, max: 2, step: 0.01, label: "Run Speed Variance",   savedInPreset: false, details: "Per-instance multiplier on Run Speed (also affects Speed Link reference)." },
        { icon: "💪", key: "charStruggleVariance",   def: DEFAULTS.charStruggleVariance,   min: 0, max: 2, step: 0.01, label: "Struggle Variance",    savedInPreset: false, details: "Per-instance multiplier on Struggle." },
        { icon: "🧲", key: "charAttractionVariance", def: DEFAULTS.charAttractionVariance, min: 0, max: 2, step: 0.01, label: "Attraction Variance",  savedInPreset: false, details: "Per-instance multiplier on Attraction — some creatures cling harder than others." },

        { icon: "🚀", key: "charSpawnHeight",    def: DEFAULTS.charSpawnHeight,    min: 0.1,  max: 3,   step: 0.01, label: "Spawn Height",      savedInPreset: false, details: "Height above screen for the initial drop." },
        { icon: "↔️", key: "charSpawnX",        def: DEFAULTS.charSpawnX,         min: 0,    max: 1,   step: 0.01, label: "Spawn X",           savedInPreset: false, details: "Horizontal spawn (0 = left, 1 = right)." },
    ]
};

// ==================================================================
// FIELD EVALUATION  (mirrors the shader exactly, including yFade)
// ==================================================================

function smoothstep(edge0, edge1, x) {
    var t = (x - edge0) / (edge1 - edge0);
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    return t * t * (3 - 2 * t);
}

function fieldAt(px, py, env) {
    var st     = env.state;
    var time   = env.time;
    var blobs  = env.blobs;
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

        var sy  = Math.max(b.stretch, 1.0);
        var ang = b.stretchAngle;
        var ca  = Math.cos(ang), sa = Math.sin(ang);
        var qx  = px - b.x, qy = py - b.y;
        var qrx =  qx * ca + qy * sa;
        var qry = -qx * sa + qy * ca;
        var qtx = qrx / sy, qty = qry * sy;
        var d2  = qtx * qtx + qty * qty + 1e-4;
        var r2  = b.r * b.r * yFade;
        f += r2 / d2;
        var invD2sq = 1.0 / (d2 * d2);
        gx += -(r2 * invD2sq) * (2.0 * (qtx * ca / sy - qty * sa * sy));
        gy += -(r2 * invD2sq) * (2.0 * (qtx * sa / sy + qty * ca * sy));
    }

    return { f: f, gx: gx, gy: gy };
}

function sdfAt(px, py, env) {
    var r = fieldAt(px, py, env);
    var glen = Math.sqrt(r.gx * r.gx + r.gy * r.gy);
    if (glen < 1e-9) glen = 1e-9;
    var thr = env.state.fieldThreshold;
    return {
        sdf: (r.f - thr) / glen,
        nx: -r.gx / glen,
        ny: -r.gy / glen,
        f: r.f, glen: glen
    };
}

function projectToSurface(px, py, env, maxIter) {
    var x = px, y = py;
    var thr = env.state.fieldThreshold;
    maxIter = maxIter || 6;
    for (var i = 0; i < maxIter; i++) {
        var r = fieldAt(x, y, env);
        var err = r.f - thr;
        var glen2 = r.gx * r.gx + r.gy * r.gy;
        if (glen2 < 1e-12) break;
        x += -err * r.gx / glen2;
        y += -err * r.gy / glen2;
        if (Math.abs(err) < 1e-4) break;
    }
    return { x: x, y: y };
}

// ==================================================================
// CHARACTER FRAME
// ==================================================================

function charList(st) {
    return (st.charText && st.charText.length > 0) ? st.charText : "ABCDEFG";
}
function advanceFrame(inst, st) {
    var n = charList(st).length;
    if (n > 0) inst.frameIdx = (inst.frameIdx + 1) % n;
}
function bumpFrame(inst, st) {
    if (st.charChangeOnBounce) {
        advanceFrame(inst, st);
        inst.frameTimer = 0;
    }
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

    if (inst.attached) updateAttached(inst, dt, env);
    else               updateFalling(inst, dt, env);

    // Safety: character must never sit inside the surface
    var s = sdfAt(inst.x, inst.y, env);
    if (s.sdf > 0.001) {
        var p = projectToSurface(inst.x, inst.y, env, 8);
        inst.x = p.x; inst.y = p.y;
        s = sdfAt(inst.x, inst.y, env);
    }
    inst.lastSdf = s;

    // Character cycling (time mode + optional speed link)
    if (!env.state.charChangeOnBounce) {
        var st = env.state;
        var speedMag  = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
        var runRef    = Math.max(0.01, effRunSpeed(st, inst));
        var speedNorm = Math.min(3.0, speedMag / runRef);
        var link      = st.charSpeedLink || 0;
        var effectiveRate = st.charSpeed * (1.0 + link * speedNorm);

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
    var sp = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
    var size = effSize(env.state, inst);
    var maxStep = (size || 0.03) + 0.01;
    var travel = sp * dt;
    if (travel > maxStep) {
        var n = Math.min(12, Math.ceil(travel / maxStep));
        var sub = dt / n;
        for (var i = 0; i < n; i++) {
            stepFalling(inst, sub, env);
            if (inst.attached) return;
        }
    } else {
        stepFalling(inst, dt, env);
    }
}

function stepFalling(inst, dt, env) {
    var st  = env.state;
    var asp = env.aspect;
    var size    = effSize(st, inst);
    var gravity = effGravity(st, inst);
    var bounce  = effBounce(st, inst);
    var grip    = effGrip(st, inst);

    inst.vy -= gravity * dt;

    var dragK = Math.exp(-AIR_DRAG * dt);
    inst.vx *= dragK;
    inst.vy *= dragK;

    if (inst.vy < -TERMINAL_CAP) inst.vy = -TERMINAL_CAP;
    if (inst.vy >  TERMINAL_CAP) inst.vy =  TERMINAL_CAP;
    if (inst.vx >  TERMINAL_CAP) inst.vx =  TERMINAL_CAP;
    if (inst.vx < -TERMINAL_CAP) inst.vx = -TERMINAL_CAP;

    inst.x += inst.vx * dt;
    inst.y += inst.vy * dt;

    var margin = Math.max(0.005, size * 0.5);
    if (inst.x < margin) {
        inst.x = margin;
        inst.vx = Math.abs(inst.vx) * 0.4;
        inst.fwdX = Math.abs(inst.fwdX || 1);
        if (inst.wallCooldown <= 0) { bumpFrame(inst, st); inst.wallCooldown = 0.3; }
    } else if (inst.x > asp - margin) {
        inst.x = asp - margin;
        inst.vx = -Math.abs(inst.vx) * 0.4;
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

            inst.vx -= (1 + bounce) * vn * nx;
            inst.vy -= (1 + bounce) * vn * ny;

            bumpFrame(inst, st);

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

function updateAttached(inst, dt, env) {
    var st  = env.state;
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
        inst.vx = inst.fwdX * runSpeed;
        inst.vy = inst.fwdY * runSpeed;
        return;
    }

    var p0 = projectToSurface(inst.x, inst.y, env, 6);
    var d0 = Math.hypot(p0.x - inst.x, p0.y - inst.y);
    if (d0 > detachDist * 3) {
        inst.attached = false;
        inst.vx = inst.fwdX * runSpeed;
        inst.vy = inst.fwdY * runSpeed;
        return;
    }
    inst.x = p0.x;
    inst.y = p0.y;

    var s = sdfAt(inst.x, inst.y, env);
    var nx = s.nx, ny = s.ny;

    // Adhesion vs gravity
    var gravityAway = gravity * Math.max(0, -ny);
    var adhesion    = attraction * 3.0;
    if (gravityAway > adhesion) {
        inst.attached = false;
        inst.vx = inst.fwdX * runSpeed;
        inst.vy = inst.fwdY * runSpeed;
        return;
    }

    // Keep forward orthonormal to normal
    var dn = inst.fwdX * nx + inst.fwdY * ny;
    inst.fwdX -= dn * nx;
    inst.fwdY -= dn * ny;
    var fl = Math.hypot(inst.fwdX, inst.fwdY);
    if (fl < 0.05) {
        var sx = (inst.fwdX >= 0) ? 1 : -1;
        inst.fwdX = -ny * sx;
        inst.fwdY =  nx * sx;
        var l2 = Math.hypot(inst.fwdX, inst.fwdY) || 1;
        inst.fwdX /= l2;
        inst.fwdY /= l2;
    } else {
        inst.fwdX /= fl;
        inst.fwdY /= fl;
    }

    // Wall flip
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

    // Tangent gravity + struggle
    var gTx = gravity * nx * ny;
    var gTy = -gravity * nx * nx;
    var uphill = -(gTx * inst.fwdX + gTy * inst.fwdY);

    var speedFactor = 1.0 - uphill * struggle * 0.25;
    speedFactor = Math.max(0.2, Math.min(2.5, speedFactor));
    var speed = runSpeed * speedFactor;

    inst.x += inst.fwdX * speed * dt;
    inst.y += inst.fwdY * speed * dt;

    var p1 = projectToSurface(inst.x, inst.y, env, 6);
    var d1 = Math.hypot(p1.x - inst.x, p1.y - inst.y);
    if (d1 > detachDist * 3) {
        inst.attached = false;
        inst.vx = inst.fwdX * speed;
        inst.vy = inst.fwdY * speed;
        return;
    }
    inst.x = p1.x;
    inst.y = p1.y;

    inst.vx = inst.fwdX * speed;
    inst.vy = inst.fwdY * speed;
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

    var margin = (st.charMargin !== undefined) ? st.charMargin : 0.08;
    var offsetX = 0, offsetY = 0;
    if (inst.attached || Math.abs(s.sdf) < size * 2) {
        offsetX = s.nx * size * margin;
        offsetY = s.ny * size * margin;
    }

    var drawX = inst.x + offsetX;
    var drawY = inst.y + offsetY;
    var px = (drawX / asp) * W;
    var py = (1 - drawY) * H;

    var fontSize = Math.max(4, size * H);

    var angle = 0;
    if (inst.attached || Math.abs(s.sdf) < size * 2) {
        angle = Math.atan2(s.nx, s.ny);
    }

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
    ctx.fillStyle = st.charColor;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
}

// ==================================================================
// BATCH API
// ==================================================================

function updateAll(dt, env) {
    for (var i = 0; i < instances.length; i++) {
        var inst = instances[i];
        if (!inst._inited) {
            rollTraits(inst, env.state);
            resetInstance(inst, env);
            inst._inited = true;
        }
    }
    for (var i = 0; i < instances.length; i++) {
        update(instances[i], dt, env);
    }
}

function drawAll(ctx, env) {
    for (var i = 0; i < instances.length; i++) {
        draw(instances[i], ctx, env);
    }
}

// ==================================================================
// EXPORT
// ==================================================================

window.LavaCharacter = {
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
    destroy:           function (/* inst */) { /* overlay canvas owned by main */ }
};

})();