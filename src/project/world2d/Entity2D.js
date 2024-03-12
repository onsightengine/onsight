// FLAGS
//  Object3D.userData.flagIgnore        IGNORE: Select, Focus, Transform, Rubberband, GpuPick, copy(), parentEntity(), getEntities()
//  Object3D.userData.flagHelper        IGNORE: Delete, copy(), parentEntity(), getEntities()
// DATA
//  Object3D.userData.entityID          Used for transform controls to link a transform clone with original entity
//  Object3D.userData.loadedDistance    Used for tracking removal of Entities loaded into World during App.play()

import { Entity } from '../Entity.js';

// const _m1 = new THREE.Matrix4();
// const _camPosition = new THREE.Vector3();
// const _camQuaternion = new THREE.Quaternion();
// const _camRotation = new THREE.Euler();
// const _camScale = new THREE.Vector3();
// const _lookQuaternion = new THREE.Quaternion();
// const _lookUpVector = new THREE.Vector3();
// const _objPosition = new THREE.Vector3();
// const _objScale = new THREE.Vector3();
// const _objQuaternion = new THREE.Quaternion();
// const _parentQuaternion = new THREE.Quaternion();
// const _parentQuaternionInv = new THREE.Quaternion();
// const _rotationQuaternion = new THREE.Quaternion();
// const _rotationQuaternionInv = new THREE.Quaternion();
// const _worldPosition = new THREE.Vector3();
// const _worldQuaternion = new THREE.Quaternion();
// const _worldScale = new THREE.Vector3();
// const _worldRotation = new THREE.Euler();

class Entity2D extends Entity {

    constructor(name = 'Entity') {
        // Entity
        super();
        this.name = name;

        // Prototype
        this.isEntity2D = true;
        this.type = 'Entity2D';

        // Properties, Basic
        this.locked = false;                    // locked in Editor (do not allow selection, deletion, duplication, etc.)
        this.lookAtCamera = false;              // implemented in Entity2D.updateMatrix() overload

        // Properties, Prefab
        this.category = null;                   // used for organizing

        // Collections
        this.components = [];                   // geometry, material, audio, light, etc.
    }

    /******************** OBJECTS */

    add(object) {
		if (arguments.length > 1) {
			for (let i = 0; i < arguments.length; i++) {
				this.add(arguments[i]);
			}
			return this;
		}
		if (object === this) {
			console.error(`Entity2D.add: Object can't be added as a child of itself`, object);
			return this;
		}
		if (object && object.isEntity2D) {
			if (object.parent !== null) {
				object.parent.remove(object);
			}
			object.parent = this;
			this.children.push(object);
		} else {
			console.error(`Entity2D.add: Object not an instance of Entity2D`, object);
		}
		return this;
	}

    /******************** ENTITIES */

    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity2D) return this;
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
        const entities = [];
        for (const entity of this.children) {
            if (!entity || !entity.isEntity2D) continue;
            if (entity.userData.flagIgnore) continue;
            if (entity.userData.flagHelper) continue;
            entities.push(entity);
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
            if (entity.userData.flagHelper) return;
        }
        this.remove(entity); /* entity is now out of Project */
        return entity;
    }

    /** Return 'true' in callback to stop further recursion */
    traverse(callback, recursive = true) {
		if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverse(callback, recursive);
        }
	}

    /** Return 'true' in callback to stop further recursion */
    traverseEntities(callback, recursive = true) {
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.getEntities()) {
            child.traverseEntities(callback, recursive);
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

        return this;
    }

    /** Returns parent stage (fallback to world) of an entity */
    parentStage() {
        if (this.isStage || this.isWorld) return this;
        if (this.parent && this.parent.isEntity2D) return this.parent.parentStage();
        return null;
    }

    /** Returns parent world of an entity */
    parentWorld() {
        if (this.isWorld) return this;
        if (this.parent && this.parent.isEntity2D) return this.parent.parentWorld();
        return null;
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

            // Gather Transform Data
            _rotationQuaternion.setFromEuler(this.rotation, false);
            this.matrixWorld.decompose(_worldPosition, _worldQuaternion, _worldScale);
            camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);

            // All Axis
            if (!this.lookAtYOnly) {
                // // Look at Camera Plane (i.e., Match Camera Plane)
                // if (camera.isOrthographicCamera) {
                    _lookQuaternion.copy(_camQuaternion);
                // // Look Directly at Camera
                // } else if (camera.isPerspectiveCamera) {
                //     _lookUpVector.copy(camera.up).applyQuaternion(_camQuaternion);  // Rotate up vector by cam rotation
                //     _m1.lookAt(_camPosition, _worldPosition, _lookUpVector);        // Create look at matrix
                //     _lookQuaternion.setFromRotationMatrix(_m1);
                // }
            // Y Only
            } else {
                _camRotation.set(0, Math.atan2((_camPosition.x - _worldPosition.x), (_camPosition.z - _worldPosition.z)), 0);
                _lookQuaternion.setFromEuler(_camRotation, false);
            }

            // Apply Rotations
            this.quaternion.copy(_lookQuaternion);                          // Start with rotate to camera
            this.quaternion.multiply(_rotationQuaternion);                  // Add in 'rotation' property
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

    /** Custom replacement for THREE.Object3D.attach() that accounts for Entity2D.lookAtCamera */
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
        return this;
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
        if (source.locked) this.locked = true;                  // Entity2D property (attempt to copy)
        if (source.lookAtCamera) this.lookAtCamera = true;      // Entity2D property (attempt to copy)
        if (source.lookAtYOnly) this.lookAtYOnly = true;        // Entity2D property (attempt to copy)
        this.updateMatrix();

        // Copy Children
        if (recursive) {
            for (const child of source.children) {
                if (child.userData.flagIgnore) continue;
                if (child.userData.flagHelper) continue;
                this.add(child.clone());
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

        // Entity2D Basic Properties
        this.locked = source.locked;
        this.lookAtCamera = source.lookAtCamera;
        this.lookAtYOnly = source.lookAtYOnly;
        this.bloom = source.bloom;

        // Prefab Properties
        this.category = source.category;

        // Copy Components
        for (const component of source.components) {
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            // Component Properties
            clonedComponent.tag = component.tag;
        }

        // Copy Children
        if (recursive) {
            for (const child of source.getEntities()) {
                this.add(child.cloneEntity());
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

        // User Data
        if (typeof data.userData === 'object') this.userData = structuredClone(data.userData);

        // Entity2D Properties
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

    /** Overload when inheriting Entity2D to add access to additional Entity2D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new Entity2D();
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

export { Entity2D };
