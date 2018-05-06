import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {ThreeComponent} from './three.component';
import {RendererComponent} from './renderer.component';
import {SceneComponent} from './scene.component';

import {PointLightComponent} from './lights/point-light.component';

import {OrbitControlsComponent} from './controls/orbit.component';

import {StrokeComponent} from './objects/stroke-component.directive';
import {TextureComponent} from './objects/texture.component';
import {SkyboxComponent} from './objects/skybox.component';
import {OrthograpicCameraDirective} from './cameras/orthograpic-camera-component.directive';

@NgModule({
  declarations: [
    ThreeComponent,
    RendererComponent,
    SceneComponent,
    OrthograpicCameraDirective,
    PointLightComponent,
    StrokeComponent,
    TextureComponent,
    SkyboxComponent,
    OrbitControlsComponent
  ],
  imports: [BrowserModule],
  exports: [ThreeComponent]
})
export class ThreeModule { }
