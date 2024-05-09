import { Vector2 } from './Vector2.js';

class Box2 {

    constructor(min, max) {
        this.min = new Vector2(+Infinity, +Infinity);
        this.max = new Vector2(-Infinity, -Infinity);
        if (typeof min === 'object') this.min.copy(min);
        if (typeof max === 'object') this.max.copy(max);
    }

    /** Set the box values */
    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }

    /** Set the box from a list of Vector2 points */
    setFromPoints(...points) {
        if (points.length > 0 && Array.isArray(points[0])) points = points[0];
        this.min = new Vector2(+Infinity, +Infinity);
        this.max = new Vector2(-Infinity, -Infinity);
        for (const point of points) {
            this.expandByPoint(point);
        }
        return this;
    }

    /** Set the box minimum and maximum from center point and size */
    setFromCenterAndSize(center, size) {
        const halfSize = new Vector2().copy(size).multiplyScalar(0.5);
        this.min.copy(center).sub(halfSize);
        this.max.copy(center).add(halfSize);
        return this;
    }

    clone() {
        return new Box2().copy(this);
    }

    copy(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);
        return this;
    }

    /** Check if the box is empty (size equals zero or is negative) */
    isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
    }

    /** Calculate the center point of the box */
    getCenter(target) {
        target = target ?? new Vector2();
        this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
        return target;
    }

    /** Get the size of the box from its min and max points */
    getSize(target) {
        target = target ?? new Vector2();
        this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
        return target;
    }

    /** Expand the box to contain a new point */
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);
        return this;
    }

    /** Expand the box by adding a border with the vector size */
    expandByVector(vector) {
        this.min.sub(vector);
        this.max.add(vector);
        return this;
    }

    /** Expand the box by adding a border with the scalar value */
    expandByScalar(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);
        return this;
    }

    /** Check if the box contains a point inside */
    containsPoint(point) {
        return !(point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y);
    }

    /** Check if the box FULLY contains another box inside (different from intersects box) */
    containsBox(box) {
        return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
    }

    /** Check if two boxes intersect each other, using 4 splitting planes to rule out intersections */
    intersectsBox(box) {
        return !(box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y);
    }

    /** Calculate the distance to a point */
    distanceToPoint(point) {
        let v = new Vector2();
        let clampedPoint = v.copy(point).clamp(this.min, this.max);
        return clampedPoint.sub(point).length();
    }

    /** Make an intersection between this box and another box, store the result in this object */
    intersect(box) {
        this.min.max(box.min);
        this.max.min(box.max);
        return this;
    }

    /** Make a union between this box and another box, store the result in this object */
    union(box) {
        this.min.min(box.min);
        this.max.max(box.max);
        return this;
    }

    /** Translate the box by a offset value, adds the offset to booth min and max */
    translate(offset) {
        this.min.add(offset);
        this.max.add(offset);
        return this;
    }

    /** Checks if two boxes are equal */
    equals(box) {
        return box.min.equals(this.min) && box.max.equals(this.max);
    }

    toArray() {
        return [ this.min.x, this.min.y, this.max.x, this.max.y ];
    }

    fromArray(array) {
        this.min.set(array[0], array[1]);
        this.max.set(array[2], array[3]);
        return this;
    }

}

export { Box2 };
