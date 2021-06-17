import * as d3 from "d3";
import { D3DragEvent } from "d3";
import { CommandsRepository, myManager } from "../../CommandePatern";
import { UpdateGraphProperties } from "../../Connection";
import { GraphCustom } from '../GraphCustom';
import Node from "../elements/Node";
import ValueRegisterer from "../elements/ValueRegisterer";
import SvgsManager from './SvgsManager';
import Point from '../elements/Point';

/**
 * This class manages all svg nodes in the displayed svg 
 */
export default class NodeManager {
    // #region Properties (5)
    private readonly scale = d3.scaleOrdinal(d3.schemeCategory10);
    private _graph: GraphCustom;
    private _svgManager: SvgsManager;
    private node_labels: d3.Selection<d3.BaseType, Node, d3.BaseType, unknown>;
    private movedNodes: Array<{ oldPosition: Point, node: Node }>;

    public nodes: d3.Selection<d3.BaseType, Node, d3.BaseType, unknown>;
    public svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

    // #endregion Properties (5)

    // #region Constructors (1)

    constructor(svgsManager: SvgsManager, graph: GraphCustom) {
        this._svgManager = svgsManager;
        this.svg = svgsManager.svg;
        this._graph = graph;
        this.update();
    }


    // #endregion Constructors (1)

    // #region Public Methods (7)

    public moveSeveralSelectedNodes(delatX: number, delatY: number) {
        this.getSelectedNodes().forEach(n => { n.x += delatX; n.y += delatY; });
        this.refreshPosNodes();
    }

    private getSelectedNodes() {
        return this.nodes.filter(n => n.isSelected).data();
    }

    public moveSingleNode(subject: Node, deltaX: number, deltaY: number) {
        subject.x += deltaX;
        subject.y += deltaY;
        this.refreshPosNodes();
    }

    public refreshNodeLabels(): void {
        this.node_labels.text(d => d.name != "" ? d.name : "");
    }

    /**
     * Updates the style of the selected nodes
     */
    public refreshNodes(): void {
        this.nodes
            .style("stroke", node => node.isSelected ? "red" : this.scale(node.group))
            .style("stroke-width", d => d.isSelected ? "3" : "2");
    }

    /**
     * Updates the positions of the selected nodes
     */
    public refreshPosNodes(): void {
        this.nodes
            .attr("cx", n => n.x)
            .attr("cy", n => n.y);
    }

    public remove(node: Node) {
        this.nodes.filter(n => n === node).remove();
        this.nodes = this.nodes.filter(n => n !== node);
        this.refreshNodes();
    }

    /**
     * Updates edges based on data from this.graph
     */
    public update() {
        const getNodesOnSVG = () => this.svg.selectAll(".node")
            .data(this._graph.nodes);

        getNodesOnSVG().enter()
            .append("circle")
            .attr("class", "node")
            .attr("name", n => n.name)
            .attr("cx", n => n.x)
            .attr("cy", n => n.y)
            .attr("r", this._graph.vertex_size)
            .attr("fill", this.color())
            .on("click", (_, d) => { this._graph.selector.selectOrUnselectElement(this._graph.nodes.find(n => n === d)!); this.refreshNodes() })
            .call(this.drag());

        this.nodes = getNodesOnSVG();

        this.refreshNodes();

        this.manageNodeLabels();
    }

    // #endregion Public Methods (7)

    // #region Private Methods (3)

    private color() {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d: Node) => scale(d.group);
    }

    // TODO: look the type of event
    private drag(): (selection: any) => void {
        const dragstarted = (event: D3DragEvent<any, Node, Node>) => {
            this._graph.nodeIsMoved(event.subject.x, event.subject.y);
            if (event.subject.isSelected)
                this.movedNodes = this.getSelectedNodes().map(n => { return { oldPosition: new Point(n.x, n.y), node: n } });
            else
                this.movedNodes = [{ oldPosition: new Point(event.subject.x, event.subject.y), node: event.subject }]
            this._svgManager.edgeManager.refreshPosEdges();
        }

        const dragged = (event: D3DragEvent<any, Node, Node>) => {
            if (event.subject.isSelected)
                this.moveSeveralSelectedNodes(event.dx, event.dy);
            else
                this.moveSingleNode(event.subject, event.dx, event.dy);
            this._svgManager.edgeManager.refreshPosEdges();
        }

        const dragended = () => {
            this.movedNodes.forEach((m, i) => {
                var positions = new ValueRegisterer([m.oldPosition.x, m.oldPosition.y], [m.node.x, m.node.y], m.node);
                myManager.Execute(CommandsRepository.MoveNodeCommand(this._graph, positions, i === 0));
            }
            )
            UpdateGraphProperties("Node's positions changed");
            this._svgManager.edgeManager.refreshPosEdges();
            this.refreshPosNodes();
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    private manageNodeLabels(): void {
        // Vertex labels
        this.node_labels = this.svg.selectAll(".v_label")
            .data(this._graph.nodes)

        this.node_labels.enter()
            .append("svg:text")
            .attr("class", "v_label")
            .attr("vertical-align", "middle")

        this.node_labels.exit().remove();

        this.refreshNodeLabels();
    }

    // #endregion Private Methods (3)
}