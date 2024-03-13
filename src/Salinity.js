/**
 * @description Salinity
 * @about       Easy to use JavaScript game engine.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/stevinz/salinity
 */

/******************** CONSTANTS */

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** APPLICATION */

export { Application } from './app/Application.js';
export { AssetManager } from './app/AssetManager.js';

/******************** ASSETS */

export { Palette } from './assets/Palette.js';

/******************** MATH *****/

export { Color } from './math/Color.js';
export { Euler } from './math/Euler.js';
export { Mat3 } from './math/Mat3.js';
export { Mat4 } from './math/Mat4.js';
export { Quat } from './math/Quat.js';
export { Vec2 } from './math/Vec2.js';
export { Vec3 } from './math/Vec3.js';
export { Vec4 } from './math/Vec4.js';
export * as ColorFunc from './math/functions/ColorFunc.js';
export * as EulerFunc from './math/functions/EulerFunc.js';
export * as Mat3Func from './math/functions/Mat3Func.js';
export * as Mat4Func from './math/functions/Mat4Func.js';
export * as QuatFunc from './math/functions/QuatFunc.js';
export * as Vec2Func from './math/functions/Vec2Func.js';
export * as Vec3Func from './math/functions/Vec3Func.js';
export * as Vec4Func from './math/functions/Vec4Func.js';

/******************** PROJECT */

// Core
export { Entity } from './project/Entity.js';
export { Project } from './project/Project.js';

// World
export { Stage2D } from './project/world2d/Stage2D.js';
export { World2D } from './project/world2d/World2D.js';

/******************** RENDER */

export { Capabilities } from './render/Capabilities.js';
export { Renderer } from './render/Renderer.js';

/******************** UTILS */

export { EntityUtils } from './utils/EntityUtils.js';
export { Maths } from './utils/Maths.js';
export { Strings } from './utils/Strings.js';
export { System } from './utils/System.js';

/******************** SINGLETON */

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
