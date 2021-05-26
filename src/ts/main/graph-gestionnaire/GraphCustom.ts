import { CommandsRepository, myManager } from '../CommandePatern';
import { SageCommand } from "../Connection";
import { CustomWarn as customWarn, InitInterface, PopulateGroupList } from "../InterfaceAndMisc";
import { SinglesSelector } from '../selector-gestionnaire/SinglesSelector';
import SvgsManager from "./svg-managers/SvgsManager";
import { Edge, Loop, Node, Point, ValueRegisterer } from './Types';
import { HtmlArranger } from './Utils';

type SvgInHtml = HTMLElement & SVGElement;

export let graph: GraphCustom;

/**
 * Class representing a Graph
 */
export class GraphCustom {
    // #region Properties (18)

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
    private _vertex_size: number;
    private charge: number;
    /** The force of graph */
    /** Frozen graph indicator */
    private frozen = false;
    private gravity: number;
    /**The function 'line' takes as input a sequence of tuples, and returns a curve interpolating these points.*/
    private link_distance: number;
    private link_strength: number;
    private movedNode: Node | undefined;
    private svgsManager: SvgsManager;

    public currentGroupIndex = 0;
    // private currentObject: any | null = null;
    public cursorPosition = new Point(0, 0);
    public message: string;
    public parameter: SageCommand;
    public selector: SinglesSelector;

    // #endregion Properties (18)

    // #region Constructors (1)

    constructor(graphData: GraphData | null = null) {
        this.selector = new SinglesSelector();
        this._groupList = [];
        if (graphData === null)
            graphData = this.GetGraphFromHTML();
        this._links = graphData.links;
        this._loops = graphData.loops!;
        this._nodes = GraphCustom.getNodesFrom(graphData);
        this._directed = graphData.directed;
        this.frozen = graphData.directed;
        this.charge = graphData.charge;
        this.gravity = graphData.gravity;
        this.link_distance = graphData.link_distance;
        this._vertex_size = graphData.vertex_size;
        this.link_strength = graphData.link_strength;
        if (this.svgsManager) {
            let oldSVG = document.getElementById("svg") as SvgInHtml;
            oldSVG.parentElement!.removeChild(oldSVG);
        }

        this.svgsManager = new SvgsManager(this);

        this.fillGroupFromGraph(graphData);
        InitInterface(this);
        this.waitGraphLoadToFreeze(2000);
    }

    // #endregion Constructors (1)

    // #region Public Accessors (10)

    public get directed() {
        return this._directed;
    }

