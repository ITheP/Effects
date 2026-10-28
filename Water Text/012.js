// =====================================================================
// PRESET / PARAMETER SYSTEM
// =====================================================================

var DEFAULTS = {
    "timeScale": 2,
    "rainRate": 100,
    "maxRipples": 64,
    "rippleSpeed": 0.057,
    "rippleWavelength": 0.0134,
    "rippleDecay": 3.3,
    "rippleStrength": 0.0169,
    "rippleThickness": 2.18,
    "rippleWavelengthVariance": 0.43,
    "rippleDecayVariance": 0.49,
    "rippleStrengthVariance": 0.85,
    "rippleDriftX": -0.055,
    "rippleDriftY": -0.05,
    "simulationMode": 1,
    "simTension": 0.455,
    "simDamping": 0.9636,
    "simRainImpulse": 0.08,
    "simSpringiness": 0.27,
    "simDropRadius": 0.0048,
    "simDropCore": 0.18,

    "dropFallSpeed": 5.0,
    "dropFallSpeedVariance": 0.25,
    "dropFallHeight": 2.5,
    "dropSize": 0.012,
    "dropSizeVariance": 0.35,

    "letterRate": 9.09,
    "letterMaxAge": 10,
    "letterStrength": 0.101,
    "letterDecay": 0,
    "letterSize": 0.2,
    "letterSpacing": 0.48,
    "letterYOffset": 0.33,
    "letterYVariance": 0.05,
    "letterLineDelay": 1.3,
    "letterSizeVariance": 0.35,
    "letterAngleVariance": 0.54,
    "letterSpeed": 0.02,
    "letterWavelength": 0.0514,
    "letterThickness": 0.7,
    "simLetterSize": 0.02,
    "debugSim": 0,
    "rgbSplit": 0, "rgbAngle": 0,
    "wave1Amp": 0.005, "wave1Freq": 40, "wave1Speed": 2.781, "wave1Angle": 0.886,
    "wave2Amp": 0.01, "wave2Freq": 15.9, "wave2Speed": 0.7, "wave2Angle": 1.052,
    "wave3Amp": 0.001, "wave3Freq": -47.2, "wave3Speed": -0.008, "wave3Angle": -4.67,
    "wave4Amp": 0.00064, "wave4Freq": 116.9, "wave4Speed": 1, "wave4Angle": 0.352,
    "waveWarp": 0.76, "waveWarpScale": 0.32,
    "surfaceDepth": 0.529, "surfaceTilt": 0.58, "gridResolution": 512,
    "perspectiveStrength": 0.66, "cameraHeight": 3.27,
    "sunAngle": -0.53, "sunHeight": 0.224,
    "specularPower": 13, "specularStrength": -0.231, "fresnelPower": 0.51,
    "waterDepth": 0.202, "absorption": 0.61, "sandScale": 3190,
    "sandContrast": 0.69, "sandR": 0.727, "sandG": 0.717, "sandB": 0.636,
    "refractionStrength": 0.051, "envMapStrength": 0.1,
    "skyHorizonR": 0.707, "skyHorizonG": 0.737, "skyHorizonB": 0.515,
    "skyZenithR": 0.211, "skyZenithG": 0.333, "skyZenithB": 0.596,
    "waterColorR": 0.475, "waterColorG": 0.72, "waterColorB": 0.899,
    "waterDeepR": 0.131, "waterDeepG": 0.253, "waterDeepB": 0.374,
    "vignetteRadius": 0.683, "vignetteSoftness": 0.38
};

var PRESETS = [
    { name: "Preset 11", iteration: 11, values: Object.assign({}, DEFAULTS) }
];

var MAX_RIPPLES = 64;
var MAX_DROPS = 64;
var MAX_LETTERS = 16;
var MAX_FALLING_DROPS = 32;
var RIPPLE_MAX_AGE = 4.0;

var COLOUR_KEYS = {
    waterColorR: true, waterColorG: true, waterColorB: true,
    waterDeepR: true, waterDeepG: true, waterDeepB: true,
    skyHorizonR: true, skyHorizonG: true, skyHorizonB: true,
    skyZenithR: true, skyZenithG: true, skyZenithB: true,
    sandR: true, sandG: true, sandB: true
};
var INT_KEYS = { maxRipples: true, gridResolution: true };

var state = Object.assign({}, DEFAULTS);
var meshRebuildFn = null;

function computeRange(value, key) {
    if (key === "maxRipples") return { min: 1, max: MAX_RIPPLES, step: 1 };
    if (key === "gridResolution") return { min: 40, max: 1024, step: 8 };
    if (key === "fresnelPower") return { min: 0.0, max: 10.0, step: 0.01 };
    if (key === "perspectiveStrength") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "cameraHeight") return { min: 0.2, max: 10.0, step: 0.01 };
    if (key === "surfaceTilt") return { min: -1.0, max: 1.0, step: 0.01 };
    if (key === "waveWarp") return { min: 0.0, max: 3.0, step: 0.01 };
    if (key === "waveWarpScale") return { min: 0.1, max: 5.0, step: 0.01 };
    if (key === "waterDepth") return { min: 0.0, max: 1.0, step: 0.001 };
    if (key === "absorption") return { min: 0.0, max: 10.0, step: 0.01 };
    if (key === "sandContrast") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "refractionStrength") return { min: 0.0, max: 0.5, step: 0.001 };
    if (key === "envMapStrength") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "simulationMode") return { min: 0.0, max: 1.0, step: 1.0 };
    if (key === "debugSim") return { min: 0.0, max: 1.0, step: 1.0 };
    if (key === "simTension") return { min: 0.01, max: 0.5, step: 0.001 };
    if (key === "simDamping") return { min: 0.8, max: 0.9999, step: 0.0001 };
    if (key === "simRainImpulse") return { min: 0.0, max: 2.0, step: 0.01 };
    if (key === "simSpringiness") return { min: 0.0, max: 0.3, step: 0.001 };
    if (key === "simDropRadius") return { min: 0.001, max: 0.03, step: 0.0001 };
    if (key === "simDropCore") return { min: 0.05, max: 0.9, step: 0.01 };

    if (key === "dropFallSpeed") return { min: 0.5, max: 20.0, step: 0.1 };
    if (key === "dropFallSpeedVariance") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "dropFallHeight") return { min: 0.05, max: 5.0, step: 0.01 };
    if (key === "dropSize") return { min: 0.001, max: 0.05, step: 0.0001 };
    if (key === "dropSizeVariance") return { min: 0.0, max: 1.0, step: 0.01 };

    if (key === "letterRate") return { min: 0.0, max: 20.0, step: 0.01 };
    if (key === "letterMaxAge") return { min: 0.5, max: 10.0, step: 0.01 };
    if (key === "letterStrength") return { min: -2.0, max: 2.0, step: 0.001 };
    if (key === "letterDecay") return { min: 0.0, max: 10.0, step: 0.01 };
    if (key === "letterSize") return { min: 0.01, max: 0.5, step: 0.001 };
    if (key === "letterSpacing") return { min: 0.1, max: 2.0, step: 0.01 };
    if (key === "letterLineDelay") return { min: 0.5, max: 10.0, step: 0.1 };
    if (key === "letterSizeVariance") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "letterAngleVariance") return { min: 0.0, max: 3.14, step: 0.01 };
    if (key === "letterYOffset") return { min: -0.5, max: 0.5, step: 0.01 };
    if (key === "letterYVariance") return { min: 0.0, max: 0.5, step: 0.01 };
    if (key === "letterSpeed") return { min: 0.0, max: 1.0, step: 0.001 };
    if (key === "letterWavelength") return { min: 0.001, max: 0.5, step: 0.0001 };
    if (key === "letterThickness") return { min: 0.1, max: 10.0, step: 0.01 };
    if (key === "simLetterSize") return { min: 0.005, max: 0.2, step: 0.001 };

    if (key === "rippleWavelengthVariance" || key === "rippleDecayVariance" || key === "rippleStrengthVariance") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key && COLOUR_KEYS[key]) return { min: 0.0, max: 1.0, step: 0.001 };

    if (key === "timeScale") return { min: 0.0, max: 10.0, step: 0.01 };
    if (key === "rainRate") return { min: 0.0, max: 200.0, step: 0.01 };
    if (key === "rippleSpeed") return { min: 0.0, max: 1.0, step: 0.001 };
    if (key === "rippleWavelength") return { min: 0.001, max: 0.5, step: 0.0001 };
    if (key === "rippleDecay") return { min: 0.0, max: 30.0, step: 0.01 };
    if (key === "rippleStrength") return { min: -5.0, max: 5.0, step: 0.001 };
    if (key === "rippleThickness") return { min: 0.1, max: 10.0, step: 0.01 };

    if (value === 0) return { min: -0.01, max: 0.01, step: 0.0001 };
    var abs = Math.abs(value);
    var mag = Math.pow(10, Math.floor(Math.log10(abs)));
    var rounded = Math.round(abs / mag) * mag;
    if (rounded === 0) rounded = mag;
    var span = Math.pow(10, Math.floor(Math.log10(rounded)) + 1);
    return { min: value - span, max: value + span, step: span / 1000 };
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
        var range = computeRange(current, key);
        var isInt = !!INT_KEYS[key];
        var isMeshRebuild = (key === "gridResolution");
        var row = document.createElement("div");
        row.className = "ctrl-row";
        var label = document.createElement("label");
        label.textContent = key;
        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = range.min; slider.max = range.max; slider.step = range.step;
        slider.value = current;
        slider.dataset.key = key;
        var number = document.createElement("input");
        number.type = "number";
        number.step = range.step;
        number.value = isInt ? String(Math.round(current)) : fmtVal(current);
        number.dataset.key = key;
        var resetBtn = document.createElement("button");
        resetBtn.className = "reset-btn";
        resetBtn.textContent = "↺";
        slider.addEventListener("input", function () {
            var v = parseFloat(slider.value);
            if (isInt) v = Math.round(v);
            state[key] = v;
            number.value = isInt ? String(v) : fmtVal(v);
        });
        slider.addEventListener("change", function () {
            if (isMeshRebuild && typeof meshRebuildFn === "function") {
                meshRebuildFn(Math.round(state.gridResolution));
            }
        });
        number.addEventListener("change", function () {
            var v = parseFloat(number.value);
            if (isNaN(v)) { number.value = fmtVal(state[key]); return; }
            if (isInt) v = Math.max(range.min, Math.min(range.max, Math.round(v)));
            state[key] = v;
            var r = computeRange(v, key);
            slider.min = r.min; slider.max = r.max; slider.step = r.step;
            slider.value = v; number.step = r.step;
            number.value = isInt ? String(v) : fmtVal(v);
            if (isMeshRebuild && typeof meshRebuildFn === "function") meshRebuildFn(Math.round(v));
        });
        resetBtn.addEventListener("click", function () {
            state[key] = def;
            var r = computeRange(def, key);
            slider.min = r.min; slider.max = r.max; slider.step = r.step;
            slider.value = def; number.step = r.step;
            number.value = isInt ? String(Math.round(def)) : fmtVal(def);
            if (isMeshRebuild && typeof meshRebuildFn === "function") meshRebuildFn(Math.round(def));
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
        var isInt = !!INT_KEYS[key];
        if (isInt) v = Math.round(v);
        var sliders = document.querySelectorAll('input[type=range][data-key="' + key + '"]');
        var numbers = document.querySelectorAll('input[type=number][data-key="' + key + '"]');
        var r = computeRange(v, key);
        sliders.forEach(function (s) { s.min = r.min; s.max = r.max; s.step = r.step; s.value = v; });
        numbers.forEach(function (n) { n.step = r.step; n.value = isInt ? String(v) : fmtVal(v); });
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
    var prevGrid = Math.round(state.gridResolution);
    Object.keys(DEFAULTS).forEach(function (key) {
        if (p.values && key in p.values) state[key] = p.values[key];
        else state[key] = DEFAULTS[key];
    });
    state.maxRipples = Math.round(state.maxRipples);
    state.gridResolution = Math.round(state.gridResolution);
    refreshControlsUI();
    if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
        meshRebuildFn(state.gridResolution);
    }
}

