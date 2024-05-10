import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../input/Keyboard.js';
import { Pointer } from '../../input/Pointer.js';
import { ResizeTool } from '../helpers/ResizeTool.js';
import { ResizeTool2 } from '../helpers/ResizeTool2.js';

class SelectControls {

    constructor() {
        this.selection = [];
        this.resizeTool = null;
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
                if (underMouse.length > 0) {
                    const object = underMouse[0];
                    if (object.selectable) {
                        object.isSelected = true;
                        newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                    }
                }

            // Holding Ctrl/Meta (Toggle Selection)
            } else if (keyboard.ctrlPressed() || keyboard.metaPressed()) {
                if (underMouse.length > 0) {
                    const object = underMouse[0];
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

            // Single Click, Select Object
            } else {
                // Clear Previous Selection
                if (underMouse.length === 0) {
                    scene.traverse((child) => { child.isSelected = false; });
                    newSelection = [];

                // New Selected Objects
                } else if (underMouse.length > 0) {
                    const object = underMouse[0];
                    if (object.selectable) {
                        scene.traverse((child) => { child.isSelected = false; });
                        object.isSelected = true;
                        newSelection = [ object ];
                    }
                }
            }
        }

        // Selection Changed? Add Resize Tool
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            if (this.resizeTool) this.resizeTool.destroy();
            if (newSelection.length > 0) {
                this.resizeTool = new ResizeTool(newSelection[0]);

                // this.resizeTool = new ResizeTool(newSelection);

                scene.add(this.resizeTool);
                this.resizeTool.onUpdate(renderer);
            }

            // Save Selection
            this.selection = [ ...newSelection ];
        }
    }

}

export { SelectControls };
