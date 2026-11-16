// =====================================================================
// game.state.js
// Game state machine for the lava lamp game.
// Exposes window.GameState.
//
// States:
//   Demo          — main menu with auto-player. Slow spawns, slow fire.
//   Chillax       — pure lava lamp, click anywhere to return to Demo.
//   Prep Start    — brief clear pass; transitions immediately to Game Start.
//   Game Start    — initialise player, score=0, round=1, kill counts=0.
//   Level Start   — banner "Round N - Kill all enemies" for 2s.
//   Playing       — N enemies spawn; play until all dead or player dies.
//   Round Complete— brief "Round complete! Round N+1..." banner for 1s.
//   Pause         — freeze; resume via P key or click.
//   Game Over     — "You are dead!" + kill breakdown; click to return to Demo.
//
// Loaded by loader.js before core.js. Depends on window.LavaCharacter
// and window.LavaProjectile being present.
// =====================================================================
(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Module-level state
    // ---------------------------------------------------------------------
    var current = 'Demo';
    var initialized = false;

    var menuIndex = 0;                  // 0 = Start, 1 = Chillax
    var round = 1;
    var timer = 0;                      // seconds in current state
    var roundCompleteTimer = 0;
    var pausePrevState = null;

    var fireTimer = 0;                  // seconds until next auto-fire
    var spawnTimer = 0;                 // seconds until next enemy spawn
    var spawnRemaining = 0;             // enemies still to spawn this round

    var demoPlayerRef = null;
    var gamePlayerRef = null;
    var lastEnvRef = null;

    var ignoreClickUntil = 0;           // ms timestamp; used to debounce clicks
    // that fire right after a transition

    var menuRects = { start: null, chillax: null };
    var lastAppliedPresetIdx = -1;

    // Enemies spawned per round = round * ENEMIES_PER_ROUND_MULTIPLIER
    const ENEMIES_PER_ROUND_MULTIPLIER = 4; // ← change this value

    // ---------------------------------------------------------------------
    // Round tuning
    // ---------------------------------------------------------------------
    function roundScaleFactor(r) {
        if (r <= 1) return 0.5;
        if (r >= 20) return 1.0;
        return 0.5 + (r - 1) * (0.5 / 19);
    }

    function roundSpawnInterval(env, r) {
        var baseRate = (env.state.charAutoSpawnRate != null) ? env.state.charAutoSpawnRate : 3;
        var rate = baseRate * roundScaleFactor(r);
        return 1 / Math.max(0.1, rate);
    }

    function roundFireInterval(env, r) {
        var baseRate = (env.state.projFireRate != null) ? env.state.projFireRate : 10;
        if (!isFinite(baseRate) || baseRate <= 0) baseRate = 10;
        var rate = baseRate * roundScaleFactor(r);
        return 1 / Math.max(0.1, rate);
    }

    function demoFireInterval(env) {
        var baseRate = (env.state.projFireRate != null) ? env.state.projFireRate : 10;
        if (!isFinite(baseRate) || baseRate <= 0) baseRate = 10;
        // Demo fires at 25% of the configured rate, but never faster than
        // 4 shots/sec (0.25s interval) so a misconfigured slider can't
        // produce a solid wall of bullets.
        return Math.max(0.25, 1 / Math.max(0.1, baseRate * 0.25));
    }

    function demoSpawnInterval(env) {
        var baseRate = (env.state.charAutoSpawnRate != null) ? env.state.charAutoSpawnRate : 3;
        return 1 / Math.max(0.1, baseRate * 0.3);
    }

    // ---------------------------------------------------------------------
    // Enemy helpers
    // ---------------------------------------------------------------------
    function countActiveEnemies() {
        if (!window.LavaCharacter) return 0;
        var pool = LavaCharacter.getEnemyPool();
        if (!pool) return 0;
        var n = 0;
        for (var i = 0; i < pool.length; i++) if (pool[i].active) n++;
        return n;
    }

    function clearEnemies() {
        if (!window.LavaCharacter) return;
        var pool = LavaCharacter.getEnemyPool();
        if (!pool) return;
        for (var i = 0; i < pool.length; i++) {
            pool[i].active = false;
            pool[i]._wasTouchingPlayer = false;
        }
    }

    function clearProjectiles() {
        if (window.LavaProjectile && window.LavaProjectile.destroyAll) {
            window.LavaProjectile.destroyAll();
        }
    }

    function clearPlayers() {
        if (!window.LavaCharacter) return;
        var players = LavaCharacter.getPlayers();
        if (players) players.length = 0;
        demoPlayerRef = null;
        gamePlayerRef = null;
    }

    function findNearestEnemy(x, y) {
        if (!window.LavaCharacter) return null;
        var pool = LavaCharacter.getEnemyPool();
        if (!pool) return null;
        var best = null, bestD2 = Infinity;
        for (var i = 0; i < pool.length; i++) {
            var e = pool[i];
            if (!e.active) continue;
            var dx = e.x - x, dy = e.y - y;
            var d2 = dx * dx + dy * dy;
            if (d2 < bestD2) { bestD2 = d2; best = e; }
        }
        return best;
    }

    // ---------------------------------------------------------------------
    // Player helpers
    // ---------------------------------------------------------------------
    function initKills(player) {
        if (!player) return;
        player.kills = player.kills || {};
        player.kills[LavaCharacter.TYPE_SURFACE] = 0;
        player.kills[LavaCharacter.TYPE_BOUNCE] = 0;
        player.kills[LavaCharacter.TYPE_FLOAT] = 0;
    }

    function resetPlayerForGame(player, lives) {
        if (!player) return;
        player.score = 0;
        player.lives = lives;
        initKills(player);
    }

    // ---------------------------------------------------------------------
    // State transitions
    // ---------------------------------------------------------------------
    function setState(name, env) {
        var prev = current;
        current = name;
        timer = 0;
        lastEnvRef = env;

        switch (name) {
            case 'Demo': enterDemo(env); break;
            case 'Chillax': enterChillax(env); break;
            case 'Prep Start': enterPrepStart(env); break;
            case 'Game Start': enterGameStart(env); break;
            case 'Level Start': enterLevelStart(env); break;
            case 'Playing': enterPlaying(env); break;
            case 'Round Complete': enterRoundComplete(env); break;
            case 'Pause': enterPause(env, prev); break;
            case 'Game Over': enterGameOver(env); break;
        }
    }

    // ---------------------------------------------------------------------
    // Per-state: enter
    // ---------------------------------------------------------------------
function enterDemo(env) {
    clearEnemies();
    clearProjectiles();
    clearPlayers();

    if (window.LavaCharacter) {
        var p = LavaCharacter.addPlayer();
        if (p) {
            p.autoMove = true;
            p.autoFire = true;
            p.lives = 99;
            initKills(p);
            demoPlayerRef = p;
        }
    }

    // Force auto-morph on for demo; reset the cycle so it kicks in fresh,
    // and sync the checkbox so the panel doesn't show a stale value.
    if (env && env.state) {
        env.state.autoMorph = 1;
    }
    var app = window.__lavalampApp;
    if (app) {
        if (typeof app.resetMorphTimer === 'function') app.resetMorphTimer();
        if (typeof app.refreshControls === 'function') app.refreshControls();
    }

    spawnRemaining = 0;
    spawnTimer = 0;
    fireTimer = 0;
}

    function enterChillax(env) {
        clearEnemies();
        clearProjectiles();
        clearPlayers();
    }

    function enterPrepStart(env) {
        if (env && env.state) {
            env.state.autoMorph = 0;
        }
        var app = window.__lavalampApp;
        if (app) {
            if (typeof app.resetMorphTimer === 'function') app.resetMorphTimer();
            if (typeof app.refreshControls === 'function') app.refreshControls();
        }

        clearEnemies();
        clearProjectiles();
        clearPlayers();
        // Transition happens on the next update tick.
    }

    function enterGameStart(env) {
        clearEnemies();
        clearProjectiles();
        clearPlayers();

        if (window.LavaCharacter) {
            var p = LavaCharacter.addPlayer();
            if (p) {
                var startingLives = (env.state.charPlayerLives != null)
                    ? env.state.charPlayerLives : 2;
                resetPlayerForGame(p, startingLives);
                p.autoMove = false;
                p.autoFire = false;
                gamePlayerRef = p;
            }
        }

        round = 1;
        // Transition to Level Start on the next update tick.
    }

    function enterLevelStart(env) {
        spawnRemaining = 0;
        spawnTimer = 0;
        fireTimer = 0;
        // Player is already there from Game Start. Banner shows for 2s.
    }

    function enterPlaying(env) {
        spawnRemaining = Math.max(1, Math.round(round * ENEMIES_PER_ROUND_MULTIPLIER));
        spawnTimer = 0;
        fireTimer = 0;
    }

    function enterRoundComplete(env) {
        var t = (env && env.state && env.state.presetTransitionTime != null)
            ? env.state.presetTransitionTime
            : 1.0;
        roundCompleteTimer = Math.max(0.1, t);

        applyRandomRoundPreset();
    }

    function enterPause(env, prevState) {
        pausePrevState = prevState;
    }

    function enterGameOver(env) {
        clearEnemies();
        clearProjectiles();
        // Leave the player visible for the game-over screen shot.
        ignoreClickUntil = performance.now() + 400;
    }

    function applyRandomRoundPreset() {
        var app = window.__lavalampApp;
        if (!app || typeof app.loadPreset !== 'function') return;
        var n = typeof app.getPresetCount === 'function' ? app.getPresetCount() : 0;
        if (n <= 1) return;                     // only "Default" — skip
        var idx;
        do { idx = Math.floor(Math.random() * n); }
        while (idx === lastAppliedPresetIdx);
        lastAppliedPresetIdx = idx;
        app.loadPreset(idx);
    }

    // ---------------------------------------------------------------------
    // Per-state: update
    // ---------------------------------------------------------------------
    function updateDemo(dt, now, env) {
        // Spawn slowly so the auto-player has targets.
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
            spawnTimer = demoSpawnInterval(env);
            if (countActiveEnemies() < 6) {
                var rtype = Math.floor(Math.random() * 3);
                var spawned = LavaCharacter.requestSpawn(rtype);
                if (spawned) {
                    console.log('[demo] spawned enemy type', rtype,
                        '— active:', countActiveEnemies());
                }
            }
        }

        // Auto-fire at nearest enemy.
        if (demoPlayerRef && demoPlayerRef.active) {
            fireTimer -= dt;
            if (fireTimer <= 0) {
                var target = findNearestEnemy(demoPlayerRef.x, demoPlayerRef.y);
                if (target) {
                    fireTimer = demoFireInterval(env);
                    autoFireAt(demoPlayerRef, target, env);
                }
            }
        }
    }

    function updateChillax(dt, now, env) {
        // Nothing moves; just the lava lamp. Click handled in onMouseDown.
    }

    function updatePrepStart(dt, now, env) {
        setState('Game Start', env);
    }

    function updateGameStart(dt, now, env) {
        setState('Level Start', env);
    }

    function updateLevelStart(dt, now, env) {
        if (timer >= 2.0) {
            setState('Playing', env);
        }
    }

    function updatePlaying(dt, now, env) {
        // Check player state.
        var players = LavaCharacter.getPlayers();
        if (players.length === 0) {
            setState('Game Over', env);
            return;
        }
        var p = players[0];
        if (p.lives <= 0) {
            setState('Game Over', env);
            return;
        }

        // Spawn remaining enemies for this round.
        if (spawnRemaining > 0) {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = roundSpawnInterval(env, round);
                var rtype = Math.floor(Math.random() * 3);
                var e = LavaCharacter.requestSpawn(rtype);
                if (e) {
                    spawnRemaining--;
                    console.log('[play] spawned enemy type', rtype,
                        '— remaining this round:', spawnRemaining);
                }
            }
        } else {
            // Round's enemies all spawned. If none alive, round is complete.
            if (countActiveEnemies() === 0) {
                setState('Round Complete', env);
                return;
            }
        }

        // Auto-fire (only if the current player is auto-firing — currently
        // only in Demo, but this branch stays in case we add auto-gameplay later).
        if (p && p.autoFire) {
            fireTimer -= dt;
            if (fireTimer <= 0) {
                var target = findNearestEnemy(p.x, p.y);
                if (target) {
                    fireTimer = roundFireInterval(env, round);
                    autoFireAt(p, target, env);
                }
            }
        }
    }

    function updateRoundComplete(dt, now, env) {
        roundCompleteTimer -= dt;
        if (roundCompleteTimer <= 0) {
            round++;
            setState('Level Start', env);
        }
    }

    function updatePause(dt, now, env) {
        // Frozen; key/click handled in listeners.
    }

    function updateGameOver(dt, now, env) {
        // Waiting for click.
    }

    // ---------------------------------------------------------------------
    // Auto-fire helper
    // ---------------------------------------------------------------------
    function autoFireAt(player, target, env) {
        if (!window.LavaCharacter || !window.LavaProjectile) return;

        var pSize = LavaCharacter.playerSize ? LavaCharacter.playerSize(player) : 0.028;
        if (!(pSize > 0)) pSize = 0.028;

        // Muzzle origin — same math as fireProjectile in projectile.js.
        var muzzleYFrac = (env.state.projMuzzleY != null) ? env.state.projMuzzleY : 0;
        var upX = 0, upY = 1;
        var s = LavaCharacter.sdfAt(player.x, player.y);
        if (s && (s.nx !== 0 || s.ny !== 0)) { upX = s.nx; upY = s.ny; }
        var muzzleY = muzzleYFrac * pSize;
        var ox = player.x + upX * muzzleY;
        var oy = player.y + upY * muzzleY;

        // Direction toward target.
        var dx = target.x - ox;
        var dy = target.y - oy;
        var dl = Math.hypot(dx, dy);
        if (dl < 1e-6) return;
        var dir = { x: dx / dl, y: dy / dl };

        // Always fire playerBullet — its radius/lightRadius are now sized
        // to match the gameplay projectile, so no def swap is needed.
        // `overrideDirection` in spawnProjectile bypasses the def's
        // direction: 'surfaceNormal' and flies along our aim vector.
        var def = LavaProjectile.definitions['playerBullet'];
        var bulletR = (def && def.radius != null) ? def.radius : 0.007;
        var gap = (env.state.projMuzzleOffset != null) ? env.state.projMuzzleOffset : 0.008;
        var off = bulletR + gap;

        LavaProjectile.spawnProjectile('playerBullet',
            ox + dir.x * off,
            oy + dir.y * off,
            {
                owner: player,
                player: player,
                overrideDirection: dir,
            });
    }

    // ---------------------------------------------------------------------
    // Main update entry
    // ---------------------------------------------------------------------
    function update(dt, now, env) {
        if (!initialized) {
            initialized = true;
            setState('Demo', env);
            return;
        }
        timer += dt;
        switch (current) {
            case 'Demo': updateDemo(dt, now, env); break;
            case 'Chillax': updateChillax(dt, now, env); break;
            case 'Prep Start': updatePrepStart(dt, now, env); break;
            case 'Game Start': updateGameStart(dt, now, env); break;
            case 'Level Start': updateLevelStart(dt, now, env); break;
            case 'Playing': updatePlaying(dt, now, env); break;
            case 'Round Complete': updateRoundComplete(dt, now, env); break;
            case 'Pause': updatePause(dt, now, env); break;
            case 'Game Over': updateGameOver(dt, now, env); break;
        }
    }

    // ---------------------------------------------------------------------
    // Drawing helpers
    // ---------------------------------------------------------------------
    function drawRect(ctx, x, y, w, h, fill, stroke, lw) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = lw || 2;
            ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
        }
    }

    function drawCentered(ctx, text, cx, cy, font, fill, stroke) {
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (stroke) {
            var strokeW = Math.max(2, parseInt(font.split(' ')[0], 10) * 0.14);
            ctx.lineWidth = strokeW;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = stroke;
            ctx.strokeText(text, cx, cy);
        }
        ctx.fillStyle = fill;
        ctx.fillText(text, cx, cy);
    }

    function ensureMenuRects(canvas) {
        if (!canvas) return;
        var W = canvas.width, H = canvas.height;
        var side = Math.min(W, H) * 0.20;
        var gap = side * 0.20;
        var total = side * 2 + gap;
        var x0 = (W - total) / 2;
        var y = (H - side) / 2;
        menuRects.start = { x: x0, y: y, w: side, h: side };
        menuRects.chillax = { x: x0 + side + gap, y: y, w: side, h: side };
    }

    // ---------------------------------------------------------------------
    // Per-state: draw
    // ---------------------------------------------------------------------
    function drawMenu(ctx) {
        var W = ctx.canvas.width, H = ctx.canvas.height;
        ensureMenuRects(ctx.canvas);

        // Darken the scene slightly so the menu is readable.
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, W, H);

        // Title — logo image if loaded, else fallback to text.
        var _logoAsset = GFXAssets.get('logo');
        var _logoImg = _logoAsset ? GFXAssets.getFrame(_logoAsset, 0) : null;
        if (_logoImg && (_logoImg.naturalWidth || _logoImg.width) > 0) {
            var _logoH = H * 0.25;
            var _logoW = _logoH * ((_logoImg.naturalWidth || _logoImg.width) /
                Math.max(1, _logoImg.naturalHeight || _logoImg.height));
            var _maxW = W * 0.80;
            if (_logoW > _maxW) {
                _logoH *= _maxW / _logoW;
                _logoW = _maxW;
            }
            ctx.drawImage(_logoImg, (W - _logoW) / 2, H * 0.22 - _logoH / 2, _logoW, _logoH);
        } else {
            var titleFont = 'bold ' + Math.round(H * 0.06) + 'px monospace';
            drawCentered(ctx, 'LAVA LAMP', W / 2, H * 0.22, titleFont, '#ffffff', '#000000');
        }

        // Two options
        var rects = [
            { rect: menuRects.start, label: 'Start', idx: 0 },
            { rect: menuRects.chillax, label: 'Chillax', idx: 1 },
        ];
        var labelFont = 'bold ' + Math.round(H * 0.035) + 'px monospace';

        for (var i = 0; i < rects.length; i++) {
            var r = rects[i].rect;
            var selected = (menuIndex === i);
            var fill = selected ? 'rgba(255, 210, 74, 0.30)' : 'rgba(0, 0, 0, 0.55)';
            var stroke = selected ? '#ffd24a' : '#666666';
            drawRect(ctx, r.x, r.y, r.w, r.h, fill, stroke, 3);
            drawCentered(ctx, rects[i].label,
                r.x + r.w / 2, r.y + r.h / 2,
                labelFont,
                selected ? '#ffd24a' : '#ffffff',
                '#000000');
        }

        // Hint
        var hintFont = 'bold ' + Math.round(H * 0.018) + 'px monospace';
        drawCentered(ctx, '\u2190 \u2192 to select \u2014 click to begin',
            W / 2, H * 0.82, hintFont, '#cccccc', '#000000');

        ctx.restore();
    }

    function drawChillaxHint(ctx) {
        var W = ctx.canvas.width, H = ctx.canvas.height;
        var font = 'bold ' + Math.round(H * 0.02) + 'px monospace';
        drawCentered(ctx, 'click to return', W / 2, H * 0.94, font, 'rgba(255,255,255,0.6)', 'rgba(0,0,0,0.6)');
    }

    function drawBanner(ctx, text, subtext) {
        var W = ctx.canvas.width, H = ctx.canvas.height;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, W, H);

        var mainFont = 'bold ' + Math.round(H * 0.055) + 'px monospace';
        drawCentered(ctx, text, W / 2, H / 2, mainFont, '#ffffff', '#000000');

        if (subtext) {
            var subFont = 'bold ' + Math.round(H * 0.028) + 'px monospace';
            drawCentered(ctx, subtext, W / 2, H / 2 + H * 0.10, subFont, '#ffd24a', '#000000');
        }
        ctx.restore();
    }

    function drawHUD(ctx, env) {
        var W = ctx.canvas.width, H = ctx.canvas.height;
        var font = 'bold ' + Math.round(H * 0.022) + 'px monospace';

        ctx.save();
        ctx.font = font;
        ctx.textBaseline = 'top';

        // Round
        ctx.textAlign = 'left';
        ctx.lineWidth = Math.max(2, H * 0.004);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        var roundStr = 'Round ' + round;
        ctx.strokeText(roundStr, 16, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(roundStr, 16, 12);

        // Score
        ctx.textAlign = 'right';
        var players = LavaCharacter ? LavaCharacter.getPlayers() : [];
        var score = (players.length > 0 && players[0].score != null) ? players[0].score : 0;
        var scoreStr = 'Score ' + Math.round(score);
        ctx.strokeText(scoreStr, W - 16, 12);
        ctx.fillStyle = '#ffd24a';
        ctx.fillText(scoreStr, W - 16, 12);
        ctx.restore();
    }

    function drawGameOver(ctx) {
        var W = ctx.canvas.width, H = ctx.canvas.height;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, W, H);

        var players = LavaCharacter ? LavaCharacter.getPlayers() : [];
        var p = players.length > 0 ? players[0] : null;
        var score = (p && p.score != null) ? Math.round(p.score) : 0;

        var titleFont = 'bold ' + Math.round(H * 0.055) + 'px monospace';
        var bodyFont = 'bold ' + Math.round(H * 0.028) + 'px monospace';
        var smallFont = 'bold ' + Math.round(H * 0.020) + 'px monospace';

        drawCentered(ctx, 'You are dead!', W / 2, H * 0.28, titleFont, '#ff4444', '#000000');
        drawCentered(ctx, 'You got ' + score + ' points, well done',
            W / 2, H * 0.28 + H * 0.09, bodyFont, '#ffffff', '#000000');

        // Kill breakdown by type.
        var lines = [];
        if (p && p.kills) {
            var surfN = p.kills[LavaCharacter.TYPE_SURFACE] || 0;
            var bounN = p.kills[LavaCharacter.TYPE_BOUNCE] || 0;
            var floN = p.kills[LavaCharacter.TYPE_FLOAT] || 0;
            lines.push('Surface: ' + surfN);
            lines.push('Bounce: ' + bounN);
            lines.push('Float: ' + floN);
        } else {
            lines.push('(no kill data)');
        }

        var lh = H * 0.035;
        var baseY = H * 0.52;
        for (var i = 0; i < lines.length; i++) {
            drawCentered(ctx, lines[i], W / 2, baseY + i * lh, smallFont, '#cfcfff', '#000000');
        }

        drawCentered(ctx, 'click to continue',
            W / 2, H * 0.86, bodyFont, '#ffd24a', '#000000');
        ctx.restore();
    }

    function draw(ctx, env) {
        switch (current) {
            case 'Demo':
                drawMenu(ctx);
                break;
            case 'Chillax':
                drawChillaxHint(ctx);
                break;
            case 'Level Start':
                drawHUD(ctx, env);
                drawBanner(ctx, 'Round ' + round + ' - Kill all enemies', null);
                break;
            case 'Round Complete':
                drawHUD(ctx, env);
                drawBanner(ctx, 'Round complete!', 'Round ' + (round + 1) + '...');
                break;
            case 'Playing':
                drawHUD(ctx, env);
                break;
            case 'Pause':
                drawHUD(ctx, env);
                drawBanner(ctx, 'Paused', 'P or click to resume');
                break;
            case 'Game Over':
                drawGameOver(ctx);
                break;
            // Prep Start / Game Start are transient — no draw.
        }
    }

    // ---------------------------------------------------------------------
    // Input
    // ---------------------------------------------------------------------
    function onKeyDown(e) {
        // Arrow keys: menu navigation in Demo.
        if (current === 'Demo') {
            if (e.key === 'ArrowLeft') {
                menuIndex = (menuIndex - 1 + 2) % 2;
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                menuIndex = (menuIndex + 1) % 2;
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                activateMenuSelection();
                e.preventDefault();
            }
        }

        // P: pause / unpause during gameplay.
        if ((e.key === 'p' || e.key === 'P') && lastEnvRef) {
            if (current === 'Playing') {
                setState('Pause', lastEnvRef);
                e.preventDefault();
            } else if (current === 'Pause') {
                setState(pausePrevState || 'Playing', lastEnvRef);
                e.preventDefault();
            }
        }
    }

    function onMouseDown(e) {
        if (e.button !== 0) return;
        if (performance.now() < ignoreClickUntil) return;

        var canvas = document.querySelector('canvas[data-lavalamp]');
        if (!canvas) return;
        var rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        var px = (e.clientX - rect.left);
        var py = (e.clientY - rect.top);

        if (current === 'Demo') {
            ensureMenuRects(canvas);
            if (menuRects.start && pointInRect(px, py, menuRects.start)) {
                menuIndex = 0;
                activateMenuSelection();
                e.preventDefault();
            } else if (menuRects.chillax && pointInRect(px, py, menuRects.chillax)) {
                menuIndex = 1;
                activateMenuSelection();
                e.preventDefault();
            }
        } else if (current === 'Chillax') {
            if (lastEnvRef) setState('Demo', lastEnvRef);
            e.preventDefault();
        } else if (current === 'Pause') {
            if (lastEnvRef) setState(pausePrevState || 'Playing', lastEnvRef);
            e.preventDefault();
        } else if (current === 'Game Over') {
            if (lastEnvRef) setState('Demo', lastEnvRef);
            e.preventDefault();
        }
    }

    function pointInRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    function activateMenuSelection() {
        if (!lastEnvRef) return;
        if (menuIndex === 0) {
            setState('Prep Start', lastEnvRef);
        } else {
            setState('Chillax', lastEnvRef);
        }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);

    // ---------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------
    window.GameState = {
        update: update,
        draw: draw,
        getCurrentState: function () { return current; },
        getRound: function () { return round; },
        isPaused: function () { return current === 'Pause'; },
        getScoreMultiplier: function () {
            // Round multiplier applies only during active gameplay states.
            if (current === 'Playing' ||
                current === 'Level Start' ||
                current === 'Round Complete' ||
                current === 'Pause') {
                return round;
            }
            return 1;
        },

        // character.js consults this before running its built-in auto-spawn.
        // Returning true means "the game state machine owns spawning; do not
        // add enemies automatically." Always true — every state either has
        // its own spawn logic (Demo, Playing) or spawns nothing (all others).
        isExternalSpawner: function () {
            return true;
        },

        // character.js consults this before auto-adding a player when the
        // player list is empty. Suppressed during Chillax (lamp-only) and
        // during Prep Start / Game Start (players are created by
        // enterGameStart, not by the safety net).
        isPlayerSuppressed: function () {
            return current === 'Chillax'
                || current === 'Prep Start'
                || current === 'Game Start';
        },

        // Optional external entry points.
        forceState: function (name, env) {
            if (env) lastEnvRef = env;
            setState(name, lastEnvRef);
        },
        resetToDemo: function (env) {
            if (env) lastEnvRef = env;
            setState('Demo', lastEnvRef);
        },
    };

})();