function currentValuesAsJSON() {
    var vals = {};
    Object.keys(DEFAULTS).forEach(function (key) {
        vals[key] = INT_KEYS[key] ? Math.round(state[key]) : state[key];
    });
    return vals;
}

function setupControlHandlers() {
    document.getElementById("toggle-panel").addEventListener("click", function () {
        document.getElementById("controls-body").classList.toggle("collapsed");
    });
    document.getElementById("btn-load-preset").addEventListener("click", function () {
        loadPreset(parseInt(document.getElementById("preset-select").value, 10));
    });
    document.getElementById("btn-reset-all").addEventListener("click", function () {
        var prevGrid = Math.round(state.gridResolution);
        Object.keys(DEFAULTS).forEach(function (k) { state[k] = DEFAULTS[k]; });
        state.maxRipples = Math.round(state.maxRipples);
        state.gridResolution = Math.round(state.gridResolution);
        refreshControlsUI();
        if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
            meshRebuildFn(state.gridResolution);
        }
    });
    document.getElementById("btn-json").addEventListener("click", function () {
        var maxIter = 0;
        PRESETS.forEach(function (p) { if (p.iteration > maxIter) maxIter = p.iteration; });
        var nextIter = maxIter + 1;
        var preset = { name: "Preset " + nextIter, iteration: nextIter, values: currentValuesAsJSON() };
        console.log(JSON.stringify(preset, null, 4));
    });
}

// =====================================================================
// SDF ATLAS GENERATOR (unchanged)
// =====================================================================

function buildSDFAtlas(gl, fontName) {
    var CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var CELL = 96, PAD = 4, SPREAD = 16, COLS = 8;
    var ROWS = Math.ceil(CHARSET.length / COLS);
    var ATLAS_W = (CELL + PAD * 2) * COLS;
    var ATLAS_H = (CELL + PAD * 2) * ROWS;

    var masks = {};
    var renderCanvas = document.createElement("canvas");
    renderCanvas.width = CELL; renderCanvas.height = CELL;
    var rctx = renderCanvas.getContext("2d", { willReadFrequently: true });

    for (var ci = 0; ci < CHARSET.length; ci++) {
        var ch = CHARSET[ci];
        rctx.clearRect(0, 0, CELL, CELL);
        var fontSize = Math.round(CELL * 0.65);
        var chosenFont = fontName || "monospace";
        rctx.font = "bold " + fontSize + "px '" + chosenFont + "', monospace";
        var metrics = rctx.measureText(ch);
        var ascent = metrics.actualBoundingBoxAscent || (fontSize * 0.72);
        var descent = metrics.actualBoundingBoxDescent || (fontSize * 0.05);
        var drawX = CELL / 2;
        var drawY = CELL / 2 + (ascent - descent) / 2;
        rctx.fillStyle = "#000";
        rctx.textAlign = "center";
        rctx.textBaseline = "alphabetic";
        rctx.fillText(ch, drawX, drawY);
        var img = rctx.getImageData(0, 0, CELL, CELL);
        var mask = new Uint8Array(CELL * CELL);
        for (var i = 0; i < CELL * CELL; i++) mask[i] = img.data[i * 4 + 3];
        masks[ch] = mask;
    }

    function edt1D(f, n, d, v, z) {
        var k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
        for (var q = 1; q < n; q++) {
            var s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
            while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
            k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
        }
        k = 0;
        for (var q2 = 0; q2 < n; q2++) { while (z[k + 1] < q2) k++; d[q2] = (q2 - v[k]) * (q2 - v[k]) + f[v[k]]; }
    }
    function edt2D(mask, W, H, wantInside) {
        var INF = 1e20;
        var f = new Float64Array(Math.max(W, H)), d = new Float64Array(Math.max(W, H)), v = new Int32Array(Math.max(W, H)), z = new Float64Array(Math.max(W, H) + 1);
        var grid = new Float64Array(W * H);
        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
            var bit = mask[y * W + x] > 127 ? 1 : 0;
            grid[y * W + x] = (bit === (wantInside ? 1 : 0)) ? INF : 0;
        }
        for (var x = 0; x < W; x++) {
            for (var y = 0; y < H; y++) f[y] = grid[y * W + x];
            edt1D(f, H, d, v, z);
            for (var y = 0; y < H; y++) grid[y * W + x] = d[y];
        }
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) f[x] = grid[y * W + x];
            edt1D(f, W, d, v, z);
            for (var x = 0; x < W; x++) grid[y * W + x] = d[x];
        }
        for (var i = 0; i < W * H; i++) grid[i] = Math.sqrt(grid[i]);
        return grid;
    }

    var atlasBytes = new Uint8Array(ATLAS_W * ATLAS_H);
    var letterUVs = {};
    for (var ci2 = 0; ci2 < CHARSET.length; ci2++) {
        var ch2 = CHARSET[ci2];
        var mask2 = masks[ch2];
        var distOut = edt2D(mask2, CELL, CELL, false);
        var distIn = edt2D(mask2, CELL, CELL, true);
        var cellX = (ci2 % COLS) * (CELL + PAD * 2) + PAD;
        var cellY = Math.floor(ci2 / COLS) * (CELL + PAD * 2) + PAD;
        for (var py = 0; py < CELL; py++) for (var px = 0; px < CELL; px++) {
            var inside = mask2[py * CELL + px] > 127;
            var sd = inside ? -distIn[py * CELL + px] : distOut[py * CELL + px];
            var clamped = Math.max(0, Math.min(SPREAD, sd));
            var normalised = 1.0 - (clamped / SPREAD);
            if (px < 2 || px >= CELL - 2 || py < 2 || py >= CELL - 2) normalised = 0.0;
            atlasBytes[(cellY + py) * ATLAS_W + (cellX + px)] = Math.round(normalised * 255);
        }
        letterUVs[ch2] = {
            u0: cellX / ATLAS_W, v0: cellY / ATLAS_H,
            u1: (cellX + CELL) / ATLAS_W, v1: (cellY + CELL) / ATLAS_H
        };
    }

    var rgba = new Uint8Array(ATLAS_W * ATLAS_H * 4);
    for (var k = 0; k < ATLAS_W * ATLAS_H; k++) {
        var val = atlasBytes[k];
        rgba[k * 4 + 0] = val; rgba[k * 4 + 1] = val; rgba[k * 4 + 2] = val; rgba[k * 4 + 3] = 255;
    }

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS_W, ATLAS_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return {
        texture: tex, letterUVs: letterUVs, cellSize: CELL, spread: SPREAD,
        atlasWidth: ATLAS_W, atlasHeight: ATLAS_H, charset: CHARSET
    };
}

