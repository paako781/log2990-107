/* eslint-disable complexity */
import { BOARD_COLUMNS, BOARD_ROWS, CENTRAL_CASE_POSX, CENTRAL_CASE_POSY, dictionary, RESERVE } from '@app/classes/constants';
import { Letter } from '@app/classes/letter';
import { Range } from '@app/classes/range';
import { board } from '@app/classes/scrabble-board';
import { Vec2 } from '@app/classes/vec2';
import { PlayerIAComponent } from '@app/modules/game-view/components/player-ia/player-ia.component';
import { PlayStrategy } from './abstract-strategy.model';
import { PlayerIA } from './player-ia.model';
import { SwapLetter } from './swap-letter-strategy.model';

const ROW_OFFSET = 65;
const COLUMN_OFFSET = 1;
const WORDOVERFLOWS = -1;
const WORDOVERWRITES = -2;
const MULTIPLICATION_NEUTRAL = 1;

export class PlaceLetters extends PlayStrategy {
    private isFirstRound: boolean;
    constructor(private pointingRange: Range) {
        super();
    }

    execute(player: PlayerIA, context: PlayerIAComponent): void {
        // get the player's hand to generate a pattern containing
        // only player's disponible letters
        this.isFirstRound = context.isFirstRound;
        let pattern: string = this.pattern(player.letterTable);
        let randomX: number = CENTRAL_CASE_POSX;
        let randomY: number = CENTRAL_CASE_POSY;

        if (!context.isFirstRound) {
            do {
                randomX = Math.floor(Math.random() * BOARD_COLUMNS);
                randomY = Math.floor(Math.random() * BOARD_COLUMNS);
            } while (context.scrabbleBoard[randomX][randomY] === '');
            // get the player's hand to generate a pattern containing
            // a character already on the scrabbleBoard + player's disponible letters (only)
            pattern = this.pattern(player.letterTable, context.scrabbleBoard[randomX][randomY].toUpperCase());
        }

        // generate all possibilities matching the pattern
        const allPossibleWord: string[] = this.generateAllPossibilities(pattern);
        // remove those who nb(char(x)) > nb(char(x of player's hand))
        const possibleWord: string[] = this.generatePossibilities(allPossibleWord, player, context.isFirstRound);
        // Choose within the possibilities
        this.choosePossibility(possibleWord, context, { x: randomX, y: randomY });
    }

    private pattern(letterTable: Letter[], startingChar = ''): string {
        let pattern = '^[';

        if (startingChar !== '') {
            pattern = '^[' + startingChar + '][';
        }

        for (const letter of letterTable) {
            pattern += letter.value;
        }
        pattern += ']+$';

        return pattern;
    }

    private generateAllPossibilities(pattern: string): string[] {
        const allPossibleWord: string[] = [];
        const re = new RegExp(pattern, 'igm');
        for (const word of dictionary) {
            // test all words and retain those who satisfies the pattern
            if (re.test(word)) {
                allPossibleWord.push(word);
            }
        }
        return allPossibleWord;
    }

    private generatePossibilities(allPossibleWord: string[], player: PlayerIA, isFirstRound: boolean): string[] {
        const possibleWord: string[] = [];
        // Into all possible word...
        for (const word of allPossibleWord) {
            let isValidWord = true;
            let i = 0;
            if (!isFirstRound) {
                i = 1;
            }
            // ...pick those who letter's quantity matches the player letter quantity
            for (i; i < word.length; i++) {
                const re = new RegExp(word[i], 'g');
                const count: number = (word.match(re) || []).length;
                if (count > this.playerQuantityOf(word[i], player)) {
                    isValidWord = false;
                    break;
                }
            }

            if (isValidWord) {
                possibleWord.push(word);
            }
        }
        return possibleWord;
    }

    private choosePossibility(possibleWord: string[], context: PlayerIAComponent, startPos: Vec2) {
        const randomPointing = Math.floor(Math.random() * (this.pointingRange.max - this.pointingRange.min + 1)) + this.pointingRange.min;
        let priorityPoss: { word: string; nbPt: number }[] = [];
        let altPoss: { word: string; nbPt: number }[] = [];
        let orientationPos = 'h';

        // filter the possible words by priority
        // priorityPoss : words who calculation Point earns randomPointing vale
        // altPoss : words who calculation Point doesn't earns ramdomPoingValue
        priorityPoss = this.find(possibleWord, startPos, orientationPos, context.scrabbleBoard, randomPointing).priorityPoss;
        altPoss = this.find(possibleWord, startPos, orientationPos, context.scrabbleBoard, randomPointing).altPoss;

        let thereIsNoSolution = priorityPoss.length === 0 && altPoss.length === 0;

        if (thereIsNoSolution) {
            orientationPos = 'v';
            priorityPoss = this.find(possibleWord, startPos, orientationPos, context.scrabbleBoard, randomPointing).priorityPoss;
            altPoss = this.find(possibleWord, startPos, orientationPos, context.scrabbleBoard, randomPointing).altPoss;
        }

        thereIsNoSolution = priorityPoss.length === 0 && altPoss.length === 0;

        // If there is a word matching this turn randomPointing
        if (priorityPoss.length !== 0) {
            const wordUsed = priorityPoss[Math.floor(Math.random() * priorityPoss.length)].word;
            context.place(
                {
                    start: startPos,
                    orientation: orientationPos,
                    word: wordUsed,
                },
                priorityPoss,
            );
        }
        // If there isn't word matching this turn randomPointing but exists alternatives place it as well
        else if (altPoss.length !== 0) {
            const wordUsed = altPoss[Math.floor(Math.random() * priorityPoss.length)].word;
            context.place(
                {
                    start: startPos,
                    orientation: orientationPos,
                    word: wordUsed,
                },
                altPoss,
            );
        }
        // If there isn't word matching this turn randomPointing & existing alternatives swap
        // letter to get new opportunities next turn
        else if (priorityPoss.length === 0 && thereIsNoSolution) {
            context.iaPlayer.replaceStrategy(new SwapLetter());
        }
    }

