import { Box2 } from '../../math/Box2.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Pointer } from '../../core/input/Pointer.js';
import { Vector2 } from '../../math/Vector2.js';

const ZOOM_MAX = 25;
const ZOOM_MIN = 0.01;

const _rotate = new Matrix2();

class CameraControls {

    constructor(camera) {
        // Camera
        this.camera = camera;

        // Options
        this.allowDrag = true;                      // allowed to be dragged?
        this.allowScale = true;                     // allowed to be scaled?
        this.allowRotation = true;                  // allowed to be rotated?

        this.dragButton = Pointer.RIGHT;            // button used to drag
        this.dragButton2 = Pointer.LEFT;            // button used to drag with spacebar
        this.rotateButton = Pointer.MIDDLE;         // button used to rotate

        // INTERNAL
        this.animateID = -1;
        this.dragID = -1;
        this.dragging = false;
        this.rotationPoint = new Vector2(0, 0);     // pointer position when the rotation starts
        this.rotationInitial = 0;                   // initial rotation when the rotation starts
    }

    /** Update the camera (should be called every frame before rendering) */
    update(renderer) {
        const camera = this.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;

        // Double Click?
        if (pointer.buttonDoubleClicked(Pointer.LEFT) && camera && renderer.scene) {
            if (!keyboard.modifierPressed()) {
                const worldPoint = renderer.screenToWorld(pointer.position);
                const objects = renderer.scene.getWorldPointIntersections(worldPoint);
                if (objects.length === 0) {
                    this.focusCamera(renderer, renderer.scene);
                } else {
                    const object = objects[0];
                    if (object.focusable) this.focusCamera(renderer, object);
                }
            }
        }

        // Scale
        if (this.allowScale && pointer.wheel !== 0) {
            // Amount to Zoom
            let scaleFactor = pointer.wheel * 0.0015 * camera.scale;
            if (pointer.wheel < 0) scaleFactor = Math.max(scaleFactor, camera.scale - ZOOM_MAX);
            if (pointer.wheel > 0) scaleFactor = Math.min(scaleFactor, camera.scale - ZOOM_MIN);
            // Zoom on Target Position
            const beforePosition = renderer.screenToWorld(pointer.position);
            camera.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, camera.scale - scaleFactor));
            camera.updateMatrix(true);
            const afterPosition = renderer.screenToWorld(pointer.position);
            const delta = afterPosition.clone().sub(beforePosition);
            camera.position.sub(delta.x, delta.y);
            camera.matrixNeedsUpdate = true;
        }

        // Rotation
        if (this.allowRotation) {
            if (pointer.buttonJustPressed(this.rotateButton)) {
                this.rotationPoint.copy(pointer.position);
                this.rotationInitial = camera.rotation;
            } else if (pointer.buttonPressed(this.rotateButton)) {
                const point = pointer.position.clone().sub(this.rotationPoint);
                camera.rotation = this.rotationInitial + (point.x * -0.01);
                camera.matrixNeedsUpdate = true;
            }
        }

        // Drag
        if (this.allowDrag) {
            // Check for Main Drag Button
            let wantsToDrag = pointer.buttonPressed(this.dragButton, this.dragID);
            renderer.dom.style.cursor = wantsToDrag ? 'grabbing' : '';
            // Check for Alternate Drag Button
            if (!wantsToDrag) {
                if (keyboard.spacePressed()) {
                    if (pointer.buttonPressed(this.dragButton2, this.dragID)) {
                        renderer.dom.style.cursor = 'grabbing';
                        wantsToDrag = true;
                    } else {
                        renderer.dom.style.cursor = 'grab';
                    }
                } else {
                    renderer.dom.style.cursor = '';
                }
            }
            if (wantsToDrag) {
                if (!this.dragging) {
                    this.dragID = pointer.lock();
                    this.dragging = true;
                }
                _rotate.identity().rotate(camera.rotation);
                const delta = _rotate.transformPoint(pointer.delta.x / camera.scale, pointer.delta.y / camera.scale);
                camera.position.sub(delta.x, delta.y * -1);
                camera.matrixNeedsUpdate = true;
            } else {
                pointer.unlock();
                this.dragging = false;
            }
        }
    }

    focusCamera(renderer, object, animationDuration = 200 /* milliseconds */) {
        if (!animationDuration) animationDuration = 1;
        // Cancel
        if (this.animateID) cancelAnimationFrame(this.animateID);
        // Focus
        let targetScale = 1;
        let targetPosition = new Vector2(0, 0);
        if (object) {
            const bounds = new Box2();
            object.traverse((child) => {
                const childBounds = child.getWorldBoundingBox();
                let finite = true;
                finite = finite && Number.isFinite(childBounds.min.x);
                finite = finite && Number.isFinite(childBounds.min.y);
                finite = finite && Number.isFinite(childBounds.max.x);
                finite = finite && Number.isFinite(childBounds.max.y);
                if (finite && child.focusable) bounds.union(childBounds);
            });
            if (Number.isFinite(bounds.getSize().x) && Number.isFinite(bounds.getSize().y)) {
                targetScale = 0.2 * Math.min(renderer.width / bounds.getSize().x, renderer.height / bounds.getSize().y);
                targetPosition = bounds.getCenter();
            }
        }
        targetScale = Math.abs(targetScale);
        // Animate
        const camera = this.camera;
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        const startScale = camera.scale;
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / animationDuration, 1);
            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.scale = (startScale * (1.0 - t)) + (targetScale * t);
            camera.matrixNeedsUpdate = true;
            if (t < 1) this.animateID = requestAnimationFrame(animate);
        };
        animate();
    }

}

export { CameraControls };
