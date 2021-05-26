"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlArranger = void 0;
class HtmlArranger {
    constructor() {
    }
    /**
     * Puts all elements that have className as a class before the Node elements.
     *
     * @param className
     */
    static placeBeforeNode(className) {
        let elements = document.getElementsByClassName(className);
        let elem = elements[elements.length - 1];
        let firstNode = document.getElementsByClassName("node")[0];
        firstNode.parentNode.insertBefore(elem, firstNode);
    }
}
exports.HtmlArranger = HtmlArranger;
//# sourceMappingURL=Utils.js.map