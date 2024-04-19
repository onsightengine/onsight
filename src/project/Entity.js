import { Arrays } from '../../utils/Arrays.js';
import { ComponentManager } from '../../app/ComponentManager.js';
import { Uuid } from '../utils/Uuid.js';

class Entity {

    constructor(name = 'Entity') {
        // Prototype
        this.isEntity = true;
        this.type = 'Entity';

        // Properties
        this.name = name;
        this.uuid = Uuid.random();
        this.category = null;                   // used for organizing Prefabs
        this.locked = false;                    // locked in Editor? (do not allow selection, deletion, duplication, etc.)
        this.visible = true;                    // should be rendered?

        // Structure
        this.parent = null;
		this.children = [];
        this.components = [];                   // geometry, material, audio, light, etc.

        // Internal
        this.loadedDistance = 0;                // for tracking removal during App.play()
    }

    /** Component types this Entity is allowed to have */
    componentFamily() {
        return [ 'Entity' ];
    }

    /******************** COMPONENTS */

    /** Adds component of 'type' using 'data' object */
    addComponent(type, data = {}, includeDependencies = true) {
        const ComponentClass = ComponentManager.registered(type);
        if (ComponentClass === undefined) return undefined;

        // Config
        const config = ComponentClass.config;

        // Create new component if 'multiple' allowed (or if doesn't already have component)
        let component = this.getComponent(type);
        if (!component || ComponentClass.config.multiple) {
            component = new ComponentClass();
            this.components.push(component);
        }

        // Check for and add Dependent Components
        if (config.dependencies && includeDependencies) {
            for (const dependency of config.dependencies) {
                if (this.getComponent(dependency) == undefined) {
                    this.addComponent(dependency, {}, false /* includeDependencies */);
                }
            }
        }

        // Sanitize Data
        ComponentManager.sanitizeData(type, data);

        // Initialize Component
        component.detach();
        component.entity = this;
        component.init(data);
        component.attach();

        // Return reference to newly added component
        return component;
    }

    /** Adds an existing component (WARNING: Does not check for 'multiple' flag) */
    attachComponent(component) {
        this.components.push(component);
        component.detach();
        component.entity = this;
        component.init(component.toJSON());
        component.attach();
        return component;
    }

    /** Updates component with entirely new data (keeping any existing data) */
    updateComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        const newData = component.data ?? {};
        Object.assign(newData, data);
        ComponentManager.sanitizeData(type, newData);
        this.detach();
        this.init(newData);
        this.attach();
        return component;
    }

    /** Updates component with entirely new data */
    replaceComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        ComponentManager.sanitizeData(type, data);
        component.detach();
        component.init(data);
        component.attach();
        return component;
    }

    /** Get component by type (string, required) and tag (string, optional - in case of multiple components with type) */
    getComponent(type, tag /* optional */) {
        if (tag === undefined) return this.getComponentByProperty('type', type);
        const components = this.getComponentsWithProperties('type', type, 'tag', tag);
        if (components.length > 0) return components[0];
        return undefined;
    }

    getComponentByTag(tag) {
        return this.getComponentByProperty('tag', tag);
    }

    getComponentByType(type) {
        return this.getComponentByProperty('type', type);
    }

    getComponentsByType(type) {
        return this.getComponentsWithProperties('type', type);
    }

    /** Returns first component found with property === value */
    getComponentByProperty(property, value) {
        for (const component of this.components) {
            if (component[property] === value) return component;
        }
        return undefined;
    }

    /** Returns all components that match all key, value pairs */
    getComponentsWithProperties(/* key, value, key, value, etc. */) {
        const components = [];
        for (const component of this.components) {
            let hasProperties = true;
            for (let i = 0; i < arguments.length; i += 2) {
                const key = arguments[i];
                const value = arguments[i + 1];
                if (component[key] !== value) {
                    hasProperties = false;
                    break;
                }
            }
            if (hasProperties) components.push(component);
        }
        return components;
    }

    /** NOTE: Does not call dispose on component! */
    removeComponent(component) {
        if (!component) return;
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.detach();
            return component;
        }
        console.warn(`Entity.removeComponent(): Component ${component.uuid}, type '${component.type}' not found`);
    }

    rebuildComponents() {
        for (const component of this.components) {
            component.detach();
            component.init(component.toJSON());
            component.attach();
        }
        return this;
    }

    /** Return 'true' in callback to stop further recursion */
    traverseComponents(callback) {
        for (const component of this.components) {
            if (typeof callback === 'function' && callback(component)) return;
        }
    }

    /******************** CHILDREN */

    addEntity(...entities) {
        for (const entity of entities) {
            if (!entity || !entity.isEntity) continue;
            if (this.children.indexOf(entity) !== -1) continue;
            if (entity === this) continue;
            entity.removeFromParent();
			entity.parent = this;
			this.children.push(entity);
        }
        return this;
    }

    getEntities() {
        return [ ...this.children ];
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

    /** Removes entity, does not call 'dispose()' on Entity! */
    removeEntity(entity, forceDelete = false) {
        if (!entity) return;
        if (!forceDelete && entity.locked) return;
        const index = this.children.indexOf(entity);
		if (index !== -1) {
			entity.parent = null;
			this.children.splice(index, 1);
            /* entity is now out of Project */
		}
        return entity;
    }

    /** Return 'true' in callback to stop further recursion */
    traverse(callback, recursive = true) {
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverse(callback, recursive);
        }
    }

    /******************** PARENT */

    changeParent(newParent = undefined, newIndex = -1) {
        if (!newParent) newParent = this.parent;
        if (!newParent || !newParent.isEntity) return;

        // Check if we have a parent
        const oldParent = this.parent;
        if (newIndex === -1 && oldParent) newIndex = oldParent.children.indexOf(this);

        // Move
        newParent.addEntity(this);

        // If desired array index was supplied, move entity to that index
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
        return this;
    }

    /** Returns top level entity that is not a world or stage */
    parentEntity(immediateOnly = false) {
        let entity = this;
        while (entity && entity.parent) {
            if (entity.parent.isStage) return entity;
            if (entity.parent.isWorld) return entity;
            entity = entity.parent;
            if (immediateOnly) {
                let validEntity = entity.isEntity;
                if (validEntity) return entity;
            }
        }
        return entity;
    }

    /** Returns parent stage (fallback to world) of an entity */
    parentStage() {
        if (this.isStage || this.isWorld) return this;
        if (this.parent && this.parent.isEntity) return this.parent.parentStage();
        return null;
    }

    /** Returns parent world of an entity */
    parentWorld() {
        if (this.isWorld) return this;
        if (this.parent && this.parent.isEntity) return this.parent.parentWorld();
        return null;
    }

    removeFromParent() {
        const parent = this.parent;
		if (parent) parent.removeEntity(this);
		return this;
    }

    /******************** COPY / CLONE */

    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
        // Remove Existing Children / Components
        this.dispose();

        // Properties
        this.name = source.name;
        // uuid???
        this.category = source.category;
        this.locked = source.locked;
        this.visible = visible;

        // Components
        for (const component of source.components) {
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            clonedComponent.tag = component.tag;
        }

        // Children
        if (recursive) {
            for (const child of source.getEntities()) {
                this.addEntity(child.clone());
            }
        }

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
            this.children[0].dispose();
        }

        this.removeFromParent();
        this.dispatchEvent({ type: 'destroy' });
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

export { Entity };
