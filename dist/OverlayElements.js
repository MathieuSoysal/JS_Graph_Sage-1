"use strict";
//Structure that allow to search DOM element only once
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayElements = void 0;
class OverlayElements {
    static get groupList() {
        if (this._groupListElement === undefined) {
            this._groupListElement = document.getElementById("groupList");
        }
        return this._groupListElement;
    }
    ;
    static get keyPanelContent() {
        if (this._keyPanelContent === undefined) {
            this._keyPanelContent = document.getElementById("KeyPanelContent");
        }
        return this._keyPanelContent;
    }
    ;
    static get propertyPanelContent() {
        if (!this._propertyPanelContent) {
            this._propertyPanelContent = document.getElementById("PropertyPanelContent");
        }
        return this._propertyPanelContent;
    }
    ;
    static get toolPanelContent() {
        if (!this._toolPanelContent) {
            this._toolPanelContent = document.getElementById("ToolPanelContent");
        }
        return this._toolPanelContent;
    }
    ;
    static get algorithmPanelContent() {
        if (!this._algorithmPanelContent) {
            this._algorithmPanelContent = document.getElementById("AlgorithmPanelContent");
        }
        return this._algorithmPanelContent;
    }
    ;
    static get promptResult() {
        if (!this._promptResultElement) {
            this._promptResultElement = document.getElementById("PromptResult");
        }
        return this._promptResultElement;
    }
    ;
    static get directedRelated() {
        if (!this._directedRelatedElements) {
            this._directedRelatedElements = document.getElementsByClassName("DirectedRelated");
        }
        return this._directedRelatedElements;
    }
    ;
    static get scrollText() {
        if (!this._scrollTextElement) {
            this._scrollTextElement = document.getElementsByClassName("scroll")[0];
        }
        return this._scrollTextElement;
    }
    ;
    static get radiusLabel() {
        if (!this._radiusLabelElement) {
            this._radiusLabelElement = document.getElementById("radiusLabel");
        }
        return this._radiusLabelElement;
    }
    ;
    static get diameterLabel() {
        if (!this._diameterLabelElement) {
            this._diameterLabelElement = document.getElementById("diameterLabel");
        }
        return this._diameterLabelElement;
    }
    ;
    static get regularLabel() {
        if (!this._regularLabelElement) {
            this._regularLabelElement = document.getElementById("regularLabel");
        }
        return this._regularLabelElement;
    }
    ;
    static get planarLabel() {
        if (!this._planarLabelElement) {
            this._planarLabelElement = document.getElementById("planarLabel");
        }
        return this._planarLabelElement;
    }
    ;
    static get bipartiteLabel() {
        if (!this._bipartiteLabelElement) {
            this._bipartiteLabelElement = document.getElementById("bipartiteLabel");
        }
        return this._bipartiteLabelElement;
    }
    ;
}
exports.OverlayElements = OverlayElements;
//# sourceMappingURL=OverlayElements.js.map