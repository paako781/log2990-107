import { Injectable } from '@angular/core';
import { ONE_MINUTE } from '@app/classes/constants';
import {
    CORNER_POSITIONS,
    LETTERS_FOR_OBJ5,
    MIN_SCORE_FOR_OBJ4,
    MIN_SIZE_FOR_OBJ2,
    MIN_SIZE_FOR_OBJ7,
    NUMBER_OF_OBJECTIVES,
    Objective,
    OBJECTIVES,
} from '@common/objectives';
import { ObjectiveTypes } from '@common/objectives-type';
import { ClientSocketService } from './client-socket.service';
import { EndGameService } from './end-game.service';
import { GameSettingsService } from './game-settings.service';
import { PlacementsHandlerService } from './placements-handler.service';
import { PlayerService } from './player.service';
import { RandomBonusesService } from './random-bonuses.service';
import { WordValidationService } from './word-validation.service';

@Injectable({
    providedIn: 'root',
})
export class ObjectivesService {
    objectives: Objective[][];
    playerIndex: number;
    activeTimeRemaining: number;
    extendedWords: string[];
    private obj1Counter: number[];

    constructor(
        private wordValidationService: WordValidationService,
        private playerService: PlayerService,
        private clientSocketService: ClientSocketService,
        private gameSettingsService: GameSettingsService,
        private randomBonusesService: RandomBonusesService,
        private placementsService: PlacementsHandlerService,
        private endGameService: EndGameService,
    ) {
        this.objectives = [[], []];
        this.activeTimeRemaining = ONE_MINUTE;
        this.obj1Counter = [0, 0];
        this.receiveObjectives();
    }

