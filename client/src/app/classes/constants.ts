// TODO : Avoir un fichier séparé pour les constantes!
import { Letter } from '@app/classes/letter';
import dictionaryData from '../../assets/dictionnary.json';

export const DEFAULT_WIDTH = 750;
export const DEFAULT_HEIGHT = 750;
export const BOARD_SIZE = 16;
export const CASE_SIZE = DEFAULT_WIDTH / BOARD_SIZE;
export const EASEL_SIZE = 7;

export const BOARD_ROWS = 15;
export const BOARD_COLUMNS = 15;

export const CENTRAL_CASE_POSX = 7;
export const CENTRAL_CASE_POSY = 7;

export const PLAYERS_NUMBER = 2;
export const INDEX_REAL_PLAYER = 0;
export const INDEX_PLAYER_IA = 1;

export const FONT_SIZE_MAX = 20;
export const FONT_SIZE_MIN = 10;
export const DEFAULT_FONT_SIZE = 13;
export const SIZE_VARIATION = 1;

export const MIN_RESERVE_SIZE_TOSWAP = 7;

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum IAStrategy {
    Skip,
    Swap,
    Place,
}

export const strategyBallotBox: IAStrategy[] = [
    IAStrategy.Place,
    IAStrategy.Place,
    IAStrategy.Place,
    IAStrategy.Skip,
    IAStrategy.Place,
    IAStrategy.Swap,
    IAStrategy.Place,
    IAStrategy.Place,
    IAStrategy.Place,
    IAStrategy.Place,
];

export enum PlacingStrategy {
    LessSix,
    SevenToTwelve,
    ThirteenToEighteen,
}

export const placingBallotBox: PlacingStrategy[] = [
    PlacingStrategy.LessSix,
    PlacingStrategy.SevenToTwelve,
    PlacingStrategy.SevenToTwelve,
    PlacingStrategy.LessSix,
    PlacingStrategy.ThirteenToEighteen,
    PlacingStrategy.LessSix,
    PlacingStrategy.ThirteenToEighteen,
    PlacingStrategy.ThirteenToEighteen,
    PlacingStrategy.SevenToTwelve,
    PlacingStrategy.LessSix,
];

export const IA_NAME_DATABASE: string[] = ['Mister_Bucky', 'Mister_Samy', 'Miss_Betty'];

export const MAX_SOLUTION = 3;

export const RESERVE: Letter[] = [
    {
        value: 'A',
        quantity: 9,
        points: 1,
    },
    {
        value: 'B',
        quantity: 2,
        points: 3,
    },
    {
        value: 'C',
        quantity: 2,
        points: 3,
    },
    {
        value: 'D',
        quantity: 3,
        points: 2,
    },
    {
        value: 'E',
        quantity: 15,
        points: 1,
    },
    {
        value: 'F',
        quantity: 2,
        points: 4,
    },
    {
        value: 'G',
        quantity: 2,
        points: 2,
    },
    {
        value: 'H',
        quantity: 2,
        points: 4,
    },
    {
        value: 'I',
        quantity: 8,
        points: 1,
    },
    {
        value: 'J',
        quantity: 1,
        points: 8,
    },
    {
        value: 'K',
        quantity: 1,
        points: 10,
    },
    {
        value: 'L',
        quantity: 5,
        points: 1,
    },
    {
        value: 'M',
        quantity: 3,
        points: 2,
    },
    {
        value: 'N',
        quantity: 6,
        points: 1,
    },
    {
        value: 'O',
        quantity: 6,
        points: 1,
    },
    {
        value: 'P',
        quantity: 2,
        points: 3,
    },
    {
        value: 'Q',
        quantity: 1,
        points: 8,
    },
    {
        value: 'R',
        quantity: 6,
        points: 1,
    },
    {
        value: 'S',
        quantity: 6,
        points: 1,
    },
    {
        value: 'T',
        quantity: 6,
        points: 1,
    },
    {
        value: 'U',
        quantity: 6,
        points: 1,
    },
    {
        value: 'V',
        quantity: 2,
        points: 4,
    },
    {
        value: 'W',
        quantity: 1,
        points: 10,
    },
    {
        value: 'X',
        quantity: 1,
        points: 10,
    },
    {
        value: 'Y',
        quantity: 1,
        points: 10,
    },
    {
        value: 'Z',
        quantity: 1,
        points: 10,
    },
    {
        value: '*',
        quantity: 2,
        points: 0,
    },
];

export const dictionary: string[] = JSON.parse(JSON.stringify(dictionaryData)).words;
