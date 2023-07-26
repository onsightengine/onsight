import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';

function setWireframeMaterialDefaults(material) {
    material.transparent = true;
    // material.vertexColors = false;
    // material.dashed = false;

    material.depthTest = true;
    material.depthWrite = false;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1; // positive value pushes polygon further away

    material.side = THREE.DoubleSide;

    material.alphaToCoverage = true;
    //material.depthFunc = THREE.AlwaysDepth;
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
        material.resolution = new THREE.Vector2(1024, 1024);

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
    BasicWireframe,
    FatWireframe,
};
