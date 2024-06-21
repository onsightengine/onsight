import { Box } from '../../core/objects/Box.js';
import { Box2 } from '../../math/Box2.js';
import { Text } from '../../core/objects/Text.js';
import { Vector2 } from '../../math/Vector2.js';

const DURATION = 1500;
const FADEOUT = 500;
const TIME_OFFSET = 100000;

const _minimum = new Box2(new Vector2(-30, -12), new Vector2(30, 12));
const _position = new Vector2();

class TooltipHelper extends Box {

    constructor(sceneTips = false) {
        super();
        this.isHelper = true;
        this.type = 'TooltipHelper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.layer = +Infinity;
        this.visible = false;

        this.sceneTips = sceneTips;

        // Style
        this.box.min.set(-40, -14);
        this.box.max.set(+40, +14);
        this.radius = 7;
        this.fillStyle.color = '--background-dark';
        this.strokeStyle.color = '--icon';
        this.lineWidth = 2;

        // Text
        const displayText = Object.assign(new Text(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        displayText.layer = +Infinity;
        displayText.fillStyle.color = '--highlight';
        this.add(displayText);
        this.displayText = displayText;

        // Outline
        const outline = Object.assign(new Box(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        outline.layer = +Infinity;
        outline.fillStyle.color = `--shadow`;
        outline.opacity = 0.65;
        outline.strokeStyle = null;
        outline.radius = 10;
        this.add(outline);
        this.outline = outline;

        // INTERNAL
        this.duration = DURATION;
        this.initialPosition = new Vector2();
        this.offset = new Vector2();
        this.startTime = 0;
        this.wasChanged = false;
    }

    popup(text = '', align = 'center', duration, fadeOut) {
        this.duration = duration ?? DURATION;
        this.fadeOut = (fadeOut != null) ? fadeOut : FADEOUT;
        this.displayText.text = String(text);
        this.displayText.textAlign = align;

        this.startTime = performance.now() + TIME_OFFSET;
        this.wasChanged = true;
    }

    onUpdate(renderer) {
        const camera = renderer.camera;
        const pointer = renderer.pointer;

        // Scene Tips
        if (this.sceneTips) {
            // Zoom Level
            if (renderer.pointer.wheel !== 0) {
                let scale = renderer.camera.scale * 100;
                scale = scale.toFixed((scale < 50) ? ((scale < 5) ? 2 : 1) : 0);
                this.popup(` ${scale}% `, 'center');
            } else if (renderer.dragObject && renderer.dragObject.isDragging) {
                let tooltipText = '';
                const object = renderer.dragObject;
                if (object.type === 'Resizer') {
                    const resizeHelper = object.resizeHelper;
                    if (resizeHelper) {
                        const toolSize = resizeHelper.boundingBox.getSize();
                        let w = (toolSize.x * resizeHelper.scale.x).toFixed(3);
                        let h = (toolSize.y * resizeHelper.scale.y).toFixed(3);
                        w = parseFloat(w).toString(); // remove trailing zeros
                        h = parseFloat(h).toString(); // remove trailing zeros
                        tooltipText = `W: ${w}\nH: ${h}`;
                    }
                } else if (object.type === 'Rotater') {
                    const resizeHelper = object.resizeHelper;
                    if (resizeHelper) {
                        let angle = SALT.MathUtils.radiansToDegrees(resizeHelper.rotation);
                        angle = angle.toFixed(3);
                        angle = parseFloat(angle).toString();
                        tooltipText = `${angle}°`;
                    }
                } else /* show object 'Position' */ {
                    if (object.type === 'ResizeHelper' && object.objects.length === 1) {
                        let x = parseFloat((object.objects[0].position.x).toFixed(3)).toString();
                        let y = parseFloat((object.objects[0].position.y).toFixed(3)).toString();
                        tooltipText = `X: ${x}\nY: ${y}`;
                    } else {
                        let x = parseFloat((object.position.x).toFixed(3)).toString();
                        let y = parseFloat((object.position.y).toFixed(3)).toString();
                        tooltipText = `X: ${x}\nY: ${y}`;
                    }
                }
                if (tooltipText !== '') {
                    this.popup(tooltipText, 'left' /* align */, 10 /* duration */, 0 /* fadeOut */);
                }
            }
        }

        // Show / Hide
        const timePassed = (performance.now() + TIME_OFFSET) - this.startTime;
        const expired = timePassed > this.duration;
        if (expired) {
            this.visible = false;
        } else {
            this.visible = true;
            // Position
            if (this.wasChanged) {
                this.wasChanged = false;
                // Calculate Size
                this.displayText.computeBoundingBox(renderer);
                this.box.copy(this.displayText.boundingBox);
                this.box.min.x -= 10;
                this.box.max.x += 10;
                this.box.min.y -= 8;
                this.box.max.y += 4;
                this.box.union(_minimum);
                // Initial Position
                this.offset.x = ((this.box.max.x - this.box.min.x) / 2) + 25;
                this.offset.y = ((this.box.max.y - this.box.min.y) / 2) + 25;
                _position.set(pointer.position.x + this.offset.x, pointer.position.y + this.offset.y);
                _position.copy(renderer.screenToWorld(_position));
                // Setup Display
                this.position.copy(_position);
                this.opacity = 1;
                this.visible = true;
                this.displayText.level = this.level + 1;
                this.outline.level = this.level - 1;
                this.outline.box.copy(this.box);
                this.outline.box.expandByScalar(3);
            } else {
                // Smooth Step Position
                _position.set(pointer.position.x + this.offset.x, pointer.position.y + this.offset.y);
                _position.copy(renderer.screenToWorld(_position));
                this.position.smoothstep(_position, renderer.deltaTime * 60);
                this.opacity = (timePassed >= this.duration - this.fadeOut) ? Math.max(0, 1 - (timePassed - (this.duration - this.fadeOut)) / this.fadeOut) : 1;
            }

            // Transform
            this.rotation = -camera.rotation;
            this.scale.set(1 / camera.scale, 1 / camera.scale);
            this.updateMatrix(true);
        }
    }

}

export { TooltipHelper };
