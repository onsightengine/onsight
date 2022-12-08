/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

import { AssetManager } from '../assets/AssetManager.js';
import { Entity3D } from './Entity3D.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Scene3D
/////////////////////////////////////////////////////////////////////////////////////

class Scene3D extends Entity3D {

    constructor(name = 'Start Scene') {
        super();

        // Prototype
        this.isScene = true;                // Generic type (Scene), and also for THREE compatibility
        this.isScene3D = true;

        // Properties, Basic
        this.name = name;
        this.type = 'Scene3D';

        // Properties, More (needed by THREE)
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.overrideMaterial = null;
        this.autoUpdate = true;             // checked by the renderer

        // Shadow Plane (added as Object3D, NOT saved)
        this.shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(100000, 100000),
            new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'ShadowPlane';
        this.shadowPlane.userData.flagIgnore = true;
        this.shadowPlane.userData.flagLocked = true;
        this.shadowPlane.rotation.x = - Math.PI / 2;
        this.shadowPlane.castShadow = false;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = false;
        this.add(this.shadowPlane);

    } // end ctor

    //////////////////// JSON

    fromJSON(json) {
        const data = json.object;

        // Scene Properties
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                this.background = new THREE.Color(data.background);
            } else {
                const backgroundTexture = AssetManager.getAsset(data.background);
                if (backgroundTexture && backgroundTexture.isTexture) this.background = backgroundTexture;
            }
        }
        if (data.environment !== undefined) {
            const environmentTexture = AssetManager.getAsset(data.background);
            if (environmentTexture && environmentTexture.isTexture) this.environment = environmentTexture;
        }
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE.FogExp2(data.fog.color, data.fog.density);
            }
        }

        // Entity3D Properties
        super.fromJSON(json);

        return this;
    }

    toJSON() {
        const json = super.toJSON();

        if (this.fog) json.object.fog = this.fog.toJSON();

        return json;
    }

}

/////////////////////////////////////////////////////////////////////////////////////
/////   Exports
/////////////////////////////////////////////////////////////////////////////////////

export { Scene3D };