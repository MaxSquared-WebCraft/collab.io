import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root'
})
export class RoomGuardService implements CanActivate {

  constructor(
    private readonly roomService: RoomService,
    private readonly router: Router,
  ) { }

  canActivate(): boolean {
    if (!this.roomService.Room) {
      this.router.navigate(['/rooms']);
      return false;
    }
    return true
  }
}
