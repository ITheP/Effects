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

    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported');
        return;
    }

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    ResizeManager.attach(resizeCanvas);

    // Vertex Shader Source
    var vertexShaderSource = `
            attribute vec2 position;
            varying vec2 v_texCoord;
            void main() {
                v_texCoord = position * 0.5 + 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

    // Fragment Shader Source (Generates Color Wave Effect)
    // Fragment Shader Source (Liquid Plasma RGB)
// Fragment Shader Source (Liquid Plasma RGB + Rotation)
var fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform float time;

    // Smooth pseudo-noise from layered sines
    float plasma(vec2 p, float t) {
        float v = sin(p.x * 3.1 + t * 0.7);
        v += sin(p.y * 2.7 - t * 0.9);
        v += sin((p.x + p.y) * 2.2 + t * 1.1);
        v += sin(length(p - 0.5) * 8.0 - t * 1.3);
        return v * 0.25;
    }

    // Rotate a 2D point around origin
    vec2 rot(vec2 p, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    }

    void main() {
        // Center coordinates and polar form
        vec2 uv = v_texCoord - 0.5;
        float r = length(uv);
        float a = atan(uv.y, uv.x);

        // --- Global slow rotation of the whole field ---
        float globalSpin = time * 0.25;
        uv = rot(uv, globalSpin);
        a = atan(uv.y, uv.x);

        // Kaleidoscopic fold: mirror angle into 6 wedges
        float wedges = 6.0;
        a = abs(mod(a + 3.14159265 / wedges, 6.2831853 / wedges) - 3.14159265 / wedges);

        // Convert back to cartesian for sampling
        vec2 kp = vec2(cos(a), sin(a)) * r;

        // Slight radial pulse — keeps motion organic
        float pulse = 1.0 + 0.15 * sin(time * 0.6 + r * 6.0);
        kp *= pulse;

        // Per-channel time offsets AND per-channel rotation offsets
        // This is what gives the chromatic swirl
        float tR = time * 0.9;
        float tG = time * 0.9 + 0.7;
        float tB = time * 0.9 + 1.4;

        float spinR = 0.0;
        float spinG = time * 0.18;   // green rotates one way
        float spinB = -time * 0.18;  // blue rotates the other way

        vec2 kpR = rot(kp, spinR);
        vec2 kpG = rot(kp, spinG);
        vec2 kpB = rot(kp, spinB);

        // Each channel samples a differently-timed & differently-rotated field
        float rCh = plasma(kpR + vec2(0.02, 0.0), tR);
        float gCh = plasma(kpG, tG);
        float bCh = plasma(kpB - vec2(0.02, 0.0), tB);

        // Map from [-1,1] to [0,1] with contrast curve
        rCh = 0.5 + 0.5 * rCh;
        gCh = 0.5 + 0.5 * gCh;
        bCh = 0.5 + 0.5 * bCh;

        // Gentle gamma-ish shaping for richer color
        rCh = pow(rCh, 1.3);
        gCh = pow(gCh, 1.3);
        bCh = pow(bCh, 1.3);

        vec3 color = vec3(rCh, gCh, bCh);

        // Soft circular vignette (kept from original aesthetic)
        float radius = 0.38;
        float softness = 0.22;
        float vignette = smoothstep(radius, radius + softness, r);
        color = mix(color, vec3(0.0), vignette);

        gl_FragColor = vec4(color, 1.0);
    }
`;

    // Define Quad Geometry (Full-Screen Triangle Strip)
    var vertices = new Float32Array([
        -1, -1, 1, -1, -1, 1, 1, 1
    ]);

    // Compile Shader Function
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

    // Create Program & Attach Shaders
    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Handle Time Uniform
    var timeLocation = gl.getUniformLocation(program, "time");

    // Throttle animation a bit, doesn't need to be mad
    var lastFrameTime = 0;
    var targetFPS = 60;
    var frameInterval = 1000 / targetFPS;  // ~33.3ms per frame

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    function animate(now) {
        if (now - lastFrameTime >= frameInterval) {
            lastFrameTime = now;

            // Update shader time uniform
            gl.uniform1f(timeLocation, now * 0.001);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

main();