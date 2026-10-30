// =====================================================================
// SCALE OPTIONS
// =====================================================================

var SCALE_OPTIONS = [
    { label: "256 x 256", w: 256, h: 256 },
    { label: "512 x 256", w: 512, h: 256 },
    { label: "512 x 512", w: 512, h: 512 },
    { label: "1024 x 512", w: 1024, h: 512 },
    { label: "1024 x 1024", w: 1024, h: 1024 },
    { label: "2048 x 1024", w: 2048, h: 1024 }
];

// =====================================================================
// CONTROL DECLARATIONS
// =====================================================================

var CONTROLS = [
    {
        heading: "⚙️ Global Settings", showExtras: false, controls: [
            {
                icon: "🔲", key: "gridResolution", def: 512, min: 40, max: 2048, step: 16, int: true, savedInPreset: false, canRandomise: false,
                label: "Grid Resolution",
                details: "Resolution of the water surface mesh. Higher = smoother waves, but slower."
            },
            {
                icon: "🪞", key: "fxaaStrength", def: 1.0, min: 0.0, max: 1.0, step: 0.01, savedInPreset: false,
                label: "FXAA Strength",
                details: "Anti-aliasing blend amount applied to the final image (0 = off, 1 = full)."
            },
            {
                icon: "🎞️", key: "presetTransitionTime", def: 2.0, min: 0, max: 5, step: 0.01, savedInPreset: false,
                label: "Preset Transition",
                details: "Seconds over which to smoothly blend between presets (0 = instant)."
            }
        ]
    },
    {
        heading: "⚙️ General Settings", controls: [
            {
                icon: "⏱️", key: "timeScale", def: 2, min: -1.0, max: 10.0, step: 0.1,
                label: "Time Scale",
                details: "Global multiplier on simulated time — speeds up or slows down every animated effect."
            },
            {
                icon: "🌧️", key: "rainRate", def: 200, min: 0.0, max: 200.0, step: 0.1,
                label: "Rain Rate",
                details: "Number of raindrops spawned per second."
            },
            {
                icon: "⭕", key: "vignetteRadius", def: 0.683, min: 0.0, max: 1.5, step: 0.001,
                label: "Vignette Radius",
                details: "Distance from centre where darkening begins."
            },
            {
                icon: "🌫️", key: "vignetteSoftness", def: 0.38, min: 0.0, max: 1.0, step: 0.01,
                label: "Vignette Softness",
                details: "How gradually the vignette darkening fades out."
            }
        ]
    },
    {
        heading: "🔧 Simulation", controls: [
            {
                icon: "🧵", key: "simTension", def: 0.455, min: 0.01, max: 0.5, step: 0.001,
                label: "Sim Tension",
                details: "Surface tension of the ripple simulation — higher pulls waves back faster."
            },
            {
                icon: "🛑", key: "simDamping", def: 0.9636, min: 0.8, max: 0.9999, step: 0.0001,
                label: "Sim Damping",
                details: "Energy loss per step in the ripple sim — lower values calm the surface quicker."
            },
            {
                icon: "💥", key: "simRainImpulse", def: 0.08, min: 0.0, max: 2.0, step: 0.01,
                label: "Global Impact",
                details: "Global response of the water surface to a drop — scales every drop's kick."
            },
            {
                icon: "🌀", key: "simSpringiness", def: 0.27, min: 0.0, max: 0.5, step: 0.001,
                label: "Sim Springiness",
                details: "Restoring force pulling the surface back to flat — adds bounciness."
            },
            {
                icon: "🐞", key: "debugSim", def: 0, min: 0.0, max: 1.0, step: 1.0, canRandomise: false,
                label: "Debug Sim",
                details: "Show the raw ripple simulation buffer instead of shaded water."
            }
        ]
    },
    {
        heading: "💧 Ripples", controls: [
            {
                icon: "📶", key: "rippleStrength", def: 1.0, min: 0.0, max: 1.0, step: 0.01,
                label: "Ripple Strength",
                details: "Per-drop base amplitude — how big a splash each raindrop makes."
            },
            {
                icon: "🎲", key: "rippleStrengthVariance", def: 0.85, min: 0.0, max: 10.0, step: 0.01,
                label: "Strength Variance",
                details: "Random spread applied to each drop's amplitude around Ripple Strength."
            },
            {
                icon: "🏎️", key: "rippleSpeed", def: 1.0, min: 0.0, max: 1.0, step: 0.01,
                label: "Ripple Speed",
                details: "Propagation speed of ripples — 1.0 is normal, lower is slower."
            },
            {
                icon: "➡️", key: "rippleDriftX", def: -0.055, min: -1.0, max: 1.0, step: 0.1,
                label: "Drift X",
                details: "Horizontal drift velocity of the ripple field over time."
            },
            {
                icon: "⬆️", key: "rippleDriftY", def: -0.05, min: -1.0, max: 1.0, step: 0.1,
                label: "Drift Y",
                details: "Vertical drift velocity of the ripple field over time."
            },
            {
                icon: "🔘", key: "simDropRadius", def: 0.0048, min: 0.001, max: 0.1, step: 0.001,
                label: "Drop Radius",
                details: "Radius of the impulse applied to the ripple simulation when a drop lands."
            },
            {
                icon: "⚫", key: "simDropCore", def: 0.18, min: 0.01, max: 0.99, step: 0.01,
                label: "Drop Core",
                details: "Softness of the drop impulse falloff — lower = sharper peak."
            }
        ]
    },
    {
        heading: "💧 Drops", controls: [
            {
                icon: "⬇️", key: "dropFallSpeed", def: 0.5, min: 0.1, max: 20.0, step: 0.1,
                label: "Fall Speed",
                details: "Speed of raindrops falling toward the surface."
            },
            {
                icon: "🎲", key: "dropFallSpeedVariance", def: 0.25, min: 0.0, max: 1.0, step: 0.01,
                label: "Fall Speed Variance",
                details: "Random spread applied to each raindrop's fall speed."
            },
            {
                icon: "📏", key: "dropFallHeight", def: 1.25, min: 1.0, max: 25.0, step: 1.0,
                label: "Fall Height",
                details: "Distance raindrops fall from before hitting the water."
            },
            {
                icon: "🔵", key: "dropSize", def: 0.0035, min: 0.001, max: 0.05, step: 0.0001,
                label: "Drop Size",
                details: "Visual radius of each falling raindrop sphere."
            },
            {
                icon: "🎲", key: "dropSizeVariance", def: 0.35, min: 0.0, max: 5.0, step: 0.01,
                label: "Size Variance",
                details: "Random spread applied to each raindrop's visual size."
            },
            {
                icon: "🔘", key: "sphereQuality", def: 16, min: 4, max: 64, step: 1, int: true,
                label: "Sphere Quality",
                details: "Tessellation of the raindrop sphere mesh — higher = rounder, slower."
            }
        ]
    },
    {
        heading: "💦 Splashes", controls: [
            {
                icon: "🔢", key: "dropSplashCount", def: 2, min: 0, max: 8, step: 1, int: true,
                label: "Splash Count",
                details: "Maximum number of secondary droplets launched when a drop lands."
            },
            {
                icon: "📏", key: "dropSplashHeightFactor", def: 0.18, min: 0.0, max: 0.5, step: 0.01,
                label: "Splash Height",
                details: "Apex height of splash droplets as a fraction of the parent drop's height."
            },
            {
                icon: "💪", key: "dropSplashStrengthFactor", def: 0.25, min: 0.0, max: 1.0, step: 0.01,
                label: "Splash Strength",
                details: "How much of the parent drop's ripple amplitude the splash inherits."
            },
            {
                icon: "🔵", key: "dropSplashSizeFactor", def: 0.35, min: 0.0, max: 1.0, step: 0.01,
                label: "Splash Size",
                details: "Visual size of splash droplets relative to the parent drop."
            },
            {
                icon: "🌬️", key: "dropSplashDriftInheritance", def: 0.5, min: 0.0, max: 2.0, step: 0.01,
                label: "Splash Drift",
                details: "How much of the ripple drift velocity splash droplets inherit when launched."
            }
        ]
    },
    {
        heading: "🔤 Letter Handling", controls: [
            {
                icon: "⏱️", key: "letterRate", def: 9.09, min: 0.0, max: 20.0, step: 0.01,
                label: "Letter Rate",
                details: "Number of letters typed per second."
            },
            {
                icon: "⏳", key: "letterMaxAge", def: 10, min: 0.5, max: 10.0, step: 0.01,
                label: "Letter Max Age",
                details: "How long a letter ripple stays alive before being removed."
            },
            {
                icon: "⏸️", key: "letterLineDelay", def: 1.3, min: 0.5, max: 10.0, step: 0.1,
                label: "Line Delay",
                details: "Pause in seconds between finishing one line of text and starting the next."
            },
            {
                icon: "↔️", key: "letterSpacing", def: 0.48, min: 0.1, max: 2.0, step: 0.01,
                label: "Letter Spacing",
                details: "Horizontal gap between letters, relative to letter size."
            },
            {
                icon: "🏎️", key: "letterSpeed", def: 0.02, min: 0.0, max: 0.1, step: 0.001,
                label: "Letter Wave Speed",
                details: "Speed at which letter ripples travel outward from each glyph."
            }
        ]
    },
    {
        heading: "🔤 Letter Appearance", controls: [
            {
                icon: "📶", key: "letterStrength", def: 0.101, min: -0.5, max: 0.5, step: 0.001,
                label: "Letter Strength",
                details: "Amplitude of the ripple wave emanating from each letter."
            },
            {
                icon: "🔵", key: "letterSize", def: 0.2, min: 0.01, max: 1.0, step: 0.001,
                label: "Letter Size",
                details: "Base size of rendered letter glyphs."
            },
            {
                icon: "🎲", key: "letterSizeVariance", def: 0.35, min: 0.0, max: 1.0, step: 0.01,
                label: "Size Variance",
                details: "Random spread applied to each letter's size."
            },
            {
                icon: "🎲", key: "letterAngleVariance", def: 0.54, min: 0.0, max: 3.14, step: 0.01,
                label: "Angle Variance",
                details: "Random rotation range applied to each letter."
            },
            {
                icon: "↕️", key: "letterYOffset", def: 0.33, min: -0.5, max: 0.5, step: 0.01,
                label: "Y Offset",
                details: "Vertical offset of the text line from the surface centre."
            },
            {
                icon: "🎲", key: "letterYVariance", def: 0.05, min: 0.0, max: 0.5, step: 0.01,
                label: "Y Variance",
                details: "Random vertical jitter applied to each letter."
            },
        ]
    },
    {
        heading: "💧Letter Ripples", controls: [
            {
                icon: "🏎️", key: "letterRippleSpeed", def: 0.057, min: 0.0, max: 0.2, step: 0.01,
                label: "Letter Ripple Speed",
                details: "Propagation speed of ripples emanating from letters (independent of the sim ripple speed)."
            },
            {
                icon: "📉", key: "letterDecay", def: 0, min: 0.0, max: 10.0, step: 0.01,
                label: "Letter Decay",
                details: "Exponential decay rate of the letter ripple amplitude over time."
            },
            {
                icon: "〰️", key: "letterWavelength", def: 0.0514, min: 0.001, max: 0.5, step: 0.001,
                label: "Letter Wavelength",
                details: "Spacing between successive crests in the letter ripple wave."
            },
            {
                icon: "📏", key: "letterThickness", def: 0.7, min: 0.1, max: 10.0, step: 0.01,
                label: "Letter Thickness",
                details: "How far behind the wavefront the letter ripple remains supported."
            }
        ]
    },
    {
        heading: "🎤 Live Text", controls: [
            {
                icon: "🎙️", key: "liveText", def: 0, min: 0, max: 1, step: 1, int: true, canRandomise: false,
                label: "Live Text",
                details: "Enable speech recognition — spoken words become ripple letters."
            },
            {
                icon: "📚", key: "liveTextMaxBacklog", def: 5, min: 1, max: 20, step: 1, int: true,
                label: "Max Backlog",
                details: "Maximum number of recognised words queued up before new ones are dropped."
            }
        ]
    },
    {
        heading: "🌊 Ocean (FFT)", controls: [
            {
                icon: "↔️", key: "oceanPatchSize", def: 4.0, min: 1.0, max: 16.0, step: 0.1,
                label: "Patch Size",
                details: "World-space size of one FFT tile — larger = longer, broader waves."
            },
            {
                icon: "🏎️", key: "oceanPropagation", def: 1.0, min: 0.0, max: 1.0, step: 0.01,
                label: "Propagation",
                details: "How much the spectrum animates over time (0 = frozen, 1 = full motion)."
            },
            {
                icon: "🏎️", key: "oceanSpeed", def: 1.0, min: 0.01, max: 3.0, step: 0.01,
                label: "Ocean Speed",
                details: "Overall speed multiplier for ocean wave animation."
            },
            {
                icon: "🏎️", key: "oceanWindSpeed", def: 8.0, min: 0.1, max: 30.0, step: 0.1,
                label: "Wind Speed",
                details: "Wind speed driving the FFT spectrum — higher creates larger waves."
            },
            {
                icon: "🧭", key: "oceanWindAngle", def: 0.0, min: -6.28, max: 6.28, step: 0.01,
                label: "Wind Angle",
                details: "Direction the wind blows, in radians."
            },
            {
                icon: "📏", key: "oceanWaveScale", def: 1.0, min: 0.05, max: 4.0, step: 0.01,
                label: "Wave Scale",
                details: "Scales the characteristic wavelength — shifts the spectrum toward longer or shorter waves."
            },
            {
                icon: "↕️", key: "oceanHeightAmp", def: 0.02, min: 0.0, max: 0.15, step: 0.001,
                label: "Height Amp",
                details: "Overall amplitude of the FFT ocean — controls wave height."
            },
            {
                icon: "🪓", key: "oceanChop", def: 0.6, min: -1.5, max: 1.5, step: 0.01,
                label: "Choppiness",
                details: "Horizontal displacement of wave peaks — adds sharp crests and foam."
            },
            {
                icon: "✂️", key: "oceanSmallWaveCut", def: 0.5, min: 0.0, max: 1.0, step: 0.01,
                label: "Small Wave Cut",
                details: "Suppresses high-frequency ripples — higher = smoother, calmer water."
            },
            {
                icon: "🎯", key: "oceanDirectionSpread", def: 0.5, min: 0.0, max: 1.0, step: 0.01,
                label: "Direction Spread",
                details: "How much waves deviate from the wind direction — 0 = narrow, 1 = chaotic."
            },
            {
                icon: "🔍", key: "oceanDetail", def: 1.0, min: 0.0, max: 5.0, step: 0.01,
                label: "Detail",
                details: "Multiplier on FFT output height — brings out fine wave detail."
            },
            {
                icon: "🧼", key: "oceanFoamThreshold", def: 0.7, min: 0.0, max: 1.0, step: 0.01,
                label: "Foam Threshold",
                details: "Jacobian value below which foam appears on wave crests."
            },
            {
                icon: "🫧", key: "oceanFoamStrength", def: 0.5, min: 0.0, max: 2.0, step: 0.01,
                label: "Foam Strength",
                details: "Opacity multiplier for foam rendered on the water surface."
            }
        ]
    },
    {
        heading: "🎥 Camera Settings", controls: [
            {
                icon: "📐", key: "cameraHeight", def: 3.27, min: 0.0, max: 40.0, step: 0.1,
                label: "Camera Height",
                details: "Height of the camera above the water surface."
            },
            {
                icon: "📐", key: "surfaceTilt", def: 0.62, min: -1.0, max: 1.0, step: 0.01,
                label: "Surface Tilt",
                details: "Pitch of the water plane relative to the camera view."
            },
            {
                icon: "👁️", key: "perspectiveStrength", def: 0.66, min: -1.0, max: 2.0, step: 0.01,
                label: "Perspective Strength",
                details: "Blends between orthographic (0) and strong perspective (1+) projection."
            }
        ]
    },
    {
        heading: "🪣 Water Settings", controls: [
            {
                icon: "🌊", key: "waterDepth", def: 0.202, min: 0.0, max: 1.0, step: 0.001,
                label: "Water Depth",
                details: "Simulated depth of the water body, affecting how much the riverbed shows through."
            },
            {
                icon: "🕳️", key: "absorption", def: 0.61, min: 0.0, max: 10.0, step: 0.01,
                label: "Absorption",
                details: "How strongly water absorbs light with depth — higher = darker, murkier."
            },
            {
                icon: "🌊", key: "surfaceDepth", def: 0.529, min: 0.0, max: 2.0, step: 0.001,
                label: "Surface Depth",
                details: "Strength of the normal mapping from surface gradients — how 'bumpy' the water looks."
            },
            {
                icon: "🔍", key: "refractionStrength", def: 0.051, min: 0.0, max: 0.5, step: 0.001,
                label: "Refraction",
                details: "How much the surface refracts the riverbed beneath it."
            },
            {
                icon: "🔴", key: "rgbSplit", def: 0, min: -0.1, max: 0.1, step: 0.001,
                label: "RGB Split",
                details: "Chromatic aberration — offsets the RGB channels to create rainbow fringes."
            },
            {
                icon: "🧭", key: "rgbAngle", def: 0, min: -6.28, max: 6.28, step: 0.01,
                label: "RGB Angle",
                details: "Direction of the chromatic aberration offset."
            },
            {
                icon: "🔴", key: "waterColorR", def: 0.475, min: 0.0, max: 1.0, step: 0.001,
                label: "Water Colour R",
                details: "Red channel of the shallow water colour."
            },
            {
                icon: "🟢", key: "waterColorG", def: 0.72, min: 0.0, max: 1.0, step: 0.001,
                label: "Water Colour G",
                details: "Green channel of the shallow water colour."
            },
            {
                icon: "🔵", key: "waterColorB", def: 0.899, min: 0.0, max: 1.0, step: 0.001,
                label: "Water Colour B",
                details: "Blue channel of the shallow water colour."
            },
            {
                icon: "🔴", key: "waterDeepR", def: 0.131, min: 0.0, max: 1.0, step: 0.001,
                label: "Deep Water R",
                details: "Red channel of the deep water colour."
            },
            {
                icon: "🟢", key: "waterDeepG", def: 0.253, min: 0.0, max: 1.0, step: 0.001,
                label: "Deep Water G",
                details: "Green channel of the deep water colour."
            },
            {
                icon: "🔵", key: "waterDeepB", def: 0.374, min: 0.0, max: 1.0, step: 0.001,
                label: "Deep Water B",
                details: "Blue channel of the deep water colour."
            }
        ]
    },
    {
        heading: "🎨 Background / Environment", controls: [
            {
                icon: "🖼️", key: "bgImageEnabled", def: 0, min: 0, max: 1, step: 1, int: true, canRandomise: false,
                label: "Background Image",
                details: "Enable rendering a background/environment image instead of clear colour."
            },
            {
                icon: "🖼️", key: "bgImageIndex", def: 1, min: 0, max: 10, step: 1, int: true, discreteSwap: true,
                label: "Background Index",
                details: "Which background image to load from the image set."
            },
            {
                icon: "📏", key: "bgImageScale", def: 1, min: 0, max: SCALE_OPTIONS.length - 1, step: 1, int: true, special: "scale", discreteSwap: true,
                label: "Background Scale",
                details: "Target resample size for the background image."
            },
            {
                icon: "🔁", key: "bgImageSeamless", def: 0, min: 0, max: 100, step: 1, int: true, discreteSwap: true,
                label: "Background Seamless",
                details: "Blend strength for edges when tiling the background — 0 = off, 100 = full."
            },
            {
                icon: "↔️", key: "bgImageTileX", def: 1, min: 1, max: 64, step: 1, int: true,
                label: "Background Tile X",
                details: "Horizontal repeat count for the background image."
            },
            {
                icon: "↕️", key: "bgImageTileY", def: 1, min: 1, max: 64, step: 1, int: true,
                label: "Background Tile Y",
                details: "Vertical repeat count for the background image."
            },
            {
                icon: "📶", key: "envMapStrength", def: 0.1, min: 0.0, max: 1.0, step: 0.01,
                label: "Env Map Strength",
                details: "How strongly the environment map reflects in the water surface."
            },
            {
                icon: "🔍", key: "envMapZoom", def: 1.0, min: 0.1, max: 3.0, step: 0.01,
                label: "Env Map Zoom",
                details: "Zoom factor applied to environment reflections."
            },
            {
                icon: "↔️", key: "envMapPanX", def: 0.5, min: -1.0, max: 1.0, step: 0.01,
                label: "Env Map Pan X",
                details: "Horizontal pan of the environment map UVs."
            },
            {
                icon: "↕️", key: "envMapPanY", def: 0.5, min: -1.0, max: 1.0, step: 0.01,
                label: "Env Map Pan Y",
                details: "Vertical pan of the environment map UVs."
            }
        ]
    },
    {
        heading: "🏞️ Riverbed", controls: [
            {
                icon: "🖼️", key: "bedImageEnabled", def: 0, min: 0, max: 1, step: 1, int: true, canRandomise: false,
                label: "Riverbed Image",
                details: "Use an image texture for the riverbed instead of procedural sand."
            },
            {
                icon: "🖼️", key: "bedImageIndex", def: 1, min: 0, max: 10, step: 1, int: true, discreteSwap: true,
                label: "Riverbed Index",
                details: "Which riverbed image to load from the image set."
            },
            {
                icon: "📏", key: "bedImageScale", def: 1, min: 0, max: SCALE_OPTIONS.length - 1, step: 1, int: true, special: "scale", discreteSwap: true,
                label: "Riverbed Scale",
                details: "Target resample size for the riverbed image."
            },
            {
                icon: "🔁", key: "bedImageSeamless", def: 0, min: 0, max: 100, step: 1, int: true, discreteSwap: true,
                label: "Riverbed Seamless",
                details: "Blend strength for edges when tiling the riverbed — 0 = off, 100 = full."
            },
            {
                icon: "↔️", key: "bedImageTileX", def: 1, min: 0, max: 8, step: 1,
                label: "Riverbed Tile X",
                details: "Horizontal repeat count for the riverbed image."
            },
            {
                icon: "↕️", key: "bedImageTileY", def: 1, min: 0, max: 8, step: 1,
                label: "Riverbed Tile Y",
                details: "Vertical repeat count for the riverbed image."
            },
            {
                icon: "📏", key: "sandScale", def: 3190, min: 0, max: 10000, step: 1,
                label: "Sand Scale",
                details: "Noise frequency for procedural sand grain."
            },
            {
                icon: "🎚️", key: "sandContrast", def: 0.69, min: 0.0, max: 1.0, step: 0.01,
                label: "Sand Contrast",
                details: "Contrast of the procedural sand pattern."
            },
            {
                icon: "🔴", key: "sandR", def: 0.727, min: 0.0, max: 1.0, step: 0.001,
                label: "Sand Colour R",
                details: "Red channel of the sand colour."
            },
            {
                icon: "🟢", key: "sandG", def: 0.717, min: 0.0, max: 1.0, step: 0.001,
                label: "Sand Colour G",
                details: "Green channel of the sand colour."
            },
            {
                icon: "🔵", key: "sandB", def: 0.636, min: 0.0, max: 1.0, step: 0.001,
                label: "Sand Colour B",
                details: "Blue channel of the sand colour."
            }
        ]
    },
    {
        heading: "✨ Caustics", controls: [
            {
                icon: "✨", key: "causticStrength", def: 0.5, min: 0.0, max: 2.0, step: 0.01,
                label: "Caustic Strength",
                details: "Brightness of light-focusing patterns on the riverbed. 0 disables caustics entirely."
            },
            {
                icon: "🌧️", key: "simCausticStrength", def: 0.3, min: 0.0, max: 1.0, step: 0.01,
                label: "Rain Caustics",
                details: "Contribution of rain-ripple distortion to the caustic pattern."
            },
            {
                icon: "🌈", key: "causticRGBScale", def: 0.5, min: 0.0, max: 2.0, step: 0.01,
                label: "Caustic RGB Split",
                details: "Chromatic dispersion strength of caustics — how far apart R/G/B caustic patterns are offset. 0 = monochrome caustics."
            },
            {
                icon: "🧭", key: "causticRGBAngle", def: 0.0, min: -6.28, max: 6.28, step: 0.01,
                label: "Caustic RGB Angle",
                details: "Direction of the caustic chromatic offset. Independent of the water surface's RGB split angle."
            },
            {
                icon: "🔗", key: "causticRGBAffectedBySurface", def: 0, min: 0, max: 1, step: 1, int: true,
                label: "Caustic RGB Follows Surface",
                details: "If on, the caustic RGB direction and magnitude are added to the water surface's own rgbSplit/rgbAngle rather than being independent."
            },
            {
                icon: "📐", key: "bedDepthScale", def: 4.0, min: 0.5, max: 20.0, step: 0.1,
                label: "Bed Depth Scale",
                details: "World-space depth of the riverbed plane for ray-traced caustics. Higher = more parallax/depth, lower = shallower."
            },
        ]
    },
    {
        heading: "🌅 Sunlight", controls: [
            {
                icon: "🧭", key: "sunAngle", def: -0.53, min: -6.28, max: 6.28, step: 0.01,
                label: "Sun Angle",
                details: "Azimuth of the sun on the horizon, in radians."
            },
            {
                icon: "↕️", key: "sunHeight", def: 0.224, min: -1.0, max: 1.0, step: 0.01,
                label: "Sun Height",
                details: "Elevation of the sun above the horizon (-1 = below, 1 = zenith)."
            },
            {
                icon: "✨", key: "specularPower", def: 13, min: 0.0, max: 10, step: 0.1,
                label: "Specular Power",
                details: "Sharpness of the sun's specular highlight on the water."
            },
            {
                icon: "💡", key: "specularStrength", def: -0.231, min: -2.0, max: 2.0, step: 0.001,
                label: "Specular Strength",
                details: "Intensity of the specular highlight — negative values invert it."
            },
            {
                icon: "🪞", key: "fresnelPower", def: 0.51, min: -1.0, max: 2.0, step: 0.01,
                label: "Fresnel Power",
                details: "Sharpness of the Fresnel edge — how abruptly reflections appear at glancing angles."
            }
        ]
    },
    {
        heading: "🌤️ Sky Settings", controls: [
            {
                icon: "🔴", key: "skyHorizonR", def: 0.707, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Horizon R",
                details: "Red channel of the procedural sky at the horizon."
            },
            {
                icon: "🟢", key: "skyHorizonG", def: 0.737, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Horizon G",
                details: "Green channel of the procedural sky at the horizon."
            },
            {
                icon: "🔵", key: "skyHorizonB", def: 0.515, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Horizon B",
                details: "Blue channel of the procedural sky at the horizon."
            },
            {
                icon: "🔴", key: "skyZenithR", def: 0.211, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Zenith R",
                details: "Red channel of the procedural sky at the zenith."
            },
            {
                icon: "🟢", key: "skyZenithG", def: 0.333, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Zenith G",
                details: "Green channel of the procedural sky at the zenith."
            },
            {
                icon: "🔵", key: "skyZenithB", def: 0.596, min: 0.0, max: 1.0, step: 0.001,
                label: "Sky Zenith B",
                details: "Blue channel of the procedural sky at the zenith."
            }
        ]
    }
];

