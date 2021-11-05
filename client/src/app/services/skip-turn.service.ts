/* eslint-disable sort-imports */
import { Injectable } from '@angular/core';
import { ONE_SECOND_DELAY, THREE_SECONDS_DELAY } from '@app/classes/constants';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isTurn: boolean;
    minutes: number;
    seconds: number;
    // JUSTIFICATION : Next line is mandatory, NodeJS return an eslint issue
    // eslint-disable-next-line no-undef
    intervalID: NodeJS.Timeout;
    private playAiTurn: () => void;
    // TODO: Mike et PM revenez dessus
    constructor(
        public gameSettingsService: GameSettingsService,
        /* private endGameService: EndGameService,*/ private clientSocket: ClientSocketService,
    ) {
        this.clientSocket.socket.on('turnSwitched', (turn: boolean) => {
            this.isTurn = turn;
        });
        this.clientSocket.socket.on('startTimer', () => {
            this.stopTimer();
            this.startTimer();
        });
        this.clientSocket.socket.on('stopStimer', () => {
            this.stopTimer();
        });
    }
    bindAiTurn(fn: () => void) {
        this.playAiTurn = fn;
    }

    switchTurn(): void {
        // if (this.endGameService.isEndGame) {
        //     return;
        // }
        this.stopTimer();
        setTimeout(() => {
            if (this.gameSettingsService.isSoloMode) {
                setTimeout(() => {
                    if (this.isTurn) {
                        this.isTurn = false;
                        this.startTimer();
                        this.playAiTurn();
                    } else {
                        this.isTurn = true;
                        this.startTimer();
                    }
                }, ONE_SECOND_DELAY);
            } else {
                this.clientSocket.socket.emit('switchTurn', this.isTurn, this.clientSocket.roomId);
                this.isTurn = false;
            }
        }, THREE_SECONDS_DELAY);
    }

    startTimer(): void {
        this.minutes = parseInt(this.gameSettingsService.gameSettings.timeMinute, 10);
        this.seconds = parseInt(this.gameSettingsService.gameSettings.timeSecond, 10);
        this.intervalID = setInterval(() => {
            if (this.seconds === 0 && this.minutes !== 0) {
                this.minutes = this.minutes - 1;
                this.seconds = 59;
            } else if (this.seconds === 0 && this.minutes === 0) {
                if (this.isTurn) {
                    this.switchTurn();
                }
            } else {
                this.seconds = this.seconds - 1;
            }
        }, ONE_SECOND_DELAY);
    }

    stopTimer(): void {
        clearInterval(this.intervalID);
        this.minutes = 0;
        this.seconds = 0;
    }
}
