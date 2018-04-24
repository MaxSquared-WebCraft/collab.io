// file: server-socket.service.ts
import {Injectable} from '@angular/core'
import {QueueingSubject} from 'queueing-subject'
import {Observable} from 'rxjs/Observable'
import websocketConnect from 'rxjs-websockets'
import 'rxjs/add/operator/share'

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
    ).messages.share()
  }

  public send(message: string): void {
    // If the websocket is not connected then the QueueingSubject will ensure
    // that messages are queued and delivered when the websocket reconnects.
    // A regular Subject can be used to discard messages sent when the websocket
    // is disconnected.
    this.inputStream.next(message)
  }
}
