// =====================================================================
// projectile.js
// Projectile system for the lava lamp simulator.
// Exposes window.LavaProjectile.
//
// Fixed-size object pool. `active` flag + round-robin cursor. No splice().
//
// Destruction children are keyed by reason via `onDestroy`:
//   def.onDestroy = {
//     always:    [ { type, count }, ... ],
//     expire:    [ ... ],
//     collision: [ ... ],
//     minSpeed:  [ ... ],
//   }
// =====================================================================
(function () {
'use strict';

var MAX_PROJECTILES = 2048;

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
        speed: 0.4,
        hitsEnemies: false,
    },
    allGone: {
        id: 'All Gone',
        name: 'All Gone',
        char: '*',
        color: '#25ad13',
        lifespan: 1,
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
        speed: 0.4,
        hitsEnemies: false,
    },
    playerDead: {
        id: 'Player Dead',
        name: 'Player Dead',
        char: '*',
        color: '#ff0000',
        lifespan: 2,
        maxBounces: 0,
        bounceFactor: 1.0,
        damping: 0,
        minSpeed: 0.05,
        direction: 'random',
        directionVariance: 1.0 * Math.PI,
        inheritVelocity: 0,
        expireType: null,
        finalCollisionType: null,
        onDestroy: {
            expire: [{ type: 'puff', count: 3 }],
        },
        selectable: false,
        speed: 0.4,
        hitsEnemies: false,
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
    // Pool exhausted — steal the cursor slot (oldest by round-robin).
    // Its onDestroy children are *not* spawned; that's the price of recycling.
    var idx = projCursor;
    projCursor = (projCursor + 1) % MAX_PROJECTILES;
    projectiles[idx].active = false;
    projectiles[idx].def = null;
    projectiles[idx].owner = null;
    return projectiles[idx];
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

// Squared distance from point P to line segment A->B.
function segmentPointDistSq(ax, ay, bx, by, px, py) {
    var dx = bx - ax, dy = by - ay;
    var len2 = dx * dx + dy * dy;
    if (len2 < 1e-12) {
        var ex0 = px - ax, ey0 = py - ay;
        return ex0 * ex0 + ey0 * ey0;
    }
    var t = ((px - ax) * dx + (py - ay) * dy) / len2;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    var cx = ax + t * dx, cy = ay + t * dy;
    var fx = px - cx, fy = py - cy;
    return fx * fx + fy * fy;
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

    var players = window.LavaCharacter ? LavaCharacter.getPlayers() : [];
    var aimPoint = window.LavaCharacter ? LavaCharacter.getAimPoint() : { x: 0.5, y: 0.5 };
    var firing = window.LavaCharacter ? LavaCharacter.isFiring() : false;

    // Robust selection: honour an explicit 0, default to 1 only when unset.
    var selectedIdx = (st.projSelected != null) ? Math.round(st.projSelected) : 1;
    if (selectedIdx < 0) selectedIdx = 0;
    if (selectedIdx >= selectableProjectiles.length) selectedIdx = selectableProjectiles.length - 1;
    var defId = selectableProjectiles[selectedIdx];
    var fireRate = st.projFireRate || 5;
    var interval = 1 / Math.max(0.1, fireRate);

    // ---- Firing (per-player, shared input) ----
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

    var enemyPool = window.LavaCharacter ? LavaCharacter.getEnemyPool() : null;
    var charSize = st.charSize || 0.028;

    // ---- Update projectiles ----
    for (var i = 0; i < MAX_PROJECTILES; i++) {
        var pr = projectiles[i];
        if (!pr.active) continue;

        // Lifespan
        pr.life -= dt;
        if (pr.life <= 0) {
            destroyProjectile(pr, 'expire');
            continue;
        }

        // Remember pre-move position for swept / sub-stepped collision.
        var prevX = pr.x;
        var prevY = pr.y;

        // Damping
        if (pr.def.damping) {
            var k = Math.exp(-pr.def.damping * dt);
            pr.vx *= k;
            pr.vy *= k;
        }

        // Integrate
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;

        // Min speed
        var sp = Math.hypot(pr.vx, pr.vy);
        if (sp < pr.def.minSpeed) {
            destroyProjectile(pr, 'minSpeed');
            continue;
        }

        // Bullet radius for both enemy and surface collision.
        // Per-def `radius` override, else derived from charSize.
        var bulletR = (pr.def.radius != null) ? pr.def.radius : (charSize * 0.35);

        // ---- Enemy collision (swept segment vs circle, + bullet radius) ----
        if (pr.def.hitsEnemies && enemyPool) {
            var hitEnemy = null;
            for (var ei = 0; ei < enemyPool.length; ei++) {
                var e = enemyPool[ei];
                if (!e.active) continue;
                var eSize = charSize * (e.sizeMul || 1);
                var r = eSize * 0.5 + bulletR;
                if (segmentPointDistSq(prevX, prevY, pr.x, pr.y, e.x, e.y) < r * r) {
                    hitEnemy = e;
                    break;
                }
            }
            if (hitEnemy) {
                if (pr.owner && hitEnemy.score) {
                    pr.owner.score += hitEnemy.score;
                }
                var bx = hitEnemy.x, by = hitEnemy.y;
                hitEnemy.active = false;
                hitEnemy._wasTouchingPlayer = false;
                for (var j = 0; j < 8; j++) {
                    spawnProjectile('enemyBurst', bx, by, { owner: pr.owner });
                }
                destroyProjectile(pr, 'collision', null, null);
                continue;
            }
        }

        // ---- Surface collision (sub-stepped, bullet-radius aware) ----
        // SDF sign: positive = inside blob, negative = outside.
        // Edge-touch condition for a finite-radius bullet: sdf > -bulletR.
        var travel = sp * dt;
        var substeps = 1;
        if (travel > 0.01) {
            substeps = Math.min(8, Math.ceil(travel / 0.01));
        }

        var hitS = null;
        var hitX = pr.x, hitY = pr.y;

        if (substeps === 1) {
            // Cheap path — just the endpoint.
            hitS = window.LavaCharacter ? LavaCharacter.sdfAt(pr.x, pr.y) : null;
            if (hitS && hitS.sdf <= -bulletR) hitS = null;
        } else {
            var subX = (pr.x - prevX) / substeps;
            var subY = (pr.y - prevY) / substeps;
            var cx = prevX, cy = prevY;
            for (var si = 0; si < substeps; si++) {
                cx += subX;
                cy += subY;
                var ss = window.LavaCharacter ? LavaCharacter.sdfAt(cx, cy) : null;
                if (ss && ss.sdf > -bulletR) {
                    hitS = ss;
                    hitX = cx;
                    hitY = cy;
                    break;
                }
            }
            // Safety net: exact endpoint (catches float drift on last substep).
            if (!hitS) {
                var sEnd = window.LavaCharacter ? LavaCharacter.sdfAt(pr.x, pr.y) : null;
                if (sEnd && sEnd.sdf > -bulletR) {
                    hitS = sEnd;
                    hitX = pr.x;
                    hitY = pr.y;
                }
            }
        }

        if (hitS) {
            // Rewind to the true hit point before resolving the bounce.
            pr.x = hitX;
            pr.y = hitY;

            var vn = pr.vx * hitS.nx + pr.vy * hitS.ny;
            if (pr.bouncesLeft <= 0) {
                var bf = pr.def.bounceFactor;
                var rvx = pr.vx - (1 + bf) * vn * hitS.nx;
                var rvy = pr.vy - (1 + bf) * vn * hitS.ny;
                destroyProjectile(pr, 'collision', { x: hitS.nx, y: hitS.ny }, { x: rvx, y: rvy });
                continue;
            } else {
                pr.bouncesLeft--;
                if (vn < 0) {
                    pr.vx -= (1 + pr.def.bounceFactor) * vn * hitS.nx;
                    pr.vy -= (1 + pr.def.bounceFactor) * vn * hitS.ny;
                }
                // Push the bullet's centre out to (bulletR + gap) beyond the
                // surface, so next frame's collision test does not re-trigger.
                var proj = window.LavaCharacter ? LavaCharacter.projectToSurface(pr.x, pr.y, 6) : { x: pr.x, y: pr.y };
                var pushOut = bulletR + 0.005;
                pr.x = proj.x + hitS.nx * pushOut;
                pr.y = proj.y + hitS.ny * pushOut;
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
        def: 1,
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