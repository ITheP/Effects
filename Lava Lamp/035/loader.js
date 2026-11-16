// loader.js
// Boot sequence: JS deps → GFX assets → shaders (inside main) → start.
(function () {
    'use strict';

    var currentScriptUrl = document.currentScript ? document.currentScript.src : window.location.href;

    // -----------------------------------------------------------------
    // Config — extend by adding entries.
    // -----------------------------------------------------------------
    // Order matters, e.g. `main.controls.js` and `main.presets.js` must load
    // BEFORE `main.js` (which references CONTROLS/PRESETS at parse time).
    // `shaders.js` must load before main.js too.
    var JS_DEPENDENCIES = [
        'assets.js',
        'character.presets.js',
        'character.controls.js',
        'character.js',
        'projectile.presets.js',
        'projectile.controls.js',
        'projectile.js',
        'core.controls.js',
        'core.presets.js',
        'shaders.js',
        'core.js',
    ];

    var ASSET_BASE_FOLDER = 'gfx/';
    var ASSET_LIST = [
        { id: 'logo',        name: 'Logo', description: 'Game logo',
          file: 'png/logo.png',            count: 0 },
        { id: 'ship-001',        name: 'Spaceship 001', description: 'Player spaceship',
          file: 'SVG/ship-001.svg',        count: 0 },
        { id: 'bulb-001-broken', name: 'Bulb (Broken)', description: 'Broken bulb',
          file: 'SVG/bulb-001-broken.svg',  count: 0 },
        { id: 'bulb-001-pickup', name: 'Bulb (Pickup)', description: 'Bulb pickup',
          file: 'SVG/bulb-001-pickup.svg',  count: 0 },
        { id: 'bulb-001-on',     name: 'Bulb (On)',     description: 'Lit bulb',
          file: 'SVG/bulb-001-on.svg',      count: 0 },
    ];

    // -----------------------------------------------------------------
    // Loader UI
    // -----------------------------------------------------------------
    var _LOADER_UI = null;

    function _ensureLoaderUI() {
        if (_LOADER_UI) return _LOADER_UI;
        var root = document.createElement('div');
        root.id = 'lava-loader';
        root.style.cssText =
            'position:fixed;inset:0;background:#000;z-index:99999;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'font-family:monospace;color:#fff;';

        var bar = document.createElement('div');
        bar.style.cssText =
            'width:60%;max-width:500px;height:16px;background:#222;border:1px solid #444;' +
            'position:relative;overflow:hidden;border-radius:3px;';

        var fill = document.createElement('div');
        fill.style.cssText =
            'height:100%;width:0%;background:linear-gradient(90deg,#f60,#fd0);' +
            'transition:width 0.12s ease-out;';
        bar.appendChild(fill);

        var text = document.createElement('div');
        text.style.cssText = 'margin-top:12px;font-size:13px;color:#ddd;text-shadow:0 1px 2px #000;';

        root.appendChild(bar);
        root.appendChild(text);
        document.body.appendChild(root);

        _LOADER_UI = { root: root, fill: fill, text: text };
        return _LOADER_UI;
    }

    function _setLoader(label, pct) {
        var ui = _ensureLoaderUI();
        ui.text.textContent = label;
        var p = Math.max(0, Math.min(1, pct || 0));
        ui.fill.style.width = (p * 100).toFixed(1) + '%';
    }

    function _hideLoader() {
        if (!_LOADER_UI) return;
        _LOADER_UI.root.style.transition = 'opacity 0.4s';
        _LOADER_UI.root.style.opacity = '0';
        setTimeout(function () {
            if (_LOADER_UI) _LOADER_UI.root.style.display = 'none';
        }, 450);
    }

    function _loadScriptAsync(url) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = url;
            s.onload  = function () { resolve(); };
            s.onerror = function () { reject(new Error('failed to load ' + url)); };
            document.head.appendChild(s);
        });
    }

    // -----------------------------------------------------------------
    // Boot
    // -----------------------------------------------------------------
    async function _boot() {
        var totalAssetFiles = 0;
        for (var i = 0; i < ASSET_LIST.length; i++) {
            totalAssetFiles += Math.max(1, ASSET_LIST[i].count | 0);
        }
        var totalSteps = JS_DEPENDENCIES.length + totalAssetFiles + 7;
        var step = 0;

        _setLoader('Loading code 0/' + JS_DEPENDENCIES.length, 0);

        for (var d = 0; d < JS_DEPENDENCIES.length; d++) {
            var depName = JS_DEPENDENCIES[d];
            _setLoader('Loading code ' + (d + 1) + '/' + JS_DEPENDENCIES.length + ' — ' + depName,
                       step / totalSteps);
            try {
                await _loadScriptAsync(new URL(depName, currentScriptUrl).href);
                console.log('[loader] loaded script: ' + depName);
            } catch (err) {
                console.warn('[loader] ' + err.message + ' — continuing without it');
            }
            step++;
        }

        // Assets
        if (window.GFXAssets) {
            _setLoader('Loading assets 0/' + totalAssetFiles, step / totalSteps);
            try {
                await window.GFXAssets.loadAll(ASSET_LIST, ASSET_BASE_FOLDER,
                    function (loaded, total, id) {
                        _setLoader('Loading asset ' + loaded + '/' + total + ' — ' + id,
                                   (step + loaded) / totalSteps);
                        console.log('[loader] asset ' + loaded + '/' + total + ': ' + id);
                    });
                console.log('[loader] all assets loaded');
            } catch (err) {
                console.warn('[loader] asset load error: ' + err.message);
            }
            step += totalAssetFiles;
        } else {
            console.warn('[loader] GFXAssets unavailable — skipping asset load');
            step += totalAssetFiles;
        }

        // Shaders (compiled synchronously inside main())
        var shaderBase = step;
        window.__lavaShaderProgress = function (name, ok, done, total) {
            _setLoader('Compiling shader ' + done + '/' + total + ' — ' + name,
                       (shaderBase + done) / totalSteps);
            console.log('[loader] shader ' + done + '/' + total + ': ' + name +
                        (ok ? '' : ' (FAILED)'));
        };

        _setLoader('Starting…', shaderBase / totalSteps);
        try {
            if (typeof main !== 'function') throw new Error('main.js did not export main()');
            main();
            console.log('[loader] main() initialised');
        } catch (e) {
            console.error('[loader] main() failed:', e);
        }

        setTimeout(_hideLoader, 300);
    }

    // Scripts loaded async — wait for DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        _boot();
    } else {
        window.addEventListener('DOMContentLoaded', _boot);
    }
})();