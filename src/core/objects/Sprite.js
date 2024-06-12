import { Box } from './Box.js';
import { Box2 } from '../../math/Box2.js';
import { PolyUtils } from '../../utils/PolyUtils.js';

const PATTERN_COLOR = '#ffffff';
const PATTERN_SPACING = 5;              // space between diamonds
const SIMPLIFY_AMOUNT = 0.2;            // 0.1 to 10-ish

let _pattern;

class Sprite extends Box {

    #box = new Box2();

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
        this.contours = [];
        this.path = new Path2D();

	    if (src) this.setImage(src);
    }

    setImage(src) {
        const self = this;
        this.image.onload = function() {
            const width = self.image.naturalWidth;
            const height = self.image.naturalWidth;
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            self.box.min.set(-halfWidth, -halfHeight);
            self.box.max.set(+halfWidth, +halfHeight);
            self.computeBoundingBox();

            // Alpha Mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskContext = maskCanvas.getContext('2d');
            maskContext.drawImage(self.image, 0, 0, width, height, 0, 0, width, height);

            // Get the alpha channel data from the mask canvas
            const imageData = maskContext.getImageData(0, 0, width, height);
            const alphaData = imageData.data;
            const maskData = maskContext.createImageData(width, height);
            const maskPixels = maskData.data;

            // Set the mask pixels based on the alpha channel
            for (let i = 3; i < alphaData.length; i += 4) {
                const alpha = alphaData[i];
                maskPixels[i - 3] = alpha;
                maskPixels[i - 2] = alpha;
                maskPixels[i - 1] = alpha;
                maskPixels[i] = alpha;
            }
            maskContext.putImageData(maskData, 0, 0);

            // Find Objects in Pixel Data
            self.contours = PolyUtils.findObjects(maskData, SIMPLIFY_AMOUNT);

            // Contours to Path2D
            const path = new Path2D();
            for (const contour of self.contours) {
                const outerContour = contour.outerContour;
                path.moveTo(outerContour[0][0] - halfWidth, outerContour[0][1] - halfHeight);
                for (let i = 1; i < outerContour.length; i++) {
                    path.lineTo(outerContour[i][0] - halfWidth, outerContour[i][1] - halfHeight);
                }
                path.closePath();
                for (const hole of contour.holes) {
                    const hl = hole.length - 1;
                    path.moveTo(hole[hl][0] - halfWidth, hole[hl][1] - halfHeight);
                    for (let i = hl - 1; i >= 0; i--) {
                        path.lineTo(hole[i][0] - halfWidth, hole[i][1] - halfHeight);
                    }
                    path.closePath();
                }
            }
            self.path = path;
        };
        this.image.src = src;
    }

    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;

        // Pattern?
        if (!_pattern) _pattern = context.createPattern(createCrossHatchPattern(PATTERN_COLOR, 0.5, PATTERN_SPACING), 'repeat');

        // Check Bounds
        if (this.box.equals(this.#box) === false) this.computeBoundingBox();

        // Image Complete?
        if (this.image.src.length === 0 || !this.image.complete) return;

        // Image Data
        const width = this.image.naturalWidth;
        const height = this.image.naturalHeight;
        const sx = 0;
        const sy = 0;
        const sw = width;
        const sh = height;
        const dx = width / -2;
        const dy = height / -2;
        const dw = width;
        const dh = height;

        // Transparent Draw
        if (context.globalAlpha < 0.05) {
            context.save();
            context.globalAlpha = 1;

            // Create a new path that is scaled based on the camera scale
            const scaledPath = new Path2D();
            scaledPath.addPath(this.path, new DOMMatrix([ camera.scale, 0, 0, camera.scale, 0, 0 ]));

            // Clip using the scaled path
            context.scale(1 / camera.scale, 1 / camera.scale);
            context.clip(scaledPath);

            // Fill the pattern
            context.fillStyle = _pattern;
            context.fillRect(dx * camera.scale, dy * camera.scale, dw * camera.scale, dh * camera.scale);

            // Stroke the scaled path
            context.strokeStyle = PATTERN_COLOR;
            context.lineWidth = 1.5;
            context.stroke(scaledPath);
            context.restore();
        // Normal Draw
        } else {
            context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }

}

export { Sprite };

/******************** INTERNAL */

function createCrossHatchPattern(color, lineWidth, spacing) {
    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    const size = spacing * 2;
    patternCanvas.width = size;
    patternCanvas.height = size;
    patternContext.strokeStyle = color;
    patternContext.lineWidth = lineWidth;
    patternContext.beginPath();
    patternContext.moveTo(0, 0);    patternContext.lineTo(size, size);
    patternContext.moveTo(size, 0); patternContext.lineTo(0, size);
    patternContext.stroke();
    return patternCanvas;
}
