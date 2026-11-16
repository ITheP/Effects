// =====================================================================
// projectile.controls.js
// Registers the projectile-related controls into the Character control
// group (window.LavaCharacter.controlsGroup). Must run AFTER
// character.js (which creates that object) and AFTER
// projectile.presets.js (which populates the def table it reads from).
// =====================================================================
(function () {
'use strict';

function registerControls() {
    if (!window.LavaCharacter || !window.LavaCharacter.controlsGroup) {
        console.warn('[projectile.controls] LavaCharacter.controlsGroup not ready — controls skipped');
        return;
    }
    if (!window.__lavaProjectileDefs) {
        console.warn('[projectile.controls] __lavaProjectileDefs not ready — controls skipped');
        return;
    }

    var PROJECTILE_DEFS = window.__lavaProjectileDefs.PROJECTILE_DEFS;
    var selectableProjectiles = window.__lavaProjectileDefs.selectableProjectiles;
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

registerControls();

})();