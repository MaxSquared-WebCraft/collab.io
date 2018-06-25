import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { RoomService } from './room.service';
import { connect } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Room } from '../models/room.model';
import { share } from 'rxjs/operators';
import { SocketMessage } from '../models/socket-message.model';
import { environment } from '../../../environments/environment';


@Injectable()
export class SocketService {
  public messages: Observable<SocketMessage>;
  private socket: SocketIOClient.Socket = null;

  constructor(
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
  ) {}

  connectSocketIo(room: Room) {

    console.log('connecting to websockets server');

    const auth = this.authService.getToken();
    const user = this.authService.getUserFromToken();

    this.socket = connect(environment.baseUrl, { query: { auth } });

    this.socket.on('connect', () => {
      console.log('socket connected, connecting to room', room);
      this.socket.emit('room', { userId: user.id, roomId: room.uuid });
    });

    this.messages = new Observable<SocketMessage>((subscriber => {
      this.socket.on('message', (message) => subscriber.next(message));
    })).pipe(share());
  }

  public readonly send = (p: any): void => {
    this.socket.emit('message', p)
  }
}
