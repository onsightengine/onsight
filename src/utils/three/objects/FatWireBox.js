import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

import { ObjectUtils } from '../ObjectUtils.js';
import { Vectors } from '../../Vectors.js';

const _box = new THREE.Box3();
const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
const _tempScale = new THREE.Vector3();
const _tempSize = new THREE.Vector3();

/** Variable line width wireframe cube */
class FatWireBox extends Line2 {
    constructor(object, linewidth = 1, color = 0xffffff, opacity = 1.0) {
        // Geometry
        const lineGeometry = new LineSegmentsGeometry();

        // Material
        const lineMaterial = new LineMaterial({
            color: color,
            linewidth: linewidth,       // in world units with size attenuation, pixels otherwise
            opacity: opacity,

            alphaToCoverage: true,
            depthTest: false, // true,
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

        // Properties
        this.positions = new Float32Array(8 * 3); /* box data */

        /// Box Position Data
        if (object && object.isObject3D) {
            const updateObject = object.clone();
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.quaternion.set(0, 0, 0, 1);
            updateObject.scale.set(1, 1, 1);
            updateObject.matrix.compose(updateObject.position, updateObject.quaternion, updateObject.scale);
            updateObject.matrixWorld.copy(updateObject.matrix);
            updateObject.matrixAutoUpdate = false;
            _box.setFromObject(updateObject, true /* precise */);
            ObjectUtils.clearObject(updateObject);
            Vectors.sanity(_box.min);
            Vectors.sanity(_box.max);
        } else {
            _box.set(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
        }

        // Assign points
        const min = _box.min;
        const max = _box.max;
        const array = this.positions;
        array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
        array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
        array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
        array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
        array[12] = max.x; array[13] = max.y; array[14] = min.z;
        array[15] = min.x; array[16] = max.y; array[17] = min.z;
        array[18] = min.x; array[19] = min.y; array[20] = min.z;
        array[21] = max.x; array[22] = min.y; array[23] = min.z;

        // Copy lines from indices
        const positions = [];
        for (let i = _indices.length - 1; i > 0; i -= 2) {
            const index1 = (_indices[i - 0]) * 3;
            const index2 = (_indices[i - 1]) * 3;
            positions.push(array[index1 + 0], array[index1 + 1], array[index1 + 2]);
            positions.push(array[index2 + 0], array[index2 + 1], array[index2 + 2]);
        }
        this.geometry.setPositions(positions);

        // Clone function
        this.clone = function() {
            const clone = new this.constructor(object, linewidth, color, opacity);
            ObjectUtils.copyTransform(this, clone);
            return clone;
        }
    }

    getLocalPoints() {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            const point = new THREE.Vector3();
            point.x = this.positions[index + 0];
            point.y = this.positions[index + 1];
            point.z = this.positions[index + 2];
            points[i] = point;
        }
        return points;
    }

    getAbsoluteSize(target) {
        this.getSize(target);
        target.x = Math.abs(target.x);
        target.y = Math.abs(target.y);
        target.z = Math.abs(target.z);
    }

    getAverageSize() {
        this.getSize(_tempSize);
        return ((_tempSize.x + _tempSize.y + _tempSize.z) / 3.0);
    }

    getBox3(targetBox3) {
        //      Point 0: Right  Top     Front (z positive)
        //      Point 1: Left   Top     Front
        //      Point 2: Left   Down    Front
        //      Point 3: Right  Down    Front
        //      Point 4: Right  Top     Back (z negative)
        //      Point 5: Left   Top     Back
        //      Point 6: Left   Down    Back
        //      Point 7: Right  Down    Back
        targetBox3 = targetBox3 ?? new THREE.Box3();
        targetBox3.min.x = this.positions[(6 * 3) /* index */ + 0];
        targetBox3.min.y = this.positions[(6 * 3) /* index */ + 1];
        targetBox3.min.z = this.positions[(6 * 3) /* index */ + 2];
        targetBox3.max.x = this.positions[(0 * 3) /* index */ + 0];
        targetBox3.max.y = this.positions[(0 * 3) /* index */ + 1];
        targetBox3.max.z = this.positions[(0 * 3) /* index */ + 2];
    }

    getSize(target) {
        this.getBox3(_box);
        this.getWorldScale(_tempScale);
        target.x = (_box.max.x - _box.min.x) * Math.abs(_tempScale.x);    // Width
        target.y = (_box.max.y - _box.min.y) * Math.abs(_tempScale.y);    // Height
        target.z = (_box.max.z - _box.min.z) * Math.abs(_tempScale.z);    // Depth
        // console.info(`Width: ${target.x}, Height: ${target.y}, Depth: ${target.z}`);
    }

    getMaxSize() {
        this.getSize(_tempSize);
        return Math.max(Math.max(_tempSize.x, _tempSize.y), _tempSize.z);
    }

}

export { FatWireBox };
