import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Room } from '../models/room.model';
import { SocketService } from './websocket.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private room: Room;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly socketService: SocketService,
  ) { }

  public getRoomByName(roomName: string): void {
    this.http
      .get<Room>('/room/name', { params: new HttpParams().set('name', roomName)})
      .subscribe((room) => {
        this.room = room;
        console.log('fetched room', room)
      })
  }

  public createRoom(roomName: string): void {
    this.http
      .post<Room>('/room', { name: roomName })
      .subscribe((room) => {
        this.room = room;
        console.log('created room', room)
      })
  }
}
