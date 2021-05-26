"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrowManager = void 0;
/**
 * This class manages all svg arrows in the displayed svg
 */
class ArrowManager {
    // #endregion Properties (3)
    // #region Constructors (1)
    constructor(svgsManager, graph) {
        this.svg = svgsManager.svg;
        this.graph = graph;
        this.update();
    }
    // #endregion Constructors (1)
    // #region Public Methods (3)
    /**
     * Display all arrows
     */
    displayArrows() {
        this.arrows.style("fill", "#ffffff00");
    }
    /**
     * Hide all arrows
     */
    hideArrows() {
        this.arrows.style("fill", "#ffffff00");
    }
    /**
     * Updates all arrows, this method should run after updating edges.
     */
    update() {
        this.arrows = this.svg
            .append("svg:defs")
            .selectAll("marker")
            .data(["directed"])
            .enter().append("svg:marker")
            .attr("id", String)
            // viewbox is a rectangle with bottom-left corder (0,-2), width 4 and height 4
            .attr("viewBox", "0 -2 4 4")
            // This formula took some time ... :-P
            .attr("refX", Math.ceil(2 * Math.sqrt(this.graph.vertex_size)))
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("svg:path")
            // triangles with endpoints (0,-2), (4,0), (0,2)
            .attr("d", "M0,-2L4,0L0,2");
        if (this.graph.directed)
            this.displayArrows();
        else
            this.hideArrows();
    }
}
exports.ArrowManager = ArrowManager;
//# sourceMappingURL=ArrowManager.js.map