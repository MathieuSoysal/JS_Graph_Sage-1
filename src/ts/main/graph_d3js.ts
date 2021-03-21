
//The graph properties
var graphJSON, force, customColorScale;
var width = function () { return document.documentElement.clientWidth * 0.8 };
var height = function () { return document.documentElement.clientHeight };
var xshift = function () { return document.getElementById("graphFrame").childNodes[3].getBoundingClientRect().left; };
var drag_in_progress = false;
var is_frozen = false;
var isDirected = false;

//DOM Elements / D3JS Elements
var nodes, links, loops, v_labels, e_labels, l_labels, line, svg, brush, arrows;
var groupList = [];
var currentGroupIndex = 0;
var currentObject: ElementCustom = null;
const MyManager = new CommandManager();

const cursorPosition = {
    x: 0,
    y: 0
};

class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    public start: Point;
    public end: Point;

    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }
}

class ValueRegisterer {
    public oldValue: any;
    public newValue: any;
    public element: ElementCustom;

    constructor(oldValue: any, newValue: any, element: ElementCustom) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.element = element;
    }
}

class ElementCustom {
    public data: any;
    public type: GraphType;

    constructor(data, type: GraphType) {
        this.data = data;
        this.type = type;
    }
}

class GraphSelection {
    public nodes: ElementCustom[];
    public edges: ElementCustom[];
    public loops: ElementCustom[];

    constructor(nodes: ElementCustom[], edges: ElementCustom[], loops: ElementCustom[]) {
        this.nodes = nodes;
        this.edges = edges;
        this.loops = loops;
    }
}

window.onload = function (): void {
    InitWebSocketConnection();

    document.body.onmousemove = handleMouseMove;
    // List of colors
    customColorScale = d3.scale.category20();
    KeyboardEventInit();

    InitNewGraph();
}

function InitNewGraph(graph = null): void {
    if (force) { force.stop(); }
    LoadGraphData(graph);
    InitGraph();
    InitInterface();
    ManageAllGraphicsElements();
    InitForce();
    //Start the automatic force layout
    force.start();
    //Freeze the graph after 2 sec
    WaitGraphLoadToFreeze(2000);
}

function handleMouseMove(event: MouseEvent): void {
    cursorPosition.x = event.pageX - xshift();
    cursorPosition.y = event.pageY;
}

// TODO: Graph
function GetGraphFromHTML() {
    var mydiv = document.getElementById("mygraphdata")
    var graph_as_string = mydiv.innerHTML
    let graph = StringToObject(graph_as_string);

    return graph;
}

// Loads the graph data
function LoadGraphData(newGraph): void {
    graphJSON = (newGraph) ? newGraph : GetGraphFromHTML();

    //Init group
    FillGroupFromGraph(graphJSON);
    PopulateGroupList();
}

function FillGroupFromGraph(graph): void {
    groupList = [];
    graph.nodes.forEach(element => {
        if (!groupList.includes(element.group)) {
            groupList.push(element.group);
        }
    });
}

function InitGraph(): void {
    isDirected = graphJSON.directed;

    graphJSON.loops.forEach(element => {
        element.source = graphJSON.nodes[element.source];
        element.target = graphJSON.nodes[element.source];
    });

    force = d3.layout.force()
        .charge(graphJSON.charge)
        .linkDistance(graphJSON.link_distance)
        .linkStrength(graphJSON.link_strength)
        .gravity(graphJSON.gravity)
        .size([width(), height()])
        .links(graphJSON.links)
        .nodes(graphJSON.nodes);

    // Adapts the graph layout to the javascript window's dimensions
    if (graphJSON.pos.length != 0) {
        center_and_scale();
    }

    // The function 'line' takes as input a sequence of tuples, and returns a
    // curve interpolating these points.
    line = d3.svg.line()
        .interpolate("cardinal")
        .tension(.2)
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
}