    initializeObjectives(): void {
        const arrayOfIndex = this.gameSettingsService.gameSettings.objectiveIds;
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            for (let j = 0; j < NUMBER_OF_OBJECTIVES; j++) {
                const objective = OBJECTIVES[arrayOfIndex[i][j]];
                this.objectives[i].push(objective);
            }
        }
    }

    receiveObjectives(): void {
        this.clientSocketService.socket.on('receiveObjectiveCompleted', (id: number) => {
            const objective = this.findObjectiveById(id) as Objective;
            objective.isCompleted = true;
        });
    }

    updateOpponentObjectives(id: number): void {
        // TODO: on peut enlever le if car si c'est mode solo, on n'est pas connecté au server,
        // le emit devient du code mort
        if (!this.gameSettingsService.isSoloMode) this.clientSocketService.socket.emit('objectiveAccomplished', id, this.clientSocketService.roomId);
    }

    checkObjectivesCompletion(): void {
        // Mode classique -> aucune vérification requise
        if (this.gameSettingsService.gameType === 'Scrabble classique') return;

        if (!this.objectives[ObjectiveTypes.Private][this.playerIndex].isCompleted) {
            this.isCompleted(this.objectives[ObjectiveTypes.Private][this.playerIndex].id);
        }

        for (const objective of this.objectives[ObjectiveTypes.Public]) {
            if (!objective.isCompleted) this.isCompleted(objective.id);
        }
    }

    isCompleted(id: number): void {
        switch (id) {
            case 0: {
                this.validateObjectiveOne(id);
                break;
            }
            case 1: {
                this.validateObjectiveTwo(id);
                break;
            }
            case 2: {
                this.validateObjectiveThree(id);
                break;
            }
            case 3: {
                this.validateObjectiveFour(id);
                break;
            }
            case 4: {
                this.validateObjectiveFive(id);
                break;
            }
            case 5: {
                this.validateObjectiveSix(id);
                break;
            }
            case 6: {
                // TODO: y'a un petit offset de 1 entre le case et le nom de la fonction
                this.validateObjectiveSeven(id);
                break;
            }
            case 7: {
                this.validateObjectiveEight(id);
                break;
            }
            default: {
                break;
            }
        }
    }

    validateObjectiveOne(id: number) {
        const actionLog: string[] = [];
        const size = this.endGameService.actionsLog.length - 1;
        let lastWordLength = 0;

        for (let index = size; index >= 0; index = index - 2) {
            actionLog.push(this.endGameService.actionsLog[index]);
        }

        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            lastWordLength = word.length;
        }

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (actionLog.length > 0 && actionLog[actionLog.length - 1] !== 'PlacerSucces' && lastWordLength >= 4) {
            this.obj1Counter[this.playerIndex]++;
        } else {
            this.obj1Counter[this.playerIndex] = 1;
        }

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.obj1Counter[this.playerIndex] === 4) {
            this.addObjectiveScore(id);
            this.obj1Counter[this.playerIndex] = 0;
        }
    }

    validateObjectiveTwo(id: number) {
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            if (word.length >= MIN_SIZE_FOR_OBJ2 && this.wordValidationService.priorPlayedWords.has(word)) this.addObjectiveScore(id);
        }
        // TODO: version de Majid
        // let counter = 0;
        // for (const lastWord of this.wordValidationService.lastPlayedWords.keys()) {
        //     for (const word of this.wordValidationService.playedWords.keys()) {
        //         counter = 0;
        //         if (lastWord.length >= MIN_SIZE_FOR_OBJ2 && word === lastWord) {
        //             counter++;
        //         }
        //     }
        // }
        // if (counter > 1) this.addObjectiveScore(id);
    }

    validateObjectiveThree(id: number) {
        for (const positions of this.wordValidationService.lastPlayedWords.values()) {
            const playedPositionsUsed: string[][] = [];
            for (const position of positions) {
                this.isPositionInPlayedWords(position, playedPositionsUsed);
            }
            console.log('MOTS INTERSECTIONS : ', playedPositionsUsed);
            if (playedPositionsUsed.length > 1) {
                this.addObjectiveScore(id);
                return;
            }
        }

        // TODO: version de Majid en cours de developpement
        // const wordsTouchingTheLastWord: string[] = [];
        // for (const lastWord of this.wordValidationService.lastPlayedWords.keys()) {
        //     for (const word of this.wordValidationService.playedWords.keys()) {
        //         if (word !== lastWord) {
        //             this.wordValidationService.playedWords.get(word)?.forEach((charInPlayedWord: string) => {
        //                 this.wordValidationService.lastPlayedWords.get(lastWord)?.forEach((charInLastWord: string) => {
        //                     if (charInLastWord === charInPlayedWord) wordsTouchingTheLastWord.push(word);
        //                 });
        //             });
        //         }
        //     }
        // }

        // if (counter > 1) this.addObjectiveScore(id);
    }

    validateObjectiveFour(id: number) {
        if (this.activeTimeRemaining > 0 && this.playerService.players[this.playerIndex].score >= MIN_SCORE_FOR_OBJ4) this.addObjectiveScore(id);
    }

    validateObjectiveFive(id: number) {
        let specificLettersUsed = 0;
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            for (const letter of word) {
                if (LETTERS_FOR_OBJ5.includes(letter.toUpperCase())) specificLettersUsed++;
            }
            if (specificLettersUsed > 1) {
                this.addObjectiveScore(id);
                return;
            }
            specificLettersUsed = 0;
        }
    }

    validateObjectiveSix(id: number) {
        if (this.extendedWords.length === 0) return;
        for (const position of this.placementsService.extendingPositions) {
            if (this.randomBonusesService.bonusPositions.has(position)) this.addObjectiveScore(id);
        }
    }

    validateObjectiveSeven(id: number): void {
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            if (word.length >= MIN_SIZE_FOR_OBJ7) {
                this.addObjectiveScore(id);
            }
        }
    }

    validateObjectiveEight(id: number): void {
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            for (const position of this.wordValidationService.lastPlayedWords.get(word) as string[]) {
                if (CORNER_POSITIONS.includes(position)) {
                    this.addObjectiveScore(id);
                }
            }
        }
    }

    isPositionInPlayedWords(position: string, playedPositionsUsed: string[][]) {
        for (const playedPositions of this.wordValidationService.priorPlayedWords.values()) {
            if (playedPositions.includes(position) && !playedPositionsUsed.includes(playedPositions)) {
                playedPositionsUsed.push(playedPositions);
            }
        }
    }

    addObjectiveScore(id: number): void {
        const objective = this.findObjectiveById(id) as Objective;
        this.playerService.addScore(objective.score, this.playerIndex);
        objective.isCompleted = true;
        this.updateOpponentObjectives(id);
    }

    findObjectiveById(idToSearchFor: number): Objective | undefined {
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            for (let j = 0; j < NUMBER_OF_OBJECTIVES; j++) {
                if (this.objectives[i][j].id === idToSearchFor) return this.objectives[i][j];
            }
        }
        return undefined;
    }
}
