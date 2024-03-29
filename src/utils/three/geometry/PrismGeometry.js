import * as THREE from 'three';

/** Extrudes polygon 'vertices' into 3D by 'height' amount */
class PrismGeometry extends THREE.ExtrudeGeometry {

    constructor(vertices, height) {

        const shape = new THREE.Shape();
        shape.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            shape.lineTo(vertices[i].x, vertices[i].y);
        }
        shape.lineTo(vertices[0].x, vertices[0].y);

        const extrudeSettings = {
            steps: 2,
            depth: height,
            bevelEnabled: false,
        };

        super(shape, extrudeSettings);

        this.vertices = vertices;
        this.height = height;

    }

    clone() {
        return new this.constructor(this.vertices, this.height).copy(this);
    }

}

export { PrismGeometry };
