
import {
    MOUSE_CLICK_TIME,
    MOUSE_SLOP,
} from '../../constants.js';
import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../core/input/Keyboard.js';
import { Pointer } from '../../core/input/Pointer.js';
import { ResizeHelper } from '../helpers/ResizeHelper.js';
import { RubberBandBox } from '../helpers/RubberBandBox.js';
import { Vector2 } from '../../math/Vector2.js';

const _cameraPoint = new Vector2();
const _center = new Vector2();
const _size = new Vector2();

class SelectControls {

    constructor() {
        this.dom = document.createElement('div'); // event dispatcher element
        this.selection = [];
        this.resizeHelper = null;
        this.rubberBandBox = null;
        this.downTimer = 0;

        // FLAG
        this.transformed = false;

        // INTERNAL
        this._renderer = null;
        this._existingSelection = [];
        this._mouseStart = new Vector2();
        this._mouseNow = new Vector2();
        this._wantsRubberBand = false;
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        if (renderer) this._renderer = renderer;
        let newSelection = [ ...this.selection ];

        // Transformed Flag
        if (this.transformed) {
            this.dom.dispatchEvent(new Event('selection-transformed'));
            this.transformed = false;
        }

        // Pointer in World (camera) Coordinates
        _cameraPoint.copy(renderer.screenToWorld(pointer.position));

        // Button Press
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this._mouseStart.copy(_cameraPoint);
            const underMouse = ArrayUtils.filterThings(renderer.getWorldPointIntersections(_cameraPoint), { pointerEvents: true });
            // Holding Ctrl/Meta/Shift (Toggle Selection)
            if (keyboard.ctrlPressed() || keyboard.metaPressed() || keyboard.shiftPressed()) {
                let resizerClicked = false;
                if (underMouse.length > 0) {
                    const topObject = underMouse[0];
                    resizerClicked = resizerClicked || (topObject.type === 'Resizer');
                    resizerClicked = resizerClicked || (topObject.type === 'Rotater');
                }
                if (!resizerClicked) {
                    const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                    if (selectableOnly.length > 0) {
                        const object = selectableOnly[0];
                        if (object.isSelected) {
                            newSelection = ArrayUtils.removeThingFromArray(object, newSelection);
                        } else {
                            newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                        }
                    } else {
                        this._existingSelection = [ ...this.selection ];
                        this._wantsRubberBand = true;
                    }
                }
            // Single Click / Click Timer
            } else {
                this.downTimer = performance.now();
                // Clear Previous Selection
                if (underMouse.length === 0) {
                    newSelection = [];
                    this._existingSelection = [];
                    this._wantsRubberBand = true;
                // New Selected Object
                } else if (underMouse.length > 0 && underMouse[0].isHelper !== true) {
                    const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                    const object = selectableOnly[0];
                    if (object && object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                        this.downTimer = 0;
                    }
                }
            }
        }

        // Mouse Distance
        this._mouseNow.copy(_cameraPoint);

        // Rubber Band Box
        if (pointer.buttonPressed(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            if (this._wantsRubberBand) {
                // Create Rubber Band Box?
                if (this.rubberBandBox == null) {
                    if (mouseTravel >= MOUSE_SLOP) {
                        const rubberBandBox = new RubberBandBox();
                        scene.traverse((child) => { rubberBandBox.layer = Math.max(rubberBandBox.layer, child.layer + 1); });
                        renderer.addHelper(rubberBandBox);
                        this.rubberBandBox = rubberBandBox;
                        renderer.setDragObject(this.rubberBandBox);
                    }
                }
                // Update Rubber Band Box
                if (this.rubberBandBox) {
                    // Center
                    const viewportStart = renderer.worldToScreen(this._mouseStart);
                    const viewportEnd = renderer.worldToScreen(this._mouseNow);
                    _center.addVectors(viewportStart, viewportEnd).divideScalar(2);
                    _center.copy(renderer.screenToWorld(_center));
                    this.rubberBandBox.position.copy(_center);
                    // Size
                    _size.subVectors(viewportStart, viewportEnd).abs().divideScalar(2);
                    this.rubberBandBox.box.min.set(-_size.x, -_size.y);
                    this.rubberBandBox.box.max.set(+_size.x, +_size.y);
                    this.rubberBandBox.computeBoundingBox();
                    // Transform
                    this.rubberBandBox.rotation = -camera.rotation;
                    this.rubberBandBox.scale.set(1 / camera.scale, 1 / camera.scale);
                    this.rubberBandBox.updateMatrix(true);
                    // Selection
                    let intersectedObjects;
                    if (this._existingSelection.length > 0) {
                        intersectedObjects = this.rubberBandBox.intersected(this._existingSelection[0].parent, false /* includeChildren */);
                    } else {
                        intersectedObjects = this.rubberBandBox.intersected(scene, true /* includeChildren */);
                    }
                    newSelection = ArrayUtils.combineThingArrays(this._existingSelection, intersectedObjects);
                }
            }
        }

        // Pointer Released
        if (pointer.buttonJustReleased(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            const shortClick = performance.now() - this.downTimer < MOUSE_CLICK_TIME;
            // Stop Rubber Band
            this._wantsRubberBand = false;
            if (this.rubberBandBox) {
                if (renderer.dragObject === this.rubberBandBox) renderer.setDragObject(null);
                this.rubberBandBox.destroy();
                this.rubberBandBox = null;
            // Select Object
            } else if (shortClick && mouseTravel <= MOUSE_SLOP) {
                const underMouse = renderer.getWorldPointIntersections(_cameraPoint);
                const withoutResizeHelper = ArrayUtils.filterThings(underMouse, { isHelper: undefined });
                // Clear Previous Selection
                if (withoutResizeHelper.length === 0) {
                    newSelection = [];
                // New Selected Object
                } else if (withoutResizeHelper.length > 0) {
                    const object = withoutResizeHelper[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                    }
                }
            }
        }

        // Selection Changed? Remove objects that don't share parents...
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            const siblings = [];
            if (newSelection.length > 0) {
                const wantsParent = newSelection[0].parent;
                for (const object of newSelection) {
                    if (object.parent === wantsParent) siblings.push(object);
                }
            }
            newSelection = [ ...siblings ];
        }

        // Selection Still Changed? Update Resize Tool
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            this.setSelection(newSelection);
            if (newSelection.length > 0) {
                if (this.rubberBandBox == null && this.resizeHelper) {
                    renderer.setDragObject(this.resizeHelper);
                }
            }
            this.dom.dispatchEvent(new Event('selection-changed'));
        }
    }

    setSelection(...things) {
        if (!this._renderer || !this._renderer.scene) return;
        if (things.length > 0 && Array.isArray(things[0])) things = things[0];
        // Locals
        const renderer = this._renderer;
        const scene = renderer.scene;
        // Mark New Selection
        scene.traverse((child) => { child.isSelected = false; });
        things.forEach((object) => { object.isSelected = true; });
        // Clear Old Tool
        if (this.resizeHelper) {
            this.resizeHelper.objects = [];
            this.resizeHelper.destroy();
            this.resizeHelper = null;
        }
        // Create New Tool?
        if (things.length > 0) {
            const resizeHelper = new ResizeHelper(things, this);
            renderer.addHelper(resizeHelper);
            resizeHelper.onUpdate(renderer);
            this.resizeHelper = resizeHelper;
        }
        // Save Selection
        this.selection = [ ...things ];
    }

}

export { SelectControls };
