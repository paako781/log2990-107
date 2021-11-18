/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_AI_INDEX, PLAYER_TWO_INDEX, RESERVE } from '@app/classes/constants';
import { Letter } from '@common/letter';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { GameSettings } from '@common/game-settings';
import { Socket } from 'socket.io-client';
import { InformationPanelComponent } from './information-panel.component';

describe('InformationPanelComponent', () => {
    let component: InformationPanelComponent;
    let fixture: ComponentFixture<InformationPanelComponent>;
    let skipTurnSpy: jasmine.SpyObj<SkipTurnService>;

    beforeEach(() => {
        skipTurnSpy = jasmine.createSpyObj('SkipTurnService', ['startTimer', 'stopTimer']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InformationPanelComponent],
            providers: [{ provide: SkipTurnService, useValue: skipTurnSpy }],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationPanelComponent);
        component = fixture.componentInstance;
        component['gameSettings'] = new GameSettings(
            ['Paul', 'Mike'],
            1,
            '00',
            '30',
            'facile',
            'Désactiver',
            "[['A1', 'doubleLetter'], ['A4', 'tripleLetter']]",
            'français',
        );
        fixture.detectChanges();
        jasmine.clock().install();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should call clearPlayers on Destroy', () => {
        spyOn(component.playerService, 'clearPlayers');
        component.ngOnDestroy();
        expect(component.playerService.clearPlayers).toHaveBeenCalled();
        expect(skipTurnSpy.stopTimer).toHaveBeenCalled();
    });

    it('the emit receiveRoomMessage should call sendOpponentMessage', () => {
        const lettersReceived = [RESERVE[0], RESERVE[1], RESERVE[2]];
        component['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (letterTable: Letter[]) => void) => {
                if (eventName === 'receivePlayerTwo') {
                    callback(lettersReceived);
                }
            },
        } as unknown as Socket;
        spyOn(component['letterService'], 'removeLettersFromReserve');
        component.receivePlayerTwo();
        expect(component['playerService'].players[PLAYER_TWO_INDEX].letterTable).toEqual(lettersReceived);
        expect(component['letterService'].removeLettersFromReserve).toHaveBeenCalled();
    });

    it('initializing players while on solo mode should add the AI player', () => {
        component['gameSettingsService'].isSoloMode = true;
        component['playerService'].players = [];
        component.initializePlayers();
        expect(component['playerService'].players[PLAYER_AI_INDEX].name).toEqual('Mike');
    });
});