// =====================================================================
// DERIVED TABLES
// =====================================================================

var CONTROL_BY_KEY = {};
CONTROLS.forEach(function (g) {
    g.controls.forEach(function (c) { CONTROL_BY_KEY[c.key] = c; });
});

var DEFAULTS = {};
var INT_KEYS = {};
var COLOUR_KEYS = {};
var DISCRETE_KEYS = {};
var STANDALONE_KEYS = {};

Object.keys(CONTROL_BY_KEY).forEach(function (key) {
    var c = CONTROL_BY_KEY[key];
    DEFAULTS[key] = c.def;
    if (c.int) INT_KEYS[key] = true;
    if (c.discreteSwap) DISCRETE_KEYS[key] = true;
    if (c.savedInPreset === false) STANDALONE_KEYS[key] = true;
    if (/R$|G$|B$/.test(key) && c.min === 0 && c.max === 1 && c.step === 0.001 && !c.int) {
        COLOUR_KEYS[key] = true;
    }
});

// =====================================================================
// PRESETS
// =====================================================================

var PRESETS = [
    { name: "Default", iteration: 11, values: {} },
    {
        name: "Splish Splash", iteration: 12, values: {
            timeScale: 2.31, dropFallSpeed: 2.7, dropSize: 0.0089, dropSizeVariance: 0.35,
            dropFallHeight: 5.0, surfaceTilt: 0.13,
            oceanWindSpeed: 3.0, oceanWindAngle: 0.4, oceanWaveScale: 0.8, oceanHeightAmp: 0.008,
            oceanChop: 0.3, oceanDirectionSpread: 0.35, oceanSmallWaveCut: 0.6,
            oceanFoamThreshold: 0.9, oceanFoamStrength: 0.15
        }
    },
    {
        name: "Height Test", iteration: 13, values: {
            timeScale: 3.03, rainRate: 1, dropFallSpeed: 3.3, dropFallHeight: 2.0,
            dropSize: 0.0188, surfaceTilt: 0.07, cameraHeight: 6.83,
            oceanWindSpeed: 4.0, oceanWindAngle: 0.0, oceanWaveScale: 1.0, oceanHeightAmp: 0.015,
            oceanChop: 0.4, oceanDirectionSpread: 0.4, oceanSmallWaveCut: 0.5
        }
    },
    {
        name: "Autumn Drips", iteration: 14, values: {
            timeScale: 1.21, rainRate: 10.1, rippleStrengthVariance: 2, dropFallSpeed: 10.3,
            dropFallHeight: 10, dropSize: 0.0059, dropSplashCount: 3, dropSplashHeightFactor: 0.02,
            dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29, dropSplashDriftInheritance: 0.51,
            letterStrength: 0.08, letterSize: 0.163, letterYOffset: 0.15, letterSpeed: 0.04,
            letterWavelength: 0.0212, letterThickness: 2.7, surfaceDepth: 0.256, surfaceTilt: 0,
            cameraHeight: 3.07, sunAngle: 1.47, sunHeight: 1.224, specularPower: 0.5, fresnelPower: 0.4,
            envMapStrength: 1,
            oceanWindSpeed: 5.0, oceanWindAngle: 0.2, oceanWaveScale: 1.0, oceanHeightAmp: 0.012,
            oceanChop: 0.4, oceanDirectionSpread: 0.45, oceanSmallWaveCut: 0.55
        }
    },
    {
        name: "Autumn Rain", iteration: 15, values: {
            timeScale: 1.21, rainRate: 94.95, rippleStrengthVariance: 2, dropFallSpeed: 18,
            dropFallHeight: 10, dropSize: 0.0059, dropSplashCount: 3, dropSplashHeightFactor: 0.02,
            dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29, dropSplashDriftInheritance: 0.51,
            letterStrength: 0.18, letterSize: 0.208, letterSpacing: 0.56, letterYOffset: 0.15,
            letterSpeed: 0.071, letterWavelength: 0.0161, letterThickness: 2.7, surfaceDepth: 0.256,
            surfaceTilt: 0, cameraHeight: 3.07, sunAngle: 1.47, sunHeight: 1.224, specularPower: 0.5,
            fresnelPower: 0.4, envMapStrength: 1,
            oceanWindSpeed: 7.0, oceanWindAngle: 0.3, oceanWaveScale: 1.2, oceanHeightAmp: 0.022,
            oceanChop: 0.55, oceanDirectionSpread: 0.5, oceanSmallWaveCut: 0.5
        }
    },
    {
        name: "Autumn Nicey", iteration: 16, values: {
            timeScale: 1.21, rainRate: 10.1, rippleStrengthVariance: 2, dropFallSpeed: 10.3,
            dropFallHeight: 10, dropSize: 0.0059, dropSplashCount: 3, dropSplashHeightFactor: 0.02,
            dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29, dropSplashDriftInheritance: 0.51,
            letterStrength: 0.08, letterSize: 0.163, letterYOffset: 0.15, letterSpeed: 0.04,
            letterWavelength: 0.0212, letterThickness: 2.7, surfaceDepth: 0.256, surfaceTilt: 0,
            cameraHeight: 3.07, sunAngle: 1.47, sunHeight: 1.224, specularPower: 0.5, fresnelPower: 0.4,
            envMapStrength: 0.52, waterDepth: 0.636, refractionStrength: 0.32, bedImageEnabled: 1,
            oceanWindSpeed: 5.5, oceanWindAngle: 0.2, oceanWaveScale: 1.0, oceanHeightAmp: 0.012,
            oceanChop: 0.4, oceanDirectionSpread: 0.45, oceanSmallWaveCut: 0.55
        }
    },
    {
        name: "FXAA Test", iteration: 17, values: {
            timeScale: 1.21, rainRate: 10.1, gridResolution: 1016, rippleStrengthVariance: 2,
            dropFallSpeed: 10.3, dropFallHeight: 10, dropSize: 0.0059, dropSplashCount: 3,
            dropSplashHeightFactor: 0.02, dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29,
            dropSplashDriftInheritance: 0.51, letterStrength: 0.08, letterSize: 0.163,
            letterYOffset: 0.15, letterSpeed: 0.04, letterWavelength: 0.0212, letterThickness: 2.7,
            surfaceTilt: 0.39, waterDepth: 0.636, surfaceDepth: 0.256, refractionStrength: 0.32,
            fxaaStrength: 1, bgImageIndex: 9, envMapStrength: 1, envMapZoom: 2.59, envMapPanY: 0.6,
            bedImageEnabled: 1, bedImageIndex: 10, sunAngle: 1.47, sunHeight: 1.224, specularPower: 0.5,
            fresnelPower: 0.4,
            oceanWindSpeed: 6.0, oceanWindAngle: 0.0, oceanWaveScale: 1.0, oceanHeightAmp: 0.015,
            oceanChop: 0.5, oceanDirectionSpread: 0.5, oceanSmallWaveCut: 0.5
        }
    },
    {
        name: "Night Night", iteration: 18, values: {
            rainRate: 82.8, dropFallSpeed: 2.1, waterColorR: 0.505, waterDeepR: 0.182,
            bgImageIndex: 8, envMapStrength: 0.38, envMapZoom: 0.92, envMapPanX: 0.09, envMapPanY: 0.09,
            bedImageEnabled: 1, sunAngle: -1.46, specularPower: 0.2, specularStrength: -1.354,
            fresnelPower: 0.55, skyHorizonR: 0.646, skyZenithR: 0.293,
            oceanWindSpeed: 5.0, oceanWindAngle: 0.5, oceanWaveScale: 1.1, oceanHeightAmp: 0.02,
            oceanChop: 0.5, oceanDirectionSpread: 0.5, oceanSmallWaveCut: 0.5
        }
    },
    {
        name: "Night Night 2", iteration: 19, values: {
            timeScale: 1.21, rainRate: 10.1, gridResolution: 640, rippleStrengthVariance: 2,
            dropFallSpeed: 10.3, dropFallHeight: 10, dropSize: 0.0134, dropSplashCount: 3,
            dropSplashHeightFactor: 0.02, dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29,
            dropSplashDriftInheritance: 0.51, letterSpacing: 0.35, letterSpeed: 0.04,
            letterStrength: 0.08, letterSize: 0.5, letterYOffset: 0.15, letterWavelength: 0.0212,
            letterThickness: 2.7, cameraHeight: 2, surfaceTilt: 0.13, perspectiveStrength: 0.33,
            waterDepth: 0.515, surfaceDepth: 0.256, refractionStrength: 0.247,
            waterColorR: 0.707, waterColorG: 0.717, waterColorB: 0.768,
            waterDeepR: 0.293, waterDeepG: 0.303, waterDeepB: 0.333,
            bgImageIndex: 9, envMapStrength: 0.92, envMapZoom: 2.09, envMapPanX: 0.03, envMapPanY: 0.49,
            bedImageEnabled: 1, bedImageIndex: 10, sunAngle: 1.47, sunHeight: 1.224, specularPower: 0.5,
            fresnelPower: 0.52,
            oceanWindSpeed: 6.5, oceanWindAngle: 0.2, oceanWaveScale: 1.0, oceanHeightAmp: 0.016,
            oceanChop: 0.5, oceanDirectionSpread: 0.55, oceanSmallWaveCut: 0.5
        }
    },
    {
        name: "Night Night 3", iteration: 19, values: {
            timeScale: 1.2, rainRate: 32.3, gridResolution: 640, simRainImpulse: 0.12,
            rippleStrengthVariance: 2, dropFallSpeed: 10.3, dropFallHeight: 10, dropSize: 0.0074,
            dropSplashCount: 3, dropSplashHeightFactor: 0.02, dropSplashStrengthFactor: 0.07,
            dropSplashSizeFactor: 0.29, dropSplashDriftInheritance: 0.51, letterSpacing: 0.41,
            letterSpeed: 0.04, letterStrength: 0.258, letterSize: 0.356, letterYOffset: 0.15,
            letterWavelength: 0.0212, letterThickness: 2.7, cameraHeight: 2, surfaceTilt: 0.13,
            perspectiveStrength: 0.33, waterDepth: 0.515, surfaceDepth: 0.101, refractionStrength: 0.247,
            waterColorR: 0.505, waterColorG: 0.556, waterColorB: 0.535,
            waterDeepR: 0.515, waterDeepG: 0.576, waterDeepB: 0.556,
            bgImageIndex: 9, envMapStrength: 0.82, envMapZoom: 2.09, envMapPanX: 0.03, envMapPanY: 0.49,
            bedImageEnabled: 1, bedImageIndex: 10, sunAngle: 1.47, sunHeight: 1.224, specularPower: 2.3,
            specularStrength: -0.263, fresnelPower: 0.73,
            oceanWindSpeed: 9.0, oceanWindAngle: 0.3, oceanWaveScale: 1.2, oceanHeightAmp: 0.03,
            oceanChop: 0.7, oceanDirectionSpread: 0.6, oceanSmallWaveCut: 0.45,
            oceanFoamThreshold: 0.55, oceanFoamStrength: 0.8
        }
    },
    {
        name: "Down at the beach", iteration: 18, values: {
            timeScale: 1.2, rainRate: 20.2, gridResolution: 1024, rippleStrengthVariance: 2,
            rippleDriftX: -0.2, rippleDriftY: -0.1, dropFallSpeed: 10.3, dropFallHeight: 10,
            dropSize: 0.0059, dropSplashCount: 3, dropSplashHeightFactor: 0.02,
            dropSplashStrengthFactor: 0.07, dropSplashSizeFactor: 0.29, dropSplashDriftInheritance: 0.51,
            letterSpacing: 0.37, letterSpeed: 0.01, letterStrength: 0.116, letterSize: 0.257,
            letterYOffset: 0.15, letterWavelength: 0.0212, cameraHeight: 2.4, surfaceTilt: 0.33,
            waterDepth: 0, absorption: 0, surfaceDepth: 0.727, refractionStrength: 0.056,
            waterColorR: 0.626, waterColorG: 0.687, waterColorB: 0.727,
            waterDeepR: 0.333, waterDeepG: 0.354, waterDeepB: 0.434,
            bgImageIndex: 6, envMapStrength: 0.55, envMapZoom: 1.3, envMapPanY: 0.6,
            bedImageEnabled: 1, bedImageIndex: 8, sunAngle: 1.47, sunHeight: 1.224, specularPower: 50,
            specularStrength: 0.141, fresnelPower: 0.67,
            skyHorizonR: 0.576, skyHorizonG: 0.424, skyHorizonB: 0.394,
            skyZenithR: 0.545, skyZenithG: 0.323, skyZenithB: 0.293,
            oceanWindSpeed: 4.5, oceanWindAngle: -0.2, oceanWaveScale: 0.9, oceanHeightAmp: 0.01,
            oceanChop: 0.35, oceanDirectionSpread: 0.4, oceanSmallWaveCut: 0.6
        }
    },
    {
    "name": "Preset 20",
    "iteration": 20,
    "values": {
        "timeScale": 1.2,
        "rainRate": 20.2,
        "rippleStrengthVariance": 2,
        "rippleDriftX": -0.2,
        "rippleDriftY": -0.1,
        "dropFallSpeed": 10.3,
        "dropFallHeight": 10,
        "dropSize": 0.0059,
        "dropSplashCount": 3,
        "dropSplashHeightFactor": 0.02,
        "dropSplashStrengthFactor": 0.07,
        "dropSplashSizeFactor": 0.29,
        "dropSplashDriftInheritance": 0.51,
        "letterSpacing": 0.37,
        "letterSpeed": 0.01,
        "letterStrength": 0.116,
        "letterSize": 0.257,
        "letterYOffset": 0.15,
        "letterWavelength": 0.0212,
        "oceanWindSpeed": 4.5,
        "oceanWindAngle": -0.2,
        "oceanWaveScale": 0.89,
        "oceanHeightAmp": 0.064,
        "oceanChop": 0.44,
        "oceanSmallWaveCut": 0.6,
        "oceanDirectionSpread": 0.69,
        "oceanDetail": 1.57,
        "oceanFoamThreshold": 0.67,
        "oceanFoamStrength": 0.71,
        "cameraHeight": 2.4,
        "surfaceTilt": 0.33,
        "waterDepth": 0.455,
        "absorption": 0,
        "surfaceDepth": 0.727,
        "refractionStrength": 0.101,
        "waterColorR": 0.556,
        "waterColorG": 0.566,
        "waterColorB": 0.646,
        "waterDeepR": 0.576,
        "waterDeepG": 0.606,
        "waterDeepB": 0.697,
        "bgImageIndex": 6,
        "envMapStrength": 0.55,
        "envMapZoom": 1.3,
        "envMapPanY": 0.6,
        "bedImageEnabled": 1,
        "bedImageIndex": 8,
        "bedImageSeamless": 9,
        "causticStrength": 0.32,
        "simCausticStrength": 0.46,
        "causticRGBScale": 0,
        "causticRGBAngle": -6.28,
        "bedDepthScale": 6,
        "sunAngle": 1.47,
        "sunHeight": 1.224,
        "specularPower": 50,
        "specularStrength": 0.141,
        "fresnelPower": 0.67,
        "skyHorizonR": 0.576,
        "skyHorizonG": 0.424,
        "skyHorizonB": 0.394,
        "skyZenithR": 0.545,
        "skyZenithG": 0.323,
        "skyZenithB": 0.293
    }
},
{
    "name": "Preset 21",
    "iteration": 21,
    "values": {
        "timeScale": 1.2,
        "rainRate": 0,
        "rippleStrengthVariance": 2,
        "rippleDriftX": -0.2,
        "rippleDriftY": -0.1,
        "dropFallSpeed": 10.3,
        "dropFallHeight": 10,
        "dropSize": 0.0059,
        "dropSplashCount": 3,
        "dropSplashHeightFactor": 0.02,
        "dropSplashStrengthFactor": 0.07,
        "dropSplashSizeFactor": 0.29,
        "dropSplashDriftInheritance": 0.51,
        "letterSpacing": 0.37,
        "letterSpeed": 0.01,
        "letterStrength": 0.116,
        "letterSize": 0.257,
        "letterYOffset": 0.15,
        "letterWavelength": 0.0212,
        "oceanWindSpeed": 4.5,
        "oceanWindAngle": -0.2,
        "oceanWaveScale": 1.53,
        "oceanHeightAmp": 0.03,
        "oceanChop": -1.5,
        "oceanSmallWaveCut": 0.6,
        "oceanDirectionSpread": 0.69,
        "oceanDetail": 1.57,
        "oceanFoamThreshold": 0.67,
        "oceanFoamStrength": 0.71,
        "cameraHeight": 2.4,
        "surfaceTilt": 0.33,
        "waterDepth": 0.333,
        "absorption": 2.83,
        "surfaceDepth": 0.727,
        "refractionStrength": 0.5,
        "waterColorR": 0.253,
        "waterColorG": 0.293,
        "waterColorB": 0.364,
        "waterDeepR": 0.202,
        "waterDeepG": 0.242,
        "waterDeepB": 0.354,
        "bgImageIndex": 6,
        "envMapStrength": 0.55,
        "envMapZoom": 1.3,
        "envMapPanY": 0.6,
        "bedImageEnabled": 1,
        "bedImageIndex": 8,
        "bedImageSeamless": 9,
        "causticStrength": 0.32,
        "simCausticStrength": 0.46,
        "causticRGBScale": 0,
        "causticRGBAngle": -6.28,
        "bedDepthScale": 13.9,
        "sunAngle": 1.47,
        "sunHeight": 1.224,
        "specularPower": 50,
        "specularStrength": 0.141,
        "fresnelPower": 0.67,
        "skyHorizonR": 0.576,
        "skyHorizonG": 0.424,
        "skyHorizonB": 0.394,
        "skyZenithR": 0.545,
        "skyZenithG": 0.323,
        "skyZenithB": 0.293
    }
}
];

