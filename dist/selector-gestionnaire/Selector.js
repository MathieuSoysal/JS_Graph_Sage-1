"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selector = void 0;
const Types_1 = require("../graph-gestionnaire/Types");
class Selector {
    // #endregion Properties (3)
    // #region Constructors (1)
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.loops = [];
    }
    // #endregion Constructors (1)
    // #region Public Accessors (3)
    get selectedEdges() {
        return this.edges;
    }
    get selectedLoops() {
        return this.loops;
    }
    get selectedNodes() {
        return this.nodes;
    }
    // #endregion Public Accessors (3)
    // #region Public Methods (6)
    /**
     * @returns True if edges are selected, else false.
     */
    edgesAreSelected() {
        return this.edges.length !== 0;
    }
    /**
     * @returns True if loops are selected, else false.
     */
    loopsAreSelected() {
        return this.loops.length !== 0;
    }
    /**
     * @returns True if nodes are selected, else false.
     */
    nodesAreSelected() {
        return this.nodes.length !== 0;
    }
    /**
     * reset aller selected elements
     */
    resetSelection() {
        if (this.nodes && this.nodes.length > 0)
            this.nodes.forEach(e => e.isSelected = false);
        if (this.edges && this.edges.length > 0)
            this.edges.forEach(e => e.isSelected = false);
        if (this.loops && this.loops.length > 0)
            this.loops.forEach(e => e.isSelected = false);
        this.nodes = [];
        this.edges = [];
        this.loops = [];
    }
    /**
     * @param element that should be selected
     */
    selectElement(element) {
        element.isSelected = true;
        if (element instanceof Types_1.Node)
            this.nodes.push(element);
        else if (element instanceof Types_1.Edge)
            this.edges.push(element);
        else
            this.loops.push(element);
    }
    /**
     * If element is already selected, unselect this element
     * Else selection this element
     *
     * @param element
     */
    selectOrUnselectElement(element) {
        if (!element.isSelected) {
            this.selectElement(element);
        }
        else {
            this.deselectElement(element);
        }
    }
    /**
     * @param element that should be deselected
     */
    deselectElement(element) {
        element.isSelected = false;
        if (element instanceof Types_1.Node)
            this.remove(this.nodes, element);
        else if (element instanceof Types_1.Edge)
            this.remove(this.edges, element);
        else
            this.remove(this.loops, element);
    }
    // #endregion Public Methods (6)
    // #region Private Methods (1)
    remove(array, element) {
        array.splice(array.indexOf(element), 1);
    }
}
exports.Selector = Selector;
//# sourceMappingURL=Selector.js.map