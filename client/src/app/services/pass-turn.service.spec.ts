import { TestBed } from '@angular/core/testing';
import { PassTurnService } from './pass-turn.service';

describe('PassTurnService', () => {
    let service: PassTurnService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PassTurnService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call updated func when changing message', () => {
        let number = 1;
        const message = 'test message';
        const fn = () => {
            number = number *= 2;
            return;
        };
        service.updateTurn(fn);
        expect(service.updateFunc).toBe(fn);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const funcSpy = spyOn<any>(service, 'func');
        service.writeMessage(message);
        expect(funcSpy).toHaveBeenCalled();
    });
});