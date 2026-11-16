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
// Player type definitions
// ------------------------------------------------------------------
var PLAYER_TYPES = [
    { name: 'Player 1', controlsReversed: false },
    { name: 'Player 2', controlsReversed: true  },
];
var MAX_PLAYERS = PLAYER_TYPES.length;

// ------------------------------------------------------------------
// Pool size
// ------------------------------------------------------------------
var MAX_ENEMIES = 128;

// ------------------------------------------------------------------
// Player death tuning
// ------------------------------------------------------------------
var PLAYER_DEATH_BURST_COUNT = 16;
var PLAYER_RESPAWN_INVULN    = 1.5;
var PLAYER_DEATH_COOLDOWN    = 0.5;

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

    // Per-type scale multipliers (applied on top of charSize).
    playerScale:         2.0,
    enemyScale:          1.5,

    // GFX assets
    charShipAsset:       "ship-001",
    charFloatAsset:      "bulb-001-pickup",

    // Ship overlay (bulb) config
    charPlayerLives:      2,
    charShipBulbOnAsset:  "bulb-001-on",
    charShipBulbOffAsset: "bulb-001-broken",
    charShipBulbOffset:   0.36,
    charShipBulbScale:    0.25,

    charColorSurface:    "#ffffff",
    charGravity:         1.0,
    charGrip:            1.0,
    charRunSpeed:        0.18,
    charStruggle:        1.0,
    charAttraction:      1.0,
    charScoreSurface:    10,

    charColorBounce:     "#ffd24a",
    charBounce:          0.4,
    charBounceMin:       0.85,
    charMinBounceSpeed:  0.15,
    charBounceSpin:      15.0,
    charBounceSpinDrag:  1.5,
    charBounceVariance:      0.20,
    charBounceMinVariance:   0.15,
    charMinBounceSpeedVariance: 0.25,
    charScoreBounce:     20,

    charColorFloat:      "#8fd6ff",
    charFloatBounce:     1.0,
    charFloatMinBounce:  0.15,
    charFloatSpin:       30.0,
    charFloatSpinDrag:   1.5,
    charFloatBounceVariance:   0.20,
    charFloatMinBounceVariance: 0.25,
    charScoreFloat:      15,

    charAutoSpawn:       true,
    charAutoSpawnRate:   3.0,

    charColorPlayer1:    "#c300ff",
    charColorPlayer2:    "#3cff00",
    charPlayerLightRadius:   0.09,
    charPlayerLightStrength: 0.25,
    charPlayerLightGlow:     0.42,
    charBulbGlowColor: "#ffcc44",   // warm yellow by default

    charDebug:           false,
};

var AIR_DRAG        = 1.5;
var TERMINAL_CAP    = 2.0;
var FLOAT_MIN_SPEED = 0.05;
var FLOAT_DRAG      = 0.15;

// ------------------------------------------------------------------
// Global input state
// ------------------------------------------------------------------
var inputState = {
    left: false,
    right: false,
    firing: false,
    aim: { x: 0.5, y: 0.5 },
};

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
    inputState.aim.x = px * asp;
    inputState.aim.y = 1 - py;
}

window.addEventListener('mousemove', updateMouseFromEvent);
window.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    updateMouseFromEvent(e);
    inputState.firing = true;
});
window.addEventListener('mouseup', function (e) {
    if (e.button !== 0) return;
    inputState.firing = false;
});
window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { inputState.left  = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { inputState.right = true; e.preventDefault(); }
});
window.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft')  inputState.left  = false;
    if (e.key === 'ArrowRight') inputState.right = false;
});

// ------------------------------------------------------------------
// Instance factory
// ------------------------------------------------------------------
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
        active: false,
        _wasTouchingPlayer: false,
        score: 0,
        lives: 0,
    };
}

// ------------------------------------------------------------------
// Pools
// ------------------------------------------------------------------
var enemies = [];
for (var _i = 0; _i < MAX_ENEMIES; _i++) {
    var _e = createInstance();
    _e.active = false;
    enemies.push(_e);
}

var players = [];
var autoSpawnTimer = 0;

