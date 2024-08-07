/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** CORE ********************/

export { App } from './core/App.js';
export { AssetManager } from './core/AssetManager.js';
export { Camera2D } from './core/Camera2D.js';
export { Clock } from './core/Clock.js';
export { ComponentManager } from './core/ComponentManager.js';
export { Object2D } from './core/Object2D.js';
export { EventManager } from './core/EventManager.js';
export { Project } from './core/Project.js';
export { Renderer } from './core/Renderer.js';
export { SceneManager } from './core/SceneManager.js'
export { Thing } from './core/Thing.js';

// Assets
export { Asset } from './core/assets/Asset.js';
export { Palette } from './core/assets/Palette.js';
export { Script } from './core/assets/Script.js';

// Components
export { Entity } from './core/components/Entity.js';
export { Stage } from './core/components/Stage.js';
export { World } from './core/components/World.js';

// Input
export { Key } from './core/input/Key.js';
export { Keyboard } from './core/input/Keyboard.js';
export { Pointer } from './core/input/Pointer.js';

// Objects
export { Box } from './core/objects/Box.js';
export { Circle } from './core/objects/Circle.js';
export { DomElement } from './core/objects/DomElement.js';
export { Line } from './core/objects/Line.js';
export { Pattern } from './core/objects/Pattern.js';
export { Sprite } from './core/objects/Sprite.js';
export { Text } from './core/objects/Text.js';
// export { MultiLineText } from './core/objects/MultiLineText.js';
// export { RoundedBox } from './core/objects/RoundedBox.js';

// Objects, Curves
// export { BezierCurve } from './core/objects/BezierCurve.js';
// export { QuadraticCurve } from './core/objects/QuadraticCurve.js';
// export { Path } from './core/objects/Path.js';

// Objects, Mask
export { Mask } from './core/objects/mask/Mask.js';
export { BoxMask } from './core/objects/mask/BoxMask.js';

// Objects, Style
export { Style } from './core/objects/style/Style.js';
export { ColorStyle } from './core/objects/style/ColorStyle.js';
export { LinearGradientStyle } from './core/objects/style/LinearGradientStyle.js';
export { RadialGradientStyle } from './core/objects/style/RadialGradientStyle.js';
// export { PatternStyle } from './core/objects/style/PatternStyle.js';

/******************** MATH ********************/

export { Box2 } from './math/Box2.js';
export { Matrix2 } from './math/Matrix2.js';
export { Vector2 } from './math/Vector2.js';
export { Vector3 } from './math/Vector3.js';

/******************** UTILS ********************/

export { ArrayUtils } from './utils/ArrayUtils.js';
export { MathUtils } from './utils/MathUtils.js';
export { PolyUtils } from './utils/PolyUtils.js';
export { SysUtils } from './utils/SysUtils.js';


/******************** REGISTER COMPONENTS ********************/

// Entity
import './core/components/entity/Box.js';
import './core/components/entity/Sprite.js';

/******************** SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) console.warn(`Onsight v${window.__ONSIGHT__} already imported, now importing v${VERSION}!`);
    else window.__ONSIGHT__ = VERSION;
}
