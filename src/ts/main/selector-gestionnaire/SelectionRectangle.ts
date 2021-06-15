import { Segment } from './Segment';
import { Element } from '../graph-gestionnaire/elements/Element';
import Node from "../graph-gestionnaire/elements/Node";
import Loop from "../graph-gestionnaire/elements/Loop";
import Point from "../graph-gestionnaire/elements/Point";
import Edge from "../graph-gestionnaire/elements/Edge";
import { SinglesSelector } from './SinglesSelector';
import { GraphCustom } from '../graph-gestionnaire/GraphCustom';

/**
 * the SelectionRectangle class is used for brush
 */
export default class SelectionRectangle {
    // #region Properties (9)

    private _selector: SinglesSelector;
    private bottomBorder: Segment;
    private bottomLefttCorner: Point;
    private bottomRightCorner: Point;
    private leftBorder: Segment;
    private rightBorder: Segment;
    private topBorder: Segment;
    private topLeftCorner: Point;
    private topRightCorner: Point;

    // #endregion Properties (9)

    // #region Constructors (1)

    constructor() {
        this._selector = new SinglesSelector();
    }

    // #endregion Constructors (1)

    // #region Public Methods (8)

    public getSelectedElement(): Array<Element> {
        return this._selector.selectedElements;
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
     * Check if given loop is inside this rectangle
     * 
     * @param loop to check if the position ise inside this rectangle.
     * @returns True if is inside, otherwise false.
     */
    public hasLoopInside(loop: Loop): boolean {
        return this.hasNodeInside(loop.source);
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

    public resetSelection() {
        this._selector.resetSelection();
    }

    /**
     * Set a new selection positions and deselects all items that are no longer on the new selection 
     * 
     * @param selectionPos [[topLeftCorner.x, topLeftCorner.y] , [bottomRightCorner.x, bottomRightCorner.y]]
     */
    public setNewSelection(selectionPos: number[][]) {
        this.topLeftCorner = new Point(selectionPos[0]![0]!, selectionPos[0]![1]!);
        this.topRightCorner = new Point(selectionPos[1]![0]!, selectionPos[0]![1]!);
        this.bottomLefttCorner = new Point(selectionPos[0]![0]!, selectionPos[1]![1]!);
        this.bottomRightCorner = new Point(selectionPos[1]![0]!, selectionPos[1]![1]!);
        this.topBorder = new Segment(this.topLeftCorner, this.topRightCorner);
        this.leftBorder = new Segment(this.topLeftCorner, this.bottomLefttCorner);
        this.rightBorder = new Segment(this.topRightCorner, this.bottomRightCorner);
        this.bottomBorder = new Segment(this.bottomRightCorner, this.bottomLefttCorner);
    }

    /**
     * Deselects all items that are no longer on selection and
     * Selects all elements of given graph that are inside selection
     * 
     * @param graph from which elements will be retrieved
     */
    public updateSelectedElements(graph: GraphCustom) {
        this.deselectsAllElementsThatAreNoLongerOnSelection();
        this.selectsAllItemsThatAreInsideSelection(graph);
    }

    // #endregion Public Methods (8)

    // #region Private Methods (3)

    /**
     * Deselects all items that are no longer on selection
     */
    private deselectsAllElementsThatAreNoLongerOnSelection() {
        this._selector.selectedElements.filter(e => !this.hasInside(e)).forEach(e => this._selector.deselectElement(e))
    }

    private doesSegmentIntersect(edge: Edge): boolean {
        let edgeSegment: Segment = new Segment(edge);
        return this.topBorder.doIntersect(edgeSegment)
            || this.leftBorder.doIntersect(edgeSegment)
            || this.rightBorder.doIntersect(edgeSegment)
            || this.bottomBorder.doIntersect(edgeSegment);
    }

    /**
     * Selects all items of given graph that are inside selection
     * 
     * @param graph from which elements will be retrieved 
     */
    private selectsAllItemsThatAreInsideSelection(graph: GraphCustom) {
        graph.loops.filter(e => !e.isSelected && this.hasLoopInside(e)).forEach(e => this._selector.selectElement(e));
        graph.links.filter(e => !e.isSelected && this.hasEdgeInside(e)).forEach(e => this._selector.selectElement(e));
        graph.nodes.filter(e => !e.isSelected && this.hasNodeInside(e)).forEach(e => this._selector.selectElement(e));
    }

    // #endregion Private Methods (3)
}