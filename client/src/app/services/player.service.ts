import { Injectable } from '@angular/core';
import {
    BOARD_COLUMNS,
    BOARD_ROWS,
    DEFAULT_FONT_SIZE,
    EASEL_SIZE,
    FONT_SIZE_MAX,
    FONT_SIZE_MIN,
    INDEX_INVALID,
    RESERVE,
} from '@app/classes/constants';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/models/player.model';
import { Subject } from 'rxjs';
import { GridService } from './grid.service';
import { LetterService } from './letter.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    playerSubject = new Subject<Player[]>();
    scrabbleBoard: string[][];
    fontSize = DEFAULT_FONT_SIZE;

    players: Player[] = new Array<Player>();
    private myFunc: () => void;
    constructor(private letterService: LetterService, private gridService: GridService) {
        this.fontSize = DEFAULT_FONT_SIZE;
    }

    updateLettersEasel(fn: () => void) {
        this.myFunc = fn;
        // from now on, call myFunc wherever you want inside this service
    }

    emitPlayers(): void {
        this.playerSubject.next(this.players.slice());
    }

    addPlayer(user: Player) {
        this.players.push(user);
        this.emitPlayers();
    }

    clearPlayers(): void {
        this.players = [];
    }

    updateScrabbleBoard(scrabbleBoard: string[][]): void {
        this.scrabbleBoard = scrabbleBoard;
    }

    updateFontSize(fontSize: number): void {
        if (fontSize < FONT_SIZE_MIN) {
            fontSize = FONT_SIZE_MIN;
        } else if (fontSize > FONT_SIZE_MAX) {
            fontSize = FONT_SIZE_MAX;
        }
        this.fontSize = fontSize;
        this.updateGridFontSize();
    }

    getLettersEasel(indexPlayer: number): Letter[] {
        return this.players[indexPlayer].letterTable;
    }

    getPlayers(): Player[] {
        return this.players;
    }

    // Update the font size of the letters placed on the grid
    updateGridFontSize(): void {
        for (let i = 0; i < BOARD_ROWS; i++) {
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                if (this.scrabbleBoard[i][j] !== '') {
                    this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, j, i);
                    this.gridService.drawLetter(this.gridService.gridContextLettersLayer, this.scrabbleBoard[i][j], j, i, this.fontSize);
                }
            }
        }
    }

    swap(indexToSwap: number, indexPlayer: number) {
        const letterFromReserve = this.letterService.getRandomLetter();
        // Add a copy of the random letter from the reserve
        const letterToAdd = {
            value: letterFromReserve.value,
            quantity: letterFromReserve.quantity,
            points: letterFromReserve.points,
            isSelectedForSwap: letterFromReserve.isSelectedForSwap,
            isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
        };
        this.players[indexPlayer].letterTable.splice(indexToSwap, 1, letterToAdd);
        this.myFunc();
    }

    // Remove one letter from easel
    removeLetter(indexToRemove: number, indexPlayer: number): void {
        this.players[indexPlayer].letterTable.splice(indexToRemove, 1);
        this.myFunc();
    }

    addLetterToEasel(letterToAdd: string, indexPlayer: number): void {
        // If it is a white letter
        if (letterToAdd === letterToAdd.toUpperCase()) {
            for (const letter of RESERVE) {
                if (letter.value === '*') {
                    this.players[indexPlayer].letterTable.push(letter);
                }
            }
        } else {
            for (const letter of RESERVE) {
                if (letterToAdd.toUpperCase() === letter.value) {
                    this.players[indexPlayer].letterTable.push(letter);
                }
            }
        }
    }

    addEaselLetterToReserve(indexInEasel: number, indexPlayer: number) {
        this.letterService.addLetterToReserve(this.getLettersEasel(indexPlayer)[indexInEasel].value);
    }

    refillEasel(indexPlayer: number): void {
        let letterToAdd: Letter;
        for (let i = this.players[indexPlayer].letterTable.length; i < EASEL_SIZE; i++) {
            letterToAdd = this.letterService.getRandomLetter();
            if (letterToAdd.value === '') {
                break;
            }
            // Add a copy of the letter found
            this.players[indexPlayer].letterTable[i] = {
                value: letterToAdd.value,
                quantity: letterToAdd.quantity,
                points: letterToAdd.points,
                isSelectedForSwap: letterToAdd.isSelectedForSwap,
                isSelectedForManipulation: letterToAdd.isSelectedForManipulation,
            };
        }
        this.myFunc();
    }

    // Return the index of the letter found in the easel
    indexLetterInEasel(letter: string, startIndex: number, indexPlayer: number): number {
        for (let i = startIndex; i < this.players[indexPlayer].letterTable.length; i++) {
            if (letter === this.players[indexPlayer].letterTable[i].value.toLowerCase()) {
                return i;
            } else if (letter === letter.toUpperCase()) {
                // White letter
                if (this.players[indexPlayer].letterTable[i].value === '*') {
                    return i;
                }
            }
        }
        return INDEX_INVALID;
    }

    addScore(score: number, indexPlayer: number): void {
        this.players[indexPlayer].score += score;
    }

    getScore(indexPlayer: number): number {
        return this.players[indexPlayer].score;
    }
}
