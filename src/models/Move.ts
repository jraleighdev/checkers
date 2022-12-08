import { Square } from "./Square";

export interface Move {
    square: Square;
    move: MoveType;
    group: MoveGroup;
}

export enum MoveType {
    move = 0,
    jump = 1,
    none = 2
}

export enum SearchDirection {
    Positive = 1,
    Negative = -1
}

export enum MoveGroup {
    g1 = 'g1',
    g2 = 'g2',
    g3 = 'g3',
    g4 = 'g4'
}

