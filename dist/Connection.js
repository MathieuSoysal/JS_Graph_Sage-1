"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGraphProperties = exports.onCloseClick = exports.SubmitMessage = exports.InitWebSocketConnection = exports.SageCommand = void 0;
const GraphCustom_1 = require("./graph-gestionnaire/GraphCustom");
const InterfaceAndMisc_1 = require("./InterfaceAndMisc");
var webSocket;
var SageCommand;
(function (SageCommand) {
    SageCommand["propertiesRequest"] = "Properties";
    SageCommand["strongOrientationRequest"] = "strongOrientation";
    SageCommand["randomOrientationRequest"] = "randomOrientation";
    SageCommand["vertexColoringRequest"] = "vertexColoring";
    SageCommand["edgeColoringRequest"] = "edgeColoring";
    SageCommand["convertGraph"] = "convert";
    SageCommand["closeConnection"] = "closeConnection";
})(SageCommand = exports.SageCommand || (exports.SageCommand = {}));
function InitWebSocketConnection() {
    // Connect to Web Socket
    webSocket = new WebSocket("ws://localhost:9001/");
    // Set event handlers.
    webSocket.onopen = function () {
        UpdateGraphProperties();
    };
    webSocket.onmessage = function (message) {
        TreatResponse(eval(message.data));
    };
    webSocket.onclose = function () { };
    webSocket.onerror = function () {
        InterfaceAndMisc_1.CustomWarn("Fail to connect with SageMath");
    };
}
exports.InitWebSocketConnection = InitWebSocketConnection;
function TreatResponse(response) {
    switch (response.request) {
        case SageCommand.propertiesRequest:
            InterfaceAndMisc_1.SetProperties(response.result[0], response.result[1], response.result[2], response.result[3], response.result[4]);
            break;
        case SageCommand.vertexColoringRequest:
            GraphCustom_1.graph.SetNodesColoration(response.result);
            break;
        case SageCommand.edgeColoringRequest:
            GraphCustom_1.graph.SetLinksColoration(response.result);
            break;
        case SageCommand.strongOrientationRequest:
            GraphCustom_1.GraphCustom.setNewGraph(eval(response.result));
            break;
        case SageCommand.randomOrientationRequest:
            GraphCustom_1.GraphCustom.setNewGraph(eval(response.result));
            break;
        case SageCommand.convertGraph:
            InterfaceAndMisc_1.CustomWarn("Graph : " + response.result + " open in new Window");
            break;
        case SageCommand.closeConnection:
            webSocket.close();
            break;
        default:
            InterfaceAndMisc_1.CustomWarn("Undefined response behavior for parameter :" + response.request);
            break;
    }
}
function SubmitMessage(parameter, message = "") {
    GraphCustom_1.graph.parameter = parameter;
    GraphCustom_1.graph.message = message;
    webSocket.send(GraphCustom_1.graph.toJSON());
}
exports.SubmitMessage = SubmitMessage;
function onCloseClick() {
    webSocket.close();
}
exports.onCloseClick = onCloseClick;
function UpdateGraphProperties(message = "") {
    SubmitMessage(SageCommand.propertiesRequest, message);
}
exports.UpdateGraphProperties = UpdateGraphProperties;
//# sourceMappingURL=Connection.js.map