// =====================================================================
// GLOBALS
// =====================================================================

var MAX_DROPS = 128;
var MAX_LETTERS = 24;
var MAX_FALLING_DROPS = 128;

var state = Object.assign({}, DEFAULTS);
var meshRebuildFn = null;

var transitionActive = false;
var transitionStartTime = 0;
var transitionDuration = 0;
var transitionSource = null;
var transitionTarget = null;

var bgPendingTargetUpload = false;
var bedPendingTargetUpload = false;

// =====================================================================
// FORMAT HELPERS
// =====================================================================

function fmtVal(v) {
    if (v === 0) return "0";
    var abs = Math.abs(v);
    if (abs >= 100) return v.toFixed(1);
    if (abs >= 1) return v.toFixed(3);
    if (abs >= 0.01) return v.toFixed(4);
    if (abs >= 0.0001) return v.toFixed(6);
    return v.toExponential(3);
}

// =====================================================================
// SCALE DROPDOWN HELPERS
// =====================================================================

function setScaleDropdownEnabled(key, enabled) {
    var sel = document.querySelector('select[data-key="' + key + '"]');
    if (!sel) return;
    sel.disabled = !enabled;
    sel.style.opacity = enabled ? "1" : "0.4";
    sel.style.cursor = enabled ? "pointer" : "not-allowed";
    sel.title = enabled
        ? "Image size not in standard options — dropdown controls the resample target"
        : "Image is already a standard size — used at native resolution";
}

function sourceMatchesScaleOption(img) {
    if (!img) return false;
    for (var i = 0; i < SCALE_OPTIONS.length; i++) {
        if (img.naturalWidth === SCALE_OPTIONS[i].w &&
            img.naturalHeight === SCALE_OPTIONS[i].h) {
            return true;
        }
    }
    return false;
}

// =====================================================================
// IMAGE UTILITIES
// =====================================================================

function loadImage(baseName, offset, ext) {
    return new Promise(function (resolve) {
        var name = baseName + "." + String(offset).padStart(3, "0") + "." + ext;
        var url = "img/" + name;
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            console.log("Loaded " + url + " (" + img.naturalWidth + "x" + img.naturalHeight + ")");
            resolve(img);
        };
        img.onerror = function (e) {
            console.error("Failed to load " + url, e);
            resolve(null);
        };
        img.src = url;
    });
}

function processImage(img, targetW, targetH, seamlessX, seamlessY) {
    var srcW = img.naturalWidth;
    var srcH = img.naturalHeight;

    var useW = targetW;
    var useH = targetH;
    var matched = false;
    for (var i = 0; i < SCALE_OPTIONS.length; i++) {
        if (srcW === SCALE_OPTIONS[i].w && srcH === SCALE_OPTIONS[i].h) {
            useW = srcW;
            useH = srcH;
            matched = true;
            break;
        }
    }

    var canvas = document.createElement("canvas");
    canvas.width = useW;
    canvas.height = useH;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (matched) {
        ctx.drawImage(img, 0, 0);
    } else {
        var isDownscale = srcW > useW || srcH > useH;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = isDownscale ? "high" : "low";
        ctx.drawImage(img, 0, 0, useW, useH);
    }

    if (seamlessX === 0 && seamlessY === 0) {
        return canvas;
    }

    if (seamlessX > 0) {
        var Sx = Math.max(1, Math.floor((seamlessX / 100) * useW * 0.5));
        var originalLeft = ctx.getImageData(0, 0, Sx, useH);
        var originalRight = ctx.getImageData(useW - Sx, 0, Sx, useH);
        var newLeft = ctx.createImageData(Sx, useH);
        var newRight = ctx.createImageData(Sx, useH);

        for (var y = 0; y < useH; y++) {
            for (var x = 0; x < Sx; x++) {
                var idx = (y * Sx + x) * 4;
                var opp = Sx - 1 - x;
                var oppIdx = (y * Sx + opp) * 4;

                var t = x / Math.max(1, Sx - 1);
                var weightNative = 0.5 + 0.5 * t;
                var weightOpposite = 1.0 - weightNative;

                newLeft.data[idx] = originalLeft.data[idx] * weightNative + originalRight.data[oppIdx] * weightOpposite;
                newLeft.data[idx + 1] = originalLeft.data[idx + 1] * weightNative + originalRight.data[oppIdx + 1] * weightOpposite;
                newLeft.data[idx + 2] = originalLeft.data[idx + 2] * weightNative + originalRight.data[oppIdx + 2] * weightOpposite;
                newLeft.data[idx + 3] = 255;

                var tRight = (Sx - 1 - x) / Math.max(1, Sx - 1);
                var weightNativeRight = 0.5 + 0.5 * tRight;
                var weightOppositeRight = 1.0 - weightNativeRight;

                newRight.data[idx] = originalRight.data[idx] * weightNativeRight + originalLeft.data[oppIdx] * weightOppositeRight;
                newRight.data[idx + 1] = originalRight.data[idx + 1] * weightNativeRight + originalLeft.data[oppIdx + 1] * weightOppositeRight;
                newRight.data[idx + 2] = originalRight.data[idx + 2] * weightNativeRight + originalLeft.data[oppIdx + 2] * weightOppositeRight;
                newRight.data[idx + 3] = 255;
            }
        }
        ctx.putImageData(newLeft, 0, 0);
        ctx.putImageData(newRight, useW - Sx, 0);
    }

    if (seamlessY > 0) {
        var Sy = Math.max(1, Math.floor((seamlessY / 100) * useH * 0.5));
        var originalTop = ctx.getImageData(0, 0, useW, Sy);
        var originalBottom = ctx.getImageData(0, useH - Sy, useW, Sy);
        var newTop = ctx.createImageData(useW, Sy);
        var newBottom = ctx.createImageData(useW, Sy);

        for (var yy = 0; yy < Sy; yy++) {
            var oppY = Sy - 1 - yy;

            var ty = yy / Math.max(1, Sy - 1);
            var weightNativeY = 0.5 + 0.5 * ty;
            var weightOppositeY = 1.0 - weightNativeY;

            var tBottom = (Sy - 1 - yy) / Math.max(1, Sy - 1);
            var weightNativeBottom = 0.5 + 0.5 * tBottom;
            var weightOppositeBottom = 1.0 - weightNativeBottom;

            for (var xx = 0; xx < useW; xx++) {
                var ixx = (yy * useW + xx) * 4;
                var oppIxx = (oppY * useW + xx) * 4;

                newTop.data[ixx] = originalTop.data[ixx] * weightNativeY + originalBottom.data[oppIxx] * weightOppositeY;
                newTop.data[ixx + 1] = originalTop.data[ixx + 1] * weightNativeY + originalBottom.data[oppIxx + 1] * weightOppositeY;
                newTop.data[ixx + 2] = originalTop.data[ixx + 2] * weightNativeY + originalBottom.data[oppIxx + 2] * weightOppositeY;
                newTop.data[ixx + 3] = 255;

                newBottom.data[ixx] = originalBottom.data[ixx] * weightNativeBottom + originalTop.data[oppIxx] * weightOppositeBottom;
                newBottom.data[ixx + 1] = originalBottom.data[ixx + 1] * weightNativeBottom + originalTop.data[oppIxx + 1] * weightOppositeBottom;
                newBottom.data[ixx + 2] = originalBottom.data[ixx + 2] * weightNativeBottom + originalTop.data[oppIxx + 2] * weightOppositeBottom;
                newBottom.data[ixx + 3] = 255;
            }
        }
        ctx.putImageData(newTop, 0, 0);
        ctx.putImageData(newBottom, 0, useH - Sy);
    }

    return canvas;
}

function updateThumbnail(slot, canvas) {
    var previewId = slot === "bg" ? "bg-thumb" : "bed-thumb";
    var el = document.getElementById(previewId);
    if (!el || !canvas) return;
    try {
        el.src = canvas.toDataURL("image/jpeg", 0.85);
    } catch (e) {
        console.warn("Thumbnail encode failed for " + slot, e);
    }
}

// =====================================================================
// CONTROL PANEL
// =====================================================================

