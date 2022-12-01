/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Vector Functions
//      absolute            Set x, y, z to positive numbers
//      noZero              Check if Vector3 is equal to zero ({ x:0, y:0, z:0 })
//      printOut            Logs a vector3 to the console
//      round               Rounds vector3 values to 'decimalPlaces'
//      sanity              Makes sure Vector3 values are real numbers
//
/////////////////////////////////////////////////////////////////////////////////////

import { Maths } from './Maths.js';

class Vectors {

    /** Set x, y, z to positive numbers */
    static absolute(vec3) {
        vec3.x = Math.abs(vec3.x);
        vec3.y = Math.abs(vec3.y);
        vec3.z = Math.abs(vec3.z);
    }

    /** Check if Vector3 is equal to zero ({ x:0, y:0, z:0 }) */
    static noZero(vec3, min = 0.001) {
        if (Maths.fuzzyFloat(vec3.x, 0, min)) vec3.x = (vec3.x < 0) ? (min * -1) : min;
		if (Maths.fuzzyFloat(vec3.y, 0, min)) vec3.y = (vec3.y < 0) ? (min * -1) : min;
		if (Maths.fuzzyFloat(vec3.z, 0, min)) vec3.z = (vec3.z < 0) ? (min * -1) : min;
    }

    /** Logs a vector3 to the console */
    static printOut(vec3, name = '') {
        if (name !== '') name += ' - ';
        console.info(`${name}X: ${vec3.x}, Y: ${vec3.y}, Z: ${vec3.z}`);
    }

    /** Rounds vector3 values to 'decimalPlaces' */
    static round(vec3, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        vec3.x = Math.round(vec3.x * shift) / shift;
        vec3.y = Math.round(vec3.y * shift) / shift;
        vec3.z = Math.round(vec3.z * shift) / shift;
    }

    /** Makes sure Vector3 values are real numbers */
    static sanity(vec3) {
        if (isNaN(vec3.x)) vec3.x = 0;
        if (isNaN(vec3.y)) vec3.y = 0;
        if (isNaN(vec3.z)) vec3.z = 0;
    }

}

export { Vectors };