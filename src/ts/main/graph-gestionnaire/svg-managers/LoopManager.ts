import * as d3 from "d3";
import { GraphCustom } from '../GraphCustom';
import Loop from "../elements/Loop";
import SvgsManager from './SvgsManager';

/**
 * This class manages all svg loops in the displayed svg 
 */
export default class LoopManager {
    // #region Properties (4)

    private graph: GraphCustom;
    private loop_labels!: d3.Selection<d3.BaseType, Loop, d3.BaseType, unknown>;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public loops!: d3.Selection<d3.BaseType, Loop, d3.BaseType, unknown>;

    // #endregion Properties (4)

    // #region Constructors (1)

    constructor(svgsManager: SvgsManager, graph: GraphCustom) {
        this.svg = svgsManager.svg;
        this.graph = graph;
        this.update();
    }

    // #endregion Constructors (1)

    // #region Public Methods (2)

    public refreshLoopLabels(): void {
        this.loop_labels.text(d => (d.name != "None" && d.name != "") ? d.name : "");
    }

    // TODO Refresh

    private color() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d: Loop) => scale(d.group);
    }

    /**
     * Updates all loops.
     */
    public update(): void {
        const getLoopsInSvg = (): d3.Selection<d3.BaseType, Loop, d3.BaseType, unknown> => this.svg.selectAll(".loop")
            .data(this.graph.loops);

        getLoopsInSvg().enter().append("ellipse")
            .attr("class", "loop")
            .attr("rx", 10)
            .attr("ry", 12)
            .attr("name", n => n.name)
            .on("click", (_, d) => { this.graph.selector.selectOrUnselectElement(this.graph.loops.find(l => l === d)!); this.refreshLoops() })
            .attr("cx", n => n.source.x)
            .attr("cy", n => n.source.y - 15)
            .style("stroke", d => d.color)
            .attr("fill", this.color())
            .style("stroke-width", 2 + "px");

        this.loops = getLoopsInSvg();

        this.refreshLoops();
        this.manageLoopLabels();
    }

    // #endregion Public Methods (2)

    // #region Private Methods (2)

    private manageLoopLabels(): void {
        this.loop_labels = this.svg.selectAll(".l_label")
            .data(this.graph.loops);

        this.loop_labels.enter()
            .append("svg:text")
            .attr("class", "l_label")
            .attr("text-anchor", "middle");

        this.loop_labels.exit().remove();

        this.refreshLoopLabels();
    }

    private refreshLoops(): void {
        this.loops.style("stroke", d => d.isSelected ? "red" : d.color);
    }

    // #endregion Private Methods (2)
}