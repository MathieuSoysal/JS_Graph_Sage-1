"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopManager = void 0;
/**
 * This class manages all svg loops in the displayed svg
 */
class LoopManager {
    // #endregion Properties (4)
    // #region Constructors (1)
    constructor(svgsManager, graph) {
        this.svg = svgsManager.svg;
        this.graph = graph;
        this.update();
    }
    // #endregion Constructors (1)
    // #region Public Methods (2)
    refreshLoopLabels() {
        this.loop_labels.text(d => (d.name != "None" && d.name != "") ? d.name : "");
    }
    // TODO Refresh
    /**
     * Updates all loops.
     */
    update() {
        this.loops = this.svg.selectAll(".loop")
            .data(this.graph.loops);
        this.loops.enter().append("circle")
            .attr("class", "loop")
            .attr("r", d => d.curve)
            .on("dblclick", (_, loop) => this.graph.elementSelector.selectOrUnselectElement(loop))
            .style("stroke", d => d.color)
            .style("stroke-width", loop => Math.sqrt(loop.strength) + "px");
        this.refreshLoops();
        this.manageLoopLabels();
    }
    // #endregion Public Methods (2)
    // #region Private Methods (2)
    manageLoopLabels() {
        this.loop_labels = this.svg.selectAll(".l_label")
            .data(this.graph.loops);
        this.loop_labels.enter()
            .append("svg:text")
            .attr("class", "l_label")
            .attr("text-anchor", "middle");
        this.loop_labels.exit().remove();
        this.refreshLoopLabels();
    }
    refreshLoops() {
        this.loops.style("stroke", d => (d.isSelected == true) ? "red" : d.color);
    }
}
exports.LoopManager = LoopManager;
//# sourceMappingURL=LoopManager.js.map