import { Maths } from '../utils/Maths.js';

import { Euler } from '../math/Euler.js';
import { Mat4 } from '../math/Mat4.js';
import { Quat } from '../math/Quat.js';
import { Vec3 } from '../math/Vec3.js';

let _idGenerator = 1;

class Transform {

    constructor(name = 'Transform') {
        // Prototype
        this.isTransform = true;
        this.type = 'Transform';

        // Basic
        this.name = name;
        this.uuid = Maths.uuid();
        this.id = _idGenerator++;

        // Hierarchy
        this.parent = null;

        // Properties
        this.locked = false;                    // locked in Editor? (do not allow selection, deletion, duplication, etc.)
        this.visible = true;

        // Transform
        this.matrix = new Mat4();
        this.worldMatrix = new Mat4();
        this.matrixAutoUpdate = true;

        this.position = new Vec3();
        this.quaternion = new Quat();
        this.scale = new Vec3(1);
        this.rotation = new Euler();
        this.up = new Vec3(0, 1, 0);

        this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation);
        this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion);
    }

    /******************** PARENT */

    /** Returns top level entity that is not a world or stage */
    parentEntity(immediateOnly = false) {
        let entity = this;
        while (entity && entity.parent) {
            if (entity.parent.isStage) return entity;
            if (entity.parent.isWorld) return entity;
            entity = entity.parent;
            if (immediateOnly && entity.isEntity) return entity;
        }
        return entity;
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

    setParent(newParent = undefined, newIndex = -1) {
        if (!newParent || !newParent.isEntity) return this;
        if (this.parent && newParent === this.parent) return this;

        // Move
        newParent.addChild(this);

        // If desired array index was supplied, move entity to that index
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
        return this;
    }

    traverseAncestors(callback) {
        if (!this.parent) return;
        callback(this.parent);
        this.parent.traverseAncestors(callback);
    }

    /******************** HIERARCHY */

    traverse(callback) {
        if (callback(this)) return;
    }

    traverseVisible(callback) {
        if (!this.visible) return;
        callback(this);
    }

    /******************** MATRIX */

    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent === null) this.worldMatrix.copy(this.matrix);
            else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }
        return this;
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
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
        return new this.constructor().copy(this);
    }

    copy(source, recursive = true) {
        // Properties
        this.name = source.name;
        this.locked = source.locked;
        this.visible = source.visible;

        // Transform
        this.matrix.copy(source.matrix);
        this.worldMatrix.copy(source.worldMatrix);
        this.matrixAutoUpdate = source.matrixAutoUpdate;

        this.position.copy(source.position);
        this.quaternion.copy(source.quaternion);
        this.scale.copy(source.scale);
        this.rotation.copy(source.rotation);
        this.rotation.order = source.rotation.order;
        this.up.copy(source.up);

        return this;
    }

    /******************** DISPOSE */

    dispose() {

    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Transform Properties
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.locked !== undefined) this.locked = data.locked;
        if (data.visible !== undefined) this.visible = data.visible;

        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.quaternion !== undefined) this.quaternion.fromArray(data.quaternion);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);
        if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        if (data.up !== undefined) this.up.fromArray(data.up);





        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;



    }

}

export { Transform };
