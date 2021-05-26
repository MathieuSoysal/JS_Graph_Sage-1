"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myManager = exports.CommandManager = exports.CommandsRepository = void 0;
const InterfaceAndMisc_1 = require("./InterfaceAndMisc");
const Types_1 = require("./graph-gestionnaire/Types");
class Command {
    // #endregion Properties (4)
    // #region Constructors (1)
    constructor(execute, undo, value, firstAction) {
        this.execute = execute;
        this.undo = undo;
        this.value = value;
        this.firstAction = firstAction;
    }
}
// TODO: Faire un enum Commands.SuppNode
// Enum ne marchera peut-être pas, faire des méthode generateur public
class CommandsRepository {
}
exports.CommandsRepository = CommandsRepository;
// #region Properties (10)
CommandsRepository.AddEdgeCommand = (graph, value, firstAction = true) => {
    return new Command((e) => graph.addEdge(e), (e) => graph.removeEdge(e), value, firstAction);
};
CommandsRepository.AddLoopCommand = (graph, value, firstAction = true) => {
    return new Command((l) => graph.addLoop(l), (l) => graph.removeLoop(l), value, firstAction);
};
CommandsRepository.AddNodeCommand = (graph, value, firstAction = true) => {
    return new Command((n) => graph.addNode(n), (n) => graph.removeNode(n), value, firstAction);
};
CommandsRepository.ChangeGroupCommand = (graph, value, firstAction = true) => {
    return new Command(graph.setGroupElement, graph.setGroupElement, value, firstAction);
};
CommandsRepository.ChangeNameCommand = (graph, value, firstAction = true) => {
    return new Command(graph.setElementName, graph.setElementName, value, firstAction);
};
CommandsRepository.InvertDirectionCommand = (graph, edge, firstAction = true) => {
    let value = new Types_1.ValueRegisterer([edge.source, edge.target], [edge.target, edge.source], edge);
    return new Command(graph.setLinkDirection, graph.setLinkDirection, value, firstAction);
};
CommandsRepository.MoveNodeCommand = (graph, value, firstAction = true) => {
    return new Command(graph.setNewPosition, graph.setOldPosition, value, firstAction);
};
CommandsRepository.SupprEdgeCommand = (graph, value, firstAction = true) => {
    return new Command(graph.removeEdge, graph.addEdge, value, firstAction);
};
CommandsRepository.SupprLoopCommand = (graph, value, firstAction = true) => {
    return new Command(graph.removeLoop, graph.addLoop, value, firstAction);
};
CommandsRepository.SupprNodeCommand = (graph, value, firstAction = true) => {
    return new Command(graph.removeNode, graph.addNode, value, firstAction);
};
class CommandManager {
    // #endregion Properties (2)
    // #region Constructors (1)
    constructor() {
        this.commandStack = [];
        this.revertedCommandStack = [];
    }
    // #endregion Constructors (1)
    // #region Public Methods (4)
    Do(command) {
        command.execute(command.value);
        this.commandStack.push(command);
    }
    Execute(command) {
        this.revertedCommandStack = [];
        this.Do(command);
    }
    Redo() {
        if (this.revertedCommandStack.length > 0) {
            do {
                var command = this.revertedCommandStack.pop();
                this.Do(command);
            } while (this.revertedCommandStack.length > 0 && this.revertedCommandStack[this.revertedCommandStack.length - 1].firstAction == false);
            return true;
        }
        else {
            InterfaceAndMisc_1.CustomWarn("Nothing to redo");
            return false;
        }
    }
    Undo() {
        if (this.commandStack.length > 0) {
            while (this.commandStack.length > 0 && this.commandStack[this.commandStack.length - 1].firstAction == false) {
                let command = this.commandStack.pop();
                command.undo(command.value);
                this.revertedCommandStack.push(command);
            }
            //Redo the first action of the user
            let command = this.commandStack.pop();
            command.undo(command.value);
            this.revertedCommandStack.push(command);
            return true;
        }
        else {
            InterfaceAndMisc_1.CustomWarn("Nothing to revert");
            return false;
        }
    }
}
exports.CommandManager = CommandManager;
exports.myManager = new CommandManager();
//# sourceMappingURL=CommandePatern.js.map