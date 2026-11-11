// =====================================================================
// projectile.js
// Projectile system for the lava lamp simulator.
// Exposes window.LavaProjectile.
//
// Uses a fixed-size object pool (MAX_PROJECTILES). Every projectile in the
// pool has an `active` flag; spawn() takes the next free slot, destroy()
// simply clears the flag. No allocations in the hot path, no splice().
//
// Child spawning on destruction is keyed by reason via `onDestroy`:
//   def.onDestroy = {
//     always:    [ { type, count }, ... ],
//     expire:    [ ... ],
//     collision: [ ... ],
//     minSpeed:  [ ... ],
//   }
// Legacy single-child hooks `expireType` / `finalCollisionType` are also
// still honoured for backwards compatibility.
// =====================================================================
(function () {
'use strict';

// ------------------------------------------------------------------
// Pool size
// ------------------------------------------------------------------
var MAX_PROJECTILES = 512;

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
        onDestroy: {},
        selectable: false,
        speed: 1.0,
        hitsEnemies: false,
    },
    puff: {
        id: 'puff',
        name: 'Puff',
        char: '*',
        color: '#ff0000',
        lifespan: 0.15,
        maxBounces: 0,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'random',
        directionVariance: 1.0 * Math.PI,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {},
        selectable: false,
        speed: 0.25,
        hitsEnemies: false,
    },
        AllGone: {
        id: 'All Gone',
        name: 'All Gone',
        char: '*',
        color: '#25ad13',
        lifespan: 0.15,
        maxBounces: 0,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'random',
        directionVariance: 1.0 * Math.PI,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {},
        selectable: false,
        speed: 0.25,
        hitsEnemies: false,
    },
        PlayerDead: {
        id: 'Player Dead',
        name: 'Player Dead',
        char: '*',
        color: '#ff0000',
        lifespan: 0.45,
        maxBounces: 0,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'random',
        directionVariance: 1.0 * Math.PI,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {},
        selectable: false,
        speed: 0.25,
        hitsEnemies: false,
        onDestroy: {
            expire:    [{ type: 'puff',  count: 3 }],
        },
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
        direction: 'surfaceNormal',
        directionVariance: 0,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {
            collision: [{ type: 'spark', count: 3 }],
            expire:    [{ type: 'puff',  count: 3 }],
        },
        selectable: true,
        speed: null,
        hitsEnemies: true,
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
        onDestroy: {
            collision: [{ type: 'spark', count: 3 }],
            expire:    [{ type: 'puff',  count: 3 }],
        },
        selectable: true,
        speed: 0.8,
        hitsEnemies: true,
    },
    enemyBurst: {
        id: 'enemyBurst',
        name: 'Enemy Burst',
        char: '*',
        color: '#ff6b6b',
        lifespan: 0.35,
        maxBounces: 1,
        bounceFactor: 0.7,
        damping: 0,
        minSpeed: 0.05,
        direction: 'random',
        directionVariance: 0,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {},
        selectable: false,
        speed: 0.9,
        hitsEnemies: false,
    },
};

var selectableProjectiles = ['playerBullet', 'aimBullet'];

// ------------------------------------------------------------------
// Object pool
// ------------------------------------------------------------------
var projectiles = [];
for (var _i = 0; _i < MAX_PROJECTILES; _i++) {
    projectiles.push({
        active: false,
        def: null,
        owner: null,
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0,
        bouncesLeft: 0,
    });
}
var projCursor = 0;

function allocProjectile() {
    for (var i = 0; i < MAX_PROJECTILES; i++) {
        var idx = (projCursor + i) % MAX_PROJECTILES;
        if (!projectiles[idx].active) {
            projCursor = (idx + 1) % MAX_PROJECTILES;
            return projectiles[idx];
        }
    }
    return null;
}

function countActiveProjectiles() {
    var n = 0;
    for (var i = 0; i < MAX_PROJECTILES; i++) if (projectiles[i].active) n++;
    return n;
}

