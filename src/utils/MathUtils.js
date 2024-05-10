// ANGLES
//  radiansToDegrees()      Converts radians to degrees
//  degreesToRadians()      Converts degrees to radians
// COMMON
//  clamp()                 Clamps a number between min and max
//  damp()                  Time based linear interpolation
//  lerp()                  Linear interpolation
//  roundTo()               Returns a number rounded to 'decimalPlaces'
// FUZZY
//  fuzzyFloat()            Compares two numbers to see if they're roughly the same
//  fuzzyVector()           Compares two Vector3
//  fuzzyQuaternion()       Compares two Quaternion
// GEOMETRY
//  isPowerOfTwo()          Checks if a number is power of 2
// NUMBERS
//  addCommas()             Formats a number into a string with commas added for large numbers
//  countDecimals()         Counts significant decimal places
//  isNumber()              Checks if 'number' is a valid number
//  noZero()                Ensures number is not equal to zero
//  sanity()                Ensures number is a Number
// POLYGONS
//  lineCollision()         Check if two lines are intersecting
//  lineRectCollision()     Checks if a line is intersecting a rectangle
//  triangleArea()          Computes the area of a triangle defined by 3 points
// RANDOM
//  randomFloat()           Random float from min (inclusive) to max (exclusive)
//  randomInt()             Random integer from min (inclusive) to max (exclusive)
// UUID
//  randomUUID()            Returns randomized UUID
//  toUUIDArray()           Converts object list or object array to UUID array

import { Vector3 } from '../math/Vector3.js';

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];

const v0 = new Vector3();
const v1 = new Vector3();
const vc = new Vector3();

class MathUtils {

    /******************** ANGLES ********************/

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
    }

    /******************** COMMON ********************/

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

    /******************** FUZZY ********************/

    /** Compares two numbers to see if they're roughly the same */
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

    /******************** GEOMETRY ********************/

    /** Checks if a number is power of 2 */
    static isPowerOfTwo(value) {
        // // OPTION: And
        return (value & (value - 1)) === 0 && value !== 0;
        // OPTION: Log2
        // return Math.log2(value) % 1 === 0;
    }

    /******************** NUMBERS ********************/

    /** Formats a number into a string with commas added for large numbers (i.e. 12000 => 12,000) */
    static addCommas(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    /** Counts significant decimal places */
    static countDecimals(number) {
        if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
        return number.toString().split('.')[1].length || 0;
    }

    /** Checks if 'number' is a valid, finite number */
    static isNumber(number) {
        return (number != null && typeof number === 'number' && Number.isFinite(number));
    }

    /** Ensures number is not equal to zero */
    static noZero(number, min = 0.00001) {
        min = Math.abs(min);
        number = MathUtils.sanity(number);
        if (number >= 0 && number < min) number = min;
        if (number < 0 && number > min * -1.0) number = min * -1.0;
        return number;
    }

    /** Ensures number is a Number */
    static sanity(number) {
        if (MathUtils.isNumber(number)) return number;
        return 0;
    }

    /******************** POLYGON ********************/

    /** Check if two lines are intersecting */
    static lineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the direction of the lines
        let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (MathUtils.fuzzyFloat(denom, 0, 0.0000001)) return false;
        let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

        if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
            // If intersecting, the intersection points are
            //      crossX = x1 + (uA * (x2 - x1));
            //      crossY = y1 + (uA * (y2 - y1));
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

    /**
     * Computes the area of a triangle defined by 3 points (points as arrays [ x, y, z ])
     *
     * @param {Vec3} a
     * @param {Vec3} b
     * @param {Vec3} c
     * @returns {Number} area of the triangle
     */
    static triangleArea(a, b, c) {
        v0.subVectors(c, b);
        v1.subVectors(a, b);
        vc.crossVectors(v0, v1);
        return (vc.length() * 0.5);
    }

    /******************** RANDOM ********************/

    /** Random float from min (inclusive) to max (exclusive) */
    static randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }

    /** Random integer from min (inclusive) to max (exclusive), randomInt(0, 3) => expected output: 0, 1 or 2 */
    static randomInt(min = 0, max = 1) {
        return min + Math.floor(Math.random() * (max - min));
    }

    /******************** UUID ********************/

    /** Returns randomized UUID */
    static randomUUID() {
        if (window.crypto && window.crypto.randomUUID) return crypto.randomUUID();

        // https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];
        return uuid.toLowerCase(); // .toLowerCase() flattens concatenated strings to save heap memory space
    }

    /** Converts object list or object array to UUID array */
    static toUUIDArray(...objects) {
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object') {
                if (object.uuid) uuids.push(object.uuid);
            }
        }
        return uuids;
    }

}

export { MathUtils };
