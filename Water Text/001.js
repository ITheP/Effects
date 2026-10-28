// =====================================================================
// PRESET / PARAMETER SYSTEM
// =====================================================================

var DEFAULTS = {
    timeScale:        1.00,
    rainRate:         0.85,
    maxRipples:       14,
    rippleSpeed:      0.32,
    rippleWavelength: 0.045,
    rippleDecay:      1.20,
    rippleStrength:   0.55,
    rippleThickness:  1.30,
    rgbSplit:         0.0040,
    rgbAngle:         0.0,
    wave1Amp:         0.010,
    wave1Freq:        2.8,
    wave1Speed:       0.55,
    wave1Angle:       0.6,
    wave2Amp:         0.008,
    wave2Freq:        4.3,
    wave2Speed:       0.72,
    wave2Angle:       2.1,
    wave3Amp:         0.005,
    wave3Freq:        7.1,
    wave3Speed:       1.05,
    wave3Angle:       4.3,
    waterColorR:      0.55,
    waterColorG:      0.72,
    waterColorB:      0.85,
    waterDeepR:       0.08,
    waterDeepG:       0.16,
    waterDeepB:       0.26,
    vignetteRadius:   0.62,
    vignetteSoftness: 0.38
};

var PRESETS = [
    { name: "Gentle Pond", iteration: 1, values: Object.assign({}, DEFAULTS) },
    {
        name: "Rainy Dayz",
        iteration: 2,
        values: {
            timeScale:        2.75,
            rainRate:         5,
            maxRipples:       64,
            rippleSpeed:      0.057,
            rippleWavelength: 0.0099,
            rippleDecay:      1.9,
            rippleStrength:   0.655,
            rippleThickness:  2.7,
            rgbSplit:         0.004,
            rgbAngle:         0,
            wave1Amp:         0.010,
            wave1Freq:        2.8,
            wave1Speed:       0.55,
            wave1Angle:       0.6,
            wave2Amp:         0.008,
            wave2Freq:        4.3,
            wave2Speed:       0.72,
            wave2Angle:       2.1,
            wave3Amp:         0.005,
            wave3Freq:        7.1,
            wave3Speed:       1.05,
            wave3Angle:       4.3,
            waterColorR:      0.55,
            waterColorG:      0.72,
            waterColorB:      0.85,
            waterDeepR:       0.08,
            waterDeepG:       0.16,
            waterDeepB:       0.26,
            vignetteRadius:   0.62,
            vignetteSoftness: 0.38
        }
    }
];

// ---- Ripple array sizing ----
// MAX_RIPPLES is the hard shader-side capacity. maxRipples is the live slider
// that picks how many of those slots are actually used per frame.
var MAX_RIPPLES = 64;

// Keys clamped to 0..1
var COLOUR_KEYS = {
    waterColorR: true, waterColorG: true, waterColorB: true,
    waterDeepR: true,  waterDeepG: true,  waterDeepB: true
};

var state = Object.assign({}, DEFAULTS);

// =====================================================================
// UI
// =====================================================================

