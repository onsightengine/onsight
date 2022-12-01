/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

/////////////////////////////////////////////////////////////////////////////////////
/////   PrismGeometry
/////////////////////////////////////////////////////////////////////////////////////

/** Extrudes polygon 'vertices' into 3D by 'height' amount */
class PrismGeometry extends THREE.ExtrudeGeometry {

    constructor(vertices, height) {

        let shape = new THREE.Shape();

        (function makeShapeFromVertices(s) {
            s.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                s.lineTo(vertices[i].x, vertices[i].y);
            }
            s.lineTo(vertices[0].x, vertices[0].y);
        })(shape);

        const extrudeSettings = {
            steps: 2,
            depth: height,
            bevelEnabled: false,
        };

        super(shape, extrudeSettings);

        this.vertices = vertices;
        this.height = height;

    } // end ctor

    clone() {
        return new this.constructor(this.vertices, this.height).copy(this);
    }
}

export { PrismGeometry };
