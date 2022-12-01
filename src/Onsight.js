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

export { CAMERA_SCALE, CAMERA_START_DISTANCE, CAMERA_START_HEIGHT } from './three/utils/CameraUtils.js'

/////////////////////////////////////////////////////////////////////////////////////
/////   Onsight Classes
/////////////////////////////////////////////////////////////////////////////////////

///// App

export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { ComponentManager } from './app/ComponentManager.js';
export { EntityPool } from './app/EntityPool.js';
export { Project } from './app/Project.js';

///// App, Project, Scene3D

export { Entity3D } from './app/scene3d/Entity3D.js';
export { Object3D } from './app/scene3d/Object3D.js';
export { Scene3D } from './app/scene3d/Scene3D.js';
export { World3D } from './app/scene3d/World3D.js';

///// App, Project, Scene3D, Builders

export { SVGBuilder } from './app/scene3d/builders/SVGBuilder.js';

///// Core

export { Iris } from './core/Iris.js';
export { Maths } from './core/Maths.js';
export { Strings } from './core/Strings.js';
export { System } from './core/System.js';
export { Vectors } from './core/Vectors.js';

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

export { CameraUtils } from './three/utils/CameraUtils.js';
export { EntityUtils } from './three/utils/EntityUtils.js';
export { GeometryUtils } from './three/utils/GeometryUtils.js';
export { ObjectUtils } from './three/utils/ObjectUtils.js';
export { RenderUtils } from './three/utils/RenderUtils.js';

///// Register Components (files self register w/Component Manager on import)

import './app/scene3d/components/Camera.js';
import './app/scene3d/components/Geometry.js';
import './app/scene3d/components/Light.js';
import './app/scene3d/components/Material.js';
import './app/scene3d/components/Mesh.js';

///// Single Import

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) {
        console.warn('Multiple instances of Onsight being imported');
    } else {
        window.__ONSIGHT__ = VERSION;
    }
}
