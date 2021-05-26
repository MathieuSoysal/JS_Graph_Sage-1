"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loop = exports.ValueRegisterer = exports.Point = exports.Edge = exports.Node = void 0;
class Node {
    // #endregion Properties (6)
    // #region Constructors (1)
    constructor(group, name, x, y, fixed, isSelected) {
        this.fixed = fixed;
        this.group = group;
        this.isSelected = isSelected;
        this.name = name;
        this.x = x;
        this.y = y;
    }
}
exports.Node = Node;
class Edge {
    // #endregion Properties (8)
    // #region Constructors (1)
    constructor(strength, target, color, curve, source, name, isSelected, group = "") {
        this.color = color;
        this.curve = curve;
        this.isSelected = isSelected;
        this.name = name;
        this.source = source;
        this.strength = strength;
        this.target = target;
        this.group = group;
    }
}
exports.Edge = Edge;
class Point {
    // #endregion Properties (2)
    // #region Constructors (1)
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // #endregion Constructors (1)
    // #region Public Methods (1)
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
exports.Point = Point;
class ValueRegisterer {
    // #endregion Properties (3)
    // #region Constructors (1)
    constructor(oldValue, newValue, element) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.element = element;
    }
}
exports.ValueRegisterer = ValueRegisterer;
class Loop {
    constructor(strengthOrNode, color, curve, source, name, isSelected, group = "") {
        this.color = color ? color : "#aaa";
        this.curve = curve ? curve : 20;
        this.isSelected = isSelected ? isSelected : false;
        this.name = name ? name : "";
        this.source = strengthOrNode instanceof Node ? strengthOrNode : source;
        this.strength = strengthOrNode instanceof Node || strengthOrNode === undefined ? 0 : strengthOrNode;
        this.target = this.source;
        this.group = group ? group : "";
    }
}
exports.Loop = Loop;
;
//# sourceMappingURL=Types.js.map