import { PieceColor } from "./Colors";
import { PieceType } from "./PieceType";
import { Point } from "./Point";

export class Piece {

    public static readonly darkPieceColor = 'black';
    public static readonly lightPieceColor = 'white';

    public isKing = false;
    public color: PieceColor;

    constructor(
        public type: PieceType,
        public point: Point,
        public squareSize: number,
        public radius: number,
        public context: CanvasRenderingContext2D
    ) {
        this.color = type == PieceType.dark ? PieceColor.dark : PieceColor.light;
    }

    public draw(): void {
        this.context.beginPath();
        const xLocation = this.point.x === 0 ? this.squareSize / 2 : this.squareSize * this.point.x + this.squareSize / 2;
        const yLocation = this.point.y === 0 ? this.squareSize / 2 : this.squareSize * this.point.y + this.squareSize / 2;
        this.context.arc(xLocation, yLocation, this.radius, 0, 2 * Math.PI);
        this.context.fillStyle = this.color;
        this.context.fill();
        if (this.isKing) {
            this.context.font = '40px arial';
            this.context.fillStyle = this.color == PieceColor.dark ? PieceColor.light : PieceColor.dark;
            this.context.fillText('K', xLocation - 12, yLocation + 14);
        }
    }

    public move(newPoint: Point): void {
        this.point = newPoint;
    }

    public isMatch(pointToCheck: Point): boolean {
        return this.point.x == pointToCheck.x && this.point.y == pointToCheck.y;
    }

    public isDark = () => this.type == PieceType.dark;

    public isLight = () => this.type == PieceType.light;
}