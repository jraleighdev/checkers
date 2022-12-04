import { Actions } from "./Actions";
import { SquareColor } from "./Colors";
import { Point } from "./Point";
import { SquareType } from "./SquareType";

export class Square {

    private initialColor: SquareColor;
    public action: Actions = Actions.none;
    public color: SquareColor;

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
                break;
            case Actions.hover:
                this.color = SquareColor.hover;
                break;
            case Actions.invalid:
                this.color = SquareColor.selectedInvalid;
                break;
            case Actions.valid:
                this.color = SquareColor.selectedValid;
                break;
        }
    } 
}