// COORDINATE SYSTEM
// -x    Ʌ     -y
//       |
// <-----+------>
//       |
//  y    V      x

import { Box2 } from '../math/Box2.js';
import { MathUtils } from '../utils/MathUtils.js';
import { Matrix2 } from '../math/Matrix2.js';
import { Pointer } from '../input/Pointer.js';
import { Vector2 } from '../math/Vector2.js';

class Object2D {

    constructor() {
        this.type = 'Object2D';
        this.uuid = MathUtils.randomUUID();

        // Hierarchy
        this.children = [];
        this.parent = null;

        // Visibility
        this.visible = true;
        this.layer = 0;                             // lower layer is drawn first, higher is drawn on top
        this.level = 0;                             // higher depth is drawn on top, layer is considered first
        this.opacity = 1;
        this.globalOpacity = 1;

        // Transform
        this.position = new Vector2(0, 0);
        this.scale = new Vector2(1, 1);
        this.rotation = 0.0;
        this.origin = new Vector2(0, 0);            // point of rotation

        // Matrix
        this.matrix = new Matrix2();
        this.globalMatrix = new Matrix2();
        this.inverseGlobalMatrix = new Matrix2();
        this.matrixAutoUpdate = true;
        this.matrixNeedsUpdate = true;

        // Bounding Box
        this.boundingBox = new Box2();

        // Masks
        this.masks = [];

        // Pointer Events
        this.pointerEvents = true;                  // better performance if pointer events are not required
        this.draggable = false;
        this.focusable = true;
        this.selectable = true;

        // INTERNAL
        this.pointerInside = false;                 // pointer is inside of the element?
        this.inViewport = true;                     // object within viewport frustum?
        this.isSelected = false;                    // object is selected?
    }

    /******************** CHILDREN */

