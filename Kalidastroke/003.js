function main() {
    /* ============================================================
       TEARDOWN GUARD
       ============================================================ */
    let __destroyed = false;
    if (window.__kaleidoApp && typeof window.__kaleidoApp.destroy === 'function') {
        try { window.__kaleidoApp.destroy(); } catch (e) { console.warn('kaleido teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas").forEach(c => c.remove());

    /* ============================================================
       CONFIG (defaults)
       ============================================================ */
    const CFG = {
        // feedback trail
        feedbackAmount: 0.45,
        feedbackDecay: 0.94,
        feedbackGamma: 1.0,
        fbRotSpeed: 0.012,
        fbRotWobble: 0.0,
        fbRotWobbleSpeed: 0.4,
        fbZoom: 0.9985,
        fbZoomWobble: 0.0,
        fbZoomWobbleSpeed: 0.3,
        fbOffsetX: 0.0,
        fbOffsetY: 0.0,
        fbBlur: 0.0,
        fbWaveAmp: 0.0,
        fbWaveFreq: 8.0,
        fbWaveSpeed: 1.0,
        feedbackRadius: 1.2,
        feedbackEdge: 0.3,
        // dual layer
        dualLayerMix: 0.0,
        layer2Zoom: 0.997,
        layer2RotSpeed: -0.01,
        // kaleidoscope
        wedgeCount: 3.0,
        foldOffsetX: 0.0,
        foldOffsetY: 0.0,
        foldDriftSpeed: 0.0,
        globalRotSpeed: 0.22,
        pulseAmount: 0.30,
        pulseSpeed: 0.6,
        pulseFreq: 6.0,
        pulseShape: 0,
        spokeAmount: 0.0,
        spokePow: 2.0,
        // twist / shear
        twistAmount: 0.0,
        twistSpeed: 0.3,
        twistFreq: 1.0,
        // swirl
        swirlStrength: 1.4,
        swirlAnim: 0.4,
        swirlRadius: 0.9,
        // colour
        colorPow: 1.3,
        colorOffset: 0.02,
        chromaAngle: 0.0,
        chromaRadial: 0.0,
        channelSkew: 1.0,
        paletteMode: 0,
        hueSpeed: 0.15,
        hueOffset: 0.0,
        bandCount: 5.0,
        colorA: '#ff2e88',
        colorB: '#00e5ff',
        saturation: 1.0,
        brightness: 1.0,
        contrast: 1.0,
        // vignette
        vignetteRadius: 0.42,
        vignetteSoft: 0.22,
        vignetteColor: '#000000',
        vignetteAspect: 0.0,
        // render
        targetFPS: 60,
        presetTransitionTime: 3.0,
        freezeTime: 0,
        autoMorph: 0,
        morphCycleTime: 10.0,
    };

    /* ============================================================
       CONTROLS
       ============================================================ */
    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                { icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true,
                  label: "Target FPS", savedInPreset: false,
                  details: "Framerate cap for the render loop." },
                { icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01,
                  label: "Preset Transition", savedInPreset: false,
                  details: "Seconds over which preset loads animate (0 = instant)." },
                { icon: "⏸️", key: "freezeTime", def: CFG.freezeTime, special: "bool", savedInPreset: false,
                  label: "Freeze Time", details: "Freeze the shader clock. Feedback still integrates, revealing trails." },
                { icon: "🔀", key: "autoMorph", def: CFG.autoMorph, special: "bool", savedInPreset: false,
                  label: "Auto Morph", details: "Continuously cycle through random presets." },
                { icon: "🔄", key: "morphCycleTime", def: CFG.morphCycleTime, min: 2, max: 120, step: 0.5, savedInPreset: false,
                  label: "Morph Cycle Time", details: "Seconds between random preset picks when Auto Morph is on." },
            ]
        },
        {
            heading: "🔁 Feedback Trails", openByDefault: true, controls: [
                { icon: "💧", key: "feedbackAmount", def: CFG.feedbackAmount, min: 0, max: 0.98, step: 0.005,
                  label: "Feedback Amount", details: "How strongly the previous frame bleeds into the current one." },
                { icon: "🍂", key: "feedbackDecay", def: CFG.feedbackDecay, min: -2.0, max: 2.0, step: 0.01,
                  label: "Feedback Decay", details: "Per-frame trail loss. Closer to 1 = longer trails." },
                { icon: "🌗", key: "feedbackGamma", def: CFG.feedbackGamma, min: 0.3, max: 3.0, step: 0.01,
                  label: "Feedback Gamma", details: "Nonlinear feedback shaping. <1 = misty, >1 = glassy." },
                { icon: "🌀", key: "fbRotSpeed", def: CFG.fbRotSpeed, min: -3.0, max: 3.0, step: 0.01,
                  label: "FB Rotation", details: "Base radians the previous frame rotates per frame." },
                { icon: "🎵", key: "fbRotWobble", def: CFG.fbRotWobble, min: 0, max: 0.3, step: 0.001,
                  label: "FB Rot Wobble", details: "Oscillation amplitude added to FB rotation." },
                { icon: "⏱️", key: "fbRotWobbleSpeed", def: CFG.fbRotWobbleSpeed, min: 0.01, max: 3, step: 0.01,
                  label: "FB Rot Wobble Speed", details: "How fast the rotation wobble oscillates." },
                { icon: "🔍", key: "fbZoom", def: CFG.fbZoom, min: 0.0, max: 3.0, step: 0.0001,
                  label: "FB Zoom", details: "<1 = trails bloom outward, >1 = implode, 1 = pure rotation." },
                { icon: "🎵", key: "fbZoomWobble", def: CFG.fbZoomWobble, min: 0, max: 0.05, step: 0.0005,
                  label: "FB Zoom Wobble", details: "Oscillation amplitude added to FB zoom." },
                { icon: "⏱️", key: "fbZoomWobbleSpeed", def: CFG.fbZoomWobbleSpeed, min: 0.01, max: 3, step: 0.01,
                  label: "FB Zoom Wobble Spd", details: "How fast the zoom wobble oscillates." },
                { icon: "➡️", key: "fbOffsetX", def: CFG.fbOffsetX, min: -0.02, max: 0.02, step: 0.0005,
                  label: "FB Drift X", details: "Directional drift of trails." },
                { icon: "⬆️", key: "fbOffsetY", def: CFG.fbOffsetY, min: -0.02, max: 0.02, step: 0.0005,
                  label: "FB Drift Y", details: "Directional drift of trails vertically." },
                { icon: "💨", key: "fbBlur", def: CFG.fbBlur, min: 0, max: 3, step: 0.01,
                  label: "FB Blur", details: "5-tap diffusion blur applied to feedback (bloom-like)." },
                { icon: "🌊", key: "fbWaveAmp", def: CFG.fbWaveAmp, min: 0, max: 0.1, step: 0.0005,
                  label: "FB Wave Amp", details: "Radial sinusoid displacement of feedback sample." },
                { icon: "📏", key: "fbWaveFreq", def: CFG.fbWaveFreq, min: 0, max: 40, step: 0.1,
                  label: "FB Wave Freq", details: "Radial frequency of the ripple." },
                { icon: "⏱️", key: "fbWaveSpeed", def: CFG.fbWaveSpeed, min: 0, max: 5, step: 0.01,
                  label: "FB Wave Speed", details: "Temporal speed of the ripple." },
                { icon: "🎯", key: "feedbackRadius", def: CFG.feedbackRadius, min: 0, max: 2.0, step: 0.01,
                  label: "FB Radius Mask", details: "Feedback goes to zero outside this radius." },
                { icon: "☁️", key: "feedbackEdge", def: CFG.feedbackEdge, min: 0.01, max: 1.0, step: 0.01,
                  label: "FB Edge Softness", details: "Softness of the radius mask." },
            ]
        },
        {
            heading: "🎭 Dual Layer", openByDefault: false, controls: [
                { icon: "🧅", key: "dualLayerMix", def: CFG.dualLayerMix, min: 0, max: 1, step: 0.01,
                  label: "Layer Mix", details: "0 = single layer, 1 = only the second (half-res) layer." },
                { icon: "🔍", key: "layer2Zoom", def: CFG.layer2Zoom, min: 0.0, max: 3.0, step: 0.0001,
                  label: "Layer 2 Zoom", details: "Independent zoom for the second feedback layer." },
                { icon: "🌀", key: "layer2RotSpeed", def: CFG.layer2RotSpeed, min: -3.0, max: 3.0, step: 0.01,
                  label: "Layer 2 Rotation", details: "Independent rotation for the second feedback layer." },
            ]
        },
        {
            heading: "❄️ Kaleidoscope", openByDefault: true, controls: [
                { icon: "🔷", key: "wedgeCount", def: CFG.wedgeCount, min: 1, max: 24, step: 0.5,
                  label: "Wedge Count", details: "Symmetry order: 3 = triangle, 6 = hex, 12 = snowflake." },
                { icon: "🎯", key: "foldOffsetX", def: CFG.foldOffsetX, min: -0.15, max: 0.15, step: 0.001,
                  label: "Fold Offset X", details: "Wander the kaleidoscope fold pivot horizontally." },
                { icon: "🎯", key: "foldOffsetY", def: CFG.foldOffsetY, min: -0.15, max: 0.15, step: 0.001,
                  label: "Fold Offset Y", details: "Wander the kaleidoscope fold pivot vertically." },
                { icon: "🛸", key: "foldDriftSpeed", def: CFG.foldDriftSpeed, min: 0, max: 2, step: 0.01,
                  label: "Fold Drift", details: "Animate the fold pivot orbiting slowly." },
                { icon: "🎡", key: "globalRotSpeed", def: CFG.globalRotSpeed, min: -1, max: 1, step: 0.01,
                  label: "Global Rotation", details: "Slow rotation speed of the UV space." },
                { icon: "🫧", key: "pulseAmount", def: CFG.pulseAmount, min: -2, max: 2, step: 0.01,
                  label: "Radial Pulse", details: "Breathing strength. 0 = static, 0.3 = gentle, 1+ = wild." },
                { icon: "⏱️", key: "pulseSpeed", def: CFG.pulseSpeed, min: 0, max: 3, step: 0.01,
                  label: "Pulse Speed", details: "Temporal speed of the breathing cycle." },
                { icon: "📏", key: "pulseFreq", def: CFG.pulseFreq, min: 0, max: 20, step: 0.1,
                  label: "Pulse Frequency", details: "Radial frequency of the breathing ripples." },
                { icon: "🔔", key: "pulseShape", def: CFG.pulseShape, min: 0, max: 4, step: 1, int: true,
                  label: "Pulse Shape", details: "0=sine, 1=square, 2=saw, 3=triangle, 4=abs-sine." },
                { icon: "🌸", key: "spokeAmount", def: CFG.spokeAmount, min: 0, max: 0.5, step: 0.005,
                  label: "Spoke Amount", details: "Radial petals emerging from the fold." },
                { icon: "🔪", key: "spokePow", def: CFG.spokePow, min: 0.5, max: 8, step: 0.1,
                  label: "Spoke Sharpness", details: "How sharp or flat the petal edges are." },
            ]
        },
        {
            heading: "🌪️ Twist", openByDefault: false, controls: [
                { icon: "🌀", key: "twistAmount", def: CFG.twistAmount, min: -1, max: 1, step: 0.005,
                  label: "Twist Amount", details: "Shear the UV space before the kaleidoscope fold." },
                { icon: "⏱️", key: "twistSpeed", def: CFG.twistSpeed, min: 0, max: 3, step: 0.01,
                  label: "Twist Speed", details: "How fast the twist oscillates." },
                { icon: "📏", key: "twistFreq", def: CFG.twistFreq, min: 0.1, max: 10, step: 0.1,
                  label: "Twist Frequency", details: "Radial frequency of the twist." },
            ]
        },
        {
            heading: "🌊 Swirl", openByDefault: true, controls: [
                { icon: "🌀", key: "swirlStrength", def: CFG.swirlStrength, min: 0, max: 4, step: 0.01,
                  label: "Swirl Strength", details: "Base swirl strength applied per RGB channel." },
                { icon: "🎞️", key: "swirlAnim", def: CFG.swirlAnim, min: 0, max: 2, step: 0.01,
                  label: "Swirl Animation", details: "How much the swirl strength oscillates over time." },
                { icon: "📏", key: "swirlRadius", def: CFG.swirlRadius, min: 0.1, max: 3, step: 0.01,
                  label: "Swirl Radius", details: "Falloff radius. Larger = softer, wider swirl." },
            ]
        },
        {
            heading: "🎨 Colour", openByDefault: true, controls: [
                { icon: "🎚️", key: "colorPow", def: CFG.colorPow, min: 0.3, max: 4, step: 0.01,
                  label: "Colour Power", details: "Gamma per channel. Higher = more contrast." },
                { icon: "🌡️", key: "saturation", def: CFG.saturation, min: 0, max: 2, step: 0.01,
                  label: "Saturation", details: "1 = normal, 0 = grayscale, 2 = hyper." },
                { icon: "☀️", key: "brightness", def: CFG.brightness, min: 0, max: 2, step: 0.01,
                  label: "Brightness", details: "1 = normal." },
                { icon: "📊", key: "contrast", def: CFG.contrast, min: 0.3, max: 3, step: 0.01,
                  label: "Contrast", details: "Gamma applied after saturation. 1 = normal." },
                { icon: "↔️", key: "colorOffset", def: CFG.colorOffset, min: 0, max: 0.1, step: 0.001,
                  label: "Channel Offset", details: "Spatial offset between R/G/B sampling (chromatic aberration)." },
                { icon: "🧭", key: "chromaAngle", def: CFG.chromaAngle, min: 0, max: 6.283, step: 0.01,
                  label: "Chroma Angle", details: "Direction of the chromatic aberration offset." },
                { icon: "🎯", key: "chromaRadial", def: CFG.chromaRadial, min: 0, max: 1, step: 0.01,
                  label: "Chroma Radial", details: "0 = linear offset, 1 = radial (lens-like)." },
                { icon: "🌈", key: "channelSkew", def: CFG.channelSkew, min: 0, max: 2, step: 0.01,
                  label: "Channel Skew", details: "How far R/G/B swirl strengths diverge." },
                { icon: "🎭", key: "paletteMode", def: CFG.paletteMode, min: 0, max: 3, step: 1, int: true,
                  label: "Palette Mode", details: "0=plasma, 1=HSV hue-rotate, 2=bands, 3=two-colour." },
                { icon: "🔄", key: "hueSpeed", def: CFG.hueSpeed, min: 0, max: 2, step: 0.01,
                  label: "Hue Speed", details: "Hue rotation speed (mode 1 & 3)." },
                { icon: "🎨", key: "hueOffset", def: CFG.hueOffset, min: 0, max: 1, step: 0.005,
                  label: "Hue Offset", details: "Static hue shift (mode 1 & 3)." },
                { icon: "📊", key: "bandCount", def: CFG.bandCount, min: 2, max: 24, step: 0.1,
                  label: "Band Count", details: "Number of colour bands (mode 2)." },
                { icon: "🅰️", key: "colorA", def: CFG.colorA, special: "color",
                  label: "Color A", details: "First colour for two-colour mode." },
                { icon: "🅱️", key: "colorB", def: CFG.colorB, special: "color",
                  label: "Color B", details: "Second colour for two-colour mode." },
            ]
        },
        {
            heading: "🕶️ Vignette", openByDefault: false, controls: [
                { icon: "⭕", key: "vignetteRadius", def: CFG.vignetteRadius, min: 0.0, max: 2.0, step: 0.005,
                  label: "Vignette Radius", details: "Radius where darkening begins." },
                { icon: "☁️", key: "vignetteSoft", def: CFG.vignetteSoft, min: 0.01, max: 1.0, step: 0.005,
                  label: "Vignette Softness", details: "Falloff softness." },
                { icon: "🎨", key: "vignetteColor", def: CFG.vignetteColor, special: "color",
                  label: "Vignette Color", details: "Colour the vignette fades to." },
                { icon: "📐", key: "vignetteAspect", def: CFG.vignetteAspect, min: -1, max: 1, step: 0.01,
                  label: "Vignette Aspect", details: "Squash the vignette into an ellipse." },
            ]
        }
    ];

    /* ============================================================
       DERIVED TABLES
       ============================================================ */
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

    /* ============================================================
       PRESETS
       ============================================================ */
    const PRESETS = [
        { name: "Default", iteration: 1, values: {} },
        {
            name: "Slow Spiral Dream", iteration: 2, values: {
                feedbackAmount: 0.55, feedbackDecay: 0.985,
                fbRotSpeed: 0.008, fbZoom: 0.9992,
                wedgeCount: 6, pulseAmount: 0.15, globalRotSpeed: 0.1
            }
        },
        {
            name: "Hex Snowflake", iteration: 3, values: {
                wedgeCount: 6, pulseAmount: 0.35, pulseSpeed: 0.4, pulseFreq: 8,
                swirlStrength: 2.2, swirlRadius: 1.1,
                fbRotSpeed: -0.018, fbZoom: 0.9985, colorPow: 1.6
            }
        },
        {
            name: "Imploding Tunnel", iteration: 4, values: {
                feedbackAmount: 0.65, feedbackDecay: 0.97,
                fbZoom: 1.008, fbRotSpeed: 0.024,
                wedgeCount: 3, pulseAmount: 0.35, globalRotSpeed: 0.3
            }
        },
        {
            name: "Wind Drift", iteration: 5, values: {
                fbOffsetX: 0.004, fbOffsetY: 0.0,
                fbRotSpeed: 0.0, fbZoom: 0.999,
                feedbackAmount: 0.5, feedbackDecay: 0.985,
                wedgeCount: 4, pulseAmount: 0.1, globalRotSpeed: 0.05
            }
        },
        {
            name: "Tight Curl", iteration: 6, values: {
                fbRotSpeed: 0.03, fbZoom: 0.996, feedbackDecay: 0.96,
                feedbackAmount: 0.6, wedgeCount: 12, pulseAmount: 0.05,
                swirlStrength: 2.8, swirlAnim: 0.2, colorPow: 1.4
            }
        },
        {
            name: "Soft Bloom", iteration: 7, values: {
                feedbackAmount: 0.35, feedbackDecay: 0.97,
                fbZoom: 0.997, fbRotSpeed: 0.005,
                wedgeCount: 8, pulseAmount: 0.55, pulseSpeed: 0.35,
                vignetteRadius: 0.55, vignetteSoft: 0.35, colorPow: 1.0
            }
        },
        {
            name: "Hot Pulse", iteration: 8, values: {
                pulseAmount: 3.12, pulseSpeed: 0.6, pulseFreq: 6.0,
                wedgeCount: 3, feedbackAmount: 0.45, feedbackDecay: 0.94,
                fbRotSpeed: 0.012, fbZoom: 0.9985
            }
        },
        {
            name: "Chromatic", iteration: 9, values: {
                colorOffset: 0.04, channelSkew: 1.6, chromaRadial: 0.5,
                wedgeCount: 5, pulseAmount: 0.25,
                swirlStrength: 1.8, swirlAnim: 0.8, colorPow: 1.2
            }
        },
        {
            name: "Heartbeat Tunnel", iteration: 10, values: {
                fbRotWobble: 0.04, fbRotWobbleSpeed: 0.9,
                fbZoomWobble: 0.008, fbZoomWobbleSpeed: 1.4,
                fbZoom: 0.997, fbRotSpeed: 0.01,
                feedbackAmount: 0.5, feedbackDecay: 0.97,
                wedgeCount: 6, pulseAmount: 0.25
            }
        },
        {
            name: "Warp Drive", iteration: 11, values: {
                twistAmount: 0.35, twistSpeed: 0.6, twistFreq: 1.2,
                wedgeCount: 4, fbRotSpeed: 0.015, fbZoom: 1.002,
                feedbackAmount: 0.55, pulseAmount: 0.15,
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
                wedgeCount: 5, pulseAmount: 0.3,
                feedbackAmount: 0.45, fbRotSpeed: 0.01
            }
        },
        {
            name: "Stone in Pond", iteration: 14, values: {
                fbWaveAmp: 0.02, fbWaveFreq: 18, fbWaveSpeed: 1.2,
                feedbackAmount: 0.55, feedbackDecay: 0.985,
                fbZoom: 1.0, fbRotSpeed: 0.0, wedgeCount: 6
            }
        },
        {
            name: "Neon Bands", iteration: 15, values: {
                paletteMode: 2, bandCount: 6, saturation: 1.6, contrast: 1.4,
                colorPow: 1.0, feedbackAmount: 0.4,
                wedgeCount: 6, pulseAmount: 0.2,
                fbRotSpeed: 0.008, fbZoom: 0.998
            }
        },
        {
            name: "Sunset Melter", iteration: 16, values: {
                paletteMode: 3, colorA: '#ff2e88', colorB: '#ffb347',
                saturation: 1.2, contrast: 1.1,
                feedbackAmount: 0.5, feedbackDecay: 0.97,
                wedgeCount: 5, fbRotSpeed: 0.01, fbZoom: 0.998
            }
        },
        {
            name: "Cyber Hue", iteration: 17, values: {
                paletteMode: 1, hueSpeed: 0.35, saturation: 1.4,
                wedgeCount: 8, pulseAmount: 0.3, pulseSpeed: 0.5,
                swirlStrength: 2.0, fbRotSpeed: 0.012
            }
        },
        {
            name: "Inception", iteration: 18, values: {
                dualLayerMix: 0.55, layer2Zoom: 0.995, layer2RotSpeed: -0.02,
                feedbackAmount: 0.5, feedbackDecay: 0.97,
                wedgeCount: 6, fbRotSpeed: 0.015, fbZoom: 0.998
            }
        },
        {
            name: "Deep Bloom", iteration: 19, values: {
                dualLayerMix: 0.4, layer2Zoom: 1.002, layer2RotSpeed: 0.005,
                fbBlur: 1.2, feedbackAmount: 0.5, feedbackDecay: 0.985,
                wedgeCount: 8, pulseAmount: 0.2
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
                saturation: 0.1, contrast: 1.5, brightness: 1.2,
                feedbackAmount: 0.5, fbBlur: 0.8,
                wedgeCount: 6, pulseAmount: 0.15
            }
        },
        {
            name: "Orb", iteration: 22, values: {
                feedbackRadius: 0.35, feedbackEdge: 0.15,
                feedbackAmount: 0.6, feedbackDecay: 0.985,
                wedgeCount: 8, pulseAmount: 0.2,
                fbZoom: 0.997, fbRotSpeed: 0.015
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
                spokeAmount: 0.35, spokePow: 3.5,
                wedgeCount: 6, pulseAmount: 0.15,
                feedbackAmount: 0.4, fbRotSpeed: 0.005,
                saturation: 1.3, brightness: 1.1
            }
        },
        {
            name: "Aster", iteration: 25, values: {
                spokeAmount: 0.5, spokePow: 1.2,
                wedgeCount: 12, pulseAmount: 0.05,
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
                feedbackGamma: 1.8, fbBlur: 0.5,
                saturation: 0.6, brightness: 1.15, contrast: 1.2,
                wedgeCount: 6, feedbackAmount: 0.45, fbRotSpeed: 0.01
            }
        },
        {
            name: "Mist", iteration: 28, values: {
                feedbackGamma: 0.5, fbBlur: 1.5,
                saturation: 0.9, contrast: 0.85,
                feedbackAmount: 0.55, feedbackDecay: 0.99,
                wedgeCount: 4, fbRotSpeed: 0.005, fbZoom: 0.9995
            }
        },
        {
            name: "Ink Bleed", iteration: 29, values: {
                fbBlur: 2.2, saturation: 0.2, brightness: 1.15, contrast: 1.5,
                feedbackAmount: 0.6, feedbackDecay: 0.985,
                wedgeCount: 5, pulseAmount: 0.1
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
                twistAmount: 0.2, twistSpeed: 0.4,
                wedgeCount: 4, fbRotSpeed: 0.015
            }
        },
        {
            name: "Lens Whisper", iteration: 32, values: {
                chromaAngle: 3.14, chromaRadial: 1.0, colorOffset: 0.02,
                wedgeCount: 6, saturation: 1.2,
                feedbackAmount: 0.4, fbRotSpeed: 0.008
            }
        },
    ];

    /* ============================================================
       HELPERS
       ============================================================ */
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

    // hex <-> rgb helpers
    function hexToRgb(hex) {
        hex = (hex || '#000000').replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
    }

    /* ============================================================
       GLOBAL STATE
       ============================================================ */
    let state = Object.assign({}, CFG);
    const groupClipboard = {};

    /* preset transition state */
    let transitionActive = false;
    let transitionStart = 0;
    let transitionDur = 0;
    let transitionSource = null;
    let transitionTarget = null;

    /* auto morph */
    let lastMorphTime = 0;
    let frozenTime = 0;
    let freezeStart = 0;

    /* user presets from localStorage */
    let userPresets = [];
    try {
        userPresets = JSON.parse(localStorage.getItem('kaleidoUserPresets') || '[]');
    } catch (_) { userPresets = []; }
    userPresets.forEach(p => PRESETS.push(p));

    /* ============================================================
       CANVAS / GL
       ============================================================ */
    var canvas = document.createElement("canvas");
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

    /* ============================================================
       RESIZE
       ============================================================ */
    function resizeCanvas() {
        canvas.width = Math.max(1, window.innerWidth);
        canvas.height = Math.max(1, window.innerHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);
        rebuildFeedback();
    }

    /* ============================================================
       SHADERS
       ============================================================ */
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

        void main() {
            vec2 uv = v_texCoord - 0.5;
            float r = length(uv);

            // ---- twist / shear ----
            if (abs(twistAmount) > 0.0001) {
                float tw = twistAmount * sin(time * twistSpeed + r * twistFreq * 6.2831853);
                uv.x += uv.y * tw * 0.5;
            }

            // ---- global rotation ----
            uv = rot(uv, time * globalRotSpeed);

            // ---- fold pivot drift ----
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

            // ---- spokes ----
            if (spokeAmount > 0.0001) {
                float sp = pow(abs(sin(a * wedgeCount * 0.5)), spokePow);
                kp *= 1.0 + spokeAmount * sp;
            }

            // ---- radial pulse ----
            kp *= 1.0 + pulseAmount * pulseFn(time * pulseSpeed + r * pulseFreq);

            // ---- swirl ----
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

            // ---- chromatic aberration direction ----
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

            // ---- palette modes ----
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

            // ---- feedback sampling with wave deformation ----
            vec2 fbUv = v_texCoord - 0.5;
            float fbR = length(fbUv);

            if (fbWaveAmp > 0.0001 && fbR > 0.0001) {
                float wave = sin(fbR * fbWaveFreq - time * fbWaveSpeed * 6.2831853);
                fbUv += (fbUv / fbR) * wave * fbWaveAmp;
            }

            float rotAngle = fbRotSpeed;
            if (fbRotWobble > 0.0001) {
                rotAngle += sin(time * fbRotWobbleSpeed) * fbRotWobble;
            }
            fbUv = rot(fbUv, rotAngle);

            float zoomVal = fbZoom;
            if (fbZoomWobble > 0.0001) {
                zoomVal += sin(time * fbZoomWobbleSpeed + 1.7) * fbZoomWobble;
            }
            fbUv *= zoomVal;
            fbUv += fbOffset;
            fbUv += 0.5;

            vec3 prev = texture2D(feedbackTex, fbUv).rgb;

            // blur (5-tap)
            if (fbBlur > 0.001) {
                float br = fbBlur * 0.003;
                vec3 blur = prev * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( br,  0.0)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2(-br,  0.0)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( 0.0,  br)).rgb * 0.2;
                blur += texture2D(feedbackTex, fbUv + vec2( 0.0, -br)).rgb * 0.2;
                prev = blur;
            }

            // feedback gamma
            if (abs(feedbackGamma - 1.0) > 0.01) {
                prev = pow(max(prev, vec3(0.0001)), vec3(feedbackGamma));
            }

            // dual layer
            if (dualLayerMix > 0.001) {
                vec3 prev2 = texture2D(feedbackTex2, fbUv).rgb;
                prev = mix(prev, prev2, dualLayerMix);
            }

            // radius mask
            if (feedbackRadius < 1.99) {
                float mask = 1.0 - smoothstep(feedbackRadius, feedbackRadius + feedbackEdge, fbR);
                prev *= mask;
            }

            color = color + prev * feedbackAmount * feedbackDecay;

            // ---- saturation / brightness / contrast ----
            if (abs(saturation - 1.0) > 0.001) {
                float lum = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(lum), color, saturation);
            }
            color *= brightness;
            if (abs(contrast - 1.0) > 0.001) {
                color = pow(max(color, vec3(0.0001)), vec3(contrast));
            }

            // ---- vignette ----
            vec2 vUv = v_texCoord - 0.5;
            vUv.x *= (1.0 + vignetteAspect);
            vUv.y *= (1.0 - vignetteAspect);
            float vr = length(vUv);
            float vg = smoothstep(vignetteRadius, vignetteRadius + vignetteSoft, vr);
            color = mix(color, vignetteColor, vg);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    /* ============================================================
       SHADER HELPERS
       ============================================================ */
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
        "time", "feedbackTex", "feedbackTex2",
        "feedbackAmount", "feedbackDecay", "feedbackGamma",
        "fbRotSpeed", "fbRotWobble", "fbRotWobbleSpeed",
        "fbZoom", "fbZoomWobble", "fbZoomWobbleSpeed",
        "fbOffset", "fbBlur",
        "fbWaveAmp", "fbWaveFreq", "fbWaveSpeed",
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

    /* ============================================================
       GEOMETRY
       ============================================================ */
    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    /* ============================================================
       FEEDBACK FBOs
       ============================================================ */
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

    /* ============================================================
       INIT GL
       ============================================================ */
    resizeCanvas();
    rebuildFeedback();
    window.addEventListener('resize', resizeCanvas);

    /* ============================================================
       ANIMATION LOOP
       ============================================================ */
    var lastFrameTime = 0;
    var startTime = performance.now();

    function animate(now) {
        if (__destroyed) return;

        /* ---- preset transition tween ---- */
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

        /* ---- auto morph ---- */
        if (state.autoMorph) {
            const morphMs = state.morphCycleTime * 1000;
            if (now - lastMorphTime >= morphMs) {
                lastMorphTime = now;
                const idx = Math.floor(Math.random() * PRESETS.length);
                loadPreset(idx);
            }
        } else {
            lastMorphTime = now;
        }

        /* ---- freeze time ---- */
        let shaderTime;
        if (state.freezeTime) {
            if (!freezeStart) freezeStart = now;
            shaderTime = (frozenTime > 0 ? frozenTime : (freezeStart - startTime)) * 0.001;
        } else {
            if (freezeStart) { frozenTime = now - startTime; freezeStart = 0; }
            shaderTime = (now - startTime) * 0.001;
        }

        /* ---- render ---- */
        var frameInterval = 1000 / Math.max(1, state.targetFPS);
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            var readTex = feedbackTextures[fbIndex];
            var readTex2 = layer2Textures[l2Index];
            var writeFBO = feedbackFBOs[1 - fbIndex];
            var writeFBO2 = layer2FBOs[1 - l2Index];

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(uniforms.feedbackTex, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, readTex2);
            gl.uniform1i(uniforms.feedbackTex2, 1);

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

            // ---- main layer ----
            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // ---- layer 2 (half-res) ----
            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO2);
            gl.viewport(0, 0, canvas.width >> 1, canvas.height >> 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // ---- blit main to screen ----
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.uniform1i(uniforms.feedbackTex, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, layer2Textures[1 - l2Index]);
            gl.uniform1i(uniforms.feedbackTex2, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fbIndex = 1 - fbIndex;
            l2Index = 1 - l2Index;
        }

        rafHandle = requestAnimationFrame(animate);
        window.animationFrameId = rafHandle;
    }

    /* ============================================================
       CONTROL PANEL
       ============================================================ */
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

            // ---- special: bool ----
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
                cb.addEventListener("change", () => { state[key] = cb.checked ? 1 : 0; });
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

            // ---- special: color ----
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

            // ---- normal slider + number ----
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

    /* ============================================================
       PRESET DROPDOWN
       ============================================================ */
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
            if (STANDALONE_KEYS[key]) {
                target[key] = state[key];
            } else if (p.values && key in p.values) {
                target[key] = deepClone(p.values[key]);
            } else {
                target[key] = deepClone(DEFAULTS[key]);
            }
        });
        Object.keys(INT_KEYS).forEach(k => { target[k] = Math.round(target[k]); });

        // Apply discrete/bool/color keys immediately
        Object.keys(DEFAULTS).forEach(k => {
            if (BOOL_KEYS[k] || COLOR_KEYS[k]) {
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

    /* ============================================================
       CONTROL HANDLERS
       ============================================================ */
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

    /* ============================================================
       KEYBOARD TOGGLE
       ============================================================ */
    function onKeyDown(e) {
        if (e.key === 'h' || e.key === 'H') {
            const p = document.getElementById('controls-panel');
            if (p) p.style.display = (p.style.display === 'none') ? '' : 'none';
        }
    }
    window.addEventListener('keydown', onKeyDown);

    /* ============================================================
       BOOT
       ============================================================ */
    buildControlsUI();
    buildPresetDropdown();
    setupControlHandlers();
    refreshControlsUI();

    var rafHandle = requestAnimationFrame(animate);
    window.animationFrameId = rafHandle;

    /* ============================================================
       TEARDOWN HANDLE
       ============================================================ */
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
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

main();