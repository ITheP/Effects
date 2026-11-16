// =====================================================================
// projectile.js
// Projectile system for the lava lamp simulator.
// Exposes window.LavaProjectile.
//
// Fixed-size object pool (2048 slots) with round-robin cursor and
// recycling on overflow. No allocations in the hot path, no splice().
//
// Destruction children keyed by reason via `onDestroy`:
//   def.onDestroy = {
//     always:    [ { type, count }, ... ],
//     expire:    [ ... ],
//     collision: [ ... ],
//     minSpeed:  [ ... ],
//   }
//
// Each def has a `renderStyle`:
//   'wax'  -> shaded as a small wax blob by the WebGL overlay pass
//   'glow' -> additive glow quad (sparks, puffs, bursts)
//   'glyph'-> fallback 2D-canvas glyph (used when projRenderMode = glyph)
//
// The WebGL pass pulls data via forEachActive(cb).
// =====================================================================
(function () {
    'use strict';

    // ------------------------------------------------------------------
    // Pool size
    // ------------------------------------------------------------------
    var MAX_PROJECTILES = 2048;

    // =====================================================================
    // PROJECTILE DEFINITIONS
    // =====================================================================
    //
    // Each entry in PROJECTILE_DEFS describes one projectile type. The key
    // is the lookup id used with spawnProjectile('key', ...). The object's
    // `id` field should match that key (used by the debug overlay and by
    // any code that needs to name a def), while `name` is a human-readable
    // label shown in the UI.
    //
    // ---------------------------------------------------------------------
    // VISUAL FIELDS
    // ---------------------------------------------------------------------
    //
    //   char          string
    //                 Single glyph used when renderStyle === 'glyph'.
    //                 Ignored by the wax and glow renderers.
    //
    //   color         hex colour string  (e.g. '#ffd24a')
    //                 What this field means depends on renderStyle:
    //                   'glyph'  → glyph fill colour
    //                   'glow'   → additive glow tint
    //                   'wax'    → base wax tint when useDefColor is truthy
    //
    //   useDefColor   bool  (default false)
    //                 Only meaningful for renderStyle === 'wax'.
    //
    //   radius        number  (screen-height units, e.g. 0.012)
    //                 Visual half-size of the bullet AND its collision
    //                 radius — they share one value so they always match.
    //
    //   renderStyle   'wax' | 'glow' | 'glyph'
    //                 Default (if omitted) is 'glyph'.
    //
    // ---------------------------------------------------------------------
    // MOTION / TIMING FIELDS
    // ---------------------------------------------------------------------
    //
    //   lifespan      seconds
    //   speed         number | null
    //   direction     'random' | 'normal' | 'player' | 'up' |
    //                 'surfaceNormal' | 'aim' | 'bounce'
    //   directionVariance   radians
    //   inheritVelocity     number (0..1 typical)
    //   damping       number
    //   minSpeed      number
    //
    // ---------------------------------------------------------------------
    // COLLISION FIELDS
    // ---------------------------------------------------------------------
    //
    //   maxBounces    integer
    //   bounceFactor  number
    //   hitsEnemies   bool
    //
    // ---------------------------------------------------------------------
    // DESTRUCTION FIELDS
    // ---------------------------------------------------------------------
    //
    //   onDestroy     object keyed by reason
    //   expireType    legacy single-def convenience
    //   finalCollisionType  legacy single-def convenience
    //
    // ---------------------------------------------------------------------
    // UI / SELECTION
    // ---------------------------------------------------------------------
    //
    //   selectable    bool
    //
    // =====================================================================

    var PROJECTILE_DEFS = {
        spark: {
            id: 'spark',
            name: 'Spark',
            char: '*',
            color: '#ffee01',
            useDefColor: true,
            radius: 0.003,
            renderStyle: 'glow',
            emitsLight: true,
            lightRadius: 0.06,
            lightStrength: 0.5,
            lifespan: 0.25,
            maxBounces: 5,
            bounceFactor: 1.0,
            damping: 0,
            minSpeed: 0.08,
            direction: 'bounce',
            directionVariance: 0.2 * Math.PI,
            inheritVelocity: 0,
            expireType: null,
            finalCollisionType: null,
            onDestroy: {},
            selectable: false,
            speed: 0.08,
            hitsEnemies: false,
        },
        waxSpark: {
            id: 'waxSpark',
            name: 'Wax Spark',
            char: '*',
            color: '#ffee01',
            useDefColor: true,
            radius: 0.002,
            renderStyle: 'wax',
            emitsLight: true,
            lightRadius: 0.03,
            lightStrength: 0.5,
            lifespan: 0.25,
            maxBounces: 5,
            bounceFactor: 1.0,
            damping: 0,
            minSpeed: 0.08,
            direction: 'bounce',
            directionVariance: 0.2 * Math.PI,
            inheritVelocity: 0,
            expireType: null,
            finalCollisionType: null,
            onDestroy: {},
            selectable: false,
            speed: 0.08,
            hitsEnemies: false,
        },
        puff: {
            id: 'puff',
            name: 'Puff',
            char: '*',
            color: '#ff0000',
            useDefColor: true,
            emitsLight: true,
            lightRadius: 0.04,
            lightStrength: 0.5,
            radius: 0.002,
            renderStyle: 'wax',
            lifespan: 0.15,
            maxBounces: 5,
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
            speed: 0.6,
            hitsEnemies: false,
        },
        allGone: {
            id: 'allGone',
            name: 'All Gone',
            char: '*',
            color: '#25ad13',
            useDefColor: true,
            emitsLight: true,
            lightRadius: 0.04,
            lightStrength: 0.5,
            radius: 0.005,
            renderStyle: 'wax',
            lifespan: 1,
            maxBounces: 5,
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
            id: 'playerDead',
            name: 'Player Dead',
            char: '*',
            color: '#ff0000',
            useDefColor: true,
            emitsLight: true,
            lightRadius: 0.04,
            lightStrength: 0.5,
            radius: 0.004,
            renderStyle: 'wax',
            lifespan: 1.5,
            maxBounces: 5,
            bounceFactor: 1.0,
            damping: 0,
            minSpeed: 0.05,
            direction: 'random',
            directionVariance: 1.0 * Math.PI,
            inheritVelocity: 0,
            expireType: null,
            finalCollisionType: null,
            onDestroy: {
                collision: [{ type: 'spark', count: 3 }],
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
            radius: 0.07,
            renderStyle: 'wax',
            emitsLight: true,
            lightRadius: 0.4,
            lightStrength: 2.5,
            lightColor: '#4488ff',
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
                expire: [{ type: 'puff', count: 3 }],
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
            radius: 0.005,
            renderStyle: 'wax',
            emitsLight: true,
            lightRadius: 0.025,
            lightStrength: 0.5,
            lifespan: 0.5,
            maxBounces: 0,
            bounceFactor: 1.0,
            damping: 0,
            minSpeed: 0.05,
            direction: 'aim',
            directionVariance: 0.032,
            inheritVelocity: 0,
            expireType: null,
            finalCollisionType: null,
            onDestroy: {
                collision: [{ type: 'waxSpark', count: 3 }],
                expire: [{ type: 'puff', count: 3 }],
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
            useDefColor: true,
            radius: 0.003,
            renderStyle: 'wax',
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
        text: {
            id: 'text',
            name: 'Text',
            char: '',
            color: '#ffffff',
            radius: 0,
            renderStyle: 'string',
            emitsLight: false,
            lifespan: 0.5,
            maxBounces: 0,
            bounceFactor: 0,
            damping: 0,
            minSpeed: 0,
            direction: 'up',
            directionVariance: 0,
            inheritVelocity: 0,
            expireType: null,
            finalCollisionType: null,
            onDestroy: {},
            selectable: false,
            speed: 0.15,
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

    function countsByStyle() {
        var counts = { wax: 0, glow: 0, glyph: 0 };
        for (var i = 0; i < MAX_PROJECTILES; i++) {
            var p = projectiles[i];
            if (!p.active) continue;
            var s = p.def.renderStyle || 'glyph';
            if (!(s in counts)) counts[s] = 0;
            counts[s]++;
        }
        return counts;
    }

    // ------------------------------------------------------------------
    // Public iterator for the WebGL wax/glow overlay pass.
    // ------------------------------------------------------------------
    function forEachActive(cb) {
        for (var i = 0; i < MAX_PROJECTILES; i++) {
            var p = projectiles[i];
            if (p.active) cb(p);
        }
    }

    function forEachActiveByStyle(style, cb) {
        for (var i = 0; i < MAX_PROJECTILES; i++) {
            var p = projectiles[i];
            if (!p.active) continue;
            if ((p.def.renderStyle || 'glyph') !== style) continue;
            cb(p);
        }
    }

    // Fade-out alpha for a bullet in its last ~10% of life.
    function bulletAlpha(p) {
        var fade = Math.max(0.03, p.def.lifespan * 0.1);
        return Math.min(1, Math.max(0, p.life / fade));
    }

    // Hex -> linear 0..1 RGB triple.
    function hexToRgb(hex) {
        hex = (hex || '#ffffff').replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255,
        ];
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

        // Text-specific per-instance data. Only populated for text projectiles.
        slot.textString = null;
        slot.textColor = null;
        if (def.id === 'text') {
            var raw = opts.text;
            if (raw === 'score' || raw === undefined || raw === null) {
                // Fall back to a numeric score if provided, else blank
                slot.textString = (opts.score != null) ? String(Math.round(opts.score)) : '';
            } else {
                slot.textString = String(raw);
            }
            // Colour inherits from opts.color, else from the def's own color
            slot.textColor = opts.color || def.color || '#ffffff';
        }

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
        spawnChildren(map.always, p, collisionNormal, bd);
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
    //
    // The muzzle origin sits at the player's anchor raised by projMuzzleY
    // ALONG THE SHIP'S LOCAL-UP (surface normal), so it follows the ship
    // as it rotates around the wax. projMuzzleY is expressed as a fraction
    // of the player's effective size (charSize × sizeMul × playerScale),
    // so raising playerScale raises the muzzle proportionally.
    //
    // projMuzzleOffset is then applied radially from that origin along the
    // bullet's launch direction (a fixed world-space gap between hull and
    // bullet).
    // ------------------------------------------------------------------
    function fireProjectile(player, defId, env, aimPoint) {
        if (!player) return;
        var def = PROJECTILE_DEFS[defId];
        if (!def) return;

        var envState = (env && env.state) ? env.state : null;
        var muzzleYFrac = (envState && envState.projMuzzleY != null) ? envState.projMuzzleY : 0;

        // Effective player size for scaling the muzzle lift.
        var playerSize = 0.028;
        if (window.LavaCharacter && window.LavaCharacter.playerSize) {
            var sz = window.LavaCharacter.playerSize(player);
            if (sz > 0) playerSize = sz;
        }
        var muzzleY = muzzleYFrac * playerSize;

        // Local-up at the player = surface normal (points away from the wax).
        var upX = 0, upY = 1;
        if (window.LavaCharacter && LavaCharacter.sdfAt) {
            var s = LavaCharacter.sdfAt(player.x, player.y);
            if (s && (s.nx !== 0 || s.ny !== 0)) {
                upX = s.nx;
                upY = s.ny;
            }
        }

        var originX = player.x + upX * muzzleY;
        var originY = player.y + upY * muzzleY;

        var baseDir = computeBaseDirection(def, originX, originY, {
            player: player,
            aimPoint: aimPoint,
        });

        var bulletR = (def.radius != null) ? def.radius : 0.01;
        var gap = (envState && envState.projMuzzleOffset != null) ? envState.projMuzzleOffset : 0.008;
        var off = bulletR + gap;

        spawnProjectile(defId,
            originX + baseDir.x * off,
            originY + baseDir.y * off, {
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

            pr.life -= dt;
            if (pr.life <= 0) {
                destroyProjectile(pr, 'expire');
                continue;
            }

            var prevX = pr.x;
            var prevY = pr.y;

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

            // ---- Surface collision (sub-stepped along the frame's motion) ----
            var travel = sp * dt;
            var substeps = 1;
            if (travel > 0.01) {
                substeps = Math.min(8, Math.ceil(travel / 0.01));
            }

            var hitS = null;
            var hitX = pr.x, hitY = pr.y;

            if (substeps === 1) {
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
                    var proj = window.LavaCharacter ? LavaCharacter.projectToSurface(pr.x, pr.y, 6) : { x: pr.x, y: pr.y };
                    var pushOut = bulletR + 0.005;
                    pr.x = proj.x + hitS.nx * pushOut;
                    pr.y = proj.y + hitS.ny * pushOut;
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Draw (2D-canvas glyph fallback)
    // ------------------------------------------------------------------
    function drawAll(ctx, env) {
        var st = env.state;

        if (st.projRenderMode != null && st.projRenderMode >= 0.5) return;

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
            def: 10,
            min: 0.5,
            max: 30,
            step: 0.5,
            label: "Fire Rate",
            savedInPreset: false,
            details: "Shots per second when holding left mouse button.",
        });
        group.controls.push({
            icon: "🎨",
            key: "projRenderMode",
            def: 1,
            min: 0,
            max: 1,
            step: 1,
            int: true,
            label: "Render Mode",
            savedInPreset: false,
            details: "0 = glyphs on the 2D overlay canvas. 1 = wax / glow WebGL overlay.",
        });
        group.controls.push({
            icon: "🎯",
            key: "projMuzzleOffset",
            def: 0.000,
            min: 0,
            max: 0.15,
            step: 0.001,
            label: "Muzzle Offset",
            savedInPreset: false,
            details: "Radial gap from the muzzle origin along the launch direction. 0 = bullet touches the origin, larger = further out. Bullet size is added automatically.",
        });
        group.controls.push({
            icon: "⬆️",
            key: "projMuzzleY",
            def: 0.8,
            min: 0,
            max: 2,
            step: 0.8,
            label: "Muzzle Y",
            savedInPreset: false,
            details: "Muzzle origin height, as a fraction of the player's own size (so it follows playerScale). Lifted along the ship's local-up (surface normal). 0 = ship's anchor, 0.5 = mid-hull, 1.0 ≈ top of the hull.",
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
        countsByStyle: countsByStyle,
        capacity: MAX_PROJECTILES,

        // WebGL overlay data access
        forEachActive: forEachActive,
        forEachActiveByStyle: forEachActiveByStyle,
        bulletAlpha: bulletAlpha,
        hexToRgb: hexToRgb,

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