function countsByType() {
    var counts = {};
    for (var id in PROJECTILE_DEFS) counts[id] = 0;
    for (var i = 0; i < MAX_PROJECTILES; i++) {
        var p = projectiles[i];
        if (!p.active) continue;
        counts[p.def.id]++;
    }
    return counts;
}

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
        case 'player':
            if (opts.player) return norm(opts.player.fwdX, opts.player.fwdY);
            return { x: 1, y: 0 };
        case 'up':
            return { x: 0, y: 1 };
        case 'surfaceNormal': {
            var s = window.LavaCharacter ? LavaCharacter.sdfAt(x, y) : null;
            if (s && (s.nx !== 0 || s.ny !== 0)) return norm(s.nx, s.ny);
            return { x: 0, y: 1 };
        }
        case 'aim': {
            var aim = opts.aimPoint || { x: 0.5, y: 0.5 };
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
// Spawn / destroy
// ------------------------------------------------------------------
function spawnProjectile(defId, x, y, opts) {
    opts = opts || {};
    var def = PROJECTILE_DEFS[defId];
    if (!def) return null;

    var env = window.LavaCharacter ? LavaCharacter.getEnv() : null;
    var aspect = env ? env.aspect : 1;

    var baseDir = computeBaseDirection(def, x, y, opts);

    if (def.directionVariance) {
        var varAngle = (Math.random() * 2 - 1) * def.directionVariance;
        var ca = Math.cos(varAngle), sa = Math.sin(varAngle);
        var nx = baseDir.x * ca - baseDir.y * sa;
        var ny = baseDir.x * sa + baseDir.y * ca;
        baseDir.x = nx;
        baseDir.y = ny;
    }

    var speed = def.speed;
    if (speed === null || speed === undefined) {
        if (def.id === 'playerBullet') {
            speed = aspect;
        } else {
            speed = 1.0;
        }
    }

    var vx = baseDir.x * speed;
    var vy = baseDir.y * speed;

    if (opts.parentVx !== undefined && opts.parentVy !== undefined && def.inheritVelocity) {
        vx += opts.parentVx * def.inheritVelocity;
        vy += opts.parentVy * def.inheritVelocity;
    }

    var slot = allocProjectile();
    if (!slot) return null;

    slot.active = true;
    slot.def = def;
    slot.owner = opts.owner || null;
    slot.x = x;
    slot.y = y;
    slot.vx = vx;
    slot.vy = vy;
    slot.life = def.lifespan;
    slot.bouncesLeft = def.maxBounces;

    return slot;
}

function spawnChildren(list, p, collisionNormal, bd) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
        var dp = list[i];
        for (var c = 0; c < dp.count; c++) {
            spawnProjectile(dp.type, p.x, p.y, {
                parentVx: p.vx,
                parentVy: p.vy,
                normal: collisionNormal,
                bounceDir: bd,
                owner: p.owner,
            });
        }
    }
}

function destroyProjectile(p, reason, collisionNormal, bounceDir) {
    var def = p.def;
    var bd = bounceDir || norm(p.vx, p.vy);

    var map = def.onDestroy || {};
    spawnChildren(map.always,  p, collisionNormal, bd);
    spawnChildren(map[reason], p, collisionNormal, bd);

    if (reason === 'expire' && def.expireType) {
        spawnProjectile(def.expireType, p.x, p.y, {
            parentVx: p.vx, parentVy: p.vy,
            normal: collisionNormal, bounceDir: bd, owner: p.owner,
        });
    }
    if (reason === 'collision' && def.finalCollisionType) {
        spawnProjectile(def.finalCollisionType, p.x, p.y, {
            parentVx: p.vx, parentVy: p.vy,
            normal: collisionNormal, bounceDir: bd, owner: p.owner,
        });
    }

    p.active = false;
    p.def = null;
    p.owner = null;
}

// ------------------------------------------------------------------
// Fire from a player
// ------------------------------------------------------------------
function fireProjectile(player, defId, env, aimPoint) {
    if (!player) return;
    var def = PROJECTILE_DEFS[defId];
    if (!def) return;

    var baseDir = computeBaseDirection(def, player.x, player.y, {
        player: player,
        aimPoint: aimPoint,
    });
    var off = 0.03;

    spawnProjectile(defId, player.x + baseDir.x * off, player.y + baseDir.y * off, {
        player: player,
        aimPoint: aimPoint,
        owner: player,
    });
}

