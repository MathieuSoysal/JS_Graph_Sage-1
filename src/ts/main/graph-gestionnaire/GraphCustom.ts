import * as d3 from "d3";
import { CommandsRepository, myManager } from '../CommandePatern';
import { SageCommand } from "../Connection";
import { Edge, Loop, Node, Point, ValueRegisterer } from './Types';
import { CustomWarn as customWarn, InitInterface, PopulateGroupList } from "../InterfaceAndMisc";
import { ArrowManager } from "./svg-managers/ArrowManager";
import { EdgeManager } from "./svg-managers/EdgeManager";
import { LoopManager } from "./svg-managers/LoopManager";
import { NodeManager } from "./svg-managers/NodeManager";
import { SelectionRectangle } from "../selector-gestionnaire/SelectionRectangle";
import { Selector } from '../selector-gestionnaire/Selector';

type SvgInHtml = HTMLElement & SVGElement;

export let graph: GraphCustom;

/**
 * Class representing a Graph
 */
export class GraphCustom {
    // #region Properties (23)

    /** The commands manager */
    /** Directed graph indicator */
    private _directed = false;
    /** The groups of graph */
    private _groupList: Array<string>;
    /** The edges of graph */
    private _links: Edge[];
    /** The loops of graph */
    private _loops: Loop[];
    /** The nodes of graph */
    private _nodes: Node[];
    private _svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private _vertex_size: number;
    private arrowManager: ArrowManager;
    private charge: number;
    private edgeManager: EdgeManager;
    /** The force of graph */
    /** Frozen graph indicator */
    private frozen = false;
    private gravity: number;
    /**The function 'line' takes as input a sequence of tuples, and returns a curve interpolating these points.*/
    private link_distance: number;
    private link_strength: number;
    private loopManager: LoopManager;
    private movedNode: Node | undefined;
    private nodeManager: NodeManager;
    private selector: Selector;
    private simulation: d3.Simulation<Node, undefined>;

    /** The current groupe index */
    public currentGroupIndex = 0;
    /** The current element index */
    // private currentObject: any | null = null;
    /** The current position of cursor */
    public cursorPosition = new Point(0, 0);
    public message: string;
    public parameter: SageCommand;

    // #endregion Properties (23)

    // #region Constructors (1)

    constructor(graphData: GraphData | null = null) {
        this.selector = new Selector();
        this._groupList = [];
        // if (this.force) { this.simulation.stop(); }
        if (graphData === null)
            graphData = this.GetGraphFromHTML();
        this._links = graphData.links;
        this._loops = graphData.loops;
        this._nodes = GraphCustom.getNodesFrom(graphData);
        this._directed = graphData.directed;
        this.frozen = graphData.directed;
        this.charge = graphData.charge;
        this.gravity = graphData.gravity;
        this.link_distance = graphData.link_distance;
        this._vertex_size = graphData.vertex_size;
        this.link_strength = graphData.link_strength;
        if (this._svg) {
            let oldSVG = document.getElementById("svg") as SvgInHtml;
            oldSVG.parentElement!.removeChild(oldSVG);
        }
        this._svg = d3.select("#graphFrame").append("svg")
            .attr("id", "svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("pointer-events", "all") // Zoom+move management
            .append('svg:g')
            .append('svg:rect')
            .attr('x', -10000)
            .attr('y', -10000)
            .attr('width', 2 * 10000)
            .attr('height', 2 * 10000);

        this.simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.index!))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        // SVG window

