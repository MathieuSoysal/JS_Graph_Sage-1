import { GraphCustom } from './graph-gestionnaire/GraphCustom';
import { CustomWarn as customWarn } from './InterfaceAndMisc';
import { Node, Edge, Loop, ValueRegisterer } from './graph-gestionnaire/Types';
class Command {
    // #region Properties (4)

    public execute: (p: any) => void;
    public firstAction: boolean;
    public undo: (p: any) => void;
    public value: any;

    // #endregion Properties (4)

    // #region Constructors (1)

    constructor(execute: (p: any) => void, undo: (p: any) => void, value: any, firstAction: boolean) {
        this.execute = execute;
        this.undo = undo;
        this.value = value;
        this.firstAction = firstAction;
    }

    // #endregion Constructors (1)
}

// TODO: Faire un enum Commands.SuppNode
// Enum ne marchera peut-être pas, faire des méthode generateur public

export class CommandsRepository {
    // #region Properties (10)

    public static readonly AddEdgeCommand = (graph: GraphCustom, value: Edge, firstAction = true) => {
        return new Command(
            (e: Edge) => graph.addEdge(e),
            (e: Edge) => graph.removeEdge(e),
            value, firstAction
        );
    };

    public static readonly AddLoopCommand = (graph: GraphCustom, value: Loop, firstAction = true) => {
        return new Command(
            (l: Loop) => graph.addLoop(l),
            (l: Loop) => graph.removeLoop(l),
            value, firstAction
        );
    };

    public static readonly AddNodeCommand = (graph: GraphCustom, value: Node, firstAction = true) => {
        return new Command(
            (n: Node) => graph.addNode(n),
            (n: Node) => graph.removeNode(n),
            value, firstAction
        );
    };

    public static readonly ChangeGroupCommand = (graph: GraphCustom, value: ValueRegisterer, firstAction = true) => {
        return new Command(
            (v: ValueRegisterer) => graph.setGroupElement(v),
            (v: ValueRegisterer) => graph.setGroupElement(v),
            value, firstAction
        );
    };

    public static readonly ChangeNameCommand = (graph: GraphCustom, value: ValueRegisterer, firstAction = true) => {
        return new Command(
            (v: ValueRegisterer) => graph.setElementName(v),
            (v: ValueRegisterer) => graph.setElementName(v),
            value, firstAction
        );
    };

    public static readonly InvertDirectionCommand = (graph: GraphCustom, edge: Edge, firstAction = true) => {
        let value = new ValueRegisterer([edge.source, edge.target], [edge.target, edge.source], edge);
        return new Command(
            (v: ValueRegisterer) => graph.setLinkDirection(v),
            (v: ValueRegisterer) => graph.setLinkDirection(v),
            value, firstAction
        );
    };

    public static readonly MoveNodeCommand = (graph: GraphCustom, value: any, firstAction = true) => {
        return new Command(
            (v: ValueRegisterer) => graph.setNewPosition(v),
            (v: ValueRegisterer) => graph.setOldPosition(v),
            value, firstAction
        );
    };

    public static readonly SupprEdgeCommand = (graph: GraphCustom, value: Edge, firstAction = true) => {
        return new Command(
            (e: Edge) => graph.removeEdge(e),
            (e: Edge) => graph.addEdge(e),
            value, firstAction
        );
    };

    public static readonly SupprLoopCommand = (graph: GraphCustom, value: Loop, firstAction = true) => {
        return new Command(
            (l: Loop) => graph.removeLoop(l),
            (l: Loop) => graph.addLoop(l),
            value, firstAction
        );
    };

    public static readonly SupprNodeCommand = (graph: GraphCustom, value: Node, firstAction = true) => {
        return new Command(
            (n: Node) => graph.removeNode(n),
            (n: Node) => graph.addNode(n),
            value, firstAction
        );
    };

    // #endregion Properties (10)
}

export class CommandManager {
    // #region Properties (2)

    public commandStack: Command[];
    public revertedCommandStack: Command[];

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor() {
        this.commandStack = [];
        this.revertedCommandStack = [];
    }

    // #endregion Constructors (1)

    // #region Public Methods (4)

    public Do(command: Command): void {
        command.execute(command.value);
        this.commandStack.push(command);
    }

    public Execute(command: Command) {
        this.revertedCommandStack = [];
        this.Do(command);
    }

    public Redo(): boolean {
        if (this.revertedCommandStack.length > 0) {
            do {
                var command = this.revertedCommandStack.pop()!;
                this.Do(command);
            }
            while (this.revertedCommandStack.length > 0 && this.revertedCommandStack[this.revertedCommandStack.length - 1]!.firstAction == false)
            return true;
        } else {
            customWarn("Nothing to redo");
            return false;
        }
    }

    public Undo(): boolean {
        if (this.commandStack.length > 0) {
            while (this.commandStack.length > 0 && this.commandStack[this.commandStack.length - 1]!.firstAction == false) {
                let command = this.commandStack.pop()!;
                command.undo(command.value);
                this.revertedCommandStack.push(command);
            }

            //Redo the first action of the user
            let command = this.commandStack.pop()!;
            command.undo(command.value);
            this.revertedCommandStack.push(command);
            return true;

        } else {
            customWarn("Nothing to revert");
            return false;
        }
    }

    // #endregion Public Methods (4)
}
export let myManager: CommandManager = new CommandManager();