// ------------------------------------------------------------------
// Update
// ------------------------------------------------------------------
function updateAll(dt, env) {
    if (!(dt > 0)) return;

    var st = env.state;

    // ---- Firing (per-player, shared input) ----
    var players = window.LavaCharacter ? LavaCharacter.getPlayers() : [];
    var aimPoint = window.LavaCharacter ? LavaCharacter.getAimPoint() : { x: 0.5, y: 0.5 };
    var firing = window.LavaCharacter ? LavaCharacter.isFiring() : false;

    var selectedIdx = Math.round(st.projSelected || 0);
    if (selectedIdx < 0) selectedIdx = 0;
    if (selectedIdx >= selectableProjectiles.length) selectedIdx = selectableProjectiles.length - 1;
    var defId = selectableProjectiles[selectedIdx];
    var fireRate = st.projFireRate || 5;
    var interval = 1 / Math.max(0.1, fireRate);

    for (var pi = 0; pi < players.length; pi++) {
        var p = players[pi];
        if (!firing) { p.fireTimer = 0; continue; }
        p.fireTimer -= dt;
        var guard = 0;
        while (p.fireTimer <= 0 && guard++ < 10) {
            fireProjectile(p, defId, env, aimPoint);
            p.fireTimer += interval;
        }
    }

    // ---- Update projectiles ----
    var enemyPool = window.LavaCharacter ? LavaCharacter.getEnemyPool() : null;
    var charSize = st.charSize || 0.028;

    for (var i = 0; i < MAX_PROJECTILES; i++) {
        var pr = projectiles[i];
        if (!pr.active) continue;

        pr.life -= dt;
        if (pr.life <= 0) {
            destroyProjectile(pr, 'expire');
            continue;
        }

        if (pr.def.damping) {
            var k = Math.exp(-pr.def.damping * dt);
            pr.vx *= k;
            pr.vy *= k;
        }

        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;

        var sp = Math.hypot(pr.vx, pr.vy);
        if (sp < pr.def.minSpeed) {
            destroyProjectile(pr, 'minSpeed');
            continue;
        }

        // ---- Enemy collision ----
        if (pr.def.hitsEnemies && enemyPool) {
            var hitEnemy = null;
            for (var ei = 0; ei < enemyPool.length; ei++) {
                var e = enemyPool[ei];
                if (!e.active) continue;
                var eSize = charSize * (e.sizeMul || 1);
                var r = eSize * 0.5;
                var dx = pr.x - e.x;
                var dy = pr.y - e.y;
                if (dx * dx + dy * dy < r * r) {
                    hitEnemy = e;
                    break;
                }
            }
            if (hitEnemy) {
                // Credit the owner player
                if (pr.owner && hitEnemy.score) {
                    pr.owner.score += hitEnemy.score;
                }
                var bx = hitEnemy.x, by = hitEnemy.y;
                hitEnemy.active = false;
                hitEnemy._wasTouchingPlayer = false;
                for (var j = 0; j < 6; j++) {
                    spawnProjectile('enemyBurst', bx, by, { owner: pr.owner });
                }
                destroyProjectile(pr, 'collision', null, null);
                continue;
            }
        }

        // ---- Surface collision ----
        var s = window.LavaCharacter ? LavaCharacter.sdfAt(pr.x, pr.y) : null;
        if (s && s.sdf > -0.002) {
            var vn = pr.vx * s.nx + pr.vy * s.ny;
            if (pr.bouncesLeft <= 0) {
                var bf = pr.def.bounceFactor;
                var rvx = pr.vx - (1 + bf) * vn * s.nx;
                var rvy = pr.vy - (1 + bf) * vn * s.ny;
                destroyProjectile(pr, 'collision', { x: s.nx, y: s.ny }, { x: rvx, y: rvy });
                continue;
            } else {
                pr.bouncesLeft--;
                if (vn < 0) {
                    pr.vx -= (1 + pr.def.bounceFactor) * vn * s.nx;
                    pr.vy -= (1 + pr.def.bounceFactor) * vn * s.ny;
                }
                var proj = window.LavaCharacter ? LavaCharacter.projectToSurface(pr.x, pr.y, 6) : { x: pr.x, y: pr.y };
                var eps = 0.005;
                pr.x = proj.x + s.nx * eps;
                pr.y = proj.y + s.ny * eps;
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

    for (var i = 0; i < MAX_PROJECTILES; i++) {
        var p = projectiles[i];
        if (!p.active) continue;
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
// Register controls
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
    destroyProjectile: destroyProjectile,
    definitions: PROJECTILE_DEFS,
    selectable: selectableProjectiles,
    count: countActiveProjectiles,
    countsByType: countsByType,
    capacity: MAX_PROJECTILES,
    destroyAll: function () {
        for (var i = 0; i < MAX_PROJECTILES; i++) {
            projectiles[i].active = false;
            projectiles[i].def = null;
            projectiles[i].owner = null;
        }
    },
};

registerControls();

})();