// =====================================================================
// SHADERS
// =====================================================================

// Water surface shader (unchanged except no falling drops in fragment shader)
var VERTEX_SHADER = `
    precision highp float;
    attribute vec2 gridPos;
    varying vec2 v_uv;
    varying vec3 v_normal_r, v_normal_g, v_normal_b;
    varying float v_height;
    varying vec3 v_worldPos;

    uniform float time;
    uniform sampler2D simTexture;
    uniform float simulationMode;
    uniform vec2  simDrift;

    uniform float wave1Amp, wave1Freq, wave1Speed, wave1Angle;
    uniform float wave2Amp, wave2Freq, wave2Speed, wave2Angle;
    uniform float wave3Amp, wave3Freq, wave3Speed, wave3Angle;
    uniform float wave4Amp, wave4Freq, wave4Speed, wave4Angle;
    uniform float waveWarp, waveWarpScale;

    uniform float rippleSpeed, rippleWavelength, rippleThickness;
    uniform int   rippleCount;
    uniform vec4  ripples[${MAX_RIPPLES}];
    uniform vec4  rippleParams[${MAX_RIPPLES}];
    uniform float rippleTime;
    uniform vec2  rippleDrift;

    uniform sampler2D letterAtlas;
    uniform float letterSpread, letterSize, letterStrengthGlobal;
    uniform int   letterCount;
    uniform vec4  letterRipples[${MAX_LETTERS}];
    uniform vec4  letterRippleParams[${MAX_LETTERS}];
    uniform vec4  letterRippleV[${MAX_LETTERS}];
    uniform float letterSpeed, letterWavelength, letterThickness;

    uniform float rgbSplit, rgbAngle, surfaceDepth, surfaceTilt, perspectiveStrength, cameraHeight;

    float baseWavesHeight(vec2 p, float t) {
        vec2 d1 = vec2(cos(wave1Angle), sin(wave1Angle));
        vec2 d2 = vec2(cos(wave2Angle), sin(wave2Angle));
        vec2 d3 = vec2(cos(wave3Angle), sin(wave3Angle));
        vec2 d4 = vec2(cos(wave4Angle), sin(wave4Angle));
        float wf = max(abs(wave1Freq) + abs(wave2Freq) + abs(wave3Freq) + abs(wave4Freq), 1.0);
        float warpMag = waveWarp * 10.0 / wf;
        float ws = waveWarpScale;
        float detune = 1.37;
        vec2 w1 = vec2(sin(dot(p, d2) * wave2Freq * ws + t * wave2Speed + 1.1), cos(dot(p, d3) * wave3Freq * ws + t * wave3Speed * detune + 2.7)) * warpMag;
        vec2 w2 = vec2(sin(dot(p, d3) * wave3Freq * ws + t * wave3Speed + 2.3), cos(dot(p, d4) * wave4Freq * ws + t * wave4Speed * detune + 0.4)) * warpMag;
        vec2 w3 = vec2(sin(dot(p, d4) * wave4Freq * ws + t * wave4Speed + 3.7), cos(dot(p, d1) * wave1Freq * ws + t * wave1Speed * detune + 1.9)) * warpMag;
        vec2 w4 = vec2(sin(dot(p, d1) * wave1Freq * ws + t * wave1Speed + 4.9), cos(dot(p, d2) * wave2Freq * ws + t * wave2Speed * detune + 3.2)) * warpMag;
        float h = 0.0;
        h += wave1Amp * sin(dot(p + w1, d1) * wave1Freq + t * wave1Speed);
        h += wave2Amp * sin(dot(p + w2, d2) * wave2Freq + t * wave2Speed);
        h += wave3Amp * sin(dot(p + w3, d3) * wave3Freq + t * wave3Speed);
        h += wave4Amp * sin(dot(p + w4, d4) * wave4Freq + t * wave4Speed);
        return h;
    }

    float rippleHeight(vec2 p, float ripplePhaseOffset) {
        float h = 0.0;
        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
            if (i >= rippleCount) break;
            vec4 r = ripples[i];
            vec4 rp = rippleParams[i];
            float age = rippleTime - r.z;
            if (age < 0.0) continue;
            vec2 centre = r.xy + rippleDrift * age;
            float dist = length(p - centre);
            float wavelength = max(rp.x, 1e-5);
            float decay = max(rp.y, 1e-5);
            float phaseShift = ripplePhaseOffset / wavelength * 6.28318;
            float front = age * rippleSpeed;
            float behind = front - dist;
            if (behind < 0.0) continue;
            float fadeIn = smoothstep(0.0, 0.06, age);
            float fadeOut = exp(-age * decay);
            float envelope = fadeIn * fadeOut * r.w;
            float phase = mod(dist / wavelength - age * rippleSpeed / wavelength * 0.85 + phaseShift, 1.0);
            float cyclesBack = behind / wavelength;
            float support = smoothstep(rippleThickness, rippleThickness * 0.4, cyclesBack);
            h += envelope * support * sin(phase * 6.28318) * rp.z;
        }
        return h;
    }

    float letterHeight(vec2 p, float ripplePhaseOffset) {
        float h = 0.0;
        for (int i = 0; i < ${MAX_LETTERS}; i++) {
            if (i >= letterCount) break;
            vec4 r = letterRipples[i];
            vec4 rp = letterRippleParams[i];
            vec4 rv = letterRippleV[i];
            float age = rippleTime - r.z;
            if (age < 0.0) continue;
            vec2 centre = r.xy + rippleDrift * age;
            float cosA = cos(rp.z), sinA = sin(rp.z);
            vec2 pRot = vec2(p.x * cosA - p.y * sinA, p.x * sinA + p.y * cosA);
            vec2 centreRot = vec2(centre.x * cosA - centre.y * sinA, centre.x * sinA + centre.y * cosA);
            vec2 local = (pRot - centreRot) / rp.y + 0.5;
            if (local.x < -0.1 || local.x > 1.1 || local.y < -0.1 || local.y > 1.1) continue;
            vec2 sampled = clamp(local, 0.0, 1.0);
            vec2 atlasUV = vec2(mix(rv.x, rv.z, sampled.x), mix(rv.y, rv.w, sampled.y));
            float sdfRaw = texture2D(letterAtlas, atlasUV).r;
            if (sdfRaw <= 0.01) continue;
            float dist = (1.0 - sdfRaw) * letterSpread * 2.0 * rp.y;
            float wavelength = max(letterWavelength, 1e-5);
            float decay = max(rp.x, 1e-5);
            float phaseShift = ripplePhaseOffset / wavelength * 6.28318;
            float front = age * letterSpeed;
            float behind = front - dist;
            if (behind < 0.0) continue;
            float fadeIn = smoothstep(0.0, 0.06, age);
            float fadeOut = exp(-age * decay);
            float envelope = fadeIn * fadeOut * r.w;
            float phase = mod(dist / wavelength - age * rippleSpeed / wavelength * 0.85 + phaseShift, 1.0);
            float cyclesBack = behind / wavelength;
            float support = smoothstep(letterThickness, letterThickness * 0.4, cyclesBack);
            h += envelope * support * sin(phase * 6.28318) * r.w * sdfRaw;
        }
        return h;
    }

    float waterHeight(vec2 p, float t) {
        float baseH = baseWavesHeight(p, t);
        vec2 simUV = p + simDrift;
        float simH = (texture2D(simTexture, simUV).r - 0.5) * 3.0;
        float anaH = rippleHeight(p, 0.0);
        float letH = letterHeight(p, 0.0);
        return baseH + anaH + letH + mix(0.0, simH * 0.15, simulationMode);
    }

    vec2 baseWavesGrad(vec2 p, float t) {
        float eps = 0.008;
        return vec2(
            baseWavesHeight(p + vec2(eps, 0.0), t) - baseWavesHeight(p - vec2(eps, 0.0), t),
            baseWavesHeight(p + vec2(0.0, eps), t) - baseWavesHeight(p - vec2(0.0, eps), t)
        ) / (2.0 * eps);
    }
    vec2 rippleGrad(vec2 p, float offset) {
        float eps = 0.008;
        return vec2(
            rippleHeight(p + vec2(eps, 0.0), offset) - rippleHeight(p - vec2(eps, 0.0), offset),
            rippleHeight(p + vec2(0.0, eps), offset) - rippleHeight(p - vec2(0.0, eps), offset)
        ) / (2.0 * eps);
    }
    vec2 letterGrad(vec2 p, float offset) {
        float eps = 0.008;
        return vec2(
            letterHeight(p + vec2(eps, 0.0), offset) - letterHeight(p - vec2(eps, 0.0), offset),
            letterHeight(p + vec2(0.0, eps), offset) - letterHeight(p - vec2(0.0, eps), offset)
        ) / (2.0 * eps);
    }
    vec2 simGrad(vec2 p) {
        float eps = 1.0 / 512.0;
        vec2 simUV = p + simDrift;
        return vec2(
            (texture2D(simTexture, simUV + vec2(eps, 0.0)).r - 0.5) * 3.0 - (texture2D(simTexture, simUV - vec2(eps, 0.0)).r - 0.5) * 3.0,
            (texture2D(simTexture, simUV + vec2(0.0, eps)).r - 0.5) * 3.0 - (texture2D(simTexture, simUV - vec2(0.0, eps)).r - 0.5) * 3.0
        ) / (2.0 * eps);
    }
    vec3 gradToNormal(vec2 grad, float scale) {
        return normalize(vec3(-grad.x * scale, -grad.y * scale, 1.0));
    }

    void main() {
        vec2 uv = gridPos;
        v_uv = uv;
        float t = time;
        float h = waterHeight(uv, t);
        v_height = h;
        vec2 channelDir = vec2(cos(rgbAngle), sin(rgbAngle)) * rgbSplit;
        vec2 gradR = baseWavesGrad(uv + channelDir, t);
        vec2 gradG = baseWavesGrad(uv, t);
        vec2 gradB = baseWavesGrad(uv - channelDir, t);
        vec2 simR = simGrad(uv + channelDir);
        vec2 simG = simGrad(uv);
        vec2 simB = simGrad(uv - channelDir);
        vec2 anaR = rippleGrad(uv, rgbSplit);
        vec2 anaG = rippleGrad(uv, 0.0);
        vec2 anaB = rippleGrad(uv, -rgbSplit);
        vec2 letR = letterGrad(uv, rgbSplit);
        vec2 letG = letterGrad(uv, 0.0);
        vec2 letB = letterGrad(uv, -rgbSplit);
        gradR += anaR + letR + mix(vec2(0.0), simR * 0.15, simulationMode);
        gradG += anaG + letG + mix(vec2(0.0), simG * 0.15, simulationMode);
        gradB += anaB + letB + mix(vec2(0.0), simB * 0.15, simulationMode);
        v_normal_r = gradToNormal(gradR, surfaceDepth);
        v_normal_g = gradToNormal(gradG, surfaceDepth);
        v_normal_b = gradToNormal(gradB, surfaceDepth);
        float planeX = (uv.x - 0.5) * 4.0;
        float planeY = (uv.y - 0.5) * 4.0;
        float heightZ = h * surfaceDepth * 6.0;
        v_worldPos = vec3(planeX, planeY, heightZ);
        float pitchAngle = surfaceTilt * 1.35;
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);
        vec3 rotPos = vec3(planeX, planeY * cp - heightZ * sp, planeY * sp + heightZ * cp);
        rotPos.z -= cameraHeight;
        float depth = max(-rotPos.z, 0.1);
        vec2 orthoXY = rotPos.xy * 0.35;
        vec2 perspXY = (rotPos.xy / depth) * 1.8;
        vec2 screenXY = mix(orthoXY, perspXY, perspectiveStrength);
        screenXY.y = -screenXY.y;
        gl_Position = vec4(screenXY, 0.0, 1.0);
    }
`;

