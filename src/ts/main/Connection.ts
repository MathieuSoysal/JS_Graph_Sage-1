var webSocket: WebSocket;

enum SageCommand {
    propertiesRequest = "Properties",
    strongOrientationRequest = "strongOrientation",
    randomOrientationRequest = "randomOrientation",
    vertexColoringRequest = "vertexColoring",
    edgeColoringRequest = "edgeColoring",
    convertGraph = "convert",
    closeConnection = "closeConnection"
}

function InitWebSocketConnection() {
    // Connect to Web Socket
    webSocket = new WebSocket("ws://localhost:9001/");
    // Set event handlers.
    webSocket.onopen = function () {
        UpdateGraphProperties();
    };

    webSocket.onmessage = function (message) {
        TreatResponse(StringToObject(message.data));
    };

    webSocket.onclose = function () { };

    webSocket.onerror = function (error) {
        CustomWarn("Fail to connect with SageMath");
    };
}

function TreatResponse(response) {
    switch (response.request) {
        case SageCommand.propertiesRequest:
            SetProperties(response.result[0], response.result[1], response.result[2], response.result[3], response.result[4]);
            break;
        case SageCommand.vertexColoringRequest:
            SetNodesColoration(response.result);
            break;
        case SageCommand.edgeColoringRequest:
            SetLinksColoration(response.result)
            break;
        case SageCommand.strongOrientationRequest:
            InitNewGraph(StringToObject(response.result));
            break;
        case SageCommand.randomOrientationRequest:
            InitNewGraph(StringToObject(response.result));
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

function RequestVertexColoring() {
    SubmitMessage(SageCommand.vertexColoringRequest);
}

function RequestEdgeColoring() {
    SubmitMessage(SageCommand.edgeColoringRequest);
}

function RequestStrongOrientation() {
    SubmitMessage(SageCommand.strongOrientationRequest);
}

function RequestRandomOrientation() {
    SubmitMessage(SageCommand.randomOrientationRequest);
}

function RequestConvertGraph() {
    SubmitMessage(SageCommand.convertGraph);
}


function SubmitMessage(parameter: SageCommand, message = "") {
    graphJSON.parameter = parameter;
    graphJSON.message = message;
    var prettyJSON = PrettifyJSON();
    webSocket.send(prettyJSON);
}

function onCloseClick() {
    webSocket.close();
}

