/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { BOARD_COLUMNS, BOARD_ROWS } from '@app/classes/constants';
import { ScoreValidation } from '@app/classes/validation-score';
import { WordValidationService } from './word-validation.service';

describe('WordValidationService', () => {
    let service: WordValidationService;
    const scrabbleBoard: string[][] = [];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WordValidationService);
        for (let i = 0; i < BOARD_ROWS; i++) {
            scrabbleBoard[i] = [];
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                // To generate a grid with some letters anywhere on it
                if ((i + j) % 11 === 0) {
                    scrabbleBoard[i][j] = 'X';
                } else {
                    scrabbleBoard[i][j] = '';
                }
            }
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should pass through all rows and columns', () => {
        service.newWords = ['', 'mais', ''];
        service.newPlayedWords.set('mAsse', ['A1', 'A2', 'A3', 'A4', 'A5']);
        service.playedWords.set('mAsse', ['A1', 'A2', 'A3', 'A4', 'A5']);
        const isEaselSize = true;
        const passThroughAllRowsSpy = spyOn(service, 'passTroughAllRows').and.callThrough();
        const passThroughAllColumnsSpy = spyOn(service, 'passThroughAllColumns').and.callThrough();
        const calculateLettersScoreSpy = spyOn(service, 'calculateLettersScore').and.callThrough();
        service.validateAllWordsOnBoard(scrabbleBoard, isEaselSize);
        expect(passThroughAllRowsSpy).toHaveBeenCalledTimes(1);
        expect(passThroughAllColumnsSpy).toHaveBeenCalledTimes(1);
        expect(calculateLettersScoreSpy).toHaveBeenCalled();
    });

    it('should calculateLetterScore and calculate word bonuses if the word touch a wordBonuses position', () => {
        service.newWords = ['', 'mais', ''];
        service.newPlayedWords.set('mAsse', ['A1', 'A2', 'A3', 'A4', 'A5']);
        service.playedWords.set('mAsse', ['A1', 'A2', 'A3', 'A4', 'A5']);
        const isEaselSize = false;
        const passThroughAllRowsSpy = spyOn(service, 'passTroughAllRows').and.callThrough();
        const passThroughAllColumnsSpy = spyOn(service, 'passThroughAllColumns').and.callThrough();
        const calculateLettersScoreSpy = spyOn(service, 'calculateLettersScore').and.callThrough();
        const applyBonusesWordSpy = spyOn(service, 'applyBonusesWord').and.callThrough();
        service.validateAllWordsOnBoard(scrabbleBoard, isEaselSize);
        expect(passThroughAllRowsSpy).toHaveBeenCalledTimes(1);
        expect(passThroughAllColumnsSpy).toHaveBeenCalledTimes(1);
        expect(calculateLettersScoreSpy).toHaveBeenCalled();
        expect(applyBonusesWordSpy).toHaveBeenCalled();
        // m has 2 points and a has 1 point
    });

    it('should call addToPlayedWords if word is not already played', () => {
        const posSpy = spyOn(service, 'getWordPositionsVertical');
        const playedSpy = spyOn(service, 'checkIfNotPlayed').and.returnValue(true);
        const addSpy = spyOn(service, 'addToPlayedWords');
        const findSpy = spyOn(service, 'findWords').and.returnValue(['test']);

        service.passThroughAllColumns(scrabbleBoard);

        expect(findSpy).toHaveBeenCalled();
        expect(posSpy).toHaveBeenCalled();
        expect(playedSpy).toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalled();
    });

    it('should double the word score if the word is place on a double word tile', () => {
        service.bonusesPositions.set('a', 'doubleword');
        const initialScore = 35;
        expect(service.applyBonusesWord(initialScore, 'a')).toEqual(initialScore * 2);
    });

    it('should double the word score if the word is place on a double word tile', () => {
        service.bonusesPositions.set('p', 'tripleletter');
        const initialScore = 35;
        expect(service.calculateLettersScore(initialScore, 'a', 'p')).toEqual(initialScore + 1 * 3);
    });

    // it('should check if word is not already played including current turn', () => {
    //     service.playedWords.clear();
    //     service.newPlayedWords.set('p', ['A1']);
    //     expect(service.checkIfNotPlayed('test', ['p'])).toBeTrue();
    // });

    it('validate all words should be false once one word is not valid in dictionnary', () => {
        service.newWords = ['', 'is', ''];
        service.newPlayedWords.set('nrteu', ['A1', 'A2', 'A3', 'A4', 'A5']);
        service.playedWords.set('ma', ['B1', 'B2']);
        const isEaselSize = true;
        const expectedResult: ScoreValidation = { validation: false, score: 0 };
        const result = service.validateAllWordsOnBoard(scrabbleBoard, isEaselSize);
        expect(result).toEqual(expectedResult);
        // m has 2 points and a has 1 point
    });

    it('check if not played should return true if there is no matching played word', () => {
        const result = service.checkIfNotPlayed('ma', ['A1', 'A2']);
        expect(result).toEqual(true);
    });

    it('check if not played should return false if there is already a played word at the given position', () => {
        service.playedWords.set('ma', ['A1', 'A2']);
        const result = service.checkIfNotPlayed('ma', ['A1', 'A2']);
        expect(result).toEqual(false);
    });

    it('should be false if word is not valid in dictionnary', () => {
        const expectedResult = false;
        const isValid = service.isValidInDictionary('npm');
        expect(isValid).toEqual(expectedResult);
    });

    it('should be false if word has less than 2 letters', () => {
        const expectedResult = false;
        const isValid = service.isValidInDictionary('n');
        expect(isValid).toEqual(expectedResult);
    });

    it('should be true if word is valid in dictionnary', () => {
        const expectedResult = true;
        const isValid = service.isValidInDictionary('vrai');
        expect(isValid).toEqual(expectedResult);
    });

    it('add to playedWords should add the new position to the words map if the concerned word is already played', () => {
        const word = 'ma';
        const positions = ['H8', 'H9'];
        const playedWordsStub: Map<string, string[]> = new Map();
        playedWordsStub.set('ma', ['A1', 'A2']);
        service.addToPlayedWords(word, positions, playedWordsStub);
        expect(playedWordsStub.get(word)).toEqual(['A1', 'A2', 'H8', 'H9']);
    });

    it('should correctly return the letters positions of the vertically given word', () => {
        service.newWords = ['', '', '', 'm', 'a', ''];
        const expectedPositions = ['D8', 'E8'];
        const returnedPositions = service.getWordPositionsVertical('ma', 7);
        expect(returnedPositions).toEqual(expectedPositions);
    });
});
