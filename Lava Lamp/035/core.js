// =====================================================================
// main.js
// Lava lamp — WebGL render pipeline, blob physics, UI wiring.
//
// Loaded by loader.js. Expected globals (populated before this runs):
//   window.__lavaControls — CONTROLS array (main.controls.js)
//   window.__lavaPresets  — PRESETS array  (main.presets.js)
//   window.__lavaShaders  — GLSL sources   (shaders.js)
//   window.LavaCharacter  — character module (character.js)
//   window.LavaProjectile — projectile module (projectile.js)
//   window.GFXAssets      — GFX asset loader (assets.js)
//
// Loader calls main() after all the above are loaded and assets are ready.
// =====================================================================

function main() {
    let __destroyed = false;
    if (window.__lavalampApp && typeof window.__lavalampApp.destroy === 'function') {
        try { window.__lavalampApp.destroy(); } catch (e) { console.warn('lavalamp teardown:', e); }
    }
    cancelAnimationFrame(window.animationFrameId);
    document.body.querySelectorAll("canvas[data-lavalamp]").forEach(c => c.remove());

    // -----------------------------------------------------------------
    // Structural constants — must match shaders.js (MAX_BLOBS,
    // MAX_PLAYER_LIGHTS are baked into the GLSL array sizes there).
    // -----------------------------------------------------------------
    const MAX_BLOBS = 64;
    const BULLET_DRAW_CAP = 1024 + 512;
    const MAX_PLAYER_LIGHTS = 4;
    const LIGHT_FBO_SCALE = 2;
    const MAX_LIGHTS = 256;
    const SHIP_MAX = 8;

    // -----------------------------------------------------------------
    // CFG — the built-in defaults. Character.defaults are merged in
    // below (as before) so character-side settings populate this too.
    // -----------------------------------------------------------------
    const CFG = {
        targetFPS: 60, presetTransitionTime: 3.0,
        freezeTime: 0, autoMorph: 1, morphCycleTime: 10.0,
        timeScale: 0.23,
        debugMode: 0,

        webcamActive: 0,
        webcamBgMix: 0.5,
        webcamReflectMix: 0.5,
        webcamInvertReflect: 0,
        webcamRoughness: 0.30,
        webcamParallax: 1.0,
        sceneRoughness: 0.0,

        blobCount: 16,
        blobSize: 0.049,
        blobSizeVar: 0.6,
        buoyancy: 1.93,
        drag: 1.10,
        heatGain: 1.36,
        cooling: 0.32,
        heatDepth: 0.16,
        tempNeutral: 0.50,
        maxSpeed: 0.32,
        wander: 0.35,
        squish: 0.60,
        turbulence: 0.32,
        turbulenceFreq: 2.86,
        turbulenceScale: 0.2,
        traitVariance: 0.35,
        wallSquish: 0.60,
        wallRestitution: 0.30,
        deathDepth: 0.35,
        fieldThreshold: 0.7,
        spawnRate: 3.5,
        spawnBatch: 6,

        cohesion: 0.97,
        cohesionRange: 1.36,
        repelStrength: 1.1,
        repelRange: 0.87,

        poolActive: 1,
        poolLevel: 0.088,
        poolSoftness: 0.012,
        poolWave: 0.06,
        poolWaveSpeed: 3.0,

        waxColorA: '#ff3b1f',
        waxColorB: '#ffd24a',
        waxGlow: 1.48,
        waxGlowColor: '#ff6a00',
        sssColor: '#ff6633',
        sssStrength: 2.0,
        sssFalloff: 1.44,

        lightAngle: 2.20,
        specStrength: 0.91,
        specSharp: 200,
        specColor: '#ffffff',
        softSpecStrength: 0.27,
        softSpecSharp: 10.5,
        reflectStrength: 0.0,
        reflectWidth: 3.0,
        reflectColor: '#ffffff',
        refractionStrength: 0.30,
        rimStrength: 1.01,
        reflectF0: 0.04,
        reflectPow: 5.0,
        ambient: 0.35,
        diffuse: 0.55,
        bump: 0.73,
        edgeSoft: 0.125,
        translucency: 0.35,
        translucencyBias: 0.55,

        bgTop: '#541891',
        bgBottom: '#043e13',
        lampGlow: 1.25,
        glowRadius: 0.38,
        glowColor: '#ff4d00',
        halo: 0.91,
        haloWidth: 3.6,
        glassCurve: 0,

        saturation: 1.10,
        brightness: 1.00,
        contrast: 1.05,
        colorPow: 1.42,
        vignetteRadius: 0.60,
        vignetteSoft: 0.50,
        vignetteColor: '#000000',

        extraLightStrength: 0.8,
    };

    if (window.LavaCharacter) {
        Object.assign(CFG, window.LavaCharacter.defaults);
    }

    // -----------------------------------------------------------------
    // UI controls — loaded from main.controls.js. Character group is
    // appended at runtime (it depends on character.js having loaded).
    // -----------------------------------------------------------------
    const V = window.__lavaVariants;
    const CONTROLS = (V && V.controls) || window.__lavaControls || [];
    if (window.LavaCharacter) {
        CONTROLS.push(window.LavaCharacter.controlsGroup);
    }

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

    // -----------------------------------------------------------------
    // PRESETS — loaded from main.presets.js. User presets appended.
    // -----------------------------------------------------------------
const PRESETS = (V && V.presets) || window.__lavaPresets || [{ name: "Default", iteration: 1, values: {} }];

    function fmtVal(v) {
        if (typeof v !== "number" || !isFinite(v)) return "0";
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
    function lerpHex(a, b, t) {
        const ca = hexToRgb(a);
        const cb = hexToRgb(b);
        const r = Math.round((ca[0] + (cb[0] - ca[0]) * t) * 255);
        const g = Math.round((ca[1] + (cb[1] - ca[1]) * t) * 255);
        const bl = Math.round((ca[2] + (cb[2] - ca[2]) * t) * 255);
        const to2 = v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
        return '#' + to2(r) + to2(g) + to2(bl);
    }
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);

    let state = Object.assign({}, DEFAULTS);
    const groupClipboard = {};

    let transitionActive = false;
    let transitionStart = 0;
    let transitionDur = 0;
    let transitionSource = null;
    let transitionTarget = null;
    let lastMorphTime = 0;

    let userPresets = [];
    try { userPresets = JSON.parse(localStorage.getItem('lavalampUserPresets') || '[]'); } catch (_) { userPresets = []; }
    userPresets.forEach(p => PRESETS.push(p));

    // =================================================================
    // CANVASES
    // =================================================================
    var canvas = document.createElement("canvas");
    canvas.setAttribute('data-lavalamp', '1');
    var content = document.getElementById("content");
    canvas.style.position = 'fixed';
    canvas.style.zIndex = -1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    content.appendChild(canvas);

    var charCanvas = null;
    var charCtx = null;
    if (window.LavaCharacter) {
        charCanvas = document.createElement("canvas");
        charCanvas.setAttribute('data-lavalamp-char', '1');
        charCanvas.style.position = 'fixed';
        charCanvas.style.zIndex = '-1';
        charCanvas.style.top = '0';
        charCanvas.style.left = '0';
        charCanvas.style.pointerEvents = 'none';
        content.appendChild(charCanvas);
        charCtx = charCanvas.getContext('2d');
        window.LavaCharacter.resetAllInstances();
    }

    var gl = canvas.getContext('webgl2', { preserveDrawingBuffer: false, alpha: false, antialias: false, depth: false });
    if (!gl) { console.log('WebGL 2 not supported'); return; }

    // =================================================================
    // Shaders — pulled from window.__lavaShaders (shaders.js)
    // =================================================================
    const SH = window.__lavaShaders;
    if (!SH) {
        console.error('[main] shaders.js not loaded — cannot compile shaders');
        return;
    }

    // =================================================================
    // Program compilation
    // =================================================================
    function createShader(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            console.error('Source:\n' + source.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n'));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function linkProgram(vsSrc, fsSrc, attrBindings) {
        const vs = createShader(gl.VERTEX_SHADER, vsSrc);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
        if (!vs || !fs) return null;
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        if (attrBindings) {
            for (const name in attrBindings) {
                gl.bindAttribLocation(prog, attrBindings[name], name);
            }
        }
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('Program link failed:', gl.getProgramInfoLog(prog));
            return null;
        }
        return prog;
    }

    function collectUniforms(prog, names) {
        const u = {};
        names.forEach(n => { u[n] = gl.getUniformLocation(prog, n); });
        return u;
    }

    var _shaderTotal = 7;
    var _shaderDone = 0;
    function _reportShader(name, ok) {
        _shaderDone++;
        if (window.__lavaShaderProgress) {
            window.__lavaShaderProgress(name, !!ok, _shaderDone, _shaderTotal);
        }
    }

    var program = linkProgram(SH.vertexShaderSource, SH.fragmentShaderSourceMain, { position: 0 });
    _reportShader('main scene', program);
    if (!program) return;

    var debugProgram = linkProgram(SH.vertexShaderSource, SH.fragmentShaderSourceDebug, { position: 0 });
    _reportShader('debug scene', debugProgram);
    if (!debugProgram) console.warn('Debug program failed to link — debug view disabled.');

    var bulletWaxProgram = linkProgram(
        SH.bulletWaxVertexSource, SH.fragmentShaderSourceBulletWax,
        { position: 0, a_instance: 1, a_color: 2 }
    );
    _reportShader('wax bullet', bulletWaxProgram);
    if (!bulletWaxProgram) console.warn('Wax bullet program failed to link — wax rendering disabled.');

    var postProgram = linkProgram(SH.vertexShaderSource, SH.fragmentShaderSourcePost, { position: 0 });
    _reportShader('post process', postProgram);
    if (!postProgram) console.warn('Post program failed to link — post processing disabled.');

    var lightProgram = linkProgram(
        SH.lightVertexSource, SH.lightFragmentSource,
        { position: 0, a_light: 1, a_color: 2 }
    );
    _reportShader('light accumulator', lightProgram);
    if (!lightProgram) console.warn('Light program failed to link — extra lights disabled.');
    var lightUniforms = lightProgram ? collectUniforms(lightProgram, ["aspect"]) : {};

    var glowProgram = linkProgram(
        SH.glowVertexSource, SH.fragmentShaderSourceGlow,
        { position: 0, a_instance: 1, a_color: 2 }
    );
    _reportShader('glow', glowProgram);
    if (!glowProgram) console.warn('Glow program failed to link — glow rendering disabled.');

    var shipProgram = linkProgram(
        SH.shipVertexSource, SH.fragmentShaderSourceShip,
        { position: 0, a_instance: 1, a_tint: 2 }
    );
    _reportShader('ship', shipProgram);
    if (!shipProgram) console.warn('Ship program failed to link — ships will not render.');

    // =================================================================
    // Uniform name lists
    // =================================================================
    const sceneUniformNames = [
        "time", "aspect", "blobs", "blobAngles", "blobVelocities", "blobRadiusAvg", "fieldThreshold",
        "cohesionRange", "repelRange", "reflectionTex",
        "webcamTex", "webcamActive", "webcamBgMix", "webcamReflectMix", "webcamAspect",
        "webcamInvertReflect", "refractionStrength", "webcamRoughness", "webcamParallax",
        "poolActive", "poolLevel", "poolSoftness", "poolWave", "poolWaveSpeed",
        "waxA", "waxB", "waxGlowColor", "waxGlow",
        "sssColor", "sssStrength", "sssFalloff",
        "bgTop", "bgBottom", "lampGlow", "glowRadius", "glowColor", "halo", "haloWidth", "glassCurve",
        "lightDir", "specColor", "specStrength", "specSharp", "softSpecStrength", "softSpecSharp",
        "reflectColor", "reflectStrength", "reflectWidth",
        "reflectF0", "reflectPow", "sceneRoughness",
        "rimStrength", "ambient", "diffuse", "bump", "edgeSoft",
        "translucency", "translucencyBias",
        "playerLightPos", "playerLightColor", "playerLightCount",
        "playerLightRadius", "playerLightStrength",
        "lightTex", "extraLightStrength"
    ];
    var uniforms = collectUniforms(program, sceneUniformNames);
    var debugUniforms = debugProgram ? collectUniforms(debugProgram, sceneUniformNames) : {};

    const waxBulletUniformNames = [
        "time",
        "reflectionTex", "webcamTex", "webcamActive", "webcamBgMix", "webcamReflectMix",
        "webcamAspect", "webcamRoughness", "webcamParallax", "webcamInvertReflect",
        "refractionStrength", "aspect",
        "waxA", "waxB", "waxGlowColor", "waxGlow", "sssColor", "sssStrength", "sssFalloff",
        "bgTop", "bgBottom", "lampGlow", "glowRadius", "glowColor", "halo", "haloWidth",
        "lightDir", "specColor", "specStrength", "specSharp", "softSpecStrength", "softSpecSharp",
        "reflectColor", "reflectStrength", "reflectWidth",
        "reflectF0", "reflectPow", "sceneRoughness",
        "rimStrength", "ambient", "diffuse", "bump", "edgeSoft",
        "translucency", "translucencyBias", "fieldThreshold",
        "playerLightPos", "playerLightColor", "playerLightCount",
        "playerLightRadius", "playerLightStrength",
        "lightTex", "extraLightStrength"
    ];

    const postUniformNames = [
        "inputTex",
        "saturation", "brightness", "contrast", "colorPow",
        "vignetteRadius", "vignetteSoft", "vignetteColor"
    ];
    var postUniformsLocs = postProgram ? collectUniforms(postProgram, postUniformNames) : {};
    const postCache = {};

    var bulletWaxUniforms = bulletWaxProgram ? collectUniforms(bulletWaxProgram, waxBulletUniformNames) : {};
    var glowUniforms = glowProgram ? collectUniforms(glowProgram, ["aspect", "glowBrightness"]) : {};
    var shipUniforms = shipProgram ? collectUniforms(shipProgram, ["aspect", "avatarAspect", "avatarTex", "lightTex", "reflectionTex", "extraLightStrength"]) : {};

    // =================================================================
    // Per-program uniform caches
    // =================================================================
    const sceneCache = {};
    const debugCache = {};
    const bulletWaxCache = {};
    const glowCache = {};

    let activeProgram = null;
    let activeUniforms = null;
    let activeCache = null;
    let activeIsDebug = false;

    function useProgram(prog, uni, cache, isDebug) {
        if (activeProgram === prog) return;
        gl.useProgram(prog);
        activeProgram = prog;
        activeUniforms = uni;
        activeCache = cache;
        activeIsDebug = isDebug;
    }

    function set1i(name, v) {
        if (activeCache[name] === v) return;
        const loc = activeUniforms[name];
        if (loc) gl.uniform1i(loc, v);
        activeCache[name] = v;
    }
    function set1f(name, v) {
        if (activeCache[name] === v) return;
        const loc = activeUniforms[name];
        if (loc) gl.uniform1f(loc, v);
        activeCache[name] = v;
    }
    function set2f(name, x, y) {
        const kx = name + '_x', ky = name + '_y';
        if (activeCache[kx] === x && activeCache[ky] === y) return;
        const loc = activeUniforms[name];
        if (loc) gl.uniform2f(loc, x, y);
        activeCache[kx] = x;
        activeCache[ky] = y;
    }
    function set3f(name, x, y, z) {
        const kx = name + '_x', ky = name + '_y', kz = name + '_z';
        if (activeCache[kx] === x && activeCache[ky] === y && activeCache[kz] === z) return;
        const loc = activeUniforms[name];
        if (loc) gl.uniform3f(loc, x, y, z);
        activeCache[kx] = x;
        activeCache[ky] = y;
        activeCache[kz] = z;
    }
    function setColor(name, hex) {
        const k = name + '_hex';
        if (activeCache[k] === hex) return;
        const rgb = hexToRgb(hex);
        const loc = activeUniforms[name];
        if (loc) gl.uniform3f(loc, rgb[0], rgb[1], rgb[2]);
        activeCache[k] = hex;
    }
    function setLightDirUniform() {
        const a = state.lightAngle;
        if (activeCache._lightAngle === a) return;
        const loc = activeUniforms.lightDir;
        if (loc) gl.uniform2f(loc, Math.cos(a), Math.sin(a));
        activeCache._lightAngle = a;
    }

    // =================================================================
    // VAO / buffers
    // =================================================================
    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const sceneVAO = gl.createVertexArray();
    gl.bindVertexArray(sceneVAO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const BULLET_MAX = BULLET_DRAW_CAP;

    var bulletQuadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletQuadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Bullet wax VAO
    var bulletWaxInstanceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxInstanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, BULLET_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var bulletWaxColorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxColorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, BULLET_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var bulletWaxVAO = gl.createVertexArray();
    gl.bindVertexArray(bulletWaxVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletQuadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxInstanceBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxColorBuf);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    // Glow VAO
    var glowInstanceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glowInstanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, BULLET_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var glowColorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glowColorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, BULLET_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var glowVAO = gl.createVertexArray();
    gl.bindVertexArray(glowVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletQuadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, glowInstanceBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, glowColorBuf);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    // Ship VAO
    var shipInstanceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shipInstanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, SHIP_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var shipTintBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shipTintBuf);
    gl.bufferData(gl.ARRAY_BUFFER, SHIP_MAX * 4 * 4, gl.DYNAMIC_DRAW);

    var shipVAO = gl.createVertexArray();
    gl.bindVertexArray(shipVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletQuadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, shipInstanceBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, shipTintBuf);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    const shipInstanceData = new Float32Array(SHIP_MAX * 4);
    const shipTintData = new Float32Array(SHIP_MAX * 4);

    let shipBodyTex = null;
    let shipBulbTex = null;
    let lastShipBodyImg = null;
    let lastShipBulbImg = null;
    let shipBodyAspect = 1.0;
    let shipBulbAspect = 1.0;

    let _shipRasterCanvas = null;
    let _shipRasterCtx = null;

    function _ensureRasterCanvas(w, h) {
        if (!_shipRasterCanvas) {
            _shipRasterCanvas = document.createElement('canvas');
            _shipRasterCtx = _shipRasterCanvas.getContext('2d');
        }
        if (_shipRasterCanvas.width !== w) _shipRasterCanvas.width = w;
        if (_shipRasterCanvas.height !== h) _shipRasterCanvas.height = h;
        return _shipRasterCtx;
    }

    function ensureShipTextures() {
        if (!shipBodyTex) {
            shipBodyTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, shipBodyTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        if (!shipBulbTex) {
            shipBulbTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, shipBulbTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
    }

    function uploadShipImage(tex, img, prevImg) {
        if (!img || img === prevImg) return prevImg;
        var iw = img.naturalWidth || img.width || 0;
        var ih = img.naturalHeight || img.height || 0;
        if (iw <= 0 || ih <= 0) {
            console.warn('[ship] image has no usable dimensions, skipping upload');
            return prevImg;
        }
        var ctx = _ensureRasterCanvas(iw, ih);
        ctx.clearRect(0, 0, iw, ih);
        ctx.drawImage(img, 0, 0, iw, ih);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _shipRasterCanvas);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        return img;
    }

    // =================================================================
    // Light accumulator FBO
    // =================================================================
    let lightFBO = null;
    let lightTexHandle = null;
    let lightW = 1, lightH = 1;

    function createLightTarget(w, h) {
        const lw = Math.max(1, Math.ceil(w / LIGHT_FBO_SCALE));
        const lh = Math.max(1, Math.ceil(h / LIGHT_FBO_SCALE));
        lightW = lw; lightH = lh;

        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, lw, lh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { fbo, tex };
    }

    function rebuildLightTarget() {
        if (lightFBO) { gl.deleteFramebuffer(lightFBO); lightFBO = null; }
        if (lightTexHandle) { gl.deleteTexture(lightTexHandle); lightTexHandle = null; }
        const t = createLightTarget(canvas.width, canvas.height);
        lightFBO = t.fbo;
        lightTexHandle = t.tex;
    }

    // Light accumulator VAO + buffers
    var lightInstanceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightInstanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_LIGHTS * 4 * 4, gl.DYNAMIC_DRAW);

    var lightColorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightColorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_LIGHTS * 3 * 4, gl.DYNAMIC_DRAW);

    var lightVAO = gl.createVertexArray();
    gl.bindVertexArray(lightVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletQuadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lightInstanceBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, lightColorBuf);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    const lightInstanceData = new Float32Array(MAX_LIGHTS * 4);
    const lightColorData = new Float32Array(MAX_LIGHTS * 3);
    let lightCount = 0;

    // Instance data scratch arrays
    const bulletWaxInstanceData = new Float32Array(BULLET_MAX * 4);
    const bulletWaxColorData = new Float32Array(BULLET_MAX * 4);
    const glowInstanceData = new Float32Array(BULLET_MAX * 4);
    const glowColorData = new Float32Array(BULLET_MAX * 4);
    let bulletWaxCount = 0;
    let glowCount = 0;

    // =================================================================
    // Scene FBOs (double-buffered for reflection)
    // =================================================================
    let sceneFBOs = [null, null];
    let sceneTexs = [null, null];
    let currentSceneIdx = 0;

    let webcamVideo = null;
    let webcamStream = null;
    let webcamReady = false;
    let webcamWanted = false;
    let webcamAspect = 1.0;
    let webcamTex = null;

    function createSceneTarget(w, h) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { fbo, tex };
    }

    function rebuildSceneTargets() {
        if (!program) return;
        for (let i = 0; i < 2; i++) {
            if (sceneFBOs[i]) { gl.deleteFramebuffer(sceneFBOs[i]); sceneFBOs[i] = null; }
            if (sceneTexs[i]) { gl.deleteTexture(sceneTexs[i]); sceneTexs[i] = null; }
        }
        const a = createSceneTarget(canvas.width, canvas.height);
        const b = createSceneTarget(canvas.width, canvas.height);
        sceneFBOs[0] = a.fbo; sceneTexs[0] = a.tex;
        sceneFBOs[1] = b.fbo; sceneTexs[1] = b.tex;
        currentSceneIdx = 0;
    }

    let cachedAspect = 1;
    function resizeCanvas() {
        canvas.width = Math.max(1, window.innerWidth);
        canvas.height = Math.max(1, window.innerHeight);
        cachedAspect = canvas.width / Math.max(1, canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);
        rebuildSceneTargets();
        rebuildLightTarget();

        if (charCanvas) {
            charCanvas.width = canvas.width;
            charCanvas.height = canvas.height;
            charCanvas.style.width = canvas.width + 'px';
            charCanvas.style.height = canvas.height + 'px';
        }
    }

    // =================================================================
    // Webcam
    // =================================================================
    function createWebcamTexture() {
        webcamTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webcamTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function startWebcam() {
        if (webcamStream) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Webcam not supported by this browser');
            state.webcamActive = 0;
            refreshControlsUI();
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                if (!webcamWanted) { stream.getTracks().forEach(t => t.stop()); return; }
                webcamStream = stream;
                webcamVideo = document.createElement('video');
                webcamVideo.srcObject = stream;
                webcamVideo.autoplay = true;
                webcamVideo.playsInline = true;
                webcamVideo.muted = true;
                webcamVideo.addEventListener('loadeddata', () => {
                    if (webcamVideo && webcamVideo.videoWidth > 0) {
                        webcamAspect = webcamVideo.videoWidth / Math.max(1, webcamVideo.videoHeight);
                    }
                    webcamReady = true;
                });
                webcamVideo.play().catch(e => console.warn('webcam play:', e));
            })
            .catch(e => {
                console.warn('webcam getUserMedia:', e);
                state.webcamActive = 0;
                refreshControlsUI();
            });
    }

    function stopWebcam() {
        webcamReady = false;
        if (webcamStream) {
            webcamStream.getTracks().forEach(t => t.stop());
            webcamStream = null;
        }
        if (webcamVideo) {
            try { webcamVideo.pause(); } catch (_) { }
            webcamVideo.srcObject = null;
            webcamVideo = null;
        }
    }

    // =================================================================
    // Blob sim (unchanged from your current main.js — copy verbatim)
    // =================================================================
    let blobs = [];
    let spawnTimer = 0;

    const blobData = new Float32Array(MAX_BLOBS * 4);
    const blobAngleData = new Float32Array(MAX_BLOBS);
    const blobVelData = new Float32Array(MAX_BLOBS * 2);
    let avgRadius = 0.05;

    let prevBlobN = 0;
    let currentBlobN = 0;

    function clampDeformation(b) {
        const tr = b.dxx + b.dyy;
        const det = b.dxx * b.dyy - b.dxy * b.dxy;
        const disc = Math.sqrt(Math.max(0, tr * tr * 0.25 - det));
        let mu1 = tr * 0.5 + disc;
        let mu2 = tr * 0.5 - disc;
        mu1 = clamp(mu1, 0.35, 2.5);
        mu2 = clamp(mu2, 0.35, 2.5);
        let theta;
        if (Math.abs(b.dxy) < 1e-9 && Math.abs(b.dxx - b.dyy) < 1e-9) {
            theta = 0;
        } else {
            theta = 0.5 * Math.atan2(2 * b.dxy, b.dxx - b.dyy);
        }
        const ct = Math.cos(theta), st = Math.sin(theta);
        const ct2 = ct * ct, st2 = st * st, cst = ct * st;
        b.dxx = ct2 * mu1 + st2 * mu2;
        b.dxy = cst * (mu1 - mu2);
        b.dyy = st2 * mu1 + ct2 * mu2;
        b.dxxV = clamp(b.dxxV, -30, 30);
        b.dxyV = clamp(b.dxyV, -30, 30);
        b.dyyV = clamp(b.dyyV, -30, 30);
    }

    function spawnBlob(x, y, rFull, temp, initialR) {
        if (blobs.length >= MAX_BLOBS) return;
        const r0 = initialR !== undefined ? initialR : rFull;
        const v = state.traitVariance;
        const mkv = () => Math.max(0.2, 1 + (Math.random() * 2 - 1) * v);
        blobs.push({
            x: x, y: y,
            vx: rand(-0.02, 0.02),
            vy: rand(0.0, 0.03),
            wanderVx: 0,
            r: Math.max(0.001, r0),
            targetR: Math.max(0.001, rFull),
            temp: temp !== undefined ? temp : 0.6,
            stretch: 1.0,
            stretchAngle: rand(0, 6.2831853),
            dxx: 1, dxy: 0, dyy: 1,
            dxxV: 0, dxyV: 0, dyyV: 0,
            turbX: 0, turbY: 0,
            wanderFreq: rand(0.15, 0.5),
            wanderPhase: rand(0, 6.2831853),
            heatGainMul: mkv(),
            coolingMul: mkv(),
            maxSpeedMul: mkv(),
            wanderMul: mkv(),
            squishMul: mkv(),
            dying: false,
            aliveTime: 0,
        });
    }

    function resetBlobs() {
        blobs.length = 0;
        spawnTimer = 0;
        avgRadius = state.blobSize;
        const asp = cachedAspect;
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));
        for (let i = 0; i < target; i++) {
            const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
            const rC = Math.max(0.008, r);
            spawnBlob(rand(rC, Math.max(rC * 1.1, asp - rC)),
                rand(0.02, 0.55), rC, rand(0.3, 1.0));
        }
    }

    function stepPhysics(dt, t) {
        if (dt <= 0) return;
        const asp = cachedAspect;
        const target = Math.max(1, Math.min(MAX_BLOBS, Math.round(state.blobCount)));

        const poolActive = state.poolActive > 0.5;
        const deathY = -state.deathDepth;
        const spawnY = -0.40;
        const freezeHeatBelowY = poolActive
            ? Math.max(0.10, state.poolLevel + 2 * state.poolSoftness)
            : 0.10;
        const maxLifetime = 25.0;
        const growTime = 0.5;
        const shrinkRate = 12.0;

        const hd = Math.max(0.01, state.heatDepth);
        const neutral = state.tempNeutral;
        const dragK = Math.exp(-state.drag * dt);
        const maxSpBase = Math.max(0.01, state.maxSpeed);
        const turbFreq = state.turbulenceFreq;
        const turbScale = Math.max(0.1, state.turbulenceScale);
        const wallSq = state.wallSquish;
        const wallRest = state.wallRestitution;

        for (let i = 0; i < blobs.length; i++) {
            const b = blobs[i];
            b.aliveTime += dt;
            if (b.y > freezeHeatBelowY) {
                const heatIn = Math.exp(-Math.max(0, b.y) / hd) * state.heatGain * b.heatGainMul;
                b.temp = clamp(b.temp + (heatIn - state.cooling * b.coolingMul) * dt, 0, 1.6);
            }
            b.vy += (b.temp - neutral) * state.buoyancy * dt;

            const wanderDelta = Math.sin(t * b.wanderFreq + b.wanderPhase) * state.wander * b.wanderMul * dt;
            b.vx += wanderDelta;
            b.wanderVx += wanderDelta;

            if (state.turbulence > 0.001) {
                const sc = turbScale;
                const tt = t * turbFreq;
                const k1x = sc * 4.0, k1y = sc * 3.0;
                const k2x = sc * 9.0, k2y = -sc * 7.0;
                const mag1 = Math.sqrt(k1x * k1x + k1y * k1y);
                const mag2 = Math.sqrt(k2x * k2x + k2y * k2y);
                const p1 = k1x * b.x + k1y * b.y + tt * 1.1;
                const p2 = k2x * b.x + k2y * b.y + tt * 1.9;
                const c1 = Math.cos(p1);
                const c2 = Math.cos(p2);
                const tx = (k1y / mag1) * c1 + 0.5 * (k2y / mag2) * c2;
                const ty = -(k1x / mag1) * c1 - 0.5 * (k2x / mag2) * c2;
                b.vx += tx * state.turbulence * dt;
                b.vy += ty * state.turbulence * dt;
                b.turbX = tx;
                b.turbY = ty;
            } else {
                b.turbX = 0;
                b.turbY = 0;
            }
        }

        for (let i = 0; i < blobs.length; i++) {
            for (let j = i + 1; j < blobs.length; j++) {
                const a = blobs[i], b = blobs[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 1e-8) continue;
                const d = Math.sqrt(d2);
                const sumR = a.r + b.r;
                const nx = dx / d, ny = dy / d;

                if (state.cohesion > 0.001 && d < sumR * state.cohesionRange) {
                    const u = d / (sumR * state.cohesionRange);
                    const pull = (1 - u) * state.cohesion * dt;
                    a.vx += nx * pull; a.vy += ny * pull;
                    b.vx -= nx * pull; b.vy -= ny * pull;
                }
                if (state.repelStrength > 0.001 && d < sumR * state.repelRange) {
                    const u = d / (sumR * state.repelRange);
                    const push = (1 - u) * state.repelStrength * dt;
                    a.vx -= nx * push; a.vy -= ny * push;
                    b.vx += nx * push; b.vy += ny * push;
                }
            }
        }

        const SPRING_K = 30;
        const SPRING_D = 7;

        for (let i = blobs.length - 1; i >= 0; i--) {
            const b = blobs[i];
            b.vx *= dragK;
            b.vy *= dragK;
            b.wanderVx *= dragK;

            const maxSp = maxSpBase * b.maxSpeedMul;
            const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (sp > maxSp) {
                const scale = maxSp / sp;
                b.vx *= scale; b.vy *= scale; b.wanderVx *= scale;
            }

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            const margin = Math.min(b.r * 0.3, asp * 0.35);

            if (b.x < margin) {
                const vImpact = Math.abs(b.vx);
                b.x = margin;
                if (b.vx < 0) {
                    b.vx = -b.vx * wallRest;
                    b.wanderVx *= 0.5;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dyyV += kick;
                    b.dxxV -= kick;
                }
            }
            if (b.x > asp - margin) {
                const vImpact = Math.abs(b.vx);
                b.x = asp - margin;
                if (b.vx > 0) {
                    b.vx = -b.vx * wallRest;
                    b.wanderVx *= 0.5;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dyyV += kick;
                    b.dxxV -= kick;
                }
            }
            if (b.y > 0.97) {
                const vImpact = Math.abs(b.vy);
                b.y = 0.97;
                if (b.vy > 0) {
                    b.vy = -b.vy * wallRest;
                    const kick = Math.min(1, vImpact / 0.3) * wallSq * 0.8;
                    b.dxxV += kick;
                    b.dyyV -= kick;
                }
            }

            if (!b.dying) {
                if (b.aliveTime > maxLifetime && b.temp > 0.01) b.temp = 0;
                if (b.aliveTime > 0.5 && b.y < deathY && b.vy < 0) b.dying = true;
            }

            if (b.dying) {
                b.r *= Math.exp(-shrinkRate * dt);
                if (b.r < 0.004) {
                    blobs.splice(i, 1);
                    continue;
                }
            } else if (b.r < b.targetR) {
                b.r = Math.min(b.targetR, b.r + (b.targetR / growTime) * dt);
            }

            if (!b.dying) {
                let txx = 1, txy = 0, tyy = 1;

                const svx = b.vx - b.wanderVx;
                const svy = b.vy;
                const svSp = Math.sqrt(svx * svx + svy * svy);
                if (svSp > 0.005) {
                    const vs = Math.min(1, svSp / 0.30) * state.squish * b.squishMul * 0.3;
                    const ux = svx / svSp, uy = svy / svSp;
                    txx += vs * ux * ux;
                    txy += vs * ux * uy;
                    tyy += vs * uy * uy;
                }

                if (wallSq > 0.001) {
                    const wr = b.r * 1.8;
                    if (b.x < wr) { const u = 1 - b.x / wr; tyy += u * u * wallSq; }
                    if (asp - b.x < wr) { const u = 1 - (asp - b.x) / wr; tyy += u * u * wallSq; }
                    if (0.97 - b.y < wr) { const u = 1 - (0.97 - b.y) / wr; txx += u * u * wallSq; }
                }

                const tdet = txx * tyy - txy * txy;
                if (tdet > 0.05) {
                    const n = 1 / Math.sqrt(tdet);
                    txx *= n; txy *= n; tyy *= n;
                }

                if (state.turbulence > 0.001) {
                    const tm = Math.sqrt(b.turbX * b.turbX + b.turbY * b.turbY);
                    if (tm > 0.001) {
                        const tnx = b.turbX / tm, tny = b.turbY / tm;
                        const kick = state.turbulence * dt * 25.0;
                        b.dxxV += kick * tnx * tnx;
                        b.dxyV += kick * tnx * tny;
                        b.dyyV += kick * tny * tny;
                    }
                }

                b.dxxV += (txx - b.dxx) * SPRING_K * dt;
                b.dxyV += (txy - b.dxy) * SPRING_K * dt;
                b.dyyV += (tyy - b.dyy) * SPRING_K * dt;
                const damp = Math.exp(-SPRING_D * dt);
                b.dxxV *= damp; b.dxyV *= damp; b.dyyV *= damp;
                b.dxx += b.dxxV * dt;
                b.dxy += b.dxyV * dt;
                b.dyy += b.dyyV * dt;

                clampDeformation(b);

                const tr = b.dxx + b.dyy;
                const det2 = b.dxx * b.dyy - b.dxy * b.dxy;
                const disc2 = Math.sqrt(Math.max(0, tr * tr * 0.25 - det2));
                const mu1 = Math.max(0.01, tr * 0.5 + disc2);
                const mu2 = Math.max(0.01, tr * 0.5 - disc2);
                b.stretch = clamp(Math.sqrt(mu1 / mu2), 1.0, 2.5);
                b.stretchAngle = 0.5 * Math.atan2(2 * b.dxy, b.dxx - b.dyy);
            }
        }

        if (blobs.length < target) {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = 1.0 / Math.max(0.1, state.spawnRate);
                const maxBatch = Math.max(1, Math.round(state.spawnBatch));
                const batch = 1 + Math.floor(Math.random() * maxBatch);
                for (let s = 0; s < batch && blobs.length < target; s++) {
                    const r = state.blobSize * (1 + (Math.random() * 2 - 1) * state.blobSizeVar);
                    const rClamped = Math.max(0.008, r);
                    spawnBlob(rand(rClamped, Math.max(rClamped * 1.1, asp - rClamped)),
                        spawnY, rClamped, 0.9, 0.001);
                }
            }
        } else {
            spawnTimer = 0;
        }
    }

    function uploadBlobs() {
        const n = Math.min(blobs.length, MAX_BLOBS);
        let targetSum = 0;
        for (let i = 0; i < n; i++) {
            const b = blobs[i];
            blobData[i * 4 + 0] = b.x;
            blobData[i * 4 + 1] = b.y;
            blobData[i * 4 + 2] = b.r;
            blobData[i * 4 + 3] = b.stretch;
            blobAngleData[i] = b.stretchAngle;
            blobVelData[i * 2 + 0] = b.vx;
            blobVelData[i * 2 + 1] = b.vy;
            targetSum += b.targetR;
        }
        if (prevBlobN > n) {
            blobData.fill(0, n * 4, prevBlobN * 4);
            blobAngleData.fill(0, n, prevBlobN);
            blobVelData.fill(0, n * 2, prevBlobN * 2);
        }
        const targetAvg = n > 0 ? targetSum / n : state.blobSize;
        avgRadius += (targetAvg - avgRadius) * 0.08;
        currentBlobN = Math.max(n, prevBlobN);
        prevBlobN = n;
    }

    // =================================================================
    // Bullet/light/glow gather functions
    // (Your existing implementations — copy verbatim.)
    // =================================================================
    function fillBulletInstances(style, instArr, colArr, startCount, isGlowPass) {
        let count = (typeof startCount === 'number' && isFinite(startCount)) ? startCount : 0;
        if (!window.LavaProjectile || !window.LavaProjectile.forEachActiveByStyle) return count;
        window.LavaProjectile.forEachActiveByStyle(style, function (p) {
            if (count >= BULLET_MAX) return;
            if (!p || !p.def) return;
            let alpha = window.LavaProjectile.bulletAlpha(p);
            if (!isFinite(alpha)) alpha = 1;
            let radiusMul = 1.0;
            if (isGlowPass && p.def.renderStyle === 'wax') {
                alpha *= 1.0;
                radiusMul = state.bulletGlowRadius;
            }
            const instBase = count * 4;
            instArr[instBase + 0] = p.x;
            instArr[instBase + 1] = p.y;
            instArr[instBase + 2] = ((p.def.radius != null) ? p.def.radius : 0.01) * radiusMul;
            instArr[instBase + 3] = alpha;
            const rgb = window.LavaProjectile.hexToRgb(p.def.color);
            const colBase = count * 4;
            colArr[colBase + 0] = rgb[0];
            colArr[colBase + 1] = rgb[1];
            colArr[colBase + 2] = rgb[2];
            colArr[colBase + 3] = (isGlowPass && p.def.renderStyle === 'wax') ? 2.0 : ((p.def.useDefColor) ? 1.0 : 0.0);
            count++;
        });
        return count;
    }

    const playerLightPosData = new Float32Array(MAX_PLAYER_LIGHTS * 2);
    const playerLightColorData = new Float32Array(MAX_PLAYER_LIGHTS * 3);
    let playerLightCount = 0;

    function gatherPlayerLights() {
        const players = window.LavaCharacter ? LavaCharacter.getPlayers() : [];
        playerLightCount = Math.min(players.length, MAX_PLAYER_LIGHTS);
        for (let i = 0; i < playerLightCount; i++) {
            const p = players[i];
            playerLightPosData[i * 2] = p.x;
            playerLightPosData[i * 2 + 1] = p.y;
            const colHex = (p.playerTypeIdx === 1) ? state.charColorPlayer2 : state.charColorPlayer1;
            const rgb = hexToRgb(colHex);
            playerLightColorData[i * 3] = rgb[0];
            playerLightColorData[i * 3 + 1] = rgb[1];
            playerLightColorData[i * 3 + 2] = rgb[2];
        }
    }

    function uploadPlayerLightUniforms() {
        const posLoc = activeUniforms.playerLightPos;
        if (posLoc) gl.uniform2fv(posLoc, playerLightPosData);
        const colLoc = activeUniforms.playerLightColor;
        if (colLoc) gl.uniform3fv(colLoc, playerLightColorData);
        set1i('playerLightCount', playerLightCount);
        set1f('playerLightRadius', Math.max(0.02, state.charPlayerLightRadius || 0.25));
        set1f('playerLightStrength', state.charPlayerLightStrength || 1.5);
    }

    function uploadSharedShadingUniforms(t) {
        set1f('time', t);
        set1f('aspect', cachedAspect);

        setColor('waxA', state.waxColorA);
        setColor('waxB', state.waxColorB);
        setColor('waxGlowColor', state.waxGlowColor);
        set1f('waxGlow', state.waxGlow);
        setColor('sssColor', state.sssColor);
        set1f('sssStrength', state.sssStrength);
        set1f('sssFalloff', Math.max(0.05, state.sssFalloff));
        setColor('bgTop', state.bgTop);
        setColor('bgBottom', state.bgBottom);
        set1f('lampGlow', state.lampGlow);
        set1f('glowRadius', state.glowRadius);
        setColor('glowColor', state.glowColor);
        set1f('halo', state.halo);
        set1f('haloWidth', Math.max(0.1, state.haloWidth));
        setLightDirUniform();
        setColor('specColor', state.specColor);
        set1f('specStrength', state.specStrength);
        set1f('specSharp', state.specSharp);
        set1f('softSpecStrength', state.softSpecStrength);
        set1f('softSpecSharp', Math.max(1, state.softSpecSharp));
        setColor('reflectColor', state.reflectColor);
        set1f('reflectStrength', state.reflectStrength);
        set1f('reflectWidth', Math.max(0.1, state.reflectWidth));
        set1f('reflectF0', state.reflectF0);
        set1f('reflectPow', state.reflectPow);
        set1f('sceneRoughness', state.sceneRoughness);
        set1f('rimStrength', state.rimStrength);
        set1f('ambient', state.ambient);
        set1f('diffuse', state.diffuse);
        set1f('bump', state.bump);
        set1f('edgeSoft', state.edgeSoft);
        set1f('translucency', state.translucency);
        set1f('translucencyBias', state.translucencyBias);
        set1f('fieldThreshold', Math.max(0.01, state.fieldThreshold));
        set1f('webcamActive', webcamIsLive ? 1 : 0);
        set1f('webcamBgMix', state.webcamBgMix);
        set1f('webcamReflectMix', state.webcamReflectMix);
        set1f('webcamAspect', webcamAspect);
        set1f('webcamInvertReflect', state.webcamInvertReflect ? 1 : 0);
        set1f('webcamRoughness', state.webcamRoughness);
        set1f('webcamParallax', state.webcamParallax);
        set1f('refractionStrength', state.refractionStrength);
        set1i('reflectionTex', 0);
        set1i('webcamTex', 1);
        set1i('lightTex', 2);
        set1f('extraLightStrength', state.extraLightStrength != null ? state.extraLightStrength : 0.8);
    }

    let webcamIsLive = false;

    function renderWaxBullets(t) {
        if (!bulletWaxProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexs[1 - currentSceneIdx]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, webcamTex);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, lightTexHandle);
        bulletWaxCount = fillBulletInstances('wax', bulletWaxInstanceData, bulletWaxColorData, 0, false);
        if (bulletWaxCount === 0) return;
        useProgram(bulletWaxProgram, bulletWaxUniforms, bulletWaxCache, false);
        uploadSharedShadingUniforms(t);
        uploadPlayerLightUniforms();
        gl.bindVertexArray(bulletWaxVAO);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxInstanceBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, bulletWaxInstanceData, 0, bulletWaxCount * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, bulletWaxColorBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, bulletWaxColorData, 0, bulletWaxCount * 4);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, bulletWaxCount);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
    }

    function renderWaxBulletGlow(t) {
        if (!glowProgram) return;
        glowCount = fillBulletInstances('wax', glowInstanceData, glowColorData, 0, true);
        if (glowCount === 0) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.viewport(0, 0, canvas.width, canvas.height);
        useProgram(glowProgram, glowUniforms, glowCache, false);
        set1f('aspect', cachedAspect);
        set1f('glowBrightness', state.glowBrightness);
        gl.bindVertexArray(glowVAO);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.bindBuffer(gl.ARRAY_BUFFER, glowInstanceBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowInstanceData, 0, glowCount * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, glowColorBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowColorData, 0, glowCount * 4);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, glowCount);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        activeProgram = null; activeUniforms = null; activeCache = null;
    }

    function renderGlowOverlay(t) {
        if (!glowProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        let count = fillBulletInstances('glow', glowInstanceData, glowColorData, 0, false);
        count = appendPlayerGlows(glowInstanceData, glowColorData, count);
        if (count === 0) return;
        useProgram(glowProgram, glowUniforms, glowCache, false);
        set1f('aspect', cachedAspect);
        set1f('glowBrightness', state.glowBrightness);
        gl.bindVertexArray(glowVAO);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.bindBuffer(gl.ARRAY_BUFFER, glowInstanceBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowInstanceData, 0, count * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, glowColorBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowColorData, 0, count * 4);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        activeProgram = null; activeUniforms = null; activeCache = null;
    }

    function appendPlayerGlows(instArr, colArr, startCount) {
        const players = window.LavaCharacter ? LavaCharacter.getPlayers() : [];
        const glowRadius = state.bulbGlowRadius || 0.18;
        const glowAlpha = state.bulbGlowBrightness || 0.0;
        if (glowAlpha <= 0) return startCount;
        const bulbOffsetFrac = (state.bulbGlowOffset != null) ? state.bulbGlowOffset : 0.15;
        const bulbColor = state.charBulbGlowColor || "#ffcc44";
        const rgb = hexToRgb(bulbColor);
        let count = startCount;
        for (let i = 0; i < players.length && count < BULLET_MAX; i++) {
            const p = players[i];
            if (p.lives <= 1) continue;
            let pSize = 0.028;
            if (window.LavaCharacter && window.LavaCharacter.playerSize) {
                const sz = window.LavaCharacter.playerSize(p);
                if (sz > 0) pSize = sz;
            }
            const bulbOffset = bulbOffsetFrac * pSize;
            let upX = 0, upY = 1;
            if (window.LavaCharacter && LavaCharacter.sdfAt) {
                const s = LavaCharacter.sdfAt(p.x, p.y);
                if (s && (s.nx !== 0 || s.ny !== 0)) { upX = s.nx; upY = s.ny; }
            }
            const i4 = count * 4;
            instArr[i4] = p.x + upX * bulbOffset;
            instArr[i4 + 1] = p.y + upY * bulbOffset;
            instArr[i4 + 2] = glowRadius;
            instArr[i4 + 3] = glowAlpha;
            const i3 = count * 4;
            colArr[i3] = rgb[0]; colArr[i3 + 1] = rgb[1]; colArr[i3 + 2] = rgb[2];
            colArr[i3 + 3] = 0.0;
            count++;
        }
        return count;
    }

    function gatherLights() {
        lightCount = 0;
        if (!window.LavaProjectile) return;
        window.LavaProjectile.forEachActive(function (p) {
            if (lightCount >= MAX_LIGHTS) return;
            if (!p.def.emitsLight) return;
            const radius = (p.def.lightRadius != null) ? p.def.lightRadius : 0.15;
            const strength = (p.def.lightStrength != null) ? p.def.lightStrength : 1.0;
            if (radius <= 0 || strength <= 0) return;
            const i4 = lightCount * 4;
            lightInstanceData[i4] = p.x;
            lightInstanceData[i4 + 1] = p.y;
            lightInstanceData[i4 + 2] = radius;
            lightInstanceData[i4 + 3] = strength;
            const colHex = p.def.lightColor || p.def.color || '#ffffff';
            const rgb = window.LavaProjectile.hexToRgb(colHex);
            const i3 = lightCount * 3;
            lightColorData[i3] = rgb[0];
            lightColorData[i3 + 1] = rgb[1];
            lightColorData[i3 + 2] = rgb[2];
            lightCount++;
        });
    }

    function renderLightAccumulator() {
        if (!lightProgram || !lightFBO) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, lightFBO);
        gl.viewport(0, 0, lightW, lightH);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gatherLights();
        if (lightCount === 0) {
            activeProgram = null; activeUniforms = null; activeCache = null;
            return;
        }
        gl.useProgram(lightProgram);
        gl.uniform1f(lightUniforms.aspect, cachedAspect);
        gl.bindVertexArray(lightVAO);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);
        gl.bindBuffer(gl.ARRAY_BUFFER, lightInstanceBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, lightInstanceData, 0, lightCount * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, lightColorBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, lightColorData, 0, lightCount * 3);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lightCount);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        activeProgram = null; activeUniforms = null; activeCache = null;
    }

    function renderPostProcess() {
        if (!postProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(postProgram);
        gl.bindVertexArray(sceneVAO);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexs[currentSceneIdx]);
        gl.uniform1i(postUniformsLocs.inputTex, 0);
        const c = postCache;
        if (c.saturation !== state.saturation) { gl.uniform1f(postUniformsLocs.saturation, state.saturation); c.saturation = state.saturation; }
        if (c.brightness !== state.brightness) { gl.uniform1f(postUniformsLocs.brightness, state.brightness); c.brightness = state.brightness; }
        if (c.contrast !== state.contrast) { gl.uniform1f(postUniformsLocs.contrast, state.contrast); c.contrast = state.contrast; }
        if (c.colorPow !== state.colorPow) { gl.uniform1f(postUniformsLocs.colorPow, state.colorPow); c.colorPow = state.colorPow; }
        if (c.vignetteRadius !== state.vignetteRadius) { gl.uniform1f(postUniformsLocs.vignetteRadius, state.vignetteRadius); c.vignetteRadius = state.vignetteRadius; }
        if (c.vignetteSoft !== state.vignetteSoft) { gl.uniform1f(postUniformsLocs.vignetteSoft, state.vignetteSoft); c.vignetteSoft = state.vignetteSoft; }
        if (c.vignetteColor !== state.vignetteColor) {
            const rgb = hexToRgb(state.vignetteColor);
            gl.uniform3f(postUniformsLocs.vignetteColor, rgb[0], rgb[1], rgb[2]);
            c.vignetteColor = state.vignetteColor;
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
        activeProgram = null; activeUniforms = null; activeCache = null;
    }

    function renderShips(t) {
        if (!shipProgram) return;
        if (!window.LavaCharacter || !window.LavaCharacter.getShipRenderList) return;
        if (!window.GFXAssets) return;

        var ships = window.LavaCharacter.getShipRenderList();
        if (ships.length === 0) return;

        ensureShipTextures();

        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(shipProgram);
        gl.bindVertexArray(shipVAO);

        gl.uniform1f(shipUniforms.aspect, cachedAspect);
        gl.uniform1f(shipUniforms.extraLightStrength,
            state.extraLightStrength != null ? state.extraLightStrength : 0.8);

        // Bind the light accumulator to unit 1
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, lightTexHandle);
        gl.uniform1i(shipUniforms.lightTex, 1);

        // Bind the previous scene frame to unit 2 for environment reflection
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexs[1 - currentSceneIdx]);
        gl.uniform1i(shipUniforms.reflectionTex, 2);

        var count = 0;
        for (var i = 0; i < ships.length; i++) {
            var sh = ships[i];

            if (sh.bodyAsset && sh.bodyAsset.count > 0) {
                var img = window.GFXAssets.getFrame(sh.bodyAsset, sh.bodyFramePct);
                lastShipBodyImg = uploadShipImage(shipBodyTex, img, lastShipBodyImg);
                if (img) {
                    var iw = img.naturalWidth || img.width || 1;
                    var ih = img.naturalHeight || img.height || 1;
                    shipBodyAspect = iw / Math.max(1, ih);
                }



                // // --- DEBUG CODE START ---
                // if (!window._shipDebugDone && img) {
                //     window._shipDebugDone = true;
                //     console.log('Ship texture:', img.naturalWidth, '×', img.naturalHeight, 'aspect:', shipBodyAspect);

                //     // Dump the rasterised canvas to a new tab
                //     var dataUrl = _shipRasterCanvas.toDataURL('image/png');
                //     var win = window.open();
                //     if (win) {
                //         win.document.write('<title>Rasterized Ship Canvas</title><p>This is exactly what is being uploaded to WebGL:</p><img src="' + dataUrl + '" style="border:1px solid red; background:#333;">');
                //     }
                // }
                // // --- DEBUG CODE END ---




                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, shipBodyTex);
                gl.uniform1i(shipUniforms.avatarTex, 0);
                gl.uniform1f(shipUniforms.avatarAspect, shipBodyAspect);

                var tint = hexToRgb(sh.tintHex);
                var upAngle = Math.atan2(sh.upY, sh.upX) - Math.PI * 0.5;

                var alpha = sh.invuln ? 0.6 : 1.0;
                var iBase = count * 4;
                shipInstanceData[iBase + 0] = sh.x;
                shipInstanceData[iBase + 1] = sh.y;
                shipInstanceData[iBase + 2] = sh.size * 0.5;
                shipInstanceData[iBase + 3] = alpha;
                shipTintData[iBase + 0] = tint[0];
                shipTintData[iBase + 1] = tint[1];
                shipTintData[iBase + 2] = tint[2];
                shipTintData[iBase + 3] = upAngle;

                gl.bindBuffer(gl.ARRAY_BUFFER, shipInstanceBuf);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, shipInstanceData, iBase, 4);
                gl.bindBuffer(gl.ARRAY_BUFFER, shipTintBuf);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, shipTintData, iBase, 4);
                gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1);
                count++;

                if (sh.bulbAsset && sh.bulbAsset.count > 0 && count < SHIP_MAX) {
                    var bulbImg = window.GFXAssets.getFrame(sh.bulbAsset, 0);
                    lastShipBulbImg = uploadShipImage(shipBulbTex, bulbImg, lastShipBulbImg);
                    if (bulbImg) {
                        var biw = bulbImg.naturalWidth || bulbImg.width || 1;
                        var bih = bulbImg.naturalHeight || bulbImg.height || 1;
                        shipBulbAspect = biw / Math.max(1, bih);
                    }
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, shipBulbTex);
                    gl.uniform1i(shipUniforms.avatarTex, 0);
                    gl.uniform1f(shipUniforms.avatarAspect, shipBulbAspect);

                    var ox = sh.x + sh.upX * sh.bulbOffsetPx;
                    var oy = sh.y + sh.upY * sh.bulbOffsetPx;

                    var bBase = count * 4;
                    shipInstanceData[bBase + 0] = ox;
                    shipInstanceData[bBase + 1] = oy;
                    shipInstanceData[bBase + 2] = sh.bulbSizePx * 0.5;
                    shipInstanceData[bBase + 3] = alpha;
                    shipTintData[bBase + 0] = 1.0;
                    shipTintData[bBase + 1] = 1.0;
                    shipTintData[bBase + 2] = 1.0;
                    shipTintData[bBase + 3] = upAngle;

                    gl.bindBuffer(gl.ARRAY_BUFFER, shipInstanceBuf);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, shipInstanceData, bBase, 4);
                    gl.bindBuffer(gl.ARRAY_BUFFER, shipTintBuf);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, shipTintData, bBase, 4);
                    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1);
                    count++;
                }
            }
        }

        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        gl.activeTexture(gl.TEXTURE0);

        activeProgram = null;
        activeUniforms = null;
        activeCache = null;
    }

    // =================================================================
    // Text projectile draw (score popups, "1up", etc.)
    // =================================================================
    function drawTextProjectiles(ctx, env) {
        if (!window.LavaProjectile || !window.LavaProjectile.forEachActiveByStyle) return;

        var canvas = ctx.canvas;
        var W = canvas.width, H = canvas.height;
        var asp = W / H;

        var fontSize = Math.max(14, H * 0.015);

        ctx.save();
        ctx.font = 'bold ' + fontSize.toFixed(1) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        window.LavaProjectile.forEachActiveByStyle('string', function (p) {
            if (!p.textString) return;

            var px = (p.x / asp) * W;
            var py = (1 - p.y) * H;

            ctx.globalAlpha = window.LavaProjectile.bulletAlpha(p);
            ctx.fillStyle = p.textColor || '#ffffff';
            ctx.fillText(p.textString, px, py);
        });

        ctx.restore();
    }

    // =================================================================
    // render() — the full frame pass
    // =================================================================
    function render(t) {
        gatherPlayerLights();
        renderLightAccumulator();
        gl.clearColor(0, 0, 0, 1);

        const wantDebug = state.debugMode ? 1 : 0;
        const sceneProgram = (wantDebug === 1 && debugProgram) ? debugProgram : program;
        const sceneUniformSet = (wantDebug === 1 && debugProgram) ? debugUniforms : uniforms;
        const sceneCacheRef = (wantDebug === 1 && debugProgram) ? debugCache : sceneCache;
        useProgram(sceneProgram, sceneUniformSet, sceneCacheRef, wantDebug === 1);

        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBOs[currentSceneIdx]);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindVertexArray(sceneVAO);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexs[1 - currentSceneIdx]);
        set1i('reflectionTex', 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, webcamTex);
        webcamIsLive = false;
        if (webcamWanted && webcamReady && webcamVideo && webcamVideo.readyState >= 2) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webcamVideo);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            if (webcamVideo.videoWidth > 0) {
                webcamAspect = webcamVideo.videoWidth / Math.max(1, webcamVideo.videoHeight);
            }
            webcamIsLive = true;
        }
        set1i('webcamTex', 1);
        set1f('webcamActive', webcamIsLive ? 1 : 0);
        set1f('webcamBgMix', state.webcamBgMix);
        set1f('webcamReflectMix', state.webcamReflectMix);
        set1f('webcamAspect', webcamAspect);
        set1f('webcamInvertReflect', state.webcamInvertReflect ? 1 : 0);
        set1f('webcamRoughness', state.webcamRoughness);
        set1f('webcamParallax', state.webcamParallax);
        set1f('refractionStrength', state.refractionStrength);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, lightTexHandle);
        set1i('lightTex', 2);
        set1f('extraLightStrength', state.extraLightStrength != null ? state.extraLightStrength : 0.8);

        set1f('time', t);
        if (currentBlobN > 0) {
            if (activeUniforms.blobs) gl.uniform4fv(activeUniforms.blobs, blobData, 0, currentBlobN * 4);
            if (activeUniforms.blobAngles) gl.uniform1fv(activeUniforms.blobAngles, blobAngleData, 0, currentBlobN);
            if (activeUniforms.blobVelocities) gl.uniform2fv(activeUniforms.blobVelocities, blobVelData, 0, currentBlobN * 2);
        }

        set1f('aspect', cachedAspect);
        set1f('blobRadiusAvg', avgRadius);
        set1f('fieldThreshold', Math.max(0.01, state.fieldThreshold));
        set1f('cohesionRange', state.cohesionRange);
        set1f('repelRange', state.repelRange);

        set1f('poolActive', state.poolActive ? 1 : 0);
        set1f('poolLevel', state.poolLevel);
        set1f('poolSoftness', Math.max(0.002, state.poolSoftness));
        set1f('poolWave', state.poolWave);
        set1f('poolWaveSpeed', state.poolWaveSpeed);

        setColor('waxA', state.waxColorA);
        setColor('waxB', state.waxColorB);
        setColor('waxGlowColor', state.waxGlowColor);
        set1f('waxGlow', state.waxGlow);
        setColor('sssColor', state.sssColor);
        set1f('sssStrength', state.sssStrength);
        set1f('sssFalloff', Math.max(0.05, state.sssFalloff));
        setColor('bgTop', state.bgTop);
        setColor('bgBottom', state.bgBottom);
        set1f('lampGlow', state.lampGlow);
        set1f('glowRadius', state.glowRadius);
        setColor('glowColor', state.glowColor);
        set1f('halo', state.halo);
        set1f('haloWidth', Math.max(0.1, state.haloWidth));
        set1f('glassCurve', state.glassCurve);
        setLightDirUniform();
        setColor('specColor', state.specColor);
        set1f('specStrength', state.specStrength);
        set1f('specSharp', state.specSharp);
        set1f('softSpecStrength', state.softSpecStrength);
        set1f('softSpecSharp', Math.max(1, state.softSpecSharp));
        setColor('reflectColor', state.reflectColor);
        set1f('reflectStrength', state.reflectStrength);
        set1f('reflectWidth', Math.max(0.1, state.reflectWidth));
        set1f('reflectF0', state.reflectF0);
        set1f('reflectPow', state.reflectPow);
        set1f('sceneRoughness', state.sceneRoughness);
        set1f('rimStrength', state.rimStrength);
        set1f('ambient', state.ambient);
        set1f('diffuse', state.diffuse);
        set1f('bump', state.bump);
        set1f('edgeSoft', state.edgeSoft);
        set1f('translucency', state.translucency);
        set1f('translucencyBias', state.translucencyBias);

        uploadPlayerLightUniforms();

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        renderWaxBulletGlow(t);
        renderWaxBullets(t);
        renderShips(t);
        renderPostProcess();
        renderGlowOverlay(t);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        currentSceneIdx = 1 - currentSceneIdx;
    }

    // =================================================================
    // Boot the runtime
    // =================================================================
    createWebcamTexture();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    resetBlobs();

    var lastFrameTime = 0;
    var rafHandle = 0;
    let scaledTime = 0;

    function animate(now) {
        if (__destroyed) return;

        const wantCam = !!state.webcamActive;
        if (wantCam !== webcamWanted) {
            webcamWanted = wantCam;
            if (webcamWanted) startWebcam();
            else stopWebcam();
        }

        // Transition & auto-morph — copy from your current main.js (unchanged)

        var frameInterval = 1000 / Math.max(1, state.targetFPS);
        if (now - lastFrameTime >= frameInterval) {
            const dtReal = lastFrameTime ? (now - lastFrameTime) / 1000 : 0.016;
            lastFrameTime = now;
            if (!state.freezeTime) {
                const dt = Math.min(dtReal, 0.05) * state.timeScale;
                if (dt > 0) {
                    scaledTime += dt;
                    stepPhysics(dt, scaledTime);
                }
            }
            uploadBlobs();
            render(scaledTime);
            if (window.LavaCharacter && charCtx) {
                const charEnv = {
                    blobs: blobs,
                    aspect: cachedAspect,
                    time: scaledTime,
                    state: state,
                };
                const charDt = state.freezeTime ? 0 : Math.min(dtReal, 0.05);
                window.LavaCharacter.updateAll(charDt, charEnv);

                charCtx.clearRect(0, 0, charCanvas.width, charCanvas.height);
                window.LavaCharacter.drawAll(charCtx, charEnv);

                // ← add this line
                drawTextProjectiles(charCtx, charEnv);
            }
        }
        rafHandle = requestAnimationFrame(animate);
        window.animationFrameId = rafHandle;
    }
    // =================================================================
    // UI — control building, preset dropdown, event handlers
    // =================================================================
    let controlEls = {};

    function buildControlsUI() {
        const list = document.getElementById("controls-list");
        if (!list) return;
        list.innerHTML = "";
        controlEls = {};

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
                cb.style.gridColumn = "2 / 4";
                cb.style.justifySelf = "start";
                cb.style.margin = "0";
                cb.addEventListener("change", () => {
                    state[key] = cb.checked ? 1 : 0;
                });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    cb.checked = !!c.def;
                });

                row.appendChild(label);
                row.appendChild(cb);
                row.appendChild(resetBtn);
                container.appendChild(row);
                controlEls[key] = { checkbox: cb };
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
                colorInput.style.gridColumn = "2 / 4";
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
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    colorInput.value = c.def;
                });

                row.appendChild(label);
                row.appendChild(colorInput);
                row.appendChild(resetBtn);
                container.appendChild(row);
                controlEls[key] = { color: colorInput };
                return;
            }

            if (c.special === 'text') {
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

                const textInput = document.createElement("input");
                textInput.type = "text";
                textInput.value = current;
                textInput.dataset.key = key;
                textInput.style.gridColumn = "2 / 4";
                textInput.style.width = "100%";
                textInput.style.boxSizing = "border-box";
                textInput.style.fontFamily = "monospace";
                textInput.addEventListener("input", () => { state[key] = textInput.value; });

                const resetBtn = document.createElement("button");
                resetBtn.className = "reset-btn";
                resetBtn.textContent = "↺";
                resetBtn.style.gridColumn = "4";
                resetBtn.addEventListener("click", () => {
                    state[key] = c.def;
                    textInput.value = c.def;
                });

                row.appendChild(label);
                row.appendChild(textInput);
                row.appendChild(resetBtn);
                container.appendChild(row);
                controlEls[key] = { text: textInput };
                return;
            }

            if (c.special === 'button') {
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

                const btn = document.createElement("button");
                btn.className = "reset-btn";
                btn.textContent = c.buttonText || "Add";
                btn.style.gridColumn = "2 / 5";
                btn.style.justifySelf = "start";
                btn.style.padding = "2px 10px";
                btn.addEventListener("click", () => {
                    if (typeof c.action === "function") {
                        try { c.action(state); } catch (e) { console.warn('button action:', e); }
                    }
                    refreshControlsUI();
                });

                row.appendChild(label);
                row.appendChild(btn);
                container.appendChild(row);
                return;
            }

            if (c.special === 'subheading') {
                const row = document.createElement("div");
                row.className = "ctrl-row";
                row.style.gridColumn = "1 / -1";
                row.style.marginTop = "10px";
                row.style.marginBottom = "4px";
                row.style.paddingTop = "6px";
                row.style.borderTop = "1px solid #444";
                row.style.fontWeight = "bold";
                row.style.fontSize = "0.95em";
                row.style.opacity = "0.85";
                row.style.color = "#ccc";
                row.textContent = c.label || "";
                container.appendChild(row);
                return;
            }

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
            controlEls[key] = { slider, number };
        }

        CONTROLS.forEach((group, gi) => {
            const { head, indicator } = makeHeading(group.heading, gi === 0, group);
            const body = document.createElement("div");
            body.className = "ctrl-group-body";

            let initialCollapsed = !group.openByDefault;
            try {
                const saved = JSON.parse(localStorage.getItem("lavalampCtrlGroupsCollapsed") || "{}");
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
                    const map = JSON.parse(localStorage.getItem("lavalampCtrlGroupsCollapsed") || "{}");
                    map[group.heading] = body.classList.contains("collapsed");
                    localStorage.setItem("lavalampCtrlGroupsCollapsed", JSON.stringify(map));
                } catch (_) { }
            });

            list.appendChild(head);
            list.appendChild(body);
        });
    }

    function refreshControlsUI() {
        Object.keys(DEFAULTS).forEach(key => {
            const els = controlEls[key];
            if (!els) return;
            const v = state[key];
            const isInt = !!INT_KEYS[key];
            const c = CONTROL_BY_KEY[key];
            if (!c) return;
            if (els.slider) {
                els.slider.min = c.min;
                els.slider.max = c.max;
                els.slider.step = c.step;
                els.slider.value = isInt ? Math.round(v) : v;
            }
            if (els.number) {
                els.number.step = c.step;
                els.number.value = isInt ? String(Math.round(v)) : fmtVal(v);
            }
            if (els.checkbox) els.checkbox.checked = !!v;
            if (els.color) {
                if (document.activeElement !== els.color) els.color.value = v;
            }
            if (els.text && document.activeElement !== els.text) els.text.value = v;
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
            if (BOOL_KEYS[k]) {
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
                resetBlobs();
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

    rafHandle = requestAnimationFrame(animate);
    window.animationFrameId = rafHandle;

    window.__lavalampApp = {
        destroy() {
            __destroyed = true;
            if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            Object.keys(CONTROL_BY_KEY).forEach(k => { delete CONTROL_BY_KEY[k]; });
            blobs.length = 0;
            stopWebcam();
            if (webcamTex) { gl.deleteTexture(webcamTex); webcamTex = null; }
            if (shipBodyTex) { gl.deleteTexture(shipBodyTex); shipBodyTex = null; }
            if (shipBulbTex) { gl.deleteTexture(shipBulbTex); shipBulbTex = null; }
            for (let i = 0; i < 2; i++) {
                if (sceneFBOs[i]) gl.deleteFramebuffer(sceneFBOs[i]);
                if (sceneTexs[i]) gl.deleteTexture(sceneTexs[i]);
            }
            if (debugProgram) gl.deleteProgram(debugProgram);
            if (program) gl.deleteProgram(program);
            if (bulletWaxProgram) gl.deleteProgram(bulletWaxProgram);
            if (glowProgram) gl.deleteProgram(glowProgram);
            if (shipProgram) gl.deleteProgram(shipProgram);
            if (postProgram) gl.deleteProgram(postProgram);
            if (sceneVAO) gl.deleteVertexArray(sceneVAO);
            if (bulletWaxVAO) gl.deleteVertexArray(bulletWaxVAO);
            if (glowVAO) gl.deleteVertexArray(glowVAO);
            if (shipVAO) gl.deleteVertexArray(shipVAO);
            if (quadBuf) gl.deleteBuffer(quadBuf);
            if (bulletQuadBuf) gl.deleteBuffer(bulletQuadBuf);
            if (bulletWaxInstanceBuf) gl.deleteBuffer(bulletWaxInstanceBuf);
            if (bulletWaxColorBuf) gl.deleteBuffer(bulletWaxColorBuf);
            if (glowInstanceBuf) gl.deleteBuffer(glowInstanceBuf);
            if (glowColorBuf) gl.deleteBuffer(glowColorBuf);
            if (shipInstanceBuf) gl.deleteBuffer(shipInstanceBuf);
            if (shipTintBuf) gl.deleteBuffer(shipTintBuf);
            if (lightInstanceBuf) gl.deleteBuffer(lightInstanceBuf);
            if (lightColorBuf) gl.deleteBuffer(lightColorBuf);
            if (lightVAO) gl.deleteVertexArray(lightVAO);
            if (lightFBO) gl.deleteFramebuffer(lightFBO);
            if (lightTexHandle) gl.deleteTexture(lightTexHandle);
            if (lightProgram) gl.deleteProgram(lightProgram);
            if (window.LavaCharacter) {
                try { window.LavaCharacter.destroyAll(); } catch (e) { console.warn('character teardown:', e); }
            }
            if (charCanvas && charCanvas.parentNode) charCanvas.parentNode.removeChild(charCanvas);
            charCanvas = null; charCtx = null;
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

// Expose main globally so loader.js can call it
window.main = main;