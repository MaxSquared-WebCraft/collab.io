import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {ThreeComponent} from './three.component';
import {RendererComponent} from './renderer.component';
import {SceneComponent} from './scene.component';

import {OrbitControlsComponent} from './controls/orbit.component';
import {StrokeComponent} from './objects/stroke-component.directive';
import {OrthograpicCameraDirective} from './cameras/orthograpic-camera-component.directive';

@NgModule({
  declarations: [
    ThreeComponent,
    RendererComponent,
    SceneComponent,
    OrthograpicCameraDirective,
    StrokeComponent,
    OrbitControlsComponent
  ],
  imports: [BrowserModule],
  exports: [ThreeComponent]
})
export class ThreeModule { }
