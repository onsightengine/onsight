// absolute()       Set x, y, z to positive numbers
// isNaN()          Checks if vector values are numbers
// noZero()         Ensures vector values are not equal to zero
// printOut()       Logs a vector to the console
// round()          Rounds vector values to 'decimalPlaces'
// sanity()         Ensures vector values are real numbers

class Vectors {

    /** Set x, y, z to positive numbers */
    static absolute(vec3) {
        vec3.x = Math.abs(vec3.x);
        vec3.y = Math.abs(vec3.y);
        vec3.z = Math.abs(vec3.z);
        return vec3;
    }

    /** Checks if vector values are numbers */
    static isNaN(vec3) {
        if (isNaN(vec3.x)) return true;
        if (isNaN(vec3.y)) return true;
        if (isNaN(vec3.z)) return true;
        if (vec3.w != null && isNaN(vec3.w)) return true;
        return false;
    }

    /** Ensures vector values are not equal to zero */
    static noZero(vec3, min = 0.001) {
        min = Math.abs(min);
        Vectors.sanity(vec3);
        if (vec3.x >= 0 && vec3.x < min) vec3.x = min;
        if (vec3.y >= 0 && vec3.y < min) vec3.y = min;
        if (vec3.z >= 0 && vec3.z < min) vec3.z = min;
        if (vec3.x < 0 && vec3.x > min * -1.0) vec3.x = min * -1.0;
        if (vec3.y < 0 && vec3.y > min * -1.0) vec3.y = min * -1.0;
        if (vec3.z < 0 && vec3.z > min * -1.0) vec3.z = min * -1.0;
        return vec3;
    }

    /** Logs a vector to the console */
    static printOut(vec3, name = '') {
        if (name !== '') name += ' - ';
        console.info(`${name}X: ${vec3.x}, Y: ${vec3.y}, Z: ${vec3.z}`);
        return vec3;
    }

    /** Rounds vector values to 'decimalPlaces' */
    static round(vec3, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        vec3.x = Math.round(vec3.x * shift) / shift;
        vec3.y = Math.round(vec3.y * shift) / shift;
        vec3.z = Math.round(vec3.z * shift) / shift;
        return vec3;
    }

    /** Ensures vector values are real numbers */
    static sanity(vec3) {
        if (isNaN(vec3.x)) vec3.x = 0;
        if (isNaN(vec3.y)) vec3.y = 0;
        if (isNaN(vec3.z)) vec3.z = 0;
        if (vec3.w != null && isNaN(vec3.w)) vec3.w = 1;
        return vec3;
    }

}

export { Vectors };
