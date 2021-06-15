import Edge from "./Edge";
import Node from "./Node";
import Loop from "./Loop";

export default class ValueRegisterer {
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
