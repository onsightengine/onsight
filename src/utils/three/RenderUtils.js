import * as THREE from 'three';
import { CameraUtils } from './CameraUtils.js';
import { Maths } from '../Maths.js';
import { Renderer3D } from '../../app/Renderer3D.js';

// offscreenRenderer()          Offscreen renderer to be shared across the app
// renderGeometryToCanvas()     Render geometry, material, or both
// renderMeshToCanvas()         Render mesh to camera, camera centered on mesh
// renderTextureToCanvas()      Render texture to canvas

let _renderer;

class RenderUtils {

    static offscreenRenderer(width, height) {
        if (_renderer === undefined) {
            _renderer = new Renderer3D({ alpha: true /* transparent background */});
            _renderer.setSize(512, 512, false);
            _renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // NOTE: three 151->152
        }
        if (Maths.isNumber(width) && Maths.isNumber(height)) {
            _renderer.setSize(width, height, false);
        }
        return _renderer;
    }

    /** Render geometry, material, or both */
    static renderGeometryToCanvas(canvas, geometry, material, color = 0xffffff) {
        // Mesh
        const mat = material ?? new THREE.MeshStandardMaterial({ color: color });
        const geo = geometry ?? new THREE.SphereGeometry();
        const mesh = new THREE.Mesh(geo, mat);

        // Render
        RenderUtils.renderMeshToCanvas(canvas, mesh);

        // Cleanup
        if (mesh && typeof mesh.dispose === 'function') mesh.dispose();
        if (!material) mat.dispose();
        if (!geometry) geo.dispose();
    }

    /** Render mesh to camera, camera centered on mesh */
    static renderMeshToCanvas(canvas, mesh) {
        const scene = new THREE.Scene();
        const light = new THREE.HemisphereLight(0xffffff, 0x202020, 2.5);
        scene.add(light);

        const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height);
        camera.position.set(0, 0, 1);

        // Fit Camera
        CameraUtils.fitCameraToObject(camera, mesh);

        // Add to Scene
        const exsistingParent = mesh.parent;
        scene.add(mesh);

        // Render
        const renderer = RenderUtils.offscreenRenderer(canvas.width, canvas.height);
        renderer.render(scene, camera);

        // Replace parent
        scene.remove(mesh);
        if (exsistingParent) exsistingParent.add(mesh);

        // Cleanup
        if (typeof light.dispose === 'function') light.dispose();

        // Copy to canvas
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
        quad.dispose();
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
