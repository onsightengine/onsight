/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Object3D.userData
//      Flags
//          userData.flagLocked         Locked in Editor (do not allow selection, deletion, or duplication)
//
//      Internal
//          userData.entityId           Used for transform controls to link a transform clone with original entity
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { ENTITY_FLAGS } from '../../constants.js';

import { ComponentManager } from '../../app/ComponentManager.js';
import { EntityUtils } from '../../three/utils/EntityUtils.js';
import { Object3D } from './Object3D.js';
import { Strings } from '../../core/Strings.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Entity3D
/////////////////////////////////////////////////////////////////////////////////////

class Entity3D extends Object3D {

    constructor(name = '') {
        super();

        // Prototype
        this.isEntity = true;
        this.isEntity3D = true;

        // Properties, Basic
        this.name = name;
        this.type = 'Entity3D';

        // Properties, More
        this.enabled = true;
        this.castShadow = true;                 // inherited from THREE.Object3D
        this.receiveShadow = true;              // inherited from THREE.Object3D
        this.lookAtCamera = false;              // implemented in ONE.Object3D.updateMatrix overload

        // Collections
        this.components = [];                   // Geometry, material, audio, light, etc.

        // Flags
        this.setFlag(ENTITY_FLAGS.LOCKED, false);

    } // end ctor

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Info
    ////////////////////

    getReducedType() {
        if (this.isScene) return 'Scene';
        return (this.components.length === 1) ? Strings.capitalize(this.components[0].type.toLowerCase()) : 'Entity3D';
    }

    getFlag(flag) {
        return Boolean(this.userData[flag]);
    }

