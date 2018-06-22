import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueueingSubject } from 'queueing-subject';
import { RoomService } from './room.service';
import { connect } from 'socket.io-client';
import { environment } from '@environment';
import { AuthService } from './auth.service';
import { Room } from '../models/room.model';
import { share } from 'rxjs/operators';
import { SocketMessage } from '../models/socket-message.model';


@Injectable()
export class SocketService {
  public messages: Observable<SocketMessage>;
  private inputStream: QueueingSubject<string>;
  private connectedClients: any[]; // should contain observable of connected users and show positions
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

  /*
  public connect() {
    if (this.messages) {
      return;
    }

    this.messages = websocketConnect('ws://127.0.0.1:1337/ws',
      this.inputStream = new QueueingSubject<string>())
      .messages
      .pipe(
        map((message: string) => {
          try {
            const msg: any = JSON.parse(message);
            return ({ time: msg.data.time, ...JSON.parse(msg.data.utf8Data) });
          } catch (e) {
            return observableThrowError(e);
          }
        }),
        share()
      );
  }
  */

  public readonly send = (p: any): void => {
    this.socket.emit('message', p)
  }
}
