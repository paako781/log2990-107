import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGameService } from '@app/services/end-game.service';

@Component({
    selector: 'app-give-up-game-dialog',
    templateUrl: './give-up-game-dialog.component.html',
    styleUrls: ['./give-up-game-dialog.component.scss'],
})
export class GiveUpGameDialogComponent {
    // TODO changer variable giveUpDialogref -> giveUpDialogRef
    constructor(public giveUpDialogref: MatDialogRef<GiveUpGameDialogComponent>, public router: Router, public endGameService: EndGameService) {}
}
