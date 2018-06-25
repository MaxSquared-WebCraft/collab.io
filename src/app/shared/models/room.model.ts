import { User } from './user.model';

export class Room {
  constructor(
    public uuid: string,
    public name: string,
    public users: User[]
  ) {}
}
