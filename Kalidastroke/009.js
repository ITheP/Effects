function main() {
    let __destroyed = false;
    if (window.__kaleidoApp && typeof window.__kaleidoApp.destroy === 'function') {
        try { window.__kaleidoApp.destroy(); } catch (e) { console.warn('kaleido teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas[data-kaleido]").forEach(c => c.remove());

    const FONT_OPTIONS = [
        { value: 'system-ui, -apple-system, "Segoe UI", sans-serif', label: 'System (Default)' },
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Playfair Display', label: 'Playfair Display' },
        { value: 'Press Start 2P', label: 'Press Start 2P' },
        { value: 'Great Vibes', label: 'Great Vibes' },
        { value: 'Bangers', label: 'Bangers' },
        { value: 'Creepster', label: 'Creepster' },
        { value: 'Lobster', label: 'Lobster' },
        { value: 'Pacifico', label: 'Pacifico' },
        { value: 'VT323', label: 'VT323' },
        { value: 'Courier Prime', label: 'Courier Prime' },
        { value: 'Comic Neue', label: 'Comic Neue' },
        { value: 'Bungee Outline', label: 'Bungee Outline' },
        { value: 'Rock Salt', label: 'Rock Salt' },
        { value: 'Henny Penny', label: 'Henny Penny' },
        { value: 'Schoolbell', label: 'Schoolbell' },
        { value: 'Finger Paint', label: 'Finger Paint' },
        { value: 'Indie Flower', label: 'Indie Flower' },
        { value: 'Princess Sofia', label: 'Princess Sofia' },
        { value: 'Lily Script One', label: 'Lily Script One' },
        { value: 'Crafty Girls', label: 'Crafty Girls' },
    ];
    function fontStackFor(value) {
        if (value.indexOf(',') >= 0) return value;
        return "'" + value + "', monospace";
    }
    (function loadGoogleFonts() {
        const families = FONT_OPTIONS
            .map(f => f.value)
            .filter(v => v.indexOf(',') < 0)
            .map(v => v.replace(/\s+/g, '+') + ':400,700');
        if (!families.length) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + families.join('&family=') + '&display=swap';
        document.head.appendChild(link);
    })();

    const CFG = {
        feedbackAmount: 0.55, feedbackDecay: 0.97, feedbackGamma: 1.0,
        fbRotSpeed: 0.012, fbRotWobble: 0.0, fbRotWobbleSpeed: 0.4,
        fbZoom: 0.9985, fbZoomWobble: 0.0, fbZoomWobbleSpeed: 0.3,
        fbOffsetX: 0.0, fbOffsetY: 0.0, fbBlur: 0.0,
        fbWaveAmp: 0.0, fbWaveFreq: 8.0, fbWaveSpeed: 1.0,
        feedbackRadius: 1.2, feedbackEdge: 0.3,
        wedgeCount: 3.0, foldOffsetX: 0.0, foldOffsetY: 0.0, foldDriftSpeed: 0.0,
        globalRotSpeed: 0.22, pulseAmount: 0.30, pulseSpeed: 0.6, pulseFreq: 6.0, pulseShape: 0,
        spokeAmount: 0.0, spokePow: 2.0,
        twistAmount: 0.0, twistSpeed: 0.3, twistFreq: 1.0,
        swirlStrength: 1.4, swirlAnim: 0.4, swirlRadius: 0.9,
        colorPow: 1.3, colorOffset: 0.02, chromaAngle: 0.0, chromaRadial: 0.0, channelSkew: 1.0,
        paletteMode: 0, hueSpeed: 0.15, hueOffset: 0.0, bandCount: 5.0,
        colorA: '#ff2e88', colorB: '#00e5ff',
        saturation: 1.0, brightness: 1.0, contrast: 1.0,
        vignetteRadius: 0.42, vignetteSoft: 0.22, vignetteColor: '#000000', vignetteAspect: 0.0,
        targetFPS: 60, presetTransitionTime: 3.0,
        freezeTime: 0, autoMorph: 0, morphCycleTime: 10.0,
        showText: 1,
        text: '★ The badger packed his tiny bag, a stripy towel and a sun hat, waddled down the sandy track, dreaming of a seaside snack ★ ',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontSizePct: 0.045, letterSpacingPct: 0.10, radiusPct: 0.32,
        fontSizeVar1: 0.0, fontSizeVar1Speed: 0.5,
        fontSizeVar2: 0.0, fontSizeVar2Speed: 0.8,
        radiusVar1: 0.0, radiusVar1Speed: 0.5,
        textStartAngle: -Math.PI / 2, letterInterval: 0.1,
        textStaticRotSpeed: 0.0,
        textFillColor: '#ffffff', textStrokeColor: '#ff2e88',
        textStrokeWidth: 0.06, textBlur: 0.0,
        textStampAlpha: 1.0, textDisplayLength: 30,
        textBlendMode: 0,
    };

    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                { icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true, label: "Target FPS", savedInPreset: false, details: "Framerate cap." },
                { icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01, label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over." },
                { icon: "⏸️", key: "freezeTime", def: CFG.freezeTime, special: "bool", savedInPreset: false, label: "Freeze Time", details: "Freeze the shader clock." },
                { icon: "🔀", key: "autoMorph", def: CFG.autoMorph, special: "bool", savedInPreset: false, label: "Auto Morph", details: "Cycle random presets." },
                { icon: "🔄", key: "morphCycleTime", def: CFG.morphCycleTime, min: 2, max: 120, step: 0.5, savedInPreset: false, label: "Morph Cycle Time", details: "Seconds between random picks." },
            ]
        },
        {
            heading: "🔤 Text Ring", openByDefault: true, controls: [
                { icon: "👁️", key: "showText", def: CFG.showText, special: "bool", label: "Show Text", details: "Enable circular text stamping." },
                { icon: "🔤", key: "fontFamily", def: CFG.fontFamily, special: "font", label: "Font", details: "Select the font family." },
                { icon: "📏", key: "fontSizePct", def: CFG.fontSizePct, min: 0.01, max: 0.45, step: 0.001, label: "Font Size", details: "Font size × min(W, H)." },
                { icon: "📏", key: "fontSizeVar1", def: CFG.fontSizeVar1, min: 0, max: 20, step: 0.01, label: "Font Size Variance 1", details: "Amplitude of sine wave 1 (± value × font size)." },
                { icon: "⏱️", key: "fontSizeVar1Speed", def: CFG.fontSizeVar1Speed, min: 0, max: 20, step: 0.01, label: "Font Variance 1 Speed", details: "How fast sine wave 1 oscillates." },
                { icon: "📏", key: "fontSizeVar2", def: CFG.fontSizeVar2, min: 0, max: 20, step: 0.01, label: "Font Size Variance 2", details: "Amplitude of sine wave 2 (± value × font size)." },
                { icon: "⏱️", key: "fontSizeVar2Speed", def: CFG.fontSizeVar2Speed, min: 0, max: 20, step: 0.01, label: "Font Variance 2 Speed", details: "How fast sine wave 2 oscillates." },
                { icon: "↔️", key: "letterSpacingPct", def: CFG.letterSpacingPct, min: 0.0, max: 0.5, step: 0.005, label: "Letter Spacing", details: "Extra arc between letters, × font size." },
                { icon: "⭕", key: "radiusPct", def: CFG.radiusPct, min: 0.05, max: 0.49, step: 0.005, label: "Circle Radius", details: "Ring radius × min(W, H)." },
                { icon: "📏", key: "radiusVar1", def: CFG.radiusVar1, min: 0, max: 10, step: 0.01, label: "Radius Variance", details: "Amplitude of radius sine wave (± value × radius)." },
                { icon: "⏱️", key: "radiusVar1Speed", def: CFG.radiusVar1Speed, min: 0, max: 20, step: 0.01, label: "Radius Var Speed", details: "Speed of radius oscillation." },
                { icon: "🎯", key: "textStartAngle", def: CFG.textStartAngle, min: -6.283, max: 6.283, step: 0.01, label: "Start Angle", details: "Radians of the first letter." },
                { icon: "⏱️", key: "letterInterval", def: CFG.letterInterval, min: 0, max: 1, step: 0.01, label: "Letter Delay", details: "Seconds between letters. 0 = whole ring at once." },
                { icon: "🔄", key: "textStaticRotSpeed", def: CFG.textStaticRotSpeed, min: -2, max: 2, step: 0.01, label: "Static Rot Speed", details: "Rotation speed of the static ring (radians/sec)." },
                { icon: "🖼️", key: "textDisplayLength", def: CFG.textDisplayLength, min: 1, max: 60, step: 1, int: true, label: "Display Length", details: "Frames each letter deposits into the effect." },
                { icon: "🔆", key: "textStampAlpha", def: CFG.textStampAlpha, min: 0, max: 2, step: 0.01, label: "Stamp Brightness", details: "Total brightness of the letter when its window ends." },
                { icon: "🎛️", key: "textBlendMode", def: CFG.textBlendMode, special: "select",
                  options: [
                      { value: 0, label: "Add" }, { value: 1, label: "Lighten" }, { value: 2, label: "Screen" },
                      { value: 3, label: "Normal" }, { value: 4, label: "Multiply" }, { value: 5, label: "Darken" },
                      { value: 6, label: "Difference" }, { value: 7, label: "Exclusion" }, { value: 8, label: "Invert" },
                      { value: 9, label: "Inv. Difference" }, { value: 10, label: "Overlay" }, { value: 11, label: "Soft Light" },
                      { value: 12, label: "Hard Light" }, { value: 13, label: "Color Dodge" }, { value: 14, label: "Color Burn" },
                      { value: 15, label: "Subtract" },
                  ], label: "Blend Mode", details: "How stamped letters combine with the scene." },
                { icon: "🎨", key: "textFillColor", def: CFG.textFillColor, special: "color", label: "Text Fill", details: "Fill colour." },
                { icon: "🖊️", key: "textStrokeColor", def: CFG.textStrokeColor, special: "color", label: "Stroke Colour", details: "Outline colour (top of fade)." },
                { icon: "📏", key: "textStrokeWidth", def: CFG.textStrokeWidth, min: 0, max: 0.3, step: 0.002, label: "Stroke Width", details: "Outline width × font size." },
                { icon: "🌫️", key: "textBlur", def: CFG.textBlur, min: 0, max: 1, step: 0.01, label: "Stroke Fade", details: "0 = solid outline, 1 = fully faded to transparent." },
            ]
        },
        {
            heading: "🔁 Feedback Trails", openByDefault: true, controls: [
                { icon: "💧", key: "feedbackAmount", def: CFG.feedbackAmount, min: 0, max: 0.98, step: 0.005, label: "Feedback Amount", details: "How strongly the previous frame bleeds in." },
                { icon: "🍂", key: "feedbackDecay", def: CFG.feedbackDecay, min: -2.0, max: 2.0, step: 0.01, label: "Feedback Decay", details: "Per-frame trail loss." },
                { icon: "🌗", key: "feedbackGamma", def: CFG.feedbackGamma, min: 0.3, max: 3.0, step: 0.01, label: "Feedback Gamma", details: "Nonlinear feedback shaping." },
                { icon: "🌀", key: "fbRotSpeed", def: CFG.fbRotSpeed, min: -3.0, max: 3.0, step: 0.01, label: "FB Rotation", details: "Radians the previous frame rotates." },
                { icon: "🎵", key: "fbRotWobble", def: CFG.fbRotWobble, min: 0, max: 0.3, step: 0.001, label: "FB Rot Wobble", details: "Rotation wobble amplitude." },
                { icon: "⏱️", key: "fbRotWobbleSpeed", def: CFG.fbRotWobbleSpeed, min: 0.01, max: 3, step: 0.01, label: "FB Rot Wobble Speed", details: "Rotation wobble speed." },
                { icon: "🔍", key: "fbZoom", def: CFG.fbZoom, min: 0.0, max: 3.0, step: 0.0001, label: "FB Zoom", details: "<1 = bloom outward, >1 = implode." },
                { icon: "🎵", key: "fbZoomWobble", def: CFG.fbZoomWobble, min: 0, max: 0.05, step: 0.0005, label: "FB Zoom Wobble", details: "Zoom wobble amplitude." },
                { icon: "⏱️", key: "fbZoomWobbleSpeed", def: CFG.fbZoomWobbleSpeed, min: 0.01, max: 3, step: 0.01, label: "FB Zoom Wobble Spd", details: "Zoom wobble speed." },
                { icon: "➡️", key: "fbOffsetX", def: CFG.fbOffsetX, min: -0.02, max: 0.02, step: 0.0005, label: "FB Drift X", details: "Directional drift." },
                { icon: "⬆️", key: "fbOffsetY", def: CFG.fbOffsetY, min: -0.02, max: 0.02, step: 0.0005, label: "FB Drift Y", details: "Directional drift vertically." },
                { icon: "💨", key: "fbBlur", def: CFG.fbBlur, min: 0, max: 3, step: 0.01, label: "FB Blur", details: "5-tap diffusion blur." },
                { icon: "🌊", key: "fbWaveAmp", def: CFG.fbWaveAmp, min: 0, max: 0.1, step: 0.0005, label: "FB Wave Amp", details: "Radial sinusoid displacement." },
                { icon: "📏", key: "fbWaveFreq", def: CFG.fbWaveFreq, min: 0, max: 40, step: 0.1, label: "FB Wave Freq", details: "Ripple radial frequency." },
                { icon: "⏱️", key: "fbWaveSpeed", def: CFG.fbWaveSpeed, min: 0, max: 5, step: 0.01, label: "FB Wave Speed", details: "Ripple speed." },
                { icon: "🎯", key: "feedbackRadius", def: CFG.feedbackRadius, min: 0, max: 2.0, step: 0.01, label: "FB Radius Mask", details: "Feedback zero outside this radius." },
                { icon: "☁️", key: "feedbackEdge", def: CFG.feedbackEdge, min: 0.01, max: 1.0, step: 0.01, label: "FB Edge Softness", details: "Radius mask softness." },
            ]
        },
        {
            heading: "❄️ Kaleidoscope", openByDefault: true, controls: [
                { icon: "🔷", key: "wedgeCount", def: CFG.wedgeCount, min: 1, max: 24, step: 0.5, label: "Wedge Count", details: "Symmetry order." },
                { icon: "🎯", key: "foldOffsetX", def: CFG.foldOffsetX, min: -0.15, max: 0.15, step: 0.001, label: "Fold Offset X", details: "Fold pivot X." },
                { icon: "🎯", key: "foldOffsetY", def: CFG.foldOffsetY, min: -0.15, max: 0.15, step: 0.001, label: "Fold Offset Y", details: "Fold pivot Y." },
                { icon: "🛸", key: "foldDriftSpeed", def: CFG.foldDriftSpeed, min: 0, max: 2, step: 0.01, label: "Fold Drift", details: "Orbit the fold pivot." },
                { icon: "🎡", key: "globalRotSpeed", def: CFG.globalRotSpeed, min: -1, max: 1, step: 0.01, label: "Global Rotation", details: "Slow UV rotation." },
                { icon: "🫧", key: "pulseAmount", def: CFG.pulseAmount, min: -2, max: 2, step: 0.01, label: "Radial Pulse", details: "Breathing strength." },
                { icon: "⏱️", key: "pulseSpeed", def: CFG.pulseSpeed, min: 0, max: 3, step: 0.01, label: "Pulse Speed", details: "Breathing speed." },
                { icon: "📏", key: "pulseFreq", def: CFG.pulseFreq, min: 0, max: 20, step: 0.1, label: "Pulse Frequency", details: "Breathing radial frequency." },
                { icon: "🔔", key: "pulseShape", def: CFG.pulseShape, min: 0, max: 4, step: 1, int: true, label: "Pulse Shape", details: "0=sine,1=square,2=saw,3=triangle,4=abs-sine." },
                { icon: "🌸", key: "spokeAmount", def: CFG.spokeAmount, min: 0, max: 0.5, step: 0.005, label: "Spoke Amount", details: "Radial petals." },
                { icon: "🔪", key: "spokePow", def: CFG.spokePow, min: 0.5, max: 8, step: 0.1, label: "Spoke Sharpness", details: "Petal sharpness." },
            ]
        },
        {
            heading: "🌪️ Twist", openByDefault: false, controls: [
                { icon: "🌀", key: "twistAmount", def: CFG.twistAmount, min: -1, max: 1, step: 0.005, label: "Twist Amount", details: "Shear the UV." },
                { icon: "⏱️", key: "twistSpeed", def: CFG.twistSpeed, min: 0, max: 3, step: 0.01, label: "Twist Speed", details: "Twist speed." },
                { icon: "📏", key: "twistFreq", def: CFG.twistFreq, min: 0.1, max: 10, step: 0.1, label: "Twist Frequency", details: "Twist radial frequency." },
            ]
        },
        {
            heading: "🌊 Swirl", openByDefault: true, controls: [
                { icon: "🌀", key: "swirlStrength", def: CFG.swirlStrength, min: 0, max: 4, step: 0.01, label: "Swirl Strength", details: "Base swirl per channel." },
                { icon: "🎞️", key: "swirlAnim", def: CFG.swirlAnim, min: 0, max: 2, step: 0.01, label: "Swirl Animation", details: "Swirl oscillation." },
                { icon: "📏", key: "swirlRadius", def: CFG.swirlRadius, min: 0.1, max: 3, step: 0.01, label: "Swirl Radius", details: "Swirl falloff radius." },
            ]
        },
        {
            heading: "🎨 Colour", openByDefault: true, controls: [
                { icon: "🎚️", key: "colorPow", def: CFG.colorPow, min: 0.3, max: 4, step: 0.01, label: "Colour Power", details: "Per-channel gamma." },
                { icon: "🌡️", key: "saturation", def: CFG.saturation, min: 0, max: 2, step: 0.01, label: "Saturation", details: "1 = normal." },
                { icon: "☀️", key: "brightness", def: CFG.brightness, min: 0, max: 2, step: 0.01, label: "Brightness", details: "1 = normal." },
                { icon: "📊", key: "contrast", def: CFG.contrast, min: 0.3, max: 3, step: 0.01, label: "Contrast", details: "1 = normal." },
                { icon: "↔️", key: "colorOffset", def: CFG.colorOffset, min: 0, max: 0.1, step: 0.001, label: "Channel Offset", details: "Chromatic aberration distance." },
                { icon: "🧭", key: "chromaAngle", def: CFG.chromaAngle, min: 0, max: 6.283, step: 0.01, label: "Chroma Angle", details: "Aberration direction." },
                { icon: "🎯", key: "chromaRadial", def: CFG.chromaRadial, min: 0, max: 1, step: 0.01, label: "Chroma Radial", details: "0=linear,1=radial." },
                { icon: "🌈", key: "channelSkew", def: CFG.channelSkew, min: 0, max: 2, step: 0.01, label: "Channel Skew", details: "R/G/B divergence." },
                { icon: "🎭", key: "paletteMode", def: CFG.paletteMode, min: 0, max: 3, step: 1, int: true, label: "Palette Mode", details: "0=plasma,1=HSV,2=bands,3=two-colour." },
                { icon: "🔄", key: "hueSpeed", def: CFG.hueSpeed, min: 0, max: 2, step: 0.01, label: "Hue Speed", details: "Hue rotation speed." },
                { icon: "🎨", key: "hueOffset", def: CFG.hueOffset, min: 0, max: 1, step: 0.005, label: "Hue Offset", details: "Static hue shift." },
                { icon: "📊", key: "bandCount", def: CFG.bandCount, min: 2, max: 24, step: 0.1, label: "Band Count", details: "Colour bands (mode 2)." },
                { icon: "🅰️", key: "colorA", def: CFG.colorA, special: "color", label: "Color A", details: "Two-colour first stop." },
                { icon: "🅱️", key: "colorB", def: CFG.colorB, special: "color", label: "Color B", details: "Two-colour second stop." },
            ]
        },
        {
            heading: "🕶️ Vignette", openByDefault: false, controls: [
                { icon: "⭕", key: "vignetteRadius", def: CFG.vignetteRadius, min: 0.0, max: 2.0, step: 0.005, label: "Vignette Radius", details: "Darkening start." },
                { icon: "☁️", key: "vignetteSoft", def: CFG.vignetteSoft, min: 0.01, max: 1.0, step: 0.005, label: "Vignette Softness", details: "Falloff." },
                { icon: "🎨", key: "vignetteColor", def: CFG.vignetteColor, special: "color", label: "Vignette Color", details: "Vignette tint." },
                { icon: "📐", key: "vignetteAspect", def: CFG.vignetteAspect, min: -1, max: 1, step: 0.01, label: "Vignette Aspect", details: "Elliptical squash." },
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
        { name: "Slow Spiral Dream", iteration: 2, values: { feedbackAmount: 0.55, feedbackDecay: 0.985, fbRotSpeed: 0.008, fbZoom: 0.9992, wedgeCount: 6, pulseAmount: 0.15, globalRotSpeed: 0.1 } },
        { name: "Hex Snowflake", iteration: 3, values: { wedgeCount: 6, pulseAmount: 0.35, pulseSpeed: 0.4, pulseFreq: 8, swirlStrength: 2.2, swirlRadius: 1.1, fbRotSpeed: -0.018, fbZoom: 0.9985, colorPow: 1.6 } },
        { name: "Imploding Tunnel", iteration: 4, values: { feedbackAmount: 0.65, feedbackDecay: 0.97, fbZoom: 1.008, fbRotSpeed: 0.024, wedgeCount: 3, pulseAmount: 0.35, globalRotSpeed: 0.3 } },
        { name: "Wind Drift", iteration: 5, values: { fbOffsetX: 0.004, fbRotSpeed: 0.0, fbZoom: 0.999, feedbackAmount: 0.5, feedbackDecay: 0.985, wedgeCount: 4, pulseAmount: 0.1, globalRotSpeed: 0.05 } },
        { name: "Tight Curl", iteration: 6, values: { fbRotSpeed: 0.03, fbZoom: 0.996, feedbackDecay: 0.96, feedbackAmount: 0.6, wedgeCount: 12, pulseAmount: 0.05, swirlStrength: 2.8, swirlAnim: 0.2, colorPow: 1.4 } },
        { name: "Soft Bloom", iteration: 7, values: { feedbackAmount: 0.35, feedbackDecay: 0.97, fbZoom: 0.997, fbRotSpeed: 0.005, wedgeCount: 8, pulseAmount: 0.55, pulseSpeed: 0.35, vignetteRadius: 0.55, vignetteSoft: 0.35, colorPow: 1.0 } },
        { name: "Hot Pulse", iteration: 8, values: { pulseAmount: 3.12, pulseSpeed: 0.6, pulseFreq: 6.0, wedgeCount: 3, feedbackAmount: 0.45, feedbackDecay: 0.94, fbRotSpeed: 0.012, fbZoom: 0.9985 } },
        { name: "Chromatic", iteration: 9, values: { colorOffset: 0.04, channelSkew: 1.6, chromaRadial: 0.5, wedgeCount: 5, pulseAmount: 0.25, swirlStrength: 1.8, swirlAnim: 0.8, colorPow: 1.2 } },
        { name: "Heartbeat Tunnel", iteration: 10, values: { fbRotWobble: 0.04, fbRotWobbleSpeed: 0.9, fbZoomWobble: 0.008, fbZoomWobbleSpeed: 1.4, fbZoom: 0.997, fbRotSpeed: 0.01, feedbackAmount: 0.5, feedbackDecay: 0.97, wedgeCount: 6, pulseAmount: 0.25 } },
        { name: "Warp Drive", iteration: 11, values: { twistAmount: 0.35, twistSpeed: 0.6, twistFreq: 1.2, wedgeCount: 4, fbRotSpeed: 0.015, fbZoom: 1.002, feedbackAmount: 0.55, pulseAmount: 0.15, paletteMode: 1, hueSpeed: 0.4, saturation: 1.3 } },
        { name: "Liquid Mirror", iteration: 12, values: { twistAmount: -0.5, twistSpeed: 0.25, twistFreq: 3.0, fbWaveAmp: 0.008, fbWaveFreq: 12, fbWaveSpeed: 0.6, wedgeCount: 3, feedbackAmount: 0.4, fbZoom: 0.999 } },
        { name: "Off-Center Bloom", iteration: 13, values: { foldOffsetX: 0.08, foldOffsetY: 0.05, foldDriftSpeed: 0.15, wedgeCount: 5, pulseAmount: 0.3, feedbackAmount: 0.45, fbRotSpeed: 0.01 } },
        { name: "Stone in Pond", iteration: 14, values: { fbWaveAmp: 0.02, fbWaveFreq: 18, fbWaveSpeed: 1.2, feedbackAmount: 0.55, feedbackDecay: 0.985, fbZoom: 1.0, fbRotSpeed: 0.0, wedgeCount: 6 } },
        { name: "Neon Bands", iteration: 15, values: { paletteMode: 2, bandCount: 6, saturation: 1.6, contrast: 1.4, colorPow: 1.0, feedbackAmount: 0.4, wedgeCount: 6, pulseAmount: 0.2, fbRotSpeed: 0.008, fbZoom: 0.998 } },
        { name: "Sunset Melter", iteration: 16, values: { paletteMode: 3, colorA: '#ff2e88', colorB: '#ffb347', saturation: 1.2, contrast: 1.1, feedbackAmount: 0.5, feedbackDecay: 0.97, wedgeCount: 5, fbRotSpeed: 0.01, fbZoom: 0.998 } },
        { name: "Cyber Hue", iteration: 17, values: { paletteMode: 1, hueSpeed: 0.35, saturation: 1.4, wedgeCount: 8, pulseAmount: 0.3, pulseSpeed: 0.5, swirlStrength: 2.0, fbRotSpeed: 0.012 } },
        { name: "Inception", iteration: 18, values: { feedbackAmount: 0.5, feedbackDecay: 0.97, wedgeCount: 6, fbRotSpeed: 0.015, fbZoom: 0.998 } },
        { name: "Deep Bloom", iteration: 19, values: { fbBlur: 1.2, feedbackAmount: 0.5, feedbackDecay: 0.985, wedgeCount: 8, pulseAmount: 0.2 } },
        { name: "Vaporwave", iteration: 20, values: { paletteMode: 3, colorA: '#ff6ad5', colorB: '#c774e8', saturation: 1.5, contrast: 1.3, brightness: 1.1, colorOffset: 0.03, chromaAngle: 1.2, chromaRadial: 0.4, wedgeCount: 6, fbRotSpeed: 0.01, fbZoom: 0.998 } },
        { name: "Bleach", iteration: 21, values: { saturation: 0.1, contrast: 1.5, brightness: 1.2, feedbackAmount: 0.5, fbBlur: 0.8, wedgeCount: 6, pulseAmount: 0.15 } },
        { name: "Orb", iteration: 22, values: { feedbackRadius: 0.35, feedbackEdge: 0.15, feedbackAmount: 0.6, feedbackDecay: 0.985, wedgeCount: 8, pulseAmount: 0.2, fbZoom: 0.997, fbRotSpeed: 0.015 } },
        { name: "Portal", iteration: 23, values: { feedbackRadius: 0.5, feedbackEdge: 0.4, vignetteRadius: 0.35, vignetteSoft: 0.25, vignetteColor: '#001133', feedbackAmount: 0.55, fbRotSpeed: 0.02, fbZoom: 1.001, paletteMode: 1, hueSpeed: 0.2 } },
        { name: "Daisy", iteration: 24, values: { spokeAmount: 0.35, spokePow: 3.5, wedgeCount: 6, pulseAmount: 0.15, feedbackAmount: 0.4, fbRotSpeed: 0.005, saturation: 1.3, brightness: 1.1 } },
        { name: "Aster", iteration: 25, values: { spokeAmount: 0.5, spokePow: 1.2, wedgeCount: 12, pulseAmount: 0.05, feedbackAmount: 0.35, fbZoom: 0.999, fbRotSpeed: 0.008 } },
        { name: "Rose Window", iteration: 26, values: { vignetteRadius: 0.45, vignetteSoft: 0.35, vignetteColor: '#3a0016', wedgeCount: 8, spokeAmount: 0.2, spokePow: 4.0, feedbackAmount: 0.45, fbRotSpeed: 0.008, paletteMode: 3, colorA: '#ffb347', colorB: '#c70039' } },
        { name: "Frost", iteration: 27, values: { feedbackGamma: 1.8, fbBlur: 0.5, saturation: 0.6, brightness: 1.15, contrast: 1.2, wedgeCount: 6, feedbackAmount: 0.45, fbRotSpeed: 0.01 } },
        { name: "Mist", iteration: 28, values: { feedbackGamma: 0.5, fbBlur: 1.5, saturation: 0.9, contrast: 0.85, feedbackAmount: 0.55, feedbackDecay: 0.99, wedgeCount: 4, fbRotSpeed: 0.005, fbZoom: 0.9995 } },
        { name: "Ink Bleed", iteration: 29, values: { fbBlur: 2.2, saturation: 0.2, brightness: 1.15, contrast: 1.5, feedbackAmount: 0.6, feedbackDecay: 0.985, wedgeCount: 5, pulseAmount: 0.1 } },
        { name: "Square Breath", iteration: 30, values: { pulseShape: 1, pulseAmount: 0.35, pulseSpeed: 0.4, pulseFreq: 4, wedgeCount: 6, fbRotSpeed: 0.01, feedbackAmount: 0.45 } },
        { name: "Sawtooth Churn", iteration: 31, values: { pulseShape: 2, pulseAmount: 0.25, pulseSpeed: 0.8, pulseFreq: 3, twistAmount: 0.2, twistSpeed: 0.4, wedgeCount: 4, fbRotSpeed: 0.015 } },
        { name: "Lens Whisper", iteration: 32, values: { chromaAngle: 3.14, chromaRadial: 1.0, colorOffset: 0.02, wedgeCount: 6, saturation: 1.2, feedbackAmount: 0.4, fbRotSpeed: 0.008 } },
        { name: "Storyteller", iteration: 33, values: { showText: 1, textFillColor: '#fff8e0', textStrokeColor: '#ff2e88', textStrokeWidth: 0.05, textBlur: 0.35, fontSizePct: 0.04, letterSpacingPct: 0.15, radiusPct: 0.36, letterInterval: 0.2, textDisplayLength: 1, textStampAlpha: 1.2, textBlendMode: 0, paletteMode: 3, colorA: '#2a1a3a', colorB: '#553377', feedbackAmount: 0.8, feedbackDecay: 0.99, wedgeCount: 6, fbRotSpeed: 0.008, fbZoom: 0.998, saturation: 0.9 } },
        { name: "Neon Sign", iteration: 34, values: { showText: 1, textFillColor: '#e0ffff', textStrokeColor: '#00f5ff', textStrokeWidth: 0.09, textBlur: 0.0, fontSizePct: 0.05, letterSpacingPct: 0.12, radiusPct: 0.30, letterInterval: 0.12, textDisplayLength: 2, textStampAlpha: 1.0, textBlendMode: 3, feedbackAmount: 0.85, feedbackDecay: 0.985, fbBlur: 0.6, saturation: 1.4, brightness: 1.2 } },
        { name: "Ghost Letters", iteration: 35, values: { showText: 1, textFillColor: '#ffffff', textStrokeColor: '#8888ff', textStrokeWidth: 0.03, textBlur: 0.95, fontSizePct: 0.055, letterSpacingPct: 0.25, radiusPct: 0.34, letterInterval: 0.5, textDisplayLength: 1, textStampAlpha: 0.8, textBlendMode: 2, feedbackAmount: 0.7, feedbackDecay: 0.985, wedgeCount: 4, fbRotSpeed: 0.005, fbZoom: 0.999 } },
    ];

    function fontVarianceAt(t) {
        const wave1 = Math.sin(t * state.fontSizeVar1Speed);
        const wave2 = Math.sin(t * state.fontSizeVar2Speed + 1.7);
        return (state.fontSizeVar1 * wave1 + state.fontSizeVar2 * wave2) * 0.1;
    }

    function radiusVarianceAt(t) {
        return (state.radiusVar1 * Math.sin(t * state.radiusVar1Speed)) * 0.1;
    }

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
    function hexWithAlpha(hex, alpha) {
        let h = (hex || '#000000').replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
        return '#' + h.slice(0, 6) + a;
    }

    let state = Object.assign({}, CFG);
    const groupClipboard = {};

    let transitionActive = false;
    let transitionStart = 0;
    let transitionDur = 0;
    let transitionSource = null;
    let transitionTarget = null;
    let lastMorphTime = 0;
    let frozenTime = 0;
    let freezeStart = 0;

    let textChars = Array.from(state.text || '');
    let textWidthCache = [];
    let textLayoutDirty = true;
    let textLetterCursor = 0;
    let textLastTick = 0;
    let staticRotAngle = 0;
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { textLayoutDirty = true; });
    }

    const stampCanvas = document.createElement('canvas');
    const stampCtx = stampCanvas.getContext('2d');
    let activeLetters = [];

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

    var gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false });
    if (!gl) { console.log('WebGL not supported'); return; }

    var feedbackFBOs = [null, null];
    var feedbackTextures = [null, null];
    var fbIndex = 0;
    var program = null;
    var uniforms = {};

    var glyphTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    function resizeCanvas() {
        canvas.width = Math.max(1, window.innerWidth);
        canvas.height = Math.max(1, window.innerHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);
        stampCanvas.width = canvas.width;
        stampCanvas.height = canvas.height;
        textLayoutDirty = true;
        rebuildFeedback();
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
        uniform sampler2D feedbackTex;
        uniform sampler2D glyph;
        uniform float glyphAlpha;
        uniform float isFinalPass;
        uniform float glyphBlendMode;
        uniform float feedbackAmount;
        uniform float feedbackDecay;
        uniform float feedbackGamma;
        uniform float fbRotSpeed;
        uniform float fbRotWobble;
        uniform float fbRotWobbleSpeed;
        uniform float fbZoom;
        uniform float fbZoomWobble;
        uniform float fbZoomWobbleSpeed;
        uniform vec2  fbOffset;
        uniform float fbBlur;
        uniform float fbWaveAmp;
        uniform float fbWaveFreq;
        uniform float fbWaveSpeed;
        uniform float feedbackRadius;
        uniform float feedbackEdge;
        uniform float wedgeCount;
        uniform vec2  foldOffset;
        uniform float foldDriftSpeed;
        uniform float globalRotSpeed;
        uniform float pulseAmount;
        uniform float pulseSpeed;
        uniform float pulseFreq;
        uniform float pulseShape;
        uniform float spokeAmount;
        uniform float spokePow;
        uniform float twistAmount;
        uniform float twistSpeed;
        uniform float twistFreq;
        uniform float swirlStrength;
        uniform float swirlAnim;
        uniform float swirlRadius;
        uniform float colorPow;
        uniform float colorOffset;
        uniform float chromaAngle;
        uniform float chromaRadial;
        uniform float channelSkew;
        uniform float paletteMode;
        uniform float hueSpeed;
        uniform float hueOffset;
        uniform float bandCount;
        uniform vec3  colorA;
        uniform vec3  colorB;
        uniform float saturation;
        uniform float brightness;
        uniform float contrast;
        uniform float vignetteRadius;
        uniform float vignetteSoft;
        uniform vec3  vignetteColor;
        uniform float vignetteAspect;

        float plasma(vec2 p, float t) {
            float v = sin(p.x * 3.1 + t * 0.7);
            v += sin(p.y * 2.7 - t * 0.9);
            v += sin((p.x + p.y) * 2.2 + t * 1.1);
            v += sin(length(p - 0.5) * 8.0 - t * 1.3);
            return v * 0.25;
        }
        vec2 rot(vec2 p, float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
        }
        vec2 swirl(vec2 p, float strength, float radius) {
            float d = length(p);
            float falloff = 1.0 / (d * radius + 0.4);
            float angle = strength * falloff;
            return rot(p, angle);
        }
        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        float pulseFn(float x) {
            if (pulseShape < 0.5) return sin(x);
            if (pulseShape < 1.5) return sign(sin(x));
            if (pulseShape < 2.5) return 2.0 * fract(x / 6.2831853) - 1.0;
            if (pulseShape < 3.5) return abs(2.0 * fract(x / 6.2831853) - 1.0) * 2.0 - 1.0;
            return abs(sin(x) * 2.0 - 1.0);
        }

        vec3 blendMultiply(vec3 a, vec3 b) { return a * b; }
        vec3 blendScreen(vec3 a, vec3 b)   { return 1.0 - (1.0 - a) * (1.0 - b); }
        vec3 blendOverlay(vec3 a, vec3 b)  { return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a)); }
        vec3 blendHardLight(vec3 a, vec3 b) { return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, b)); }
        vec3 blendSoftLight(vec3 a, vec3 b) {
            vec3 d = mix(sqrt(a), ((16.0*a - 12.0)*a + 4.0)*a, step(0.25, a));
            return mix(a - (1.0 - 2.0*b)*a*(1.0 - a), a + (2.0*b - 1.0)*(d - a), step(0.5, b));
        }
        vec3 blendColorDodge(vec3 a, vec3 b) {
            return mix(min(vec3(1.0), a / max(1.0 - b, vec3(1.0/255.0))), vec3(1.0), step(1.0, b));
        }
        vec3 blendColorBurn(vec3 a, vec3 b) {
            return mix(1.0 - min(vec3(1.0), (1.0 - a) / max(b, vec3(1.0/255.0))), vec3(0.0), step(b, vec3(0.0)));
        }

        vec3 applyBlend(vec3 scene, vec3 glyphC, float amt, float mode) {
            vec3 s = clamp(scene, 0.0, 1.0);
            vec3 g = clamp(glyphC, 0.0, 1.0);
            vec3 res;
            if (mode < 0.5) return scene + glyphC * amt;
            else if (mode < 1.5) res = max(s, g);
            else if (mode < 2.5) res = blendScreen(s, g);
            else if (mode < 3.5) return mix(scene, glyphC, amt);
            else if (mode < 4.5) res = blendMultiply(s, g);
            else if (mode < 5.5) res = min(s, g);
            else if (mode < 6.5) res = abs(s - g);
            else if (mode < 7.5) res = s + g - 2.0 * s * g;
            else if (mode < 8.5) return mix(scene, 1.0 - s, amt);
            else if (mode < 9.5) res = abs(s - (1.0 - g));
            else if (mode < 10.5) res = blendOverlay(s, g);
            else if (mode < 11.5) res = blendSoftLight(s, g);
            else if (mode < 12.5) res = blendHardLight(s, g);
            else if (mode < 13.5) res = blendColorDodge(s, g);
            else if (mode < 14.5) res = blendColorBurn(s, g);
            else return max(scene - glyphC * amt, 0.0);
            return mix(scene, res, amt);
        }

        void main() {
            if (isFinalPass > 0.5) {
                gl_FragColor = vec4(texture2D(feedbackTex, v_texCoord).rgb, 1.0);
                return;
            }

            vec2 uv = v_texCoord - 0.5;
            float r = length(uv);

            if (abs(twistAmount) > 0.0001) {
                float tw = twistAmount * sin(time * twistSpeed + r * twistFreq * 6.2831853);
                uv.x += uv.y * tw * 0.5;
            }
            uv = rot(uv, time * globalRotSpeed);

            vec2 foldOff = foldOffset;
            if (foldDriftSpeed > 0.0001) {
                foldOff += vec2(sin(time * foldDriftSpeed * 0.7) * 0.05, cos(time * foldDriftSpeed * 0.9) * 0.05);
            }
            vec2 fp = uv - foldOff;
            float rr = length(fp);
            float a = atan(fp.y, fp.x);
            a = abs(mod(a + 3.14159265 / wedgeCount, 6.2831853 / wedgeCount) - 3.14159265 / wedgeCount);
            vec2 kp = vec2(cos(a), sin(a)) * rr;
            kp += foldOff;

            if (spokeAmount > 0.0001) {
                float sp = pow(abs(sin(a * wedgeCount * 0.5)), spokePow);
                kp *= 1.0 + spokeAmount * sp;
            }
            kp *= 1.0 + pulseAmount * pulseFn(time * pulseSpeed + r * pulseFreq);

            float sBase = swirlStrength;
            float anim  = swirlAnim;
            vec2 kpR = swirl(kp,  sBase * (1.0 + 0.28 * channelSkew) + anim * 0.4 * sin(time * 0.5), swirlRadius);
            vec2 kpG = swirl(kp, -sBase * (1.0 + 0.21 * channelSkew) + anim * 0.5 * sin(time * 0.7 + 1.3), swirlRadius);
            vec2 kpB = swirl(kp,  sBase * (1.0 + 0.50 * channelSkew) + anim * 0.6 * sin(time * 0.4 + 2.6), swirlRadius);
            kpR = rot(kpR,  time * 0.15);
            kpG = rot(kpG, -time * 0.15);
            kpB = rot(kpB,  time * 0.30);

            float tR = time * 0.9;
            float tG = time * 0.9 + 0.7;
            float tB = time * 0.9 + 1.4;

            vec2 off = vec2(cos(chromaAngle), sin(chromaAngle)) * colorOffset;
            vec2 radialOff = normalize(kp + vec2(0.0001)) * colorOffset * r;
            off = mix(off, radialOff, chromaRadial);

            float rCh = plasma(kpR + off, tR);
            float gCh = plasma(kpG, tG);
            float bCh = plasma(kpB - off, tB);
            rCh = pow(0.5 + 0.5 * rCh, colorPow);
            gCh = pow(0.5 + 0.5 * gCh, colorPow);
            bCh = pow(0.5 + 0.5 * bCh, colorPow);
            vec3 color = vec3(rCh, gCh, bCh);

            if (paletteMode > 0.5) {
                vec3 hsv = rgb2hsv(color);
                hsv.x = fract(hsv.x + hueOffset + time * hueSpeed);
                color = hsv2rgb(hsv);
            }
            if (paletteMode > 1.5 && paletteMode < 2.5) {
                float lum = dot(color, vec3(0.299, 0.587, 0.114));
                float bands = max(2.0, bandCount);
                float q = floor(lum * bands) / (bands - 1.0);
                color = mix(color, vec3(q), 0.7);
            }
            if (paletteMode > 2.5) {
                float lum = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(colorA, colorB, clamp(lum, 0.0, 1.0));
            }

            vec2 fbUv = v_texCoord - 0.5;
            float fbR = length(fbUv);

            if (fbWaveAmp > 0.0001 && fbR > 0.0001) {
                float wave = sin(fbR * fbWaveFreq - time * fbWaveSpeed * 6.2831853);
                fbUv += (fbUv / fbR) * wave * fbWaveAmp;
            }
            float rotAngle = fbRotSpeed;
            if (fbRotWobble > 0.0001) rotAngle += sin(time * fbRotWobbleSpeed) * fbRotWobble;
            fbUv = rot(fbUv, rotAngle);

            float zoomVal = fbZoom;
            if (fbZoomWobble > 0.0001) zoomVal += sin(time * fbZoomWobbleSpeed + 1.7) * fbZoomWobble;
            fbUv *= zoomVal;
            fbUv += fbOffset;
            fbUv += 0.5;

            vec3 prev = texture2D(feedbackTex, fbUv).rgb;
            if (fbBlur > 0.001) {
                float br = fbBlur * 0.003;
                vec3 blur = prev * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( br,  0.0)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2(-br,  0.0)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( 0.0,  br)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( 0.0, -br)).rgb * 0.2;
                prev = blur;
            }
            if (abs(feedbackGamma - 1.0) > 0.01) {
                prev = pow(max(prev, vec3(0.0001)), vec3(feedbackGamma));
            }
            if (feedbackRadius < 1.99) {
                float mask = 1.0 - smoothstep(feedbackRadius, feedbackRadius + feedbackEdge, fbR);
                prev *= mask;
            }

            color = color + prev * feedbackAmount * feedbackDecay;

            if (glyphAlpha > 0.0001) {
                vec4 g = texture2D(glyph, v_texCoord);
                float ga = g.a * glyphAlpha;
                color = applyBlend(color, g.rgb, ga, glyphBlendMode);
            }

            if (abs(saturation - 1.0) > 0.001) {
                float lum = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(lum), color, saturation);
            }
            color *= brightness;
            if (abs(contrast - 1.0) > 0.001) {
                color = pow(max(color, vec3(0.0001)), vec3(contrast));
            }

            vec2 vUv = v_texCoord - 0.5;
            vUv.x *= (1.0 + vignetteAspect);
            vUv.y *= (1.0 - vignetteAspect);
            float vr = length(vUv);
            float vg = smoothstep(vignetteRadius, vignetteRadius + vignetteSoft, vr);
            color = mix(color, vignetteColor, vg);

            gl_FragColor = vec4(color, 1.0);
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
    gl.useProgram(program);

    [
        "time", "feedbackTex", "glyph", "isFinalPass",
        "glyphAlpha", "glyphBlendMode",
        "feedbackAmount", "feedbackDecay", "feedbackGamma",
        "fbRotSpeed", "fbRotWobble", "fbRotWobbleSpeed",
        "fbZoom", "fbZoomWobble", "fbZoomWobbleSpeed",
        "fbOffset", "fbBlur", "fbWaveAmp", "fbWaveFreq", "fbWaveSpeed",
        "feedbackRadius", "feedbackEdge",
        "wedgeCount", "foldOffset", "foldDriftSpeed",
        "globalRotSpeed", "pulseAmount", "pulseSpeed", "pulseFreq", "pulseShape",
        "spokeAmount", "spokePow",
        "twistAmount", "twistSpeed", "twistFreq",
        "swirlStrength", "swirlAnim", "swirlRadius",
        "colorPow", "colorOffset", "chromaAngle", "chromaRadial", "channelSkew",
        "paletteMode", "hueSpeed", "hueOffset", "bandCount", "colorA", "colorB",
        "saturation", "brightness", "contrast",
        "vignetteRadius", "vignetteSoft", "vignetteColor", "vignetteAspect"
    ].forEach(n => { uniforms[n] = gl.getUniformLocation(program, n); });

    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    function createFeedbackTarget(w, h) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { fbo: fbo, tex: tex };
    }

    function rebuildFeedback() {
        if (!program) return;
        for (var i = 0; i < 2; i++) {
            if (feedbackFBOs[i]) { gl.deleteFramebuffer(feedbackFBOs[i]); feedbackFBOs[i] = null; }
            if (feedbackTextures[i]) { gl.deleteTexture(feedbackTextures[i]); feedbackTextures[i] = null; }
        }
        var a = createFeedbackTarget(canvas.width, canvas.height);
        var b = createFeedbackTarget(canvas.width, canvas.height);
        feedbackFBOs[0] = a.fbo; feedbackTextures[0] = a.tex;
        feedbackFBOs[1] = b.fbo; feedbackTextures[1] = b.tex;

        fbIndex = 0;
    }

    function getCharWidth(idx, fontPx) {
        const key = fontPx.toFixed(2);
        const map = textWidthCache[idx];
        if (!map) return 0;
        let w = map.get(key);
        if (w === undefined) {
            stampCtx.save();
            stampCtx.font = '700 ' + fontPx + 'px ' + fontStackFor(state.fontFamily);
            w = stampCtx.measureText(textChars[idx]).width;
            stampCtx.restore();
            map.set(key, w);
            if (map.size > 128) {
                const firstKey = map.keys().next().value;
                map.delete(firstKey);
            }
        }
        return w;
    }

    function recomputeTextLayout() {
        const u = Math.min(stampCanvas.width, stampCanvas.height);
        const baseFontPx = Math.max(1, u * state.fontSizePct);
        stampCtx.font = '700 ' + baseFontPx + 'px ' + fontStackFor(state.fontFamily);
        textChars = Array.from(state.text || '');
        textWidthCache = new Array(textChars.length);
        for (let i = 0; i < textChars.length; i++) {
            textWidthCache[i] = new Map();
            textWidthCache[i].set(baseFontPx.toFixed(2), stampCtx.measureText(textChars[i]).width);
        }
        textLayoutDirty = false;
    }

    function bakeLetterBitmap(idx, angle, sizeVar = 0, radiusOverride = null) {
        if (!textChars.length) return null;
        idx = ((idx % textChars.length) + textChars.length) % textChars.length;

        const u = Math.min(stampCanvas.width, stampCanvas.height);
        const baseFontPx = Math.max(1, u * state.fontSizePct);
        const fontPx = Math.max(1, baseFontPx * (1 + sizeVar));
        const radiusPx = radiusOverride !== null ? radiusOverride : u * state.radiusPct;

        const cx = stampCanvas.width / 2;
        const cy = stampCanvas.height / 2;

        const ch = textChars[idx];
        const x = cx + Math.cos(angle) * radiusPx;
        const y = cy + Math.sin(angle) * radiusPx;

        const strokePx = Math.max(0.5, fontPx * state.textStrokeWidth);
        const pad = Math.ceil(fontPx * 0.6 + strokePx);
        const w = Math.ceil(fontPx * 1.5) + pad * 2;
        const h = Math.ceil(fontPx * 1.5) + pad * 2;

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const cc = c.getContext('2d');
        cc.font = '700 ' + fontPx + 'px ' + fontStackFor(state.fontFamily);
        cc.textAlign = 'center';
        cc.textBaseline = 'middle';
        cc.translate(w / 2, h / 2);

        cc.fillStyle = state.textFillColor || '#ffffff';
        cc.fillText(ch, 0, 0);

        if (state.textStrokeWidth > 0) {
            const col = state.textStrokeColor;
            const blur = Math.max(0, Math.min(1, state.textBlur));

            cc.lineWidth = strokePx;
            cc.lineJoin = 'round';
            cc.lineCap = 'round';
            cc.strokeStyle = col;

            if (blur > 0.01) {
                const tmp = document.createElement('canvas');
                tmp.width = w;
                tmp.height = h;
                const tc = tmp.getContext('2d');
                tc.font = '700 ' + fontPx + 'px ' + fontStackFor(state.fontFamily);
                tc.textAlign = 'center';
                tc.textBaseline = 'middle';
                tc.translate(w / 2, h / 2);
                tc.lineWidth = strokePx;
                tc.lineJoin = 'round';
                tc.lineCap = 'round';
                tc.strokeStyle = col;
                tc.strokeText(ch, 0, 0);

                cc.save();
                cc.filter = 'blur(' + (blur * fontPx * 0.02) + 'px)';
                cc.drawImage(tmp, -w / 2, -h / 2);
                cc.restore();
            } else {
                cc.strokeText(ch, 0, 0);
            }
        }

        return { bitmap: c, w, h, x, y, angle: angle + Math.PI / 2 };
    }

    function renderActiveLettersToCanvas() {
        stampCtx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
        if (activeLetters.length === 0) return;
        for (let i = 0; i < activeLetters.length; i++) {
            const L = activeLetters[i];
            if (!L.bitmap) continue;
            stampCtx.save();
            stampCtx.translate(L.x, L.y);
            stampCtx.rotate(L.angle);
            stampCtx.drawImage(L.bitmap, -L.w / 2, -L.h / 2);
            stampCtx.restore();
        }
    }

    function uploadGlyph() {
        gl.bindTexture(gl.TEXTURE_2D, glyphTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, stampCanvas);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    resizeCanvas();
    rebuildFeedback();
    window.addEventListener('resize', resizeCanvas);

    var lastFrameTime = 0;
    var startTime = performance.now();

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
                textLayoutDirty = true;
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
                textLayoutDirty = true;
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

        let shaderTime;
        if (state.freezeTime) {
            if (!freezeStart) freezeStart = now;
            shaderTime = (frozenTime > 0 ? frozenTime : (freezeStart - startTime)) * 0.001;
        } else {
            if (freezeStart) { frozenTime = now - startTime; freezeStart = 0; }
            shaderTime = (now - startTime) * 0.001;
        }

        if (textLayoutDirty) {
            recomputeTextLayout();
            state._textAllStamped = false;
            staticRotAngle = state.textStartAngle + (shaderTime * state.textStaticRotSpeed);
        }

        var frameInterval = 1000 / Math.max(1, state.targetFPS);

        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            var depositAlpha = 0;

            if (state.showText && textChars.length > 0 && !state.freezeTime) {
                if (!textLastTick) textLastTick = now;

                if (state.letterInterval <= 0) {
                    // --- STATIC RING MODE ---
                    state._textAllStamped = false;
                    
                    const u = Math.min(stampCanvas.width, stampCanvas.height);
                    const baseFontPx = Math.max(1, u * state.fontSizePct);
                    const radiusPx = u * state.radiusPct;
                    const cx = stampCanvas.width / 2;
                    const cy = stampCanvas.height / 2;

                    stampCtx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
                    
                    let angleAcc = state.textStartAngle;
                    let placedCount = 0;
                    
                    staticRotAngle = state.textStartAngle + (shaderTime * state.textStaticRotSpeed);

                    for (let i = 0; i < textChars.length; i++) {
                        const spacingPx = baseFontPx * state.letterSpacingPct;
                        const advance = Math.max(0.001, getCharWidth(i, baseFontPx) + spacingPx);
                        const charAngle = angleAcc + (advance / radiusPx) / 2;
                        
                        if (placedCount > 0 && (charAngle - state.textStartAngle) > Math.PI * 2 - (advance / radiusPx)) {
                            break;
                        }

                        const sizeVar = fontVarianceAt(shaderTime);
                        const radiusVar = radiusVarianceAt(shaderTime + i);
                        const finalFontPx = Math.max(1, baseFontPx * (1 + sizeVar));
                        const finalRadiusPx = radiusPx * (1 + radiusVar);
                        
                        const finalAngle = charAngle + staticRotAngle - state.textStartAngle;
                        const x = cx + Math.cos(finalAngle) * finalRadiusPx;
                        const y = cy + Math.sin(finalAngle) * finalRadiusPx;

                        const ch = textChars[i];
                        const strokePx = Math.max(0.5, finalFontPx * state.textStrokeWidth);
                        const pad = Math.ceil(finalFontPx * 0.6 + strokePx);
                        const w = Math.ceil(finalFontPx * 1.5) + pad * 2;
                        const h = Math.ceil(finalFontPx * 1.5) + pad * 2;

                        const c = document.createElement('canvas');
                        c.width = w; c.height = h;
                        const cc = c.getContext('2d');
                        cc.font = '700 ' + finalFontPx + 'px ' + fontStackFor(state.fontFamily);
                        cc.textAlign = 'center';
                        cc.textBaseline = 'middle';
                        cc.translate(w / 2, h / 2);
                        cc.fillStyle = state.textFillColor || '#ffffff';
                        cc.fillText(ch, 0, 0);

                        if (state.textStrokeWidth > 0) {
                            const col = state.textStrokeColor;
                            const blur = Math.max(0, Math.min(1, state.textBlur));
                            cc.lineWidth = strokePx;
                            cc.lineJoin = 'round';
                            cc.lineCap = 'round';
                            cc.strokeStyle = col;
                            
                            if (blur > 0.01) {
                                const tmp = document.createElement('canvas');
                                tmp.width = w; tmp.height = h;
                                const tc = tmp.getContext('2d');
                                tc.font = '700 ' + finalFontPx + 'px ' + fontStackFor(state.fontFamily);
                                tc.textAlign = 'center';
                                tc.textBaseline = 'middle';
                                tc.translate(w / 2, h / 2);
                                tc.lineWidth = strokePx;
                                tc.lineJoin = 'round';
                                tc.lineCap = 'round';
                                tc.strokeStyle = col;
                                tc.strokeText(ch, 0, 0);

                                cc.save();
                                cc.filter = 'blur(' + (blur * finalFontPx * 0.02) + 'px)';
                                cc.drawImage(tmp, -w / 2, -h / 2);
                                cc.restore();
                            } else {
                                cc.strokeText(ch, 0, 0);
                            }
                        }

                        stampCtx.save();
                        stampCtx.translate(x, y);
                        stampCtx.rotate(finalAngle + Math.PI / 2);
                        stampCtx.drawImage(c, -w / 2, -h / 2);
                        stampCtx.restore();

                        angleAcc += advance / radiusPx;
                        placedCount++;
                    }
                    
                    uploadGlyph();
                    depositAlpha = state.textStampAlpha;

                } else {
                    // --- TYPEWRITER / FLOWING MODE ---
                    if (state._textAllStamped) {
                        activeLetters.length = 0;
                        state._textAllStamped = false;
                        stampCtx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
                        uploadGlyph();
                        depositAlpha = 0;
                    }

                    if (state._textCurrentAngle === null || state._textCurrentAngle === undefined) {
                        state._textCurrentAngle = state.textStartAngle;
                    }

                    const dtSec = (now - textLastTick) / 1000;
                    if (dtSec >= state.letterInterval) {
                        textLastTick = now;
                        const idx = textLetterCursor;
                        textLetterCursor = (textLetterCursor + 1) % textChars.length;
                        
                        const u = Math.min(stampCanvas.width, stampCanvas.height);
                        const baseFontPx = Math.max(1, u * state.fontSizePct);
                        const radiusPx = u * state.radiusPct;

                        const sizeVar = fontVarianceAt(shaderTime);
                        const radiusVar = radiusVarianceAt(shaderTime);
                        const fontPx = Math.max(1, baseFontPx * (1 + sizeVar));
                        const spacingPx = fontPx * state.letterSpacingPct;
                        const advance = Math.max(0.001, getCharWidth(idx, fontPx) + spacingPx);
                        const charAngle = state._textCurrentAngle + (advance / radiusPx) / 2;

                        state._textCurrentAngle += advance / radiusPx;
                        if (state._textCurrentAngle > Math.PI * 2) state._textCurrentAngle -= Math.PI * 2;

                        const lifetime = Math.max(1, Math.round(state.textDisplayLength));
                        const finalRadiusPx = radiusPx * (1 + radiusVar);
                        
                        const baked = bakeLetterBitmap(idx, charAngle, sizeVar, finalRadiusPx);
                        
                        if (baked) {
                            activeLetters.push({
                                framesLeft: lifetime,
                                totalFrames: lifetime,
                                bitmap: baked.bitmap,
                                w: baked.w, h: baked.h,
                                x: baked.x, y: baked.y,
                                angle: baked.angle,
                            });
                        }
                    }

                    for (let i = activeLetters.length - 1; i >= 0; i--) {
                        if (activeLetters[i].framesLeft <= 0) {
                            activeLetters.splice(i, 1);
                        }
                    }

                    if (activeLetters.length > 0) {
                        stampCtx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
                        let maxAlpha = 0;

                        for (let i = 0; i < activeLetters.length; i++) {
                            const L = activeLetters[i];
                            if (!L.bitmap) continue;
                            
                            const progress = 1.0 - (L.framesLeft / L.totalFrames);
                            const opacity = Math.max(0, 1.0 - progress);
                            
                            if (opacity > 0.01) {
                                stampCtx.save();
                                stampCtx.globalAlpha = opacity;
                                stampCtx.translate(L.x, L.y);
                                stampCtx.rotate(L.angle);
                                stampCtx.drawImage(L.bitmap, -L.w / 2, -L.h / 2);
                                stampCtx.restore();
                                if (opacity > maxAlpha) maxAlpha = opacity;
                            }
                        }
                        
                        uploadGlyph();
                        
                        const isDarkMode = (state.textBlendMode >= 4 && state.textBlendMode <= 5) || 
                                           state.textBlendMode === 14 || 
                                           state.textBlendMode === 15;

                        if (isDarkMode) {
                            depositAlpha = state.textStampAlpha;
                        } else {
                            depositAlpha = state.textStampAlpha * maxAlpha;
                        }
                    } else {
                        stampCtx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
                        uploadGlyph();
                        depositAlpha = 0;
                    }

                    for (let i = 0; i < activeLetters.length; i++) {
                        activeLetters[i].framesLeft--;
                    }
                }
            }

            var readTex = feedbackTextures[fbIndex];
            var writeFBO = feedbackFBOs[1 - fbIndex];

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(uniforms.feedbackTex, 0);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, glyphTex);
            gl.uniform1i(uniforms.glyph, 2);

            gl.uniform1f(uniforms.glyphAlpha, depositAlpha);
            gl.uniform1f(uniforms.glyphBlendMode, state.textBlendMode);

            gl.uniform1f(uniforms.feedbackAmount, state.feedbackAmount);
            gl.uniform1f(uniforms.feedbackDecay, state.feedbackDecay);
            gl.uniform1f(uniforms.feedbackGamma, state.feedbackGamma);
            gl.uniform1f(uniforms.fbRotSpeed, state.fbRotSpeed);
            gl.uniform1f(uniforms.fbRotWobble, state.fbRotWobble);
            gl.uniform1f(uniforms.fbRotWobbleSpeed, state.fbRotWobbleSpeed);
            gl.uniform1f(uniforms.fbZoom, state.fbZoom);
            gl.uniform1f(uniforms.fbZoomWobble, state.fbZoomWobble);
            gl.uniform1f(uniforms.fbZoomWobbleSpeed, state.fbZoomWobbleSpeed);
            gl.uniform2f(uniforms.fbOffset, state.fbOffsetX, state.fbOffsetY);
            gl.uniform1f(uniforms.fbBlur, state.fbBlur);
            gl.uniform1f(uniforms.fbWaveAmp, state.fbWaveAmp);
            gl.uniform1f(uniforms.fbWaveFreq, state.fbWaveFreq);
            gl.uniform1f(uniforms.fbWaveSpeed, state.fbWaveSpeed);
            gl.uniform1f(uniforms.feedbackRadius, state.feedbackRadius);
            gl.uniform1f(uniforms.feedbackEdge, state.feedbackEdge);
            gl.uniform1f(uniforms.wedgeCount, state.wedgeCount);
            gl.uniform2f(uniforms.foldOffset, state.foldOffsetX, state.foldOffsetY);
            gl.uniform1f(uniforms.foldDriftSpeed, state.foldDriftSpeed);
            gl.uniform1f(uniforms.globalRotSpeed, state.globalRotSpeed);
            gl.uniform1f(uniforms.pulseAmount, state.pulseAmount);
            gl.uniform1f(uniforms.pulseSpeed, state.pulseSpeed);
            gl.uniform1f(uniforms.pulseFreq, state.pulseFreq);
            gl.uniform1f(uniforms.pulseShape, state.pulseShape);
            gl.uniform1f(uniforms.spokeAmount, state.spokeAmount);
            gl.uniform1f(uniforms.spokePow, state.spokePow);
            gl.uniform1f(uniforms.twistAmount, state.twistAmount);
            gl.uniform1f(uniforms.twistSpeed, state.twistSpeed);
            gl.uniform1f(uniforms.twistFreq, state.twistFreq);
            gl.uniform1f(uniforms.swirlStrength, state.swirlStrength);
            gl.uniform1f(uniforms.swirlAnim, state.swirlAnim);
            gl.uniform1f(uniforms.swirlRadius, state.swirlRadius);
            gl.uniform1f(uniforms.colorPow, state.colorPow);
            gl.uniform1f(uniforms.colorOffset, state.colorOffset);
            gl.uniform1f(uniforms.chromaAngle, state.chromaAngle);
            gl.uniform1f(uniforms.chromaRadial, state.chromaRadial);
            gl.uniform1f(uniforms.channelSkew, state.channelSkew);
            gl.uniform1f(uniforms.paletteMode, state.paletteMode);
            gl.uniform1f(uniforms.hueSpeed, state.hueSpeed);
            gl.uniform1f(uniforms.hueOffset, state.hueOffset);
            gl.uniform1f(uniforms.bandCount, state.bandCount);
            var cA = hexToRgb(state.colorA);
            var cB = hexToRgb(state.colorB);
            gl.uniform3f(uniforms.colorA, cA[0], cA[1], cA[2]);
            gl.uniform3f(uniforms.colorB, cB[0], cB[1], cB[2]);
            gl.uniform1f(uniforms.saturation, state.saturation);
            gl.uniform1f(uniforms.brightness, state.brightness);
            gl.uniform1f(uniforms.contrast, state.contrast);
            gl.uniform1f(uniforms.vignetteRadius, state.vignetteRadius);
            gl.uniform1f(uniforms.vignetteSoft, state.vignetteSoft);
            var vC = hexToRgb(state.vignetteColor);
            gl.uniform3f(uniforms.vignetteColor, vC[0], vC[1], vC[2]);
            gl.uniform1f(uniforms.vignetteAspect, state.vignetteAspect);

            gl.uniform1f(uniforms.time, shaderTime);

            gl.uniform1f(uniforms.isFinalPass, 0.0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uniforms.isFinalPass, 1.0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.uniform1i(uniforms.feedbackTex, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fbIndex = 1 - fbIndex;
        }

        rafHandle = requestAnimationFrame(animate);
        window.animationFrameId = rafHandle;
    }

    function buildControlsUI() {
        const list = document.getElementById("controls-list");
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
            return { head, indicator };S
        }

        function makeControl(c, container) {
            const key = c.key;
            const current = state[key];
            const isInt = !!c.int;

            if (c.special === 'text') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                row.style.gridColumn = "1 / -1";
                row.style.display = "block";
                row.style.margin = "6px 0 10px 0";
                const label = document.createElement("label");
                label.title = "[" + key + "] " + (c.details || "");
                label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
                label.style.display = "block";
                label.style.marginBottom = "4px";
                const ta = document.createElement("textarea");
                ta.value = String(current ?? "");
                ta.dataset.key = key;
                ta.style.width = "100%";
                ta.style.minHeight = "70px";
                ta.style.boxSizing = "border-box";
                ta.addEventListener("input", () => {
                    state[key] = ta.value;
                    textLayoutDirty = true;
                    textLetterCursor = 0;
                    textLastTick = 0;
                    state._textAllStamped = false;
                    activeLetters.length = 0;
                    state._textCurrentAngle = null;
                });
                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.marginLeft = "4px";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    ta.value = c.def;
                    textLayoutDirty = true;
                    textLetterCursor = 0;
                    textLastTick = 0;
                    state._textAllStamped = false;
                    activeLetters.length = 0;
                    state._textCurrentAngle = null;
                });
                label.appendChild(resetBtn);
                row.appendChild(label);
                row.appendChild(ta);
                container.appendChild(row);
                return;
            }

            if (c.special === 'font') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                const label = document.createElement("label");
                label.title = "[" + key + "] " + (c.details || "");
                label.textContent = (c.icon ? c.icon + " " : "") + (c.label || key);
                label.style.gridColumn = "1";
                
                const sel = document.createElement("select");
                sel.dataset.key = key;
                sel.style.gridColumn = "2 / 4"; // Span slider + number columns
                sel.style.width = "100%";
                sel.style.boxSizing = "border-box";
                for (const f of FONT_OPTIONS) {
                    const opt = document.createElement("option");
                    opt.value = f.value;
                    opt.textContent = f.label;
                    opt.style.fontFamily = fontStackFor(f.value);
                    sel.appendChild(opt);
                }
                sel.value = current;
                sel.addEventListener("change", () => {
                    state[key] = sel.value;
                    textLayoutDirty = true;
                    state._textCurrentAngle = null;
                });
                
                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4"; // Last column
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    sel.value = c.def;
                    textLayoutDirty = true;
                    state._textCurrentAngle = null;
                });
                
                row.appendChild(label);
                row.appendChild(sel);
                row.appendChild(resetBtn);
                container.appendChild(row);
                return;
            }

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
                cb.style.gridColumn = "2 / 4"; // Span slider + number columns
                cb.style.justifySelf = "start";
                cb.style.margin = "0";
                cb.addEventListener("change", () => {
                    state[key] = cb.checked ? 1 : 0;
                    if (key === 'showText') {
                        textLetterCursor = 0;
                        textLastTick = 0;
                        state._textAllStamped = false;
                        activeLetters.length = 0;
                        state._textCurrentAngle = null;
                    }
                });
                
                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4"; // Last column
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
                colorInput.style.gridColumn = "2 / 4"; // Span slider + number columns
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
                resetBtn.style.gridColumn = "4"; // Last column
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

            if (c.special === 'select') {
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

                const select = document.createElement("select");
                select.dataset.key = key;
                select.style.gridColumn = "2 / 4"; // Span slider + number columns
                select.style.width = "100%";
                select.style.boxSizing = "border-box";
                c.options.forEach(o => {
                    const opt = document.createElement("option");
                    opt.value = o.value;
                    opt.textContent = o.label;
                    select.appendChild(opt);
                });
                select.value = String(Math.round(current));
                select.addEventListener("change", () => {
                    state[key] = parseInt(select.value, 10);
                });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4"; // Last column
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    select.value = String(Math.round(c.def));
                });

                row.appendChild(label);
                row.appendChild(select);
                row.appendChild(resetBtn);
                container.appendChild(row);
                return;
            }

            // Standard Slider
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

            const layoutKeys = ['fontSizePct', 'letterSpacingPct', 'radiusPct', 'textStartAngle',
                                'fontSizeVar1', 'fontSizeVar1Speed', 'fontSizeVar2', 'fontSizeVar2Speed',
                                'radiusVar1', 'radiusVar1Speed'];
            const timingKeys = ['letterInterval', 'textDisplayLength'];

            function onChanged() {
                if (layoutKeys.indexOf(key) >= 0) textLayoutDirty = true;
                else if (timingKeys.indexOf(key) >= 0) {
                    textLastTick = 0;
                }
            }

            slider.addEventListener("input", () => {
                let v = parseFloat(slider.value);
                if (isInt) v = Math.round(v);
                state[key] = v;
                number.value = isInt ? String(v) : fmtVal(v);
                onChanged();
            });

            number.addEventListener("change", () => {
                let v = parseFloat(number.value);
                if (isNaN(v)) { number.value = isInt ? String(Math.round(state[key])) : fmtVal(state[key]); return; }
                if (isInt) v = Math.round(v);
                v = Math.max(c.min, Math.min(c.max, v));
                state[key] = v;
                slider.value = v;
                number.value = isInt ? String(v) : fmtVal(v);
                onChanged();
            });

            resetBtn.addEventListener("click", () => {
                state[key] = c.def;
                slider.value = c.def;
                number.value = isInt ? String(Math.round(c.def)) : fmtVal(c.def);
                onChanged();
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
            document.querySelectorAll('textarea[data-key="' + key + '"]').forEach(ta => {
                if (document.activeElement !== ta) ta.value = String(v ?? '');
            });
            document.querySelectorAll('select[data-key="' + key + '"]').forEach(s => {
                s.value = String(Math.round(v));
            });
            document.querySelectorAll('select[data-key="' + key + '"]').forEach(s => {
                s.value = state.fontFamily;
            });
        });
    }

    function isControlRandomisable(c) {
        if (c.canRandomise === false) return false;
        if (c.canRandomise === true) return true;
        if (c.special === 'bool' || c.special === 'color' || c.special === 'text' || c.special === 'font') return false;
        if (c.special === 'select') return true;
        if (typeof c.min !== "number" || typeof c.max !== "number") return false;
        return true;
    }

    function randomiseGroup(group, btn) {
        if (!group || !group.controls) return;
        group.controls.forEach(c => {
            if (!isControlRandomisable(c)) return;
            let v;
            if (c.special === 'select') {
                const opts = c.options || [];
                if (!opts.length) return;
                const pick = opts[Math.floor(Math.random() * opts.length)];
                v = pick.value;
            } else if (c.int) {
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
        textLayoutDirty = true;
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
        textLayoutDirty = true;
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
        if ('text' in target && !STANDALONE_KEYS.text) state.text = target.text;
        if ('fontFamily' in target && !STANDALONE_KEYS.fontFamily) state.fontFamily = target.fontFamily;
        
        textLayoutDirty = true;
        textLetterCursor = 0;
        textLastTick = 0;
        state._textAllStamped = false;
        state._textCurrentAngle = null;
        activeLetters.length = 0;
        
        if (gl) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, feedbackFBOs[0]); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, feedbackFBOs[1]); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

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
                
                textLayoutDirty = true;
                textLetterCursor = 0;
                textLastTick = 0;
                state._textAllStamped = false;
                state._textCurrentAngle = null;
                activeLetters.length = 0;
                
                if (gl) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, feedbackFBOs[0]); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, feedbackFBOs[1]); gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
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

    var rafHandle = requestAnimationFrame(animate);
    window.animationFrameId = rafHandle;

    window.__kaleidoApp = {
        destroy() {
            __destroyed = true;
            if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            Object.keys(CONTROL_BY_KEY).forEach(k => { delete CONTROL_BY_KEY[k]; });
            for (var i = 0; i < 2; i++) {
                if (feedbackFBOs[i]) { gl.deleteFramebuffer(feedbackFBOs[i]); feedbackFBOs[i] = null; }
                if (feedbackTextures[i]) { gl.deleteTexture(feedbackTextures[i]); feedbackTextures[i] = null; }
            }
            if (glyphTex) { gl.deleteTexture(glyphTex); glyphTex = null; }
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

main();