    private playerQuantityOf(letter: string, player: PlayerIA): number {
        let quantity = 0;

        for (const playerLetter of player.letterTable) {
            if (playerLetter.value === letter.toUpperCase()) {
                quantity++;
            }
        }
        return quantity;
    }

    private bonusFactor(bonusFactor: number, matrixPos: Vec2, scrabbleBoard: string[][]): number {
        // check if there is a word on the matrixPos
        if (scrabbleBoard[matrixPos.x][matrixPos.y] === '') {
            return bonusFactor;
        }

        return MULTIPLICATION_NEUTRAL;
    }

    private calculatePoint(startPos: Vec2, orientation: string, word: string, scrabbleBoard: string[][]): number {
        // If the word will overflow quit
        if (orientation === 'h' && startPos.x + word.length > BOARD_COLUMNS) {
            return WORDOVERFLOWS;
        }
        if (orientation === 'v' && startPos.y + word.length > BOARD_ROWS) {
            return WORDOVERFLOWS;
        }

        let totalPoint = 0;
        let wordFactor = 1;

        let i = 0;

        if (!this.isFirstRound) {
            i = 1;
        }

        // For each letter compute it's value and bonus earning
        for (i; i < word.length; i++) {
            let key: string;
            // current position in word earning point calculation
            let matrixPos: Vec2;

            if (orientation === 'h') {
                key = String.fromCharCode(startPos.x + ROW_OFFSET) + (startPos.y + COLUMN_OFFSET + i).toString();
                matrixPos = { x: startPos.x, y: startPos.y + i };
            } else {
                key = String.fromCharCode(startPos.x + ROW_OFFSET + i) + (startPos.y + COLUMN_OFFSET).toString();
                matrixPos = { x: startPos.x + i, y: startPos.y };
            }

            if (scrabbleBoard[matrixPos.x][matrixPos.y] !== '') {
                return WORDOVERWRITES;
            }
            // letter value : A = 1, B = 3, C = 3 ...etc
            const letterContribution: number = RESERVE[word[i].toUpperCase().charCodeAt(0) - ROW_OFFSET].points;
            // total earning for the letter (word[i]) at position (x, y)
            const earning: { letterPt: number; wordFactor: number } = this.computeCell(key, letterContribution, matrixPos, scrabbleBoard);
            totalPoint += earning.letterPt;
            wordFactor *= earning.wordFactor;
        }

        return totalPoint * wordFactor;
    }

    private computeCell(keyCell: string, letterValue: number, matrixPos: Vec2, scrabbleBoard: string[][]): { letterPt: number; wordFactor: number } {
        // compute the earning (in letterFactor and wordFactor) of the cell at matrixPox
        let letterPt = 0;
        let wordFactor = 1;
        switch (board[keyCell as keyof typeof board]) {
            case 'doubleletter':
                letterPt = letterValue * this.bonusFactor(2, matrixPos, scrabbleBoard);
                break;
            case 'tripleletter':
                letterPt = letterValue * this.bonusFactor(3, matrixPos, scrabbleBoard);
                break;
            case 'doubleword':
                letterPt = letterValue;
                wordFactor *= this.bonusFactor(2, matrixPos, scrabbleBoard);
                break;
            case 'tripleword':
                letterPt = letterValue;
                wordFactor *= this.bonusFactor(3, matrixPos, scrabbleBoard);
                break;
            default:
                letterPt += letterValue;
                break;
        }

        return { letterPt, wordFactor };
    }

    private find(
        possibleWord: string[],
        startPos: Vec2,
        orientation: string,
        scrabbleBoard: string[][],
        randomPointing: number,
    ): { priorityPoss: { word: string; nbPt: number }[]; altPoss: { word: string; nbPt: number }[] } {
        const priorityPoss: { word: string; nbPt: number }[] = [];
        const altPoss: { word: string; nbPt: number }[] = [];
        for (const word of possibleWord) {
            const nbPt = this.calculatePoint(startPos, orientation, word, scrabbleBoard);
            if (nbPt === randomPointing) {
                priorityPoss.push({ word, nbPt });
            } else if (nbPt <= this.pointingRange.max && nbPt >= 0) {
                altPoss.push({ word, nbPt });
            }
        }
        return { priorityPoss, altPoss };
    }
}