function buildControlsUI() {
    var list = document.getElementById("controls-list");
    list.innerHTML = "";

    function makeHeading(text, isFirst, group) {
        var head = document.createElement("div");
        head.className = "ctrl-row";
        head.style.gridColumn = "1 / -1";
        head.style.flex = "0 0 100%";
        head.style.width = "100%";
        head.style.display = "flex";
        head.style.alignItems = "center";
        head.style.justifyContent = "space-between";
        head.style.margin = "16px 0 6px 0";
        head.style.paddingTop = "12px";
        head.style.fontWeight = "bold";
        head.style.fontSize = "1.1em";
        head.style.color = "#ddd";
        if (!isFirst) head.style.borderTop = "1px solid #555";

        var label = document.createElement("span");
        label.textContent = text;
        head.appendChild(label);

        var showExtras = (group.showExtras !== false);

        var btnBox = document.createElement("span");
        btnBox.style.display = showExtras ? "flex" : "none";
        btnBox.style.gap = "4px";

        if (showExtras) {
            var randBtn = document.createElement("button");
            randBtn.className = "reset-btn";
            randBtn.textContent = "R";
            randBtn.title = "Randomise this group's values";
            randBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                randomiseGroup(group, randBtn);
            });

            var copyBtn = document.createElement("button");
            copyBtn.className = "reset-btn";
            copyBtn.textContent = "C";
            copyBtn.title = "Copy this group's values";
            copyBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                copyGroup(group, copyBtn);
            });

            var pasteBtn = document.createElement("button");
            pasteBtn.className = "reset-btn";
            pasteBtn.textContent = "P";
            pasteBtn.title = "Paste values into this group";
            pasteBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                pasteGroup(group, pasteBtn);
            });

            btnBox.appendChild(randBtn);
            btnBox.appendChild(copyBtn);
            btnBox.appendChild(pasteBtn);
        }

        head.appendChild(btnBox);
        list.appendChild(head);
    }

    function makeThumbnail(slot) {
        var thumbRow = document.createElement("div");
        thumbRow.className = "ctrl-row";
        thumbRow.style.gridColumn = "1 / -1";
        thumbRow.style.flex = "0 0 100%";
        thumbRow.style.width = "100%";
        thumbRow.style.display = "block";
        thumbRow.style.margin = "4px 0 8px 0";
        var img = document.createElement("img");
        img.id = slot + "-thumb";
        img.style.width = "100%";
        img.style.display = "block";
        img.style.border = "1px solid #333";
        img.style.boxSizing = "border-box";
        img.alt = "";
        thumbRow.appendChild(img);
        list.appendChild(thumbRow);
    }

    function makeControl(c) {
        var key = c.key;
        var current = state[key];
        var isInt = !!c.int;
        var row = document.createElement("div");
        row.className = "ctrl-row";
        var label = document.createElement("label");
        label.title = "[" + key + "] " + (c.details || "");   // tooltip

        var iconSpan = document.createElement("span");
        iconSpan.style.display = "inline-block";
        iconSpan.style.width = "1.6em";
        iconSpan.style.textAlign = "center";
        iconSpan.style.flexShrink = "0";
        iconSpan.style.marginRight = "2px";
        iconSpan.textContent = c.icon || "";
        label.appendChild(iconSpan);

        label.appendChild(document.createTextNode(c.label || key));   // uses label, falls back to key

        if (c.special === "scale") {
            var scaleSel = document.createElement("select");
            scaleSel.dataset.key = key;
            SCALE_OPTIONS.forEach(function (opt, i) {
                var o = document.createElement("option");
                o.value = i;
                o.textContent = opt.label;
                scaleSel.appendChild(o);
            });
            scaleSel.value = String(current);
            scaleSel.disabled = true;
            scaleSel.style.opacity = "0.4";
            scaleSel.style.cursor = "not-allowed";
            scaleSel.title = "Loading image…";
            scaleSel.addEventListener("change", function () {
                state[key] = parseInt(scaleSel.value, 10);
                if (key === "bgImageScale" && window.__applyBg) window.__applyBg();
                if (key === "bedImageScale" && window.__applyBed) window.__applyBed();
            });
            var resetBtnS = document.createElement("button");
            resetBtnS.className = "reset-btn";
            resetBtnS.textContent = "↺";
            resetBtnS.addEventListener("click", function () {
                state[key] = c.def;
                scaleSel.value = String(c.def);
                if (key === "bgImageScale" && window.__applyBg) window.__applyBg();
                if (key === "bedImageScale" && window.__applyBed) window.__applyBed();
            });
            row.appendChild(label);
            row.appendChild(scaleSel);
            row.appendChild(resetBtnS);
            list.appendChild(row);
            return;
        }

        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = c.min; slider.max = c.max; slider.step = c.step;
        slider.value = current;
        slider.dataset.key = key;
        var number = document.createElement("input");
        number.type = "number";
        number.step = c.step;
        number.value = isInt ? String(Math.round(current)) : fmtVal(current);
        number.dataset.key = key;
        var resetBtn = document.createElement("button");
        resetBtn.className = "reset-btn";
        resetBtn.textContent = "↺";

        var isMeshRebuild = (key === "gridResolution");
        var onBgChange = (key === "bgImageIndex" || key === "bgImageSeamless");
        var onBedChange = (key === "bedImageIndex" || key === "bedImageSeamless");

        slider.addEventListener("input", function () {
            var v = parseFloat(slider.value);
            if (isInt) v = Math.round(v);
            state[key] = v;
            number.value = isInt ? String(v) : fmtVal(v);
        });
        slider.addEventListener("change", function () {
            if (isMeshRebuild && typeof meshRebuildFn === "function") meshRebuildFn(Math.round(state.gridResolution));
            if (onBgChange && window.__applyBg) window.__applyBg();
            if (onBedChange && window.__applyBed) window.__applyBed();
            if (key === "liveText" && window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
        });
        number.addEventListener("change", function () {
            var v = parseFloat(number.value);
            if (isNaN(v)) { number.value = fmtVal(state[key]); return; }
            if (isInt) v = Math.max(c.min, Math.min(c.max, Math.round(v)));
            state[key] = v;
            slider.value = v;
            number.value = isInt ? String(v) : fmtVal(v);
            if (isMeshRebuild && typeof meshRebuildFn === "function") meshRebuildFn(Math.round(v));
            if (onBgChange && window.__applyBg) window.__applyBg();
            if (onBedChange && window.__applyBed) window.__applyBed();
            if (key === "liveText" && window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
        });
        resetBtn.addEventListener("click", function () {
            state[key] = c.def;
            slider.value = c.def;
            number.value = isInt ? String(Math.round(c.def)) : fmtVal(c.def);
            if (isMeshRebuild && typeof meshRebuildFn === "function") meshRebuildFn(Math.round(c.def));
            if (onBgChange && window.__applyBg) window.__applyBg();
            if (onBedChange && window.__applyBed) window.__applyBed();
            if (key === "liveText" && window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
        });

        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(number);
        row.appendChild(resetBtn);
        list.appendChild(row);

        if (key === "bgImageEnabled") makeThumbnail("bg");
        if (key === "bedImageEnabled") makeThumbnail("bed");
    }

    CONTROLS.forEach(function (group, gi) {
        makeHeading(group.heading, gi === 0, group);
        group.controls.forEach(makeControl);
    });
}

function isControlRandomisable(c) {
    if (c.canRandomise === false) return false;   // explicit opt-out wins
    if (c.canRandomise === true) return true;    // explicit opt-in
    // Default: only plain numeric sliders are randomisable.
    if (c.special) return false;
    if (typeof c.min !== "number" || typeof c.max !== "number") return false;
    return true;
}

function randomiseGroup(group, btn) {
    if (!group || !group.controls) return;

    var prevGrid = Math.round(state.gridResolution);
    var needBg = false;
    var needBed = false;
    var needLiveText = false;

    group.controls.forEach(function (c) {
        if (!isControlRandomisable(c)) return;
        var k = c.key;
        var v;
        if (c.int) {
            var lo = Math.ceil(c.min);
            var hi = Math.floor(c.max);
            v = lo + Math.floor(Math.random() * (hi - lo + 1));
        } else {
            v = c.min + Math.random() * (c.max - c.min);
            // Snap to step
            if (c.step > 0) {
                v = c.min + Math.round((v - c.min) / c.step) * c.step;
                // Guard against float drift past max
                if (v > c.max) v = c.max;
                if (v < c.min) v = c.min;
            }
        }
        state[k] = v;

        if (k === "bgImageIndex" || k === "bgImageScale" || k === "bgImageSeamless") needBg = true;
        if (k === "bedImageIndex" || k === "bedImageScale" || k === "bedImageSeamless") needBed = true;
        if (k === "liveText") needLiveText = true;
    });

    if (transitionActive) {
        transitionActive = false;
        bgBlend = 0;
        bedBlend = 0;
    }

    refreshControlsUI();

    if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
        meshRebuildFn(Math.round(state.gridResolution));
    }
    if (needBg && window.__applyBg) window.__applyBg();
    if (needBed && window.__applyBed) window.__applyBed();
    if (needLiveText && window.__applyLiveText) window.__applyLiveText(state.liveText === 1);

    if (btn) {
        var oldTxt = btn.textContent;
        btn.textContent = "✓";
        setTimeout(function () { btn.textContent = oldTxt; }, 400);
    }
}

function refreshControlsUI() {
    Object.keys(DEFAULTS).forEach(function (key) {
        var v = state[key];
        var isInt = !!INT_KEYS[key];
        if (isInt) v = Math.round(v);
        var sliders = document.querySelectorAll('input[type=range][data-key="' + key + '"]');
        var numbers = document.querySelectorAll('input[type=number][data-key="' + key + '"]');
        var sels = document.querySelectorAll('select[data-key="' + key + '"]');
        var c = CONTROL_BY_KEY[key];
        if (!c) return;
        sliders.forEach(function (s) { s.min = c.min; s.max = c.max; s.step = c.step; s.value = v; });
        numbers.forEach(function (n) { n.step = c.step; n.value = isInt ? String(v) : fmtVal(v); });
        sels.forEach(function (s) { s.value = String(v); });
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

    var target = {};
    Object.keys(DEFAULTS).forEach(function (key) {
        if (STANDALONE_KEYS[key]) {
            target[key] = state[key];
        } else if (p.values && key in p.values) {
            target[key] = p.values[key];
        } else {
            target[key] = DEFAULTS[key];
        }
    });
    Object.keys(INT_KEYS).forEach(function (k) { target[k] = Math.round(target[k]); });

    var transitionTime = state.presetTransitionTime;
    if (transitionTime > 0) {
        transitionSource = Object.assign({}, state);
        transitionTarget = target;
        transitionActive = true;
        transitionStartTime = performance.now();
        transitionDuration = transitionTime * 1000;

        ["bgImageIndex", "bgImageScale", "bgImageSeamless",
            "bedImageIndex", "bedImageScale", "bedImageSeamless",
            "liveText"].forEach(function (k) {
                if (k in target && !STANDALONE_KEYS[k]) state[k] = target[k];
            });
        refreshControlsUI();

        bgPendingTargetUpload = true;
        bedPendingTargetUpload = true;
        if (window.__applyBgTarget) window.__applyBgTarget();
        if (window.__applyBedTarget) window.__applyBedTarget();
        bgPendingTargetUpload = false;
        bedPendingTargetUpload = false;

        if (target.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
            meshRebuildFn(target.gridResolution);
        }
        if (window.__applyLiveText) window.__applyLiveText(target.liveText === 1);
    } else {
        transitionActive = false;
        Object.keys(DEFAULTS).forEach(function (key) {
            if (STANDALONE_KEYS[key]) return;
            state[key] = target[key];
        });
        refreshControlsUI();
        if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
            meshRebuildFn(state.gridResolution);
        }
        if (window.__applyBg) window.__applyBg();
        if (window.__applyBed) window.__applyBed();
        if (window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
    }
}

function currentValuesAsJSON() {
    var vals = {};
    Object.keys(DEFAULTS).forEach(function (key) {
        if (STANDALONE_KEYS[key]) return;
        var v = INT_KEYS[key] ? Math.round(state[key]) : state[key];
        if (v !== DEFAULTS[key]) vals[key] = v;
    });
    return vals;
}

// =====================================================================
// GROUP CLIPBOARD (copy/paste per control group)
// =====================================================================

var groupClipboard = {};

function copyGroup(group, btn) {
    var vals = {};
    group.controls.forEach(function (c) {
        vals[c.key] = state[c.key];
    });
    groupClipboard[group.heading] = vals;
    if (btn) btn.textContent = "✓";
}

function pasteGroup(group, btn) {
    var vals = groupClipboard[group.heading];
    if (!vals) {
        if (btn) {
            var oldTxt = btn.textContent;
            btn.textContent = "—";
            setTimeout(function () { btn.textContent = oldTxt; }, 400);
        }
        return;
    }

    var prevGrid = Math.round(state.gridResolution);
    var needBg = false;
    var needBed = false;
    var needLiveText = false;

    group.controls.forEach(function (c) {
        var k = c.key;
        if (!(k in vals)) return;
        var v = vals[k];
        if (INT_KEYS[k]) v = Math.round(v);
        state[k] = v;

        if (k === "bgImageIndex" || k === "bgImageScale" || k === "bgImageSeamless") needBg = true;
        if (k === "bedImageIndex" || k === "bedImageScale" || k === "bedImageSeamless") needBed = true;
        if (k === "liveText") needLiveText = true;
    });

    if (transitionActive) {
        transitionActive = false;
        bgBlend = 0;
        bedBlend = 0;
    }

    refreshControlsUI();

    if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
        meshRebuildFn(Math.round(state.gridResolution));
    }
    if (needBg && window.__applyBg) window.__applyBg();
    if (needBed && window.__applyBed) window.__applyBed();
    if (needLiveText && window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
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
        transitionActive = false;
        Object.keys(DEFAULTS).forEach(function (k) {
            if (STANDALONE_KEYS[k]) return;
            state[k] = DEFAULTS[k];
        });
        Object.keys(INT_KEYS).forEach(function (k) { state[k] = Math.round(state[k]); });
        refreshControlsUI();
        if (state.gridResolution !== prevGrid && typeof meshRebuildFn === "function") {
            meshRebuildFn(state.gridResolution);
        }
        if (window.__applyBg) window.__applyBg();
        if (window.__applyBed) window.__applyBed();
        if (window.__applyLiveText) window.__applyLiveText(state.liveText === 1);
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
// SDF ATLAS
// =====================================================================

function buildSDFAtlas(gl, fontName) {
    var CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:;'\"-()&/+*%#@<>_=";
    var CELL = 196, PAD = 4, SPREAD = 16, COLS = 8;
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
// SPHERE MESH
// =====================================================================

function buildSphereMesh(gl, segments) {
    segments = Math.max(4, Math.min(64, segments | 0));
    var vcount = (segments + 1) * (segments + 1);
    var positions = new Float32Array(vcount * 3);
    var normals = new Float32Array(vcount * 3);
    var indices = new Uint16Array(segments * segments * 6);
    var p = 0, n = 0, k = 0;
    for (var lat = 0; lat <= segments; lat++) {
        var theta = lat * Math.PI / segments;
        var sinT = Math.sin(theta), cosT = Math.cos(theta);
        for (var lon = 0; lon <= segments; lon++) {
            var phi = lon * 2 * Math.PI / segments;
            var sinP = Math.sin(phi), cosP = Math.cos(phi);
            var x = cosP * sinT;
            var y = sinT * sinP;
            var z = cosT;
            positions[p++] = x; positions[p++] = y; positions[p++] = z;
            normals[n++] = x; normals[n++] = y; normals[n++] = z;
        }
    }
    for (var lt = 0; lt < segments; lt++) {
        for (var ln = 0; ln < segments; ln++) {
            var a = lt * (segments + 1) + ln;
            var b = a + segments + 1;
            indices[k++] = a; indices[k++] = b; indices[k++] = a + 1;
            indices[k++] = b; indices[k++] = b + 1; indices[k++] = a + 1;
        }
    }
    var posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    var normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    var idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return { posBuf: posBuf, normBuf: normBuf, idxBuf: idxBuf, indexCount: indices.length, segments: segments };
}

// =====================================================================
// SHADERS
// =====================================================================

var FFT_SIZE = 256;
var FFT_LOG2_SIZE = 8;

var VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec2 gridPos;
    out vec2 v_uv;
    out vec3 v_normal_r, v_normal_g, v_normal_b;
    out float v_height;
    out float v_foam;
    out vec3 v_worldPos;

    uniform float time;
    uniform sampler2D simTexture;
    uniform vec2  simDrift;

    uniform sampler2D oceanTex;
    uniform vec2  oceanTexSize;
    uniform float oceanPatchSize;

    uniform float letterRippleSpeed;
    uniform vec2  rippleDrift;

    uniform sampler2D letterAtlas;
    uniform float letterSpread, letterSize, letterStrengthGlobal;
    uniform int   letterCount;
    uniform vec4  letterRipples[${MAX_LETTERS}];
    uniform vec4  letterRippleParams[${MAX_LETTERS}];
    uniform vec4  letterRippleV[${MAX_LETTERS}];
    uniform float letterSpeed, letterWavelength, letterThickness;

    uniform float rgbSplit, rgbAngle, surfaceDepth, surfaceTilt, perspectiveStrength, cameraHeight;

    vec2 oceanUV(vec2 worldXZ) {
        return fract(worldXZ / oceanPatchSize);
    }

    float fftHeight(vec2 worldXZ) {
        return texture(oceanTex, oceanUV(worldXZ)).r;
    }
    vec2 fftChop(vec2 worldXZ) {
        return texture(oceanTex, oceanUV(worldXZ)).gb;
    }
    float fftFoam(vec2 worldXZ) {
        return texture(oceanTex, oceanUV(worldXZ)).a;
    }
    vec2 fftSlope(vec2 worldXZ) {
        float texel = 1.0 / oceanTexSize.x;
        float hL = texture(oceanTex, oceanUV(worldXZ - vec2(texel * oceanPatchSize, 0.0))).r;
        float hR = texture(oceanTex, oceanUV(worldXZ + vec2(texel * oceanPatchSize, 0.0))).r;
        float hD = texture(oceanTex, oceanUV(worldXZ - vec2(0.0, texel * oceanPatchSize))).r;
        float hU = texture(oceanTex, oceanUV(worldXZ + vec2(0.0, texel * oceanPatchSize))).r;
        float dx = (hR - hL) / (2.0 * texel * oceanPatchSize);
        float dy = (hU - hD) / (2.0 * texel * oceanPatchSize);
        return vec2(dx, dy);
    }

    float letterHeight(vec2 p, float ripplePhaseOffset) {
        float h = 0.0;
        for (int i = 0; i < ${MAX_LETTERS}; i++) {
            if (i >= letterCount) break;
            vec4 r = letterRipples[i];
            vec4 rp = letterRippleParams[i];
            vec4 rv = letterRippleV[i];
            float age = time - r.z;
            if (age < 0.0) continue;
            vec2 centre = r.xy + rippleDrift * age;
            float cosA = cos(rp.z), sinA = sin(rp.z);
            vec2 pRot = vec2(p.x * cosA - p.y * sinA, p.x * sinA + p.y * cosA);
            vec2 centreRot = vec2(centre.x * cosA - centre.y * sinA, centre.x * sinA + centre.y * cosA);
            vec2 local = (pRot - centreRot) / rp.y + 0.5;
            if (local.x < -0.1 || local.x > 1.1 || local.y < -0.1 || local.y > 1.1) continue;
            vec2 sampled = clamp(local, 0.0, 1.0);
            vec2 atlasUV = vec2(mix(rv.x, rv.z, sampled.x), mix(rv.y, rv.w, sampled.y));
            float sdfRaw = texture(letterAtlas, atlasUV).r;
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
            float phase = mod(dist / wavelength - age * letterRippleSpeed / wavelength * 0.85 + phaseShift, 1.0);
            float cyclesBack = behind / wavelength;
            float support = smoothstep(letterThickness, letterThickness * 0.4, cyclesBack);
            h += envelope * support * sin(phase * 6.28318) * r.w * sdfRaw;
        }
        return h;
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
            (texture(simTexture, simUV + vec2(eps, 0.0)).r - 0.5) * 3.0 - (texture(simTexture, simUV - vec2(eps, 0.0)).r - 0.5) * 3.0,
            (texture(simTexture, simUV + vec2(0.0, eps)).r - 0.5) * 3.0 - (texture(simTexture, simUV - vec2(0.0, eps)).r - 0.5) * 3.0
        ) / (2.0 * eps);
    }
    vec3 gradToNormal(vec2 grad, float scale) {
        return normalize(vec3(-grad.x * scale, -grad.y * scale, 1.0));
    }

    void main() {
        vec2 uv = gridPos;
        v_uv = uv;

        float planeX = (uv.x - 0.5) * 4.0;
        float planeY = (uv.y - 0.5) * 4.0;
        vec2 worldXZ = vec2(planeX, planeY);

        float t = time;
        float oceanH = fftHeight(worldXZ);
        float letH = letterHeight(uv, 0.0);
        vec2 simUV = uv + simDrift;
        float simH = (texture(simTexture, simUV).r - 0.5) * 3.0;
        float h = oceanH + letH + simH * 0.15;
        v_height = h;
        v_foam = fftFoam(worldXZ);

        vec2 channelDir = vec2(cos(rgbAngle), sin(rgbAngle)) * rgbSplit;
        vec2 slopeC = fftSlope(worldXZ);
        vec2 slopeL = fftSlope(worldXZ + channelDir);
        vec2 slopeR = fftSlope(worldXZ - channelDir);
        vec2 simG = simGrad(uv);
        vec2 letG = letterGrad(uv, 0.0);

        vec2 gradR = slopeL + letG + simG * 0.15;
        vec2 gradG = slopeC + letG + simG * 0.15;
        vec2 gradB = slopeR + letG + simG * 0.15;

        v_normal_r = gradToNormal(gradR, surfaceDepth);
        v_normal_g = gradToNormal(gradG, surfaceDepth);
        v_normal_b = gradToNormal(gradB, surfaceDepth);

        float heightZ = h * surfaceDepth * 6.0;

        // Tessendorf chop: displace the vertex horizontally by the chop vector
        // sampled from the ocean texture. This sharpens crests/troughs.
        vec2 chop = fftChop(worldXZ);
        float dispX = planeX + chop.x;
        float dispY = planeY + chop.y;

        v_worldPos = vec3(dispX, dispY, heightZ);

        float pitchAngle = surfaceTilt * 1.35;
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);
        vec3 rotPos = vec3(dispX, dispY * cp - heightZ * sp, dispY * sp + heightZ * cp);

        rotPos.z -= cameraHeight;
        float depth = max(-rotPos.z, 0.1);
        vec2 orthoXY = rotPos.xy * 0.35;
        vec2 perspXY = (rotPos.xy / depth) * 1.8;
        vec2 screenXY = mix(orthoXY, perspXY, perspectiveStrength);
        screenXY.y = -screenXY.y;
        gl_Position = vec4(screenXY, 0.0, 1.0);
    }
`;

var SIM_VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec2 position;
    out vec2 v_uv;
    void main() {
        v_uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

function buildSimFragmentSource() {
    return `#version 300 es
        precision highp float;
        in vec2 v_uv;
        out vec4 fragColor;
        uniform sampler2D currState;
        uniform float tension, damping, springiness, impulseStrength, resolution;
        uniform float simDt;
        uniform int   simDropCount;
        uniform vec4  simDrops[${MAX_DROPS}];
        uniform float simDropRadius, simDropCore;

        void main() {
            vec2 texel = 1.0 / vec2(resolution);
            vec4 curr = texture(currState, v_uv);
            float h = curr.r - 0.5;
            float v = curr.g - 0.5;
            float hL = texture(currState, v_uv - vec2(texel.x, 0.0)).r - 0.5;
            float hR = texture(currState, v_uv + vec2(texel.x, 0.0)).r - 0.5;
            float hD = texture(currState, v_uv - vec2(0.0, texel.y)).r - 0.5;
            float hU = texture(currState, v_uv + vec2(0.0, texel.y)).r - 0.5;
            float laplacian = (hL + hR + hD + hU) - 4.0 * h;
            float dt = simDt;
            v += laplacian * tension * dt;
            v -= h * springiness * dt;
            v *= pow(damping, dt);
            h += v * dt;
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
            fragColor = vec4(h + 0.5, v + 0.5, 0.0, 1.0);
        }
    `;
}

function buildFragmentSource() {
    return `#version 300 es
        precision highp float;
        in vec2 v_uv;
        in vec3 v_normal_r, v_normal_g, v_normal_b;
        in float v_height;
        in float v_foam;
        in vec3 v_worldPos;
        out vec4 fragColor;

        uniform vec3 waterColor, waterDeep, skyHorizon, skyZenith, sunDir, sandColor;
        uniform float specularPower, specularStrength, fresnelPower, vignetteRadius, vignetteSoftness;
        uniform float cameraHeight, waterDepth, absorption, sandScale, sandContrast, refractionStrength, envMapStrength;
        uniform float envMapZoom;
        uniform vec2  envMapPan;
        uniform sampler2D envMapA, envMapB;
        uniform float envMapBlend;
        uniform sampler2D simDebugTex;
        uniform float debugSim;
        uniform float foamThreshold, foamStrength;

        uniform sampler2D simTexture;
        uniform vec2 simDrift;
        uniform float simRes;
        uniform float causticStrength;
        uniform float simCausticStrength;
        uniform float causticRGBScale;
        uniform float causticRGBAngle;
        uniform float causticRGBAffectedBySurface;
        uniform float rgbSplit;
        uniform float rgbAngle;

        uniform float bedDepthScale;

        uniform sampler2D bedTextureA, bedTextureB;
        uniform float bedBlend;
        uniform float bedImageEnabled;
        uniform vec2 bedImageTile;

        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float noise2(vec2 p) {
            vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
        }
        vec3 sampleBlended(sampler2D a, sampler2D b, vec2 uv, float blend) {
            if (blend <= 0.001) return texture(a, uv).rgb;
            if (blend >= 0.999) return texture(b, uv).rgb;
            return mix(texture(a, uv).rgb, texture(b, uv).rgb, blend);
        }
        vec3 sandAt(vec2 sp) {
            if (bedImageEnabled > 0.5) {
                return sampleBlended(bedTextureA, bedTextureB, sp * bedImageTile, bedBlend);
            }
            float grain = noise2(sp * sandScale), clump = noise2(sp * sandScale * 0.23);
            float lod = smoothstep(300.0, 800.0, sandScale);
            grain = mix(grain, 0.5, lod);
            return sandColor * (0.5 + (grain * 0.75 + clump * 0.25 - 0.5) * (0.5 + sandContrast));
        }
        vec2 sampleEnvMap(vec3 R) {
            return vec2(
                atan(R.z, R.x) / (2.0 * 3.14159265) + 0.5,
                acos(clamp(R.y, -1.0, 1.0)) / 3.14159265
            );
        }
        vec2 envSampleUV(vec3 R) {
            vec2 uv = sampleEnvMap(R);
            uv = (uv - envMapPan) * envMapZoom + envMapPan;
            return uv;
        }
        vec3 skyReflection(vec3 R) {
            float up = clamp(R.y, -1.0, 1.0);
            vec2 uv = envSampleUV(R);
            vec3 envCol = sampleBlended(envMapA, envMapB, uv, envMapBlend);
            vec3 proc = mix(
                mix(waterDeep * 0.5,
                    mix(skyHorizon, skyZenith, smoothstep(0.0, 0.7, up)),
                    smoothstep(-0.3, 0.05, up)),
                envCol,
                envMapStrength
            );
            return proc * 3.0;
        }

        // Trace the refracted view ray down to an implicit bed plane at z = -bedDepth,
        // and return the UV where it hits, plus a mask (1 = hit inside the bed, 0 = missed).
vec3 traceToBed(vec3 worldPos, vec3 V, vec3 N, out vec2 bedUV) {
    // Project view direction onto the water plane (xy)
    vec2 viewXY = V.xy;  // V points from surface toward camera, so -V is view
    // Parallax offset proportional to depth and view angle
    vec2 offset = -viewXY * (waterDepth * bedDepthScale / max(cameraHeight, 0.1));
    bedUV = worldPos.xy / 4.0 + 0.5 + offset;
    // Mask: bed must be in front of the camera and inside the UV range
    float inFront = 1.0;  // always for near-overhead view
    float inU = step(0.0, bedUV.x) * step(bedUV.x, 1.0);
    float inV = step(0.0, bedUV.y) * step(bedUV.y, 1.0);
    return vec3(bedUV, inFront * inU * inV);
}

        // Sample the sim texture's Laplacian at a UV.
        float simLaplacianAt(vec2 uv) {
            vec2 texel = 1.0 / vec2(simRes);
            float l = texture(simTexture, uv - vec2(texel.x, 0.0)).r;
            float r = texture(simTexture, uv + vec2(texel.x, 0.0)).r;
            float d = texture(simTexture, uv - vec2(0.0, texel.y)).r;
            float u = texture(simTexture, uv + vec2(0.0, texel.y)).r;
            float c = texture(simTexture, uv).r;
            return (l + r + d + u) - 4.0 * c;
        }

        // Combine ocean (FFT Jacobian) and rain (sim Laplacian) caustics,
        // then attenuate by depth. Signed: zero where flat, positive = bright,
        // negative = dark.
        float causticFromLaplacian(float simLaplacian) {
            float oceanCaustic = v_foam;
            float simCaustic = clamp(-simLaplacian * 500.0, -1.0, 1.0);
            float caustic = oceanCaustic + simCaustic * simCausticStrength;
            float depthFactor = exp(-absorption * waterDepth * 2.0);
            return caustic * depthFactor;
        }

        // Caustic on the riverbed only. Bed UV and mask come from the ray trace,
        // so the caustic is anchored to the bed rather than the screen.
vec3 shadeChannel(vec3 N, vec3 L, vec3 V, vec3 H, vec3 waterBody, vec2 bedUV, float caustic) {
    vec3 sand = sandAt(bedUV + N.xy * refractionStrength);
    sand *= 1.0 + causticStrength * caustic;
    float depthWeight = (1.0 - clamp(waterDepth, 0.0, 1.0)) * exp(-absorption * 0.5);
    vec3 underCol = mix(waterBody, sand, depthWeight);
    float cosV = clamp(dot(N, V), 0.02, 1.0);
    float F = clamp(0.02 + 0.98 * pow(1.0 - cosV, fresnelPower), 0.0, 1.0);
    F = F * F * (3.0 - 2.0 * F);
    vec3 col = mix(underCol, skyReflection(reflect(-V, N)), F);
    return col + vec3(pow(max(dot(N, H), 0.0), specularPower)) * specularStrength;
}

        void main() {
            if (debugSim > 0.5) {
                vec2 s = texture(simDebugTex, v_uv).rg;
                fragColor = vec4(max(-(s.r - 0.5) * 2.0, 0.0), max((s.r - 0.5) * 2.0, 0.0), abs(s.g - 0.5) * 2.0, 1.0);
                return;
            }
vec3 L = normalize(sunDir);
vec3 V = normalize(vec3(0.0, 0.0, cameraHeight) - v_worldPos);
vec3 H = normalize(L + V);
vec3 waterBody = mix(waterDeep, waterColor, smoothstep(-0.015, 0.015, v_height));

// Bed: parallax only (retains relative size), refraction applied per-channel in shadeChannel.
vec2 parallax = -V.xy * (waterDepth * bedDepthScale * 0.05);
vec2 bedUV = v_uv + parallax;

// Caustic: same bed anchor, plus green-channel refraction, then depth-scaled finer.
vec2 refractedBedUV = bedUV + normalize(v_normal_g).xy * refractionStrength;
float causticScale = 1.0 / (1.0 + waterDepth * bedDepthScale * 0.5);
vec2 causticUV = (refractedBedUV - 0.5) * causticScale + 0.5 + simDrift;

vec2 causticDir = vec2(cos(causticRGBAngle), sin(causticRGBAngle)) * causticRGBScale;
vec2 surfDir = vec2(cos(rgbAngle), sin(rgbAngle)) * rgbSplit;
vec2 combinedDir = causticRGBAffectedBySurface > 0.5
    ? surfDir + causticDir
    : causticDir;

vec2 offR =  combinedDir;
vec2 offG =  vec2(0.0);
vec2 offB = -combinedDir;

float causticR = 0.0, causticG = 0.0, causticB = 0.0;

if (causticStrength > 0.001) {
    causticR = causticFromLaplacian(simLaplacianAt(causticUV + offR));
    causticG = causticFromLaplacian(simLaplacianAt(causticUV + offG));
    causticB = causticFromLaplacian(simLaplacianAt(causticUV + offB));
}

vec3 color = vec3(
    shadeChannel(normalize(v_normal_r), L, V, H, waterBody, bedUV, causticR).r,
    shadeChannel(normalize(v_normal_g), L, V, H, waterBody, bedUV, causticG).g,
    shadeChannel(normalize(v_normal_b), L, V, H, waterBody, bedUV, causticB).b
);

            float d = distance(v_uv, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, d);
            color = mix(color, vec3(0.0), vig);

            float foam = smoothstep(foamThreshold, foamThreshold + 0.3, v_foam) * foamStrength;
            color = mix(color, vec3(0.92, 0.94, 0.96), clamp(foam, 0.0, 1.0));

            fragColor = vec4(color, 1.0);
        }
    `;
}

var COPY_VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec2 position;
    out vec2 v_uv;
    void main() {
        v_uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

var COPY_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;
    uniform sampler2D tex;
    uniform vec2  invRes;
    uniform float fxaaStrength;

    float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

    vec3 fxaa(sampler2D t, vec2 uv, vec2 res) {
        vec3 rgbNW = texture(t, uv + vec2(-1.0, -1.0) * res).rgb;
        vec3 rgbNE = texture(t, uv + vec2( 1.0, -1.0) * res).rgb;
        vec3 rgbSW = texture(t, uv + vec2(-1.0,  1.0) * res).rgb;
        vec3 rgbSE = texture(t, uv + vec2( 1.0,  1.0) * res).rgb;
        vec3 rgbM  = texture(t, uv).rgb;

        float lNW = luma(rgbNW);
        float lNE = luma(rgbNE);
        float lSW = luma(rgbSW);
        float lSE = luma(rgbSE);
        float lM  = luma(rgbM);

        float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
        float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

        if (lMax - lMin < 0.03125) return rgbM;

        vec2 dir = vec2(
            -((lNW + lNE) - (lSW + lSE)),
             ((lNW + lSW) - (lNE + lSE))
        );

        float dirReduce = max((lNW + lNE + lSW + lSE) * 0.25 * 0.03125, 1.0 / 128.0);
        float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
        dir = clamp(dir * rcpDirMin, -8.0, 8.0) * res;

        vec3 rgbA = 0.5 * (
            texture(t, uv + dir * (1.0 / 3.0 - 0.5)).rgb +
            texture(t, uv + dir * (2.0 / 3.0 - 0.5)).rgb
        );
        vec3 rgbB = rgbA * 0.5 + 0.25 * (
            texture(t, uv + dir * -0.5).rgb +
            texture(t, uv + dir *  0.5).rgb
        );

        float lB = luma(rgbB);
        return (lB < lMin || lB > lMax) ? rgbA : rgbB;
    }

    void main() {
        vec3 raw = texture(tex, v_uv).rgb;
        if (fxaaStrength < 0.001) {
            fragColor = vec4(raw, 1.0);
            return;
        }
        vec3 smoothed = fxaa(tex, v_uv, invRes);
        fragColor = vec4(mix(raw, smoothed, fxaaStrength), 1.0);
    }
`;

var SKY_VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec3 spherePos;

    uniform float surfaceTilt;
    uniform float perspectiveStrength;
    uniform float cameraHeight;
    uniform float skyRadius;

    out vec3 v_dir;

    void main() {
        v_dir = spherePos;

        vec3 worldPos = spherePos * skyRadius;
        worldPos.z += cameraHeight;

        float pitchAngle = surfaceTilt * 1.35;
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);
        vec3 rotPos = vec3(
            worldPos.x,
            worldPos.y * cp - worldPos.z * sp,
            worldPos.y * sp + worldPos.z * cp
        );
        rotPos.z -= cameraHeight;
        float depth = max(-rotPos.z, 0.1);
        vec2 ortho = rotPos.xy * 0.35;
        vec2 persp = (rotPos.xy / depth) * 1.8;
        vec2 sc = mix(ortho, persp, perspectiveStrength);
        sc.y = -sc.y;

        gl_Position = vec4(sc, 0.999, 1.0);
    }
`;

var SKY_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    in vec3 v_dir;
    out vec4 fragColor;

    uniform sampler2D bgTextureA, bgTextureB;
    uniform float bgBlend;
    uniform vec2 bgTile;

    vec2 sampleEnvMap(vec3 R) {
        return vec2(
            atan(R.z, R.x) / (2.0 * 3.14159265) + 0.5,
            acos(clamp(R.y, -1.0, 1.0)) / 3.14159265
        );
    }

    void main() {
        vec3 dir = normalize(vec3(v_dir.x, v_dir.z, v_dir.y));
        vec2 uv = sampleEnvMap(dir) * bgTile;
        vec3 col;
        if (bgBlend <= 0.001)       col = texture(bgTextureA, uv).rgb;
        else if (bgBlend >= 0.999)  col = texture(bgTextureB, uv).rgb;
        else                        col = mix(texture(bgTextureA, uv).rgb,
                                             texture(bgTextureB, uv).rgb, bgBlend);
        fragColor = vec4(col, 1.0);
    }
`;

var DROP_VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec3 spherePos;
    in vec3 sphereNormal;
    in vec3 instanceCenter;
    in float instanceRadius;

    uniform float surfaceTilt;
    uniform float perspectiveStrength;
    uniform float cameraHeight;

    out vec3  v_worldPos;
    out vec3  v_worldNormal;
    out vec3  v_center;
    out float v_radius;

    void main() {
        vec3 worldPos = instanceCenter + spherePos * instanceRadius;

        float pitchAngle = surfaceTilt * 1.35;
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);
        vec3 rotPos = vec3(
            worldPos.x,
            worldPos.y * cp - worldPos.z * sp,
            worldPos.y * sp + worldPos.z * cp
        );
        rotPos.z -= cameraHeight;

        if (rotPos.z > -0.05) {
            gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
            return;
        }

        float depth = max(-rotPos.z, 0.1);
        vec2 ortho = rotPos.xy * 0.35;
        vec2 persp = (rotPos.xy / depth) * 1.8;
        vec2 sc = mix(ortho, persp, perspectiveStrength);
        sc.y = -sc.y;

        float ndcZ = clamp(depth / 20.0, 0.0, 1.0);
        gl_Position = vec4(sc, ndcZ, 1.0);

        v_worldPos    = worldPos;
        v_worldNormal = sphereNormal;
        v_center      = instanceCenter;
        v_radius      = instanceRadius;
    }
`;

function buildDropFragmentSource() {
    return `#version 300 es
        precision highp float;
        in vec3  v_worldPos;
        in vec3  v_worldNormal;
        in vec3  v_center;
        in float v_radius;
        out vec4 fragColor;

        uniform vec3  waterColor, waterDeep, skyHorizon, skyZenith, sunDir;
        uniform float specularPower, specularStrength, fresnelPower;
        uniform float surfaceTilt, perspectiveStrength, cameraHeight;
        uniform float absorption, envMapStrength;
        uniform float envMapZoom;
        uniform vec2  envMapPan;
        uniform float vignetteRadius, vignetteSoftness;
        uniform sampler2D envMapA, envMapB;
        uniform float envMapBlend;
        uniform sampler2D waterTexture;
        uniform vec2  screenResolution;

        vec2 projectToUV(vec3 worldPos) {
            float pitchAngle = surfaceTilt * 1.35;
            float cp = cos(pitchAngle);
            float sp = sin(pitchAngle);
            vec3 rotPos = vec3(
                worldPos.x,
                worldPos.y * cp - worldPos.z * sp,
                worldPos.y * sp + worldPos.z * cp
            );
            rotPos.z -= cameraHeight;
            float d = max(-rotPos.z, 0.1);
            vec2 ortho = rotPos.xy * 0.35;
            vec2 persp = (rotPos.xy / d) * 1.8;
            vec2 sc = mix(ortho, persp, perspectiveStrength);
            sc.y = -sc.y;
            return sc * 0.5 + 0.5;
        }

        vec3 getCameraWorldPos() {
            float pitchAngle = surfaceTilt * 1.35;
            float cp = cos(pitchAngle);
            float sp = sin(pitchAngle);
            return vec3(0.0, cameraHeight * sp, cameraHeight * cp);
        }

        vec2 sampleEnvMap(vec3 R) {
            return vec2(
                atan(R.z, R.x) / (2.0 * 3.14159265) + 0.5,
                acos(clamp(R.y, -1.0, 1.0)) / 3.14159265
            );
        }

        vec2 envSampleUV(vec3 R) {
            vec2 uv = sampleEnvMap(R);
            uv = (uv - envMapPan) * envMapZoom + envMapPan;
            return uv;
        }

        vec3 sampleBlendedEnv(vec2 uv) {
            if (envMapBlend <= 0.001) return texture(envMapA, uv).rgb;
            if (envMapBlend >= 0.999) return texture(envMapB, uv).rgb;
            return mix(texture(envMapA, uv).rgb, texture(envMapB, uv).rgb, envMapBlend);
        }

        vec3 skyReflection(vec3 R) {
            float up = clamp(R.y, -1.0, 1.0);
            vec2 uv = envSampleUV(R);
            vec3 envCol = sampleBlendedEnv(uv);
            vec3 proc = mix(
                mix(waterDeep * 0.5,
                    mix(skyHorizon, skyZenith, smoothstep(0.0, 0.7, up)),
                    smoothstep(-0.3, 0.05, up)),
                envCol,
                envMapStrength
            );
            return proc * 3.0;
        }

        void main() {
            vec3 N = normalize(v_worldNormal);
            vec3 camPos = getCameraWorldPos();
            vec3 V = normalize(camPos - v_worldPos);

            float cosV = clamp(dot(N, V), 0.02, 1.0);
            float F = clamp(0.02 + 0.98 * pow(1.0 - cosV, fresnelPower), 0.0, 1.0);
            F = F * F * (3.0 - 2.0 * F);

            float etaIn = 1.0 / 1.333;
            vec3 R = refract(-V, N, etaIn);
            if (dot(R, R) < 0.0001) R = -V;

            vec3 oc  = v_worldPos - v_center;
            float tca = dot(oc, R);
            float d2  = dot(oc, oc) - tca * tca;
            float thc = sqrt(max(v_radius * v_radius - d2, 0.0));
            float t   = -tca + thc;
            vec3 exitPos = v_worldPos + R * t;
            vec3 exitN   = normalize(exitPos - v_center);

            vec3 R2 = refract(R, -exitN, 1.333);
            if (dot(R2, R2) < 0.0001) R2 = reflect(R, -exitN);

            vec3 samplePoint = exitPos + R2 * v_radius * 4.0;
            vec2 refrUV = projectToUV(samplePoint);
            float inBounds =
                step(0.0, refrUV.x) * step(refrUV.x, 1.0) *
                step(0.0, refrUV.y) * step(refrUV.y, 1.0);
            vec3 refracted = texture(waterTexture, clamp(refrUV, 0.0, 1.0)).rgb;
            refracted = mix(skyReflection(R2), refracted, inBounds);

            float chord = 2.0 * v_radius * sqrt(max(1.0 - cosV * cosV, 0.0));
            vec3 transmittance = exp(-absorption * chord * 12.0 * (1.0 - waterColor));
            refracted *= transmittance;

            vec3 reflDir = reflect(-V, N);
            vec3 reflection = skyReflection(reflDir);

            vec3 color = mix(refracted, reflection, F);
            vec3 L = normalize(sunDir);
            vec3 H = normalize(L + V);
            color += vec3(pow(max(dot(N, H), 0.0), specularPower)) * specularStrength;

            vec2 screenUV = gl_FragCoord.xy / screenResolution;
            float dv = distance(screenUV, vec2(0.5));
            float vig = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dv);
            color = mix(color, vec3(0.0), vig);

            fragColor = vec4(color, 1.0);
        }
    `;
}

// =====================================================================
// FFT OCEAN SHADERS
// =====================================================================

var SPECTRUM_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    uniform int   N;
    uniform float windSpeed;
    uniform float windAngle;
    uniform float smallWaveCutoff;
    uniform float directionSpread;
    uniform float waveScale;
    uniform float heightAmp;
    uniform float patchSize;

    const float G = 9.81;
    const float PI = 3.14159265359;

    float phillips(vec2 k) {
        float kLen = length(k);
        if (kLen < 1e-4) return 0.0;
        float k2 = kLen * kLen;

        float L = windSpeed * windSpeed / G * waveScale;

        vec2 khat = k / kLen;
        vec2 what = vec2(cos(windAngle), sin(windAngle));

        float w = dot(khat, what);
        float expo = mix(16.0, 1.0, directionSpread);
        float directional = pow(max(w, 0.0), expo);
        // ## float w = dot(khat, what);
        // ## float expo = mix(16.0, 1.0, directionSpread);
        // ## float directional = pow(abs(w), expo);

        // Classic 1/k^4, with a gentle artistic tilt from waveScale
        float power = 4.0 + (waveScale - 1.0) * 2.0;
        power = clamp(power, 1.5, 7.0);
        float base = heightAmp * heightAmp * pow(kLen, -power);

        float kL = kLen * L;
        float lowCut  = exp(-1.0 / max(kL * kL, 1e-6));
        float l = smallWaveCutoff * 0.08;
        float highCut = exp(-k2 * l * l);

        return base * directional * lowCut * highCut;
    }

    // Deterministic hash → two independent uniforms in [0,1)
    vec2 hash22(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx + p3.yz) * p3.zy);
    }

    void main() {
        ivec2 pix = ivec2(gl_FragCoord.xy);
        int Nhalf = N / 2;

        // Signed frequency indices
        int ix = (pix.x < Nhalf) ? pix.x : pix.x - N;
        int iy = (pix.y < Nhalf) ? pix.y : pix.y - N;
        vec2 k = vec2(float(ix), float(iy)) * (2.0 * PI / patchSize);

        float P = phillips(k);

        // ----- Hermitian construction -----
        // Canonical representative of the pair {k, -k}:
        // the one with larger iy, or same iy and larger ix.
        bool isNegativeHalf = (iy < 0) || (iy == 0 && ix < 0);
        int cx = isNegativeHalf ? -ix : ix;
        int cy = isNegativeHalf ? -iy : iy;

        // Special bins that must be purely real
        bool isNyquistX = (cx == Nhalf) || (cx == -Nhalf);
        bool isNyquistY = (cy == Nhalf) || (cy == -Nhalf);
        bool forceReal  = (cx == 0 && cy == 0) || isNyquistX || isNyquistY;

        // Two independent uniforms from the canonical index
        vec2 uv = hash22(vec2(float(cx), float(cy)));
        // ## vec2 uv = hash22(vec2(float(pix.x) + 0.5, float(pix.y) + 0.5));

        float u1 = max(uv.x, 1e-6);
        float u2 = uv.y;

        // Box-Muller → two independent standard normals
        float r     = sqrt(-2.0 * log(u1));
        float theta = 2.0 * PI * u2;
        vec2  xi    = r * vec2(cos(theta), sin(theta));

        float amp = sqrt(P * 0.5);
        vec2 h0 = xi * amp;

         if (forceReal) {
             h0.y = 0.0;                     // imag = 0
         } else if (isNegativeHalf) {
             h0 = vec2(h0.x, -h0.y);         // conjugate of the positive side
         }
        // ## bool isDC      = (pix.x == 0 && pix.y == 0);
        // ## bool isNyqX    = (pix.x == Nhalf);
        // ## bool isNyqY    = (pix.y == Nhalf);
        // ## if (isDC || isNyqX || isNyqY) {
        // ##     h0.y = 0.0;
        // ## }

        fragColor = vec4(h0, 0.0, 1.0);
    }
`;

