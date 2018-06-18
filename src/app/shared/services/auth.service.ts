import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { TokenUser } from '../models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly tokenName = environment.tokenName;
  private user: TokenUser;

  constructor(
    private readonly jwtHelper: JwtHelperService,
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.user = null;
  }

  public setToken(token?: string): void {
    if (this.user !== null) this.user = null;
    localStorage.setItem(this.tokenName, token);
  }

  public getToken(): string {
    return localStorage.getItem(this.tokenName);
  }

  public getUserFromToken(): TokenUser {
    if(this.user !== null) return this.user;
    const user = this.safelyDecodeToken(this.getToken());
    this.user = user;
    return user;
  }

  public isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getToken())
  }

  public login(username: string, password: string) {
    this.http
      .post('/user/login', { username, password })
      .subscribe((token: string) => {
        this.setToken(token);
        this.router.navigate(['/rooms'])
      })
  }

  private safelyDecodeToken(token: string): TokenUser {
    try { return this.jwtHelper.decodeToken(token); }
    catch { return null; }
  }
}
