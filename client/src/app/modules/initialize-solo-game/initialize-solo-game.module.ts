import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FormComponent } from './form/form.component';
import { LevelFieldComponent } from './level-field/level-field.component';
import { PlayerNameFieldComponent } from './player-name-field/player-name-field.component';
import { TimerFieldComponent } from './timer-field/timer-field.component';

@NgModule({
    declarations: [FormComponent, PlayerNameFieldComponent, TimerFieldComponent, LevelFieldComponent],
    imports: [
        CommonModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        AppRoutingModule,
    ],
    exports: [FormComponent],
})
export class InitializeSoloGameModule {}
