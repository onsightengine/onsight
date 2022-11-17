/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

import { Pass } from 'three/addons/postprocessing/Pass.js';

import { ObjectUtils } from '../utils/ObjectUtils.js';

///// Local Variables

const _oldClearColor = new THREE.Color();

/////////////////////////////////////////////////////////////////////////////////////
/////   Wireframe Pass
/////////////////////////////////////////////////////////////////////////////////////

/** For drawing selected scene items as wireframe */
class WireframePass extends Pass {

    constructor(scene, camera, wireColor = 0xffffff, opacity = 0.25) {
        super();

        // Public Properties
        this.scene = scene;
        this.camera = camera;
        this.selectedObjects = [];

        // Local Properties
        this.clearColor = undefined;
        this.clearAlpha = 0.0;
        this.clear = false;
        this.clearDepth = false;
        this.needsSwap = false;
        this.enabled = true;

        // Local variables
        this._visibilityCache = new Map();
        this._materialMap = new Map();

        this.overrideMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000, //wireColor,
            wireframe: true,
            opacity: opacity,
            transparent: true,
            vertexColors: false,

            depthTest: true,
            depthWrite: false,

            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away

            alphaToCoverage: false,
        });

        this.invisibleMaterial = new THREE.MeshBasicMaterial({ visible: false });

    } // end ctor

    dispose() {
        this.overrideMaterial.dispose();
        this.invisibleMaterial.dispose();
    }

    render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
        if (this.selectedObjects.length < 1) return;

        // Store current renderer state info
        renderer.getClearColor(_oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        const oldOverrideMaterial = this.scene.overrideMaterial;
        const oldSceneBackground = this.scene.background;

        // Set renderer state info
        renderer.setClearColor(0x000000, 0);
        renderer.autoClear = false;
        this.scene.overrideMaterial = this.overrideMaterial;
        this.scene.background = null;

        // Make non selected objects invisible
        this.changeVisibilityOfNonSelectedObjects(false);

        // Render
        if (this.clearDepth) renderer.clearDepth();
        renderer.setRenderTarget((this.renderToScreen || (! readBuffer)) ? null : readBuffer);
        renderer.render(this.scene, this.camera);

        // Restore object visibility
        this.changeVisibilityOfNonSelectedObjects(true);
        this._visibilityCache.clear();

        // Restore state info
        renderer.setClearColor(_oldClearColor, oldClearAlpha);
        renderer.autoClear = oldAutoClear;
        this.scene.overrideMaterial = oldOverrideMaterial;
        this.scene.background = oldSceneBackground;
    }

    //

    setObjects(objects) {
        if (Array.isArray(objects)) {
            this.selectedObjects = objects;
        } else {
            this.selectedObjects = [ objects ];
        }
    }

    setWireColor(wireColor) {
        this.overrideMaterial.color.setHex(wireColor);
    }

    //

    changeVisibilityOfNonSelectedObjects(isVisible) {
        const self = this;
        const cache = this._visibilityCache;
        const materials = this._materialMap;
        const selectedMeshes = [];

        function gatherSelectedMeshesCallBack(object) {
            if (object.isMesh) selectedMeshes.push(object);
        }

        for (let i = 0; i < this.selectedObjects.length; i++) {
            const selectedObject = this.selectedObjects[i];
            selectedObject.traverse(gatherSelectedMeshesCallBack);
        }

        function VisibilityChangeCallBack(object) {

            // Only meshes are supported by WireframePass
            if (object.isMesh) {
                if (ObjectUtils.containsObject(selectedMeshes, object) === false) {
                    if (isVisible === true) {
                        object.material = materials.get(object.id);
                    } else {
                        materials.set(object.id, object.material);
                        object.material = self.invisibleMaterial;
                    }
                }
            }

        }

        this.scene.traverse(VisibilityChangeCallBack);
    }

}

export { WireframePass };
