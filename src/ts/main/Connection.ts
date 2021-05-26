import { graph, GraphCustom } from './graph-gestionnaire/GraphCustom';
import { CustomWarn, SetProperties } from './InterfaceAndMisc';
var webSocket: WebSocket;

export enum SageCommand {
    propertiesRequest = "Properties",
    strongOrientationRequest = "strongOrientation",
    randomOrientationRequest = "randomOrientation",
    vertexColoringRequest = "vertexColoring",
    edgeColoringRequest = "edgeColoring",
    convertGraph = "convert",
    closeConnection = "closeConnection"
}

export function InitWebSocketConnection() {
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
        CustomWarn("Fail to connect with SageMath");
    };
}

function TreatResponse(response: { request: SageCommand; result: string | any[]; }) {
    switch (response.request) {
        case SageCommand.propertiesRequest:
            SetProperties(
                response.result[0],
                response.result[1],
                response.result[2],
                response.result[3],
                response.result[4]
            );
            break;
        case SageCommand.vertexColoringRequest:
            graph.SetNodesColoration(response.result as any[]);
            break;
        case SageCommand.edgeColoringRequest:
            graph.SetLinksColoration(response.result)
            break;
        case SageCommand.strongOrientationRequest:
            GraphCustom.setNewGraph(eval(response.result as string));
            break;
        case SageCommand.randomOrientationRequest:
            GraphCustom.setNewGraph(eval(response.result as string));
            break;
        case SageCommand.convertGraph:
            CustomWarn("Graph : " + response.result + " open in new Window");
            break;
        case SageCommand.closeConnection:
            webSocket.close();
            break;
        default:
            CustomWarn("Undefined response behavior for parameter :" + response.request);
            break;
    }
}

export function SubmitMessage(parameter: SageCommand, message = "") {
    graph.parameter = parameter;
    graph.message = message;
    webSocket.send(graph.toJSON());
}

export function onCloseClick() {
    webSocket.close();
}

export function UpdateGraphProperties(message = "") {
    SubmitMessage(SageCommand.propertiesRequest, message);
}