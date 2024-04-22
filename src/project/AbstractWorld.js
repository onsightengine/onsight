import { AbstractEntity } from './AbstractEntity.js';
import { Vec2 } from '../math/Vec2.js';

class AbstractWorld extends AbstractEntity {

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
        this.loadPosition = [];
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
        // AbstractEntity
        super.copy(source, recursive);

        // World, Node
        this.position.copy(source.position);

        // World, Stage
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;

        // World, Gameplay
        this.loadPosition = [ ...source.loadPosition ];
        this.loadDistance = source.loadDistance;

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // AbstractEntity
        super.fromJSON(json);

        // World, Node
        if (data.position !== undefined) this.position = JSON.parse(data.position);

        // World, Stage
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;

        // World Properties, Gameplay
        if (data.loadPosition !== undefined) this.loadPosition = JSON.parse(data.loadPosition);
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;

        return this;
    }

    toJSON() {
        // AbstractEntity
        const json = super.toJSON();

        // World, Node
        json.object.position = JSON.stringify(this.position);

        // World, Stage
        json.object.activeStageUUID = this.activeStageUUID;

        // World, Gameplay
        json.object.loadPosition = JSON.stringify(this.loadPosition);
        json.object.loadDistance = this.loadDistance;

        return json;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'AbstractEntity': return new AbstractEntity();
            case 'AbstractStage': return new AbstractStage();
        }
        return undefined;
    }

}

export { AbstractWorld };
