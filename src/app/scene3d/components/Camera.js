/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/Cloud9c/taro/blob/main/src/components/Camera.js
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { ComponentManager } from '../../ComponentManager.js';

export const CAMERA_START_DISTANCE = 5;
export const CAMERA_START_HEIGHT = 0;

///// Local Variables

const _renderSize = new THREE.Vector2(1, 1);

///// Component

class Camera {

    init(data) {

        ///// Generate Backend

        let camera = undefined;

        switch (data.style) {
            case 'perspective':
                // Private Properties
                this._tanFOV = Math.tan(((Math.PI / 180) * data.fov / 2));
                this._windowHeight = (data.fixedSize) ? 1000 : 0;

                camera = new THREE.PerspectiveCamera(data.fov, 1 /* data.aspect */, data.nearPersp, data.farPersp);
                break;

            case 'orthographic':
                camera = new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.nearOrtho, data.farOrtho);
                break;

            default:
                console.error(`Camera.init: Invalid camera type '${data.style}'`);
        }

        ///// Modifiy Camera

        if (camera && camera.isCamera) {

            // Set Starting Location
            camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
            camera.lookAt(0, CAMERA_START_HEIGHT, 0);

        } else {
            console.log('Error with camera!');
        }

        ///// Save Data / Backend

        this.backend = camera;
        this.data = data;
        this.style = data.style;
    }

    dispose() {

    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    updateProjectionMatrix() {
        if (! window.getRenderer()) return;

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
                this.backend.left =   - width / aspectWidth / 2;
                this.backend.right =    width / aspectWidth / 2;
                this.backend.top =      height * aspectHeight / 2;
                this.backend.bottom = - height * aspectHeight / 2;
            }

            this.backend.updateProjectionMatrix();
        }
    }

    toJSON() {
        const data = this.defaultData('style', this.style);

        // Copy Existing 'data' Properties
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }

        // Copy values from THREE.Camera
        if (this.backend) {
            for (let key in data) {
                let value = this.backend[key];
                if (value !== undefined) {
                    data[key] = value;
                }
            }
        }

        return data;
    }

}

Camera.config = {
    schema: {
        style: { type: 'select', default: 'perspective', select: [ 'perspective', 'orthographic' ] },

        nearPersp: { type: 'number', default: 1, if: { style: [ 'perspective' ] } },
        farPersp: { type: 'number', default: 100000, if: { style: [ 'perspective' ] } },
        nearOrtho: { type: 'number', default: -50000, if: { style: [ 'orthographic' ] } },
        farOrtho: { type: 'number', default: 50000, if: { style: [ 'orthographic' ] } },

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
