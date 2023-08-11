import * as THREE from 'three';
import { APP_EVENTS, APP_SIZE, LAYERS } from '../constants.js';
import { AssetManager } from './AssetManager.js';
import { Camera3D } from '../project/world3d/Camera3D.js';
import { EntityUtils } from '../utils/three/EntityUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';

import { OpaqueShader } from '../utils/three/shaders/OpaqueShader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

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

// Local
const _composers = {};
const _position = new THREE.Vector3();

// Class
class SceneManager {

    static app = undefined;

    /********** CAMERA */

    static cameraFromScene(scene) {
        // Look for Camera Component
        if (scene && scene.isScene3D) {
            const component = EntityUtils.findCameraComponent(scene);
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
        const camera = new Camera3D({ width: 1000, height: 1000 });
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    /********** ENTITY */

    /** Clone and copy children */
    static cloneChildren(toEntity, fromEntity, translate = new THREE.Vector3(), scale = new THREE.Vector3(1, 1, 1), rotate = new THREE.Quaternion()) {
        const children = fromEntity.getEntities();
        for (let i = 0; i < children.length; i++) {
            const entity = children[i];

            // Clone
            const clone = entity.cloneEntity(false /* recursive? */);

            // Map position to scene load location
            if (toEntity.isScene) {
                clone.scale.multiply(scale);
                clone.applyQuaternion(rotate);
                clone.position.add(translate);
            }

            // Scripts & children
            SceneManager.loadScriptsFromComponents(clone, entity);
            SceneManager.cloneChildren(clone, entity);

            // Bloom rendering layers
            if (clone.bloom) {
                clone.traverse(function(child) {
                    child.layers.disable(LAYERS.BASE);
                    child.layers.enable(LAYERS.BLOOM);
                });
            }

            // Add clone
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

    static backgroundFromWorld(toScene, fromWorld) {
        if (!toScene || !toScene.isScene) return;
        if (!fromWorld || !fromWorld.isWorld3D) return;

        if (fromWorld.background != null) {
            if (fromWorld.background.isColor) {
                toScene.background = fromWorld.background.clone();
            } else {
                const texture = AssetManager.getAsset(fromWorld.background);
                if (texture && texture.isTexture) toScene.background = texture.clone();
            }
        }
		if (fromWorld.environment != null) toScene.environment = fromWorld.environment.clone();
		if (fromWorld.fog != null) toScene.fog = fromWorld.fog.clone();
		toScene.backgroundBlurriness = fromWorld.backgroundBlurriness;
		toScene.backgroundIntensity = fromWorld.backgroundIntensity;
		if (fromWorld.overrideMaterial != null) toScene.overrideMaterial = fromWorld.overrideMaterial.clone();
    }

    static loadScene(toScene, fromScene) {
        // TODO: Incorporate scene loading ('Scene Boundary' object) to last known load location
        const loadTranslate = new THREE.Vector3(0, 0, 0);
        const loadScale = new THREE.Vector3(1, 1, 1)
        const loadRotate = new THREE.Quaternion();

        SceneManager.cloneChildren(toScene, fromScene, loadTranslate, loadScale, loadRotate);
    }

    /********** RENDER */

    static renderWorld(world) {
        // Build Composer
        if (!_composers[world.uuid]) {
            const composer = new EffectComposer(SceneManager.app.renderer);
            composer.renderToScreen = true; /* true by default, only applies to last pass */

            // Clear Buffer
            const clearPass = new ClearPass(new THREE.Color(0x000000), 0.0);
            composer.addPass(clearPass);

            // Render Scene
            const renderPass = new RenderPass(SceneManager.app.scene, SceneManager.app.camera);
            renderPass.clear = false;
            composer.addPass(renderPass);

            // Custom Passes
            const components = world.getComponentsWithProperties('type', 'post');
            components.forEach((component) => {
                const pass = component.three();
                if (pass) {
                    pass.scene = SceneManager.app.scene;
                    pass.camera = SceneManager.app.camera;
                    composer.addPass(pass);
                }
            });

            // Copy to Screen
            const copyPass = new ShaderPass(OpaqueShader);
            composer.addPass(copyPass);

            // Save Composer
            _composers[world.uuid] = composer;
        }

        // Composer Render
        const composer = _composers[world.uuid];
        if (composer) composer.render();
    }

    static setCamera(world, camera) {
        SceneManager.app.camera = camera;

        const components = world.getComponentsWithProperties('type', 'post');
        components.forEach((component) => {
            const pass = component.three();
            if (pass) pass.camera = camera;
        });
    }

    static setSize(width, height) {
        const fit = SceneManager.app?.project?.settings?.orientation;
        const ratio = APP_SIZE / ((fit === 'portrait') ? height : width);
        const fixedWidth = width * ratio;
        const fixedHeight = height * ratio;

        // Resize Composers
        for (const uuid in _composers) {
            const composer = _composers[uuid];
            composer.setSize(width, height);

            // Passes with Fixed Size
            composer.passes.forEach((pass) => {
                if (typeof pass.setFixedSize === 'function') pass.setFixedSize(fixedWidth, fixedHeight);
            });
        }
    }

    /********** DISPOSE */

    static dispose() {
        // Clean-up Effect Composers
        for (const uuid in _composers) {
            const composer = _composers[uuid];
            if (composer) {
                composer.passes.forEach((pass) => {
                    if (typeof pass.dispose === 'function') pass.dispose();
                });
                composer.dispose();
            }
            delete _composers[uuid];
        }
    }

}

export { SceneManager };
