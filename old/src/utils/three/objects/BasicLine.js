import * as THREE from 'three';
import { Vectors } from '../../Vectors.js';

/** Basic single pixel width line between two points */
class BasicLine extends THREE.LineSegments {
    constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
        // Geometry
        const vertices = [
            x1, y1, z1,
            x2, y2, z2,
        ];
        const indices = [ 0, 1 ];
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setIndex(indices);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3 /* stride */));

        // Material
        const lineMaterial = new THREE.LineBasicMaterial({
            color: boxColor,

            alphaToCoverage: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,     // positive value pushes polygon further away
            side: THREE.DoubleSide,
            transparent: true,
            // dashed: false,
            // depthFunc: THREE.AlwaysDepth,
            // vertexColors: false,
        });

        // Build LineSegments
        super(lineGeometry, lineMaterial);
    }

    clone() {
        const array = this.geometry.attributes.position.array;
        array[0] = point1.x; array[1] = point1.y; array[2] = point1.z;
        array[3] = point2.x; array[4] = point2.y; array[5] = point2.z;
        return new this.constructor(array[0], array[1], array[2], array[3], array[4], array[5]).copy(this, true);
    }

    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        const array = this.geometry.attributes.position.array;
        array[0] = point1.x; array[1] = point1.y; array[2] = point1.z;
        array[3] = point2.x; array[4] = point2.y; array[5] = point2.z;
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingSphere();
    }
}

export { BasicLine };
