"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphCustom = exports.graph = void 0;
const CommandePatern_1 = require("../CommandePatern");
const InterfaceAndMisc_1 = require("../InterfaceAndMisc");
const Selector_1 = require("../selector-gestionnaire/Selector");
const SvgsManager_1 = require("./svg-managers/SvgsManager");
const Types_1 = require("./Types");
const Utils_1 = require("./Utils");
/**
 * Class representing a Graph
 */
class GraphCustom {
    // #endregion Properties (18)
    // #region Constructors (1)
    constructor(graphData = null) {
        // #region Properties (18)
        /** The commands manager */
        /** Directed graph indicator */
        this._directed = false;
        /** The force of graph */
        /** Frozen graph indicator */
        this.frozen = false;
        this.currentGroupIndex = 0;
        // private currentObject: any | null = null;
        this.cursorPosition = new Types_1.Point(0, 0);
        this.selector = new Selector_1.Selector();
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
        if (this.svgsManager) {
            let oldSVG = document.getElementById("svg");
            oldSVG.parentElement.removeChild(oldSVG);
        }
        this.svgsManager = new SvgsManager_1.default(this);
        this.fillGroupFromGraph(graphData);
        InterfaceAndMisc_1.InitInterface(this);
        this.waitGraphLoadToFreeze(2000);
    }
    // #endregion Constructors (1)
    // #region Public Accessors (12)
    get directed() {
        return this._directed;
    }
    get elementSelector() {
        return this.selector;
    }
    get groupList() {
        return this._groupList;
    }
    get groupsNames() {
        return [...this.groupList];
    }
    get height() { return document.documentElement.clientHeight; }
    get links() {
        return this._links;
    }
    get loops() {
        return this._loops;
    }
    get nodes() {
        return this._nodes;
    }
    get vertex_size() {
        return this._vertex_size;
    }
    get width() { return document.documentElement.clientWidth * 0.8; }
    // #endregion Public Accessors (12)
    // #region Public Static Methods (1)
    static setNewGraph(graphData = null) {
        exports.graph = new GraphCustom(graphData);
    }
    // #endregion Public Static Methods (1)
    // #region Public Methods (40)
    FillGroupFromGraph(graph) {
        this._groupList = [];
        graph.nodes.forEach(element => {
            if (!this._groupList.includes(element.group)) {
                this._groupList.push(element.group);
            }
        });
    }
    SetGroupElement(valueRegisterer) {
        let element = valueRegisterer.element;
        element.group = (element.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
    }
    SetLinksColoration(colorationList) {
        var id = 0;
        colorationList.forEach((coloration) => {
            coloration.forEach((tuple) => {
                let link = this.links.find((link) => {
                    return link.source.name == tuple[0] && link.target.name == tuple[1];
                });
                this.SetGroupElement(new Types_1.ValueRegisterer(id, id, link));
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
    SetNewPositionToANode(registeredPos) {
        this.setNodePosition(registeredPos.newValue, registeredPos.element);
    }
    SetNodesColoration(colorationList) {
        var id = 0;
        colorationList.forEach(coloration => {
            coloration.forEach(name => {
                let node = this.nodes.find(node => node.name == name);
                this.SetGroupElement(new Types_1.ValueRegisterer(id, id, node));
            });
            id++;
        });
        this._groupList = [];
        exports.graph.nodes.forEach(element => {
            if (!this._groupList.includes(element.group)) {
                this._groupList.push(element.group);
            }
        });
        InterfaceAndMisc_1.PopulateGroupList();
        this.svgsManager.nodeManager.update();
    }
    /**
     * Adds a new edge to the graph and update interface user.
     *
     * @param newEdge that added to the graph
     */
    addEdge(newEdge) {
        this.links.push(newEdge);
        this.svgsManager.edgeManager.update();
        Utils_1.HtmlArranger.placeBeforeNode("link");
    }
    /**
     * Connects with edge each of the selected nodes to each other.
     * @returns True if nodes are selectioned and connections with other selectioned nodes is succesful, otherwise return false.
     */
    addEdgesOnSelection() {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes = this.selector.selectedNodes;
            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                for (let j = i + 1; j < selectedNodes.length; j++) {
                    var newLink = this.createEdge(selectedNodes[i], selectedNodes[j]);
                    CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddEdgeCommand(this, newLink, isFirst));
                    isFirst = false;
                }
            }
            return true;
        }
        InterfaceAndMisc_1.CustomWarn("No nodes to add loop at on the selection");
        return false;
    }
    /**
     * Adds a new group to this group list.
     *
     * @param name of the new group.
     */
    addGroup(name) {
        this.groupList.push(name);
        this.currentGroupIndex = this.groupList.length - 1;
    }
    /**
     * Adds a new loop to the graph and update interface user.
     *
     * @param newLoop that added to the graph
     */
    addLoop(newLoop) {
        this.loops.push(newLoop);
        this.svgsManager.loopManager.update();
        Utils_1.HtmlArranger.placeBeforeNode("loop");
    }
    /**
     * Add node in graph and sbumit to SageMath
     *
     * @param node to add loop
     * @param isFirst action
     */
    addLoopOnNode(node, isFirst = true) {
        var newLoop = new Types_1.Loop(node);
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddLoopCommand(this, newLoop, isFirst));
    }
    /**
     * Add loop for each selected nodes, else show error to user.
     *
     * @returns True if selection contains nodes and loop is added for each node, else false.
     */
    addLoopOnSelectedNodes() {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes = this.selector.selectedNodes;
            if (selectedNodes.length > 0) {
                let isFirst = true;
                for (let i = 0; i < selectedNodes.length; i++) {
                    this.addLoopOnNode(selectedNodes[i], isFirst);
                    isFirst = false;
                }
                return true;
            }
            else {
                InterfaceAndMisc_1.CustomWarn("No nodes to add loop at on the selection");
            }
        }
        return false;
    }
    /**
     * Adds new node with the position of current cursor.
     *
     * @returns True if the add is successful.
     */
    addNewNode() {
        var newNode = this.createNode();
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddNodeCommand(this, newNode));
        return true;
    }
    /**
     * Add a node in graph and updates diplayed graph
     *
     * @param newNode to add in the graph
     * @returns true if the new node is added
     */
    addNode(newNode) {
        //Add it to the data
        this.nodes.push(newNode);
        //Apply nodes rules to the data
        this.svgsManager.nodeManager.update();
        return true;
    }
    /**
     * Generate an edge with the given src and dest.
     *
     * @param src the first node
     * @param dest the second node
     * @returns Edge
     */
    createEdge(src, dest) {
        let selected = src.isSelected && dest.isSelected;
        return new Types_1.Edge(0, dest, "#aaa", 0, src, "", selected);
    }
    /**
     * create the new node with optional predefinite position.
     *
     * @param pos that the new node should have, else tak the current position of cursor
     * @returns generated node
     */
    createNode(pos) {
        let newX;
        let newY;
        if (pos !== undefined) {
            newX = pos.x;
            newY = pos.y;
        }
        else {
            newX = this.cursorPosition.x;
            newY = this.cursorPosition.y;
        }
        return new Types_1.Node("0", this.findLowestIDAvailable(), newX, newY, this.frozen, false);
    }
    /**
     * If the graph is oriented, show the arrows, otherwise hide them.
     */
    displayOrHideArrows() {
        if (this.directed)
            this.svgsManager.arrowManager.displayArrows();
        else
            this.svgsManager.arrowManager.hideArrows();
    }
    freezeOrUnfreezeGraph() {
        this.frozen = !this.frozen;
        this.nodes.forEach(d => d.fixed = this.frozen);
    }
    getMovedNode() {
        return this.movedNode;
    }
    /**
     * Inverts all selected edges, displays error otherwise.
     *
     * @returns True if edges are selected and inverted successful, otherwise false
     */
    invertEdgesOnSelection() {
        if (!this.directed || !this.selector.edgesAreSelected()) {
            if (this.directed)
                InterfaceAndMisc_1.CustomWarn("No edges to invert");
            else
                InterfaceAndMisc_1.CustomWarn("No edges to invert");
            return false;
        }
        let edges = this.selector.selectedEdges;
        edges.forEach((edge, i) => CommandePatern_1.CommandsRepository.InvertDirectionCommand(this, edge, i == 0));
        return true;
    }
    nodeIsMoved(x, y) {
        this.movedNode = this._nodes.find(n => n.x === x && n.y === y);
    }
    /**
     * Removes the given edge from graph
     *
     * @param edge that to be removed from graph
     */
    removeEdge(edge) {
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
    removeEdgeCommand(edge, _isFirst) {
        if (this.links.indexOf(edge) != -1) {
            CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprEdgeCommand(this, edge, _isFirst));
        }
    }
    /**
     * Submits the remove command to SageMath.
     *
     * @param element that to be removed
     * @param _isFirst
     */
    removeElementCommand(element, _isFirst = true) {
        if (element instanceof Types_1.Node)
            this.removeNodeCommand(element, _isFirst);
        else if (element instanceof Types_1.Edge)
            this.removeEdgeCommand(element, _isFirst);
        else if (element instanceof Types_1.Loop)
            this.removeLoopCommand(element, _isFirst);
    }
    /**
     * Removes the given loop from graph.
     *
     * @param loop that to be removed from graph
     */
    removeLoop(loop) {
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
    removeLoopCommand(loop, _isFirst) {
        if (this.loops.indexOf(loop) != -1) {
            CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprLoopCommand(this, loop, _isFirst));
        }
    }
    /**
     * Removes the given node from graph.
     *
     * @param node that to be removed from graph
     */
    removeNode(node) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.svgsManager.nodeManager.update();
    }
    /**
     * Submits the remove command to SageMath.
     *
     * @param node that to be removed
     * @param _isFirst
     */
    removeNodeCommand(node, _isFirst) {
        // TODO SageMath fait automatiquement ça
        let isFirst = _isFirst;
        this.links.forEach(edge => {
            if (edge.source === node || edge.target === node) {
                CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprEdgeCommand(this, edge, isFirst));
                isFirst = false;
            }
        });
        this.loops.forEach(loop => {
            if (loop.source === node)
                CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprLoopCommand(this, loop, false));
        });
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprNodeCommand(this, node, false));
    }
    /**
     * For each selected element submits remove command to SageMath, otherwise show error to user.
     *
     * @returns True if elements are selected and deleted successfully, otherwise false.
     */
    removeSelection() {
        let isFirst = true;
        if (this.selector.nodesAreSelected() || this.selector.loopsAreSelected() || this.selector.edgesAreSelected()) {
            if (this.selector.nodesAreSelected()) {
                this.selector.selectedNodes.forEach((node, i) => this.removeNodeCommand(node, i === 0 && isFirst));
                this.svgsManager.nodeManager.update();
                isFirst = false;
            }
            if (this.selector.loopsAreSelected()) {
                this.selector.selectedLoops.forEach((loop, i) => this.removeLoopCommand(loop, i === 0 && isFirst));
                this.svgsManager.loopManager.update();
                isFirst = false;
            }
            if (this.selector.edgesAreSelected()) {
                this.selector.selectedEdges.forEach((edge, i) => this.removeEdgeCommand(edge, i === 0 && isFirst));
                this.svgsManager.edgeManager.update();
                isFirst = false;
            }
            this.selector.resetSelection();
            return true;
        }
        InterfaceAndMisc_1.CustomWarn("Nothing to delete");
        return false;
    }
    resetSelection() {
        this.selector.resetSelection();
    }
    /**
     * Sets a new name on a given element, if the new name is already defined, set the old name.
     *
     * @param valueRegisterer contains the element, new name, old name.
     */
    setElementName(valueRegisterer) {
        let element = valueRegisterer.element;
        element.name = (element.name == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
        if (element instanceof Types_1.Edge)
            this.svgsManager.edgeManager.refreshEdgeLabels();
        if (element instanceof Types_1.Loop)
            this.svgsManager.loopManager.refreshLoopLabels();
        if (element instanceof Types_1.Node)
            this.svgsManager.nodeManager.refreshNodeLabels();
    }
    /**
     * Sets a new group on a given element, if the new group is already defined, set the old group.
     *
     * @param valueRegisterer contains the element, new group, old group.
     */
    setGroupElement(valueRegisterer) {
        // TODO: { element: Node | Edge | Loop, newValue: string, oldValue: string }
        if (valueRegisterer.element instanceof Types_1.Node) {
            let node = this.nodes.find(n => n === valueRegisterer.element);
            node.group = (node.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.svgsManager.nodeManager.update();
        }
        else if (valueRegisterer.element instanceof Types_1.Edge) {
            let edge = this.links.find(edge => edge === valueRegisterer.element);
            edge.group = (edge.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.svgsManager.edgeManager.update();
        }
        else {
            let loop = this.loops.find(loop => loop === valueRegisterer.element);
            loop.group = (loop.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
            this.svgsManager.loopManager.update();
        }
    }
    /**
     * Add a group for each selected nodes, else show error to user.
     *
     * @returns Trus if nodes are selected and an group is attributed for each selected node, else false.
     */
    setGroupOfSelection() {
        if (this.selector.nodesAreSelected()) {
            let selectedNodes = this.selector.selectedNodes;
            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                if (selectedNodes[i].group != this.groupList[this.currentGroupIndex]) {
                    let vr = new Types_1.ValueRegisterer(selectedNodes[i].group, this.groupList[this.currentGroupIndex], selectedNodes[i]);
                    CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.ChangeGroupCommand(this, vr, isFirst));
                    isFirst = false;
                }
                return true;
            }
        }
        InterfaceAndMisc_1.CustomWarn("No nodes selected");
        return false;
    }
    /**
     * Sets the direction of given link, if the new direction is already defined, set the old direction.
     *
     * @param valueRegisterer contains the edge, new direction, old direction.
     */
    setLinkDirection(valueRegisterer) {
        let link = this.links.find(link => link === valueRegisterer.element);
        let targetedValue = (link.source == valueRegisterer.newValue[0]) ? valueRegisterer.oldValue : valueRegisterer.newValue;
        link.source = targetedValue[0];
        link.target = targetedValue[1];
        this.svgsManager.edgeManager.update();
    }
    setNewPosition(registeredPos) {
        this.setNodePosition(registeredPos.newValue, registeredPos.element);
    }
    /**
     * Updates the position x and y of a node, with a Point
     *
     * @param Pos that contains the new position of node
     * @param node that should be updated
     */
    setNodePosition(Pos, node) {
        let currrentNode = this.nodes.find(n => n === node);
        currrentNode.x = Pos.x;
        currrentNode.y = Pos.y;
    }
    /**
     * Updates the old position x and y of a node, with a ValueRegisterer
     *
     * @param registeredPos that contains the old pos, and the node should be updated
     */
    setOldPosition(registeredPos) {
        this.setNodePosition(registeredPos.oldValue, registeredPos.element);
    }
    /**
     * Adds a node to the center of given edge.
     *
     * @param edge that to be add a node
     * @param isFirst
     */
    subdivideEdge(edge, isFirst = true) {
        let pos = this.third_point_of_curved_edge(new Types_1.Point(edge.source.x, edge.source.y), new Types_1.Point(edge.target.x, edge.target.y), 0);
        let newNode = this.createNode(pos);
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddNodeCommand(this, newNode, isFirst));
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddEdgeCommand(this, this.createEdge(newNode, edge.source), false));
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.AddEdgeCommand(this, this.createEdge(newNode, edge.target), false));
        CommandePatern_1.myManager.Execute(CommandePatern_1.CommandsRepository.SupprEdgeCommand(this, edge, false));
    }
    /**
     * Subdivides all selected edges, displays an error to the user if no edge is selected or if an error occurred during the operation.
     *
     * @returns True if the edges are selected and that all one could be subdivided, otherwise false.
     */
    subdivideEdgeOnSelection() {
        if (this.selector.edgesAreSelected()) {
            this.selector.selectedEdges.forEach((edge, i) => this.subdivideEdge(edge, i == 0));
            return true;
        }
        InterfaceAndMisc_1.CustomWarn("No edges to subdivide");
        return false;
    }
    toJSON() {
        let result = {
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
            link.source = link.source.name;
            link.target = link.target.name;
        });
        result.loops.forEach(loop => {
            loop.source = loop.target = loop.source.name;
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
    unabledOrDisableFreezeGraph() {
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
    static getNodesFrom(graph) {
        let result = [];
        for (let i = 0; i < graph.nodes.length; i++) {
            let nodeInfo = graph.nodes[i];
            let nodePosx = graph.pos[i][0];
            let nodePosy = graph.pos[i][0];
            result.push(new Types_1.Node(nodeInfo.group, nodeInfo.name, nodePosx, nodePosy, false, false));
        }
        return result;
    }
    // #endregion Private Static Methods (1)
    // #region Private Methods (5)
    GetGraphFromHTML() {
        var mydiv = document.getElementById("mygraphdata");
        var graph_as_string = mydiv.innerHTML;
        let graph = eval(graph_as_string);
        return graph;
    }
    fillGroupFromGraph(graph) {
        graph.nodes.forEach(element => {
            if (!this.groupList.includes(element.group)) {
                this.groupList.push(element.group);
            }
        });
    }
    findLowestIDAvailable() {
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
    third_point_of_curved_edge(pa, pb, d) {
        var ox = pa.x, oy = pa.y, dx = pb.x, dy = pb.y;
        var cx = (dx + ox) / 2, cy = (dy + oy) / 2;
        var ny = -(dx - ox), nx = dy - oy;
        var nn = Math.sqrt(nx * nx + ny * ny);
        return new Types_1.Point(cx + d * nx / nn, cy + d * ny / nn);
    }
    waitGraphLoadToFreeze(waitingTime) {
        setTimeout(() => this.freezeOrUnfreezeGraph(), waitingTime);
    }
}
exports.GraphCustom = GraphCustom;
//# sourceMappingURL=GraphCustom.js.map