import d3 = require('d3');
import { myManager } from './CommandePatern';
import { UpdateGraphProperties } from './Connection';
import { graph, GraphCustom } from './graph-gestionnaire/GraphCustom';
import { OverlayElements } from './OverlayElements';

//Return string with time on format "HH:MM""
function prettyDate2(): string {
    var date = new Date();
    return date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
    }) + " ";
}

export function CustomWarn(message: string, display = true): void {
    console.warn(prettyDate2() + " " + message);
    if (display) {
        let newLine = prettyDate2() + " : " + message;
        let logs = OverlayElements.scrollText.innerHTML.split(/<br(?: \/)?>/);
        let lastLog = logs[logs.length - 2];
        if (lastLog != newLine) {
            OverlayElements.scrollText.innerHTML += newLine + "<br>"
        }

        updateScroll();
    }
}

export function SetProperties(radius: string, diameter: string, regular: string, planar: string, bipartite: string): void {
    OverlayElements.radiusLabel.innerHTML = radius;
    OverlayElements.diameterLabel.innerHTML = diameter;
    OverlayElements.regularLabel.innerHTML = regular;
    OverlayElements.planarLabel.innerHTML = planar;
    OverlayElements.bipartiteLabel.innerHTML = bipartite;
}

export function InitInterface(graphCustom?: GraphCustom): void {
    UpdateDirectedRelatedElements(graphCustom);
}

function DisplayElement(element: HTMLElement, show: boolean): void {
    element.style.display = (show) ? "" : "none";
}

function UpdateDirectedRelatedElements(graphCustom?: GraphCustom): void {
    for (let index = 0; index < OverlayElements.directedRelated.length; index++) {
        DisplayElement(OverlayElements.directedRelated.item(index)!, (graphCustom ? graphCustom : graph).directed);
    }
}

/**
 * Empty the list of groups.
 */
function EmptyGroupList(): void {
    for (let index = OverlayElements.groupList.childElementCount - 2; index >= 0; index--) {
        OverlayElements.groupList.removeChild(OverlayElements.groupList.childNodes.item(index));
    }
}

export function PopulateGroupList(): void {
    EmptyGroupList();
    for (const groupName of graph.groupsNames)
        CreateGroupElement(groupName);
    OverlayElements.groupList.selectedIndex = 0;
}

const scale = d3.scaleOrdinal(d3.schemeCategory10)
export function SetCurrentGroup(): void {
    // TODO: Relier avec graphd3js
    graph.currentGroupIndex = OverlayElements.groupList.selectedIndex;
    OverlayElements.groupList.style.backgroundColor = scale(`${graph.currentGroupIndex}`);
}

function CreateGroupElement(name: string): void {
    var newElem = document.createElement("option");
    newElem.textContent = name;
    newElem.value = name;

    let list = OverlayElements.groupList;
    let lastIndex = list.childElementCount - 1;
    newElem.style.backgroundColor = scale(`${lastIndex}`);
    list.insertBefore(newElem, list.childNodes.item(lastIndex));

    OverlayElements.groupList.selectedIndex = lastIndex;
    SetCurrentGroup();
}

export function TryAddNewGroup(): boolean {
    var newName = prompt("Please enter the group name:", "New Group");
    if (newName == null || newName == "") {
        window.alert("Invalid name, no new group created.");
        return false;
    } else if (graph.groupList.includes(newName)) {
        window.alert("This group already exist.");
        return false;
    }
    else {
        graph.addGroup(newName);
        CreateGroupElement(newName);
        return true;
    }
}

class UserAction {
    // #region Properties (2)

    private actioned: boolean;
    private nameAction: string;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(actioned: boolean, actionName: string) {
        this.actioned = actioned;
        this.nameAction = actionName;
    }

    // #endregion Constructors (1)

    // #region Public Methods (2)

    public getNameOfAction(): string {
        return this.nameAction;
    }

    public isActioned(): boolean {
        return this.actioned;
    }

    // #endregion Public Methods (2)
}

export function KeyboardEventInit(): void {
    //Keyboard Event
    document.onkeyup = function (key) {
        var result: UserAction | null = null;
        switch (key.keyCode) {
            case 46:
                result = new UserAction(graph.removeSelection(), "Delete selected Elements");
                break;
            case 65:
                //A for Add
                result = new UserAction(graph.addNewNode(), "Add new node");
                break;
            case 67:
                //C for color
                graph.setGroupOfSelection();
                break;
            case 68:
                //V for Divide nodes on selection
                result = new UserAction(graph.subdivideEdgeOnSelection(), "Subdivide selected edges");
                break;
            case 69:
                //E for Edges
                result = new UserAction(graph.addEdgesOnSelection(), "Add edge between selected nodes");
                break;
            case 70:
                //F for Freeze
                graph.freezeOrUnfreezeGraph();
                break;
            case 73:
                //I for invert
                result = new UserAction(graph.invertEdgesOnSelection(), "Invert selected edges orientation");
                break;
            case 76:
                //L for Loops
                result = new UserAction(graph.addLoopOnSelectedNodes(), "Add loop on selected nodes");
                break;
            case 77:
                //m for Loops
                graph.saveSelectedElements();
                break;
            case 82:
                //R to reset selection
                graph.resetSelection();
                break;
            case 89:
                //Y to redo
                result = new UserAction(myManager.Redo(), "Redo previous reverted action");
                break;
            case 90:
                //Z to undo
                result = new UserAction(myManager.Undo(), "Undo previous action");
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + key.keyCode);
                break;
        }
        if (result) {
            CheckUserAction(result);
        }
    }
}

function CheckUserAction(userAction: UserAction) {
    if (userAction.isActioned()) {
        UpdateGraphProperties(userAction.getNameOfAction());
    }
}

function updateScroll(): void {
    OverlayElements.scrollText.parentElement!.style.display = "inherit";
    OverlayElements.scrollText.scrollTop = OverlayElements.scrollText.scrollHeight;
}