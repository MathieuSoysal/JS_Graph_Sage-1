export class Node {
    // #region Properties (6)

    public fixed: boolean;
    public group: string;
    public isSelected: boolean;
    public name: string;
    public x: number;
    public y: number;

    // #endregion Properties (6)

    // #region Constructors (1)

    constructor(group: string, name: string, x: number, y: number, fixed: boolean, isSelected: boolean) {
        this.fixed = fixed;
        this.group = group;
        this.isSelected = isSelected;
        this.name = name;
        this.x = x;
        this.y = y;
    }

    // #endregion Constructors (1)
}

export class Edge {
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

export class Point {
    // #region Properties (2)

    public x: number;
    public y: number;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public equals(other: Point) {
        return this.x === other.x && this.y === other.y;
    }

    // #endregion Public Methods (1)
}
export class ValueRegisterer {
    // #region Properties (3)

    public element: Node | Edge | Loop;
    public newValue: any;
    public oldValue: any;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(oldValue: any, newValue: any, element: Node | Edge | Loop) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.element = element;
    }

    // #endregion Constructors (1)
}
export class Loop implements Edge {
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
};