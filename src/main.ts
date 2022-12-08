import { Actions } from "./models/Actions";
import { SquareColor } from "./models/Colors";
import { Move, MoveGroup, MoveType, SearchDirection } from "./models/Move";
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
let hoveredSquare: Square | undefined;
let selectedSquare: Square | undefined;
let pieceTurn: PieceType = PieceType.light;
let possibleMoves: Move[] = [];
const lightPieces: Piece[] = [];
const darkPieces: Piece[] = [];

const intitializeGrid = (): Square[][] => {
    const tempGrid: Square[][] = [];
    for (let i = 0; i <= gridDefinition.length - 1; i++) {
        const row = gridDefinition[i];
        const squareRow: Square[] = [];
        for (let j = 0; j <= row.length - 1; j++) {
            const item = row[j];
            const square: Square = new Square(item, new Path2D(), { x: j, y: i });
            square.path.rect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.fillStyle = item === SquareType.dark ? SquareColor.dark : SquareColor.light;
            ctx.fill(square.path);
            squareRow.push(square);

            if (item === SquareType.dark) {
                if (i <= 2) {
                    const darkPiece = new Piece(PieceType.dark, { x: j, y: i }, squareSize, pieceRadius, ctx);
                    darkPiece.draw();
                    darkPieces.push(darkPiece);
                    square.applyAction(Actions.hasPiece);
                }
                if (i >= 5) {
                    const lightPiece = new Piece(PieceType.light, { x: j, y: i }, squareSize, pieceRadius, ctx);
                    lightPiece.draw();
                    lightPieces.push(lightPiece);
                    square.applyAction(Actions.hasPiece);
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
    const allPieces = [...lightPieces, ...darkPieces];
    return allPieces.find(piece => piece.isMatch(point));
}

const findSquareByIndex = (point: Point): Square | undefined => {
    return allSquaresFlat.find(square => square.isMatch(point));
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

const checkForMultipleJumps = (point: Point, xDirection: SearchDirection, yDirection: SearchDirection, group: MoveGroup): Move[] => {
    const tempArray: Move[] = [];
    const distanceToCheck = 2;

    for (let i = 1; i <= distanceToCheck; i++) {

        const x = point.x + (xDirection * i);
        const y = point.y + (yDirection * i);

        const square = findSquareByIndex({ x, y});

        if (square) {
            if (square.hasPiece && tempArray.length == 0) {
                tempArray.push({ square: square, move: MoveType.none, group });
            } else if (!square.hasPiece && tempArray.length > 0) {
                tempArray[i - tempArray.length - 1].move = MoveType.jump;
                tempArray.push({ square: square, move: MoveType.move, group });
            }
        }
    }

    return tempArray;

}

const checkForMoves = (point: Point, xDirection: SearchDirection, yDirection: SearchDirection, group: MoveGroup): Move[] => {
    let tempArray: Move[] = [];
    const distanceToCheck = 2;
    for (let i = 1; i <= distanceToCheck; i++) {

        // no reason to check anymore we have a valid move in one direction
        if (tempArray.length > 0 && tempArray.some(x => x.move == MoveType.move)) {
            break;
        }

        // no valid moves in this direction we are blocked
        if (tempArray.length == 2 && tempArray.every(x => x.move == MoveType.none)) {
            tempArray = []
            break;
        }

        const x = point.x + (xDirection * i);
        const y = point.y + (yDirection * i);

        const square = findSquareByIndex({ x, y });

        if (square) {
            // had initial piece to the array
            if (tempArray.length == 0 && !square.hasPiece) {
                if (square.hasPiece) {
                    tempArray.push({ square: square, move: MoveType.none, group });
                } else {
                    tempArray.push({ square: square, move: MoveType.move, group });
                }
            } else {
                // piece is blocked in this direction
                if (square.hasPiece) {
                    tempArray.push({ square: square, move: MoveType.none, group });
                } else { // check if we have a jump avaiable
                    const previousItem = tempArray[i - tempArray.length - 1];
                    const piece = findPieceByIndex(point);
                    const samePieceType = getPieceFromSquare(previousItem.square)?.type == piece?.type;
                    if (!samePieceType) {
                        tempArray[i - tempArray.length - 1].move = MoveType.jump;
                        const nextMove = { square: square, move: MoveType.move, group: group };
                        tempArray.push(nextMove);
                        const possibleJumps: Move[] = [];
                        if (piece?.isKing) {
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Positive, SearchDirection.Positive, group));
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Negative, SearchDirection.Positive, group));
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Positive, SearchDirection.Negative, group));
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Negative, SearchDirection.Negative, group));
                        } else {
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Positive, yDirection, group));
                            possibleJumps.push(...checkForMultipleJumps(square.point, SearchDirection.Negative, yDirection, group));
                        }
                        if (possibleJumps.length > 0) {
                            tempArray.push(...possibleJumps);
                        }
                    } else {
                        tempArray.push({ square: square, move: MoveType.none, group });
                    }
                }
            }
        }
    }

    return tempArray;
}

