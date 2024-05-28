import { Box } from '../../core/objects/Box.js';

class TooltipHelper extends Box {

    constructor() {
        super();
        this.isHelper = true;
        this.type = 'TooltipHelper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.layer = +Infinity;
        this.visible = false;

        // Style
        this.box.min.set(-35, -15);
        this.box.max.set(+35, +15);
        this.radius = 8;
        this.fillStyle.color = '--background-dark';
        this.strokeStyle.color = '--icon-light';
        this.lineWidth = 2;

        // INTERNAL
        this.timer = 0;
    }

    popup(text) {
        //
        // TODO: Set text
        //

        this.timer = performance.now();
    }

    onUpdate(renderer) {
        this.visible = (performance.now() - this.timer < 1000);

        if (this.visible) {
            const camera = renderer.camera;
            const pointer = renderer.pointer;

            // Position
            const position = camera.inverseMatrix.transformPoint(pointer.position);
            this.position.copy(position);

            // // Size
            // _size.subVectors(viewportStart, viewportEnd).abs().divideScalar(2);
            // this.box.min.set(-_size.x, -_size.y);
            // this.box.max.set(+_size.x, +_size.y);
            // this.computeBoundingBox();

            // Transform
            this.rotation = -camera.rotation;
            this.scale.set(1 / camera.scale, 1 / camera.scale);

            this.updateMatrix(true);
        }
    }

}

export { TooltipHelper };