    add(...objects) {
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            const index = this.children.indexOf(object);
            if (index === -1) {
                object.parent = this;
                object.level = this.level + 1;
                object.traverse(function(child) {
                    if (typeof child.onAdd === 'function') child.onAdd(this);
                });
                this.children.push(object);
            }
        }
        return this;
    }

    remove(object) {
        const index = this.children.indexOf(object);
        if (index === -1) return undefined;
        const child = this.children[index];
        child.parent = null;
        child.level = 0;
        child.traverse(function(child) {
            if (typeof child.onRemove === 'function') child.onRemove(this);
        });
        this.children.splice(index, 1);
        return child;
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

    /** Traverse an object and it's children, recursively. Return 'true 'in callback to stop traversing. */
    traverse(callback) {
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverse(callback)) return true;
        }
        return false;
    }

    /******************** DESTROY */

    destroy() {
        if (this.parent) this.parent.remove(this); // remove from parent
    }

    /******************** BOUNDING BOX */

    /** Recomputes bounding box of object */
    computeBoundingBox() {
        //
        // OVERLOAD
        //
        return this.boundingBox;
    }

    /** Check if a point is inside of the object (point is in local object coordinates) */
    isInside(point) {
        //
        // OVERLOAD
        //
        return false;
    }

    /** Check if a point in world coordinates intersects this object or some of its children */
    isWorldPointInside(worldPoint, recursive = false) {
        // Pointer Position in local object coordinates
        const localPoint = this.inverseGlobalMatrix.transformPoint(worldPoint);
        if (this.isInside(localPoint)) return true;
        // Recurse
        if (recursive) {
            for (const child of this.children) {
                if (child.isWorldPointInside(worldPoint, true)) return true;
            }
        }
        return false;
    }

    /** Returns list of the objects (object and it's children) intersected by a point in world coordinates */
    getWorldPointIntersections(worldPoint, list = []) {
        // Pointer Position in local object coordinates
        list = Array.isArray(list) ? list : [];
        const localPoint = this.inverseGlobalMatrix.transformPoint(worldPoint);
        if (this.isInside(localPoint)) list.push(this);
        // Recurse
        for (const child of this.children) child.getWorldPointIntersections(worldPoint, list);
        return list;
    }

    getWorldBoundingBox() {
        const box = this.boundingBox;
        const topLeftWorld = this.globalMatrix.transformPoint(box.min);
        const topRightWorld = this.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
        const bottomLeftWorld = this.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
        const bottomRightWorld = this.globalMatrix.transformPoint(box.max);
        return new Box2().setFromPoints(topLeftWorld, topRightWorld, bottomLeftWorld, bottomRightWorld);
    }

    /******************** POSITION */

    setPosition(x, y) {
        if (typeof x === 'object' && x.x && x.y) this.position.copy(x);
        else this.position.set(x, y);
        return this;
    }

    /** Update the transformation matrix of the object */
    updateMatrix(force = false) {
        if (force || this.matrixAutoUpdate || this.matrixNeedsUpdate) {
            this.globalOpacity = this.opacity * ((this.parent) ? this.parent.globalOpacity : 1);
            this.matrix.compose(this.position.x, this.position.y, this.scale.x, this.scale.y, this.origin.x, this.origin.y, this.rotation);
            this.globalMatrix.copy(this.matrix);
            if (this.parent) this.globalMatrix.premultiply(this.parent.globalMatrix);
            this.inverseGlobalMatrix = this.globalMatrix.getInverse();
            this.matrixNeedsUpdate = false;
        }
    }

    /******************** RENDERING */

    /**
     *
     * Overloadable Render Loop Functions (called in this order):
     *
     *      transform(context, camera, canvas, renderer) {}
     *      style(context, camera, canvas, renderer) {}
     *      draw(context, camera, canvas, renderer) {}
     *
     * @param {CanvasRenderingContext2D} context Canvas 2d drawing context.
     * @param {Camera} camera Camera applied to the canvas.
     * @param {Element} canvas DOM canvas element where the content is being drawn.
     * @param {Renderer} renderer Renderer object being used to draw the object into the canvas.
     */

    /** Apply the transform to the rendering context (camera transform is already applied) */
    transform(context, camera, canvas, renderer) {
        this.globalMatrix.tranformContext(context);
    }

    /******************** EVENTS */

    /**
     *
     * Overloadable Hierarchy Events
     *
     *      onAdd(parent) {}
     *      onRemove(parent) {}
     *
     * @param {Object2D} parent Parent object were it was added / removed.
     *
     */

    /**
     *
     * Overloadable Update Event
     *
     *      onUpdate(context, camera) {}
     *
     * @param {CanvasRenderingContext2D} context Canvas 2d drawing context.
     * @param {Camera} camera Camera applied to the canvas.
     *
     */

    /**
     *
     * Overloadable Pointer Events
     *
     *      onPointerDrag(pointer, camera) {}
     *      onPointerDragStart(pointer, camera) {}
     *      onPointerDragEnd(pointer, camera) {}
     *      onPointerEnter(pointer, camera) {}
     *      onPointerLeave(pointer, camera) {}
     *      onPointerOver(pointer, camera) {}
     *      onButtonPressed(pointer, camera) {}
     *      onDoubleClick(pointer, camera) {}
     *      onButtonDown(pointer, camera) {}
     *      onButtonUp(pointer, camera) {}
     *
     * @param {Pointer} pointer Pointer object that receives the user input.
     * @param {Camera} camera Camera where the object is drawn.
     *
     */

    /** Object is being dragged, default adds delta to object position (follows mouse movement) */
    onPointerDrag(pointer, camera) {
        // Pointer Start / End
        const pointerStart = pointer.position.clone();
        const pointerEnd = pointer.position.clone().sub(pointer.delta);

        // Local (Parent Space) Start / End
        const parent = this.parent ?? this;
        const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
        const localPositionStart = parent.inverseGlobalMatrix.transformPoint(worldPositionStart);
        const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
        const localPositionEnd = parent.inverseGlobalMatrix.transformPoint(worldPositionEnd);
        const delta = localPositionStart.clone().sub(localPositionEnd);

        // Mouse Slop
        const mouseSlopThreshold = 2;

        // Adjust Position
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this.dragStartPosition = pointer.position.clone();
        } else if (pointer.buttonPressed(Pointer.LEFT)) {
            const manhattanDistance = this.dragStartPosition.manhattanDistanceTo(pointerEnd);
            if (manhattanDistance >= mouseSlopThreshold) {
                this.position.add(delta);
                this.matrixNeedsUpdate = true;
            }
        }
    }

}

export { Object2D };
