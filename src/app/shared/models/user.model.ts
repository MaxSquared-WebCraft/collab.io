export class TokenUser {
  constructor(
    public username: string,
    public id: number,
    public exp: number,
    public iat: number,
  ) {}
}
