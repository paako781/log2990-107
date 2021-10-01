import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MouseButton } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid.service';
@Component({
    selector: 'app-scrabble-board',
    templateUrl: './scrabble-board.component.html',
    styleUrls: ['./scrabble-board.component.scss'],
})
export class ScrabbleBoardComponent implements /* OnInit,*/ AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    constructor(private readonly gridService: GridService) {}
    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }
    // ngOnInit(): void {
    //     this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     this.gridService.drawGrid();
    //     this.gridCanvas.nativeElement.focus();
    // }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
        this.gridService.setGridContext(this.gridService.gridContext);
    }

    get width(): number {
        return this.gridService.width;
    }

    get height(): number {
        return this.gridService.height;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
        console.log(this.mousePosition);
    }
}
