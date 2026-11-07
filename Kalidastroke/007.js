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
        dualLayerMix: 0.0, layer2Zoom: 0.997, layer2RotSpeed: -0.01,
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
        textStartAngle: -Math.PI / 2, letterInterval: 0.1,
        textFillColor: '#ffffff', textStrokeColor: '#ff2e88',
        textStrokeWidth: 0.06, textBlur: 0.0,
        textStampAlpha: 1.0, textDisplayLength: 30,
        textBlendMode: 0,
    };

    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                {
                    icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true,
                    label: "Target FPS", savedInPreset: false, details: "Framerate cap."
                },
                {
                    icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01,
                    label: "Preset Transition", savedInPreset: false, details: "Seconds preset loads animate over."
                },
                {
                    icon: "⏸️", key: "freezeTime", def: CFG.freezeTime, special: "bool", savedInPreset: false,
                    label: "Freeze Time", details: "Freeze the shader clock."
                },
                {
                    icon: "🔀", key: "autoMorph", def: CFG.autoMorph, special: "bool", savedInPreset: false,
                    label: "Auto Morph", details: "Cycle random presets."
                },
                {
                    icon: "🔄", key: "morphCycleTime", def: CFG.morphCycleTime, min: 2, max: 120, step: 0.5, savedInPreset: false,
                    label: "Morph Cycle Time", details: "Seconds between random picks."
                },
            ]
        },
        {
            heading: "🔤 Text Ring", openByDefault: true, showExtras: false, controls: [
                {
                    icon: "👁️", key: "showText", def: CFG.showText, special: "bool",
                    label: "Show Text", details: "Enable circular text stamping."
                },
                {
                    icon: "📏", key: "fontSizePct", def: CFG.fontSizePct, min: 0.01, max: 0.45, step: 0.001,
                    label: "Font Size", details: "Font size × min(W, H)."
                },
                {
                    icon: "↔️", key: "letterSpacingPct", def: CFG.letterSpacingPct, min: 0.0, max: 0.5, step: 0.005,
                    label: "Letter Spacing", details: "Extra arc between letters, × font size."
                },
                {
                    icon: "⭕", key: "radiusPct", def: CFG.radiusPct, min: 0.05, max: 0.49, step: 0.005,
                    label: "Circle Radius", details: "Ring radius × min(W, H)."
                },
                {
                    icon: "🎯", key: "textStartAngle", def: CFG.textStartAngle, min: -6.283, max: 6.283, step: 0.01,
                    label: "Start Angle", details: "Radians of the first letter."
                },
                {
                    icon: "⏱️", key: "letterInterval", def: CFG.letterInterval, min: 0, max: 1, step: 0.01,
                    label: "Letter Delay", details: "Seconds between letters. 0 = whole ring at once."
                },
                {
                    icon: "🖼️", key: "textDisplayLength", def: CFG.textDisplayLength, min: 1, max: 60, step: 1, int: true,
                    label: "Display Length", details: "Frames each letter deposits into the effect."
                },
                {
                    icon: "🔆", key: "textStampAlpha", def: CFG.textStampAlpha, min: 0, max: 2, step: 0.01,
                    label: "Stamp Brightness", details: "Total brightness of the letter when its window ends."
                },
                // ── In the CONTROLS definition, replace the textBlendMode entry with: ──
                {
                    icon: "🎛️", key: "textBlendMode", def: CFG.textBlendMode, special: "select",
                    options: [
                        { value: 0, label: "Add" },
                        { value: 1, label: "Lighten" },
                        { value: 2, label: "Screen" },
                        { value: 3, label: "Normal" },
                        { value: 4, label: "Multiply" },
                        { value: 5, label: "Darken" },
                        { value: 6, label: "Difference" },
                        { value: 7, label: "Exclusion" },
                        { value: 8, label: "Invert" },
                        { value: 9, label: "Inv. Difference" },
                        { value: 10, label: "Overlay" },
                        { value: 11, label: "Soft Light" },
                        { value: 12, label: "Hard Light" },
                        { value: 13, label: "Color Dodge" },
                        { value: 14, label: "Color Burn" },
                        { value: 15, label: "Subtract" },
                    ],
                    label: "Blend Mode", details: "How stamped letters combine with the scene."
                },
                {
                    icon: "🎨", key: "textFillColor", def: CFG.textFillColor, special: "color",
                    label: "Text Fill", details: "Fill colour."
                },
                {
                    icon: "🖊️", key: "textStrokeColor", def: CFG.textStrokeColor, special: "color",
                    label: "Stroke Colour", details: "Outline colour (top of fade)."
                },
                {
                    icon: "📏", key: "textStrokeWidth", def: CFG.textStrokeWidth, min: 0, max: 0.3, step: 0.002,
                    label: "Stroke Width", details: "Outline width × font size."
                },
                {
                    icon: "🌫️", key: "textBlur", def: CFG.textBlur, min: 0, max: 1, step: 0.01,
                    label: "Stroke Fade", details: "0 = solid outline, 1 = fully faded to transparent."
                },
            ]
        },
        {
            heading: "🔁 Feedback Trails", openByDefault: true, controls: [
                {
                    icon: "💧", key: "feedbackAmount", def: CFG.feedbackAmount, min: 0, max: 0.98, step: 0.005,
                    label: "Feedback Amount", details: "How strongly the previous frame bleeds in."
                },
                {
                    icon: "🍂", key: "feedbackDecay", def: CFG.feedbackDecay, min: -2.0, max: 2.0, step: 0.01,
                    label: "Feedback Decay", details: "Per-frame trail loss."
                },
                {
                    icon: "🌗", key: "feedbackGamma", def: CFG.feedbackGamma, min: 0.3, max: 3.0, step: 0.01,
                    label: "Feedback Gamma", details: "Nonlinear feedback shaping."
                },
                {
                    icon: "🌀", key: "fbRotSpeed", def: CFG.fbRotSpeed, min: -3.0, max: 3.0, step: 0.01,
                    label: "FB Rotation", details: "Radians the previous frame rotates."
                },
                {
                    icon: "🎵", key: "fbRotWobble", def: CFG.fbRotWobble, min: 0, max: 0.3, step: 0.001,
                    label: "FB Rot Wobble", details: "Rotation wobble amplitude."
                },
                {
                    icon: "⏱️", key: "fbRotWobbleSpeed", def: CFG.fbRotWobbleSpeed, min: 0.01, max: 3, step: 0.01,
                    label: "FB Rot Wobble Speed", details: "Rotation wobble speed."
                },
                {
                    icon: "🔍", key: "fbZoom", def: CFG.fbZoom, min: 0.0, max: 3.0, step: 0.0001,
                    label: "FB Zoom", details: "<1 = bloom outward, >1 = implode."
                },
                {
                    icon: "🎵", key: "fbZoomWobble", def: CFG.fbZoomWobble, min: 0, max: 0.05, step: 0.0005,
                    label: "FB Zoom Wobble", details: "Zoom wobble amplitude."
                },
                {
                    icon: "⏱️", key: "fbZoomWobbleSpeed", def: CFG.fbZoomWobbleSpeed, min: 0.01, max: 3, step: 0.01,
                    label: "FB Zoom Wobble Spd", details: "Zoom wobble speed."
                },
                {
                    icon: "➡️", key: "fbOffsetX", def: CFG.fbOffsetX, min: -0.02, max: 0.02, step: 0.0005,
                    label: "FB Drift X", details: "Directional drift."
                },
                {
                    icon: "⬆️", key: "fbOffsetY", def: CFG.fbOffsetY, min: -0.02, max: 0.02, step: 0.0005,
                    label: "FB Drift Y", details: "Directional drift vertically."
                },
                {
                    icon: "💨", key: "fbBlur", def: CFG.fbBlur, min: 0, max: 3, step: 0.01,
                    label: "FB Blur", details: "5-tap diffusion blur."
                },
                {
                    icon: "🌊", key: "fbWaveAmp", def: CFG.fbWaveAmp, min: 0, max: 0.1, step: 0.0005,
                    label: "FB Wave Amp", details: "Radial sinusoid displacement."
                },
                {
                    icon: "📏", key: "fbWaveFreq", def: CFG.fbWaveFreq, min: 0, max: 40, step: 0.1,
                    label: "FB Wave Freq", details: "Ripple radial frequency."
                },
                {
                    icon: "⏱️", key: "fbWaveSpeed", def: CFG.fbWaveSpeed, min: 0, max: 5, step: 0.01,
                    label: "FB Wave Speed", details: "Ripple speed."
                },
                {
                    icon: "🎯", key: "feedbackRadius", def: CFG.feedbackRadius, min: 0, max: 2.0, step: 0.01,
                    label: "FB Radius Mask", details: "Feedback zero outside this radius."
                },
                {
                    icon: "☁️", key: "feedbackEdge", def: CFG.feedbackEdge, min: 0.01, max: 1.0, step: 0.01,
                    label: "FB Edge Softness", details: "Radius mask softness."
                },
            ]
        },
        {
            heading: "🎭 Dual Layer", openByDefault: false, controls: [
                {
                    icon: "🧅", key: "dualLayerMix", def: CFG.dualLayerMix, min: 0, max: 1, step: 0.01,
                    label: "Layer Mix", details: "0 = single, 1 = only second layer."
                },
                {
                    icon: "🔍", key: "layer2Zoom", def: CFG.layer2Zoom, min: 0.0, max: 3.0, step: 0.0001,
                    label: "Layer 2 Zoom", details: "Layer 2 zoom."
                },
                {
                    icon: "🌀", key: "layer2RotSpeed", def: CFG.layer2RotSpeed, min: -3.0, max: 3.0, step: 0.01,
                    label: "Layer 2 Rotation", details: "Layer 2 rotation."
                },
            ]
        },
        {
            heading: "❄️ Kaleidoscope", openByDefault: true, controls: [
                {
                    icon: "🔷", key: "wedgeCount", def: CFG.wedgeCount, min: 1, max: 24, step: 0.5,
                    label: "Wedge Count", details: "Symmetry order."
                },
                {
                    icon: "🎯", key: "foldOffsetX", def: CFG.foldOffsetX, min: -0.15, max: 0.15, step: 0.001,
                    label: "Fold Offset X", details: "Fold pivot X."
                },
                {
                    icon: "🎯", key: "foldOffsetY", def: CFG.foldOffsetY, min: -0.15, max: 0.15, step: 0.001,
                    label: "Fold Offset Y", details: "Fold pivot Y."
                },
                {
                    icon: "🛸", key: "foldDriftSpeed", def: CFG.foldDriftSpeed, min: 0, max: 2, step: 0.01,
                    label: "Fold Drift", details: "Orbit the fold pivot."
                },
                {
                    icon: "🎡", key: "globalRotSpeed", def: CFG.globalRotSpeed, min: -1, max: 1, step: 0.01,
                    label: "Global Rotation", details: "Slow UV rotation."
                },
                {
                    icon: "🫧", key: "pulseAmount", def: CFG.pulseAmount, min: -2, max: 2, step: 0.01,
                    label: "Radial Pulse", details: "Breathing strength."
                },
                {
                    icon: "⏱️", key: "pulseSpeed", def: CFG.pulseSpeed, min: 0, max: 3, step: 0.01,
                    label: "Pulse Speed", details: "Breathing speed."
                },
                {
                    icon: "📏", key: "pulseFreq", def: CFG.pulseFreq, min: 0, max: 20, step: 0.1,
                    label: "Pulse Frequency", details: "Breathing radial frequency."
                },
                {
                    icon: "🔔", key: "pulseShape", def: CFG.pulseShape, min: 0, max: 4, step: 1, int: true,
                    label: "Pulse Shape", details: "0=sine,1=square,2=saw,3=triangle,4=abs-sine."
                },
                {
                    icon: "🌸", key: "spokeAmount", def: CFG.spokeAmount, min: 0, max: 0.5, step: 0.005,
                    label: "Spoke Amount", details: "Radial petals."
                },
                {
                    icon: "🔪", key: "spokePow", def: CFG.spokePow, min: 0.5, max: 8, step: 0.1,
                    label: "Spoke Sharpness", details: "Petal sharpness."
                },
            ]
        },
        {
            heading: "🌪️ Twist", openByDefault: false, controls: [
                {
                    icon: "🌀", key: "twistAmount", def: CFG.twistAmount, min: -1, max: 1, step: 0.005,
                    label: "Twist Amount", details: "Shear the UV."
                },
                {
                    icon: "⏱️", key: "twistSpeed", def: CFG.twistSpeed, min: 0, max: 3, step: 0.01,
                    label: "Twist Speed", details: "Twist speed."
                },
                {
                    icon: "📏", key: "twistFreq", def: CFG.twistFreq, min: 0.1, max: 10, step: 0.1,
                    label: "Twist Frequency", details: "Twist radial frequency."
                },
            ]
        },
        {
            heading: "🌊 Swirl", openByDefault: true, controls: [
                {
                    icon: "🌀", key: "swirlStrength", def: CFG.swirlStrength, min: 0, max: 4, step: 0.01,
                    label: "Swirl Strength", details: "Base swirl per channel."
                },
                {
                    icon: "🎞️", key: "swirlAnim", def: CFG.swirlAnim, min: 0, max: 2, step: 0.01,
                    label: "Swirl Animation", details: "Swirl oscillation."
                },
                {
                    icon: "📏", key: "swirlRadius", def: CFG.swirlRadius, min: 0.1, max: 3, step: 0.01,
                    label: "Swirl Radius", details: "Swirl falloff radius."
                },
            ]
        },
        {
            heading: "🎨 Colour", openByDefault: true, controls: [
                {
                    icon: "🎚️", key: "colorPow", def: CFG.colorPow, min: 0.3, max: 4, step: 0.01,
                    label: "Colour Power", details: "Per-channel gamma."
                },
                {
                    icon: "🌡️", key: "saturation", def: CFG.saturation, min: 0, max: 2, step: 0.01,
                    label: "Saturation", details: "1 = normal."
                },
                {
                    icon: "☀️", key: "brightness", def: CFG.brightness, min: 0, max: 2, step: 0.01,
                    label: "Brightness", details: "1 = normal."
                },
                {
                    icon: "📊", key: "contrast", def: CFG.contrast, min: 0.3, max: 3, step: 0.01,
                    label: "Contrast", details: "1 = normal."
                },
                {
                    icon: "↔️", key: "colorOffset", def: CFG.colorOffset, min: 0, max: 0.1, step: 0.001,
                    label: "Channel Offset", details: "Chromatic aberration distance."
                },
                {
                    icon: "🧭", key: "chromaAngle", def: CFG.chromaAngle, min: 0, max: 6.283, step: 0.01,
                    label: "Chroma Angle", details: "Aberration direction."
                },
                {
                    icon: "🎯", key: "chromaRadial", def: CFG.chromaRadial, min: 0, max: 1, step: 0.01,
                    label: "Chroma Radial", details: "0=linear,1=radial."
                },
                {
                    icon: "🌈", key: "channelSkew", def: CFG.channelSkew, min: 0, max: 2, step: 0.01,
                    label: "Channel Skew", details: "R/G/B divergence."
                },
                {
                    icon: "🎭", key: "paletteMode", def: CFG.paletteMode, min: 0, max: 3, step: 1, int: true,
                    label: "Palette Mode", details: "0=plasma,1=HSV,2=bands,3=two-colour."
                },
                {
                    icon: "🔄", key: "hueSpeed", def: CFG.hueSpeed, min: 0, max: 2, step: 0.01,
                    label: "Hue Speed", details: "Hue rotation speed."
                },
                {
                    icon: "🎨", key: "hueOffset", def: CFG.hueOffset, min: 0, max: 1, step: 0.005,
                    label: "Hue Offset", details: "Static hue shift."
                },
                {
                    icon: "📊", key: "bandCount", def: CFG.bandCount, min: 2, max: 24, step: 0.1,
                    label: "Band Count", details: "Colour bands (mode 2)."
                },
                {
                    icon: "🅰️", key: "colorA", def: CFG.colorA, special: "color",
                    label: "Color A", details: "Two-colour first stop."
                },
                {
                    icon: "🅱️", key: "colorB", def: CFG.colorB, special: "color",
                    label: "Color B", details: "Two-colour second stop."
                },
            ]
        },
        {
            heading: "🕶️ Vignette", openByDefault: false, controls: [
                {
                    icon: "⭕", key: "vignetteRadius", def: CFG.vignetteRadius, min: 0.0, max: 2.0, step: 0.005,
                    label: "Vignette Radius", details: "Darkening start."
                },
                {
                    icon: "☁️", key: "vignetteSoft", def: CFG.vignetteSoft, min: 0.01, max: 1.0, step: 0.005,
                    label: "Vignette Softness", details: "Falloff."
                },
                {
                    icon: "🎨", key: "vignetteColor", def: CFG.vignetteColor, special: "color",
                    label: "Vignette Color", details: "Vignette tint."
                },
                {
                    icon: "📐", key: "vignetteAspect", def: CFG.vignetteAspect, min: -1, max: 1, step: 0.01,
                    label: "Vignette Aspect", details: "Elliptical squash."
                },
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
        {
            name: "Slow Spiral Dream", iteration: 2, values: {
                feedbackAmount: 0.55, feedbackDecay: 0.985, fbRotSpeed: 0.008, fbZoom: 0.9992,
                wedgeCount: 6, pulseAmount: 0.15, globalRotSpeed: 0.1
            }
        },
        {
            name: "Hex Snowflake", iteration: 3, values: {
                wedgeCount: 6, pulseAmount: 0.35, pulseSpeed: 0.4, pulseFreq: 8,
                swirlStrength: 2.2, swirlRadius: 1.1, fbRotSpeed: -0.018, fbZoom: 0.9985, colorPow: 1.6
            }
        },
        {
            name: "Imploding Tunnel", iteration: 4, values: {
                feedbackAmount: 0.65, feedbackDecay: 0.97, fbZoom: 1.008, fbRotSpeed: 0.024,
                wedgeCount: 3, pulseAmount: 0.35, globalRotSpeed: 0.3
            }
        },
        {
            name: "Wind Drift", iteration: 5, values: {
                fbOffsetX: 0.004, fbRotSpeed: 0.0, fbZoom: 0.999,
                feedbackAmount: 0.5, feedbackDecay: 0.985, wedgeCount: 4, pulseAmount: 0.1, globalRotSpeed: 0.05
            }
        },
        {
            name: "Tight Curl", iteration: 6, values: {
                fbRotSpeed: 0.03, fbZoom: 0.996, feedbackDecay: 0.96, feedbackAmount: 0.6,
                wedgeCount: 12, pulseAmount: 0.05, swirlStrength: 2.8, swirlAnim: 0.2, colorPow: 1.4
            }
        },
        {
            name: "Soft Bloom", iteration: 7, values: {
                feedbackAmount: 0.35, feedbackDecay: 0.97, fbZoom: 0.997, fbRotSpeed: 0.005,
                wedgeCount: 8, pulseAmount: 0.55, pulseSpeed: 0.35,
                vignetteRadius: 0.55, vignetteSoft: 0.35, colorPow: 1.0
            }
        },
        {
            name: "Hot Pulse", iteration: 8, values: {
                pulseAmount: 3.12, pulseSpeed: 0.6, pulseFreq: 6.0, wedgeCount: 3,
                feedbackAmount: 0.45, feedbackDecay: 0.94, fbRotSpeed: 0.012, fbZoom: 0.9985
            }
        },
        {
            name: "Chromatic", iteration: 9, values: {
                colorOffset: 0.04, channelSkew: 1.6, chromaRadial: 0.5,
                wedgeCount: 5, pulseAmount: 0.25, swirlStrength: 1.8, swirlAnim: 0.8, colorPow: 1.2
            }
        },
        {
            name: "Heartbeat Tunnel", iteration: 10, values: {
                fbRotWobble: 0.04, fbRotWobbleSpeed: 0.9, fbZoomWobble: 0.008, fbZoomWobbleSpeed: 1.4,
                fbZoom: 0.997, fbRotSpeed: 0.01, feedbackAmount: 0.5, feedbackDecay: 0.97,
                wedgeCount: 6, pulseAmount: 0.25
            }
        },
        {
            name: "Warp Drive", iteration: 11, values: {
                twistAmount: 0.35, twistSpeed: 0.6, twistFreq: 1.2, wedgeCount: 4,
                fbRotSpeed: 0.015, fbZoom: 1.002, feedbackAmount: 0.55, pulseAmount: 0.15,
                paletteMode: 1, hueSpeed: 0.4, saturation: 1.3
            }
        },
        {
            name: "Liquid Mirror", iteration: 12, values: {
                twistAmount: -0.5, twistSpeed: 0.25, twistFreq: 3.0,
                fbWaveAmp: 0.008, fbWaveFreq: 12, fbWaveSpeed: 0.6,
                wedgeCount: 3, feedbackAmount: 0.4, fbZoom: 0.999
            }
        },
        {
            name: "Off-Center Bloom", iteration: 13, values: {
                foldOffsetX: 0.08, foldOffsetY: 0.05, foldDriftSpeed: 0.15,
                wedgeCount: 5, pulseAmount: 0.3, feedbackAmount: 0.45, fbRotSpeed: 0.01
            }
        },
        {
            name: "Stone in Pond", iteration: 14, values: {
                fbWaveAmp: 0.02, fbWaveFreq: 18, fbWaveSpeed: 1.2, feedbackAmount: 0.55,
                feedbackDecay: 0.985, fbZoom: 1.0, fbRotSpeed: 0.0, wedgeCount: 6
            }
        },
        {
            name: "Neon Bands", iteration: 15, values: {
                paletteMode: 2, bandCount: 6, saturation: 1.6, contrast: 1.4, colorPow: 1.0,
                feedbackAmount: 0.4, wedgeCount: 6, pulseAmount: 0.2, fbRotSpeed: 0.008, fbZoom: 0.998
            }
        },
        {
            name: "Sunset Melter", iteration: 16, values: {
                paletteMode: 3, colorA: '#ff2e88', colorB: '#ffb347', saturation: 1.2, contrast: 1.1,
                feedbackAmount: 0.5, feedbackDecay: 0.97, wedgeCount: 5, fbRotSpeed: 0.01, fbZoom: 0.998
            }
        },
        {
            name: "Cyber Hue", iteration: 17, values: {
                paletteMode: 1, hueSpeed: 0.35, saturation: 1.4, wedgeCount: 8,
                pulseAmount: 0.3, pulseSpeed: 0.5, swirlStrength: 2.0, fbRotSpeed: 0.012
            }
        },
        {
            name: "Inception", iteration: 18, values: {
                dualLayerMix: 0.55, layer2Zoom: 0.995, layer2RotSpeed: -0.02,
                feedbackAmount: 0.5, feedbackDecay: 0.97, wedgeCount: 6, fbRotSpeed: 0.015, fbZoom: 0.998
            }
        },
        {
            name: "Deep Bloom", iteration: 19, values: {
                dualLayerMix: 0.4, layer2Zoom: 1.002, layer2RotSpeed: 0.005,
                fbBlur: 1.2, feedbackAmount: 0.5, feedbackDecay: 0.985, wedgeCount: 8, pulseAmount: 0.2
            }
        },
        {
            name: "Vaporwave", iteration: 20, values: {
                paletteMode: 3, colorA: '#ff6ad5', colorB: '#c774e8',
                saturation: 1.5, contrast: 1.3, brightness: 1.1,
                colorOffset: 0.03, chromaAngle: 1.2, chromaRadial: 0.4,
                wedgeCount: 6, fbRotSpeed: 0.01, fbZoom: 0.998
            }
        },
        {
            name: "Bleach", iteration: 21, values: {
                saturation: 0.1, contrast: 1.5, brightness: 1.2, feedbackAmount: 0.5,
                fbBlur: 0.8, wedgeCount: 6, pulseAmount: 0.15
            }
        },
        {
            name: "Orb", iteration: 22, values: {
                feedbackRadius: 0.35, feedbackEdge: 0.15, feedbackAmount: 0.6,
                feedbackDecay: 0.985, wedgeCount: 8, pulseAmount: 0.2, fbZoom: 0.997, fbRotSpeed: 0.015
            }
        },
        {
            name: "Portal", iteration: 23, values: {
                feedbackRadius: 0.5, feedbackEdge: 0.4,
                vignetteRadius: 0.35, vignetteSoft: 0.25, vignetteColor: '#001133',
                feedbackAmount: 0.55, fbRotSpeed: 0.02, fbZoom: 1.001,
                paletteMode: 1, hueSpeed: 0.2
            }
        },
        {
            name: "Daisy", iteration: 24, values: {
                spokeAmount: 0.35, spokePow: 3.5, wedgeCount: 6, pulseAmount: 0.15,
                feedbackAmount: 0.4, fbRotSpeed: 0.005, saturation: 1.3, brightness: 1.1
            }
        },
        {
            name: "Aster", iteration: 25, values: {
                spokeAmount: 0.5, spokePow: 1.2, wedgeCount: 12, pulseAmount: 0.05,
                feedbackAmount: 0.35, fbZoom: 0.999, fbRotSpeed: 0.008
            }
        },
        {
            name: "Rose Window", iteration: 26, values: {
                vignetteRadius: 0.45, vignetteSoft: 0.35, vignetteColor: '#3a0016',
                wedgeCount: 8, spokeAmount: 0.2, spokePow: 4.0,
                feedbackAmount: 0.45, fbRotSpeed: 0.008,
                paletteMode: 3, colorA: '#ffb347', colorB: '#c70039'
            }
        },
        {
            name: "Frost", iteration: 27, values: {
                feedbackGamma: 1.8, fbBlur: 0.5, saturation: 0.6, brightness: 1.15,
                contrast: 1.2, wedgeCount: 6, feedbackAmount: 0.45, fbRotSpeed: 0.01
            }
        },
        {
            name: "Mist", iteration: 28, values: {
                feedbackGamma: 0.5, fbBlur: 1.5, saturation: 0.9, contrast: 0.85,
                feedbackAmount: 0.55, feedbackDecay: 0.99,
                wedgeCount: 4, fbRotSpeed: 0.005, fbZoom: 0.9995
            }
        },
        {
            name: "Ink Bleed", iteration: 29, values: {
                fbBlur: 2.2, saturation: 0.2, brightness: 1.15, contrast: 1.5,
                feedbackAmount: 0.6, feedbackDecay: 0.985, wedgeCount: 5, pulseAmount: 0.1
            }
        },
        {
            name: "Square Breath", iteration: 30, values: {
                pulseShape: 1, pulseAmount: 0.35, pulseSpeed: 0.4, pulseFreq: 4,
                wedgeCount: 6, fbRotSpeed: 0.01, feedbackAmount: 0.45
            }
        },
        {
            name: "Sawtooth Churn", iteration: 31, values: {
                pulseShape: 2, pulseAmount: 0.25, pulseSpeed: 0.8, pulseFreq: 3,
                twistAmount: 0.2, twistSpeed: 0.4, wedgeCount: 4, fbRotSpeed: 0.015
            }
        },
        {
            name: "Lens Whisper", iteration: 32, values: {
                chromaAngle: 3.14, chromaRadial: 1.0, colorOffset: 0.02,
                wedgeCount: 6, saturation: 1.2, feedbackAmount: 0.4, fbRotSpeed: 0.008
            }
        },
        {
            name: "Storyteller", iteration: 33, values: {
                showText: 1, textFillColor: '#fff8e0', textStrokeColor: '#ff2e88',
                textStrokeWidth: 0.05, textBlur: 0.35, fontSizePct: 0.04,
                letterSpacingPct: 0.15, radiusPct: 0.36, letterInterval: 0.2,
                textDisplayLength: 1, textStampAlpha: 1.2, textBlendMode: 0,
                paletteMode: 3, colorA: '#2a1a3a', colorB: '#553377',
                feedbackAmount: 0.8, feedbackDecay: 0.99, wedgeCount: 6,
                fbRotSpeed: 0.008, fbZoom: 0.998, saturation: 0.9
            }
        },
        {
            name: "Neon Sign", iteration: 34, values: {
                showText: 1, textFillColor: '#e0ffff', textStrokeColor: '#00f5ff',
                textStrokeWidth: 0.09, textBlur: 0.0, fontSizePct: 0.05,
                letterSpacingPct: 0.12, radiusPct: 0.30, letterInterval: 0.12,
                textDisplayLength: 2, textStampAlpha: 1.0, textBlendMode: 3,
                feedbackAmount: 0.85, feedbackDecay: 0.985,
                fbBlur: 0.6, saturation: 1.4, brightness: 1.2
            }
        },
        {
            name: "Ghost Letters", iteration: 35, values: {
                showText: 1, textFillColor: '#ffffff', textStrokeColor: '#8888ff',
                textStrokeWidth: 0.03, textBlur: 0.95, fontSizePct: 0.055,
                letterSpacingPct: 0.25, radiusPct: 0.34, letterInterval: 0.5,
                textDisplayLength: 1, textStampAlpha: 0.8, textBlendMode: 2,
                feedbackAmount: 0.7, feedbackDecay: 0.985, wedgeCount: 4,
                fbRotSpeed: 0.005, fbZoom: 0.999
            }
        },
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
    var layer2FBOs = [null, null];
    var layer2Textures = [null, null];
    var fbIndex = 0;
    var l2Index = 0;
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
        uniform sampler2D feedbackTex2;
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
        uniform float dualLayerMix;
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

        // Photoshop-style blend helpers (operate on already-clamped 0..1 colours).
        vec3 blendMultiply(vec3 a, vec3 b) { return a * b; }
        vec3 blendScreen(vec3 a, vec3 b)   { return 1.0 - (1.0 - a) * (1.0 - b); }
        vec3 blendOverlay(vec3 a, vec3 b)  {
            // overlay = hardLight(b, a) — bottom decides branch
            return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
        }
        vec3 blendHardLight(vec3 a, vec3 b) {
            // top (glyph) decides branch
            return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, b));
        }
        vec3 blendSoftLight(vec3 a, vec3 b) {
            // standard W3C soft-light
            vec3 d = mix(sqrt(a), ((16.0*a - 12.0)*a + 4.0)*a, step(0.25, a));
            return mix(a - (1.0 - 2.0*b)*a*(1.0 - a),
                       a + (2.0*b - 1.0)*(d - a),
                       step(0.5, b));
        }
        vec3 blendColorDodge(vec3 a, vec3 b) {
            return mix(min(vec3(1.0), a / max(1.0 - b, vec3(1.0/255.0))), vec3(1.0), step(1.0, b));
        }
        vec3 blendColorBurn(vec3 a, vec3 b) {
            return mix(1.0 - min(vec3(1.0), (1.0 - a) / max(b, vec3(1.0/255.0))), vec3(0.0), step(b, vec3(0.0)));
        }

        // Apply blend(glyph, scene, alpha, mode) and return the combined colour.
        // 'a' is the current scene colour, 'b' the glyph colour.
        // 'amt' is the glyph alpha in 0..1 (already scaled by stampAlpha).
        vec3 applyBlend(vec3 scene, vec3 glyphC, float amt, float mode) {
            // clamp scene so blend math is well-behaved
            vec3 s = clamp(scene, 0.0, 1.0);
            vec3 g = clamp(glyphC, 0.0, 1.0);
            vec3 res;
            if (mode < 0.5) {
                // Add
                return scene + glyphC * amt;
            } else if (mode < 1.5) {
                // Lighten (max)
                res = max(s, g);
            } else if (mode < 2.5) {
                // Screen
                res = blendScreen(s, g);
            } else if (mode < 3.5) {
                // Normal / Overwrite
                return mix(scene, glyphC, amt);
            } else if (mode < 4.5) {
                // Multiply
                res = blendMultiply(s, g);
            } else if (mode < 5.5) {
                // Darken (min)
                res = min(s, g);
            } else if (mode < 6.5) {
                // Difference
                res = abs(s - g);
            } else if (mode < 7.5) {
                // Exclusion
                res = s + g - 2.0 * s * g;
            } else if (mode < 8.5) {
                // Invert: where glyph is bright, invert scene
                return mix(scene, 1.0 - s, amt);
            } else if (mode < 9.5) {
                // Invert Difference: invert then diff
                res = abs(s - (1.0 - g));
            } else if (mode < 10.5) {
                // Overlay
                res = blendOverlay(s, g);
            } else if (mode < 11.5) {
                // Soft Light
                res = blendSoftLight(s, g);
            } else if (mode < 12.5) {
                // Hard Light
                res = blendHardLight(s, g);
            } else if (mode < 13.5) {
                // Colour Dodge
                res = blendColorDodge(s, g);
            } else if (mode < 14.5) {
                // Colour Burn
                res = blendColorBurn(s, g);
            } else {
                // Subtract
                return max(scene - glyphC * amt, 0.0);
            }
            // For all pure-blend modes, mix by alpha so partial coverage still
            // shows the underlying scene (matters for the glyph's soft edges).
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
                foldOff += vec2(sin(time * foldDriftSpeed * 0.7) * 0.05,
                                cos(time * foldDriftSpeed * 0.9) * 0.05);
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
            vec2 kpR = swirl(kp,  sBase * (1.0 + 0.28 * channelSkew) + anim * 0.4 * sin(time * 0.5),       swirlRadius);
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

            float rCh = plasma(kpR + off,  tR);
            float gCh = plasma(kpG,        tG);
            float bCh = plasma(kpB - off,  tB);
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
            if (dualLayerMix > 0.001) {
                vec3 prev2 = texture2D(feedbackTex2, fbUv).rgb;
                prev = mix(prev, prev2, dualLayerMix);
            }
            if (feedbackRadius < 1.99) {
                float mask = 1.0 - smoothstep(feedbackRadius, feedbackRadius + feedbackEdge, fbR);
                prev *= mask;
            }

            color = color + prev * feedbackAmount * feedbackDecay;

            // Deposit any letters currently being stamped into the feedback
            // buffer, using the selected blend mode. Once deposited, the
            // letter is a normal pixel of the feedback and decays via the
            // usual feedbackAmount * feedbackDecay pipeline.
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
        "time", "feedbackTex", "feedbackTex2", "glyph", "isFinalPass",
        "glyphAlpha", "glyphBlendMode",
        "feedbackAmount", "feedbackDecay", "feedbackGamma",
        "fbRotSpeed", "fbRotWobble", "fbRotWobbleSpeed",
        "fbZoom", "fbZoomWobble", "fbZoomWobbleSpeed",
        "fbOffset", "fbBlur", "fbWaveAmp", "fbWaveFreq", "fbWaveSpeed",
        "feedbackRadius", "feedbackEdge", "dualLayerMix",
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
            if (layer2FBOs[i]) { gl.deleteFramebuffer(layer2FBOs[i]); layer2FBOs[i] = null; }
            if (layer2Textures[i]) { gl.deleteTexture(layer2Textures[i]); layer2Textures[i] = null; }
        }
        var a = createFeedbackTarget(canvas.width, canvas.height);
        var b = createFeedbackTarget(canvas.width, canvas.height);
        feedbackFBOs[0] = a.fbo; feedbackTextures[0] = a.tex;
        feedbackFBOs[1] = b.fbo; feedbackTextures[1] = b.tex;

        var hw = Math.max(1, canvas.width >> 1);
        var hh = Math.max(1, canvas.height >> 1);
        var c = createFeedbackTarget(hw, hh);
        var d = createFeedbackTarget(hw, hh);
        layer2FBOs[0] = c.fbo; layer2Textures[0] = c.tex;
        layer2FBOs[1] = d.fbo; layer2Textures[1] = d.tex;

        fbIndex = 0;
        l2Index = 0;
    }

    function recomputeTextLayout() {
        const u = Math.min(stampCanvas.width, stampCanvas.height);
        const fontPx = Math.max(1, u * state.fontSizePct);
        stampCtx.font = '700 ' + fontPx + 'px ' + fontStackFor(state.fontFamily);
        textChars = Array.from(state.text || '');
        textWidthCache = new Array(textChars.length);
        for (let i = 0; i < textChars.length; i++) {
            textWidthCache[i] = stampCtx.measureText(textChars[i]).width;
        }
        textLayoutDirty = false;
    }

    function bakeLetterBitmap(idx, angle) {
        if (!textChars.length) return null;
        idx = ((idx % textChars.length) + textChars.length) % textChars.length;

        const u = Math.min(stampCanvas.width, stampCanvas.height);
        const fontPx = Math.max(1, u * state.fontSizePct);
        const radiusPx = u * state.radiusPct;
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
                // Draw the stroke into a temp canvas, then blur it back onto the main one.
                // This gives a true outline-following fade, unlike radial or shadow blur.
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

                // Apply blur filter and composite back
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
            //state._textCurrentAngle = null; // Reset continuous angle on layout change
        }

        var frameInterval = 1000 / Math.max(1, state.targetFPS);

        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            var depositAlpha = 0;

            if (state.showText && textChars.length > 0 && !state.freezeTime) {
                if (!textLastTick) textLastTick = now;

                // Initialize continuous angle if needed
                if (state._textCurrentAngle === null || state._textCurrentAngle === undefined) {
                    state._textCurrentAngle = state.textStartAngle;
                }

                if (state.letterInterval <= 0) {
                    // --- STATIC RING MODE ---
                    if (!state._textAllStamped || activeLetters.length === 0) {
                        activeLetters.length = 0;
                        let angleAcc = state.textStartAngle;
                        const u = Math.min(stampCanvas.width, stampCanvas.height);
                        const fontPx = Math.max(1, u * state.fontSizePct);
                        const radiusPx = u * state.radiusPct;
                        const spacingPx = fontPx * state.letterSpacingPct;

                        for (let i = 0; i < textChars.length; i++) {
                            const advance = Math.max(0.001, textWidthCache[i] + spacingPx);
                            const charAngle = angleAcc + (advance / radiusPx) / 2;
                            const baked = bakeLetterBitmap(i, charAngle);
                            if (baked) {
                                activeLetters.push({
                                    framesLeft: 9999,
                                    totalFrames: 9999,
                                    bitmap: baked.bitmap,
                                    w: baked.w, h: baked.h,
                                    x: baked.x, y: baked.y,
                                    angle: baked.angle,
                                });
                            }
                            angleAcc += advance / radiusPx;
                        }
                        state._textAllStamped = true;
                    }
                    if (activeLetters.length > 0) {
                        renderActiveLettersToCanvas();
                        uploadGlyph();
                        depositAlpha = state.textStampAlpha;
                    }
                } else {
                    // --- TYPEWRITER / FLOWING MODE ---
                    state._textAllStamped = false;

                    const dtSec = (now - textLastTick) / 1000;
                    if (dtSec >= state.letterInterval) {
                        textLastTick = now;
                        const idx = textLetterCursor;
                        textLetterCursor = (textLetterCursor + 1) % textChars.length;
                        
                        // Calculate continuous angle for this character
                        const u = Math.min(stampCanvas.width, stampCanvas.height);
                        const fontPx = Math.max(1, u * state.fontSizePct);
                        const radiusPx = u * state.radiusPct;
                        const spacingPx = fontPx * state.letterSpacingPct;
                        const advance = Math.max(0.001, textWidthCache[idx] + spacingPx);
                        
                        const charAngle = state._textCurrentAngle + (advance / radiusPx) / 2;
                        
                        // Advance the running angle for the next letter
                        state._textCurrentAngle += advance / radiusPx;
                        
                        // Wrap the angle to keep it bounded (optional, but good practice)
                        if (state._textCurrentAngle > Math.PI * 2) state._textCurrentAngle -= Math.PI * 2;

                        const lifetime = Math.max(1, Math.round(state.textDisplayLength));
                        const baked = bakeLetterBitmap(idx, charAngle);
                        
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

                    // Cull dead letters
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

                    // Decrement lifetimes for the next frame
                    for (let i = 0; i < activeLetters.length; i++) {
                        activeLetters[i].framesLeft--;
                    }
                }
            }

            var readTex = feedbackTextures[fbIndex];
            var readTex2 = layer2Textures[l2Index];
            var writeFBO = feedbackFBOs[1 - fbIndex];
            var writeFBO2 = layer2FBOs[1 - l2Index];

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(uniforms.feedbackTex, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, readTex2);
            gl.uniform1i(uniforms.feedbackTex2, 1);

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
            gl.uniform1f(uniforms.dualLayerMix, state.dualLayerMix);
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

            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO2);
            gl.viewport(0, 0, canvas.width >> 1, canvas.height >> 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uniforms.isFinalPass, 1.0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.uniform1i(uniforms.feedbackTex, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fbIndex = 1 - fbIndex;
            l2Index = 1 - l2Index;
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
            return { head, indicator };
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
                });
                label.appendChild(resetBtn);
                row.appendChild(label);
                row.appendChild(ta);
                container.appendChild(row);
                return;
            }

            if (c.special === 'bool') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                const label = document.createElement("label");
                label.title = "[" + key + "] " + (c.details || "");
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
                cb.addEventListener("change", () => {
                    state[key] = cb.checked ? 1 : 0;
                    if (key === 'showText') {
                        textLetterCursor = 0;
                        textLastTick = 0;
                        state._textAllStamped = false;
                        activeLetters.length = 0;
                    }
                });
                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
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
                colorInput.addEventListener("input", () => { state[key] = colorInput.value; });
                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
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

            const row = document.createElement("div");
            row.className = "ctrl-row";
            const label = document.createElement("label");
            label.title = "[" + key + "] " + (c.details || "");
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
            slider.min = c.min; slider.max = c.max; slider.step = c.step;
            slider.value = current;
            slider.dataset.key = key;

            const number = document.createElement("input");
            number.type = "number";
            number.step = c.step;
            number.value = isInt ? String(Math.round(current)) : fmtVal(current);
            number.dataset.key = key;

            const resetBtn = document.createElement("button");
            resetBtn.className = "reset-btn";
            resetBtn.textContent = "↺";

            const layoutKeys = ['fontSizePct', 'letterSpacingPct', 'radiusPct', 'textStartAngle'];
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

        const listEl = document.getElementById("controls-list");
        let fontRow = document.getElementById("font-select-row");
        if (!fontRow) {
            fontRow = document.createElement("div");
            fontRow.id = "font-select-row";
            fontRow.style.margin = "6px 0 10px 0";
            const lbl = document.createElement("label");
            lbl.style.display = "block";
            lbl.style.fontWeight = "bold";
            lbl.style.color = "#ddd";
            lbl.style.marginBottom = "4px";
            lbl.textContent = "🔤 Font";
            fontRow.appendChild(lbl);
            const sel0 = document.createElement("select");
            sel0.id = "font-select";
            sel0.style.width = "100%";
            sel0.style.padding = "4px";
            fontRow.appendChild(sel0);
            let target = null;
            for (let i = 0; i < listEl.children.length; i++) {
                const el = listEl.children[i];
                if (el.textContent && el.textContent.indexOf('Text Ring') !== -1) {
                    target = listEl.children[i + 1];
                    break;
                }
            }
            (target || listEl).prepend(fontRow);
        }
        const sel = document.getElementById("font-select");
        sel.innerHTML = "";
        for (const f of FONT_OPTIONS) {
            const opt = document.createElement("option");
            opt.value = f.value;
            opt.textContent = f.label;
            opt.style.fontFamily = fontStackFor(f.value);
            opt.style.fontSize = '18px';
            opt.style.padding = '4px';
            sel.appendChild(opt);
        }
        sel.value = state.fontFamily;
        sel.style.fontFamily = fontStackFor(state.fontFamily);
        sel.style.fontSize = '18px';
        sel.addEventListener("change", () => {
            state.fontFamily = sel.value;
            sel.style.fontFamily = fontStackFor(sel.value);
            textLayoutDirty = true;
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
        });
        const sel = document.getElementById('font-select');
        if (sel && typeof state.fontFamily === 'string') {
            sel.value = state.fontFamily;
            sel.style.fontFamily = fontStackFor(state.fontFamily);
        }
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
        activeLetters.length = 0;

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
                activeLetters.length = 0;
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
                if (layer2FBOs[i]) { gl.deleteFramebuffer(layer2FBOs[i]); layer2FBOs[i] = null; }
                if (layer2Textures[i]) { gl.deleteTexture(layer2Textures[i]); layer2Textures[i] = null; }
            }
            if (glyphTex) { gl.deleteTexture(glyphTex); glyphTex = null; }
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

main();