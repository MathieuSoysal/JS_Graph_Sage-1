//Structure that allow to search DOM element only once

export class OverlayElements {
    private static _groupListElement: HTMLSelectElement;
    static get groupList() {
        if (this._groupListElement === undefined) {
            this._groupListElement = <HTMLSelectElement>document.getElementById("groupList");
        }
        return this._groupListElement;
    };

    private static _keyPanelContent: HTMLDivElement;
    static get keyPanelContent(): HTMLDivElement {
        if (this._keyPanelContent === undefined) {
            this._keyPanelContent = <HTMLDivElement>document.getElementById("KeyPanelContent");
        }
        return this._keyPanelContent;
    };

    private static _propertyPanelContent: HTMLDivElement;
    static get propertyPanelContent() {
        if (!this._propertyPanelContent) {
            this._propertyPanelContent = <HTMLDivElement>document.getElementById("PropertyPanelContent");
        }
        return this._propertyPanelContent;
    };

    private static _toolPanelContent: HTMLDivElement;
    static get toolPanelContent() {
        if (!this._toolPanelContent) {
            this._toolPanelContent = <HTMLDivElement>document.getElementById("ToolPanelContent");
        }
        return this._toolPanelContent;
    };

    private static _algorithmPanelContent: HTMLDivElement;
    static get algorithmPanelContent() {
        if (!this._algorithmPanelContent) {
            this._algorithmPanelContent = <HTMLDivElement>document.getElementById("AlgorithmPanelContent");
        }
        return this._algorithmPanelContent;
    };

    private static _promptResultElement: HTMLElement | null;
    static get promptResult() {
        if (!this._promptResultElement) {
            this._promptResultElement = document.getElementById("PromptResult");
        }
        return this._promptResultElement;
    };

    private static _directedRelatedElements: HTMLCollectionOf<HTMLTableRowElement>;
    static get directedRelated() {
        if (!this._directedRelatedElements) {
            this._directedRelatedElements = <HTMLCollectionOf<HTMLTableRowElement>>document.getElementsByClassName("DirectedRelated");
        }
        return this._directedRelatedElements;
    };

    private static _scrollTextElement: HTMLDivElement;
    static get scrollText() {
        if (!this._scrollTextElement) {
            this._scrollTextElement = <HTMLDivElement>document.getElementsByClassName("scroll")[0];
        }
        return this._scrollTextElement;
    };

    private static _radiusLabelElement: HTMLTableDataCellElement;
    static get radiusLabel() {
        if (!this._radiusLabelElement) {
            this._radiusLabelElement = <HTMLTableDataCellElement>document.getElementById("radiusLabel");
        }
        return this._radiusLabelElement;
    };

    private static _diameterLabelElement: HTMLTableDataCellElement;
    static get diameterLabel() {
        if (!this._diameterLabelElement) {
            this._diameterLabelElement = <HTMLTableDataCellElement>document.getElementById("diameterLabel");
        }
        return this._diameterLabelElement;
    };

    private static _regularLabelElement: HTMLTableDataCellElement;
    static get regularLabel() {
        if (!this._regularLabelElement) {
            this._regularLabelElement = <HTMLTableDataCellElement>document.getElementById("regularLabel");
        }
        return this._regularLabelElement;
    };

    private static _planarLabelElement: HTMLTableDataCellElement;
    static get planarLabel() {
        if (!this._planarLabelElement) {
            this._planarLabelElement = <HTMLTableDataCellElement>document.getElementById("planarLabel");
        }
        return this._planarLabelElement;
    };

    private static _bipartiteLabelElement: HTMLTableDataCellElement;
    static get bipartiteLabel() {
        if (!this._bipartiteLabelElement) {
            this._bipartiteLabelElement = <HTMLTableDataCellElement>document.getElementById("bipartiteLabel");
        }
        return this._bipartiteLabelElement;
    };
}