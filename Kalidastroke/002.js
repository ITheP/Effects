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
        fbRotSpeed: 0.012,
        fbZoom: 0.9985,
        fbOffsetX: 0.0,
        fbOffsetY: 0.0,
        // kaleidoscope
        wedgeCount: 3.0,
        pulseAmount: 0.30,
        pulseSpeed: 0.6,
        pulseFreq: 6.0,
        globalRotSpeed: 0.22,
        // swirl
        swirlStrength: 1.4,
        swirlAnim: 0.4,
        swirlRadius: 0.9,
        // colour
        colorPow: 1.3,
        colorOffset: 0.02,
        channelSkew: 1.0,
        // vignette
        vignetteRadius: 0.42,
        vignetteSoft: 0.22,
        // render
        targetFPS: 60,
        presetTransitionTime: 3.0,
    };

    /* ============================================================
       CONTROLS
       ============================================================ */
    const CONTROLS = [
        {
            heading: "⚙️ General Settings", openByDefault: false, showExtras: false, controls: [
                {
                    icon: "🎞️", key: "targetFPS", def: CFG.targetFPS, min: 15, max: 120, step: 1, int: true,
                    label: "Target FPS", savedInPreset: false,
                    details: "Framerate cap for the render loop."
                },
                {
                    icon: "🕐", key: "presetTransitionTime", def: CFG.presetTransitionTime, min: 0, max: 5, step: 0.01,
                    label: "Preset Transition", savedInPreset: false,
                    details: "Seconds over which preset loads animate (0 = instant)."
                },
            ]
        },
        {
            heading: "🔁 Feedback Trails", openByDefault: true, controls: [
                {
                    icon: "💧", key: "feedbackAmount", def: CFG.feedbackAmount, min: 0, max: 0.98, step: 0.005,
                    label: "Feedback Amount", details: "How strongly the previous frame bleeds into the current one."
                },
                {
                    icon: "🍂", key: "feedbackDecay", def: CFG.feedbackDecay, min: -2.0, max: 2.0, step: 0.01,
                    label: "Feedback Decay", details: "Per-frame trail loss. Closer to 1 = longer trails."
                },
                {
                    icon: "🌀", key: "fbRotSpeed", def: CFG.fbRotSpeed, min: -3.0, max: 3.0, step: 0.01,
                    label: "FB Rotation", details: "Radians the previous frame rotates per frame. Negative = opposite spiral."
                },
                {
                    icon: "🔍", key: "fbZoom", def: CFG.fbZoom, min: 0.0, max: 3.0, step: 0.01,
                    label: "FB Zoom", details: "<1 = trails bloom outward, >1 = implode, 1 = pure rotation."
                },
                {
                    icon: "➡️", key: "fbOffsetX", def: CFG.fbOffsetX, min: -0.02, max: 0.02, step: 0.0005,
                    label: "FB Drift X", details: "Directional drift of trails (wind/current effect)."
                },
                {
                    icon: "⬆️", key: "fbOffsetY", def: CFG.fbOffsetY, min: -0.02, max: 0.02, step: 0.0005,
                    label: "FB Drift Y", details: "Directional drift of trails vertically."
                },
            ]
        },
        {
            heading: "❄️ Kaleidoscope", openByDefault: true, controls: [
                {
                    icon: "🔷", key: "wedgeCount", def: CFG.wedgeCount, min: 1, max: 24, step: 0.5,
                    label: "Wedge Count", details: "Symmetry order: 3 = triangle, 6 = hex, 12 = snowflake."
                },
                {
                    icon: "🎡", key: "globalRotSpeed", def: CFG.globalRotSpeed, min: -1, max: 1, step: 0.01,
                    label: "Global Rotation", details: "Slow rotation speed of the UV space."
                },
                {
                    icon: "🫧", key: "pulseAmount", def: CFG.pulseAmount, min: -2, max: 2, step: 0.01,
                    label: "Radial Pulse", details: "Breathing strength. 0 = static, 0.3 = gentle, 1+ = wild."
                },
                {
                    icon: "⏱️", key: "pulseSpeed", def: CFG.pulseSpeed, min: 0, max: 3, step: 0.01,
                    label: "Pulse Speed", details: "Temporal speed of the breathing cycle."
                },
                {
                    icon: "📏", key: "pulseFreq", def: CFG.pulseFreq, min: 0, max: 20, step: 0.1,
                    label: "Pulse Frequency", details: "Radial frequency of the breathing ripples."
                },
            ]
        },
        {
            heading: "🌊 Swirl", openByDefault: true, controls: [
                {
                    icon: "🌀", key: "swirlStrength", def: CFG.swirlStrength, min: 0, max: 4, step: 0.01,
                    label: "Swirl Strength", details: "Base swirl strength applied per RGB channel."
                },
                {
                    icon: "🎞️", key: "swirlAnim", def: CFG.swirlAnim, min: 0, max: 2, step: 0.01,
                    label: "Swirl Animation", details: "How much the swirl strength oscillates over time."
                },
                {
                    icon: "📏", key: "swirlRadius", def: CFG.swirlRadius, min: 0.1, max: 3, step: 0.01,
                    label: "Swirl Radius", details: "Falloff radius. Larger = softer, wider swirl."
                },
            ]
        },
        {
            heading: "🎨 Colour", openByDefault: true, controls: [
                {
                    icon: "🎚️", key: "colorPow", def: CFG.colorPow, min: 0.3, max: 4, step: 0.01,
                    label: "Colour Power", details: "Gamma per channel. Higher = more contrast."
                },
                {
                    icon: "↔️", key: "colorOffset", def: CFG.colorOffset, min: 0, max: 0.1, step: 0.001,
                    label: "Channel Offset", details: "Spatial offset between R/G/B sampling (chromatic aberration)."
                },
                {
                    icon: "🌈", key: "channelSkew", def: CFG.channelSkew, min: 0, max: 2, step: 0.01,
                    label: "Channel Skew", details: "How far R/G/B swirl strengths diverge from base."
                },
            ]
        },
        {
            heading: "🕶️ Vignette", openByDefault: false, controls: [
                {
                    icon: "⭕", key: "vignetteRadius", def: CFG.vignetteRadius, min: 0.0, max: 1.0, step: 0.005,
                    label: "Vignette Radius", details: "Radius where darkening begins."
                },
                {
                    icon: "☁️", key: "vignetteSoft", def: CFG.vignetteSoft, min: 0.01, max: 1.0, step: 0.005,
                    label: "Vignette Softness", details: "Falloff softness."
                },
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
    Object.keys(CONTROL_BY_KEY).forEach(key => {
        const c = CONTROL_BY_KEY[key];
        DEFAULTS[key] = c.def;
        if (c.int) INT_KEYS[key] = true;
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
                colorOffset: 0.04, channelSkew: 1.6,
                wedgeCount: 5, pulseAmount: 0.25,
                swirlStrength: 1.8, swirlAnim: 0.8, colorPow: 1.2
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
    var fbIndex = 0;
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
        uniform float feedbackAmount;
        uniform float feedbackDecay;
        uniform float wedgeCount;
        uniform float pulseAmount;
        uniform float pulseSpeed;
        uniform float pulseFreq;
        uniform float fbRotSpeed;
        uniform float fbZoom;
        uniform vec2  fbOffset;
        uniform float globalRotSpeed;
        uniform float swirlStrength;
        uniform float swirlAnim;
        uniform float swirlRadius;
        uniform float colorPow;
        uniform float colorOffset;
        uniform float channelSkew;
        uniform float vignetteRadius;
        uniform float vignetteSoft;

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

        void main() {
            vec2 uv = v_texCoord - 0.5;
            float r = length(uv);

            uv = rot(uv, time * globalRotSpeed);

            float a = atan(uv.y, uv.x);
            a = abs(mod(a + 3.14159265 / wedgeCount, 6.2831853 / wedgeCount) - 3.14159265 / wedgeCount);
            vec2 kp = vec2(cos(a), sin(a)) * r;

            kp *= 1.0 + pulseAmount * sin(time * pulseSpeed + r * pulseFreq);

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

            vec2 off = vec2(colorOffset, 0.0);
            float rCh = plasma(kpR + off,  tR);
            float gCh = plasma(kpG,        tG);
            float bCh = plasma(kpB - off,  tB);

            rCh = pow(0.5 + 0.5 * rCh, colorPow);
            gCh = pow(0.5 + 0.5 * gCh, colorPow);
            bCh = pow(0.5 + 0.5 * bCh, colorPow);

            vec3 color = vec3(rCh, gCh, bCh);

            vec2 fbUv = v_texCoord - 0.5;
            fbUv = rot(fbUv, fbRotSpeed);
            fbUv *= fbZoom;
            fbUv += fbOffset;
            fbUv += 0.5;
            vec3 prev = texture2D(feedbackTex, fbUv).rgb;

            color = color + prev * feedbackAmount * feedbackDecay;

            float vg = smoothstep(vignetteRadius, vignetteRadius + vignetteSoft, r);
            color = mix(color, vec3(0.0), vg);

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
        "time", "feedbackTex", "feedbackAmount", "feedbackDecay",
        "wedgeCount", "pulseAmount", "pulseSpeed", "pulseFreq",
        "fbRotSpeed", "fbZoom", "fbOffset",
        "globalRotSpeed", "swirlStrength", "swirlAnim", "swirlRadius",
        "colorPow", "colorOffset", "channelSkew",
        "vignetteRadius", "vignetteSoft",
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
        }
        var a = createFeedbackTarget(canvas.width, canvas.height);
        var b = createFeedbackTarget(canvas.width, canvas.height);
        feedbackFBOs[0] = a.fbo; feedbackTextures[0] = a.tex;
        feedbackFBOs[1] = b.fbo; feedbackTextures[1] = b.tex;
        fbIndex = 0;
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
                // snap to target
                Object.keys(DEFAULTS).forEach(k => {
                    if (STANDALONE_KEYS[k]) return;
                    state[k] = transitionTarget[k];
                });
                transitionActive = false;
                refreshControlsUI();
            } else {
                // smootherstep: t^3 * (t * (t*6 - 15) + 10)
                const te = tn * tn * tn * (tn * (tn * 6 - 15) + 10);
                Object.keys(DEFAULTS).forEach(k => {
                    if (STANDALONE_KEYS[k]) return;
                    const a = transitionSource[k];
                    const b = transitionTarget[k];
                    if (typeof a === 'number' && typeof b === 'number') {
                        let v = a + (b - a) * te;
                        if (INT_KEYS[k]) v = Math.round(v);
                        state[k] = v;
                    }
                });
                // throttle UI refreshes so we don't thrash the DOM
                if ((now | 0) % 4 === 0) refreshControlsUI();
            }
        }

        /* ---- render ---- */
        var frameInterval = 1000 / Math.max(1, state.targetFPS);
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            var readTex = feedbackTextures[fbIndex];
            var writeFBO = feedbackFBOs[1 - fbIndex];

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(uniforms.feedbackTex, 0);

            gl.uniform1f(uniforms.feedbackAmount, state.feedbackAmount);
            gl.uniform1f(uniforms.feedbackDecay, state.feedbackDecay);
            gl.uniform1f(uniforms.wedgeCount, state.wedgeCount);
            gl.uniform1f(uniforms.pulseAmount, state.pulseAmount);
            gl.uniform1f(uniforms.pulseSpeed, state.pulseSpeed);
            gl.uniform1f(uniforms.pulseFreq, state.pulseFreq);
            gl.uniform1f(uniforms.fbRotSpeed, state.fbRotSpeed);
            gl.uniform1f(uniforms.fbZoom, state.fbZoom);
            gl.uniform2f(uniforms.fbOffset, state.fbOffsetX, state.fbOffsetY);
            gl.uniform1f(uniforms.globalRotSpeed, state.globalRotSpeed);
            gl.uniform1f(uniforms.swirlStrength, state.swirlStrength);
            gl.uniform1f(uniforms.swirlAnim, state.swirlAnim);
            gl.uniform1f(uniforms.swirlRadius, state.swirlRadius);
            gl.uniform1f(uniforms.colorPow, state.colorPow);
            gl.uniform1f(uniforms.colorOffset, state.colorOffset);
            gl.uniform1f(uniforms.channelSkew, state.channelSkew);
            gl.uniform1f(uniforms.vignetteRadius, state.vignetteRadius);
            gl.uniform1f(uniforms.vignetteSoft, state.vignetteSoft);

            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uniforms.time, (now - startTime) * 0.001);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fbIndex = 1 - fbIndex;
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
        });
    }

    function isControlRandomisable(c) {
        if (c.canRandomise === false) return false;
        if (c.canRandomise === true) return true;
        if (c.special) return false;
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
        if (btn) {
            const old = btn.textContent;
            btn.textContent = "✓";
            setTimeout(() => { btn.textContent = old; }, 400);
        }
    }

    function copyGroup(group, btn) {
        const vals = {};
        group.controls.forEach(c => { vals[c.key] = deepClone(state[c.key]); });
        groupClipboard[group.heading] = vals;
        if (btn) {
            const old = btn.textContent;
            btn.textContent = "✓";
            setTimeout(() => { btn.textContent = old; }, 400);
        }
    }

    function pasteGroup(group, btn) {
        const vals = groupClipboard[group.heading];
        if (!vals) {
            if (btn) {
                const old = btn.textContent;
                btn.textContent = "—";
                setTimeout(() => { btn.textContent = old; }, 400);
            }
            return;
        }
        group.controls.forEach(c => {
            if (!(c.key in vals)) return;
            let v = deepClone(vals[c.key]);
            if (INT_KEYS[c.key]) v = Math.round(v);
            state[c.key] = v;
        });
        refreshControlsUI();
        if (btn) {
            const old = btn.textContent;
            btn.textContent = "✓";
            setTimeout(() => { btn.textContent = old; }, 400);
        }
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

        /* build the full target snapshot */
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

        const tTime = state.presetTransitionTime;
        if (tTime > 0) {
            transitionSource = Object.assign({}, state);
            transitionTarget = target;
            transitionActive = true;
            transitionStart = performance.now();
            transitionDur = tTime * 1000;
            /* snapshot slider positions? not needed; the loop will drive them */
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

    rafHandle = requestAnimationFrame(animate);
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
            }
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

main();