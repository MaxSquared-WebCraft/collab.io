import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ThreeModule} from '../three/three.module';
import {DrawingSurfaceUserIndicatorComponent} from './drawing-surface/drawing-surface-user-indicator/drawing-surface-user-indicator.component';
import {DrawingSurfaceToolComponent} from './drawing-surface/drawing-surface-tool/drawing-surface-tool.component';
import {DrawingSurfaceControlsComponent} from './drawing-surface/drawing-surface-controls/drawing-surface-controls.component';
import {DrawingSurfaceComponent} from './drawing-surface/drawing-surface.component';
import {SocketService} from './drawing-surface/shared/services/websocket.service';
import {ClarityModule} from '@clr/angular';
import {ColorPickerModule} from 'ngx-color-picker';
import {RenderService} from './drawing-surface/shared/services/render.service';

@NgModule({
  declarations: [
    AppComponent,
    DrawingSurfaceComponent,
    DrawingSurfaceControlsComponent,
    DrawingSurfaceToolComponent,
    DrawingSurfaceUserIndicatorComponent
  ],
  imports: [
    BrowserModule,
    ThreeModule,
    ClarityModule,
    ColorPickerModule
  ],
  providers: [
    SocketService,
    RenderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
