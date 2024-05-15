import { Box2 } from '../../math/Box2.js';
import { Pointer } from '../../core/input/Pointer.js';
import { Vector2 } from '../../math/Vector2.js';

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
                const worldPoint = camera.inverseMatrix.transformPoint(pointer.position);
                const objects = renderer.scene.getWorldPointIntersections(worldPoint);
                let focused = false;
                if (objects.length === 0) {
                    this.focusCamera(renderer, renderer.scene, true /* includeChildren? */);
                } else {
                    const object = objects[0];
                    if (object.focusable) this.focusCamera(renderer, object, false /* includeChildren? */);
                }
            }
        }

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
                const currentPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone());
                const lastPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone().sub(pointer.delta));
                const delta = currentPointerPos.clone().sub(lastPointerPos).multiplyScalar(camera.scale);
                camera.position.add(delta);
                camera.matrixNeedsUpdate = true;
            } else {
                pointer.unlock();
                this.dragging = false;
            }
        }
    }

    focusCamera(renderer, object, includeChildren = false, animationDuration = 200 /* milliseconds */) {
        // Focus Scene
        let targetScale, targetPosition;
        if (includeChildren) {
            const bounds = new Box2();
            object.traverse((child) => {
                const childBounds = child.getWorldBoundingBox();
                bounds.union(childBounds);
            });
            targetScale = 0.5 * Math.min(renderer.width / bounds.getSize().x, renderer.height / bounds.getSize().y);
            targetPosition = bounds.getCenter();
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

        const camera = this.camera;
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        const startScale = camera.scale;
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / animationDuration, 1);
            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.scale = startScale + (targetScale - startScale) * t;
            camera.matrixNeedsUpdate = true;
            if (t < 1) requestAnimationFrame(animate);
        };
        animate();
    }

}

export { CameraControls };
