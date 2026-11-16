// main.controls.js
// Declarative UI control definitions.
// Loaded by loader.js before main.js. Exposes window.__lavaControls.
//
// Every "def:" is a literal numeric/string value (formerly CFG.xxx or
// DEFAULTS.xxx). This file has no runtime dependencies on main.js or
// character.js — the LavaCharacter.controlsGroup is appended by main.js
// at runtime (see main.js).
(function () {
'use strict';

var CONTROLS = [
    {
        heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
            { icon: "🎞️", key: "targetFPS", def: 60, min: 15, max: 120, step: 1, int: true, label: "Target FPS", savedInPreset: false, details: "Framerate cap." },
            { icon: "🕐", key: "presetTransitionTime", def: 3.0, min: 0, max: 15, step: 0.1, label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over." },
            { icon: "⏸️", key: "freezeTime", def: 0, special: "bool", savedInPreset: false, label: "Freeze Time", details: "Freeze the shader clock and physics." },
            { icon: "🔀", key: "autoMorph", def: 0, special: "bool", savedInPreset: false, label: "Auto Morph", details: "Cycle random presets." },
            { icon: "🔄", key: "morphCycleTime", def: 10.0, min: 2, max: 120, step: 0.5, savedInPreset: false, label: "Morph Cycle Time", details: "Seconds between random picks." },
            { icon: "🐢", key: "timeScale", def: 0.23, min: 0.05, max: 2, step: 0.01, label: "Time Scale", details: "Global speed multiplier." },
            { icon: "🐞", key: "debugMode", def: 0, special: "bool", savedInPreset: false, label: "Debug View", details: "Show raw blob state." },
        ]
    },
    {
        heading: "🫧 Wax Blobs", openByDefault: true, controls: [
            { icon: "🔢", key: "blobCount", def: 16, min: 1, max: 64, step: 1, int: true, label: "Target Population", details: "Target number of live wax blobs." },
            { icon: "📏", key: "blobSize", def: 0.049, min: 0.01, max: 0.32, step: 0.001, label: "Blob Size", details: "Base radius in screen-height units." },
            { icon: "🎲", key: "blobSizeVar", def: 0.6, min: 0, max: 2, step: 0.1, label: "Size Variance", details: "Random spread of blob radius." },
            { icon: "🧬", key: "traitVariance", def: 0.35, min: 0, max: 2, step: 0.01, label: "Trait Variance", details: "Individual blobs differ in heat gain, cooling, max speed, wander and squish." },
            { icon: "🎈", key: "buoyancy", def: 1.93, min: 0.01, max: 5, step: 0.01, label: "Buoyancy", details: "Upward force from temperature." },
            { icon: "💨", key: "drag", def: 1.10, min: 0.01, max: 5, step: 0.01, label: "Drag", details: "Velocity damping." },
            { icon: "🔥", key: "heatGain", def: 1.36, min: 0.1, max: 5, step: 0.01, label: "Heat Gain", details: "Heat absorbed near the bulb." },
            { icon: "❄️", key: "cooling", def: 0.32, min: 0.02, max: 3, step: 0.01, label: "Cooling Rate", details: "Heat lost per second." },
            { icon: "📏", key: "heatDepth", def: 0.16, min: 0.02, max: 0.8, step: 0.005, label: "Heat Depth", details: "How far the bulb's heat reaches." },
            { icon: "🌡️", key: "tempNeutral", def: 0.50, min: 0, max: 2, step: 0.01, label: "Neutral Temp", details: "Temperature at which blobs neither rise nor sink." },
            { icon: "🚀", key: "maxSpeed", def: 0.32, min: 0.05, max: 3, step: 0.01, label: "Max Speed", details: "Velocity clamp." },
            { icon: "🌊", key: "wander", def: 0.35, min: 0, max: 2, step: 0.01, label: "Horizontal Wander", details: "Sideways drift. Movement only, no shape change." },
            { icon: "🫧", key: "squish", def: 0.60, min: 0, max: 2, step: 0.01, label: "Stretch from Speed", details: "Elongation along motion." },
            { icon: "💨", key: "turbulence", def: 0.32, min: 0, max: 3, step: 0.01, label: "Turbulence", details: "Swirling fluid forces that wobble the blobs like jelly." },
            { icon: "🌀", key: "turbulenceFreq", def: 2.86, min: 0.1, max: 10, step: 0.01, label: "Turbulence Freq", details: "How fast the turbulent flow varies over time." },
            { icon: "🔬", key: "turbulenceScale", def: 0.2, min: 0.1, max: 10, step: 0.01, label: "Turbulence Scale", details: "Spatial frequency of the eddies." },
            { icon: "🧱", key: "wallSquish", def: 0.60, min: 0, max: 5, step: 0.01, label: "Wall Squish", details: "How much blobs flatten against walls and ceiling." },
            { icon: "🏓", key: "wallRestitution", def: 0.30, min: 0, max: 1, step: 0.01, label: "Wall Bounce", details: "How much velocity is kept when bouncing off a wall." },
            { icon: "⬇️", key: "deathDepth", def: 0.35, min: 0.05, max: 1.50, step: 0.01, label: "Death Depth", details: "How far below screen blobs sink before dissolving." },
            { icon: "🎯", key: "fieldThreshold", def: 0.7, min: 0.1, max: 5, step: 0.01, label: "Metaball Threshold", details: "Isosurface level." },
            { icon: "⏱️", key: "spawnRate", def: 3.5, min: 0.5, max: 30, step: 0.1, label: "Spawn Rate", details: "Blobs per second." },
            { icon: "📦", key: "spawnBatch", def: 6, min: 1, max: 6, step: 1, int: true, label: "Spawn Batch", details: "Max blobs to spawn per tick: random(1..N)." },
        ]
    },
    {
        heading: "🧲 Cohesion & Tension", openByDefault: true, controls: [
            { icon: "🧲", key: "cohesion", def: 0.97, min: 0, max: 4, step: 0.01, label: "Cohesion", details: "Attraction between touching blobs." },
            { icon: "↔️", key: "cohesionRange", def: 1.36, min: 1.0, max: 4.0, step: 0.01, label: "Cohesion Range", details: "Distance (× combined radii)." },
            { icon: "💪", key: "repelStrength", def: 1.1, min: 0, max: 10, step: 0.05, label: "Repel Strength", details: "Soft push when centres get too close." },
            { icon: "📐", key: "repelRange", def: 0.87, min: 0.1, max: 2.0, step: 0.01, label: "Repel Range", details: "Distance (× combined radii) at which repel kicks in." },
        ]
    },
    {
        heading: "🫗 Wax Pool", openByDefault: true, controls: [
            { icon: "👁️", key: "poolActive", def: 1, special: "bool", label: "Show Pool", details: "Wax reservoir at the bottom." },
            { icon: "📏", key: "poolLevel", def: 0.088, min: 0.0, max: 0.4, step: 0.002, label: "Pool Level", details: "Height of the pool surface." },
            { icon: "☁️", key: "poolSoftness", def: 0.012, min: 0, max: 0.25, step: 0.001, label: "Pool Softness", details: "How quickly the pool field fades upward." },
            { icon: "🌊", key: "poolWave", def: 0.06, min: 0, max: 0.25, step: 0.0005, label: "Pool Wave", details: "Amplitude of the pool surface wave." },
            { icon: "⏱️", key: "poolWaveSpeed", def: 3.0, min: -10, max: 10, step: 0.01, label: "Pool Wave Speed", details: "How fast the surface wave travels." },
        ]
    },
    {
        heading: "🎨 Wax Colour", openByDefault: true, controls: [
            { icon: "🅰️", key: "waxColorA", def: '#ff3b1f', special: "color", label: "Wax Colour A", details: "Lower wax colour." },
            { icon: "🅱️", key: "waxColorB", def: '#ffd24a', special: "color", label: "Wax Colour B", details: "Upper wax colour." },
            { icon: "💡", key: "waxGlow", def: 1.48, min: 0, max: 3, step: 0.01, label: "Bulb Reach", details: "How strongly the bulb illuminates the wax surface." },
            { icon: "🎨", key: "waxGlowColor", def: '#ff6a00', special: "color", label: "Bulb Tint", details: "Colour of the light reaching the wax surface." },
            { icon: "🌈", key: "sssColor", def: '#ff6633', special: "color", label: "SSS Colour", details: "The wax's internal scattered light colour." },
            { icon: "🔆", key: "sssStrength", def: 2.0, min: -1, max: 5, step: 0.01, label: "SSS Strength", details: "Intensity of subsurface light transmitted through the wax." },
            { icon: "🌫️", key: "sssFalloff", def: 1.44, min: -1, max: 10, step: 0.01, label: "SSS Falloff", details: "How quickly light dies through the wax." },
        ]
    },
    {
        heading: "💡 Lighting", openByDefault: true, controls: [
            { icon: "🧭", key: "lightAngle", def: 2.20, min: -3.14159, max: 3.14159, step: 0.01, label: "Light Angle", details: "Direction of the key light." },
            { icon: "✨", key: "specStrength", def: 0.91, min: 0, max: 5, step: 0.01, label: "Specular", details: "Sharp highlight intensity." },
            { icon: "🔎", key: "specSharp", def: 200, min: 2, max: 200, step: 1, label: "Specular Sharpness", details: "Sharp highlight tightness." },
            { icon: "💫", key: "softSpecStrength", def: 0.27, min: 0, max: 3, step: 0.01, label: "Soft Highlight", details: "Broader sheen layer." },
            { icon: "🌫️", key: "softSpecSharp", def: 10.5, min: 1, max: 30, step: 0.5, label: "Soft Highlight Spread", details: "Lower = broader." },
            { icon: "⚪", key: "specColor", def: '#ffffff', special: "color", label: "Specular Colour", details: "Highlight tint." },
            { icon: "🪞", key: "reflectStrength", def: 0.0, min: -1, max: 5, step: 0.01, label: "Reflection", details: "Screen-space reflection of the actual scene (previous frame)." },
            { icon: "🌐", key: "reflectWidth", def: 3.0, min: -5, max: 25, step: 0.1, label: "Reflection Reach", details: "How far to sample in the reflected direction." },
            { icon: "🎨", key: "reflectColor", def: '#ffffff', special: "color", label: "Reflection Tint", details: "Tint of the reflected scene." },
            { icon: "🌟", key: "rimStrength", def: 1.01, min: -2, max: 5, step: 0.01, label: "Rim Light", details: "Edge glow." },
            { icon: "🎯", key: "reflectF0", def: 0.04, min: 0, max: 0.5, step: 0.005, label: "Reflectivity (F0)", details: "Reflectance head-on." },
            { icon: "📐", key: "reflectPow", def: 5.0, min: 1, max: 10, step: 0.1, label: "Fresnel Sharpness", details: "How quickly reflection ramps toward the rim." },
            { icon: "🌫️", key: "sceneRoughness", def: 0.0, min: 0, max: 1, step: 0.01, label: "Scene Reflection Blur", details: "Blur width of the screen-space scene reflection." },
            { icon: "🌥️", key: "ambient", def: 0.35, min: -2, max: 3, step: 0.01, label: "Ambient", details: "Base wax illumination." },
            { icon: "☀️", key: "diffuse", def: 0.55, min: -2, max: 3, step: 0.01, label: "Diffuse", details: "Directional wax illumination." },
            { icon: "🪨", key: "bump", def: 0.73, min: -2, max: 5, step: 0.01, label: "Surface Roundness", details: "1.0 = physical dome." },
            { icon: "🖊️", key: "edgeSoft", def: 0.125, min: -1, max: 2, step: 0.005, label: "Edge Softness", details: "Anti-aliasing width." },
        ]
    },
    {
        heading: "💎 Translucency", openByDefault: true, controls: [
            { icon: "🔮", key: "translucency", def: 0.35, min: -1, max: 5, step: 0.01, label: "Translucency", details: "Overall see-through quality of the wax." },
            { icon: "🌅", key: "translucencyBias", def: 0.55, min: -1, max: 2, step: 0.01, label: "Translucency Bias", details: "0 = uniform transparency. 1 = transparent only at edges." },
            { icon: "🔬", key: "refractionStrength", def: 0.30, min: -2, max: 2, step: 0.01, label: "Refraction", details: "Bends the background seen through the transparent wax along the surface normal." }
        ]
    },
    {
        heading: "🫙 Liquid & Glass", openByDefault: false, controls: [
            { icon: "🌌", key: "bgTop", def: '#541891', special: "color", label: "Liquid Top", details: "Liquid colour at top." },
            { icon: "🌆", key: "bgBottom", def: '#043e13', special: "color", label: "Liquid Bottom", details: "Liquid colour at bottom." },
            { icon: "💡", key: "lampGlow", def: 1.25, min: 0, max: 10, step: 0.01, label: "Lamp Glow", details: "Bulb glow through liquid." },
            { icon: "⭕", key: "glowRadius", def: 0.38, min: -2, max: 5, step: 0.01, label: "Glow Radius", details: "Falloff distance of the glow." },
            { icon: "🎨", key: "glowColor", def: '#ff4d00', special: "color", label: "Glow Colour", details: "Bulb colour." },
            { icon: "🌈", key: "halo", def: 0.91, min: -2, max: 5, step: 0.01, label: "Wax Halo", details: "Light bleeding from wax into liquid." },
            { icon: "📐", key: "haloWidth", def: 3.6, min: -1, max: 10, step: 0.05, label: "Halo Width", details: "Higher = tighter halo." },
            { icon: "🫙", key: "glassCurve", def: 0, min: -1, max: 5, step: 0.01, label: "Glass Curve", details: "Darkening at the glass edges." },
        ]
    },
    {
        heading: "📷 Webcam", openByDefault: false, controls: [
            { icon: "📷", key: "webcamActive", def: 0, special: "bool", savedInPreset: false, label: "Enable Webcam", details: "Show webcam feed in the background and reflection. Standalone — not saved in presets." },
            { icon: "🌅", key: "webcamBgMix", def: 0.5, min: 0, max: 1, step: 0.01, label: "Background Mix", details: "How much the webcam replaces the liquid gradient in the background." },
            { icon: "🪞", key: "webcamReflectMix", def: 0.5, min: 0, max: 5, step: 0.01, label: "Reflection Strength", details: "How much webcam is added on top of the screen-space scene reflection." },
            { icon: "🔄", key: "webcamInvertReflect", def: 0, special: "bool", savedInPreset: false, label: "Invert Reflection", details: "Flip the mirror direction of the webcam reflection." },
            { icon: "🌫️", key: "webcamRoughness", def: 0.30, min: 0, max: 1, step: 0.01, label: "Reflection Roughness", details: "Blur width of the webcam reflection." },
            { icon: "↔️", key: "webcamParallax", def: 1.0, min: 0, max: 5, step: 0.01, label: "Reflection Parallax", details: "Multiplier on the mirror offset for the webcam reflection." }
        ]
    },
    {
        heading: "🎛️ Post", openByDefault: false, controls: [
            { icon: "🌡️", key: "saturation", def: 1.10, min: 0, max: 2, step: 0.01, label: "Saturation", details: "1 = normal." },
            { icon: "☀️", key: "brightness", def: 1.00, min: 0, max: 2, step: 0.01, label: "Brightness", details: "1 = normal." },
            { icon: "📊", key: "contrast", def: 1.05, min: 0.3, max: 3, step: 0.01, label: "Contrast", details: "1 = normal." },
            { icon: "🎚️", key: "colorPow", def: 1.42, min: 0.3, max: 3, step: 0.01, label: "Colour Power", details: "Per-channel gamma." },
        ]
    },
    {
        heading: "🕶️ Vignette", openByDefault: false, controls: [
            { icon: "⭕", key: "vignetteRadius", def: 0.60, min: 0.0, max: 2.0, step: 0.005, label: "Vignette Radius", details: "Darkening start." },
            { icon: "☁️", key: "vignetteSoft", def: 0.50, min: 0.01, max: 1.5, step: 0.005, label: "Vignette Softness", details: "Falloff." },
            { icon: "🎨", key: "vignetteColor", def: '#000000', special: "color", label: "Vignette Color", details: "Vignette tint." },
        ]
    },
    {
        heading: "💡 Extra Lights", openByDefault: false, controls: [
            { icon: "💡", key: "extraLightStrength", def: 0.8, min: 0, max: 2, step: 0.01, label: "Light Multiplier", details: "Global scale applied to all accumulated lights (bullets, etc.). 0 disables the whole system without touching projectile definitions." },
        ]
    },
    {
        heading: "✨ Bullet FX", openByDefault: false, controls: [
            { icon: "⭕", key: "bulletGlowRadius", def: 1.9, min: 1.0, max: 4.0, step: 0.05, label: "Bullet Glow Size", details: "Glow quad size relative to the wax bullet. 1.5 = halo extends one wax radius beyond the wax edge." },
            { icon: "💡", key: "glowBrightness", def: 1.0, min: 0.05, max: 2.0, step: 0.01, label: "Glow Brightness", details: "Overall brightness of all glow effects — bullet halos, ship bulbs, sparks." },
        ]
    },
    {
        heading: "✨ Bulb FX", openByDefault: false, controls: [
            { icon: "🔵", key: "bulbGlowRadius", def: 0.02, min: 0.02, max: 1.0, step: 0.005, label: "Bulb Glow Size", details: "Glow quad radius around the player's bulb, in world units." },
            { icon: "🟡", key: "bulbGlowBrightness", def: 0.76, min: 0.0, max: 3.0, step: 0.01, label: "Bulb Glow Bright", details: "Brightness of the bulb's outer halo. Separate from light emission — purely visual." },
            { icon: "⬆️", key: "bulbGlowOffset", def: 0.5, min: -2, max: 2, step: 0.01, label: "Bulb Glow Offset", savedInPreset: false, details: "Vertical offset of the glow, as a fraction of ship size. 0 = ship anchor, 0.5 = mid-hull, 1 = top of hull." }
        ]
    },
];

window.__lavaControls = CONTROLS;

})();