// =====================================================================
// lava-character.js
// External character simulation for the lava lamp.
// Exposes window.LavaCharacter.
//
// Attaches to the metaball field (same field the shader uses), runs along
// the isosurface, falls under gravity, bounces on contact, and switches
// between surface-running and airborne states when the surface moves.
// =====================================================================
(function () {
'use strict';

// ------------------------------------------------------------------
// Defaults (merged into main's CFG so they land in `state`)
// ------------------------------------------------------------------
var DEFAULTS = {
    charText:            "ABCDEFG",
    charSpeed:           6,          // characters per second
    charChangeOnBounce:  0,          // 1 = only advance on bounce / wall
    charSize:            0.028,      // font size in screen-height units
    charColor:           "#ffffff",
    charOutline:         1,
    charGravity:         2.5,
    charBounce:          0.4,
    charGrip:            1.0,
    charRunSpeed:        0.18,       // world units / second
    charStruggle:        1.0,
    charAttraction:      1.0,
    charSpawnHeight:     0.6,
    charSpawnX:          0.5,
};

// ------------------------------------------------------------------
// CONTROLS group, appended into main's CONTROLS array
// ------------------------------------------------------------------
var CONTROLS_GROUP = {
    heading: "🐛 Character",
    openByDefault: false,
    showExtras: false,
    controls: [
        { icon: "🔤", key: "charText",           def: DEFAULTS.charText,           special: "text", label: "Characters",         savedInPreset: false, details: "String of characters cycled through." },
        { icon: "⏱️", key: "charSpeed",          def: DEFAULTS.charSpeed,          min: 0,    max: 30,  step: 0.1,  label: "Char Speed",        savedInPreset: false, details: "Character changes per second (time mode)." },
        { icon: "🎯", key: "charChangeOnBounce", def: DEFAULTS.charChangeOnBounce, special: "bool", label: "Change on Bounce", savedInPreset: false, details: "Change character only on bounces and wall reversals." },
        { icon: "📏", key: "charSize",           def: DEFAULTS.charSize,           min: 0.005,max: 0.15,step: 0.001,label: "Char Size",         savedInPreset: false, details: "Font size (screen height units)." },
        { icon: "🎨", key: "charColor",          def: DEFAULTS.charColor,          special: "color", label: "Char Colour",      savedInPreset: false, details: "" },
        { icon: "🌑", key: "charOutline",        def: DEFAULTS.charOutline,        special: "bool", label: "Outline",          savedInPreset: false, details: "Dark outline for readability." },
        { icon: "🌍", key: "charGravity",        def: DEFAULTS.charGravity,        min: 0,    max: 20,  step: 0.01, label: "Gravity",           savedInPreset: false, details: "Fall acceleration." },
        { icon: "🏀", key: "charBounce",         def: DEFAULTS.charBounce,         min: 0,    max: 1,   step: 0.01, label: "Bounce",            savedInPreset: false, details: "Restitution on surface contact." },
        { icon: "🖐️", key: "charGrip",          def: DEFAULTS.charGrip,           min: 0,    max: 1,   step: 0.01, label: "Grip",              savedInPreset: false, details: "Normal-speed threshold for attaching after bounce." },
        { icon: "🏃", key: "charRunSpeed",       def: DEFAULTS.charRunSpeed,       min: 0.01, max: 2,   step: 0.01, label: "Run Speed",         savedInPreset: false, details: "Base surface run speed." },
        { icon: "💪", key: "charStruggle",       def: DEFAULTS.charStruggle,       min: 0,    max: 5,   step: 0.01, label: "Struggle",          savedInPreset: false, details: "Uphill slowdown amount." },
        { icon: "🧲", key: "charAttraction",     def: DEFAULTS.charAttraction,     min: 0.1,  max: 5,   step: 0.01, label: "Attraction",        savedInPreset: false, details: "How far it can drift from the surface before detaching." },
        { icon: "🚀", key: "charSpawnHeight",    def: DEFAULTS.charSpawnHeight,    min: 0.1,  max: 3,   step: 0.01, label: "Spawn Height",      savedInPreset: false, details: "Height above screen for the initial drop." },
        { icon: "↔️", key: "charSpawnX",        def: DEFAULTS.charSpawnX,         min: 0,    max: 1,   step: 0.01, label: "Spawn X",           savedInPreset: false, details: "Horizontal spawn (0 = left, 1 = right)." },
    ]
};

// ==================================================================
// FIELD EVALUATION
// Mirrors the shader's metaball + pool field exactly (minus yFade,
// which is purely a visual dissolve of blobs into the pool).
// ==================================================================

function fieldAt(px, py, env) {
    var st     = env.state;
    var time   = env.time;
    var blobs  = env.blobs;

    var f = 0, gx = 0, gy = 0;

    // Pool (matches shader)
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

    // Blobs (matches shader)
    for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        if (b.r < 1e-5) continue;
        var sy = Math.max(b.stretch, 1.0);
        var ang = b.stretchAngle;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var qx = px - b.x, qy = py - b.y;
        var qrx =  qx * ca + qy * sa;
        var qry = -qx * sa + qy * ca;
        var qtx = qrx / sy, qty = qry * sy;
        var d2  = qtx * qtx + qty * qty + 1e-4;
        var r2  = b.r * b.r;
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
        sdf: (r.f - thr) / glen,   // >0 inside, <0 outside
        nx: -r.gx / glen,          // outward normal
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
// INSTANCE
// ==================================================================

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
    };
}

function resetInstance(inst, env) {
    var st = env.state;
    var sx = (st.charSpawnX      !== undefined) ? st.charSpawnX      : 0.5;
    var sh = (st.charSpawnHeight !== undefined) ? st.charSpawnHeight : 0.6;
    inst.x = env.aspect * sx;
    inst.y = 1.0 + sh;
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

    // Time-mode character cycling
    if (!env.state.charChangeOnBounce) {
        var interval = 1.0 / Math.max(0.1, env.state.charSpeed);
        inst.frameTimer += dt;
        var guard = 0;
        while (inst.frameTimer >= interval && guard++ < 16) {
            inst.frameTimer -= interval;
            advanceFrame(inst, env.state);
        }
    }

    // NaN / lost guard
    if (!isFinite(inst.x) || !isFinite(inst.y)) resetInstance(inst, env);
}

function updateFalling(inst, dt, env) {
    // Sub-step when travelling fast enough to risk tunnelling thin wax
    var sp = Math.sqrt(inst.vx * inst.vx + inst.vy * inst.vy);
    var maxStep = (env.state.charSize || 0.03) + 0.01;
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
    var st = env.state;
    var asp = env.aspect;

    inst.vy -= st.charGravity * dt;
    // Cap fall speed for stability
    var VMAX = 5.0;
    if (inst.vy < -VMAX) inst.vy = -VMAX;
    if (inst.vy >  VMAX) inst.vy =  VMAX;
    if (inst.vx >  VMAX) inst.vx =  VMAX;
    if (inst.vx < -VMAX) inst.vx = -VMAX;

    inst.x += inst.vx * dt;
    inst.y += inst.vy * dt;

    // Screen edges: bounce and flip running intent
    var margin = Math.max(0.005, st.charSize * 0.5);
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

    // Fell off screen
    if (inst.y < -0.5) { resetInstance(inst, env); return; }
    if (inst.y > 2.0) { inst.y = 2.0; if (inst.vy > 0) inst.vy = 0; }

    // Collision with surface
    var s = sdfAt(inst.x, inst.y, env);
    if (s.sdf > -0.002) {
        var vn = inst.vx * s.nx + inst.vy * s.ny;
        if (vn < -0.001) {
            // Snap to surface and re-evaluate normal there
            var p = projectToSurface(inst.x, inst.y, env, 8);
            inst.x = p.x; inst.y = p.y;
            var s2 = sdfAt(inst.x, inst.y, env);
            var nx = s2.nx, ny = s2.ny;

            // Reflect
            var bounce = st.charBounce;
            inst.vx -= (1 + bounce) * vn * nx;
            inst.vy -= (1 + bounce) * vn * ny;

            bumpFrame(inst, st);

            // Settle?
            var normalSpeed = Math.abs(inst.vx * nx + inst.vy * ny);
            if (normalSpeed < st.charGrip * 0.35) {
                inst.attached = true;
                // Tangent chosen from incident tangential velocity if present,
                // otherwise continue previous preferred direction.
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

    // Snap to surface
    var s0 = sdfAt(inst.x, inst.y, env);
    var detachDist = 0.05 * st.charAttraction + 0.02;
    if (s0.sdf > detachDist || s0.sdf < -detachDist) {
        // Surface moved away → detach and keep current forward velocity
        inst.attached = false;
        inst.vx = inst.fwdX * st.charRunSpeed;
        inst.vy = inst.fwdY * st.charRunSpeed;
        return;
    }

    var p0 = projectToSurface(inst.x, inst.y, env, 6);
    var d0 = Math.hypot(p0.x - inst.x, p0.y - inst.y);
    if (d0 > detachDist * 3) {
        inst.attached = false;
        inst.vx = inst.fwdX * st.charRunSpeed;
        inst.vy = inst.fwdY * st.charRunSpeed;
        return;
    }
    inst.x = p0.x;
    inst.y = p0.y;

    // Current normal & tangent
    var s = sdfAt(inst.x, inst.y, env);
    var nx = s.nx, ny = s.ny;

    // Keep forward orthonormal to normal
    var dn = inst.fwdX * nx + inst.fwdY * ny;
    inst.fwdX -= dn * nx;
    inst.fwdY -= dn * ny;
    var fl = Math.hypot(inst.fwdX, inst.fwdY);
    if (fl < 0.05) {
        // Degenerate – pick tangent closest to previous horizontal intent
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

    // Wall flip check (before stepping)
    var margin = Math.max(0.005, st.charSize * 0.5);
    if (inst.wallCooldown <= 0) {
        if (inst.x < margin && inst.fwdX < 0) {
            inst.fwdX = -inst.fwdX; inst.fwdY = -inst.fwdY;
            bumpFrame(inst, st); inst.wallCooldown = 0.3;
        } else if (inst.x > asp - margin && inst.fwdX > 0) {
            inst.fwdX = -inst.fwdX; inst.fwdY = -inst.fwdY;
            bumpFrame(inst, st); inst.wallCooldown = 0.3;
        }
    }

    // Tangent gravity
    var G  = st.charGravity;
    var gTx = G * nx * ny;
    var gTy = -G * nx * nx;
    var uphill = -(gTx * inst.fwdX + gTy * inst.fwdY);   // >0 = uphill

    var speedFactor = 1.0 - uphill * st.charStruggle * 0.25;
    speedFactor = Math.max(0.2, Math.min(2.5, speedFactor));
    var speed = st.charRunSpeed * speedFactor;

    // Step
    inst.x += inst.fwdX * speed * dt;
    inst.y += inst.fwdY * speed * dt;

    // Re-project
    var p1 = projectToSurface(inst.x, inst.y, env, 6);
    var d1 = Math.hypot(p1.x - inst.x, p1.y - inst.y);
    if (d1 > detachDist * 3) {
        // Surface broke away mid-step → detach, carry forward velocity
        inst.attached = false;
        inst.vx = inst.fwdX * speed;
        inst.vy = inst.fwdY * speed;
        return;
    }
    inst.x = p1.x;
    inst.y = p1.y;

    // Sync velocity (used when we detach or transition)
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

    var s = inst.lastSdf || sdfAt(inst.x, inst.y, env);

    // Lift the glyph so its "feet" sit on the surface
    var offsetX = 0, offsetY = 0;
    if (inst.attached || Math.abs(s.sdf) < st.charSize * 2) {
        offsetX = s.nx * st.charSize * 0.55;
        offsetY = s.ny * st.charSize * 0.55;
    }

    var drawX = inst.x + offsetX;
    var drawY = inst.y + offsetY;
    var px = (drawX / asp) * W;
    var py = (1 - drawY) * H;

    var fontSize = Math.max(4, st.charSize * H);

    var angle = 0;
    if (inst.attached || Math.abs(s.sdf) < st.charSize * 2) {
        // Text "up" (canvas -Y) aligns with the outward normal
        angle = Math.atan2(s.nx, s.ny);
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.font = "bold " + fontSize.toFixed(1) + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
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
// EXPORT
// ==================================================================

window.LavaCharacter = {
    defaults:      DEFAULTS,
    controlsGroup: CONTROLS_GROUP,
    createInstance: createInstance,
    reset:          resetInstance,
    update:         update,
    draw:           draw,
    destroy:        function (/* inst */) { /* overlay canvas is owned by main */ }
};

})();