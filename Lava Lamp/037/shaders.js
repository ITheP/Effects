// shaders.js
// All GLSL source strings for the lava lamp. Loaded by loader.js before
// main.js. Exposes window.__lavaShaders — an object with every assembled
// shader source, ready for gl.shaderSource().
//
// Two structural constants are baked in as string-literal array sizes:
//   MAX_BLOBS        — number of wax blobs uploaded to the shader
//   MAX_PLAYER_LIGHTS — number of simultaneous player lights
// If you change them in main.js, change them here too.
(function () {
'use strict';

var MAX_BLOBS = 64;
var MAX_PLAYER_LIGHTS = 4;

// ------------------------------------------------------------------
// Shared precision header
// ------------------------------------------------------------------
var precisionAndIO = `
precision highp float;
precision highp int;
out vec4 fragColor;
`;

// ------------------------------------------------------------------
// Shared uniforms (used by main, debug, wax bullet, ship shaders)
// ------------------------------------------------------------------
var sharedUniforms = `
uniform sampler2D reflectionTex;
uniform sampler2D webcamTex;
uniform float webcamActive;
uniform float webcamBgMix;
uniform float webcamReflectMix;
uniform float webcamAspect;
uniform float webcamRoughness;
uniform float webcamParallax;
uniform float webcamInvertReflect;
uniform float refractionStrength;

uniform float aspect;

uniform vec3  waxA;
uniform vec3  waxB;
uniform vec3  waxGlowColor;
uniform float waxGlow;
uniform vec3  sssColor;
uniform float sssStrength;
uniform float sssFalloff;

uniform vec3  bgTop;
uniform vec3  bgBottom;
uniform float lampGlow;
uniform float glowRadius;
uniform vec3  glowColor;
uniform float halo;
uniform float haloWidth;

uniform vec2  lightDir;
uniform vec3  specColor;
uniform float specStrength;
uniform float specSharp;
uniform float softSpecStrength;
uniform float softSpecSharp;
uniform vec3  reflectColor;
uniform float reflectStrength;
uniform float reflectWidth;
uniform float reflectF0;
uniform float reflectPow;
uniform float sceneRoughness;
uniform float rimStrength;
uniform float ambient;
uniform float diffuse;
uniform float bump;
uniform float edgeSoft;
uniform float translucency;
uniform float translucencyBias;

uniform float fieldThreshold;
uniform float time;

uniform vec2  playerLightPos[${MAX_PLAYER_LIGHTS}];
uniform vec3  playerLightColor[${MAX_PLAYER_LIGHTS}];
uniform int   playerLightCount;
uniform float playerLightRadius;
uniform float playerLightStrength;

uniform sampler2D lightTex;
uniform float extraLightStrength;
`;

// ------------------------------------------------------------------
// Shared functions (used by main, debug, wax bullet, ship shaders)
// ------------------------------------------------------------------
var sharedFunctions = `
vec2 coverUV(vec2 uv, float screenAspect, float videoAspect) {
    if (screenAspect > videoAspect) {
        return vec2(uv.x, (uv.y - 0.5) * (videoAspect / screenAspect) + 0.5);
    } else {
        return vec2((uv.x - 0.5) * (screenAspect / videoAspect) + 0.5, uv.y);
    }
}

vec3 backgroundAt(vec2 uv, float f, float mask) {
    vec3 bg = mix(bgBottom, bgTop, clamp(uv.y, 0.0, 1.0));
    if (webcamActive > 0.5) {
        vec2 camBgUV = coverUV(uv, aspect, webcamAspect);
        vec3 camBg = texture(webcamTex, camBgUV).rgb;
        bg = mix(bg, camBg, webcamBgMix);
    }
    vec2 p = vec2(uv.x * aspect, uv.y);
    vec2 lampPos = vec2(aspect * 0.5, -0.05);
    float gd = length(p - lampPos);
    float glow = exp(-gd / max(glowRadius, 0.02));
    bg += glowColor * glow * lampGlow;

    for (int i = 0; i < ${MAX_PLAYER_LIGHTS}; i++) {
        if (i >= playerLightCount) break;
        float d = length(p - playerLightPos[i]);
        float falloff = exp(-d / max(playerLightRadius, 0.02));
        bg += playerLightColor[i] * falloff * playerLightStrength * 0.30;
    }

    float haloF = clamp(f / max(fieldThreshold, 0.01), 0.0, 1.0);
    float haloTerm = pow(haloF, max(haloWidth, 0.1)) * (1.0 - mask) * halo;
    bg += waxGlowColor * haloTerm;
    return bg;
}

vec3 computeNormal(float f, vec2 grad, float radius) {
    float fc = max(f, fieldThreshold + 1e-4);
    float tH = max(0.0, 1.0 - fieldThreshold / fc);
    float hN = sqrt(max(tH, 1e-4));
    float dhdf = fieldThreshold / (2.0 * fc * fc * hN);
    dhdf = min(dhdf, 400.0);
    vec2 slope = grad * dhdf * radius;
    return normalize(vec3(-slope * bump, 1.0));
}

vec3 shadeWax(vec3 N, vec3 waxBase, float f, float transmission, float mask,
              vec2 screenUV, vec2 mirrorUV, vec2 refractUV) {
    vec3 L = normalize(vec3(lightDir, 0.80));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float ndl = max(dot(N, L), 0.0);
    float ndh = max(dot(N, H), 0.0);
    float spec = pow(ndh, max(specSharp, 1.0)) * specStrength;
    float softSpec = pow(ndh, max(softSpecSharp, 1.0)) * softSpecStrength;
    float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);

    vec2 worldP = vec2(screenUV.x * aspect, screenUV.y);

    vec3 waxLit = waxBase * (ambient + diffuse * ndl);

    vec3 bulbColor = waxGlowColor * exp(-max(worldP.y, 0.0) * 4.0);
    waxLit += bulbColor * waxGlow * 0.35;

    for (int i = 0; i < ${MAX_PLAYER_LIGHTS}; i++) {
        if (i >= playerLightCount) break;
        float d = length(worldP - playerLightPos[i]);
        float falloff = exp(-d / max(playerLightRadius, 0.02));
        waxLit += playerLightColor[i] * falloff * playerLightStrength * 0.35;
    }

    waxLit += specColor * spec;

    waxLit += specColor * softSpec * waxBase;
    waxLit += mix(waxBase, vec3(1.0), 0.5) * rim * rimStrength * 0.5;

    float bulbL = exp(-max(worldP.y, 0.0) * 4.0);
    float bulbFacing = max(0.0, -N.y);
    waxLit += sssColor * bulbFacing * transmission * bulbL * sssStrength;
    waxLit += mix(sssColor, waxBase, 0.4) * transmission * rim * sssStrength * 0.4;

    for (int i = 0; i < ${MAX_PLAYER_LIGHTS}; i++) {
        if (i >= playerLightCount) break;
        vec2 toLight = playerLightPos[i] - worldP;
        float d = length(toLight);
        float falloff = exp(-d / max(playerLightRadius, 0.02));
        vec2 dir2 = toLight / max(d, 1e-4);
        vec3 lightDir3D = normalize(vec3(dir2, 0.5));
        float facing = max(0.0, dot(N, lightDir3D));
        waxLit += playerLightColor[i] * facing * transmission * falloff
                * playerLightStrength * sssStrength;
    }

    waxLit += texture(lightTex, screenUV).rgb * extraLightStrength;

    float Nz = clamp(N.z, 0.0, 1.0);
    float F0 = max(reflectF0, 0.001);
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - Nz, max(reflectPow, 1.0));

    vec3 sceneReflected;
    if (sceneRoughness > 0.001) {
        float r = sceneRoughness * 0.012;
        vec2 du = vec2(r / aspect, 0.0);
        vec2 dv = vec2(0.0, r);
        vec3 s = texture(reflectionTex, mirrorUV).rgb;
        s += texture(reflectionTex, mirrorUV + du).rgb;
        s += texture(reflectionTex, mirrorUV - du).rgb;
        s += texture(reflectionTex, mirrorUV + dv).rgb;
        s += texture(reflectionTex, mirrorUV - dv).rgb;
        sceneReflected = s * 0.2;
    } else {
        sceneReflected = texture(reflectionTex, mirrorUV).rgb;
    }
    waxLit += sceneReflected * reflectColor * fresnel * reflectStrength;

    if (webcamActive > 0.5) {
        vec2 mirrorOffset = vec2(N.x / aspect, N.y) * (reflectWidth * 0.06);
        vec2 camOffset = ((webcamInvertReflect > 0.5) ? -mirrorOffset : mirrorOffset) * webcamParallax;
        vec2 camUV = screenUV + camOffset;
        vec3 camReflected;
        if (webcamRoughness > 0.001) {
            float r = webcamRoughness * 0.012;
            vec2 du = vec2(r / aspect, 0.0);
            vec2 dv = vec2(0.0, r);
            vec3 s = texture(webcamTex, coverUV(camUV, aspect, webcamAspect)).rgb;
            s += texture(webcamTex, coverUV(camUV + du, aspect, webcamAspect)).rgb;
            s += texture(webcamTex, coverUV(camUV - du, aspect, webcamAspect)).rgb;
            s += texture(webcamTex, coverUV(camUV + dv, aspect, webcamAspect)).rgb;
            s += texture(webcamTex, coverUV(camUV - dv, aspect, webcamAspect)).rgb;
            camReflected = s * 0.2;
        } else {
            camReflected = texture(webcamTex, coverUV(camUV, aspect, webcamAspect)).rgb;
        }
        waxLit += camReflected * reflectColor * fresnel * webcamReflectMix;
    }

    vec3 bgRefract = backgroundAt(refractUV, f, mask);

    float transAlpha = translucency * 0.5;
    float thickness = max(0.0, (f - fieldThreshold) / max(fieldThreshold, 0.01));
    float thickFactor = mix(1.0, 1.0 / (1.0 + thickness * 2.0), translucencyBias);
    transAlpha *= thickFactor;
    transAlpha = clamp(transAlpha, 0.0, 0.9);

    return waxLit * (1.0 - transAlpha) + bgRefract * transAlpha;
}
`;

// ------------------------------------------------------------------
// Main scene shader (also used, with #define DEBUG 1, for the debug pass)
// ------------------------------------------------------------------
var mainUniforms = `
in vec2 v_texCoord;

uniform vec4  blobs[${MAX_BLOBS}];
uniform float blobAngles[${MAX_BLOBS}];
uniform vec2  blobVelocities[${MAX_BLOBS}];
uniform float blobRadiusAvg;
uniform float cohesionRange;
uniform float repelRange;

uniform float poolActive;
uniform float poolLevel;
uniform float poolSoftness;
uniform float poolWave;
uniform float poolWaveSpeed;

uniform float glassCurve;
`;

var mainFunctions = `
float lineDist(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
    return length(pa - ba * h);
}
`;

var mainBody = `
void main() {
    vec2 p = vec2(v_texCoord.x * aspect, v_texCoord.y);

    float fadeHi = poolActive > 0.5 ? poolLevel : 0.02;
    float fadeLo = fadeHi - 0.15;

    #ifdef DEBUG
    {
        vec3 dbg = vec3(0.03, 0.04, 0.06);

        if (poolActive > 0.5) {
            float surf = poolLevel;
            if (p.y < surf) {
                float band = smoothstep(surf - 0.03, surf, p.y);
                dbg = mix(dbg, vec3(0.10, 0.05, 0.02), band);
            }
            if (abs(p.y - surf) < 0.0015) dbg = vec3(0.9, 0.5, 0.15);
        }

        if (mod(p.x - aspect * 0.5, 0.1) < 0.0012 || mod(p.y - 0.5, 0.1) < 0.0012) {
            dbg += vec3(0.03);
        }

        if (poolActive > 0.5) {
            if (abs(p.y - fadeLo) < 0.0008) dbg = vec3(0.3, 0.2, 0.0);
            if (abs(p.y - fadeHi) < 0.0008) dbg = vec3(0.5, 0.3, 0.0);
        }

        {
            float fdbg = 0.0;
            if (poolActive > 0.5) {
                float tW = time * poolWaveSpeed;
                float ph = poolWave * (0.6 * sin(p.x * 7.0 + tW * 0.55)
                                     + 0.4 * sin(p.x * 13.0 - tW * 0.90));
                float surf = poolLevel - poolSoftness * 2.07944 + ph;
                float dm   = max(p.y - surf, 0.0);
                float soft = max(poolSoftness, 0.001);
                fdbg += 8.0 * exp(-dm / soft);
            }
            for (int i = 0; i < ${MAX_BLOBS}; i++) {
                vec4 b = blobs[i];
                if (b.z < 1e-5) continue;
                float yFade = smoothstep(fadeLo, fadeHi, b.y);
                if (yFade < 0.001) continue;
                float sy  = max(b.w, 1.0);
                float ang = blobAngles[i];
                float ca = cos(ang), sa = sin(ang);
                vec2 q  = p - b.xy;
                vec2 qr = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca);
                vec2 qt = vec2(qr.x / sy, qr.y * sy);
                float d2 = dot(qt, qt) + 1e-4;
                fdbg += (b.z * b.z * yFade) / d2;
            }
            float isoDist = abs(fdbg - fieldThreshold);
            float isoW    = max(0.003, fieldThreshold * 0.03);
            float isoLine = 1.0 - smoothstep(0.0, isoW, isoDist);
            dbg = mix(dbg, vec3(0.5, 0.5, 0.5), isoLine);
        }

        for (int i = 0; i < ${MAX_BLOBS}; i++) {
            vec4 b = blobs[i];
            if (b.z < 1e-5) continue;
            float yFade = smoothstep(fadeLo, fadeHi, b.y);

            float sy = max(b.w, 1.0);
            float ang = blobAngles[i];
            float ca = cos(ang), sa = sin(ang);
            vec2 q = p - b.xy;
            vec2 qr = vec2(q.x*ca + q.y*sa, -q.x*sa + q.y*ca);
            vec2 qt = vec2(qr.x/sy, qr.y*sy);
            float d = length(qt) - b.z;

            float fill = (1.0 - smoothstep(-0.003, 0.003, d)) * yFade;
            dbg = mix(dbg, vec3(0.15, 0.35, 0.70), fill * 0.40);

            float outline = (1.0 - smoothstep(0.0, 0.004, abs(d))) * yFade;
            dbg = mix(dbg, vec3(0.55, 0.85, 1.0), outline);

            float cd = (1.0 - smoothstep(0.0, 0.005, length(q))) * yFade;
            dbg = mix(dbg, vec3(1.0, 0.3, 0.3), cd);

            vec2 vel = blobVelocities[i];
            float vLen = length(vel);
            if (vLen > 0.003) {
                vec2 vDir = vel / vLen;
                float drawLen = min(vLen * 5.0, 0.15);
                vec2 la = b.xy;
                vec2 lb = b.xy + vDir * drawLen;
                if (lineDist(p, la, lb) < 0.0025) {
                    dbg = mix(dbg, vec3(0.3, 1.0, 0.3), yFade);
                }
            }

            float axisLen = b.z * sy;
            vec2 aDir = vec2(cos(ang), sin(ang));
            vec2 aa = b.xy - aDir * axisLen;
            vec2 ab = b.xy + aDir * axisLen;
            if (lineDist(p, aa, ab) < 0.0018) {
                dbg = mix(dbg, vec3(1.0, 0.9, 0.0), yFade);
            }

            float cohRing = b.z * 2.0 * cohesionRange;
            if (abs(length(q) - cohRing) < 0.0025) {
                dbg = mix(dbg, vec3(1.0, 0.3, 1.0), yFade * 0.85);
            }
            float repRing = b.z * 2.0 * repelRange;
            if (abs(length(q) - repRing) < 0.0025) {
                dbg = mix(dbg, vec3(1.0, 0.55, 0.1), yFade * 0.85);
            }
        }

        fragColor = vec4(dbg, 1.0);
        return;
    }
    #endif

    float f = 0.0;
    vec2  grad = vec2(0.0);

    if (poolActive > 0.5) {
        float tW = time * poolWaveSpeed;
        float ph = poolWave * (0.6 * sin(p.x * 7.0 + tW * 0.55)
                             + 0.4 * sin(p.x * 13.0 - tW * 0.90));
        float phP = poolWave * (0.6 * 7.0 * cos(p.x * 7.0 + tW * 0.55)
                              + 0.4 * 13.0 * cos(p.x * 13.0 - tW * 0.90));
        float surf = poolLevel - poolSoftness * 2.07944 + ph;
        float dm = max(p.y - surf, 0.0);
        float soft = max(poolSoftness, 0.001);
        float pf = 8.0 * exp(-dm / soft);
        f += pf;
        grad += vec2((pf / soft) * phP, -pf / soft);
    }

    for (int i = 0; i < ${MAX_BLOBS}; i++) {
        vec4 b = blobs[i];
        if (b.z < 1e-5) continue;
        float yFade = smoothstep(fadeLo, fadeHi, b.y);
        if (yFade < 0.001) continue;

        float sy = max(b.w, 1.0);
        float ang = blobAngles[i];
        float ca = cos(ang);
        float sa = sin(ang);

        vec2 q = p - b.xy;
        vec2 qr = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca);
        vec2 qt = vec2(qr.x / sy, qr.y * sy);

        float d2 = dot(qt, qt) + 1e-4;
        float r2 = b.z * b.z * yFade;
        float fi = r2 / d2;
        f += fi;

        vec2 d2dq = 2.0 * vec2(
            qt.x * ca / sy - qt.y * sa * sy,
            qt.x * sa / sy + qt.y * ca * sy
        );
        grad += -(r2 / (d2 * d2)) * d2dq;
    }

    float mask = smoothstep(fieldThreshold - edgeSoft, fieldThreshold + edgeSoft, f);
    vec3 N = computeNormal(f, grad, blobRadiusAvg);

    float ht = clamp(p.y * 0.85 + 0.15 * sin(p.x * 2.5 + time * 0.35), 0.0, 1.0);
    vec3 wax = mix(waxA, waxB, ht);

    float waxDepth = max(0.0, (f - fieldThreshold) / max(fieldThreshold, 0.01));
    float transmission = exp(-waxDepth * max(sssFalloff, 0.05));

    vec2 mirrorOffset = vec2(N.x / aspect, N.y) * (reflectWidth * 0.06);
    vec2 mirrorUV = v_texCoord + mirrorOffset;
    vec2 refractUV = v_texCoord - vec2(N.x / aspect, N.y) * (refractionStrength * 0.06);

    vec3 waxWithBG = shadeWax(N, wax, f, transmission, mask, v_texCoord, mirrorUV, refractUV);

    vec3 bgBase = backgroundAt(v_texCoord, f, mask);
    vec3 col = mix(bgBase, waxWithBG, mask);

    float gx = abs(v_texCoord.x - 0.5) * 2.0;
    col *= 1.0 - glassCurve * gx * gx * gx;

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// Assembled main + debug:
var fragmentShaderSourceMain =
    '#version 300 es\n' +
    precisionAndIO + sharedUniforms + sharedFunctions +
    mainUniforms + mainFunctions + mainBody;

var fragmentShaderSourceDebug =
    '#version 300 es\n#define DEBUG 1\n' +
    precisionAndIO + sharedUniforms + sharedFunctions +
    mainUniforms + mainFunctions + mainBody;

// ------------------------------------------------------------------
// Wax bullet shader
// ------------------------------------------------------------------
var waxBulletVaryings = `
in vec2 v_local;
in vec2 v_worldPos;
in float v_radius;
in vec4 v_color;
in float v_alpha;
`;

var waxBulletBody = `
void main() {
    vec2 q = v_local * v_radius;
    float r2 = v_radius * v_radius;
    float d2 = dot(q, q) + r2 * 0.001;
    float f = r2 / d2;

    float mask = smoothstep(fieldThreshold - edgeSoft, fieldThreshold + edgeSoft, f);
    if (mask < 0.001) discard;

    vec2 grad = -2.0 * r2 * q / (d2 * d2);
    vec3 N = computeNormal(f, grad, v_radius);

    vec2 screenUV = vec2(v_worldPos.x / aspect, v_worldPos.y);

    float waxDepth = max(0.0, (f - fieldThreshold) / max(fieldThreshold, 0.01));
    float transmission = exp(-waxDepth * max(sssFalloff, 0.05));

    vec2 mirrorOffset = vec2(N.x / aspect, N.y) * (reflectWidth * 0.06);
    vec2 mirrorUV = screenUV + mirrorOffset;
    vec2 refractUV = screenUV - vec2(N.x / aspect, N.y) * (refractionStrength * 0.06);

    float ht = clamp(v_worldPos.y * 0.85 + 0.15 * sin(v_worldPos.x * 2.5 + time * 0.35), 0.0, 1.0);
    vec3 sceneWax = mix(waxA, waxB, ht);

    vec3 waxBase = mix(sceneWax, v_color.rgb, v_color.w);
    vec3 wax = shadeWax(N, waxBase, f, transmission, mask, screenUV, mirrorUV, refractUV);

    float alpha = mask * v_alpha;
    fragColor = vec4(wax * alpha, alpha);
}
`;

var fragmentShaderSourceBulletWax =
    '#version 300 es\n' +
    precisionAndIO + sharedUniforms + sharedFunctions +
    waxBulletVaryings + waxBulletBody;

// ------------------------------------------------------------------
// Ship shader
// ------------------------------------------------------------------
var shipVaryings = `
in vec2 v_local;
in vec2 v_worldPos;
in vec4 v_tint;
in float v_alpha;
in vec2 v_uv;
`;

var shipBody = `
void main() {
    vec4 tex = texture(avatarTex, v_uv);
    if (tex.a < 0.01) discard;

    vec3 base = tex.rgb * 0.4;
    vec3 tintedHighlight = mix(vec3(1.0), v_tint.rgb, 0.7);
    vec3 shade = base + (base * tintedHighlight * 0.5);

    vec2 normal2D = v_local;
    vec2 mirrorUV = vec2(v_worldPos.x / aspect, v_worldPos.y) - normal2D * 0.02;

    vec3 envColor = texture(reflectionTex, mirrorUV).rgb;
    float fresnel = pow(1.0 - abs(v_local.y), 2.0);
    shade += envColor * fresnel * 0.8 * mix(vec3(1.0), v_tint.rgb, 0.5);

    vec2 lightUV = vec2(v_worldPos.x / aspect, v_worldPos.y);
    shade += texture(lightTex, lightUV).rgb * extraLightStrength;

    float rim = pow(1.0 - abs(v_local.x) * 0.7 - abs(v_local.y) * 0.3, 2.0);
    shade += tintedHighlight * rim * 0.2;

    float a = tex.a * v_alpha;
    fragColor = vec4(shade * a, a);
}
`;

var fragmentShaderSourceShip =
    '#version 300 es\n' +
    precisionAndIO +
    'uniform sampler2D avatarTex;\n' +
    'uniform sampler2D lightTex;\n' +
    'uniform sampler2D reflectionTex;\n' +
    'uniform float aspect;\n' +
    'uniform float extraLightStrength;\n' +
    shipVaryings + shipBody;

// ------------------------------------------------------------------
// Post-process shader
// ------------------------------------------------------------------
var postUniforms = `
in vec2 v_texCoord;
uniform sampler2D inputTex;
uniform float saturation;
uniform float brightness;
uniform float contrast;
uniform float colorPow;
uniform float vignetteRadius;
uniform float vignetteSoft;
uniform vec3  vignetteColor;
`;

var postBody = `
void main() {
    vec3 col = texture(inputTex, v_texCoord).rgb;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, saturation);
    col *= brightness;
    col = pow(max(col, vec3(0.0001)), vec3(contrast));
    col = pow(max(col, vec3(0.0001)), vec3(colorPow));

    vec2 vUv = v_texCoord - 0.5;
    float vr = length(vUv);
    float vg = smoothstep(vignetteRadius, vignetteRadius + vignetteSoft, vr);
    col = mix(col, vignetteColor, vg);

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

var fragmentShaderSourcePost =
    '#version 300 es\n' +
    precisionAndIO + postUniforms + postBody;

// ------------------------------------------------------------------
// Light accumulator shader (additive low-res FBO)
// ------------------------------------------------------------------
var lightVertexSource = `#version 300 es
in vec2 position;
in vec4 a_light;
in vec3 a_color;
out vec2 v_local;
out vec3 v_color;
out float v_strength;
uniform float aspect;
void main() {
    vec2 worldOffset = position * a_light.z * 4.0;
    vec2 worldPos = a_light.xy + worldOffset;
    v_local = position * 4.0;
    v_color = a_color;
    v_strength = a_light.w;
    vec2 clip = vec2((worldPos.x / aspect) * 2.0 - 1.0, worldPos.y * 2.0 - 1.0);
    gl_Position = vec4(clip, 0.0, 1.0);
}
`;

var lightFragmentSource = `#version 300 es
precision highp float;
in vec2 v_local;
in vec3 v_color;
in float v_strength;
out vec4 fragColor;
void main() {
    float r = length(v_local);
    float window = 1.0 - smoothstep(2.0, 4.0, r);
    float falloff = exp(-r) * v_strength * window;
    if (falloff < 0.001) discard;
    fragColor = vec4(v_color * falloff, falloff);
}
`;

// ------------------------------------------------------------------
// Glow shader (bullet halos, ship bulb, sparks)
// ------------------------------------------------------------------
var glowVaryings = `
in vec2 v_local;
in vec4 v_color;
in float v_alpha;
`;

var glowBody = `
void main() {
    float r = length(v_local);
    float intensity = exp(-r * r * 4.0) * glowBrightness;
    float a = intensity * v_alpha;
    if (a < 0.001) discard;
    fragColor = vec4(v_color.rgb * a, a);
}
`;

var fragmentShaderSourceGlow =
    '#version 300 es\n' +
    precisionAndIO +
    'uniform float glowBrightness;\n' +
    glowVaryings + glowBody;

// ------------------------------------------------------------------
// Vertex shaders (shared + per-program)
// ------------------------------------------------------------------
var vertexShaderSource = `#version 300 es
in vec2 position;
out vec2 v_texCoord;
void main() {
    v_texCoord = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

var bulletWaxVertexSource = `#version 300 es
in vec2 position;
in vec4 a_instance;
in vec4 a_color;
out vec2 v_local;
out vec2 v_worldPos;
out float v_radius;
out vec4 v_color;
out float v_alpha;
uniform float aspect;
void main() {
    vec2 worldOffset = position * a_instance.z * 1.5;
    v_worldPos = a_instance.xy + worldOffset;
    v_local = position * 1.5;
    v_radius = a_instance.z;
    v_color = a_color;
    v_alpha = a_instance.w;
    vec2 clip = vec2((v_worldPos.x / aspect) * 2.0 - 1.0, v_worldPos.y * 2.0 - 1.0);
    gl_Position = vec4(clip, 0.0, 1.0);
}
`;

var glowVertexSource = `#version 300 es
in vec2 position;
in vec4 a_instance;
in vec4 a_color;
out vec2 v_local;
out vec4 v_color;
out float v_alpha;
uniform float aspect;
void main() {
    vec2 worldOffset = position * a_instance.z * 1.5;
    vec2 worldPos = a_instance.xy + worldOffset;
    v_local = position;
    v_color = a_color;
    v_alpha = a_instance.w;
    vec2 clip = vec2((worldPos.x / aspect) * 2.0 - 1.0, worldPos.y * 2.0 - 1.0);
    gl_Position = vec4(clip, 0.0, 1.0);
}
`;

var shipVertexSource = `#version 300 es
in vec2 position;
in vec4 a_instance;   // x, y, halfHeight, alpha
in vec4 a_tint;       // r, g, b, upAngle
out vec2 v_local;
out vec2 v_worldPos;
out vec4 v_tint;
out float v_alpha;
out vec2 v_uv;
uniform float aspect;
uniform float avatarAspect;
void main() {
    float upAngle = a_tint.w;
    float ca = cos(upAngle);
    float sa = sin(upAngle);

    vec2 local = vec2(position.x * a_instance.z, (position.y + 1.0) * a_instance.z);
    local.x *= avatarAspect;

    vec2 rotated = vec2(
        local.x * ca - local.y * sa,
        local.x * sa + local.y * ca
    );

    vec2 worldPos = a_instance.xy + rotated;
    v_worldPos = worldPos;
    v_local = position;
    v_tint = vec4(a_tint.rgb, 1.0);
    v_alpha = a_instance.w;
    v_uv = position * 0.5 + 0.5;

    vec2 clip = vec2((worldPos.x / aspect) * 2.0 - 1.0, worldPos.y * 2.0 - 1.0);
    gl_Position = vec4(clip, 0.0, 1.0);
}
`;

// ------------------------------------------------------------------
// Export
// ------------------------------------------------------------------
window.__lavaShaders = {
    // Assembled fragment shaders
    fragmentShaderSourceMain:     fragmentShaderSourceMain,
    fragmentShaderSourceDebug:    fragmentShaderSourceDebug,
    fragmentShaderSourceBulletWax: fragmentShaderSourceBulletWax,
    fragmentShaderSourceShip:     fragmentShaderSourceShip,
    fragmentShaderSourcePost:     fragmentShaderSourcePost,
    fragmentShaderSourceGlow:     fragmentShaderSourceGlow,

    // Vertex shaders
    vertexShaderSource:    vertexShaderSource,
    bulletWaxVertexSource: bulletWaxVertexSource,
    glowVertexSource:      glowVertexSource,
    shipVertexSource:      shipVertexSource,
    lightVertexSource:     lightVertexSource,
    lightFragmentSource:   lightFragmentSource,
};

})();