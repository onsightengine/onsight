import * as THREE from 'three';
import { APP_EVENTS } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';

// CAMERA
//  cameraFromScene()       Looks for a camera within a scene
// ENTITY
//  cloneEntities()         Copies entities from one scene to another

// Script Functions
let scriptFunctions = '';
let scriptReturnObject = {};
for (let eventKey in APP_EVENTS) {
    scriptFunctions += eventKey + ',';
    scriptReturnObject[eventKey] = eventKey;
}
scriptFunctions = scriptFunctions.replace(/.$/, '');                                // remove last comma
const scriptParameters = 'app,renderer,scene,camera' + ',' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   // remove all qoutes

// Temp
const _position = new THREE.Vector3();

// Class
class SceneManager {

    static app = undefined;
    static scene = undefined;
    static camera = undefined;

    /********** CAMERA */

    static cameraFromScene(scene) {
        scene = scene ?? SceneManager.scene;
        // Look for Camera Component
        let camera = undefined;
        if (scene && scene.isEntity) {
            scene.traverseEntities((entity) => {
                entity.traverseComponents((component) => {
                    if (component.type === 'camera') {
                        if (!camera) {
                            camera = component.backend.clone();
                            component.backend.getWorldPosition(_position);
                            camera.position.copy(_position);
                        }
                    }
                })
            });
        }
        // No Camera Found
        if (!camera) {
            camera = CameraUtils.createPerspective(500, 500, true);
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 6;
        }
        return camera;
    }

    /********** ENTITY */

    // Copy Cloned Children
    static copyChildren(toEntity, fromEntity) {
        const children = fromEntity.getEntities();
        for (let i = 0; i < children.length; i++) {
            const entity = children[i];
            const clone = entity.cloneEntity(false /* recursive */);
            SceneManager.loadScripts(clone, entity);
            SceneManager.copyChildren(clone, entity);
            toEntity.add(clone);
        }
    }

    // Add Scripts
    static loadScripts(toEntity, fromEntity) {
        if (!Array.isArray(fromEntity.scripts)) return;
        for (let i = 0; i < fromEntity.scripts.length; i++) {
            // Find Script
            const scriptUUID = fromEntity.scripts[i];
            const script = AssetManager.getAsset(scriptUUID);
            if (!script || !script.isScript) continue;
            if (script.errors) {
                console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`);
                continue;
            }
            // Returns object holding script functions (with proper 'this' bound and access to globals)
            const body = `${script.source} \n return ${scriptReturnString};`;
            const buildFunctionObject = new Function(scriptParameters /* parameters */, body /* source */).bind(toEntity);
            const functions = buildFunctionObject(SceneManager.app, SceneManager.app.renderer, SceneManager.scene, SceneManager.camera, /* functions provided by user... */);
            // Add functions to event dispatch handler
            for (let name in functions) {
                if (APP_EVENTS[name] === undefined) {
                    console.warn(`App: Event type not supported ('${name}')`);
                    continue;
                }
                if (typeof functions[name] !== 'function') continue;
                const callback = functions[name].bind(toEntity);
                SceneManager.app.events[name].push(callback);
            }
        }
    }

    static removeEntity() {

    }

    /********** SCENE */

    static loadScene(toScene, fromScene) {
        SceneManager.loadScripts(SceneManager.scene, fromScene);
        SceneManager.copyChildren(SceneManager.scene, fromScene);
    }

}

export { SceneManager };