    public get elementSelector(): SinglesSelector {
        return this.selector;
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

    public get vertex_size(): number {
        return this._vertex_size;
    }

    public get width() { return document.documentElement.clientWidth * 0.8 }

    // #endregion Public Accessors (10)

    // #region Public Static Methods (1)

    public static setNewGraph(graphData: GraphData | null = null): void {
        graph = new GraphCustom(graphData);
    }

    // #endregion Public Static Methods (1)

    // #region Public Methods (40)

    public FillGroupFromGraph(g: GraphData): void {
        this._groupList = [];
        g.nodes.forEach(element => {
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
                let link = this.links.find(l => {
                    return l.source.name == tuple[0] && l.target.name == tuple[1];
                })!;
                this.SetGroupElement(new ValueRegisterer(id, id, link));
            });
            id++;
        });
        this.svgsManager.edgeManager.update();
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
                let node = this.nodes.find(n => n.name == name)!;
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
        this.svgsManager.nodeManager.update();
    }

    /**
     * Adds a new edge to the graph and update interface user.
     * 
     * @param newEdge that added to the graph
     */
    public addEdge(newEdge: Edge): void {
        this.links.push(newEdge);
        this.svgsManager.edgeManager.update();
        HtmlArranger.placeBeforeNode("link");
    }

    /**
     * Connects with edge each of the selected nodes to each other.
     * @returns True if nodes are selectioned and connections with other selectioned nodes is succesful, otherwise return false.
     */
    public addEdgesOnSelection(): boolean {
        let selectedNodes = this.svgsManager.nodeManager.nodes.filter(n => n.isSelected).data();
        if (selectedNodes.length > 0) {
            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                for (let j = i + 1; j < selectedNodes.length; j++) {
                    var newLink = this.createEdge(selectedNodes[i]!, selectedNodes[j]!);
                    myManager.Execute(CommandsRepository.AddEdgeCommand(this, newLink, isFirst));
                    isFirst = false;
                }
            }
            this.svgsManager.edgeManager.update();
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
        this.svgsManager.loopManager.update();
        HtmlArranger.placeBeforeNode("loop");
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
                for (const selectedNode of selectedNodes) {
                    this.addLoopOnNode(selectedNode, isFirst);
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
        this.svgsManager.updateAll();
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
        this.svgsManager.updateAll();

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
            this.svgsManager.arrowManager.displayArrows();
        else
            this.svgsManager.arrowManager.hideArrows();
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
            this.svgsManager.edgeManager.update();
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
            this.svgsManager.loopManager.update();
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
        this._nodes.splice(this.nodes.indexOf(node), 1);
        this.svgsManager.nodeManager.remove(node);
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
        let selectedLinks = this._links.filter(e => e.isSelected);
        let selectedLoops = this._loops.filter(e => e.isSelected);
        let selectedNodes = this._nodes.filter(e => e.isSelected);
        if (selectedNodes.length != 0 || selectedLoops.length != 0 || selectedLinks.length != 0) {
            if (selectedNodes.length != 0) {
                selectedNodes.forEach((node, i) => this.removeNodeCommand(node, i === 0 && isFirst));
                this.svgsManager.nodeManager.update();
                isFirst = false;
            }
            if (selectedLoops.length != 0) {
                selectedLoops.forEach((loop, i) => this.removeLoopCommand(loop, i === 0 && isFirst));
                this.svgsManager.loopManager.update();
                isFirst = false;
            }
            if (selectedLinks.length != 0) {
                selectedLinks.forEach((edge, i) => this.removeEdgeCommand(edge, i === 0 && isFirst));
                this.svgsManager.edgeManager.update();
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
        this.svgsManager.updateAll();
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
            this.svgsManager.edgeManager.refreshEdgeLabels();
        if (element instanceof Loop)
            this.svgsManager.loopManager.refreshLoopLabels();
        if (element instanceof Node)
            this.svgsManager.nodeManager.refreshNodeLabels();
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
            this.svgsManager.nodeManager.update();
        }
        else if (valueRegisterer.element instanceof Edge) {
            let edge = this.links.find(e => e === valueRegisterer.element)!;
            edge.group = (edge.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.svgsManager.edgeManager.update();
        }
        else {
            let loop = this.loops.find(l => l === valueRegisterer.element)!;
            loop.group = (loop.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.svgsManager.loopManager.update();
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
            for (const selectedNode of selectedNodes) {
                if (selectedNode.group != this.groupList[this.currentGroupIndex]) {
                    let vr = new ValueRegisterer(selectedNode.group, this.groupList[this.currentGroupIndex], selectedNode);
                    myManager.Execute(CommandsRepository.ChangeGroupCommand(this, vr, isFirst));
                    isFirst = false;
                }
            }
            return true;
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
        let link = this.links.find(l => l === valueRegisterer.element)!;
        let targetedValue = (link.source == valueRegisterer.newValue[0]) ? valueRegisterer.oldValue : valueRegisterer.newValue;

        link.source = targetedValue[0];
        link.target = targetedValue[1];
        this.svgsManager.edgeManager.update();
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
    public setNodePosition(Pos: number[], node: Node): void {
        let currrentNode = this.nodes.find(n => n === node);
        currrentNode!.x = Pos[0]!;
        currrentNode!.y = Pos[1]!;
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
     * @param graphP that we take nodes
     * @returns nodes contained in the given graph.
     */
    private static getNodesFrom(graphP: GraphData): Node[] {
        let result: Node[] = [];
        for (let i = 0; i < graphP.nodes.length; i++) {
            let nodeInfo = graphP.nodes[i];
            let nodePos = graphP.pos[i]!;
            result.push(new Node(nodeInfo!.group, nodeInfo!.name, nodePos[0]!, nodePos[1]!, false, false));
        }
        return result;
    }

    // #endregion Private Static Methods (1)

    // #region Private Methods (5)

    private GetGraphFromHTML(): GraphData {
        var mydiv = document.getElementById("mygraphdata")!;
        var graph_as_string = mydiv.innerHTML;
        return eval(graph_as_string);
    }

    private fillGroupFromGraph(g: GraphData): void {
        g.nodes.forEach(element => {
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

    // #endregion Private Methods (5)
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
    pos: number[][];
    vertex_size: number;

    // #endregion Properties (11)
}