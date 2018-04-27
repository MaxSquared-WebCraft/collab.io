import {Observable, throwError as observableThrowError} from 'rxjs';

import {map, share} from 'rxjs/operators';
// file: server-socket.service.ts
import {Injectable} from '@angular/core'
import {QueueingSubject} from 'queueing-subject'
import websocketConnect from 'rxjs-websockets'


@Injectable()
export class ServerSocket {
  public messages: Observable<string>;
  private inputStream: QueueingSubject<string>;

  public connect() {
    if (this.messages)
      return;

    // Using share() causes a single websocket to be created when the first
    // observer subscribes. This socket is shared with subsequent observers
    // and closed when the observer count falls to zero.
    this.messages = websocketConnect(
      'ws://127.0.0.1:1337/ws',
      this.inputStream = new QueueingSubject<string>()
    ).messages.pipe(map((message: string) => {
      try {
        let msg: any = JSON.parse(message);
        return ({time: msg.data.time, ...JSON.parse(msg.data.utf8Data)});
      } catch (e) {
        return observableThrowError(e);
      }
    }), share(),)
  }

  public send(message: string): void {
    // If the websocket is not connected then the QueueingSubject will ensure
    // that messages are queued and delivered when the websocket reconnects.
    // A regular Subject can be used to discard messages sent when the websocket
    // is disconnected.
    this.inputStream.next(message)
  }
}
