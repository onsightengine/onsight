import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';

class Scene3D extends Entity3D {

    constructor(name = 'Start Scene') {
        super(name);

        // Prototype
        this.isScene = true;                // generic type (Scene), and also for THREE compatibility
        this.isScene3D = true;
        this.type = 'Scene3D';

        // Properties, THREE.Scene (set from World3D)
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.backgroundBlurriness = 0;
		this.backgroundIntensity = 1;
        this.overrideMaterial = null;

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

    /******************** DISPOSE */

    dispose() {
        super.dispose();

        if (this.background && typeof this.background.dispose === 'function') this.background.dispose();
        if (this.environment && typeof this.environment.dispose === 'function') this.environment.dispose();
        if (this.fog && typeof this.fog.dispose === 'function') this.fog.dispose();
        if (this.overrideMaterial && typeof this.overrideMaterial.dispose === 'function') this.overrideMaterial.dispose();
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json);

        // Scene3D Properties
        if (data.start !== undefined) this.start = data.start;
        if (data.end !== undefined) this.end = data.end;

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // Scene3D Properties
        json.object.start = this.start;
        json.object.end = this.end;

        return json;
    }

}

export { Scene3D };
