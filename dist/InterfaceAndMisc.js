"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardEventInit = exports.TryAddNewGroup = exports.SetCurrentGroup = exports.PopulateGroupList = exports.InitInterface = exports.SetProperties = exports.CustomWarn = void 0;
const d3 = require("d3");
const CommandePatern_1 = require("./CommandePatern");
const Connection_1 = require("./Connection");
const GraphCustom_1 = require("./graph-gestionnaire/GraphCustom");
const OverlayElements_1 = require("./OverlayElements");
//Return string with time on format "HH:MM""
function prettyDate2() {
    var date = new Date();
    return date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
    }) + " ";
}
function CustomWarn(message, display = true) {
    console.warn(prettyDate2() + " " + message);
    if (display) {
        let newLine = prettyDate2() + " : " + message;
        let logs = OverlayElements_1.OverlayElements.scrollText.innerHTML.split(/<br(?: \/)?>/);
        let lastLog = logs[logs.length - 2];
        if (lastLog != newLine) {
            OverlayElements_1.OverlayElements.scrollText.innerHTML += newLine + "<br>";
        }
        updateScroll();
    }
}
exports.CustomWarn = CustomWarn;
function SetProperties(radius, diameter, regular, planar, bipartite) {
    OverlayElements_1.OverlayElements.radiusLabel.innerHTML = radius;
    OverlayElements_1.OverlayElements.diameterLabel.innerHTML = diameter;
    OverlayElements_1.OverlayElements.regularLabel.innerHTML = regular;
    OverlayElements_1.OverlayElements.planarLabel.innerHTML = planar;
    OverlayElements_1.OverlayElements.bipartiteLabel.innerHTML = bipartite;
}
exports.SetProperties = SetProperties;
function InitInterface(graphCustom) {
    UpdateDirectedRelatedElements(graphCustom);
}
exports.InitInterface = InitInterface;
function DisplayElement(element, show) {
    element.style.display = (show) ? "" : "none";
}
function UpdateDirectedRelatedElements(graphCustom) {
    for (let index = 0; index < OverlayElements_1.OverlayElements.directedRelated.length; index++) {
        DisplayElement(OverlayElements_1.OverlayElements.directedRelated.item(index), (graphCustom ? graphCustom : GraphCustom_1.graph).directed);
    }
}
/**
 * Empty the list of groups.
 */
function EmptyGroupList() {
    for (let index = OverlayElements_1.OverlayElements.groupList.childElementCount - 2; index >= 0; index--) {
        OverlayElements_1.OverlayElements.groupList.removeChild(OverlayElements_1.OverlayElements.groupList.childNodes.item(index));
    }
}
function PopulateGroupList() {
    EmptyGroupList();
    for (const groupName of GraphCustom_1.graph.groupsNames)
        CreateGroupElement(groupName);
    OverlayElements_1.OverlayElements.groupList.selectedIndex = 0;
}
exports.PopulateGroupList = PopulateGroupList;
const scale = d3.scaleOrdinal(d3.schemeCategory10);
function SetCurrentGroup() {
    // TODO: Relier avec graphd3js
    GraphCustom_1.graph.currentGroupIndex = OverlayElements_1.OverlayElements.groupList.selectedIndex;
    OverlayElements_1.OverlayElements.groupList.style.backgroundColor = scale(`${GraphCustom_1.graph.currentGroupIndex}`);
}
exports.SetCurrentGroup = SetCurrentGroup;
function CreateGroupElement(name) {
    var newElem = document.createElement("option");
    newElem.textContent = name;
    newElem.value = name;
    let list = OverlayElements_1.OverlayElements.groupList;
    let lastIndex = list.childElementCount - 1;
    newElem.style.backgroundColor = scale(`${lastIndex}`);
    list.insertBefore(newElem, list.childNodes.item(lastIndex));
    OverlayElements_1.OverlayElements.groupList.selectedIndex = lastIndex;
    SetCurrentGroup();
}
function TryAddNewGroup() {
    var newName = prompt("Please enter the group name:", "New Group");
    if (newName == null || newName == "") {
        window.alert("Invalid name, no new group created.");
        return false;
    }
    else if (GraphCustom_1.graph.groupList.includes(newName)) {
        window.alert("This group already exist.");
        return false;
    }
    else {
        GraphCustom_1.graph.addGroup(newName);
        CreateGroupElement(newName);
        return true;
    }
}
exports.TryAddNewGroup = TryAddNewGroup;
class UserAction {
    // #endregion Properties (2)
    // #region Constructors (1)
    constructor(actioned, actionName) {
        this.actioned = actioned;
        this.nameAction = actionName;
    }
    // #endregion Constructors (1)
    // #region Public Methods (2)
    getNameOfAction() {
        return this.nameAction;
    }
    isActioned() {
        return this.actioned;
    }
}
function KeyboardEventInit() {
    //Keyboard Event
    document.onkeyup = function (key) {
        var result = null;
        switch (key.keyCode) {
            case 46:
                result = new UserAction(GraphCustom_1.graph.removeSelection(), "Delete selected Elements");
                break;
            case 65:
                //A for Add
                result = new UserAction(GraphCustom_1.graph.addNewNode(), "Add new node");
                break;
            case 67:
                //C for color
                GraphCustom_1.graph.setGroupOfSelection();
                break;
            case 68:
                //V for Divide nodes on selection
                result = new UserAction(GraphCustom_1.graph.subdivideEdgeOnSelection(), "Subdivide selected edges");
                break;
            case 69:
                //E for Edges
                result = new UserAction(GraphCustom_1.graph.addEdgesOnSelection(), "Add edge between selected nodes");
                break;
            case 70:
                //F for Freeze
                GraphCustom_1.graph.freezeOrUnfreezeGraph();
                break;
            case 73:
                //I for invert
                result = new UserAction(GraphCustom_1.graph.invertEdgesOnSelection(), "Invert selected edges orientation");
                break;
            case 76:
                //L for Loops
                result = new UserAction(GraphCustom_1.graph.addLoopOnSelectedNodes(), "Add loop on selected nodes");
                break;
            case 82:
                //R to reset selection
                GraphCustom_1.graph.resetSelection();
                break;
            case 89:
                //Y to redo
                result = new UserAction(CommandePatern_1.myManager.Redo(), "Redo previous reverted action");
                break;
            case 90:
                //Z to undo
                result = new UserAction(CommandePatern_1.myManager.Undo(), "Undo previous action");
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + key.keyCode);
                break;
        }
        if (result) {
            CheckUserAction(result);
        }
    };
}
exports.KeyboardEventInit = KeyboardEventInit;
function CheckUserAction(userAction) {
    if (userAction.isActioned()) {
        Connection_1.UpdateGraphProperties(userAction.getNameOfAction());
    }
}
function updateScroll() {
    OverlayElements_1.OverlayElements.scrollText.parentElement.style.display = "inherit";
    OverlayElements_1.OverlayElements.scrollText.scrollTop = OverlayElements_1.OverlayElements.scrollText.scrollHeight;
}
//# sourceMappingURL=InterfaceAndMisc.js.map