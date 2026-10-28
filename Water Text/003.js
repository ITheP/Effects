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

    surfaceDepth:     0.35,
    surfaceTilt:      0.35,
    gridResolution:   200,

    perspectiveStrength: 0.6,
    cameraHeight:     2.5,

    sunAngle:         1.4,
    sunHeight:        0.8,
    specularPower:    120.0,
    specularStrength: 1.2,
    fresnelPower:     5.0,

    skyHorizonR:      0.85,
    skyHorizonG:      0.90,
    skyHorizonB:      0.98,
    skyZenithR:       0.20,
    skyZenithG:       0.38,
    skyZenithB:       0.65,

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
        name: "Rainy Dayz", iteration: 2,
        values: {
            timeScale: 2.75, rainRate: 5, maxRipples: 64,
            rippleSpeed: 0.057, rippleWavelength: 0.0099, rippleDecay: 1.9,
            rippleStrength: 0.655, rippleThickness: 2.7,
            rgbSplit: 0.004, rgbAngle: 0,
            wave1Amp: 0.010, wave1Freq: 2.8, wave1Speed: 0.55, wave1Angle: 0.6,
            wave2Amp: 0.008, wave2Freq: 4.3, wave2Speed: 0.72, wave2Angle: 2.1,
            wave3Amp: 0.005, wave3Freq: 7.1, wave3Speed: 1.05, wave3Angle: 4.3,
            surfaceDepth: 0.35, surfaceTilt: 0.35, gridResolution: 400,
            perspectiveStrength: 0.6, cameraHeight: 2.5,
            sunAngle: 1.4, sunHeight: 0.8,
            specularPower: 120, specularStrength: 1.2, fresnelPower: 5,
            skyHorizonR: 0.85, skyHorizonG: 0.90, skyHorizonB: 0.98,
            skyZenithR: 0.20, skyZenithG: 0.38, skyZenithB: 0.65,
            waterColorR: 0.55, waterColorG: 0.72, waterColorB: 0.85,
            waterDeepR: 0.08, waterDeepG: 0.16, waterDeepB: 0.26,
            vignetteRadius: 0.62, vignetteSoftness: 0.38
        }
    },
    {
        name: "Nice 1", iteration: 3,
        values: {
            timeScale: 2.75, rainRate: 10.09, maxRipples: 64,
            rippleSpeed: 0.057, rippleWavelength: 0.0134, rippleDecay: 2.25,
            rippleStrength: 0.427, rippleThickness: 2,
            rgbSplit: 0.004, rgbAngle: 0,
            wave1Amp: 0.01, wave1Freq: 9.12, wave1Speed: 0.55, wave1Angle: 0.6,
            wave2Amp: 0.008, wave2Freq: 11.67, wave2Speed: 0.72, wave2Angle: 2.1,
            wave3Amp: 0.005, wave3Freq: 12.36, wave3Speed: 1.05, wave3Angle: 4.3,
            surfaceDepth: 0.087, surfaceTilt: -0.65, gridResolution: 500,
            perspectiveStrength: 0.6, cameraHeight: 2.5,
            sunAngle: 1.181, sunHeight: 0.6,
            specularPower: 541, specularStrength: 1.2, fresnelPower: 6.46,
            skyHorizonR: 0.85, skyHorizonG: 0.90, skyHorizonB: 0.98,
            skyZenithR: 0.20, skyZenithG: 0.38, skyZenithB: 0.65,
            waterColorR: 0.55, waterColorG: 0.72, waterColorB: 0.85,
            waterDeepR: 0.08, waterDeepG: 0.16, waterDeepB: 0.26,
            vignetteRadius: 0.62, vignetteSoftness: 0.38
        }
    },
    {
        name: "Preset 4", iteration: 4,
        values: {
            timeScale: 2.75, rainRate: 10.09, maxRipples: 64,
            rippleSpeed: 0.057, rippleWavelength: 0.0134, rippleDecay: 2.25,
            rippleStrength: 0.427, rippleThickness: 2,
            rgbSplit: 0.004, rgbAngle: 0,
            wave1Amp: 11, wave1Freq: 11, wave1Speed: 0.076, wave1Angle: 1.056,
            wave2Amp: 5, wave2Freq: 20, wave2Speed: 0.141, wave2Angle: -1.76,
            wave3Amp: 2.2, wave3Freq: 40, wave3Speed: -0.53, wave3Angle: -1.49,
            surfaceDepth: -0.013, surfaceTilt: -0.896, gridResolution: 1024,
            perspectiveStrength: 0.6, cameraHeight: 2.5,
            sunAngle: 1.181, sunHeight: 0.6,
            specularPower: 541, specularStrength: 1.2, fresnelPower: 0.73,
            skyHorizonR: 0.807, skyHorizonG: 0.9, skyHorizonB: 1,
            skyZenithR: 0.202, skyZenithG: 0.38, skyZenithB: 0.781,
            waterColorR: 0.55, waterColorG: 0.72, waterColorB: 0.85,
            waterDeepR: 0.08, waterDeepG: 0.16, waterDeepB: 0.26,
            vignetteRadius: 0.62, vignetteSoftness: 0.38
        }
    },
    {
        name: "Preset 5", iteration: 5,
        values: {
            timeScale: 2.75, rainRate: 10.09, maxRipples: 64,
            rippleSpeed: 0.057, rippleWavelength: 0.0134, rippleDecay: 2.25,
            rippleStrength: 5, rippleThickness: 2.18,
            rgbSplit: 0.004, rgbAngle: 0,
            wave1Amp: 21, wave1Freq: 11, wave1Speed: 0.076, wave1Angle: 1.056,
            wave2Amp: 10, wave2Freq: 20, wave2Speed: 0.141, wave2Angle: -1.76,
            wave3Amp: 4.2, wave3Freq: 41.8, wave3Speed: -0.53, wave3Angle: -1.49,
            surfaceDepth: -0.0148, surfaceTilt: -0.3, gridResolution: 1024,
            perspectiveStrength: 0.6, cameraHeight: 2.5,
            sunAngle: 1.4, sunHeight: 0.8,
            specularPower: 664, specularStrength: 1.2, fresnelPower: 0.1,
            skyHorizonR: 0.807, skyHorizonG: 0.9, skyHorizonB: 1,
            skyZenithR: 0.211, skyZenithG: 0.333, skyZenithB: 0.596,
            waterColorR: 0.55, waterColorG: 0.72, waterColorB: 0.85,
            waterDeepR: 0.202, waterDeepG: 0.36, waterDeepB: 0.614,
            vignetteRadius: 0.673, vignetteSoftness: 0.38
        }
    }
];

