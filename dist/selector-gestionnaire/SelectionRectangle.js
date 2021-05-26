"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionRectangle = void 0;
const Segment_1 = require("./Segment");
const Types_1 = require("../graph-gestionnaire/Types");
class SelectionRectangle {
    // #endregion Properties (8)
    // #region Constructors (1)
    constructor(extent) {
        this.topLeftCorner = new Types_1.Point(extent[0][0], extent[0][1]);
        this.topRightCorner = new Types_1.Point(extent[1][0], extent[0][1]);
        this.bottomLefttCorner = new Types_1.Point(extent[0][0], extent[1][1]);
        this.bottomRightCorner = new Types_1.Point(extent[1][0], extent[1][1]);
        this.topBorder = new Segment_1.Segment(this.topLeftCorner, this.topRightCorner);
        this.leftBorder = new Segment_1.Segment(this.topLeftCorner, this.bottomLefttCorner);
        this.rightBorder = new Segment_1.Segment(this.topRightCorner, this.bottomRightCorner);
        this.bottomBorder = new Segment_1.Segment(this.bottomRightCorner, this.bottomLefttCorner);
    }
    // #endregion Constructors (1)
    // #region Public Methods (3)
    /**
     * Check if given element is inside this rectangle
     *
     * @param element to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    hasInside(element) {
        if (element instanceof Types_1.Node)
            return this.hasNodeInside(element);
        else if (element instanceof Types_1.Edge)
            return this.hasEdgeInside(element);
        else
            return this.hasLoopInside(element);
    }
    /**
     * Check if given node is inside this rectangle
     *
     * @param node to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    hasNodeInside(node) {
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
    hasEdgeInside(edge) {
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
    hasLoopInside(loop) {
        return this.hasNodeInside(loop.source);
    }
    // #endregion Public Methods (3)
    // #region Private Methods (2)
    doesSegmentIntersect(edge) {
        let edgeSegment = new Segment_1.Segment(edge);
        return this.topBorder.doIntersect(edgeSegment)
            || this.leftBorder.doIntersect(edgeSegment)
            || this.rightBorder.doIntersect(edgeSegment)
            || this.bottomBorder.doIntersect(edgeSegment);
    }
}
exports.SelectionRectangle = SelectionRectangle;
//# sourceMappingURL=SelectionRectangle.js.map