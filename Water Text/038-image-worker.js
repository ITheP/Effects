// image-worker.js
// Runs processImage + inferHeightmap off the main thread using OffscreenCanvas.

self.onmessage = async function (e) {
    var msg = e.data;
    if (msg.type !== "process") return;

    var {
        id,
        bitmap,          // ImageBitmap
        targetW,
        targetH,
        seamlessX,
        seamlessY,
        blurRadius,
        wantHeightmap
    } = msg;

    try {
        var processed = await processImageAsync(bitmap, targetW, targetH, seamlessX, seamlessY);

        var heightBitmap = null;
        if (wantHeightmap) {
            var heightCanvas = inferHeightmap(processed, blurRadius);
            heightBitmap = heightCanvas.transferToImageBitmap();
        }

        var albedoBitmap = processed.transferToImageBitmap();

        self.postMessage({
            type: "processed",
            id: id,
            albedo: albedoBitmap,
            heightmap: heightBitmap
        }, [albedoBitmap, heightBitmap].filter(Boolean));
    } catch (err) {
        self.postMessage({ type: "error", id: id, error: String(err) });
    }
};

function yieldFrame() {
    // Inside a worker there's no rAF; just yield to the event loop.
    // Posting to ourselves forces the message queue to drain, which is
    // enough to keep the worker's stack thin. The main thread never blocks
    // because it's not running this code anyway — this is only here to
    // make the code look the same as the main-thread version.
    return Promise.resolve();
}

function processImageAsync(bitmap, targetW, targetH, seamlessX, seamlessY) {
    return new Promise(function (resolve) {
        var srcW = bitmap.width, srcH = bitmap.height;

        // Same "matched" logic as before — if the source already matches a
        // standard scale option, use native size.
        var useW = targetW, useH = targetH;
        var matched = false;
        // NOTE: SCALE_OPTIONS is duplicated here because workers can't
        // import from the main script. If you add options, keep in sync.
        var SCALE_OPTIONS = [
            { w: 256, h: 256 }, { w: 512, h: 256 }, { w: 512, h: 512 },
            { w: 1024, h: 512 }, { w: 1024, h: 1024 }, { w: 2048, h: 1024 }
        ];
        for (var i = 0; i < SCALE_OPTIONS.length; i++) {
            if (srcW === SCALE_OPTIONS[i].w && srcH === SCALE_OPTIONS[i].h) {
                useW = srcW; useH = srcH; matched = true; break;
            }
        }

        var canvas = new OffscreenCanvas(useW, useH);
        var ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (matched) {
            ctx.drawImage(bitmap, 0, 0);
        } else {
            var isDownscale = srcW > useW || srcH > useH;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = isDownscale ? "high" : "low";
            ctx.drawImage(bitmap, 0, 0, useW, useH);
        }

        // --- seamless blend, same logic as processImage ---
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

        resolve(canvas);
    });
}

// Copy of inferHeightmap, using OffscreenCanvas instead of document.createElement.
// Keep in sync with the main-thread version if you tweak it.
function inferHeightmap(sourceCanvas, blurRadius) {
    var w = sourceCanvas.width;
    var h = sourceCanvas.height;

    var srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    var srcData = srcCtx.getImageData(0, 0, w, h).data;

    var lum = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) {
        lum[i] = (srcData[i * 4] * 0.299 +
                  srcData[i * 4 + 1] * 0.587 +
                  srcData[i * 4 + 2] * 0.114) / 255;
    }

    var r = Math.max(0, Math.floor(blurRadius));
    if (r > 0) {
        var tmp = new Float32Array(w * h);
        var windowCount = 2 * r + 1;

        for (var y0 = 0; y0 < h; y0++) {
            var rowStart = y0 * w;
            var sum = 0;
            for (var kx = -r; kx <= r; kx++) sum += lum[rowStart + (((kx % w) + w) % w)];
            for (var x = 0; x < w; x++) {
                tmp[rowStart + x] = sum / windowCount;
                var outX = (((x - r) % w) + w) % w;
                var inX  = (((x + r + 1) % w) + w) % w;
                sum += lum[rowStart + inX] - lum[rowStart + outX];
            }
        }

        for (var x1 = 0; x1 < w; x1++) {
            var vsum = 0;
            for (var ky = -r; ky <= r; ky++) vsum += tmp[((((ky % h) + h) % h)) * w + x1];
            for (var y = 0; y < h; y++) {
                lum[y * w + x1] = vsum / windowCount;
                var outY = (((y - r) % h) + h) % h;
                var inY  = (((y + r + 1) % h) + h) % h;
                vsum += tmp[inY * w + x1] - tmp[outY * w + x1];
            }
        }
    }

    var minV = Infinity, maxV = -Infinity;
    for (var j = 0; j < lum.length; j++) {
        if (lum[j] < minV) minV = lum[j];
        if (lum[j] > maxV) maxV = lum[j];
    }
    var span = Math.max(1e-4, maxV - minV);

    var outCanvas = new OffscreenCanvas(w, h);
    var outCtx = outCanvas.getContext("2d", { willReadFrequently: true });
    var outImg = outCtx.createImageData(w, h);
    var od = outImg.data;
    for (var m = 0; m < lum.length; m++) {
        var v = Math.round(((lum[m] - minV) / span) * 255);
        od[m * 4] = v; od[m * 4 + 1] = v; od[m * 4 + 2] = v; od[m * 4 + 3] = 255;
    }
    outCtx.putImageData(outImg, 0, 0);
    return outCanvas;
}