import each from 'jest-each';
import Edge from '../main/graph-gestionnaire/elements/Edge';
import Node from '../main/graph-gestionnaire/elements/Node';
import Point from '../main/graph-gestionnaire/elements/Point';


describe("Edge constructor", () => {
    let edge: Edge;
    const expectedStrenght = 2;
    const expectedTarget = new Node("1", "1", 10, 40, false, false);
    const expectedColor = "red";
    const expectedCurve = 4;
    const expectedSrc = new Node("0", "2", 20, 30, true, false);
    const expectedName = "name";
    const expectedSelected = true;
    const expectedGroup = "g1";

    beforeAll(() => {
        edge = new Edge(expectedStrenght, expectedTarget, expectedColor, expectedCurve, expectedSrc, expectedName, expectedSelected, expectedGroup);
    })

    it("good strength", async () => {
        expect(edge.strength).toBe(expectedStrenght);
    })

    it("good target", async () => {
        expect(edge.target).toBe(expectedTarget);
    })

    it("good color", async () => {
        expect(edge.color).toBe(expectedColor);
    })

    it("good curve", async () => {
        expect(edge.curve).toBe(expectedCurve);
    })

    it("good source", async () => {
        expect(edge.source).toBe(expectedSrc);
    })

    it("good name", async () => {
        expect(edge.name).toBe(expectedName);
    })

    it("good selected", async () => {
        expect(edge.isSelected).toBe(expectedSelected);
    })

    it("good groupe", async () => {
        expect(edge.group).toBe(expectedGroup);
    })
});

describe("Point Tests", () => {

    describe("Shloud be not equals", () => {
        each([
            [new Point(0, 0), new Point(0, 1)],
            [new Point(0, 0), new Point(1, 0)],
            [new Point(0, 1), new Point(0, 0)],
            [new Point(0, 1), new Point(1, 1)],
            [new Point(1, 0), new Point(0, 0)],
            [new Point(1, 0), new Point(0, 1)],
            [new Point(1, 0), new Point(1, 1)],
            [new Point(1, 1), new Point(0, 0)],
            [new Point(1, 1), new Point(0, 1)],
            [new Point(1, 1), new Point(-1, -1)]
        ]).it(" p1:%s p2:%s", async (p1: Point, p2: Point) => {
            expect(p1).not.toStrictEqual(p2);
            expect(p1.equals(p2)).toBe(false);
        })
    })

    describe("Shloud be equals", () => {
        each([
            [new Point(0, 0), new Point(0, 0)],
            [new Point(0, 1), new Point(0, 1)],
            [new Point(1, 0), new Point(1, 0)],
            [new Point(1, 1), new Point(1, 1)],
            [new Point(0, 0), new Point(0, 0)],
            [new Point(0, -1), new Point(0, -1)],
            [new Point(-1, 0), new Point(-1, 0)],
            [new Point(-1, -1), new Point(-1, -1)],
        ]).it("Shloud be equals p1:%s p2:%s", async (p1: Point, p2: Point) => {
            expect(p1).toStrictEqual(p2);
            expect(p1.equals(p2)).toBe(true);
        })
    });

});