function computeRange(value, key) {
    if (key === "maxRipples") {
        return { min: 1, max: MAX_RIPPLES, step: 1 };
    }
    if (key && COLOUR_KEYS[key]) {
        return { min: 0.0, max: 1.0, step: 0.001 };
    }
    if (value === 0) {
        return { min: -0.01, max: 0.01, step: 0.0001 };
    }
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
    if (abs >= 1)   return v.toFixed(3);
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
        var isInt = (key === "maxRipples");

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
        number.value = isInt ? String(Math.round(current)) : fmtVal(current);
        number.dataset.key = key;

        var resetBtn = document.createElement("button");
        resetBtn.className = "reset-btn";
        resetBtn.textContent = "↺";
        resetBtn.title = "Reset to default (" + fmtVal(def) + ")";

        slider.addEventListener("input", function () {
            var v = parseFloat(slider.value);
            if (isInt) v = Math.round(v);
            state[key] = v;
            number.value = isInt ? String(v) : fmtVal(v);
        });

        number.addEventListener("change", function () {
            var v = parseFloat(number.value);
            if (isNaN(v)) { number.value = fmtVal(state[key]); return; }
            if (isInt) v = Math.max(1, Math.min(MAX_RIPPLES, Math.round(v)));
            state[key] = v;
            var r = computeRange(v, key);
            slider.min = r.min; slider.max = r.max; slider.step = r.step;
            slider.value = v; number.step = r.step;
            number.value = isInt ? String(v) : fmtVal(v);
        });

        resetBtn.addEventListener("click", function () {
            state[key] = def;
            var r = computeRange(def, key);
            slider.min = r.min; slider.max = r.max; slider.step = r.step;
            slider.value = def; number.step = r.step;
            number.value = isInt ? String(Math.round(def)) : fmtVal(def);
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
        var isInt = (key === "maxRipples");
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
    Object.keys(DEFAULTS).forEach(function (key) {
        if (p.values && key in p.values) state[key] = p.values[key];
        else state[key] = DEFAULTS[key];
    });
    state.maxRipples = Math.round(state.maxRipples);
    refreshControlsUI();
}

function currentValuesAsJSON() {
    var vals = {};
    Object.keys(DEFAULTS).forEach(function (key) {
        vals[key] = (key === "maxRipples") ? Math.round(state[key]) : state[key];
    });
    return vals;
}

function setupControlHandlers() {
    document.getElementById("toggle-panel").addEventListener("click", function () {
        document.getElementById("controls-body").classList.toggle("collapsed");
    });

    document.getElementById("btn-load-preset").addEventListener("click", function () {
        var sel = document.getElementById("preset-select");
        loadPreset(parseInt(sel.value, 10));
    });

    document.getElementById("btn-reset-all").addEventListener("click", function () {
        Object.keys(DEFAULTS).forEach(function (k) { state[k] = DEFAULTS[k]; });
        state.maxRipples = Math.round(state.maxRipples);
        refreshControlsUI();
    });

    document.getElementById("btn-json").addEventListener("click", function () {
        var maxIter = 0;
        PRESETS.forEach(function (p) { if (p.iteration > maxIter) maxIter = p.iteration; });
        var nextIter = maxIter + 1;

        var preset = {
            name: "Preset " + nextIter,
            iteration: nextIter,
            values: currentValuesAsJSON()
        };

        var json = JSON.stringify(preset, null, 4);
        console.debug("=== PRESET JSON ===");
        console.debug(json);
        console.debug("=== END PRESET JSON ===");
        console.log(json);
        try { copy(json); } catch (e) { /* copy() not available */ }

        PRESETS.push(preset);
        buildPresetDropdown();
        document.getElementById("preset-select").value = PRESETS.length - 1;
    });
}

// =====================================================================
// SHADER
// =====================================================================

function buildFragmentSource() {
    return `
        precision highp float;
        varying vec2 v_texCoord;

        uniform float time;

        uniform float wave1Amp;
        uniform float wave1Freq;
        uniform float wave1Speed;
        uniform float wave1Angle;
        uniform float wave2Amp;
        uniform float wave2Freq;
        uniform float wave2Speed;
        uniform float wave2Angle;
        uniform float wave3Amp;
        uniform float wave3Freq;
        uniform float wave3Speed;
        uniform float wave3Angle;

        uniform float rgbSplit;
        uniform float rgbAngle;

        uniform float rippleSpeed;
        uniform float rippleWavelength;
        uniform float rippleDecay;
        uniform float rippleStrength;
        uniform float rippleThickness;
        uniform int   rippleCount;
        uniform vec4  ripples[${MAX_RIPPLES}];
        uniform float rippleTime;

        uniform vec3  waterColor;
        uniform vec3  waterDeep;

        uniform float vignetteRadius;
        uniform float vignetteSoftness;

        float waterHeight(vec2 p) {
            float h = 0.0;

            vec2 d1 = vec2(cos(wave1Angle), sin(wave1Angle));
            h += wave1Amp * sin(dot(p, d1) * wave1Freq + time * wave1Speed);

            vec2 d2 = vec2(cos(wave2Angle), sin(wave2Angle));
            h += wave2Amp * sin(dot(p, d2) * wave2Freq + time * wave2Speed);

            vec2 d3 = vec2(cos(wave3Angle), sin(wave3Angle));
            h += wave3Amp * sin(dot(p, d3) * wave3Freq + time * wave3Speed);

            for (int i = 0; i < ${MAX_RIPPLES}; i++) {
                if (i >= rippleCount) break;
                vec4 r = ripples[i];
                float age = rippleTime - r.z;
                if (age < 0.0) continue;

                vec2 delta = p - r.xy;
                float dist = length(delta);

                float front = age * rippleSpeed;
                float behind = front - dist;
                if (behind < 0.0) continue;

                float fadeIn   = smoothstep(0.0, 0.06, age);
                float fadeOut  = exp(-age * rippleDecay);
                float envelope = fadeIn * fadeOut * r.w;

                float phase = dist / rippleWavelength
                            - age * rippleSpeed / rippleWavelength * 0.85;
                float cyclesBack = behind / rippleWavelength;
                float support = smoothstep(rippleThickness, rippleThickness * 0.4, cyclesBack);

                h += envelope * support * sin(phase * 6.28318) * 0.15;
            }

            return h;
        }

        vec2 waterSlope(vec2 p, float eps) {
            float hL = waterHeight(p - vec2(eps, 0.0));
            float hR = waterHeight(p + vec2(eps, 0.0));
            float hD = waterHeight(p - vec2(0.0, eps));
            float hU = waterHeight(p + vec2(0.0, eps));
            return vec2(hR - hL, hU - hD) / (2.0 * eps);
        }

        void main() {
            vec2 uv = v_texCoord;

            vec2 channelDir = vec2(cos(rgbAngle), sin(rgbAngle)) * rgbSplit;
            float eps = 0.004;

            vec2 rSlope = waterSlope(uv + channelDir, eps);
            vec2 gSlope = waterSlope(uv,               eps);
            vec2 bSlope = waterSlope(uv - channelDir, eps);

            float refract = 0.06;
            float rH = waterHeight(uv + rSlope * refract);
            float gH = waterHeight(uv + gSlope * refract);
            float bH = waterHeight(uv + bSlope * refract);

            float baseH = waterHeight(uv);
            vec3 baseCol = mix(waterDeep, waterColor, 0.5 + 0.5 * baseH * 20.0);

            float rC = 1.0 + rH * 18.0;
            float gC = 1.0 + gH * 18.0;
            float bC = 1.0 + bH * 18.0;

            vec3 color = baseCol * vec3(rC, gC, bC);

            float d = distance(uv, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, d);
            color = mix(color, vec3(0.0), vig);

            gl_FragColor = vec4(color, 1.0);
        }
    `;
}

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

    var program = null;
    var timeLocation = null;
    var positionLocation = null;
    var u = {};

    var ripples = [];
    var nextSpawnTime = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

    function cacheUniforms() {
        timeLocation = gl.getUniformLocation(program, "time");
        u.wave1Amp        = gl.getUniformLocation(program, "wave1Amp");
        u.wave1Freq       = gl.getUniformLocation(program, "wave1Freq");
        u.wave1Speed      = gl.getUniformLocation(program, "wave1Speed");
        u.wave1Angle      = gl.getUniformLocation(program, "wave1Angle");
        u.wave2Amp        = gl.getUniformLocation(program, "wave2Amp");
        u.wave2Freq       = gl.getUniformLocation(program, "wave2Freq");
        u.wave2Speed      = gl.getUniformLocation(program, "wave2Speed");
        u.wave2Angle      = gl.getUniformLocation(program, "wave2Angle");
        u.wave3Amp        = gl.getUniformLocation(program, "wave3Amp");
        u.wave3Freq       = gl.getUniformLocation(program, "wave3Freq");
        u.wave3Speed      = gl.getUniformLocation(program, "wave3Speed");
        u.wave3Angle      = gl.getUniformLocation(program, "wave3Angle");
        u.rgbSplit        = gl.getUniformLocation(program, "rgbSplit");
        u.rgbAngle        = gl.getUniformLocation(program, "rgbAngle");
        u.rippleSpeed     = gl.getUniformLocation(program, "rippleSpeed");
        u.rippleWavelength= gl.getUniformLocation(program, "rippleWavelength");
        u.rippleDecay     = gl.getUniformLocation(program, "rippleDecay");
        u.rippleStrength  = gl.getUniformLocation(program, "rippleStrength");
        u.rippleThickness = gl.getUniformLocation(program, "rippleThickness");
        u.rippleCount     = gl.getUniformLocation(program, "rippleCount");
        u.ripples         = gl.getUniformLocation(program, "ripples[0]");
        u.rippleTime      = gl.getUniformLocation(program, "rippleTime");
        u.waterColor      = gl.getUniformLocation(program, "waterColor");
        u.waterDeep       = gl.getUniformLocation(program, "waterDeep");
        u.vignetteRadius  = gl.getUniformLocation(program, "vignetteRadius");
        u.vignetteSoftness= gl.getUniformLocation(program, "vignetteSoftness");
    }

    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, buildFragmentSource());
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    cacheUniforms();

    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    resizeCanvas();
    ResizeManager.attach(resizeCanvas);

    function spawnRipple(tNow) {
        var x = 0.1 + Math.random() * 0.8;
        var y = 0.1 + Math.random() * 0.8;
        var amp = 0.7 + Math.random() * 0.6;
        ripples.push({ x: x, y: y, spawnTime: tNow, amp: amp });
        var maxR = Math.max(1, Math.min(MAX_RIPPLES, Math.round(state.maxRipples)));
        while (ripples.length > maxR) ripples.shift();
    }

    var lastFrameTime = 0;
    var targetFPS = 60;
    var frameInterval = 1000 / targetFPS;

    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;
            var tSec = now * 0.001 * state.timeScale;

            var maxR = Math.max(1, Math.min(MAX_RIPPLES, Math.round(state.maxRipples)));
            // Cap effective spawn rate so we never overflow the array
            var effectiveRate = Math.min(state.rainRate, maxR / 4.0);
            var spawnInterval = effectiveRate > 0.001 ? 1.0 / effectiveRate : 1e9;

            if (nextSpawnTime === null) nextSpawnTime = tSec;
            if (nextSpawnTime > tSec + spawnInterval) {
                nextSpawnTime = tSec + spawnInterval;
            }
            var catchUpCount = 0;
            while (tSec - nextSpawnTime >= spawnInterval && catchUpCount < 8) {
                spawnRipple(nextSpawnTime);
                nextSpawnTime += spawnInterval;
                catchUpCount++;
            }
            if (tSec - nextSpawnTime > spawnInterval * 8) {
                nextSpawnTime = tSec;
            }

            ripples = ripples.filter(function (r) {
                return (tSec - r.spawnTime) < 4.0;
            });

            gl.uniform1f(timeLocation, tSec);

            gl.uniform1f(u.wave1Amp,   state.wave1Amp);
            gl.uniform1f(u.wave1Freq,  state.wave1Freq);
            gl.uniform1f(u.wave1Speed, state.wave1Speed);
            gl.uniform1f(u.wave1Angle, state.wave1Angle);
            gl.uniform1f(u.wave2Amp,   state.wave2Amp);
            gl.uniform1f(u.wave2Freq,  state.wave2Freq);
            gl.uniform1f(u.wave2Speed, state.wave2Speed);
            gl.uniform1f(u.wave2Angle, state.wave2Angle);
            gl.uniform1f(u.wave3Amp,   state.wave3Amp);
            gl.uniform1f(u.wave3Freq,  state.wave3Freq);
            gl.uniform1f(u.wave3Speed, state.wave3Speed);
            gl.uniform1f(u.wave3Angle, state.wave3Angle);

            gl.uniform1f(u.rgbSplit,   state.rgbSplit);
            gl.uniform1f(u.rgbAngle,   state.rgbAngle);

            gl.uniform1f(u.rippleSpeed,      state.rippleSpeed);
            gl.uniform1f(u.rippleWavelength, state.rippleWavelength);
            gl.uniform1f(u.rippleDecay,      state.rippleDecay);
            gl.uniform1f(u.rippleStrength,   state.rippleStrength);
            gl.uniform1f(u.rippleThickness,  state.rippleThickness);

            var rippleArr = new Float32Array(MAX_RIPPLES * 4);
            var count = Math.min(ripples.length, MAX_RIPPLES);
            for (var i = 0; i < count; i++) {
                var r = ripples[i];
                rippleArr[i * 4 + 0] = r.x;
                rippleArr[i * 4 + 1] = r.y;
                rippleArr[i * 4 + 2] = r.spawnTime;
                rippleArr[i * 4 + 3] = r.amp;
            }
            if (u.ripples) gl.uniform4fv(u.ripples, rippleArr);
            if (u.rippleCount) gl.uniform1i(u.rippleCount, count);
            if (u.rippleTime) gl.uniform1f(u.rippleTime, tSec);

            gl.uniform3f(u.waterColor, state.waterColorR, state.waterColorG, state.waterColorB);
            gl.uniform3f(u.waterDeep,  state.waterDeepR,  state.waterDeepG,  state.waterDeepB);
            gl.uniform1f(u.vignetteRadius,   state.vignetteRadius);
            gl.uniform1f(u.vignetteSoftness, state.vignetteSoftness);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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