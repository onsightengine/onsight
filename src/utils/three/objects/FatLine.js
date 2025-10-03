import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

import { Vectors } from '../../Vectors.js';

/** Variable width line object between two points */
class FatLine extends Line2 {
    constructor(x1, y1, z1, x2, y2, z2, lineWidth = 1, boxColor = 0xffffff) {
        // Geometry
        const positions = [ x1, y1, z1, x2, y2, z2 ];
        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);

        // Material
        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,       // in world units with size attenuation, pixels otherwise

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
        lineMaterial.resolution = new THREE.Vector2(1024, 1024);

        // Build Line2
        super(lineGeometry, lineMaterial);

        // Init
        this.computeLineDistances();
        this.scale.set(1, 1, 1);

        // Properties
        this.point1 = new THREE.Vector3(x1, y1, z1);
        this.point2 = new THREE.Vector3(x2, y2, z2);
    }

    clone() {
        return new this.constructor(
            this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z,
            this.material.linewidth, this.material.color).copy(this, true);
    }

    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        this.point1.copy(point1);
        this.point2.copy(point2);
        const positions = [ point1.x, point1.y, point1.z, point2.x, point2.y, point2.z ];
        this.geometry.setPositions(positions);
        this.computeLineDistances();
    }
}

export { FatLine };
