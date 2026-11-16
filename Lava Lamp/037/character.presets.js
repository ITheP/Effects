// =====================================================================
// character.presets.js
// Character default values. Loaded by loader.js before character.js.
// Exposes window.__lavaCharacter = { DEFAULTS, ... }.
//
// Does not include the controls array — that lives in
// character.controls.js.
// =====================================================================
(function () {
'use strict';

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
    charBulbGlowColor:   "#ffcc44",

    charDebug:           false,
};

window.__lavaCharacter = window.__lavaCharacter || {};
window.__lavaCharacter.DEFAULTS = DEFAULTS;

})();