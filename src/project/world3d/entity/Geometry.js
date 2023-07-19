import * as THREE from 'three';
import { LoopSubdivision } from 'three-subdivide';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
// import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';
import { CapsuleGeometry } from '../../../utils/three/geometry/CapsuleGeometry.js';
import { CylinderGeometry } from '../../../utils/three/geometry/CylinderGeometry.js';
import { GeometryUtils } from '../../../utils/three/GeometryUtils.js';
import { Maths } from '../../../utils/Maths.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/Geometry.js

const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const circleShape = new THREE.Shape().absarc(0, 0, 0.5 /* radius */);
const wedgeShape = new THREE.Shape([
    new THREE.Vector2(-0.5,  0.5),
    new THREE.Vector2(-0.5, -0.5),
    new THREE.Vector2( 0.5, -0.5),
]);

class Geometry {

    init(data) {
        // Passed in Geometry
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager.addAsset(data);

            // Build 'data'
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }

        // Generate Backend
        let geometry = undefined;
        switch (data.style) {

            case 'asset':
                const assetGeometry = AssetManager.getAsset(data.asset);
                if (assetGeometry && assetGeometry.isBufferGeometry) {
                    geometry = assetGeometry;
                }
                break;

            case 'box':
                geometry = new THREE.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
                break;

            case 'capsule':
                // // THREE.CapsuleGeometry
                // const capHeight = data.height / 2;
                // const capRadius = data.radius / 1.5;
                // geometry = new THREE.CapsuleGeometry(capRadius, capHeight, data.capSegments, data.radialSegments);

                // Custom CapsuleGeometry
                const capRadiusTop = Maths.clamp(data.radiusTop, 0.1, data.height) / 1.5;
                const capRadiusBottom = Maths.clamp(data.radiusBottom, 0.1, data.height) / 1.5;
                const capHeight = data.height / 1.5;
                geometry = new CapsuleGeometry(
                    capRadiusTop, capRadiusBottom, capHeight,
                    data.radialSegments, data.heightSegments,
                    data.capSegments, data.capSegments,
                    data.thetaStart, data.thetaLength);

                // Texture Mapping
                geometry = GeometryUtils.uvMapSphere(geometry, 'v');
                break;

            case 'circle':
                geometry = new THREE.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
                break;

            case 'cone':
                geometry = new CylinderGeometry(0, data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;

            case 'cylinder':
                geometry = new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;

            case 'lathe':
                const points = [];

                let latheShape = AssetManager.getAsset(data.shape);
                if (!latheShape || latheShape.type !== 'Shape') {
                    for (let i = 0; i < 2.5; i += 0.1) {
                        points.push(new THREE.Vector2(Math.abs(Math.cos(i) * 0.4) + 0.2, i * 0.4));
                    }
                } else {
                    const shapePoints = latheShape.getPoints(data.segments);
                    for (let i = 0; i < shapePoints.length; i++) {
                        points.push(new THREE.Vector2(shapePoints[i].x, shapePoints[i].y));
                    }
                }

                // Create Lathe
                geometry = new THREE.LatheGeometry(points, data.segments, 0, data.phiLength);
                geometry.center();
                break;

            case 'plane':
                geometry = new THREE.PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
                break;

            case 'platonicSolid':
                switch (data.polyhedron) {
                    case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(data.radius, data.detail); break;
                    case 'icosahedron': geometry = new THREE.IcosahedronGeometry(data.radius, data.detail); break;
                    case 'octahedron': geometry = new THREE.OctahedronGeometry(data.radius, data.detail); break;
                    case 'tetrahedron': geometry = new THREE.TetrahedronGeometry(data.radius, data.detail); break;
                    default: geometry = new THREE.DodecahedronGeometry(data.radius, data.detail); break;
                }
                break;

            case 'ring':
                geometry = new THREE.RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);
                break;

            case 'roundedBox':
                geometry = new RoundedBoxGeometry(data.width, data.height, data.depth, data.segments, data.radius);
                break;

            case 'shape':
                let shape = AssetManager.getAsset(data.shape);
                if (!shape || shape.type !== 'Shape') {
                    shape = wedgeShape;
                }

                // Set Options
                const options = {
                    depth: data.depth,
                    curveSegments: data.curveSegments,
                    steps: data.steps,
                    bevelEnabled: data.bevelEnabled,
                    bevelThickness: data.bevelThickness,
                    bevelSize: data.bevelSize,
                    bevelSegments: data.bevelSegments,
                };

                // Create Geometry
                geometry = new THREE.ExtrudeGeometry(shape, options);
                // geometry.translate(0, 0, data.depth / -2);
                geometry.center();
                break;

            case 'sphere':
                geometry = new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);
                break;

