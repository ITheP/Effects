// =====================================================================
// PRESET / PARAMETER SYSTEM
// =====================================================================

// The DEFAULTS object is the single source of truth. Every tunable lives here.
// Named presets below override this. The live "current" state is kept in `state`.
var DEFAULTS = {
    rotBase: 0.00008,
    rotOscAmp: 0.00004,
    rotOscRate: 0.03,
    zoomBase: 1.00000,
    zoomOscAmp: 0.00002,
    zoomOscRate: 0.02,
    driftXBase: 0.0,
    driftXOscAmp: 0.00001,
    driftXOscRate: 0.02,
    driftYBase: 0.0,
    driftYOscAmp: 0.00001,
    driftYOscRate: 0.03,
    feedbackColor: 0.55,
    feedbackDecay: 0.985,
    warpBase: 0.082,
    warpOscAmp: 0.0815,
    warpOscRate: 0.08,
    flowSpeed: 0.025,
    warpStrength: 2.2,
    warpOctaves: 5.0,
    noiseScale: 2.8,
    rgbSplitAmount: 0.0015,
    rgbSplitAngle: 0.0,
    causticSharpness: 1.9,
    causticIntensity: 0.9,
    speedCenter: 1.25,
    speedOscAmp: 0.015,
    angleCenter: 0.0,
    angleOscAmp: 0.04,
    warpAngleCenter: 0.0,
    warpAngleOscAmp: 0.05,
    chRateR: 0.03, chPhaseR: 0.0,
    chRateG: 0.035, chPhaseG: 1.7,
    chRateB: 0.04, chPhaseB: 3.9,
    waRateR: 0.02, waPhaseR: 0.0,
    waRateG: 0.03, waPhaseG: 2.3,
    waRateB: 0.04, waPhaseB: 5.1,
    baseColorR: 0.04,
    baseColorG: 0.08,
    baseColorB: 0.16,
    tintR: 1.00,
    tintG: 0.85,
    tintB: 0.70,
    vignetteRadius: 0.55,
    vignetteSoftness: 0.35
};

