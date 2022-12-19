/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Reference(s)
//      https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
//      https://stackoverflow.com/questions/34958072/programmatically-generate-simple-uv-mapping-for-models
//      https://discourse.threejs.org/t/can-i-make-a-uv-unwrapping-of-a-model-programmatically-with-three-js/2421/6
//      https://codepen.io/knee-cola/pen/XMVBwQ
//
/////////////////////////////////////////////////////////////////////////////////////
//
//  Geometry Utility Functions
//      addAttribute                Adds attribute to geometry
//      coloredMesh                 Converts mesh to be able to used custom colored triangles (painting)
//      modelSize                   Finds max / min geometry Size
//      repeatTexture               Multiplies uv coordinates in geometry to repeat texture
//      uvFlip                      Flip uv coordinates
//      uvMapCube                   Maps uv coordinates onto an object that fits inside a cube
//      uvMapSphere                 Maps uv coordinates onto an object that fits inside a sphere
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { Vectors } from '../math/Vectors.js';

///// Local Variables

const _uv = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];
const _vertex = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
const _temp = new THREE.Vector3();

//////////////////// Class

class GeometryUtils {

    static addAttribute(geometry, attributeName = 'color', stride = 3, fill = 0) {
        if (! geometry.getAttribute(attributeName)) {
            let array = new Float32Array(geometry.attributes.position.count * stride).fill(fill)
	        const attribute = new THREE.BufferAttribute(array, stride, true).setUsage(THREE.DynamicDrawUsage);
	        geometry.setAttribute(attributeName, attribute);
        }
        return geometry;
    }

    /** Converts mesh to be able to used custom colored triangles (painting) */
    static coloredMesh(mesh) {
        if (! mesh.geometry) return mesh;
        if (! mesh.material) return mesh;

        ///// MATERIAL

        // Enable Vertex Colors
        let material = mesh.material;
        if (Array.isArray(material) !== true) material = [ mesh.material ];
        for (let i = 0; i < material.length; i++) {
            if (material[i].vertexColors !== true) {
                material[i].vertexColors = true;
                material[i].needsUpdate = true;
            }
        }

        ///// GEOMETRY

        // Add Color Attribute (if not already)
        GeometryUtils.addAttribute(mesh.geometry, 'color', 3, 1.0);

        // Return Altered Mesh
        return mesh;
    }

    /** Finds max / min geometry Size */
    static modelSize(geometry, type = 'max') {
        let boxSize = new THREE.Vector3();
        geometry.computeBoundingBox();
        geometry.boundingBox.getSize(boxSize);
        // // OPTION: Maximum size
        if (type === 'max') {
            return Math.max(boxSize.x, boxSize.y, boxSize.z);
        } else /* 'min' */ {
            return Math.min(boxSize.x, boxSize.y, boxSize.z);
        }
    }

