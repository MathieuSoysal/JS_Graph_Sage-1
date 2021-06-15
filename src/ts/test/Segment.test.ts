import each from 'jest-each';
import Edge from '../main/graph-gestionnaire/elements/Edge';
import Point from '../main/graph-gestionnaire/elements/Point';
import Node from '../main/graph-gestionnaire/elements/Node';
import { Segment } from '../main/selector-gestionnaire/Segment';

describe("doIntersect test", () => {
    describe("Should be intersect", () => {
        each([
            [new Segment(new Point(0, 0), new Point(1, 1)), new Segment(new Point(1, 0), new Point(0, 1))],
            [new Segment(new Point(1, 0), new Point(0, 1)), new Segment(new Point(1, 1), new Point(0, 0))],
            [new Segment(new Point(0, 0), new Point(-1, -1)), new Segment(new Point(-1, 0), new Point(0, -1))],
            [new Segment(new Point(-1, 0), new Point(0, -1)), new Segment(new Point(-1, -1), new Point(0, 0))],
            [new Segment(new Point(-1, 0), new Point(0, 0)), new Segment(new Point(0, 0), new Point(1, 0))],
            [new Segment(new Point(0, 0), new Point(-1, 0)), new Segment(new Point(1, 0), new Point(0, 0))]
        ]).it("segment1:%s segment2:%2", async (segment1: Segment, segment2: Segment) => {
            expect(segment1.doIntersect(segment2)).toBe(true);
        })
    })

    describe("Should not be intersect", () => {
        each([
            [new Segment(new Point(0, 0), new Point(1, 0)), new Segment(new Point(1, 1), new Point(0, 1))],
            [new Segment(new Point(1, 1), new Point(0, 1)), new Segment(new Point(0, 0), new Point(1, 0))],
            [new Segment(new Point(0, 0), new Point(1, 1)), new Segment(new Point(-1, 0), new Point(0, -1))]
        ]).it("segment1:%s segment2:%2", async (segment1: Segment, segment2: Segment) => {
            expect(segment1.doIntersect(segment2)).toBe(false);
        })
    })

})

describe("doIntersect with Edge conversion test", () => {

    function generateEdge(p1: Point, p2: Point): Edge {
        return new Edge(0, new Node("", "", p2.x, p2.y, true, true), "", 0, new Node("", "", p1.x, p1.y, true, true), "", true, "")
    }

    describe("Should be intersect", () => {
        each([
            [new Segment(new Point(0, 0), new Point(1, 1)), generateEdge(new Point(1, 0), new Point(0, 1))],
            [new Segment(new Point(1, 0), new Point(0, 1)), generateEdge(new Point(1, 1), new Point(0, 0))],
            [new Segment(new Point(0, 0), new Point(-1, -1)), generateEdge(new Point(-1, 0), new Point(0, -1))],
            [new Segment(new Point(-1, 0), new Point(0, -1)), generateEdge(new Point(-1, -1), new Point(0, 0))],
            [new Segment(new Point(-1, 0), new Point(0, 0)), generateEdge(new Point(0, 0), new Point(1, 0))],
            [new Segment(new Point(0, 0), new Point(-1, 0)), generateEdge(new Point(1, 0), new Point(0, 0))]
        ]).it("segment:%s edge:%2", async (segment: Segment, edge: Edge) => {
            expect(segment.doIntersect(new Segment(edge))).toBe(true);
        })
    })

    describe("Should not be intersect", () => {
        each([
            [new Segment(new Point(0, 0), new Point(1, 0)), generateEdge(new Point(1, 1), new Point(0, 1))],
            [new Segment(new Point(1, 1), new Point(0, 1)), generateEdge(new Point(0, 0), new Point(1, 0))],
            [new Segment(new Point(0, 0), new Point(1, 1)), generateEdge(new Point(-1, 0), new Point(0, -1))]
        ]).it("segment:%s edge:%2", async (segment: Segment, edge: Edge) => {
            expect(segment.doIntersect(new Segment(edge))).toBe(false);
        })
    })

})