export interface Objective {
    name: string;
    isCompleted: boolean;
    score: number;
    id: number;
}

export const OBJECTIVES: Objective[] = [
    { name: "Former un mot d'au moins 4 lettres sur 3 tours consécutifs", isCompleted: false, score: 20, id: 0 },
    { name: "Former un mot identique à un mot déjà placé d'au moins 4 lettres", isCompleted: false, score: 20, id: 1 },
    { name: 'Former un mot qui coupe au moins deux mots déjà placés', isCompleted: false, score: 15, id: 2 },
    { name: 'Obtenir 60 points en une minute de jeu actif (incluant les bonus)', isCompleted: false, score: 30, id: 3 },
    { name: 'Placer un mot avec au moins 2 lettres parmi J, K, Q, W, X, Y, Z', isCompleted: false, score: 30, id: 4 },
    { name: "Former un mot sur une case bonus à partir d'un mot déjà placé", isCompleted: false, score: 20, id: 5 },
    { name: 'Former un mot de plus de 7 lettres', isCompleted: false, score: 20, id: 6 },
    { name: "Toucher l'un des 4 coins du board", isCompleted: false, score: 15, id: 7 },
];

export const DEFAULT_OBJECTIVE: Objective = { name: '', isCompleted: false, score: 0, id: 0 };
export const NUMBER_OF_OBJECTIVES = 2;
export const LETTERS_FOR_OBJ5: string[] = ['J', 'K', 'Q', 'W', 'X', 'Y', 'Z'];
export const CORNER_POSITIONS: string[] = ['A1', 'A15', 'O1', 'O15'];
export const MIN_SIZE_FOR_OBJ7 = 8;
export const MIN_SIZE_FOR_OBJ2 = 4;
export const MIN_SCORE_FOR_OBJ4 = 60;