// ------------------------------------------------------------------
// Player factory
// ------------------------------------------------------------------
function createPlayer(typeIdx) {
    var t = PLAYER_TYPES[typeIdx];
    if (!t) return null;
    var p = createInstance();
    p.isPlayer = true;
    p.active = true;
    p.type = TYPE_SURFACE;
    p.playerTypeIdx = typeIdx;
    p.controlsReversed = t.controlsReversed;
    p.score = 0;
    p.fireTimer = 0;
    p._invulnTimer = 0;
    p._deathCooldown = 0;
    p._respawning = false;
    p.lives = DEFAULTS.charPlayerLives;
    return p;
}

function addPlayer() {
    if (players.length >= MAX_PLAYERS) return null;
    var p = createPlayer(players.length);
    if (!p) return null;
    players.push(p);
    return p;
}

function getPrimaryPlayer() {
    return players.length > 0 ? players[0] : null;
}

// ------------------------------------------------------------------
// Variance & effective values
// ------------------------------------------------------------------
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

function effSize(st, inst) {
    var base = st.charSize * (inst.sizeMul || 1);
    if (inst.isPlayer) return base * (st.playerScale || 1);
    return base * (st.enemyScale || 1);
}
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
    if (inst.isPlayer) {
        if (inst.playerTypeIdx === 1) return st.charColorPlayer2 || "#ff88ff";
        return st.charColorPlayer1 || "#ffffff";
    }
    if (inst.type === TYPE_BOUNCE) return st.charColorBounce || st.charColor || "#ffffff";
    if (inst.type === TYPE_FLOAT)  return st.charColorFloat  || st.charColor || "#ffffff";
    return st.charColorSurface || st.charColor || "#ffffff";
}
function scoreForType(st, type) {
    if (type === TYPE_BOUNCE) return st.charScoreBounce || 20;
    if (type === TYPE_FLOAT)  return st.charScoreFloat  || 15;
    return st.charScoreSurface || 10;
}

// ------------------------------------------------------------------
// Reset / spawn
// ------------------------------------------------------------------
function resetInstance(inst, env) {
    var st = env.state;

    if (inst.isPlayer) {
        var poolLv = (st.poolActive > 0.5) ? (st.poolLevel || 0.1) : 0.1;
        var spawnX = (inst.playerTypeIdx === 1) ? 0.35 : 0.5;
        inst.x = env.aspect * spawnX;
        inst.y = poolLv + 0.05;
        inst.vx = 0; inst.vy = 0;
        inst.attached = false;
        inst.fwdX = 1; inst.fwdY = 0;
        inst.frameIdx = 0; inst.frameTimer = 0;
        inst.wallCooldown = 0;
        inst.lastSdf = null;
        inst.spin = 0; inst.angle = 0;
        inst._spawnSpeed = undefined;
        inst._respawning = false;
        inst.lives = (st.charPlayerLives != null ? st.charPlayerLives : 2);
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
    inst._wasTouchingPlayer = false;

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
    for (var i = 0; i < enemies.length; i++) {
        if (!enemies[i].active) {
            var inst = enemies[i];
            inst.active = true;
            inst.type = (type === undefined) ? TYPE_SURFACE : type;
            inst.isPlayer = false;
            inst._inited = false;
            inst._wasTouchingPlayer = false;
            inst.score = scoreForType(lastEnv ? lastEnv.state : {}, inst.type);
            return inst;
        }
    }
    return null;
}

function requestRemove() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].active) {
            enemies[i].active = false;
            return;
        }
    }
}

function destroyEnemy(enemy) {
    if (!enemy || !enemy.active) return;
    enemy.active = false;
}

function resetAllInstances() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].active = false;
        enemies[i]._wasTouchingPlayer = false;
    }
    players.length = 0;
    addPlayer();
    autoSpawnTimer = 0;
}

function destroyAll() {
    for (var i = 0; i < enemies.length; i++) enemies[i].active = false;
    players.length = 0;
}

