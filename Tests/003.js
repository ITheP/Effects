var shaderEnabled = document.getElementById('shaderToggle') ? document.getElementById('shaderToggle').checked : true;

function toggleShaderEffect() {
    shaderEnabled = !shaderEnabled;

    if (shaderEnabled) {
        main();
    } else {
        cancelAnimationFrame(animationFrameId);
        document.body.querySelectorAll("canvas").forEach(canvas => canvas.remove());
    }
}

function main() {
    // Vaguely clean up any existing effect
    cancelAnimationFrame(animationFrameId);
    document.body.querySelectorAll("canvas").forEach(canvas => canvas.remove());

    if (!shaderEnabled) {
        return;
    }
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

        // Fragment Shader Source (Undulating Fractal Effect)
    var fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform float time;

            // Cheap fractal-ish noise: layered domain-warped sine field
            float fractalField(vec2 p, float t, float zoom) {
                // Center coordinates so the pattern is symmetric
                p = p * 2.0 - 1.0;
                p *= zoom;

                float v = 0.0;
                float amp = 0.5;
                vec2 warp = vec2(0.0);

                // Few iterations keeps this fast while still looking fractal
                for (int i = 0; i < 5; i++) {
                    float fi = float(i);

                    // Undulating domain warp, different phase per octave
                    warp = vec2(
                        sin(p.y * (1.0 + fi * 0.7) + t * (0.3 + fi * 0.12)),
                        cos(p.x * (1.0 + fi * 0.7) + t * (0.27 + fi * 0.11))
                    );

                    // Slowly drifting sample point + warp
                    vec2 q = p + warp * amp * 0.9
                               + vec2(sin(t * 0.21), cos(t * 0.19)) * 0.15;

                    // Radial fractal-ish value
                    float d = sin(q.x * 2.1 + q.y * 1.7)
                            * cos(q.y * 2.3 - q.x * 1.3)
                            + sin(length(q) * 3.0 - t * 0.4);

                    v += d * amp;

                    // Halve amplitude and scale up frequency each octave
                    amp *= 0.55;
                    p *= 1.9;
                }

                return v * 0.5 + 0.5;
            }

            void main() {
                vec2 uv = v_texCoord;

                // Calm global drift, sped up per request
                float t = time * 2.5;

                // Smoothly breathe zoom between 1.0 and 10.0
                // (midpoint 5.5, amplitude 4.5), period ~= 12.5s at t = time*2.5
                float zoom = 5.5 + 4.5 * sin(time * 0.05);

                // Separate speeds per channel (slightly detuned for shimmer)
                float tR = t * 1.00;
                float tG = t * 1.07;
                float tB = t * 0.93;

                float r = fractalField(uv, tR, zoom);
                float g = fractalField(uv + vec2(0.003, 0.0), tG, zoom);
                float b = fractalField(uv + vec2(0.0, 0.003), tB, zoom);

                vec3 color = vec3(r, g, b);

                // Gentle contrast curve to keep things smooth
                color = color * 0.8 + 0.1;

                // Soft round vignette
                vec2 center = vec2(0.5);
                float dist = distance(uv, center);
                float radius = 0.35;
                float softness = 0.20;
                float vignette = smoothstep(radius, radius + softness, dist);
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