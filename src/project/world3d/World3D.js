import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';
import { Stage3D } from './Stage3D.js';

class World3D extends Entity3D {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;
        this.type = 'World3D';

        // Properties, Nodes
        this.xPos = 0;
        this.yPos = 0;

        // Properties, Stage
        this.activeStageUUID = null;

        // Properties, Gameplay
        // this.loadPosition = new THREE.Matrix4();
        this.loadDistance = 0;
    }

    componentFamily() {
        return [ 'Entity', 'World3D' ];
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
        // Entity3D
        super.copy(source, recursive);

        // World3D, Node
        this.xPos = source.xPos;
        this.yPos = source.yPos;

        // World3D, Stage
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;

        // World3D, Gameplay
        // this.loadPosition.copy(source.loadPosition);
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

        // Entity3D
        super.fromJSON(json);

        // World3D, Node
        if (data.xPos !== undefined) this.xPos = data.xPos;
        if (data.yPos !== undefined) this.yPos = data.yPos;

        // World3D, Stage
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;

        // World3D Properties, Gameplay
        // if (data.loadPosition !== undefined) this.loadPosition.fromArray(data.loadPosition);
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;

        return this;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        const constructor = _types[json.object.type];
        if (constructor) return new constructor().fromJSON(json);
        return undefined;
    }

    toJSON() {
        // Entity3D
        const json = super.toJSON();

        // World3D, Node
        json.object.xPos = this.xPos;
        json.object.yPos = this.yPos;

        // World3D, Stage
        json.object.activeStageUUID = this.activeStageUUID;

        // World3D, Gameplay
        // json.object.loadPosition = this.loadPosition.toArray();
        json.object.loadDistance = this.loadDistance;

        return json;
    }

}

const _types = {
    'Entity3D':     Entity3D,
    'Camera3D':     Camera3D,
    'Stage3D':      Stage3D,
}

export { World3D };
