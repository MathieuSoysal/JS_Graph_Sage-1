import * as d3 from "d3";
import { D3DragEvent } from "d3";
import { GraphCustom } from '../GraphCustom';
import Node from "../elements/Node";
import Edge from "../elements/Edge";
import SvgsManager from './SvgsManager';
import Point from "../elements/Point";
import ValueRegisterer from "../elements/ValueRegisterer";
import { CommandsRepository, myManager } from "../../CommandePatern";
import { UpdateGraphProperties } from "../../Connection";

/**
 * This class manages all adges in the displayed svg 
 */
export default class EdgeManager {
    // #region Properties (6)

    private _graph: GraphCustom;
    private _svgManager: SvgsManager;
    private edges_labels!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;
    private movedNodes: Array<{ oldPosition: Point, node: Node }>;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    public links!: d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown>;

    // #endregion Properties (6)

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
        this.links.style("stroke", d => d.isSelected ? "red" : d.color);
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
        const getEdgeInSVG = (): d3.Selection<d3.BaseType, Edge, d3.BaseType, unknown> =>
            this.svg.selectAll(".link").data(this._graph.links);

        getEdgeInSVG().enter()
            .append("line")
            .attr("class", "link directed")
            .attr("marker-end", "url(#directed)")
            .style("stroke-width", 4)
            .attr("fill", this.color())
            .style("stroke", d => d.color)
            .on("click", (_, e) => { this._graph.elementSelector.selectOrUnselectElement(e); this.refreshEdge() })
            .call(this.drag());

        this.links = getEdgeInSVG();

        this.refreshPosEdges();

        this.refreshEdge();

        this.links.exit().remove();

        this.manageEdgeLabels();
    }

    // #endregion Public Methods (4)

    // #region Private Methods (6)

    private color() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d: Edge) => scale(d.group);
    }

    private drag(): (selection: any) => void {
        const dragstarted = (event: D3DragEvent<any, Edge, Edge>) => {
            if (event.subject.isSelected)
                this.movedNodes = this.getNodeOfSelectedEdges().map(n => { return { oldPosition: new Point(n.x, n.y), node: n } });
            else
                this.movedNodes = [
                    { oldPosition: new Point(event.subject.source.x, event.subject.source.y), node: event.subject.source },
                    { oldPosition: new Point(event.subject.target.x, event.subject.target.y), node: event.subject.target }
                ]
        }

        const dragged = (event: D3DragEvent<any, Edge, Edge>) => {
            if (event.subject.isSelected)
                this.moveSeveralSelectedEdge(event);
            else
                this.moveSingleEdge(event.subject, event.dx, event.dy);
            this._svgManager.refreshElementsPosition();
        }

        const dragended = () => {
            this.movedNodes.forEach((m, i) => {
                var positions = new ValueRegisterer([m.oldPosition.x, m.oldPosition.y], [m.node.x, m.node.y], m.node);
                myManager.Execute(CommandsRepository.MoveNodeCommand(this._graph, positions, i === 0));
            })
            UpdateGraphProperties("Edge's positions changed");
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    private getNodeOfSelectedEdges(): Array<Node> {
        return [...this.links
            .filter(edge => edge.isSelected)
            .data()
            .reduce((r, v) => { r.add(v.source); r.add(v.target); return r; }, new Set<Node>())];
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
        this.getNodeOfSelectedEdges()
            .forEach(node => this._svgManager.nodeManager.moveSingleNode(node, event.dx, event.dy));
    }

    private moveSingleEdge(subject: Edge, deltaX: number, deltaY: number) {
        this._svgManager.nodeManager.moveSingleNode(subject.source, deltaX, deltaY);
        this._svgManager.nodeManager.moveSingleNode(subject.target, deltaX, deltaY);
    }

    // #endregion Private Methods (6)
}