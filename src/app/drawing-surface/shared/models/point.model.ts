import {Vector2} from 'three';

export class Point {
  constructor(public identifier: number,
              public time: number,
              public position: Vector2,
              public thickness: number) {
  }
}