function ResetSelection(): void {
    let currentSelection = GetCurrentSelection(true);

    if (currentSelection != null) {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach((element: ElementCustom) => {
                SelectElement(new ElementCustom(element.data, element.type));
            });
        });

        RefreshNodes();
        RefreshEdge();
        RefreshLoops();
    }
}

// Returns the coordinates of a point located at distance d from the
// barycenter of two points pa, pb.
function third_point_of_curved_edge(pa: Point, pb: Point, d: number): Point {
    var ox = pa.x,
        oy = pa.y,
        dx = pb.x,
        dy = pb.y;
    var cx = (dx + ox) / 2,
        cy = (dy + oy) / 2;
    var ny = -(dx - ox),
        nx = dy - oy;
    var nn = Math.sqrt(nx * nx + ny * ny)
    return new Point(cx + d * nx / nn, cy + d * ny / nn);
}

// Applies an homothety to the points of the graph respecting the
// aspect ratio, so that the graph takes the whole javascript
// window and is centered
function center_and_scale() {
    var minx = graphJSON.pos[0][0];
    var maxx = graphJSON.pos[0][0];
    var miny = graphJSON.pos[0][1];
    var maxy = graphJSON.pos[0][1];

    //Determine Min/Max
    graphJSON.nodes.forEach(function (d, i) {
        maxx = Math.max(maxx, graphJSON.pos[i][0]);
        minx = Math.min(minx, graphJSON.pos[i][0]);
        maxy = Math.max(maxy, graphJSON.pos[i][1]);
        miny = Math.min(miny, graphJSON.pos[i][1]);
    });

    var border = 60
    var xspan = maxx - minx;
    var yspan = maxy - miny;

    var scale = Math.min((height() - border) / yspan, (width() - border) / xspan);
    var xshift = (width() - scale * xspan) / 2
    var yshift = (height() - scale * yspan) / 2

    force.nodes().forEach(function (d: Point, i: number) {
        d.x = scale * (graphJSON.pos[i][0] - minx) + xshift;
        d.y = scale * (graphJSON.pos[i][1] - miny) + yshift;
    });
}

//Define all forces movements
function InitForce() {
    force.on("tick", function () {

        // Position of vertices
        nodes.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            });

        // Position of edges
        links.attr("d", function (d) {

            // Straight edges
            if (d.curve == 0) {
                return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
            }
            // Curved edges
            else {
                var p = third_point_of_curved_edge(d.source, d.target, d.curve)
                return line([{
                    'x': d.source.x,
                    'y': d.source.y
                },
                {
                    'x': p.x,
                    'y': p.y
                },
                {
                    'x': d.target.x,
                    'y': d.target.y
                }
                ])
            }
        });

        // Position of Loops
        if (graphJSON.loops.length != 0) {
            loops
                .attr("cx", function (d) {
                    return d.source.x;
                })
                .attr("cy", function (d) {
                    return d.source.y - d.curve;
                })
        }

        // Position of vertex labels
        v_labels
            .attr("x", function (d) {
                return d.x + graphJSON.vertex_size;
            })
            .attr("y", function (d) {
                return d.y;
            })
        // Position of the edge labels
        e_labels
            .attr("x", function (d) {
                return third_point_of_curved_edge(d.source, d.target, d.curve + 3).x;
            })
            .attr("y", function (d) {
                return third_point_of_curved_edge(d.source, d.target, d.curve + 3).y;
            })
        l_labels
            .attr("x", function (d) {
                return d.source.x;
            })
            .attr("y", function (d) {
                return d.source.y - 2 * d.curve - 1;
            })
    });
}

function ManageAllGraphicsElements() {
    if (svg) {
        let oldSVG = document.getElementById("svg");
        oldSVG.parentElement.removeChild(oldSVG);
    }

    // SVG window
    svg = d3.select("#graphFrame").append("svg")
        .attr("id", "svg")
        .attr("width", width())
        .attr("height", height())
        .attr("pointer-events", "all") // Zoom+move management
        .append('svg:g')

    // Zooming
    svg.append('svg:rect')
        .attr('x', -10000)
        .attr('y', -10000)
        .attr('width', 2 * 10000)
        .attr('height', 2 * 10000);


    InitBrush();

    ManageNodeLabels();
    ManageEdges();
    ManageLoops();
    ManageNodes();
    ManageArrows();
}