            case 'torus':
                geometry = new THREE.TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);
                break;

            case 'torusKnot':
                geometry = new THREE.TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q);
                break;

            case 'tube':
                let tubeShape = AssetManager.getAsset(data.shape);
                if (!tubeShape || tubeShape.type !== 'Shape') {
                    tubeShape = circleShape
                }

                // Convert 2D Lines to 3D Lines
                const path3D = new THREE.CurvePath();
                const arcPoints = tubeShape.getPoints(Math.max(256, data.tubularSegments * 4));

                for (let i = 0; i < arcPoints.length - 1; i++) {
                    const pointA = arcPoints[i];
                    const pointB = arcPoints[i + 1];

                    path3D.curves.push(
                        new THREE.LineCurve3(
                            new THREE.Vector3(pointA.x, pointA.y, 0),
                            new THREE.Vector3(pointB.x, pointB.y, 0),
                        ),
                    );
                }

                // Create Geometry
                geometry = new THREE.TubeGeometry(path3D, data.tubularSegments, data.radius, data.radialSegments, data.closed);
                geometry.center();
                break;

            default:
                console.error('Geometry Component: Invalid style ' + data.style);
        }

        // Modifiy Geometry
        if (geometry && geometry.isBufferGeometry) {

            // Saved geometry type as Name
            const geometryName = geometry.constructor.name;

            // // Simplify, TODO: Three.js/Addon is Buggy
            // if (data.simplify < 1) {
            //     const simplifyModifier = new SimplifyModifier()
            //     const count = Math.max(3.0, Math.floor(geometry.attributes.position.count * data.simplify));
			//     let simplifiedGeometry = simplifyModifier.modify(geometry, count);
            //     if (simplifiedGeometry) {
            //         geometry.dispose();
            //         geometry = simplifiedGeometry;
            //     }
            // }

            // Subdivision
            const subdivideParams = {
                split: data.edgeSplit ?? false,
                uvSmooth: data.uvSmooth ?? false,
                flatOnly: data.flatOnly ?? false,
                preserveEdges: false,
                maxTriangles: 25000,
            };

            if (subdivideParams.split || data.subdivide > 0) {
                let subdividedGeometry = LoopSubdivision.modify(geometry, data.subdivide, subdivideParams);
                if (subdividedGeometry) {
                    geometry.dispose();
                    geometry = subdividedGeometry;
                }
            }

            // Map UV Coordinates
            if (data.textureMapping === 'cube') {
                geometry = GeometryUtils.uvMapCube(geometry);
            } else if (data.textureMapping === 'sphere') {
                geometry = GeometryUtils.uvMapSphere(geometry);
            }

            // Texture Wrapping Performed on Geometry
            if (Array.isArray(data.textureWrap)) {
                if (data.textureWrap[0] !== 1 || data.textureWrap[1] !== 1) {
                    const s = Math.max(data.textureWrap[0], 0);
                    const t = Math.max(data.textureWrap[1], 0);
                    GeometryUtils.repeatTexture(geometry, s, t);
                }
            }

            // Set Name to Modified Geometry
            geometry.name = geometryName;

        } else {
            // console.log('Error with geometry!');
        }

        // Save Backend / Data
        this.backend = geometry;
        this.data = data;
    }

    dispose() {

    }

    attach() {
        if (this.entity) {
            const materialComponent = this.entity.getComponent('material');
            if (materialComponent) materialComponent.refreshMesh();
        }
    }

    detach() {
        if (this.entity) {
            const materialComponent = this.entity.getComponent('material');
            if (materialComponent) materialComponent.refreshMesh();
        }
    }

    three() {
        return this.backend;
    }

}

