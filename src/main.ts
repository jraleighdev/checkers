import { Actions } from "./models/Actions";
import { SquareColor } from "./models/Colors";
import { Piece } from "./models/Piece";
import { PieceType } from "./models/PieceType";
import { Point } from "./models/Point";
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
];

const squareSize = 60;
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
            const square: Square = new Square(item, new Path2D(), { x: j, y: i});
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fillStyle = item === SquareType.dark ? SquareColor.dark : SquareColor.light;
            ctx.fill(square.path);
            squareRow.push(square);

            if (item === SquareType.dark) {
                if (i <= 2) {
                    const darkPiece = new Piece(PieceType.dark, { x:j, y: i}, squareSize, pieceRadius, ctx);
                    darkPiece.draw();
                    darkPieces.push(darkPiece);
                }
                if (i >= 5) { 
                    const lightPiece = new Piece(PieceType.light, { x:j, y: i}, squareSize, pieceRadius, ctx);
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

const findPieceByIndex = (point: Point): Piece | undefined => {
    return allPieces().find(piece => piece.isMatch(point));
}

const getPieceFromSquare = (square: Square | undefined): Piece | undefined => {
    if (!square) return undefined;
    return findPieceByIndex(square.point);
}

const getSquareFromPiece = (piece: Piece | undefined): Square | undefined => {
    if (!piece) return undefined;
    return allSquaresFlat.find(square => square.isMatch(piece.point));
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

    if (piece.point.y == kingIndexLocation) {
        piece.isKing = true;
    }
}

const findMidPoint = (point1: Point, point2: Point): Point => {
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    return { x: midX, y: midY};
}

const pieceMovementLogic = (piece: Piece, currentSquare: Square) => {
    if (!piece) return;
    if (!selectedSquare) return;

    const squareToRightIndex = selectedSquare.point.x + 1;
    const squareToLeftIndex = selectedSquare.point.x - 1;
    const squareToSecondRightIndex = selectedSquare.point.x + 2;
    const squareToSecondLeftIndex = selectedSquare.point.x - 2;
    let squareToCheckYIndex = piece.isDark() ? selectedSquare.point.y + 1 : selectedSquare.point.y - 1; 
    let pieceYCheck = false;
    if (piece.isKing) {
        pieceYCheck = currentSquare.point.y > selectedSquare.point.y || currentSquare.point.y < selectedSquare.point.y;
    } else {
        pieceYCheck = piece.isDark()  
                        ? currentSquare.point.y > selectedSquare.point.y 
                        : currentSquare.point.y < selectedSquare.point.y
    }
    // Dark pieces will check y greater than their own
    // Light Pieces will check y values less that their own
    // Unless kings then piece can move in both y directions
    if (pieceYCheck) {
        // movement logic 
        if (currentSquare.point.x == squareToRightIndex || currentSquare.point.x == squareToLeftIndex) {
            selectedSquare = currentSquare;
            piece.move(currentSquare.point);
            checkKingStatus(piece);
            draw();
            switchPieceTurn();
            // jump logic
        } else if (currentSquare.point.x == squareToSecondRightIndex || currentSquare.point.x == squareToSecondLeftIndex) {
            const squareToJump = currentSquare.point.x == squareToSecondRightIndex ? squareToRightIndex : squareToLeftIndex;
            squareToCheckYIndex = piece.isKing ? findMidPoint(currentSquare.point, selectedSquare.point).y : squareToCheckYIndex;
            const pieceToJump = findPieceByIndex({ x: squareToJump, y: squareToCheckYIndex});
            if (pieceToJump && piece.type != pieceToJump.type) {
                selectedSquare = currentSquare;
                piece.move(currentSquare.point);
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
    let currentSquare: Square;
    let found = false;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        if (found) break;
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentSquare = row[j];
            if (ctx.isPointInPath(currentSquare.path, event.offsetX, event.offsetY) && getPieceFromSquare(currentSquare)) {
                currentSquare.applyAction(Actions.hover);
                draw();
                found = true;
                break;
            }
        }
    }
});


canvas.addEventListener('click', (event: MouseEvent) => {
    let found = false;
    let currentSquare: Square;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        if (found) break;
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentSquare = row[j];
            if (ctx.isPointInPath(currentSquare.path, event.offsetX, event.offsetY)) {
                clearActions();       
                const piece = getPieceFromSquare(currentSquare);
                const selectedPiece = getPieceFromSquare(selectedSquare)
                if (selectedSquare && selectedPiece) {
                    if (piece) {
                        selectedSquare = currentSquare;
                        selectedSquare.applyAction(piece.type == pieceTurn ? Actions.valid : Actions.invalid);
                        draw();
                    } else {
                        if (selectedPiece && selectedPiece.type == pieceTurn) {
                            pieceMovementLogic(selectedPiece, currentSquare);
                        }
                    }
                } else if (piece) {
                    selectedSquare = currentSquare;
                    selectedSquare.applyAction(piece?.type == pieceTurn ? Actions.valid : Actions.invalid);
                    draw();
                }
                found = true;
                break;
            }
        }
    }
})







