/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

///// General Constants

import { REVISION } from './constants.js';

export { NAME, REVISION, BACKEND3D } from './constants.js';
export { ENTITY_TYPES, SCENE_TYPES, WORLD_TYPES, ENTITY_FLAGS } from './constants.js';
export { APP_STATES } from './constants.js';

///// Camera Constants

export { CAMERA_SCALE, CAMERA_START_DISTANCE, CAMERA_START_HEIGHT } from './three/utils/CameraUtils.js'

/////////////////////////////////////////////////////////////////////////////////////
/////   Onsight Classes
/////////////////////////////////////////////////////////////////////////////////////

///// App

export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { EntityPool } from './app/EntityPool.js';

///// Core

export { Iris } from './core/Iris.js';
export { Maths } from './core/Maths.js';
export { Strings } from './core/Strings.js';
export { System } from './core/System.js';
export { Vectors } from './core/Vectors.js';

///// Project

export { ComponentManager } from './project/ComponentManager.js';
export { Project } from './project/Project.js';

///// Project - Scene3D

export { Entity3D } from './project/scene3d/Entity3D.js';
export { Object3D } from './project/scene3d/Object3D.js';
export { Scene3D } from './project/scene3d/Scene3D.js';
export { World3D } from './project/scene3d/World3D.js';

export { SVGBuilder } from './project/scene3d/builders/SVGBuilder.js';

///// Three - Geometry

export { CapsuleGeometry } from './three/geometry/CapsuleGeometry.js';
export { CylinderGeometry } from './three/geometry/CylinderGeometry.js';
export { PrismGeometry } from './three/geometry/PrismGeometry.js';
export { BasicLine, BasicWireBox, BasicWireframe } from './three/geometry/Wireframe.js';
export { FatLine, FatWireBox, FatWireframe } from './three/geometry/Wireframe.js';

///// Three - Objects

export { HelperObject } from './three/objects/HelperObject.js';
export { SkyObject } from './three/objects/SkyObject.js';

///// Three - Passes

export { DepthPass } from './three/passes/DepthPass.js';
export { GpuPickerPass } from './three/passes/GpuPickerPass.js';
export { OutlinePass } from './three/passes/OutlinePass.js';
export { WireframePass } from './three/passes/WireframePass.js';

///// Three - Shaders

export { DepthShader } from './three/shaders/DepthShader.js';
export { TexturedShader } from './three/shaders/TexturedShader.js';
export { XRayShader } from './three/shaders/XRayShader.js';

///// Three - Utils

export { CameraUtils } from './three/utils/CameraUtils.js';
export { EntityUtils } from './three/utils/EntityUtils.js';
export { GeometryUtils } from './three/utils/GeometryUtils.js';
export { ObjectUtils } from './three/utils/ObjectUtils.js';
export { RenderUtils } from './three/utils/RenderUtils.js';

///// Register Components (files self register w/Component Manager on import)

import './project/scene3d/components/Camera.js';
import './project/scene3d/components/Geometry.js';
import './project/scene3d/components/Light.js';
import './project/scene3d/components/Material.js';
import './project/scene3d/components/Mesh.js';

///// Single Import

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) {
        console.warn('Multiple instances of Onsight being imported');
    } else {
        window.__ONSIGHT__ = REVISION;
    }
}
