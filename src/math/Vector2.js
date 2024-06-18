class Vector2 {

    constructor(x = 0, y = 0) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
    }

    set(x, y) {
        if (typeof x === 'object') return this.copy(x);
        this.x = x;
        this.y = y;
        return this;
    }

    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    copy(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        return this;
    }

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

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

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

    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }

    /** Set components as the minimum values found between two vectors */
    min(vec) {
        this.x = Math.min(this.x, vec.x);
        this.y = Math.min(this.y, vec.y);
        return this;
    }

    /** Set components as the maximum values found between two vectors */
    max(vec) {
        this.x = Math.max(this.x, vec.x);
        this.y = Math.max(this.y, vec.y);
        return this;
    }

    /** Clamp the vector coordinates to the range defined by two vectors */
    clamp(minv, maxv) {
        if (minv.x < maxv.x) this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        else this.x = Math.max(maxv.x, Math.min(minv.x, this.x));
        if (minv.y < maxv.y) this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        else this.y = Math.max(maxv.y, Math.min(minv.y, this.y));
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

    abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    }

    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }

    cross(vec) {
        return this.x * vec.y - this.y * vec.x;
    }

    /** Length of the vector */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Squared length of the vector (faster for comparions) */
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    /** Computes the angle (in radians) with respect to the positive x-axis */
    angle(forcePositive) {
        let angle = Math.atan2(this.y, this.x);
        if (forcePositive && angle < 0) angle += 2 * Math.PI;
        return angle;
    }

    /** Compute the angle between two Vector2 objects that share a common point */
    angleBetween(vec) {
        const magnitudes = this.length() * vec.length();
        const dot = this.dot(vec);
        const theta = dot / magnitudes;
        const clampedDot = Math.min(Math.max(theta, -1), 1); /* clamp to avoid NaN results */
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
    distanceTo(vec) {
        return Math.sqrt(this.distanceToSquared(vec));
    }

    /** Distance between two vector positions squared, faster for comparisons */
    distanceToSquared(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        return dx * dx + dy * dy;
    }

    manhattanDistanceTo(vec) {
        return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y);
    }

    /** Scale the vector to have a defined length value */
    setLength(length) {
        return this.normalize().multiplyScalar(length);
    }

    lerp(vec, t) {
        return this.lerpVectors(this, vec, t);
    }

    lerpVectors(a, b, t) {
        this.x = (a.x * (1.0 - t)) + (b.x * t);
        this.y = (a.y * (1.0 - t)) + (b.y * t);
        return this;
    }

    smoothstep(vec, t) {
        t = 3 * t * t - 2 * t * t * t;
        t = Math.min(1, Math.max(0, t));
        this.x = this.x + ((vec.x - this.x) * t);
        this.y = this.y + ((vec.y - this.y) * t);
        return this;
    }

    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y));
    }

    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat(this.y, vec.y, tolerance) === false) return false;
        return true;
    }

    random() {
        this.x = Math.random();
        this.y = Math.random();
    }

    log(description = '') {
        if (description !== '') description += ' - '
        console.log(`${description}X: ${this.x}, Y: ${this.y}`);
        return this;
    }

    toArray() {
        return [ this.x, this.y ];
    }

    fromArray(array, offset = 0) {
        this.set(array[offset + 0], array[offset + 1]);
        return this;
    }

}

export { Vector2 };

/******************** INTERNAL ********************/

/** Compares two decimal numbers to see if they're almost the same */
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}