// Presets array. Starts with a single "Default" preset — the current values.
// The JSON button appends new entries here (printed to console.debug for copy/paste).
var PRESETS = [
    { name: "Default", iteration: 1, values: Object.assign({}, DEFAULTS) },
    {
        "rotBase": 0.00008,
        "rotOscAmp": 0.00004,
        "rotOscRate": 0.03,
        "zoomBase": 0.47,
        "zoomOscAmp": 0.00002,
        "zoomOscRate": 0.02,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": 0.252,
        "feedbackDecay": 0.985,
        "warpBase": 0.1539,
        "warpOscAmp": 0.0113,
        "warpOscRate": -0.02,
        "flowSpeed": 0.1075,
        "warpStrength": 1.15,
        "warpOctaves": 7.11,
        "noiseScale": 5.61,
        "rgbSplitAmount": 0.01,
        "rgbSplitAngle": 7.81,
        "causticSharpness": 2.6,
        "causticIntensity": 1.479,
        "speedCenter": 1.07,
        "speedOscAmp": 0.0308,
        "angleCenter": -0.0023,
        "angleOscAmp": -0.0425,
        "warpAngleCenter": 0.0028,
        "warpAngleOscAmp": 0.0167,
        "chRateR": 0,
        "chPhaseR": 0,
        "chRateG": 0,
        "chPhaseG": 0,
        "chRateB": 0,
        "chPhaseB": 0,
        "waRateR": 0,
        "waPhaseR": 0,
        "waRateG": 0,
        "waPhaseG": 0,
        "waRateB": 0,
        "waPhaseB": 5.1,
        "baseColorR": 0.0382,
        "baseColorG": 0.0765,
        "baseColorB": 0.178,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.234,
        "vignetteSoftness": 0.473
    },
    {
        "name": "Thunderstorm",
        "iteration": 3,
        "values": {
            "rotBase": 0.00008,
            "rotOscAmp": 0.00004,
            "rotOscRate": 0.03,
            "zoomBase": 0.47,
            "zoomOscAmp": 0.00002,
            "zoomOscRate": 0.02,
            "driftXBase": 0,
            "driftXOscAmp": 0.00001,
            "driftXOscRate": 0.02,
            "driftYBase": 0,
            "driftYOscAmp": 0.00001,
            "driftYOscRate": 0.03,
            "feedbackColor": -0.643,
            "feedbackDecay": -0.945,
            "warpBase": 0.1539,
            "warpOscAmp": 0.0113,
            "warpOscRate": -0.02,
            "flowSpeed": 0.1075,
            "warpStrength": 0.27,
            "warpOctaves": 6.41,
            "noiseScale": 4.03,
            "rgbSplitAmount": -0.00230000000000001,
            "rgbSplitAngle": 9.21,
            "causticSharpness": 2.6,
            "causticIntensity": 2.009,
            "speedCenter": 1.07,
            "speedOscAmp": 0.0308,
            "angleCenter": -0.0023,
            "angleOscAmp": -0.0425,
            "warpAngleCenter": 0.0028,
            "warpAngleOscAmp": 0.0167,
            "chRateR": 0,
            "chPhaseR": 0,
            "chRateG": 0,
            "chPhaseG": 0,
            "chRateB": 0,
            "chPhaseB": 0,
            "waRateR": 0,
            "waPhaseR": 0,
            "waRateG": 0,
            "waPhaseG": 0,
            "waRateB": 0,
            "waPhaseB": 5.1,
            "baseColorR": 0.0382,
            "baseColorG": 0.0765,
            "baseColorB": 0.178,
            "tintR": 1.53,
            "tintG": 0.938,
            "tintB": 0.718,
            "vignetteRadius": 0.322,
            "vignetteSoftness": 0.473
        }
    },
    {
    "name": "Sunset Strip",
    "iteration": 6,
    "values": {
        "rotBase": 0.00008,
        "rotOscAmp": 0.00004,
        "rotOscRate": 0.03,
        "zoomBase": -0.53,
        "zoomOscAmp": 0.00002,
        "zoomOscRate": 0.02,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": -0.362,
        "feedbackDecay": -0.065,
        "warpBase": 0.1539,
        "warpOscAmp": 0.0113,
        "warpOscRate": -0.02,
        "flowSpeed": 0.1075,
        "warpStrength": 0.27,
        "warpOctaves": 6.41,
        "noiseScale": 4.03,
        "rgbSplitAmount": 0.00119999999999999,
        "rgbSplitAngle": 7.63,
        "causticSharpness": 2.6,
        "causticIntensity": 2.009,
        "speedCenter": 1.07,
        "speedOscAmp": 0.0308,
        "angleCenter": -0.0023,
        "angleOscAmp": -0.0425,
        "warpAngleCenter": 0.0028,
        "warpAngleOscAmp": 0.0167,
        "chRateR": 0,
        "chPhaseR": 0,
        "chRateG": 0.0012,
        "chPhaseG": -0.0028,
        "chRateB": 0.0011,
        "chPhaseB": 0.0032,
        "waRateR": 0.0007,
        "waPhaseR": 0,
        "waRateG": 0,
        "waPhaseG": 0,
        "waRateB": 0,
        "waPhaseB": 5.1,
        "baseColorR": 0.5,
        "baseColorG": 0.395,
        "baseColorB": 0.5,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.322,
        "vignetteSoftness": 0.473
    }
},
{
    "name": "Northern Lights",
    "iteration": 7,
    "values": {
        "rotBase": 0.00008,
        "rotOscAmp": 0.00004,
        "rotOscRate": 0.03,
        "zoomBase": -0.909,
        "zoomOscAmp": 0.00002,
        "zoomOscRate": 0.02,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": -0.362,
        "feedbackDecay": -0.065,
        "warpBase": 0.1539,
        "warpOscAmp": 0.0113,
        "warpOscRate": -0.02,
        "flowSpeed": 0.1075,
        "warpStrength": 0.62,
        "warpOctaves": 2.2,
        "noiseScale": 4.03,
        "rgbSplitAmount": 0.00119999999999999,
        "rgbSplitAngle": 7.63,
        "causticSharpness": 2.6,
        "causticIntensity": 2.009,
        "speedCenter": 1.07,
        "speedOscAmp": 0.0308,
        "angleCenter": -0.0023,
        "angleOscAmp": -0.0425,
        "warpAngleCenter": 0.0028,
        "warpAngleOscAmp": 0.0167,
        "chRateR": 0,
        "chPhaseR": 0,
        "chRateG": 0.0012,
        "chPhaseG": -0.0028,
        "chRateB": 0.0011,
        "chPhaseB": 0.0032,
        "waRateR": 0.0007,
        "waPhaseR": 0,
        "waRateG": 0,
        "waPhaseG": 0,
        "waRateB": 0,
        "waPhaseB": 5.1,
        "baseColorR": 0.5,
        "baseColorG": 0.395,
        "baseColorB": 0.5,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.322,
        "vignetteSoftness": 0.473
    }
},
{
    "name": "Heat Haze",
    "iteration": 8,
    "values": {
        "rotBase": 0.00008,
        "rotOscAmp": 0.00004,
        "rotOscRate": 0.03,
        "zoomBase": -0.909,
        "zoomOscAmp": 0.00002,
        "zoomOscRate": 0.02,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": -0.362,
        "feedbackDecay": -0.065,
        "warpBase": 0.1539,
        "warpOscAmp": 0.0113,
        "warpOscRate": -0.02,
        "flowSpeed": 0.1075,
        "warpStrength": 0.1,
        "warpOctaves": 2.72,
        "noiseScale": 4.03,
        "rgbSplitAmount": 0.00119999999999999,
        "rgbSplitAngle": 7.63,
        "causticSharpness": 2.6,
        "causticIntensity": 2.009,
        "speedCenter": 1.07,
        "speedOscAmp": 0.0308,
        "angleCenter": -0.0023,
        "angleOscAmp": -0.0425,
        "warpAngleCenter": 0.0028,
        "warpAngleOscAmp": 0.0167,
        "chRateR": 0,
        "chPhaseR": 0,
        "chRateG": 0.0012,
        "chPhaseG": -0.0028,
        "chRateB": 0.0011,
        "chPhaseB": 0.0032,
        "waRateR": 0.0007,
        "waPhaseR": 0,
        "waRateG": 0,
        "waPhaseG": 0,
        "waRateB": 0,
        "waPhaseB": 5.1,
        "baseColorR": 0.5,
        "baseColorG": 0.395,
        "baseColorB": 0.5,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.322,
        "vignetteSoftness": 0.473
    }
},
{
    "name": "Nebula",
    "iteration": 9,
    "values": {
        "rotBase": 0.00008,
        "rotOscAmp": 0.00004,
        "rotOscRate": 0.03,
        "zoomBase": -0.9,
        "zoomOscAmp": 0.00002,
        "zoomOscRate": 0.02,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": 0.147,
        "feedbackDecay": -4.275,
        "warpBase": 0.3,
        "warpOscAmp": 0.0113,
        "warpOscRate": 0.08,
        "flowSpeed": 0.1075,
        "warpStrength": 0.1,
        "warpOctaves": 2.72,
        "noiseScale": 4.3,
        "rgbSplitAmount": 0.00119999999999999,
        "rgbSplitAngle": 7.63,
        "causticSharpness": 2.6,
        "causticIntensity": 2.009,
        "speedCenter": 1.25,
        "speedOscAmp": 0.0308,
        "angleCenter": 0,
        "angleOscAmp": -0.0425,
        "warpAngleCenter": 0,
        "warpAngleOscAmp": 0.05,
        "chRateR": 0.0019,
        "chPhaseR": 0.0018,
        "chRateG": 0.0012,
        "chPhaseG": -0.0026,
        "chRateB": 0.0011,
        "chPhaseB": 0.0032,
        "waRateR": 0.0007,
        "waPhaseR": 0,
        "waRateG": 0.03,
        "waPhaseG": 0,
        "waRateB": 0,
        "waPhaseB": 5.1,
        "baseColorR": 0.04,
        "baseColorG": 0.08,
        "baseColorB": 0.16,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.322,
        "vignetteSoftness": 0.473
    }
},
{
    "name": "Oooh",
    "iteration": 10,
    "values": {
        "rotBase": 0.000125600000000001,
        "rotOscAmp": 0.0000926,
        "rotOscRate": 0.1247,
        "zoomBase": -0.742,
        "zoomOscAmp": 0.0000463,
        "zoomOscRate": 0.0674,
        "driftXBase": 0,
        "driftXOscAmp": 0.00001,
        "driftXOscRate": 0.02,
        "driftYBase": 0,
        "driftYOscAmp": 0.00001,
        "driftYOscRate": 0.03,
        "feedbackColor": 0.041,
        "feedbackDecay": 9.055,
        "warpBase": 0.3,
        "warpOscAmp": -0.0203,
        "warpOscRate": 0.0993,
        "flowSpeed": 0.025,
        "warpStrength": -0.43,
        "warpOctaves": 2.54,
        "noiseScale": 4.65,
        "rgbSplitAmount": 0.0468,
        "rgbSplitAngle": 12.55,
        "causticSharpness": 2.6,
        "causticIntensity": 2.009,
        "speedCenter": 1.25,
        "speedOscAmp": 0.0501,
        "angleCenter": 0,
        "angleOscAmp": 0.04,
        "warpAngleCenter": 0,
        "warpAngleOscAmp": 0.05,
        "chRateR": 0.0054,
        "chPhaseR": 0.0005,
        "chRateG": 0.0012,
        "chPhaseG": 0.0023,
        "chRateB": 0,
        "chPhaseB": 0.0016,
        "waRateR": 0.1042,
        "waPhaseR": 0.0063,
        "waRateG": 0.1089,
        "waPhaseG": 6.69,
        "waRateB": 0.0086,
        "waPhaseB": 5.1,
        "baseColorR": 0.04,
        "baseColorG": 0.08,
        "baseColorB": 0.16,
        "tintR": 1.53,
        "tintG": 0.938,
        "tintB": 0.718,
        "vignetteRadius": 0.322,
        "vignetteSoftness": 0.473
    }
}
];

