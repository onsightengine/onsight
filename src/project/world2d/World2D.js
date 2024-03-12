import { Camera2D } from './Camera2D.js';
import { Entity2D } from './Entity2D.js';
import { Stage2D } from './Stage2D.js';

const _types = {
    'Camera2D': Camera2D,
    'Entity2D': Entity2D,
    'Stage2D': Stage2D,
};

class World2D extends Entity2D {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isScene = true;                // for THREE.Render() compatibility
        this.isWorld = true;
        this.isWorld2D = true;
        this.type = 'World2D';

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

        // // Properties, Gameplay
        // this.loadPosition = new THREE.Matrix4();
        // this.loadDistance = 0;
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
        if (!entity || !entity.isEntity2D) return this;
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
        for (const stage of this.getStages()) {
            if (stage[property] === value) return stage;
        }
    }

    /** Return 'true' in callback to stop further recursion */
    traverseStages(callback, recursive = true) {
        const cancel = (typeof callback === 'function') ? callback(this) : false;
        if (cancel) return;

        for (const stage of this.getStages()) {
            stage.traverseEntities(callback, recursive);
        }
    }

    /******************** COPY / CLONE */

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Entity2D.copy()
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

        // World2D Properties, Node
        this.xPos = source.xPos;
        this.yPos = source.yPos;

        // World2D Properties, Stage
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;

        // World2D Properties, Gameplay
        this.loadPosition.copy(source.loadPosition);
        this.loadDistance = source.loadDistance;

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

        // Entity2D Properties
        super.fromJSON(json);

        // THREE.Scene Properties
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                // this.background = new THREE.Color(data.background);
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

        // World2D Properties, Node
        if (data.xPos !== undefined) this.xPos = data.xPos;
        if (data.yPos !== undefined) this.yPos = data.yPos;

        // World2D Properties, Stage
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;

        // World2D Properties, Gameplay
        if (data.loadPosition !== undefined) this.loadPosition.fromArray(data.loadPosition);
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;

        return this;
    }

    /** Overloaded to add access to additional Entity2D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const Constructor = _types[entityData.object.type];
            if (Constructor) {
                const entity = new Constructor();
                this.add(entity.fromJSON(entityData));
            } else {
                console.warn(`World2D.loadChildren: Unknown type '${entityData.object.type}'`);
            }
        }
    }

    toJSON() {
        // Entity2D Properties
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
            // ??
        }
        if (this.fog) json.object.fog = this.fog.toJSON();
        if (this.backgroundBlurriness > 0) json.object.backgroundBlurriness = this.backgroundBlurriness;
		if (this.backgroundIntensity !== 1) json.object.backgroundIntensity = this.backgroundIntensity;

        // World2D Properties, Node
        json.object.xPos = this.xPos;
        json.object.yPos = this.yPos;

        // World2D Properties, Stage
        json.object.activeStageUUID = this.activeStageUUID;

        // World2D Properties, Gameplay
        json.object.loadPosition = this.loadPosition.toArray();
        json.object.loadDistance = this.loadDistance;

        return json;
    }

}

export { World2D };