Geometry.config = {
    schema: {
        style: [ { type: 'select', default: 'box', select: [ 'asset', 'box', 'capsule', 'circle', 'cone', 'cylinder', 'lathe', 'plane', 'platonicSolid', 'ring', 'roundedBox', 'shape', 'sphere', 'torus', 'torusKnot', 'tube' ] } ],

        // Asset UUID
        asset: { type: 'asset', class: 'geometry', if: { style: [ 'asset' ] } },

        // Shape UUID
        shape: { type: 'asset', class: 'shape', if: { style: [ 'lathe', 'shape', 'tube' ] } },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Geometry
        polyhedron: [ { type: 'select', default: 'dodecahedron', select: [ 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron' ], if: { style: [ 'platonicSolid' ] } } ],

        points: { type: 'shape', alias: 'points', default: null, if: { style: [ 'lathe' ] } },
        shapes: { type: 'shape', alias: 'shape', default: null, if: { style: [ 'shape' ] } },
        path: { type: 'shape', alias: 'curve', default: null, if: { style: [ 'tube' ] } },

        depth: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'roundedBox' ] } },
            { type: 'number', default: 0.5, min: 0, step: 'grid', if: { style: [ 'shape' ] } },
        ],
        height: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'capsule', 'cone', 'cylinder', 'plane', 'roundedBox' ] } },
        ],
        width: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'plane', 'roundedBox' ] } },
        ],

        widthSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box', 'plane' ] } },
            { type: 'int', default: 24, min: 4, max: 1024, if: { style: [ 'sphere' ] } }
        ],
        heightSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box', 'plane' ] } },
            { type: 'int', default: 1, min: 1, max: 1024, if: { style: [ 'cone', 'cylinder' ] } },
            { type: 'int', default: 24, min: 1, max: 1024, if: { style: [ 'sphere' ] } },
        ],
        depthSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box' ] } },
        ],

        radius: [
            { type: 'number', default: 0.25, min: 0, step: 0.01, if: { style: [ 'roundedBox' ] } },
            { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'circle', 'cone', 'platonicSolid', 'sphere' ] } },
            { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'torus' ] } },
            { type: 'number', default: 0.40, min: 0, step: 0.01, if: { style: [ 'torusKnot' ] } },
            { type: 'number', default: 0.10, min: 0, step: 0.01, if: { style: [ 'tube' ] } },
        ],
        radiusTop: [
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'capsule' ] } },
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'cylinder' ] } },
        ],
        radiusBottom: [
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'capsule' ] } },
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'cylinder' ] } },
        ],

        segments: [
            { type: 'int', default: 36, min: 3, max: 64, if: { style: [ 'circle' ] } },
            { type: 'int', default: 16, min: 1, max: 64, if: { style: [ 'lathe' ] } },
            { type: 'int', default: 4, min: 1, max: 10, if: { style: [ 'roundedBox' ] } },
        ],

        thetaLength: [
            { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'circle', 'ring' ] } },
            { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, promode: true, if: { style: [ 'capsule', 'cone', 'cylinder' ] } },
            { type: 'angle', default: Math.PI, min: 0, max: 720, promode: true, if: { style: [ 'sphere' ] } }
        ],
        thetaStart: [
            { type: 'angle', default: 0, if: { style: [ 'circle', 'ring', 'sphere' ] } },
            { type: 'angle', default: 0, promode: true, if: { style: [ 'capsule', 'cone', 'cylinder' ] } },
        ],
        phiLength: { type: 'angle', default: 2 * Math.PI, max: 360, if: { style: [ 'lathe', 'sphere' ] } },
        phiStart: { type: 'angle', default: 0, if: { style: [ 'sphere' ] } },

        capSegments: { type: 'int', default: 6, min: 1, max: 36, if: { style: [ 'capsule' ] } },
        radialSegments: [
            { type: 'int', default: 24, min: 2, max: 64, if: { style: [ 'capsule', 'cone', 'cylinder', 'torus', 'torusKnot', 'tube' ] } },
        ],

        openEnded: { type: 'boolean', default: false, if: { style: [ 'cone', 'cylinder' ] } },

        detail: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, if: { style: [ 'platonicSolid' ] } },

        // Ring
        innerRadius: { type: 'number', default: 0.25, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
        outerRadius: { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
        phiSegments: { type: 'int', default: 10, min: 1, max: 64, promode: true, if: { style: [ 'ring' ] } },
        thetaSegments: { type: 'int', default: 36, min: 3, max: 128, if: { style: [ 'ring' ] } },

        // Shape (Extrude)
        steps: { type: 'int', alias: 'Depth Segments', default: 3, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        bevelEnabled: { type: 'boolean', alias: 'bevel', default: false, if: { style: [ 'shape' ] }, rebuild: true },
        bevelThickness: { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSize: { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSegments: { type: 'int', default: 4, min: 0, max: 64, promode: true, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        curveSegments: { type: 'int', default: 16, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        // ... more
        // extrudePath — THREE.Curve - 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion
        // UVGenerator — Object. object that provides UV generator functions

        // Torus / Torus Knot
        tube: [
            { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'torus' ] } },
            { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'torusKnot' ] } },
        ],
        tubularSegments: [
            { type: 'int', default: 32, min: 3, max: 128, if: { style: [ 'torus' ] } },
            { type: 'int', default: 64, min: 3, max: 128, if: { style: [ 'torusKnot' ] } },
            { type: 'int', default: 128, min: 2, if: { style: [ 'tube' ] } },
        ],
        arc: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'torus' ] } },

        p: { type: 'number', default: 2, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },
        q: { type: 'number', default: 3, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },

        // Tube
        closed: { type: 'boolean', default: true, if: { style: [ 'tube' ] } },

        // DIVIDER
        modifierDivider: { type: 'divider' },

        // // Simplify
        // simplify: { type: 'slider', default: 1, min: 0, max: 1 },

        // Subdivision
        subdivide: { type: 'slider', default: 0, min: 0, max: 3, step: 1, precision: 0, rebuild: true },
        edgeSplit: { type: 'boolean', default: false, hide: { subdivide: [ 0 ] } },
        uvSmooth: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        flatOnly: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        // maxTriangles: { type: 'number', default: 25000, min: 1, promode: true },

        // DIVIDER
        textureDivider: { type: 'divider' },

        // Texture Mapping
        textureMapping: [
            { type: 'select', default: 'cube', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'shape' ] } },
            { type: 'select', default: 'none', select: [ 'none', 'cube', 'sphere' ], not: { style: [ 'shape' ] } },
        ],

        // Texture Wrapping
        textureWrap: { type: 'vector', size: 2, tint: false, default: [ 1, 1 ], min: 0, step: 0.2, precision: 2, label: [ 'X', 'Y' ] },

    },
    // EXAMPLE: Svg Icon for Inspector Tab (built in components have images built into Editor)
    // icon: `<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>`,
    icon: ``,
    color: 'rgb(255, 113, 0)',
    dependencies: [ 'material' ],
    group: [ 'Entity3D' ],
};

ComponentManager.register('geometry', Geometry);
