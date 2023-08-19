import * as THREE from 'three';
import { ComponentManager } from '../../app/ComponentManager.js';
import { EntityUtils } from '../../utils/three/EntityUtils.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';
import { Strings } from '../../utils/Strings.js';

// INTERNAL FLAGS
//  Object3D.userData.flagIgnore    Ignore object during focus, saving, etc. AND selection
//  Object3D.userData.flagTemp      Ignore object during focus, saving, etc.
//  Object3D.userData.entityId      Used for transform controls to link a transform clone with original entity

const _m1 = new THREE.Matrix4();
const _camPosition = new THREE.Vector3();
const _camQuaternion = new THREE.Quaternion();
const _camScale = new THREE.Vector3();
const _lookQuaternion = new THREE.Quaternion();
const _lookUpVector = new THREE.Vector3();
const _objPosition = new THREE.Vector3();
const _objScale = new THREE.Vector3();
const _objQuaternion = new THREE.Quaternion();
const _parentQuaternion = new THREE.Quaternion();
const _parentQuaternionInv = new THREE.Quaternion();
const _rotationDirection = new THREE.Euler();
const _rotationQuaternion = new THREE.Quaternion();
const _rotationQuaternionInv = new THREE.Quaternion();
const _worldPosition = new THREE.Vector3();
const _worldQuaternion = new THREE.Quaternion();
const _worldScale = new THREE.Vector3();
const _worldRotation = new THREE.Euler();

class Entity3D extends THREE.Object3D {

    constructor(name = 'Entity') {
        super();

        // Prototype
        this.isEntity = true;
        this.isEntity3D = true;
        this.type = 'Entity3D';

        // Properties, Basic
        this.name = name;
        this.category = null;                   // used for organizing prefabs
        this.isLocked = false;                  // locked in Editor (do not allow selection, deletion, duplication, etc.)
        this.lookAtCamera = false;              // implemented in updateMatrix() overload

        // Properties, Lighting
        this.castShadow = true;                 // enable shadows, inherited from THREE.Object3D
        this.receiveShadow = true;              // enable shadows, inherited from THREE.Object3D
        this.bloom = false;

        // Collections
        this.components = [];                   // geometry, material, audio, light, etc.

    } // end ctor

    /******************** INFO */

    getReducedType() {
        if (this.type !== 'Entity3D') return this.type;
        if (this.components.length === 1) return Strings.capitalize(this.components[0].type.toLowerCase());
        return this.type;
    }

    /******************** UPDATE MATRIX */

    updateMatrix() {
        // Disable callbacks
        const onRotationChange = this.rotation._onChangeCallback;
        const onQuaternionChange = this.rotation._onChangeCallback;
        this.rotation._onChange(() => {});
        this.quaternion._onChange(() => {});

        // Should look at camera?
        const camera = window.activeCamera;
        let lookAtCamera = Boolean(this.lookAtCamera && camera);
        if (lookAtCamera && this.parent && this.parent.isObject3D) {
            this.traverseAncestors((parent) => {
                if (parent.lookAtCamera) lookAtCamera = false;
            });
        }

        // Use 'rotation' Property
        if (!lookAtCamera) {
            this.quaternion.setFromEuler(this.rotation, false);

        // Look at Camera
        } else {

            // Subtract parent rotation
            if (this.parent && this.parent.isObject3D) {
                this.parent.getWorldQuaternion(_parentQuaternion, false /* ignoreBillboard */);
                _parentQuaternionInv.copy(_parentQuaternion).invert();
                this.quaternion.copy(_parentQuaternionInv);
            } else {
                this.quaternion.identity();
            }

            // // Match Camera Plane
            // if (camera.isOrthographicCamera) {

                // Gather Transform Data
                camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
                _rotationQuaternion.setFromEuler(this.rotation, false);

                // Apply Rotations
                this.quaternion.multiply(_camQuaternion);                       // Start with rotate to camera
                this.quaternion.multiply(_rotationQuaternion);                  // Add in 'rotation' property

            // // Look Directly at Camera
            // } else if (camera.isPerspectiveCamera) {

            //     // Gather Transform Data
            //     camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
            //     this.matrixWorld.decompose(_worldPosition, _worldQuaternion, _worldScale);
            //     _rotationQuaternion.setFromEuler(this.rotation, false);

            //     // // OPTION 1: Look at Camera
            //     _lookUpVector.copy(camera.up).applyQuaternion(_camQuaternion);  // Rotate up vector by cam rotation
            //     _m1.lookAt(_camPosition, _worldPosition, _lookUpVector);        // Create look at matrix
            //     _lookQuaternion.setFromRotationMatrix(_m1);

            //     // // OPTION 2: Only 'Y' Axis
            //     // _rotationDirection.set(0, 0, 0);
            //     // _rotationDirection.y = Math.atan2((_camPosition.x - _worldPosition.x), (_camPosition.z - _worldPosition.z));
            //     // _lookQuaternion.setFromEuler(_rotationDirection, false);

            //     // Apply Rotations
            //     this.quaternion.copy(_lookQuaternion);                          // Start with rotate to camera
            //     this.quaternion.multiply(_rotationQuaternion);                  // Add in 'rotation' property

            // }
        }

        ///// ORIGINAL (same as THREE.Object3D.updateMatrix())
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
        /////

        // Restore callbacks
        this.rotation._onChange(onRotationChange);
        this.quaternion._onChange(onQuaternionChange);
    }

