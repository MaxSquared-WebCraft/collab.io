import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DrawingSurfaceComponent} from './drawing-surface/drawing-surface.component';
import {LoginPageComponent} from './authorization/login-page/login-page.component';
import {LoggedInGuardService} from './shared/services/logged-in-guard.service';

const routes: Routes = [
  {
    path: 'scribble',
    component: DrawingSurfaceComponent,
    // canActivate: [AuthGuardService],
  },
  {
    path: '',
    component: LoginPageComponent,
    canActivate: [LoggedInGuardService]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
