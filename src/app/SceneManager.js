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
const scriptGlobals = 'app,renderer,scene,camera';
const scriptParameters = scriptGlobals + ',' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   // remove all qoutes

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
                        if (!camera) camera = component.backend;
                    }
                })
            });
        }
        // No Camera Found
        if (!camera) {
            camera = CameraUtils.createPerspective(500, 500, true);
            camera.position.x = 0;
            camera.position.y = 0;
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
        const scripts = AssetManager.getScripts(fromEntity.uuid);
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.errors) {
                console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`);
                continue;
            }
            // Returns object holding script functions (with proper 'this' bound and access to globals)
            const body = `${script.source} \n return ${scriptReturnString};`;
            const createFunctions = new Function(scriptParameters, body).bind(toEntity);
            const functionObject = createFunctions(SceneManager.app, SceneManager.app.renderer, SceneManager.scene, SceneManager.camera, /* functions provided by user... */);
            // Add functions to event dispatch handler
            for (let name in functionObject) {
                if (APP_EVENTS[name] === undefined) {
                    console.warn(`App: Event type not supported ('${name}')`);
                    continue;
                }
                const callback = functionObject[name];
                if (callback && typeof callback === 'function') {
                    callback.bind(toEntity);
                    callback.__entity = toEntity.uuid;
                    console.log(callback.__entity);
                    SceneManager.app.events[name].push(callback);
                }
            }
        }
    }

    static removeEntity() {

    }

}

export { SceneManager };
