import * as d3 from "d3";
import { CommandsRepository, myManager } from "../../CommandePatern";
import { UpdateGraphProperties } from "../../Connection";
import { graph, GraphCustom } from '../GraphCustom';
import { Node, ValueRegisterer } from '../Types';

/**
 * This class manages all svg nodes in the displayed svg 
 */
export class NodeManager {
    // #region Properties (4)

    private graph: GraphCustom;
    private node_labels: d3.Selection<d3.BaseType, Node, d3.BaseType, unknown>;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public nodes: d3.Selection<d3.BaseType, Node, d3.BaseType, unknown>;

    // #endregion Properties (4)

    // #region Constructors (1)

    constructor(graph: GraphCustom) {
        this.svg = graph.svg;
        this.graph = graph;
        this.update();
        this.nodes = this.svg.selectAll(".node")
            .data(graph.nodes);
        this.node_labels = this.svg.selectAll(".v_label")
            .data(this.graph.nodes)
    }

    // #endregion Constructors (1)

    // #region Public Methods (4)

    /**
     * Updates the style of the selected nodes
     */
    public refreshNode(): void {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.nodes.style("stroke", node => node.isSelected == true ? "red" : scale(node.group));
    }

    public refreshNodeLabels(): void {
        this.node_labels.text(d => d.name != "" ? d.name : "");
    }

    public refreshNodeOutline(): void {
        this.nodes.style("stroke", d => (d.isSelected == true) ? "red" : "white")
            .style("stroke-width", d => (d.isSelected == true) ? "3" : "2")
    }

    /**
     * Updates edges based on data from this.graph
     */
    public update() {
        this.nodes = this.svg.selectAll(".node")
            .data(this.graph.nodes);

        this.nodes.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this.graph.vertex_size)
            .attr("fill", this.color())
            .on("dblclick", (_, d) => this.graph.elementSelector.selectOrUnselectElement(d))
            .call(this.drag(this.graph.forceSimulation));

        this.nodes.enter().append("title")
            .text(d => d.name);

        this.nodes.exit().remove();

        this.manageNodeLabels();
    }

    // #endregion Public Methods (4)

    // #region Private Methods (3)

    private color() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d: Node) => scale(d.group);
    }

    // TODO: look the type of event
    private drag(simulation: d3.Simulation<Node, undefined>): (selection: any) => void {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            graph.nodeIsMoved(event.subject.x, event.subject.y);
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
            let node = graph.getMovedNode();
            if (node) {
                let finalPos = [event.subject.fx, event.subject.fy];
                var positions = new ValueRegisterer([node.x, node.y], finalPos, node);
                myManager.Execute(CommandsRepository.MoveNodeCommand(graph, positions));
                UpdateGraphProperties("Node's positions changed");
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
    private manageNodeLabels(): void {
        // Vertex labels
        this.node_labels = this.svg.selectAll(".v_label")
            .data(this.graph.nodes)

        this.node_labels.enter()
            .append("svg:text")
            .attr("class", "v_label")
            .attr("vertical-align", "middle")

        this.node_labels.exit().remove();

        this.refreshNodeLabels();
    }

    // #endregion Private Methods (3)
}