var SIM_VERTEX_SHADER = `
    attribute vec2 position;
    varying vec2 v_uv;
    void main() {
        v_uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

function buildSimFragmentSource() {
    return `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D currState;
        uniform float tension, damping, springiness, impulseStrength, resolution;
        uniform int   simDropCount;
        uniform vec4  simDrops[${MAX_DROPS}];
        uniform float simDropRadius, simDropCore;

        void main() {
            vec2 texel = 1.0 / vec2(resolution);
            vec4 curr = texture2D(currState, v_uv);
            float h = curr.r - 0.5;
            float v = curr.g - 0.5;
            float hL = texture2D(currState, v_uv - vec2(texel.x, 0.0)).r - 0.5;
            float hR = texture2D(currState, v_uv + vec2(texel.x, 0.0)).r - 0.5;
            float hD = texture2D(currState, v_uv - vec2(0.0, texel.y)).r - 0.5;
            float hU = texture2D(currState, v_uv + vec2(0.0, texel.y)).r - 0.5;
            float laplacian = (hL + hR + hD + hU) - 4.0 * h;
            v += laplacian * tension;
            v -= h * springiness;
            v *= damping;
            h += v;
            for (int i = 0; i < ${MAX_DROPS}; i++) {
                if (i >= simDropCount) break;
                vec4 drop = simDrops[i];
                vec2 delta = abs(v_uv - drop.xy);
                delta = min(delta, 1.0 - delta);
                float d = length(delta);
                float falloff = smoothstep(simDropRadius, simDropRadius * simDropCore, d);
                v -= impulseStrength * falloff * drop.z;
            }
            h = clamp(h, -0.45, 0.45);
            v = clamp(v, -0.45, 0.45);
            gl_FragColor = vec4(h + 0.5, v + 0.5, 0.0, 1.0);
        }
    `;
}

// Water surface fragment shader (drops are NOT drawn here anymore)
function buildFragmentSource() {
    return `
        precision highp float;
        varying vec2 v_uv;
        varying vec3 v_normal_r, v_normal_g, v_normal_b;
        varying float v_height;
        varying vec3 v_worldPos;

        uniform vec3 waterColor, waterDeep, skyHorizon, skyZenith, sunDir, sandColor;
        uniform float specularPower, specularStrength, fresnelPower, vignetteRadius, vignetteSoftness;
        uniform float cameraHeight, waterDepth, absorption, sandScale, sandContrast, refractionStrength, envMapStrength;
        uniform sampler2D envMap, simDebugTex;
        uniform float debugSim;

        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float noise2(vec2 p) {
            vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
        }
        vec3 sandAt(vec2 sp) {
            float grain = noise2(sp * sandScale), clump = noise2(sp * sandScale * 0.23);
            float lod = smoothstep(300.0, 800.0, sandScale);
            grain = mix(grain, 0.5, lod);
            return sandColor * (0.5 + (grain * 0.75 + clump * 0.25 - 0.5) * (0.5 + sandContrast));
        }
        vec2 sampleEnvMap(vec3 R) { return vec2(atan(R.z, R.x) / (2.0 * 3.14159265) + 0.5, acos(clamp(R.y, -1.0, 1.0)) / 3.14159265); }
        vec3 skyReflection(vec3 R) {
            float up = clamp(R.y, -1.0, 1.0);
            vec3 proc = mix(mix(waterDeep * 0.5, mix(skyHorizon, skyZenith, smoothstep(0.0, 0.7, up)), smoothstep(-0.3, 0.05, up)), texture2D(envMap, sampleEnvMap(R)).rgb, envMapStrength);
            return proc * 3.0;
        }
        vec3 shadeChannel(vec3 N, vec3 L, vec3 V, vec3 H, vec3 waterBody, vec2 sandUv) {
            vec3 sand = sandAt(sandUv + N.xy * refractionStrength);
            vec3 underCol = mix(waterBody, sand, (1.0 - clamp(waterDepth, 0.0, 1.0)) * exp(-absorption * 0.5));
            float cosV = clamp(dot(N, V), 0.02, 1.0);
            float F = clamp(0.02 + 0.98 * pow(1.0 - cosV, fresnelPower), 0.0, 1.0);
            F = F * F * (3.0 - 2.0 * F);
            vec3 col = mix(underCol, skyReflection(reflect(-V, N)), F);
            return col + vec3(pow(max(dot(N, H), 0.0), specularPower)) * specularStrength;
        }

        void main() {
            if (debugSim > 0.5) {
                vec2 s = texture2D(simDebugTex, v_uv).rg;
                gl_FragColor = vec4(max(-(s.r - 0.5) * 2.0, 0.0), max((s.r - 0.5) * 2.0, 0.0), abs(s.g - 0.5) * 2.0, 1.0);
                return;
            }
            vec3 L = normalize(sunDir);
            vec3 V = normalize(vec3(0.0, 0.0, cameraHeight) - v_worldPos);
            vec3 H = normalize(L + V);
            vec3 waterBody = mix(waterDeep, waterColor, smoothstep(-0.015, 0.015, v_height));
            vec3 color = vec3(
                shadeChannel(normalize(v_normal_r), L, V, H, waterBody, v_uv).r,
                shadeChannel(normalize(v_normal_g), L, V, H, waterBody, v_uv).g,
                shadeChannel(normalize(v_normal_b), L, V, H, waterBody, v_uv).b
            );
            float d = distance(v_uv, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, d);
            color = mix(color, vec3(0.0), vig);
            gl_FragColor = vec4(color, 1.0);
        }
    `;
}

// NEW: full-screen drop overlay shader
// Each drop is projected through the SAME camera math as the water.
// The whole screen is covered, so drops render even outside the water mesh.
var DROP_VERTEX_SHADER = `
    attribute vec2 position;
    varying vec2 v_uv;
    void main() {
        v_uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

function buildDropFragmentSource() {
    return `
        precision highp float;
        varying vec2 v_uv;

        uniform vec4  drops[${MAX_FALLING_DROPS}];    // x, y, spawnTime, size
        uniform float durations[${MAX_FALLING_DROPS}];
        uniform int   count;
        uniform float currentTime;
        uniform float dropFallHeight;

        uniform float surfaceTiltFrag;
        uniform float perspectiveStrengthFrag;
        uniform float cameraHeightFrag;

        // Project a world point to screen UV using the SAME camera model as
        // the water surface. The water vertex shader builds:
        //   rotPos = (planeX, planeY*cp - z*sp, planeY*sp + z*cp)
        // then mixes ortho/persp projection. This function matches that.
        vec2 projectToScreen(vec3 worldPos) {
            float pitchAngle = surfaceTiltFrag * 1.35;
            float cp = cos(pitchAngle);
            float sp = sin(pitchAngle);
            // worldPos is already (planeX, planeY, heightZ) in the plane frame.
            vec3 rotPos = vec3(
                worldPos.x,
                worldPos.y * cp - worldPos.z * sp,
                worldPos.y * sp + worldPos.z * cp
            );
            rotPos.z -= cameraHeightFrag;
            float depth = max(-rotPos.z, 0.1);
            vec2 ortho = rotPos.xy * 0.35;
            vec2 persp = (rotPos.xy / depth) * 1.8;
            vec2 sc = mix(ortho, persp, perspectiveStrengthFrag);
            sc.y = -sc.y;
            return sc * 0.5 + 0.5;
        }

        void main() {
            // Composited over the water via alpha blending. Start transparent
            // so anything outside a drop shows the water underneath.
            vec4 outColor = vec4(0.0);

            for (int i = 0; i < ${MAX_FALLING_DROPS}; i++) {
                if (i >= count) break;
                vec4 drop = drops[i];
                float duration = durations[i];
                float t = (currentTime - drop.z) / duration;
                if (t < 0.0 || t > 1.0) continue;

                // The drop is at (drop.x, drop.y) on the ground plane, at height
                // dropFallHeight * (1 - t) above it. This produces a truly
                // vertical fall in world space — the drop lands exactly on
                // (drop.x, drop.y, 0) which is where the ripple will spawn.
                float groundX = (drop.x - 0.5) * 4.0;
                float groundY = (drop.y - 0.5) * 4.0;
                float worldZ = dropFallHeight * (1.0 - t);
                vec3 worldPos = vec3(groundX, groundY, worldZ);

                vec2 screenUV = projectToScreen(worldPos);

                // Approximate depth for sizing (perspective shrink with distance).
                float pitchAngle = surfaceTiltFrag * 1.35;
                float cp = cos(pitchAngle);
                float sp = sin(pitchAngle);
                vec3 rotPos = vec3(groundX, groundY*cp - worldZ*sp, groundY*sp + worldZ*cp);
                rotPos.z -= cameraHeightFrag;
                float depth = max(-rotPos.z, 0.1);

                // Radius in screen UV: base size / depth. Bigger near the camera.
                float radius = drop.w * 3.0 / depth;

                vec2 localP = (v_uv - screenUV) / radius;
                float dist2 = dot(localP, localP);

                if (dist2 < 1.0) {
                    // Shaded sphere
                    float z = sqrt(max(1.0 - dist2, 0.0));
                    vec3 normal = vec3(localP.x, localP.y, z);
                    vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.7));
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
                    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);

                    vec3 tint = vec3(0.65, 0.8, 0.95);
                    vec3 sphereCol = tint * (0.25 + 0.75 * diff) + vec3(spec * 1.2);

                    // Edge darkening
                    float rim = smoothstep(0.6, 1.0, dist2);
                    sphereCol = mix(sphereCol, tint * 0.15, rim * 0.6);

                    // Anti-aliased edge alpha
                    float alpha = smoothstep(1.0, 0.9, dist2);

                    // Composite on top of what's already there
                    outColor.rgb = mix(outColor.rgb, sphereCol, alpha);
                    outColor.a = max(outColor.a, alpha);
                }
            }

            gl_FragColor = outColor;
        }
    `;
}

// =====================================================================
// MAIN
// =====================================================================

function advanceSpawnClock(tNow, lastTime, interval, maxCatchUp, spawnFn) {
    if (!(interval > 0)) return tNow;
    if (lastTime === null) lastTime = tNow;
    if (lastTime > tNow + interval) lastTime = tNow + interval;
    var catchUp = 0;
    while (tNow - lastTime >= interval && catchUp < maxCatchUp) {
        spawnFn(lastTime);
        lastTime += interval;
        catchUp++;
    }
    if (tNow - lastTime > interval * maxCatchUp) lastTime = tNow;
    return lastTime;
}

function mod1(v) { return v - Math.floor(v); }

var sdfAtlas = null;

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

    var gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false, antialias: true });
    if (!gl) { console.log('WebGL not supported'); return; }

    var floatTextures = gl.getExtension('OES_texture_float');
    var floatLinear = gl.getExtension('OES_texture_float_linear');
    var halfFloatTextures = gl.getExtension('OES_texture_half_float');
    var halfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
    var colorBufferFloat = gl.getExtension('WEBGL_color_buffer_float');
    var colorBufferHalfFloat = gl.getExtension('EXT_color_buffer_half_float');

    var texType = gl.UNSIGNED_BYTE;
    var canLinearFilter = false;
    var simSupported = false;

    if (floatTextures && floatLinear && colorBufferFloat) {
        texType = gl.FLOAT; canLinearFilter = true; simSupported = true;
    } else if (halfFloatTextures && (colorBufferHalfFloat || colorBufferFloat)) {
        texType = halfFloatTextures.HALF_FLOAT_OES; canLinearFilter = !!halfFloatLinear; simSupported = true;
    }

    var filterMode = canLinearFilter ? gl.LINEAR : gl.NEAREST;
    if (!simSupported) { state.simulationMode = 0.0; }

    var program = null, simProgram = null, dropProgram = null;
    var positionLocation = null, timeLocation = null;
    var gridBuffer = null, indexBuffer = null;
    var indexCount = 0, indexType = gl.UNSIGNED_INT;
    var u = {};

    var simRes = 512;
    var simFBOs = [null, null], simTextures = [null, null];
    var simCurrent = 0, simQuadBuffer = null;
    var simDriftPhaseX = 0, simDriftPhaseY = 0;

    var simDrops = [];
    var pendingSimDrops = [];
    var nextSimDropTime = null;
    var fallingDrops = [];

    var envTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, envTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var envImg = new Image();
    envImg.crossOrigin = "anonymous";
    envImg.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, envTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, envImg);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    envImg.src = 'img/test.png';

    var ripples = [], nextSpawnTime = null;
    var letterRipples = [], nextLetterTime = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function createShader(type, source) {
        var s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
        return s;
    }

    function createSimTargets() {
        for (var i = 0; i < 2; i++) {
            if (simFBOs[i]) gl.deleteFramebuffer(simFBOs[i]);
            if (simTextures[i]) gl.deleteTexture(simTextures[i]);
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, simRes, simRes, 0, gl.RGBA, texType, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            var fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.clearColor(0.5, 0.5, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            simFBOs[i] = fbo; simTextures[i] = tex;
        }
        if (!simQuadBuffer) {
            simQuadBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, simQuadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        }
    }

    function buildMesh(res) {
        res = Math.max(40, Math.min(1024, res | 0));
        var n = res;
        var verts = new Float32Array(n * n * 2);
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
            var idx = (y * n + x) * 2;
            verts[idx] = x / (n - 1); verts[idx + 1] = y / (n - 1);
        }
        if (gridBuffer) gl.deleteBuffer(gridBuffer);
        gridBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        var idxArr = new Uint32Array((n - 1) * (n - 1) * 6);
        var k = 0;
        for (var yy = 0; yy < n - 1; yy++) for (var xx = 0; xx < n - 1; xx++) {
            var a = yy * n + xx, b = a + 1, c = a + n, d = c + 1;
            idxArr[k++] = a; idxArr[k++] = b; idxArr[k++] = c;
            idxArr[k++] = b; idxArr[k++] = d; idxArr[k++] = c;
        }
        if (indexBuffer) gl.deleteBuffer(indexBuffer);
        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        var u32supported = gl.getExtension("OES_element_index_uint");
        var totalIndices = idxArr.length;
        if (!u32supported && totalIndices > 65535) {
            var idxArr16 = new Uint16Array(totalIndices);
            for (var q = 0; q < totalIndices; q++) idxArr16[q] = idxArr[q];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr16, gl.STATIC_DRAW);
            indexType = gl.UNSIGNED_SHORT;
        } else {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.STATIC_DRAW);
            indexType = gl.UNSIGNED_INT;
        }
        indexCount = totalIndices;
        if (program) {
            gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
            positionLocation = gl.getAttribLocation(program, "gridPos");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        }
    }
    meshRebuildFn = buildMesh;

    function cacheUniforms() {
        timeLocation = gl.getUniformLocation(program, "time");
        var names = [
            "simTexture","simulationMode","simDrift",
            "wave1Amp","wave1Freq","wave1Speed","wave1Angle",
            "wave2Amp","wave2Freq","wave2Speed","wave2Angle",
            "wave3Amp","wave3Freq","wave3Speed","wave3Angle",
            "wave4Amp","wave4Freq","wave4Speed","wave4Angle",
            "waveWarp","waveWarpScale",
            "rippleSpeed","rippleWavelength","rippleThickness","rippleCount",
            "ripples[0]","rippleParams[0]","rippleTime","rippleDrift",
            "letterAtlas","letterSpread","letterSize","letterStrengthGlobal","letterCount",
            "letterRipples[0]","letterRippleParams[0]","letterRippleV[0]",
            "letterSpeed","letterWavelength","letterThickness",
            "rgbSplit","rgbAngle","surfaceDepth","surfaceTilt","perspectiveStrength","cameraHeight",
            "waterColor","waterDeep","skyHorizon","skyZenith","sunDir",
            "specularPower","specularStrength","fresnelPower",
            "vignetteRadius","vignetteSoftness",
            "waterDepth","absorption","sandScale","sandContrast","sandColor","refractionStrength",
            "envMap","envMapStrength","simDebugTex","debugSim"
        ];
        names.forEach(function (n) {
            var key = n.replace(/\[0\]$/, "");
            u[key] = gl.getUniformLocation(program, n);
        });
    }

    // Full-screen quad for the drop overlay pass
    var dropQuadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dropQuadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    sdfAtlas = buildSDFAtlas(gl);

    var vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    var fs = createShader(gl.FRAGMENT_SHADER, buildFragmentSource());
    program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(program)); return; }
    gl.useProgram(program);
    cacheUniforms();

    var simVs = createShader(gl.VERTEX_SHADER, SIM_VERTEX_SHADER);
    var simFs = createShader(gl.FRAGMENT_SHADER, buildSimFragmentSource());
    simProgram = gl.createProgram();
    gl.attachShader(simProgram, simVs); gl.attachShader(simProgram, simFs); gl.linkProgram(simProgram);
    if (!gl.getProgramParameter(simProgram, gl.LINK_STATUS)) { state.simulationMode = 0.0; }

    var simU = {
        tension: gl.getUniformLocation(simProgram, "tension"),
        damping: gl.getUniformLocation(simProgram, "damping"),
        springiness: gl.getUniformLocation(simProgram, "springiness"),
        impulseStrength: gl.getUniformLocation(simProgram, "impulseStrength"),
        resolution: gl.getUniformLocation(simProgram, "resolution"),
        currState: gl.getUniformLocation(simProgram, "currState"),
        dropCount: gl.getUniformLocation(simProgram, "simDropCount"),
        drops: gl.getUniformLocation(simProgram, "simDrops[0]"),
        dropRadius: gl.getUniformLocation(simProgram, "simDropRadius"),
        dropCore: gl.getUniformLocation(simProgram, "simDropCore")
    };
    var simPosLoc = gl.getAttribLocation(simProgram, "position");

    // Drop overlay program
    var dropVs = createShader(gl.VERTEX_SHADER, DROP_VERTEX_SHADER);
    var dropFs = createShader(gl.FRAGMENT_SHADER, buildDropFragmentSource());
    dropProgram = gl.createProgram();
    gl.attachShader(dropProgram, dropVs); gl.attachShader(dropProgram, dropFs); gl.linkProgram(dropProgram);
    if (!gl.getProgramParameter(dropProgram, gl.LINK_STATUS)) {
        console.error("Drop program link failed:", gl.getProgramInfoLog(dropProgram));
    }
    var dropU = {
        drops: gl.getUniformLocation(dropProgram, "drops[0]"),
        durations: gl.getUniformLocation(dropProgram, "durations[0]"),
        count: gl.getUniformLocation(dropProgram, "count"),
        currentTime: gl.getUniformLocation(dropProgram, "currentTime"),
        dropFallHeight: gl.getUniformLocation(dropProgram, "dropFallHeight"),
        surfaceTiltFrag: gl.getUniformLocation(dropProgram, "surfaceTiltFrag"),
        perspectiveStrengthFrag: gl.getUniformLocation(dropProgram, "perspectiveStrengthFrag"),
        cameraHeightFrag: gl.getUniformLocation(dropProgram, "cameraHeightFrag")
    };
    var dropPosLoc = gl.getAttribLocation(dropProgram, "position");

    createSimTargets();
    buildMesh(state.gridResolution);
    resizeCanvas();
    ResizeManager.attach(resizeCanvas);

    function spawnRipple(tNow) {
        if (fallingDrops.length >= MAX_FALLING_DROPS) return;
        if (ripples.length >= MAX_RIPPLES) return;

        var x = 0.1 + Math.random() * 0.8;
        var y = 0.1 + Math.random() * 0.8;
        var ampBase = 0.7 + Math.random() * 0.6;
        var sv = state.rippleStrengthVariance;
        var amp = ampBase * (1.0 + (Math.random() * 2.0 - 1.0) * sv);
        var wv = state.rippleWavelengthVariance;
        var wlFactor = 1.0 + (Math.random() * 2.0 - 1.0) * wv;
        var dv = state.rippleDecayVariance;
        var dcFactor = 1.0 + (Math.random() * 2.0 - 1.0) * dv;

        // Fall duration is determined by physics: how long does it take to
        // fall from dropFallHeight to 0 at dropFallSpeed?
        var speedVar = 1.0 + (Math.random() * 2.0 - 1.0) * state.dropFallSpeedVariance;
        var speed = state.dropFallSpeed * speedVar;
        var fallTime = state.dropFallHeight / speed;

        ripples.push({
            x: x, y: y,
            spawnTime: tNow + fallTime,
            amp: amp, wlFactor: wlFactor, dcFactor: dcFactor
        });
        var maxR = Math.max(1, Math.min(MAX_RIPPLES, Math.round(state.maxRipples)));
        //while (ripples.length > maxR) ripples.shift();

        var sVar = 1.0 + (Math.random() * 2.0 - 1.0) * state.dropSizeVariance;
        fallingDrops.push({
            x: x, y: y, spawnTime: tNow, duration: fallTime, size: state.dropSize * sVar
        });
        if (fallingDrops.length > MAX_FALLING_DROPS) fallingDrops.shift();
    }

  function spawnSimDrop(tNow) {
        if (fallingDrops.length >= MAX_FALLING_DROPS) return;
        if (pendingSimDrops.length >= MAX_DROPS) return;

        var sx = 0.1 + Math.random() * 0.8;
        var sy = 0.1 + Math.random() * 0.8;
        var sAmpBase = 0.7 + Math.random() * 0.6;
        var sAmp = sAmpBase * (1.0 + (Math.random() * 2.0 - 1.0) * state.rippleStrengthVariance);

        // Fall duration is determined by physics.
        var speedVar = 1.0 + (Math.random() * 2.0 - 1.0) * state.dropFallSpeedVariance;
        var speed = state.dropFallSpeed * speedVar;
        var fallTime = state.dropFallHeight / speed;

        pendingSimDrops.push({ x: sx, y: sy, z: sAmp, impactTime: tNow + fallTime });

        var sVar = 1.0 + (Math.random() * 2.0 - 1.0) * state.dropSizeVariance;
        fallingDrops.push({
            x: sx, y: sy, spawnTime: tNow, duration: fallTime, size: state.dropSize * sVar
        });
        if (fallingDrops.length > MAX_FALLING_DROPS) fallingDrops.shift();
    }

    var currentLineIdx = 0, currentCharIdx = 0;
    var currentCursorX = 0.05, lineY = 0.5, lineStartX = 0.05, lastTypeTime = 0;

    var STORY_LINES = [
        "Badger", "packed his", "tiny bag,", "Stripy", "towel and", "sun-hat", "swag,",
        "Waddled", "down the", "sandy", "track,", "Dreaming", "of a", "seaside", "snack.",
        "But on", "the shore", "he heard", "a Yarr!", "Saw an", "eyepatch", "gleaming", "far -",
        "A pirate", "starfish", "struck a", "pose,", "Saltwater", "dripping", "off his", "toes.",
        "Oh, the", "badger", "and the", "starfish", "on a", "sunny", "holiday,", "One wants",
        "treasure", "buried", "deep, the", "other", "loves to", "play.", "Digging", "through",
        "the golden", "sand, a", "perfect", "little", "team,", "If there's", "a jam", "sandwich",
        "waiting,", "life is", "truly", "supreme.", "Starfish", "waved his", "tiny arm,", "Matey,",
        "help me!", "No alarm", "- I've", "got", "treasure,", "shiny", "bright,", "But I",
        "can't dig", "- it's", "quite a", "sight.", "Badger", "grinned,", "Well", "that's my",
        "thing,", "I'll dig", "a hole", "fit for", "a king.", "But I'll", "need", "payment",
        "for my", "toil", "How", "'bout a", "jam", "sandwich", "for the", "spoil?",
        "Oh, the", "badger", "and the", "starfish", "on a", "sunny", "holiday,", "One wants",
        "treasure", "buried", "deep, the", "other", "loves to", "play.", "Digging", "through",
        "the golden", "sand, a", "perfect", "little", "team,", "If there's", "a jam", "sandwich",
        "waiting,", "life is", "truly", "supreme.", "So they", "dug and", "dug", "until the",
        "sun,", "Turned", "the waves", "to liquid", "gold.", "Starfish", "placed his", "chest",
        "inside,", "Secrets", "safe and", "stories", "told.", "Badger", "munched", "his",
        "sandwich", "sweet,", "Jam", "dripping", "on his", "sandy", "feet -", "Two new",
        "friends", "upon the", "shore,", "Pirate", "tales", "forever", "more.", "Yeah, the",
        "badger", "and the", "starfish", "on a", "sunny", "holiday,", "Treasure", "buried,",
        "sandwich", "eaten,", "perfect", "seaside", "day.", "If you", "stroll", "along that",
        "beach,", "you might", "just hear", "them sing", "- A", "pirate's", "laugh, a",
        "badger's", "cheer,", "in harmony", "they ring."
    ];

    function spawnLetter(tNow) {
        var text = STORY_LINES[currentLineIdx];
        if (currentCharIdx === 0) {
            var totalWidth = 0;
            for (var i = 0; i < text.length; i++) {
                var c = text[i];
                var isSpace = (c === ' ');
                var charSize = state.letterSize * (1.0 + (0.5 * state.letterSizeVariance));
                totalWidth += isSpace ? (state.letterSize * state.letterSpacing) : (charSize * state.letterSpacing);
            }
            currentCursorX = 0.5 - (totalWidth * 0.5);
        }
        if (currentCharIdx >= text.length) {
            if (tNow - lastTypeTime > state.letterLineDelay) {
                currentLineIdx = (currentLineIdx + 1) % STORY_LINES.length;
                currentCharIdx = 0;
            }
            return;
        }
        var ch = text[currentCharIdx];
        var uv = sdfAtlas.letterUVs[ch];
        if (uv) {
            var sv = 1.0 + (Math.random() * 2.0 - 1.0) * state.letterSizeVariance;
            var size = state.letterSize * sv;
            var rot = (Math.random() * 2.0 - 1.0) * state.letterAngleVariance;
            var advance = size * state.letterSpacing;
            var yVar = (Math.random() * 2.0 - 1.0) * state.letterYVariance;
            var finalY = lineY + state.letterYOffset + yVar;
            letterRipples.push({
                char: ch, x: currentCursorX + advance * 0.5, y: finalY,
                spawnTime: tNow, strength: state.letterStrength, decay: state.letterDecay,
                size: size, rot: rot,
                u0: uv.u0, v0: uv.v0, u1: uv.u1, v1: uv.v1
            });
            while (letterRipples.length > MAX_LETTERS) letterRipples.shift();
            currentCursorX += advance;
        } else {
            currentCursorX += state.letterSize * state.letterSpacing;
        }
        currentCharIdx++;
        lastTypeTime = tNow;
    }

    var lastFrameTime = 0;
    var frameInterval = 1000 / 60;

    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            var dtRealMs = (lastFrameTime === 0) ? 0 : Math.min(now - lastFrameTime, 100);
            lastFrameTime = now;
            var tSec = now * 0.001 * state.timeScale;
            var dtSim = dtRealMs * 0.001 * state.timeScale;

            if (state.simulationMode > 0.5) {
                simDriftPhaseX = mod1(simDriftPhaseX - dtSim * state.rippleDriftX);
                simDriftPhaseY = mod1(simDriftPhaseY - dtSim * state.rippleDriftY);
            }

            if (state.simulationMode < 0.5) {
                var maxR = Math.max(1, Math.min(MAX_RIPPLES, Math.round(state.maxRipples)));
                var effectiveRate = Math.min(state.rainRate, maxR / 4.0);
                var spawnInterval = effectiveRate > 0.001 ? 1.0 / effectiveRate : 1e9;
                nextSpawnTime = advanceSpawnClock(tSec, nextSpawnTime, spawnInterval, 8, spawnRipple);
                ripples = ripples.filter(function (r) { return (tSec - r.spawnTime) < RIPPLE_MAX_AGE; });
            }

            var simEffectiveRate = Math.min(state.rainRate, MAX_DROPS / 4.0);
            var simSpawnInterval = simEffectiveRate > 0.001 ? 1.0 / simEffectiveRate : 1e9;
            nextSimDropTime = advanceSpawnClock(tSec, nextSimDropTime, simSpawnInterval, 8, spawnSimDrop);

            for (var pi = pendingSimDrops.length - 1; pi >= 0; pi--) {
                if (tSec >= pendingSimDrops[pi].impactTime) {
                    if (simDrops.length < MAX_DROPS) {
                        simDrops.push({
                            x: pendingSimDrops[pi].x,
                            y: pendingSimDrops[pi].y,
                            z: pendingSimDrops[pi].z
                        });
                    }
                    pendingSimDrops.splice(pi, 1);
                }
            }

            if (state.letterRate > 0.001) {
                var letterInterval = 1.0 / state.letterRate;
                nextLetterTime = advanceSpawnClock(tSec, nextLetterTime, letterInterval, 4, spawnLetter);
            }
            letterRipples = letterRipples.filter(function (l) { return (tSec - l.spawnTime) < state.letterMaxAge; });
            fallingDrops = fallingDrops.filter(function (d) { return (tSec - d.spawnTime) < d.duration; });

            // --- Sim step ---
            if (state.simulationMode > 0.5) {
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
                gl.useProgram(simProgram);
                var writeFBO = simFBOs[1 - simCurrent];
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, simTextures[simCurrent]);
                gl.uniform1i(simU.currState, 0);
                gl.uniform1f(simU.tension, state.simTension);
                gl.uniform1f(simU.damping, state.simDamping);
                gl.uniform1f(simU.springiness, state.simSpringiness);
                gl.uniform1f(simU.impulseStrength, state.simRainImpulse);
                gl.uniform1f(simU.resolution, simRes);
                gl.uniform1f(simU.dropRadius, state.simDropRadius);
                gl.uniform1f(simU.dropCore, state.simDropCore);

                var dropArr = new Float32Array(MAX_DROPS * 4);
                var dropCount = Math.min(simDrops.length, MAX_DROPS);
                for (var di = 0; di < dropCount; di++) {
                    // Sim ripple position must match mesh UV. Mesh samples sim at (p + simDrift),
                    // so to make a ripple appear at mesh (x, y), place it at (x + simDrift) in sim.
                    dropArr[di * 4 + 0] = mod1(simDrops[di].x + simDriftPhaseX);
                    dropArr[di * 4 + 1] = mod1(simDrops[di].y + simDriftPhaseY);
                    dropArr[di * 4 + 2] = simDrops[di].z;
                    dropArr[di * 4 + 3] = 0.0;
                }
                gl.uniform4fv(simU.drops, dropArr);
                gl.uniform1i(simU.dropCount, dropCount);
                simDrops.length = 0;

                gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
                gl.viewport(0, 0, simRes, simRes);
                gl.bindBuffer(gl.ARRAY_BUFFER, simQuadBuffer);
                gl.vertexAttribPointer(simPosLoc, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(simPosLoc);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                simCurrent = 1 - simCurrent;
                gl.useProgram(program);
            }

                       // --- Water pass ---
            gl.uniform1f(timeLocation, tSec);
            var sc = ["wave1Amp","wave1Freq","wave1Speed","wave1Angle","wave2Amp","wave2Freq","wave2Speed","wave2Angle",
                      "wave3Amp","wave3Freq","wave3Speed","wave3Angle","wave4Amp","wave4Freq","wave4Speed","wave4Angle",
                      "waveWarp","waveWarpScale","rippleSpeed","rippleWavelength","rippleThickness",
                      "rgbSplit","rgbAngle","surfaceDepth","surfaceTilt","perspectiveStrength","cameraHeight",
                      "specularPower","specularStrength","fresnelPower","vignetteRadius","vignetteSoftness",
                      "waterDepth","absorption","sandScale","sandContrast","refractionStrength","envMapStrength",
                      "letterSize","letterSpeed","letterWavelength","letterThickness"];
            sc.forEach(function (k) { if (u[k]) gl.uniform1f(u[k], state[k]); });

            // These two are NOT state params — set them explicitly
            if (u.letterSpread) gl.uniform1f(u.letterSpread, sdfAtlas.spread / sdfAtlas.cellSize);
            if (u.letterStrengthGlobal) gl.uniform1f(u.letterStrengthGlobal, state.letterStrength);

            gl.uniform2f(u.rippleDrift, state.rippleDriftX, state.rippleDriftY);

            var rippleArr = new Float32Array(MAX_RIPPLES * 4);
            var paramArr = new Float32Array(MAX_RIPPLES * 4);
            var count = Math.min(ripples.length, MAX_RIPPLES);
            for (var i = 0; i < count; i++) {
                var r = ripples[i];
                rippleArr[i*4+0]=r.x; rippleArr[i*4+1]=r.y; rippleArr[i*4+2]=r.spawnTime; rippleArr[i*4+3]=r.amp;
                paramArr[i*4+0]=state.rippleWavelength*r.wlFactor;
                paramArr[i*4+1]=state.rippleDecay*r.dcFactor;
                paramArr[i*4+2]=state.rippleStrength; paramArr[i*4+3]=0.0;
            }
            if (u.ripples) gl.uniform4fv(u.ripples, rippleArr);
            if (u.rippleParams) gl.uniform4fv(u.rippleParams, paramArr);
            if (u.rippleCount) gl.uniform1i(u.rippleCount, count);
            if (u.rippleTime) gl.uniform1f(u.rippleTime, tSec);

            var lArr = new Float32Array(MAX_LETTERS * 4);
            var lParamArr = new Float32Array(MAX_LETTERS * 4);
            var lVArr = new Float32Array(MAX_LETTERS * 4);
            var lCount = Math.min(letterRipples.length, MAX_LETTERS);
            for (var li = 0; li < lCount; li++) {
                var lr = letterRipples[li];
                lArr[li*4+0]=lr.x; lArr[li*4+1]=lr.y; lArr[li*4+2]=lr.spawnTime; lArr[li*4+3]=lr.strength;
                lParamArr[li*4+0]=lr.decay; lParamArr[li*4+1]=lr.size; lParamArr[li*4+2]=lr.rot; lParamArr[li*4+3]=0.0;
                lVArr[li*4+0]=lr.u0; lVArr[li*4+1]=lr.v0; lVArr[li*4+2]=lr.u1; lVArr[li*4+3]=lr.v1;
            }
            if (u.letterRipples) gl.uniform4fv(u.letterRipples, lArr);
            if (u.letterRippleParams) gl.uniform4fv(u.letterRippleParams, lParamArr);
            if (u.letterRippleV) gl.uniform4fv(u.letterRippleV, lVArr);
            if (u.letterCount) gl.uniform1i(u.letterCount, lCount);

            gl.uniform3f(u.waterColor, state.waterColorR, state.waterColorG, state.waterColorB);
            gl.uniform3f(u.waterDeep, state.waterDeepR, state.waterDeepG, state.waterDeepB);
            gl.uniform3f(u.skyHorizon, state.skyHorizonR, state.skyHorizonG, state.skyHorizonB);
            gl.uniform3f(u.skyZenith, state.skyZenithR, state.skyZenithG, state.skyZenithB);
            gl.uniform3f(u.sandColor, state.sandR, state.sandG, state.sandB);

            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, simTextures[simCurrent]);
            gl.uniform1i(u.simTexture, 2);
            gl.uniform1f(u.simulationMode, state.simulationMode);
            gl.uniform2f(u.simDrift, simDriftPhaseX, simDriftPhaseY);

            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, simTextures[simCurrent]);
            gl.uniform1i(u.simDebugTex, 1);
            gl.uniform1f(u.debugSim, state.debugSim);

            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, envTexture);
            gl.uniform1i(u.envMap, 0);

            gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, sdfAtlas.texture);
            gl.uniform1i(u.letterAtlas, 3);

            var sa = state.sunAngle, sh = state.sunHeight;
            var shH = Math.sqrt(Math.max(0.01, 1.0 - sh * sh));
            gl.uniform3f(u.sunDir, Math.cos(sa) * shH, Math.sin(sa) * shH, sh);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.drawElements(gl.TRIANGLES, indexCount, indexType, 0);

            // --- Drop overlay pass (full screen) ---
            if (fallingDrops.length > 0) {
                gl.useProgram(dropProgram);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                var fdArr = new Float32Array(MAX_FALLING_DROPS * 4);
                var fdDurArr = new Float32Array(MAX_FALLING_DROPS);
                var fdCount = Math.min(fallingDrops.length, MAX_FALLING_DROPS);
                for (var fi = 0; fi < fdCount; fi++) {
                    var fd = fallingDrops[fi];
                    fdArr[fi*4+0]=fd.x; fdArr[fi*4+1]=fd.y; fdArr[fi*4+2]=fd.spawnTime; fdArr[fi*4+3]=fd.size;
                    fdDurArr[fi] = fd.duration;
                }
                gl.uniform4fv(dropU.drops, fdArr);
                gl.uniform1fv(dropU.durations, fdDurArr);
                gl.uniform1i(dropU.count, fdCount);
                gl.uniform1f(dropU.currentTime, tSec);
                gl.uniform1f(dropU.dropFallHeight, state.dropFallHeight);
                gl.uniform1f(dropU.surfaceTiltFrag, state.surfaceTilt);
                gl.uniform1f(dropU.perspectiveStrengthFrag, state.perspectiveStrength);
                gl.uniform1f(dropU.cameraHeightFrag, state.cameraHeight);

                gl.bindBuffer(gl.ARRAY_BUFFER, dropQuadBuffer);
                gl.enableVertexAttribArray(dropPosLoc);
                gl.vertexAttribPointer(dropPosLoc, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                gl.disable(gl.BLEND);
                gl.useProgram(program);
            }

            gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE0);
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    var fontSelect = document.getElementById("font-select");
    if (fontSelect) {
        fontSelect.addEventListener("change", function () {
            var selectedFont = this.value;
            document.fonts.load("bold 40px '" + selectedFont + "'").then(function () {
                if (sdfAtlas && sdfAtlas.texture) gl.deleteTexture(sdfAtlas.texture);
                sdfAtlas = buildSDFAtlas(gl, selectedFont);
            });
        });
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