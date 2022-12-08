import { Actions } from "./Actions";
import { SquareColor } from "./Colors";
import { PieceType } from "./PieceType";
import { Point } from "./Point";
import { SquareType } from "./SquareType";

export class Square {

    private initialColor: SquareColor;
    public color: SquareColor;
    public hasPiece = false;
    public isSelected = false;
    public mouserIsOver = false;
    public pieceType: PieceType = PieceType.unkown;


    constructor(
        public type: SquareType,
        public path: Path2D,
        public point: Point,
    ) {
        this.color = type == SquareType.dark ? SquareColor.dark : SquareColor.light;
        this.initialColor = this.color;
    }

    public isMatch(pointToCheck: Point): boolean {
        return this.point.x == pointToCheck.x && this.point.y == pointToCheck.y;
    }

    applyAction(action: Actions): void {
        switch (action) {
            case Actions.none: 
                this.color = this.initialColor;
                this.isSelected = false;
                this.mouserIsOver = false;
                break;
            case Actions.hover:
                this.color = SquareColor.hover;
                this.mouserIsOver = true;
                break;
            case Actions.invalid:
                this.color = SquareColor.selectedInvalid;
                this.isSelected = true;
                this.mouserIsOver = false;
                break;
            case Actions.valid:
                this.color = SquareColor.selectedValid;
                this.isSelected = true;
                this.mouserIsOver = false;
                break;
            case Actions.hasPiece:
                this.hasPiece = true;
                break;
            case Actions.removePiece:
                this.hasPiece = false;
                this.pieceType = PieceType.unkown;
                break;
            case Actions.possibleMove:
                this.color = SquareColor.possibleMove;
                break;
        }
    } 
}