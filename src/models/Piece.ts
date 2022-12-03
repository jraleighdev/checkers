import { PieceColor } from "./Colors";
import { PieceType } from "./PieceType";

export class Piece {

    public static readonly darkPieceColor = 'black';
    public static readonly lightPieceColor = 'white';

    public isKing = false;
    public color: PieceColor;

    constructor(
        public type: PieceType,
        public xIndex: number,
        public yindex: number,
        public squareSize: number,
        public radius: number,
        public context: CanvasRenderingContext2D
    ) {
        this.color = type == PieceType.dark ? PieceColor.dark : PieceColor.light;
    }

    public draw(): void {
        this.context.beginPath();
        const xLocation = this.xIndex === 0 ? this.squareSize / 2 : this.squareSize * this.xIndex + this.squareSize / 2;
        const yLocation = this.yindex === 0 ? this.squareSize / 2 : this.squareSize * this.yindex + this.squareSize / 2;
        this.context.arc(xLocation, yLocation, this.radius, 0, 2 * Math.PI);
        this.context.fillStyle = this.color;
        this.context.fill();
        if (this.isKing) {
            this.context.font = '40px arial';
            this.context.fillStyle = this.color == PieceColor.dark ? PieceColor.light : PieceColor.dark;
            this.context.fillText('K', xLocation - 12, yLocation + 14);
        }
    }
}