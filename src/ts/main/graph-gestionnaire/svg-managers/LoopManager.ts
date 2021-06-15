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

    /**
     * Updates all loops.
     */
    public update(): void {
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