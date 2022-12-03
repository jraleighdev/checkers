import { PieceType } from "./PieceType";
import { SquareType } from "./SquareType";

export interface Square {
    type: SquareType;
    xLocation: number;
    yLocation: number;
    hasPiece: boolean;
    path: Path2D;
    xIndex: number;
    yIndex: number;
    pieceType: PieceType;
}