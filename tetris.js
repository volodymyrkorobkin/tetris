/**
 * TETRIS
 *
 */

/** @type {HTMLCanvasElement} */
const tetrisSpeelveld = document.getElementById("tetris-speelveld");

/** @type {CanvasRenderingContext2D} */
const tetrisContext = tetrisSpeelveld.getContext("2d");


tetrisContext.lineWidth = 2;
tetrisContext.fillStyle = "brown";
tetrisContext.strokeStyle = "black";

const IShape = {
    blocks: [{x: -1,y: 0},
            {x: 0,y: 0},
            {x: 1,y: 0},
            {x: 2,y: 0}],
    rotationCenter: {x: 1, y: 1},
    color: "red"
};
const OShape = {
    blocks: [{x: 0,y: 0},
            {x: 0,y: 1},
            {x: 1,y: 1},
            {x: 1,y: 0}],
    rotationCenter: {x: 1, y: 1},
    color: "yellow"
};
const LShape = {
    blocks: [{x: -1,y: 1},
            {x: -1,y: 0},
            {x: 0,y: 0},
            {x: 1,y: 0}],
    rotationCenter: {x: 0.5, y: 0.5},
    color: "orange"
};
const JShape = {
    blocks: [{x: -1,y: 0},
            {x: 0,y: 0},
            {x: 1,y: 0},
            {x: 1,y: 1}],
    rotationCenter: {x: 0.5, y: 0.5},
    color: "blue"
};
const SShape = {
    blocks: [{x: -1,y: 0},
            {x: 0,y: 0},
            {x: 0,y: 1},
            {x: 1,y: 1}],
    rotationCenter: {x: 0.5, y: 1.5},
    color: "purple"
};
const ZShape = {
    blocks: [{x: -1,y: 1},
            {x: 0,y: 1},
            {x: 0,y: 0},
            {x: 1,y: 0}],
    rotationCenter: {x: 0.5, y: 1.5},
    color: "green"
};
const TShape = {
    blocks: [{x: -1,y: 0},
            {x: 0,y: 0},
            {x: 1,y: 0},
            {x: 0,y: 1}],
    rotationCenter: {x: 0.5, y: 0.5},
    color: "lightblue"
};

let possibleShapes = [IShape, OShape, LShape, JShape, SShape, ZShape, TShape];
let board = [];
let activeShape;

let gameOwer = false;

function drawShape(shape) {
    tetrisContext.fillStyle = shape.color;
    for (let block of shape.blocks) {
        drawBlock(shape.x + block.x, shape.y + block.y);
    }
}

function rotateShape(shape){
    for (let key in shape.blocks) {
        let x = shape.blocks[key].x + 0.5;
        let y = shape.blocks[key].y + 0.5;

        let relativeX = x - shape.rotationCenter.x;
        let relativeY = y - shape.rotationCenter.y;

        let x2 = -relativeY;
        let y2 = relativeX;

        shape.blocks[key].x = x2 + shape.rotationCenter.x - 0.5;
        shape.blocks[key].y = y2 + shape.rotationCenter.y - 0.5;
    }
}

function initBoard() {
    for (let y = 0; y < 20; y++){
        board[y] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

function drawBlock(x, y) {
    tetrisContext.fillRect(x * 40, y * 40, 40, 40);
    tetrisContext.strokeRect(x * 40, y * 40, 40, 40);
}

// Check if the shape is colliding with something
function isColision() {
    for (let block of activeShape.blocks) {
        let absoluteBlockPos = {x: activeShape.x + block.x, y: activeShape.y + block.y};
        // Check if the block is outside the grid
        if (absoluteBlockPos.x < 0 || absoluteBlockPos.x > 9) {
            return true;
        }
        if (absoluteBlockPos.y < 0 || absoluteBlockPos.y > 19) {
            return true;
        }

        // Check if the block is on top of another block
        if (board[absoluteBlockPos.y][absoluteBlockPos.x] != 0) {
            return true;
        }
    }
    return false;
}
// Try to move the shape, if it can't cancel the move
function tryToMove(x, y, placeIfColision = false) {
    activeShape.x += x;
    activeShape.y += y;
    if (isColision()){
        activeShape.x -= x;
        activeShape.y -= y;
         
        if (placeIfColision) {
            placeShape();
        }
    }
}


function placeShape() {

    for (block of activeShape.blocks) {
        let absoluteBlockPos = {x: activeShape.x + block.x, y: activeShape.y + block.y};
        board[absoluteBlockPos.y][absoluteBlockPos.x] = {color: activeShape.color};
    }
    checkAndRemoveFullRows();
    initNewActiveShape();
}
function initNewActiveShape(){
    activeShape = JSON.parse(JSON.stringify(possibleShapes[Math.floor(Math.random() * possibleShapes.length)]));
    activeShape.x = 4;
    activeShape.y = 0;
    if (isColision()) {
        gameOwer = true;
    }
}


function checkAndRemoveFullRows() {
    for (y in board) {
        let rowIsFull = true;
        for (x in board[y]) {
            if (board[y][x] == 0) {
                rowIsFull = false;
                break;
            }
        }
        if (rowIsFull) {
            board.splice(y, 1);
            board.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
    }
}

let gameTick = 0;
function update() {
    // Clear the screen
    tetrisContext.fillStyle = "white";
    tetrisContext.fillRect(0, 0, 400, 800);

    // Move down every 50 ticks
    if (gameTick % 50 == 25 && !gameOwer) {
        // Move down
        tryToMove(0, 1, true);
    }

    // Draw all the blocks
    drawShape(activeShape);
    for (y in board){
        for (x in board[y]){
            if (board[y][x] != 0) {
                tetrisContext.fillStyle = board[y][x].color;
                drawBlock(x, y);
            }
        }
    }

    gameTick++;
}


/**
 *
 * @param {KeyboardEvent} event
 * 
 */
function moveShape(event) {
    if (gameOwer) {
        switch (event.code) {
            case "Space":
                gameOwer = false;
                initBoard();
                initNewActiveShape();
                return;
        }
        alert("Game over press space to restart");
        return;
    }
    switch (event.code) {
        case "KeyA":
        case "ArrowLeft":
            // Handle left move
            tryToMove(-1, 0);
            break;

        case "KeyS":
        case "ArrowDown":
            // Handle down move
            tryToMove(0, 1, true);
            break;

        case "KeyD":
        case "ArrowRight":
            // Handle right move
            tryToMove(1, 0);
            break;

        case "KeyW":
        case "ArrowUp":
        case "Space":
            // Handle rotate
            rotateShape(activeShape);
            if (isColision()){
                for (let i = 0; i < 3; i++) {
                    rotateShape(activeShape);
                }
            }
            break;
    }
}

document.addEventListener('keydown', moveShape);

initBoard();
initNewActiveShape();
setInterval(update, 10);


