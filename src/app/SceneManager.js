import * as THREE from 'three';
import { CameraUtils } from '../utils/three/CameraUtils.js';

// CAMERA
//  cameraFromScene()       Looks for a camera within a scene
// ENTITY
//  cloneEntities()         Copies entities from one scene to another

class SceneManager {

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

    static cloneEntities(toScene, fromScene) {
        const entities = fromScene.getEntities();
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            toScene.add(entity.cloneEntity());
        }
    }

}

export { SceneManager };