var SPECTRUM_ANIMATE_SHADER = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    uniform sampler2D spectrum0;
    uniform int   N;
    uniform float time;
    uniform float patchSize;
    uniform float speed;
    uniform float propagation;   // 0 = stationary, 1 = full travel

    const float G = 9.81;
    const float PI = 3.14159265359;

    void main() {
        ivec2 pix = ivec2(gl_FragCoord.xy);
        int Nhalf = N / 2;
        int ix = (pix.x < Nhalf) ? pix.x : pix.x - N;
        int iy = (pix.y < Nhalf) ? pix.y : pix.y - N;

        ivec2 mirrorPix = ivec2((N - pix.x) % N, (N - pix.y) % N);

        vec2 h0        = texture(spectrum0, (vec2(pix)       + 0.5) / float(N)).xy;
        vec2 h0_mirror = texture(spectrum0, (vec2(mirrorPix) + 0.5) / float(N)).xy;

        vec2 k = vec2(float(ix), float(iy)) * (2.0 * PI / patchSize);
        float kLen  = length(k);
        float omega = sqrt(G * kLen);

        float animTime = time * speed;
        float phase    = omega * animTime * propagation;
        float c = cos(phase);
        float s = sin(phase);

        // h(k,t) = h0(k)·e^{iθ} + conj(h0(-k))·e^{-iθ}
        vec2 h0rot = vec2(h0.x * c - h0.y * s, h0.x * s + h0.y * c);
        vec2 hm    = vec2(h0_mirror.x, -h0_mirror.y);
        vec2 hmRot = vec2(hm.x * c + hm.y * s, -hm.x * s + hm.y * c);
        vec2 h     = h0rot + hmRot;

        fragColor = vec4(h, 0.0, 1.0);
    }
