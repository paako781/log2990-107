import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MouseHandlerService } from '@app/services/mouse-handler.service';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid.service';

@Component({
    selector: 'app-scrabble-board',
    templateUrl: './scrabble-board.component.html',
    styleUrls: ['./scrabble-board.component.scss'],
})
export class ScrabbleBoardComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    constructor(private readonly gridService: GridService, private mouseService: MouseHandlerService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
    }

    get width(): number {
        return this.gridService.width;
    }

    get height(): number {
        return this.gridService.height;
    }

    mouseHitDetect(event: MouseEvent) {
        this.mouseService.mouseHitDetect(event);
    }
}