// Live state — mutated by sliders and loaded presets
var state = Object.assign({}, DEFAULTS);

// Range calculator: rounding current to nearest power-of-ten-magnitude, times 2
// e.g. 0.082 -> round10(0.082)=0.08 -> magnitude 0.01 -> range ±0.1
function computeRange(value) {
    if (value === 0) {
        // For exact zero, pick a sensible generic range
        return { min: -0.01, max: 0.01, step: 0.0001 };
    }
    var abs = Math.abs(value);
    // Round to "nearest 10 at this magnitude": e.g. 0.082 -> 0.1
    var mag = Math.pow(10, Math.floor(Math.log10(abs)));
    var rounded = Math.round(abs / mag) * mag;
    // If the rounding produced zero (small value), fall back to magnitude
    if (rounded === 0) rounded = mag;
    // One magnitude bigger for the span
    var span = Math.pow(10, Math.floor(Math.log10(rounded)) + 1);
    var min = value - span;
    var max = value + span;
    // Step: 1/1000 of the span, respecting magnitude
    var step = span / 1000;
    return { min: min, max: max, step: step };
}

function fmtVal(v) {
    if (v === 0) return "0";
    var abs = Math.abs(v);
    if (abs >= 100) return v.toFixed(1);
    if (abs >= 1) return v.toFixed(3);
    if (abs >= 0.01) return v.toFixed(4);
    if (abs >= 0.0001) return v.toFixed(6);
    return v.toExponential(3);
}

