// boot.js
// The only script that needs to be included in index.html.
// Loads loader.js relative to itself. loader.js then takes over:
// fetches the other modules, the GFX assets, waits for the shader
// compile progress, and finally calls main().
(function () {
    'use strict';

    var here = document.currentScript && document.currentScript.src
        ? document.currentScript.src
        : window.location.href;

    var loaderUrl = new URL('loader.js', here).href;

    var s = document.createElement('script');
    s.src = loaderUrl;
    s.onerror = function () {
        console.error('[boot] failed to load ' + loaderUrl);
    };
    document.head.appendChild(s);
})();