/**
 * @description Salinity
 * @about       Easy to use JavaScript game engine.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/stevinz/salinity
 */

/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** CLASSES - App ********************/

export { Application } from './app/Application.js';
export { AssetManager } from './app/AssetManager.js';

/******************** CLASSES - Project  ********************/

// Core
export { Project } from './project/Project.js';

// World
export { Stage2D } from './project/world2d/Stage2D.js';
export { World2D } from './project/world2d/World2D.js';

// Assets
export { Palette } from './project/assets/Palette.js';

/******************** CLASSES - Utils  ********************/

export { EntityUtils } from './utils/EntityUtils.js';
export { Maths } from './utils/Maths.js';
export { Strings } from './utils/Strings.js';
export { System } from './utils/System.js';

/******************** SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
