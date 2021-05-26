"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoopManager_1 = require("./LoopManager");
const NodeManager_1 = require("./NodeManager");
const EdgeManager_1 = require("./EdgeManager");
const d3 = require("d3");
const ArrowManager_1 = require("./ArrowManager");
const SelectionRectangle_1 = require("../../selector-gestionnaire/SelectionRectangle");
class SvgsManager {
    // #endregion Properties (7)
    // #region Constructors (1)
    constructor(graph) {
        this._graph = graph;
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
        // SVG window
        this._edgeManager = new EdgeManager_1.EdgeManager(this, graph);
        this._nodeManager = new NodeManager_1.default(this, graph);
        this._loopManager = new LoopManager_1.LoopManager(this, graph);
        this._arrowManager = new ArrowManager_1.ArrowManager(this, graph);
        this.initGraph();
        this.initBrush();
        this.updateAll();
    }
    // #endregion Constructors (1)
    // #region Public Accessors (9)
    get arrowManager() {
        return this._arrowManager;
    }
    get edgeManager() {
        return this._edgeManager;
    }
    get graph() {
        return this._graph;
    }
    get height() { return document.documentElement.clientHeight; }
    get loopManager() {
        return this._loopManager;
    }
    get nodeManager() {
        return this._nodeManager;
    }
    get svg() {
        return this._svg;
    }
    get width() { return document.documentElement.clientWidth * 0.8; }
    // #endregion Public Accessors (9)
    // #region Public Methods (3)
    updateAll() {
        this.nodeManager.update();
        this.edgeManager.update();
        this.loopManager.update();
        this.arrowManager.update();
    }
    // #endregion Public Methods (3)
    // #region Private Methods (4)
    initBrush() {
        d3.brush()
            .extent([[-100000, 100000], [-100000, 100000]])
            .on("start brush end", (ev) => {
            if (ev.selection === null) {
                this._graph.selector.resetSelection();
            }
            else {
                let rectangleSelection = new SelectionRectangle_1.SelectionRectangle(ev.target.extent());
                this._graph.nodes.forEach(node => { if (rectangleSelection.hasNodeInside(node))
                    this._graph.selector.selectElement(node); });
                this._graph.loops.forEach(loop => { if (rectangleSelection.hasLoopInside(loop))
                    this._graph.selector.selectElement(loop); });
                this._graph.links.forEach(edge => { if (rectangleSelection.hasEdgeInside(edge))
                    this._graph.selector.selectElement(edge); });
            }
            this.nodeManager.update();
            this.loopManager.update();
            this.edgeManager.update();
        });
    }
    initGraph() {
        this._graph.loops.forEach(loop => {
            loop.source = this._graph.nodes[this._graph.nodes.indexOf(loop.source)];
            loop.target = this._graph.nodes[this._graph.nodes.indexOf(loop.source)];
        });
    }
}
exports.default = SvgsManager;
//# sourceMappingURL=SvgsManager.js.map