import * as d3 from "d3";
import { GraphCustom } from '../GraphCustom';

/**
 * This class manages all svg arrows in the displayed svg 
 */
export class ArrowManager {
    // #region Properties (3)

    private graph: GraphCustom;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public arrows: d3.Selection<d3.BaseType, string, d3.BaseType, unknown>;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(graph: GraphCustom) {
        this.svg = graph.svg;
        this.graph = graph;
        this.update();
    }

    // #endregion Constructors (1)

    // #region Public Methods (3)

    /**
     * Display all arrows
     */
    public displayArrows(): void {
        this.arrows.style("fill", "#ffffff00");
    }

    /**
     * Hide all arrows
     */
    public hideArrows(): void {
        this.arrows.style("fill", "#ffffff00");
    }

    /**
     * Updates all arrows, this method should run after updating edges.
     */
    public update(): void {
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

    // #endregion Public Methods (3)
}