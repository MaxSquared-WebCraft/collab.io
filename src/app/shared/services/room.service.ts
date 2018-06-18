import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private room;

  constructor(
    private readonly http: HttpClient,
  ) { }
}
