/**
 * @description Salinity
 * @about       Easy to use JavaScript game engine.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/stevinz/salinity
 */

/******************** CORE ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

export { Project } from './Project.js';

/******************** APPLICATION ********************/

// App
export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { ComponentManager } from './app/ComponentManager.js';
export { SceneManager } from './app/SceneManager.js'

// App, Loading
export { Cache } from './app/loading/Cache.js';
export { FileLoader } from './app/loading/FileLoader.js';
export { ImageLoader } from './app/loading/ImageLoader.js';
export { Loader } from './app/loading/Loader.js';
export { LoadingManager } from './app/loading/LoadingManager.js';

/******************** ASSETS  ********************/

// Assets
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

/******************** UTILS  ********************/

export { Arrays } from './utils/Arrays.js';
export { Clock } from './utils/Clock.js';
export { Maths } from './utils/Maths.js';
export { System } from './utils/System.js';
export { Uuid } from './utils/Uuid.js';
export { Vectors } from './utils/Vectors.js';

/******************** WORLDS ********************/

// Base
export { Entity } from './worlds/Entity.js';
export { Stage } from './worlds/Stage.js';
export { World } from './worlds/World.js';

// World2D
export { Entity2D } from './worlds/world2d/Entity2D.js';
export { Stage2D } from './worlds/world2d/Stage2D.js';
export { World2D } from './worlds/world2d/World2D.js';

// World3D
export { Camera3D } from './worlds/world3d/Camera3D.js';
export { Entity3D } from './worlds/world3d/Entity3D.js';
export { Stage3D } from './worlds/world3d/Stage3D.js';
export { World3D } from './worlds/world3d/World3D.js';

// WorldUI
export { EntityUI } from './worlds/worldui/EntityUI.js';
export { StageUI } from './worlds/worldui/StageUI.js';
export { WorldUI } from './worlds/worldui/WorldUI.js';

/******************** REGISTER COMPONENTS ********************/

// Entity
import './worlds/world3d/entity/Geometry.js';
import './worlds/world3d/entity/Material.js';
import './worlds/world3d/entity/Mesh.js';
import './worlds/world3d/entity/Script.js';
import './worlds/world3d/entity/Test.js';
// import './project/world3d/entity/Sprite.js';

// World
import './worlds/world3d/world/Physics.js';
import './worlds/world3d/world/Post.js';

/******************** ENSURE SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
