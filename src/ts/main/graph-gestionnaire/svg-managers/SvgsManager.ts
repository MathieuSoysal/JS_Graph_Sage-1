import { GraphCustom } from '../GraphCustom';
import LoopManager from './LoopManager';
import NodeManager from './NodeManager';
import EdgeManager from './EdgeManager';
import d3 = require('d3');
import ArrowManager from './ArrowManager';
import SelectionRectangle from '../../selector-gestionnaire/SelectionRectangle';
import SelectorManager from '../../selector-gestionnaire/SelectorManager';
import { Element } from '../elements/Element';
import Node from '../elements/Node';

export default class SvgsManager {
    // #region Properties (8)

    private _arrowManager: ArrowManager;
    private _edgeManager: EdgeManager;
    private _graph: GraphCustom;
    private _loopManager: LoopManager;
    private _nodeManager: NodeManager;
    private _selection: SelectionRectangle;
    private _selectorManager: SelectorManager;
    private _svg: d3.Selection<any, unknown, HTMLElement, any>;

    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(graph: GraphCustom) {
        this._graph = graph;
        this._selection = new SelectionRectangle();
        this._svg = d3.select("#graphFrame").append("svg")
            .attr("id", "svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("pointer-events", "all") // Zoom+move management
            .append('svg:g');

        d3.select("#graphFrame")
            .append('svg:rect')
            .attr('x', -10000)
            .attr('y', -10000)
            .attr('width', 2 * 10000)
            .attr('height', 2 * 10000);

        // SVG window
        this.initBrush();

        this._edgeManager = new EdgeManager(this, graph);
        this._nodeManager = new NodeManager(this, graph);
        this._loopManager = new LoopManager(this, graph);
        this._arrowManager = new ArrowManager(this, graph);
        this._selectorManager = new SelectorManager(this._nodeManager, this._edgeManager, this._loopManager)

        this.initGraph();
        this.updateAll();
        this.initDblClick();
    }

    // #endregion Constructors (1)

    // #region Public Accessors (8)

    public get arrowManager(): ArrowManager {
        return this._arrowManager;
    }

    public get edgeManager(): EdgeManager {
        return this._edgeManager;
    }

    public get graph(): GraphCustom {
        return this._graph;
    }

    public get height() { return document.documentElement.clientHeight }

    public get loopManager(): LoopManager {
        return this._loopManager;
    }

    public get nodeManager(): NodeManager {
        return this._nodeManager;
    }

    public get svg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return this._svg;
    }

    public get width() { return document.documentElement.clientWidth * 0.8 }

    // #endregion Public Accessors (8)

    // #region Public Methods (5)

    public getRectangleSelection(): Array<Element> {
        return this._selection.getSelectedElement();
    }

    public getSelectedNodes(): Array<Node> {
        return this.nodeManager.nodes.filter(n => n.isSelected).data();
    }

    /**
     * Refresh the position of each element
     */
    public refreshElementsPosition(): void {
        this.nodeManager.refreshNodesPosition();
        this.loopManager.refreshLoopsPosition();
        this.edgeManager.refreshPosEdges();
    }

    /**
     * reset rectangle selection
     */
    public resetRectangleSelection(): void {
        this._selection.resetSelection();
    }

    public updateAll() {
        this.nodeManager.update();
        this.edgeManager.update();
        this.loopManager.update();
        this.arrowManager.update();
    }

    // #endregion Public Methods (5)

    // #region Private Methods (3)

    private initBrush() {
        let my = this;

        function brushed({ selection }: d3.D3BrushEvent<any>) {
            if (selection === null) {
                my._selection.resetSelection();
            } else {
                my._selection.setNewSelection(selection as number[][]);
                my._selection.updateSelectedElements(my._graph);
            }
            my.nodeManager.update();
            my.loopManager.update();
            my.edgeManager.update();
        }

        let brush = d3.brush()
            .on("start brush end", brushed);

        this._svg
            .call(brush);
    }

    private initDblClick() {
        const resetSelection = () => {
            this._selection.resetSelection();
            this._graph.resetSelection()
            this._selectorManager.getSelectedElements().forEach(e => e.isSelected = false);
            this.updateAll();
        }
        this._svg.on("dblclick", resetSelection);
    }

    private initGraph(): void {
        this._graph.loops.forEach(loop => {
            loop.source = this._graph.nodes[this._graph.nodes.indexOf(loop.source)]!;
            loop.target = this._graph.nodes[this._graph.nodes.indexOf(loop.source)]!;
        });
    }

    // #endregion Private Methods (3)
}