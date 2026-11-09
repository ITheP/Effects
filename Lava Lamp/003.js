function main() {
    let __destroyed = false;
    if (window.__kaleidoApp && typeof window.__kaleidoApp.destroy === 'function') {
        try { window.__kaleidoApp.destroy(); } catch (e) { console.warn('kaleido teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas[data-kaleido]").forEach(c => c.remove());

    const MAX_BLOBS = 16;

    // ------------------------------------------------------------------
    //  CONFIG
    // ------------------------------------------------------------------
    const CFG = {
        targetFPS: 60, presetTransitionTime: 3.0,
        freezeTime: 0, autoMorph: 0, morphCycleTime: 10.0,
        timeScale: 1.0,

        blobCount: 9,
        blobSize: 0.055,
        blobSizeVar: 0.40,
        buoyancy: 0.85,
        drag: 1.10,
        heatGain: 1.10,
        cooling: 0.32,
        heatDepth: 0.16,
        tempNeutral: 0.50,
        maxSpeed: 0.32,
        wander: 0.35,
        squish: 1.10,
        bounce: 3.00,

        repelRange: 1.25,
        repelStrength: 1.20,
        mergeThreshold: 0.55,
        mergeCooldown: 1.50,
        splitSize: 0.105,
        splitChance: 0.35,

        poolActive: 1,
        poolLevel: 0.055,
        poolSoftness: 0.025,
        poolWave: 0.010,

        waxColorA: '#ff3b1f',
        waxColorB: '#ffd24a',
        waxGlow: 0.90,
        waxGlowColor: '#ff6a00',

        lightAngle: 2.20,
        specStrength: 1.40,
        specSharp: 40.0,
        specColor: '#ffffff',
        rimStrength: 0.50,
        ambient: 0.35,
        diffuse: 0.85,
        bump: 1.00,
        edgeSoft: 0.10,

        bgTop: '#140a1e',
        bgBottom: '#2b0f38',
        lampGlow: 0.90,
        glowRadius: 0.55,
        glowColor: '#ff4d00',
        halo: 0.55,
        glassCurve: 0.30,

        saturation: 1.10,
        brightness: 1.00,
        contrast: 1.05,
        colorPow: 1.00,
        vignetteRadius: 0.60,
        vignetteSoft: 0.50,
        vignetteColor: '#000000',
    };

    // ------------------------------------------------------------------
    //  CONTROLS
    // ------------------------------------------------------------------
    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                { icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true, label: "Target FPS", savedInPreset: false, details: "Framerate cap." },
                { icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01, label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over." },
                { icon: "⏸️", key: "freezeTime", def: CFG.freezeTime, special: "bool", savedInPreset: false, label: "Freeze Time", details: "Freeze the shader clock and physics." },
                { icon: "🔀", key: "autoMorph", def: CFG.autoMorph, special: "bool", savedInPreset: false, label: "Auto Morph", details: "Cycle random presets." },
                { icon: "🔄", key: "morphCycleTime", def: CFG.morphCycleTime, min: 2, max: 120, step: 0.5, savedInPreset: false, label: "Morph Cycle Time", details: "Seconds between random picks." },
                { icon: "🐢", key: "timeScale", def: CFG.timeScale, min: 0.05, max: 2, step: 0.01, label: "Time Scale", details: "Global speed multiplier. 0.1 = 10× slower, 1 = normal." },
            ]
        },
        {
            heading: "🫧 Wax Blobs", openByDefault: true, controls: [
                { icon: "🔢", key: "blobCount", def: CFG.blobCount, min: 1, max: MAX_BLOBS, step: 1, int: true, label: "Blob Count", details: "Target number of wax blobs." },
                { icon: "📏", key: "blobSize", def: CFG.blobSize, min: 0.015, max: 0.16, step: 0.001, label: "Blob Size", details: "Base radius in screen-height units." },
                { icon: "🎲", key: "blobSizeVar", def: CFG.blobSizeVar, min: 0, max: 1, step: 0.01, label: "Size Variance", details: "Random spread of blob radius." },
                { icon: "🎈", key: "buoyancy", def: CFG.buoyancy, min: 0.05, max: 3, step: 0.01, label: "Buoyancy", details: "Upward force from temperature." },
                { icon: "💨", key: "drag", def: CFG.drag, min: 0.05, max: 4, step: 0.01, label: "Drag", details: "Velocity damping." },
                { icon: "🔥", key: "heatGain", def: CFG.heatGain, min: 0.1, max: 3, step: 0.01, label: "Heat Gain", details: "Heat absorbed near the bottom." },
                { icon: "❄️", key: "cooling", def: CFG.cooling, min: 0.02, max: 1.5, step: 0.01, label: "Cooling Rate", details: "Heat lost per second." },
                { icon: "📏", key: "heatDepth", def: CFG.heatDepth, min: 0.02, max: 0.6, step: 0.005, label: "Heat Depth", details: "How far the bulb's heat reaches." },
                { icon: "🌡️", key: "tempNeutral", def: CFG.tempNeutral, min: 0, max: 1.5, step: 0.01, label: "Neutral Temp", details: "Temperature at which blobs neither rise nor sink." },
                { icon: "🚀", key: "maxSpeed", def: CFG.maxSpeed, min: 0.05, max: 1.5, step: 0.01, label: "Max Speed", details: "Velocity clamp." },
                { icon: "🌊", key: "wander", def: CFG.wander, min: 0, max: 2, step: 0.01, label: "Horizontal Wander", details: "Sideways drift strength." },
                { icon: "🫧", key: "squish", def: CFG.squish, min: 0, max: 4, step: 0.01, label: "Stretch from Speed", details: "How much blobs elongate with velocity (spring-driven)." },
                { icon: "🏀", key: "bounce", def: CFG.bounce, min: 0, max: 10, step: 0.01, label: "Collision Bounce", details: "Squash impulse when blobs collide." },
            ]
        },
        {
            heading: "🧲 Surface Tension", openByDefault: true, controls: [
                { icon: "↔️", key: "repelRange", def: CFG.repelRange, min: 0.5, max: 2.5, step: 0.01, label: "Repel Range", details: "Distance (× combined radii) at which blobs push apart." },
                { icon: "💪", key: "repelStrength", def: CFG.repelStrength, min: 0, max: 10, step: 0.05, label: "Repel Strength", details: "Surface tension force." },
                { icon: "🔗", key: "mergeThreshold", def: CFG.mergeThreshold, min: 0, max: 1.2, step: 0.01, label: "Merge Threshold", details: "Overlap at which blobs fuse (0 = never)." },
                { icon: "⏱️", key: "mergeCooldown", def: CFG.mergeCooldown, min: 0, max: 8, step: 0.05, label: "Merge Cooldown", details: "Seconds before a fused blob can fuse again." },
                { icon: "✂️", key: "splitSize", def: CFG.splitSize, min: 0.02, max: 0.3, step: 0.002, label: "Split Size", details: "Radius above which a blob may pinch in two." },
                { icon: "🎲", key: "splitChance", def: CFG.splitChance, min: 0, max: 3, step: 0.01, label: "Split Chance", details: "Probability per second of splitting." },
            ]
        },
        {
            heading: "🫗 Wax Pool", openByDefault: true, controls: [
                { icon: "👁️", key: "poolActive", def: CFG.poolActive, special: "bool", label: "Show Pool", details: "Wax reservoir at the bottom." },
                { icon: "📏", key: "poolLevel", def: CFG.poolLevel, min: 0.0, max: 0.4, step: 0.002, label: "Pool Level", details: "Height of the pool surface." },
                { icon: "☁️", key: "poolSoftness", def: CFG.poolSoftness, min: 0.004, max: 0.12, step: 0.001, label: "Pool Softness", details: "How quickly the pool field fades upward." },
                { icon: "🌊", key: "poolWave", def: CFG.poolWave, min: 0, max: 0.06, step: 0.0005, label: "Pool Wave", details: "Undulation of the pool surface." },
            ]
        },
        {
            heading: "🎨 Wax Colour", openByDefault: true, controls: [
                { icon: "🅰️", key: "waxColorA", def: CFG.waxColorA, special: "color", label: "Wax Colour A", details: "Lower wax colour." },
                { icon: "🅱️", key: "waxColorB", def: CFG.waxColorB, special: "color", label: "Wax Colour B", details: "Upper wax colour." },
                { icon: "💡", key: "waxGlow", def: CFG.waxGlow, min: 0, max: 3, step: 0.01, label: "Subsurface Glow", details: "Light transmitted through the wax from the bulb." },
                { icon: "🎨", key: "waxGlowColor", def: CFG.waxGlowColor, special: "color", label: "Glow Colour", details: "Colour of the transmitted light." },
            ]
        },
        {
            heading: "💡 Lighting", openByDefault: true, controls: [
                { icon: "🧭", key: "lightAngle", def: CFG.lightAngle, min: -3.14159, max: 3.14159, step: 0.01, label: "Light Angle", details: "Direction of the key light (radians)." },
                { icon: "✨", key: "specStrength", def: CFG.specStrength, min: 0, max: 5, step: 0.01, label: "Specular", details: "Highlight intensity." },
                { icon: "🔎", key: "specSharp", def: CFG.specSharp, min: 2, max: 200, step: 1, label: "Specular Sharpness", details: "Highlight tightness." },
                { icon: "⚪", key: "specColor", def: CFG.specColor, special: "color", label: "Specular Colour", details: "Highlight tint." },
                { icon: "🌟", key: "rimStrength", def: CFG.rimStrength, min: 0, max: 2, step: 0.01, label: "Rim Light", details: "Edge glow." },
                { icon: "🌥️", key: "ambient", def: CFG.ambient, min: 0, max: 2, step: 0.01, label: "Ambient", details: "Base wax illumination." },
                { icon: "☀️", key: "diffuse", def: CFG.diffuse, min: 0, max: 2, step: 0.01, label: "Diffuse", details: "Directional wax illumination." },
                { icon: "🪨", key: "bump", def: CFG.bump, min: 0, max: 4, step: 0.01, label: "Surface Roundness", details: "Strength of the fake 3D rounding. 1.0 = physically accurate dome." },
                { icon: "🖊️", key: "edgeSoft", def: CFG.edgeSoft, min: 0.01, max: 0.6, step: 0.005, label: "Edge Softness", details: "Anti-aliasing width of the wax boundary." },
            ]
        },
        {
            heading: "🫙 Liquid & Glass", openByDefault: false, controls: [
                { icon: "🌌", key: "bgTop", def: CFG.bgTop, special: "color", label: "Liquid Top", details: "Liquid colour at the top." },
                { icon: "🌆", key: "bgBottom", def: CFG.bgBottom, special: "color", label: "Liquid Bottom", details: "Liquid colour at the bottom." },
                { icon: "💡", key: "lampGlow", def: CFG.lampGlow, min: 0, max: 4, step: 0.01, label: "Lamp Glow", details: "Bulb glow through the liquid." },
                { icon: "⭕", key: "glowRadius", def: CFG.glowRadius, min: 0.05, max: 2, step: 0.01, label: "Glow Radius", details: "Falloff distance of the bulb glow." },
                { icon: "🎨", key: "glowColor", def: CFG.glowColor, special: "color", label: "Glow Colour", details: "Bulb colour." },
                { icon: "🌈", key: "halo", def: CFG.halo, min: 0, max: 3, step: 0.01, label: "Wax Halo", details: "Light bleeding from the wax into the liquid." },
                { icon: "🫙", key: "glassCurve", def: CFG.glassCurve, min: 0, max: 1.5, step: 0.01, label: "Glass Curve", details: "Darkening at the left/right glass edges." },
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

    // ------------------------------------------------------------------
    //  PRESETS
    // ------------------------------------------------------------------
    const PRESETS = [
        { name: "Classic Lava", iteration: 1, values: {} },
        { name: "Molten Gold", iteration: 2, values: { waxColorA: '#ff2200', waxColorB: '#ffcc00', waxGlow: 1.4, waxGlowColor: '#ff8800', bgTop: '#0a0505', bgBottom: '#2a0a00', glowColor: '#ff6600', lampGlow: 1.2, specStrength: 1.8 } },
        { name: "Deep Sea", iteration: 3, values: { waxColorA: '#00b3ff', waxColorB: '#7ef9ff', waxGlow: 0.7, waxGlowColor: '#00aaff', bgTop: '#020814', bgBottom: '#001a2e', glowColor: '#0088ff', lampGlow: 0.8, specStrength: 1.6, specSharp: 60 } },
        { name: "Toxic Slime", iteration: 4, values: { waxColorA: '#7cff00', waxColorB: '#d4ff5a', waxGlow: 1.1, waxGlowColor: '#88ff00', bgTop: '#050a02', bgBottom: '#0e2200', glowColor: '#66ff00', lampGlow: 0.9, saturation: 1.3 } },
        { name: "Cotton Candy", iteration: 5, values: { waxColorA: '#ff5ec4', waxColorB: '#a0e8ff', waxGlow: 0.9, waxGlowColor: '#ff88dd', bgTop: '#1a0a22', bgBottom: '#331244', glowColor: '#ff44aa', lampGlow: 0.9, blobSize: 0.045, blobCount: 12 } },
        { name: "Blood Moon", iteration: 6, values: { waxColorA: '#5a0000', waxColorB: '#ff2b00', waxGlow: 1.6, waxGlowColor: '#ff0000', bgTop: '#080000', bgBottom: '#1e0000', glowColor: '#cc0000', lampGlow: 1.4, contrast: 1.2, specStrength: 0.8 } },
        { name: "Aurora", iteration: 7, values: { waxColorA: '#00ff9d', waxColorB: '#7b5bff', waxGlow: 0.8, waxGlowColor: '#00ffcc', bgTop: '#03061a', bgBottom: '#0a0f33', glowColor: '#00ffaa', lampGlow: 0.7, blobCount: 7, blobSize: 0.07 } },
        { name: "Mercury", iteration: 8, values: { waxColorA: '#8a8a9a', waxColorB: '#e8e8ff', waxGlow: 0.3, waxGlowColor: '#aabbff', bgTop: '#050508', bgBottom: '#101018', glowColor: '#445577', lampGlow: 0.5, specStrength: 3.0, specSharp: 120, saturation: 0.4 } },
        { name: "Slow Blobs", iteration: 9, values: { buoyancy: 0.35, cooling: 0.14, heatDepth: 0.22, blobSize: 0.085, blobCount: 6, drag: 1.6, maxSpeed: 0.16, wander: 0.2, timeScale: 0.75 } },
        { name: "Fast Frenzy", iteration: 10, values: { buoyancy: 1.8, cooling: 0.6, heatDepth: 0.12, blobSize: 0.035, blobCount: 14, drag: 0.7, maxSpeed: 0.55, wander: 0.9, squish: 2.2, bounce: 6, timeScale: 1.2 } },
        { name: "Giant Pool", iteration: 11, values: { poolLevel: 0.22, poolSoftness: 0.06, poolWave: 0.02, blobSize: 0.09, blobCount: 5, buoyancy: 0.6 } },
        { name: "No Pool", iteration: 12, values: { poolActive: 0, blobCount: 10 } },
        { name: "Neon Lab", iteration: 13, values: { waxColorA: '#ff00cc', waxColorB: '#00ffee', waxGlow: 1.5, waxGlowColor: '#ff00aa', bgTop: '#06000f', bgBottom: '#12002a', glowColor: '#aa00ff', lampGlow: 1.3, specStrength: 2.4, specSharp: 90, saturation: 1.5 } },
        { name: "Sunset", iteration: 14, values: { waxColorA: '#ff6a00', waxColorB: '#ffd166', waxGlow: 1.2, waxGlowColor: '#ff9933', bgTop: '#150820', bgBottom: '#3a1030', glowColor: '#ff5500', lampGlow: 1.1 } },
        { name: "Slow Motion", iteration: 15, values: { timeScale: 0.30 } },
        { name: "Hypnotic", iteration: 16, values: { timeScale: 0.12 } },
        { name: "Rubbery Wax", iteration: 17, values: { squish: 2.6, bounce: 7.0, specStrength: 2.0, specSharp: 70, blobCount: 7 } },
        { name: "Gooey Pinch", iteration: 18, values: { squish: 3.4, bounce: 5.0, repelStrength: 2.5, mergeThreshold: 0.7, splitChance: 0.8, blobCount: 8 } },
  ,{      "name": "Test",
    "iteration": 15,
    "values": {
        "blobCount": 7,
        "blobSize": 0.039,
        "blobSizeVar": 0.61,
        "buoyancy": 0.49,
        "heatGain": 0.66,
        "maxSpeed": 0.2,
        "wander": 0.21,
        "squish": 3.23,
        "splitSize": 0.158,
        "poolLevel": 0.094,
        "waxGlow": 0.55,
        "lightAngle": 1.65841,
        "specStrength": 2.63,
        "specSharp": 42,
        "rimStrength": 1.11,
        "ambient": 1.16,
        "diffuse": 0.18,
        "bump": 0.14,
        "edgeSoft": 0.205,
        "bgTop": "#421371",
        "bgBottom": "#0e880c",
        "lampGlow": 2.26,
        "glowRadius": 0.25,
        "halo": 1,
        "glassCurve": 1.5,
        "colorPow": 1.72
    }
}  ];

    // ------------------------------------------------------------------
    //  helpers
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    //  canvas & GL
    // ------------------------------------------------------------------
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
        uniform float blobRadiusAvg;

        uniform float poolActive;
        uniform float poolLevel;
        uniform float poolSoftness;
        uniform float poolWave;

        uniform vec3  waxA;
        uniform vec3  waxB;
        uniform vec3  waxGlowColor;
        uniform float waxGlow;

        uniform vec3  bgTop;
        uniform vec3  bgBottom;
        uniform float lampGlow;
        uniform float glowRadius;
        uniform vec3  glowColor;
        uniform float halo;
        uniform float glassCurve;

        uniform vec2  lightDir;
        uniform vec3  specColor;
        uniform float specStrength;
        uniform float specSharp;
        uniform float rimStrength;
        uniform float ambient;
        uniform float diffuse;
        uniform float bump;
        uniform float edgeSoft;

        uniform float saturation;
        uniform float brightness;
        uniform float contrast;
        uniform float colorPow;

        uniform float vignetteRadius;
        uniform float vignetteSoft;
        uniform vec3  vignetteColor;

        void main() {
            vec2 p = vec2(v_texCoord.x * aspect, v_texCoord.y);

            float f = 0.0;
            vec2  grad = vec2(0.0);

            // ---- wax pool (wavy half-plane) ----
            if (poolActive > 0.5) {
                float ph = poolWave * (0.6 * sin(p.x * 7.0 + time * 0.55)
                                     + 0.4 * sin(p.x * 13.0 - time * 0.90));
                float phP = poolWave * (0.6 * 7.0 * cos(p.x * 7.0 + time * 0.55)
                                      + 0.4 * 13.0 * cos(p.x * 13.0 - time * 0.90));
                float surf = poolLevel - poolSoftness * 2.07944 + ph;
                float dm = max(p.y - surf, 0.0);
                float soft = max(poolSoftness, 0.001);
                float pf = 8.0 * exp(-dm / soft);
                f += pf;
                grad += vec2((pf / soft) * phP, -pf / soft);
            }

            // ---- blobs (rotated + stretched metaballs) ----
            for (int i = 0; i < ${MAX_BLOBS}; i++) {
                vec4 b = blobs[i];
                float sy = max(b.w, 0.1);
                float ang = blobAngles[i];
                float ca = cos(ang);
                float sa = sin(ang);

                vec2 q = p - b.xy;
                vec2 qr = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca);
                vec2 qt = vec2(qr.x / sy, qr.y * sy);

                float d2 = dot(qt, qt) + 1e-4;
                float r2 = b.z * b.z;
                float fi = r2 / d2;
                f += fi;

                vec2 d2dq = 2.0 * vec2(
                    qt.x * ca / sy - qt.y * sa * sy,
                    qt.x * sa / sy + qt.y * ca * sy
                );
                grad += -(r2 / (d2 * d2)) * d2dq;
            }

            // ---- wax / liquid mask ----
            float mask = smoothstep(1.0 - edgeSoft, 1.0 + edgeSoft, f);

            // ---- proper dome normal from height field h = sqrt(1 - 1/f) ----
            float fc = max(f, 1.0001);
            float hN = sqrt(max(0.0, 1.0 - 1.0 / fc));
            float dhdf = 1.0 / (2.0 * max(fc * fc, 1.0) * max(hN, 0.0015));
            vec2 slope = grad * dhdf * blobRadiusAvg;
            vec3 N = normalize(vec3(-slope * bump, 1.0));

            // ---- lighting ----
            vec3 L = normalize(vec3(lightDir, 0.80));
            vec3 V = vec3(0.0, 0.0, 1.0);
            vec3 H = normalize(L + V);
            float ndl = max(dot(N, L), 0.0);
            float ndh = max(dot(N, H), 0.0);
            float spec = pow(ndh, max(specSharp, 1.0));
            float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);

            // ---- wax colour ----
            float ht = clamp(p.y * 0.85 + 0.15 * sin(p.x * 2.5 + time * 0.35), 0.0, 1.0);
            vec3 wax = mix(waxA, waxB, ht);

            float lampL = exp(-max(p.y, 0.0) * 4.0);
            vec3 waxLit = wax * (ambient + diffuse * ndl);
            waxLit += waxGlowColor * lampL * waxGlow * 0.55;
            waxLit += specColor * spec * specStrength;
            waxLit += mix(waxB, vec3(1.0), 0.5) * rim * rimStrength;

            // ---- liquid ----
            vec3 bg = mix(bgBottom, bgTop, clamp(v_texCoord.y, 0.0, 1.0));
            vec2 lampPos = vec2(aspect * 0.5, -0.05);
            float gd = length(p - lampPos);
            float glow = exp(-gd / max(glowRadius, 0.02));
            bg += glowColor * glow * lampGlow;

            float haloF = clamp(f, 0.0, 1.0);
            bg += waxGlowColor * haloF * haloF * (1.0 - mask) * halo;

            // ---- composite ----
            vec3 col = mix(bg, waxLit, mask);

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
        "time", "aspect", "blobs", "blobAngles", "blobRadiusAvg",
        "poolActive", "poolLevel", "poolSoftness", "poolWave",
        "waxA", "waxB", "waxGlowColor", "waxGlow",
        "bgTop", "bgBottom", "lampGlow", "glowRadius", "glowColor", "halo", "glassCurve",
        "lightDir", "specColor", "specStrength", "specSharp", "rimStrength",
        "ambient", "diffuse", "bump", "edgeSoft",
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

    // ------------------------------------------------------------------
    //  blob simulation
    // ------------------------------------------------------------------
    let blobs = [];
    let spawnTimer = 0;

    const blobData = new Float32Array(MAX_BLOBS * 4);
    const blobAngleData = new Float32Array(MAX_BLOBS);
    let avgRadius = 0.05;

    // spring constants for rubbery squash
    const SPRING_K = 25.0;
    const SPRING_DAMP = 6.0;

    function spawnBlob(x, y, r, temp) {
        if (blobs.length >= MAX_BLOBS) return;
        blobs.push({
            x: x, y: y,
            vx: rand(-0.02, 0.02),
            vy: rand(0.0, 0.02),
            r: Math.max(0.005, r),
            temp: temp !== undefined ? temp : 0.6,
            stretch: 1.0,
            stretchVel: 0.0,
            stretchAngle: rand(0, Math.PI * 2),
            mergeCd: 0.5,
            wanderFreq: rand(0.15, 0.5),
            wanderPhase: rand(0, 6.2831853),
        });
    }

    function resetBlobs() {
        blobs.length = 0;
        spawnTimer = 0;
        const asp = canvas.width / Math.max(1, canvas.height);
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));
        for (let i = 0; i < target; i++) {
            const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
            spawnBlob(rand(state.blobSize, Math.max(state.blobSize * 1.1, asp - state.blobSize)),
                      rand(0.02, 0.5), Math.max(0.008, r), rand(0.2, 1.0));
        }
    }

    function stepPhysics(dt, t) {
        if (dt <= 0) return;
        const asp = canvas.width / Math.max(1, canvas.height);
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));

        while (blobs.length > target) blobs.pop();

        if (blobs.length < target) {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = 0.35;
                const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
                spawnBlob(rand(state.blobSize, Math.max(state.blobSize * 1.1, asp - state.blobSize)),
                          0.01, Math.max(0.008, r), 0.55);
            }
        } else {
            spawnTimer = 0;
        }

        const hd = Math.max(0.01, state.heatDepth);
        const neutral = state.tempNeutral;
        const dragK = Math.exp(-state.drag * dt);
        const maxSp = Math.max(0.01, state.maxSpeed);

        // thermal + buoyancy
        for (let i = 0; i < blobs.length; i++) {
            const b = blobs[i];
            const heatIn = Math.exp(-Math.max(0, b.y) / hd) * state.heatGain;
            b.temp += (heatIn - state.cooling) * dt;
            if (b.temp < 0) b.temp = 0;
            if (b.temp > 1.6) b.temp = 1.6;

            b.vy += (b.temp - neutral) * state.buoyancy * dt;
            b.vx += Math.sin(t * b.wanderFreq + b.wanderPhase) * state.wander * dt;
        }

        // surface tension + collision bounce
        for (let i = 0; i < blobs.length; i++) {
            for (let j = i + 1; j < blobs.length; j++) {
                const a = blobs[i], b = blobs[j];
                let dx = b.x - a.x, dy = b.y - a.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                if (d < 1e-4) { dx = 1e-4; dy = 0; d = 1e-4; }
                const sumR = a.r + b.r;
                const range = sumR * state.repelRange;
                if (d < range) {
                    const nx = dx / d, ny = dy / d;
                    const push = (1 - d / range) * state.repelStrength * dt;
                    a.vx -= nx * push; a.vy -= ny * push;
                    b.vx += nx * push; b.vy += ny * push;

                    // rubbery squash on impact
                    if (state.bounce > 0 && d < sumR * 1.05) {
                        const rvx = b.vx - a.vx;
                        const rvy = b.vy - a.vy;
                        const relV = Math.abs(rvx * nx + rvy * ny);
                        if (relV > 0.02) {
                            const kick = relV * state.bounce * 0.15;
                            a.stretchVel -= kick;
                            b.stretchVel -= kick;
                        }
                    }
                }
            }
        }

        // integrate
        for (let i = 0; i < blobs.length; i++) {
            const b = blobs[i];
            b.vx *= dragK;
            b.vy *= dragK;
            const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (sp > maxSp) { b.vx *= maxSp / sp; b.vy *= maxSp / sp; }

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            const margin = Math.min(b.r * 0.8, asp * 0.4);
            if (b.x < margin) { b.x = margin; if (b.vx < 0) b.vx *= -0.4; }
            if (b.x > asp - margin) { b.x = asp - margin; if (b.vx > 0) b.vx *= -0.4; }
            if (b.y < 0.005) { b.y = 0.005; if (b.vy < 0) b.vy *= -0.15; }
            if (b.y > 0.97) { b.y = 0.97; if (b.vy > 0) b.vy *= -0.20; }

            if (b.mergeCd > 0) b.mergeCd -= dt;
        }

        // merging
        if (state.mergeThreshold > 0) {
            for (let i = 0; i < blobs.length; i++) {
                for (let j = i + 1; j < blobs.length; j++) {
                    const a = blobs[i], b = blobs[j];
                    if (a.mergeCd > 0 || b.mergeCd > 0) continue;
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < (a.r + b.r) * state.mergeThreshold) {
                        const a1 = a.r * a.r, a2 = b.r * b.r, tot = a1 + a2;
                        a.x = (a.x * a1 + b.x * a2) / tot;
                        a.y = (a.y * a1 + b.y * a2) / tot;
                        a.vx = (a.vx * a1 + b.vx * a2) / tot;
                        a.vy = (a.vy * a1 + b.vy * a2) / tot;
                        a.temp = (a.temp * a1 + b.temp * a2) / tot;
                        a.r = Math.min(0.4, Math.sqrt(tot));
                        a.mergeCd = state.mergeCooldown;
                        // stretch kick when merging
                        a.stretchVel += 2.0;
                        blobs.splice(j, 1);
                        j--;
                    }
                }
            }
        }

        // splitting
        if (state.splitChance > 0 && blobs.length < MAX_BLOBS) {
            for (let i = 0; i < blobs.length; i++) {
                if (blobs.length >= MAX_BLOBS) break;
                if (blobs.length > target + 1) break;
                const b = blobs[i];
                if (b.mergeCd > 0) continue;
                if (b.r < state.splitSize) continue;
                if (Math.random() > state.splitChance * dt) continue;

                const nr = b.r / Math.SQRT2;
                b.r = nr;
                b.mergeCd = state.mergeCooldown;
                b.stretchVel += 2.5;
                spawnBlob(b.x + rand(-0.03, 0.03), b.y + rand(-0.03, 0.03), nr, b.temp);
                const nb = blobs[blobs.length - 1];
                if (nb) {
                    nb.vx = b.vx + rand(-0.06, 0.06);
                    nb.vy = b.vy + rand(-0.04, 0.04);
                    nb.mergeCd = state.mergeCooldown;
                    nb.stretchVel = 2.5;
                    nb.stretchAngle = b.stretchAngle;
                }
            }
        }

        // spring-driven stretch magnitude + angle from velocity
        for (let i = 0; i < blobs.length; i++) {
            const b = blobs[i];
            const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);

            // angle follows velocity (mod π to avoid snapping on reversal)
            if (sp > 0.02) {
                const targetAngle = Math.atan2(b.vy, b.vx);
                let da = targetAngle - b.stretchAngle;
                while (da > Math.PI / 2) da -= Math.PI;
                while (da <= -Math.PI / 2) da += Math.PI;
                b.stretchAngle += da * Math.min(1, dt * 8);
            }

            // spring toward target stretch
            const speedNorm = Math.min(1, sp / 0.30);
            const targetStretch = 1.0 + speedNorm * state.squish * 0.6;
            b.stretchVel += (targetStretch - b.stretch) * SPRING_K * dt;
            b.stretchVel *= Math.exp(-SPRING_DAMP * dt);
            b.stretch += b.stretchVel * dt;
            b.stretch = clamp(b.stretch, 0.4, 2.5);
        }
    }

    function uploadBlobs() {
        blobData.fill(0);
        blobAngleData.fill(0);
        const n = Math.min(blobs.length, MAX_BLOBS);
        let radiusSum = 0;
        for (let i = 0; i < n; i++) {
            const b = blobs[i];
            blobData[i * 4 + 0] = b.x;
            blobData[i * 4 + 1] = b.y;
            blobData[i * 4 + 2] = b.r;
            blobData[i * 4 + 3] = b.stretch;
            blobAngleData[i] = b.stretchAngle;
            radiusSum += b.r;
        }
        avgRadius = n > 0 ? radiusSum / n : state.blobSize;
    }

    // ------------------------------------------------------------------
    //  render
    // ------------------------------------------------------------------
    function render(t) {
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uniforms.time, t);
        gl.uniform1f(uniforms.aspect, canvas.width / Math.max(1, canvas.height));
        gl.uniform4fv(uniforms.blobs, blobData);
        gl.uniform1fv(uniforms.blobAngles, blobAngleData);
        gl.uniform1f(uniforms.blobRadiusAvg, avgRadius);

        gl.uniform1f(uniforms.poolActive, state.poolActive ? 1 : 0);
        gl.uniform1f(uniforms.poolLevel, state.poolLevel);
        gl.uniform1f(uniforms.poolSoftness, Math.max(0.002, state.poolSoftness));
        gl.uniform1f(uniforms.poolWave, state.poolWave);

        var cA = hexToRgb(state.waxColorA);
        var cB = hexToRgb(state.waxColorB);
        var cG = hexToRgb(state.waxGlowColor);
        var cBgT = hexToRgb(state.bgTop);
        var cBgB = hexToRgb(state.bgBottom);
        var cGlow = hexToRgb(state.glowColor);
        var cSpec = hexToRgb(state.specColor);
        var cVig = hexToRgb(state.vignetteColor);

        gl.uniform3f(uniforms.waxA, cA[0], cA[1], cA[2]);
        gl.uniform3f(uniforms.waxB, cB[0], cB[1], cB[2]);
        gl.uniform3f(uniforms.waxGlowColor, cG[0], cG[1], cG[2]);
        gl.uniform1f(uniforms.waxGlow, state.waxGlow);

        gl.uniform3f(uniforms.bgTop, cBgT[0], cBgT[1], cBgT[2]);
        gl.uniform3f(uniforms.bgBottom, cBgB[0], cBgB[1], cBgB[2]);
        gl.uniform1f(uniforms.lampGlow, state.lampGlow);
        gl.uniform1f(uniforms.glowRadius, state.glowRadius);
        gl.uniform3f(uniforms.glowColor, cGlow[0], cGlow[1], cGlow[2]);
        gl.uniform1f(uniforms.halo, state.halo);
        gl.uniform1f(uniforms.glassCurve, state.glassCurve);

        gl.uniform2f(uniforms.lightDir, Math.cos(state.lightAngle), Math.sin(state.lightAngle));
        gl.uniform3f(uniforms.specColor, cSpec[0], cSpec[1], cSpec[2]);
        gl.uniform1f(uniforms.specStrength, state.specStrength);
        gl.uniform1f(uniforms.specSharp, state.specSharp);
        gl.uniform1f(uniforms.rimStrength, state.rimStrength);
        gl.uniform1f(uniforms.ambient, state.ambient);
        gl.uniform1f(uniforms.diffuse, state.diffuse);
        gl.uniform1f(uniforms.bump, state.bump);
        gl.uniform1f(uniforms.edgeSoft, state.edgeSoft);

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

    // ------------------------------------------------------------------
    //  animation loop
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    //  UI
    // ------------------------------------------------------------------
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