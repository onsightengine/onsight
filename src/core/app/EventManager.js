import { Pointer } from '../input/Pointer.js';
import { Vector2 } from '../../math/Vector2.js';

const _cameraPoint = new Vector2();
const _localPoint = new Vector2();

class EventManager {

    static pointerEvents(renderer, objects) {
        const camera = renderer.camera;
        const pointer = renderer.pointer;

        // Pointer in Camera Coordinates
        camera.inverseMatrix.applyToVector(_cameraPoint.copy(pointer.position));

        // Pointer Events
        let currentCursor = null;
        for (const object of objects) {
            // Process?
            if (object.pointerEvents && object.inViewport) {
                // Local Pointer Position
                object.inverseGlobalMatrix.applyToVector(_localPoint.copy(_cameraPoint));
                const isInside = object.isInside(_localPoint);
                // Pointer Inside?
                if (isInside) {
                    // Mouse Cursor
                    if (!currentCursor && object.cursor) setCursor(object);
                    // Pointer Events
                    if (renderer.dragObject == null) {
                        if (!object.pointerInside && typeof object.onPointerEnter === 'function') object.onPointerEnter(renderer);
                        if (typeof object.onPointerOver === 'function') object.onPointerOver(renderer);
                        if (pointer.buttonDoubleClicked(Pointer.LEFT) && typeof object.onDoubleClick === 'function') object.onDoubleClick(renderer);
                        if (pointer.buttonPressed(Pointer.LEFT) && typeof object.onButtonPressed === 'function') object.onButtonPressed(renderer);
                        if (pointer.buttonJustReleased(Pointer.LEFT) && typeof object.onButtonUp === 'function') object.onButtonUp(renderer);
                        if (pointer.buttonJustPressed(Pointer.LEFT)) {
                            if (typeof object.onButtonDown === 'function') object.onButtonDown(renderer);
                            if (object.draggable) {
                                renderer.setDragObject(object);
                                if (typeof object.onPointerDragStart === 'function') object.onPointerDragStart(renderer);
                            }
                        }
                    }
                    object.pointerInside = true;
                // Pointer Leave
                } else if (renderer.dragObject !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(renderer);
                    object.pointerInside = false;
                }
            }

            // Being Dragged?
            if (renderer.dragObject === object) {
                // Stop Dragging
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    renderer.setDragObject(null);
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(renderer);
                    }
                // Still Dragging, Update
                } else {
                    if (object.pointerEvents && typeof object.onPointerDrag === 'function') {
                        object.onPointerDrag(renderer);
                    }
                    // Mouse Cursor
                    setCursor(object);
                }
            }
        }

        // Update Cursor
        function setCursor(object) {
            if (object.cursor) {
                currentCursor = (typeof object.cursor === 'function') ? object.cursor(camera) : object.cursor;
            } else {
                currentCursor = 'move';
            }
        }
        document.body.style.cursor = currentCursor ?? 'default';
    }

}

export { EventManager };