var MAX_RIPPLES = 64;

var COLOUR_KEYS = {
    waterColorR: true, waterColorG: true, waterColorB: true,
    waterDeepR: true,  waterDeepG: true,  waterDeepB: true,
    skyHorizonR: true, skyHorizonG: true, skyHorizonB: true,
    skyZenithR: true,  skyZenithG: true,  skyZenithB: true
};
var INT_KEYS = { maxRipples: true, gridResolution: true };

var state = Object.assign({}, DEFAULTS);
var meshRebuildFn = null;

// =====================================================================
// UI
// =====================================================================

function computeRange(value, key) {
    if (key === "maxRipples") return { min: 1, max: MAX_RIPPLES, step: 1 };
    if (key === "gridResolution") return { min: 40, max: 1024, step: 8 };
    if (key === "fresnelPower") return { min: -8.0, max: 10.0, step: 0.01 };
    if (key === "perspectiveStrength") return { min: 0.0, max: 1.0, step: 0.01 };
    if (key === "cameraHeight") return { min: 0.2, max: 10.0, step: 0.01 };
    if (key === "surfaceTilt") return { min: -1.0, max: 1.0, step: 0.01 };
    if (key && COLOUR_KEYS[key]) return { min: 0.0, max: 1.0, step: 0.001 };
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
        var isInt = !!INT_KEYS[key];
        var isMeshRebuild = (key === "gridResolution");

        var row = document.createElement("div");
        row.className = "ctrl-row";

        var label = document.createElement("label");
        label.textContent = key;
        label.title = key + (isMeshRebuild ? "  [rebuilds mesh on release]" : "");

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
        resetBtn.title = "Reset to default (" + fmtVal(def) + ")";

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
            if (isMeshRebuild && typeof meshRebuildFn === "function") {
                meshRebuildFn(Math.round(v));
            }
        });

        resetBtn.addEventListener("click", function () {
            state[key] = def;
            var r = computeRange(def, key);
            slider.min = r.min; slider.max = r.max; slider.step = r.step;
            slider.value = def; number.step = r.step;
            number.value = isInt ? String(Math.round(def)) : fmtVal(def);
            if (isMeshRebuild && typeof meshRebuildFn === "function") {
                meshRebuildFn(Math.round(def));
            }
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
        var sel = document.getElementById("preset-select");
        loadPreset(parseInt(sel.value, 10));
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
// SHADERS
// =====================================================================

var VERTEX_SHADER = `
    precision highp float;

    attribute vec2 gridPos;
    varying vec2 v_uv;
    varying vec3 v_normal_r;
    varying vec3 v_normal_g;
    varying vec3 v_normal_b;
    varying float v_height;

    uniform float time;

    uniform float wave1Amp, wave1Freq, wave1Speed, wave1Angle;
    uniform float wave2Amp, wave2Freq, wave2Speed, wave2Angle;
    uniform float wave3Amp, wave3Freq, wave3Speed, wave3Angle;

    uniform float rippleSpeed, rippleWavelength, rippleDecay;
    uniform float rippleStrength, rippleThickness;
    uniform int   rippleCount;
    uniform vec4  ripples[${MAX_RIPPLES}];
    uniform float rippleTime;

    uniform float rgbSplit;
    uniform float rgbAngle;
    uniform float surfaceDepth;
    uniform float surfaceTilt;
    uniform float perspectiveStrength;
    uniform float cameraHeight;

    vec2 waveGrad(vec2 p, float t) {
        vec2 grad = vec2(0.0);
        vec2 d1 = vec2(cos(wave1Angle), sin(wave1Angle));
        float p1 = dot(p, d1) * wave1Freq + t * wave1Speed;
        grad += wave1Amp * wave1Freq * cos(p1) * d1;
        vec2 d2 = vec2(cos(wave2Angle), sin(wave2Angle));
        float p2 = dot(p, d2) * wave2Freq + t * wave2Speed;
        grad += wave2Amp * wave2Freq * cos(p2) * d2;
        vec2 d3 = vec2(cos(wave3Angle), sin(wave3Angle));
        float p3 = dot(p, d3) * wave3Freq + t * wave3Speed;
        grad += wave3Amp * wave3Freq * cos(p3) * d3;
        return grad;
    }

    vec2 rippleGrad(vec2 p) {
        vec2 grad = vec2(0.0);
        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
            if (i >= rippleCount) break;
            vec4 r = ripples[i];
            float age = rippleTime - r.z;
            if (age < 0.0) continue;
            vec2 delta = p - r.xy;
            float dist = length(delta) + 1e-6;
            float front = age * rippleSpeed;
            float behind = front - dist;
            if (behind < 0.0) continue;
            float fadeIn = smoothstep(0.0, 0.06, age);
            float fadeOut = exp(-age * rippleDecay);
            float envelope = fadeIn * fadeOut * r.w * rippleStrength;
            float phase = dist / rippleWavelength - age * rippleSpeed / rippleWavelength * 0.85;
            float cyclesBack = behind / rippleWavelength;
            float support = smoothstep(rippleThickness, rippleThickness * 0.4, cyclesBack);
            float dPhase_dDist = 6.28318 / rippleWavelength;
            float dh_dDist = envelope * support * cos(phase * 6.28318) * dPhase_dDist;
            grad += dh_dDist * (delta / dist);
        }
        return grad;
    }

    vec2 totalGrad(vec2 p, float t) {
        return waveGrad(p, t) + rippleGrad(p);
    }

    float waterHeight(vec2 p, float t) {
        float h = 0.0;
        vec2 d1 = vec2(cos(wave1Angle), sin(wave1Angle));
        h += wave1Amp * sin(dot(p, d1) * wave1Freq + t * wave1Speed);
        vec2 d2 = vec2(cos(wave2Angle), sin(wave2Angle));
        h += wave2Amp * sin(dot(p, d2) * wave2Freq + t * wave2Speed);
        vec2 d3 = vec2(cos(wave3Angle), sin(wave3Angle));
        h += wave3Amp * sin(dot(p, d3) * wave3Freq + t * wave3Speed);
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
            float fadeIn = smoothstep(0.0, 0.06, age);
            float fadeOut = exp(-age * rippleDecay);
            float envelope = fadeIn * fadeOut * r.w;
            float phase = dist / rippleWavelength - age * rippleSpeed / rippleWavelength * 0.85;
            float cyclesBack = behind / rippleWavelength;
            float support = smoothstep(rippleThickness, rippleThickness * 0.4, cyclesBack);
            h += envelope * support * sin(phase * 6.28318) * rippleStrength;
        }
        return h;
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
        v_normal_r = gradToNormal(totalGrad(uv + channelDir, t), surfaceDepth);
        v_normal_g = gradToNormal(totalGrad(uv,              t), surfaceDepth);
        v_normal_b = gradToNormal(totalGrad(uv - channelDir, t), surfaceDepth);

        // ---- Flat plane in world space ----
        // X = across screen, Y = depth into screen, Z = surface height.
        float planeX = (uv.x - 0.5) * 4.0;
        float planeY = (uv.y - 0.5) * 4.0;
        float heightZ = h * surfaceDepth * 6.0;

        // ---- Camera pitch ----
        // surfaceTilt = 0  → camera looks straight down (plane flat on screen)
        // surfaceTilt = +1 → camera pitches forward (looking down at surface
        //                    as it recedes into the distance)
        // surfaceTilt = -1 → camera pitches backward (looking up at surface
        //                    as it recedes overhead)
        // The angle is symmetric around 0 so the tilt slider is bidirectional.
        float pitchAngle = surfaceTilt * 1.35;  // up to ±77°
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);

        // Rotate the surface around the X axis by pitchAngle.
        // Standard rotation matrix:
        //   Y' =  Y*cp - Z*sp
        //   Z' =  Y*sp + Z*cp
        // Positive tilt rotates +Y toward +Z, i.e. the far rows rise toward the
        // camera — looking down at the plane. Negative tilt does the opposite.
        vec3 rotPos = vec3(
            planeX,
            planeY * cp - heightZ * sp,
            planeY * sp + heightZ * cp
        );

        // Push the plane away from the camera by cameraHeight along the view
        // direction. With the camera at origin looking down -Z, we want the
        // surface in front of the camera at positive depth.
        rotPos.z -= cameraHeight;

        // Distance in front of the camera (positive for points ahead)
        float depth = max(-rotPos.z, 0.05);

        // Orthographic: direct XY mapping scaled to fit
        vec2 orthoXY = rotPos.xy * 0.35;

        // Perspective: divide by depth. Far points shrink, near points grow.
        // The '1.8' scale is just to fill viewport at typical cameraHeight.
        vec2 perspXY = rotPos.xy / depth * 1.8;

        // Blend the two by the strength slider
        vec2 screenXY = mix(orthoXY, perspXY, perspectiveStrength);

        // WebGL NDC is Y-up; grid UV is Y-up; but we want the near edge of the
        // surface at the bottom of the screen (typical "looking out at water").
        // When tilt > 0, near rows should be at the bottom. Grid Y=0 is the
        // "near" edge, Y=1 is "far". With positive tilt the far edge gets
        // rotated up in world Y, so -screenXY.y pushes far up on screen.
        screenXY.y = -screenXY.y;

        gl_Position = vec4(screenXY, 0.0, 1.0);
    }
`;

function buildFragmentSource() {
    return `
        precision highp float;

        varying vec2 v_uv;
        varying vec3 v_normal_r;
        varying vec3 v_normal_g;
        varying vec3 v_normal_b;
        varying float v_height;

        uniform vec3 waterColor;
        uniform vec3 waterDeep;
        uniform vec3 skyHorizon;
        uniform vec3 skyZenith;
        uniform vec3 sunDir;
        uniform float specularPower;
        uniform float specularStrength;
        uniform float fresnelPower;
        uniform float vignetteRadius;
        uniform float vignetteSoftness;

        vec3 skyReflection(vec3 R) {
            float up = clamp(R.y, -1.0, 1.0);
            float t = smoothstep(0.0, 0.7, up);
            vec3 sky = mix(skyHorizon, skyZenith, t);
            vec3 below = waterDeep * 0.5;
            return mix(below, sky, smoothstep(-0.3, 0.05, up));
        }

        float fresnel(float cosV, float power) {
            float f0 = 0.02;
            float base = max(1.0 - clamp(cosV, 0.0, 1.0), 0.001);
            return f0 + (1.0 - f0) * pow(base, power);
        }

        vec3 shadeChannel(vec3 N, vec3 L, vec3 V, vec3 H, vec3 base, float fp) {
            float diff = max(dot(N, L), 0.0);
            vec3 lit = base * (0.4 + 0.6 * diff);
            float cosV = clamp(dot(N, V), 0.0, 1.0);
            float F = clamp(fresnel(cosV, fp), 0.0, 1.0);
            vec3 R = reflect(-V, N);
            vec3 skyRef = skyReflection(R);
            vec3 col = mix(lit, skyRef, F);
            float spec = pow(max(dot(N, H), 0.0), specularPower);
            col += vec3(spec) * specularStrength;
            return col;
        }

        void main() {
            vec3 L = normalize(sunDir);
            vec3 V = vec3(0.0, 0.0, 1.0);
            vec3 H = normalize(L + V);

            vec3 Nr = normalize(v_normal_r);
            vec3 Ng = normalize(v_normal_g);
            vec3 Nb = normalize(v_normal_b);

            float heightMix = clamp(v_height * 30.0 + 0.5, 0.0, 1.0);
            vec3 base = mix(waterDeep, waterColor, heightMix);

            vec3 color;
            color.r = shadeChannel(Nr, L, V, H, base, fresnelPower).r;
            color.g = shadeChannel(Ng, L, V, H, base, fresnelPower).g;
            color.b = shadeChannel(Nb, L, V, H, base, fresnelPower).b;

            float d = distance(v_uv, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, d);
            color = mix(color, vec3(0.0), vig);

            gl_FragColor = vec4(color, 1.0);
        }
    `;
}

// =====================================================================
// MAIN
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

    var program = null;
    var positionLocation = null;
    var timeLocation = null;
    var gridBuffer = null;
    var indexBuffer = null;
    var indexCount = 0;
    var indexType = gl.UNSIGNED_INT;
    var u = {};

    var ripples = [];
    var nextSpawnTime = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

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

    function buildMesh(res) {
        res = Math.max(40, Math.min(1024, res | 0));
        var n = res;
        var verts = new Float32Array(n * n * 2);
        for (var y = 0; y < n; y++) {
            for (var x = 0; x < n; x++) {
                var idx = (y * n + x) * 2;
                verts[idx]     = x / (n - 1);
                verts[idx + 1] = y / (n - 1);
            }
        }
        if (gridBuffer) gl.deleteBuffer(gridBuffer);
        gridBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        var idxArr = new Uint32Array((n - 1) * (n - 1) * 6);
        var k = 0;
        for (var yy = 0; yy < n - 1; yy++) {
            for (var xx = 0; xx < n - 1; xx++) {
                var a = yy * n + xx;
                var b = a + 1;
                var c = a + n;
                var d = c + 1;
                idxArr[k++] = a; idxArr[k++] = b; idxArr[k++] = c;
                idxArr[k++] = b; idxArr[k++] = d; idxArr[k++] = c;
            }
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
        u.rippleSpeed     = gl.getUniformLocation(program, "rippleSpeed");
        u.rippleWavelength= gl.getUniformLocation(program, "rippleWavelength");
        u.rippleDecay     = gl.getUniformLocation(program, "rippleDecay");
        u.rippleStrength  = gl.getUniformLocation(program, "rippleStrength");
        u.rippleThickness = gl.getUniformLocation(program, "rippleThickness");
        u.rippleCount     = gl.getUniformLocation(program, "rippleCount");
        u.ripples         = gl.getUniformLocation(program, "ripples[0]");
        u.rippleTime      = gl.getUniformLocation(program, "rippleTime");
        u.rgbSplit        = gl.getUniformLocation(program, "rgbSplit");
        u.rgbAngle        = gl.getUniformLocation(program, "rgbAngle");
        u.surfaceDepth    = gl.getUniformLocation(program, "surfaceDepth");
        u.surfaceTilt     = gl.getUniformLocation(program, "surfaceTilt");
        u.perspectiveStrength = gl.getUniformLocation(program, "perspectiveStrength");
        u.cameraHeight    = gl.getUniformLocation(program, "cameraHeight");
        u.waterColor      = gl.getUniformLocation(program, "waterColor");
        u.waterDeep       = gl.getUniformLocation(program, "waterDeep");
        u.skyHorizon      = gl.getUniformLocation(program, "skyHorizon");
        u.skyZenith       = gl.getUniformLocation(program, "skyZenith");
        u.sunDir          = gl.getUniformLocation(program, "sunDir");
        u.specularPower   = gl.getUniformLocation(program, "specularPower");
        u.specularStrength= gl.getUniformLocation(program, "specularStrength");
        u.fresnelPower    = gl.getUniformLocation(program, "fresnelPower");
        u.vignetteRadius  = gl.getUniformLocation(program, "vignetteRadius");
        u.vignetteSoftness= gl.getUniformLocation(program, "vignetteSoftness");
    }

    var vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    var fs = createShader(gl.FRAGMENT_SHADER, buildFragmentSource());
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link failed:", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);
    cacheUniforms();

    buildMesh(state.gridResolution);
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

            gl.uniform1f(u.rgbSplit,      state.rgbSplit);
            gl.uniform1f(u.rgbAngle,      state.rgbAngle);
            gl.uniform1f(u.surfaceDepth,  state.surfaceDepth);
            gl.uniform1f(u.surfaceTilt,   state.surfaceTilt);
            gl.uniform1f(u.perspectiveStrength, state.perspectiveStrength);
            gl.uniform1f(u.cameraHeight,  state.cameraHeight);

            gl.uniform3f(u.waterColor,    state.waterColorR, state.waterColorG, state.waterColorB);
            gl.uniform3f(u.waterDeep,     state.waterDeepR,  state.waterDeepG,  state.waterDeepB);
            gl.uniform3f(u.skyHorizon,    state.skyHorizonR, state.skyHorizonG, state.skyHorizonB);
            gl.uniform3f(u.skyZenith,     state.skyZenithR,  state.skyZenithG,  state.skyZenithB);

            var sa = state.sunAngle;
            var sh = state.sunHeight;
            var shH = Math.sqrt(Math.max(0.01, 1.0 - sh * sh));
            gl.uniform3f(u.sunDir,
                Math.cos(sa) * shH,
                Math.sin(sa) * shH,
                sh
            );

            gl.uniform1f(u.specularPower,    state.specularPower);
            gl.uniform1f(u.specularStrength, state.specularStrength);
            gl.uniform1f(u.fresnelPower,     state.fresnelPower);
            gl.uniform1f(u.vignetteRadius,   state.vignetteRadius);
            gl.uniform1f(u.vignetteSoftness, state.vignetteSoftness);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.drawElements(gl.TRIANGLES, indexCount, indexType, 0);
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