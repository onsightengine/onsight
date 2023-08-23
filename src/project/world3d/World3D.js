import * as THREE from 'three';
import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';
import { Stage3D } from './Stage3D.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

class World3D extends Entity3D {

    constructor(name = 'World 1', locked = false) {
        super(name);
        this.isLocked = locked;

        // Prototype
        this.isScene = true;                // for THREE.Render() compatibility
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

        // Properties, Stage
        this.activeStageUUID = null;
        this.loadPosition = new THREE.Matrix4();

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

    activeStage() {
        const stage = this.getStageByUUID(this.activeStageUUID);
        return stage ?? this;
    }

    setActiveStage(stage) {
        if (stage && stage.isEntity && this.getStageByUUID(stage.uuid)) {
            this.activeStageUUID = stage.uuid;
        } else {
            this.activeStageUUID = null;
        }
        return this;
    }

    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity3D) return this;
        if (this.children.indexOf(entity) !== -1) return this;
        if (entity.isWorld) return this;
        if (entity.isStage) maintainWorldTransform = false;
        super.addEntity(entity, index, maintainWorldTransform);
        if (entity.isStage && this.getStages().length === 1) this.setActiveStage(entity);
        return this;
    }

    getEntities(includeStages = true) {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (!includeStages && child.isStage) continue;
            filteredChildren.push(child);
        }
        return filteredChildren;
    }

    getFirstStage() {
        const stages = this.getStages();
        if (stages.length > 0) return stages[0];
    }

    getStages() {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (child.isStage) filteredChildren.push(child);
        }
        return filteredChildren;
    }

    getStageByName(name) {
        const stage = this.getEntityByProperty('name', name);
        if (stage && stage.isStage) return stage;
    }

    getStageByUUID(uuid) {
        const stage = this.getEntityByProperty('uuid', uuid);
        if (stage && stage.isStage) return stage;
    }

    getStageByProperty(property, value) {
        const stages = this.getStages();
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            if (stage[property] === value) return stage;
        }
    }

    /** Return 'true' in callback to stop further recursion */
    traverseStages(callback, recursive = true) {
        const cancel = (typeof callback === 'function') ? callback(this) : false;

        if (recursive && !cancel) {
            for (const stage of this.getStages()) {
                stage.traverseEntities(callback, recursive);
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
        const sourceStages = source.getStages();
        const stageIndex = sourceStages.indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;
        this.loadPosition.copy(source.loadPosition);

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
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;
        if (data.loadPosition !== undefined) this.loadPosition.fromArray(data.loadPosition);

        return this;
    }

    /** Overloaded to add access to additional Entity3D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
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
        json.object.activeStageUUID = this.activeStageUUID;
        json.object.loadPosition = this.loadPosition.toArray();

        return json;
    }

}

export { World3D };