const pieceMovementPreview = (piece: Piece): Move[] => {
    if (!piece) return [];

    const movesArray: Move[] = [];

    const point = piece.point;
    if (piece.isKing) {
        movesArray.push(...checkForMoves(point, SearchDirection.Positive, SearchDirection.Positive, MoveGroup.g1));
        movesArray.push(...checkForMoves(point, SearchDirection.Negative, SearchDirection.Positive, MoveGroup.g2));
        movesArray.push(...checkForMoves(point, SearchDirection.Positive, SearchDirection.Negative, MoveGroup.g3));
        movesArray.push(...checkForMoves(point, SearchDirection.Negative, SearchDirection.Negative, MoveGroup.g4));
    } else {
        if (piece.isDark) {
            movesArray.push(...checkForMoves(point, SearchDirection.Positive, SearchDirection.Positive, MoveGroup.g1));
            movesArray.push(...checkForMoves(point, SearchDirection.Negative, SearchDirection.Positive, MoveGroup.g2));
        } else if (piece.isLight) {
            movesArray.push(...checkForMoves(point, SearchDirection.Positive, SearchDirection.Negative, MoveGroup.g1));
            movesArray.push(...checkForMoves(point, SearchDirection.Negative, SearchDirection.Negative, MoveGroup.g1));
        }
    }

    movesArray.forEach(move => {
        if (move.move == MoveType.move) {
            console.log(`possible move: ${move.square.point.x} ${move.square.point.y}`)
            move.square.applyAction(Actions.possibleMove);
        }
    });

    draw();
    return movesArray;
}


const pieceMovementLogic = (piece: Piece, currentSquare: Square) => {
    if (!piece) return;
    if (!selectedSquare) return;

    const moveGroup = possibleMoves.find(x => x.square.isMatch(currentSquare.point))?.group;
    if (moveGroup) {
        const moveSet = possibleMoves.filter(x => x.group == moveGroup);
        const squaresToJump = moveSet.filter(x => x.move == MoveType.jump)
        if (squaresToJump && squaresToJump.length > 0) {
            const piecesToJump = moveSet.filter(x => x.move == MoveType.jump).map(x => getPieceFromSquare(x.square));
            if (piecesToJump && piecesToJump.length > 0) {
                piecesToJump.forEach(pieceToJump => {
                    if (pieceToJump?.isDark) {
                        const index = darkPieces.indexOf(pieceToJump);
                        darkPieces.splice(index, 1);
                    } else if (pieceToJump?.isLight) {
                        const index = lightPieces.indexOf(pieceToJump);
                        lightPieces.splice(index, 1);
                    }
                });
                squaresToJump.forEach(x => x.square.applyAction(Actions.removePiece));
            }
        }
    }

    getSquareFromPiece(piece)?.applyAction(Actions.removePiece);
    currentSquare.applyAction(Actions.hasPiece);
    piece.move(currentSquare.point);
    checkKingStatus(piece);
    draw();
    switchPieceTurn();
}

/* Events */
canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (hoveredSquare && !hoveredSquare.isSelected) {
        hoveredSquare.applyAction(Actions.none)
    }
    let currentSquare: Square;
    let found = false;
    for (let i = 0; i <= gridImplemention.length - 1; i++) {
        if (found) break;
        const row = gridImplemention[i];
        for (let j = 0; j <= row.length - 1; j++) {
            currentSquare = row[j];
            if (ctx.isPointInPath(currentSquare.path, event.offsetX, event.offsetY) && getPieceFromSquare(currentSquare)) {
                if (!currentSquare.isSelected) currentSquare.applyAction(Actions.hover);
                draw();
                found = true;
                hoveredSquare = currentSquare;
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
                console.log(`selected square: ${currentSquare.point.x} ${currentSquare.point.y}`);
                clearActions();
                const piece = getPieceFromSquare(currentSquare);
                if (selectedSquare) {
                    if (piece) {
                        selectedSquare = currentSquare;
                        selectedSquare.applyAction(piece.type == pieceTurn ? Actions.valid : Actions.invalid);
                        draw();
                        if (piece.type == pieceTurn) {
                            possibleMoves = pieceMovementPreview(piece);
                        }
                    } else if (possibleMoves.length > 0 && possibleMoves.some(x => x.square.isMatch(currentSquare.point))) {
                        const selectedPiece = getPieceFromSquare(selectedSquare);
                        if (selectedPiece) pieceMovementLogic(selectedPiece, currentSquare);
                    }
                } else if (piece) {
                    selectedSquare = currentSquare;
                    selectedSquare.applyAction(piece?.type == pieceTurn ? Actions.valid : Actions.invalid);
                    draw();
                    if (piece.type == pieceTurn) {
                        possibleMoves = pieceMovementPreview(piece);
                    }
                }
                found = true;
                break;
            }
        }
    }
})







