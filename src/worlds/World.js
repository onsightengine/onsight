import { Entity } from './Entity.js';
import { Vec2 } from '../math/Vec2.js';
import { Vec3 } from '../math/Vec3.js';

class World extends Entity {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld = true;
        this.type = 'World';

        // Properties, Nodes
        this.position = new Vec2();

        // Properties, Stage
        this.activeStageUUID = null;

        // Properties, Gameplay
        this.loadPosition = new Vec3();
        this.loadDistance = 0;
    }

    componentFamily() {
        return [ /* 'World' */ ];
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
        // Entity
        super.copy(source, recursive);

        // World, Node
        this.position.copy(source.position);

        // World, Stage
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;

        // World, Gameplay
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
        // Entity
        const data = super.toJSON(recursive);

        // World, Node
        data.position = JSON.stringify(this.position.toArray());

        // World, Stage
        data.activeStageUUID = this.activeStageUUID;

        // World, Gameplay
        data.loadPosition = JSON.stringify(this.loadPosition.toArray());
        data.loadDistance = this.loadDistance;

        return data;
    }

    fromJSON(data) {
        // Entity
        super.fromJSON(data);

        // World, Node
        if (data.position !== undefined) this.position.copy(JSON.parse(data.position));

        // World, Stage
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;

        // World Properties, Gameplay
        if (data.loadPosition !== undefined) this.loadPosition.copy(JSON.parse(data.loadPosition));
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;

        return this;
    }

}

Entity.register('World', World);

export { World };
