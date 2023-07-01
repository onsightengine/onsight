import * as THREE from 'three';
import { APP_EVENTS } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';

// Script Functions
let scriptFunctions = '';
let scriptReturnObject = {};
for (let eventKey in APP_EVENTS) {
    scriptFunctions += eventKey + ',';
    scriptReturnObject[eventKey] = eventKey;
}
scriptFunctions = scriptFunctions.replace(/.$/, '');                                /* remove last comma */
const scriptGlobals = 'entity,app,renderer,scene,camera';
const scriptParameters = scriptGlobals + ',' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   /* remove all qoutes */

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
        let component = ONE.EntityUtils.findCameraComponent(scene);
        if (component) {
            const componentCamera = component.three();
            if (componentCamera) {
                const camera = componentCamera.clone();
                ObjectUtils.copyWorldTransform(componentCamera, camera, true);
                return camera;
            }
        }

        // No Camera Found
        const camera = CameraUtils.createPerspective(1024, 1024, true);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 6;
        return camera;
    }

    /********** ENTITY */

    // Copy Cloned Children
    static copyChildren(toEntity, fromEntity) {
        const children = fromEntity.getEntities();
        for (let i = 0; i < children.length; i++) {
            const entity = children[i];
            const clone = entity.cloneEntity(false /* recursive */);
            SceneManager.loadScriptsFromComponents(clone, entity);
            SceneManager.copyChildren(clone, entity);
            toEntity.add(clone);
        }
    }

    // Add Scripts
    static loadScriptsFromComponents(toEntity, fromEntity) {
        if (!fromEntity.components) return;
        for (let i = 0; i < fromEntity.components.length; i++) {
            const component = fromEntity.components[i];
            if (component.type !== 'script' || !component.data) continue;

            // Find Script
            const scriptUUID = component.data.script;
            const script = AssetManager.getAsset(scriptUUID);
            if (!script || !script.isScript) continue;
            if (script.errors) { console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`); continue; }

            // Script Body
            let body = `${script.source}\n`;
            for (let variable in component.data.variables) {
                body = body + `if (typeof ${variable} !== 'undefined') ${variable} = ${component.data.variables[variable]};\n`
            }
            body = body + `return ${scriptReturnString};`;

            // Returns object holding script functions (with proper 'this' bound and access to globals / script variables)
            const buildFunctionObject = new Function(scriptParameters /* parameters */, body /* source */).bind(toEntity);
            const functions = buildFunctionObject(toEntity, SceneManager.app, SceneManager.app.renderer, SceneManager.scene, SceneManager.camera);

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
        SceneManager.copyChildren(toScene, fromScene);
    }

}

export { SceneManager };
