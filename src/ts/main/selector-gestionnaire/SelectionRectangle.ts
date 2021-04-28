import { Segment } from './Segment';
import { Node, Edge, Loop, Point } from '../graph-gestionnaire/Types';

export class SelectionRectangle {
    // #region Properties (8)

    private bottomBorder: Segment;
    private bottomLefttCorner: Point;
    private bottomRightCorner: Point;
    private leftBorder: Segment;
    private rightBorder: Segment;
    private topBorder: Segment;
    private topLeftCorner: Point;
    private topRightCorner: Point;

    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(extent: number[][]) {
        this.topLeftCorner = new Point(extent[0]![0]!, extent[0]![1]!);
        this.topRightCorner = new Point(extent[1]![0]!, extent[0]![1]!);
        this.bottomLefttCorner = new Point(extent[0]![0]!, extent[1]![1]!);
        this.bottomRightCorner = new Point(extent[1]![0]!, extent[1]![1]!);
        this.topBorder = new Segment(this.topLeftCorner, this.topRightCorner);
        this.leftBorder = new Segment(this.topLeftCorner, this.bottomLefttCorner);
        this.rightBorder = new Segment(this.topRightCorner, this.bottomRightCorner);
        this.bottomBorder = new Segment(this.bottomRightCorner, this.bottomLefttCorner);
    }

    // #endregion Constructors (1)

    // #region Public Methods (3)

    /**
     * Check if given element is inside this rectangle
     * 
     * @param element to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    public hasInside(element: Node | Edge | Loop): boolean {
        if (element instanceof Node)
            return this.hasNodeInside(element);
        else if (element instanceof Edge)
            return this.hasEdgeInside(element)
        else
            return this.hasLoopInside(element);
    }

    /**
     * Check if given node is inside this rectangle
     * 
     * @param node to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    public hasNodeInside(node: Node): boolean {
        return this.topLeftCorner.x <= node.x
            && node.x < this.bottomRightCorner.x
            && this.topLeftCorner.y <= node.y
            && node.y < this.bottomRightCorner.y;
    }

    /**
     * Check if given edge is inside this rectangle
     * 
     * @param edge to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    public hasEdgeInside(edge: Edge): boolean {
        return this.hasNodeInside(edge.source)
            || this.hasNodeInside(edge.target)
            || this.doesSegmentIntersect(edge);
    }

    /**
     * Check if given loop is inside this rectangle
     * 
     * @param loop to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    public hasLoopInside(loop: Loop): boolean {
        return this.hasNodeInside(loop.source);
    }

    // #endregion Public Methods (3)

    // #region Private Methods (2)

    private doesSegmentIntersect(edge: Edge): boolean {
        let edgeSegment: Segment = new Segment(edge);
        return this.topBorder.doIntersect(edgeSegment)
            || this.leftBorder.doIntersect(edgeSegment)
            || this.rightBorder.doIntersect(edgeSegment)
            || this.bottomBorder.doIntersect(edgeSegment);
    }

    // #endregion Private Methods (2)
}