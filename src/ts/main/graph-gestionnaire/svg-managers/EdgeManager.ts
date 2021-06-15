import * as d3 from "d3";
import { D3DragEvent } from "d3";
import { GraphCustom } from '../GraphCustom';
import Node from "../elements/Node";
import Edge from "../elements/Edge";
import SvgsManager from './SvgsManager';

/**
 * This class manages all adges in the displayed svg 
 */
export default class EdgeManager {
    // #region Properties (5)

    private _graph: GraphCustom;
    private _svgManager: SvgsManager;
    private edges_labels!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public links!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;

    // #endregion Properties (5)

    // #region Constructors (1)

    constructor(svgsManager: SvgsManager, graph: GraphCustom) {
        this._svgManager = svgsManager;
        this.svg = svgsManager.svg;
        this._graph = graph;
        this.update();
    }

    // #endregion Constructors (1)

    // #region Public Methods (4)

    /**
     * Updates the style of the selected edges
     */
    public refreshEdge(): void {
        this.links.style("stroke", d => d.isSelected ? "red" : "blue");
    }

    public refreshEdgeLabels(): void {
        this.edges_labels.text(edge => (edge.name != "None" && edge.name != "") ? edge.name : "");
    }

    /**
     * Updates the positions of the selected nodes
     */
    public refreshPosEdges(): void {
        this.links
            .attr("x1", d => d.source.x)
            .attr("x2", d => d.target.x)
            .attr("y1", d => d.source.y)
            .attr("y2", d => d.target.y)
    }

    /**
     * Updates edges based on data from this.graph
     */
    public update(): void {
        this.links = this.svg.selectAll(".link")
            .data(this._graph.links);

        this.links.enter()
            .append("line")
            .attr("class", "link directed")
            .attr("marker-end", "url(#directed)")
            .style("stroke-width", 4)
            .on("click", (_, e) => { this._graph.elementSelector.selectOrUnselectElement(e); this.refreshEdge() })
            .call(this.drag());

        this.refreshPosEdges();

        this.refreshEdge();

        this.links.exit().remove();

        this.manageEdgeLabels;
    }

    // #endregion Public Methods (4)

    // #region Private Methods (4)

    private drag(): (selection: any) => void {
        const dragstarted = (event: D3DragEvent<any, Edge, Edge>) => {
            if (event.subject.isSelected)
                this.moveSeveralSelectedEdge(event);
            else
                this.moveSingleEdge(event.subject, event.dx, event.dy);
            this.refreshPosEdges();
            this._svgManager.nodeManager.refreshPosNodes();
        }

        const dragged = (event: D3DragEvent<any, Edge, Edge>) => {
            if (event.subject.isSelected)
                this.moveSeveralSelectedEdge(event);
            else
                this.moveSingleEdge(event.subject, event.dx, event.dy);
            this.refreshPosEdges();
            this._svgManager.nodeManager.refreshPosNodes();
        }

        // TODO: faire le dragend

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragged);
    }

    private manageEdgeLabels(): void {
        this.edges_labels = this.svg.selectAll(".e_label")
            .data(this._graph.links);

        this.edges_labels.enter()
            .append("svg:text")
            .attr("class", "e_label")
            .attr("text-anchor", "middle");

        this.edges_labels.exit().remove();

        this.refreshEdgeLabels();
    }

    private moveSeveralSelectedEdge(event: d3.D3DragEvent<any, Edge, Edge>) {
        this.links
            .filter(edge => edge.isSelected)
            .data()
            .reduce((r, v) => { r.add(v.source); r.add(v.target); return r; }, new Set<Node>())
            .forEach(node => this._svgManager.nodeManager.moveSingleNode(node, event.dx, event.dy));
    }

    private moveSingleEdge(subject: Edge, deltaX: number, deltaY: number) {
        this._svgManager.nodeManager.moveSingleNode(subject.source, deltaX, deltaY);
        this._svgManager.nodeManager.moveSingleNode(subject.target, deltaX, deltaY);
    }

    // #endregion Private Methods (4)
}