    /** Extracts World Quaternion without rotating to camera, good for Viewport Transform Group! :) */
    getWorldQuaternion(targetQuaternion, ignoreBillboard = true) {
        let beforeBillboard = this.lookAtCamera;
        if (ignoreBillboard && beforeBillboard) {
            this.lookAtCamera = false;
        }
        this.updateWorldMatrix(true, false);
        this.matrixWorld.decompose(_objPosition, targetQuaternion, _objScale);
        if (ignoreBillboard && beforeBillboard) {
            this.lookAtCamera = true;
            this.updateWorldMatrix(true, false);
        }
        return targetQuaternion;
    }

    /** Custom replacement for THREE.Object3D.attach() that accounts for Entity3D.lookAtCamera */
    safeAttach(object) {
        if (!object || !object.isObject3D) return;
        object.getWorldQuaternion(_worldQuaternion);
        object.getWorldScale(_worldScale);
        object.getWorldPosition(_worldPosition);
        object.removeFromParent();
        object.rotation.copy(_worldRotation.setFromQuaternion(_worldQuaternion, undefined, false));
        object.scale.copy(_worldScale);
        object.position.copy(_worldPosition);
        this.attach(object);
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
            const dependencies = config.dependencies;
            for (let i = 0, len = dependencies.length; i < len; i++) {
                if (this.getComponent(dependencies[i]) === undefined) {
                    this.addComponent(dependencies[i], {}, false /* includeDependencies */);
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

    attachComponent(component) {
        this.components.push(component);
        component.detach();
        component.entity = this;
        component.init(component.toJSON());
        component.attach();
    }

    updateComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        component.update(data);
    }

    replaceComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        ComponentManager.sanitizeData(type, data);
        component.detach();
        component.init(data);
        component.attach();
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

    /** NOTE: Does not call dispose on component! */
    removeComponent(component) {
        let index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.detach();
        } else {
            console.warn(`Entity3D.removeComponent: Component ${component.uuid}, type '${component.type}' not found`);
        }
        return component;
    }

    rebuildComponents() {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            component.detach();
            component.init(component.toJSON());
            component.attach();
        }
    }

    traverseComponents(callback) {
        for (let i = 0; i < this.components.length; i++) {
            callback(this.components[i]);
        }
    }

    /******************** PARENT */

    changeParent(newParent = undefined, newIndex = -1) {
        if (!newParent) newParent = this.parent;
        if (!newParent || !newParent.isObject3D) return;

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

    /******************** CHILDREN */

    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity3D) return this;
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
        for (const child of this.children) {
            if (child.isEntity3D) {
                if (child.userData.flagIgnore) continue;
                if (child.userData.flagTemp) continue;
                filteredChildren.push(child);
            }
        }
        return filteredChildren;
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
        if (!forceDelete && EntityUtils.isImportant(entity)) return; /* locked? temp? */

        // Remove entity (i.e. out of Project)
        this.remove(entity);
    }

    /** Return true in callback to stop further recursion */
    traverseEntities(callback, recursive = true) {
        const cancel = (typeof callback === 'function') ? callback(this) : false;

        if (recursive && cancel !== true) {
            for (const child of this.getEntities()) {
                child.traverseEntities(callback);
            }
        }
    }

    /******************** COPY / CLONE */

    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
        // THREE.Object3D.copy()
        super.copy(source, false /* recursive */);

        // Override copy of transform, update 'matrix'
        this.position.copy(source.position);
        this.rotation.copy(source.rotation);
        this.scale.copy(source.scale);
        this.isLocked = source.isLocked;                // Entity3D property, attempt to copy
        this.lookAtCamera = source.lookAtCamera;        // Entity3D property, attempt to copy
        this.updateMatrix();

        // Copy Children
        if (recursive) {
            for (let i = 0; i < source.children.length; i++) {
                const clone = source.children[i].clone();
                this.add(clone);
            }
        }

        return this;
    }

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Remove Existing Children / Components
        this.dispose();

        // Standard Object3D Copy
        this.copy(source, false /* recursive */);

        // Entity3D Basic Properties
        this.name = source.name;
        this.category = source.category;
        this.isLocked = source.isLocked;
        this.lookAtCamera = source.lookAtCamera;

        // Entity3D Lighting Properties
        this.bloom = source.bloom;

        // Copy Components
        for (const component of source.components) {
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            // Copy Component Properties
            clonedComponent.tag = component.tag;
        }

        // Copy Children
        if (recursive) {
            for (const child of source.getEntities()) {
                this.add(child.cloneEntity(recursive));
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
            ObjectUtils.clearObject(this.children[0], true /* removeFromParent */);
        }

        this.dispatchEvent({ type: 'destroy' });
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Object3D Properties
        ObjectUtils.fromJSON(json, this);

        // Entity3D Properties
        if (data.name !== undefined) this.name = data.name;
        if (data.category !== undefined) this.category = data.category;
        if (data.isLocked !== undefined) this.isLocked = data.isLocked;
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.bloom !== undefined) this.bloom = data.bloom;

        // Components
        for (const componentData of json.object.components) {
            if (componentData && componentData.base && componentData.base.type) {
                const component = this.addComponent(componentData.base.type, componentData, false);
                // Properties
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
        json.object.matrixAutoUpdate = this.matrixAutoUpdate;
        json.object.layers = this.layers.mask;

        if (this.visible === false) json.object.visible = false;
        if (this.frustumCulled === false) json.object.frustumCulled = false;
        if (this.renderOrder !== 0) json.object.renderOrder = this.renderOrder;
        if (JSON.stringify(this.userData) !== '{}') {
            json.object.userData = (typeof structuredClone === 'function') ? structuredClone(this.userData) : JSON.parse(JSON.stringify(this.userData));
        }

        // Entity3D Basic Properties
        json.object.category = this.category;
        json.object.isLocked = this.isLocked;
        json.object.lookAtCamera = this.lookAtCamera;

        // Entity3D Lighting Properties
        json.object.bloom = this.bloom;

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
