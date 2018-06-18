import { User } from './user.model';

export class Room {
  constructor(
    uuid: string,
    name: string,
    users: User[]
  ) {}
}
