function main() {
    let __destroyed = false;
    if (window.__lavalampApp && typeof window.__lavalampApp.destroy === 'function') {
        try { window.__lavalampApp.destroy(); } catch (e) { console.warn('lavalamp teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas[data-lavalamp]").forEach(c => c.remove());

    const MAX_BLOBS = 64;

    const CFG = {
        targetFPS: 60, presetTransitionTime: 3.0,
        freezeTime: 0, autoMorph: 0, morphCycleTime: 10.0,
        timeScale: 0.23,
        debugMode: 0,

        webcamActive: 0,
        webcamBgMix: 0.5,
        webcamReflectMix: 0.5,
        webcamInvertReflect: 0,
        webcamRoughness: 0.30,
        webcamParallax: 1.0,
        sceneRoughness: 0.0,

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
        reflectStrength: 0.0,
        reflectWidth: 3.0,
        reflectColor: '#ffffff',
        refractionStrength: 0.30,
        rimStrength: 1.01,
        reflectF0: 0.04,
        reflectPow: 5.0,
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

    // Merge character defaults (if the module loaded first)
    if (window.LavaCharacter) {
        Object.assign(CFG, window.LavaCharacter.defaults);
    }

    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                { icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true, label: "Target FPS", savedInPreset: false, details: "Framerate cap." },
                { icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 15, step: 0.1, label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over." },
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
                { icon: "📏", key: "blobSize", def: CFG.blobSize, min: 0.01, max: 0.32, step: 0.001, label: "Blob Size", details: "Base radius in screen-height units." },
                { icon: "🎲", key: "blobSizeVar", def: CFG.blobSizeVar, min: 0, max: 2, step: 0.1, label: "Size Variance", details: "Random spread of blob radius." },
                { icon: "🧬", key: "traitVariance", def: CFG.traitVariance, min: 0, max: 2, step: 0.01, label: "Trait Variance", details: "Individual blobs differ in heat gain, cooling, max speed, wander and squish." },
                { icon: "🎈", key: "buoyancy", def: CFG.buoyancy, min: 0.01, max: 5, step: 0.01, label: "Buoyancy", details: "Upward force from temperature." },
                { icon: "💨", key: "drag", def: CFG.drag, min: 0.01, max: 5, step: 0.01, label: "Drag", details: "Velocity damping." },
                { icon: "🔥", key: "heatGain", def: CFG.heatGain, min: 0.1, max: 5, step: 0.01, label: "Heat Gain", details: "Heat absorbed near the bulb." },
                { icon: "❄️", key: "cooling", def: CFG.cooling, min: 0.02, max: 3, step: 0.01, label: "Cooling Rate", details: "Heat lost per second." },
                { icon: "📏", key: "heatDepth", def: CFG.heatDepth, min: 0.02, max: 0.8, step: 0.005, label: "Heat Depth", details: "How far the bulb's heat reaches." },
                { icon: "🌡️", key: "tempNeutral", def: CFG.tempNeutral, min: 0, max: 2, step: 0.01, label: "Neutral Temp", details: "Temperature at which blobs neither rise nor sink." },
                { icon: "🚀", key: "maxSpeed", def: CFG.maxSpeed, min: 0.05, max: 3, step: 0.01, label: "Max Speed", details: "Velocity clamp." },
                { icon: "🌊", key: "wander", def: CFG.wander, min: 0, max: 2, step: 0.01, label: "Horizontal Wander", details: "Sideways drift. Movement only, no shape change." },
                { icon: "🫧", key: "squish", def: CFG.squish, min: 0, max: 2, step: 0.01, label: "Stretch from Speed", details: "Elongation along motion." },
                { icon: "💨", key: "turbulence", def: CFG.turbulence, min: 0, max: 3, step: 0.01, label: "Turbulence", details: "Swirling fluid forces that wobble the blobs like jelly." },
                { icon: "🌀", key: "turbulenceFreq", def: CFG.turbulenceFreq, min: 0.1, max: 10, step: 0.01, label: "Turbulence Freq", details: "How fast the turbulent flow varies over time." },
                { icon: "🔬", key: "turbulenceScale", def: CFG.turbulenceScale, min: 0.1, max: 10, step: 0.01, label: "Turbulence Scale", details: "Spatial frequency of the eddies." },
                { icon: "🧱", key: "wallSquish", def: CFG.wallSquish, min: 0, max: 5, step: 0.01, label: "Wall Squish", details: "How much blobs flatten against walls and ceiling." },
                { icon: "🏓", key: "wallRestitution", def: CFG.wallRestitution, min: 0, max: 1, step: 0.01, label: "Wall Bounce", details: "How much velocity is kept when bouncing off a wall." },
                { icon: "⬇️", key: "deathDepth", def: CFG.deathDepth, min: 0.05, max: 1.50, step: 0.01, label: "Death Depth", details: "How far below screen blobs sink before dissolving." },
                { icon: "🎯", key: "fieldThreshold", def: CFG.fieldThreshold, min: 0.1, max: 5, step: 0.01, label: "Metaball Threshold", details: "Isosurface level." },
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
                { icon: "☁️", key: "poolSoftness", def: CFG.poolSoftness, min: 0, max: 0.25, step: 0.001, label: "Pool Softness", details: "How quickly the pool field fades upward." },
                { icon: "🌊", key: "poolWave", def: CFG.poolWave, min: 0, max: 0.25, step: 0.0005, label: "Pool Wave", details: "Amplitude of the pool surface wave." },
                { icon: "⏱️", key: "poolWaveSpeed", def: CFG.poolWaveSpeed, min: -10, max: 10, step: 0.01, label: "Pool Wave Speed", details: "How fast the surface wave travels." },
            ]
        },
        {
            heading: "🎨 Wax Colour", openByDefault: true, controls: [
                { icon: "🅰️", key: "waxColorA", def: CFG.waxColorA, special: "color", label: "Wax Colour A", details: "Lower wax colour." },
                { icon: "🅱️", key: "waxColorB", def: CFG.waxColorB, special: "color", label: "Wax Colour B", details: "Upper wax colour." },
                { icon: "💡", key: "waxGlow", def: CFG.waxGlow, min: 0, max: 3, step: 0.01, label: "Bulb Reach", details: "How strongly the bulb illuminates the wax surface." },
                { icon: "🎨", key: "waxGlowColor", def: CFG.waxGlowColor, special: "color", label: "Bulb Tint", details: "Colour of the light reaching the wax surface." },
                { icon: "🌈", key: "sssColor", def: CFG.sssColor, special: "color", label: "SSS Colour", details: "The wax's internal scattered light colour." },
                { icon: "🔆", key: "sssStrength", def: CFG.sssStrength, min: -1, max: 5, step: 0.01, label: "SSS Strength", details: "Intensity of subsurface light transmitted through the wax." },
                { icon: "🌫️", key: "sssFalloff", def: CFG.sssFalloff, min: -1, max: 10, step: 0.01, label: "SSS Falloff", details: "How quickly light dies through the wax." },
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
                { icon: "🪞", key: "reflectStrength", def: CFG.reflectStrength, min: -1, max: 5, step: 0.01, label: "Reflection", details: "Screen-space reflection of the actual scene (previous frame). Reflects other blobs, the pool, and the bulb." },
                { icon: "🌐", key: "reflectWidth", def: CFG.reflectWidth, min: -5, max: 25, step: 0.1, label: "Reflection Reach", details: "How far to sample in the reflected direction. Higher = reaches further afield." },
                { icon: "🎨", key: "reflectColor", def: CFG.reflectColor, special: "color", label: "Reflection Tint", details: "Tint of the reflected scene. White = pure reflection." },
                { icon: "🌟", key: "rimStrength", def: CFG.rimStrength, min: -2, max: 5, step: 0.01, label: "Rim Light", details: "Edge glow." },
                { icon: "🎯", key: "reflectF0", def: CFG.reflectF0, min: 0, max: 0.5, step: 0.005, label: "Reflectivity (F0)", details: "Reflectance head-on. Realistic dielectrics (wax, glass, water) are 0.02–0.05; higher values make reflection visible everywhere instead of just at grazing angles." },
                { icon: "📐", key: "reflectPow", def: CFG.reflectPow, min: 1, max: 10, step: 0.1, label: "Fresnel Sharpness", details: "How quickly reflection ramps toward the rim. 5 = Schlick standard for dielectrics. Higher = tighter rim-only reflection." },
                { icon: "🌫️", key: "sceneRoughness", def: CFG.sceneRoughness, min: 0, max: 1, step: 0.01, label: "Scene Reflection Blur", details: "Blur width of the screen-space scene reflection. 0 = sharp mirror (cheapest). Adds multi-tap cost per pixel." },
                { icon: "🌥️", key: "ambient", def: CFG.ambient, min: -2, max: 3, step: 0.01, label: "Ambient", details: "Base wax illumination." },
                { icon: "☀️", key: "diffuse", def: CFG.diffuse, min: -2, max: 3, step: 0.01, label: "Diffuse", details: "Directional wax illumination." },
                { icon: "🪨", key: "bump", def: CFG.bump, min: -2, max: 5, step: 0.01, label: "Surface Roundness", details: "1.0 = physical dome." },
                { icon: "🖊️", key: "edgeSoft", def: CFG.edgeSoft, min: -1, max: 2, step: 0.005, label: "Edge Softness", details: "Anti-aliasing width." },
            ]
        },
        {
            heading: "💎 Translucency", openByDefault: true, controls: [
                { icon: "🔮", key: "translucency", def: CFG.translucency, min: -1, max: 5, step: 0.01, label: "Translucency", details: "Overall see-through quality of the wax." },
                { icon: "🌅", key: "translucencyBias", def: CFG.translucencyBias, min: -1, max: 2, step: 0.01, label: "Translucency Bias", details: "0 = uniform transparency. 1 = transparent only at edges." },
                { icon: "🔬", key: "refractionStrength", def: CFG.refractionStrength, min: -2, max: 2, step: 0.01, label: "Refraction", details: "Bends the background seen through the transparent wax along the surface normal. Negative flips the bend direction." }
            ]
        },
        {
            heading: "🫙 Liquid & Glass", openByDefault: false, controls: [
                { icon: "🌌", key: "bgTop", def: CFG.bgTop, special: "color", label: "Liquid Top", details: "Liquid colour at top." },
                { icon: "🌆", key: "bgBottom", def: CFG.bgBottom, special: "color", label: "Liquid Bottom", details: "Liquid colour at bottom." },
                { icon: "💡", key: "lampGlow", def: CFG.lampGlow, min: 0, max: 10, step: 0.01, label: "Lamp Glow", details: "Bulb glow through liquid." },
                { icon: "⭕", key: "glowRadius", def: CFG.glowRadius, min: -2, max: 5, step: 0.01, label: "Glow Radius", details: "Falloff distance of the glow." },
                { icon: "🎨", key: "glowColor", def: CFG.glowColor, special: "color", label: "Glow Colour", details: "Bulb colour." },
                { icon: "🌈", key: "halo", def: CFG.halo, min: -2, max: 5, step: 0.01, label: "Wax Halo", details: "Light bleeding from wax into liquid." },
                { icon: "📐", key: "haloWidth", def: CFG.haloWidth, min: -1, max: 10, step: 0.05, label: "Halo Width", details: "Higher = tighter halo." },
                { icon: "🫙", key: "glassCurve", def: CFG.glassCurve, min: -1, max: 5, step: 0.01, label: "Glass Curve", details: "Darkening at the glass edges." },
            ]
        },
        {
            heading: "📷 Webcam", openByDefault: false, controls: [
                { icon: "📷", key: "webcamActive", def: CFG.webcamActive, special: "bool", savedInPreset: false, label: "Enable Webcam", details: "Show webcam feed in the background and reflection. Standalone — not saved in presets." },
                { icon: "🌅", key: "webcamBgMix", def: CFG.webcamBgMix, min: 0, max: 1, step: 0.01, label: "Background Mix", details: "How much the webcam replaces the liquid gradient in the background. Visible through the wax via translucency." },
                { icon: "🪞", key: "webcamReflectMix", def: CFG.webcamReflectMix, min: 0, max: 5, step: 0.01, label: "Reflection Strength", details: "How much webcam is added on top of the screen-space scene reflection. Independent of the scene reflection so both can contribute." },
                { icon: "🔄", key: "webcamInvertReflect", def: CFG.webcamInvertReflect, special: "bool", savedInPreset: false, label: "Invert Reflection", details: "Flip the mirror direction of the webcam reflection. Only the webcam contribution flips; scene reflection is unchanged." },
                { icon: "🌫️", key: "webcamRoughness", def: CFG.webcamRoughness, min: 0, max: 1, step: 0.01, label: "Reflection Roughness", details: "Blur width of the webcam reflection. 0 = sharp mirror, 1 = soft blur. Cheap multi-tap." },
                { icon: "↔️", key: "webcamParallax", def: CFG.webcamParallax, min: 0, max: 5, step: 0.01, label: "Reflection Parallax", details: "Multiplier on the mirror offset for the webcam reflection. Larger = reflection slides more across the surface as the normal tilts." }
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

    if (window.LavaCharacter) {
        CONTROLS.push(window.LavaCharacter.controlsGroup);
    }

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

        {
            "name": "Preset 24",
            "iteration": 24,
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
        },
        {
            "name": "Vampire Bites",
            "iteration": 26,
            "values": {
                "timeScale": 0.15,
                "traitVariance": 1,
                "squish": 0.73,
                "turbulence": 0.58,
                "turbulenceScale": 3.02,
                "wallSquish": 2.73,
                "poolLevel": 0.126,
                "poolSoftness": 0.107,
                "waxColorA": "#ff2200",
                "waxColorB": "#e00000",
                "waxGlowColor": "#ff0000",
                "sssColor": "#ff004c",
                "sssStrength": 3,
                "sssFalloff": 0.99,
                "reflectStrength": 0.61,
                "reflectWidth": 8,
                "translucency": 1.84,
                "translucencyBias": 1,
                "halo": 0.42,
                "haloWidth": 4.4
            }
        },
        {
            "name": "Cloud City",
            "iteration": 26,
            "values": {
                "timeScale": 0.15,
                "traitVariance": 1,
                "squish": 0.73,
                "turbulence": 0.58,
                "turbulenceScale": 3.02,
                "wallSquish": 2.73,
                "poolLevel": 0.126,
                "poolSoftness": 0.107,
                "waxColorA": "#ffffff",
                "waxColorB": "#0096e0",
                "waxGlowColor": "#ff0000",
                "sssColor": "#ff004c",
                "sssStrength": 3,
                "sssFalloff": 0.99,
                "reflectStrength": 0.61,
                "reflectWidth": 8,
                "translucency": 1.84,
                "translucencyBias": 1,
                "bgTop": "#28e2d5",
                "bgBottom": "#b2f0c3",
                "halo": 0.42,
                "haloWidth": 4.4
            }
        },
        {
            "name": "Milky Milky",
            "iteration": 27,
            "values": {
                "timeScale": 0.15,
                "blobSize": 0.072,
                "traitVariance": 0.37,
                "heatGain": 1.86,
                "squish": 0.73,
                "turbulence": 0.73,
                "turbulenceFreq": 2.42,
                "turbulenceScale": 2.53,
                "wallSquish": 2.73,
                "fieldThreshold": 0.59,
                "cohesion": 1.21,
                "cohesionRange": 1.52,
                "repelStrength": 1.8,
                "repelRange": 0.91,
                "poolLevel": 0.126,
                "poolSoftness": 0.018,
                "waxColorA": "#ffffff",
                "waxColorB": "#ffffff",
                "waxGlowColor": "#2f2323",
                "sssColor": "#e5e28f",
                "sssStrength": 3,
                "sssFalloff": 0.99,
                "lightAngle": -1.87159,
                "specStrength": 0,
                "specSharp": 24,
                "softSpecStrength": 0.33,
                "softSpecSharp": 19.5,
                "reflectStrength": 0,
                "reflectWidth": 0.5,
                "translucency": 1.39,
                "translucencyBias": 1,
                "bgTop": "#ffffff",
                "bgBottom": "#fdffe5",
                "lampGlow": 2.1,
                "glowRadius": 0.4,
                "glowColor": "#190f0a",
                "halo": 0.42,
                "haloWidth": 4.4
            }
        }, {
            "name": "Bluedrops",
            "iteration": 27,
            "values": {
                "timeScale": 0.15,
                "blobSize": 0.047,
                "blobSizeVar": 0.4,
                "traitVariance": 0.37,
                "heatGain": 1.86,
                "squish": 0.73,
                "turbulence": 0.73,
                "turbulenceFreq": 2.42,
                "turbulenceScale": 2.53,
                "wallSquish": 2.73,
                "fieldThreshold": 0.59,
                "cohesion": 0.89,
                "cohesionRange": 1.42,
                "repelStrength": 1.6,
                "repelRange": 0.75,
                "poolLevel": 0.058,
                "poolSoftness": 0.084,
                "poolWave": 0.01,
                "poolWaveSpeed": 2.54,
                "waxColorA": "#57a26a",
                "waxColorB": "#13b6fb",
                "waxGlow": 1.03,
                "waxGlowColor": "#2f2323",
                "sssColor": "#e5e28f",
                "sssStrength": 0.27,
                "sssFalloff": 0.1,
                "lightAngle": -1.43159,
                "specStrength": 0,
                "specSharp": 2,
                "softSpecStrength": 0.94,
                "softSpecSharp": 1,
                "reflectStrength": 0,
                "reflectWidth": 0.5,
                "edgeSoft": 0.325,
                "translucency": 0.34,
                "translucencyBias": 1,
                "bgTop": "#fe0606",
                "bgBottom": "#000000",
                "lampGlow": 1.74,
                "glowRadius": 1.21,
                "glowColor": "#be4204",
                "halo": 3,
                "haloWidth": 4.2
            }
        },
        {
            "name": "Mars Attacks",
            "iteration": 27,
            "values": {
                "timeScale": 0.15,
                "blobSize": 0.047,
                "blobSizeVar": 0.4,
                "traitVariance": 0.37,
                "heatGain": 1.86,
                "squish": 0.73,
                "turbulence": 0.73,
                "turbulenceFreq": 2.42,
                "turbulenceScale": 2.53,
                "wallSquish": 2.73,
                "fieldThreshold": 0.59,
                "cohesion": 0.89,
                "cohesionRange": 1.42,
                "repelStrength": 1.6,
                "repelRange": 0.75,
                "poolLevel": 0.134,
                "poolSoftness": 0.105,
                "poolWave": 0.0175,
                "poolWaveSpeed": 2.61,
                "waxColorA": "#b5990d",
                "waxColorB": "#fbff00",
                "waxGlow": 1.03,
                "waxGlowColor": "#2f2323",
                "sssColor": "#e5e28f",
                "sssStrength": 0.27,
                "sssFalloff": 0.1,
                "lightAngle": -1.43159,
                "specStrength": 0,
                "specSharp": 2,
                "softSpecStrength": 0.94,
                "softSpecSharp": 1,
                "reflectStrength": 2,
                "reflectWidth": 6.9,
                "ambient": 0.16,
                "diffuse": 0.16,
                "bump": 1.41,
                "edgeSoft": 0.325,
                "translucency": 0.34,
                "translucencyBias": 1,
                "bgTop": "#fe0606",
                "bgBottom": "#000000",
                "lampGlow": 1.74,
                "glowRadius": 1.21,
                "glowColor": "#ff5900",
                "halo": 3,
                "haloWidth": 4.2,
                "saturation": 1.37,
                "brightness": 0.57
            }
        },
        {
            "name": "Magnetic Storms",
            "iteration": 27,
            "values": {
                "timeScale": 0.15,
                "traitVariance": 0.37,
                "heatGain": 1.86,
                "squish": 0.73,
                "turbulence": 0.73,
                "turbulenceFreq": 2.42,
                "turbulenceScale": 2.53,
                "wallSquish": 2.73,
                "fieldThreshold": 0.59,
                "poolLevel": 0.134,
                "poolSoftness": 0.105,
                "poolWave": 0.0175,
                "poolWaveSpeed": 2.61,
                "waxColorA": "#b5990d",
                "waxColorB": "#fbff00",
                "waxGlow": 1.03,
                "waxGlowColor": "#2f2323",
                "sssColor": "#e5e28f",
                "sssStrength": 0.27,
                "sssFalloff": 0.1,
                "lightAngle": -1.43159,
                "specStrength": 0,
                "specSharp": 2,
                "softSpecStrength": 0.94,
                "softSpecSharp": 1,
                "reflectStrength": 2,
                "reflectWidth": 6.9,
                "ambient": 0.16,
                "diffuse": 0.16,
                "bump": 1.41,
                "edgeSoft": 0.455,
                "translucency": 0.34,
                "translucencyBias": 0.32,
                "bgTop": "#fe0606",
                "bgBottom": "#000000",
                "lampGlow": 1.74,
                "glowRadius": 1.21,
                "glowColor": "#ff5900",
                "halo": 3,
                "haloWidth": 4.2,
                "saturation": 1.37,
                "brightness": 0.87,
                "contrast": 0.63,
                "colorPow": 1.61
            }
        },
        {
            "name": "Coal Mine",
            "iteration": 27,
            "values": {
                "timeScale": 0.27,
                "blobSize": 0.056,
                "traitVariance": 1,
                "buoyancy": 2.31,
                "heatGain": 1.62,
                "squish": 0.73,
                "turbulence": 1,
                "turbulenceScale": 1.49,
                "wallSquish": 2.73,
                "poolLevel": 0.11,
                "poolSoftness": 0.017,
                "waxColorA": "#000000",
                "waxColorB": "#000000",
                "waxGlow": 0,
                "waxGlowColor": "#ffffff",
                "sssColor": "#000000",
                "sssStrength": 0,
                "sssFalloff": 0.1,
                "specStrength": 0.56,
                "softSpecStrength": 0,
                "softSpecSharp": 1,
                "reflectStrength": 0,
                "reflectWidth": 0.5,
                "bump": 0.93,
                "edgeSoft": 0.01,
                "translucency": 0,
                "translucencyBias": 0,
                "bgTop": "#000000",
                "bgBottom": "#000000",
                "lampGlow": 0,
                "glowRadius": 0.05,
                "glowColor": "#ffffff",
                "halo": 0.58,
                "haloWidth": 6
            }
        },
        {
            "name": "Oil Slick",
            "iteration": 27,
            "values": {
                "timeScale": 0.27,
                "blobSize": 0.056,
                "traitVariance": 1,
                "buoyancy": 2.31,
                "heatGain": 1.62,
                "wander": 0.14,
                "squish": 0.73,
                "turbulence": 1,
                "turbulenceScale": 1.49,
                "wallSquish": 2.73,
                "poolLevel": 0.11,
                "poolSoftness": 0.036,
                "waxColorA": "#000000",
                "waxColorB": "#000000",
                "waxGlow": 0,
                "waxGlowColor": "#ffffff",
                "sssColor": "#000000",
                "sssStrength": 0,
                "sssFalloff": 0.1,
                "specStrength": 2.22,
                "specSharp": 168,
                "softSpecStrength": 0,
                "softSpecSharp": 1,
                "reflectStrength": 0,
                "reflectWidth": 0.5,
                "bump": 0.4,
                "edgeSoft": 0.01,
                "translucency": 0,
                "translucencyBias": 0,
                "bgTop": "#ffffff",
                "bgBottom": "#5c5c5c",
                "lampGlow": 0,
                "glowRadius": 0.74,
                "glowColor": "#ffffff",
                "halo": 0.3,
                "haloWidth": 3.3
            }
        },

        {
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
            "name": "📷 Blackhole Sun ",
            "iteration": 28,
            "values": {
                "poolSoftness": 0.083,
                "reflectF0": 0.03,
                "bump": 5,
                "translucency": 0.45,
                "refractionStrength": 1.27,
                "webcamBgMix": 0.3,
                "webcamReflectMix": 5,
                "webcamRoughness": 0.9,
                "webcamParallax": 1.26
            }
        },
        {
            "name": "📷 Mercury Rising",
            "iteration": 29,
            "values": {
                "timeScale": 0.27,
                "blobSize": 0.056,
                "traitVariance": 1,
                "buoyancy": 2.31,
                "heatGain": 1.62,
                "wander": 0.14,
                "squish": 0.73,
                "turbulence": 1,
                "turbulenceScale": 1.49,
                "wallSquish": 2.73,
                "poolLevel": 0.11,
                "poolSoftness": 0.036,
                "waxColorA": "#000000",
                "waxColorB": "#000000",
                "waxGlow": 0,
                "waxGlowColor": "#ffffff",
                "sssColor": "#000000",
                "sssStrength": 0,
                "sssFalloff": 0.1,
                "specStrength": 2.22,
                "specSharp": 168,
                "softSpecStrength": 0,
                "softSpecSharp": 1,
                "reflectStrength": 1.67,
                "reflectWidth": 0.8,
                "reflectF0": 0.09,
                "reflectPow": 1.5,
                "sceneRoughness": 0.18,
                "bump": 0.4,
                "edgeSoft": 0.01,
                "translucency": -1,
                "translucencyBias": 0,
                "bgTop": "#000000",
                "bgBottom": "#2e2e2e",
                "lampGlow": 1.21,
                "glowRadius": 0.26,
                "glowColor": "#ffffff",
                "halo": 0.3,
                "haloWidth": 2.35,
                "webcamBgMix": 0,
                "webcamReflectMix": 5,
                "webcamRoughness": 0.24,
                "webcamParallax": 5
            }
        },

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
        { name: "Glass Wax", iteration: 23, values: { reflectStrength: 1.2, reflectWidth: 2.5, translucency: 1.2, translucencyBias: 0.3, specStrength: 2.0, specSharp: 150, sssStrength: 0.6 } },
        { name: "Enamel", iteration: 24, values: { reflectStrength: 1.0, reflectWidth: 4.0, translucency: 0.0, specStrength: 2.5, specSharp: 180, softSpecStrength: 0.15 } },
    ];

    function fmtVal(v) {
        if (typeof v !== "number" || !isFinite(v)) return "0";
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
    function lerpHex(a, b, t) {
        const ca = hexToRgb(a);
        const cb = hexToRgb(b);
        const r = Math.round((ca[0] + (cb[0] - ca[0]) * t) * 255);
        const g = Math.round((ca[1] + (cb[1] - ca[1]) * t) * 255);
        const bl = Math.round((ca[2] + (cb[2] - ca[2]) * t) * 255);
        const to2 = v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
        return '#' + to2(r) + to2(g) + to2(bl);
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
    try { userPresets = JSON.parse(localStorage.getItem('lavalampUserPresets') || '[]'); } catch (_) { userPresets = []; }
    userPresets.forEach(p => PRESETS.push(p));

    var canvas = document.createElement("canvas");
    canvas.setAttribute('data-lavalamp', '1');
    var content = document.getElementById("content");
    canvas.style.position = 'fixed';
    canvas.style.zIndex = -1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    content.appendChild(canvas);

    // Character overlay (2D canvas, drawn on top of the WebGL canvas)
    var charCanvas = null;
    var charCtx    = null;
    if (window.LavaCharacter) {
        charCanvas = document.createElement("canvas");
        charCanvas.setAttribute('data-lavalamp-char', '1');
        charCanvas.style.position = 'fixed';
        charCanvas.style.zIndex = '-1';
        charCanvas.style.top = '0';
        charCanvas.style.left = '0';
        charCanvas.style.pointerEvents = 'none';
        content.appendChild(charCanvas);
        charCtx = charCanvas.getContext('2d');
        window.LavaCharacter.resetAllInstances();   // start with one character
    }

    // === WebGL 2 context ===
    var gl = canvas.getContext('webgl2', { preserveDrawingBuffer: false, alpha: false, antialias: false, depth: false });
    if (!gl) { console.log('WebGL 2 not supported'); return; }

    var program = null;
    var uniforms = {};
    var debugProgram = null;
    var debugUniforms = {};

    let activeProgram = null;
    let activeUniforms = null;
    let activeIsDebug = false;
    let lastUploaded = {};

    // === Screen-space reflection infrastructure ===
    let sceneFBOs = [null, null];
    let sceneTexs = [null, null];
    let currentSceneIdx = 0;

    // === Webcam state ===
    let webcamVideo = null;
    let webcamStream = null;
    let webcamReady = false;
    let webcamWanted = false;
    let webcamAspect = 1.0;
    let webcamTex = null;

    function createSceneTarget(w, h) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { fbo, tex };
    }

    function rebuildSceneTargets() {
        if (!program) return;
        for (let i = 0; i < 2; i++) {
            if (sceneFBOs[i]) { gl.deleteFramebuffer(sceneFBOs[i]); sceneFBOs[i] = null; }
            if (sceneTexs[i]) { gl.deleteTexture(sceneTexs[i]); sceneTexs[i] = null; }
        }
        const a = createSceneTarget(canvas.width, canvas.height);
        const b = createSceneTarget(canvas.width, canvas.height);
        sceneFBOs[0] = a.fbo; sceneTexs[0] = a.tex;
        sceneFBOs[1] = b.fbo; sceneTexs[1] = b.tex;
        currentSceneIdx = 0;
    }

    let cachedAspect = 1;
    function resizeCanvas() {
        canvas.width = Math.max(1, window.innerWidth);
        canvas.height = Math.max(1, window.innerHeight);
        cachedAspect = canvas.width / Math.max(1, canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);
        rebuildSceneTargets();

        if (charCanvas) {
            charCanvas.width = canvas.width;
            charCanvas.height = canvas.height;
            charCanvas.style.width = canvas.width + 'px';
            charCanvas.style.height = canvas.height + 'px';
        }
    }

    // === Webcam ===
    function createWebcamTexture() {
        webcamTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webcamTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function startWebcam() {
        if (webcamStream) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Webcam not supported by this browser');
            state.webcamActive = 0;
            refreshControlsUI();
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                if (!webcamWanted) { stream.getTracks().forEach(t => t.stop()); return; }
                webcamStream = stream;
                webcamVideo = document.createElement('video');
                webcamVideo.srcObject = stream;
                webcamVideo.autoplay = true;
                webcamVideo.playsInline = true;
                webcamVideo.muted = true;
                webcamVideo.addEventListener('loadeddata', () => {
                    if (webcamVideo && webcamVideo.videoWidth > 0) {
                        webcamAspect = webcamVideo.videoWidth / Math.max(1, webcamVideo.videoHeight);
                    }
                    webcamReady = true;
                });
                webcamVideo.play().catch(e => console.warn('webcam play:', e));
            })
            .catch(e => {
                console.warn('webcam getUserMedia:', e);
                state.webcamActive = 0;
                refreshControlsUI();
            });
    }

    function stopWebcam() {
        webcamReady = false;
        if (webcamStream) {
            webcamStream.getTracks().forEach(t => t.stop());
            webcamStream = null;
        }
        if (webcamVideo) {
            try { webcamVideo.pause(); } catch (_) { }
            webcamVideo.srcObject = null;
            webcamVideo = null;
        }
    }

    // === GLSL ES 3.00 vertex shader (shared by both programs) ===
    var vertexShaderSource = `#version 300 es
        in vec2 position;
        out vec2 v_texCoord;
        void main() {
            v_texCoord = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // === Shared fragment-shader body. The DEBUG block is included only when
    //     DEBUG is defined (debug program); the non-debug program compiles
    //     without it, saving the dead-code branch and half the code size. ===
    var fragmentShaderBody = `
        precision highp float;
        precision highp int;
        in vec2 v_texCoord;
        out vec4 fragColor;

        uniform sampler2D reflectionTex;
        uniform sampler2D webcamTex;
        uniform float webcamActive;
        uniform float webcamBgMix;
        uniform float webcamReflectMix;
        uniform float webcamAspect;
        uniform float webcamRoughness;
        uniform float webcamParallax;
        uniform float webcamInvertReflect;
        uniform float refractionStrength;
        
        uniform float time;
        uniform float aspect;
        uniform vec4  blobs[${MAX_BLOBS}];
        uniform float blobAngles[${MAX_BLOBS}];
        uniform vec2  blobVelocities[${MAX_BLOBS}];
        uniform float blobRadiusAvg;
        uniform float fieldThreshold;
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
        uniform float reflectF0;
        uniform float reflectPow;
        uniform float sceneRoughness;
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

        // "Cover" UV mapping: fills the screen while preserving webcam aspect ratio.
        vec2 coverUV(vec2 uv, float screenAspect, float videoAspect) {
            if (screenAspect > videoAspect) {
                return vec2(uv.x, (uv.y - 0.5) * (videoAspect / screenAspect) + 0.5);
            } else {
                return vec2((uv.x - 0.5) * (screenAspect / videoAspect) + 0.5, uv.y);
            }
        }

        void main() {
            vec2 p = vec2(v_texCoord.x * aspect, v_texCoord.y);

            float fadeHi = poolActive > 0.5 ? poolLevel : 0.02;
            float fadeLo = fadeHi - 0.15;

            #ifdef DEBUG
            {
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

                // --- Metaball surface contour (navy blue) ---
                // Reconstructs the merged field at p and draws a thin line
                // wherever it crosses the isosurface threshold.
                {
                    float fdbg = 0.0;
                    if (poolActive > 0.5) {
                        float tW = time * poolWaveSpeed;
                        float ph = poolWave * (0.6 * sin(p.x * 7.0 + tW * 0.55)
                                             + 0.4 * sin(p.x * 13.0 - tW * 0.90));
                        float surf = poolLevel - poolSoftness * 2.07944 + ph;
                        float dm   = max(p.y - surf, 0.0);
                        float soft = max(poolSoftness, 0.001);
                        fdbg += 8.0 * exp(-dm / soft);
                    }
                    for (int i = 0; i < ${MAX_BLOBS}; i++) {
                        vec4 b = blobs[i];
                        if (b.z < 1e-5) continue;
                        float yFade = smoothstep(fadeLo, fadeHi, b.y);
                        if (yFade < 0.001) continue;
                        float sy  = max(b.w, 1.0);
                        float ang = blobAngles[i];
                        float ca = cos(ang), sa = sin(ang);
                        vec2 q  = p - b.xy;
                        vec2 qr = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca);
                        vec2 qt = vec2(qr.x / sy, qr.y * sy);
                        float d2 = dot(qt, qt) + 1e-4;
                        fdbg += (b.z * b.z * yFade) / d2;
                    }
                    float isoDist = abs(fdbg - fieldThreshold);
                    float isoW    = max(0.003, fieldThreshold * 0.03);
                    float isoLine = 1.0 - smoothstep(0.0, isoW, isoDist);
                    dbg = mix(dbg, vec3(0.5, 0.5, 0.5), isoLine);   // navy blue
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

                fragColor = vec4(dbg, 1.0);
                return;
            }
            #endif

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

            waxLit += mix(waxB, vec3(1.0), 0.5) * rim * rimStrength * 0.5;

            float waxDepth = max(0.0, (f - fieldThreshold) / fieldThreshold);
            float transmission = exp(-waxDepth * sssFalloff);
            float bulbFacing = max(0.0, -N.y);
            waxLit += sssColor * bulbFacing * transmission * lampL * sssStrength;
            waxLit += mix(sssColor, waxB, 0.4) * transmission * rim * sssStrength * 0.4;

            // === ENVIRONMENTAL REFLECTION (screen-space scene + optional webcam) ===
            float Nz = clamp(N.z, 0.0, 1.0);
            float F0 = max(reflectF0, 0.001);
            float fresnel = F0 + (1.0 - F0) * pow(1.0 - Nz, max(reflectPow, 1.0));
            vec2 mirrorOffset = vec2(N.x / aspect, N.y) * (reflectWidth * 0.06);
            vec2 mirrorUV = v_texCoord + mirrorOffset;

            // Scene reflection (optional roughness blur; zero cost at roughness 0)
            vec3 sceneReflected;
            if (sceneRoughness > 0.001) {
                float r = sceneRoughness * 0.012;
                vec2 du = vec2(r / aspect, 0.0);
                vec2 dv = vec2(0.0, r);
                vec3 s = texture(reflectionTex, mirrorUV).rgb;
                s += texture(reflectionTex, mirrorUV + du).rgb;
                s += texture(reflectionTex, mirrorUV - du).rgb;
                s += texture(reflectionTex, mirrorUV + dv).rgb;
                s += texture(reflectionTex, mirrorUV - dv).rgb;
                sceneReflected = s * 0.2;
            } else {
                sceneReflected = texture(reflectionTex, mirrorUV).rgb;
            }
            waxLit += sceneReflected * reflectColor * fresnel * reflectStrength;

            // Webcam reflection (own parallax, optional roughness blur, optional invert)
            if (webcamActive > 0.5) {
                vec2 camOffset = ((webcamInvertReflect > 0.5) ? -mirrorOffset : mirrorOffset) * webcamParallax;
                vec2 camUV = v_texCoord + camOffset;
                vec3 camReflected;
                if (webcamRoughness > 0.001) {
                    float r = webcamRoughness * 0.012;
                    vec2 du = vec2(r / aspect, 0.0);
                    vec2 dv = vec2(0.0, r);
                    vec3 s = texture(webcamTex, coverUV(camUV, aspect, webcamAspect)).rgb;
                    s += texture(webcamTex, coverUV(camUV + du, aspect, webcamAspect)).rgb;
                    s += texture(webcamTex, coverUV(camUV - du, aspect, webcamAspect)).rgb;
                    s += texture(webcamTex, coverUV(camUV + dv, aspect, webcamAspect)).rgb;
                    s += texture(webcamTex, coverUV(camUV - dv, aspect, webcamAspect)).rgb;
                    camReflected = s * 0.2;
                } else {
                    camReflected = texture(webcamTex, coverUV(camUV, aspect, webcamAspect)).rgb;
                }
                waxLit += camReflected * reflectColor * fresnel * webcamReflectMix;
            }

            // Base background (around and behind wax, unrefracted)
            vec3 bgBase = mix(bgBottom, bgTop, clamp(v_texCoord.y, 0.0, 1.0));
            if (webcamActive > 0.5) {
                vec2 camBgUV = coverUV(v_texCoord, aspect, webcamAspect);
                vec3 camBg = texture(webcamTex, camBgUV).rgb;
                bgBase = mix(bgBase, camBg, webcamBgMix);
            }
            vec2 lampPos = vec2(aspect * 0.5, -0.05);
            float gd = length(p - lampPos);
            float glow = exp(-gd / max(glowRadius, 0.02));
            bgBase += glowColor * glow * lampGlow;

            // Refracted background (transparent-wax path only). Bends along -N so
            // the background appears pulled toward the blob centre — lens-like.
            vec2 refractOffset = -vec2(N.x / aspect, N.y) * (refractionStrength * 0.06);
            vec2 refractUV = v_texCoord + refractOffset;
            vec2 refractP = vec2(refractUV.x * aspect, refractUV.y);
            vec3 bgRefract = mix(bgBottom, bgTop, clamp(refractUV.y, 0.0, 1.0));
            if (webcamActive > 0.5) {
                vec2 camBgUV = coverUV(refractUV, aspect, webcamAspect);
                vec3 camBg = texture(webcamTex, camBgUV).rgb;
                bgRefract = mix(bgRefract, camBg, webcamBgMix);
            }
            float gdR = length(refractP - lampPos);
            float glowR = exp(-gdR / max(glowRadius, 0.02));
            bgRefract += glowColor * glowR * lampGlow;

            // Halo is a screen-space edge effect — identical at both positions
            float haloF = clamp(f / max(fieldThreshold, 0.01), 0.0, 1.0);
            float haloTerm = pow(haloF, max(haloWidth, 0.1)) * (1.0 - mask) * halo;
            bgBase += waxGlowColor * haloTerm;
            bgRefract += waxGlowColor * haloTerm;

            float transAlpha = translucency * 0.5;
            float thickness = max(0.0, (f - fieldThreshold) / max(fieldThreshold, 0.01));
            float thickFactor = mix(1.0, 1.0 / (1.0 + thickness * 2.0), translucencyBias);
            transAlpha *= thickFactor;
            transAlpha = clamp(transAlpha, 0.0, 0.9);
            vec3 waxWithBG = waxLit * (1.0 - transAlpha) + bgRefract * transAlpha;

            vec3 col = mix(bgBase, waxWithBG, mask);

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

            fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
        }
    `;

    var fragmentShaderSourceMain = '#version 300 es\n' + fragmentShaderBody;
    var fragmentShaderSourceDebug = '#version 300 es\n#define DEBUG 1\n' + fragmentShaderBody;

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
    var fragmentShaderMain = createShader(gl.FRAGMENT_SHADER, fragmentShaderSourceMain);
    var fragmentShaderDebug = createShader(gl.FRAGMENT_SHADER, fragmentShaderSourceDebug);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShaderMain);
    gl.bindAttribLocation(program, 0, "position");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link failed:', gl.getProgramInfoLog(program));
        return;
    }

    debugProgram = gl.createProgram();
    gl.attachShader(debugProgram, vertexShader);
    gl.attachShader(debugProgram, fragmentShaderDebug);
    gl.bindAttribLocation(debugProgram, 0, "position");
    gl.linkProgram(debugProgram);
    if (!gl.getProgramParameter(debugProgram, gl.LINK_STATUS)) {
        console.error('Debug program link failed:', gl.getProgramInfoLog(debugProgram));
        return;
    }

    [
        "time", "aspect", "blobs", "blobAngles", "blobVelocities", "blobRadiusAvg", "fieldThreshold",
        "cohesionRange", "repelRange", "reflectionTex",
        "webcamTex", "webcamActive", "webcamBgMix", "webcamReflectMix", "webcamAspect",
        "webcamInvertReflect", "refractionStrength", "webcamRoughness", "webcamParallax",
        "poolActive", "poolLevel", "poolSoftness", "poolWave", "poolWaveSpeed",
        "waxA", "waxB", "waxGlowColor", "waxGlow",
        "sssColor", "sssStrength", "sssFalloff",
        "bgTop", "bgBottom", "lampGlow", "glowRadius", "glowColor", "halo", "haloWidth", "glassCurve",
        "lightDir", "specColor", "specStrength", "specSharp", "softSpecStrength", "softSpecSharp",
        "reflectColor", "reflectStrength", "reflectWidth",
        "reflectF0", "reflectPow", "sceneRoughness",
        "rimStrength",
        "ambient", "diffuse", "bump", "edgeSoft",
        "translucency", "translucencyBias",
        "saturation", "brightness", "contrast", "colorPow",
        "vignetteRadius", "vignetteSoft", "vignetteColor"
    ].forEach(n => {
        uniforms[n] = gl.getUniformLocation(program, n);
        debugUniforms[n] = gl.getUniformLocation(debugProgram, n);
    });

    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // === One VAO, shared by both programs (position pinned to attribute 0) ===
    const sceneVAO = gl.createVertexArray();
    gl.bindVertexArray(sceneVAO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    let blobs = [];
    let spawnTimer = 0;

    const blobData = new Float32Array(MAX_BLOBS * 4);
    const blobAngleData = new Float32Array(MAX_BLOBS);
    const blobVelData = new Float32Array(MAX_BLOBS * 2);
    let avgRadius = 0.05;

    // Blob-array prefix upload tracking (items 4 + 9).
    let prevBlobN = 0;
    let currentBlobN = 0;

    // === Dirty-checked uniform helpers (item 3) ===
    function set1i(name, v) {
        if (lastUploaded[name] === v) return;
        gl.uniform1i(activeUniforms[name], v);
        lastUploaded[name] = v;
    }
    function set1f(name, v) {
        if (lastUploaded[name] === v) return;
        gl.uniform1f(activeUniforms[name], v);
        lastUploaded[name] = v;
    }
    function set2f(name, x, y) {
        const kx = name + '_x', ky = name + '_y';
        if (lastUploaded[kx] === x && lastUploaded[ky] === y) return;
        gl.uniform2f(activeUniforms[name], x, y);
        lastUploaded[kx] = x;
        lastUploaded[ky] = y;
    }
    function set3f(name, x, y, z) {
        const kx = name + '_x', ky = name + '_y', kz = name + '_z';
        if (lastUploaded[kx] === x && lastUploaded[ky] === y && lastUploaded[kz] === z) return;
        gl.uniform3f(activeUniforms[name], x, y, z);
        lastUploaded[kx] = x;
        lastUploaded[ky] = y;
        lastUploaded[kz] = z;
    }
    function setColor(name, hex) {
        const k = name + '_hex';
        if (lastUploaded[k] === hex) return;
        const rgb = hexToRgb(hex);
        gl.uniform3f(activeUniforms[name], rgb[0], rgb[1], rgb[2]);
        lastUploaded[k] = hex;
    }
    function setLightDirUniform() {
        const a = state.lightAngle;
        if (lastUploaded._lightAngle === a) return;
        gl.uniform2f(activeUniforms.lightDir, Math.cos(a), Math.sin(a));
        lastUploaded._lightAngle = a;
    }

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
        const asp = cachedAspect;
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
        const asp = cachedAspect;
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
        if (prevBlobN > n) {
            blobData.fill(0, n * 4, prevBlobN * 4);
            blobAngleData.fill(0, n, prevBlobN);
            blobVelData.fill(0, n * 2, prevBlobN * 2);
        }
        const targetAvg = n > 0 ? targetSum / n : state.blobSize;
        avgRadius += (targetAvg - avgRadius) * 0.08;
        currentBlobN = Math.max(n, prevBlobN);
        prevBlobN = n;
    }

    function render(t) {
        // Program selection based on debug mode
        const wantDebug = state.debugMode ? 1 : 0;
        if (!activeProgram || activeIsDebug !== (wantDebug === 1)) {
            activeIsDebug = wantDebug === 1;
            activeProgram = activeIsDebug ? debugProgram : program;
            activeUniforms = activeIsDebug ? debugUniforms : uniforms;
            gl.useProgram(activeProgram);
            lastUploaded = {};
        }

        // === Main pass: render full scene to FBO ===
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindVertexArray(sceneVAO);

        // Previous frame as reflection source
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexs[1 - currentSceneIdx]);
        set1i('reflectionTex', 0);

        // Webcam texture: upload latest frame and bind to unit 1
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, webcamTex);
        let webcamIsLive = false;
        if (webcamWanted && webcamReady && webcamVideo && webcamVideo.readyState >= 2) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webcamVideo);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            if (webcamVideo.videoWidth > 0) {
                webcamAspect = webcamVideo.videoWidth / Math.max(1, webcamVideo.videoHeight);
            }
            webcamIsLive = true;
        }
        set1i('webcamTex', 1);
        set1f('webcamActive', webcamIsLive ? 1 : 0);
        set1f('webcamBgMix', state.webcamBgMix);
        set1f('webcamReflectMix', state.webcamReflectMix);
        set1f('webcamAspect', webcamAspect);
        set1f('webcamInvertReflect', state.webcamInvertReflect ? 1 : 0);
        set1f('webcamRoughness', state.webcamRoughness);
        set1f('webcamParallax', state.webcamParallax);
        set1f('refractionStrength', state.refractionStrength);

        // Per-frame dynamic uniforms (uploaded unconditionally)
        gl.uniform1f(activeUniforms.time, t);
        if (currentBlobN > 0) {
            gl.uniform4fv(activeUniforms.blobs, blobData, 0, currentBlobN * 4);
            gl.uniform1fv(activeUniforms.blobAngles, blobAngleData, 0, currentBlobN);
            gl.uniform2fv(activeUniforms.blobVelocities, blobVelData, 0, currentBlobN * 2);
        }

        // Semi-static uniforms (dirty-checked)
        set1f('aspect', cachedAspect);
        set1f('blobRadiusAvg', avgRadius);
        set1f('fieldThreshold', Math.max(0.01, state.fieldThreshold));
        set1f('cohesionRange', state.cohesionRange);
        set1f('repelRange', state.repelRange);

        set1f('poolActive', state.poolActive ? 1 : 0);
        set1f('poolLevel', state.poolLevel);
        set1f('poolSoftness', Math.max(0.002, state.poolSoftness));
        set1f('poolWave', state.poolWave);
        set1f('poolWaveSpeed', state.poolWaveSpeed);

        setColor('waxA', state.waxColorA);
        setColor('waxB', state.waxColorB);
        setColor('waxGlowColor', state.waxGlowColor);
        set1f('waxGlow', state.waxGlow);

        setColor('sssColor', state.sssColor);
        set1f('sssStrength', state.sssStrength);
        set1f('sssFalloff', Math.max(0.05, state.sssFalloff));

        setColor('bgTop', state.bgTop);
        setColor('bgBottom', state.bgBottom);
        set1f('lampGlow', state.lampGlow);
        set1f('glowRadius', state.glowRadius);
        setColor('glowColor', state.glowColor);
        set1f('halo', state.halo);
        set1f('haloWidth', Math.max(0.1, state.haloWidth));
        set1f('glassCurve', state.glassCurve);

        setLightDirUniform();
        setColor('specColor', state.specColor);
        set1f('specStrength', state.specStrength);
        set1f('specSharp', state.specSharp);
        set1f('softSpecStrength', state.softSpecStrength);
        set1f('softSpecSharp', Math.max(1, state.softSpecSharp));
        setColor('reflectColor', state.reflectColor);
        set1f('reflectStrength', state.reflectStrength);
        set1f('reflectWidth', Math.max(0.1, state.reflectWidth));
        set1f('reflectF0', state.reflectF0);
        set1f('reflectPow', state.reflectPow);
        set1f('sceneRoughness', state.sceneRoughness);
        set1f('rimStrength', state.rimStrength);
        set1f('ambient', state.ambient);
        set1f('diffuse', state.diffuse);
        set1f('bump', state.bump);
        set1f('edgeSoft', state.edgeSoft);
        set1f('translucency', state.translucency);
        set1f('translucencyBias', state.translucencyBias);

        set1f('saturation', state.saturation);
        set1f('brightness', state.brightness);
        set1f('contrast', state.contrast);
        set1f('colorPow', state.colorPow);

        set1f('vignetteRadius', state.vignetteRadius);
        set1f('vignetteSoft', state.vignetteSoft);
        setColor('vignetteColor', state.vignetteColor);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // === Blit pass: hardware blit FBO -> default framebuffer ===
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        gl.blitFramebuffer(
            0, 0, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height,
            gl.COLOR_BUFFER_BIT,
            gl.NEAREST
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Swap ping-pong
        currentSceneIdx = 1 - currentSceneIdx;
    }

    createWebcamTexture();

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    resetBlobs();

    var lastFrameTime = 0;
    var rafHandle = 0;
    let scaledTime = 0;

    function animate(now) {
        if (__destroyed) return;

        // Sync webcam on/off with the checkbox
        const wantCam = !!state.webcamActive;
        if (wantCam !== webcamWanted) {
            webcamWanted = wantCam;
            if (webcamWanted) startWebcam();
            else stopWebcam();
        }

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
                    } else if (COLOR_KEYS[k] && typeof a === 'string' && typeof b === 'string') {
                        state[k] = lerpHex(a, b, te);
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

            if (window.LavaCharacter && charCtx) {
                const charEnv = {
                    blobs:  blobs,
                    aspect: cachedAspect,
                    time:   scaledTime,
                    state:  state,
                };
                const charDt = state.freezeTime ? 0 : Math.min(dtReal, 0.05);
                window.LavaCharacter.updateAll(charDt, charEnv);

                charCtx.clearRect(0, 0, charCanvas.width, charCanvas.height);
                window.LavaCharacter.drawAll(charCtx, charEnv);
            }
        }

        rafHandle = requestAnimationFrame(animate);
        window.animationFrameId = rafHandle;
    }

    // === Cached control element refs for fast refreshControlsUI ===
    let controlEls = {};

    function buildControlsUI() {
        const list = document.getElementById("controls-list");
        if (!list) return;
        list.innerHTML = "";
        controlEls = {};

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
                controlEls[key] = { checkbox: cb };
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
                controlEls[key] = { color: colorInput };
                return;
            }

            if (c.special === 'text') {
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

                const textInput = document.createElement("input");
                textInput.type = "text";
                textInput.value = current;
                textInput.dataset.key = key;
                textInput.style.gridColumn = "2 / 4";
                textInput.style.width = "100%";
                textInput.style.boxSizing = "border-box";
                textInput.style.fontFamily = "monospace";
                textInput.addEventListener("input", () => { state[key] = textInput.value; });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    textInput.value = c.def;
                });

                row.appendChild(label);
                row.appendChild(textInput);
                row.appendChild(resetBtn);
                container.appendChild(row);
                controlEls[key] = { text: textInput };
                return;
            }

            if (c.special === 'button') {
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

                const btn = document.createElement("button");
                btn.className = "reset-btn";
                btn.textContent = c.buttonText || "Add";
                btn.style.gridColumn = "2 / 5";
                btn.style.justifySelf = "start";
                btn.style.padding = "2px 10px";
                btn.addEventListener("click", () => {
                    if (typeof c.action === "function") {
                        try { c.action(state); } catch (e) { console.warn('button action:', e); }
                    }
                    refreshControlsUI();
                });

                row.appendChild(label);
                row.appendChild(btn);
                container.appendChild(row);
                return;
            }

            if (c.special === 'subheading') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                row.style.gridColumn = "1 / -1";
                row.style.marginTop = "10px";
                row.style.marginBottom = "4px";
                row.style.paddingTop = "6px";
                row.style.borderTop = "1px solid #444";
                row.style.fontWeight = "bold";
                row.style.fontSize = "0.95em";
                row.style.opacity = "0.85";
                row.style.color = "#ccc";
                row.textContent = c.label || "";
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
            controlEls[key] = { slider, number };
        }

        CONTROLS.forEach((group, gi) => {
            const { head, indicator } = makeHeading(group.heading, gi === 0, group);
            const body = document.createElement("div");
            body.className = "ctrl-group-body";

            let initialCollapsed = !group.openByDefault;
            try {
                const saved = JSON.parse(localStorage.getItem("lavalampCtrlGroupsCollapsed") || "{}");
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
                    const map = JSON.parse(localStorage.getItem("lavalampCtrlGroupsCollapsed") || "{}");
                    map[group.heading] = body.classList.contains("collapsed");
                    localStorage.setItem("lavalampCtrlGroupsCollapsed", JSON.stringify(map));
                } catch (_) { }
            });

            list.appendChild(head);
            list.appendChild(body);
        });
    }

    function refreshControlsUI() {
        Object.keys(DEFAULTS).forEach(key => {
            const els = controlEls[key];
            if (!els) return;
            const v = state[key];
            const isInt = !!INT_KEYS[key];
            const c = CONTROL_BY_KEY[key];
            if (!c) return;
            if (els.slider) {
                els.slider.min = c.min;
                els.slider.max = c.max;
                els.slider.step = c.step;
                els.slider.value = isInt ? Math.round(v) : v;
            }
            if (els.number) {
                els.number.step = c.step;
                els.number.value = isInt ? String(Math.round(v)) : fmtVal(v);
            }
            if (els.checkbox) els.checkbox.checked = !!v;
            if (els.color) {
                if (document.activeElement !== els.color) els.color.value = v;
            }
            if (els.text && document.activeElement !== els.text) els.text.value = v;
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
            if (BOOL_KEYS[k]) {
                if (!STANDALONE_KEYS[k]) state[k] = target[k];
            }
        });

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

    window.__lavalampApp = {
        destroy() {
            __destroyed = true;
            if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            Object.keys(CONTROL_BY_KEY).forEach(k => { delete CONTROL_BY_KEY[k]; });
            blobs.length = 0;
            stopWebcam();
            if (webcamTex) { gl.deleteTexture(webcamTex); webcamTex = null; }
            for (let i = 0; i < 2; i++) {
                if (sceneFBOs[i]) gl.deleteFramebuffer(sceneFBOs[i]);
                if (sceneTexs[i]) gl.deleteTexture(sceneTexs[i]);
            }
            if (debugProgram) gl.deleteProgram(debugProgram);
            if (program) gl.deleteProgram(program);
            if (sceneVAO) gl.deleteVertexArray(sceneVAO);

            // --- Character module teardown (replacement block) ---
            if (window.LavaCharacter) {
                try { window.LavaCharacter.destroyAll(); } catch (e) { console.warn('character teardown:', e); }
            }
            if (charCanvas && charCanvas.parentNode) charCanvas.parentNode.removeChild(charCanvas);
            charCanvas = null;
            charCtx    = null;

            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

// =====================================================================
// BOOT — load the character module, then start main().
// If the module is missing we still run the lamp without a character.
// =====================================================================
var currentScriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
var fileBase = currentScriptUrl.split('?')[0].split('/').pop().replace(/\.js$/, '');
var VERSION = fileBase || 'lava';
var charScriptUrl = new URL("character.js", currentScriptUrl).href;

var characterScript = document.createElement("script");
characterScript.src = charScriptUrl;
characterScript.onload = function () { try { main(); } catch (e) { console.error(e); } };
characterScript.onerror = function () {
    console.warn("Failed to load " + charScriptUrl + " — running without character");
    main();
};
document.head.appendChild(characterScript);