function countActiveEnemies() {
    var n = 0;
    for (var i = 0; i < enemies.length; i++) if (enemies[i].active) n++;
    return n;
}

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
        { icon: "🚀", key: "charShipAsset",      def: DEFAULTS.charShipAsset,      special: "text", label: "Ship Asset ID",      savedInPreset: false, details: "GFX asset ID used for player ships. Leave empty to use letters." },
        { icon: "🔵", key: "charFloatAsset",     def: DEFAULTS.charFloatAsset,     special: "text", label: "Float Asset ID",     savedInPreset: false, details: "GFX asset ID used for Float enemies. Leave empty to use letters." },
        { icon: "🟢", key: "charAddSurface",     special: "button", buttonText: "Add Surface", label: "Surface",  savedInPreset: false, details: "Spawn a Surface-type enemy.",
          action: function () { requestSpawn(TYPE_SURFACE); } },
        { icon: "🔴", key: "charAddBounce",      special: "button", buttonText: "Add Bounce",  label: "Bounce",   savedInPreset: false, details: "Spawn a Bounce-type enemy.",
          action: function () { requestSpawn(TYPE_BOUNCE); } },
        { icon: "🔵", key: "charAddFloat",       special: "button", buttonText: "Add Float",   label: "Float",    savedInPreset: false, details: "Spawn a Float-type enemy.",
          action: function () { requestSpawn(TYPE_FLOAT); } },
        { icon: "➖", key: "charRemove",         special: "button", buttonText: "Remove",      label: "Remove",   savedInPreset: false, details: "Remove the last-spawned enemy.",
          action: function () { requestRemove(); } },
        { icon: "🧑", key: "charAddPlayer",      special: "button", buttonText: "Add Player",  label: "Add Player", savedInPreset: false, details: "Add a second player (reversed left/right controls). Max 2.",
          action: function () { addPlayer(); } },

        { icon: "🐣", key: "charAutoSpawn",      def: DEFAULTS.charAutoSpawn,      special: "bool", label: "Auto Spawn",        savedInPreset: false, details: "Automatically spawn random enemies for testing." },
        { icon: "⏱️", key: "charAutoSpawnRate",  def: DEFAULTS.charAutoSpawnRate,  min: 0.1,  max: 10,  step: 0.1,  label: "Spawn Rate",        savedInPreset: false, details: "Auto-spawn rate, enemies per second." },
        { icon: "🐞", key: "charDebug",          def: DEFAULTS.charDebug,          special: "bool", label: "Debug Overlay",     savedInPreset: false, details: "Show counts of players, enemies and projectiles on screen." },

        { icon: "⏱️", key: "charSpeed",          def: DEFAULTS.charSpeed,          min: 0,    max: 30,  step: 0.1,  label: "Char Speed",        savedInPreset: false, details: "Reference character rate at normal run speed." },
        { icon: "🏃", key: "charSpeedLink",      def: DEFAULTS.charSpeedLink,      min: 0,    max: 3,   step: 0.01, label: "Speed Link",        savedInPreset: false, details: "0 = flat. 1 = proportional to actual speed." },
        { icon: "🎯", key: "charChangeOnBounce", def: DEFAULTS.charChangeOnBounce, special: "bool", label: "Change on Bounce", savedInPreset: false, details: "Change character only on bounces and wall reversals." },

        { icon: "📏", key: "charSize",           def: DEFAULTS.charSize,           min: 0.005,max: 0.15,step: 0.001,label: "Char Size",         savedInPreset: false, details: "Font size (screen height units)." },
        { icon: "📐", key: "charSizeVariance",   def: DEFAULTS.charSizeVariance,   min: 0,    max: 2,   step: 0.01, label: "Size Variance",     savedInPreset: false, details: "Per-instance multiplier on Char Size." },
        { icon: "🚀", key: "playerScale",        def: DEFAULTS.playerScale,        min: 0.1,  max: 5,   step: 0.01, label: "Player Scale",      savedInPreset: false, details: "Multiplier on Char Size for player ships only. charSize remains the global base." },
        { icon: "👾", key: "enemyScale",         def: DEFAULTS.enemyScale,         min: 0.1,  max: 5,   step: 0.01, label: "Enemy Scale",       savedInPreset: false, details: "Multiplier on Char Size for all enemies. charSize remains the global base." },
        { icon: "🎨", key: "charColor",          def: DEFAULTS.charColor,          special: "color", label: "Fallback Colour",      savedInPreset: false, details: "Used if a per-type colour is unset." },
        { icon: "🌑", key: "charOutline",        def: DEFAULTS.charOutline,        special: "bool", label: "Outline",          savedInPreset: false, details: "Dark outline for readability." },
        { icon: "📐", key: "charMargin",         def: DEFAULTS.charMargin,         min: 0,    max: 1,   step: 0.01, label: "Margin",            savedInPreset: false, details: "Gap between glyph baseline and surface (Surface type)." },
        { icon: "🚀", key: "charSpawnHeight",    def: DEFAULTS.charSpawnHeight,    min: 0.1,  max: 3,   step: 0.01, label: "Spawn Height",      savedInPreset: false, details: "Spawn offset above the top of the screen." },
        { icon: "↔️", key: "charSpawnX",        def: DEFAULTS.charSpawnX,         min: 0,    max: 1,   step: 0.01, label: "Spawn X",           savedInPreset: false, details: "Horizontal spawn reference (0 = left, 1 = right)." },

        subheading("🧑 Players"),
        { icon: "❤️", key: "charPlayerLives",         def: DEFAULTS.charPlayerLives,         min: 1,   max: 9,   step: 1,    int: true, label: "Starting Lives",       savedInPreset: false, details: "Lives each new player starts with." },
        { icon: "🎨", key: "charColorPlayer1",        def: DEFAULTS.charColorPlayer1,        special: "color", label: "Player 1 Colour",       savedInPreset: false, details: "Glyph colour for Player 1. Also the colour of Player 1's light source and ship tint." },
        { icon: "🎨", key: "charColorPlayer2",        def: DEFAULTS.charColorPlayer2,        special: "color", label: "Player 2 Colour",       savedInPreset: false, details: "Glyph colour for Player 2. Also the colour of Player 2's light source and ship tint." },
        { icon: "💡", key: "charPlayerLightRadius",   def: DEFAULTS.charPlayerLightRadius,   min: 0.05, max: 2.0, step: 0.01, label: "Light Radius",   savedInPreset: false, details: "How far each player's light reaches, in screen-height units." },
        { icon: "🔆", key: "charPlayerLightStrength", def: DEFAULTS.charPlayerLightStrength, min: 0,    max: 5.0, step: 0.05, label: "Light Strength", savedInPreset: false, details: "Intensity of each player's light. 0 disables the light entirely." },
        { icon: "✨", key: "charPlayerLightGlow",     def: DEFAULTS.charPlayerLightGlow,     min: 0,    max: 3.0, step: 0.01, label: "Light Halo",     savedInPreset: false, details: "Visible glow halo at each player position. Purely cosmetic." },
        { icon: "💡", key: "charShipBulbOnAsset",     def: DEFAULTS.charShipBulbOnAsset,     special: "text",  label: "Bulb On Asset",        savedInPreset: false, details: "Overlay asset drawn on the ship while the player has lives left." },
        { icon: "🔌", key: "charShipBulbOffAsset",    def: DEFAULTS.charShipBulbOffAsset,    special: "text",  label: "Bulb Broken Asset",    savedInPreset: false, details: "Overlay asset drawn on the ship when the player is down to their last life." },
        { icon: "⬆️", key: "charShipBulbOffset",      def: DEFAULTS.charShipBulbOffset,      min: -2,   max: 2,   step: 0.01, label: "Bulb Offset (local-up)", savedInPreset: false, details: "How far the overlay sits from the ship anchor along the ship's local-up, as a fraction of ship size." },
        { icon: "📐", key: "charShipBulbScale",       def: DEFAULTS.charShipBulbScale,       min: 0.05, max: 2,   step: 0.01, label: "Bulb Scale",           savedInPreset: false, details: "Overlay glyph size, as a fraction of ship size." },
        { icon: "🌟", key: "charBulbGlowColor", def: DEFAULTS.charBulbGlowColor, special: "color", label: "Bulb Glow Colour", savedInPreset: false, details: "Colour of the visible halo around the bulb. Independent of player light colour." },

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
        { icon: "🏆", key: "charScoreSurface",   def: DEFAULTS.charScoreSurface,   min: 0,    max: 1000,step: 1,   label: "Score",             savedInPreset: false, details: "Points awarded when a Surface enemy is destroyed." },

        subheading("🔴 Bounce"),
        { icon: "🎨", key: "charColorBounce",    def: DEFAULTS.charColorBounce,    special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Bounce type." },
        { icon: "🏀", key: "charBounce",         def: DEFAULTS.charBounce,         min: 0,    max: 1,   step: 0.01, label: "Bounce",            savedInPreset: false, details: "Base restitution." },
        { icon: "🏀", key: "charBounceVariance", def: DEFAULTS.charBounceVariance, min: 0,    max: 2,   step: 0.01, label: "Bounce Variance",   savedInPreset: false, details: "Per-instance multiplier on Bounce." },
        { icon: "🎚️", key: "charBounceMin",     def: DEFAULTS.charBounceMin,      min: 0,    max: 1,   step: 0.01, label: "Bounce Min",        savedInPreset: false, details: "Restitution floor for Bounce type. Set to 1.0 for perpetual bouncing." },
        { icon: "🎚️", key: "charBounceMinVariance", def: DEFAULTS.charBounceMinVariance, min: 0, max: 2, step: 0.01, label: "Bounce Min Variance", savedInPreset: false, details: "Per-instance multiplier on Bounce Min." },
        { icon: "⚡", key: "charMinBounceSpeed", def: DEFAULTS.charMinBounceSpeed, min: 0, max: 2, step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor. Height ≈ V²/(2g)." },
        { icon: "⚡", key: "charMinBounceSpeedVariance", def: DEFAULTS.charMinBounceSpeedVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charBounceSpin",     def: DEFAULTS.charBounceSpin,     min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charBounceSpinDrag", def: DEFAULTS.charBounceSpinDrag, min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },
        { icon: "🏆", key: "charScoreBounce",    def: DEFAULTS.charScoreBounce,    min: 0,    max: 1000,step: 1,   label: "Score",             savedInPreset: false, details: "Points awarded when a Bounce enemy is destroyed." },

        subheading("🔵 Float"),
        { icon: "🎨", key: "charColorFloat",     def: DEFAULTS.charColorFloat,     special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Float type." },
        { icon: "🏀", key: "charFloatBounce",    def: DEFAULTS.charFloatBounce,    min: 0,    max: 3,   step: 0.01, label: "Energy",            savedInPreset: false, details: "Restitution multiplier on the floater's own normal velocity at impact. Above 1.0 GAINS energy." },
        { icon: "🏀", key: "charFloatBounceVariance", def: DEFAULTS.charFloatBounceVariance, min: 0, max: 2, step: 0.01, label: "Energy Variance", savedInPreset: false, details: "Per-instance multiplier on Energy." },
        { icon: "⚡", key: "charFloatMinBounce", def: DEFAULTS.charFloatMinBounce, min: 0,    max: 2,   step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor on mesh impacts." },
        { icon: "⚡", key: "charFloatMinBounceVariance", def: DEFAULTS.charFloatMinBounceVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charFloatSpin",      def: DEFAULTS.charFloatSpin,      min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charFloatSpinDrag",  def: DEFAULTS.charFloatSpinDrag,  min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },
        { icon: "🏆", key: "charScoreFloat",     def: DEFAULTS.charScoreFloat,     min: 0,    max: 1000,step: 1,   label: "Score",             savedInPreset: false, details: "Points awarded when a Float enemy is destroyed." },
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

function getInstanceAsset(inst, st) {
    if (!window.GFXAssets) return null;
    var id;
    if (inst.isPlayer)                  id = st.charShipAsset;
    else if (inst.type === TYPE_FLOAT)  id = st.charFloatAsset;
    else if (inst.type === TYPE_BOUNCE) id = st.charBounceAsset;
    else                                id = st.charSurfaceAsset;
    if (!id) return null;
    var a = window.GFXAssets.get(id);
    return (a && a.count > 0) ? a : null;
}

function advanceFrame(inst, st) {
    var asset = getInstanceAsset(inst, st);
    var n = asset ? asset.count : charList(st).length;
    if (n <= 1) return;
    var reverse = (inst.isPlayer && inst.fwdX < 0);
    if (reverse) inst.frameIdx = ((inst.frameIdx - 1) % n + n) % n;
    else         inst.frameIdx = (inst.frameIdx + 1) % n;
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
                var forceAttach = inst.isPlayer && inst._respawning;
                if (normalSpeed < grip * 0.35 || forceAttach) {
                    inst.attached = true;
                    inst._respawning = false;
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

    if (inst.isPlayer) {
        var tRightX = -ny, tRightY = nx;
        if (tRightX < 0) { tRightX = -tRightX; tRightY = -tRightY; }
        if (ny <= 0)     { tRightX = -tRightX; tRightY = -tRightY; }

        var dirLeft  = inputState.left;
        var dirRight = inputState.right;
        if (inst.controlsReversed) {
            var tmpL = dirLeft;
            dirLeft  = dirRight;
            dirRight = tmpL;
        }
        var desiredDir = 0;
        if (dirRight) desiredDir += 1;
        if (dirLeft)  desiredDir -= 1;
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

    if (inst.isPlayer) {
        if (!inputState.left && !inputState.right) speed = 0;
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

// ------------------------------------------------------------------
// PLAYER DEATH / ENEMY WIPE
// ------------------------------------------------------------------
function killAllEnemies(env) {
    if (!window.LavaProjectile || !window.LavaProjectile.spawnProjectile) {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].active = false;
            enemies[i]._wasTouchingPlayer = false;
        }
        return;
    }
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active) continue;
        for (var j = 0; j < 8; j++) {
            window.LavaProjectile.spawnProjectile('allGone', e.x, e.y, {});
        }
        e.active = false;
        e._wasTouchingPlayer = false;
    }
}

function respawnPlayerAtTop(p, env) {
    p.attached = false;
    p.vx = 0;
    p.vy = 0;
    var spawnX = (p.playerTypeIdx === 1) ? 0.35 : 0.5;
    p.x = env.aspect * spawnX;
    p.y = 1.05;
    p.fwdX = 1;
    p.fwdY = 0;
    p.wallCooldown = 0;
    p.frameTimer = 0;
    p.lastSdf = null;
    p._respawning = true;
    p._invulnTimer = PLAYER_RESPAWN_INVULN;
}

function spawnScoreText(enemy, score) {
    if (!window.LavaProjectile || !window.LavaProjectile.spawnProjectile) return;
    var colHex = effColor(lastEnv ? lastEnv.state : DEFAULTS, enemy);
    window.LavaProjectile.spawnProjectile('text', enemy.x, enemy.y, {
        text: '+' + Math.round(score),
        color: colHex,
        score: score,
    });
}

function onPlayerDeath(p, env) {
    // Decrement lives; renderer picks lit/broken bulb based on remaining lives.
    if (p.lives > 0) p.lives--;

    // 1. Wipe enemies first → frees the pool
    killAllEnemies(env);
    // 2. Then the death burst lands in clean slots
    if (window.LavaProjectile && window.LavaProjectile.spawnProjectile) {
        for (var i = 0; i < PLAYER_DEATH_BURST_COUNT; i++) {
            window.LavaProjectile.spawnProjectile('playerDead', p.x, p.y, {});
        }
    }
    // 3. Respawn
    respawnPlayerAtTop(p, env);
}

// ------------------------------------------------------------------
// PLAYER <-> ENEMY collision
// ------------------------------------------------------------------
function checkPlayerEnemyCollisions(env) {
    var st = env.state;
    var pRadiusMul = 0.30;
    var eRadiusMul = 0.30;

    for (var pi = 0; pi < players.length; pi++) {
        var p = players[pi];
        if (p._invulnTimer > 0) continue;
        if (p._deathCooldown > 0) continue;

        var pR = effSize(st, p) * pRadiusMul;

        for (var ei = 0; ei < enemies.length; ei++) {
            var e = enemies[ei];
            if (!e.active) continue;
            var eR = effSize(st, e) * eRadiusMul;
            var r = pR + eR;
            var dx = p.x - e.x;
            var dy = p.y - e.y;
            if (dx * dx + dy * dy < r * r) {
                if (!e._wasTouchingPlayer) {
                    e._wasTouchingPlayer = true;
                    console.log("dead");
                    p._deathCooldown = PLAYER_DEATH_COOLDOWN;
                    onPlayerDeath(p, env);
                    break;
                }
            } else {
                e._wasTouchingPlayer = false;
            }
        }
    }
}

// ==================================================================
// DRAW
// ==================================================================
function draw(inst, ctx, env) {
    // Players are rendered by main.js's WebGL ship pass.
    if (inst.isPlayer) return;

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

    var alpha = 1;

    var asset = getInstanceAsset(inst, st);
    var img = null;
    if (asset) {
        var pct = (asset.count > 1)
            ? (inst.frameIdx % asset.count) / asset.count
            : 0;
        img = window.GFXAssets.getFrame(asset, pct);
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px, py);
    ctx.rotate(angle);

    if (img) {
        var iw = img.naturalWidth  || img.width  || 64;
        var ih = img.naturalHeight || img.height || 64;
        var scale = fontSize / ih;
        var dw = iw * scale;
        var dh = fontSize;
        ctx.drawImage(img, -dw * 0.5, -dh, dw, dh);
    } else {
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
    }

    ctx.restore();
}

function drawAimPoint(ctx, env, aim) {
    var st = env.state;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var asp = W / H;
    var size = st.charSize * 0.8;
    var px = (aim.x / asp) * W;
    var py = (1 - aim.y) * H;
    var fontSize = Math.max(4, size * H);

    ctx.save();
    ctx.translate(px, py);
    ctx.font = "bold " + fontSize.toFixed(1) + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (st.charOutline) {
        ctx.lineWidth = Math.max(1, fontSize * 0.18);
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.strokeText("+", 0, 0);
    }
    ctx.fillStyle = "#ff00ff";
    ctx.fillText("+", 0, 0);
    ctx.restore();
}

function drawScores(ctx, env) {
    if (players.length === 0) return;
    var canvas = ctx.canvas;
    var W = canvas.width, H = canvas.height;
    var fontSize = Math.max(12, H * 0.022);
    var parts = [];
    for (var i = 0; i < players.length; i++) {
        parts.push('P' + (i + 1) + ': ' + players[i].score);
    }
    var text = parts.join('   ');

    ctx.save();
    ctx.font = 'bold ' + fontSize.toFixed(1) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = Math.max(2, fontSize * 0.22);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, W / 2, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, W / 2, 8);
    ctx.restore();
}

function drawDebug(ctx, env) {
    if (!env.state.charDebug) return;

    var cSurf = 0, cBounce = 0, cFloat = 0;
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active) continue;
        if (e.type === TYPE_BOUNCE) cBounce++;
        else if (e.type === TYPE_FLOAT) cFloat++;
        else cSurf++;
    }

    var projLine = 'Projectiles:';
    if (window.LavaProjectile) {
        var defs = window.LavaProjectile.definitions;
        var counts = window.LavaProjectile.countsByType();
        var first = true;
        for (var id in counts) {
            var name = (defs[id] && defs[id].name) ? defs[id].name : id;
            projLine += (first ? ' ' : ' | ') + name + ' ' + counts[id];
            first = false;
        }
    } else {
        projLine += ' (unavailable)';
    }

    var lines = [
        'Players: ' + players.length,
        'Enemies: Surface ' + cSurf + ' | Bounce ' + cBounce + ' | Float ' + cFloat,
        projLine,
    ];

    var canvas = ctx.canvas;
    var H = canvas.height;
    var fontSize = Math.max(11, H * 0.018);
    var lineHeight = fontSize * 1.35;

    ctx.save();
    ctx.font = 'bold ' + fontSize.toFixed(1) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    var maxW = 0;
    for (var i = 0; i < lines.length; i++) {
        var w = ctx.measureText(lines[i]).width;
        if (w > maxW) maxW = w;
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(4, 4, maxW + 16, lines.length * lineHeight + 10);

    ctx.fillStyle = '#00ff88';
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 12, 9 + i * lineHeight);
    }
    ctx.restore();
}

