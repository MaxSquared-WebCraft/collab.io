import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {DrawingSurfaceComponent} from './drawing-surface/drawing-surface.component';
import {DrawingSurfaceControlsComponent} from './drawing-surface/drawing-surface-controls/drawing-surface-controls.component';
import {DrawingSurfaceToolComponent} from './drawing-surface/drawing-surface-tool/drawing-surface-tool.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {RenderService} from './drawing-surface/shared/services/render.service';
import {SimplifyService} from './drawing-surface/shared/services/simplify.service';
import {ClarityModule} from '@clr/angular';
import {DrawingSurfaceUserIndicatorComponent} from './drawing-surface/drawing-surface-user-indicator/drawing-surface-user-indicator.component';
import {AppRoutingModule} from './app-routing.module';
import {AuthService} from './shared/services/auth.service';
import {JWT_OPTIONS, JwtModule} from '@auth0/angular-jwt';
import {jwtOptionsFactory} from './shared/lib/jwt-options.factory';
import {LoginPageComponent} from './authorization/login-page/login-page.component';
import {BaseUrlInterceptorService} from './shared/services/base-url-interceptor.service';
import {ThreeModule} from './three/three.module';
import {SocketService} from './drawing-surface/shared/services/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    DrawingSurfaceComponent,
    DrawingSurfaceControlsComponent,
    DrawingSurfaceToolComponent,
    DrawingSurfaceUserIndicatorComponent,
    LoginPageComponent,
    LoginPageComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    ColorPickerModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ThreeModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptorService, multi: true },
    RenderService,
    SimplifyService,
    SocketService,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
