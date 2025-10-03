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

const scriptFunctions = APP_EVENTS.toString();
const scriptReturnObject = {};
for (const event of APP_EVENTS) scriptReturnObject[event] = event;
const scriptParameters = 'app,' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   /* remove all qoutes */

const _invQuaternion = new THREE.Quaternion();
const _tempRotation = new THREE.Quaternion();
const _beginPosition = new THREE.Vector3();
const _beginScale = new THREE.Vector3(1, 1, 1);
const _beginQuaternion = new THREE.Quaternion();
const _endPosition = new THREE.Vector3();
const _endScale = new THREE.Vector3(1, 1, 1);
const _endQuaternion = new THREE.Quaternion();
const _worldPosition = new THREE.Vector3();
const _worldScale = new THREE.Vector3(1, 1, 1);
const _worldQuaternion = new THREE.Quaternion();

const _composers = {};

class SceneManager {

    static app = undefined;

    /********** CAMERA */

    static findCamera(entity) {
        let camera;

        // Look for Camera
        camera = EntityUtils.findCamera(entity);
        if (camera) return camera;

        // No Camera Found
        camera = new Camera3D({ width: 1000, height: 1000 });
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    /********** ENTITY */

    /** Clone and copy children */
    static cloneChildren(toEntity, fromEntity) {
        for (const entity of fromEntity.getEntities()) {
            const clone = entity.cloneEntity(false /* recursive? */);

            // Scripts
            SceneManager.loadScriptsFromComponents(clone, entity);

            // Children
            if (!entity.isStage) SceneManager.cloneChildren(clone, entity);

            // Bloom rendering layers
            if (clone.bloom) {
                clone.traverse((child) => {
                    child.layers.disable(LAYERS.BASE);
                    child.layers.enable(LAYERS.BLOOM);
                });
            }

            // Map position of top level stage entities to world load position
            if (fromEntity.isStage) {
                // Transform stage begin position
                fromEntity.beginPosition.decompose(_beginPosition, _beginQuaternion, _beginScale);
                clone.position.sub(_beginPosition);
                clone.position.applyQuaternion(_invQuaternion.copy(_beginQuaternion).invert());
                clone.position.multiply(_beginScale);
                clone.position.multiply(_worldScale);
                clone.rotation.setFromQuaternion(_tempRotation.setFromEuler(clone.rotation).premultiply(_beginQuaternion));
                clone.scale.multiply(_beginScale);
                // Flag for Unloading
                if (toEntity.isWorld) {
                    const loadedDistance = toEntity.loadDistance + Math.abs(clone.position.length());
                    clone.traverse((child) => { child.userData.loadedDistance = loadedDistance; });
                }
                // Add world load position
                clone.scale.multiply(_worldScale);
                clone.rotation.setFromQuaternion(_tempRotation.setFromEuler(clone.rotation).premultiply(_worldQuaternion));
                clone.position.applyQuaternion(_worldQuaternion);
                clone.position.add(_worldPosition);
            }

            // Add clone
            toEntity.add(clone);

            // Component 'onLoad'
            for (const component of clone.components) {
                if (typeof component.onLoad === 'function') component.onLoad();
            }
        }
    }

    // Add Scripts
    static loadScriptsFromComponents(toEntity, fromEntity) {
        if (!toEntity || !toEntity.isEntity) return;
        if (!fromEntity || !fromEntity.isEntity || !fromEntity.components) return;

        for (const component of fromEntity.components) {
            if (component.type !== 'script' || !component.data) continue;

            // Find Script
            const scriptUUID = component.data.script;
            const script = AssetManager.getAsset(scriptUUID);
            if (!script || !script.isScript) continue;
            if (script.errors) { console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`); continue; }

            // Script Body
            let body = `${script.source}\n`;
            for (const variable in component.data.variables) {
                const value = component.data.variables[variable];
                if (value && typeof value === 'object') {
                    // console.log(value);
                    if (typeof value.value !== 'undefined') {
                        let json = JSON.stringify(value.value);
                        json = json.replace(/[.*+`'"?^${}()|[\]\\]/g, '\\$&'); /* fix special characters */
                        // console.log(json);
                        body = body + `let ${variable} = JSON.parse('${json}');\n`;
                    } else {
                        body = body + `let ${variable} = undefined;\n`;
                    }
                }
            }
            body = body + `return ${scriptReturnString};`;

            // Returns object holding script functions (with proper 'this' bound and access to globals / script variables)
            const returnFunctionObject = new Function(scriptParameters /* parameters */, body /* source */).bind(toEntity);
            const functionObject = returnFunctionObject(SceneManager.app);

            // Add functions to Event Dispatcher
            for (const name in functionObject) {
                if (typeof functionObject[name] !== 'function') continue;
                const callback = functionObject[name].bind(toEntity);
                SceneManager.app.addEvent(name, toEntity, callback);
            }
        }
    }

    static removeEntity(fromScene, entity) {
        if (!fromScene || !fromScene.isWorld3D) return;
        if (!entity || !entity.isObject3D) return;
        SceneManager.app.dispatch('destroy', {}, [ entity.uuid ]);
        fromScene.removeEntity(entity, true /* forceDelete */);
        if (typeof entity.dispose === 'function') entity.dispose();
    }

    /********** SCENE */

    static cloneStage(toScene, fromStage, updateLoadPosition = true) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromStage || !fromStage.isStage3D) return;

        // Add children
        toScene.loadPosition.decompose(_worldPosition, _worldQuaternion, _worldScale);
        SceneManager.cloneChildren(toScene, fromStage);

        // Update load position
        if (updateLoadPosition) {
            // Transform begin -> end position
            fromStage.beginPosition.decompose(_beginPosition, _beginQuaternion, _beginScale);
            fromStage.endPosition.decompose(_endPosition, _endQuaternion, _endScale);
            _endPosition.sub(_beginPosition);
            _endPosition.applyQuaternion(_invQuaternion.copy(_beginQuaternion).invert());
            _endPosition.multiply(_beginScale); /* scale position */
            _endPosition.multiply(_worldScale);
            _endPosition.applyQuaternion(_worldQuaternion);
            _endQuaternion.premultiply(_beginQuaternion);
            _endScale.multiply(_beginScale);
            // Add end position to load position
            _worldScale.multiply(_endScale);
            _worldQuaternion.premultiply(_endQuaternion);
            _worldPosition.add(_endPosition);
            toScene.loadPosition.compose(_worldPosition, _worldQuaternion, _worldScale);
            // Load distance
            toScene.loadDistance += Math.abs(_endPosition.length());
        }
    }

    static loadStages(toScene, fromWorld, preload = 10) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromWorld || !fromWorld.isWorld3D) return;
        if (preload < 0) return;

        const startDistance = toScene.loadDistance;
        let addedStageCount = 0;
        while (toScene.loadDistance - startDistance < preload) {
            // Possible Stages
            const stages = [];
            for (const stage of fromWorld.getStages()) {
                if (!stage.enabled) continue;
                if (stage.start >= 0 && stage.start > toScene.loadDistance) continue;
                if (stage.finish >= 0 && stage.finish < toScene.loadDistance) continue;
                stages.push(stage);
            }

            // Load Stage
            if (stages.length > 0) {
                SceneManager.cloneStage(toScene, stages[Math.floor(Math.random() * stages.length)]);
                addedStageCount++;
            // No Stages Available
            } else {
                toScene.loadDistance += preload;
                break;
            }
        }

        // Script 'init()' functions
        if (addedStageCount > 0) {
            SceneManager.app.dispatch('init');
        }
    }

    static loadWorld(toScene, fromWorld) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromWorld || !fromWorld.isWorld3D) return;

        // Background
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

        // Physics?
        const worldPhysicsComponent = fromWorld.getComponentByType('physics');
        if (worldPhysicsComponent) {
            const scenePhysicsComponent = toScene.addComponent(worldPhysicsComponent.type, worldPhysicsComponent.toJSON(), false);
            scenePhysicsComponent.onLoad();
            toScene.physics = scenePhysicsComponent;
        }

        // Children
        SceneManager.cloneChildren(toScene, fromWorld);
    }

    /********** RENDER */

    static renderWorld(world) {
        if (!world || !world.isWorld3D) return;

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
            for (const component of components) {
                const pass = component.backend;
                if (pass) {
                    pass.scene = SceneManager.app.scene;
                    pass.camera = SceneManager.app.camera;
                    composer.addPass(pass);
                }
            }

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
        for (const component of components) {
            const pass = component.backend;
            if (pass) {
                pass.camera = camera;
            }
        }
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

            // Update passes with 'setFixedSize' function
            for (const pass of composer.passes) {
                if (typeof pass.setFixedSize === 'function') pass.setFixedSize(fixedWidth, fixedHeight);
            }
        }
    }

    /********** DISPOSE */

    static dispose() {
        // Clean-up Effect Composers
        for (const uuid in _composers) {
            const composer = _composers[uuid];
            if (composer) {
                for (const pass of composer.passes) {
                    if (typeof pass.dispose === 'function') pass.dispose();
                }
                if (typeof composer.dispose === 'function') composer.dispose();
            }
            delete _composers[uuid];
        }
    }

}

export { SceneManager };
