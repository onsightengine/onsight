import {
    OUTLINE_THICKNESS,
} from '../../constants.js';
import { Box } from '../../core/objects/Box.js';
import { PolyUtils } from '../../utils/PolyUtils.js';
import { Vector2 } from '../../math/Vector2.js';

const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();

class RubberBandBox extends Box {

    constructor() {
        super();
        this.isHelper = true;
        this.type = 'RubberBandBox';
        this.cursor = 'pointer';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.fillStyle.color = 'rgba(--icon, 0.5)';
        this.fillStyle.fallback = 'rgba(0, 170, 204, 0.5)';
        this.strokeStyle.color = 'rgb(--icon-light)';
        this.strokeStyle.fallback = 'rgba(101, 229, 255)';
        this.lineWidth = OUTLINE_THICKNESS;
        this.constantWidth = true;
    }

    intersected(scene, includeChildren = true) {
        const objects = [];
        const rubberBandBox = this;
        const rubberBandLines = this.getLines(this);
        function checkIntersectObject(object) {
            if (object.visible && object.selectable) {
                const objectLines = rubberBandBox.getLines(object);
                if (rubberBandBox.intersectsPolygon(rubberBandLines, objectLines) ||
                    rubberBandBox.containsPolygon(rubberBandLines, objectLines)) {
                    objects.push(object);
                }
            }
        }
        if (includeChildren) {
            scene.traverse((object) => { if (object !== scene) checkIntersectObject(object); });
        } else {
            for (const object of scene.children) { checkIntersectObject(object); }
        }
        return objects;
    }

    getLines(object) {
        const lines = [];
        const box = object.boundingBox;
        if (Number.isFinite(box.min.x) === false || Number.isFinite(box.min.y) === false) return [];
        if (Number.isFinite(box.max.x) === false || Number.isFinite(box.max.y) === false) return [];
        object.globalMatrix.applyToVector(_topLeft.copy(box.min));
        object.globalMatrix.applyToVector(_topRight.copy(box.max.x, box.min.y));
        object.globalMatrix.applyToVector(_botLeft.copy(box.min.x, box.max.y));
        object.globalMatrix.applyToVector(_botRight.copy(box.max));
        lines.push({ from: new Vector2(_topLeft.x, _topLeft.y), to: new Vector2(_topRight.x, _topRight.y) });
        lines.push({ from: new Vector2(_topRight.x, _topRight.y), to: new Vector2(_botRight.x, _botRight.y) });
        lines.push({ from: new Vector2(_botRight.x, _botRight.y), to: new Vector2(_botLeft.x, _botLeft.y) });
        lines.push({ from: new Vector2(_botLeft.x, _botLeft.y), to: new Vector2(_topLeft.x, _topLeft.y) });
        return lines;
    }

    intersectsPolygon(rubberBandLines, objectLines) {
        for (const rubberBandLine of rubberBandLines) {
            for (const objectLine of objectLines) {
                if (this.intersectsLine(rubberBandLine, objectLine)) return true;
            }
        }
        return false;
    }

    intersectsLine(line1, line2) {
        const { x: x1, y: y1 } = line1.from;
        const { x: x2, y: y2 } = line1.to;
        const { x: x3, y: y3 } = line2.from;
        const { x: x4, y: y4 } = line2.to;
        const denom = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        if (denom === 0) return false;
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }

    containsPolygon(rubberBandLines, objectLines) {
        const rubberBandPolygon = this.linesToPolygon(rubberBandLines);
        const objectPolygon = this.linesToPolygon(objectLines);
        for (const point of objectPolygon) {
            if (!PolyUtils.isPointInPolygon(point, rubberBandPolygon)) return false;
        }
        return true;
    }

    linesToPolygon(lines) {
        const polygon = [];
        for (const line of lines) {
            polygon.push(line.from);
        }
        return polygon;
    }

}

export { RubberBandBox };
