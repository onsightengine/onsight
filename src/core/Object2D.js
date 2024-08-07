// COORDINATE SYSTEM
// -x    Ʌ     +y
//       |
// <-----+------>
//       |
// -y    V     +x

import {
    MOUSE_SLOP,
} from '../constants.js';
import { Box2 } from '../math/Box2.js';
import { MathUtils } from '../utils/MathUtils.js';
import { Matrix2 } from '../math/Matrix2.js';
import { Pointer } from './input/Pointer.js';
import { Thing } from './Thing.js';
import { Vector2 } from '../math/Vector2.js';

const _position = new Vector2();
const _corner1 = new Vector2();
const _corner2 = new Vector2();
const _corner3 = new Vector2();
const _corner4 = new Vector2();

class Object2D extends Thing {

    constructor(name = 'Object') {
        super(name);
        this.type = 'Object2D';

        // Hierarchy
        this.children = [];
        this.parent = null;

        // Visibility
        this.visible = true;
        this.opacity = 1;
        this.layer = 0;                             // lower layer is drawn first, higher is drawn on top
        this.level = 0;                             // AUTO: scene tree depth, higher drawn on top
        this.globalOpacity = 1;                     // AUTO: final opacity including parent(s)

        // Transform
        this.position = new Vector2(0, 0);          // position in space
        this.scale = new Vector2(1, 1);             // scale in space
        this.rotation = 0.0;                        // rotation in space

        // Matrix
        this.matrix = new Matrix2();                // AUTO: local transform matrix (pos + scale + rot)
        this.globalMatrix = new Matrix2();          // AUTO: final transform matrix including parent(s)
        this.inverseGlobalMatrix = new Matrix2();   // AUTO: final inverse matrix including parent(s)
        this.matrixAutoUpdate = true;               // FLAG: object matrix should be updated every frame?
        this.matrixNeedsUpdate = true;              // FLAG: object matrix needs to be recalculated!
        this.lateUpdate = false;                    // FLAG: object wants to be updated last?

        // Bounding Box
        this.boundingBox = new Box2();              // used for scene interactions

        // Masks
        this.masks = [];

        // Pointer Events
        this.pointerEvents = true;                  // better performance if pointer events are not required
        this.draggable = true;                      // process drag events?
        this.focusable = true;                      // double click to focus?
        this.selectable = true;                     // can be selected?

        // INTERNAL (DO NOT SET MANUALLY)
        this.pointerInside = false;                 // pointer is inside of the element?
        this.inViewport = true;                     // object within viewport frustum?
        this.isSelected = false;                    // object is selected?
        this.isDragging = false;                    // object is being dragged?
    }

    /******************** CHILDREN */

