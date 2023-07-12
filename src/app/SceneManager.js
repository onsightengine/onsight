import * as THREE from 'three';
import { APP_EVENTS } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
import { EntityUtils } from '../utils/three/EntityUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';

// Script Functions
let scriptFunctions = '';
let scriptReturnObject = {};
for (let eventKey in APP_EVENTS) {
    scriptFunctions += eventKey + ',';
    scriptReturnObject[eventKey] = eventKey;
}
scriptFunctions = scriptFunctions.replace(/.$/, '');                                /* remove last comma */
const scriptParameters = 'app,' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   /* remove all qoutes */

// Temp
const _position = new THREE.Vector3();

// Class
class SceneManager {

    static app = undefined;

    /********** CAMERA */

    static cameraFromScene(scene) {
        // Look for Camera Component
        if (scene && scene.isScene3D) {
            let component = EntityUtils.findCameraComponent(scene);
            if (component) {
                const componentCamera = component.three();
                if (componentCamera) {
                    const camera = componentCamera.clone();
                    ObjectUtils.copyWorldTransform(componentCamera, camera, true /* updateMatrix */);
                    return camera;
                }
            }
        }

        // No Camera Found
        const camera = CameraUtils.createPerspective(1000, 1000, true);
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
            const clone = entity.cloneEntity(false /* recursive? */);
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
                const value = component.data.variables[variable];
                if (value && typeof value === 'object') {
                    // console.log(value);
                    if (typeof value.value !== 'undefined') {
                        let json = JSON.stringify(value.value);
                        json = json.replace(/[.*+`'"?^${}()|[\]\\]/g, '\\$&'); /* fix special characters */
                        // console.log(json);
                        body = body + `let ${variable} = JSON.parse('${json}');\n`
                    } else {
                        body = body + `let ${variable} = undefined;\n`
                    }
                }
            }
            body = body + `return ${scriptReturnString};`;

            // Returns object holding script functions (with proper 'this' bound and access to globals / script variables)
            const buildFunctionObject = new Function(scriptParameters /* parameters */, body /* source */).bind(toEntity);
            const functions = buildFunctionObject(SceneManager.app);

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
