const UPDATE_RATE = 10;
var ROWS = 60;
var COLUMNS = 114;
const CELL_SIZE = 10
const RADIUS = 3
const NEIGHBOUR_KERNEL = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
]
//const resetInterval = 25000;
var GRID_COLOR = "#ddd";
var CIRCLE_COLOR = "#ddd";

var canvas;
var context;
var updateIntervalId = -1;
var resetIntervalId = -1;

var grid = [];
var rules = [
    ruleDieBySolitude,
    ruleDieByOverpopulation,
    rulePopulate
];

$(document).ready(function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    resize();
    //initialize();
    updateIntervalId = setInterval(update, 1000 / UPDATE_RATE);
    //resetIntervalId = setInterval(reset, resetInterval);

    $(window).resize(function() {
        resize();
    });
});

function resize() {
    let width = $("#canvas").parent().width();
    if (width != $("#canvas").attr("width")) {
        let height = width * 0.5;
        ROWS = height / CELL_SIZE;
        COLUMNS = width / CELL_SIZE;
        $("#canvas").attr("width", width);
        $("#canvas").attr("height", height);

        initialize();
    }
}


// INITIALIZE
function initialize() {
    // Initialize grid
    initializeGrid();

    //...
    populateGrid(.4)
}


function initializeGrid() {
    grid = [];
    for (var row = 0; row < ROWS; row++) {
        grid.push([])
        for (var column = 0; column < COLUMNS; column++) {
            grid[row].push(0);
        }
    }
}


function populateGrid(popuplateChance = 0.5) {
    // TODO: Clamp 'popuplateChance' between 0 and 1...
    for (var row = 0; row < ROWS; row++) {
        for (var column = 0; column < COLUMNS; column++) {
            if (Math.random() < popuplateChance) {
                grid[row][column] = 1;
            }
        }
    }
}


// UPDATE
function update() {
    updateGrid();
    context.clearRect(0, 0, canvas.width, canvas.height);
    //drawGrid();
    drawGridContent();
}


// RESET
function reset() {
    initialize();
}


function updateGrid() {
    var changes = []
    // Run through the rules for each cell
    for (var row = 0; row < ROWS; row++) {
        for (var column = 0; column < COLUMNS; column++) {
            rules.forEach(function(item, index, array) {
                item(row, column, changes);
            });
        }
    }
    // Apply changes to cells
    changes.forEach(function(item, index, array){
        grid[item["row"]][item["column"]] = item["value"];
    });
}


// RENDER
function drawGrid() {
    context.strokeStyle = GRID_COLOR;
    // Vertical lines
    for (var i = 1; i < COLUMNS; i++) {
        context.beginPath();
        context.moveTo(i * CELL_SIZE, 0);
        context.lineTo(i * CELL_SIZE, 600);
        context.stroke();
    }
    // Horizontal lines
    for (var i = 1; i < ROWS; i++) {
        context.beginPath();
        context.moveTo(0, i * CELL_SIZE);
        context.lineTo(1920, i * CELL_SIZE);
        context.stroke();
    }
}


function drawGridContent() {
    for (var row = 0; row < ROWS; row++) {
        for (var column = 0; column < COLUMNS; column++) {
            if (grid[row][column] == 1) {
                drawCircle(column * CELL_SIZE + CELL_SIZE * 0.5, row * CELL_SIZE + CELL_SIZE * 0.5);
            }
        }
    }
}


function drawCircle(x, y) {
    context.fillStyle = CIRCLE_COLOR;
    context.beginPath()
    context.arc(x, y, RADIUS, 0, 2 * Math.PI);
    context.fill();
}



// HELPER FUNCTIONS
function getNeighbourCount(row, column) {
    var neighbourCount = 0
    NEIGHBOUR_KERNEL.forEach(function(item, index, array){
        if (isInGrid(row + item[0], column + item[1])) {
            if (grid[row + item[0]][column + item[1]] == 1) {
                neighbourCount += 1;
            }
        }
    });
    return neighbourCount;
}

function isInGrid(row, column) {
    return 0 <= row && row < ROWS && 0 <= column && column < COLUMNS;
}


// RULES
/*
Rules:
    - For each space that is "populated":
        - Each cell with 0 or 1 neighbours dies, as if by solitude
        - Each cell with 2 or 3 neighbours survives
        - Each cell with 4 or more neighbours dies, as if by overpopulation
    - For each space that is "empty" or "unpopulated":
        - Each cell with 3 neighbours becomes populated
*/

// Each cell with 0 or 1 neighbours dies, as if by solitude
function ruleDieBySolitude(row, column, changes) {
    if (grid[row][column] == 1) {
        var neighbours = getNeighbourCount(row, column);
        if (neighbours < 2) {
            //grid[row][column] = 0
            changes.push({"row": row, "column": column, "value": 0})
        }
    }
}


// Each cell with 4 or more neighbours dies, as if by overpopulation
function ruleDieByOverpopulation(row, column, changes) {
    if (grid[row][column] == 1) {
        var neighbours = getNeighbourCount(row, column);
        if (neighbours >= 4) {
            //grid[row][column] = 0
            changes.push({"row": row, "column": column, "value": 0})
        }
    }
}


// Each cell with 3 neighbours becomes populated
function rulePopulate(row, column, changes) {
    if (grid[row][column] == 0) {
        var neighbours = getNeighbourCount(row, column);
        if (neighbours == 3) {
            //grid[row][column] = 1
            changes.push({"row": row, "column": column, "value": 1})
        }
    }
}