function buildControlsUI() {
    var list = document.getElementById("controls-list");
    list.innerHTML = "";

    Object.keys(DEFAULTS).forEach(function (key) {
        var current = state[key];
        var def = DEFAULTS[key];
        var range = computeRange(current);

        var row = document.createElement("div");
        row.className = "ctrl-row";

        var label = document.createElement("label");
        label.textContent = key;
        label.title = key;

        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = range.min;
        slider.max = range.max;
        slider.step = range.step;
        slider.value = current;
        slider.dataset.key = key;

        var number = document.createElement("input");
        number.type = "number";
        number.step = range.step;
        number.value = fmtVal(current);
        number.dataset.key = key;

        var resetBtn = document.createElement("button");
        resetBtn.className = "reset-btn";
        resetBtn.textContent = "↺";
        resetBtn.title = "Reset to default (" + fmtVal(def) + ")";

        slider.addEventListener("input", function () {
            var v = parseFloat(slider.value);
            state[key] = v;
            number.value = fmtVal(v);
        });

        number.addEventListener("change", function () {
            var v = parseFloat(number.value);
            if (isNaN(v)) { number.value = fmtVal(state[key]); return; }
            state[key] = v;
            // Recompute slider range to accommodate new value
            var r = computeRange(v);
            slider.min = r.min;
            slider.max = r.max;
            slider.step = r.step;
            slider.value = v;
            number.step = r.step;
            number.value = fmtVal(v);
        });

        resetBtn.addEventListener("click", function () {
            state[key] = def;
            var r = computeRange(def);
            slider.min = r.min;
            slider.max = r.max;
            slider.step = r.step;
            slider.value = def;
            number.step = r.step;
            number.value = fmtVal(def);
        });

        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(number);
        row.appendChild(resetBtn);
        list.appendChild(row);
    });
}