`;

var FFT_HORIZONTAL_SHADER = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    uniform sampler2D inputTex;
    uniform int   N;
    uniform int   passIndex;

    const float PI = 3.14159265359;

    void main() {
        ivec2 pix = ivec2(gl_FragCoord.xy);

        int span = N >> passIndex;
        int halfspan = span >> 1;

        int groupBase = (pix.x / span) * span;
        int k = pix.x - groupBase;
        int j = k % halfspan;
        int i1 = groupBase + j;
        int i2 = i1 + halfspan;

        vec4 a = texelFetch(inputTex, ivec2(i1, pix.y), 0);
        vec4 b = texelFetch(inputTex, ivec2(i2, pix.y), 0);

        vec2 sum = a.xy + b.xy;
        vec2 diff = a.xy - b.xy;

        float angle = 2.0 * PI * float(j) / float(span);
        float cs = cos(angle);
        float sn = sin(angle);
        vec2 diff_w = vec2(diff.x * cs - diff.y * sn, diff.x * sn + diff.y * cs);

        vec2 result = (k < halfspan) ? sum : diff_w;

        fragColor = vec4(result, 0.0, 1.0);
    }
`;

var FFT_VERTICAL_SHADER = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    uniform sampler2D inputTex;
    uniform int   N;
    uniform int   passIndex;

    const float PI = 3.14159265359;

    void main() {
        ivec2 pix = ivec2(gl_FragCoord.xy);

        int span = N >> passIndex;
        int halfspan = span >> 1;

        int groupBase = (pix.y / span) * span;
        int k = pix.y - groupBase;
        int j = k % halfspan;
        int i1 = groupBase + j;
        int i2 = i1 + halfspan;

        vec4 a = texelFetch(inputTex, ivec2(pix.x, i1), 0);
        vec4 b = texelFetch(inputTex, ivec2(pix.x, i2), 0);

        vec2 sum = a.xy + b.xy;
        vec2 diff = a.xy - b.xy;

        float angle = 2.0 * PI * float(j) / float(span);
        float cs = cos(angle);
        float sn = sin(angle);
        vec2 diff_w = vec2(diff.x * cs - diff.y * sn, diff.x * sn + diff.y * cs);

        vec2 result = (k < halfspan) ? sum : diff_w;

        fragColor = vec4(result, 0.0, 1.0);
    }
`;

var FFT_OUTPUT_SHADER = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    uniform sampler2D fftResult;
    uniform int   N;
    uniform float choppiness;
    uniform float heightScale;
    uniform float patchSize;

    int bitReverse(int x, int bits) {
        int r = 0;
        for (int i = 0; i < 16; i++) {
            if (i >= bits) break;
            r = (r << 1) | ((x >> i) & 1);
        }
        return r;
    }

    void main() {
        ivec2 pix = ivec2(gl_FragCoord.xy);

        // bits = log2(N) – works for any power-of-two size
        int bits = 0;
        int tmp = N;
        while (tmp > 1) { bits++; tmp >>= 1; }

        int pxL = (pix.x > 0)     ? pix.x - 1 : N - 1;
        int pxR = (pix.x < N - 1) ? pix.x + 1 : 0;
        int pyD = (pix.y > 0)     ? pix.y - 1 : N - 1;
        int pyU = (pix.y < N - 1) ? pix.y + 1 : 0;

        // Diagonal neighbours for mixed derivative
        int pxLD = pxL, pyLD = pyD;
        int pxLU = pxL, pyLU = pyU;
        int pxRD = pxR, pyRD = pyD;
        int pxRU = pxR, pyRU = pyU;

        vec2 uvC  = (vec2(bitReverse(pix.x, bits), bitReverse(pix.y, bits)) + 0.5) / float(N);
        vec2 uvL  = (vec2(bitReverse(pxL, bits),  bitReverse(pix.y, bits)) + 0.5) / float(N);
        vec2 uvR  = (vec2(bitReverse(pxR, bits),  bitReverse(pix.y, bits)) + 0.5) / float(N);
        vec2 uvD  = (vec2(bitReverse(pix.x, bits), bitReverse(pyD, bits))   + 0.5) / float(N);
        vec2 uvU  = (vec2(bitReverse(pix.x, bits), bitReverse(pyU, bits))   + 0.5) / float(N);
        vec2 uvLD = (vec2(bitReverse(pxLD, bits), bitReverse(pyLD, bits))  + 0.5) / float(N);
        vec2 uvLU = (vec2(bitReverse(pxLU, bits), bitReverse(pyLU, bits))  + 0.5) / float(N);
        vec2 uvRD = (vec2(bitReverse(pxRD, bits), bitReverse(pyRD, bits))  + 0.5) / float(N);
        vec2 uvRU = (vec2(bitReverse(pxRU, bits), bitReverse(pyRU, bits))  + 0.5) / float(N);

        float invN = 1.0 / float(N);
        float h   = texture(fftResult, uvC ).x * invN * heightScale;
        float hL  = texture(fftResult, uvL ).x * invN * heightScale;
        float hR  = texture(fftResult, uvR ).x * invN * heightScale;
        float hD  = texture(fftResult, uvD ).x * invN * heightScale;
        float hU  = texture(fftResult, uvU ).x * invN * heightScale;
        float hLD = texture(fftResult, uvLD).x * invN * heightScale;
        float hLU = texture(fftResult, uvLU).x * invN * heightScale;
        float hRD = texture(fftResult, uvRD).x * invN * heightScale;
        float hRU = texture(fftResult, uvRU).x * invN * heightScale;

        float texelWorld = patchSize / float(N);
        float invTexel   = 1.0 / texelWorld;

        // First derivatives
        float dHdx = (hR - hL) * 0.5 * invTexel;
        float dHdy = (hU - hD) * 0.5 * invTexel;

        // Second derivatives
        float d2Hdx2 = (hR - 2.0*h + hL) * invTexel * invTexel;
        float d2Hdy2 = (hU - 2.0*h + hD) * invTexel * invTexel;
        // Mixed derivative (central)
        float d2Hdxdy = (hRU - hRD - hLU + hLD) * 0.25 * invTexel * invTexel;

        // Spatial-derivative approximation of Tessendorf chop
        vec2 chop = vec2(dHdx, dHdy) * choppiness;

        // Full 2×2 Jacobian of the map x → x + D(x)
        float jxx = 1.0 + choppiness * d2Hdx2;
        float jyy = 1.0 + choppiness * d2Hdy2;
        float jxy =     + choppiness * d2Hdxdy;
        float jacobian = jxx * jyy - jxy * jxy;

        float foam = clamp(1.0 - jacobian, 0.0, 1.0);

        fragColor = vec4(h, chop.x, chop.y, foam);
    }
`;

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
var animationFrameId = 0;

