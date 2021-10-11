import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IA_NAME_DATABASE } from '@app/classes/constants';
import { GameSettings, StartingPlayer } from '@app/classes/game-settings';
import { GameSettingsService } from '@app/services/game-settings.service';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class FormComponent {
    form = new FormGroup({
        playerName: new FormControl(''),
        minuteInput: new FormControl('01'),
        secondInput: new FormControl('00'),
        levelInput: new FormControl('Facile'),
    });

    constructor(public gameSettingsService: GameSettingsService) {}

    // Generates a random name for the AI
    chooseRandomAIName(): string {
        let randomName: string;
        do {
            // Number of seconds since 1st january 1970
            let randomNumber = new Date().getTime();
            // Multiplication by a random number [0,1[, which we get the floor
            randomNumber = Math.floor(Math.random() * randomNumber);
            // Random value [0, iaNameDatabase.length[
            randomName = IA_NAME_DATABASE[randomNumber % IA_NAME_DATABASE.length];
        } while (randomName === this.form.controls.playerName.value);
        return randomName;
    }

    // Chooses randomly the player that will play first
    chooseStartingPlayer(): StartingPlayer {
        const enumLength = Object.keys(StartingPlayer).length / 2;
        // Number of seconds since 1st january 1970
        let randomNumber = new Date().getTime();
        // Multiplication by a random number [0,1[, which we get the floor
        randomNumber = Math.floor(Math.random() * randomNumber);
        // Random value [0, enum.length[
        return randomNumber % enumLength;
    }

    // Initializes the game with its settings
    initGame(): void {
        const playersName: string[] = [this.form.controls.playerName.value, this.chooseRandomAIName()];
        this.gameSettingsService.gameSettings = new GameSettings(
            playersName,
            this.chooseStartingPlayer(),
            this.form.controls.minuteInput.value,
            this.form.controls.secondInput.value,
            this.form.controls.levelInput.value,
            false,
            'dictionary.json',
        );
    }
}