function refreshControlsUI() {
    Object.keys(DEFAULTS).forEach(function (key) {
        var v = state[key];
        var sliders = document.querySelectorAll('input[type=range][data-key="' + key + '"]');
        var numbers = document.querySelectorAll('input[type=number][data-key="' + key + '"]');
        var r = computeRange(v);
        sliders.forEach(function (s) {
            s.min = r.min; s.max = r.max; s.step = r.step; s.value = v;
        });
        numbers.forEach(function (n) {
            n.step = r.step; n.value = fmtVal(v);
        });
    });
}

function buildPresetDropdown() {
    var sel = document.getElementById("preset-select");
    sel.innerHTML = "";
    PRESETS.forEach(function (p, idx) {
        var opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = (p.name || "Unnamed") + " (iter " + (p.iteration || "?") + ")";
        sel.appendChild(opt);
    });
}

function loadPreset(idx) {
    var p = PRESETS[idx];
    if (!p) return;
    // Only load keys that exist in DEFAULTS to avoid overwriting random state
    Object.keys(DEFAULTS).forEach(function (key) {
        if (key in p.values) state[key] = p.values[key];
    });
    refreshControlsUI();
}

function currentValuesAsJSON() {
    var vals = {};
    Object.keys(DEFAULTS).forEach(function (key) { vals[key] = state[key]; });
    return vals;
}

function setupControlHandlers() {
    document.getElementById("toggle-panel").addEventListener("click", function () {
        var body = document.getElementById("controls-body");
        body.classList.toggle("collapsed");
    });

    document.getElementById("btn-load-preset").addEventListener("click", function () {
        var sel = document.getElementById("preset-select");
        loadPreset(parseInt(sel.value, 10));
    });

    document.getElementById("btn-reset-all").addEventListener("click", function () {
        Object.keys(DEFAULTS).forEach(function (k) { state[k] = DEFAULTS[k]; });
        refreshControlsUI();
    });

    document.getElementById("btn-json").addEventListener("click", function () {
        // Auto-increment iteration based on highest existing iteration
        var maxIter = 0;
        PRESETS.forEach(function (p) { if (p.iteration > maxIter) maxIter = p.iteration; });
        var nextIter = maxIter + 1;

        var preset = {
            name: "Preset " + nextIter,   // <-- manually rename when you paste back
            iteration: nextIter,
            values: currentValuesAsJSON()
        };

        var json = JSON.stringify(preset, null, 4);

        // console.debug for the labelled trace
        console.debug("=== PRESET JSON (copy into PRESETS array) ===");
        console.debug(json);
        console.debug("=== END PRESET JSON ===");

        // console.log for easy copy/paste — this is the raw JSON on its own line
        console.log(json);

        // Also add to dropdown so the user sees it immediately
        PRESETS.push(preset);
        buildPresetDropdown();
        document.getElementById("preset-select").value = PRESETS.length - 1;
    });
}

