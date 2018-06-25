import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  constructor(private readonly authService: AuthService) { }

  public onSubmit(username: string, password: string) {
    this.authService.login(username, password);
  }
}
