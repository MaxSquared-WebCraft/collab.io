import { Component } from '@angular/core';
import { RoomService } from '../../shared/services/room.service';

@Component({
  selector: 'room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.css']
})
export class RoomPageComponent {

  constructor(
    private readonly roomService: RoomService,
  ) { }

  onJoinRoom(roomName: string) {
    console.log('join room', roomName);
    this.roomService.getRoomByName(roomName);
  }

  onCreateNewRoom(roomName: string) {
    console.log('create room', roomName);
    this.roomService.createRoom(roomName);
  }

}
