(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.onsight = global.onsight || {}));
})(this, (function (exports) { 'use strict';

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Onsight Constants
    /////////////////////////////////////////////////////////////////////////////////////

    ///// General

    const NAME = 'Onsight';
    const REVISION = '3.0.0';


    ///// Single Import

    if (typeof window !== 'undefined') {
        if (window.__ONSIGHT__) {
            console.warn('Multiple instances of Onsight being imported');
        } else {
            window.__ONSIGHT__ = REVISION;
        }
    }

    exports.NAME = NAME;
    exports.REVISION = REVISION;

}));
//# sourceMappingURL=onsight.umd.cjs.map
