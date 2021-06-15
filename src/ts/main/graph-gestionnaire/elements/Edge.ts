import Node from "./Node";

export default class Edge {
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

    // #region Constructors (1)

    constructor(strength: number, target: Node, color: string, curve: number, source: Node, name: string, isSelected: boolean, group = "") {
        this.color = color;
        this.curve = curve;
        this.isSelected = isSelected;
        this.name = name;
        this.source = source;
        this.strength = strength;
        this.target = target;
        this.group = group;
    }

    // #endregion Constructors (1)
}
