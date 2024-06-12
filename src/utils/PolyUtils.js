// 2D POLYGONS
//  isPointInPolygon()          Returns true if a point is contained within a polygon (convex only)
//  isPointInConcavePolygon()   Returns true if a point is contained within a concave polygon
// OBJECTS
//  findObjects()               Find objects in pixel data
//  findHoles()                 Find holes in object (used within findObjects())
//  floodFill()                 Floods an area of pixel data (used within findObjects())
//  traceContour()              Finds outer edge of a chunk of pixel data (used within findObjects())
//  simplifyContour()           Simplify point list with Douglas-Peucker algorithm (used within findObjects())

const ALPHA_THRESHOLD = 5;      // 0 to 255

class PolyUtils {

    /******************** 2D POLYGONS ********************/

    /** Returns true if a point is contained within a polygon (convex only) */
    static isPointInPolygon(point, polygon) {
        // Ray casting algorithm, see: https://en.wikipedia.org/wiki/Point_in_polygon
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /** Returns true if a point is contained within a concave polygon */
    static isPointInConcavePolygon(point, polygon) {
        // Winding number algorithm, see: https://en.wikipedia.org/wiki/Point_in_polygon
        function isLeft(p1, p2, point) {
            return (p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y);
        }
        let windingNumber = 0;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            if (p1.y <= point.y) {
                if (p2.y > point.y && isLeft(p1, p2, point) > 0) windingNumber++;
            } else {
                if (p2.y <= point.y && isLeft(p1, p2, point) < 0) windingNumber--;
            }
        }
        return windingNumber !== 0;
    }

    /******************** OBJECTS ********************/

