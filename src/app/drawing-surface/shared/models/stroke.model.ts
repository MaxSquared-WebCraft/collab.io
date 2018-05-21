import {Color, Vector2} from 'three';
import {Point} from './point.model';

export class Stroke {
  public points: Point[] = [];

  constructor(public color: Color) {
  }

  public getSmoothedStroke() {
    if (this.points.length > 2) {
      const renderList: Point[] = [];
      renderList.push(this.points[0]);
      for (let i = 2; i < this.points.length; i++) {
        const prev2 = this.points[i - 2];
        const prev1 = this.points[i - 1];
        const cur = this.points[i];

        const midPoint1 = prev1.position.clone().add(prev2.position).multiplyScalar(0.5);
        const midPoint2 = cur.position.clone().add(prev1.position).multiplyScalar(0.5);

        const segmentDistance = 2;
        const distance = midPoint1.distanceTo(midPoint2);
        const numberOfSegments = Math.min(16, Math.max(Math.floor(distance / segmentDistance), 32));

        let t = 0.0;
        const step = 1.0 / numberOfSegments;
        for (let j = 0; j < numberOfSegments; j++) {
          const newPoint = new Point(new Vector2(0, 0), 0.1);

          newPoint.position = midPoint1.clone().multiplyScalar(Math.pow(1 - t, 2))
            .add(prev1.position.clone().multiplyScalar(2.0 * (1 - t) * t))
            .add(midPoint2.clone().multiplyScalar(t * t));

          newPoint.thickness =
            (Math.pow(1 - t, 2) * ((prev1.thickness + prev2.thickness) * 0.5) +
              2.0 * (1 - t) * t * prev1.thickness + t * t * ((cur.thickness + prev1.thickness) * 0.5));

          renderList.push(newPoint);
          t += step;
        }
      }
      renderList.push(this.points[this.points.length - 1]);
      return renderList;
    } else {
      return this.points;
    }
  }
}
