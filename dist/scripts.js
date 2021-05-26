"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSelectedGroup = exports.RequestConvertGraph = exports.RequestRandomOrientation = exports.RequestStrongOrientation = exports.RequestEdgeColoring = exports.RequestVertexColoring = void 0;
const Connection_1 = require("./Connection");
const GraphCustom_1 = require("./graph-gestionnaire/GraphCustom");
const InterfaceAndMisc_1 = require("./InterfaceAndMisc");
const OverlayElements_1 = require("./OverlayElements");
function handleMouseMove(event) {
    GraphCustom_1.graph.cursorPosition.x = event.pageX - xshift();
    GraphCustom_1.graph.cursorPosition.y = event.pageY;
}
var xshift = () => document.getElementById("graphFrame").childNodes[3].getBoundingClientRect().left;
window.onload = function () {
    GraphCustom_1.GraphCustom.setNewGraph(JSON.parse('{"nodes": [{"name": "1", "group": "0"}, {"name": "2", "group": "0"}, {"name": "3", "group": "0"}, {"name": "6", "group": "0"}, {"name": "7", "group": "0"}, {"name": "8", "group": "0"}, {"name": "9", "group": "0"}], "links": [{"source": 0, "target": 1, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 0, "target": 3, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 2, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 1, "target": 4, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 2, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 5, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 3, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}, {"source": 4, "target": 6, "strength": 0, "color": "#aaa", "curve": 0, "name": "None"}], "loops": [], "pos": [[0.3, 1.3423314875430605], [1.5299305562099956, 5.127668512456939], [5.510069443790005, 5.127668512456939], [2.3499999999999996, 1.4554521985177848], [3.4149652781049973, 3.968120710974724], [5.805034721895002, 1.3381207109747237], [3.19, 3.2054521985177846]], "directed": false, "charge": 0, "link_distance": 100, "link_strength": 0, "gravity": 0.0, "vertex_size": 12, "edge_thickness": 4}'));
    Connection_1.InitWebSocketConnection();
    document.body.onmousemove = handleMouseMove;
    InterfaceAndMisc_1.KeyboardEventInit();
};
function RequestVertexColoring() {
    Connection_1.SubmitMessage(Connection_1.SageCommand.vertexColoringRequest);
}
exports.RequestVertexColoring = RequestVertexColoring;
function RequestEdgeColoring() {
    Connection_1.SubmitMessage(Connection_1.SageCommand.edgeColoringRequest);
}
exports.RequestEdgeColoring = RequestEdgeColoring;
function RequestStrongOrientation() {
    Connection_1.SubmitMessage(Connection_1.SageCommand.strongOrientationRequest);
}
exports.RequestStrongOrientation = RequestStrongOrientation;
function RequestRandomOrientation() {
    Connection_1.SubmitMessage(Connection_1.SageCommand.randomOrientationRequest);
}
exports.RequestRandomOrientation = RequestRandomOrientation;
function RequestConvertGraph() {
    Connection_1.SubmitMessage(Connection_1.SageCommand.convertGraph);
}
exports.RequestConvertGraph = RequestConvertGraph;
function ChangeSelectedGroup() {
    if (OverlayElements_1.OverlayElements.groupList.selectedIndex == OverlayElements_1.OverlayElements.groupList.childElementCount - 1) {
        if (!InterfaceAndMisc_1.TryAddNewGroup()) {
            OverlayElements_1.OverlayElements.groupList.selectedIndex = GraphCustom_1.graph.currentGroupIndex;
        }
    }
    else {
        InterfaceAndMisc_1.SetCurrentGroup();
    }
}
exports.ChangeSelectedGroup = ChangeSelectedGroup;
//# sourceMappingURL=scripts.js.map