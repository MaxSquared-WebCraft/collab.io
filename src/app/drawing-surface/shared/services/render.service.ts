import {Color} from 'three';
import {Injectable} from '@angular/core';
import {SocketService} from '../../../shared/services/websocket.service';

declare let THREE: any;

@Injectable()
export class RenderService {
  private currentColor = new Color(0x000000);

  constructor(private serverSocket: SocketService) {
    this.serverSocket.connect();
  }
}
