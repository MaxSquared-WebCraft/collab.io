import { Point } from '../../drawing-surface/shared/models/point.model';
import { TokenUser } from './token-user.model';

export class SocketMessage {
  constructor(
    public point: Point,
    public user: TokenUser,
    public type: string,
  ) {}
}
