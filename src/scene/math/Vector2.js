class Vector2 {

    constructor(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x || 0;
            this.y = y || 0;
        }
    }

    /** Set vector x and y values */
    set(x, y) {
        if (typeof x === 'object') return this.copy(x);
        this.x = x;
        this.y = y;
        return this;
    }

    /** Set a scalar value into the x and y values */
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    copy(vec, y) {
        if (typeof vec === 'object') {
            this.x = vec.x;
            this.y = vec.y;
        } else {
            this.x = vec;
            this.y = y;
        }
        return this;
    }

    /** Add the content of another vector to this one */
    add(x, y) {
        if (typeof x === 'object') {
            this.x += x.x;
            this.y += x.y;
        } else {
            this.x += x;
            this.y += y;
        }
        return this;
    }

    /** Add a scalar value to both vector components */
    addScalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    }

    /** Add two vectors and store the result in this vector */
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    /** Scale a vector components and add the result to this vector */
    addScaledVector(vec, scale) {
        this.x += vec.x * scale;
        this.y += vec.y * scale;
        return this;
    }

    /** Subtract the content of another vector to this one */
    sub(x, y) {
        if (typeof x === 'object') {
            this.x -= x.x;
            this.y -= x.y;
        } else {
            this.x -= x;
            this.y -= y;
        }
        return this;
    }

    /** Subtract a scalar value to both vector components */
    subScalar(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        return this;
    }

    /** Subtract two vectors and store the result in this vector */
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    /** Multiply the content of another vector to this one */
    multiply(x, y) {
        if (typeof x === 'object') {
            this.x *= x.x;
            this.y *= x.y;
        } else {
            this.x *= x;
            this.y *= y;
        }
        return this;
    }

    /** Multiply a scalar value by both vector components */
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /** Divide the content of another vector from this one */
    divide(x, y) {
        if (typeof x === 'object') {
            this.x /= x.x;
            this.y /= x.y;
        } else {
            this.x /= x;
            this.y /= y;
        }
        return this;
    }

    /** Divide a scalar value by both vector components */
    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }

    /** Set x and y as the minimum values found between two vectors */
    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }

    /** Set x and y as the maximum values found between two vectors */
    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }

    /** Clamp the vector coordinates to the range defined by two vectors */
    clamp(minv, maxv) {
        // assumes min < max
        this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        return this;
    }

    /** Clamp the vector coordinates to the range defined by two scalars */
    clampScalar(minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        return this;
    }

    clampLength(min, max) {
        const length = this.length();
        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    /** Squared length of the vector (faster for comparions) */
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    /** Length of the vector */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Manhattan length of the vector */
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    /** Computes the angle in radians with respect to the positive x-axis */
    angle(forcePositive) {
        let angle = Math.atan2(this.y, this.x);
        if (forcePositive && angle < 0) angle += 2 * Math.PI;
        return angle;
    }

    /** Compute the angle between two Vector2 objects that share a common point */
    angleBetween(v) {
        const dot = this.dot(v);
        const magnitudes = this.length() * v.length();
        // Clamp the dot product to the range [-1, 1] to avoid NaN results
        const clampedDot = Math.min(Math.max(dot / magnitudes, -1), 1);
        return Math.acos(clampedDot);
    }

    /** Rotate the vector around a central point, in radians */
    rotateAround(center, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const x = this.x - center.x;
        const y = this.y - center.y;
        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;
    }

    /** Distance between two vector positions */
    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    /** Distance between two vector positions squared, faster for comparisons */
    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /** Manhattan distance between two vector positions */
    manhattanDistanceTo(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }

    /** Scale the vector to have a defined length value */
    setLength(length) {
        return this.normalize().multiplyScalar(length);
    }

    /** Lerp this vector to another vector */
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }

    /** Check if two vectors are equal */
    equals(v) {
        return ((v.x === this.x) && (v.y === this.y));
    }

    toArray() {
        return [ this.x, this.y ];
    }

    fromArray(array) {
        this.set(array[0], array[1]);
        return this;
    }

}

export { Vector2 };
