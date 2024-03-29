import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from 'three';
import { ThreeComponent } from '../three/three.component';
import { SocketService } from '../shared/services/websocket.service';
import { RoomService } from '../shared/services/room.service';

@Component({
  selector: 'mnb-drawing-surface',
  templateUrl: './drawing-surface.component.html',
  styleUrls: ['./drawing-surface.component.scss']
})
export class DrawingSurfaceComponent implements OnInit {
  @ViewChild(ThreeComponent) threeComponent: ThreeComponent;
  width: number;
  height: number;

  constructor(
    private readonly socketService: SocketService,
    private readonly roomService: RoomService,
  ) {
    this.height = window.innerHeight - 2 * 60;
    this.width = window.innerWidth;
  }

  ngOnInit(): void {
    this.socketService.connectSocketIo(this.roomService.Room)
  }

  @HostListener('window:resize')
  resetWidthHeight() {
    this.height = window.innerHeight - 2 * 60;
    this.width = window.innerWidth;
  }

  colorChanged(color: string) {
    if (this.threeComponent) {
      this.threeComponent.color = new Color(color);
    }
  }
}
