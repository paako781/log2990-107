import { Injectable } from '@angular/core';
import { INDEX_REAL_PLAYER, MAX_NUMBER_OF_POSSIBILITY } from '@app/classes/constants';
import { PossibleWords } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@app/classes/vec2';
import { EndGameService } from '@app/services/end-game.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { PlayerService } from '@app/services/player.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { SwapLetterService } from '@app/services/swap-letter.service';
import { Subscription } from 'rxjs';
import { DebugService } from './debug.service';
import { SendMessageService } from './send-message.service';
import { LetterService } from './letter.service';

@Injectable({
    providedIn: 'root',
})
export class ChatboxService {
    tourSubscription: Subscription = new Subscription();
    tour: boolean;

    message: string = '';
    typeMessage: string = '';
    command: string = '';
    endGameEasel: string = '';

    debugMessage: PossibleWords[] = [];

    constructor(
        private playerService: PlayerService,
        private swapLetterService: SwapLetterService,
        private placeLetterService: PlaceLetterService,
        private debugService: DebugService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        public letterService: LetterService,
        public skipTurn: SkipTurnService,
    ) {}

    sendPlayerMessage(message: string) {
        this.typeMessage = 'player';
        this.message = message;
        if (!this.isValid()) {
            this.sendMessageService.displayMessageByType(this.message, 'error');
        }
        switch (this.command) {
            case 'debug': {
                this.executeDebug();
                break;
            }
            case 'passer': {
                this.executeSkipTurn();
                break;
            }
            case 'echanger': {
                this.executeSwap();
                break;
            }
            case 'placer': {
                this.executePlace();
                break;
            }
            case 'reserve': {
                this.executeReserve();
                break;
            }

            default: {
                break;
            }
        }
        this.command = ''; // reset value for next message
    }

    executeDebug() {
        this.debugService.switchDebugMode();
        if (this.debugService.isDebugActive) {
            this.sendMessageService.displayMessageByType('affichages de débogage activés', 'system');
            this.displayDebugMessage();
        } else {
            this.sendMessageService.displayMessageByType('affichages de débogage désactivés', 'system');
        }
    }
    executeSkipTurn() {
        if (this.skipTurn.isTurn) {
            this.endGameService.actionsLog.push('passer');
            this.sendMessageService.displayMessageByType(this.message, this.typeMessage);
            this.skipTurn.switchTurn();
        } else {
            this.sendMessageService.displayMessageByType("ERREUR : Ce n'est pas ton tour", 'error');
        }
    }

    executeReserve(): void {
        if (!this.debugService.isDebugActive) {
            this.sendMessageService.displayMessageByType('Commande non réalisable', 'error');
            this.message = '';
            return;
        }
        for (const letter of this.letterService.reserve) {
            this.message = 'system';
            this.sendMessageService.displayMessageByType(letter.value + ':' + letter.quantity.toString(), 'system');
            this.message = '';
        }
    }

    executeSwap() {
        if (this.skipTurn.isTurn) {
            this.endGameService.actionsLog.push('echanger');
            const messageSplitted = this.message.split(/\s/);

            if (this.swapLetterService.swapCommand(messageSplitted[1], INDEX_REAL_PLAYER)) {
                this.message = this.playerService.players[INDEX_REAL_PLAYER].name + ' : ' + this.message;
                this.sendMessageService.displayMessageByType(this.message, this.typeMessage);
                this.skipTurn.switchTurn();
            }
        } else {
            this.sendMessageService.displayMessageByType("ERREUR : Ce n'est pas ton tour", 'error');
        }
    }

    executePlace() {
        if (this.skipTurn.isTurn) {
            this.endGameService.actionsLog.push('placer');
            const messageSplitted = this.message.split(/\s/);
            const positionSplitted = messageSplitted[1].split(/([0-9]+)/);

            // Vector containing start position of the word to place
            const position: Vec2 = {
                x: Number(positionSplitted[1]) - 1,
                y: positionSplitted[0].charCodeAt(0) - 'a'.charCodeAt(0),
            };
            const orientation = positionSplitted[2];

            if (this.placeLetterService.placeCommand(position, orientation, messageSplitted[2], INDEX_REAL_PLAYER)) {
                this.sendMessageService.displayMessageByType(this.message, this.typeMessage);
            }
        } else {
            this.typeMessage = 'error';
            this.message = "ERREUR : Ce n'est pas ton tour";
        }
    }

    isValid(): boolean {
        if (this.message[0] !== '!') {
            this.sendMessageService.displayMessageByType(this.message, this.typeMessage);
            return true; // If it's a normal message, it's always valid
        }
        // If it's a command, we call the validation
        return this.isInputValid() && this.isSyntaxValid();
    }

    isInputValid(): boolean {
        const debugInput = /^!debug/g;
        const passInput = /^!passer/g;
        const swapInput = /^!échanger/g;
        const placeInput = /^!placer/g;

        if (debugInput.test(this.message) || passInput.test(this.message) || swapInput.test(this.message) || placeInput.test(this.message)) {
            return true;
        }

        this.message = "ERREUR : L'entrée est invalide";
        return false;
    }

    isSyntaxValid(): boolean {
        const debugSyntax = /^!debug$/g;
        const passSyntax = /^!passer$/g;
        const swapSyntax = /^!échanger\s([a-z]|[*]){1,7}$/g;
        const placeSyntax = /^!placer\s([a-o]([1-9]|1[0-5])[hv])\s([a-zA-Z\u00C0-\u00FF]|[*])+/g;

        let isSyntaxValid = true;

        if (debugSyntax.test(this.message)) {
            this.command = 'debug';
        } else if (passSyntax.test(this.message)) {
            this.command = 'passer';
        } else if (swapSyntax.test(this.message)) {
            this.command = 'echanger';
        } else if (placeSyntax.test(this.message)) {
            this.command = 'placer';
        } else {
            isSyntaxValid = false;
            this.message = 'ERREUR : La syntaxe est invalide';
        }
        return isSyntaxValid;
    }

    // Method which check the different size of table of possibility for the debug
    displayDebugMessage(): void {
        const nbPossibilities = this.debugService.debugServiceMessage.length;
        if (nbPossibilities === 0) {
            this.sendMessageService.displayMessageByType('Aucune possibilité de placement trouvée!', 'system');
        } else {
            for (let i = 0; i < Math.min(MAX_NUMBER_OF_POSSIBILITY, nbPossibilities); i++) {
                this.message = this.debugService.debugServiceMessage[i].word + ': -- ' + this.debugService.debugServiceMessage[i].point.toString();
                this.sendMessageService.displayMessageByType(this.message, 'system');
            }
        }
        this.debugService.clearDebugMessage();
    }

    displayFinalMessage(indexPlayer: number): void {
        if (!this.endGameService.isEndGame) return;
        this.sendMessageService.displayMessageByType('Fin de partie - lettres restantes', 'system');
        for (const letter of this.playerService.players[indexPlayer].letterTable) {
            this.endGameEasel += letter.value;
        }
        this.sendMessageService.displayMessageByType(this.playerService.players[indexPlayer].name + ' : ' + this.endGameEasel, 'system');
        // Clear the string
        this.endGameEasel = '';
    }
}
