/**
 * @description Onsight Engine
 * @about       Easy to use 2D / 3D JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
 * @source      https://github.com/onsightengine
 */

/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';

export * from './constants.js';
export { ORBIT_STATES } from './utils/three/controls/OrbitControls.js';

/******************** CLASSES - App ********************/

// App
export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { ComponentManager } from './app/ComponentManager.js';
export { EntityPool } from './app/EntityPool.js';
export { Renderer3D } from './app/Renderer3D.js';
export { SceneManager } from './app/SceneManager.js'

/******************** CLASSES - Assets  ********************/

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

/******************** CLASSES - Project  ********************/

// Core
export { Project } from './project/Project.js';

// Core, Scene3D
export { Camera3D } from './project/world3d/Camera3D.js';
export { Entity3D } from './project/world3d/Entity3D.js';
export { Light3D } from './project/world3d/Light3D.js';
export { Stage3D } from './project/world3d/Stage3D.js';
export { World3D } from './project/world3d/World3D.js';

// Core, Scene3D, Builders
export { SVGBuilder } from './project/world3d/builders/SVGBuilder.js';

/******************** CLASSES - Utils  ********************/

// Three
export { CameraUtils } from './utils/three/CameraUtils.js';
export { EntityUtils } from './utils/three/EntityUtils.js';
export { GeometryUtils } from './utils/three/GeometryUtils.js';
export { ObjectUtils } from './utils/three/ObjectUtils.js';
export { RenderUtils } from './utils/three/RenderUtils.js';

// Three, Controls
export { OrbitControls } from './utils/three/controls/OrbitControls.js';

// Three, Geometry
export { CapsuleGeometry } from './utils/three/geometry/CapsuleGeometry.js';
export { CylinderGeometry } from './utils/three/geometry/CylinderGeometry.js';
export { PrismGeometry } from './utils/three/geometry/PrismGeometry.js';

// Three, Objects
export { BasicLine } from './utils/three/objects/BasicLine.js';
export { BasicWireBox } from './utils/three/objects/BasicWireBox.js';
export { BasicWireframe, FatWireframe } from './utils/three/objects/Wireframe.js';
export { FatLine } from './utils/three/objects/FatLine.js';
export { FatWireBox } from './utils/three/objects/FatWireBox.js';
export { SkyObject } from './utils/three/objects/SkyObject.js';

// Three, Passes
export { GpuPickerPass } from './utils/three/passes/GpuPickerPass.js';

// Three, Shaders
//
// ...
//

// Utils
export { Clock } from './utils/Clock.js';
export { Iris } from './utils/Iris.js';
export { Maths } from './utils/Maths.js';
export { Strings } from './utils/Strings.js';
export { System } from './utils/System.js';
export { Vectors } from './utils/Vectors.js';

/******************** REGISTER COMPONENTS ********************/

// Entity
import './project/world3d/entity/Geometry.js';
import './project/world3d/entity/Material.js';
import './project/world3d/entity/Mesh.js';
import './project/world3d/entity/Script.js';
import './project/world3d/entity/Test.js';
// import './project/world3d/entity/Sprite.js';

// World
import './project/world3d/world/Physics.js';
import './project/world3d/world/Post.js';

/******************** ENSURE SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) console.warn(`Onsight v${window.__ONSIGHT__} already imported, now importing v${VERSION}!`);
    else window.__ONSIGHT__ = VERSION;
}