function main() {
    var canvas = document.createElement("canvas");
    var content = document.getElementById("content");
    canvas.style.position = 'fixed';
    canvas.style.zIndex = -1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    content.appendChild(canvas);

    var gl = canvas.getContext('webgl2', {
        preserveDrawingBuffer: false, alpha: false, antialias: true, depth: true
    });
    if (!gl) {
        console.error("WebGL2 not supported — this build requires WebGL2.");
        return;
    }

    window.previousGl = gl;

    var floatLinear = gl.getExtension('OES_texture_float_linear');
    var colorBufferFloat = gl.getExtension('EXT_color_buffer_float');
    var colorBufferHalfFloat = gl.getExtension('EXT_color_buffer_half_float');

    var simInternalFormat = gl.RGBA8;
    var simType = gl.UNSIGNED_BYTE;
    var filterMode = gl.LINEAR;

    if (colorBufferFloat && floatLinear) {
        simInternalFormat = gl.RGBA32F;
        simType = gl.FLOAT;
        filterMode = gl.LINEAR;
    } else if (colorBufferHalfFloat && floatLinear) {
        simInternalFormat = gl.RGBA16F;
        simType = gl.HALF_FLOAT;
        filterMode = gl.LINEAR;
    } else {
        console.warn("Float render targets unavailable — simulation running at reduced precision (RGBA8).");
    }

    var program = null, simProgram = null, dropProgram = null, copyProgram = null, skyProgram = null;
    var positionLocation = null, timeLocation = null;
    var gridBuffer = null, indexBuffer = null;
    var indexCount = 0;
    var u = {};

    var simRes = 512;
    var simFBOs = [null, null], simTextures = [null, null];
    var simCurrent = 0, simQuadBuffer = null;
    var simDriftPhaseX = 0, simDriftPhaseY = 0;

    var simDrops = [];
    var pendingSimDrops = [];
    var nextSimDropTime = null;
    var fallingDrops = [];

    var waterFBO = null, waterTexture = null;
    var waterFBOW = 0, waterFBOH = 0;

    function createWaterFBO(w, h) {
        if (waterFBO) gl.deleteFramebuffer(waterFBO);
        if (waterTexture) gl.deleteTexture(waterTexture);
        waterFBOW = w; waterFBOH = h;
        waterTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, waterTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        waterFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, waterFBO);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waterTexture, 0);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) console.error("Water FBO incomplete:", status);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    var bgTextureA = gl.createTexture();
    var bgTextureB = gl.createTexture();
    var bedTextureA = gl.createTexture();
    var bedTextureB = gl.createTexture();

    function initImageTexture(tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA,
            gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    initImageTexture(bgTextureA);
    initImageTexture(bgTextureB);
    initImageTexture(bedTextureA);
    initImageTexture(bedTextureB);

    var bgBlend = 0;
    var bedBlend = 0;

    function getImageParams(prefix, useTarget) {
        var src = (useTarget && transitionTarget) ? transitionTarget : state;
        return {
            index: Math.round(src[prefix + "Index"]),
            scale: Math.round(src[prefix + "Scale"]),
            seamless: Math.round(src[prefix + "Seamless"])
        };
    }

    function applyImage(slot, prefix, baseName, texA, texB, thumbSlot) {
        var isTarget = (slot === "b");
        var params = getImageParams(prefix, isTarget);
        var targetTex = isTarget ? texB : texA;
        var scale = SCALE_OPTIONS[params.scale] || SCALE_OPTIONS[1];
        loadImage(baseName, params.index, "jpg").then(function (img) {
            if (!img) {
                setScaleDropdownEnabled(prefix + "Scale", false);
                return;
            }
            var matches = sourceMatchesScaleOption(img);
            setScaleDropdownEnabled(prefix + "Scale", !matches);
            var processed = processImage(img, scale.w, scale.h,
                params.seamless, params.seamless);
            gl.bindTexture(gl.TEXTURE_2D, targetTex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, processed);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            if (!isTarget) updateThumbnail(thumbSlot, processed);
        });
    }

    function applyBackgroundImage() {
        if (transitionActive && !bgPendingTargetUpload) {
            transitionActive = false;
            bgBlend = 0; bedBlend = 0;
        }
        applyImage("a", "bgImage", "treeline", bgTextureA, bgTextureB, "bg");
    }

    function applyBackgroundImageTarget() {
        applyImage("b", "bgImage", "treeline", bgTextureA, bgTextureB, "bg");
    }

    function applyRiverbedImage() {
        if (transitionActive && !bedPendingTargetUpload) {
            transitionActive = false;
            bgBlend = 0; bedBlend = 0;
        }
        applyImage("a", "bedImage", "riverbed", bedTextureA, bedTextureB, "bed");
    }

    function applyRiverbedImageTarget() {
        applyImage("b", "bedImage", "riverbed", bedTextureA, bedTextureB, "bed");
    }

    window.__applyBg = applyBackgroundImage;
    window.__applyBed = applyRiverbedImage;
    window.__applyBgTarget = applyBackgroundImageTarget;
    window.__applyBedTarget = applyRiverbedImageTarget;

    window.__promoteTransitionEnd = function () {
        var tmp = bgTextureA; bgTextureA = bgTextureB; bgTextureB = tmp;
        tmp = bedTextureA; bedTextureA = bedTextureB; bedTextureB = tmp;
        bgBlend = 0;
        bedBlend = 0;
    };

    function setLiveTextToggleUI(on) {
        var sliders = document.querySelectorAll('input[type=range][data-key="liveText"]');
        var numbers = document.querySelectorAll('input[type=number][data-key="liveText"]');
        sliders.forEach(function (s) { s.value = on ? 1 : 0; });
        numbers.forEach(function (n) { n.value = on ? "1" : "0"; });
    }

    function stopLiveTextRecognition() {
        if (liveTextRecognition) {
            try { liveTextRecognition.stop(); } catch (e) { /* ignore */ }
            liveTextRecognition = null;
        }
        liveTextQueue.length = 0;
        liveTextCurrentWord = null;
        liveTextCharIdx = 0;
    }

    function startLiveTextRecognition() {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported in this browser");
            state.liveText = 0;
            setLiveTextToggleUI(false);
            return;
        }
        if (liveTextRecognition) return;

        var recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = navigator.language || "en-US";

        recog.onresult = function (event) {
            for (var i = event.resultIndex; i < event.results.length; i++) {
                if (!event.results[i].isFinal) continue;
                var words = event.results[i][0].transcript.trim().split(/\s+/).filter(Boolean);
                for (var k = 0; k < words.length; k++) {
                    if (liveTextQueue.length < state.liveTextMaxBacklog) {
                        liveTextQueue.push(words[k]);
                    }
                }
            }
        };

        recog.onerror = function (e) {
            console.warn("SpeechRecognition error:", e.error);
            if (e.error === "not-allowed" || e.error === "service-not-allowed") {
                state.liveText = 0;
                setLiveTextToggleUI(false);
                stopLiveTextRecognition();
            }
        };

        recog.onend = function () {
            if (state.liveText === 1 && liveTextRecognition === recog) {
                setTimeout(function () {
                    if (state.liveText === 1 && liveTextRecognition === recog) {
                        try { recog.start(); } catch (e) { /* already starting */ }
                    }
                }, 250);
            }
        };

        liveTextRecognition = recog;
        try {
            recog.start();
        } catch (e) {
            console.warn("Failed to start SpeechRecognition:", e);
        }
    }

    function handleLiveTextToggle(enabled) {
        if (enabled) startLiveTextRecognition();
        else stopLiveTextRecognition();
    }

    window.__applyLiveText = handleLiveTextToggle;

    var letterRipples = [], nextLetterTime = null;
    var liveTextRecognition = null;
    var liveTextQueue = [];
    var liveTextCurrentWord = null;
    var liveTextCharIdx = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (canvas.width !== waterFBOW || canvas.height !== waterFBOH) {
            createWaterFBO(canvas.width, canvas.height);
        }
    }

    function createShader(type, source) {
        var s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    function createSimTargets() {
        for (var i = 0; i < 2; i++) {
            if (simFBOs[i]) gl.deleteFramebuffer(simFBOs[i]);
            if (simTextures[i]) gl.deleteTexture(simTextures[i]);
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, simInternalFormat, simRes, simRes, 0, gl.RGBA, simType, null);
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
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
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
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.STATIC_DRAW);
        indexCount = idxArr.length;
    }
    meshRebuildFn = buildMesh;

    function cacheUniforms() {
        timeLocation = gl.getUniformLocation(program, "time");
        var names = [
            "simTexture", "simDrift",
            "oceanTex", "oceanTexSize", "oceanPatchSize",
            "letterRippleSpeed", "rippleDrift",
            "letterAtlas", "letterSpread", "letterSize", "letterStrengthGlobal", "letterCount",
            "letterRipples[0]", "letterRippleParams[0]", "letterRippleV[0]",
            "letterSpeed", "letterWavelength", "letterThickness",
            "rgbSplit", "rgbAngle", "surfaceDepth", "surfaceTilt", "perspectiveStrength", "cameraHeight",
            "waterColor", "waterDeep", "skyHorizon", "skyZenith", "sunDir",
            "specularPower", "specularStrength", "fresnelPower",
            "vignetteRadius", "vignetteSoftness",
            "waterDepth", "absorption", "sandScale", "sandContrast", "sandColor", "refractionStrength",
            "envMapA", "envMapB", "envMapBlend",
            "envMapStrength", "envMapZoom", "envMapPan", "simDebugTex", "debugSim",
            "bedTextureA", "bedTextureB", "bedBlend", "bedImageEnabled", "bedImageTile",
            "foamThreshold", "foamStrength",
            "simRes",
            "causticStrength", "simCausticStrength",
            "causticRGBScale", "causticRGBAngle", "causticRGBAffectedBySurface", "bedDepthScale"
        ];
        names.forEach(function (n) {
            var key = n.replace(/\[0\]$/, "");
            u[key] = gl.getUniformLocation(program, n);
        });
    }

    sdfAtlas = buildSDFAtlas(gl);

    var vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    var fs = createShader(gl.FRAGMENT_SHADER, buildFragmentSource());
    program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(program)); return; }
    gl.useProgram(program);
    cacheUniforms();
    positionLocation = gl.getAttribLocation(program, "gridPos");

    var simVs = createShader(gl.VERTEX_SHADER, SIM_VERTEX_SHADER);
    var simFs = createShader(gl.FRAGMENT_SHADER, buildSimFragmentSource());
    simProgram = gl.createProgram();
    gl.attachShader(simProgram, simVs); gl.attachShader(simProgram, simFs); gl.linkProgram(simProgram);
    if (!gl.getProgramParameter(simProgram, gl.LINK_STATUS)) {
        console.error("Sim program link failed:", gl.getProgramInfoLog(simProgram));
    }

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
        dropCore: gl.getUniformLocation(simProgram, "simDropCore"),
        simDt: gl.getUniformLocation(simProgram, "simDt")
    };
    var simPosLoc = gl.getAttribLocation(simProgram, "position");

    var copyVs = createShader(gl.VERTEX_SHADER, COPY_VERTEX_SHADER);
    var copyFs = createShader(gl.FRAGMENT_SHADER, COPY_FRAGMENT_SHADER);
    copyProgram = gl.createProgram();
    gl.attachShader(copyProgram, copyVs); gl.attachShader(copyProgram, copyFs); gl.linkProgram(copyProgram);
    var copyPosLoc = gl.getAttribLocation(copyProgram, "position");
    var copyTexLoc = gl.getUniformLocation(copyProgram, "tex");
    var copyInvResLoc = gl.getUniformLocation(copyProgram, "invRes");
    var copyFxaaStrengthLoc = gl.getUniformLocation(copyProgram, "fxaaStrength");

    var skyVs = createShader(gl.VERTEX_SHADER, SKY_VERTEX_SHADER);
    var skyFs = createShader(gl.FRAGMENT_SHADER, SKY_FRAGMENT_SHADER);
    skyProgram = gl.createProgram();
    gl.attachShader(skyProgram, skyVs); gl.attachShader(skyProgram, skyFs);
    gl.linkProgram(skyProgram);
    if (!gl.getProgramParameter(skyProgram, gl.LINK_STATUS)) {
        console.error("Sky program link failed:", gl.getProgramInfoLog(skyProgram));
    }
    var skySpherePosLoc = gl.getAttribLocation(skyProgram, "spherePos");
    var skySurfaceTiltLoc = gl.getUniformLocation(skyProgram, "surfaceTilt");
    var skyPerspStrengthLoc = gl.getUniformLocation(skyProgram, "perspectiveStrength");
    var skyCameraHeightLoc = gl.getUniformLocation(skyProgram, "cameraHeight");
    var skyRadiusLoc = gl.getUniformLocation(skyProgram, "skyRadius");
    var skyBgTexALoc = gl.getUniformLocation(skyProgram, "bgTextureA");
    var skyBgTexBLoc = gl.getUniformLocation(skyProgram, "bgTextureB");
    var skyBgBlendLoc = gl.getUniformLocation(skyProgram, "bgBlend");
    var skyBgTileLoc = gl.getUniformLocation(skyProgram, "bgTile");

    var dropVs = createShader(gl.VERTEX_SHADER, DROP_VERTEX_SHADER);
    var dropFs = createShader(gl.FRAGMENT_SHADER, buildDropFragmentSource());
    dropProgram = gl.createProgram();
    gl.attachShader(dropProgram, dropVs); gl.attachShader(dropProgram, dropFs);
    gl.linkProgram(dropProgram);
    if (!gl.getProgramParameter(dropProgram, gl.LINK_STATUS))
        console.error("Drop program link failed:", gl.getProgramInfoLog(dropProgram));

    var dropSpherePosLoc = gl.getAttribLocation(dropProgram, "spherePos");
    var dropSphereNormLoc = gl.getAttribLocation(dropProgram, "sphereNormal");
    var dropInstCenterLoc = gl.getAttribLocation(dropProgram, "instanceCenter");
    var dropInstRadiusLoc = gl.getAttribLocation(dropProgram, "instanceRadius");

    var dropU = {
        surfaceTilt: gl.getUniformLocation(dropProgram, "surfaceTilt"),
        perspectiveStrength: gl.getUniformLocation(dropProgram, "perspectiveStrength"),
        cameraHeight: gl.getUniformLocation(dropProgram, "cameraHeight"),
        waterColor: gl.getUniformLocation(dropProgram, "waterColor"),
        waterDeep: gl.getUniformLocation(dropProgram, "waterDeep"),
        skyHorizon: gl.getUniformLocation(dropProgram, "skyHorizon"),
        skyZenith: gl.getUniformLocation(dropProgram, "skyZenith"),
        sunDir: gl.getUniformLocation(dropProgram, "sunDir"),
        specularPower: gl.getUniformLocation(dropProgram, "specularPower"),
        specularStrength: gl.getUniformLocation(dropProgram, "specularStrength"),
        fresnelPower: gl.getUniformLocation(dropProgram, "fresnelPower"),
        absorption: gl.getUniformLocation(dropProgram, "absorption"),
        envMapA: gl.getUniformLocation(dropProgram, "envMapA"),
        envMapB: gl.getUniformLocation(dropProgram, "envMapB"),
        envMapBlend: gl.getUniformLocation(dropProgram, "envMapBlend"),
        envMapStrength: gl.getUniformLocation(dropProgram, "envMapStrength"),
        envMapZoom: gl.getUniformLocation(dropProgram, "envMapZoom"),
        envMapPan: gl.getUniformLocation(dropProgram, "envMapPan"),
        vignetteRadius: gl.getUniformLocation(dropProgram, "vignetteRadius"),
        vignetteSoftness: gl.getUniformLocation(dropProgram, "vignetteSoftness"),
        waterTexture: gl.getUniformLocation(dropProgram, "waterTexture"),
        screenResolution: gl.getUniformLocation(dropProgram, "screenResolution")
    };

    var dropInstanceBuffer = gl.createBuffer();

    var sphereMesh = null;
    var currentSphereQuality = -1;
    function ensureSphereMesh(q) {
        q = Math.max(4, Math.min(64, q | 0));
        if (q === currentSphereQuality && sphereMesh) return;
        if (sphereMesh) {
            gl.deleteBuffer(sphereMesh.posBuf);
            gl.deleteBuffer(sphereMesh.normBuf);
            gl.deleteBuffer(sphereMesh.idxBuf);
        }
        sphereMesh = buildSphereMesh(gl, q);
        currentSphereQuality = q;
    }

    var skyMesh = buildSphereMesh(gl, 64);
    ensureSphereMesh(state.sphereQuality);

    createSimTargets();
    buildMesh(state.gridResolution);

    // =====================================================================
    // FFT OCEAN SETUP
    // =====================================================================

    var fftSize = FFT_SIZE;

    function makeFFTTexture(iformat, format, type, useLinear) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, iformat, fftSize, fftSize, 0, format, type, null);
        var filter = useLinear ? gl.LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    }
    function makeFFTFBO(tex) {
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error("FFT FBO incomplete:", status);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return fbo;
    }

    // Use the same precision tier as the sim FBOs — RGBA32F if float color buffers
    // are available, RGBA16F if only half-float, RGBA8 as last resort.
    var fftInternalFormat = simInternalFormat;
    var fftType = simType;
    if (fftInternalFormat === gl.RGBA8) {
        console.warn("FFT running at RGBA8 — waves will be quantized and may look wrong");
    }

    // Spectrum and ping-pong textures are sampled texel-aligned — NEAREST is correct.
    var fftSpectrum0Tex = makeFFTTexture(fftInternalFormat, gl.RGBA, fftType, false);
    var fftSpectrum0FBO = makeFFTFBO(fftSpectrum0Tex);

    var fftPingTex = [
        makeFFTTexture(fftInternalFormat, gl.RGBA, fftType, false),
        makeFFTTexture(fftInternalFormat, gl.RGBA, fftType, false)
    ];
    var fftPingFBO = [makeFFTFBO(fftPingTex[0]), makeFFTFBO(fftPingTex[1])];

    // Output texture is sampled at fractional UVs by the water vertex shader — LINEAR.
    var fftOutputTex = makeFFTTexture(fftInternalFormat, gl.RGBA, fftType, true);
    var fftOutputFBO = makeFFTFBO(fftOutputTex);

    function buildFFTProgram(fragSource) {
        var prog = gl.createProgram();
        var v = createShader(gl.VERTEX_SHADER, COPY_VERTEX_SHADER);
        var f = createShader(gl.FRAGMENT_SHADER, fragSource);
        gl.attachShader(prog, v);
        gl.attachShader(prog, f);
        gl.bindAttribLocation(prog, 0, "position");
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("FFT program link failed:", gl.getProgramInfoLog(prog));
        }
        return prog;
    }

    var spectrumProgram = buildFFTProgram(SPECTRUM_FRAGMENT_SHADER);
    var animProgram = buildFFTProgram(SPECTRUM_ANIMATE_SHADER);
    var fftHProgram = buildFFTProgram(FFT_HORIZONTAL_SHADER);
    var fftVProgram = buildFFTProgram(FFT_VERTICAL_SHADER);
    var fftOutProgram = buildFFTProgram(FFT_OUTPUT_SHADER);

    var fftU = {
        spec_N: gl.getUniformLocation(spectrumProgram, "N"),
        spec_windSpeed: gl.getUniformLocation(spectrumProgram, "windSpeed"),
        spec_windAngle: gl.getUniformLocation(spectrumProgram, "windAngle"),
        spec_smallWaveCutoff: gl.getUniformLocation(spectrumProgram, "smallWaveCutoff"),
        spec_directionSpread: gl.getUniformLocation(spectrumProgram, "directionSpread"),
        spec_waveScale: gl.getUniformLocation(spectrumProgram, "waveScale"),
        spec_heightAmp: gl.getUniformLocation(spectrumProgram, "heightAmp"),
        spec_patchSize: gl.getUniformLocation(spectrumProgram, "patchSize"),

        anim_spectrum0: gl.getUniformLocation(animProgram, "spectrum0"),
        anim_N: gl.getUniformLocation(animProgram, "N"),
        anim_time: gl.getUniformLocation(animProgram, "time"),
        anim_patchSize: gl.getUniformLocation(animProgram, "patchSize"),
        anim_speed: gl.getUniformLocation(animProgram, "speed"),
        anim_propagation: gl.getUniformLocation(animProgram, "propagation"),

        fftH_inputTex: gl.getUniformLocation(fftHProgram, "inputTex"),
        fftH_N: gl.getUniformLocation(fftHProgram, "N"),
        fftH_passIndex: gl.getUniformLocation(fftHProgram, "passIndex"),

        fftV_inputTex: gl.getUniformLocation(fftVProgram, "inputTex"),
        fftV_N: gl.getUniformLocation(fftVProgram, "N"),
        fftV_passIndex: gl.getUniformLocation(fftVProgram, "passIndex"),

        out_fftResult: gl.getUniformLocation(fftOutProgram, "fftResult"),
        out_N: gl.getUniformLocation(fftOutProgram, "N"),
        out_choppiness: gl.getUniformLocation(fftOutProgram, "choppiness"),
        out_heightScale: gl.getUniformLocation(fftOutProgram, "heightScale"),
        out_patchSize: gl.getUniformLocation(fftOutProgram, "patchSize")
    };

    // FFT quad VAO
    var fftVAO = gl.createVertexArray();
    gl.bindVertexArray(fftVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, simQuadBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    var lastSpecParams = {
        windSpeed: -1, windAngle: -1, waveScale: -1,
        smallWaveCutoff: -1, directionSpread: -1, heightAmp: -1,
        patchSize: -1
    };

    function regenerateSpectrum() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fftSpectrum0FBO);
        gl.viewport(0, 0, fftSize, fftSize);
        gl.useProgram(spectrumProgram);
        gl.uniform1i(fftU.spec_N, fftSize);
        gl.uniform1f(fftU.spec_windSpeed, state.oceanWindSpeed);
        gl.uniform1f(fftU.spec_windAngle, state.oceanWindAngle);
        gl.uniform1f(fftU.spec_smallWaveCutoff, state.oceanSmallWaveCut);
        gl.uniform1f(fftU.spec_directionSpread, state.oceanDirectionSpread);
        gl.uniform1f(fftU.spec_waveScale, state.oceanWaveScale);
        gl.uniform1f(fftU.spec_heightAmp, state.oceanHeightAmp);
        gl.uniform1f(fftU.spec_patchSize, state.oceanPatchSize);
        gl.bindVertexArray(fftVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        lastSpecParams.windSpeed = state.oceanWindSpeed;
        lastSpecParams.windAngle = state.oceanWindAngle;
        lastSpecParams.waveScale = state.oceanWaveScale;
        lastSpecParams.smallWaveCutoff = state.oceanSmallWaveCut;
        lastSpecParams.directionSpread = state.oceanDirectionSpread;
        lastSpecParams.heightAmp = state.oceanHeightAmp;
        lastSpecParams.patchSize = state.oceanPatchSize;
    }

    function spectrumNeedsRegen() {
        return (
            Math.abs(lastSpecParams.windSpeed - state.oceanWindSpeed) > 1e-4 ||
            Math.abs(lastSpecParams.windAngle - state.oceanWindAngle) > 1e-4 ||
            Math.abs(lastSpecParams.waveScale - state.oceanWaveScale) > 1e-4 ||
            Math.abs(lastSpecParams.smallWaveCutoff - state.oceanSmallWaveCut) > 1e-4 ||
            Math.abs(lastSpecParams.directionSpread - state.oceanDirectionSpread) > 1e-4 ||
            Math.abs(lastSpecParams.heightAmp - state.oceanHeightAmp) > 1e-4 ||
            Math.abs(lastSpecParams.patchSize - state.oceanPatchSize) > 1e-4
        );
    }

    function runFFTOcean(tSec) {
        if (spectrumNeedsRegen()) regenerateSpectrum();

        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.disable(gl.BLEND);

        // Pass 1: animate h0 → h(k,t) into fftPingTex[0]
        gl.bindFramebuffer(gl.FRAMEBUFFER, fftPingFBO[0]);
        gl.viewport(0, 0, fftSize, fftSize);
        gl.useProgram(animProgram);
        gl.uniform1i(fftU.anim_N, fftSize);
        gl.uniform1f(fftU.anim_time, tSec);
        gl.uniform1f(fftU.anim_patchSize, state.oceanPatchSize);
        gl.uniform1f(fftU.anim_speed, state.oceanSpeed);
        gl.uniform1f(fftU.anim_propagation, state.oceanPropagation);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fftSpectrum0Tex);
        gl.uniform1i(fftU.anim_spectrum0, 0);
        gl.bindVertexArray(fftVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Pass 2: forward FFT horizontal (8 sub-passes)
        gl.useProgram(fftHProgram);
        gl.uniform1i(fftU.fftH_N, fftSize);
        var srcIdx = 0;
        for (var i = 0; i < FFT_LOG2_SIZE; i++) {
            var dstIdx = 1 - srcIdx;
            gl.bindFramebuffer(gl.FRAMEBUFFER, fftPingFBO[dstIdx]);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fftPingTex[srcIdx]);
            gl.uniform1i(fftU.fftH_inputTex, 0);
            gl.uniform1i(fftU.fftH_passIndex, i);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            srcIdx = dstIdx;
        }

        // Pass 3: forward FFT vertical (8 sub-passes)
        gl.useProgram(fftVProgram);
        gl.uniform1i(fftU.fftV_N, fftSize);
        for (var j = 0; j < FFT_LOG2_SIZE; j++) {
            var dstIdx2 = 1 - srcIdx;
            gl.bindFramebuffer(gl.FRAMEBUFFER, fftPingFBO[dstIdx2]);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fftPingTex[srcIdx]);
            gl.uniform1i(fftU.fftV_inputTex, 0);
            gl.uniform1i(fftU.fftV_passIndex, j);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            srcIdx = dstIdx2;
        }

        // Pass 4: output — derive height, chop, foam from FFT result
        gl.bindFramebuffer(gl.FRAMEBUFFER, fftOutputFBO);
        gl.useProgram(fftOutProgram);
        gl.uniform1i(fftU.out_N, fftSize);
        gl.uniform1f(fftU.out_choppiness, state.oceanChop);
        gl.uniform1f(fftU.out_heightScale, 100.0 + state.oceanDetail * 100.0);
        gl.uniform1f(fftU.out_patchSize, state.oceanPatchSize);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fftPingTex[srcIdx]);
        gl.uniform1i(fftU.out_fftResult, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // Initial spectrum bake
    regenerateSpectrum();

    // =====================================================================
    // VAOS
    // =====================================================================

    var waterVAO = gl.createVertexArray();
    var simVAO = gl.createVertexArray();
    var skyVAO = gl.createVertexArray();
    var copyVAO = gl.createVertexArray();
    var dropVAO = gl.createVertexArray();

    function rebuildWaterVAO() {
        gl.bindVertexArray(waterVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindVertexArray(null);
    }

    function rebuildDropVAO() {
        gl.bindVertexArray(dropVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereMesh.posBuf);
        gl.enableVertexAttribArray(dropSpherePosLoc);
        gl.vertexAttribPointer(dropSpherePosLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereMesh.normBuf);
        gl.enableVertexAttribArray(dropSphereNormLoc);
        gl.vertexAttribPointer(dropSphereNormLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, dropInstanceBuffer);
        gl.enableVertexAttribArray(dropInstCenterLoc);
        gl.vertexAttribPointer(dropInstCenterLoc, 3, gl.FLOAT, false, 16, 0);
        gl.vertexAttribDivisor(dropInstCenterLoc, 1);
        gl.enableVertexAttribArray(dropInstRadiusLoc);
        gl.vertexAttribPointer(dropInstRadiusLoc, 1, gl.FLOAT, false, 16, 12);
        gl.vertexAttribDivisor(dropInstRadiusLoc, 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereMesh.idxBuf);
        gl.bindVertexArray(null);
    }

    rebuildWaterVAO();

    gl.bindVertexArray(skyVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyMesh.posBuf);
    gl.enableVertexAttribArray(skySpherePosLoc);
    gl.vertexAttribPointer(skySpherePosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyMesh.idxBuf);
    gl.bindVertexArray(null);

    gl.bindVertexArray(simVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, simQuadBuffer);
    gl.enableVertexAttribArray(simPosLoc);
    gl.vertexAttribPointer(simPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    gl.bindVertexArray(copyVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, simQuadBuffer);
    gl.enableVertexAttribArray(copyPosLoc);
    gl.vertexAttribPointer(copyPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    rebuildDropVAO();

    resizeCanvas();
    ResizeManager.attach(resizeCanvas);

    applyBackgroundImage();
    applyRiverbedImage();

    function spawnSimDrop(tNow) {
        if (fallingDrops.length >= MAX_FALLING_DROPS) return;
        if (pendingSimDrops.length >= MAX_DROPS) return;

        var sx = 0.1 + Math.random() * 0.96;
        var sy = 0.1 + Math.random() * 0.96;

        // Per-drop base amplitude (user-controlled), spread by variance.
        // Previously this was a hardcoded 0.7 + rand*0.6.
        var sAmpBase = state.rippleStrength;
        var sAmp = sAmpBase * (1.0 + (Math.random() * 2.0 - 1.0) * state.rippleStrengthVariance);

        var speedVar = 1.0 + (Math.random() * 2.0 - 1.0) * state.dropFallSpeedVariance;
        var vImpact = state.dropFallSpeed * speedVar;
        var fallTime = (2 * state.dropFallHeight) / vImpact;

        pendingSimDrops.push({
            x: sx, y: sy, z: sAmp,
            impactTime: tNow + fallTime,
            isChild: false,
            parentHeight: state.dropFallHeight
        });

        var sVar = 1.0 + Math.random() * state.dropSizeVariance;
        fallingDrops.push({
            x: sx, y: sy,
            spawnTime: tNow,
            duration: fallTime,
            size: state.dropSize * sVar,
            startZ: state.dropFallHeight,
            endZ: 0,
            isChild: false
        });
        if (fallingDrops.length > MAX_FALLING_DROPS) fallingDrops.shift();
    }

    var currentLineIdx = 0, currentCharIdx = 0;
    var currentCursorX = 0.05, lineY = 0.5, lastTypeTime = 0;

    var STORY_LINES = [
        "Badger", "packed", "his", "tiny", "bag,", "Stripy", "towel", "and", "sun-hat", "swag,",
        "Waddled", "down", "the", "sandy", "track,", "Dreaming", "of", "a", "seaside", "snack.",
        "But", "on", "the", "shore", "he", "heard", "a", "Yarr!", "Saw", "an", "eyepatch", "gleaming", "far", "-",
        "A", "pirate", "starfish", "struck", "a", "pose,", "Saltwater", "dripping", "off", "his", "toes.",
        "Oh,", "the", "badger", "and", "the", "starfish", "on", "a", "sunny", "holiday,", "One", "wants",
        "treasure", "buried", "deep,", "the", "other", "loves", "to", "play.", "Digging", "through",
        "the", "golden", "sand,", "a", "perfect", "little", "team,", "If", "there's", "a", "jam", "sandwich",
        "waiting,", "life", "is", "truly", "supreme.", "Starfish", "waved", "his", "tiny", "arm,", "Matey,",
        "help", "me!", "No", "alarm", "-", "I've", "got", "treasure,", "shiny", "bright,", "But", "I",
        "can't", "dig", "-", "it's", "quite", "a", "sight.", "Badger", "grinned,", "Well", "that's", "my",
        "thing,", "I'll", "dig", "a", "hole", "fit", "for", "a", "king.", "But", "I'll", "need", "payment",
        "for", "my", "toil", "How", "'bout", "a", "jam", "sandwich", "for", "the", "spoil?",
        "Oh,", "the", "badger", "and", "the", "starfish", "on", "a", "sunny", "holiday,", "One", "wants",
        "treasure", "buried", "deep,", "the", "other", "loves", "to", "play.", "Digging", "through",
        "the", "golden", "sand,", "a", "perfect", "little", "team,", "If", "there's", "a", "jam", "sandwich",
        "waiting,", "life", "is", "truly", "supreme.", "So", "they", "dug", "and", "dug", "until", "the",
        "sun,", "Turned", "the", "waves", "to", "liquid", "gold.", "Starfish", "placed", "his", "chest",
        "inside,", "Secrets", "safe", "and", "stories", "told.", "Badger", "munched", "his",
        "sandwich", "sweet,", "Jam", "dripping", "on", "his", "sandy", "feet", "-", "Two", "new",
        "friends", "upon", "the", "shore,", "Pirate", "tales", "forever", "more.", "Yeah,", "the",
        "badger", "and", "the", "starfish", "on", "a", "sunny", "holiday,", "Treasure", "buried,",
        "sandwich", "eaten,", "perfect", "seaside", "day.", "If", "you", "stroll", "along", "that",
        "beach,", "you", "might", "just", "hear", "them", "sing", "-", "A", "pirate's", "laugh,", "a",
        "badger's", "cheer,", "in", "harmony", "they", "ring."
    ];

    function spawnLiveTextLetter(tNow) {
        if (!liveTextCurrentWord) {
            if (liveTextQueue.length === 0) return;
            if (tNow - lastTypeTime < state.letterLineDelay) return;
            liveTextCurrentWord = liveTextQueue.shift();
            liveTextCharIdx = 0;
            var totalWidth = 0;
            for (var i = 0; i < liveTextCurrentWord.length; i++) {
                var c = liveTextCurrentWord[i];
                var isSpace = (c === ' ');
                var charSize = state.letterSize * (1.0 + (0.5 * state.letterSizeVariance));
                totalWidth += isSpace ? (state.letterSize * state.letterSpacing) : (charSize * state.letterSpacing);
            }
            currentCursorX = 0.5 - (totalWidth * 0.5);
        }
        if (liveTextCharIdx >= liveTextCurrentWord.length) {
            liveTextCurrentWord = null;
            lastTypeTime = tNow;
            return;
        }
        var ch = liveTextCurrentWord[liveTextCharIdx];
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
        liveTextCharIdx++;
        lastTypeTime = tNow;
    }

    function spawnLetter(tNow) {
        if (state.liveText) {
            spawnLiveTextLetter(tNow);
            return;
        }
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
    var scaledTime = 0;

    var dropArrScratch = new Float32Array(MAX_DROPS * 4);
    var lArrScratch = new Float32Array(MAX_LETTERS * 4);
    var lParamArrScratch = new Float32Array(MAX_LETTERS * 4);
    var lVArrScratch = new Float32Array(MAX_LETTERS * 4);
    var instDataScratch = new Float32Array(MAX_FALLING_DROPS * 4);

    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            var dtRealMs = (lastFrameTime === 0) ? 0 : Math.min(now - lastFrameTime, 100);
            lastFrameTime = now;
            var dtRealSec = dtRealMs * 0.001;

            if (transitionActive) {
                var tn = (now - transitionStartTime) / transitionDuration;
                if (tn >= 1) {
                    tn = 1;
                    transitionActive = false;
                    Object.keys(DEFAULTS).forEach(function (key) {
                        if (STANDALONE_KEYS[key]) return;
                        state[key] = transitionTarget[key];
                    });
                    refreshControlsUI();
                    if (window.__promoteTransitionEnd) window.__promoteTransitionEnd();
                    bgBlend = 0;
                    bedBlend = 0;
                } else {
                    Object.keys(DEFAULTS).forEach(function (key) {
                        if (STANDALONE_KEYS[key]) return;
                        if (DISCRETE_KEYS[key]) return;
                        var a = transitionSource[key];
                        var b = transitionTarget[key];
                        state[key] = a + (b - a) * tn;
                        if (INT_KEYS[key]) state[key] = Math.round(state[key]);
                    });
                    bgBlend = tn;
                    bedBlend = tn;
                    if ((now | 0) % 4 === 0) refreshControlsUI();
                }
            }

            scaledTime += dtRealSec * state.timeScale;
            var tSec = scaledTime;
            var dtSim = dtRealSec * state.timeScale;

            simDriftPhaseX = mod1(simDriftPhaseX - dtSim * state.rippleDriftX);
            simDriftPhaseY = mod1(simDriftPhaseY - dtSim * state.rippleDriftY);

            var simEffectiveRate = Math.min(state.rainRate, MAX_DROPS);
            var simSpawnInterval = simEffectiveRate > 0.001 ? 1.0 / simEffectiveRate : 1e9;
            nextSimDropTime = advanceSpawnClock(tSec, nextSimDropTime, simSpawnInterval, 8, spawnSimDrop);

            for (var pi = pendingSimDrops.length - 1; pi >= 0; pi--) {
                var imp = pendingSimDrops[pi];
                if (tSec >= imp.impactTime) {
                    if (simDrops.length < MAX_DROPS) {
                        simDrops.push({ x: imp.x, y: imp.y, z: imp.z });
                    }

                    if (!imp.isChild && state.dropSplashCount > 0) {
                        var nMax = Math.round(state.dropSplashCount);
                        var nSplash = Math.floor(Math.random() * (nMax + 1));

                        for (var si = 0; si < nSplash; si++) {
                            if (fallingDrops.length >= MAX_FALLING_DROPS) break;
                            if (pendingSimDrops.length >= MAX_DROPS) break;

                            var jitterX = (Math.random() * 2.0 - 1.0) * 0.005;
                            var jitterY = (Math.random() * 2.0 - 1.0) * 0.005;
                            var childUVx = imp.x + jitterX;
                            var childUVy = imp.y + jitterY;

                            var wx0 = (childUVx - 0.5) * 4.0;
                            var wy0 = (childUVy - 0.5) * 4.0;

                            var theta = Math.random() * Math.PI * 2.0;

                            var apexH = imp.parentHeight * state.dropSplashHeightFactor
                                * (0.5 + Math.random());
                            if (apexH < 0.001) continue;

                            var g = (state.dropFallSpeed * state.dropFallSpeed)
                                / (2 * state.dropFallHeight);
                            if (g < 1e-6) g = 1e-6;

                            var vz = Math.sqrt(2 * g * apexH);
                            var airTime = 2 * vz / g;

                            var launchRadius = apexH * (0.4 + Math.random() * 0.6);
                            var vh = launchRadius / airTime;

                            var inheritedVX = state.rippleDriftX * 4.0 * state.dropSplashDriftInheritance;
                            var inheritedVY = state.rippleDriftY * 4.0 * state.dropSplashDriftInheritance;

                            var vx = Math.cos(theta) * vh + inheritedVX;
                            var vy = Math.sin(theta) * vh + inheritedVY;

                            var wxLand = wx0 + vx * airTime;
                            var wyLand = wy0 + vy * airTime;
                            var cxLand = wxLand / 4.0 + 0.5;
                            var cyLand = wyLand / 4.0 + 0.5;

                            var childZ = imp.z * state.dropSplashStrengthFactor;

                            pendingSimDrops.push({
                                x: cxLand, y: cyLand, z: childZ,
                                impactTime: tSec + airTime,
                                isChild: true,
                                parentHeight: apexH
                            });

                            var childSizeVar = 1.0 + Math.random() * state.dropSizeVariance;
                            fallingDrops.push({
                                wx0: wx0, wy0: wy0, wz0: 0.0,
                                vx: vx, vy: vy, vz: vz,
                                g: g,
                                spawnTime: tSec,
                                duration: airTime,
                                size: state.dropSize * state.dropSplashSizeFactor * childSizeVar,
                                isChild: true
                            });
                        }
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

            var simDtScale = Math.max(0, state.timeScale) / 2.0;
            var numSimSteps = Math.max(1, Math.ceil(simDtScale));
            var simDtPerStep = simDtScale / numSimSteps;

            gl.useProgram(simProgram);
            gl.uniform1f(simU.tension, state.simTension);
            gl.uniform1f(simU.damping, state.simDamping);
            gl.uniform1f(simU.springiness, state.simSpringiness);
            gl.uniform1f(simU.impulseStrength, state.simRainImpulse);
            gl.uniform1f(simU.resolution, simRes);
            gl.uniform1f(simU.dropRadius, state.simDropRadius);
            gl.uniform1f(simU.dropCore, state.simDropCore);
            gl.uniform1f(simU.simDt, simDtPerStep * state.rippleSpeed);

            var dropArr = dropArrScratch;
            var dropCount = Math.min(simDrops.length, MAX_DROPS);
            for (var di = 0; di < dropCount; di++) {
                dropArr[di * 4 + 0] = mod1(simDrops[di].x + simDriftPhaseX);
                dropArr[di * 4 + 1] = mod1(simDrops[di].y + simDriftPhaseY);
                dropArr[di * 4 + 2] = simDrops[di].z;
                dropArr[di * 4 + 3] = 0.0;
            }
            gl.uniform4fv(simU.drops, dropArr.subarray(0, dropCount * 4));
            simDrops.length = 0;

            gl.bindVertexArray(simVAO);
            gl.viewport(0, 0, simRes, simRes);

            for (var step = 0; step < numSimSteps; step++) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, simTextures[simCurrent]);
                gl.uniform1i(simU.currState, 0);
                gl.uniform1i(simU.dropCount, step === 0 ? dropCount : 0);
                gl.bindFramebuffer(gl.FRAMEBUFFER, simFBOs[1 - simCurrent]);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                simCurrent = 1 - simCurrent;
            }
            gl.bindVertexArray(null);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // FFT ocean update
            runFFTOcean(tSec);

            gl.useProgram(program);

            gl.bindFramebuffer(gl.FRAMEBUFFER, waterFBO);
            gl.viewport(0, 0, canvas.width, canvas.height);

            if (state.bgImageEnabled > 0.5) {
                gl.disable(gl.DEPTH_TEST);
                gl.depthMask(false);
                gl.disable(gl.CULL_FACE);
                gl.useProgram(skyProgram);

                gl.uniform1f(skySurfaceTiltLoc, state.surfaceTilt);
                gl.uniform1f(skyPerspStrengthLoc, state.perspectiveStrength);
                gl.uniform1f(skyCameraHeightLoc, state.cameraHeight);
                gl.uniform1f(skyRadiusLoc, 1000.0);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, bgTextureA);
                gl.uniform1i(skyBgTexALoc, 0);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, bgTextureB);
                gl.uniform1i(skyBgTexBLoc, 1);
                gl.uniform1f(skyBgBlendLoc, bgBlend);
                gl.uniform2f(skyBgTileLoc, state.bgImageTileX, state.bgImageTileY);

                gl.bindVertexArray(skyVAO);
                gl.drawElements(gl.TRIANGLES, skyMesh.indexCount, gl.UNSIGNED_SHORT, 0);
                gl.bindVertexArray(null);

                gl.depthMask(true);
            } else {
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }

            gl.useProgram(program);
            gl.uniform1f(timeLocation, tSec);
            var sc = ["letterRippleSpeed",
                "rgbSplit", "rgbAngle", "surfaceDepth", "surfaceTilt", "perspectiveStrength", "cameraHeight",
                "specularPower", "specularStrength", "fresnelPower", "vignetteRadius", "vignetteSoftness",
                "waterDepth", "absorption", "sandScale", "sandContrast", "refractionStrength", "envMapStrength",
                "letterSize", "letterSpeed", "letterWavelength", "letterThickness"];
            sc.forEach(function (k) { if (u[k]) gl.uniform1f(u[k], state[k]); });

            if (u.oceanTexSize) gl.uniform2f(u.oceanTexSize, fftSize, fftSize);
            if (u.oceanPatchSize) gl.uniform1f(u.oceanPatchSize, state.oceanPatchSize);
            if (u.foamThreshold) gl.uniform1f(u.foamThreshold, state.oceanFoamThreshold);
            if (u.foamStrength) gl.uniform1f(u.foamStrength, state.oceanFoamStrength);

            if (u.letterSpread) gl.uniform1f(u.letterSpread, sdfAtlas.spread / sdfAtlas.cellSize);
            if (u.letterStrengthGlobal) gl.uniform1f(u.letterStrengthGlobal, state.letterStrength);

            if (u.simRes) gl.uniform1f(u.simRes, simRes);
            if (u.causticStrength) gl.uniform1f(u.causticStrength, state.causticStrength);
            if (u.simCausticStrength) gl.uniform1f(u.simCausticStrength, state.simCausticStrength);
            if (u.causticRGBScale) gl.uniform1f(u.causticRGBScale, state.causticRGBScale);
            if (u.causticRGBAngle) gl.uniform1f(u.causticRGBAngle, state.causticRGBAngle);
            if (u.causticRGBAffectedBySurface) gl.uniform1f(u.causticRGBAffectedBySurface, state.causticRGBAffectedBySurface);
if (u.bedDepthScale) gl.uniform1f(u.bedDepthScale, state.bedDepthScale);
            gl.uniform2f(u.rippleDrift, state.rippleDriftX, state.rippleDriftY);

            var lArr = lArrScratch;
            var lParamArr = lParamArrScratch;
            var lVArr = lVArrScratch;
            var lCount = Math.min(letterRipples.length, MAX_LETTERS);
            for (var li = 0; li < lCount; li++) {
                var lr = letterRipples[li];
                lArr[li * 4 + 0] = lr.x; lArr[li * 4 + 1] = lr.y; lArr[li * 4 + 2] = lr.spawnTime; lArr[li * 4 + 3] = lr.strength;
                lParamArr[li * 4 + 0] = lr.decay; lParamArr[li * 4 + 1] = lr.size; lParamArr[li * 4 + 2] = lr.rot; lParamArr[li * 4 + 3] = 0.0;
                lVArr[li * 4 + 0] = lr.u0; lVArr[li * 4 + 1] = lr.v0; lVArr[li * 4 + 2] = lr.u1; lVArr[li * 4 + 3] = lr.v1;
            }
            if (u.letterRipples) gl.uniform4fv(u.letterRipples, lArr.subarray(0, lCount * 4));
            if (u.letterRippleParams) gl.uniform4fv(u.letterRippleParams, lParamArr.subarray(0, lCount * 4));
            if (u.letterRippleV) gl.uniform4fv(u.letterRippleV, lVArr.subarray(0, lCount * 4));
            if (u.letterCount) gl.uniform1i(u.letterCount, lCount);

            gl.uniform3f(u.waterColor, state.waterColorR, state.waterColorG, state.waterColorB);
            gl.uniform3f(u.waterDeep, state.waterDeepR, state.waterDeepG, state.waterDeepB);
            gl.uniform3f(u.skyHorizon, state.skyHorizonR, state.skyHorizonG, state.skyHorizonB);
            gl.uniform3f(u.skyZenith, state.skyZenithR, state.skyZenithG, state.skyZenithB);
            gl.uniform3f(u.sandColor, state.sandR, state.sandG, state.sandB);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, simTextures[simCurrent]);
            gl.uniform1i(u.simTexture, 1);
            gl.uniform1i(u.simDebugTex, 1);
            gl.uniform2f(u.simDrift, simDriftPhaseX, simDriftPhaseY);
            gl.uniform1f(u.debugSim, state.debugSim);

            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(gl.TEXTURE_2D, fftOutputTex);
            if (u.oceanTex) gl.uniform1i(u.oceanTex, 6);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, sdfAtlas.texture);
            gl.uniform1i(u.letterAtlas, 2);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, bgTextureA);
            gl.uniform1i(u.envMapA, 0);
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, bgTextureB);
            gl.uniform1i(u.envMapB, 4);
            gl.uniform1f(u.envMapBlend, bgBlend);
            if (u.envMapZoom) gl.uniform1f(u.envMapZoom, state.envMapZoom);
            if (u.envMapPan) gl.uniform2f(u.envMapPan, state.envMapPanX, state.envMapPanY);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, bedTextureA);
            if (u.bedTextureA) gl.uniform1i(u.bedTextureA, 3);
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, bedTextureB);
            if (u.bedTextureB) gl.uniform1i(u.bedTextureB, 5);
            if (u.bedBlend) gl.uniform1f(u.bedBlend, bedBlend);
            if (u.bedImageEnabled) gl.uniform1f(u.bedImageEnabled, state.bedImageEnabled);
            if (u.bedImageTile) gl.uniform2f(u.bedImageTile, state.bedImageTileX, state.bedImageTileY);

            var sa = state.sunAngle, sh = state.sunHeight;
            var shH = Math.sqrt(Math.max(0.01, 1.0 - sh * sh));
            var sunDirX = Math.cos(sa) * shH;
            var sunDirY = Math.sin(sa) * shH;
            var sunDirZ = sh;
            gl.uniform3f(u.sunDir, sunDirX, sunDirY, sunDirZ);

            gl.bindVertexArray(waterVAO);
            gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
            gl.bindVertexArray(null);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
            gl.useProgram(copyProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, waterTexture);
            gl.uniform1i(copyTexLoc, 0);
            gl.uniform2f(copyInvResLoc, 1.0 / canvas.width, 1.0 / canvas.height);
            gl.uniform1f(copyFxaaStrengthLoc, state.fxaaStrength);
            gl.bindVertexArray(copyVAO);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindVertexArray(null);
            gl.depthMask(true);
            gl.clear(gl.DEPTH_BUFFER_BIT);

            if (fallingDrops.length > 0) {
                ensureSphereMesh(state.sphereQuality);
                rebuildDropVAO();

                var instData = instDataScratch;
                var dropInstCount = 0;
                for (var fi = 0; fi < fallingDrops.length; fi++) {
                    var fd = fallingDrops[fi];
                    var age = tSec - fd.spawnTime;
                    if (age < 0 || age > fd.duration) continue;
                    var gX, gY, gZ;

                    if (fd.isChild) {
                        gX = fd.wx0 + fd.vx * age;
                        gY = fd.wy0 + fd.vy * age;
                        gZ = fd.wz0 + fd.vz * age - 0.5 * fd.g * age * age;
                    } else {
                        var tt = age / fd.duration;
                        gX = (fd.x - 0.5) * 4.0;
                        gY = (fd.y - 0.5) * 4.0;
                        var startZ = (fd.startZ !== undefined) ? fd.startZ : state.dropFallHeight;
                        gZ = startZ * (1.0 - tt);
                    }

                    var rad = fd.size * 3.5;
                    instData[dropInstCount * 4 + 0] = gX;
                    instData[dropInstCount * 4 + 1] = gY;
                    instData[dropInstCount * 4 + 2] = gZ;
                    instData[dropInstCount * 4 + 3] = rad;
                    dropInstCount++;
                    if (dropInstCount >= MAX_FALLING_DROPS) break;
                }

                if (dropInstCount > 0) {
                    gl.useProgram(dropProgram);
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(gl.LEQUAL);
                    gl.disable(gl.CULL_FACE);

                    gl.uniform1f(dropU.surfaceTilt, state.surfaceTilt);
                    gl.uniform1f(dropU.perspectiveStrength, state.perspectiveStrength);
                    gl.uniform1f(dropU.cameraHeight, state.cameraHeight);
                    gl.uniform1f(dropU.specularPower, state.specularPower);
                    gl.uniform1f(dropU.specularStrength, state.specularStrength);
                    gl.uniform1f(dropU.fresnelPower, state.fresnelPower);
                    gl.uniform1f(dropU.absorption, state.absorption);
                    gl.uniform1f(dropU.envMapStrength, state.envMapStrength);
                    gl.uniform1f(dropU.envMapZoom, state.envMapZoom);
                    gl.uniform2f(dropU.envMapPan, state.envMapPanX, state.envMapPanY);
                    gl.uniform1f(dropU.vignetteRadius, state.vignetteRadius);
                    gl.uniform1f(dropU.vignetteSoftness, state.vignetteSoftness);
                    gl.uniform3f(dropU.waterColor, state.waterColorR, state.waterColorG, state.waterColorB);
                    gl.uniform3f(dropU.waterDeep, state.waterDeepR, state.waterDeepG, state.waterDeepB);
                    gl.uniform3f(dropU.skyHorizon, state.skyHorizonR, state.skyHorizonG, state.skyHorizonB);
                    gl.uniform3f(dropU.skyZenith, state.skyZenithR, state.skyZenithG, state.skyZenithB);
                    gl.uniform3f(dropU.sunDir, sunDirX, sunDirY, sunDirZ);
                    gl.uniform2f(dropU.screenResolution, canvas.width, canvas.height);

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, bgTextureA);
                    gl.uniform1i(dropU.envMapA, 0);
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, bgTextureB);
                    gl.uniform1i(dropU.envMapB, 2);
                    gl.uniform1f(dropU.envMapBlend, bgBlend);

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, waterTexture);
                    gl.uniform1i(dropU.waterTexture, 1);

                    gl.bindBuffer(gl.ARRAY_BUFFER, dropInstanceBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, instData.subarray(0, dropInstCount * 4), gl.DYNAMIC_DRAW);

                    gl.bindVertexArray(dropVAO);
                    gl.drawElementsInstanced(gl.TRIANGLES, sphereMesh.indexCount,
                        gl.UNSIGNED_SHORT, 0, dropInstCount);
                    gl.bindVertexArray(null);

                    gl.disable(gl.DEPTH_TEST);
                    gl.depthMask(true);
                }
            }

            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null);
            gl.activeTexture(gl.TEXTURE0);
        }
        animationFrameId = requestAnimationFrame(animate);
        window.animationFrameId = animationFrameId;
    }

    var fontSelect = document.getElementById("font-select");
    if (fontSelect) {
        fontSelect.addEventListener("change", function () {
            var selectedFont = this.value;
            this.style.fontFamily = "'" + selectedFont + "', monospace";
            document.fonts.load("bold 40px '" + selectedFont + "'").then(function () {
                if (sdfAtlas && sdfAtlas.texture) gl.deleteTexture(sdfAtlas.texture);
                sdfAtlas = buildSDFAtlas(gl, selectedFont);
            });
        });
    }

    animate();
}

