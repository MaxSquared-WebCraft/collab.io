import { Component } from '@angular/core';

@Component({
  selector: 'room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.css']
})
export class RoomPageComponent {

  constructor() { }

  onJoinRoom(roomName: string) {
    console.log('join room', roomName)
  }

  onCreateNewRoom(roomName: string) {
    console.log('create room', roomName)
  }

}
