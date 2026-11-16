// main.presets.js
// Built-in preset definitions. Loaded by loader.js before main.js.
// Exposes window.__lavaPresets. User presets from localStorage are
// merged by main.js at runtime.
(function () {
'use strict';

var PRESETS = [
    { name: "Default", iteration: 1, values: {} },
    {
        "name": "Preset 24", "iteration": 24, "values": {
            "poolLevel": 0.126, "sssColor": "#d00b46", "sssStrength": 3, "sssFalloff": 0.99,
            "reflectStrength": 0.73, "reflectWidth": 1.2, "translucency": 1.84, "translucencyBias": 1,
            "halo": 0.42, "haloWidth": 4.4
        }
    },
    {
        "name": "Preset 25", "iteration": 25, "values": {
            "cohesion": 1.58, "cohesionRange": 1.85, "repelStrength": 2.4, "repelRange": 0.79,
            "poolSoftness": 0.034, "waxColorA": "#fff700", "waxColorB": "#ff0000", "waxGlow": 2.88,
            "waxGlowColor": "#0400ff", "sssColor": "#04ff00", "sssStrength": 2.21, "sssFalloff": 0.64,
            "lightAngle": -1.62159, "specStrength": 1.62, "specColor": "#c72dd2", "reflectStrength": 0.73,
            "reflectColor": "#0048ff", "rimStrength": 1.03, "diffuse": 0.69, "edgeSoft": 0.545,
            "translucency": 1.72, "translucencyBias": 0.8, "bgTop": "#00f531", "bgBottom": "#f104dd",
            "lampGlow": 0.57, "glowRadius": 0.4, "glowColor": "#cc0000", "halo": 0.82, "haloWidth": 0.5, "contrast": 1.2
        }
    },
    {
        "name": "Vampire Bites", "iteration": 26, "values": {
            "timeScale": 0.15, "traitVariance": 1, "squish": 0.73, "turbulence": 0.58,
            "turbulenceScale": 3.02, "wallSquish": 2.73, "poolLevel": 0.126, "poolSoftness": 0.107,
            "waxColorA": "#ff2200", "waxColorB": "#e00000", "waxGlowColor": "#ff0000", "sssColor": "#ff004c",
            "sssStrength": 3, "sssFalloff": 0.99, "reflectStrength": 0.61, "reflectWidth": 8,
            "translucency": 1.84, "translucencyBias": 1, "halo": 0.42, "haloWidth": 4.4
        }
    },
    {
        "name": "Cloud City", "iteration": 26, "values": {
            "timeScale": 0.15, "traitVariance": 1, "squish": 0.73, "turbulence": 0.58,
            "turbulenceScale": 3.02, "wallSquish": 2.73, "poolLevel": 0.126, "poolSoftness": 0.107,
            "waxColorA": "#ffffff", "waxColorB": "#0096e0", "waxGlowColor": "#ff0000", "sssColor": "#ff004c",
            "sssStrength": 3, "sssFalloff": 0.99, "reflectStrength": 0.61, "reflectWidth": 8,
            "translucency": 1.84, "translucencyBias": 1, "bgTop": "#28e2d5", "bgBottom": "#b2f0c3",
            "halo": 0.42, "haloWidth": 4.4
        }
    },
    {
        "name": "Milky Milky", "iteration": 27, "values": {
            "timeScale": 0.15, "blobSize": 0.072, "traitVariance": 0.37, "heatGain": 1.86,
            "squish": 0.73, "turbulence": 0.73, "turbulenceFreq": 2.42, "turbulenceScale": 2.53,
            "wallSquish": 2.73, "fieldThreshold": 0.59, "cohesion": 1.21, "cohesionRange": 1.52,
            "repelStrength": 1.8, "repelRange": 0.91, "poolLevel": 0.126, "poolSoftness": 0.018,
            "waxColorA": "#ffffff", "waxColorB": "#ffffff", "waxGlowColor": "#2f2323", "sssColor": "#e5e28f",
            "sssStrength": 3, "sssFalloff": 0.99, "lightAngle": -1.87159, "specStrength": 0,
            "specSharp": 24, "softSpecStrength": 0.33, "softSpecSharp": 19.5, "reflectStrength": 0,
            "reflectWidth": 0.5, "translucency": 1.39, "translucencyBias": 1, "bgTop": "#ffffff",
            "bgBottom": "#fdffe5", "lampGlow": 2.1, "glowRadius": 0.4, "glowColor": "#190f0a",
            "halo": 0.42, "haloWidth": 4.4
        }
    },
    {
        "name": "Bluedrops", "iteration": 27, "values": {
            "timeScale": 0.15, "blobSize": 0.047, "blobSizeVar": 0.4, "traitVariance": 0.37,
            "heatGain": 1.86, "squish": 0.73, "turbulence": 0.73, "turbulenceFreq": 2.42,
            "turbulenceScale": 2.53, "wallSquish": 2.73, "fieldThreshold": 0.59, "cohesion": 0.89,
            "cohesionRange": 1.42, "repelStrength": 1.6, "repelRange": 0.75, "poolLevel": 0.058,
            "poolSoftness": 0.084, "poolWave": 0.01, "poolWaveSpeed": 2.54, "waxColorA": "#57a26a",
            "waxColorB": "#13b6fb", "waxGlow": 1.03, "waxGlowColor": "#2f2323", "sssColor": "#e5e28f",
            "sssStrength": 0.27, "sssFalloff": 0.1, "lightAngle": -1.43159, "specStrength": 0,
            "specSharp": 2, "softSpecStrength": 0.94, "softSpecSharp": 1, "reflectStrength": 0,
            "reflectWidth": 0.5, "edgeSoft": 0.325, "translucency": 0.34, "translucencyBias": 1,
            "bgTop": "#fe0606", "bgBottom": "#000000", "lampGlow": 1.74, "glowRadius": 1.21,
            "glowColor": "#be4204", "halo": 3, "haloWidth": 4.2
        }
    },
    {
        "name": "Mars Attacks", "iteration": 27, "values": {
            "timeScale": 0.15, "blobSize": 0.047, "blobSizeVar": 0.4, "traitVariance": 0.37,
            "heatGain": 1.86, "squish": 0.73, "turbulence": 0.73, "turbulenceFreq": 2.42,
            "turbulenceScale": 2.53, "wallSquish": 2.73, "fieldThreshold": 0.59, "cohesion": 0.89,
            "cohesionRange": 1.42, "repelStrength": 1.6, "repelRange": 0.75, "poolLevel": 0.134,
            "poolSoftness": 0.105, "poolWave": 0.0175, "poolWaveSpeed": 2.61, "waxColorA": "#b5990d",
            "waxColorB": "#fbff00", "waxGlow": 1.03, "waxGlowColor": "#2f2323", "sssColor": "#e5e28f",
            "sssStrength": 0.27, "sssFalloff": 0.1, "lightAngle": -1.43159, "specStrength": 0,
            "specSharp": 2, "softSpecStrength": 0.94, "softSpecSharp": 1, "reflectStrength": 2,
            "reflectWidth": 6.9, "ambient": 0.16, "diffuse": 0.16, "bump": 1.41, "edgeSoft": 0.325,
            "translucency": 0.34, "translucencyBias": 1, "bgTop": "#fe0606", "bgBottom": "#000000",
            "lampGlow": 1.74, "glowRadius": 1.21, "glowColor": "#ff5900", "halo": 3, "haloWidth": 4.2,
            "saturation": 1.37, "brightness": 0.57
        }
    },
    {
        "name": "Magnetic Storms", "iteration": 27, "values": {
            "timeScale": 0.15, "traitVariance": 0.37, "heatGain": 1.86, "squish": 0.73,
            "turbulence": 0.73, "turbulenceFreq": 2.42, "turbulenceScale": 2.53, "wallSquish": 2.73,
            "fieldThreshold": 0.59, "poolLevel": 0.134, "poolSoftness": 0.105, "poolWave": 0.0175,
            "poolWaveSpeed": 2.61, "waxColorA": "#b5990d", "waxColorB": "#fbff00", "waxGlow": 1.03,
            "waxGlowColor": "#2f2323", "sssColor": "#e5e28f", "sssStrength": 0.27, "sssFalloff": 0.1,
            "lightAngle": -1.43159, "specStrength": 0, "specSharp": 2, "softSpecStrength": 0.94,
            "softSpecSharp": 1, "reflectStrength": 2, "reflectWidth": 6.9, "ambient": 0.16,
            "diffuse": 0.16, "bump": 1.41, "edgeSoft": 0.455, "translucency": 0.34, "translucencyBias": 0.32,
            "bgTop": "#fe0606", "bgBottom": "#000000", "lampGlow": 1.74, "glowRadius": 1.21,
            "glowColor": "#ff5900", "halo": 3, "haloWidth": 4.2, "saturation": 1.37, "brightness": 0.87,
            "contrast": 0.63, "colorPow": 1.61
        }
    },
    {
        "name": "Coal Mine", "iteration": 27, "values": {
            "timeScale": 0.27, "blobSize": 0.056, "traitVariance": 1, "buoyancy": 2.31,
            "heatGain": 1.62, "squish": 0.73, "turbulence": 1, "turbulenceScale": 1.49,
            "wallSquish": 2.73, "poolLevel": 0.11, "poolSoftness": 0.017, "waxColorA": "#000000",
            "waxColorB": "#000000", "waxGlow": 0, "waxGlowColor": "#ffffff", "sssColor": "#000000",
            "sssStrength": 0, "sssFalloff": 0.1, "specStrength": 0.56, "softSpecStrength": 0,
            "softSpecSharp": 1, "reflectStrength": 0, "reflectWidth": 0.5, "bump": 0.93,
            "edgeSoft": 0.01, "translucency": 0, "translucencyBias": 0, "bgTop": "#000000",
            "bgBottom": "#000000", "lampGlow": 0, "glowRadius": 0.05, "glowColor": "#ffffff",
            "halo": 0.58, "haloWidth": 6
        }
    },
    {
        "name": "Oil Slick", "iteration": 27, "values": {
            "timeScale": 0.27, "blobSize": 0.056, "traitVariance": 1, "buoyancy": 2.31,
            "heatGain": 1.62, "wander": 0.14, "squish": 0.73, "turbulence": 1,
            "turbulenceScale": 1.49, "wallSquish": 2.73, "poolLevel": 0.11, "poolSoftness": 0.036,
            "waxColorA": "#000000", "waxColorB": "#000000", "waxGlow": 0, "waxGlowColor": "#ffffff",
            "sssColor": "#000000", "sssStrength": 0, "sssFalloff": 0.1, "specStrength": 2.22,
            "specSharp": 168, "softSpecStrength": 0, "softSpecSharp": 1, "reflectStrength": 0,
            "reflectWidth": 0.5, "bump": 0.4, "edgeSoft": 0.01, "translucency": 0, "translucencyBias": 0,
            "bgTop": "#ffffff", "bgBottom": "#5c5c5c", "lampGlow": 0, "glowRadius": 0.74,
            "glowColor": "#ffffff", "halo": 0.3, "haloWidth": 3.3
        }
    },
    {
        "name": "Test", "iteration": 25, "values": {
            "poolLevel": 0.126, "sssColor": "#d00b46", "sssStrength": 3, "sssFalloff": 0.99,
            "reflectStrength": 0.73, "reflectWidth": 1.2, "translucency": 1.84, "translucencyBias": 1,
            "halo": 0.42, "haloWidth": 4.4
        }
    },
    {
        "name": "📷 Blackhole Sun ", "iteration": 28, "values": {
            "poolSoftness": 0.083, "reflectF0": 0.03, "bump": 5, "translucency": 0.45,
            "refractionStrength": 1.27, "webcamBgMix": 0.3, "webcamReflectMix": 5,
            "webcamRoughness": 0.9, "webcamParallax": 1.26
        }
    },
    {
        "name": "📷 Mercury Rising", "iteration": 29, "values": {
            "timeScale": 0.27, "blobSize": 0.056, "traitVariance": 1, "buoyancy": 2.31,
            "heatGain": 1.62, "wander": 0.14, "squish": 0.73, "turbulence": 1,
            "turbulenceScale": 1.49, "wallSquish": 2.73, "poolLevel": 0.11, "poolSoftness": 0.036,
            "waxColorA": "#000000", "waxColorB": "#000000", "waxGlow": 0, "waxGlowColor": "#ffffff",
            "sssColor": "#000000", "sssStrength": 0, "sssFalloff": 0.1, "specStrength": 2.22,
            "specSharp": 168, "softSpecStrength": 0, "softSpecSharp": 1, "reflectStrength": 1.67,
            "reflectWidth": 0.8, "reflectF0": 0.09, "reflectPow": 1.5, "sceneRoughness": 0.18,
            "bump": 0.4, "edgeSoft": 0.01, "translucency": -1, "translucencyBias": 0,
            "bgTop": "#000000", "bgBottom": "#2e2e2e", "lampGlow": 1.21, "glowRadius": 0.26,
            "glowColor": "#ffffff", "halo": 0.3, "haloWidth": 2.35, "webcamBgMix": 0,
            "webcamReflectMix": 5, "webcamRoughness": 0.24, "webcamParallax": 5
        }
    },
    { name: "Molten Gold", iteration: 2, values: { waxColorA: '#ff2200', waxColorB: '#ffcc00', sssColor: '#ffaa00', sssStrength: 1.3, sssFalloff: 0.9, waxGlow: 1.4, waxGlowColor: '#ff8800', bgTop: '#0a0505', bgBottom: '#2a0a00', glowColor: '#ff6600', lampGlow: 1.2, specStrength: 1.8 } },
    { name: "Deep Sea", iteration: 3, values: { waxColorA: '#00b3ff', waxColorB: '#7ef9ff', sssColor: '#00aaff', sssStrength: 0.6, waxGlow: 0.7, waxGlowColor: '#00aaff', bgTop: '#020814', bgBottom: '#001a2e', glowColor: '#0088ff', lampGlow: 0.8, specStrength: 1.6, specSharp: 60 } },
    { name: "Toxic Slime", iteration: 4, values: { waxColorA: '#7cff00', waxColorB: '#d4ff5a', sssColor: '#88ff00', sssStrength: 1.1, waxGlow: 1.1, waxGlowColor: '#88ff00', bgTop: '#050a02', bgBottom: '#0e2200', glowColor: '#66ff00', lampGlow: 0.9, saturation: 1.3 } },
    { name: "Cotton Candy", iteration: 5, values: { waxColorA: '#ff5ec4', waxColorB: '#a0e8ff', sssColor: '#ff88dd', sssStrength: 0.9, waxGlow: 0.9, waxGlowColor: '#ff88dd', bgTop: '#1a0a22', bgBottom: '#331244', glowColor: '#ff44aa', lampGlow: 0.9, blobSize: 0.045, blobCount: 12 } },
    { name: "Blood Moon", iteration: 6, values: { waxColorA: '#5a0000', waxColorB: '#ff2b00', sssColor: '#ff0000', sssStrength: 1.6, sssFalloff: 0.7, waxGlow: 1.6, waxGlowColor: '#ff0000', bgTop: '#080000', bgBottom: '#1e0000', glowColor: '#cc0000', lampGlow: 1.4, contrast: 1.2, specStrength: 0.8 } },
    { name: "Aurora", iteration: 7, values: { waxColorA: '#00ff9d', waxColorB: '#7b5bff', sssColor: '#00ffcc', sssStrength: 0.9, waxGlow: 0.8, bgTop: '#03061a', bgBottom: '#0a0f33', glowColor: '#00ffaa', lampGlow: 0.7, blobCount: 7, blobSize: 0.07 } },
    { name: "Mercury", iteration: 8, values: { waxColorA: '#8a8a9a', waxColorB: '#e8e8ff', sssColor: '#aabbff', sssStrength: 0.2, waxGlow: 0.3, bgTop: '#050508', bgBottom: '#101018', glowColor: '#445577', lampGlow: 0.5, specStrength: 3.0, specSharp: 120, saturation: 0.4, reflectStrength: 1.2 } },
    { name: "Slow Blobs", iteration: 9, values: { buoyancy: 0.35, cooling: 0.14, heatDepth: 0.22, blobSize: 0.085, blobCount: 6, drag: 1.6, maxSpeed: 0.16, wander: 0.2, timeScale: 0.75 } },
    { name: "Fast Frenzy", iteration: 10, values: { buoyancy: 1.8, cooling: 0.6, heatDepth: 0.12, blobSize: 0.035, blobCount: 14, drag: 0.7, maxSpeed: 0.55, wander: 0.9, squish: 1.2, turbulence: 0.35, turbulenceFreq: 2.5, turbulenceScale: 1.8, traitVariance: 0.5, timeScale: 1.2 } },
    { name: "Giant Pool", iteration: 11, values: { poolLevel: 0.22, poolSoftness: 0.06, poolWave: 0.02, blobSize: 0.09, blobCount: 5, buoyancy: 0.6 } },
    { name: "No Pool", iteration: 12, values: { poolActive: 0, blobCount: 10 } },
    { name: "Neon Lab", iteration: 13, values: { waxColorA: '#ff00cc', waxColorB: '#00ffee', sssColor: '#ff00aa', sssStrength: 1.5, sssFalloff: 0.8, waxGlow: 1.5, waxGlowColor: '#ff00aa', bgTop: '#06000f', bgBottom: '#12002a', glowColor: '#aa00ff', lampGlow: 1.3, specStrength: 2.4, specSharp: 90, saturation: 1.5 } },
    { name: "Sunset", iteration: 14, values: { waxColorA: '#ff6a00', waxColorB: '#ffd166', sssColor: '#ff9933', sssStrength: 1.2, waxGlow: 1.2, bgTop: '#150820', bgBottom: '#3a1030', glowColor: '#ff5500', lampGlow: 1.1 } },
    { name: "Slow Motion", iteration: 15, values: { timeScale: 0.30 } },
    { name: "Hypnotic", iteration: 16, values: { timeScale: 0.12 } },
    { name: "Cohesive", iteration: 17, values: { cohesion: 2.4, cohesionRange: 1.35, repelStrength: 0.4, repelRange: 0.4, blobCount: 12, blobSize: 0.05 } },
    { name: "Repulsive", iteration: 18, values: { cohesion: 0.0, repelStrength: 4.0, repelRange: 1.2, blobCount: 9 } },
    { name: "Bouncy Wax", iteration: 19, values: { wallSquish: 1.8, squish: 1.2, wallRestitution: 0.55, traitVariance: 0.6, blobCount: 7 } },
    { name: "Tight Blobs", iteration: 20, values: { fieldThreshold: 1.6, edgeSoft: 0.06, repelStrength: 0.4, blobCount: 10 } },
    { name: "Gloopy", iteration: 21, values: { fieldThreshold: 0.75, haloWidth: 1.2, halo: 1.2, sssStrength: 1.4, sssFalloff: 0.7, blobCount: 6 } },
    { name: "Jelly", iteration: 22, values: { turbulence: 0.45, turbulenceFreq: 1.2, turbulenceScale: 0.8, squish: 1.4, wallSquish: 1.0 } },
    { name: "Glass Wax", iteration: 23, values: { reflectStrength: 1.2, reflectWidth: 2.5, translucency: 1.2, translucencyBias: 0.3, specStrength: 2.0, specSharp: 150, sssStrength: 0.6 } },
    { name: "Enamel", iteration: 24, values: { reflectStrength: 1.0, reflectWidth: 4.0, translucency: 0.0, specStrength: 2.5, specSharp: 180, softSpecStrength: 0.15 } },
];

window.__lavaPresets = PRESETS;

})();