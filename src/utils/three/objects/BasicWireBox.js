import * as THREE from 'three';
import { ObjectUtils } from '../ObjectUtils.js';
import { Vectors } from '../../Vectors.js';

const _box = new THREE.Box3();
const _objQuaternion = new THREE.Quaternion();
const _objScale = new THREE.Vector3();
const _objPosition = new THREE.Vector3();

const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);

/** Single pixel width wireframe cube (used for 3d bounding box when calculating rubber band selection */
class BasicWireBox extends THREE.LineSegments {
    constructor(object, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        // Geometry
        const lineGeometry = new THREE.WireframeGeometry();

        // Material
        const lineMaterial = new THREE.LineBasicMaterial({
            color: boxColor,
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

        // Build LineSegments
        super(lineGeometry, lineMaterial);

        // Properties
        this.positions = new Float32Array(8 * 3);       // Box data
        this.points = [];                               // To store points
        for (let i = 0; i < 8; i++) {
            this.points.push(new THREE.Vector3());
        }

        // Apply geometry
        if (object) this.updateFromObject(object, matchTransform);

        // Clone function
        this.clone = function() {
            return new this.constructor(object, boxColor, opacity, matchTransform).copy(this, true);
        }
    }

    disableDepthTest() {
        this.material.depthTest = false;
    }

    updateFromObject(object, matchTransform) {
        const updateObject = object.clone();

        // Get object transform info, clear info to compute box
        if (matchTransform) {
            object.getWorldPosition(_objPosition);
            object.getWorldQuaternion(_objQuaternion);
            object.getWorldScale(_objScale);
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.scale.set(1, 1, 1);
            updateObject.updateMatrixWorld(true);
        }

        // Set points from Box3 bounding box
        _box.setFromObject(updateObject);
        const min = _box.min;
        const max = _box.max;
        Vectors.sanity(_box.min);
        Vectors.sanity(_box.max);

        // Assign points
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
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Match box transform to object
        if (matchTransform) {
            this.setRotationFromQuaternion(_objQuaternion);
            // this.rotation.setFromQuaternion(_objQuaternion, undefined, false);
            this.scale.set(_objScale.x, _objScale.y, _objScale.z);
            this.position.set(_objPosition.x, _objPosition.y, _objPosition.z);
            this.updateMatrix();
        }

        this.updateMatrixWorld(true);
        ObjectUtils.clearObject(updateObject);
    }

    getPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this.geometry.attributes.position.array[index + 0];
            this.points[i].y = this.geometry.attributes.position.array[index + 1];
            this.points[i].z = this.geometry.attributes.position.array[index + 2];
            this.localToWorld(this.points[i]);
        }
        return this.points;
    }

    getLocalPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this.positions[index + 0];
            this.points[i].y = this.positions[index + 1];
            this.points[i].z = this.positions[index + 2];
        }
        return this.points;
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
        const points = this.getLocalPoints();
        targetBox3 = targetBox3 ?? new THREE.Box3();
        targetBox3.min.x = points[6].x;
        targetBox3.min.y = points[6].y;
        targetBox3.min.z = points[6].z;
        targetBox3.max.x = points[0].x;
        targetBox3.max.y = points[0].y;
        targetBox3.max.z = points[0].z;
    }

}

export { BasicWireBox };
