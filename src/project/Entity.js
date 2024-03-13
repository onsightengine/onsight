// DATA
//  userData.entityID           USE: Transform controls to link a transform clone with original entity
//  userData.loadedDistance     USE: Tracking removal of Entities loaded into World during App.play()

import { Transform } from '../objects/Transform.js';

const _types = {
    'Transform': Transform,
};

class Entity extends Transform {

    constructor(name = 'Entity') {
        // Transform
        super(name);

        // Prototype
        this.isEntity = true;
        this.type = 'Entity';

        // Collections
        this.components = [];                   // sprite, geometry, material, audio, light, etc.

        // Hierarchy
        this.children = [];

        // User Data
        this.userData = {};
    }

    /** Override to set component.group */
    componentGroup() {
        return 'Entity';
    }

    /******************** CHILDREN */

    add(child, /* child, child, ... */) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) this.addChild(arguments[i]);
            return this;
        }
        if (!child || child === this) return this;
        if (child.parent) {
            if (child.parent === this) return this;
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.push(child);
        return this;
    }

    remove(child) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) this.removeChild(arguments[i]);
            return this;
        }
        if (!child || child === this) return this;
        const index = this.children.indexOf(child);
        if (index !== -1) {
            child.parent = null;
            this.children.splice(index, 1);
        }
        return this;
    }

    /******************** ENTITIES */

    getEntities() {
        const entities = [];
        for (const child of this.children) {
            if (child && child.isEntity) {
                entities.push(child);
            }
        }
        return entities;
    }

    getEntityById(id) {
        return this.getEntityByProperty('id', parseInt(id));
    }

    getEntityByName(name) {
        return this.getEntityByProperty('name', name);
    }

    getEntityByUUID(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }

    /** Recursively searches for a child Entity */
    getEntityByProperty(property, value) {
        if (this[property] === value) return this;
        for (const child of this.getEntities()) {
            const entity = child.getEntityByProperty(property, value);
            if (entity) return entity;
        }
        return undefined;
    }

    /** Removes entity, does not call 'dispose()' on Entity!! */
    removeEntity(entity, forceDelete = false) {
        if (!entity) return;
        if (!forceDelete) {
            if (entity.locked) return;
        }
        this.remove(entity); /* entity is now out of Project */
        return entity;
    }

    /******************** HIERARCHY */

    /** Return 'true' in callback to stop further recursion */
    traverse(callback, recursive = true) {
		if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverse(callback);
        }
    }

    /** Return 'true' in callback to stop further recursion */
    traverseEntities(callback, recursive = true) {
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.getEntities()) {
            child.traverseEntities(callback, recursive);
        }
    }

    /** Return 'true' in callback to stop further recursion */
    traverseVisible(callback) {
        if (!this.visible) return;
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverseVisible(callback);
        }
    }

    /******************** MATRIX */

    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);
        for (const child of this.children) {
            child.updateMatrixWorld(force);
        }
        return this;
    }

    decompose() {
        this.matrix.getTranslation(this.position);
        this.matrix.getRotation(this.quaternion);
        this.matrix.getScaling(this.scale);
        this.rotation.fromQuaternion(this.quaternion);
        return this;
    }

    lookAt(target, invert = false) {
        if (invert) this.matrix.lookAt(this.position, target, this.up);
        else this.matrix.lookAt(target, this.position, this.up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion);
        return this;
    }

    /******************** COPY / CLONE */

    clone(recursive = true) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
        // Remove Existing Children / Components
        this.dispose();

        // Transform.copy()
        super.copy(source, false /* recursive */);

        // // Copy Components
        // for (const component of source.components) {
        //     const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
        //     // Component Properties
        //     clonedComponent.tag = component.tag;
        // }

        // Copy Children
        if (recursive) {
            for (const child of source.children) {
                this.add(child.clone());
            }
        }

        // User Data
        this.userData = structuredClone(data.userData);

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        while (this.components.length > 0) {
            const component = this.components[0];
            this.removeComponent(component);
            if (typeof component.dispose === 'function') component.dispose();
        }

        while (this.children.length > 0) {
            // // TODO: Clear Object
            // Geometry dispose
            // Material dispose
            // Clear Children
            // Remove from parent
        }
    }

    /******************** JSON */

    fromJSON(json) {
        super.fromJSON(json);

        const data = json.object;

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

        // User Data
        if (typeof data.userData === 'object') this.userData = structuredClone(data.userData);

        // Matrix
        this.updateMatrix();
        return this;
    }

    /** Overloaded to add access to additional Entity types */
    loadChildren(jsonChildren = []) {
        for (const childData of jsonChildren) {
            const Constructor = (childData.object.type === this.type) ? this.constructor : _types[childData.object.type];
            if (Constructor) {
                const child = new Constructor();
                this.add(child.fromJSON(childData));
            } else {
                console.warn(`Entity.loadChildren: Unknown type '${childData.object.type}'`);
            }
        }
    }

    /** Coverts Entity to JSON */
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

        // User Data
        if (Object.keys(this.userData).length > 0) {
            json.object.userData = structuredClone(this.userData);
        }

        // Entity2D Basic Properties
        json.object.locked = this.locked;
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.lookAtYOnly = this.lookAtYOnly;

        // Entity2D Lighting Properties
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

export { Entity };
