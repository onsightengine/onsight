import { Box2 } from '../math/Box2.js';
import { Pointer } from '../input/Pointer.js';
import { Vector2 } from '../math/Vector2.js';

class CameraControls {

    constructor(renderer, camera) {
        const self = this;

        // Renderer / Camera
        this.renderer = renderer;
        this.camera = camera;

        // Options
        this.allowDrag = true;                      // allowed to be dragged?
        this.allowScale = true;                     // allowed to be scaled?
        this.allowRotation = true;                  // allowed to be rotated?

        this.dragButton = Pointer.RIGHT;            // button used to drag
        this.rotateButton = Pointer.MIDDLE;         // button used to rotate

        // INTERNAL
        this.rotationPoint = new Vector2(0, 0);     // pointer position when the rotation starts
        this.rotationInitial = 0;                   // initial rotation when the rotation starts

        /***** EVENTS */

        // Focus on Double Click
        renderer.on('dblclick', (event) => {
            if (!renderer.scene || !renderer.camera) return;
            const point = new Vector2(event.clientX, event.clientY);
            const worldPoint = renderer.camera.inverseMatrix.transformPoint(point);
            const objects = renderer.scene.getWorldPointIntersections(worldPoint);
            for (const object of objects) if (object.focusable) return self.focusCamera(object, false /* isScene? */);
            return self.focusCamera(renderer.scene, true /* isScene? */);
        });
    }

    /** Update the camera (should be called every frame before rendering) */
    update() {
        const camera = this.camera;
        const pointer = this.renderer.pointer;

        // Scale
        if (this.allowScale && pointer.wheel !== 0) {
            const scaleFactor = pointer.wheel * 0.001 * camera.scale;
            const pointerPos = camera.inverseMatrix.transformPoint(pointer.position);
            camera.scale -= scaleFactor;
            camera.position.add(pointerPos.multiplyScalar(scaleFactor));
            camera.matrixNeedsUpdate = true;
        }

        // Rotation
        if (this.allowRotation) {
            if (pointer.buttonJustPressed(this.rotateButton)) {
                this.rotationPoint.copy(pointer.position);
                this.rotationInitial = camera.rotation;
            } else if (pointer.buttonPressed(this.rotateButton)) {
                const point = pointer.position.clone().sub(this.rotationPoint);
                camera.rotation = this.rotationInitial + (point.x * 0.01);
                camera.matrixNeedsUpdate = true;
            }
        }

        // Drag
        if (this.allowDrag && pointer.buttonPressed(this.dragButton)) {
            const currentPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone());
            const lastPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone().sub(pointer.delta));
            const delta = currentPointerPos.clone().sub(lastPointerPos).multiplyScalar(camera.scale);
            camera.position.add(delta);
            camera.matrixNeedsUpdate = true;
        }
    }

    focusCamera(object, isScene = false, animationDuration = 200 /* milliseconds */) {
        const renderer = this.renderer;

        // Focus Scene
        let targetScale, targetPosition;
        if (isScene) {
            const sceneBounds = new Box2();
            object.traverse((child) => { sceneBounds.union(child.getWorldBoundingBox()); });
            targetScale = 0.5 * Math.min(renderer.width / sceneBounds.getSize().x, renderer.height / sceneBounds.getSize().y);
            targetPosition = sceneBounds.getCenter();
            targetPosition.multiplyScalar(-targetScale);
            targetPosition.add(new Vector2(renderer.width / 2.0, renderer.height / 2.0));
        // Focus Object
        } else {
            const worldBox = object.getWorldBoundingBox();
            const worldSize = worldBox.getSize();
            const worldCenter = worldBox.getCenter();
            targetScale = 0.1 * Math.min(renderer.width / worldSize.x, renderer.height / worldSize.y);
            targetPosition = worldCenter;
            targetPosition.multiplyScalar(-targetScale);
            targetPosition.add(new Vector2(renderer.width / 2.0, renderer.height / 2.0));
        }
        targetScale = Math.abs(targetScale);

        const camera = renderer.camera;
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        const startScale = camera.scale;
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / animationDuration, 1);
            camera.lerpPosition(startPosition, targetPosition, t);
            camera.scale = startScale + (targetScale - startScale) * t;
            if (t < 1) requestAnimationFrame(animate);
        };
        animate();
    }

}

export { CameraControls };
