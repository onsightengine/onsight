import * as THREE from 'three';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';

// CAMERA
//  cameraFromScene()       Looks for a camera within a scene
// ENTITY
//  cloneEntities()         Copies entities from one scene to another

class SceneManager {

    static app = undefined;
    static renderer = undefined;
    static scene = undefined;
    static camera = undefined;

    /********** CAMERA */

    static cameraFromScene(scene) {
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

    static copyEntity(app, renderer, scene, camera, to, from, offset) {
        // Script Functions
        let scriptFunctions = '';
        let scriptReturnObject = {};
        for (let eventKey in app.events) {
            scriptFunctions += eventKey + ',';
            scriptReturnObject[eventKey] = eventKey;
        }
        scriptFunctions = scriptFunctions.replace(/.$/, '');                                // remove last comma
        const scriptGlobals = 'app,renderer,scene,camera';
        const scriptParameters = scriptGlobals + ',' + scriptFunctions;
        const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   // remove all qoutes

        // Copy Cloned Children
        function copyScriptsAndChildren(toEntity, fromEntity) {
            // Add Scripts
            const scripts = AssetManager.getScripts(fromEntity.uuid);
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                if (script.errors) {
                    console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`);
                } else {
                    // Returns object holding script functions (with proper 'this' bound and access to globals)
                    const body = `${script.source} \n return ${scriptReturnString};`;
                    const createFunctions = new Function(scriptParameters, body).bind(toEntity);
                    const functionObject = createFunctions(app, renderer, scene, camera, /* functions provided by user... */);
                    // Add functions to event dispatch handler
                    for (let name in functionObject) {
                        if (app.events[name] === undefined) {
                            console.warn(`App: Event type not supported ('${name}')`);
                            continue;
                        }
                        const callback = functionObject[name];
                        if (callback && typeof callback === 'function') {
                            app.events[name].push(callback.bind(toEntity));
                        }
                    }
                }
            }

            // Add Children
            const entities = fromEntity.getEntities();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                // Clone
                const clone = entity.cloneEntity(false /* recursive */);
                if (offset) clone.position.add(offset);
                copyScriptsAndChildren(clone, entity);
                // Add to Parent
                toEntity.add(clone);
            }
        }
        copyScriptsAndChildren(to, from);
    }

}

export { SceneManager };