    setFlag(flag, value) {
        this.userData[flag] = value;
        return this;
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Components
    ////////////////////

    /** Adds component of 'type' using 'data' object */
    addComponent(type, data = {}, includeDependencies = true) {
        const ComponentClass = ComponentManager.registered(type);
        if (ComponentClass === undefined) return undefined;

        // Config
        const config = ComponentClass.config;

        // Create new component if 'multiple' allowed, or doesn't have component
        let component = this.getComponent(type);
        if (ComponentClass.config.multiple || component === undefined) {
            component = new ComponentClass();
            this.components.push(component);

        // Otherwise overwrite existing component of type
        } else {
            component.disable();
        }

        // Check for and add Dependent Components
        if (config.dependencies && includeDependencies) {
            const dependencies = config.dependencies;
            for (let i = 0, len = dependencies.length; i < len; i++) {
                if (this.getComponent(dependencies[i]) === undefined) {
                    this.addComponent(dependencies[i], {}, false);
                }
            }
        }

        // Initialize Component
        component.entity = this;
        ComponentManager.sanitizeData(type, data);
        if (component.init) component.init(data);
        if (this.enabled) component.enable();

        // Return reference to newly added component
        return component;
    }

    /** Get component by type (string, required) and tag (string, optional - in case of multiple components with type) */
    getComponent(type, tag /* optional */) {
        if (tag === undefined) return this.getComponentByProperty('type', type);
        let components = this.getComponentsWithProperties('type', type, 'tag', tag);
        if (components.length > 0) return components[0];
        return undefined;
    }

    getComponentByTag(tag) {
        return this.getComponentByProperty('tag', tag);
    }

    getComponentByType(type) {
        return this.getComponentByProperty('type', type);
    }

    /** Returns first component found with property === value */
    getComponentByProperty(property, value) {
        for (let i = 0, l = this.components.length; i < l; i++) {
            const component = this.components[i];
            if (component[property] === value) return component;
        }
        return undefined;
    }

    /** Returns all components that match all key, value pairs */
    getComponentsWithProperties(/* key, value, key, value, etc. */) {
        let components = [];
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];

            let hasProperties = true;
            for (let j = 0; j < arguments.length; j += 2) {
                if (component[arguments[j]] !== arguments[j+1]) {
                    hasProperties = false;
                    break;
                }
            }
            if (hasProperties) components.push(component);
        }
        return components;
    }

    removeComponent(component) {
        let index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.disable();
            component.dispose();
        } else {
            console.warn(`Entity3D.removeComponent: Component ${component.uuid}, type '${component.type}' not found`);
        }
        return component;
    }

    rebuildComponents() {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            component.disable();
            component.init(component.toJSON());
            component.enable();
        }
    }

    traverseComponents(callback) {
        for (let i = 0; i < this.components.length; i++) {
            callback(this.components[i]);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Parent
    ////////////////////

    changeParent(newParent = undefined, newIndex = -1) {
        if (! newParent) newParent = this.parent;
        if (! newParent || ! newParent.isObject3D) return;

        // Check if we have a parent
        const oldParent = this.parent;
        if (newIndex === -1 && oldParent) newIndex = oldParent.children.indexOf(this);

        // // MOVE
        // newParent.add(this);
        // // OR
        // newParent.attach(this);
        // // OR
        newParent.safeAttach(this);

        // If desired array index was supplied, move entity to that index
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Children
    ////////////////////

    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (! entity || ! entity.isObject3D) return this;
        if (index === undefined || index === null) index = -1;

        // Check if already a child
        if (this.children.indexOf(entity) !== -1) return this;

        // Add Entity
        if (maintainWorldTransform && entity.parent) {
            this.attach(entity)
        } else {
            this.add(entity);
        }

        // Preserve desired index
        if (index !== -1) {
            this.children.splice(index, 0, entity);
            this.children.pop();
        }

        return this;
    }

    getEntities() {
        const filteredChildren = [];
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].isEntity3D) filteredChildren.push(children[i]);
        }
        return filteredChildren;
    }

    getEntityById(id) {
        return this.getEntityByProperty('id', id);
    }

    getEntityByName(name) {
        return this.getEntityByProperty('name', name);
    }

    getEntityByUuid(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }

    getEntityByProperty(name, value) {
        if (this[name] === value) return this;
        const entities = this.getEntities();
        for (let i = 0, l = entities.length; i < l; i++) {
            const child = entities[i];
            const entity = child.getEntityByProperty(name, value);
            if (entity) return entity;
        }
        return undefined;
    }

    /** Removes entity, does not call 'dispose()' on Entity!! */
    removeEntity(entity, forceDelete = false) {
        if (! entity) return;

        // Check for isScene, flags (BuiltIn, NoSelect, etc.)
        if (! forceDelete && EntityUtils.isImportant(entity)) return;

        // Remove entity (i.e. out of Project)
        this.remove(entity);
    }

    traverseEntities(callback, recursive = true) {
        callback(this);

        if (recursive) {
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                if (child.isEntity3D) child.traverseEntities(callback);
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Copy / Clone
    ////////////////////

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {

        // Remove Existing Children / Components
        this.dispose();

        // Backend THREE.Object3D.copy()
        super.copy(source, false);

        // Copy Properties, Basic
        this.name = source.name;

        // Copy Properties, More
        this.enabled = source.enabled;
        this.castShadow = source.castShadow;
        this.receiveShadow = source.receiveShadow;
        this.lookAtCamera = source.lookAtCamera;

        // Copy Flags
        for (let flag in ENTITY_FLAGS) {
            this.setFlag(ENTITY_FLAGS[flag], source.getFlag(ENTITY_FLAGS[flag]));
        }

        // Copy Components
        const components = source.components;
        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            // Add Component Clone
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);

            // Copy Component Properties
            clonedComponent.tag = component.tag;
            if (component.enabled !== true) clonedComponent.disable();
        }

        // Copy Children
        if (recursive === true) {
            const entities = source.getEntities();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                this.add(entity.cloneEntity(true));
            }
        }

        return this;
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   dispose
    ////////////////////

    dispose() {
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.removeEntity(child, true);
            if (child.dispose) child.dispose();
        }

        while (this.components.length > 0) {
            const component = this.components[0];
            this.removeComponent(component);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   JSON
    ////////////////////

    fromJSON(json) {
        const data = json.object;

        ///// Entity3D Properties

        this.uuid = data.uuid;
        if (data.name !== undefined) this.name = data.name;

        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.castShadow !== undefined) this.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) this.receiveShadow = data.receiveShadow;
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;

        ///// Object3D Properties

        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);

        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
        if (data.layers !== undefined) this.layers.mask = data.layers;

        if (data.visible !== undefined) this.visible = data.visible;
        if (data.frustumCulled !== undefined) this.frustumCulled = data.frustumCulled;
        if (data.renderOrder !== undefined) this.renderOrder = data.renderOrder;
        if (data.userData !== undefined) this.userData = data.userData;

        ///// Flags

        for (let key in json.object.flags) {
            this.setFlag(key, json.object.flags[key]);
        }

        ///// Components

        for (let i = 0; i < json.object.components.length; i++) {
            const componentData = json.object.components[i];

            // Add Component
            if (componentData && componentData.base && componentData.base.type) {
                const component = this.addComponent(componentData.base.type, componentData, false);

                // Properties
                if (componentData.enabled === false) component.disable();
                component.tag = componentData.base.tag;
            }
        }

        ///// Children

        if (data.entities !== undefined) {
            for (let i = 0; i < json.object.entities.length; i++) {
                const entity = new Entity3D().fromJSON(json.object.entities[i]);
                this.add(entity);
            }
        }

        this.updateMatrix();

        return this;
    }

    /** Coverts Entity to JSON, NOTE: Any NON-entity children (Object3D only) are NOT included! */
    toJSON() {
        const json = {
            object: {
                name: this.name,
                type: this.type,
                uuid: this.uuid,

                components: [],
                flags: {},
            }
        };

        // Flags
        for (let key in ENTITY_FLAGS) {
            json.object.flags[key] = this.getFlag(key);
        }

        ///// Components

        for (let i = 0; i < this.components.length; i++) {
            json.object.components.push(this.components[i].toJSON());
        }

        ///// Entity3D Properties

        json.object.enabled = this.enabled;
        json.object.castShadow = this.castShadow;
        json.object.receiveShadow = this.receiveShadow;
        json.object.lookAtCamera = this.lookAtCamera;

        ///// Object3D Properties

        json.object.position  = this.position.toArray();
        json.object.rotation = this.rotation.toArray();
        json.object.scale = this.scale.toArray();

        json.object.matrixAutoUpdate = this.matrixAutoUpdate;
        json.object.layers = this.layers.mask;

        if (this.visible === false) json.object.visible = false;
        if (this.frustumCulled === false) json.object.frustumCulled = false;
        if (this.renderOrder !== 0) json.object.renderOrder = this.renderOrder;
        if (JSON.stringify(this.userData) !== '{}') json.object.userData = this.userData;

        ///// Child Entities

        const childEntities = this.getEntities();
        if (childEntities.length > 0) {
            json.object.entities = [];
            for (let i = 0; i < childEntities.length; i++) {
                json.object.entities.push(childEntities[i].toJSON());
            }
        }

        return json;
    }

}

/////////////////////////////////////////////////////////////////////////////////////
/////   Exports
/////////////////////////////////////////////////////////////////////////////////////

export { Entity3D };
