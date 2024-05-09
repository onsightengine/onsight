const EPSILON = 0.000001;

class Vector3 {

    constructor(x = 0, y = 0, z = 0) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    set(x, y, z) {
        if (typeof x === 'object') return this.copy(x);
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(x, y, z) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    }

    add(x, y, z) {
        if (typeof x === 'object') {
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
        } else {
            this.x += x;
            this.y += y;
            this.z += z;
        }
        return this;
    }

    addScalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        this.z += scalar;
        return this;
    }

    /** Add two vectors and store the result in this vector */
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }

    /** Scale a vector components and add the result to this vector */
    addScaledVector(vec, scale) {
        this.x += vec.x * scale;
        this.y += vec.y * scale;
        this.z += vec.z * scale;
        return this;
    }

    sub(x, y, z) {
        if (typeof x === 'object') {
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
        } else {
            this.x -= x;
            this.y -= y;
            this.z -= z;
        }
        return this;
    }

    subScalar(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        this.z -= scalar;
        return this;
    }

    /** Subtract two vectors and store the result in this vector */
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    multiply(x, y, z) {
        if (typeof x === 'object') {
            this.x *= x.x;
            this.y *= x.y;
            this.z *= x.z;
        } else {
            this.x *= x;
            this.y *= y;
            this.z *= z;
        }
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    divide(x, y) {
        if (typeof x === 'object') {
            this.x /= x.x;
            this.y /= x.y;
            this.z /= x.z;
        } else {
            this.x /= x;
            this.y /= y;
            this.z /= z;
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
        this.z = Math.min(this.z, vec.z);
        return this;
    }

    /** Set components as the maximum values found between two vectors */
    max(vec) {
        this.x = Math.max(this.x, vec.x);
        this.y = Math.max(this.y, vec.y);
        this.z = Math.max(this.z, vec.z);
        return this;
    }

    /** Clamp the vector coordinates to the range defined by two vectors */
    clamp(minv, maxv) {
        if (minv.x < maxv.x) this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        else this.x = Math.max(maxv.x, Math.min(minv.x, this.x));
        if (minv.y < maxv.y) this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        else this.y = Math.max(maxv.y, Math.min(minv.y, this.y));
        if (minv.z < maxv.z) this.z = Math.max(minv.z, Math.min(maxv.z, this.z));
        else this.z = Math.max(maxv.z, Math.min(minv.z, this.z));
        return this;
    }

    /** Clamp the vector coordinates to the range defined by two scalars */
    clampScalar(minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        this.z = Math.max(minVal, Math.min(maxVal, this.z));
        return this;
    }

    clampLength(min, max) {
        const length = this.length();
        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }

    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

	cross(vec) {
		return this.crossVectors(this, vec);
	}

	crossVectors(a, b) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}

    /** Length of the vector */
    length() {
        return Math.sqrt(this.lengthSq());
    }

    /** Squared length of the vector (faster for comparions) */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    /** Computes the angle (in radians) between this and another vector */
    angle(vec) {
        temp1.copy(this).normalize();
        temp2.copy(vec).normalize();
        const cosine = temp1.dot(temp2);
        if (cosine > 1.0) return 0;
        if (cosine < -1.0) return Math.PI;
        return Math.acos(cosine);
    }

    /** Distance between two vector positions */
    distanceTo(vec) {
        return Math.sqrt(this.distanceToSquared(vec));
    }

    /** Distance between two vector positions squared, faster for comparisons */
    distanceToSquared(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        const dz = this.z - vec.z;
        return dx * dx + dy * dy + dz * dz;
    }

    manhattanDistanceTo(vec) {
        return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y) + Math.abs(this.z - vec.z);
    }

    lerp(vec, t) {
        return this.lerpVectors(this, vec, t);
    }

    lerpVectors(a, b, t) {
        this.x = a.x + ((b.x - a.x) * t);
        this.y = a.y + ((b.y - a.y) * t);
        this.z = a.z + ((b.z - a.z) * t);
        return this;
    }

    /** Transforms with a 3x3 matrix */
    applyMatrix3(mat3) {
        this.x = this.x * mat3[0] + this.y * mat3[3] + this.z * mat3[6];
        this.y = this.x * mat3[1] + this.y * mat3[4] + this.z * mat3[7];
        this.z = this.x * mat3[2] + this.y * mat3[5] + this.z * mat3[8];
        return this;
    }

    /** Transforms with a 3x3 matrix, 4th vector component is implicitly '1' */
    applyMatrix4(mat4) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w =  (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
        this.x = (m[0] * x + m[4] * y + m[ 8] * z + m[12]) / w;
        this.y = (m[1] * x + m[5] * y + m[ 9] * z + m[13]) / w;
        this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return this;
    }

    /** Same as above but doesn't apply translation (useful for rays) */
    scaleRotateMatrix4(mat4) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w =  (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
        this.x = (m[0] * x + m[4] * y + m[ 8] * z) / w;
        this.y = (m[1] * x + m[5] * y + m[ 9] * z) / w;
        this.z = (m[2] * x + m[6] * y + m[10] * z) / w;
        return this;
    }

    /** Transforms the with a Quaternion */
    applyQuaternion(q) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let qx = q[0];
        let qy = q[1];
        let qz = q[2];
        let qw = q[3];
        let uvx = qy * z - qz * y;
        let uvy = qz * x - qx * z;
        let uvz = qx * y - qy * x;
        let uuvx = qy * uvz - qz * uvy;
        let uuvy = qz * uvx - qx * uvz;
        let uuvz = qx * uvy - qy * uvx;
        let w2 = qw * 2;
        uvx *= w2;
        uvy *= w2;
        uvz *= w2;
        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2;
        this.x = x + uvx + uuvx;
        this.y = y + uvy + uuvy;
        this.z = z + uvz + uuvz;
        return this;
    }

    transformDirection(mat4) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.x = mat4[0] * x + mat4[4] * y + mat4[ 8] * z;
        this.y = mat4[1] * x + mat4[5] * y + mat4[ 9] * z;
        this.z = mat4[2] * x + mat4[6] * y + mat4[10] * z;
        return this.normalize();
    }

    calculateNormal(target = new Vector3(), a, b, c) {
        temp1.subVectors(a, b);
        target.subVectors(b, c);
        target.cross(temp1);
        return target.normalize();
    }

    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y) && (vec.z === this.z));
    }

    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat(this.y, vec.y, tolerance) === false) return false;
        if (fuzzyFloat(this.z, vec.z, tolerance) === false) return false;
        return true;
    }

    random() {
        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();
    }

    log(description = '') {
        if (description !== '') description += ' - '
        console.log(`${description}X: ${this.x}, Y: ${this.y}, Z: ${this.z}`);
        return this;
    }

    toArray() {
        return [ this.x, this.y, this.z ];
    }

    fromArray(array, offset = 0) {
        this.set(array[offset + 0], array[offset + 1], array[offset + 2]);
        return this;
    }

}

export { Vector3 };

/******************** INTERNAL ********************/

const temp1 = new Vector3();
const temp2 = new Vector3();

/** Compares two decimal numbers to see if they're almost the same */
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}