        this.edgeManager = new EdgeManager(this);
        this.nodeManager = new NodeManager(this);
        this.loopManager = new LoopManager(this);
        this.arrowManager = new ArrowManager(this);
        this.fillGroupFromGraph(graphData);
        this.initGraph();
        InitInterface(this);
        this.manageAllGraphicsElements();
        this.initForce();
        //Start the automatic force layout
        this.simulation.restart();
        //Freeze the graph after 2 sec
        this.waitGraphLoadToFreeze(2000);
    }

    // #endregion Constructors (1)

    // #region Public Accessors (12)

    public get directed() {
        return this._directed;
    }

    public get elementSelector(): Selector {
        return this.selector;
    }

    public get forceSimulation(): d3.Simulation<Node, undefined> {
        return this.simulation;
    }

    public get groupList(): Array<string> {
        return this._groupList;
    }

    public get groupsNames(): string[] {
        return [...this.groupList];
    }

    public get height() { return document.documentElement.clientHeight }

    public get links(): Edge[] {
        return this._links;
    }

    public get loops(): Loop[] {
        return this._loops;
    }

    public get nodes(): Node[] {
        return this._nodes;
    }

    public get svg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return this._svg;
    }

    public get vertex_size(): number {
        return this._vertex_size;
    }

    public get width() { return document.documentElement.clientWidth * 0.8 }

    // #endregion Public Accessors (12)

    // #region Public Static Methods (1)

    public static setNewGraph(graphData: GraphData | null = null): void {
        graph = new GraphCustom(graphData);
    }

    // #endregion Public Static Methods (1)

    // #region Public Methods (40)

    public FillGroupFromGraph(graph: GraphData): void {
        this._groupList = [];
        graph.nodes.forEach(element => {
            if (!this._groupList.includes(element.group)) {
                this._groupList.push(element.group);
            }
        });
    }

    public SetGroupElement(valueRegisterer: ValueRegisterer) {
        let element = valueRegisterer.element;
        element.group = (element.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
    }

    public SetLinksColoration(colorationList: any) {
        var id = 0;
        colorationList.forEach((coloration: any) => {
            coloration.forEach((tuple: any) => {
                let link = this.links.find((link) => {
                    return link.source.name == tuple[0] && link.target.name == tuple[1];
                })!;
                this.SetGroupElement(new ValueRegisterer(id, id, link));
            });
            id++;
        });
        this.edgeManager.update();
    }

    /**
     * Updates the new position x and y of a node, with a ValueRegisterer 
     * 
     * @param registeredPos that contains the new pos, and the node should be updated
     */
    public SetNewPositionToANode(registeredPos: ValueRegisterer): void {
        this.setNodePosition(registeredPos.newValue, registeredPos.element as Node);
    }

    public SetNodesColoration(colorationList: Array<Array<string>>) {
        var id = 0;
        colorationList.forEach(coloration => {
            coloration.forEach(name => {
                let node = this.nodes.find(node => node.name == name)!;
                this.SetGroupElement(new ValueRegisterer(id, id, node));
            });
            id++;
        });

        this._groupList = [];
        graph.nodes.forEach(element => {
            if (!this._groupList.includes(element.group)) {
                this._groupList.push(element.group);
            }
        });
        PopulateGroupList();
        this.nodeManager.update();
    }

    /**
     * Adds a new edge to the graph and update interface user.
     * 
     * @param newEdge that added to the graph
     */
    public addEdge(newEdge: Edge): void {
        this.links.push(newEdge);
        this.edgeManager.update();
        this.placeBeforeNode("link");
        this.simulation.restart();
    }

    /**
     * Connects with edge each of the selected nodes to each other.
     * @returns True if nodes are selectioned and connections with other selectioned nodes is succesful, otherwise return false.
     */
    public addEdgesOnSelection(): boolean {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes = this.selector.selectedNodes;

            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                for (let j = i + 1; j < selectedNodes.length; j++) {
                    var newLink = this.createEdge(selectedNodes[i]!, selectedNodes[j]!);
                    myManager.Execute(CommandsRepository.AddEdgeCommand(this, newLink, isFirst));
                    isFirst = false;
                }
            }
            return true;
        }
        customWarn("No nodes to add loop at on the selection");
        return false;
    }

    /**
     * Adds a new group to this group list.
     * 
     * @param name of the new group. 
     */
    public addGroup(name: string) {
        this.groupList.push(name);
        this.currentGroupIndex = this.groupList.length - 1;
    }

    /**
     * Adds a new loop to the graph and update interface user.
     * 
     * @param newLoop that added to the graph
     */
    public addLoop(newLoop: Loop): void {
        this.loops.push(newLoop);
        this.loopManager.update();
        this.placeBeforeNode("loop");
        this.simulation.restart();
    }

    /**
     * Add node in graph and sbumit to SageMath
     * 
     * @param node to add loop
     * @param isFirst action
     */
    public addLoopOnNode(node: Node, isFirst = true): void {
        var newLoop = new Loop(node);
        myManager.Execute(CommandsRepository.AddLoopCommand(this, newLoop, isFirst));
    }

    /**
     * Add loop for each selected nodes, else show error to user.
     * 
     * @returns True if selection contains nodes and loop is added for each node, else false.
     */
    public addLoopOnSelectedNodes(): boolean {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes: Node[] = this.selector.selectedNodes;
            if (selectedNodes.length > 0) {
                let isFirst = true;
                for (let i = 0; i < selectedNodes.length; i++) {
                    this.addLoopOnNode(selectedNodes[i]!, isFirst);
                    isFirst = false;
                }
                return true;
            } else {
                customWarn("No nodes to add loop at on the selection");
            }
        }
        return false;
    }

    /**
     * Adds new node with the position of current cursor.
     * 
     * @returns True if the add is successful.
     */
    public addNewNode() {
        var newNode = this.createNode();
        myManager.Execute(CommandsRepository.AddNodeCommand(this, newNode));
        return true;
    }

    /**
     * Add a node in graph and updates diplayed graph
     * 
     * @param newNode to add in the graph
     * @returns true if the new node is added
     */
    public addNode(newNode: Node): boolean {
        //Add it to the data
        this.nodes.push(newNode);

        //Apply nodes rules to the data
        this.nodeManager.update();

        //Restart the force layout with the new elements
        this.simulation.restart();

        return true;
    }

    /**
     * Generate an edge with the given src and dest.
     * 
     * @param src the first node
     * @param dest the second node
     * @returns Edge
     */
    public createEdge(src: Node, dest: Node): Edge {
        let selected = src.isSelected && dest.isSelected;
        return new Edge(0, dest, "#aaa", 0, src, "", selected);
    }

    /**
     * create the new node with optional predefinite position.
     * 
     * @param pos that the new node should have, else tak the current position of cursor
     * @returns generated node
     */
    public createNode(pos?: Point): Node {
        let newX: number;
        let newY: number;
        if (pos !== undefined) {
            newX = pos.x;
            newY = pos.y;
        } else {
            newX = this.cursorPosition.x;
            newY = this.cursorPosition.y;
        }

        return new Node("0", this.findLowestIDAvailable(), newX, newY, this.frozen, false);
    }

    /**
     * If the graph is oriented, show the arrows, otherwise hide them.
     */
    public displayOrHideArrows() {
        if (this.directed)
            this.arrowManager.displayArrows();
        else
            this.arrowManager.hideArrows();
    }

    public freezeOrUnfreezeGraph(): void {
        this.frozen = !this.frozen;
        this.nodes.forEach(d => d.fixed = this.frozen);
    }

    public getMovedNode(): Node | undefined {
        return this.movedNode;
    }

    /**
     * Inverts all selected edges, displays error otherwise.
     * 
     * @returns True if edges are selected and inverted successful, otherwise false
     */
    public invertEdgesOnSelection(): boolean {
        if (!this.directed || !this.selector.edgesAreSelected()) {
            if (this.directed)
                customWarn("No edges to invert");
            else
                customWarn("No edges to invert");
            return false;
        }
        let edges = this.selector.selectedEdges;
        edges.forEach((edge, i) => CommandsRepository.InvertDirectionCommand(this, edge, i == 0));
        return true;
    }

    public nodeIsMoved(x: number, y: number) {
        this.movedNode = this._nodes.find(n => n.x === x && n.y === y);
    }

    /**
     * Removes the given edge from graph
     * 
     * @param edge that to be removed from graph 
     */
    public removeEdge(edge: Edge): void {
        let index = this.links.indexOf(edge);
        //Prevent multiple deletion on the same element causing bugs
        if (index != -1) {
            this.links.splice(index, 1);
            this.edgeManager.update();
            this.simulation.restart();
        }
    }

    /**
     * Submits the remove command to SageMath.
     * 
     * @param egde that to be removed
     * @param _isFirst 
     */
    public removeEdgeCommand(edge: Edge, _isFirst: boolean) {
        if (this.links.indexOf(edge) != -1) {
            myManager.Execute(CommandsRepository.SupprEdgeCommand(this, edge, _isFirst));
        }
    }

    /**
     * Submits the remove command to SageMath.
     * 
     * @param element that to be removed
     * @param _isFirst 
     */
    public removeElementCommand(element: Node | Edge | Loop, _isFirst = true): void {
        if (element instanceof Node)
            this.removeNodeCommand(element, _isFirst);
        else if (element instanceof Edge)
            this.removeEdgeCommand(element, _isFirst);
        else if (element instanceof Loop)
            this.removeLoopCommand(element, _isFirst);
    }

    /**
     * Removes the given loop from graph.
     * 
     * @param loop that to be removed from graph 
     */
    public removeLoop(loop: Loop): void {
        let index = this.loops.indexOf(loop);
        //Prevent multiple deletion on the same element causing bugs
        if (index != -1) {
            this.loops.splice(this.loops.indexOf(loop), 1);
            this.loopManager.update();
            this.simulation.restart();
        }
    }

    /**
     * Submits the remove command to SageMath.
     * 
     * @param loop that to be removed
     * @param _isFirst 
     */
    public removeLoopCommand(loop: Loop, _isFirst: boolean) {
        if (this.loops.indexOf(loop) != -1) {
            myManager.Execute(CommandsRepository.SupprLoopCommand(this, loop, _isFirst));
        }
    }

    /**
     * Removes the given node from graph.
     * 
     * @param node that to be removed from graph 
     */
    public removeNode(node: Node): void {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.nodeManager.update();
        this.simulation.restart();
    }

    /**
     * Submits the remove command to SageMath.
     * 
     * @param node that to be removed
     * @param _isFirst 
     */
    public removeNodeCommand(node: Node, _isFirst: boolean) {
        // TODO SageMath fait automatiquement ça

        let isFirst = _isFirst;
        this.links.forEach(edge => {
            if (edge.source === node || edge.target === node) {
                myManager.Execute(CommandsRepository.SupprEdgeCommand(this, edge, isFirst));
                isFirst = false;
            }
        });

        this.loops.forEach(loop => {
            if (loop.source === node)
                myManager.Execute(CommandsRepository.SupprLoopCommand(this, loop, false));
        });

        myManager.Execute(CommandsRepository.SupprNodeCommand(this, node, false));
    }

    /**
     * For each selected element submits remove command to SageMath, otherwise show error to user.
     * 
     * @returns True if elements are selected and deleted successfully, otherwise false.
     */
    public removeSelection(): boolean {
        let isFirst = true;
        if (this.selector.nodesAreSelected() || this.selector.loopsAreSelected() || this.selector.edgesAreSelected()) {
            if (this.selector.nodesAreSelected()) {
                this.selector.selectedNodes.forEach((node, i) => this.removeNodeCommand(node, i === 0 && isFirst));
                this.nodeManager.update();
                isFirst = false;
            }
            if (this.selector.loopsAreSelected()) {
                this.selector.selectedLoops.forEach((loop, i) => this.removeLoopCommand(loop, i === 0 && isFirst));
                this.loopManager.update();
                isFirst = false;
            }
            if (this.selector.edgesAreSelected()) {
                this.selector.selectedEdges.forEach((edge, i) => this.removeEdgeCommand(edge, i === 0 && isFirst));
                this.edgeManager.update();
                isFirst = false;
            }
            this.selector.resetSelection();
            return true;
        }
        customWarn("Nothing to delete");
        return false;
    }

    public resetSelection() {
        this.selector.resetSelection();
    }

    /**
     * Sets a new name on a given element, if the new name is already defined, set the old name.
     * 
     * @param valueRegisterer contains the element, new name, old name.
     */
    public setElementName(valueRegisterer: ValueRegisterer): void {
        let element = valueRegisterer.element;
        element.name = (element.name == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
        if (element instanceof Edge)
            this.edgeManager.refreshEdgeLabels();
        if (element instanceof Loop)
            this.loopManager.refreshLoopLabels();
        if (element instanceof Node)
            this.nodeManager.refreshNodeLabels();
    }

    /**
     * Sets a new group on a given element, if the new group is already defined, set the old group.
     * 
     * @param valueRegisterer contains the element, new group, old group.
     */
    public setGroupElement(valueRegisterer: ValueRegisterer): void {
        // TODO: { element: Node | Edge | Loop, newValue: string, oldValue: string }
        if (valueRegisterer.element instanceof Node) {
            let node = this.nodes.find(n => n === valueRegisterer.element)!;
            node.group = (node.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.nodeManager.update();
        }
        else if (valueRegisterer.element instanceof Edge) {
            let edge = this.links.find(edge => edge === valueRegisterer.element)!;
            edge.group = (edge.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.edgeManager.update();
        }
        else {
            let loop = this.loops.find(loop => loop === valueRegisterer.element)!;
            loop.group = (loop.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.loopManager.update();
        }
    }

    /**
     * Add a group for each selected nodes, else show error to user.
     * 
     * @returns Trus if nodes are selected and an group is attributed for each selected node, else false.
     */
    public setGroupOfSelection(): boolean {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes: Node[] = this.selector.selectedNodes;
            let isFirst = true;

            for (let i = 0; i < selectedNodes.length; i++) {
                if (selectedNodes[i]!.group != this.groupList[this.currentGroupIndex]) {
                    let vr = new ValueRegisterer(selectedNodes[i]!.group, this.groupList[this.currentGroupIndex], selectedNodes[i]!);
                    myManager.Execute(CommandsRepository.ChangeGroupCommand(this, vr, isFirst));
                    isFirst = false;
                }
                return true;
            }
        }
        customWarn("No nodes selected");
        return false;
    }

    /**
     * Sets the direction of given link, if the new direction is already defined, set the old direction.
     * 
     * @param valueRegisterer contains the edge, new direction, old direction.
     */
    public setLinkDirection(valueRegisterer: ValueRegisterer): void {
        let link = this.links.find(link => link === valueRegisterer.element)!;
        let targetedValue = (link.source == valueRegisterer.newValue[0]) ? valueRegisterer.oldValue : valueRegisterer.newValue;

        link.source = targetedValue[0];
        link.target = targetedValue[1];
        this.edgeManager.update();
        this.simulation.restart();
    }

    public setNewPosition(registeredPos: ValueRegisterer): void {
        this.setNodePosition(registeredPos.newValue, registeredPos.element as Node);
    }

    /**
     * Updates the position x and y of a node, with a Point
     * 
     * @param Pos that contains the new position of node
     * @param node that should be updated
     */
    public setNodePosition(Pos: Point, node: Node): void {
        let currrentNode = this.nodes.find(n => n === node);
        this.simulation.stop();
        currrentNode!.x = Pos.x;
        currrentNode!.y = Pos.y;
        this.simulation.restart();
        // TODO
    }

    /**
     * Updates the old position x and y of a node, with a ValueRegisterer 
     * 
     * @param registeredPos that contains the old pos, and the node should be updated
     */
    public setOldPosition(registeredPos: ValueRegisterer): void {
        this.setNodePosition(registeredPos.oldValue, registeredPos.element as Node);
    }

    /**
     * Adds a node to the center of given edge.
     * 
     * @param edge that to be add a node
     * @param isFirst 
     */
    public subdivideEdge(edge: Edge, isFirst = true): void {
        let pos = this.third_point_of_curved_edge(new Point(edge.source.x, edge.source.y), new Point(edge.target.x, edge.target.y), 0);
        let newNode = this.createNode(pos);

        myManager.Execute(CommandsRepository.AddNodeCommand(this, newNode, isFirst));
        myManager.Execute(CommandsRepository.AddEdgeCommand(this, this.createEdge(newNode, edge.source), false));
        myManager.Execute(CommandsRepository.AddEdgeCommand(this, this.createEdge(newNode, edge.target), false));
        myManager.Execute(CommandsRepository.SupprEdgeCommand(this, edge, false));
    }

    /**
     * Subdivides all selected edges, displays an error to the user if no edge is selected or if an error occurred during the operation.
     * 
     * @returns True if the edges are selected and that all one could be subdivided, otherwise false.
     */
    public subdivideEdgeOnSelection(): boolean {
        if (this.selector.edgesAreSelected()) {
            this.selector.selectedEdges.forEach((edge, i) => this.subdivideEdge(edge, i == 0));
            return true;
        }
        customWarn("No edges to subdivide");
        return false;
    }

    public toJSON() {
        let result: JsonGraph = {
            charge: this.charge,
            directed: this._directed,
            edge_thickness: 0,
            gravity: this.gravity,
            link_distance: this.link_distance,
            link_strength: this.link_strength,
            links: [],
            loops: [],
            nodes: [],
            pos: [],
            vertex_size: this.vertex_size,
            parameter: this.parameter,
            message: this.message
        };

        result.links.forEach(link => {
            link.source = (link.source as Node).name;
            link.target = (link.target as Node).name;
        });

        result.loops.forEach(loop => {
            loop.source = loop.target = (loop.source as Node).name;
        });

        //Return the Y to correspond with Sage Plan
        result.nodes.forEach(node => {
            node.y = -node.y;
        });

        //Shrink graph to adapt to the scale of SageMath Show() method
        result.nodes.forEach(function (node) {
            node.x = node.x / 100;
            node.y = node.y / 100;
        });

        return JSON.stringify(result);
    }

    /**
     * If the freeze is unabled, disable it, otherwise unable it.
     */
    public unabledOrDisableFreezeGraph(): void {
        this.frozen = !this.frozen;
        this.nodes.forEach(d => d.fixed = this.frozen);
    }

    // #endregion Public Methods (40)

    // #region Private Static Methods (1)

    /**
     * 
     * @param graph that we take nodes
     * @returns nodes contained in the given graph.
     */
    private static getNodesFrom(graph: GraphData): Node[] {
        let result: Node[] = [];
        for (let i = 0; i < graph.nodes.length; i++) {
            const nodeInfo = graph.nodes[i];
            const nodePos = graph.pos[i];
            result.push(new Node(nodeInfo!.group, nodeInfo!.name, nodePos!.x, nodePos!.y, false, false));
        }
        return result;
    }

    // #endregion Private Static Methods (1)

    // #region Private Methods (11)

    private GetGraphFromHTML(): GraphData {
        var mydiv = document.getElementById("mygraphdata")!;
        var graph_as_string = mydiv.innerHTML;
        let graph: GraphData = eval(graph_as_string);
        return graph;
    }

    private center_and_scale() {
        var minx = this.nodes[0]!.x;
        var maxx = this.nodes[0]!.x;
        var miny = this.nodes[0]!.y;
        var maxy = this.nodes[0]!.y;

        //Determine Min/Max
        this.nodes.forEach(function (n) {
            maxx = Math.max(maxx, n.x);
            minx = Math.min(minx, n.x);
            maxy = Math.max(maxy, n.y);
            miny = Math.min(miny, n.y);
        });

        var border = 60
        var xspan = maxx - minx;
        var yspan = maxy - miny;

        var scale = Math.min((this.height - border) / yspan, (this.width - border) / xspan);
        var xshift = (this.width - scale * xspan) / 2
        var yshift = (this.height - scale * yspan) / 2

        this.simulation.nodes().forEach(node => {
            node.x = scale * (node.x! - minx) + xshift;
            node.y = scale * (node.y! - miny) + yshift;
        });
    }

    private fillGroupFromGraph(graph: GraphData): void {
        graph.nodes.forEach(element => {
            if (!this.groupList.includes(element.group)) {
                this.groupList.push(element.group);
            }
        });
    }

    private findLowestIDAvailable(): string {
        let lowestID = Infinity;
        for (let i = 0; lowestID === Infinity; i++)
            if (this.nodes.find(node => +node.name === i) === undefined)
                lowestID = i;
        return lowestID.toString(10);
    }

    private initBrush() {
        d3.brush()
            .extent([[-100000, 100000], [-100000, 100000]])
            .on("start brush end", (ev: d3.D3BrushEvent<any>) => {
                if (ev.selection === null) {
                    this.selector.resetSelection();
                } else {
                    let rectangleSelection: SelectionRectangle = new SelectionRectangle(ev.target.extent() as unknown as number[][]);
                    this.nodes.forEach(node => { if (rectangleSelection.hasNodeInside(node)) this.selector.selectElement(node) });
                    this.loops.forEach(loop => { if (rectangleSelection.hasLoopInside(loop)) this.selector.selectElement(loop) });
                    this.links.forEach(edge => { if (rectangleSelection.hasEdgeInside(edge)) this.selector.selectElement(edge) });
                }
                this.nodeManager.update();
                this.loopManager.update();
                this.edgeManager.update();
            });
    }

    private initForce() {
        const link = this._svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(this.links)
            .join("line")
            .attr("stroke-width", d => d.strength);

        const node = this.nodeManager.nodes;

        node.append("title")
            .text(d => d.name);

        this.simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    }

    private initGraph(): void {
        this.loops.forEach(loop => {
            loop.source = this.nodes[this.nodes.indexOf(loop.source)]!;
            loop.target = this.nodes[this.nodes.indexOf(loop.source)]!;
        });

        this.simulation.on("tick", () => {
            this.edgeManager.links
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            this.nodeManager.nodes
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // Adapts the graph layout to the javascript window's dimensions
        if (this.nodes.length != 0) {
            this.center_and_scale();
        }
    }

    private manageAllGraphicsElements() {
        this.initBrush();
        this.nodeManager.update();
        this.edgeManager.update();
        this.loopManager.update();
        this.arrowManager.update();
    }

    /**
     * Puts all elements that have className as a class before the Node elements.
     * 
     * @param className 
     */
    private placeBeforeNode(className: string): void {
        let elements = document.getElementsByClassName(className);
        let elem = elements[elements.length - 1]!;

        let firstNode = document.getElementsByClassName("node")[0]!;
        firstNode.parentNode!.insertBefore(elem, firstNode);
    }

    /**
     * Adds a thrid point in center of two given points.
     * 
     * @param pa the first point
     * @param pb the second point
     * @param d the curve of edge
     * @returns the new point
     */
    private third_point_of_curved_edge(pa: Point, pb: Point, d: number): Point {
        var ox = pa.x,
            oy = pa.y,
            dx = pb.x,
            dy = pb.y;
        var cx = (dx + ox) / 2,
            cy = (dy + oy) / 2;
        var ny = -(dx - ox),
            nx = dy - oy;
        var nn = Math.sqrt(nx * nx + ny * ny)
        return new Point(cx + d * nx / nn, cy + d * ny / nn);
    }

    private waitGraphLoadToFreeze(waitingTime: number): void {
        setTimeout(() => this.freezeOrUnfreezeGraph(), waitingTime);
    }

    // #endregion Private Methods (11)
}

type JsonEdge = {
    strength: number;
    target: string | Node;
    color: string;
    curve: number;
    source: string | Node;
    name: string;
}

interface JsonGraph {
    // #region Properties (13)

    charge: number;
    directed: boolean;
    edge_thickness: number;
    gravity: number;
    link_distance: number;
    link_strength: number;
    links: JsonEdge[];
    loops: JsonEdge[];
    message: string;
    nodes: Node[];
    parameter: string;
    pos: { x: number, y: number }[];
    vertex_size: number;

    // #endregion Properties (13)
}

interface GraphData {
    // #region Properties (11)

    charge: number;
    directed: boolean;
    edge_thickness: number;
    gravity: number;
    link_distance: number;
    link_strength: number;
    links: Edge[];
    loops: Loop[];
    nodes: { name: string, group: string }[];
    pos: { x: number, y: number }[];
    vertex_size: number;

    // #endregion Properties (11)
}