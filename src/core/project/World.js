import {
    WORLD_TYPES,
} from '../../constants.js';
import { Entity } from './Entity.js';
import { Vector3 } from '../../math/Vector3.js';

class World extends Entity {

    constructor(type = WORLD_TYPES.WORLD_2D, name = 'World 1') {
        super(name);

        // Check
        if (Object.values(WORLD_TYPES).indexOf(type) === -1) {
            console.warn(`World: Invalid world type '${type}', using 'World2D`);
            type = WORLD_TYPES.WORLD_2D;
        }

        // Prototype
        this.isWorld = true;
        this.type = type;

        // Properties, Nodes
        this.position = new Vector3();

        // Properties, Stage
        this.activeStageUUID = null;

        // Properties, Gameplay
        this.loadPosition = new Vector3();
        this.loadDistance = 0;
    }

    componentFamily() {
        return [ 'World', this.type ];
    }

    /******************** CHILDREN */

    activeStage() {
        const stage = this.getStageByUUID(this.activeStageUUID);
        return stage ?? this;
    }

    setActiveStage(stage) {
        this.activeStageUUID = null;
        if (stage && stage.isEntity && this.getStageByUUID(stage.uuid)) {
            this.activeStageUUID = stage.uuid;
        }
        return this;
    }

    addEntity(...entities) {
        super.addEntity(...entities);
        if (!this.activeStageUUID) {
            const stages = this.getStages();
            if (stages.length > 0) this.setActiveStage(stages[0]);
        }
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
            stage.traverse(callback, recursive);
        }
    }

    /******************** COPY */

    copy(source, recursive = true) {
        super.copy(source, recursive);

        // Type
        this.type = source.type;

        // Node
        this.position.copy(source.position);

        // Stage
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;

        // Gameplay
        this.loadPosition.copy(source.loadPosition);
        this.loadDistance = source.loadDistance;
        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();
    }

    /******************** JSON */

    toJSON(recursive = true) {
        const data = super.toJSON(recursive);

        // Type
        data.type = this.type;

        // Node
        data.position = JSON.stringify(this.position.toArray());

        // Stage
        data.activeStageUUID = this.activeStageUUID;

        // Gameplay
        data.loadPosition = JSON.stringify(this.loadPosition.toArray());
        data.loadDistance = this.loadDistance;
        return data;
    }

    fromJSON(data) {
        super.fromJSON(data);

        // Type
        if (data.type !== undefined) this.type = data.type;

        // Node
        if (data.position !== undefined) this.position.copy(JSON.parse(data.position));

        // Stage
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;

        // Gameplay
        if (data.loadPosition !== undefined) this.loadPosition.copy(JSON.parse(data.loadPosition));
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;
        return this;
    }

}

Entity.register('World2D', World);
Entity.register('World3D', World);
Entity.register('WorldUI', World);

export { World };
