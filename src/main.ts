import { PieceType } from "./models/PieceType";
import { Square } from "./models/Square";
import { SquareType } from "./models/SquareType";

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

const gridDefinition: number[][] = [
   /*1*/[0, 1, 0, 1, 0, 1, 0, 1],
   /*2*/[1, 0, 1, 0, 1, 0, 1, 0],
   /*3*/[0, 1, 0, 1, 0, 1, 0, 1],
   /*4*/[1, 0, 1, 0, 1, 0, 1, 0],
   /*5*/[0, 1, 0, 1, 0, 1, 0, 1],
   /*6*/[1, 0, 1, 0, 1, 0, 1, 0],
   /*7*/[0, 1, 0, 1, 0, 1, 0, 1],
   /*8*/[1, 0, 1, 0, 1, 0, 1, 0],
]

const squareSize = 75;
const pieceRadius = (squareSize - 20) / 2;
const darkSquareColor = 'brown';
const lightSquareColor = 'tan';
const darkPieceColor = 'black';
const lightPieceColor = 'white';
let selectedSquare: Square | undefined;
let pieceTurn: PieceType = PieceType.light;

const drawPiece = (i: number, j: number, color: string) => {
    ctx.beginPath();
    const xLocation = j === 0 ? squareSize / 2 : squareSize * j + squareSize / 2;
    const yLocation = i === 0 ? squareSize / 2 : squareSize * i + squareSize / 2;
    ctx.arc(xLocation, yLocation, pieceRadius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

const intitializeGrid = (): Square[][] => {
    const tempGrid: Square[][] = [];
    for (let i = 0; i <= gridDefinition.length - 1; i++) {
        const row = gridDefinition[i];
        const squareRow: Square[] = [];
        for (let j = 0; j <= row.length - 1; j++) {
            const item = row[j];
            const square: Square = { type: item, xLocation: i * squareSize, yLocation: j * squareSize, hasPiece: false, path: new Path2D(), xIndex: j, yIndex: i, pieceType: PieceType.unkown };
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fillStyle = item === SquareType.dark ? darkSquareColor : lightSquareColor;
            ctx.fill(square.path);
            squareRow.push(square);

            if (item === SquareType.dark) {
                if (i <= 2) {
                    square.hasPiece = true;
                    square.pieceType = PieceType.dark;
                    drawPiece(i, j, darkPieceColor);
                }
                if (i >= 5) {
                    square.hasPiece = true;
                    square.pieceType = PieceType.light;
                    drawPiece(i, j, lightPieceColor);
                }
            }
        }
        tempGrid.push(squareRow);
    }
    return tempGrid;
}

const gridImplemention: Square[][] = intitializeGrid();

const drawGrid = (xIndex: number, yIndex: number, color?: string) => {
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const item = gridDefinition[i][j];
            const square = row[j];
            ctx.fillStyle = item === SquareType.dark ? darkSquareColor : lightSquareColor;
            if (i == yIndex && j == xIndex && color) {
                ctx.fillStyle = color;
            }
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fill(square.path);

            if (square.hasPiece) {
                drawPiece(i, j, square.pieceType == PieceType.light ? lightPieceColor : darkPieceColor);
            }
        }
    }
}

const switchPieceTurn = () => {
    if (pieceTurn == PieceType.dark) {
        pieceTurn = PieceType.light;
    } else {
        pieceTurn = PieceType.dark;
    }
} 

const pieceMovementLogic = (pieceType: PieceType, currentSquare: Square, selectedSquare: Square) => {
    const squareToRightIndex = selectedSquare.xIndex + 1;
    const squareToLeftIndex = selectedSquare.xIndex - 1;
    const squareToSecondRightIndex = selectedSquare.xIndex + 2;
    const squareToSecondLeftIndex = selectedSquare.xIndex - 2;
    const squareToCheckYIndex = pieceType == PieceType.dark ? selectedSquare.yIndex + 1: selectedSquare.yIndex - 1;

    // Dark pieces will check y greater than their own
    // Light Pieces will check y values less that their own
    if (pieceType == PieceType.dark ? currentSquare.yIndex > selectedSquare.yIndex : currentSquare.yIndex < selectedSquare.yIndex) {
        // movement logic 
        if (currentSquare.xIndex == squareToRightIndex || currentSquare.xIndex == squareToLeftIndex) {
            currentSquare.hasPiece = true;
            currentSquare.pieceType = selectedSquare.pieceType;
            selectedSquare.hasPiece = false;
            selectedSquare = currentSquare;
            drawGrid(currentSquare.xIndex, currentSquare.yIndex);
            switchPieceTurn();
        // jump logic
        } else if (currentSquare.xIndex == squareToSecondRightIndex || currentSquare.xIndex == squareToSecondLeftIndex) {
            const squareToJump = currentSquare.xIndex == squareToSecondRightIndex ? squareToRightIndex : squareToLeftIndex;
            const itemToCheck = gridImplemention[squareToCheckYIndex][squareToJump];
            if (itemToCheck.hasPiece && itemToCheck.pieceType != pieceType) {
                currentSquare.hasPiece = true;
                currentSquare.pieceType = selectedSquare.pieceType;
                itemToCheck.hasPiece = false;
                selectedSquare.hasPiece = false;
                selectedSquare = currentSquare;
                drawGrid(currentSquare.xIndex, currentSquare.yIndex);
            }
            switchPieceTurn();
        }
    }
}

/* Events */
canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (selectedSquare) return;
    let currentPiece: Square;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentPiece = row[j];

            if (ctx.isPointInPath(currentPiece.path, event.offsetX, event.offsetY) && currentPiece.hasPiece) {

                drawGrid(currentPiece.xIndex, currentPiece.yIndex, 'green');
            }
        }
    }
});


canvas.addEventListener('click', (event: MouseEvent) => {
    let currentSquare: Square;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentSquare = row[j];
            if (ctx.isPointInPath(currentSquare.path, event.offsetX, event.offsetY)) {
                if (selectedSquare && selectedSquare.pieceType == pieceTurn) {
                    if (currentSquare.hasPiece) {
                        selectedSquare = currentSquare;
                        drawGrid(currentSquare.xIndex, currentSquare.yIndex, selectedSquare.pieceType == pieceTurn ? 'green' : 'red');
                    } else {
                        pieceMovementLogic(selectedSquare.pieceType, currentSquare, selectedSquare);        
                    }
                } else if (currentSquare.hasPiece) {
                    console.log(currentSquare);
                    selectedSquare = currentSquare;
                    drawGrid(currentSquare.xIndex, currentSquare.yIndex, selectedSquare.pieceType == pieceTurn ? 'green' : 'red');
                }
            }
        }
    }
})







