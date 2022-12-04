import { Actions } from "./models/Actions";
import { SquareColor } from "./models/Colors";
import { Piece } from "./models/Piece";
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
let selectedSquare: Square | undefined;
let pieceTurn: PieceType = PieceType.light;
const lightPieces: Piece[] = [];
const darkPieces: Piece[] = [];

const intitializeGrid = (): Square[][] => {
    const tempGrid: Square[][] = [];
    for (let i = 0; i <= gridDefinition.length - 1; i++) {
        const row = gridDefinition[i];
        const squareRow: Square[] = [];
        for (let j = 0; j <= row.length - 1; j++) {
            const item = row[j];
            const square: Square = new Square(item, i * squareSize, j * squareSize, new Path2D(), j, i);
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fillStyle = item === SquareType.dark ? SquareColor.dark : SquareColor.light;
            ctx.fill(square.path);
            squareRow.push(square);

            if (item === SquareType.dark) {
                if (i <= 2) {
                    const darkPiece = new Piece(PieceType.dark, j, i, squareSize, pieceRadius, ctx);
                    darkPiece.draw();
                    darkPieces.push(darkPiece);
                }
                if (i >= 5) { 
                    const lightPiece = new Piece(PieceType.light, j, i, squareSize, pieceRadius, ctx);
                    lightPiece.draw();
                    lightPieces.push(lightPiece);
                }
            }
        }
        tempGrid.push(squareRow);
    }
    return tempGrid;
}

const gridImplemention: Square[][] = intitializeGrid();


const drawPieces = () => {
    lightPieces.forEach(x => x.draw());
    darkPieces.forEach(x => x.draw());
}

const allPieces = (): Piece[] => {
    return [...lightPieces, ...darkPieces];
}

const getAllSquaresFlat = (): Square[] => {
    const tempArray: Square[] = [];
    for (let i = 0; i <= gridDefinition.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            tempArray.push(row[j])
        }
    }
    return tempArray;
}

const allSquaresFlat: Square[] = getAllSquaresFlat();

const clearActions = () => {
    allSquaresFlat.forEach(x => x.applyAction(Actions.none));
}

const findPieceByIndex = (xIndex: number, yIndex: number): Piece | undefined => {
    const p = allPieces();
    console.log(p);
    return allPieces().find(piece => piece.xIndex === xIndex && piece.yindex === yIndex);
}

const getPieceFromSquare = (square: Square): Piece | undefined => {
    return findPieceByIndex(square.xIndex, square.yIndex);
}

const getSquareFromPiece = (piece: Piece): Square | undefined => {
    return allSquaresFlat.find(square => square.xIndex == piece.xIndex && square.yIndex == piece.yindex);
}

const drawGrid = () => {
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const square = row[j];
            ctx.fillStyle = square.color;
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fill(square.path);
        }
    }
}

const draw = () => {
    drawGrid();
    drawPieces();
}

const switchPieceTurn = () => {
    if (pieceTurn == PieceType.dark) {
        pieceTurn = PieceType.light;
    } else {
        pieceTurn = PieceType.dark;
    }
}

const checkKingStatus = (piece: Piece) => {
    if (piece && piece.isKing) return;

    const kingIndexLocation = piece.type == PieceType.dark ? gridDefinition.length - 1 : 0;

    if (piece.yindex == kingIndexLocation) {
        piece.isKing = true;
    }
}

const pieceMovementLogic = (piece: Piece, currentSquare: Square) => {
    if (!piece) return;
    if (!selectedSquare) return;

    const squareToRightIndex = selectedSquare.xIndex + 1;
    const squareToLeftIndex = selectedSquare.xIndex - 1;
    const squareToSecondRightIndex = selectedSquare.xIndex + 2;
    const squareToSecondLeftIndex = selectedSquare.xIndex - 2;
    const squareToCheckYIndex = piece.type == PieceType.dark ? selectedSquare.yIndex + 1 : selectedSquare.yIndex - 1;

    // Dark pieces will check y greater than their own
    // Light Pieces will check y values less that their own
    // TODO King logic will require pieces to move in either direction.
    // TODO Switch to drawings or just put K on the piece?
    if (piece.type == PieceType.dark ? currentSquare.yIndex > selectedSquare.yIndex : currentSquare.yIndex < selectedSquare.yIndex) {
        // movement logic 
        if (currentSquare.xIndex == squareToRightIndex || currentSquare.xIndex == squareToLeftIndex) {
            selectedSquare = currentSquare;
            piece.move(currentSquare.xIndex, currentSquare.yIndex);
            checkKingStatus(piece);
            draw();
            switchPieceTurn();
            // jump logic
        } else if (currentSquare.xIndex == squareToSecondRightIndex || currentSquare.xIndex == squareToSecondLeftIndex) {
            const squareToJump = currentSquare.xIndex == squareToSecondRightIndex ? squareToRightIndex : squareToLeftIndex;
            const pieceToJump = findPieceByIndex(squareToJump, squareToCheckYIndex);
            if (pieceToJump && piece.type != pieceToJump.type) {
                selectedSquare = currentSquare;
                piece.move(currentSquare.xIndex, currentSquare.yIndex);
                checkKingStatus(piece)
                if (pieceToJump.isDark()) {
                    const index = darkPieces.indexOf(pieceToJump);
                    darkPieces.splice(index, 1);
                } else if (pieceToJump.isLight()) {
                    const index = lightPieces.indexOf(pieceToJump);
                    lightPieces.splice(index, 1);
                }
                draw();
            }
            switchPieceTurn();
        }
    }
}

/* Events */
canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (selectedSquare) return;
    clearActions();
    let currentPiece: Square;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentPiece = row[j];
            if (ctx.isPointInPath(currentPiece.path, event.offsetX, event.offsetY) && currentPiece.hasPiece) {
                currentPiece.applyAction(Actions.hover);
                draw();
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
                clearActions();       
                const piece = getPieceFromSquare(currentSquare);
                if (selectedSquare && getPieceFromSquare(selectedSquare)) {
                    if (piece) {
                        selectedSquare = currentSquare;
                        selectedSquare.applyAction(piece.type == pieceTurn ? Actions.valid : Actions.invalid);
                        draw();
                    } else {
                        const piece: Piece | undefined = getPieceFromSquare(selectedSquare);
                        if (piece && piece.type == pieceTurn) {
                            pieceMovementLogic(piece, currentSquare);
                        }
                    }
                } else if (piece) {
                    console.log(currentSquare);
                    selectedSquare = currentSquare;
                    const piece: Piece | undefined = getPieceFromSquare(currentSquare);
                    selectedSquare.applyAction(piece?.type == pieceTurn ? Actions.valid : Actions.invalid);
                    draw();
                }
            }
        }
    }
})







