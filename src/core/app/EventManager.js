import { Pointer } from '../input/Pointer.js';

class EventManager {

    static pointerEvents(renderer, objects) {
        const camera = renderer.camera;
        const pointer = renderer.pointer;

        // Pointer in Camera Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Pointer Events
        let currentCursor = null;
        for (const object of objects) {
            // Process?
            if (object.pointerEvents && object.inViewport) {
                // Local Pointer Position
                const localPoint = object.inverseGlobalMatrix.transformPoint(cameraPoint);
                const isInside = object.isInside(localPoint);
                // Pointer Inside?
                if (isInside) {
                    // Mouse Cursor
                    if (!currentCursor && object.cursor) setCursor(object);
                    // Pointer Events
                    if (renderer.beingDragged == null) {
                        if (!object.pointerInside && typeof object.onPointerEnter === 'function') object.onPointerEnter(pointer, camera);
                        if (typeof object.onPointerOver === 'function') object.onPointerOver(pointer, camera);
                        if (pointer.buttonDoubleClicked(Pointer.LEFT) && typeof object.onDoubleClick === 'function') object.onDoubleClick(pointer, camera);
                        if (pointer.buttonPressed(Pointer.LEFT) && typeof object.onButtonPressed === 'function') object.onButtonPressed(pointer, camera);
                        if (pointer.buttonJustReleased(Pointer.LEFT) && typeof object.onButtonUp === 'function') object.onButtonUp(pointer, camera);
                        if (pointer.buttonJustPressed(Pointer.LEFT)) {
                            if (typeof object.onButtonDown === 'function') object.onButtonDown(pointer, camera);
                            if (object.draggable) {
                                renderer.beingDragged = object;
                                if (typeof object.onPointerDragStart === 'function') object.onPointerDragStart(pointer, camera);
                            }
                        }
                    }
                    object.pointerInside = true;
                // Pointer Leave
                } else if (renderer.beingDragged !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(pointer, camera);
                    object.pointerInside = false;
                }
            }

            // Being Dragged?
            if (renderer.beingDragged === object) {
                // Stop Dragging
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(pointer, camera);
                    }
                    renderer.beingDragged = null;
                // Still Dragging, Update
                } else {
                    if (object.pointerEvents && typeof object.onPointerDrag === 'function') {
                        object.onPointerDrag(pointer, camera);
                    }
                    // Mouse Cursor
                    setCursor(object);
                }
            }
        }

        // Update Cursor
        function setCursor(object) {
            if (object.cursor) {
                if (typeof object.cursor === 'function') currentCursor = object.cursor(camera);
                else currentCursor = object.cursor;
            } else { currentCursor = 'default' }
        }
        document.body.style.cursor = currentCursor ?? 'default';
    }

}

export { EventManager };
