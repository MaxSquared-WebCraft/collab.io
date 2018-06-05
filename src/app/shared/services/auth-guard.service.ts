import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('not authorized, rerouting...');
      this.router.navigate(['']);
      return false;
    }
    return true;
  }


}
