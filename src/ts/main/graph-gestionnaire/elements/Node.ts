export default class Node {
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
