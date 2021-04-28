import { Edge, Point } from "../graph-gestionnaire/Types";

export class Segment {
    // #region Properties (2)

    public end: Point;
    public start: Point;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(edge: Edge);
    constructor(start: Point, end: Point);
    constructor(startOrEdge: Point | Edge, end?: Point) {
        if (startOrEdge instanceof Point) {
            this.start = startOrEdge;
            this.end = end!;
        } else {
            this.start = new Point(startOrEdge.source.x, startOrEdge.source.y);
            this.end = new Point(startOrEdge.target.x, startOrEdge.target.y);
        }
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    /**
     * Check that this line segment and the given line segment intersect.     * 
     * 
     * @param other segment should be intersected with this segment.
     * @returns True if intersect, otherwise false.
     */
    public doIntersect(other: Segment): boolean {
        // Find the four orientations needed for general and 
        // special cases 
        let o1 = this.orientationCustom(this.start, this.end, other.start);
        let o2 = this.orientationCustom(this.start, this.end, other.end);
        let o3 = this.orientationCustom(other.start, other.end, this.start);
        let o4 = this.orientationCustom(other.start, other.end, this.end);

        // General case 
        if (o1 != o2 && o3 != o4)
            return true;

        // Special Cases 
        // this.start, this.end and otherSegment.start are colinear and otherSegment.start lies on segment p1q1 
        if (o1 == 0 && this.onSegment(this.start, other.start, this.end)) return true;

        // this.start, this.end and otherSegment.end are colinear and otherSegment.end lies on segment p1q1 
        if (o2 == 0 && this.onSegment(this.start, other.end, this.end)) return true;

        // otherSegment.start, otherSegment.end and this.start are colinear and this.start lies on segment p2q2 
        if (o3 == 0 && this.onSegment(other.start, this.start, other.end)) return true;

        // otherSegment.start, otherSegment.end and this.end are colinear and this.end lies on segment p2q2 
        if (o4 == 0 && this.onSegment(other.start, this.end, other.end)) return true;

        return false; // Doesn't fall in any of the above cases 
    }

    // #endregion Public Methods (1)

    // #region Private Methods (2)

    /**
     * Given three colinear points p1, testPoint, p2, the function checks if point testPoint lies on line segment 'pr'
     * 
     * @param p1 first point of the line
     * @param testPoint that should be on the line
     * @param p2 second point of line
     * @returns True if the given test point is on the line between p1 and p2, otherwise false.
     */
    private onSegment(p1: Point, testPoint: Point, p2: Point): boolean {
        if (testPoint.x <= Math.max(p1.x, p2.x) && testPoint.x >= Math.min(p1.x, p2.x) &&
            testPoint.y <= Math.max(p1.y, p2.y) && testPoint.y >= Math.min(p1.y, p2.y))
            return true;

        return false;
    }

    /**
     * To find orientation of ordered triplet (p, q, r). 
     * 
     * @param p 
     * @param q 
     * @param r 
     * @returns 0 --> p, q and r are colinear 
     * 1 --> Clockwise 
     * 2 --> Counterclockwise
     */
    private orientationCustom(p: Point, q: Point, r: Point): number {
        // See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
        // for details of below formula. 
        let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

        if (val == 0) return 0; // colinear 

        return (val > 0) ? 1 : 2; // clock or counterclock wise 
    }

    // #endregion Private Methods (2)
}