// ==================================================================
// SHIP RENDER DESCRIPTION (for main.js WebGL ship pass)
// ==================================================================
function getShipRenderList() {
    if (!lastEnv) return [];
    var st = lastEnv.state;
    var out = [];
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var size = effSize(st, p);
        var s = sdfAt(p.x, p.y, lastEnv);
        var upX = s.nx, upY = s.ny;
        if (upX === 0 && upY === 0) { upX = 0; upY = 1; }

        var bodyAsset = (window.GFXAssets && st.charShipAsset)
            ? window.GFXAssets.get(st.charShipAsset) : null;
        var bulbId    = (p.lives > 1) ? st.charShipBulbOnAsset : st.charShipBulbOffAsset;
        var bulbAsset = (window.GFXAssets && bulbId)
            ? window.GFXAssets.get(bulbId) : null;

        var tintHex = (p.playerTypeIdx === 1)
            ? (st.charColorPlayer2 || '#ff88ff')
            : (st.charColorPlayer1 || '#ffffff');

        var bodyPct = 0;
        if (bodyAsset && bodyAsset.count > 1) {
            bodyPct = (p.frameIdx % bodyAsset.count) / bodyAsset.count;
        }

        out.push({
            player:        p,
            x:             p.x,
            y:             p.y,
            upX:           upX,
            upY:           upY,
            rightX:        -upY,
            rightY:        upX,
            size:          size,
            tintHex:       tintHex,
            invuln:        p._invulnTimer > 0,
            bodyAsset:     bodyAsset,
            bodyFramePct:  bodyPct,
            bulbAsset:     bulbAsset,
            bulbOffsetPx:  (st.charShipBulbOffset || 0) * size,
            bulbSizePx:    (st.charShipBulbScale  || 0.45) * size,
        });
    }
    return out;
}

