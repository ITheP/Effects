// =====================================================================
// character.controls.js
// Character control definitions. Loaded by loader.js after
// character.presets.js (which sets the DEFAULTS it references) and
// before character.js (which exports window.LavaCharacter).
//
// Exposes window.__lavaCharacter.controlsGroup — the group object
// appended to the CONTROLS array in core.js.
// =====================================================================
(function () {
'use strict';

var DEFAULTS = (window.__lavaCharacter && window.__lavaCharacter.DEFAULTS) || {};
if (!DEFAULTS || !DEFAULTS.charText) {
    console.error('[character.controls] character.presets.js not loaded — cannot build controls');
    return;
}

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
          action: function () { window.LavaCharacter && window.LavaCharacter.requestSpawn && window.LavaCharacter.requestSpawn(0); } },
        { icon: "🔴", key: "charAddBounce",      special: "button", buttonText: "Add Bounce",  label: "Bounce",   savedInPreset: false, details: "Spawn a Bounce-type enemy.",
          action: function () { window.LavaCharacter && window.LavaCharacter.requestSpawn && window.LavaCharacter.requestSpawn(1); } },
        { icon: "🔵", key: "charAddFloat",       special: "button", buttonText: "Add Float",   label: "Float",    savedInPreset: false, details: "Spawn a Float-type enemy.",
          action: function () { window.LavaCharacter && window.LavaCharacter.requestSpawn && window.LavaCharacter.requestSpawn(2); } },
        { icon: "➖", key: "charRemove",         special: "button", buttonText: "Remove",      label: "Remove",   savedInPreset: false, details: "Remove the last-spawned enemy.",
          action: function () { window.LavaCharacter && window.LavaCharacter.requestRemove && window.LavaCharacter.requestRemove(); } },
        { icon: "🧑", key: "charAddPlayer",      special: "button", buttonText: "Add Player",  label: "Add Player", savedInPreset: false, details: "Add a second player (reversed left/right controls). Max 2.",
          action: function () { window.LavaCharacter && window.LavaCharacter.addPlayer && window.LavaCharacter.addPlayer(); } },

        { icon: "🐣", key: "charAutoSpawn",      def: DEFAULTS.charAutoSpawn,      special: "bool", label: "Auto Spawn",        savedInPreset: false, details: "Automatically spawn random enemies for testing." },
        { icon: "⏱️", key: "charAutoSpawnRate",  def: DEFAULTS.charAutoSpawnRate,  min: 0.1,  max: 10,  step: 0.1,  label: "Spawn Rate",        savedInPreset: false, details: "Auto-spawn rate, enemies per second." },
        { icon: "🐞", key: "charDebug",          def: DEFAULTS.charDebug,          special: "bool", label: "Debug Overlay",     savedInPreset: false, details: "Show counts of players, enemies and projectiles on screen." },

        { icon: "⏱️", key: "charSpeed",          def: DEFAULTS.charSpeed,          min: 0,    max: 30,  step: 0.1,  label: "Char Speed",        savedInPreset: false, details: "Reference character rate at normal run speed." },
        { icon: "🏃", key: "charSpeedLink",      def: DEFAULTS.charSpeedLink,      min: 0,    max: 3,   step: 0.01, label: "Speed Link",        savedInPreset: false, details: "0 = flat. 1 = proportional to actual speed." },
        { icon: "🎯", key: "charChangeOnBounce", def: DEFAULTS.charChangeOnBounce, special: "bool", label: "Change on Bounce", savedInPreset: false, details: "Change character only on bounces and wall reversals." },

        { icon: "📏", key: "charSize",           def: DEFAULTS.charSize,           min: 0.005,max: 0.15,step: 0.001,label: "Char Size",         savedInPreset: false, details: "Font size (screen height units)." },
        { icon: "📐", key: "charSizeVariance",   def: DEFAULTS.charSizeVariance,   min: 0,    max: 2,   step: 0.01, label: "Size Variance",     savedInPreset: false, details: "Per-instance multiplier on Char Size." },
        { icon: "🚀", key: "playerScale",        def: DEFAULTS.playerScale,        min: 0.1,  max: 5,   step: 0.01, label: "Player Scale",      savedInPreset: false, details: "Multiplier on Char Size for player ships only." },
        { icon: "👾", key: "enemyScale",         def: DEFAULTS.enemyScale,         min: 0.1,  max: 5,   step: 0.01, label: "Enemy Scale",       savedInPreset: false, details: "Multiplier on Char Size for all enemies." },
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
        { icon: "🔆", key: "charPlayerLightStrength", def: DEFAULTS.charPlayerLightStrength, min: 0,    max: 5.0, step: 0.05, label: "Light Strength", savedInPreset: false, details: "Intensity of each player's light." },
        { icon: "✨", key: "charPlayerLightGlow",     def: DEFAULTS.charPlayerLightGlow,     min: 0,    max: 3.0, step: 0.01, label: "Light Halo",     savedInPreset: false, details: "Visible glow halo at each player position." },
        { icon: "💡", key: "charShipBulbOnAsset",     def: DEFAULTS.charShipBulbOnAsset,     special: "text",  label: "Bulb On Asset",        savedInPreset: false, details: "Overlay asset drawn on the ship while the player has lives left." },
        { icon: "🔌", key: "charShipBulbOffAsset",    def: DEFAULTS.charShipBulbOffAsset,    special: "text",  label: "Bulb Broken Asset",    savedInPreset: false, details: "Overlay asset drawn on the ship when the player is down to their last life." },
        { icon: "⬆️", key: "charShipBulbOffset",      def: DEFAULTS.charShipBulbOffset,      min: -2,   max: 2,   step: 0.01, label: "Bulb Offset (local-up)", savedInPreset: false, details: "How far the overlay sits from the ship anchor along the ship's local-up." },
        { icon: "📐", key: "charShipBulbScale",       def: DEFAULTS.charShipBulbScale,       min: 0.05, max: 2,   step: 0.01, label: "Bulb Scale",           savedInPreset: false, details: "Overlay glyph size, as a fraction of ship size." },
        { icon: "🌟", key: "charBulbGlowColor",       def: DEFAULTS.charBulbGlowColor,       special: "color", label: "Bulb Glow Colour", savedInPreset: false, details: "Colour of the visible halo around the bulb." },

        subheading("🟢 Surface"),
        { icon: "🎨", key: "charColorSurface",   def: DEFAULTS.charColorSurface,   special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Surface type." },
        { icon: "🌍", key: "charGravity",        def: DEFAULTS.charGravity,        min: 0,    max: 20,  step: 0.01, label: "Gravity",           savedInPreset: false, details: "Fall acceleration." },
        { icon: "🌍", key: "charGravityVariance",def: DEFAULTS.charGravityVariance,min: 0,    max: 2,   step: 0.01, label: "Gravity Variance",  savedInPreset: false, details: "Per-instance multiplier on Gravity." },
        { icon: "🖐️", key: "charGrip",          def: DEFAULTS.charGrip,           min: 0,    max: 1,   step: 0.01, label: "Grip",              savedInPreset: false, details: "Attach threshold on landing." },
        { icon: "🖐️", key: "charGripVariance",  def: DEFAULTS.charGripVariance,   min: 0,    max: 2,   step: 0.01, label: "Grip Variance",     savedInPreset: false, details: "Per-instance multiplier on Grip." },
        { icon: "🏃", key: "charRunSpeed",       def: DEFAULTS.charRunSpeed,       min: 0.01, max: 2,   step: 0.01, label: "Run Speed",         savedInPreset: false, details: "Base run speed." },
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
        { icon: "🎚️", key: "charBounceMin",     def: DEFAULTS.charBounceMin,      min: 0,    max: 1,   step: 0.01, label: "Bounce Min",        savedInPreset: false, details: "Restitution floor for Bounce type." },
        { icon: "🎚️", key: "charBounceMinVariance", def: DEFAULTS.charBounceMinVariance, min: 0, max: 2, step: 0.01, label: "Bounce Min Variance", savedInPreset: false, details: "Per-instance multiplier on Bounce Min." },
        { icon: "⚡", key: "charMinBounceSpeed", def: DEFAULTS.charMinBounceSpeed, min: 0, max: 2, step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor." },
        { icon: "⚡", key: "charMinBounceSpeedVariance", def: DEFAULTS.charMinBounceSpeedVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charBounceSpin",     def: DEFAULTS.charBounceSpin,     min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charBounceSpinDrag", def: DEFAULTS.charBounceSpinDrag, min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },
        { icon: "🏆", key: "charScoreBounce",    def: DEFAULTS.charScoreBounce,    min: 0,    max: 1000,step: 1,   label: "Score",             savedInPreset: false, details: "Points awarded when a Bounce enemy is destroyed." },

        subheading("🔵 Float"),
        { icon: "🎨", key: "charColorFloat",     def: DEFAULTS.charColorFloat,     special: "color", label: "Colour",            savedInPreset: false, details: "Glyph colour for Float type." },
        { icon: "🏀", key: "charFloatBounce",    def: DEFAULTS.charFloatBounce,    min: 0,    max: 3,   step: 0.01, label: "Energy",            savedInPreset: false, details: "Restitution multiplier on the floater's own normal velocity." },
        { icon: "🏀", key: "charFloatBounceVariance", def: DEFAULTS.charFloatBounceVariance, min: 0, max: 2, step: 0.01, label: "Energy Variance", savedInPreset: false, details: "Per-instance multiplier on Energy." },
        { icon: "⚡", key: "charFloatMinBounce", def: DEFAULTS.charFloatMinBounce, min: 0,    max: 2,   step: 0.005, label: "Min Bounce Speed", savedInPreset: false, details: "Absolute outgoing normal-speed floor on mesh impacts." },
        { icon: "⚡", key: "charFloatMinBounceVariance", def: DEFAULTS.charFloatMinBounceVariance, min: 0, max: 2, step: 0.01, label: "Min Bounce Speed Variance", savedInPreset: false, details: "Per-instance multiplier on Min Bounce Speed." },
        { icon: "🌀", key: "charFloatSpin",      def: DEFAULTS.charFloatSpin,      min: 0,    max: 200, step: 0.1,  label: "Spin Gain",         savedInPreset: false, details: "Spin picked up from tangential velocity on impact." },
        { icon: "⏱️", key: "charFloatSpinDrag",  def: DEFAULTS.charFloatSpinDrag,  min: 0,    max: 20,  step: 0.01, label: "Spin Drag",         savedInPreset: false, details: "Rotational damping." },
        { icon: "🏆", key: "charScoreFloat",     def: DEFAULTS.charScoreFloat,     min: 0,    max: 1000,step: 1,   label: "Score",             savedInPreset: false, details: "Points awarded when a Float enemy is destroyed." },
    ]
};

window.__lavaCharacter = window.__lavaCharacter || {};
window.__lavaCharacter.controlsGroup = CONTROLS_GROUP;

})();