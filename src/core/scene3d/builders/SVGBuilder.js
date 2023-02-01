import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

import { Entity3D } from '../Entity3D.js';
import { GeometryUtils } from '../../../three/GeometryUtils.js';
import { ObjectUtils } from '../../../three/ObjectUtils.js';
import { Strings } from '../../../utils/Strings.js';
import { Vectors } from '../../../utils/Vectors.js';

// createFromPaths()        Builds Object3D from SVG paths
// createFromFile()         Builds Object3D from SVG file

const _color = new THREE.Color();
const _position = new THREE.Vector3();

class SVGBuilder {

    static createFromPaths(target, paths, onLoad, name = '') {
        const drawFills = true;
        const drawStrokes = true;

        let startZ = 0, zStep = 0.001;
        let fillNumber = 0, strokeNumber = 0;

        ///// Process Paths
        paths.forEach((path) => {
            let fillColor = path.userData.style.fill;
            let fillOpacity = path.userData.style.fillOpacity;
            if (! fillOpacity && fillOpacity !== 0) fillOpacity = 1;

            ///// Fills
            if (drawFills && fillColor !== undefined && fillColor !== 'none') {
                const shapes = SVGLoader.createShapes(path);
                shapes.forEach((shape) => {

                    let entityName = `Fill ${fillNumber}`
                    if (name !== '') entityName = name + ' ' + entityName;

                    const entity = new Entity3D(entityName);
                    const depth = 0.256;
                    const scaleDown = 0.001; /* 1 unit === 1000 pixels */

                    function scaleCurve(curve) {
                        if (curve.v0) curve.v0.multiplyScalar(scaleDown);
                        if (curve.v1) curve.v1.multiplyScalar(scaleDown);
                        if (curve.v2) curve.v2.multiplyScalar(scaleDown);
                        if (curve.v3) curve.v3.multiplyScalar(scaleDown);
                        if (curve.aX) curve.aX *= scaleDown;
                        if (curve.aY) curve.aY *= scaleDown;
                        if (curve.xRadius) curve.xRadius *= scaleDown;
                        if (curve.yRadius) curve.yRadius *= scaleDown;
                        //
                        // TODO: Scale down CatmullRomCurve3 points?
                        //
                    }

                    // Scale Down Curves
                    for (let c = 0; c < shape.curves.length; c++) scaleCurve(shape.curves[c]);

                    // Scale Down Holes
                    for (let h = 0; h < shape.holes.length; h++) {
                        for (let c = 0; c < shape.holes[h].curves.length; c++) {
                            scaleCurve(shape.holes[h].curves[c]);
                        }
                    }

                    // // OPTION: Shape
                    // const geometry = new THREE.ShapeGeometry(shape);

                    // // OPTION: Extruded
                    const geometry = new THREE.ExtrudeGeometry(shape, {
                        depth: depth,
                        bevelEnabled: false,
                        bevelThickness: 0.25,
                        bevelSegments: 8,
                        curveSegments: 16,
                        steps: 4,
                    });

                    // Set Name
                    geometry.name = entityName;

                    // Adjust Depth
                    geometry.translate(0, 0, depth / -2);
                    geometry.scale(1, -1, -1);

                    // Center Geometry
                    geometry.computeBoundingBox();
                    geometry.boundingBox.getCenter(_position);
                    geometry.center();
                    entity.position.copy(_position);

                    // Flip UVs
                    GeometryUtils.uvFlip(geometry, false /* x */, true /* y */);

                    // Geometry Component
                    entity.addComponent('geometry', geometry);

                    // Material Component
	                entity.addComponent('material', {
                        style: 'standard',
                        side: 'FrontSide', // 'DoubleSide',
                        color: _color.setStyle(fillColor).getHex(),
                        opacity: fillOpacity,
                    });

                    entity.position.z = startZ;
                    target.add(entity);

                    startZ += zStep;
                    fillNumber++;
                });
            }

            // ///// TODO: SVG Strokes
            //
            // const strokeColor = path.userData.style.stroke;
            // const strokeOpacity = path.userData.style.strokeOpacity;
            // if (! strokeOpacity && strokeOpacity !== 0) strokeOpacity = 1;

            // if (drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
            //     for (let j = 0; j < path.subPaths.length; j++) {
            //         const geometry = SVGLoader.pointsToStroke(path.subPaths[j].getPoints(), path.userData.style);
            //         if (geometry) {

            //             const entity = new Entity3D(`Stroke ${strokeNumber}`);
            //             entity.addComponent('geometry', new THREE.ShapeGeometry(shape));
            //             entity.addComponent('material', {
            //                 style: 'standard',
            //                 side: 'DoubleSide',
            //                 // color: _color.setStyle(fillColor).convertSRGBToLinear().getHex(),
            //                 color: _color.setStyle(strokeColor).getHex(),
            //                 opacity: strokeOpacity,
            //             });

            //             // // Alternate (Edge Geometry)
            //             // const stokeMaterial = new THREE.LineBasicMaterial({ color: "#00A5E6" });
            //             // const lines = new THREE.LineSegments(new THREE.EdgesGeometry(meshGeometry), stokeMaterial);
            //             // target.add(lines);

            //             entity.position.z = startZ;
            //             target.add(entity);

            //             startZ += zStep;
            //             strokeNumber++;
            //         }
            //     }
            // }

        });

        // Center elements, Flip x, y axis for gpu space
        if (target.children && target.children.length > 0) {
            const center = new THREE.Vector3();
            ObjectUtils.computeCenter(target.children, center);
            for (let child of target.children) {
                child.position.x -= (center.x - target.position.x);
                child.position.y -= (center.y - target.position.y);
            }
        }

        // Name
        target.name = name;

        // Call 'onLoad'
        if (onLoad && typeof onLoad === 'function') onLoad(target);
    }

    static createFromFile(url, onLoad) {
        const svgGroup = new Entity3D();
        const loader = new SVGLoader();
        loader.load(url, function(data) {
            SVGBuilder.createFromPaths(svgGroup, data.paths, onLoad, Strings.nameFromUrl(url));
        });
        return svgGroup;
    }

}

export { SVGBuilder };