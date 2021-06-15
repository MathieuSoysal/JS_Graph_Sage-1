import Edge from "./Edge";
import Node from "./Node";

export default class Loop implements Edge {
    // #region Properties (8)

    public color: string;
    public curve: number;
    public group: string;
    public isSelected: boolean;
    public name: string;
    public source: Node;
    public strength: number;
    public target: Node;

    // #endregion Properties (8)

    // #region Constructors (3)

    constructor(src: Node);
    constructor(strength: number, color: string, curve: number, source: Node, name?: string, isSelected?: boolean, group?: string);
    constructor(strengthOrNode?: number | Node, color?: string, curve?: number, source?: Node, name?: string, isSelected?: boolean, group = "") {
        this.color = color ? color : "#aaa";
        this.curve = curve ? curve : 20;
        this.isSelected = isSelected ? isSelected : false;
        this.name = name ? name : "";
        this.source = strengthOrNode instanceof Node ? strengthOrNode : source!;
        this.strength = strengthOrNode instanceof Node || strengthOrNode === undefined ? 0 : strengthOrNode;
        this.target = this.source;
        this.group = group ? group : "";
    }

    // #endregion Constructors (3)
}