// =====================================================================
// FONT DROPDOWN
// =====================================================================

var FONT_OPTIONS = [
    "Astloch", "Bangers", "Bonbon", "Bungee Outline", "Chicle",
    "Comic Neue", "Courier Prime", "Crafty Girls", "Creepster", "Edu SA Hand",
    "Finger Paint", "Great Vibes", "Henny Penny", "Indie Flower", "Kablammo",
    "Lily Script One", "Lobster", "McLaren", "Mountains of Christmas", "New Rocker",
    "Noto Sans", "Noto Sans Old Hungarian", "Pacifico", "Permanent Marker", "Playfair Display",
    "Playwrite Italia Tradizionale", "Press Start 2P", "Princess Sofia", "Roboto", "Rock Salt",
    "Rubik Puddles", "Rubik Spray Paint", "Rubik Storm", "Schoolbell", "Slackey", "VT323"
];

function buildFontDropdown() {
    var sel = document.getElementById("font-select");
    if (!sel) return;
    sel.innerHTML = "";
    FONT_OPTIONS.forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        opt.style.fontFamily = "'" + name + "', monospace";
        opt.style.fontSize = "18px";
        sel.appendChild(opt);
    });
}

// =====================================================================
// BOOT
// =====================================================================
buildControlsUI();
buildPresetDropdown();
buildFontDropdown();
setupControlHandlers();
main();