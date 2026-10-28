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

    // ---------- Tunable parameters ----------
    var rotBase          = 0.00008;
    var rotOscAmp        = 0.00004;
    var rotOscRate       = 0.03;

    var zoomBase         = 1.00000;
    var zoomOscAmp       = 0.00002;
    var zoomOscRate      = 0.02;

    var driftXBase       = 0.0;
    var driftXOscAmp     = 0.00001;
    var driftXOscRate    = 0.02;
    var driftYBase       = 0.0;
    var driftYOscAmp     = 0.00001;
    var driftYOscRate    = 0.03;

    var feedbackColor    = 0.55;
    var feedbackDecay    = 0.985;

    // DOMAIN WARP — how far the whole image is displaced out of position (UV units).
    //   0.005 = gentle stretch, 0.02 = noticeable morph,
    //   0.05  = heavy warp,   0.15 = extreme psychedelic distortion.
    var warpBase         = 0.082;
    var warpOscAmp       = 0.0815;
    var warpOscRate      = 0.08;

    var flowSpeed        = 0.025;
    var warpStrength     = 2.2;
    var warpOctaves      = 5.0;
    var noiseScale       = 2.8;
    var rgbSplitAmount   = 0.06;
    var rgbSplitAngle    = 0.0;
    var causticSharpness = 1.9;
    var causticIntensity = 0.9;

    var speedCenter      = 1.25;
    var speedOscAmp      = 0.12;
    var angleCenter      = 2.094;
    var angleOscAmp      = 0.35;
    var warpAngleCenter  = 0.0;
    var warpAngleOscAmp  = 0.525;

    var chRateR  = 0.03,  chPhaseR  = 0.0;
    var chRateG  = 0.04,  chPhaseG  = 1.7;
    var chRateB  = 0.05,  chPhaseB  = 3.9;
    var waRateR = 0.02, waPhaseR = 0.0;
    var waRateG = 0.03, waPhaseG = 2.3;
    var waRateB = 0.04, waPhaseB = 5.1;

    var baseColorR       = 0.04;
    var baseColorG       = 0.08;
    var baseColorB       = 0.16;
    var tintR            = 1.00;
    var tintG            = 0.85;
    var tintB            = 0.70;
    var vignetteRadius   = 0.55;
    var vignetteSoftness = 0.35;

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
            // STAGE 1: feedback transform (per-frame increments, compound via loop)
            vec2 uv = v_texCoord - 0.5;
            uv = rot(uv, fbRotStep);
            uv *= fbZoomStep;
            uv -= fbDriftStep;
            uv += 0.5;

            // STAGE 2: DOMAIN WARP — morph the whole image out of position.
            // Two-stage warp: w1 displaces broadly, w2 adds swirling detail.
            // Everything downstream is rendered at the warped UV, so caustics
            // AND feedback all bend together as one distorted image.
            if (warpAmount > 0.0001) {
                vec2 w1 = flow(uv, time * 0.15, 0.0);
                vec2 w2 = flow(uv + w1 * 1.5, time * 0.22, 0.0);
                uv += (w1 + w2 * 0.5) * warpAmount;
            }

            // STAGE 3: feedback sample
            vec3 prev = texture2D(feedbackTex, uv).rgb;

            // STAGE 4: fresh caustics at same warped UV
            float t = time;
            float rCh = causticLayer(uv, t, -1.0);
            float gCh = causticLayer(uv, t,  0.0);
            float bCh = causticLayer(uv, t,  1.0);
            vec3 color = baseColor + vec3(rCh, gCh, bCh) * tint;

            // STAGE 5: blend feedback
            color = color + prev * feedbackColor * feedbackDecay;

            // STAGE 6: vignette on original screen coords
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
    u.fbRotStep        = gl.getUniformLocation(program, "fbRotStep");
    u.fbZoomStep       = gl.getUniformLocation(program, "fbZoomStep");
    u.fbDriftStep      = gl.getUniformLocation(program, "fbDriftStep");
    u.feedbackColor    = gl.getUniformLocation(program, "feedbackColor");
    u.feedbackDecay    = gl.getUniformLocation(program, "feedbackDecay");
    u.warpAmount       = gl.getUniformLocation(program, "warpAmount");
    u.flowSpeed        = gl.getUniformLocation(program, "flowSpeed");
    u.warpStrength     = gl.getUniformLocation(program, "warpStrength");
    u.warpOctaves      = gl.getUniformLocation(program, "warpOctaves");
    u.noiseScale       = gl.getUniformLocation(program, "noiseScale");
    u.rgbSplitAmount   = gl.getUniformLocation(program, "rgbSplitAmount");
    u.rgbSplitAngle    = gl.getUniformLocation(program, "rgbSplitAngle");
    u.flowSpeedRGB     = gl.getUniformLocation(program, "flowSpeedRGB");
    u.flowAngleRGB     = gl.getUniformLocation(program, "flowAngleRGB");
    u.warpAngleRGB     = gl.getUniformLocation(program, "warpAngleRGB");
    u.causticSharpness = gl.getUniformLocation(program, "causticSharpness");
    u.causticIntensity = gl.getUniformLocation(program, "causticIntensity");
    u.baseColor        = gl.getUniformLocation(program, "baseColor");
    u.tint             = gl.getUniformLocation(program, "tint");
    u.vignetteRadius   = gl.getUniformLocation(program, "vignetteRadius");
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

            var rotStep    = rotBase    + rotOscAmp    * Math.sin(tSec * rotOscRate    * TAU);
            var zoomStep   = zoomBase   + zoomOscAmp   * Math.sin(tSec * zoomOscRate   * TAU + 1.3);
            var driftXStep = driftXBase + driftXOscAmp * Math.sin(tSec * driftXOscRate * TAU + 2.1);
            var driftYStep = driftYBase + driftYOscAmp * Math.sin(tSec * driftYOscRate * TAU + 4.4);
            var warpNow    = warpBase   + warpOscAmp   * Math.sin(tSec * warpOscRate   * TAU);

            var speedR = speedCenter + speedOscAmp * Math.sin(tSec * chRateR * TAU + chPhaseR);
            var speedG = speedCenter + speedOscAmp * Math.sin(tSec * chRateG * TAU + chPhaseG);
            var speedB = speedCenter + speedOscAmp * Math.sin(tSec * chRateB * TAU + chPhaseB);

            var angleR = 0.0               + angleOscAmp * Math.sin(tSec * chRateR * TAU + chPhaseR + 0.9);
            var angleG = angleCenter * 1.0 + angleOscAmp * Math.sin(tSec * chRateG * TAU + chPhaseG + 0.9);
            var angleB = angleCenter * 2.0 + angleOscAmp * Math.sin(tSec * chRateB * TAU + chPhaseB + 0.9);

            var warpAR = warpAngleCenter + warpAngleOscAmp * Math.sin(tSec * waRateR * TAU + waPhaseR);
            var warpAG = warpAngleCenter + warpAngleOscAmp * Math.sin(tSec * waRateG * TAU + waPhaseG);
            var warpAB = warpAngleCenter + warpAngleOscAmp * Math.sin(tSec * waRateB * TAU + waPhaseB);

            var readTex  = feedbackTextures[fbIndex];
            var writeFBO = feedbackFBOs[1 - fbIndex];

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, readTex);
            gl.uniform1i(feedbackTexLocation, 0);

            gl.uniform1f(u.fbRotStep,        rotStep);
            gl.uniform1f(u.fbZoomStep,       zoomStep);
            gl.uniform2f(u.fbDriftStep,      driftXStep, driftYStep);
            gl.uniform1f(u.feedbackColor,    feedbackColor);
            gl.uniform1f(u.feedbackDecay,    feedbackDecay);
            gl.uniform1f(u.warpAmount,       warpNow);
            gl.uniform1f(u.flowSpeed,        flowSpeed);
            gl.uniform1f(u.warpStrength,     warpStrength);
            gl.uniform1f(u.warpOctaves,      warpOctaves);
            gl.uniform1f(u.noiseScale,       noiseScale);
            gl.uniform1f(u.rgbSplitAmount,   rgbSplitAmount);
            gl.uniform1f(u.rgbSplitAngle,    rgbSplitAngle);
            gl.uniform3f(u.flowSpeedRGB,     speedR, speedG, speedB);
            gl.uniform3f(u.flowAngleRGB,     angleR, angleG, angleB);
            gl.uniform3f(u.warpAngleRGB,     warpAR, warpAG, warpAB);
            gl.uniform1f(u.causticSharpness, causticSharpness);
            gl.uniform1f(u.causticIntensity, causticIntensity);
            gl.uniform3f(u.baseColor,        baseColorR, baseColorG, baseColorB);
            gl.uniform3f(u.tint,             tintR, tintG, tintB);
            gl.uniform1f(u.vignetteRadius,   vignetteRadius);
            gl.uniform1f(u.vignetteSoftness, vignetteSoftness);

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

main();