function InitBrush() {
    brush = svg.append("g")
        .attr("class", "brush")
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([-100000, 100000]))
            .y(d3.scale.identity().domain([-100000, 100000]))
            .on("brushstart", function () {
                ResetSelection();
            })
            .on("brushend", function () {
                var extent = d3.event.target.extent();
                SelectElementsInsideExtent(extent);

                //Remove Selection rectangle
                d3.event.target.clear();
                d3.select(this).call(d3.event.target);
            }));
}

function SelectElementsInsideExtent(extent: number[][]) {
    nodes.each(function (d) {
        if (IsNodeInsideExtent(extent, d)) {
            SelectElement(new ElementCustom(d, GraphType.NodeType));
        }
    })
    loops.each(function (d) {
        if (IsNodeInsideExtent(extent, d.source)) {
            SelectElement(new ElementCustom(d, GraphType.LoopType));
        }
    })
    links.each(function (d) {
        if (IsEdgeInsideExtent(extent, d)) {
            SelectElement(new ElementCustom(d, GraphType.EdgeType));
        }
    })
}

// TODO: à voir
function ConstructRectangleFromExtent(extent: number[][]): Segment[] {
    let topLeftCorner = new Point(extent[0][0], extent[0][1]);
    let topRightCorner = new Point(extent[1][0], extent[0][1]);
    let bottomLefttCorner = new Point(extent[0][0], extent[1][1]);
    let bottomRightCorner = new Point(extent[1][0], extent[1][1]);

    let topBorder = new Segment(topLeftCorner, topRightCorner);
    let leftBorder = new Segment(topLeftCorner, bottomLefttCorner);
    let rightBorder = new Segment(topRightCorner, bottomRightCorner);
    let bottomBorder = new Segment(bottomRightCorner, bottomLefttCorner);

    let rectangle = [topBorder, leftBorder, rightBorder, bottomBorder];

    return rectangle;
}

// Given three colinear points p, q, r, the function checks if 
// point q lies on line segment 'pr' 
function onSegment(p: Point, q: Point, r: Point): boolean {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r). 
// The function returns following values 
// 0 --> p, q and r are colinear 
// 1 --> Clockwise 
// 2 --> Counterclockwise 
function orientationCustom(p: Point, q: Point, r: Point): number {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
    // for details of below formula. 
    let val = (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // colinear 

    return (val > 0) ? 1 : 2; // clock or counterclock wise 
}

function doSegmentIntersect(firstSegment: Segment, secondSegment: Segment): boolean {
    return doIntersect(firstSegment.start, firstSegment.end, secondSegment.start, secondSegment.end);
}

// The main function that returns true if line segment 'p1q1' 
// and 'p2q2' intersect. 
function doIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    // Find the four orientations needed for general and 
    // special cases 
    let o1 = orientationCustom(p1, q1, p2);
    let o2 = orientationCustom(p1, q1, q2);
    let o3 = orientationCustom(p2, q2, p1);
    let o4 = orientationCustom(p2, q2, q1);

    // General case 
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases 
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases 
}

function IsEdgeInsideExtent(extent: number[][], edge): boolean {
    if (IsNodeInsideExtent(extent, edge.source) || IsNodeInsideExtent(extent, edge.target)) {
        return true;
    }
    else {
        return DoesEdgeIntersectExtent(extent, edge);
    }
}

function DoesEdgeIntersectExtent(extent: number[][], edge): boolean {
    let rectangle = ConstructRectangleFromExtent(extent);
    let edgeSegment = new Segment(edge.source, edge.target);
    let doesIntersect = false;
    let count = 0;

    while (doesIntersect == false && count < rectangle.length) {
        doesIntersect = doSegmentIntersect(rectangle[count], edgeSegment);
        count += 1;
    }

    return doesIntersect;
}

