import {Injectable} from '@angular/core';
import {Point} from '../models/point.model';

/**
 * https://github.com/mourner/simplify-js
 */
@Injectable()
export class SimplifyService {
  public simplify(points: Point[], tolerance: number) {
    if (points.length <= 2) {
      return points;
    }

    const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    points = this.simplifyDouglasPeucker(points, sqTolerance);

    return points;
  }

  private getSqSegDist(p: Point, p1: Point, p2: Point) {
    let x = p1.position.x,
      y = p1.position.y,
      dx = p2.position.x - x,
      dy = p2.position.y - y;

    if (dx !== 0 || dy !== 0) {

      const t = ((p.position.x - x) * dx + (p.position.y - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = p2.position.x;
        y = p2.position.y;

      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.position.x - x;
    dy = p.position.y - y;

    return dx * dx + dy * dy;
  }

  private simplifyDPStep(points: Point[], first: number, last: number, sqTolerance: number, simplified: Point[]) {
    let maxSqDist = sqTolerance,
      index;

    for (let i = first + 1; i < last; i++) {
      const sqDist = this.getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) {
        this.simplifyDPStep(points, first, index, sqTolerance, simplified);
      }
      simplified.push(points[index]);
      if (last - index > 1) {
        this.simplifyDPStep(points, index, last, sqTolerance, simplified);
      }
    }
  }

  private simplifyDouglasPeucker(points: Point[], sqTolerance: number) {
    const last = points.length - 1;

    const simplified = [points[0]];
    this.simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
  }
}
