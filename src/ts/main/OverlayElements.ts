//Structure that allow to search DOM element only once

export class OverlayElements {
    // #region Properties (13)

    private static _algorithmPanelContent: HTMLDivElement;
    private static _bipartiteLabelElement: HTMLTableDataCellElement;
    private static _diameterLabelElement: HTMLTableDataCellElement;
    private static _directedRelatedElements: HTMLCollectionOf<HTMLTableRowElement>;
    private static _groupListElement: HTMLSelectElement;
    private static _keyPanelContent: HTMLDivElement;
    private static _planarLabelElement: HTMLTableDataCellElement;
    private static _promptResultElement: HTMLElement | null;
    private static _propertyPanelContent: HTMLDivElement;
    private static _radiusLabelElement: HTMLTableDataCellElement;
    private static _regularLabelElement: HTMLTableDataCellElement;
    private static _scrollTextElement: HTMLDivElement;
    private static _toolPanelContent: HTMLDivElement;

    // #endregion Properties (13)

    // #region Public Static Accessors (13)

    public static get algorithmPanelContent() {
        if (!this._algorithmPanelContent) {
            this._algorithmPanelContent = <HTMLDivElement>document.getElementById("AlgorithmPanelContent");
        }
        return this._algorithmPanelContent;
    }

    public static get bipartiteLabel() {
        if (!this._bipartiteLabelElement) {
            this._bipartiteLabelElement = <HTMLTableDataCellElement>document.getElementById("bipartiteLabel");
        }
        return this._bipartiteLabelElement;
    }

    public static get diameterLabel() {
        if (!this._diameterLabelElement) {
            this._diameterLabelElement = <HTMLTableDataCellElement>document.getElementById("diameterLabel");
        }
        return this._diameterLabelElement;
    }

    public static get directedRelated() {
        if (!this._directedRelatedElements) {
            this._directedRelatedElements = <HTMLCollectionOf<HTMLTableRowElement>>document.getElementsByClassName("DirectedRelated");
        }
        return this._directedRelatedElements;
    }

    public static get groupList() {
        if (this._groupListElement === undefined) {
            this._groupListElement = <HTMLSelectElement>document.getElementById("groupList");
        }
        return this._groupListElement;
    }

    public static get keyPanelContent(): HTMLDivElement {
        if (this._keyPanelContent === undefined) {
            this._keyPanelContent = <HTMLDivElement>document.getElementById("KeyPanelContent");
        }
        return this._keyPanelContent;
    }

    public static get planarLabel() {
        if (!this._planarLabelElement) {
            this._planarLabelElement = <HTMLTableDataCellElement>document.getElementById("planarLabel");
        }
        return this._planarLabelElement;
    }

    public static get promptResult() {
        if (!this._promptResultElement) {
            this._promptResultElement = document.getElementById("PromptResult");
        }
        return this._promptResultElement;
    }

    public static get propertyPanelContent() {
        if (!this._propertyPanelContent) {
            this._propertyPanelContent = <HTMLDivElement>document.getElementById("PropertyPanelContent");
        }
        return this._propertyPanelContent;
    }

    public static get radiusLabel() {
        if (!this._radiusLabelElement) {
            this._radiusLabelElement = <HTMLTableDataCellElement>document.getElementById("radiusLabel");
        }
        return this._radiusLabelElement;
    }

    public static get regularLabel() {
        if (!this._regularLabelElement) {
            this._regularLabelElement = <HTMLTableDataCellElement>document.getElementById("regularLabel");
        }
        return this._regularLabelElement;
    }

    public static get scrollText() {
        if (!this._scrollTextElement) {
            this._scrollTextElement = <HTMLDivElement>document.getElementsByClassName("scroll")[0];
        }
        return this._scrollTextElement;
    }

    public static get toolPanelContent() {
        if (!this._toolPanelContent) {
            this._toolPanelContent = <HTMLDivElement>document.getElementById("ToolPanelContent");
        }
        return this._toolPanelContent;
    }

    // #endregion Public Static Accessors (13)
}