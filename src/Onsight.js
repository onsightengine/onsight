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
export { EntityPool } from './app/EntityPool.js';
export { Renderer3D } from './app/Renderer3D.js';
export { SceneManager } from './app/SceneManager.js'

/******************** CLASSES - Assets  ********************/

// Assets
export { Script } from './assets/Script.js';

// Assets, Scripts, Camera
export { OrbitEntity } from './assets/scripts/OrbitEntity.js';

// Assets, Scripts, Controls
export { DragControls } from './assets/scripts/DragControls.js';
export { DrivingControls } from './assets/scripts/DrivingControls.js';
export { KeyControls } from './assets/scripts/KeyControls.js';

// Assets, Scripts, Entity
export { ColorChange } from './assets/scripts/ColorChange.js';
export { RotateEntity } from './assets/scripts/RotateEntity.js';

/******************** CLASSES - Project  ********************/

// Core
export { AssetManager } from './project/AssetManager.js';
export { ComponentManager } from './project/ComponentManager.js';
export { Project } from './project/Project.js';

// Core, Scene3D
export { Camera3D } from './project/scene3d/Camera3D.js';
export { Entity3D } from './project/scene3d/Entity3D.js';
export { Scene3D } from './project/scene3d/Scene3D.js';
export { World3D } from './project/scene3d/World3D.js';

// Core, Scene3D, Builders
export { SVGBuilder } from './project/scene3d/builders/SVGBuilder.js';

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
export { BasicLine, BasicWireBox, BasicWireframe } from './utils/three/geometry/Wireframe.js';
export { FatLine, FatWireBox, FatWireframe } from './utils/three/geometry/Wireframe.js';

// Three, Objects
export { SkyObject } from './utils/three/objects/SkyObject.js';

// Three, Passes
export { GpuPickerPass } from './utils/three/passes/GpuPickerPass.js';

// Utils
export { Clock } from './utils/Clock.js';
export { Maths } from './utils/Maths.js';
export { Strings } from './utils/Strings.js';
export { System } from './utils/System.js';
export { Vectors } from './utils/Vectors.js';

/******************** REGISTER COMPONENTS ********************/

import './project/scene3d/components/Camera.js';
import './project/scene3d/components/Geometry.js';
import './project/scene3d/components/Light.js';
import './project/scene3d/components/Material.js';
import './project/scene3d/components/Mesh.js';
import './project/scene3d/components/Script.js';
import './project/scene3d/components/Test.js';
// import './project/scene3d/components/Sprite.js';

/******************** ENSURE SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) console.warn(`Onsight v${window.__ONSIGHT__} already imported, now importing v${VERSION}!`);
    else window.__ONSIGHT__ = VERSION;
}