// ==================================================================
// BATCH
// ==================================================================
function updateAll(dt, env) {
    lastEnv = env;
    if (players.length === 0) addPlayer();

    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (p._invulnTimer > 0) p._invulnTimer -= dt;
        if (p._deathCooldown > 0) p._deathCooldown -= dt;
    }

    if (env.state.charAutoSpawn) {
        autoSpawnTimer += dt;
        var interval = 1 / Math.max(0.1, env.state.charAutoSpawnRate || 1);
        var guard = 0;
        while (autoSpawnTimer >= interval && guard++ < 10) {
            autoSpawnTimer -= interval;
            var rtype = Math.floor(Math.random() * 3);
            requestSpawn(rtype);
        }
    } else {
        autoSpawnTimer = 0;
    }

    for (var i = 0; i < enemies.length; i++) {
        var inst = enemies[i];
        if (!inst.active) continue;
        if (!inst._inited) {
            rollTraits(inst, env.state);
            resetInstance(inst, env);
            inst._inited = true;
        }
    }
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (!p._inited) {
            rollTraits(p, env.state);
            resetInstance(p, env);
            p._inited = true;
            var pr = projectToSurface(p.x, p.y, env, 12);
            var s2 = sdfAt(pr.x, pr.y, env);
            if (Math.abs(s2.sdf) < 0.15) {
                p.x = pr.x; p.y = pr.y;
                p.attached = true;
                var tx = -s2.ny, ty = s2.nx;
                if (tx < 0) { tx = -tx; ty = -ty; }
                p.fwdX = tx; p.fwdY = ty;
            }
        }
    }

    for (var i = 0; i < enemies.length; i++) if (enemies[i].active) update(enemies[i], dt, env);
    for (var i = 0; i < players.length; i++) update(players[i], dt, env);

    checkPlayerEnemyCollisions(env);

    if (window.LavaProjectile && window.LavaProjectile.updateAll) {
        window.LavaProjectile.updateAll(dt, env);
    }
}

