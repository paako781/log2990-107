import { Injectable } from '@angular/core';
import { PossibleWords } from '@app/classes/scrabble-board-pattern';

@Injectable({
    providedIn: 'root',
})
export class DebugService {
    debugServiceMessage: PossibleWords[] = [];
    debugActivate: string[] = [];
    isDebugActive: boolean = false;

    receiveAIDebugPossibilities(table: PossibleWords[]): void {
        this.debugServiceMessage = table;
    }

    clearDebugMessage(): void {
        this.debugServiceMessage = [];
    }

    switchDebugMode(): void {
        this.isDebugActive = !this.isDebugActive;
    }
}
