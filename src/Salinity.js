/**
 * @description Salinity
 * @about       Interactive, easy to use JavaScript app & game framework.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine
 */

/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** APP ********************/

export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { Entity } from './app/Entity.js';
export { Project } from './app/Project.js';
export { SceneManager } from './app/SceneManager.js'
export { Stage } from './app/Stage.js';
export { World } from './app/World.js';

// Assets
export { Asset } from './app/assets/Asset.js';
export { Palette } from './app/assets/Palette.js';
export { Script } from './app/assets/Script.js';

/******************** CORE ********************/

export { Clock } from './core/Clock.js';
export { Thing } from './core/Thing.js';

export { Camera2D } from './core/Camera2D.js';
export { Object2D } from './core/Object2D.js';
export { Renderer } from './core/Renderer.js';
export { Viewport } from './core/Viewport.js';

// Objects
export { Box } from './core/objects/Box.js';
export { Circle } from './core/objects/Circle.js';
export { Line } from './core/objects/Line.js';
export { Text } from './core/objects/Text.js';
// export { DOM } from './objects/DOM.js';
// export { Image } from './objects/Image.js';
// export { MultiLineText } from './objects/MultiLineText.js';
// export { Pattern } from './objects/Pattern.js';
// export { RoundedBox } from './objects/RoundedBox.js';
// export { BezierCurve } from './objects/BezierCurve.js';
// export { QuadraticCurve } from './objects/QuadraticCurve.js';
// export { Path } from './objects/Path.js';

// Objects, Mask
export { Mask } from './core/objects/mask/Mask.js';
export { BoxMask } from './core/objects/mask/BoxMask.js';

// Objects, Style
export { Style } from './core/objects/style/Style.js';
export { ColorStyle } from './core/objects/style/ColorStyle.js';
export { GradientStyle } from './core/objects/style/GradientStyle.js';
export { GradientColorStop } from './core/objects/style/GradientColorStop.js';
export { LinearGradientStyle } from './core/objects/style/LinearGradientStyle.js';
export { RadialGradientStyle } from './core/objects/style/RadialGradientStyle.js';
// export { PatternStyle } from './objects/style/PatternStyle.js';

/******************** INPUT ********************/

export { Key } from './input/Key.js';
export { Keyboard } from './input/Keyboard.js';
export { Pointer } from './input/Pointer.js';

/******************** MATH ********************/

export { Box2 } from './math/Box2.js';
export { Matrix2 } from './math/Matrix2.js';
export { Vector2 } from './math/Vector2.js';
export { Vector3 } from './math/Vector3.js';

/******************** UTILS ********************/

export { ArrayUtils } from './utils/ArrayUtils.js';
export { MathUtils } from './utils/MathUtils.js';
export { SysUtils } from './utils/SysUtils.js';

/******************** SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
