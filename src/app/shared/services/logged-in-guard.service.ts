import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuardService implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      console.log('Already logged in, rerouting...');
      this.router.navigate(['/scribble']);
      return false;
    }
    return true;
  }

}
