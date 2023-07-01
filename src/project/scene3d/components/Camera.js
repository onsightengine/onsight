import * as THREE from 'three';
import { ComponentManager } from '../../ComponentManager.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/Camera.js

const _renderSize = new THREE.Vector2(1, 1);

class Camera {

    init(data) {
        // Generate Backend
        let camera = undefined;
        switch (data.style) {

            case 'perspective':
                // Private Properties
                this._tanFOV = Math.tan(((Math.PI / 180) * data.fov / 2));
                this._windowHeight = (data.fixedSize) ? 1000 : 0;

                // Error checks
                let nearPersp = (data.nearPersp <= 0) ? 0.00001 : data.nearPersp;
                let farPersp = (data.farPersp == 0) ? 0.00001 : data.farPersp;
                if (farPersp === nearPersp) farPersp += 0.001;

                // Build Object
                camera = new THREE.PerspectiveCamera(data.fov, 1 /* data.aspect */, nearPersp, farPersp);
                break;

            case 'orthographic':
                // Error checks
                let nearOrtho = data.nearOrtho;
                let farOrtho = data.farOrtho;
                let leftOrtho = data.left;
                let rightOrtho = data.right;
                let topOrtho = data.top;
                let bottomOrtho = data.bottom;
                if (farOrtho === farOrtho) farOrtho += 0.001;
                if (rightOrtho === leftOrtho) rightOrtho += 0.001;
                if (topOrtho === bottomOrtho) topOrtho += 0.001;

                // Build Object
                camera = new THREE.OrthographicCamera(leftOrtho, rightOrtho, topOrtho, bottomOrtho, nearOrtho, farOrtho);
                break;

            default:
                console.error(`Camera.init: Invalid camera type '${data.style}'`);

        }

        // Modify Camera
        if (camera && camera.isCamera) {
            camera.position.set(0, 0, 0);
            camera.lookAt(0, 0, 0);
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

    updateProjectionMatrix() {
        if (!window.getRenderer()) return;

        if (this.backend && this.backend.isCamera) {
            window.getRenderer().getSize(_renderSize);
            let width = _renderSize.x;
            let height = _renderSize.y;

            if (this.backend.isPerspectiveCamera) {
                if (this.data.fixedSize) this.backend.fov = (360 / Math.PI) * Math.atan(this._tanFOV * (height / this._windowHeight));
                this.backend.aspect = width / height;

            } else if (this.backend.isOrthographicCamera) {
                let aspectWidth = 1.0;
                let aspectHeight = 1.0;

                // Calculate new frustum, update camera
                this.backend.left = - width / aspectWidth / 2;
                this.backend.right = width / aspectWidth / 2;
                this.backend.top = height * aspectHeight / 2;
                this.backend.bottom = - height * aspectHeight / 2;
            }

            this.backend.updateProjectionMatrix();
        }
    }

    three() {
        return this.backend;
    }

}

Camera.config = {
    schema: {
        style: { type: 'select', default: 'perspective', select: [ 'perspective', 'orthographic' ] },

        nearPersp: { type: 'number', default: 1, min: 0, step: 0.1, if: { style: [ 'perspective' ] } },
        farPersp: { type: 'number', default: 500, min: 0, step: 1, if: { style: [ 'perspective' ] } },
        nearOrtho: { type: 'number', default: -500, step: 1,  if: { style: [ 'orthographic' ] } },
        farOrtho: { type: 'number', default: 500, step: 1,  if: { style: [ 'orthographic' ] } },

        fov: { type: 'number', default: 58.10, if: { style: [ 'perspective' ] } },
        fixedSize: { type: 'boolean', default: true, if: { style: [ 'perspective' ] } },
        // aspect: { type: 'number', default: 1, if: { style: [ 'perspective' ], fixedSize: [ false ] } },

        left: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
        right: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
        top: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
        bottom: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
    },
    icon: ``,
    color: '#4B4886',
};

ComponentManager.register('camera', Camera);
