// 2D POLYGONS
//  isPointInPolygon()          Returns true if a point is contained within a polygon (convex only)
//  isPointInConcavePolygon()   Returns true if a point is contained within a concave polygon

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

}

export { PolyUtils };
