// =====================================================================
// projectile.js
// Projectile system for the lava lamp simulator.
// Exposes window.LavaProjectile.
// =====================================================================
(function () {
'use strict';

// ------------------------------------------------------------------
// Projectile definitions
// ------------------------------------------------------------------
var PROJECTILE_DEFS = {
    spark: {
        id: 'spark',
        name: 'Spark',
        char: '*',
        color: '#ffd24a',
        lifespan: 0.25,
        maxBounces: 0,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'bounce',
        directionVariance: 0.2 * Math.PI,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        destructionProjectiles: [],
        selectable: false,
        speed: 1.0,
    },
    playerBullet: {
        id: 'playerBullet',
        name: 'Player Bullet',
        char: '•',
        color: '#ffffff',
        lifespan: 0.5,
        maxBounces: 1,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'surfaceNormal',      // Fires along the surface normal at the player
        directionVariance: 0,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        destructionProjectiles: [{ type: 'spark', count: 3 }],
        selectable: true,
        speed: null,
    },
    aimBullet: {
        id: 'aimBullet',
        name: 'Aim Bullet',
        char: 'o',
        color: '#8fd6ff',
        lifespan: 1.0,
        maxBounces: 2,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'aim',
        directionVariance: 0,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        destructionProjectiles: [{ type: 'spark', count: 3 }],
        selectable: true,
        speed: 0.8,
    },
};

var selectableProjectiles = ['playerBullet', 'aimBullet'];

// ------------------------------------------------------------------
// Projectile instances
// ------------------------------------------------------------------
var projectiles = [];

// Firing state
var firing = false;
var fireTimer = 0;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function norm(vx, vy) {
    var len = Math.hypot(vx, vy);
    if (len < 1e-6) return { x: 0, y: 1 };
    return { x: vx / len, y: vy / len };
}

function computeBaseDirection(def, x, y, opts) {
    opts = opts || {};
    switch (def.direction) {
        case 'random': {
            var a = Math.random() * Math.PI * 2;
            return { x: Math.cos(a), y: Math.sin(a) };
        }
        case 'normal':
            if (opts.normal) return norm(opts.normal.x, opts.normal.y);
            return { x: 0, y: 1 };
        case 'player': {
            var player = window.LavaCharacter ? LavaCharacter.getPlayer() : null;
            if (player) return norm(player.fwdX, player.fwdY);
            return { x: 1, y: 0 };
        }
        case 'up':
            return { x: 0, y: 1 };
        case 'surfaceNormal': {
            // Use the surface normal at the spawn point (x, y). This is the
            // "up" direction relative to the surface the player is standing on,
            // i.e. the same axis the character glyph is rotated against.
            var s = window.LavaCharacter ? LavaCharacter.sdfAt(x, y) : null;
            if (s && (s.nx !== 0 || s.ny !== 0)) return norm(s.nx, s.ny);
            return { x: 0, y: 1 };
        }
        case 'aim': {
            var aim = window.LavaCharacter ? LavaCharacter.getAimPoint() : { x: 0.5, y: 0.5 };
            return norm(aim.x - x, aim.y - y);
        }
        case 'bounce':
            if (opts.bounceDir) return norm(opts.bounceDir.x, opts.bounceDir.y);
            return { x: 0, y: 1 };
        default:
            return { x: 0, y: 1 };
    }
}

// ------------------------------------------------------------------
// Spawn a projectile
// ------------------------------------------------------------------
function spawnProjectile(defId, x, y, opts) {
    opts = opts || {};
    var def = PROJECTILE_DEFS[defId];
    if (!def) return;

    var env = window.LavaCharacter ? LavaCharacter.getEnv() : null;
    var aspect = env ? env.aspect : 1;

    var baseDir = computeBaseDirection(def, x, y, opts);

    // ---- Apply direction variance ----
    if (def.directionVariance) {
        var varAngle = (Math.random() * 2 - 1) * def.directionVariance;
        var ca = Math.cos(varAngle), sa = Math.sin(varAngle);
        var nx = baseDir.x * ca - baseDir.y * sa;
        var ny = baseDir.x * sa + baseDir.y * ca;
        baseDir.x = nx;
        baseDir.y = ny;
    }

    // ---- Speed ----
    var speed = def.speed;
    if (speed === null || speed === undefined) {
        if (def.id === 'playerBullet') {
            // Travel approximately half the screen width during its lifespan.
            speed = aspect;
        } else {
            speed = 1.0;
        }
    }

    var vx = baseDir.x * speed;
    var vy = baseDir.y * speed;

    // ---- Velocity inheritance ----
    if (opts.parentVx !== undefined && opts.parentVy !== undefined && def.inheritVelocity) {
        vx += opts.parentVx * def.inheritVelocity;
        vy += opts.parentVy * def.inheritVelocity;
    }

    projectiles.push({
        def: def,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        life: def.lifespan,
        bouncesLeft: def.maxBounces,
    });
}

// ------------------------------------------------------------------
// Destroy a projectile
// ------------------------------------------------------------------
function destroyProjectile(p, reason, collisionNormal, bounceDir) {
    var def = p.def;

    var bd = bounceDir;
    if (!bd) bd = norm(p.vx, p.vy);

    if (def.destructionProjectiles) {
        for (var i = 0; i < def.destructionProjectiles.length; i++) {
            var dp = def.destructionProjectiles[i];
            for (var c = 0; c < dp.count; c++) {
                spawnProjectile(dp.type, p.x, p.y, {
                    parentVx: p.vx,
                    parentVy: p.vy,
                    normal: collisionNormal,
                    bounceDir: bd,
                });
            }
        }
    }

    if (reason === 'expire' && def.expireType) {
        spawnProjectile(def.expireType, p.x, p.y, {
            parentVx: p.vx,
            parentVy: p.vy,
            normal: collisionNormal,
            bounceDir: bd,
        });
    }

    if (reason === 'collision' && def.finalCollisionType) {
        spawnProjectile(def.finalCollisionType, p.x, p.y, {
            parentVx: p.vx,
            parentVy: p.vy,
            normal: collisionNormal,
            bounceDir: bd,
        });
    }

    var idx = projectiles.indexOf(p);
    if (idx >= 0) projectiles.splice(idx, 1);
}

// ------------------------------------------------------------------
// Fire the currently selected projectile
// ------------------------------------------------------------------
function fireProjectile(defId, env) {
    var player = window.LavaCharacter ? LavaCharacter.getPlayer() : null;
    if (!player) return;

    var def = PROJECTILE_DEFS[defId];
    if (!def) return;

    // Compute base direction so we can spawn just in front of the character
    // along the firing direction (avoids immediate self-collision).
    var baseDir = computeBaseDirection(def, player.x, player.y, {});
    var off = 0.03;

    spawnProjectile(defId, player.x + baseDir.x * off, player.y + baseDir.y * off, {});
}

// ------------------------------------------------------------------
// Mouse input
// ------------------------------------------------------------------
window.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        firing = true;
        fireTimer = 0;
    }
});
window.addEventListener('mouseup', function (e) {
    if (e.button === 0) {
        firing = false;
        fireTimer = 0;
    }
});

