function main() {
    // Vaguely clean up any existing effect
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

    if (!gl) {
        console.log('WebGL not supported');
        return;
    }

    // ---------- Tunable parameters ----------
    var feedbackAmount = 0.45;   // how much trail bleeds into current frame (0..1)
    var feedbackDecay  = 0.94;   // per-frame loss factor for the trail (0..1, closer to 1 = longer trails)
    var wedgeCount     = 3.0;    // kaleidoscope symmetry order (3 = triangle, 6 = hex, 12 = snowflake)
    var pulseAmount    = 3.12;   // radial pulse strength — 0 = no breathing, 0.3 = strong inhale/exhale
    var fbRotSpeed     = 0.012;  // radians the feedback rotates per frame (negative = opposite spiral direction)
    var fbZoom         = 0.9985; // feedback scale per frame (<1 = trails zoom outward, >1 = implode, 1 = pure rotation)
    var fbOffsetX      = 0.0;    // feedback UV offset — shifts trails horizontally (0 = centered)
    var fbOffsetY      = 0.0;    // feedback UV offset — shifts trails vertically (0 = centered)

    // ---------- Forward declarations (must exist before resizeCanvas runs) ----------
    var feedbackFBOs = [null, null];
    var feedbackTextures = [null, null];
    var fbIndex = 0;
    var program = null;
    var feedbackTexLocation = null;
    var feedbackAmountLocation = null;
    var feedbackDecayLocation = null;
    var wedgeCountLocation = null;
    var pulseAmountLocation = null;
    var fbRotSpeedLocation = null;
    var fbZoomLocation = null;
    var fbOffsetLocation = null;
    var timeLocation = null;
    var positionLocation = null;

    // ---------- Resize ----------
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        rebuildFeedback(); // safe no-op until program exists
    }

    // ---------- Vertex Shader ----------
    var vertexShaderSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // ---------- Fragment Shader ----------
    var fragmentShaderSource = `
        precision highp float;
        varying vec2 v_texCoord;

        uniform float time;
        uniform sampler2D feedbackTex;
        uniform float feedbackAmount;
        uniform float feedbackDecay;
        uniform float wedgeCount;
        uniform float pulseAmount;
        uniform float fbRotSpeed;
        uniform float fbZoom;
        uniform vec2  fbOffset;

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

            // Global slow rotation
            uv = rot(uv, time * 0.22);

            // Kaleidoscopic fold into wedgeCount wedges (variable)
            float a = atan(uv.y, uv.x);
            a = abs(mod(a + 3.14159265 / wedgeCount, 6.2831853 / wedgeCount) - 3.14159265 / wedgeCount);
            vec2 kp = vec2(cos(a), sin(a)) * r;

            // Radial pulse — pulseAmount controls breathing intensity (variable)
            kp *= 1.0 + pulseAmount * sin(time * 0.6 + r * 6.0);

            // RGB swirls in different directions
            vec2 kpR = swirl(kp,  1.4 + 0.4 * sin(time * 0.5),       0.9);
            vec2 kpG = swirl(kp, -1.7 + 0.5 * sin(time * 0.7 + 1.3), 0.9);
            vec2 kpB = swirl(kp,  2.1 + 0.6 * sin(time * 0.4 + 2.6), 0.9);

            // Extra per-channel rotation
            kpR = rot(kpR,  time * 0.15);
            kpG = rot(kpG, -time * 0.15);
            kpB = rot(kpB,  time * 0.30);

            // Per-channel time offsets
            float tR = time * 0.9;
            float tG = time * 0.9 + 0.7;
            float tB = time * 0.9 + 1.4;

            float rCh = plasma(kpR + vec2(0.02, 0.0), tR);
            float gCh = plasma(kpG,                     tG);
            float bCh = plasma(kpB - vec2(0.02, 0.0), tB);

            rCh = pow(0.5 + 0.5 * rCh, 1.3);
            gCh = pow(0.5 + 0.5 * gCh, 1.3);
            bCh = pow(0.5 + 0.5 * bCh, 1.3);

            vec3 color = vec3(rCh, gCh, bCh);

            // --- Feedback sampling ---
            vec2 fbUv = v_texCoord - 0.5;

            // fbRotSpeed: rotates the previous frame before sampling.
            //   Positive = feedback spirals clockwise, negative = counter-clockwise.
            //   Larger magnitude = tighter, more coiled trails. Try 0.02–0.03 for fast curls.
            fbUv = rot(fbUv, fbRotSpeed);

            // fbZoom: scales the previous frame before sampling.
            //   <1.0 = trails zoom outward (bloom away from center).
            //   >1.0 = trails implode inward.
            //   =1.0 = no zoom, only rotation (pure spiral).
            fbUv *= fbZoom;

            // fbOffset: shifts the sampled feedback UV.
            //   Use small values like 0.001–0.01 to make trails drift directionally
            //   instead of radiating. Useful for wind / current / drift effects.
            fbUv += fbOffset;

            fbUv += 0.5;
            vec3 prev = texture2D(feedbackTex, fbUv).rgb;

            // Lossy feedback: trail decays each frame, no runaway brightening
            color = color + prev * feedbackAmount * feedbackDecay;

            // Vignette
            float radius = 0.42;
            float softness = 0.22;
            float vignette = smoothstep(radius, radius + softness, r);
            color = mix(color, vec3(0.0), vignette);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // ---------- Shader helpers ----------
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

    timeLocation          = gl.getUniformLocation(program, "time");
    feedbackTexLocation   = gl.getUniformLocation(program, "feedbackTex");
    feedbackAmountLocation = gl.getUniformLocation(program, "feedbackAmount");
    feedbackDecayLocation = gl.getUniformLocation(program, "feedbackDecay");
    wedgeCountLocation    = gl.getUniformLocation(program, "wedgeCount");
    pulseAmountLocation   = gl.getUniformLocation(program, "pulseAmount");
    fbRotSpeedLocation    = gl.getUniformLocation(program, "fbRotSpeed");
    fbZoomLocation        = gl.getUniformLocation(program, "fbZoom");
    fbOffsetLocation      = gl.getUniformLocation(program, "fbOffset");

    // ---------- Geometry ----------
    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // ---------- Feedback framebuffers ----------
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
        if (!program) return; // not ready yet

        for (var i = 0; i < 2; i++) {
            if (feedbackFBOs[i]) { gl.deleteFramebuffer(feedbackFBOs[i]); feedbackFBOs[i] = null; }
            if (feedbackTextures[i]) { gl.deleteTexture(feedbackTextures[i]); feedbackTextures[i] = null; }
        }
        var w = canvas.width;
        var h = canvas.height;
        var a = createFeedbackTarget(w, h);
        var b = createFeedbackTarget(w, h);
        feedbackFBOs[0] = a.fbo;      feedbackTextures[0] = a.tex;
        feedbackFBOs[1] = b.fbo;      feedbackTextures[1] = b.tex;
        fbIndex = 0;
    }

    // ---------- First-time setup ----------
    resizeCanvas();
    ResizeManager.attach(resizeCanvas);
    rebuildFeedback(); // program now exists, build real targets

    // ---------- Animation loop ----------
    var lastFrameTime = 0;
    var targetFPS = 60;
    var frameInterval = 1000 / targetFPS;

    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            var readTex  = feedbackTextures[fbIndex];
            var writeFBO = feedbackFBOs[1 - fbIndex];

            // Bind previous frame as input
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(feedbackTexLocation, 0);

            // Push all tunables
            gl.uniform1f(feedbackAmountLocation, feedbackAmount);
            gl.uniform1f(feedbackDecayLocation, feedbackDecay);
            gl.uniform1f(wedgeCountLocation, wedgeCount);
            gl.uniform1f(pulseAmountLocation, pulseAmount);
            gl.uniform1f(fbRotSpeedLocation, fbRotSpeed);
            gl.uniform1f(fbZoomLocation, fbZoom);
            gl.uniform2f(fbOffsetLocation, fbOffsetX, fbOffsetY);

            // Render into write FBO
            gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.uniform1f(timeLocation, now * 0.001);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Blit to screen
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, feedbackTextures[1 - fbIndex]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Swap buffers
            fbIndex = 1 - fbIndex;
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

main();