function drawAll(ctx, env) {
    canvasEl = ctx.canvas;
    for (var i = 0; i < enemies.length; i++) if (enemies[i].active) draw(enemies[i], ctx, env);
    for (var i = 0; i < players.length; i++) draw(players[i], ctx, env);
    drawAimPoint(ctx, env, inputState.aim);
    if (window.LavaProjectile && window.LavaProjectile.drawAll) {
        window.LavaProjectile.drawAll(ctx, env);
    }
    drawScores(ctx, env);
    drawDebug(ctx, env);
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
    count:             function () { return countActiveEnemies() + players.length; },
    destroy:           function () {},

    getEnemyPool: function () { return enemies; },
    destroyEnemy: destroyEnemy,

    getPlayers: function () { return players; },
    getPlayer: function (idx) { return players[idx || 0] || null; },
    getPrimaryPlayer: getPrimaryPlayer,
    addPlayer: addPlayer,
    playerTypeCount: PLAYER_TYPES.length,

    getAimPoint: function () { return inputState.aim; },
    isFiring: function () { return inputState.firing; },

    getEnv: function () { return lastEnv; },
    getAspect: function () { return lastEnv ? lastEnv.aspect : 1; },
    sdfAt: function (x, y) {
        return lastEnv ? sdfAt(x, y, lastEnv) : { sdf: -1, nx: 0, ny: 1 };
    },
    projectToSurface: function (x, y, maxIter) {
        return lastEnv ? projectToSurface(x, y, lastEnv, maxIter) : { x: x, y: y };
    },

    // Effective world size for an instance (fraction of screen height).
    // Mainly used by projectile.js to make muzzle offsets scale with the ship.
    playerSize: function (inst) {
        if (!inst) return 0;
        return effSize(lastEnv ? lastEnv.state : DEFAULTS, inst);
    },

    // Per-player render description consumed by main.js's WebGL ship pass.
    getShipRenderList: getShipRenderList,
    spawnScoreText: spawnScoreText,
};

})();