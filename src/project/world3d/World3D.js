import * as THREE from 'three';
import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';
import { Phase3D } from './Phase3D.js';

class World3D extends Entity3D {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;
        this.type = 'World3D';

        // Properties, THREE.Scene
        this.background = null;
        this.environment = null;            // not implemented
        this.fog = null;
        this.backgroundBlurriness = 0;      // not implemented
		this.backgroundIntensity = 1;       // not implemented
        this.overrideMaterial = null;       // not implemented

        // Properties, Nodes
        this.xPos = 0;
        this.yPos = 0;

        // Properties, Phase
        this.activePhaseUUID = undefined;

        // Shadow Plane (added as Object3D, NOT saved to JSON)
        this.shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(100000, 100000),
            new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'Shadow Plane';
        this.shadowPlane.userData.flagIgnore = true;
        this.shadowPlane.rotation.x = - Math.PI / 2;
        this.shadowPlane.castShadow = false;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = false;
        this.add(this.shadowPlane);
    }

    /******************** CHILDREN */

    activePhase() {
        return this.getPhaseByUUID(this.activePhaseUUID);
    }

    setActivePhase(phase) {
        if (phase && phase.uuid) {
            this.activePhaseUUID = phase.uuid;
        }
    }

    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity3D) return this;
        if (this.children.indexOf(entity) !== -1) return this;
        if (entity.isWorld) return this;
        if (entity.isPhase) {
            maintainWorldTransform = false;
            if (this.getPhases().length === 0) this.setActivePhase(entity);
        }
        return super.addEntity(entity, index, maintainWorldTransform);
    }

    getEntities(includePhases = true) {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (!includePhases && child.isPhase) continue;
            filteredChildren.push(child);
        }
        return filteredChildren;
    }

    getFirstPhase() {
        const phases = this.getPhases();
        if (phases.length > 0) return phases[0];
    }

    getPhases() {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (child.isPhase) filteredChildren.push(child);
        }
        return filteredChildren;
    }

    getPhaseByName(name) {
        const phase = this.getEntityByProperty('name', name);
        if (phase && phase.isPhase) return phase;
    }

    getPhaseByUUID(uuid) {
        const phase = this.getEntityByProperty('uuid', uuid);
        if (phase && phase.isPhase) return phase;
    }

    getPhaseByProperty(property, value) {
        const phases = this.getPhases();
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            if (phase[property] === value) return phase;
        }
    }

    traversePhases(callback, recursive = true) {
        if (typeof callback === 'function') callback(this);

        if (recursive) {
            const phases = this.getPhases();
            for (let i = 0; i < phases.length; i++) {
                const phase = phases[i];
                phase.traverseEntities(callback, recursive);
            }
        }
    }

    /******************** COPY / CLONE */

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Entity3D.copy()
        super.copyEntity(source, recursive);

        // THREE.Scene Properties
        if (source.background) {
            if (source.background.isColor) {
                this.background = source.background.clone();
            } else {
                this.background = source.background; /* texture uuid */
            }
        }
		if (source.environment !== null) this.environment = source.environment.clone();
		if (source.fog !== null) this.fog = source.fog.clone();
		this.backgroundBlurriness = source.backgroundBlurriness;
		this.backgroundIntensity = source.backgroundIntensity;
		if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

        // World3D Properties
        this.xPos = source.xPos;
        this.yPos = source.yPos;
        const phaseIndex = source.children.indexOf(source.activePhase());
        if (phaseIndex >= 0) this.activePhaseUUID = this.children[phaseIndex].uuid;

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();

        if (this.background && typeof this.background.dispose === 'function') this.background.dispose();
        if (this.environment && typeof this.environment.dispose === 'function') this.environment.dispose();
        if (this.fog && typeof this.fog.dispose === 'function') this.fog.dispose();
        if (this.overrideMaterial && typeof this.overrideMaterial.dispose === 'function') this.overrideMaterial.dispose();

        if (this.shadowPlane) ObjectUtils.clearObject(this.shadowPlane);
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
                this.background = data.background; /* texture uuid */
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
        if (data.backgroundBlurriness !== undefined) this.backgroundBlurriness = data.backgroundBlurriness;
		if (data.backgroundIntensity !== undefined) this.backgroundIntensity = data.backgroundIntensity;

        // World3D Properties
        if (data.xPos !== undefined) this.xPos = data.xPos;
        if (data.yPos !== undefined) this.yPos = data.yPos;
        if (data.activePhaseUUID !== undefined) this.activePhaseUUID = data.activePhaseUUID;

        return this;
    }

    /** Adds additional types from Entity3D.loadChildren */
    loadChildren(json) {
        if (!json || !json.object || !json.object.entities) return;
        for (let i = 0; i < json.object.entities.length; i++) {
            const entityJSON = json.object.entities[i];
            let entity = undefined;
            switch (entityJSON.object.type) {
                case 'Camera3D':    entity = new Camera3D().fromJSON(entityJSON); break;
                case 'Phase3D':     entity = new Phase3D().fromJSON(entityJSON); break;
                case 'Entity3D':
                default:            entity = new Entity3D().fromJSON(entityJSON);
            }
            if (entity) this.add(entity);
        }
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // THREE.Scene Properties
        if (this.background) {
            if (this.background.isColor) {
                json.object.background = this.background.toJSON();
            } else {
                json.object.background = this.background; /* texture uuid */
            }
        }
        if (this.environment) {

        }
        if (this.fog) json.object.fog = this.fog.toJSON();
        if (this.backgroundBlurriness > 0) json.object.backgroundBlurriness = this.backgroundBlurriness;
		if (this.backgroundIntensity !== 1) json.object.backgroundIntensity = this.backgroundIntensity;

        // World3D Properties
        json.object.xPos = this.xPos;
        json.object.yPos = this.yPos;
        json.object.activePhaseUUID = this.activePhaseUUID;

        return json;
    }

}

export { World3D };
