import { Keyboard } from './input/Keyboard.js';
import { Pointer } from './input/Pointer.js';
import { Vector2 } from '../math/Vector2.js';
import { Viewport } from './Viewport.js';

class Renderer {

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
        canvas.setAttribute('tabindex', '0');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.outline = 'none';

        // Dom
        this.dom = canvas;

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

    /******************** ELEMENT */

    destroy() {
        dom.dispatchEvent(new Event('destroy'));
    }

    on(event, callback, options = {}) {
        if (typeof options !== 'object') options = {};
        if (typeof callback !== 'function') {
            console.warn(`Renderer.on(): No callback function provided for '${event}'`);
            callback = () => { return; };
        }
        const eventName = event.toLowerCase();
        const eventHandler = callback.bind(this);
        const dom = this.dom;
        if (options.once || eventName === 'destroy') {
            options.once = true;
            dom.addEventListener(eventName, eventHandler, options);
        } else {
            dom.addEventListener(eventName, eventHandler, options);
            dom.addEventListener('destroy', () => dom.removeEventListener(eventName, eventHandler, options), { once: true });
        }
        return this;
    }

    get width() { return this.dom.width; }
    set width(x) { this.dom.width = x; }

    get height() { return this.dom.height; }
    set height(y) { this.dom.height = y; }

    ratio() {
        const rect = this.dom.getBoundingClientRect();
        return ((this.width / this.height) / (rect.width / rect.height));
    }

    /******************** LOOP */

    /** Adds updatable object (i.e. has 'update()' function) to list of objects to be updated */
    addUpdate(object) {
        if (this.updatable.includes(object) === false) {
            this.updatable.push(object);
        }
    }

    start(scene, camera, onBeforeRender, onAfterRender) {
        if (this.running) return;
        this.running = true;

        const renderer = this;
        function loop() {
            if (typeof onBeforeRender === 'function') onBeforeRender();

            // Updates
            for (const object of renderer.updatable) {
                // DEFAULT: renderer.pointer.update();
                // DEFAULT: renderer.keyboard.update();
                if (typeof object.update === 'function') object.update(renderer);
            }
            camera.updateMatrix(renderer.width / 2.0, renderer.height / 2.0);

            // Render
            renderer.render(scene, camera);

            if (typeof onAfterRender === 'function') onAfterRender();
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
        this.drawCallCount = 0;
        if (scene) this.scene = scene; else scene = this.scene;
        if (camera) this.camera = camera; else camera = this.camera;
        if (!scene || !camera) return;
        const renderer = this;
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
        for (const object of objects) {
            object.inViewport = viewport.intersectsBox(camera, object.getWorldBoundingBox());
        }

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
                // Pointer Leave
                } else if (this.beingDragged !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(pointer, camera);
                    object.pointerInside = false;
                }
            }

            // Being Dragged?
            if (this.beingDragged === object) {
                // Stop Dragging
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(pointer, camera);
                    }
                    this.beingDragged = null;
                    pointer.dragging = false;
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

        // Update Object / Matrix
        scene.traverse(function(child) {
            child.updateMatrix();
            if (typeof child.onUpdate === 'function') child.onUpdate(renderer);
        });

        // Reset Transform, Clear Canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (this.autoClear) context.clearRect(0, 0, this.width, this.height);

        // Render Objects Back to Front
        for (let i = objects.length - 1; i >= 0; i--) {
            const object = objects[i];
            if (object.isMask) continue;
            if (object.inViewport !== true) {
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

            // Draw Object
            if (typeof object.style === 'function') {
                object.style(context, camera, this.dom, this);
            }
            if (typeof object.draw === 'function') {
                object.draw(context, camera, this.dom, this);
                this.drawCallCount++;
            }

            // Highlight Selected
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
