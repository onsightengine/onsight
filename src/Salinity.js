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

/******************** APPLICATION ********************/

// App
export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { SceneManager } from './app/SceneManager.js'

// App, Loading
export { Cache } from './app/loading/Cache.js';
export { FileLoader } from './app/loading/FileLoader.js';
export { ImageLoader } from './app/loading/ImageLoader.js';
export { Loader } from './app/loading/Loader.js';
export { LoadingManager } from './app/loading/LoadingManager.js';

/******************** ASSETS  ********************/

// Assets
export { Asset } from './assets/Asset.js';
export { Palette } from './assets/Palette.js';
export { Script } from './assets/Script.js';

// Assets, Scripts, Camera
export { MoveCamera } from './assets/scripts/MoveCamera.js';
export { OrbitEntity } from './assets/scripts/OrbitEntity.js';

// Assets, Scripts, Controls
export { DragControls } from './assets/scripts/DragControls.js';
export { DrivingControls } from './assets/scripts/DrivingControls.js';
export { KeyControls } from './assets/scripts/KeyControls.js';
export { ZigZagControls } from './assets/scripts/ZigZagControls.js';

// Assets, Scripts, Entity
export { ColorChange } from './assets/scripts/ColorChange.js';
export { FollowCamera } from './assets/scripts/FollowCamera.js';
export { RotateEntity } from './assets/scripts/RotateEntity.js';

/******************** COMPONENTS ********************/

export { ComponentManager } from './app/ComponentManager.js';

/******************** CORE ********************/

export { Clock } from './core/Clock.js';
export { Project } from './core/Project.js';
export { Thing } from './core/Thing.js';

/******************** UTILS  ********************/

export { ArrayUtils } from './utils/ArrayUtils.js';
export { MathUtils } from './utils/MathUtils.js';
export { SysUtils } from './utils/SysUtils.js';

/******************** OBJECTS ********************/

export { Camera3D } from './objects/Camera3D.js';
export { Entity3D } from './objects/Entity3D.js';
export { Entity } from './core/Entity.js';
export { Stage } from './objects/Stage.js';
export { World } from './objects/World.js';

/******************** ENSURE SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