// =====================================================================
// SHADER
// =====================================================================
function main() {
    cancelAnimationFrame(animationFrameId);
    document.body.querySelectorAll("canvas").forEach(canvas => canvas.remove());

    var canvas = document.createElement("canvas");
    var content = document.getElementById("content");
    canvas.style.position = 'fixed';
    canvas.style.zIndex = -1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    content.appendChild(canvas);

    var gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false });
    if (!gl) { console.log('WebGL not supported'); return; }

    // Feedback framebuffer declarations
    var feedbackFBOs = [null, null];
    var feedbackTextures = [null, null];
    var fbIndex = 0;
    var program = null;
    var timeLocation = null;
    var positionLocation = null;
    var feedbackTexLocation = null;
    var u = {};

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
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

        uniform float fbRotStep;
        uniform float fbZoomStep;
        uniform vec2  fbDriftStep;

        uniform float feedbackColor;
        uniform float feedbackDecay;
        uniform float warpAmount;

        uniform float flowSpeed;
        uniform float warpStrength;
        uniform float warpOctaves;
        uniform float noiseScale;
        uniform float rgbSplitAmount;
        uniform float rgbSplitAngle;
        uniform vec3  flowSpeedRGB;
        uniform vec3  flowAngleRGB;
        uniform vec3  warpAngleRGB;
        uniform float causticSharpness;
        uniform float causticIntensity;
        uniform vec3  baseColor;
        uniform vec3  tint;
        uniform float vignetteRadius;
        uniform float vignetteSoftness;

        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float fbm(vec2 p, float octaves) {
            float v = 0.0;
            float amp = 0.5;
            float freq = 1.0;
            v += amp * noise(p * freq); amp *= 0.5; freq *= 2.03;
            v += amp * noise(p * freq) * step(1.5, octaves); amp *= 0.5; freq *= 2.03;
            v += amp * noise(p * freq) * step(2.5, octaves); amp *= 0.5; freq *= 2.03;
            v += amp * noise(p * freq) * step(3.5, octaves); amp *= 0.5; freq *= 2.03;
            v += amp * noise(p * freq) * step(4.5, octaves); amp *= 0.5; freq *= 2.03;
            v += amp * noise(p * freq) * step(5.5, octaves);
            return v;
        }

        vec2 rot(vec2 p, float a) {
            float c = cos(a), s = sin(a);
            return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
        }

        vec2 flow(vec2 p, float t, float angle) {
            vec2 rp = rot(p, angle);
            vec2 q = rp * noiseScale + vec2(t * flowSpeed, t * flowSpeed * 0.73);
            float x = fbm(q, warpOctaves);
            float y = fbm(q + vec2(37.2, 11.7), warpOctaves);
            return rot(vec2(x, y) - 0.5, -angle);
        }

        float causticLayer(vec2 p, float t, float channelIdx) {
            float idx = channelIdx + 1.0;
            float chSpeedMul  = idx < 0.5 ? flowSpeedRGB.r : (idx < 1.5 ? flowSpeedRGB.g : flowSpeedRGB.b);
            float chFlowAngle = idx < 0.5 ? flowAngleRGB.r : (idx < 1.5 ? flowAngleRGB.g : flowAngleRGB.b);
            float chWarpAngle = idx < 0.5 ? warpAngleRGB.r : (idx < 1.5 ? warpAngleRGB.g : warpAngleRGB.b);

            vec2 dir = vec2(cos(rgbSplitAngle), sin(rgbSplitAngle));
            vec2 shifted = p + dir * channelIdx * rgbSplitAmount;
            float localT = t * chSpeedMul;

            vec2 w = flow(shifted, localT, chFlowAngle) * warpStrength;
            vec2 warpedPoint = rot(shifted + w * 0.7, chWarpAngle);
            vec2 w2 = flow(warpedPoint, localT * 1.13, chFlowAngle) * warpStrength;

            vec2 finalPt = shifted + w + w2 * 0.5;
            float v = fbm(finalPt * noiseScale, warpOctaves);
            v = pow(v, causticSharpness);
            return v * causticIntensity;
        }

        void main() {
            vec2 uv = v_texCoord - 0.5;
            uv = rot(uv, fbRotStep);
            uv *= fbZoomStep;
            uv -= fbDriftStep;
            uv += 0.5;

            if (warpAmount > 0.0001) {
                vec2 w1 = flow(uv, time * 0.15, 0.0);
                vec2 w2 = flow(uv + w1 * 1.5, time * 0.22, 0.0);
                uv += (w1 + w2 * 0.5) * warpAmount;
            }

            vec3 prev = texture2D(feedbackTex, uv).rgb;

            float t = time;
            float rCh = causticLayer(uv, t, -1.0);
            float gCh = causticLayer(uv, t,  0.0);
            float bCh = causticLayer(uv, t,  1.0);
            vec3 color = baseColor + vec3(rCh, gCh, bCh) * tint;

            color = color + prev * feedbackColor * feedbackDecay;

            float d = distance(v_texCoord, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, d);
            color = mix(color, vec3(0.0), vig);

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

    timeLocation = gl.getUniformLocation(program, "time");
    feedbackTexLocation = gl.getUniformLocation(program, "feedbackTex");
    u.fbRotStep = gl.getUniformLocation(program, "fbRotStep");
    u.fbZoomStep = gl.getUniformLocation(program, "fbZoomStep");
    u.fbDriftStep = gl.getUniformLocation(program, "fbDriftStep");
    u.feedbackColor = gl.getUniformLocation(program, "feedbackColor");
    u.feedbackDecay = gl.getUniformLocation(program, "feedbackDecay");
    u.warpAmount = gl.getUniformLocation(program, "warpAmount");
    u.flowSpeed = gl.getUniformLocation(program, "flowSpeed");
    u.warpStrength = gl.getUniformLocation(program, "warpStrength");
    u.warpOctaves = gl.getUniformLocation(program, "warpOctaves");
    u.noiseScale = gl.getUniformLocation(program, "noiseScale");
    u.rgbSplitAmount = gl.getUniformLocation(program, "rgbSplitAmount");
    u.rgbSplitAngle = gl.getUniformLocation(program, "rgbSplitAngle");
    u.flowSpeedRGB = gl.getUniformLocation(program, "flowSpeedRGB");
    u.flowAngleRGB = gl.getUniformLocation(program, "flowAngleRGB");
    u.warpAngleRGB = gl.getUniformLocation(program, "warpAngleRGB");
    u.causticSharpness = gl.getUniformLocation(program, "causticSharpness");
    u.causticIntensity = gl.getUniformLocation(program, "causticIntensity");
    u.baseColor = gl.getUniformLocation(program, "baseColor");
    u.tint = gl.getUniformLocation(program, "tint");
    u.vignetteRadius = gl.getUniformLocation(program, "vignetteRadius");
    u.vignetteSoftness = gl.getUniformLocation(program, "vignetteSoftness");

    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    positionLocation = gl.getAttribLocation(program, "position");
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

    resizeCanvas();
    ResizeManager.attach(resizeCanvas);
    rebuildFeedback();

    var lastFrameTime = 0;
    var targetFPS = 60;
    var frameInterval = 1000 / targetFPS;

    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;
            var tSec = now * 0.001;
            var TAU = Math.PI * 2.0;

            // Read from the live `state` object — this is what sliders mutate
            var rotStep = state.rotBase + state.rotOscAmp * Math.sin(tSec * state.rotOscRate * TAU);
            var zoomStep = state.zoomBase + state.zoomOscAmp * Math.sin(tSec * state.zoomOscRate * TAU + 1.3);
            var driftXStep = state.driftXBase + state.driftXOscAmp * Math.sin(tSec * state.driftXOscRate * TAU + 2.1);
            var driftYStep = state.driftYBase + state.driftYOscAmp * Math.sin(tSec * state.driftYOscRate * TAU + 4.4);
            var warpNow = state.warpBase + state.warpOscAmp * Math.sin(tSec * state.warpOscRate * TAU);

            var speedR = state.speedCenter + state.speedOscAmp * Math.sin(tSec * state.chRateR * TAU + state.chPhaseR);
            var speedG = state.speedCenter + state.speedOscAmp * Math.sin(tSec * state.chRateG * TAU + state.chPhaseG);
            var speedB = state.speedCenter + state.speedOscAmp * Math.sin(tSec * state.chRateB * TAU + state.chPhaseB);

            var angleR = 0.0 + state.angleOscAmp * Math.sin(tSec * state.chRateR * TAU + state.chPhaseR + 0.9);
            var angleG = state.angleCenter * 1.0 + state.angleOscAmp * Math.sin(tSec * state.chRateG * TAU + state.chPhaseG + 0.9);
            var angleB = state.angleCenter * 2.0 + state.angleOscAmp * Math.sin(tSec * state.chRateB * TAU + state.chPhaseB + 0.9);

            var warpAR = state.warpAngleCenter + state.warpAngleOscAmp * Math.sin(tSec * state.waRateR * TAU + state.waPhaseR);
            var warpAG = state.warpAngleCenter + state.warpAngleOscAmp * Math.sin(tSec * state.waRateG * TAU + state.waPhaseG);
            var warpAB = state.warpAngleCenter + state.warpAngleOscAmp * Math.sin(tSec * state.waRateB * TAU + state.waPhaseB);

            var readTex = feedbackTextures[fbIndex];
            var writeFBO = feedbackFBOs[1 - fbIndex];

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(feedbackTexLocation, 0);

            gl.uniform1f(u.fbRotStep, rotStep);
            gl.uniform1f(u.fbZoomStep, zoomStep);
            gl.uniform2f(u.fbDriftStep, driftXStep, driftYStep);
            gl.uniform1f(u.feedbackColor, state.feedbackColor);
            gl.uniform1f(u.feedbackDecay, state.feedbackDecay);
            gl.uniform1f(u.warpAmount, warpNow);
            gl.uniform1f(u.flowSpeed, state.flowSpeed);
            gl.uniform1f(u.warpStrength, state.warpStrength);
            gl.uniform1f(u.warpOctaves, state.warpOctaves);
            gl.uniform1f(u.noiseScale, state.noiseScale);
            gl.uniform1f(u.rgbSplitAmount, state.rgbSplitAmount);
            gl.uniform1f(u.rgbSplitAngle, state.rgbSplitAngle);
            gl.uniform3f(u.flowSpeedRGB, speedR, speedG, speedB);
            gl.uniform3f(u.flowAngleRGB, angleR, angleG, angleB);
            gl.uniform3f(u.warpAngleRGB, warpAR, warpAG, warpAB);
            gl.uniform1f(u.causticSharpness, state.causticSharpness);
            gl.uniform1f(u.causticIntensity, state.causticIntensity);
            gl.uniform3f(u.baseColor, state.baseColorR, state.baseColorG, state.baseColorB);
            gl.uniform3f(u.tint, state.tintR, state.tintG, state.tintB);
            gl.uniform1f(u.vignetteRadius, state.vignetteRadius);
            gl.uniform1f(u.vignetteSoftness, state.vignetteSoftness);

            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, tSec);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fbIndex = 1 - fbIndex;
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

// =====================================================================
// BOOT
// =====================================================================
buildControlsUI();
buildPresetDropdown();
setupControlHandlers();
main();