/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
//
/////////////////////////////////////////////////////////////////////////////////////
//
//  Angles
//      radiansToDegrees        Converts radians to degrees
//      degreesToRadians        Converts degrees to radians
//  Common
//      clamp                   Clamps a number between min and max
//      damp                    Time based linear interpolation
//      lerp                    Linear interpolation
//      roundTo                 Returns a number rounded to 'decimalPlaces'
//  Fuzzy Comparison
//      fuzzyFloat              Compare two floats
//      fuzzyVector             Compare two Vector3
//      fuzzyQuaternion         Compare two Quaternion
//  Geometry
//      isPowerOfTwo            Checks if a number is power of 2
//  Number Functions
//      addCommas               Formats a number into a string with commas added for large numbers
//      countDecimals           Counts significant decimal places
//      isNumber                Checks if 'number' is a valid number
//  Polygon
//      lineCollision           Check if two lines are intersecting
//      lineRectCollision       Checks if a line is intersecting a rectangle
//  Random
//      randomFloat             Random float from min (inclusive) to max (exclusive)
//      randomInt               Random integer from min (inclusive) to max (exclusive)
//
/////////////////////////////////////////////////////////////////////////////////////

class MathUtils {

    //////////////////// Angles

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
    }

    //////////////////// Fuzzy Compare

    /** Compares two floats to see if they're almost the same */
    static fuzzyFloat(a, b, tolerance = 0.001) {
        return ((a < (b + tolerance)) && (a > (b - tolerance)));
    }

    static fuzzyVector(a, b, tolerance = 0.001) {
        if (MathUtils.fuzzyFloat(a.x, b.x, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.y, b.y, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.z, b.z, tolerance) === false) return false;
        return true;
    }

    static fuzzyQuaternion(a, b, tolerance = 0.001) {
        if (MathUtils.fuzzyVector(a, b, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.w, b.w, tolerance) === false) return false;
        return true;
    }

    //////////////////// Common

    /** Clamps a number between min and max */
    static clamp(number, min, max) {
        number = Number(number);
        if (number < min) number = min;
        if (number > max) number = max;
        return number;
    }

    /** http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/ */
    static damp(x, y, lambda, dt) {
	    return MathUtils.lerp(x, y, 1 - Math.exp(- lambda * dt));
    }

    /** https://en.wikipedia.org/wiki/Linear_interpolation */
    static lerp(x, y, t) {
	    return (1 - t) * x + t * y;
    }

    /** Returns a number rounded to 'decimalPlaces' */
    static roundTo(number, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        return Math.round(number * shift) / shift;
    }

    ///// Geometry

    /** Checks if a number is power of 2 */
    static isPowerOfTwo(value) {
        return (value & (value - 1)) === 0 && value !== 0;
    }

    //////////////////// Numbers

    /** Formats a number into a string with commas added for large numbers (i.e. 12000 => 12,000) */
    static addCommas(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    /** Counts significant decimal places */
    static countDecimals(number) {
        if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
        return number.toString().split('.')[1].length || 0;
    }

    /** Checks if 'number' is a valid number */
    static isNumber(number) {
        return (number !== undefined && number !== null && typeof number === 'number' && ! Number.isNaN(number) && Number.isFinite(number));
    }

    //////////////////// Polygon

    /** Check if two lines are intersecting */
    static lineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the direction of the lines
        let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (MathUtils.fuzzyFloat(denom, 0, 0.0000001)) return false;
        let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

        if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
            // If intersecting, the intersection points are
            // 		crossX = x1 + (uA * (x2 - x1));
            // 		crossY = y1 + (uA * (y2 - y1));
            return true;
        }
        return false;
    }

    /** Checks if a line is intersecting a rectangle */
    static lineRectCollision(x1, y1, x2, y2, left, top, right, down) {
        const rectLeft =    MathUtils.lineCollision(x1, y1, x2, y2, left, top, left, down);
        const rectRight =   MathUtils.lineCollision(x1, y1, x2, y2, right, top, right, down);
        const rectTop =     MathUtils.lineCollision(x1, y1, x2, y2, left, top, right, top);
        const rectDown =    MathUtils.lineCollision(x1, y1, x2, y2, left, down, right, down);
        return (rectLeft || rectRight || rectTop || rectDown);
    }

    //////////////////// Random

    /** Random float from min (inclusive) to max (exclusive) */
    static randomFloat(min, max) {
	    return min + Math.random() * (max - min);
    }

    /** Random integer from min (inclusive) to max (exclusive), randomInt(0, 3) => expected output: 0, 1 or 2 */
    static randomInt(min = 0, max = 1) {
        return min + Math.floor(Math.random() * (max - min));
    }

}

export { MathUtils };