    add(...objects) {
        if (!objects) return this;
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            if (!object || !object.uuid) continue;
            const index = this.children.indexOf(object);
            if (index === -1) {
                if (object.parent) object.parent.remove(object);
                this.children.push(object);
                object.parent = this;
                object.level = this.level + 1;
                object.computeBoundingBox();
                object.traverse(function(child) {
                    if (typeof child.onAdd === 'function') child.onAdd(this);
                    child.matrixNeedsUpdate = true;
                });
            }
        }
        return this;
    }

    remove(...objects) {
        if (!objects) return this;
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            if (!object || !object.uuid) continue;
            const index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
                object.level = 0;
                object.traverse(function(child) {
                    if (typeof child.onRemove === 'function') child.onRemove(this);
                    child.matrixNeedsUpdate = true;
                });
            }
        }
        return this;
    }

    removeFromParent() {
		const parent = this.parent;
		if (parent) parent.remove(this);
		return this;
	}

    getChildByUUID(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }

    /** Recursively searches for a child Entity */
    getChildByProperty(property, value) {
        if (this[property] === value) return this;
        for (const child of this.children) {
            const object = child.getChildByProperty(property, value);
            if (object) return object;
        }
        return undefined;
    }

    /** Traverse an object and it's children, recursively. Return 'true' in callback to stop traversing. */
    traverse(callback) {
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverse(callback)) return true;
        }
        return false;
    }

    /** Traverse visible objects, recursively. Return 'true' in callback to stop traversing. */
    traverseVisible(callback) {
        if (!this.visible) return false;
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverseVisible(callback)) return true;
        }
        return false;
    }

    /** Traverse an objects parents, recursively. Return 'true' in callback to stop traversing. */
    traverseAncestors(callback) {
		const parent = this.parent;
        if (!parent) return false;
		if (typeof callback === 'function' && callback(parent)) return true;
		return parent.traverseAncestors(callback);
	}

    /******************** DESTROY */

    clear() {
        return this.remove(...this.children);
    }

    destroy() {
        this.clear();
        this.removeFromParent();
        return this;
    }

    /******************** BOUNDING BOX */

    computeBoundingBox(renderer) {
        //
        // OVERLOAD
        //
        return this.boundingBox;
    }

    /** Check if a point (in local object coordinates) is inside of the object */
    isInside(point, recursive = true) {
        if (recursive) {
            for (const child of this.children) {
                if (child.isInside(point, true)) return true;
            }
        }
        return false;
    }

    /** Returns list of the objects (object and it's children) intersected by a point in world coordinates */
    getWorldPointIntersections(worldPoint) {
        const objects = [];
        this.traverseVisible((child) => {
            const localPoint = child.worldToLocal(worldPoint);
            if (child.isInside(localPoint)) objects.push(child);
        });
        objects.sort((a, b) => {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });
        return objects;
    }

    getWorldBoundingBox(recursive = true) {
        const worldBox = new Box2();
        function objectWorldBox(object) {
            const box = object.boundingBox;
            if (Number.isFinite(box.min.x) === false || Number.isFinite(box.min.y) === false) return box;
            if (Number.isFinite(box.max.x) === false || Number.isFinite(box.max.y) === false) return box;
            object.globalMatrix.applyToVector(_corner1.copy(box.min.x, box.min.y));
            object.globalMatrix.applyToVector(_corner2.copy(box.min.x, box.max.y));
            object.globalMatrix.applyToVector(_corner3.copy(box.max.x, box.min.y));
            object.globalMatrix.applyToVector(_corner4.copy(box.max.x, box.max.y));
            return new Box2().setFromPoints(_corner1, _corner2, _corner3, _corner4);
        }
        worldBox.union(objectWorldBox(this));
        if (recursive) {
            for (const child of this.children) {
                worldBox.union(child.getWorldBoundingBox(true));
            }
        }
        return worldBox;
    }

    totalBoundingBox(recursive = true) {
        const totalBox = this.boundingBox.clone();
        if (recursive) {
            for (const child of this.children) {
                const box = child.boundingBox.clone();
                if (Number.isFinite(box.min.x) &&
                    Number.isFinite(box.min.y) &&
                    Number.isFinite(box.max.x) &&
                    Number.isFinite(box.max.y)
                ) {
                    box.translate(child.position.x, child.position.y);
                    totalBox.union(box);
                }
            }
        }
        return totalBox;
    }

    localToWorld(vector) {
        return this.globalMatrix.transformPoint(vector);
    }

    worldToLocal(vector) {
        return this.inverseGlobalMatrix.transformPoint(vector);
    }

    /******************** POSITION */

    applyMatrix(matrix) {
        this.updateMatrix(true);
        this.matrix.premultiply(matrix);
        this.matrix.getPosition(this.position);
        this.rotation = this.matrix.getRotation();
        this.matrix.getScale(this.scale);
        this.updateMatrix(true);
        return this;
    }

    attach(object) {
        if (!object || !object.uuid) return this;
        if (this.children.indexOf(object) !== -1) return this;
        const oldParent = object.parent;
        // Current global matrix, remove from parent
        this.updateMatrix(true);
        const m1 = new Matrix2().copy(this.inverseGlobalMatrix);
        if (oldParent) {
            oldParent.updateMatrix(true);
            m1.multiply(oldParent.globalMatrix);
        }
        // Apply the matrix transformation to the object
        object.applyMatrix(m1);
        object.removeFromParent();
        // Add to self
        this.children.push(object);
        object.parent = this;
        object.level = this.level + 1;
        object.traverse(function(child) {
            if (typeof child.onAdd === 'function') child.onAdd(this);
            child.matrixNeedsUpdate = true;
        });
        return this;
    }

    getWorldPosition() {
        this.updateMatrix(true);
        return this.globalMatrix.getPosition();
    }

    getWorldRotation() {
        this.updateMatrix(true);
        return this.globalMatrix.getRotation();
    }

    getWorldScale() {
        this.updateMatrix(true);
        return this.globalMatrix.getScale();
    }

    setPosition(x, y) {
        this.position.copy(x, y);
        this.updateMatrix(true);
        return this;
    }

    setRotation(rad) {
        this.rotation = rad;
        this.updateMatrix(true);
        return this;
    }

    setScale(x, y) {
        this.scale.copy(x, y);
        this.updateMatrix(true);
        return this;
    }

    /** Update the transformation matrix of the object */
    updateMatrix(force = false) {
        if (force || this.matrixAutoUpdate || this.matrixNeedsUpdate) {
            this.globalOpacity = this.opacity * ((this.parent) ? this.parent.globalOpacity : 1);
            this.scale.x = MathUtils.noZero(MathUtils.sanity(this.scale.x));
            this.scale.y = MathUtils.noZero(MathUtils.sanity(this.scale.y));
            this.matrix.compose(this.position.x, this.position.y, this.scale.x, this.scale.y, this.rotation);
            this.globalMatrix.copy(this.matrix);
            const parent = this.ghostParent ?? this.parent;
            if (parent) this.globalMatrix.premultiply(parent.globalMatrix);
            this.globalMatrix.getInverse(this.inverseGlobalMatrix);
            this.matrixNeedsUpdate = false;
        }
    }

    /******************** RENDERING */

    /**
     *
     * Overloadable Render Loop Functions (called in this order):
     *
     *      transform(renderer)
     *      style(renderer)
     *      draw(renderer)
     */

    /** Apply the transform to the rendering context (camera transform is already applied) */
    transform(renderer) {
        this.globalMatrix.transformContext(renderer.context);
    }

    /******************** EVENTS */

    /**
     *
     * OVERLOAD HIERARCHY
     *
     *      onAdd(parent)           // parent is object added to
     *      onRemove(parent)        // parent is object removed from
     *
     * OVERLOAD UPDATE
     *
     *      onUpdate(renderer)
     *
     * OVERLOAD POINTER
     *
     *      onPointerDrag(renderer)
     *      onPointerDragStart(renderer)
     *      onPointerDragEnd(renderer)
     *      onPointerEnter(renderer)
     *      onPointerLeave(renderer)
     *      onPointerOver(renderer)
     *      onButtonPressed(renderer)
     *      onDoubleClick(renderer)
     *      onButtonDown(renderer)
     *      onButtonUp(renderer)
     *
     */

    /** Object is being dragged, default adds delta to object position (follows mouse movement) */
    onPointerDrag(renderer) {
        const pointer = renderer.pointer;
        const camera = renderer.camera;

        // Button Just Pressed?
        if (pointer.buttonJustPressed(Pointer.LEFT) || !this.pointerStartPosition || !this.dragStartPosition) {
            this.pointerStartPosition = pointer.position.clone();
            this.dragStartPosition = this.position.clone();
        }

        // Pointer Start / End
        const pointerStart = this.pointerStartPosition.clone();
        const pointerEnd = pointer.position.clone();

        // Adjust Position
        if (pointer.buttonPressed(Pointer.LEFT)) {
            const manhattanDistance = pointerStart.manhattanDistanceTo(pointerEnd);
            if (manhattanDistance >= MOUSE_SLOP || this.isDragging) {
                // Mark as Dragging
                this.isDragging = true;

                // Local (Parent Space) Start / End
                const parent = this.ghostParent ?? this.parent ?? this;
                const worldPositionStart = renderer.screenToWorld(pointerStart);
                const localPositionStart = parent.inverseGlobalMatrix.transformPoint(worldPositionStart);
                const worldPositionEnd = renderer.screenToWorld(pointerEnd);
                const localPositionEnd = parent.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                const delta = localPositionStart.clone().sub(localPositionEnd);

                // Update Position
                _position.copy(this.dragStartPosition).sub(delta);
                this.position.copy(_position);
                this.matrixNeedsUpdate = true;
            }
        }
    }


    /******************** COPY */

    copy(source, recursive = true) {
        super.copy(source, recursive);

        // Properties
        this.visible = source.visible;
        this.opacity = source.opacity;
        this.layer = source.layer;

        // Transform
        this.position.copy(source.position);
        this.scale.copy(source.scale);
        this.rotation = source.rotation;
        this.matrixAutoUpdate = source.matrixAutoUpdate;
        this.lateUpdate = source.lateUpdate;

        // Pointer Events
        this.pointerEvents = source.pointerEvents;
        this.draggable = source.draggable;
        this.focusable = source.focusable;
        this.selectable = source.selectable;

        // Masks
        if (recursive && Array.isArray(source.masks)) {
            for (const mask of source.masks) {
                this.masks.push(mask.clone());
            }
        }

        // Children
        if (recursive && Array.isArray(source.children)) {
            for (const child of source.children) {
                this.add(child.clone());
            }
        }
        return this;
    }

    /******************** JSON */

    toJSON(recursive = true) {
        const data = super.toJSON(recursive);

        // Properties
        data.visible = this.visible;
        data.opacity = this.opacity;
        data.layer = this.layer;

        // Transform
        data.position = this.position.toArray();
        data.scale = this.scale.toArray();
        data.rotation = this.rotation;
        data.matrixAutoUpdate = this.matrixAutoUpdate;
        data.lateUpdate = this.lateUpdate;

        // Pointer Events
        data.pointerEvents = this.pointerEvents;
        data.draggable = this.draggable;
        data.focusable = this.focusable;
        data.selectable = this.selectable;

        // Masks
        data.masks = [];
        for (const mask of this.masks) {
            data.masks.push(mask.toJSON(recursive));
        }

        // Children
        if (recursive) {
            for (const child of this.children) {
                data.children.push(child.toJSON(recursive));
            }
        }
        return data;
    }

    fromJSON(data) {
        super.fromJSON(data);

        // Properties
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.opacity !== undefined) this.opacity = data.opacity;
        if (data.layer !== undefined) this.layer = data.layer;

        // Transform
        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);
        if (data.rotation !== undefined) this.rotation = data.rotation;
        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
        if (data.lateUpdate !== undefined) this.lateUpdate = data.lateUpdate;

        // Pointer Events
        if (data.pointerEvents !== undefined) this.pointerEvents = data.pointerEvents;
        if (data.draggable !== undefined) this.draggable = data.draggable;
        if (data.focusable !== undefined) this.focusable = data.focusable;
        if (data.selectable !== undefined) this.selectable = data.selectable;

        // Masks
        if (data.masks) {
            for (const maskData of data.masks) {
                const Constructor = Thing.type(maskData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(maskData);
                    this.masks.push(child);
                } else {
                    console.warn(`Object2D.fromJSON(): Unknown mask type '${maskData.type}'`);
                }
            }
        }

        // Children
        if (data.children) {
            for (const childData of data.children) {
                const Constructor = Thing.type(childData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(childData);
                    this.add(child);
                } else {
                    console.warn(`Object2D.fromJSON(): Unknown child type '${childData.type}'`);
                }
            }
        }
        return this;
    }

}

Thing.register('Object2D', Object2D);

export { Object2D };
