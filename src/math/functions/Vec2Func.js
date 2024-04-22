const EPSILON = 0.000001;

/**
 * Copy the values from one Vec2 to another
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the source vector
 * @returns {Vec2} out
 */
export function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}

/**
 * Set the components of a Vec2 to the given values
 *
 * @param {Vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {Vec2} out
 */
export function set(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
}

/**
 * Adds two Vec2's
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Vec2} out
 */
export function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Vec2} out
 */
export function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

/**
 * Multiplies two Vec2's
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Vec2} out
 */
export function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}

/**
 * Divides two Vec2's
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Vec2} out
 */
export function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}

/**
 * Scales a Vec2 by a scalar number
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {Vec2} out
 */
export function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two Vec2's
 *
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Number} distance between a and b
 */
export function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two Vec2's
 *
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
export function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
}

/**
 * Calculates the length of a Vec2
 *
 * @param {Vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
export function length(a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a Vec2
 *
 * @param {Vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export function squaredLength(a) {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
}

/**
 * Negates the components of a Vec2
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a vector to negate
 * @returns {Vec2} out
 */
export function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}

/**
 * Returns the inverse of the components of a Vec2
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a vector to invert
 * @returns {Vec2} out
 */
export function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}

/**
 * Normalize a Vec2
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a vector to normalize
 * @returns {Vec2} out
 */
export function normalize(out, a) {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}

/**
 * Calculates the dot product of two Vec2's
 *
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
export function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two Vec2's
 * Note that the cross product returns a scalar
 *
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @returns {Number} cross product of a and b
 */
export function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * Performs a linear interpolation between two Vec2's
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the first operand
 * @param {Vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {Vec2} out
 */
export function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}

/**
 * Transforms the Vec2 with a Mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the vector to transform
 * @param {Mat3} m matrix to transform with
 * @returns {Vec2} out
 */
export function transformMat3(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}

/**
 * Transforms the Vec2 with a Mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {Vec2} out the receiving vector
 * @param {Vec2} a the vector to transform
 * @param {Mat4} m matrix to transform with
 * @returns {Vec2} out
 */
export function transformMat4(out, a, m) {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {Vec2} a The first vector.
 * @param {Vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}
