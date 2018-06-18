import {Component, OnInit} from '@angular/core';
import {SocketService} from '../../shared/services/websocket.service';
import {RenderService} from '../shared/services/render.service';

@Component({
  selector: 'mnb-drawing-surface-user-indicator',
  templateUrl: './drawing-surface-user-indicator.component.html',
  styleUrls: ['./drawing-surface-user-indicator.component.scss']
})
export class DrawingSurfaceUserIndicatorComponent implements OnInit {

  public x = 10;
  public y = 10;

  constructor(private socketServer: SocketService,
              private renderService: RenderService) {
    // this.socketServer.messages.subscribe(
    //   (point: any) => {
    //     try {
    //       if (point && point.data && point.data.position) {
    //         let p = this.renderService.mapScreenToMouse({
    //           thickness: 1,
    //           position: new Vector2(point.data.position.x, point.data.position.y)
    //         });
    //         this.x = p.position.x - 7.5;
    //         this.y = p.position.y + 60 - 7.5;
    //       }
    //     } catch (e) {
    //
    //     }
    //   },
    //   (error) => console.error(error)
    // )
  }

  ngOnInit() {

  }
}
