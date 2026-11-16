// =====================================================================
// assets.js
// GFX Asset Handler for the lava lamp game.
// Exposes window.GFXAssets.
//
// An "asset" is a named set of one or more variant images that play
// as an animation loop. Each asset has:
//   id          – stable string key (e.g. "ship-001")
//   name        – human readable label
//   description – optional longer text
//   count       – number of frames (>= 1)
//   images      – array of HTMLImageElement
//
// Variant naming: given `base.svg` and count N > 0, the loader fetches
//   base.000.svg, base.001.svg, ... base.(N-1).svg
// If count is 0, the loader fetches `base.svg` unchanged (single frame).
// =====================================================================
(function () {
'use strict';

var _assets = {};        // id -> asset object
var _loadPromise = null;

function _loadImage(url) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload  = function () { resolve(img); };
        img.onerror = function () { reject(new Error('failed ' + url)); };
        img.src = url;
    });
}

function _variantUrl(filePath, count, index) {
    if (!count || count <= 0) return filePath;
    var dot = filePath.lastIndexOf('.');
    if (dot < 0) {
        return filePath + '.' + String(index).padStart(3, '0');
    }
    var prefix = filePath.slice(0, dot);
    var ext    = filePath.slice(dot);
    return prefix + '.' + String(index).padStart(3, '0') + ext;
}

function _loadAsset(spec, baseFolder) {
    var filePath = (baseFolder || '') + spec.file;
    var variantCount = (spec.count && spec.count > 0) ? spec.count : 1;

    var urls = [];
    for (var i = 0; i < variantCount; i++) {
        urls.push(_variantUrl(filePath, spec.count | 0, i));
    }

    var promises = urls.map(function (url) {
        return _loadImage(url).catch(function (err) {
            console.warn('[gfx] ' + err.message);
            return null;
        });
    });

    return Promise.all(promises).then(function (images) {
        images = images.filter(function (im) { return im !== null; });
        var asset = {
            id:          spec.id,
            name:        spec.name || spec.id,
            description: spec.description || '',
            count:       images.length,
            images:      images,
        };
        _assets[spec.id] = asset;
        if (images.length === 0) {
            console.warn('[gfx] asset "' + spec.id + '" has no usable frames');
        } else {
            console.log('[gfx] loaded "' + spec.id + '" (' + images.length + ' frame' +
                        (images.length === 1 ? '' : 's') + ')');
        }
        return asset;
    });
}

function loadAll(specs, baseFolder, onProgress) {
    var totalFiles = 0;
    for (var i = 0; i < specs.length; i++) {
        totalFiles += Math.max(1, specs[i].count | 0);
    }
    var loadedFiles = 0;

    var chain = Promise.resolve();
    specs.forEach(function (spec) {
        chain = chain.then(function () {
            return _loadAsset(spec, baseFolder).then(function (asset) {
                loadedFiles += Math.max(1, asset.count);
                if (onProgress) onProgress(loadedFiles, totalFiles, spec.id, asset);
                return asset;
            });
        });
    });
    _loadPromise = chain.then(function () {
        return _assets;
    });
    return _loadPromise;
}

function get(id) {
    if (!id) return null;
    return _assets[id] || null;
}

// percentage: 0..1 (fractional) or 0..100 (whole percentages both work).
// Returns the image at that position in the asset's frame sequence.
function getFrame(asset, percentage) {
    if (!asset || !asset.images || asset.images.length === 0) return null;
    if (asset.images.length === 1) return asset.images[0];

    var p = percentage;
    if (p > 1) p = p / 100;
    if (!isFinite(p)) p = 0;
    // wrap into [0,1)
    p = p - Math.floor(p);

    var idx = Math.floor(p * asset.images.length);
    if (idx < 0) idx = 0;
    if (idx >= asset.images.length) idx = asset.images.length - 1;
    return asset.images[idx];
}

window.GFXAssets = {
    loadAll:    loadAll,
    get:        get,
    getFrame:   getFrame,
    list:       function () { return _assets; },
    isLoaded:   function () { return _loadPromise !== null; },
};

})();