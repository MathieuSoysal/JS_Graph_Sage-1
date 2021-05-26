"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = require("d3");
const CommandePatern_1 = require("../../CommandePatern");
const Connection_1 = require("../../Connection");
const GraphCustom_1 = require("../GraphCustom");
const Types_1 = require("../Types");
/**
 * This class manages all svg nodes in the displayed svg
 */
class NodeManager {
    // #endregion Properties (5)
    // #region Constructors (1)
    constructor(svgsManager, graph) {
        this.svg = svgsManager.svg;
        this._graph = graph;
        this.update();
        this.nodes = this.svg.selectAll(".node")
            .data(graph.nodes);
        this.node_labels = this.svg.selectAll(".v_label")
            .data(graph.nodes);
    }
    // #endregion Constructors (1)
    // #region Public Methods (4)
    /**
     * Updates the style of the selected nodes
     */
    refreshNode() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.nodes.style("stroke", node => node.isSelected == true ? "red" : scale(node.group));
    }
    refreshNodeLabels() {
        this.node_labels.text(d => d.name != "" ? d.name : "");
    }
    refreshNodeOutline() {
        this.nodes.style("stroke", d => (d.isSelected == true) ? "red" : "white")
            .style("stroke-width", d => (d.isSelected == true) ? "3" : "2");
    }
    /**
     * Updates edges based on data from this.graph
     */
    update() {
        this.nodes = this.svg.selectAll(".node")
            .data(this._graph.nodes);
        this.nodes.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this._graph.vertex_size)
            .attr("fill", this.color())
            .on("dblclick", (_, d) => this._graph.elementSelector.selectOrUnselectElement(d))
            .call(this.drag());
        this.nodes.enter().append("title")
            .text(d => d.name);
        this.nodes.exit().remove();
        this.manageNodeLabels();
    }
    // #endregion Public Methods (4)
    // #region Private Methods (3)
    color() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d) => scale(d.group);
    }
    // TODO: look the type of event
    drag() {
        function dragstarted(event) {
            GraphCustom_1.graph.nodeIsMoved(event.subject.x, event.subject.y);
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event) {
            event.subject.fx = null;
            event.subject.fy = null;
            let node = GraphCustom_1.graph.getMovedNode();
            if (node) {
                let finalPos = [event.subject.fx, event.subject.fy];
                var positions = new Types_1.ValueRegisterer([node.x, node.y], finalPos, node);
                CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.MoveNodeCommand(GraphCustom_1.graph, positions));
                Connection_1.UpdateGraphProperties("Node's positions changed");
            }
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
    /**
     *                 if (d.previousPos[0] != d.x && d.previousPos[1] != d.y) {
                    let finalPos = [d.x, d.y];
                    var positions = new ValueRegisterer(d.previousPos, finalPos, new ElementCustom(d, GraphType.NodeType));
                    MyManager.Execute(new MoveNodeCommand(positions));
                    UpdateGraphProperties("Node's positions changed");
                }
     */
    manageNodeLabels() {
        // Vertex labels
        this.node_labels = this.svg.selectAll(".v_label")
            .data(this._graph.nodes);
        this.node_labels.enter()
            .append("svg:text")
            .attr("class", "v_label")
            .attr("vertical-align", "middle");
        this.node_labels.exit().remove();
        this.refreshNodeLabels();
    }
}
exports.default = NodeManager;
//# sourceMappingURL=NodeManager.js.map