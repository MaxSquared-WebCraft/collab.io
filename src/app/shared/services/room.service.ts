import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Room } from '../models/room.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private _room: Room;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) { }

  private setRoomAndNavigate = (room: Room) => {
    this._room = room;
    this.router.navigate(['/scribble']);
  };

  public getRoomByName(roomName: string): void {
    this.http
      .get<Room>('/room/name', { params: new HttpParams().set('name', roomName) })
      .subscribe(this.setRoomAndNavigate,(error) => console.error('could find room', error));
  }

  public createRoom(roomName: string): void {
    this.http
      .post<Room>('/room', { name: roomName })
      .subscribe(this.setRoomAndNavigate, (error) => console.error('error creating room', error));
  }

  public getRoomOfUser(): void {
    this.http
      .get<Room>('/room')
      .subscribe(this.setRoomAndNavigate,(error) => console.error('got no room, must not connect', error));
  }

  get Room(): Room {
    return this._room;
  }
}