    /** Multiplies uv coordinates in geometry to repeat texture */
    static repeatTexture(geometry, s, t) {
        if (! geometry) return;
        if (geometry.attributes && geometry.attributes.uv && geometry.attributes.uv.array) {
            for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
                geometry.attributes.uv.array[i + 0] *= s;
                geometry.attributes.uv.array[i + 1] *= t;
            }
            geometry.attributes.uv.needsUpdate = true;
        }
    }

    /** Flip uv coordinates */
    static uvFlip(geometry, x = true, y = true) {
        if (! geometry || ! geometry.isBufferGeometry) return;
        if (geometry.attributes.uv === undefined) return;

        for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
            let u = geometry.attributes.uv.array[i + 0];
            let v = geometry.attributes.uv.array[i + 1];
            if (x) u = 1.0 - u;
            if (y) v = 1.0 - v;
            geometry.attributes.uv.array[i + 0] = u;
            geometry.attributes.uv.array[i + 1] = v;
        }
    }

    /** Maps uv coordinates onto an object that fits inside a cube */
    static uvMapCube(geometry, transformMatrix, frontFaceOnly = false) {

        // Ensure non-indexed geometry for front face only
        if (frontFaceOnly) {
            if (geometry.index !== null) {
                const nonIndexed = geometry.toNonIndexed();
                geometry.dispose();
                geometry = nonIndexed;
            }
        }

        // Make sure we have a transform matrix
        if (transformMatrix === undefined) transformMatrix = new THREE.Matrix4();

        // Find Geometry Size
        let geometrySize = GeometryUtils.modelSize(geometry);

        // Create Cube based on Geometry Size
        let size = (geometrySize / 2);
        let bbox = new THREE.Box3(new THREE.Vector3(-size, -size, -size), new THREE.Vector3(size, size, size));
        let boxCenter = new THREE.Vector3();
        geometry.boundingBox.getCenter(boxCenter);

        // Align cube center with geometry center
        const centerMatrix = new THREE.Matrix4().makeTranslation(-boxCenter.x, -boxCenter.y, -boxCenter.z);

        // Prepare UV Coordinates
        const coords = [];
        coords.length = 2 * geometry.attributes.position.array.length / 3;

        // Vertex Positions
        const pos = geometry.attributes.position.array;

        // Indexed BufferGeometry
        if (geometry.index) {
            for (let vi = 0; vi < geometry.index.array.length; vi += 3) {
                const idx0 = geometry.index.array[vi + 0];
                const idx1 = geometry.index.array[vi + 1];
                const idx2 = geometry.index.array[vi + 2];
                const v0 = new THREE.Vector3(pos[(3 * idx0) + 0], pos[(3 * idx0) + 1], pos[(3 * idx0) + 2]);
                const v1 = new THREE.Vector3(pos[(3 * idx1) + 0], pos[(3 * idx1) + 1], pos[(3 * idx1) + 2]);
                const v2 = new THREE.Vector3(pos[(3 * idx2) + 0], pos[(3 * idx2) + 1], pos[(3 * idx2) + 2]);
                calculateUVs(v0, v1, v2);
                coords[2 * idx0 + 0] = _uv[0].x;
                coords[2 * idx0 + 1] = _uv[0].y;
                coords[2 * idx1 + 0] = _uv[1].x;
                coords[2 * idx1 + 1] = _uv[1].y;
                coords[2 * idx2 + 0] = _uv[2].x;
                coords[2 * idx2 + 1] = _uv[2].y;
            }

        // Non-Indexed Geometry
        } else {
            for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
                const v0 = new THREE.Vector3(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
                const v1 = new THREE.Vector3(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
                const v2 = new THREE.Vector3(pos[vi + 6], pos[vi + 7], pos[vi + 8]);
                calculateUVs(v0, v1, v2);
                const idx0 = vi / 3;
                const idx1 = idx0 + 1;
                const idx2 = idx0 + 2;
                coords[2 * idx0 + 0] = _uv[0].x;
                coords[2 * idx0 + 1] = _uv[0].y;
                coords[2 * idx1 + 0] = _uv[1].x;
                coords[2 * idx1 + 1] = _uv[1].y;
                coords[2 * idx2 + 0] = _uv[2].x;
                coords[2 * idx2 + 1] = _uv[2].y;
            }
        }

        // Assign Coordinates
        if (geometry.attributes.uv === undefined) {
            geometry.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));
        }
        geometry.attributes.uv.array = new Float32Array(coords);
        geometry.attributes.uv.needsUpdate = true;
        return geometry;

        /////

        function calcNormal(target, vec1, vec2, vec3) {
            _temp.subVectors(vec1, vec2);
            target.subVectors(vec2, vec3);
            target.cross(_temp).normalize();
            Vectors.round(target, 5);
        }

        // Maps 3 vertices of 1 triangle on the better side of the cube, sides of the cube can be XY, XZ or YZ
        function calculateUVs(v0, v1, v2) {

            // Pre-rotate the model so that cube sides match world axis
            v0.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
            v1.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
            v2.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);

            // Get normal of the triangle, to know into which cube side it maps better
            const n = new THREE.Vector3();
            calcNormal(n, v0, v1, v2);

            _uv[0].set(0, 0, 0);
            _uv[1].set(0, 0, 0);
            _uv[2].set(0, 0, 0);

            // Front Face Only
            if (frontFaceOnly) {
                let frontFace = (n.z < 0);
                frontFace = frontFace && (Math.abs(n.y) < 0.866); // i.e. ~30°
                frontFace = frontFace && (Math.abs(n.x) < 0.866); // i.e. ~30°

                if (frontFace) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                }

            // All Six Sides
            } else {
                n.x = Math.abs(n.x);
                n.y = Math.abs(n.y);
                n.z = Math.abs(n.z);

                // XZ mapping
                if (n.y > n.x && n.y > n.z) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (bbox.max.z - v0.z) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (bbox.max.z - v1.z) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (bbox.max.z - v2.z) / geometrySize;

                // XY Mapping
                } else if (n.x > n.y && n.x > n.z) {
                    _uv[0].x = (v0.z - bbox.min.z) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.z - bbox.min.z) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.z - bbox.min.z) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;

                // XZ Mapping
                } else if (n.z > n.y && n.z > n.x) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                }
            }
        }

    } // end uvMapCube

    /** Maps uv coordinates onto an object that fits inside a sphere */
    static uvMapSphere(geometry, setCoords = 'uv') {

        // Convert to Non-Indexed
        if (geometry.index !== null) {
            const nonIndexed = geometry.toNonIndexed();
            nonIndexed.uuid = geometry.uuid;
            nonIndexed.name = geometry.name;
            geometry.dispose();
            geometry = nonIndexed;
        }

        // UV Coordinate Array
        const coords = [];
        coords.length = 2 * geometry.attributes.position.array.length / 3;

        // Check for Existing UV Array
        const hasUV = ! (geometry.attributes.uv === undefined);
        if (! hasUV) geometry.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));

        // Should we set, u, v, or both
        const setU = (! hasUV || setCoords === 'u' || setCoords === 'uv');
        const setV = (! hasUV || setCoords === 'v' || setCoords === 'uv');

        // Vertex Positions
        const pos = geometry.attributes.position.array;

        // Non-Indexed Geometry
        for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
            _vertex[0].set(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
            _vertex[1].set(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
            _vertex[2].set(pos[vi + 6], pos[vi + 7], pos[vi + 8]);

            let index = vi / 3;
            for (let i = 0; i < 3; i++) {
                const polar = cartesian2polar(_vertex[i]);

                // Top / Bottom Vertex.x Coordinate is 0, points are alligned a little differently on top / bottom.
                if (polar.theta === 0 && (polar.phi === 0 || polar.phi === Math.PI)) {
                    const alignedVertex = (polar.phi === 0) ? '1' : '0';
                    polar.theta = cartesian2polar(_vertex[alignedVertex]).theta;
                }

                setUV(polar, index, i);
                index++;
            }

            // To check for overwrap, compare x values
            let overwrap = false;
            if (Math.abs(_uv[0].x - _uv[1].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[0].x - _uv[2].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[1].x - _uv[0].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[1].x - _uv[2].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[2].x - _uv[0].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[2].x - _uv[1].x) > 0.75) overwrap = true;

            if (overwrap) {
                let index = vi / 3;
                for (let i = 0; i < 3; i++) {
                    const x = coords[2 * index]
                    if (x > 0.75) coords[2 * index] = 0;
                    index++;
                }
            }
        }

        // Assign Coordinates
        geometry.attributes.uv.array = new Float32Array(coords);
        geometry.attributes.uv.needsUpdate = true;
        return geometry;

        //////////

        function setUV(polarVertex, index, i) {
            const canvasPoint = polar2canvas(polarVertex);
            const uv = new THREE.Vector2(1 - canvasPoint.x, 1 - canvasPoint.y);
            const indexU = 2 * index + 0;
            const indexV = 2 * index + 1;
            coords[indexU] = (setU) ? uv.x : geometry.attributes.uv.array[indexU];
            coords[indexV] = (setV) ? uv.y : geometry.attributes.uv.array[indexV];
            _uv[i].x = coords[indexU];
            _uv[i].y = coords[indexV];
        }

        function cartesian2polar(position) {
            let sqrd = (position.x * position.x) + (position.y * position.y) + (position.z * position.z);
            let radius = Math.sqrt(sqrd);

            return({
                r: radius,
                theta: Math.atan2(position.z, position.x),          // x
                phi: Math.acos(position.y / radius)                 // y
            });
        }

        function polar2canvas(polarPoint) {
            return({
                x: (polarPoint.theta + Math.PI) / (2 * Math.PI),    // theta
                y: (polarPoint.phi / Math.PI)                       // phi
            });
        }

    } // end uvMapShere

}

export { GeometryUtils };