import EdgeManager from '../graph-gestionnaire/svg-managers/EdgeManager';
import NodeManager from '../graph-gestionnaire/svg-managers/NodeManager';
import LoopManager from '../graph-gestionnaire/svg-managers/LoopManager';
import Node from "../graph-gestionnaire/elements/Node";
import Loop from "../graph-gestionnaire/elements/Loop";
import Edge from "../graph-gestionnaire/elements/Edge";

export default class SelectorManager {
    // #region Properties (3)

    private _edgesManager: EdgeManager;
    private _loopsManager: LoopManager;
    private _nodesManager: NodeManager;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(nodeManager: NodeManager, edgeManager: EdgeManager, loopManager: LoopManager) {
        this._nodesManager = nodeManager;
        this._edgesManager = edgeManager;
        this._loopsManager = loopManager;
    }

    // #endregion Constructors (1)

    // #region Public Methods (4)

    /**
     * @returns the selected edges
     */
    public getSelectedEdges(): Edge[] {
        return this._edgesManager.links.filter(n => n.isSelected).data();
    }

    /**
     * @returns the selected elements
     */
    public getSelectedElements(): (Node | Edge | Loop)[] {
        return [...this.getSelectedNodes(), ...this.getSelectedEdges(), ...this.getSelectedLoops()];
    }

    /**
     * @returns the selected loops
     */
    public getSelectedLoops(): Loop[] {
        return this._loopsManager.loops.filter(n => n.isSelected).data();
    }

    /**
     * @returns the selected nodes
     */
    public getSelectedNodes(): Node[] {
        return this._nodesManager.nodes.filter(n => n.isSelected).data();
    }

    // #endregion Public Methods (4)
}