import { GraphCustom } from '../main/graph-gestionnaire/GraphCustom';
import { CommandManager, CommandsRepository } from '../main/CommandePatern';
import { Edge, Loop, Node } from '../main/graph-gestionnaire/Types';
import { HtmlArranger } from '../main/graph-gestionnaire/Utils';
import { mockFunction } from './UtilsTests';

jest.mock('../main/graph-gestionnaire/Utils')
const JSON_OBJECT = JSON.parse('{"nodes": [{"name": "1", "group": "0"}, {"name": "2", "group": "0"}, {"name": "3", "group": "0"}, {"name": "6", "group": "0"}, {"name": "7", "group": "0"}, {"name": "8", "group": "0"}, {"name": "9", "group": "0"}], "links": [{"source": 0, "target": 1, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 0, "target": 3, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 2, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 4, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 2, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 4, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}], "loops": [], "pos": [[0.3, 1.3423314875430605], [1.5299305562099956, 5.127668512456939], [5.510069443790005, 5.127668512456939], [2.3499999999999996, 1.4554521985177848], [3.4149652781049973, 3.968120710974724], [5.805034721895002, 1.3381207109747237], [3.19, 3.2054521985177846]], "directed": false, "charge": 0, "link_distance": 100, "link_strength": 0, "gravity": 0.0, "vertex_size": 12, "edge_thickness": 4}');
const placeBeforeNodeMock = mockFunction(HtmlArranger.placeBeforeNode);
let graph: GraphCustom;
let commandManager: CommandManager;


beforeAll(() => {
    placeBeforeNodeMock.mockReturnValue();
});

beforeEach(() => {
    graph = new GraphCustom(JSON_OBJECT);
    commandManager = new CommandManager();
    placeBeforeNodeMock.mockClear();
});


describe('test commands on Execute', () => {

    it('AddNodeCommand should add node in graph', () => {
        let newNode: Node = new Node("", "", 90, 35, false, false);

        commandManager.Execute(CommandsRepository.AddNodeCommand(graph, newNode, true));

        expect(graph.nodes).toContain(newNode);
    });

    it('AddLoopCommand should add loop in graph', () => {
        let newLoop: Loop = new Loop(new Node("", "", 90, 35, false, false));

        commandManager.Execute(CommandsRepository.AddLoopCommand(graph, newLoop, true));

        expect(graph.loops).toContain(newLoop);
        expect(placeBeforeNodeMock).toHaveBeenCalledTimes(1);
    });

    it('AddEdgeCommand should add edge in graph', () => {
        let newEdge = new Edge(1, null as any, "", 1, null as any, "", false);

        commandManager.Execute(CommandsRepository.AddEdgeCommand(graph, newEdge, true));

        expect(graph.links).toContain(newEdge);
        expect(placeBeforeNodeMock).toHaveBeenCalledTimes(1);
    });

});