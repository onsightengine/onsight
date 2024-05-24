import {
    OUTLINE_THICKNESS,
} from '../../constants.js';
import { Clock } from './Clock.js';
import { EventManager } from './EventManager.js';
import { Keyboard } from '../input/Keyboard.js';
import { Pointer } from '../input/Pointer.js';
import { Vector2 } from '../../math/Vector2.js';

const _origin = new Vector2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();

class Renderer {

    constructor({
        alpha = true,
        disableContextMenu = true,
        imageSmoothingEnabled = true,
        imageSmoothingQuality = 'medium', // 'low',
        globalCompositeOperation = 'source-over',
        pointerEvents = true,
        width = 1000,
        height = 1000,
    } = {}) {
        // Visible Canvas
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.setAttribute('tabindex', '0');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.outline = 'none';
        this.screenContext  = canvas.getContext('bitmaprenderer');

        // Offscreen Buffer
        const offscreen = new OffscreenCanvas(width, height);
        this.context = offscreen.getContext('2d', { alpha });
        this.context.imageSmoothingEnabled = imageSmoothingEnabled;
        this.context.imageSmoothingQuality = imageSmoothingQuality;
        this.context.globalCompositeOperation = globalCompositeOperation;

        // Dom
        this.dom = canvas;
        this.offscreen = offscreen;

        // Pointer / Keyboard Input Handlers
        this.pointerEvents = pointerEvents;
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
                offscreen.width = entry.contentRect.width;
                offscreen.height = entry.contentRect.height;
                if (renderer.running) renderer.render();
            }
        });
        resizeObserver.observe(canvas);
        this.on('destroy', () => {
            resizeObserver.unobserve(canvas);
        });

        // Clock
        this.clock = new Clock(false);      // update clock
        this.deltaTime = 0;                 // time between frames
        this.totalTime = 0;                 // total time since started

        // INTERNAL
        this.running = false;               // is animating?
        this.frame = -1;                    // frame count
        this.scene = null;                  // last rendered scene
        this.camera = null;                 // last rendered camera
        this.dragObject = null;             // object being dragged
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
        this.clock.start(true /* reset? */);

        const renderer = this;
        function loop() {
            renderer.deltaTime = renderer.clock.getDeltaTime();
            renderer.totalTime = renderer.clock.getElapsedTime();
            if (typeof onBeforeRender === 'function') onBeforeRender();

            // Updates
            for (const object of renderer.updatable) {
                // INCLUDES: renderer.pointer.update();
                // INCLUDES: renderer.keyboard.update();
                if (typeof object.update === 'function') object.update(renderer);
            }
            camera.updateMatrix(renderer.width / 2.0, renderer.height / 2.0);

            // Render
            renderer.render(scene, camera);
            const backBuffer = renderer.offscreen.transferToImageBitmap();
            renderer.screenContext.transferFromImageBitmap(backBuffer);

            if (typeof onAfterRender === 'function') onAfterRender();
            if (renderer.running) renderer.frame = requestAnimationFrame(loop);
        }
        loop();
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.frame);
    }

    /******************** EVENTS */

    setDragObject(object) {
        if (this.dragObject) this.dragObject.isDragging = false;
        this.dragObject = object;
    }

    /******************** RENDER */

    /** Renders Object2D using a Camera2D */
    render(scene, camera) {
        this.drawCallCount = 0;
        if (scene) this.scene = scene; else scene = this.scene;
        if (camera) this.camera = camera; else camera = this.camera;
        if (!scene || !camera) return;
        const renderer = this;
        const context = this.context;

        // Gather, Sort Objects
        const objects = [];
        scene.traverse((child) => { if (child.visible) objects.push(child); });
        objects.sort((a, b) => {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });

        // Viewport Frustum Culling
        camera.setViewport(this.width, this.height);
        for (const object of objects) {
            object.inViewport = camera.intersectsViewport(object.getWorldBoundingBox());
        }

        // Pointer Events
        if (this.pointerEvents) {
            EventManager.pointerEvents(renderer, objects);
        }

        // Update Object / Matrix
        scene.traverse((child) => {
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
            if (object.inViewport !== true) continue;

            // Apply Masks
            for (const mask of object.masks) {
                camera.matrix.setContextTransform(context);
                mask.transform(renderer);
                mask.clip(renderer);
            }

            // Apply Camera / Object Transforms to Canvas
            camera.matrix.setContextTransform(context);
            object.transform(renderer);
            context.globalAlpha = object.globalOpacity;

            // Draw Object
            if (typeof object.style === 'function') { object.style(renderer); }
            if (typeof object.draw === 'function') { object.draw(renderer); this.drawCallCount++; }

            // Highlight Selected
            if (object.isSelected) this.renderOutline(object);
        }
    }

    renderOutline(object) {
        const camera = this.camera;
        const context = this.context;
        context.globalAlpha = 1;
        context.lineWidth = OUTLINE_THICKNESS;
        // Origin
        context.strokeStyle = '#ffffff';
        camera.matrix.setContextTransform(context);
        object.globalMatrix.applyToVector(_origin.copy(object.origin));
        context.beginPath();
        context.arc(_origin.x, _origin.y, 3 / camera.scale, 0, 2 * Math.PI);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
        // Bounding Box
        context.strokeStyle = '#65e5ff';
        camera.matrix.setContextTransform(context);
        const box = object.boundingBox;
        object.globalMatrix.applyToVector(_topLeft.copy(box.min));
        object.globalMatrix.applyToVector(_topRight.copy(box.max.x, box.min.y));
        object.globalMatrix.applyToVector(_botLeft.copy(box.min.x, box.max.y));
        object.globalMatrix.applyToVector(_botRight.copy(box.max));
        context.beginPath();
        context.moveTo(_topLeft.x, _topLeft.y);
        context.lineTo(_topRight.x, _topRight.y);
        context.lineTo(_botRight.x, _botRight.y);
        context.lineTo(_botLeft.x, _botLeft.y);
        context.closePath();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.shadowBlur = 1;
        context.shadowColor = '#65e5ff';
        context.stroke();
        context.shadowBlur = 0;
        context.shadowColor = 'transparent';
    }

}

export { Renderer };
