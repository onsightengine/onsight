import * as THREE from 'three';
import { Camera3D } from '../Camera3D.js';
import { ComponentManager } from '../../ComponentManager.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/Camera.js

const _renderSize = new THREE.Vector2(1, 1);

class Camera {

    init(data) {
        // Generate Backend
        let camera = undefined;


        switch (data.style) {

            case 'perspective':
            case 'orthographic':
                camera = new Camera3D({ type: data.style });
                break;

            default:
                console.error(`Camera Component: Invalid style '${data.style}'`);
        }

        // Modify Camera
        if (camera && camera.isCamera) {

        } else {
            // console.log('Error with camera!');
        }

        // Save Backend / Data
        this.backend = camera;
        this.data = data;
    }

    dispose() {

    }

    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    three() {
        return this.backend;
    }

}

Camera.config = {
    schema: {
        style: { type: 'select', default: 'perspective', select: [ 'perspective', 'orthographic' ] },

        // nearPersp: { type: 'number', default: 1, min: 0, step: 0.1, if: { style: [ 'perspective' ] } },
        // farPersp: { type: 'number', default: 500, min: 0, step: 1, if: { style: [ 'perspective' ] } },
        // fov: { type: 'number', default: 58.10, if: { style: [ 'perspective' ] } },

        // nearOrtho: { type: 'number', default: -500, step: 1,  if: { style: [ 'orthographic' ] } },
        // farOrtho: { type: 'number', default: 500, step: 1,  if: { style: [ 'orthographic' ] } },
    },
    icon: ``,
    color: '#4B4886',
    group: [ 'Entity3D' ],
};

ComponentManager.register('camera', Camera);
