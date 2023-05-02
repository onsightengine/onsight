import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';

import { ObjectUtils } from '../ObjectUtils.js';
import { Vectors } from '../../Vectors.js';

function setWireframeMaterialDefaults(material) {
    material.transparent = true;
    // material.vertexColors = false;
    // material.dashed = false;

    material.resolution = new THREE.Vector2(1024, 1024);

    material.depthTest = true;
    material.depthWrite = false;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1; // positive value pushes polygon further away

    material.side = THREE.DoubleSide;

    material.alphaToCoverage = true;
    //material.depthFunc = THREE.AlwaysDepth;
}

const _objQuaternion = new THREE.Quaternion();
const _objScale = new THREE.Vector3();
const _objPosition = new THREE.Vector3();
const _tempScale = new THREE.Vector3();
const _tempSize = new THREE.Vector3();
const _box = new THREE.Box3();

const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);

/******************** LINES********************/

/** Basic single pixel width line between two points */
class BasicLine extends THREE.LineSegments {
    constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
        // Geometry
        const vertices = [
            x1, y1, z1,
            x2, y2, z2,
        ];
        const indices = [0, 1];
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setIndex(indices);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));   // '3' is stride

        // Material
        const lineMaterial = new THREE.LineBasicMaterial({ color: boxColor });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.wireframe = true;

        // Build Line
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

/** Variable width line object between two points */
class FatLine extends Line2 {
    constructor(x1, y1, z1, x2, y2, z2, lineWidth = 1, boxColor = 0xffffff) {
        const lineGeometry = new LineGeometry();

        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,       // in world units with size attenuation, pixels otherwise
        });
        setWireframeMaterialDefaults(lineMaterial);

        const positions = [x1, y1, z1, x2, y2, z2];
        lineGeometry.setPositions(positions);

        super(lineGeometry, lineMaterial);

        this.computeLineDistances();
        this.scale.set(1, 1, 1);

        this.point1 = new THREE.Vector3(x1, y1, z1);
        this.point2 = new THREE.Vector3(x2, y2, z2);
    }

    clone() {
        return new this.constructor(this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z).copy(this, true);
    }

    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        this.point1.copy(point1);
        this.point2.copy(point2);
        const positions = [point1.x, point1.y, point1.z, point2.x, point2.y, point2.z];
        this.geometry.setPositions(positions);
        this.computeLineDistances();
    }
}

/******************** WIREFRAME BOXES ********************/

/** Single pixel width wireframe cube (used for 3d bounding box when calculating rubber band selection */
class BasicWireBox extends THREE.LineSegments {
    constructor(object, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        // Create new geomtry from lines
        const lineGeometry = new THREE.WireframeGeometry();

        // Material
        const lineMaterial = new THREE.LineBasicMaterial({
            color: boxColor,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);

        // Build line box
        super(lineGeometry, lineMaterial);

        // Members
        this._positions = new Float32Array(8 * 3);      // Box data
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
        const array = this._positions;
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
            this.points[i].x = this._positions[index + 0];
            this.points[i].y = this._positions[index + 1];
            this.points[i].z = this._positions[index + 2];
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

/** Variable line width wireframe cube */
class FatWireBox extends Line2 {
    constructor(object, lineWidth = 1, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        // Create new geomtry from lines
        const lineGeometry = new LineSegmentsGeometry();

        // Material
        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,       // in world units with size attenuation, pixels otherwise
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.depthTest = false;

        // Build line box
        super(lineGeometry, lineMaterial);

        // Members
        this._positions = new Float32Array(8 * 3);      // Box data
        this.points = [];                               // To store points
        for (let i = 0; i <  8; i++) {
            this.points.push(new THREE.Vector3());
        }

        // Apply geometry
        if (object) this.updateFromObject(object, matchTransform);

        // Clone function
        this.clone = function() {
            return new this.constructor(object, lineWidth, boxColor, opacity, matchTransform).copy(this, true);
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
        const array = this._positions;
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

        // Match box transform to object
        if (matchTransform) {
            this.setRotationFromQuaternion(_objQuaternion);
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
            this.points[i].x = this._positions[index + 0];
            this.points[i].y = this._positions[index + 1];
            this.points[i].z = this._positions[index + 2];
        }
        return this.points;
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
        //		Point 0: Right	Top		Front (z positive)
        //		Point 1: Left	Top		Front
        //		Point 2: Left	Down	Front
        //		Point 3: Right	Down	Front
        //		Point 4: Right	Top		Back (z negative)
        //		Point 5: Left	Top		Back
        //		Point 6: Left	Down	Back
        //		Point 7: Right	Down	Back
        const points = this.getLocalPoints();
        targetBox3 = targetBox3 ?? new THREE.Box3();
        targetBox3.min.x = points[6].x;
        targetBox3.min.y = points[6].y;
        targetBox3.min.z = points[6].z;
        targetBox3.max.x = points[0].x;
        targetBox3.max.y = points[0].y;
        targetBox3.max.z = points[0].z;
    }

    getSize(target) {
        this.getWorldScale(_tempScale);
        const points = this.getLocalPoints();
        target.x = (points[0].x - points[6].x) * Math.abs(_tempScale.x);    // Width
        target.y = (points[0].y - points[6].y) * Math.abs(_tempScale.y);    // Height
        target.z = (points[0].z - points[6].z) * Math.abs(_tempScale.z);    // Depth
        // console.info(`Width: ${target.x}, Height: ${target.y}, Depth: ${target.z}`);
    }

    getMaxSize() {
        this.getSize(_tempSize);
        return Math.max(Math.max(_tempSize.x, _tempSize.y), _tempSize.z);
    }
}

/******************** WIREFRAME CLONES ********************/

/** Basic (single pixel) wireframe */
class BasicWireframe extends THREE.LineSegments {
    constructor(object, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
        // Using standard wireframe function
        const wireframeGeometry = new THREE.WireframeGeometry(object.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: wireframeColor,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);

        // Mesh
        super(wireframeGeometry, lineMaterial);
        if (copyObjectTransform) {
            this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
            this.scale.set(object.scale.x, object.scale.y, object.scale.z);
            this.position.set(object.position.x, object.position.y, object.position.z);
        }

        // Clone function
        this.clone = function() {
            return new this.constructor(object, wireframeColor, opacity, copyObjectTransform).copy(this, true);
        }
    }
}

/** Variable line width wireframe */
class FatWireframe extends Wireframe {
    constructor(object, lineWidth, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
        // Geometry - Using fat line functions
        const wireframeGeometry = new WireframeGeometry2(object.geometry);
        const lineMaterial = new LineMaterial({
            color: wireframeColor,
            linewidth: lineWidth,           // in world units with size attenuation, pixels otherwise
            resolution: new THREE.Vector2(500, 500),
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.depthTest = false;

        // Mesh
        super(wireframeGeometry, lineMaterial);
        if (copyObjectTransform) {
            this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
            this.scale.set(object.scale.x, object.scale.y, object.scale.z);
            this.position.set(object.position.x, object.position.y, object.position.z);
        }

        // Clone function
        this.clone = function() {
            return new this.constructor(object, lineWidth, wireframeColor, opacity, copyObjectTransform).copy(this, true);
        }
    }
}

export {
    // Lines
    BasicLine,
    FatLine,
    // Boxes
    BasicWireBox,
    FatWireBox,
    // Wireframe
    BasicWireframe,
    FatWireframe,
};
