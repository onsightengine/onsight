/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
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

///// Core

export { AssetManager } from './core/AssetManager.js';
export { ComponentManager } from './core/ComponentManager.js';
export { Project } from './core/Project.js';

///// Core, Assets

export { Script } from './core/assets/Script.js';

///// Core, Scene3D

export { Entity3D } from './core/scene3d/Entity3D.js';
export { Object3D } from './core/scene3d/Object3D.js';
export { Scene3D } from './core/scene3d/Scene3D.js';
export { World3D } from './core/scene3d/World3D.js';

///// Core, Scene3D, Builders

export { SVGBuilder } from './core/scene3d/builders/SVGBuilder.js';

///// Math

export { MathUtils } from './math/MathUtils.js';
export { Vectors } from './math/Vectors.js';

///// Sys

export { Strings } from './sys/Strings.js';
export { System } from './sys/System.js';

///// Three

export { CameraUtils } from './three/CameraUtils.js';
export { EntityUtils } from './three/EntityUtils.js';
export { GeometryUtils } from './three/GeometryUtils.js';
export { ObjectUtils } from './three/ObjectUtils.js';
export { RenderUtils } from './three/RenderUtils.js';

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

/////////////////////////////////////////////////////////////////////////////////////
/////   Register Components
/////////////////////////////////////////////////////////////////////////////////////

///// Entity

import './core/scene3d/components/Camera.js';
import './core/scene3d/components/Geometry.js';
import './core/scene3d/components/Light.js';
import './core/scene3d/components/Material.js';
import './core/scene3d/components/Mesh.js';

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
