import { Box2 } from './math/Box2.js';
import { Element } from './Element.js';
import { Keyboard } from './input/Keyboard.js';
import { Pointer } from './input/Pointer.js';
import { Vector2 } from './math/Vector2.js';
import { Viewport } from './Viewport.js';

class Renderer extends Element {

    constructor({
        alpha = true,
        disableContextMenu = true,
        imageSmoothingEnabled = true,
        imageSmoothingQuality = 'medium', // 'low',
        globalCompositeOperation = 'source-over',
        width = 1000,
        height = 1000,
    } = {}) {
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        // Base
        super(canvas);

        // Rendering Context (2D)
        this.context = this.dom.getContext('2d', { alpha });
        this.context.imageSmoothingEnabled = imageSmoothingEnabled;
        this.context.imageSmoothingQuality = imageSmoothingQuality;
        this.context.globalCompositeOperation = globalCompositeOperation;

        // Pointer / Keyboard Input Handlers
        this.pointer = new Pointer(this, disableContextMenu);
        this.keyboard = new Keyboard(this);

        // Auto Clear Canvas? (if false, user must clear the frame)
        this.autoClear = true;

        // Updatables
        this.updatable = [ this.pointer, this.keyboard ];

        // Selection
        this.selection = [];

        // Resize Observer
        const renderer = this;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                if (renderer.running) renderer.render();
            }
        });
        resizeObserver.observe(canvas);
        this.on('destroy', () => {
            resizeObserver.unobserve(canvas);
        });

        // INTERNAL
        this.running = false;           // is animating?
        this.frame = -1;                // frame count
        this.scene = null;              // last rendered scene
        this.camera = null;             // last rendered camera
        this.beingDragged = null;       // object being dragged
    }

    /******************** SIZING */

    get width() { return this.dom.width; }
    set width(x) { this.dom.width = x; }

    get height() { return this.dom.height; }
    set height(y) { this.dom.height = y; }

    ratio() {
        const rect = this.dom.getBoundingClientRect();
        return ((this.width / this.height) / (rect.width / rect.height));
    }

    /******************** LOOP */

    /** Adds updatable object (has update() function) to list of objects to be updated */
    onUpdate(object) {
        if (this.updatable.includes(object) === false) {
            this.updatable.push(object);
        }
    }

    start(scene, camera) {
        if (this.running) return;
        this.running = true;

        const renderer = this;
        function loop() {
            for (const object of renderer.updatable) {
                // DEFAULT: renderer.pointer.update();
                // DEFAULT: renderer.keyboard.update();
                if (typeof object.update === 'function') object.update();
            }
            camera.updateMatrix(renderer.width / 2.0, renderer.height / 2.0);
            renderer.render(scene, camera);
            if (renderer.running) renderer.frame = requestAnimationFrame(loop);
        }
        loop();
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.frame);
    }

    /******************** RENDER */

    /** Renders a scene (Object2D) using a Camera2D */
    render(scene, camera) {
        if (scene) this.scene = scene; else scene = this.scene;
        if (camera) this.camera = camera; else camera = this.camera;
        if (!scene || !camera) return;
        const pointer = this.pointer;
        const context = this.context;

        // Gather, Sort Objects
        const objects = [];
        scene.traverse(function(child) { if (child.visible) objects.push(child); });
        objects.sort(function(a, b) {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });

        // Viewport Frustum Culling
        const viewport = new Viewport(context, camera);
        const isVisible = {};
        for (const object of objects) {
            isVisible[object.uuid] = viewport.intersectsBox(camera, object.getWorldBoundingBox());
        }

        // Pointer in Camera Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Selection
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            // Clear previous selection
            for (const object of this.selection) object.isSelected = false;
            this.selection = [];

            // New selected objects
            const selectedObjects = scene.getWorldPointIntersections(cameraPoint);
            if (selectedObjects.length > 0) {
                for (const object of selectedObjects) {
                    if (object.selectable) {
                        object.isSelected = true;
                        this.selection.push(object);
                    }
                }
            }
        }

        // Pointer Events
        let currentCursor = null;
        for (const object of objects) {
            // Process?
            if (object.pointerEvents && isVisible[object.uuid]) {
                // Local Pointer Position
                const localPoint = object.inverseGlobalMatrix.transformPoint(cameraPoint);
                const isInside = object.isInside(localPoint);
                // Mouse Cursor
                if (!currentCursor && (isInside || this.beingDragged === object) && object.cursor) {
                    if (typeof object.cursor === 'function') currentCursor = object.cursor(camera);
                    else currentCursor = object.cursor;
                }
                // Pointer Inside?
                if (isInside) {
                    if (this.beingDragged == null) {
                        if (!object.pointerInside && typeof object.onPointerEnter === 'function') object.onPointerEnter(pointer, camera);
                        if (typeof object.onPointerOver === 'function') object.onPointerOver(pointer, camera);
                        if (pointer.buttonDoubleClicked(Pointer.LEFT) && typeof object.onDoubleClick === 'function') object.onDoubleClick(pointer, camera);
                        if (pointer.buttonPressed(Pointer.LEFT) && typeof object.onButtonPressed === 'function') object.onButtonPressed(pointer, camera);
                        if (pointer.buttonJustReleased(Pointer.LEFT) && typeof object.onButtonUp === 'function') object.onButtonUp(pointer, camera);
                        if (pointer.buttonJustPressed(Pointer.LEFT)) {
                            if (typeof object.onButtonDown === 'function') object.onButtonDown(pointer, camera);
                            if (object.draggable) {
                                this.beingDragged = object;
                                if (typeof object.onPointerDragStart === 'function') object.onPointerDragStart(pointer, camera);
                            }
                        }
                    }
                    object.pointerInside = true;
                } else if (this.beingDragged !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(pointer, camera);
                    object.pointerInside = false;
                }
            }

            // Being Dragged?
            if (this.beingDragged === object) {
                // Stop Drag
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(pointer, camera);
                    }
                    this.beingDragged = null;
                // Still Dragging
                } else if (object.pointerEvents && typeof object.onPointerDrag === 'function') {
                    object.onPointerDrag(pointer, camera);
                }
            }
        }

        // Update Cursor
        document.body.style.cursor = currentCursor ?? 'default';

        // Update Object / Matrix
        scene.traverse(function(child) {
            child.updateMatrix();
            if (typeof child.onUpdate === 'function') child.onUpdate(context, camera);
        });

        // Reset Transform, Clear Canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (this.autoClear) context.clearRect(0, 0, this.width, this.height);

        // Render Objects Back to Front
        for (let i = objects.length - 1; i >= 0; i--) {
            const object = objects[i];
            if (object.isMask) continue;
            if (isVisible[object.uuid] !== true) {
                // // DEBUG
                // console.log(`Object culled: ${object.constructor.name}`);
                continue;
            }

            // Apply Masks
            for (const mask of object.masks) {
                camera.matrix.setContextTransform(context);
                mask.transform(context, camera, this.dom, this);
                mask.clip(context, camera, this.dom);
            }

            // Apply Camera / Object Transforms to Canvas
            camera.matrix.setContextTransform(context);
            object.transform(context, camera, this.dom, this);
            context.globalAlpha = object.globalOpacity;

            // Style and Draw Object
            if (typeof object.style === 'function') object.style(context, camera, this.dom, this);
            if (typeof object.draw === 'function') object.draw(context, camera, this.dom, this);

            // Selected?
            if (object.isSelected) {
                camera.matrix.setContextTransform(context);
                context.globalAlpha = 1;
                context.strokeStyle = '#00aacc';
                context.lineWidth = 2 / camera.scale;
                const box = object.boundingBox;
                const topLeft = object.globalMatrix.transformPoint(box.min);
                const topRight = object.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
                const bottomLeft = object.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
                const bottomRight = object.globalMatrix.transformPoint(box.max);
                context.beginPath();
                context.moveTo(topLeft.x, topLeft.y);
                context.lineTo(topRight.x, topRight.y);
                context.lineTo(bottomRight.x, bottomRight.y);
                context.lineTo(bottomLeft.x, bottomLeft.y);
                context.closePath();
                context.stroke();
            }
        }
    }

}

export { Renderer };