    /**
     * Find objects in pixel data
     * @param {ImageData} maskData - Pixel data (https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
     * @param {Number} simplify - Simplification intensity (~ 0.1 to 10-ish).
     */
    static findObjects(maskData, simplify = 1.0) {
        const width = maskData.width;
        const height = maskData.height;

        // Track pixels visited, start by flood filling outer perimeter
        const visited = new Array(width * height).fill(false);
        for (let x = 0; x < width; x++) PolyUtils.floodFill(x, 0, maskData, visited, 'border');
        for (let x = 0; x < width; x++) PolyUtils.floodFill(x, height - 1, maskData, visited, 'border');
        for (let y = 0; y < height; y++) PolyUtils.floodFill(0, y, maskData, visited, 'border');
        for (let y = 0; y < height; y++) PolyUtils.floodFill(width - 1, y, maskData, visited, 'border');

        // Find Objects
        const objects = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alreadyVisited = visited[y * width + x];
                const alphaValue = maskData.data[(y * width + x) * 4 + 3];
                if (!alreadyVisited && alphaValue > ALPHA_THRESHOLD) {
                    const pixels = PolyUtils.floodFill(x, y, maskData, visited, 'object');
                    if (pixels.length > 0) {
                        const holes = PolyUtils.findHoles(pixels, maskData, visited);
                        const outerContour = PolyUtils.traceContour(pixels, maskData);
                        objects.push({ outerContour, holes });
                    }
                }
            }
        }

        // Simplify
        const contours = [];
        objects.forEach((object) => {
            if (object.outerContour.length > 0) {
                const simplifiedOuterContour = PolyUtils.simplifyContour(object.outerContour, simplify);
                contours.push({ outerContour: simplifiedOuterContour, holes: [] });
                // Process each hole
                object.holes.forEach((hole) => {
                    if (hole.length > 0) {
                        const simplifiedHole = PolyUtils.simplifyContour(hole, simplify);
                        contours[contours.length - 1].holes.push(simplifiedHole);
                    }
                });
            }
        });
        return contours;
    }

    static findHoles(pixels, maskData, visited) {
        const width = maskData.width;
        const height = maskData.height;
        const minX = Math.min(...pixels.map(point => point[0]));
        const maxX = Math.max(...pixels.map(point => point[0]));
        const minY = Math.min(...pixels.map(point => point[1]));
        const maxY = Math.max(...pixels.map(point => point[1]));

        // Create a copy of the visited array, mark pixels as visited
        const objectVisited = [ ...visited ];
        for (const [ x, y ] of pixels) {
            objectVisited[y * width + x] = true;
        }
        for (let x = minX; x <= maxX; x++) PolyUtils.floodFill(x, minY, maskData, objectVisited, 'border');
        for (let x = minX; x <= maxX; x++) PolyUtils.floodFill(x, maxY, maskData, objectVisited, 'border');
        for (let y = minY; y <= maxY; y++) PolyUtils.floodFill(minX, y, maskData, objectVisited, 'border');
        for (let y = minY; y <= maxY; y++) PolyUtils.floodFill(maxX, y, maskData, objectVisited, 'border');

        // Find Holes
        let holes = [];
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const alreadyVisited = objectVisited[y * width + x];
                const alphaValue = maskData.data[(y * width + x) * 4 + 3];
                if (!alreadyVisited && alphaValue <= ALPHA_THRESHOLD) {
                    const hole = PolyUtils.floodFill(x, y, maskData, objectVisited, 'hole');
                    if (hole.length > 0) holes.push(PolyUtils.traceContour(hole, maskData, true /* isHole */));
                }
            }
        }
        return holes;
    }

    static floodFill(x, y, maskData, visited, type) {
        const width = maskData.width;
        const height = maskData.height;
        const queue = [ [ x, y ] ];
        const directions = [ [  0,  1 ], [  1,  0 ], [  0, -1 ], [ -1,  0 ], ];

        const floodedPixels = [];
        while (queue.length > 0) {
            const [ cx, cy ] = queue.shift();
            const index = cy * width + cx;
            if (cx < 0 || cx >= width) continue;
            if (cy < 0 || cy >= height) continue;
            if (visited[index]) continue;
            if (type === 'border' && maskData.data[index * 4 + 3] > ALPHA_THRESHOLD) continue;
            if (type === 'object' && maskData.data[index * 4 + 3] <= ALPHA_THRESHOLD) continue;
            if (type === 'hole') { /* EMPTY */ }
            visited[index] = true;
            floodedPixels.push([ cx, cy ]);
            for (let i = 0; i < 4; i++) {
                const nx = cx + directions[i][0];
                const ny = cy + directions[i][1];
                queue.push([ nx, ny ]);
            }
        }
        return floodedPixels;
    }

    static traceContour(pixels, maskData, isHole = false) {
        if (!pixels || pixels.length === 0) return [];
        const width = maskData.width;
        const height = maskData.height;
        const contour = [];
        const directions = [ [  1,  0 ], [  0,  1 ], [ -1,  0 ], [  0, -1 ], ];

        let startX = pixels[0][0];
        let startY = pixels[0][1];
        let currentX = startX;
        let currentY = startY;
        let dir = isHole ? 2 : 0;
        do {
            contour.push([ currentX, currentY ]);
            for (let i = 0; i < 4; i++) {
                const newDir = (dir + i) % 4;
                const newX = currentX + directions[newDir][0];
                const newY = currentY + directions[newDir][1];
                let opaque = true;
                opaque = opaque && (newX >= 0 && newX < width && newY >= 0 && newY < height);
                opaque = opaque && (maskData.data[((newY * width + newX) * 4) + 3] > ALPHA_THRESHOLD);
                if (isHole ? !opaque : opaque) {
                    currentX = newX;
                    currentY = newY;
                    dir = (newDir + 3) % 4;
                    break;
                }
            }
        } while (currentX !== startX || currentY !== startY);
        return contour;
    }

    /** Simplify point list (https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm) */
    static simplifyContour(contour, epsilon) {
        function perpendicularDistance(point, lineStart, lineEnd) {
            const dx = lineEnd[0] - lineStart[0];
            const dy = lineEnd[1] - lineStart[1];
            const norm = Math.sqrt(dx * dx + dy * dy);
            const nx = dy / norm;
            const ny = -dx / norm;
            const vx = point[0] - lineStart[0];
            const vy = point[1] - lineStart[1];
            return Math.abs(nx * vx + ny * vy);
        }
        function simplifySegment(contour, start, end, epsilon, simplified) {
            let maxDist = 0;
            let maxIndex = 0;
            for (let i = start + 1; i < end; i++) {
                const dist = perpendicularDistance(contour[i], contour[start], contour[end]);
                if (dist > maxDist) {
                    maxDist = dist;
                    maxIndex = i;
                }
            }
            if (maxDist > epsilon) {
                simplifySegment(contour, start, maxIndex, epsilon, simplified);
                simplified.push(contour[maxIndex]);
                simplifySegment(contour, maxIndex, end, epsilon, simplified);
            }
        }
        const simplified = [ contour[0] ];
        simplifySegment(contour, 0, contour.length - 1, epsilon, simplified);
        simplified.push(contour[contour.length - 1]);
        return simplified;
    }

}

export { PolyUtils };
