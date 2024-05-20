import { EventManager } from './EventManager.js';
import { Keyboard } from '../input/Keyboard.js';
import { Pointer } from '../input/Pointer.js';
import { Vector2 } from '../../math/Vector2.js';

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
        const context = this.context;

        // Gather, Sort Objects
        const objects = [];
        scene.traverse(function(child) { if (child.visible) objects.push(child); });
        objects.sort(function(a, b) {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });

        // Viewport Frustum Culling
        camera.setViewport(context.canvas.width, context.canvas.height);
        for (const object of objects) {
            object.inViewport = camera.intersectsViewport(object.getWorldBoundingBox());
        }

        // Pointer Events
        if (this.pointerEvents) {
            EventManager.pointerEvents(renderer, objects);
        }

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
            if (object.inViewport !== true) continue;

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
            if (object.isSelected) this.renderOutline(object);
        }
    }

    renderOutline(object) {
        const camera = this.camera;
        const context = this.context;
        context.globalAlpha = 1;
        context.lineWidth = 2;
        // Origin
        context.strokeStyle = '#ffffff';
        camera.matrix.setContextTransform(context);
        const origin = object.globalMatrix.transformPoint(object.origin);
        context.beginPath();
        context.arc(origin.x, origin.y, 3 / camera.scale, 0, 2 * Math.PI);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
        // Bounding Box
        context.strokeStyle = '#65e5ff';
        camera.matrix.setContextTransform(context);
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
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
    }

}

export { Renderer };
