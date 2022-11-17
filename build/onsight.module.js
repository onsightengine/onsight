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

export { NAME, REVISION };
//# sourceMappingURL=onsight.module.js.map