// ------------------------------------------------------------------
// Update
// ------------------------------------------------------------------
function updateAll(dt, env) {
    if (!(dt > 0)) return;

    var st = env.state;

    // ---- Firing ----
    var selectedIdx = Math.round(st.projSelected || 0);
    if (selectedIdx < 0) selectedIdx = 0;
    if (selectedIdx >= selectableProjectiles.length) selectedIdx = selectableProjectiles.length - 1;
    var defId = selectableProjectiles[selectedIdx];
    var fireRate = st.projFireRate || 5;
    var interval = 1 / Math.max(0.1, fireRate);

    if (firing) {
        fireTimer -= dt;
        var guard = 0;
        while (fireTimer <= 0 && guard++ < 10) {
            fireProjectile(defId, env);
            fireTimer += interval;
        }
    } else {
        fireTimer = 0;
    }

    // ---- Update projectiles ----
    for (var i = projectiles.length - 1; i >= 0; i--) {
        var p = projectiles[i];

        p.life -= dt;
        if (p.life <= 0) {
            destroyProjectile(p, 'expire');
            continue;
        }

        if (p.def.damping) {
            var k = Math.exp(-p.def.damping * dt);
            p.vx *= k;
            p.vy *= k;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        var sp = Math.hypot(p.vx, p.vy);
        if (sp < p.def.minSpeed) {
            destroyProjectile(p, 'minSpeed');
            continue;
        }

        var s = window.LavaCharacter ? LavaCharacter.sdfAt(p.x, p.y) : null;
        if (s && s.sdf > -0.002) {
            var vn = p.vx * s.nx + p.vy * s.ny;
            if (p.bouncesLeft <= 0) {
                var bf = p.def.bounceFactor;
                var rvx = p.vx - (1 + bf) * vn * s.nx;
                var rvy = p.vy - (1 + bf) * vn * s.ny;
                destroyProjectile(p, 'collision', { x: s.nx, y: s.ny }, { x: rvx, y: rvy });
                continue;
            } else {
                p.bouncesLeft--;
                if (vn < 0) {
                    p.vx -= (1 + p.def.bounceFactor) * vn * s.nx;
                    p.vy -= (1 + p.def.bounceFactor) * vn * s.ny;
                }
                var proj = window.LavaCharacter ? LavaCharacter.projectToSurface(p.x, p.y, 6) : { x: p.x, y: p.y };
                var eps = 0.005;
                p.x = proj.x + s.nx * eps;
                p.y = proj.y + s.ny * eps;
            }
        }
    }
}

// ------------------------------------------------------------------
// Draw
// ------------------------------------------------------------------
function drawAll(ctx, env) {
    var st = env.state;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var asp = W / H;
    var size = st.charSize * 0.8;
    var fontSize = Math.max(4, size * H);

    for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        var px = (p.x / asp) * W;
        var py = (1 - p.y) * H;

        ctx.save();
        ctx.translate(px, py);
        ctx.font = "bold " + fontSize.toFixed(1) + "px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var ch = p.def.char || '*';
        if (st.charOutline) {
            ctx.lineWidth = Math.max(1, fontSize * 0.18);
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#000000";
            ctx.strokeText(ch, 0, 0);
        }
        ctx.fillStyle = p.def.color || "#ffffff";
        ctx.fillText(ch, 0, 0);
        ctx.restore();
    }
}

