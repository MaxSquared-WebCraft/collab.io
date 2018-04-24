import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {DrawingSurfaceComponent} from "./drawing-surface/drawing-surface.component";
import {DrawingSurfaceControlsComponent} from "./drawing-surface/drawing-surface-controls/drawing-surface-controls.component";
import {DrawingSurfaceToolComponent} from "./drawing-surface/drawing-surface-tool/drawing-surface-tool.component";
import {ColorPickerModule} from "ngx-color-picker";
import {PolygonService} from "./drawing-surface/shared/services/polygon.service";
import {RenderService} from "./drawing-surface/shared/services/render.service";
import {SimplifyService} from "./drawing-surface/shared/services/simplify.service";
import {ServerSocket} from "./drawing-surface/shared/services/websocket.service";
import {ClarityModule} from "@clr/angular";

@NgModule({
  declarations: [
    AppComponent,
    DrawingSurfaceComponent,
    DrawingSurfaceControlsComponent,
    DrawingSurfaceToolComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    ColorPickerModule
  ],
  providers: [
    PolygonService,
    RenderService,
    SimplifyService,
    ServerSocket
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
