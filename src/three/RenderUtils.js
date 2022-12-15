/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Render Utility Functions
//      offscreenRenderer           Offscreen renderer to be shared across the app
//      renderGeometryToCanvas      Render geometry to canvas, camera centered on geometry
//      renderTextureToCanvas       Render texture to canvas
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { CameraUtils } from './CameraUtils.js';
import { MathUtils } from '../math/MathUtils.js';

///// Local Variables

let _renderer;

///// Class

class RenderUtils {

    static offscreenRenderer(width, height) {
        if (_renderer === undefined) {
            _renderer = new THREE.WebGLRenderer({ alpha: true /* transparent background */});
            _renderer.setClearColor(0xffffff, 0);
            _renderer.setSize(512, 512, false);
        }
        if (MathUtils.isNumber(width) && MathUtils.isNumber(height)) {
            _renderer.setSize(width, height, false);
        }
        return _renderer;
    }

    /** Render geometry, camera centered on geometry */
    static renderGeometryToCanvas(canvas, geometry, geometryColor = 0xffffff) {
        const scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 1.5));

        const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height);
        camera.position.set(0, 0, 1);

        // Mesh
        const material = new THREE.MeshStandardMaterial({ color: geometryColor });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Fit Camera
        CameraUtils.fitCameraToObject(camera, mesh);

        // Render
        const renderer = RenderUtils.offscreenRenderer(canvas.width, canvas.height);
        renderer.render(scene, camera);

        // Cleanup
        material.dispose();

        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
        }
    }

    /** Render texture to canvas */
    static renderTextureToCanvas(canvas, texture) {
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: true });
        const quad = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(quad, material);
        scene.add(mesh);

        const image = texture.image;
        const renderer = RenderUtils.offscreenRenderer(image.width, image.height);
        renderer.render(scene, camera);
        material.dispose();

        const context = canvas.getContext('2d');
        if (context) {
            const sAspect = image.width / image.height;
            const dAspect = canvas.width / canvas.height;
            let dx, dy, dw, dh, shrink;
            if (sAspect < dAspect) {
                dh = (image.height > canvas.height) ? canvas.height : image.height;
                shrink = Math.min(1, canvas.height / image.height);
                dw = image.width * shrink;
            } else {
                dw = (image.width > canvas.width) ? canvas.width : image.width;
                shrink = Math.min(1, canvas.width / image.width);
                dh = image.height * shrink;
            }
            dx = (canvas.width - dw) / 2;
            dy = (canvas.height - dh) / 2;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, image.width, image.height, dx, dy, dw, dh);
        }
    }

}

export { RenderUtils };
