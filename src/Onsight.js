/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/

///// General Constants

import { VERSION } from './constants.js';

export * from './constants.js';

///// Camera Constants

export { CAMERA_SCALE, CAMERA_START_DISTANCE, CAMERA_START_HEIGHT } from './three/CameraUtils.js'

/////////////////////////////////////////////////////////////////////////////////////
/////   Onsight Classes
/////////////////////////////////////////////////////////////////////////////////////

///// App

export { App } from './app/App.js';
export { EntityPool } from './app/EntityPool.js';

///// Assets

export { AssetManager } from './assets/AssetManager.js';
export { Script } from './assets/script/Script.js';

///// Components

export { ComponentManager } from './components/ComponentManager.js';

///// Math

export { Iris } from './math/Iris.js';
export { MathUtils } from './math/MathUtils.js';
export { Vectors } from './math/Vectors.js';

///// Project

export { Project } from './project/Project.js';

///// Scene3D

export { Entity3D } from './scene3d/Entity3D.js';
export { Object3D } from './scene3d/Object3D.js';
export { Scene3D } from './scene3d/Scene3D.js';
export { World3D } from './scene3d/World3D.js';

///// Scene3D, Builders

export { SVGBuilder } from './scene3d/builders/SVGBuilder.js';

///// Sys

export { Strings } from './sys/Strings.js';
export { System } from './sys/System.js';

///// Three, Geometry

export { CapsuleGeometry } from './three/geometry/CapsuleGeometry.js';
export { CylinderGeometry } from './three/geometry/CylinderGeometry.js';
export { PrismGeometry } from './three/geometry/PrismGeometry.js';
export { BasicLine, BasicWireBox, BasicWireframe } from './three/geometry/Wireframe.js';
export { FatLine, FatWireBox, FatWireframe } from './three/geometry/Wireframe.js';

///// Three, Objects

export { SkyObject } from './three/objects/SkyObject.js';

///// Three, Passes

export { GpuPickerPass } from './three/passes/GpuPickerPass.js';

///// Three, Utils

export { CameraUtils } from './three/CameraUtils.js';
export { EntityUtils } from './three/EntityUtils.js';
export { GeometryUtils } from './three/GeometryUtils.js';
export { ObjectUtils } from './three/ObjectUtils.js';
export { RenderUtils } from './three/RenderUtils.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Register Components
/////////////////////////////////////////////////////////////////////////////////////

///// Entity

import './components/entity/Camera.js';
import './components/entity/Geometry.js';
import './components/entity/Light.js';
import './components/entity/Material.js';
import './components/entity/Mesh.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Single Import
/////////////////////////////////////////////////////////////////////////////////////

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) {
        console.warn('Multiple instances of Onsight being imported');
    } else {
        window.__ONSIGHT__ = VERSION;
    }
}
