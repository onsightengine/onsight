/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/Cloud9c/taro/blob/main/src/components/Light.js
//
/////////////////////////////////////////////////////////////////////////////////////
//
//          Three.js Light Types
//          --------------------
//
// 	Light       Shadow      Description
//	-----       -------     -----------
//	Ambient     -           Globally illuminates all objects in the scene equally
//	Directional YES         Light whose rays are parallel and emitted in a specific direction (Sun)
//	Hemisphere  -           Light above the scene, with color fading from sky color to ground color
//	Point       YES, SLOW   Light emitted from a single point in all directions (Lightbulb)
//	Rectangle   -           Emits light uniformly across the face a rectangular plane (Window, Strip Light)
//	Spot        YES         Light gets emitted from a single point in one direction, along a cone
//
//	Basic Scene
//      'Sky' -	Hemisphere light
//      'Sun' - Directional light
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { ComponentManager } from '../../ComponentManager.js';

class Light {

    init(data) {

        // Copy / Clear Backend
        this.dispose();

        ///// Generate Backend

        let light = undefined;
        let shadows = false;

        switch (data.style) {
            case 'ambient':
                light = new THREE.AmbientLight(data.color, data.intensity);
                // NO SHADOWS
                break;

            case 'directional':
                light = new THREE.DirectionalLight(data.color, data.intensity);
                shadows = true;
                break;

            case 'hemisphere':
                light = new THREE.HemisphereLight(data.color, data.groundColor, data.intensity);
                // NO SHADOWS
                break;

            case 'point':
                light = new THREE.PointLight(data.color, data.intensity, data.distance, data.decay);
                shadows = true;
                break;

            case 'spot':
                const angle = (Math.PI / 180) * data.angle;
                light = new THREE.SpotLight(data.color, data.intensity, data.distance, angle, data.penumbra, data.decay);
                shadows = true;
                break;

            default:
                console.error(`Light: Invalid light type '${data.style}'`);
        }

        ///// Modify Light

        if (light && light.isLight) {

            // Zero position (some lights set starting position: DirectionalLight, HemisphereLight...)
            light.position.set(0, 0, 0);

            // Increase shadow detail, default is kinda low
            if (shadows) {
                const SD = 10;
                light.castShadow = true;
                light.shadow.bias = data.shadowBias;
                light.shadow.mapSize.width = 2048;      // default:     512
                light.shadow.mapSize.height = 2048;     // default:     512
                light.shadow.camera.near = -500;        // default:     0.5
                light.shadow.camera.far = 500;          // default:     500
                light.shadow.camera.left = -SD;         // default:     -5
                light.shadow.camera.right = SD;         // default:     5
                light.shadow.camera.top = SD;           // default:     5
                light.shadow.camera.bottom = -SD;       // default:     -5
                light.shadow.camera.updateProjectionMatrix();
            }

        } else {
            console.log('Error with light!');
        }

        ///// Save Data / Backend

        this.backend = light;
        this.data = data;
        this.style = data.style;
    }

    dispose() {
        const light = this.backend;
        if (light && light.isLight) {
            if (light.shadow && light.shadow.map) light.shadow.map.dispose();
            light.dispose();
        }
        this.backend = undefined;
    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    toJSON() {
        const data = this.defaultData('style', this.style);

        // Copy Existing 'data' Properties
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }

        return data;
    }

}

Light.config = {
    schema: {
        style: { type: 'select', default: 'ambient', select: [ 'ambient', 'directional', 'hemisphere', 'point', 'spot' ] },

        ///// DIVIDER
        styleDivider: { type: 'divider' },
        /////

        color: [
            { type: 'color', default: 0xffffff, if: { style: [ 'ambient', 'directional', 'point', 'spot' ] } },
            { type: 'color', alias: 'skyColor', default: 0x80ffff, if: { style: [ 'hemisphere' ] } },
        ],
        groundColor: { type: 'color', default: 0x806040, if: { style: [ 'hemisphere' ] } },
        intensity: [
            { type: 'slider', default: 0.25 /* 0.5 */, step: 0.05, min: 0, max: 2, if: { style: [ 'ambient' ] } },
            { type: 'slider', default: 0.50 /* 0.5 */, step: 0.05, min: 0, max: 2, if: { style: [ 'hemisphere' ] } },
            { type: 'slider', default: 1.00 /* 0.5 */, step: 0.05, min: 0, max: 2, if: { style: [ 'directional' ] } },
            { type: 'slider', default: 1.00 /* 1.0 */, step: 0.05, min: 0, max: 2, if: { style: [ 'point', 'spot' ] } },
        ],
        distance: { type: 'number', default: 0, if: { style: [ 'point', 'spot' ] } },
        decay: { type: 'number', default: 1, if: { style: [ 'point', 'spot' ] } },
        angle: { type: 'number', default: 45, unit: '°', if: { style: [ 'spot' ] } },
        penumbra: { type: 'number', default: 0, min: 0, max: 1, if: { style: [ 'spot' ] } },

        shadowBias: { type: 'number', default: 0, precision: 6, promode: true, if: { style: [ 'directional', 'point', 'spot' ] } }
    },
    icon: ``,
    color: '#222222',
};

ComponentManager.register('light', Light);