function IsNodeInsideExtent(extent: number[][], node): boolean {
    return extent[0][0] <= node.x && node.x < extent[1][0] && extent[0][1] <= node.y && node.y < extent[1][1];
}

function ManageArrows(): void {
    // Arrows, for directed graphs
    arrows = svg.append("svg:defs").selectAll("marker")
        .data(["directed"])
        .enter().append("svg:marker")
        .attr("id", String)
        // viewbox is a rectangle with bottom-left corder (0,-2), width 4 and height 4
        .attr("viewBox", "0 -2 4 4")
        // This formula took some time ... :-P
        .attr("refX", Math.ceil(2 * Math.sqrt(graphJSON.vertex_size)))
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("svg:path")
        // triangles with endpoints (0,-2), (4,0), (0,2)
        .attr("d", "M0,-2L4,0L0,2");

    DisplayArrows();
}

function DisplayArrows(): void {
    arrows.style("fill", function () {
        return (isDirected) ? "" : "#ffffff00";
    });
}

//Enable or disable the forces
function FreezeGraph(): void {
    is_frozen = !is_frozen;

    graphJSON.nodes.forEach(function (d) {
        d.fixed = is_frozen;
    });
}

function ManageLoops(): void {
    // Loops
    loops = svg.selectAll(".loop")
        .data(graphJSON.loops);

    loops.enter().append("circle")
        .attr("class", "loop")
        .attr("r", function (d) {
            return d.curve;
        })
        .on("mouseover", function (currentData) {
            currentObject = new ElementCustom(currentData, GraphType.LoopType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .on("dblclick", function (currentData) {
            SelectElement(new ElementCustom(currentData, GraphType.LoopType));
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshLoops();
    ManageLoopLabels();

    loops.exit().remove();
};

function RefreshLoops(): void {
    loops.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : d.color;
    });
}

function ManageLoopLabels(): void {
    l_labels = svg.selectAll(".l_label")
        .data(graphJSON.loops);

    l_labels.enter()
        .append("svg:text")
        .attr("class", "l_label")
        .attr("text-anchor", "middle");

    l_labels.exit().remove();

    RefreshLoopLabels();
}

function RefreshLoopLabels(): void {
    l_labels.text(function (d) {
        let text = "";
        if (d.name != "None" && d.name != "") {
            text = d.name;
        }
        return text;
    });
}



function ManageEdges(): void {
    // Edges
    links = svg.selectAll(".link")
        .data(force.links());

    links.enter().append("path")
        .attr("class", "link directed")
        .attr("marker-end", "url(#directed)")
        .on("mouseover", function (currentData) {
            currentObject = new ElementCustom(currentData, GraphType.EdgeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .on("dblclick", function (currentData) {
            SelectElement(new ElementCustom(currentData, GraphType.EdgeType));
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshEdge();

    links.exit().remove();

    ManageEdgeLabels();
}

function RefreshEdge(): void {
    links.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : customColorScale(d.group);
    });
}

function ManageEdgeLabels(): void {
    e_labels = svg.selectAll(".e_label")
        .data(force.links());

    e_labels.enter()
        .append("svg:text")
        .attr("class", "e_label")
        .attr("text-anchor", "middle");

    e_labels.exit().remove();

    RefreshEdgeLabels();
}


function RefreshEdgeLabels(): void {
    e_labels.text(function (d) {
        let text = "";
        let hasName = d.name != "None" && d.name != "";

        if (hasName) {
            text += d.name;
        }
        return text;
    });
}

function ManageNodeLabels(): void {
    // Vertex labels
    v_labels = svg.selectAll(".v_label")
        .data(graphJSON.nodes)

    v_labels.enter()
        .append("svg:text")
        .attr("class", "v_label")
        .attr("vertical-align", "middle")

    v_labels.exit().remove();

    RefreshNodeLabels();
}

function RefreshNodeLabels(): void {
    v_labels.text(function (d) {
        let text = "";
        if (d.name != "") {
            text += d.name;
        }
        return text;
    });
}

//Assure that all the current data correspond to a node
function ManageNodes(): void {
    // Defines nodes elements
    nodes = svg.selectAll(".node")
        .data(graphJSON.nodes)

    //Define what happend a data is added
    nodes.enter().append("circle")
        .attr("class", "node")
        .attr("r", graphJSON.vertex_size)
        .on("mouseover", function (currentData) {
            currentObject = new ElementCustom(currentData, GraphType.NodeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .on("dblclick", function (currentData) {
            SelectElement(new ElementCustom(currentData, GraphType.NodeType));
        })
        .call(force.drag()
            .on('dragstart', function (d) {
                drag_in_progress = true;
                d.previousPos = [d.x, d.y];
            })
            .on('dragend', function (d) {
                drag_in_progress = false;

                if (d.previousPos[0] != d.x && d.previousPos[1] != d.y) {
                    let finalPos = [d.x, d.y];
                    var positions = new ValueRegisterer(d.previousPos, finalPos, new ElementCustom(d, GraphType.NodeType));
                    MyManager.Execute(new MoveNodeCommand(positions));
                    UpdateGraphProperties("Node's positions changed");
                }

            }));

    RefreshNodes();

    //Defines what happend when a data is removed
    nodes.exit().remove();
}

function SetNewPosition(registeredPos: ValueRegisterer): void {
    SetNodePosition(registeredPos.newValue, registeredPos.element);
}

function SetNodePosition(Pos, nodeData): void {
    let currrentNode = FindElementInGraph(nodeData);
    force.stop();
    currrentNode.px = Pos[0];
    currrentNode.py = Pos[1];
    force.start();
}

function SetOldPosition(registeredPos: ValueRegisterer): void {
    SetNodePosition(registeredPos.oldValue, registeredPos.element);;
}

function RefreshNodes(): void {
    nodes.attr("name", function (d) {
        return d.name;
    })
        .attr("fill", function (d) {
            return customColorScale(groupList.indexOf(d.group));
        });

    RefreshNodeOutline();
}

function RefreshNodeOutline(): void {
    nodes.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : "white";
    })
        .style("stroke-width", function (d) {
            return (d.isSelected == true) ? "3" : "2";
        })
}

function SelectElement(element: ElementCustom): void {
    element.data.isSelected = (element.data.isSelected == true) ? false : true;
    switch (element.type) {
        case GraphType.NodeType:
            RefreshNodes();
            break;
        case GraphType.EdgeType:
            RefreshEdge();
            break;
        case GraphType.LoopType:
            RefreshLoops();
            break;
    }
}

function GetCurrentSelection(allowEmpty = false): GraphSelection | null {
    var currentSelection: GraphSelection = new GraphSelection([], [], []);

    let nodes = graphJSON.nodes.filter(function (currentNode) {
        return currentNode.isSelected == true;
    });
    nodes.forEach(element => {
        currentSelection.nodes.push(new ElementCustom(element, GraphType.NodeType))
    });


    let edges = graphJSON.links.filter(function (currentLink) {
        return currentLink.isSelected == true;
    });
    edges.forEach(element => {
        currentSelection.edges.push(new ElementCustom(element, GraphType.EdgeType))
    });

    let loops = graphJSON.loops.filter(function (currentLoop) {
        return currentLoop.isSelected == true;
    });
    loops.forEach(element => {
        currentSelection.loops.push(new ElementCustom(element, GraphType.LoopType))
    });

    //Null check
    if (!allowEmpty && nodes.length == 0 && edges.length == 0 && loops.length == 0) {
        CustomWarn("Nothing Selected");
        return null;
    } else {
        return currentSelection;
    }
}

function AddNode(newNode): boolean {
    //Add it to the data
    graphJSON.nodes.push(newNode);

    //Apply nodes rules to the data
    ManageNodes();
    ManageNodeLabels();

    //Restart the force layout with the new elements
    force.start();

    return true;
}

// TODO : Node
function CreateNode(pos: Point = null) {
    var newX: number;
    var newY: number;
    if (pos != null) {
        newX = pos.x;
        newY = pos.y;
    } else {
        newX = cursorPosition.x;
        newY = cursorPosition.y;
    }

    var newNode = {
        group: "0",
        name: FindLowestIDAvailable(),
        x: newX,
        y: newY,
        fixed: is_frozen
    };

    return newNode;
}

function FindLowestIDAvailable(): string {
    let lowestID = Infinity;
    let i = 0;
    while (lowestID == Infinity) {
        if (graphJSON.nodes.find(node => node.name == i) != undefined) {
            i++;
        }
        else {
            lowestID = i;
        }
    }
    return lowestID.toString(10);
}

//Add loop on a node
function AddLoopOnNode(node, isFirst = true): void {
    var newLoop = CreateLoop(node);
    MyManager.Execute(new AddLoopCommand(newLoop, isFirst));
}

//Add loop on all selected nodes
function AddLoopOnSelection(): boolean {
    if (GetCurrentSelection()) {
        let selectedNodes: ElementCustom[] = GetCurrentSelection().nodes;
        if (selectedNodes.length > 0) {
            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                AddLoopOnNode(selectedNodes[i].data, isFirst);
                isFirst = false;
            }
            return true;
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }
    }
    return false;
}


//Set Group for all Selected Nodes
function SetGroupOfSelection(): boolean {
    if (GetCurrentSelection()) {
        let selectedNodes: ElementCustom[] = GetCurrentSelection().nodes;
        let isFirst = true;

        if (selectedNodes.length > 0) {
            for (let i = 0; i < selectedNodes.length; i++) {
                if (selectedNodes[i].data.group != groupList[currentGroupIndex]) {
                    let vr = new ValueRegisterer(selectedNodes[i].data.group, groupList[currentGroupIndex], selectedNodes[i]);
                    MyManager.Execute(new ChangeGroupCommand(vr, isFirst));
                    isFirst = false;
                }
            }
            return true;
        } else {
            CustomWarn("No nodes selected");
        }
        return false;
    }
}

//Add edges between all selected nodes
function AddEdgesOnSelection(): boolean {
    if (GetCurrentSelection()) {
        let selectedNodes = GetCurrentSelection().nodes;

        let isFirst = true;
        if (selectedNodes.length > 0) {
            let j;
            for (let i = 0; i < selectedNodes.length; i++) {
                j = i + 1;
                for (; j < selectedNodes.length; j++) {
                    var newLink = CreateEdge(selectedNodes[i].data, selectedNodes[j].data);
                    MyManager.Execute(new AddEdgeCommand(newLink, isFirst));
                    isFirst = false;
                }
            }
            return true;
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }

        return false;
    }
}

function AddEdge(newEdge): void {
    graphJSON.links.push(newEdge);
    ManageEdges();
    PlaceBeforeNode("link");
    force.start();
}

// TODO Edge
function CreateEdge(src, dest) {
    let selected = src.isSelected && dest.isSelected;
    var link = {
        "strength": 0,
        "target": dest,
        "color": "#aaa",
        "curve": 0,
        "source": src,
        "name": "",
        "isSelected": selected,
    }

    return link;
}

function AddLoop(newLoop): void {
    graphJSON.loops.push(newLoop);
    ManageLoops();
    PlaceBeforeNode("loop");
    force.start();
}

function PlaceBeforeNode(className: string): void {

    let elements: HTMLCollectionOf<Element> = document.getElementsByClassName(className);
    let elem = elements[elements.length - 1];

    let firstNode = document.getElementsByClassName("node")[0];
    firstNode.parentNode.insertBefore(elem, firstNode);
}

function CreateLoop(src) {
    let selected = src.isSelected;
    var loop = {
        "strength": 0,
        "target": src,
        "color": "#aaa",
        "curve": 20,
        "source": src,
        "name": "",
        "isSelected": selected,
    }

    return loop;
}

function RemoveElementFromGraph(element: ElementCustom, _isFirst = true): void {
    switch (element.type) {
        case GraphType.NodeType:
            let isFirst = _isFirst;
            GetEdgesByVertex(element.data).forEach(edge => {
                MyManager.Execute(new SupprEdgeCommand(edge, isFirst));
                isFirst = false;
            });

            GetLoopsByVertex(element.data).forEach(loop => {
                MyManager.Execute(new SupprLoopCommand(loop, false));
            });

            MyManager.Execute(new SupprNodeCommand(element.data, false));
            break;
        case GraphType.EdgeType:
            if (graphJSON.links.indexOf(element.data) != -1) {
                MyManager.Execute(new SupprEdgeCommand(element.data, _isFirst));
            }
            break;
        case GraphType.LoopType:
            if (graphJSON.loops.indexOf(element.data) != -1) {
                MyManager.Execute(new SupprLoopCommand(element.data, _isFirst));
                break;
            }


    }
}

function AddNewNode(): boolean {
    var newNode = CreateNode();
    MyManager.Execute(new AddNodeCommand(newNode));
    return true;
}

function RemoveSelection(): boolean {
    let currentSelection = GetCurrentSelection();
    let isFirst = true;

    if (currentSelection != null) {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                RemoveElementFromGraph(element, isFirst)
                isFirst = false;
            });
        });


        ManageLoops();
        ManageEdges();
        ManageNodes();


        return true;
    }
    else {
        CustomWarn("Nothing to delete");
    }
    return false;
}

function RemoveEdge(edgeData): void {
    let index = graphJSON.links.indexOf(edgeData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.links.splice(index, 1);
        ManageEdges();
        force.start();
    }
}

function RemoveLoop(loopData): void {
    let index = graphJSON.loops.indexOf(loopData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.loops.splice(graphJSON.loops.indexOf(loopData), 1);
        ManageLoops();
        force.start();
    }
}

//Find Edges bound to a Vertex
function GetEdgesByVertex(currentNode) {
    return graphJSON.links.filter(
        function (current) {
            return current.source == currentNode ||
                current.target == currentNode
        });
}

//Find Loops bound to a Vertex
function GetLoopsByVertex(currentNode) {
    return graphJSON.loops.filter(
        function (current) {
            return current.source == currentNode;
        });
}

//Remove a node, his name and the links bound to it
function RemoveNode(nodeData): void {
    graphJSON.nodes.splice(graphJSON.nodes.indexOf(nodeData), 1);
    ManageNodes();
    ManageNodeLabels();
    force.start();
}

function SubdivideEdge(edge, isFirst = true): void {
    let pos = third_point_of_curved_edge(edge.source, edge.target, 0);
    let newNode = CreateNode(pos);

    MyManager.Execute(new AddNodeCommand(newNode, isFirst));
    MyManager.Execute(new AddEdgeCommand(CreateEdge(newNode, edge.source), false));
    MyManager.Execute(new AddEdgeCommand(CreateEdge(newNode, edge.target), false));
    MyManager.Execute(new SupprEdgeCommand(edge, false));
}

function SubdivideEdgeOnSelection(): boolean {
    if (GetCurrentSelection()) {
        let edges: ElementCustom[] = GetCurrentSelection().edges;
        if (edges.length > 0) {
            let isFirst = true;
            edges.forEach(edge => {
                SubdivideEdge(edge.data, isFirst);
                isFirst = false;
            });
            return true;
        } else {
            CustomWarn("No edges to subdivide");
        }
        return false;
    }
}

function InvertEdgesOnSelection(): boolean {
    if (GetCurrentSelection()) {
        let edges: ElementCustom[] = GetCurrentSelection().edges;
        if (edges.length > 0) {
            let isFirst = true;
            edges.forEach(edge => {
                InvertEdge(edge, isFirst);
                isFirst = false;
            });
            return true;
        } else {
            CustomWarn("No edges to invert");
        }
        return false;
    }
}

function InvertEdge(edge: ElementCustom, isFirst = true): void {
    let vr = new ValueRegisterer([edge.data.source, edge.data.target], [edge.data.target, edge.data.source], edge);
    MyManager.Execute(new InvertDirectionCommand(vr, isFirst));
}


function WaitGraphLoadToFreeze(waitingTime: number): void {
    setTimeout(function () {
        FreezeGraph();
    }, waitingTime);
}

function PrettifyJSON(): string {
    var prettyJSON = JSON.parse(JSON.stringify(graphJSON));

    prettyJSON.links.forEach(link => {
        link.source = link.source.name;
        link.target = link.target.name;
    });

    prettyJSON.loops.forEach(loop => {
        loop.source = loop.target = loop.source.name;
    });

    //Return the Y to correspond with Sage Plan
    prettyJSON.nodes.forEach(node => {
        node.y = -node.y;
    });

    //Shrink graph to adapt to the scale of SageMath Show() method
    prettyJSON.nodes.forEach(function (node) {
        node.x = node.x / 100;
        node.y = node.y / 100;
    });

    return JSON.stringify(prettyJSON);
}

function SetGroupElement(valueRegisterer: ValueRegisterer): void {
    let element = FindElementInGraph(valueRegisterer.element);
    element.group = (element.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
    RefreshNodes();
}

//Change the name of an element
function SetElementName(valueRegisterer: ValueRegisterer): void {
    let element = FindElementInGraph(valueRegisterer.element);
    element.name = (element.name == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;

    switch (valueRegisterer.element.type) {
        case GraphType.EdgeType:
            RefreshEdgeLabels();
            break;
        case GraphType.LoopType:
            RefreshLoopLabels();
            break;
        case GraphType.NodeType:
            RefreshNodeLabels();
            break;
    }
}

//Change the direction of a directedLink
function SetLinkDirection(valueRegisterer: ValueRegisterer): void {
    let link = FindElementInGraph(valueRegisterer.element);
    let targetedValue = (link.source == valueRegisterer.newValue[0]) ? valueRegisterer.oldValue : valueRegisterer.newValue;

    link.source = targetedValue[0];
    link.target = targetedValue[1];

    force.start();
}

function FindElementInGraph(element: ElementCustom) {
    let list;
    switch (element.type) {
        case GraphType.NodeType:
            list = graphJSON.nodes;
            break;
        case GraphType.EdgeType:
            list = graphJSON.links;
            break;
        case GraphType.LoopType:
            list = graphJSON.loops;
            break;
    }
    return list[list.indexOf(element.data)];
}


function UpdateGraphProperties(message = ""): void {
    SubmitMessage(propertiesRequestParameter, message = message);
}

function SetNodesColoration(colorationList): void {
    var id = 0;
    colorationList.forEach(coloration => {
        coloration.forEach(name => {
            const node = graphJSON.nodes.find(function (node) {
                return node.name == name;
            });
            SetGroupElement(new ValueRegisterer(id, id, new ElementCustom(node, GraphType.NodeType)));
        });
        id++;
    });

    FillGroupFromGraph(graphJSON);
    PopulateGroupList();
    ManageNodes();
}


function SetLinksColoration(colorationList): void {
    var id = 0;
    colorationList.forEach(coloration => {
        coloration.forEach(tuple => {
            const link = graphJSON.links.find(function (link) {
                return link.source.name == tuple[0] && link.target.name == tuple[1];
            });
            SetGroupElement(new ValueRegisterer(id, id, new ElementCustom(link, GraphType.EdgeType)));
        });
        id++;
    });

    ManageEdges();
}
