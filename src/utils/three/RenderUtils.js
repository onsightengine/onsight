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
        const light = new THREE.HemisphereLight(0xffffff, 0x202020, 7.5);
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

        let sAspect = 1;
        let camera, material, geometry, mesh;
        if (!texture.isCubeTexture) {
            const image = texture.image;
            if (!image || !image.complete) return;
            sAspect = image.width / image.height;
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: true });
            geometry = new THREE.PlaneGeometry(2, 2);
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        } else if (texture.isCubeTexture) {
            camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height);
            camera.position.set(0, 0, -3);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            const shader = THREE.ShaderLib.cube;
            material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: THREE.UniformsUtils.clone(shader.uniforms),
                depthWrite: false,
                side: THREE.BackSide,
            });
            material.uniforms.tCube.value = texture;
            material.needsUpdate = true;
            geometry = new THREE.BoxGeometry(2, 2, 2);
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }

        const renderWidth = canvas.width;
        const renderHeight = canvas.height
        const renderer = RenderUtils.offscreenRenderer(renderWidth, renderHeight);
        renderer.render(scene, camera);

        if (material && typeof material.dispose === 'function') material.dispose();
        if (geometry && typeof geometry.dispose === 'function') geometry.dispose();
        if (mesh && typeof mesh.dispose === 'function') mesh.dispose();

        const context = canvas.getContext('2d');
        if (context) {
            const dAspect = canvas.width / canvas.height;
            let dx, dy, dw, dh, shrink;
            if (sAspect < dAspect) {
                dh = canvas.height;
                shrink = sAspect / dAspect;
                dw = canvas.width * shrink;
            } else {
                dw = canvas.width;
                shrink = dAspect / sAspect;
                dh = canvas.height * shrink;
            }
            dx = (canvas.width - dw) / 2;
            dy = (canvas.height - dh) / 2;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, renderWidth, renderHeight, dx, dy, dw, dh);
        }
    }

}

export { RenderUtils };
