import { SelectionRectangle } from '../main/selector-gestionnaire/SelectionRectangle';
import each from 'jest-each';
import { Edge, Loop, Node, Point } from '../main/graph-gestionnaire/Types';

//#region Utils

function generateNode(point: Point): Node {
    return new Node("", "", point.x, point.y, true, true);
}

function generateLoop(point: Point): Loop {
    return new Loop(new Node("", "", point.x, point.y, true, true));
}

function generateEdge(point1: Point, point2: Point): Edge {
    return new Edge(0, generateNode(point2), "", 0, generateNode(point1), "", true, "");
}

//#endregion Utils

let rectangle: SelectionRectangle;
beforeAll(() => { rectangle = new SelectionRectangle([[0, 0], [5, 5]]) });

describe('Rectangle-hasInside', () => {
    describe('Should be inside', () => {
        each([
            [generateNode(new Point(0, 0))],
            // [generateNode(new Point(5, 5))],TODO:
            [generateNode(new Point(2, 2))],
            [generateEdge(new Point(0, 0), new Point(5, 5))],
            [generateEdge(new Point(1, 2), new Point(2, 1))],
            [generateEdge(new Point(1, 2), new Point(-2, -2))],
            [generateEdge(new Point(-2, -1), new Point(0, 0))],
            [generateLoop(new Point(0, 0))],
            // [generateLoop(new Point(5, 5))],TODO
            [generateLoop(new Point(2, 2))]
        ]).it("element:%s", async (element: Node | Edge | Loop) => {
            expect(rectangle.hasInside(element)).toBe(true);
        })
    })

    describe('Should not be inside', () => {
        each([
            [generateNode(new Point(-1, 0))],
            [generateNode(new Point(-1, -1))],
            [generateNode(new Point(6, 4))],
            [generateNode(new Point(4, 6))],
            [generateNode(new Point(8, 8))],
            [generateEdge(new Point(-1, 0), new Point(-2, 0))],
            [generateEdge(new Point(-1, -1), new Point(-2, -1))],
            [generateEdge(new Point(6, 4), new Point(6, 4))],
            [generateEdge(new Point(4, 6), new Point(4, 6))],
            [generateEdge(new Point(8, 8), new Point(8, 8))],
            [generateLoop(new Point(-1, 0))],
            [generateLoop(new Point(-1, -1))],
            [generateLoop(new Point(6, 4))],
            [generateLoop(new Point(4, 6))],
            [generateLoop(new Point(8, 8))]
        ]).it("node:%s", async (node: Node) => {
            expect(rectangle.hasNodeInside(node)).toBe(false);
        })
    })

});

describe('Rectangle-hasNodeInside', () => {
    describe('Should be inside', () => {
        each([
            [generateNode(new Point(0, 0))],
            // [generateNode(new Point(5, 5))],OTDO
            [generateNode(new Point(2, 2))]
        ]).it("node:%s", async (node: Node) => {
            expect(rectangle.hasNodeInside(node)).toBe(true);
        })
    })

    describe('Should not be inside', () => {
        each([
            [generateNode(new Point(-1, 0))],
            [generateNode(new Point(-1, -1))],
            [generateNode(new Point(6, 4))],
            [generateNode(new Point(4, 6))],
            [generateNode(new Point(8, 8))]
        ]).it("node:%s", async (node: Node) => {
            expect(rectangle.hasNodeInside(node)).toBe(false);
        })
    })
});

describe('Rectangle-hasEdgeInside', () => {
    describe('Should be inside', () => {
        each([
            [generateEdge(new Point(0, 0), new Point(5, 5))],
            [generateEdge(new Point(1, 2), new Point(2, 1))],
            [generateEdge(new Point(1, 2), new Point(-2, -2))],
            [generateEdge(new Point(-2, -1), new Point(0, 0))]
        ]).it("edgge:%s", async (edge: Edge) => {
            expect(rectangle.hasEdgeInside(edge)).toBe(true);
        })
    })

    describe('Should not be inside', () => {
        each([
            [generateEdge(new Point(-1, 0), new Point(-2, 0))],
            [generateEdge(new Point(-1, -1), new Point(-2, -1))],
            [generateEdge(new Point(6, 4), new Point(6, 4))],
            [generateEdge(new Point(4, 6), new Point(4, 6))],
            [generateEdge(new Point(8, 8), new Point(8, 8))]
        ]).it("edge:%s", async (edge: Edge) => {
            expect(rectangle.hasEdgeInside(edge)).toBe(false);
        })
    })
});

describe('Rectangle-hasLoopInside', () => {
    describe('Should be inside', () => {
        each([
            [generateLoop(new Point(0, 0))],
            // [generateLoop(new Point(5, 5))],TODO:
            [generateLoop(new Point(2, 2))]
        ]).it("loop:%s", async (loop: Loop) => {
            expect(rectangle.hasLoopInside(loop)).toBe(true);
        })
    })

    describe('Should not be inside', () => {
        each([
            [generateLoop(new Point(-1, 0))],
            [generateLoop(new Point(-1, -1))],
            [generateLoop(new Point(6, 4))],
            [generateLoop(new Point(4, 6))],
            [generateLoop(new Point(8, 8))]
        ]).it("loop:%s", async (loop: Loop) => {
            expect(rectangle.hasLoopInside(loop)).toBe(false);
        })
    })
});

