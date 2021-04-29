export class HtmlArranger {
    private constructor() {
    }

    /**
     * Puts all elements that have className as a class before the Node elements.
     * 
     * @param className 
     */
    public static placeBeforeNode(className: string): void {
        let elements = document.getElementsByClassName(className);
        let elem = elements[elements.length - 1]!;

        let firstNode = document.getElementsByClassName("node")[0]!;
        firstNode.parentNode!.insertBefore(elem, firstNode);
    }
}