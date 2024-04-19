import { Entity } from '../Entity.js';

class Entity3D extends Entity {

    constructor(name = 'Entity') {
        // Entity
        super(name);

        // Prototype
        this.isEntity3D = true;
        this.type = 'Entity3D';

        // Properties, Basic
        this.lookAtCamera = false;              // implemented in Entity3D.updateMatrix() overload
        this.lookAtYOnly = false;               // implemented in Entity3D.updateMatrix() overload

        // Properties, Lighting
        this.bloom = false;
    }

    componentFamily() {
        return [ 'Entity', 'Entity3D' ];
    }

    /******************** CHILDREN */

    addEntity(...entities) {
        for (const entity of entities) {
            if (!entity || !entity.isEntity3D) continue;
            super.addEntity(entity);
        }
        return this;
    }

    getEntities() {
        const entities = [];
        for (const entity of this.children) {
            if (!entity || !entity.isEntity3D) continue;
            entities.push(entity);
        }
        return entities;
    }

    /******************** COPY / CLONE */

    copy(source, recursive = true) {
        // Entity.copy()
        super.copy(source, recursive);

        // Entity3D
        this.lookAtCamera = source.lookAtCamera;
        this.lookAtYOnly = source.lookAtYOnly;
        this.bloom = source.bloom;

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Object3D Properties
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;

        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);

        if (data.castShadow !== undefined) this.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) this.receiveShadow = data.receiveShadow;
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.frustumCulled !== undefined) this.frustumCulled = data.frustumCulled;
        if (data.renderOrder !== undefined) this.renderOrder = data.renderOrder;

        if (data.layers !== undefined) this.layers.mask = data.layers;
        if (data.up !== undefined) this.up.fromArray(data.up);
        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;

        // Entity3D Properties
        if (data.locked !== undefined) this.locked = data.locked;
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.lookAtYOnly !== undefined) this.lookAtYOnly = data.lookAtYOnly;
        if (data.bloom !== undefined) this.bloom = data.bloom;

        // Prefab Properties
        if (data.category !== undefined) this.category = data.category;

        // Components
        for (const componentData of json.object.components) {
            if (componentData && componentData.base && componentData.base.type) {
                const component = this.addComponent(componentData.base.type, componentData, false);
                // Component Properties
                component.tag = componentData.base.tag;
            }
        }

        // Children
        this.loadChildren(data.entities);

        // Matrix
        this.updateMatrix();

        return this;
    }

    /** Overload when inheriting Entity3D to add access to additional Entity3D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
        }
    }

    /** Coverts Entity to JSON, NOTE: Any NON-entity children (Object3D only) are NOT included! */
    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,
                components: [],
                entities: [],
            }
        };

        // Object3D Properties
        json.object.position  = this.position.toArray();
        json.object.rotation = this.rotation.toArray();
        json.object.scale = this.scale.toArray();

        json.object.castShadow = this.castShadow;
        json.object.receiveShadow = this.receiveShadow;
        json.object.visible = this.visible;
        json.object.frustumCulled = this.frustumCulled;
        json.object.renderOrder = this.renderOrder;

        json.object.layers = this.layers.mask;
        json.object.up = this.up.toArray();
        json.object.matrixAutoUpdate = this.matrixAutoUpdate;

        // Entity3D Basic Properties
        json.object.locked = this.locked;
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.lookAtYOnly = this.lookAtYOnly;

        // Entity3D Lighting Properties
        json.object.bloom = this.bloom;

        // Prefab Properties
        json.object.category = this.category;

        // Components
        for (const component of this.components) {
            json.object.components.push(component.toJSON());
        }

        // Children
        for (const child of this.getEntities()) {
            json.object.entities.push(child.toJSON());
        }

        return json;
    }

}

export { Entity3D };