// ------------------------------------------------------------------
// Register controls with the character system
// ------------------------------------------------------------------
function registerControls() {
    if (!window.LavaCharacter || !window.LavaCharacter.controlsGroup) return;
    var group = window.LavaCharacter.controlsGroup;

    group.controls.push({
        special: "subheading",
        key: "_sh_projectiles",
        label: "🔫 Projectiles",
        def: 0,
        savedInPreset: false,
    });

    group.controls.push({
        icon: "🔫",
        key: "projSelected",
        def: 0,
        min: 0,
        max: selectableProjectiles.length - 1,
        step: 1,
        label: "Projectile",
        savedInPreset: false,
        details: "Select projectile type: " + selectableProjectiles.map(function (id) {
            return PROJECTILE_DEFS[id].name || id;
        }).join(', '),
    });

    group.controls.push({
        icon: "⏱️",
        key: "projFireRate",
        def: 5,
        min: 0.5,
        max: 30,
        step: 0.5,
        label: "Fire Rate",
        savedInPreset: false,
        details: "Shots per second when holding left mouse button.",
    });
}

// ------------------------------------------------------------------
// Export
// ------------------------------------------------------------------
window.LavaProjectile = {
    updateAll: updateAll,
    drawAll: drawAll,
    spawnProjectile: spawnProjectile,
    definitions: PROJECTILE_DEFS,
    selectable: selectableProjectiles,
    count: function () { return projectiles.length; },
    destroyAll: function () { projectiles.length = 0; },
};

registerControls();

})();