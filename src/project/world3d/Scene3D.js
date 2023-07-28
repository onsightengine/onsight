import * as THREE from 'three';
import { AssetManager } from '../../app/AssetManager.js';
import { Entity3D } from './Entity3D.js';

class Scene3D extends Entity3D {

    constructor(name = 'Start Scene') {
        super(name);

        // Prototype
        this.isScene = true;                // generic type (Scene), and also for THREE compatibility
        this.isScene3D = true;
        this.type = 'Scene3D';

        // Properties, More (needed by THREE)
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.overrideMaterial = null;
        this.autoUpdate = true;             // checked by the renderer

        // Properties, Usage
        this.start = 0;
        this.end = -1;

        // Shadow Plane (added as Object3D, NOT saved to JSON)
        this.shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(100000, 100000),
            new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'ShadowPlane';
        this.shadowPlane.userData.flagIgnore = true;
        this.shadowPlane.rotation.x = - Math.PI / 2;
        this.shadowPlane.castShadow = false;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = false;
        this.add(this.shadowPlane);
    }

    /******************** COPY */

    copyEntity(source, recursive = true) {
        // Entity3D.copy()
        super.copyEntity(source, recursive);

        // Scene3D Properties
        this.start = source.start;
        this.end = source.end;

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json);

        // THREE.Scene Properties
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

        // Scene3D Properties
        if (data.start !== undefined) this.start = data.start;
        if (data.end !== undefined) this.end = data.end;

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // THREE.Scene Properties
        if (this.fog) json.object.fog = this.fog.toJSON();

        // Scene3D Properties
        json.object.start = this.start;
        json.object.end = this.end;

        return json;
    }

}

export { Scene3D };
