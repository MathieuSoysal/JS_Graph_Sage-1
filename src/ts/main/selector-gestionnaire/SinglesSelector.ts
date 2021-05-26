import { Edge, Loop, Node } from "../graph-gestionnaire/Types";

export class SinglesSelector {
    // #region Properties (3)

    private edges: Set<Edge>
    private loops: Set<Loop>;
    private nodes: Set<Node>;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor() {
        this.nodes = new Set();
        this.edges = new Set();
        this.loops = new Set();
    }

    // #endregion Constructors (1)

    // #region Public Accessors (4)

    public get selectedEdges(): Edge[] {
        return [...this.edges];
    }

    public get selectedElements(): (Node | Loop | Edge)[] {
        return [...this.nodes, ...this.edges, ...this.loops];
    }

    public get selectedLoops(): Loop[] {
        return [...this.loops];
    }

    public get selectedNodes(): Node[] {
        return [...this.nodes];
    }

    // #endregion Public Accessors (4)

    // #region Public Methods (7)

    /**
     * @param element that should be deselected
     */
    public deselectElement(element: Node | Edge | Loop) {
        element.isSelected = false;
        if (element instanceof Node)
            this.nodes.delete(element);
        else if (element instanceof Edge)
            this.edges.delete(element);
        else
            this.loops.delete(element);
    }

    /**
     * @returns True if edges are selected, else false.
     */
    public edgesAreSelected(): boolean {
        return this.edges.size !== 0;
    }

    /**
     * @returns True if loops are selected, else false.
     */
    public loopsAreSelected(): boolean {
        return this.loops.size !== 0;
    }

    /**
     * @returns True if nodes are selected, else false.
     */
    public nodesAreSelected(): boolean {
        return this.nodes.size !== 0;
    }

    /**
     * reset aller selected elements
     */
    public resetSelection(): void {
        if (this.nodes && this.nodes.size > 0) this.nodes.forEach(e => e.isSelected = false);
        if (this.edges && this.edges.size > 0) this.edges.forEach(e => e.isSelected = false);
        if (this.loops && this.loops.size > 0) this.loops.forEach(e => e.isSelected = false);
        this.nodes = new Set<Node>();
        this.edges = new Set<Edge>();
        this.loops = new Set<Loop>();
    }

    /**
     * @param element that should be selected
     */
    public selectElement(element: Node | Edge | Loop) {
        element.isSelected = true;
        if (element instanceof Node)
            this.nodes.add(element);
        else if (element instanceof Edge)
            this.edges.add(element);
        else
            this.loops.add(element);
    }

    /**
     * If element is already selected, unselect this element
     * Else selection this element
     * 
     * @param element 
     */
    public selectOrUnselectElement(element: Node | Edge | Loop) {
        if (!element.isSelected) {
            this.selectElement(element);
        } else {
            this.deselectElement(element);
        }
    }

    // #endregion Public Methods (7)
}