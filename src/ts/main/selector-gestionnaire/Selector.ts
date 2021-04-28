import { Edge, Loop, Node } from "../graph-gestionnaire/Types";

export class Selector {
    // #region Properties (3)

    private edges: Array<Edge>
    private loops: Array<Loop>;
    private nodes: Array<Node>;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor() {
        this.nodes = [];
        this.edges = [];
        this.loops = [];
    }

    // #endregion Constructors (1)

    // #region Public Accessors (3)

    public get selectedEdges(): Edge[] {
        return this.edges;
    }

    public get selectedLoops(): Loop[] {
        return this.loops;
    }

    public get selectedNodes(): Node[] {
        return this.nodes;
    }

    // #endregion Public Accessors (3)

    // #region Public Methods (6)

    /**
     * @returns True if edges are selected, else false.
     */
    public edgesAreSelected(): boolean {
        return this.edges.length !== 0;
    }

    /**
     * @returns True if loops are selected, else false.
     */
    public loopsAreSelected(): boolean {
        return this.loops.length !== 0;
    }

    /**
     * @returns True if nodes are selected, else false.
     */
    public nodesAreSelected(): boolean {
        return this.nodes.length !== 0;
    }

    /**
     * reset aller selected elements
     */
    public resetSelection(): void {
        if (this.nodes && this.nodes.length > 0) this.nodes.forEach(e => e.isSelected = false);
        if (this.edges && this.edges.length > 0) this.edges.forEach(e => e.isSelected = false);
        if (this.loops && this.loops.length > 0) this.loops.forEach(e => e.isSelected = false);
        this.nodes = [];
        this.edges = [];
        this.loops = [];
    }

    /**
     * @param element that should be selected
     */
    public selectElement(element: Node | Edge | Loop) {
        element.isSelected = true;
        if (element instanceof Node)
            this.nodes.push(element);
        else if (element instanceof Edge)
            this.edges.push(element);

        else
            this.loops.push(element);
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

    /**
     * @param element that should be deselected
     */
    public deselectElement(element: Node | Edge | Loop) {
        element.isSelected = false;
        if (element instanceof Node)
            this.remove(this.nodes, element);
        else if (element instanceof Edge)
            this.remove(this.edges, element);
        else
            this.remove(this.loops, element);
    }

    // #endregion Public Methods (6)

    // #region Private Methods (1)

    private remove(array: Array<Node | Edge | Loop>, element: Node | Edge | Loop) {
        array.splice(array.indexOf(element), 1);
    }

    // #endregion Private Methods (1)
}