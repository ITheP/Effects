function main() {
    let __destroyed = false;
    if (window.__kaleidoApp && typeof window.__kaleidoApp.destroy === 'function') {
        try { window.__kaleidoApp.destroy(); } catch (e) { console.warn('kaleido teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas[data-kaleido]").forEach(c => c.remove());

    const MAX_BLOBS = 16;

    const CFG = {
        targetFPS: 60, presetTransitionTime: 3.0,
        freezeTime: 0, autoMorph: 0, morphCycleTime: 10.0,
        timeScale: 0.23,
        debugMode: 0,

        blobCount: 16,
        blobSize: 0.049,
        blobSizeVar: 0.6,
        buoyancy: 1.93,
        drag: 1.10,
        heatGain: 1.36,
        cooling: 0.32,
        heatDepth: 0.16,
        tempNeutral: 0.50,
        maxSpeed: 0.32,
        wander: 0.35,
        squish: 0.60,
        turbulence: 0.32,
        turbulenceFreq: 2.86,
        turbulenceScale: 0.2,
        traitVariance: 0.35,
        wallSquish: 0.60,
        wallRestitution: 0.30,
        deathDepth: 0.35,
        fieldThreshold: 0.7,
        spawnRate: 3.5,
        spawnBatch: 6,

        cohesion: 0.97,
        cohesionRange: 1.36,
        repelStrength: 1.1,
        repelRange: 0.87,

        poolActive: 1,
        poolLevel: 0.088,
        poolSoftness: 0.012,
        poolWave: 0.06,
        poolWaveSpeed: 3.0,

        waxColorA: '#ff3b1f',
        waxColorB: '#ffd24a',
        waxGlow: 1.48,
        waxGlowColor: '#ff6a00',
        sssColor: '#ff6633',
        sssStrength: 2.0,
        sssFalloff: 1.44,

        lightAngle: 2.20,
        specStrength: 0.91,
        specSharp: 200,
        specColor: '#ffffff',
        softSpecStrength: 0.27,
        softSpecSharp: 10.5,
        reflectStrength: 0.45,
        reflectWidth: 3.0,
        reflectColor: '#c8d8ff',
        rimStrength: 1.01,
        ambient: 0.35,
        diffuse: 0.55,
        bump: 0.73,
        edgeSoft: 0.125,
        translucency: 0.35,
        translucencyBias: 0.55,

        bgTop: '#541891',
        bgBottom: '#043e13',
        lampGlow: 1.25,
        glowRadius: 0.38,
        glowColor: '#ff4d00',
        halo: 0.91,
        haloWidth: 3.6,
        glassCurve: 0,

        saturation: 1.10,
        brightness: 1.00,
        contrast: 1.05,
        colorPow: 1.42,
        vignetteRadius: 0.60,
        vignetteSoft: 0.50,
        vignetteColor: '#000000',
    };

    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                { icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true, label: "Target FPS", savedInPreset: false, details: "Framerate cap." },
                { icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01, label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over." },
                { icon: "⏸️", key: "freezeTime", def: CFG.freezeTime, special: "bool", savedInPreset: false, label: "Freeze Time", details: "Freeze the shader clock and physics." },
                { icon: "🔀", key: "autoMorph", def: CFG.autoMorph, special: "bool", savedInPreset: false, label: "Auto Morph", details: "Cycle random presets." },
                { icon: "🔄", key: "morphCycleTime", def: CFG.morphCycleTime, min: 2, max: 120, step: 0.5, savedInPreset: false, label: "Morph Cycle Time", details: "Seconds between random picks." },
                { icon: "🐢", key: "timeScale", def: CFG.timeScale, min: 0.05, max: 2, step: 0.01, label: "Time Scale", details: "Global speed multiplier." },
                { icon: "🐞", key: "debugMode", def: CFG.debugMode, special: "bool", savedInPreset: false, label: "Debug View", details: "Show raw blob state." },
            ]
        },
        {
            heading: "🫧 Wax Blobs", openByDefault: true, controls: [
                { icon: "🔢", key: "blobCount", def: CFG.blobCount, min: 1, max: MAX_BLOBS, step: 1, int: true, label: "Target Population", details: "Target number of live wax blobs." },
                { icon: "📏", key: "blobSize", def: CFG.blobSize, min: 0.015, max: 0.16, step: 0.001, label: "Blob Size", details: "Base radius in screen-height units." },
                { icon: "🎲", key: "blobSizeVar", def: CFG.blobSizeVar, min: 0, max: 1, step: 0.01, label: "Size Variance", details: "Random spread of blob radius." },
                { icon: "🧬", key: "traitVariance", def: CFG.traitVariance, min: 0, max: 1, step: 0.01, label: "Trait Variance", details: "Individual blobs differ in heat gain, cooling, max speed, wander and squish." },
                { icon: "🎈", key: "buoyancy", def: CFG.buoyancy, min: 0.05, max: 3, step: 0.01, label: "Buoyancy", details: "Upward force from temperature." },
                { icon: "💨", key: "drag", def: CFG.drag, min: 0.05, max: 4, step: 0.01, label: "Drag", details: "Velocity damping." },
                { icon: "🔥", key: "heatGain", def: CFG.heatGain, min: 0.1, max: 3, step: 0.01, label: "Heat Gain", details: "Heat absorbed near the bulb." },
                { icon: "❄️", key: "cooling", def: CFG.cooling, min: 0.02, max: 1.5, step: 0.01, label: "Cooling Rate", details: "Heat lost per second." },
                { icon: "📏", key: "heatDepth", def: CFG.heatDepth, min: 0.02, max: 0.6, step: 0.005, label: "Heat Depth", details: "How far the bulb's heat reaches." },
                { icon: "🌡️", key: "tempNeutral", def: CFG.tempNeutral, min: 0, max: 1.5, step: 0.01, label: "Neutral Temp", details: "Temperature at which blobs neither rise nor sink." },
                { icon: "🚀", key: "maxSpeed", def: CFG.maxSpeed, min: 0.05, max: 1.5, step: 0.01, label: "Max Speed", details: "Velocity clamp." },
                { icon: "🌊", key: "wander", def: CFG.wander, min: 0, max: 2, step: 0.01, label: "Horizontal Wander", details: "Sideways drift. Movement only, no shape change." },
                { icon: "🫧", key: "squish", def: CFG.squish, min: 0, max: 2, step: 0.01, label: "Stretch from Speed", details: "Elongation along motion." },
                { icon: "💨", key: "turbulence", def: CFG.turbulence, min: 0, max: 1, step: 0.01, label: "Turbulence", details: "Swirling fluid forces that wobble the blobs like jelly." },
                { icon: "🌀", key: "turbulenceFreq", def: CFG.turbulenceFreq, min: 0.1, max: 4, step: 0.01, label: "Turbulence Freq", details: "How fast the turbulent flow varies over time." },
                { icon: "🔬", key: "turbulenceScale", def: CFG.turbulenceScale, min: 0.1, max: 5, step: 0.01, label: "Turbulence Scale", details: "Spatial frequency of the eddies." },
                { icon: "🧱", key: "wallSquish", def: CFG.wallSquish, min: 0, max: 3, step: 0.01, label: "Wall Squish", details: "How much blobs flatten against walls and ceiling." },
                { icon: "🏓", key: "wallRestitution", def: CFG.wallRestitution, min: 0, max: 0.9, step: 0.01, label: "Wall Bounce", details: "How much velocity is kept when bouncing off a wall." },
                { icon: "⬇️", key: "deathDepth", def: CFG.deathDepth, min: 0.20, max: 1.50, step: 0.01, label: "Death Depth", details: "How far below screen blobs sink before dissolving." },
                { icon: "🎯", key: "fieldThreshold", def: CFG.fieldThreshold, min: 0.40, max: 2.50, step: 0.01, label: "Metaball Threshold", details: "Isosurface level." },
                { icon: "⏱️", key: "spawnRate", def: CFG.spawnRate, min: 0.5, max: 30, step: 0.1, label: "Spawn Rate", details: "Blobs per second." },
                { icon: "📦", key: "spawnBatch", def: CFG.spawnBatch, min: 1, max: 6, step: 1, int: true, label: "Spawn Batch", details: "Max blobs to spawn per tick: random(1..N)." },
            ]
        },
        {
            heading: "🧲 Cohesion & Tension", openByDefault: true, controls: [
                { icon: "🧲", key: "cohesion", def: CFG.cohesion, min: 0, max: 4, step: 0.01, label: "Cohesion", details: "Attraction between touching blobs." },
                { icon: "↔️", key: "cohesionRange", def: CFG.cohesionRange, min: 1.0, max: 4.0, step: 0.01, label: "Cohesion Range", details: "Distance (× combined radii)." },
                { icon: "💪", key: "repelStrength", def: CFG.repelStrength, min: 0, max: 10, step: 0.05, label: "Repel Strength", details: "Soft push when centres get too close." },
                { icon: "📐", key: "repelRange", def: CFG.repelRange, min: 0.1, max: 2.0, step: 0.01, label: "Repel Range", details: "Distance (× combined radii) at which repel kicks in." },
            ]
        },
        {
            heading: "🫗 Wax Pool", openByDefault: true, controls: [
                { icon: "👁️", key: "poolActive", def: CFG.poolActive, special: "bool", label: "Show Pool", details: "Wax reservoir at the bottom." },
                { icon: "📏", key: "poolLevel", def: CFG.poolLevel, min: 0.0, max: 0.4, step: 0.002, label: "Pool Level", details: "Height of the pool surface." },
                { icon: "☁️", key: "poolSoftness", def: CFG.poolSoftness, min: 0.004, max: 0.12, step: 0.001, label: "Pool Softness", details: "How quickly the pool field fades upward." },
                { icon: "🌊", key: "poolWave", def: CFG.poolWave, min: 0, max: 0.06, step: 0.0005, label: "Pool Wave", details: "Amplitude of the pool surface wave." },
                { icon: "⏱️", key: "poolWaveSpeed", def: CFG.poolWaveSpeed, min: 0, max: 3, step: 0.01, label: "Pool Wave Speed", details: "How fast the surface wave travels." },
            ]
        },
        {
            heading: "🎨 Wax Colour", openByDefault: true, controls: [
                { icon: "🅰️", key: "waxColorA", def: CFG.waxColorA, special: "color", label: "Wax Colour A", details: "Lower wax colour." },
                { icon: "🅱️", key: "waxColorB", def: CFG.waxColorB, special: "color", label: "Wax Colour B", details: "Upper wax colour." },
                { icon: "💡", key: "waxGlow", def: CFG.waxGlow, min: 0, max: 3, step: 0.01, label: "Bulb Reach", details: "How strongly the bulb illuminates the wax surface." },
                { icon: "🎨", key: "waxGlowColor", def: CFG.waxGlowColor, special: "color", label: "Bulb Tint", details: "Colour of the light reaching the wax surface." },
                { icon: "🌈", key: "sssColor", def: CFG.sssColor, special: "color", label: "SSS Colour", details: "The wax's internal scattered light colour." },
                { icon: "🔆", key: "sssStrength", def: CFG.sssStrength, min: 0, max: 3, step: 0.01, label: "SSS Strength", details: "Intensity of subsurface light transmitted through the wax." },
                { icon: "🌫️", key: "sssFalloff", def: CFG.sssFalloff, min: 0.1, max: 5, step: 0.01, label: "SSS Falloff", details: "How quickly light dies through the wax." },
            ]
        },
        {
            heading: "💡 Lighting", openByDefault: true, controls: [
                { icon: "🧭", key: "lightAngle", def: CFG.lightAngle, min: -3.14159, max: 3.14159, step: 0.01, label: "Light Angle", details: "Direction of the key light." },
                { icon: "✨", key: "specStrength", def: CFG.specStrength, min: 0, max: 5, step: 0.01, label: "Specular", details: "Sharp highlight intensity." },
                { icon: "🔎", key: "specSharp", def: CFG.specSharp, min: 2, max: 200, step: 1, label: "Specular Sharpness", details: "Sharp highlight tightness." },
                { icon: "💫", key: "softSpecStrength", def: CFG.softSpecStrength, min: 0, max: 3, step: 0.01, label: "Soft Highlight", details: "Broader sheen layer." },
                { icon: "🌫️", key: "softSpecSharp", def: CFG.softSpecSharp, min: 1, max: 30, step: 0.5, label: "Soft Highlight Spread", details: "Lower = broader." },
                { icon: "⚪", key: "specColor", def: CFG.specColor, special: "color", label: "Specular Colour", details: "Highlight tint." },
                { icon: "🪞", key: "reflectStrength", def: CFG.reflectStrength, min: 0, max: 2, step: 0.01, label: "Reflection", details: "Mirror-like reflection of the scene. Adds glassy/enamel quality." },
                { icon: "🌐", key: "reflectWidth", def: CFG.reflectWidth, min: 0.5, max: 8, step: 0.1, label: "Reflection Falloff", details: "Higher = tighter reflection near grazing angles, lower = broader spread." },
                { icon: "🎨", key: "reflectColor", def: CFG.reflectColor, special: "color", label: "Reflection Tint", details: "Tint of the reflected scene." },
                { icon: "🌟", key: "rimStrength", def: CFG.rimStrength, min: 0, max: 2, step: 0.01, label: "Rim Light", details: "Edge glow." },
                { icon: "🌥️", key: "ambient", def: CFG.ambient, min: 0, max: 2, step: 0.01, label: "Ambient", details: "Base wax illumination." },
                { icon: "☀️", key: "diffuse", def: CFG.diffuse, min: 0, max: 2, step: 0.01, label: "Diffuse", details: "Directional wax illumination." },
                { icon: "🪨", key: "bump", def: CFG.bump, min: 0, max: 4, step: 0.01, label: "Surface Roundness", details: "1.0 = physical dome." },
                { icon: "🖊️", key: "edgeSoft", def: CFG.edgeSoft, min: 0.01, max: 0.6, step: 0.005, label: "Edge Softness", details: "Anti-aliasing width." },
            ]
        },
        {
            heading: "💎 Translucency", openByDefault: true, controls: [
                { icon: "🔮", key: "translucency", def: CFG.translucency, min: 0, max: 2, step: 0.01, label: "Translucency", details: "Overall see-through quality of the wax. Lets the liquid and other blobs show through." },
                { icon: "🌅", key: "translucencyBias", def: CFG.translucencyBias, min: 0, max: 1, step: 0.01, label: "Translucency Bias", details: "0 = uniform transparency. 1 = transparent only at edges (thick centre stays opaque)." },
            ]
        },
        {
            heading: "🫙 Liquid & Glass", openByDefault: false, controls: [
                { icon: "🌌", key: "bgTop", def: CFG.bgTop, special: "color", label: "Liquid Top", details: "Liquid colour at top." },
                { icon: "🌆", key: "bgBottom", def: CFG.bgBottom, special: "color", label: "Liquid Bottom", details: "Liquid colour at bottom." },
                { icon: "💡", key: "lampGlow", def: CFG.lampGlow, min: 0, max: 4, step: 0.01, label: "Lamp Glow", details: "Bulb glow through liquid." },
                { icon: "⭕", key: "glowRadius", def: CFG.glowRadius, min: 0.05, max: 2, step: 0.01, label: "Glow Radius", details: "Falloff distance of the glow." },
                { icon: "🎨", key: "glowColor", def: CFG.glowColor, special: "color", label: "Glow Colour", details: "Bulb colour." },
                { icon: "🌈", key: "halo", def: CFG.halo, min: 0, max: 3, step: 0.01, label: "Wax Halo", details: "Light bleeding from wax into liquid." },
                { icon: "📐", key: "haloWidth", def: CFG.haloWidth, min: 0.5, max: 6.0, step: 0.05, label: "Halo Width", details: "Higher = tighter halo." },
                { icon: "🫙", key: "glassCurve", def: CFG.glassCurve, min: 0, max: 1.5, step: 0.01, label: "Glass Curve", details: "Darkening at the glass edges." },
            ]
        },
        {
            heading: "🎛️ Post", openByDefault: false, controls: [
                { icon: "🌡️", key: "saturation", def: CFG.saturation, min: 0, max: 2, step: 0.01, label: "Saturation", details: "1 = normal." },
                { icon: "☀️", key: "brightness", def: CFG.brightness, min: 0, max: 2, step: 0.01, label: "Brightness", details: "1 = normal." },
                { icon: "📊", key: "contrast", def: CFG.contrast, min: 0.3, max: 3, step: 0.01, label: "Contrast", details: "1 = normal." },
                { icon: "🎚️", key: "colorPow", def: CFG.colorPow, min: 0.3, max: 3, step: 0.01, label: "Colour Power", details: "Per-channel gamma." },
            ]
        },
        {
            heading: "🕶️ Vignette", openByDefault: false, controls: [
                { icon: "⭕", key: "vignetteRadius", def: CFG.vignetteRadius, min: 0.0, max: 2.0, step: 0.005, label: "Vignette Radius", details: "Darkening start." },
                { icon: "☁️", key: "vignetteSoft", def: CFG.vignetteSoft, min: 0.01, max: 1.5, step: 0.005, label: "Vignette Softness", details: "Falloff." },
                { icon: "🎨", key: "vignetteColor", def: CFG.vignetteColor, special: "color", label: "Vignette Color", details: "Vignette tint." },
            ]
        }
    ];

    const CONTROL_BY_KEY = {};
    CONTROLS.forEach(g => g.controls.forEach(c => { CONTROL_BY_KEY[c.key] = c; }));
    const DEFAULTS = {};
    const INT_KEYS = {};
    const STANDALONE_KEYS = {};
    const BOOL_KEYS = {};
    const COLOR_KEYS = {};
    Object.keys(CONTROL_BY_KEY).forEach(key => {
        const c = CONTROL_BY_KEY[key];
        DEFAULTS[key] = c.def;
        if (c.int) INT_KEYS[key] = true;
        if (c.special === 'bool') BOOL_KEYS[key] = true;
        if (c.special === 'color') COLOR_KEYS[key] = true;
        if (c.savedInPreset === false) STANDALONE_KEYS[key] = true;
    });

    const PRESETS = [
        { name: "Default", iteration: 1, values: {} },
        { name: "Molten Gold", iteration: 2, values: { waxColorA: '#ff2200', waxColorB: '#ffcc00', sssColor: '#ffaa00', sssStrength: 1.3, sssFalloff: 0.9, waxGlow: 1.4, waxGlowColor: '#ff8800', bgTop: '#0a0505', bgBottom: '#2a0a00', glowColor: '#ff6600', lampGlow: 1.2, specStrength: 1.8 } },
        { name: "Deep Sea", iteration: 3, values: { waxColorA: '#00b3ff', waxColorB: '#7ef9ff', sssColor: '#00aaff', sssStrength: 0.6, waxGlow: 0.7, waxGlowColor: '#00aaff', bgTop: '#020814', bgBottom: '#001a2e', glowColor: '#0088ff', lampGlow: 0.8, specStrength: 1.6, specSharp: 60 } },
        { name: "Toxic Slime", iteration: 4, values: { waxColorA: '#7cff00', waxColorB: '#d4ff5a', sssColor: '#88ff00', sssStrength: 1.1, waxGlow: 1.1, waxGlowColor: '#88ff00', bgTop: '#050a02', bgBottom: '#0e2200', glowColor: '#66ff00', lampGlow: 0.9, saturation: 1.3 } },
        { name: "Cotton Candy", iteration: 5, values: { waxColorA: '#ff5ec4', waxColorB: '#a0e8ff', sssColor: '#ff88dd', sssStrength: 0.9, waxGlow: 0.9, waxGlowColor: '#ff88dd', bgTop: '#1a0a22', bgBottom: '#331244', glowColor: '#ff44aa', lampGlow: 0.9, blobSize: 0.045, blobCount: 12 } },
        { name: "Blood Moon", iteration: 6, values: { waxColorA: '#5a0000', waxColorB: '#ff2b00', sssColor: '#ff0000', sssStrength: 1.6, sssFalloff: 0.7, waxGlow: 1.6, waxGlowColor: '#ff0000', bgTop: '#080000', bgBottom: '#1e0000', glowColor: '#cc0000', lampGlow: 1.4, contrast: 1.2, specStrength: 0.8 } },
        { name: "Aurora", iteration: 7, values: { waxColorA: '#00ff9d', waxColorB: '#7b5bff', sssColor: '#00ffcc', sssStrength: 0.9, waxGlow: 0.8, bgTop: '#03061a', bgBottom: '#0a0f33', glowColor: '#00ffaa', lampGlow: 0.7, blobCount: 7, blobSize: 0.07 } },
        { name: "Mercury", iteration: 8, values: { waxColorA: '#8a8a9a', waxColorB: '#e8e8ff', sssColor: '#aabbff', sssStrength: 0.2, waxGlow: 0.3, bgTop: '#050508', bgBottom: '#101018', glowColor: '#445577', lampGlow: 0.5, specStrength: 3.0, specSharp: 120, saturation: 0.4, reflectStrength: 1.2 } },
        { name: "Slow Blobs", iteration: 9, values: { buoyancy: 0.35, cooling: 0.14, heatDepth: 0.22, blobSize: 0.085, blobCount: 6, drag: 1.6, maxSpeed: 0.16, wander: 0.2, timeScale: 0.75 } },
        { name: "Fast Frenzy", iteration: 10, values: { buoyancy: 1.8, cooling: 0.6, heatDepth: 0.12, blobSize: 0.035, blobCount: 14, drag: 0.7, maxSpeed: 0.55, wander: 0.9, squish: 1.2, turbulence: 0.35, turbulenceFreq: 2.5, turbulenceScale: 1.8, traitVariance: 0.5, timeScale: 1.2 } },
        { name: "Giant Pool", iteration: 11, values: { poolLevel: 0.22, poolSoftness: 0.06, poolWave: 0.02, blobSize: 0.09, blobCount: 5, buoyancy: 0.6 } },
        { name: "No Pool", iteration: 12, values: { poolActive: 0, blobCount: 10 } },
        { name: "Neon Lab", iteration: 13, values: { waxColorA: '#ff00cc', waxColorB: '#00ffee', sssColor: '#ff00aa', sssStrength: 1.5, sssFalloff: 0.8, waxGlow: 1.5, waxGlowColor: '#ff00aa', bgTop: '#06000f', bgBottom: '#12002a', glowColor: '#aa00ff', lampGlow: 1.3, specStrength: 2.4, specSharp: 90, saturation: 1.5 } },
        { name: "Sunset", iteration: 14, values: { waxColorA: '#ff6a00', waxColorB: '#ffd166', sssColor: '#ff9933', sssStrength: 1.2, waxGlow: 1.2, bgTop: '#150820', bgBottom: '#3a1030', glowColor: '#ff5500', lampGlow: 1.1 } },
        { name: "Slow Motion", iteration: 15, values: { timeScale: 0.30 } },
        { name: "Hypnotic", iteration: 16, values: { timeScale: 0.12 } },
        { name: "Cohesive", iteration: 17, values: { cohesion: 2.4, cohesionRange: 1.35, repelStrength: 0.4, repelRange: 0.4, blobCount: 12, blobSize: 0.05 } },
        { name: "Repulsive", iteration: 18, values: { cohesion: 0.0, repelStrength: 4.0, repelRange: 1.2, blobCount: 9 } },
        { name: "Bouncy Wax", iteration: 19, values: { wallSquish: 1.8, squish: 1.2, wallRestitution: 0.55, traitVariance: 0.6, blobCount: 7 } },
        { name: "Tight Blobs", iteration: 20, values: { fieldThreshold: 1.6, edgeSoft: 0.06, repelStrength: 0.4, blobCount: 10 } },
        { name: "Gloopy", iteration: 21, values: { fieldThreshold: 0.75, haloWidth: 1.2, halo: 1.2, sssStrength: 1.4, sssFalloff: 0.7, blobCount: 6 } },
        { name: "Jelly", iteration: 22, values: { turbulence: 0.45, turbulenceFreq: 1.2, turbulenceScale: 0.8, squish: 1.4, wallSquish: 1.0 } },
        { name: "Glass Wax", iteration: 23, values: { reflectStrength: 1.1, reflectWidth: 2.0, translucency: 1.2, translucencyBias: 0.3, specStrength: 2.0, specSharp: 150, sssStrength: 0.6 } },
        { name: "Enamel", iteration: 24, values: { reflectStrength: 0.9, reflectWidth: 4.0, translucency: 0.0, specStrength: 2.5, specSharp: 180, softSpecStrength: 0.15 } },
    
    ,{
    "name": "Test",
    "iteration": 25,
    "values": {
        "poolLevel": 0.126,
        "sssColor": "#d00b46",
        "sssStrength": 3,
        "sssFalloff": 0.99,
        "reflectStrength": 0.73,
        "reflectWidth": 1.2,
        "translucency": 1.84,
        "translucencyBias": 1,
        "halo": 0.42,
        "haloWidth": 4.4
    }
},
    {
    "name": "Vampire Bites",
    "iteration": 25,
    "values": {
        "poolLevel": 0.126,
        "sssColor": "#d00b46",
        "sssStrength": 3,
        "sssFalloff": 0.99,
        "reflectStrength": 0.73,
        "reflectWidth": 1.2,
        "translucency": 1.84,
        "translucencyBias": 1,
        "halo": 0.42,
        "haloWidth": 4.4
    }
}
,{
    "name": "Preset 25",
    "iteration": 25,
    "values": {
        "cohesion": 1.58,
        "cohesionRange": 1.85,
        "repelStrength": 2.4,
        "repelRange": 0.79,
        "poolSoftness": 0.034,
        "waxColorA": "#fff700",
        "waxColorB": "#ff0000",
        "waxGlow": 2.88,
        "waxGlowColor": "#0400ff",
        "sssColor": "#04ff00",
        "sssStrength": 2.21,
        "sssFalloff": 0.64,
        "lightAngle": -1.62159,
        "specStrength": 1.62,
        "specColor": "#c72dd2",
        "reflectStrength": 0.73,
        "reflectColor": "#0048ff",
        "rimStrength": 1.03,
        "diffuse": 0.69,
        "edgeSoft": 0.545,
        "translucency": 1.72,
        "translucencyBias": 0.8,
        "bgTop": "#00f531",
        "bgBottom": "#f104dd",
        "lampGlow": 0.57,
        "glowRadius": 0.4,
        "glowColor": "#cc0000",
        "halo": 0.82,
        "haloWidth": 0.5,
        "contrast": 1.2
    }
}
    ];

    function fmtVal(v) {
        if (v === 0) return "0";
        const a = Math.abs(v);
        if (a >= 100) return v.toFixed(1);
        if (a >= 1) return v.toFixed(3);
        if (a >= 0.01) return v.toFixed(4);
        if (a >= 0.0001) return v.toFixed(6);
        return v.toExponential(3);
    }
    const deepClone = v => (v === null || typeof v !== 'object') ? v : JSON.parse(JSON.stringify(v));
    function hexToRgb(hex) {
        hex = (hex || '#000000').replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
    }
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);

    let state = Object.assign({}, CFG);
    const groupClipboard = {};

    let transitionActive = false;
    let transitionStart = 0;
    let transitionDur = 0;
    let transitionSource = null;
    let transitionTarget = null;
    let lastMorphTime = 0;

    let userPresets = [];
    try { userPresets = JSON.parse(localStorage.getItem('kaleidoUserPresets') || '[]'); } catch (_) { userPresets = []; }
    userPresets.forEach(p => PRESETS.push(p));

    var canvas = document.createElement("canvas");
    canvas.setAttribute('data-kaleido', '1');
    var content = document.getElementById("content");
    canvas.style.position = 'fixed';
    canvas.style.zIndex = -1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    content.appendChild(canvas);

    var gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false, antialias: false, depth: false });
    if (!gl) { console.log('WebGL not supported'); return; }

    var program = null;
    var uniforms = {};

    function resizeCanvas() {
        canvas.width = Math.max(1, window.innerWidth);
        canvas.height = Math.max(1, window.innerHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    var vertexShaderSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    var fragmentShaderSource = `
        precision highp float;
        varying vec2 v_texCoord;

        uniform float time;
        uniform float aspect;
        uniform vec4  blobs[${MAX_BLOBS}];
        uniform float blobAngles[${MAX_BLOBS}];
        uniform vec2  blobVelocities[${MAX_BLOBS}];
        uniform float blobRadiusAvg;
        uniform float fieldThreshold;
        uniform float debugMode;
        uniform float cohesionRange;
        uniform float repelRange;

        uniform float poolActive;
        uniform float poolLevel;
        uniform float poolSoftness;
        uniform float poolWave;
        uniform float poolWaveSpeed;

        uniform vec3  waxA;
        uniform vec3  waxB;
        uniform vec3  waxGlowColor;
        uniform float waxGlow;
        uniform vec3  sssColor;
        uniform float sssStrength;
        uniform float sssFalloff;

        uniform vec3  bgTop;
        uniform vec3  bgBottom;
        uniform float lampGlow;
        uniform float glowRadius;
        uniform vec3  glowColor;
        uniform float halo;
        uniform float haloWidth;
        uniform float glassCurve;

        uniform vec2  lightDir;
        uniform vec3  specColor;
        uniform float specStrength;
        uniform float specSharp;
        uniform float softSpecStrength;
        uniform float softSpecSharp;
        uniform vec3  reflectColor;
        uniform float reflectStrength;
        uniform float reflectWidth;
        uniform float rimStrength;
        uniform float ambient;
        uniform float diffuse;
        uniform float bump;
        uniform float edgeSoft;
        uniform float translucency;
        uniform float translucencyBias;

        uniform float saturation;
        uniform float brightness;
        uniform float contrast;
        uniform float colorPow;

        uniform float vignetteRadius;
        uniform float vignetteSoft;
        uniform vec3  vignetteColor;

        float lineDist(vec2 p, vec2 a, vec2 b) {
            vec2 pa = p - a;
            vec2 ba = b - a;
            float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
            return length(pa - ba * h);
        }

        // Simple analytic reflection of the "scene" for glossy highlights.
        // Samples the liquid and bulb glow in the reflected direction.
        vec3 sceneColor(vec2 uv) {
            vec2 P = vec2(uv.x * aspect, uv.y);
            vec3 bg = mix(bgBottom, bgTop, clamp(uv.y, 0.0, 1.0));
            vec2 lampPos = vec2(aspect * 0.5, -0.05);
            float gd = length(P - lampPos);
            float glow = exp(-gd / max(glowRadius, 0.02));
            bg += glowColor * glow * lampGlow;
            return bg;
        }

        void main() {
            vec2 p = vec2(v_texCoord.x * aspect, v_texCoord.y);

            float fadeHi = poolActive > 0.5 ? poolLevel : 0.02;
            float fadeLo = fadeHi - 0.15;

            if (debugMode > 0.5) {
                vec3 dbg = vec3(0.03, 0.04, 0.06);

                if (poolActive > 0.5) {
                    float surf = poolLevel;
                    if (p.y < surf) {
                        float band = smoothstep(surf - 0.03, surf, p.y);
                        dbg = mix(dbg, vec3(0.10, 0.05, 0.02), band);
                    }
                    if (abs(p.y - surf) < 0.0015) dbg = vec3(0.9, 0.5, 0.15);
                }

                if (mod(p.x - aspect * 0.5, 0.1) < 0.0012 || mod(p.y - 0.5, 0.1) < 0.0012) {
                    dbg += vec3(0.03);
                }

                if (poolActive > 0.5) {
                    if (abs(p.y - fadeLo) < 0.0008) dbg = vec3(0.3, 0.2, 0.0);
                    if (abs(p.y - fadeHi) < 0.0008) dbg = vec3(0.5, 0.3, 0.0);
                }

                for (int i = 0; i < ${MAX_BLOBS}; i++) {
                    vec4 b = blobs[i];
                    if (b.z < 1e-5) continue;
                    float yFade = smoothstep(fadeLo, fadeHi, b.y);

                    float sy = max(b.w, 1.0);
                    float ang = blobAngles[i];
                    float ca = cos(ang), sa = sin(ang);
                    vec2 q = p - b.xy;
                    vec2 qr = vec2(q.x*ca + q.y*sa, -q.x*sa + q.y*ca);
                    vec2 qt = vec2(qr.x/sy, qr.y*sy);
                    float d = length(qt) - b.z;

                    float fill = (1.0 - smoothstep(-0.003, 0.003, d)) * yFade;
                    dbg = mix(dbg, vec3(0.15, 0.35, 0.70), fill * 0.40);

                    float outline = (1.0 - smoothstep(0.0, 0.004, abs(d))) * yFade;
                    dbg = mix(dbg, vec3(0.55, 0.85, 1.0), outline);

                    float cd = (1.0 - smoothstep(0.0, 0.005, length(q))) * yFade;
                    dbg = mix(dbg, vec3(1.0, 0.3, 0.3), cd);

                    vec2 vel = blobVelocities[i];
                    float vLen = length(vel);
                    if (vLen > 0.003) {
                        vec2 vDir = vel / vLen;
                        float drawLen = min(vLen * 5.0, 0.15);
                        vec2 la = b.xy;
                        vec2 lb = b.xy + vDir * drawLen;
                        if (lineDist(p, la, lb) < 0.0025) {
                            dbg = mix(dbg, vec3(0.3, 1.0, 0.3), yFade);
                        }
                    }

                    float axisLen = b.z * sy;
                    vec2 aDir = vec2(cos(ang), sin(ang));
                    vec2 aa = b.xy - aDir * axisLen;
                    vec2 ab = b.xy + aDir * axisLen;
                    if (lineDist(p, aa, ab) < 0.0018) {
                        dbg = mix(dbg, vec3(1.0, 0.9, 0.0), yFade);
                    }

                    float cohRing = b.z * 2.0 * cohesionRange;
                    if (abs(length(q) - cohRing) < 0.0025) {
                        dbg = mix(dbg, vec3(1.0, 0.3, 1.0), yFade * 0.85);
                    }
                    float repRing = b.z * 2.0 * repelRange;
                    if (abs(length(q) - repRing) < 0.0025) {
                        dbg = mix(dbg, vec3(1.0, 0.55, 0.1), yFade * 0.85);
                    }
                }

                gl_FragColor = vec4(dbg, 1.0);
                return;
            }

            float f = 0.0;
            vec2  grad = vec2(0.0);

            if (poolActive > 0.5) {
                float tW = time * poolWaveSpeed;
                float ph = poolWave * (0.6 * sin(p.x * 7.0 + tW * 0.55)
                                     + 0.4 * sin(p.x * 13.0 - tW * 0.90));
                float phP = poolWave * (0.6 * 7.0 * cos(p.x * 7.0 + tW * 0.55)
                                      + 0.4 * 13.0 * cos(p.x * 13.0 - tW * 0.90));
                float surf = poolLevel - poolSoftness * 2.07944 + ph;
                float dm = max(p.y - surf, 0.0);
                float soft = max(poolSoftness, 0.001);
                float pf = 8.0 * exp(-dm / soft);
                f += pf;
                grad += vec2((pf / soft) * phP, -pf / soft);
            }

            for (int i = 0; i < ${MAX_BLOBS}; i++) {
                vec4 b = blobs[i];
                if (b.z < 1e-5) continue;
                float yFade = smoothstep(fadeLo, fadeHi, b.y);
                if (yFade < 0.001) continue;

                float sy = max(b.w, 1.0);
                float ang = blobAngles[i];
                float ca = cos(ang);
                float sa = sin(ang);

                vec2 q = p - b.xy;
                vec2 qr = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca);
                vec2 qt = vec2(qr.x / sy, qr.y * sy);

                float d2 = dot(qt, qt) + 1e-4;
                float r2 = b.z * b.z * yFade;
                float fi = r2 / d2;
                f += fi;

                vec2 d2dq = 2.0 * vec2(
                    qt.x * ca / sy - qt.y * sa * sy,
                    qt.x * sa / sy + qt.y * ca * sy
                );
                grad += -(r2 / (d2 * d2)) * d2dq;
            }

            float mask = smoothstep(fieldThreshold - edgeSoft, fieldThreshold + edgeSoft, f);

            float fc = max(f, fieldThreshold + 1e-4);
            float tH = max(0.0, 1.0 - fieldThreshold / fc);
            float hN = sqrt(max(tH, 1e-4));
            float dhdf = fieldThreshold / (2.0 * fc * fc * hN);
            dhdf = min(dhdf, 400.0);
            vec2 slope = grad * dhdf * blobRadiusAvg;
            vec3 N = normalize(vec3(-slope * bump, 1.0));

            vec3 L = normalize(vec3(lightDir, 0.80));
            vec3 V = vec3(0.0, 0.0, 1.0);
            vec3 H = normalize(L + V);
            float ndl = max(dot(N, L), 0.0);
            float ndh = max(dot(N, H), 0.0);
            float spec = pow(ndh, max(specSharp, 1.0)) * specStrength;
            float softSpec = pow(ndh, max(softSpecSharp, 1.0)) * softSpecStrength;
            float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);

            float ht = clamp(p.y * 0.85 + 0.15 * sin(p.x * 2.5 + time * 0.35), 0.0, 1.0);
            vec3 wax = mix(waxA, waxB, ht);

            float lampL = exp(-max(p.y, 0.0) * 4.0);
            vec3 waxLit = wax * (ambient + diffuse * ndl);
            waxLit += waxGlowColor * lampL * waxGlow * 0.35;
            waxLit += specColor * spec;
            waxLit += specColor * softSpec * wax;

            // Reflection — sample the scene in the mirror direction
            // Fresnel-like: reflects strongest at grazing angles (N.z -> 0)
            float fresnel = pow(1.0 - clamp(N.z, 0.0, 1.0), max(reflectWidth, 0.1) * 0.5);
            vec2 mirrorUV = v_texCoord - N.xy * 0.35;
            mirrorUV = clamp(mirrorUV, 0.0, 1.0);
            vec3 reflected = sceneColor(mirrorUV);
            waxLit += reflected * reflectColor * reflectStrength * fresnel;

            waxLit += mix(waxB, vec3(1.0), 0.5) * rim * rimStrength * 0.5;

            // SSS
            float waxDepth = max(0.0, (f - fieldThreshold) / fieldThreshold);
            float transmission = exp(-waxDepth * sssFalloff);
            float bulbFacing = max(0.0, -N.y);
            waxLit += sssColor * bulbFacing * transmission * lampL * sssStrength;
            waxLit += mix(sssColor, waxB, 0.4) * transmission * rim * sssStrength * 0.4;

            // Liquid background
            vec3 bg = mix(bgBottom, bgTop, clamp(v_texCoord.y, 0.0, 1.0));
            vec2 lampPos = vec2(aspect * 0.5, -0.05);
            float gd = length(p - lampPos);
            float glow = exp(-gd / max(glowRadius, 0.02));
            bg += glowColor * glow * lampGlow;

            float haloF = clamp(f / max(fieldThreshold, 0.01), 0.0, 1.0);
            bg += waxGlowColor * pow(haloF, max(haloWidth, 0.1)) * (1.0 - mask) * halo;

            // Translucency — how much of the background shows through the wax
            float transAlpha = translucency * 0.5;
            // Bias: thicker wax (higher f) is more opaque.
            // bias=0 → uniform transparency; bias=1 → only edges transparent.
            float thickness = max(0.0, (f - fieldThreshold) / max(fieldThreshold, 0.01));
            float thickFactor = mix(1.0, 1.0 / (1.0 + thickness * 2.0), translucencyBias);
            transAlpha *= thickFactor;
            transAlpha = clamp(transAlpha, 0.0, 0.9);
            vec3 waxWithBG = waxLit * (1.0 - transAlpha) + bg * transAlpha;

            vec3 col = mix(bg, waxWithBG, mask);

            float gx = abs(v_texCoord.x - 0.5) * 2.0;
            col *= 1.0 - glassCurve * gx * gx * gx;

            float lum = dot(col, vec3(0.299, 0.587, 0.114));
            col = mix(vec3(lum), col, saturation);
            col *= brightness;
            col = pow(max(col, vec3(0.0001)), vec3(contrast));
            col = pow(max(col, vec3(0.0001)), vec3(colorPow));

            vec2 vUv = v_texCoord - 0.5;
            float vr = length(vUv);
            float vg = smoothstep(vignetteRadius, vignetteRadius + vignetteSoft, vr);
            col = mix(col, vignetteColor, vg);

            gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
        }
    `;

    function createShader(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link failed:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    [
        "time", "aspect", "blobs", "blobAngles", "blobVelocities", "blobRadiusAvg", "fieldThreshold", "debugMode",
        "cohesionRange", "repelRange",
        "poolActive", "poolLevel", "poolSoftness", "poolWave", "poolWaveSpeed",
        "waxA", "waxB", "waxGlowColor", "waxGlow",
        "sssColor", "sssStrength", "sssFalloff",
        "bgTop", "bgBottom", "lampGlow", "glowRadius", "glowColor", "halo", "haloWidth", "glassCurve",
        "lightDir", "specColor", "specStrength", "specSharp", "softSpecStrength", "softSpecSharp",
        "reflectColor", "reflectStrength", "reflectWidth",
        "rimStrength",
        "ambient", "diffuse", "bump", "edgeSoft",
        "translucency", "translucencyBias",
        "saturation", "brightness", "contrast", "colorPow",
        "vignetteRadius", "vignetteSoft", "vignetteColor"
    ].forEach(n => { uniforms[n] = gl.getUniformLocation(program, n); });

    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let blobs = [];
    let spawnTimer = 0;

    const blobData = new Float32Array(MAX_BLOBS * 4);
    const blobAngleData = new Float32Array(MAX_BLOBS);
    const blobVelData = new Float32Array(MAX_BLOBS * 2);
    let avgRadius = 0.05;

    function clampDeformation(b) {
        const tr = b.dxx + b.dyy;
        const det = b.dxx * b.dyy - b.dxy * b.dxy;
        const disc = Math.sqrt(Math.max(0, tr * tr * 0.25 - det));
        let mu1 = tr * 0.5 + disc;
        let mu2 = tr * 0.5 - disc;
        mu1 = clamp(mu1, 0.35, 2.5);
        mu2 = clamp(mu2, 0.35, 2.5);
        let theta;
        if (Math.abs(b.dxy) < 1e-9 && Math.abs(b.dxx - b.dyy) < 1e-9) {
            theta = 0;
        } else {
            theta = 0.5 * Math.atan2(2 * b.dxy, b.dxx - b.dyy);
        }
        const ct = Math.cos(theta), st = Math.sin(theta);
        const ct2 = ct * ct, st2 = st * st, cst = ct * st;
        b.dxx = ct2 * mu1 + st2 * mu2;
        b.dxy = cst * (mu1 - mu2);
        b.dyy = st2 * mu1 + ct2 * mu2;
        b.dxxV = clamp(b.dxxV, -30, 30);
        b.dxyV = clamp(b.dxyV, -30, 30);
        b.dyyV = clamp(b.dyyV, -30, 30);
    }

    function spawnBlob(x, y, rFull, temp, initialR) {
        if (blobs.length >= MAX_BLOBS) return;
        const r0 = initialR !== undefined ? initialR : rFull;
        const v = state.traitVariance;
        const mkv = () => Math.max(0.2, 1 + (Math.random() * 2 - 1) * v);
        blobs.push({
            x: x, y: y,
            vx: rand(-0.02, 0.02),
            vy: rand(0.0, 0.03),
            wanderVx: 0,
            r: Math.max(0.001, r0),
            targetR: Math.max(0.001, rFull),
            temp: temp !== undefined ? temp : 0.6,
            stretch: 1.0,
            stretchAngle: rand(0, 6.2831853),
            dxx: 1, dxy: 0, dyy: 1,
            dxxV: 0, dxyV: 0, dyyV: 0,
            turbX: 0, turbY: 0,
            wanderFreq: rand(0.15, 0.5),
            wanderPhase: rand(0, 6.2831853),
            turbSeed: rand(0, 6.2831853),
            heatGainMul: mkv(),
            coolingMul: mkv(),
            maxSpeedMul: mkv(),
            wanderMul: mkv(),
            squishMul: mkv(),
            dying: false,
            aliveTime: 0,
        });
    }

    function resetBlobs() {
        blobs.length = 0;
        spawnTimer = 0;
        avgRadius = state.blobSize;
        const asp = canvas.width / Math.max(1, canvas.height);
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));
        for (let i = 0; i < target; i++) {
            const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
            const rC = Math.max(0.008, r);
            spawnBlob(rand(rC, Math.max(rC * 1.1, asp - rC)),
                      rand(0.02, 0.55), rC, rand(0.3, 1.0));
        }
    }

    function stepPhysics(dt, t) {
        if (dt <= 0) return;
        const asp = canvas.width / Math.max(1, canvas.height);
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));

        const poolActive = state.poolActive > 0.5;
        const deathY = -state.deathDepth;
        const spawnY = -0.40;
        const freezeHeatBelowY = poolActive
            ? Math.max(0.10, state.poolLevel + 2 * state.poolSoftness)
            : 0.10;
        const maxLifetime = 25.0;
        const growTime = 0.5;
        const shrinkRate = 12.0;

        const hd = Math.max(0.01, state.heatDepth);
        const neutral = state.tempNeutral;
        const dragK = Math.exp(-state.drag * dt);
        const maxSpBase = Math.max(0.01, state.maxSpeed);
        const turbFreq = state.turbulenceFreq;
        const turbScale = Math.max(0.1, state.turbulenceScale);
        const wallSq = state.wallSquish;
        const wallRest = state.wallRestitution;

        for (let i = 0; i < blobs.length; i++) {
            const b = blobs[i];
            b.aliveTime += dt;
            if (b.y > freezeHeatBelowY) {
                const heatIn = Math.exp(-Math.max(0, b.y) / hd) * state.heatGain * b.heatGainMul;
                b.temp = clamp(b.temp + (heatIn - state.cooling * b.coolingMul) * dt, 0, 1.6);
            }
            b.vy += (b.temp - neutral) * state.buoyancy * dt;

            const wanderDelta = Math.sin(t * b.wanderFreq + b.wanderPhase) * state.wander * b.wanderMul * dt;
            b.vx += wanderDelta;
            b.wanderVx += wanderDelta;

            if (state.turbulence > 0.001) {
                const sc = turbScale;
                const tt = t * turbFreq;
                const k1x = sc * 4.0, k1y = sc * 3.0;
                const k2x = sc * 9.0, k2y = -sc * 7.0;
                const mag1 = Math.sqrt(k1x * k1x + k1y * k1y);
                const mag2 = Math.sqrt(k2x * k2x + k2y * k2y);
                const p1 = k1x * b.x + k1y * b.y + tt * 1.1;
                const p2 = k2x * b.x + k2y * b.y + tt * 1.9;
                const c1 = Math.cos(p1);
                const c2 = Math.cos(p2);
                const tx = (k1y / mag1) * c1 + 0.5 * (k2y / mag2) * c2;
                const ty = -(k1x / mag1) * c1 - 0.5 * (k2x / mag2) * c2;
                b.vx += tx * state.turbulence * dt;
                b.vy += ty * state.turbulence * dt;
                b.turbX = tx;
                b.turbY = ty;
            } else {
                b.turbX = 0;
                b.turbY = 0;
            }
        }

        for (let i = 0; i < blobs.length; i++) {
            for (let j = i + 1; j < blobs.length; j++) {
                const a = blobs[i], b = blobs[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 1e-8) continue;
                const d = Math.sqrt(d2);
                const sumR = a.r + b.r;
                const nx = dx / d, ny = dy / d;

                if (state.cohesion > 0.001 && d < sumR * state.cohesionRange) {
                    const u = d / (sumR * state.cohesionRange);
                    const pull = (1 - u) * state.cohesion * dt;
                    a.vx += nx * pull; a.vy += ny * pull;
                    b.vx -= nx * pull; b.vy -= ny * pull;
                }
                if (state.repelStrength > 0.001 && d < sumR * state.repelRange) {
                    const u = d / (sumR * state.repelRange);
                    const push = (1 - u) * state.repelStrength * dt;
                    a.vx -= nx * push; a.vy -= ny * push;
                    b.vx += nx * push; b.vy += ny * push;
                }
            }
        }

        const SPRING_K = 30;
        const SPRING_D = 7;

        for (let i = blobs.length - 1; i >= 0; i--) {
            const b = blobs[i];
            b.vx *= dragK;
            b.vy *= dragK;
            b.wanderVx *= dragK;

            const maxSp = maxSpBase * b.maxSpeedMul;
            const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (sp > maxSp) {
                const scale = maxSp / sp;
                b.vx *= scale; b.vy *= scale; b.wanderVx *= scale;
            }

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            const margin = Math.min(b.r * 0.3, asp * 0.35);

            if (b.x < margin) {
                const vImpact = Math.abs(b.vx);
                b.x = margin;
                if (b.vx < 0) {
                    b.vx = -b.vx * wallRest;
                    b.wanderVx *= 0.5;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dyyV += kick;
                    b.dxxV -= kick;
                }
            }
            if (b.x > asp - margin) {
                const vImpact = Math.abs(b.vx);
                b.x = asp - margin;
                if (b.vx > 0) {
                    b.vx = -b.vx * wallRest;
                    b.wanderVx *= 0.5;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dyyV += kick;
                    b.dxxV -= kick;
                }
            }
            if (b.y > 0.97) {
                const vImpact = Math.abs(b.vy);
                b.y = 0.97;
                if (b.vy > 0) {
                    b.vy = -b.vy * wallRest;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dxxV += kick;
                    b.dyyV -= kick;
                }
            }

            if (!b.dying) {
                if (b.aliveTime > maxLifetime && b.temp > 0.01) b.temp = 0;
                if (b.aliveTime > 0.5 && b.y < deathY && b.vy < 0) b.dying = true;
            }

            if (b.dying) {
                b.r *= Math.exp(-shrinkRate * dt);
                if (b.r < 0.004) {
                    blobs.splice(i, 1);
                    continue;
                }
            } else if (b.r < b.targetR) {
                b.r = Math.min(b.targetR, b.r + (b.targetR / growTime) * dt);
            }

            if (!b.dying) {
                let txx = 1, txy = 0, tyy = 1;

                const svx = b.vx - b.wanderVx;
                const svy = b.vy;
                const svSp = Math.sqrt(svx * svx + svy * svy);
                if (svSp > 0.005) {
                    const vs = Math.min(1, svSp / 0.30) * state.squish * b.squishMul * 0.3;
                    const ux = svx / svSp, uy = svy / svSp;
                    txx += vs * ux * ux;
                    txy += vs * ux * uy;
                    tyy += vs * uy * uy;
                }

                if (wallSq > 0.001) {
                    const wr = b.r * 1.8;
                    if (b.x < wr) { const u = 1 - b.x / wr; tyy += u * u * wallSq; }
                    if (asp - b.x < wr) { const u = 1 - (asp - b.x) / wr; tyy += u * u * wallSq; }
                    if (0.97 - b.y < wr) { const u = 1 - (0.97 - b.y) / wr; txx += u * u * wallSq; }
                }

                const tdet = txx * tyy - txy * txy;
                if (tdet > 0.05) {
                    const n = 1 / Math.sqrt(tdet);
                    txx *= n; txy *= n; tyy *= n;
                }

                if (state.turbulence > 0.001) {
                    const tm = Math.sqrt(b.turbX * b.turbX + b.turbY * b.turbY);
                    if (tm > 0.001) {
                        const tnx = b.turbX / tm, tny = b.turbY / tm;
                        const kick = state.turbulence * dt * 25.0;
                        b.dxxV += kick * tnx * tnx;
                        b.dxyV += kick * tnx * tny;
                        b.dyyV += kick * tny * tny;
                    }
                }

                b.dxxV += (txx - b.dxx) * SPRING_K * dt;
                b.dxyV += (txy - b.dxy) * SPRING_K * dt;
                b.dyyV += (tyy - b.dyy) * SPRING_K * dt;
                const damp = Math.exp(-SPRING_D * dt);
                b.dxxV *= damp; b.dxyV *= damp; b.dyyV *= damp;
                b.dxx += b.dxxV * dt;
                b.dxy += b.dxyV * dt;
                b.dyy += b.dyyV * dt;

                clampDeformation(b);

                const tr = b.dxx + b.dyy;
                const det2 = b.dxx * b.dyy - b.dxy * b.dxy;
                const disc2 = Math.sqrt(Math.max(0, tr * tr * 0.25 - det2));
                const mu1 = Math.max(0.01, tr * 0.5 + disc2);
                const mu2 = Math.max(0.01, tr * 0.5 - disc2);
                b.stretch = clamp(Math.sqrt(mu1 / mu2), 1.0, 2.5);
                b.stretchAngle = 0.5 * Math.atan2(2 * b.dxy, b.dxx - b.dyy);
            }
        }

        if (blobs.length < target) {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = 1.0 / Math.max(0.1, state.spawnRate);
                const maxBatch = Math.max(1, Math.round(state.spawnBatch));
                const batch = 1 + Math.floor(Math.random() * maxBatch);
                for (let s = 0; s < batch && blobs.length < target; s++) {
                    const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
                    const rClamped = Math.max(0.008, r);
                    spawnBlob(rand(rClamped, Math.max(rClamped * 1.1, asp - rClamped)),
                              spawnY, rClamped, 0.9, 0.001);
                }
            }
        } else {
            spawnTimer = 0;
        }
    }

    function uploadBlobs() {
        blobData.fill(0);
        blobAngleData.fill(0);
        blobVelData.fill(0);
        const n = Math.min(blobs.length, MAX_BLOBS);
        let targetSum = 0;
        for (let i = 0; i < n; i++) {
            const b = blobs[i];
            blobData[i * 4 + 0] = b.x;
            blobData[i * 4 + 1] = b.y;
            blobData[i * 4 + 2] = b.r;
            blobData[i * 4 + 3] = b.stretch;
            blobAngleData[i] = b.stretchAngle;
            blobVelData[i * 2 + 0] = b.vx;
            blobVelData[i * 2 + 1] = b.vy;
            targetSum += b.targetR;
        }
        const targetAvg = n > 0 ? targetSum / n : state.blobSize;
        avgRadius += (targetAvg - avgRadius) * 0.08;
    }

    function render(t) {
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uniforms.time, t);
        gl.uniform1f(uniforms.aspect, canvas.width / Math.max(1, canvas.height));
        gl.uniform4fv(uniforms.blobs, blobData);
        gl.uniform1fv(uniforms.blobAngles, blobAngleData);
        gl.uniform2fv(uniforms.blobVelocities, blobVelData);
        gl.uniform1f(uniforms.blobRadiusAvg, avgRadius);
        gl.uniform1f(uniforms.fieldThreshold, Math.max(0.01, state.fieldThreshold));
        gl.uniform1f(uniforms.debugMode, state.debugMode ? 1 : 0);
        gl.uniform1f(uniforms.cohesionRange, state.cohesionRange);
        gl.uniform1f(uniforms.repelRange, state.repelRange);

        gl.uniform1f(uniforms.poolActive, state.poolActive ? 1 : 0);
        gl.uniform1f(uniforms.poolLevel, state.poolLevel);
        gl.uniform1f(uniforms.poolSoftness, Math.max(0.002, state.poolSoftness));
        gl.uniform1f(uniforms.poolWave, state.poolWave);
        gl.uniform1f(uniforms.poolWaveSpeed, state.poolWaveSpeed);

        var cA = hexToRgb(state.waxColorA);
        var cB = hexToRgb(state.waxColorB);
        var cG = hexToRgb(state.waxGlowColor);
        var cS = hexToRgb(state.sssColor);
        var cBgT = hexToRgb(state.bgTop);
        var cBgB = hexToRgb(state.bgBottom);
        var cGlow = hexToRgb(state.glowColor);
        var cSpec = hexToRgb(state.specColor);
        var cRef = hexToRgb(state.reflectColor);
        var cVig = hexToRgb(state.vignetteColor);

        gl.uniform3f(uniforms.waxA, cA[0], cA[1], cA[2]);
        gl.uniform3f(uniforms.waxB, cB[0], cB[1], cB[2]);
        gl.uniform3f(uniforms.waxGlowColor, cG[0], cG[1], cG[2]);
        gl.uniform1f(uniforms.waxGlow, state.waxGlow);

        gl.uniform3f(uniforms.sssColor, cS[0], cS[1], cS[2]);
        gl.uniform1f(uniforms.sssStrength, state.sssStrength);
        gl.uniform1f(uniforms.sssFalloff, Math.max(0.05, state.sssFalloff));

        gl.uniform3f(uniforms.bgTop, cBgT[0], cBgT[1], cBgT[2]);
        gl.uniform3f(uniforms.bgBottom, cBgB[0], cBgB[1], cBgB[2]);
        gl.uniform1f(uniforms.lampGlow, state.lampGlow);
        gl.uniform1f(uniforms.glowRadius, state.glowRadius);
        gl.uniform3f(uniforms.glowColor, cGlow[0], cGlow[1], cGlow[2]);
        gl.uniform1f(uniforms.halo, state.halo);
        gl.uniform1f(uniforms.haloWidth, Math.max(0.1, state.haloWidth));
        gl.uniform1f(uniforms.glassCurve, state.glassCurve);

        gl.uniform2f(uniforms.lightDir, Math.cos(state.lightAngle), Math.sin(state.lightAngle));
        gl.uniform3f(uniforms.specColor, cSpec[0], cSpec[1], cSpec[2]);
        gl.uniform1f(uniforms.specStrength, state.specStrength);
        gl.uniform1f(uniforms.specSharp, state.specSharp);
        gl.uniform1f(uniforms.softSpecStrength, state.softSpecStrength);
        gl.uniform1f(uniforms.softSpecSharp, Math.max(1, state.softSpecSharp));
        gl.uniform3f(uniforms.reflectColor, cRef[0], cRef[1], cRef[2]);
        gl.uniform1f(uniforms.reflectStrength, state.reflectStrength);
        gl.uniform1f(uniforms.reflectWidth, Math.max(0.1, state.reflectWidth));
        gl.uniform1f(uniforms.rimStrength, state.rimStrength);
        gl.uniform1f(uniforms.ambient, state.ambient);
        gl.uniform1f(uniforms.diffuse, state.diffuse);
        gl.uniform1f(uniforms.bump, state.bump);
        gl.uniform1f(uniforms.edgeSoft, state.edgeSoft);
        gl.uniform1f(uniforms.translucency, state.translucency);
        gl.uniform1f(uniforms.translucencyBias, state.translucencyBias);

        gl.uniform1f(uniforms.saturation, state.saturation);
        gl.uniform1f(uniforms.brightness, state.brightness);
        gl.uniform1f(uniforms.contrast, state.contrast);
        gl.uniform1f(uniforms.colorPow, state.colorPow);

        gl.uniform1f(uniforms.vignetteRadius, state.vignetteRadius);
        gl.uniform1f(uniforms.vignetteSoft, state.vignetteSoft);
        gl.uniform3f(uniforms.vignetteColor, cVig[0], cVig[1], cVig[2]);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    resetBlobs();

    var lastFrameTime = 0;
    var rafHandle = 0;
    let scaledTime = 0;

    function animate(now) {
        if (__destroyed) return;

        if (transitionActive) {
            const tn = Math.min(1, (now - transitionStart) / transitionDur);
            if (tn >= 1) {
                Object.keys(DEFAULTS).forEach(k => {
                    if (STANDALONE_KEYS[k]) return;
                    state[k] = transitionTarget[k];
                });
                transitionActive = false;
                refreshControlsUI();
            } else {
                const te = tn * tn * tn * (tn * (tn * 6 - 15) + 10);
                Object.keys(DEFAULTS).forEach(k => {
                    if (STANDALONE_KEYS[k]) return;
                    const a = transitionSource[k];
                    const b = transitionTarget[k];
                    if (typeof a === 'number' && typeof b === 'number' && !BOOL_KEYS[k]) {
                        let v = a + (b - a) * te;
                        if (INT_KEYS[k]) v = Math.round(v);
                        state[k] = v;
                    }
                });
                if ((now | 0) % 4 === 0) refreshControlsUI();
            }
        }

        if (state.autoMorph) {
            const morphMs = state.morphCycleTime * 1000;
            if (now - lastMorphTime >= morphMs) {
                lastMorphTime = now;
                loadPreset(Math.floor(Math.random() * PRESETS.length));
            }
        } else {
            lastMorphTime = now;
        }

        var frameInterval = 1000 / Math.max(1, state.targetFPS);

        if (now - lastFrameTime >= frameInterval) {
            const dtReal = lastFrameTime ? (now - lastFrameTime) / 1000 : 0.016;
            lastFrameTime = now;

            if (!state.freezeTime) {
                const dt = Math.min(dtReal, 0.05) * state.timeScale;
                if (dt > 0) {
                    scaledTime += dt;
                    stepPhysics(dt, scaledTime);
                }
            }

            uploadBlobs();
            render(scaledTime);
        }

        rafHandle = requestAnimationFrame(animate);
        window.animationFrameId = rafHandle;
    }

    function buildControlsUI() {
        const list = document.getElementById("controls-list");
        if (!list) return;
        list.innerHTML = "";

        function makeHeading(text, isFirst, group) {
            const head = document.createElement("div");
            head.className = "ctrl-row";
            head.style.gridColumn = "1 / -1";
            head.style.width = "100%";
            head.style.display = "flex";
            head.style.alignItems = "center";
            head.style.justifyContent = "flex-start";
            head.style.margin = "16px 0 6px 0";
            head.style.paddingTop = "12px";
            head.style.fontWeight = "bold";
            head.style.fontSize = "1.1em";
            head.style.color = "#ddd";
            if (!isFirst) head.style.borderTop = "1px solid #555";

            const indicator = document.createElement("span");
            indicator.style.marginRight = "6px";
            indicator.style.opacity = "0.6";
            indicator.style.fontSize = "0.9em";
            indicator.textContent = "▶";
            head.appendChild(indicator);

            const label = document.createElement("span");
            label.textContent = text;
            head.appendChild(label);

            const showExtras = (group.showExtras !== false);
            const btnBox = document.createElement("span");
            btnBox.style.display = showExtras ? "flex" : "none";
            btnBox.style.gap = "4px";
            btnBox.style.marginLeft = "auto";

            if (showExtras) {
                const randBtn = document.createElement("button");
                randBtn.className = "reset-btn";
                randBtn.textContent = "R";
                randBtn.title = "Randomise this group";
                randBtn.addEventListener("click", e => { e.stopPropagation(); randomiseGroup(group, randBtn); });

                const copyBtn = document.createElement("button");
                copyBtn.className = "reset-btn";
                copyBtn.textContent = "C";
                copyBtn.title = "Copy this group";
                copyBtn.addEventListener("click", e => { e.stopPropagation(); copyGroup(group, copyBtn); });

                const pasteBtn = document.createElement("button");
                pasteBtn.className = "reset-btn";
                pasteBtn.textContent = "P";
                pasteBtn.title = "Paste into this group";
                pasteBtn.addEventListener("click", e => { e.stopPropagation(); pasteGroup(group, pasteBtn); });

                btnBox.appendChild(randBtn);
                btnBox.appendChild(copyBtn);
                btnBox.appendChild(pasteBtn);
            }
            head.appendChild(btnBox);

            head.style.cursor = "pointer";
            head.style.userSelect = "none";
            return { head, indicator };
        }

        function makeControl(c, container) {
            const key = c.key;
            const current = state[key];
            const isInt = !!c.int;

            if (c.special === 'bool') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                const label = document.createElement("label");
                label.title = "[" + key + "] " + (c.details || "");
                label.style.gridColumn = "1";
                const iconSpan = document.createElement("span");
                iconSpan.style.display = "inline-block";
                iconSpan.style.width = "1.6em";
                iconSpan.style.textAlign = "center";
                iconSpan.style.marginRight = "2px";
                iconSpan.textContent = c.icon || "";
                label.appendChild(iconSpan);
                label.appendChild(document.createTextNode(c.label || key));

                const cb = document.createElement("input");
                cb.type = "checkbox";
                cb.checked = !!current;
                cb.dataset.key = key;
                cb.style.gridColumn = "2 / 4";
                cb.style.justifySelf = "start";
                cb.style.margin = "0";
                cb.addEventListener("change", () => {
                    state[key] = cb.checked ? 1 : 0;
                });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    cb.checked = !!c.def;
                });

                row.appendChild(label);
                row.appendChild(cb);
                row.appendChild(resetBtn);
                container.appendChild(row);
                return;
            }

            if (c.special === 'color') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                const label = document.createElement("label");
                label.title = "[" + key + "] " + (c.details || "");
                label.style.gridColumn = "1";
                const iconSpan = document.createElement("span");
                iconSpan.style.display = "inline-block";
                iconSpan.style.width = "1.6em";
                iconSpan.style.textAlign = "center";
                iconSpan.style.marginRight = "2px";
                iconSpan.textContent = c.icon || "";
                label.appendChild(iconSpan);
                label.appendChild(document.createTextNode(c.label || key));

                const colorInput = document.createElement("input");
                colorInput.type = "color";
                colorInput.value = current;
                colorInput.dataset.key = key;
                colorInput.style.gridColumn = "2 / 4";
                colorInput.style.width = "100%";
                colorInput.style.height = "100%";
                colorInput.style.padding = "0";
                colorInput.style.border = "none";
                colorInput.style.background = "transparent";
                colorInput.style.cursor = "pointer";
                colorInput.style.boxSizing = "border-box";
                colorInput.addEventListener("input", () => { state[key] = colorInput.value; });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    colorInput.value = c.def;
                });

                row.appendChild(label);
                row.appendChild(colorInput);
                row.appendChild(resetBtn);
                container.appendChild(row);
                return;
            }

            const row = document.createElement("div");
            row.className = "ctrl-row";
            const label = document.createElement("label");
            label.title = "[" + key + "] " + (c.details || "");
            label.style.gridColumn = "1";
            const iconSpan = document.createElement("span");
            iconSpan.style.display = "inline-block";
            iconSpan.style.width = "1.6em";
            iconSpan.style.textAlign = "center";
            iconSpan.style.marginRight = "2px";
            iconSpan.textContent = c.icon || "";
            label.appendChild(iconSpan);
            label.appendChild(document.createTextNode(c.label || key));

            const slider = document.createElement("input");
            slider.type = "range";
            slider.style.gridColumn = "2";
            slider.min = c.min; slider.max = c.max; slider.step = c.step;
            slider.value = current;
            slider.dataset.key = key;

            const number = document.createElement("input");
            number.type = "number";
            number.style.gridColumn = "3";
            number.step = c.step;
            number.value = isInt ? String(Math.round(current)) : fmtVal(current);
            number.dataset.key = key;

            const resetBtn = document.createElement("button");
            resetBtn.className = "reset-btn";
            resetBtn.textContent = "↺";
            resetBtn.style.gridColumn = "4";

            slider.addEventListener("input", () => {
                let v = parseFloat(slider.value);
                if (isInt) v = Math.round(v);
                state[key] = v;
                number.value = isInt ? String(v) : fmtVal(v);
            });

            number.addEventListener("change", () => {
                let v = parseFloat(number.value);
                if (isNaN(v)) { number.value = isInt ? String(Math.round(state[key])) : fmtVal(state[key]); return; }
                if (isInt) v = Math.round(v);
                v = Math.max(c.min, Math.min(c.max, v));
                state[key] = v;
                slider.value = v;
                number.value = isInt ? String(v) : fmtVal(v);
            });

            resetBtn.addEventListener("click", () => {
                state[key] = c.def;
                slider.value = c.def;
                number.value = isInt ? String(Math.round(c.def)) : fmtVal(c.def);
            });

            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(number);
            row.appendChild(resetBtn);
            container.appendChild(row);
        }

        CONTROLS.forEach((group, gi) => {
            const { head, indicator } = makeHeading(group.heading, gi === 0, group);
            const body = document.createElement("div");
            body.className = "ctrl-group-body";

            let initialCollapsed = !group.openByDefault;
            try {
                const saved = JSON.parse(localStorage.getItem("kaleidoCtrlGroupsCollapsed") || "{}");
                if (group.heading in saved) initialCollapsed = !!saved[group.heading];
            } catch (_) { }
            if (initialCollapsed) body.classList.add("collapsed");

            group.controls.forEach(c => makeControl(c, body));

            function syncIndicator() {
                indicator.textContent = body.classList.contains("collapsed") ? "▶" : "▼";
            }
            syncIndicator();

            head.addEventListener("click", e => {
                if (e.target.closest("button")) return;
                body.classList.toggle("collapsed");
                syncIndicator();
                try {
                    const map = JSON.parse(localStorage.getItem("kaleidoCtrlGroupsCollapsed") || "{}");
                    map[group.heading] = body.classList.contains("collapsed");
                    localStorage.setItem("kaleidoCtrlGroupsCollapsed", JSON.stringify(map));
                } catch (_) { }
            });

            list.appendChild(head);
            list.appendChild(body);
        });
    }

    function refreshControlsUI() {
        Object.keys(DEFAULTS).forEach(key => {
            const v = state[key];
            const isInt = !!INT_KEYS[key];
            const c = CONTROL_BY_KEY[key];
            if (!c) return;
            document.querySelectorAll('input[type=range][data-key="' + key + '"]').forEach(s => {
                s.min = c.min; s.max = c.max; s.step = c.step;
                s.value = isInt ? Math.round(v) : v;
            });
            document.querySelectorAll('input[type=number][data-key="' + key + '"]').forEach(n => {
                n.step = c.step;
                n.value = isInt ? String(Math.round(v)) : fmtVal(v);
            });
            document.querySelectorAll('input[type=checkbox][data-key="' + key + '"]').forEach(cb => {
                cb.checked = !!v;
            });
            document.querySelectorAll('input[type=color][data-key="' + key + '"]').forEach(ci => {
                if (document.activeElement !== ci) ci.value = v;
            });
        });
    }

    function isControlRandomisable(c) {
        if (c.canRandomise === false) return false;
        if (c.canRandomise === true) return true;
        if (c.special === 'bool' || c.special === 'color') return false;
        if (typeof c.min !== "number" || typeof c.max !== "number") return false;
        return true;
    }

    function randomiseGroup(group, btn) {
        if (!group || !group.controls) return;
        group.controls.forEach(c => {
            if (!isControlRandomisable(c)) return;
            let v;
            if (c.int) {
                const lo = Math.ceil(c.min), hi = Math.floor(c.max);
                v = lo + Math.floor(Math.random() * (hi - lo + 1));
            } else {
                v = c.min + Math.random() * (c.max - c.min);
                if (c.step > 0) {
                    v = c.min + Math.round((v - c.min) / c.step) * c.step;
                    if (v > c.max) v = c.max;
                    if (v < c.min) v = c.min;
                }
            }
            state[c.key] = v;
        });
        refreshControlsUI();
        if (btn) { const old = btn.textContent; btn.textContent = "✓"; setTimeout(() => { btn.textContent = old; }, 400); }
    }

    function copyGroup(group, btn) {
        const vals = {};
        group.controls.forEach(c => { vals[c.key] = deepClone(state[c.key]); });
        groupClipboard[group.heading] = vals;
        if (btn) { const old = btn.textContent; btn.textContent = "✓"; setTimeout(() => { btn.textContent = old; }, 400); }
    }

    function pasteGroup(group, btn) {
        const vals = groupClipboard[group.heading];
        if (!vals) {
            if (btn) { const old = btn.textContent; btn.textContent = "—"; setTimeout(() => { btn.textContent = old; }, 400); }
            return;
        }
        group.controls.forEach(c => {
            if (!(c.key in vals)) return;
            let v = deepClone(vals[c.key]);
            if (INT_KEYS[c.key]) v = Math.round(v);
            state[c.key] = v;
        });
        refreshControlsUI();
        if (btn) { const old = btn.textContent; btn.textContent = "✓"; setTimeout(() => { btn.textContent = old; }, 400); }
    }

    function buildPresetDropdown() {
        const sel = document.getElementById("preset-select");
        if (!sel) return;
        sel.innerHTML = "";
        PRESETS.forEach((p, idx) => {
            const opt = document.createElement("option");
            opt.value = idx;
            opt.textContent = (p.name || "Unnamed") + " (iter " + (p.iteration || "?") + ")";
            sel.appendChild(opt);
        });
    }

    function loadPreset(idx) {
        const p = PRESETS[idx];
        if (!p) return;

        const target = {};
        Object.keys(DEFAULTS).forEach(key => {
            if (STANDALONE_KEYS[key]) target[key] = state[key];
            else if (p.values && key in p.values) target[key] = deepClone(p.values[key]);
            else target[key] = deepClone(DEFAULTS[key]);
        });
        Object.keys(INT_KEYS).forEach(k => { target[k] = Math.round(target[k]); });

        Object.keys(DEFAULTS).forEach(k => {
            if (BOOL_KEYS[k] || COLOR_KEYS[k]) {
                if (!STANDALONE_KEYS[k]) state[k] = target[k];
            }
        });

        resetBlobs();

        const tTime = state.presetTransitionTime;
        if (tTime > 0) {
            transitionSource = Object.assign({}, state);
            transitionTarget = target;
            transitionActive = true;
            transitionStart = performance.now();
            transitionDur = tTime * 1000;
        } else {
            transitionActive = false;
            Object.keys(DEFAULTS).forEach(key => {
                if (STANDALONE_KEYS[key]) return;
                state[key] = target[key];
            });
            refreshControlsUI();
        }
    }

    function setupControlHandlers() {
        const toggle = document.getElementById("toggle-panel");
        if (toggle) {
            toggle.addEventListener("click", () => {
                const b = document.getElementById("controls-body");
                if (b) b.classList.toggle("collapsed");
            });
        }
        const loadBtn = document.getElementById("btn-load-preset");
        if (loadBtn) {
            loadBtn.addEventListener("click", () => {
                const sel = document.getElementById("preset-select");
                loadPreset(parseInt(sel.value, 10));
            });
        }
        const resetAll = document.getElementById("btn-reset-all");
        if (resetAll) {
            resetAll.addEventListener("click", () => {
                transitionActive = false;
                Object.keys(DEFAULTS).forEach(k => {
                    if (STANDALONE_KEYS[k]) return;
                    state[k] = deepClone(DEFAULTS[k]);
                });
                Object.keys(INT_KEYS).forEach(k => { state[k] = Math.round(state[k]); });
                resetBlobs();
                refreshControlsUI();
            });
        }
        const jsonBtn = document.getElementById("btn-json");
        if (jsonBtn) {
            jsonBtn.addEventListener("click", () => {
                let maxIter = 0;
                PRESETS.forEach(p => { if (p.iteration > maxIter) maxIter = p.iteration; });
                const nextIter = maxIter + 1;
                const vals = {};
                Object.keys(DEFAULTS).forEach(key => {
                    if (STANDALONE_KEYS[key]) return;
                    const v = INT_KEYS[key] ? Math.round(state[key]) : state[key];
                    if (JSON.stringify(v) !== JSON.stringify(DEFAULTS[key])) vals[key] = deepClone(v);
                });
                console.log(JSON.stringify({ name: "Preset " + nextIter, iteration: nextIter, values: vals }, null, 4));
            });
        }
    }

    function onKeyDown(e) {
        if (e.key === 'h' || e.key === 'H') {
            const p = document.getElementById('controls-panel');
            if (p) p.style.display = (p.style.display === 'none') ? '' : 'none';
        }
    }
    window.addEventListener('keydown', onKeyDown);

    buildControlsUI();
    buildPresetDropdown();
    setupControlHandlers();
    refreshControlsUI();

    rafHandle = requestAnimationFrame(animate);
    window.animationFrameId = rafHandle;

    window.__kaleidoApp = {
        destroy() {
            __destroyed = true;
            if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            Object.keys(CONTROL_BY_KEY).forEach(k => { delete CONTROL_BY_KEY[k]; });
            blobs.length = 0;
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

main();