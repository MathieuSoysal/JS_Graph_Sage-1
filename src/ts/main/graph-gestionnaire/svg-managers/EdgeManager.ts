import * as d3 from "d3";
import { GraphCustom } from '../GraphCustom';
import { Edge } from "../Types";

/**
 * This class manages all adges in the displayed svg 
 */
export class EdgeManager {
    // #region Properties (4)

    private edges_labels!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;
    private graph: GraphCustom;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public links!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;

    // #endregion Properties (4)

    // #region Constructors (1)

    constructor(graph: GraphCustom) {
        this.svg = graph.svg;
        this.graph = graph;
        this.update();
    }

    // #endregion Constructors (1)

    // #region Public Methods (3)

    /**
     * Updates the style of the selected edges
     */
    public refreshEdge(): void {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.links.style("stroke", d => (d.isSelected == true) ? "red" : scale(d.group));
    }

    public refreshEdgeLabels(): void {
        this.edges_labels.text(edge => (edge.name != "None" && edge.name != "") ? edge.name : "");
    }

    /**
     * Updates edges based on data from this.graph
     */
    public update(): void {
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

    private manageEdgeLabels(): void {
        this.edges_labels = this.svg.selectAll(".e_label")
            .data(this.graph.links);

        this.edges_labels.enter()
            .append("svg:text")
            .attr("class", "e_label")
            .attr("text-anchor", "middle");

        this.edges_labels.exit().remove();

        this.refreshEdgeLabels();
    }

    // #endregion Private Methods (1)
}