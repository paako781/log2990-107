import { AppComponent } from '@app/pages/app/app.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameViewModule } from '@app/modules/game-view/game-view.module';
import { HttpClientModule } from '@angular/common/http';
import { InitializeSoloGameModule } from '@app/modules/initialize-solo-game/initialize-solo-game.module';
import { JoinRoomComponent } from '@app/pages/join-room/join-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@app/pages/page-not-found/page-not-found.component';
import { SharedModule } from '@app/modules/shared/shared.module';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { EditDictionaryDialogComponent } from './pages/admin-page/edit-dictionary-dialog/edit-dictionary-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        PageNotFoundComponent,
        WaitingRoomComponent,
        JoinRoomComponent,
        AdminPageComponent,
        EditDictionaryDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        GameViewModule,
        InitializeSoloGameModule,
        SharedModule,
        ClickOutsideModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
