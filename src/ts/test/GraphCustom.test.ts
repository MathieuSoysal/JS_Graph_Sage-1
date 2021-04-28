import { GraphCustom } from '../main/graph-gestionnaire/GraphCustom';

const JSON_OBJECT = JSON.parse('{"nodes": [{"name": "1", "group": "0"}, {"name": "2", "group": "0"}, {"name": "3", "group": "0"}, {"name": "6", "group": "0"}, {"name": "7", "group": "0"}, {"name": "8", "group": "0"}, {"name": "9", "group": "0"}], "links": [{"source": 0, "target": 1, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 0, "target": 3, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 2, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 4, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 2, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 4, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}], "loops": [], "pos": [[0.3, 1.3423314875430605], [1.5299305562099956, 5.127668512456939], [5.510069443790005, 5.127668512456939], [2.3499999999999996, 1.4554521985177848], [3.4149652781049973, 3.968120710974724], [5.805034721895002, 1.3381207109747237], [3.19, 3.2054521985177846]], "directed": false, "charge": 0, "link_distance": 100, "link_strength": 0, "gravity": 0.0, "vertex_size": 12, "edge_thickness": 4}');

describe("Test JSON", () => {

    test("GraphCustom test should not return null", () => {
        let graph = new GraphCustom(JSON_OBJECT)
        expect(graph).not.toBeNull();
    })

    test("GraphCustom test should nodes length equal to 0", () => {
        let graph = new GraphCustom(JSON_OBJECT)
        expect(graph.nodes.length).toEqual(7);
    })

    test("GraphCustom test should links length equal to 0", () => {
        let graph = new GraphCustom(JSON_OBJECT)
        expect(graph.links.length).toEqual(8);
    })

    test("GraphCustom test should be directed", () => {
        let graph = new GraphCustom(JSON_OBJECT)
        expect(graph.directed).toBe(false);
    })

})