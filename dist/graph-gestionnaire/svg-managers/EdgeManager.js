"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeManager = void 0;
const d3 = require("d3");
/**
 * This class manages all adges in the displayed svg
 */
class EdgeManager {
    // #endregion Properties (4)
    // #region Constructors (1)
    constructor(svgsManager, graph) {
        this.svg = svgsManager.svg;
        this.graph = graph;
        this.update();
    }
    // #endregion Constructors (1)
    // #region Public Methods (3)
    /**
     * Updates the style of the selected edges
     */
    refreshEdge() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.links.style("stroke", d => (d.isSelected == true) ? "red" : scale(d.group));
    }
    refreshEdgeLabels() {
        this.edges_labels.text(edge => (edge.name != "None" && edge.name != "") ? edge.name : "");
    }
    /**
     * Updates edges based on data from this.graph
     */
    update() {
        this.links = this.svg.selectAll(".link")
            .data(this.graph.links);
        this.links.enter()
            .append("path")
            .attr("class", "link directed")
            .attr("marker-end", "url(#directed)")
            .style("stroke-width", d => Math.sqrt(d.strength))
            .on("dblclick", (_, e) => this.graph.elementSelector.selectOrUnselectElement(e));
        this.refreshEdge();
        this.links.exit().remove();
        this.manageEdgeLabels;
    }
    // #endregion Public Methods (3)
    // #region Private Methods (1)
    manageEdgeLabels() {
        this.edges_labels = this.svg.selectAll(".e_label")
            .data(this.graph.links);
        this.edges_labels.enter()
            .append("svg:text")
            .attr("class", "e_label")
            .attr("text-anchor", "middle");
        this.edges_labels.exit().remove();
        this.refreshEdgeLabels();
    }
}
exports.EdgeManager = EdgeManager;
//# sourceMappingURL=EdgeManager.js.map