import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../core/input/Keyboard.js';
import { Pointer } from '../../core/input/Pointer.js';
import { ResizeTool } from '../helpers/ResizeTool.js';

const MOUSE_CLICK_TIME = 350;

class SelectControls {

    constructor() {
        this.selection = [];
        this.resizeTool = null;
        this.downTimer = performance.now();
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        let newSelection = [ ...this.selection ];

        // Pointer in Camera Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Button Press
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            const underMouse = scene.getWorldPointIntersections(cameraPoint);

            // Holding Shift (Add to Selection)
            if (keyboard.shiftPressed()) {
                const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                if (selectableOnly.length > 0) {
                    const object = selectableOnly[0];
                    if (object.selectable) {
                        object.isSelected = true;
                        newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                    }
                }

            // Holding Ctrl/Meta (Toggle Selection)
            } else if (keyboard.ctrlPressed() || keyboard.metaPressed()) {
                const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                if (selectableOnly.length > 0) {
                    const object = selectableOnly[0];
                    if (object.selectable) {
                        if (object.isSelected) {
                            object.isSelected = false;
                            newSelection = ArrayUtils.removeThingFromArray(object, newSelection);
                        } else {
                            object.isSelected = true;
                            newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                        }
                    }
                }

            // Single Click / Click Timer
            } else {
                // Clear Previous Selection
                if (underMouse.length === 0) {
                    scene.traverse((child) => { child.isSelected = false; });
                    newSelection = [];
                // New Selected Object
                } else if (underMouse.length > 0) {
                    const object = underMouse[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        scene.traverse((child) => { child.isSelected = false; });
                        object.isSelected = true;
                        newSelection = [ object ];
                    // Start Click Timer
                    } else {
                        this.downTimer = performance.now();
                    }
                }
            }
        }

        // Single Click, Select Object
        if (pointer.buttonJustReleased(Pointer.LEFT)) {
            if (pointer.dragging !== true && performance.now() - this.downTimer < MOUSE_CLICK_TIME) {
                const underMouse = scene.getWorldPointIntersections(cameraPoint);
                const withoutResizeTool = ArrayUtils.filterThings(underMouse, { isHelper: undefined });
                // Clear Previous Selection
                if (withoutResizeTool.length === 0) {
                    scene.traverse((child) => { child.isSelected = false; });
                    newSelection = [];
                // New Selected Object
                } else if (withoutResizeTool.length > 0) {
                    const object = withoutResizeTool[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        scene.traverse((child) => { child.isSelected = false; });
                        object.isSelected = true;
                        newSelection = [ object ];
                    }
                }
            }
        }

        // Selection Changed? Add Resize Tool
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            // Clear Old Tool
            if (this.resizeTool) {
                this.resizeTool.objects = [];
                this.resizeTool.destroy();
            }
            // Create New Tool?
            if (newSelection.length > 0) {
                this.resizeTool = new ResizeTool(newSelection);
                scene.add(this.resizeTool);
                this.resizeTool.onUpdate(renderer);
                renderer.beingDragged = this.resizeTool;
            }
            // Save Selection
            this.selection = [ ...newSelection ];
        }
    }

}

export { SelectControls };
