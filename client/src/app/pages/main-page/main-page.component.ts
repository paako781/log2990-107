import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    selectedGameIndex: number = 0;
    selectedMode?: string;
    readonly games: string[] = ['Scrabble classique', 'Scrabble LOG2990'];
    readonly modes: string[] = ['Jouer une partie en solo', 'Créer une partie multijoueur', 'Joindre une partie multijoueur'];
    resetRadios() {
        this.selectedMode = undefined;
    }
}
