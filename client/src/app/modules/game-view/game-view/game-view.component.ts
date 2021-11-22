import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_FONT_SIZE } from '@app/classes/constants';
import { GiveUpGameDialogComponent } from '@app/modules/game-view/give-up-game-dialog/give-up-game-dialog.component';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ChatboxService } from '@app/services/chatbox.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GridService } from '@app/services/grid.service';
import { PlayerService } from '@app/services/player.service';
import { SendMessageService } from '@app/services/send-message.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-game-view',
    templateUrl: './game-view.component.html',
    styleUrls: ['./game-view.component.scss'],
})
export class GameViewComponent implements OnInit {
    fontSize: number;

    constructor(
        public endGameService: EndGameService,
        public clientSocketService: ClientSocketService,
        private gridService: GridService,
        public gameSettingsService: GameSettingsService,
        public chatBoxService: ChatboxService,
        public boardHandlerService: BoardHandlerService,
        public skipTurnService: SkipTurnService,
        private playerService: PlayerService,
        public dialog: MatDialog,
        public sendMessageService: SendMessageService,
    ) {
        this.fontSize = DEFAULT_FONT_SIZE;
    }

    ngOnInit(): void {
        const mapBonus = new Map<string, string>();
        JSON.parse(this.gameSettingsService.gameSettings.bonusPositions).map((element: string[]) => {
            mapBonus.set(element[0], element[1]);
        });
        this.gridService.bonusPositions = mapBonus;
    }

    handleFontSizeEvent(fontSizeEvent: number): void {
        this.fontSize = fontSizeEvent;
        this.playerService.updateFontSize(this.fontSize);
    }

    giveUpGame(): void {
        const ref = this.dialog.open(GiveUpGameDialogComponent, { disableClose: true });

        ref.afterClosed().subscribe((hasGivenUp: boolean) => {
            // if user closes the dialog box without input nothing
            if (!hasGivenUp) return;
            // if decision is true the EndGame occurres
            this.clientSocketService.socket.emit('sendEndGameByGiveUp', hasGivenUp, this.clientSocketService.roomId);
            this.sendMessageService.sendConversionMessage();
        });
    }
}
