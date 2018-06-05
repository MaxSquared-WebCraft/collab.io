import { Component } from '@angular/core';
import { Login } from '../shared/Login';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  public model = new Login();

  constructor(private readonly authService: AuthService) { }

  public onSubmit() {
    this.authService.login(this.model.username, this.model.password)
  }
}
