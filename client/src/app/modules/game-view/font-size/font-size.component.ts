import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DEFAULT_FONT_SIZE, FONT_SIZE_MAX, FONT_SIZE_MIN, SIZE_VARIATION } from '@app/classes/constants';

@Component({
    selector: 'app-font-size',
    templateUrl: './font-size.component.html',
    styleUrls: ['./font-size.component.scss'],
})
export class FontSizeComponent {
    @Input() fontSize: number = DEFAULT_FONT_SIZE;
    @Output() sizeChange = new EventEmitter<number>();
    decrement() {
        this.resize(-SIZE_VARIATION);
    }
    increment() {
        this.resize(+SIZE_VARIATION);
    }

    resize(delta: number) {
        this.fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, +this.fontSize + delta));
        this.sizeChange.emit(this.fontSize);
    }
}