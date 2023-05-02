/**
 * @description CapsuleGeometry
 * @about       CapsuleGeometry as a new geometry primitive for Three.js
 * @author      maximequiblier <maximeq>
 * @license     MIT - Copyright (c) 2019 maximequiblier
 * @source      https://github.com/maximeq/three-js-capsule-geometry
 * @version     Aug 6, 2021
 */

import * as THREE from 'three';
import { Maths } from '../../Maths.js';

class CapsuleGeometry extends THREE.BufferGeometry {

    constructor(radiusTop = 1, radiusBottom = 1, height = 2, radialSegments = 12, heightSegments = 1,
                capsTopSegments = 5, capsBottomSegments = 5, thetaStart, thetaLength) {
        super();

        this.type = 'CapsuleGeometry';

        this.parameters = {
            radiusTop: radiusTop,               //
            radiusBottom: radiusBottom,         //
            height: height,                     //
            radialSegments: radialSegments,     //
            heightSegments: heightSegments,     //
            thetaStart: thetaStart,             //
            thetaLength: thetaLength,           //
        };

        radiusTop = radiusTop !== undefined ? radiusTop : 1;
        radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
        height = height !== undefined ? height : 2;

        radiusTop = Maths.clamp(radiusTop, 0.001, height);
        radiusBottom = Maths.clamp(radiusBottom, 0.001, height);
        if (height < 0.001) height = 0.001;

        radialSegments = Math.floor(radialSegments) || 12;
        heightSegments = Math.floor(heightSegments) || 1;
        capsTopSegments = Math.floor(capsTopSegments) || 5;
        capsBottomSegments = Math.floor(capsBottomSegments) || 5;

        thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
        thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI;

        // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
        let alpha = Math.acos((radiusBottom-radiusTop) / height);
        let eqRadii = (radiusTop-radiusBottom === 0);

        let vertexCount = calculateVertexCount();
        let indexCount = calculateIndexCount();

        // buffers
        let indices = new THREE.BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount), 1);
        let vertices = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let normals = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let uvs = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2);

        // helper variables
        let index = 0;
        let indexOffset = 0;
        let indexArray = [];
        let halfHeight = height / 2;

        // generate geometry
        generateTorso();

        // build geometry
        this.setIndex(indices);
        this.setAttribute('position', vertices);
        this.setAttribute('normal', normals);
        this.setAttribute('uv', uvs);

        // helper functions

        function calculateVertexCount(){
            let count = (radialSegments + 1) * (heightSegments + 1 + capsBottomSegments + capsTopSegments);
            return count;
        }

        function calculateIndexCount() {
            let count = radialSegments * (heightSegments + capsBottomSegments + capsTopSegments) * 2 * 3;
            return count;
        }

        function generateTorso() {
            let x, y;
            let normal = new THREE.Vector3();
            let vertex = new THREE.Vector3();

            let cosAlpha = Math.cos(alpha);
            let sinAlpha = Math.sin(alpha);

            let cone_length =
                new THREE.Vector2(radiusTop * sinAlpha, halfHeight + radiusTop * cosAlpha)
                    .sub(new THREE.Vector2(radiusBottom * sinAlpha, -halfHeight + radiusBottom * cosAlpha))
                    .length();

            // Total length for v texture coord
            let vl = radiusTop * alpha
                    + cone_length
                    + radiusBottom * ((Math.PI / 2) - alpha);

            let groupCount = 0;

            // generate vertices, normals and uvs

            let v = 0;
            for (y = 0; y <= capsTopSegments; y++) {
                let indexRow = [];
                let a = (Math.PI / 2) - alpha * (y / capsTopSegments);
                v += radiusTop * alpha / capsTopSegments;

                let cosA = Math.cos(a);
                let sinA = Math.sin(a);

                // calculate the radius of the current row
                let radius = cosA * radiusTop;

                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);

                    // vertex
                    vertex.x = radius * sinTheta;
                    vertex.y = halfHeight + sinA * radiusTop;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                    // normal
                    normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                    normals.setXYZ(index, normal.x, normal.y, normal.z);

                    // uv
                    uvs.setXY(index, u, 1 - v/vl);

                    // save index of vertex in respective row
                    indexRow.push(index);

                    // increase index
                    index ++;
                }

                // now save vertices of the row in our index array
                indexArray.push(indexRow);
            }

            let cone_height = height + cosAlpha * radiusTop - cosAlpha * radiusBottom;
            let slope = sinAlpha * (radiusBottom - radiusTop) / cone_height;
            for (y = 1; y <= heightSegments; y++) {
                let indexRow = [];

                v += cone_length / heightSegments;

                // calculate the radius of the current row
                let radius = sinAlpha * (y * (radiusBottom - radiusTop) / heightSegments + radiusTop);

                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);

                    // vertex
                    vertex.x = radius * sinTheta;
                    vertex.y = halfHeight + cosAlpha * radiusTop - y * cone_height / heightSegments;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                    // normal
                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.setXYZ(index, normal.x, normal.y, normal.z);

                    // uv
                    uvs.setXY(index, u, 1 - v / vl);

                    // save index of vertex in respective row
                    indexRow.push(index);

                    // increase index
                    index ++;
                }

                // now save vertices of the row in our index array
                indexArray.push(indexRow);
            }

            for (y = 1; y <= capsBottomSegments; y++) {
                let indexRow = [];
                let a = ((Math.PI / 2) - alpha) - (Math.PI - alpha) * (y / capsBottomSegments);
                v += radiusBottom * alpha / capsBottomSegments;
                let cosA = Math.cos(a);
                let sinA = Math.sin(a);

                // calculate the radius of the current row
                let radius = cosA * radiusBottom;

                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);

                    // vertex
                    vertex.x = radius * sinTheta;
                    vertex.y = -halfHeight + sinA * radiusBottom;;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                    // normal
                    normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                    normals.setXYZ(index, normal.x, normal.y, normal.z);

                    // uv
                    uvs.setXY(index, u, 1 - v / vl);

                    // save index of vertex in respective row
                    indexRow.push(index);

                    // increase index
                    index++;
                }

                // now save vertices of the row in our index array
                indexArray.push( indexRow );
            }

            // generate indices
            for (x = 0; x < radialSegments; x++) {
                for (y = 0; y < capsTopSegments + heightSegments + capsBottomSegments; y++) {

                    // we use the index array to access the correct indices
                    let i1 = indexArray[y][x];
                    let i2 = indexArray[y + 1][x];
                    let i3 = indexArray[y + 1][x + 1];
                    let i4 = indexArray[y][x + 1];

                    // face one
                    indices.setX(indexOffset, i1); indexOffset++;
                    indices.setX(indexOffset, i2); indexOffset++;
                    indices.setX(indexOffset, i4); indexOffset++;

                    // face two
                    indices.setX(indexOffset, i2); indexOffset++;
                    indices.setX(indexOffset, i3); indexOffset++;
                    indices.setX(indexOffset, i4); indexOffset++;
                }
            }
        }
    }

    static fromPoints(pointA, pointB, radiusA, radiusB, radialSegments, heightSegments,
            capsTopSegments, capsBottomSegments, thetaStart, thetaLength) {
        let cmin = null;
        let cmax = null;
        let rmin = null;
        let rmax = null;

        if(radiusA > radiusB){
            cmax = pointA;
            cmin = pointB;
            rmax = radiusA;
            rmin = radiusB;
        }else{
            cmax = pointA;
            cmin = pointB;
            rmax = radiusA;
            rmin = radiusB;
        }

        const c0 = cmin;
        const c1 = cmax;
        const r0 = rmin;
        const r1 = rmax;

        const sphereCenterTop = new THREE.Vector3(c0.x, c0.y, c0.z);
        const sphereCenterBottom = new THREE.Vector3(c1.x, c1.y, c1.z);

        const radiusTop = r0;
        const radiusBottom = r1;
        let height = sphereCenterTop.distanceTo(sphereCenterBottom);

        // If the big sphere contains the small one, return a SphereGeometry
        if (height < Math.abs(r0 - r1)){
            let g = new THREE.SphereGeometry(r1, radialSegments, capsBottomSegments, thetaStart, thetaLength);
            g.translate(r1.x, r1.y, r1.z);
            return g;
        }

        // useful values
        const alpha = Math.acos((radiusBottom - radiusTop) / height);
        const cosAlpha = Math.cos(alpha);

        // compute rotation matrix
        const rotationMatrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const capsuleModelUnitVector = new THREE.Vector3(0, 1, 0);
        const capsuleUnitVector = new THREE.Vector3();
        capsuleUnitVector.subVectors(sphereCenterTop, sphereCenterBottom);
        capsuleUnitVector.normalize();
        quaternion.setFromUnitVectors(capsuleModelUnitVector, capsuleUnitVector);
        rotationMatrix.makeRotationFromQuaternion(quaternion);

        // compute translation matrix from center point
        const translationMatrix = new THREE.Matrix4();
        const cylVec = new THREE.Vector3();
        cylVec.subVectors(sphereCenterTop, sphereCenterBottom);
        cylVec.normalize();
        let cylTopPoint = new THREE.Vector3();
        cylTopPoint = sphereCenterTop;
        cylTopPoint.addScaledVector(cylVec, cosAlpha * radiusTop);
        let cylBottomPoint = new THREE.Vector3();
        cylBottomPoint = sphereCenterBottom;
        cylBottomPoint.addScaledVector(cylVec, cosAlpha * radiusBottom);

        // computing lerp for color
        const dir = new THREE.Vector3();
        dir.subVectors(cylBottomPoint, cylTopPoint);
        dir.normalize();

        const middlePoint = new THREE.Vector3();
        middlePoint.lerpVectors(cylBottomPoint, cylTopPoint, 0.5);
        translationMatrix.makeTranslation(middlePoint.x, middlePoint.y, middlePoint.z);

        // Instanciate a CylinderGeometry from three.js
        let g = new CapsuleGeometry(radiusBottom, radiusTop, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength);

        // applying transformations
        g.applyMatrix(rotationMatrix);
        g.applyMatrix(translationMatrix);

        return g;
    }

}

export { CapsuleGeometry };
