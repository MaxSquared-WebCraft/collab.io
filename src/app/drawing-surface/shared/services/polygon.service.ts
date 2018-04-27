import {Injectable} from '@angular/core';
import {BufferGeometry, Geometry, Mesh, MeshBasicMaterial, Vector2} from 'three';
import {Stroke} from '../models/stroke.model';

declare let THREE: any;

@Injectable()
export class PolygonService {

  addStroke(stroke: Stroke): Mesh {
    if (stroke.points.length === 1) {
      return;
    }

    let idx = 0;
    const geometry = new THREE.Geometry();
    let newLine = true;
    const points = stroke.getSmoothedStroke();
    let oldA: Vector2;
    let oldB: Vector2;

    for (let i = 1; i < points.length; i++) {
      const currentPoint: Vector2 = points[i].position;
      const currentPressure: number = points[i].thickness;
      const lastPoint: Vector2 = points[i - 1].position;
      const lastPressure: number = points[i - 1].thickness;

      let A, B, C, D: Vector2;
      const dir = new Vector2().subVectors(currentPoint, lastPoint);
      const perpendicular = this.perp(dir).normalize();

      if (newLine) {
        A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
        B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
        newLine = false;
      } else {
        A = oldA;
        B = oldB;
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
      }

      let face = new THREE.Face3(idx, ++idx, ++idx);
      geometry.vertices.push(
        new THREE.Vector3(A.x, A.y, 2),
        new THREE.Vector3(B.x, B.y, 2),
        new THREE.Vector3(C.x, C.y, 2)
      );
      geometry.faces.push(face);

      face = new THREE.Face3(++idx, ++idx, ++idx);
      geometry.vertices.push(
        new THREE.Vector3(C.x, C.y, 2),
        new THREE.Vector3(D.x, D.y, 2),
        new THREE.Vector3(A.x, A.y, 2)
      );
      geometry.faces.push(face);
      idx++;
    }

    const material = new MeshBasicMaterial({
      color: stroke.color.getHex(),
      side: THREE.FrontSide
    });
    return new Mesh(geometry, material);
  }

  addStrokeBufferGeometry(stroke: Stroke): Mesh {

    function disposeArray() {
      this.array = null;
    }

    if (stroke.points.length === 1) {
      return;
    }

    let idx = 0;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    let newLine = true;
    const points = stroke.getSmoothedStroke();
    let oldA: Vector2;
    let oldB: Vector2;

    for (let i = 1; i < points.length; i++) {
      const currentPoint: Vector2 = points[i].position;
      const currentPressure: number = points[i].thickness;
      const lastPoint: Vector2 = points[i - 1].position;
      const lastPressure: number = points[i - 1].thickness;

      let A, B, C, D: Vector2;
      const dir = new Vector2().subVectors(currentPoint, lastPoint);
      const perpendicular = this.perp(dir).normalize();

      if (newLine) {
        A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
        B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
        newLine = false;
      } else {
        A = oldA;
        B = oldB;
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
      }

      vertices.push(A.x, A.y, 2,
        B.x, B.y, 2,
        C.x, C.y, 2);

      vertices.push(C.x, C.y, 2,
        D.x, D.y, 2,
        A.x, A.y, 2);
    }

    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).onUpload(disposeArray));

    const material = new MeshBasicMaterial({
      color: stroke.color.getHex(),
      side: THREE.FrontSide
    });
    return new Mesh(geometry, material);
  }

  getLiveStrokeGeometry(stroke: Stroke): Geometry {
    if (stroke.points.length === 1) {
      return;
    }

    let idx = 0;
    const geometry = new THREE.Geometry();
    let newLine = true;
    const points = stroke.getSmoothedStroke();
    let oldA: Vector2;
    let oldB: Vector2;

    for (let i = 1; i < points.length; i++) {
      const currentPoint: Vector2 = points[i].position;
      const currentPressure: number = points[i].thickness;
      const lastPoint: Vector2 = points[i - 1].position;
      const lastPressure: number = points[i - 1].thickness;

      let A, B, C, D: Vector2;
      const dir = new Vector2().subVectors(currentPoint, lastPoint);
      const perpendicular = this.perp(dir).normalize();

      if (newLine) {
        A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
        B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
        newLine = false;
      } else {
        A = oldA;
        B = oldB;
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
      }

      let face = new THREE.Face3(idx, ++idx, ++idx);
      geometry.vertices.push(
        new THREE.Vector3(A.x, A.y, 2),
        new THREE.Vector3(B.x, B.y, 2),
        new THREE.Vector3(C.x, C.y, 2)
      );
      geometry.faces.push(face);

      face = new THREE.Face3(++idx, ++idx, ++idx);
      geometry.vertices.push(
        new THREE.Vector3(C.x, C.y, 2),
        new THREE.Vector3(D.x, D.y, 2),
        new THREE.Vector3(A.x, A.y, 2)
      );
      geometry.faces.push(face);
      idx++;
    }
    return geometry;
  }

  getLiveStrokeBufferGeometry(stroke: Stroke): BufferGeometry {

    function disposeArray() {
      this.array = null;
    }


    if (stroke.points.length === 1) {
      return;
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    let newLine = true;
    const points = stroke.getSmoothedStroke();
    let oldA: Vector2;
    let oldB: Vector2;

    for (let i = 1; i < points.length; i++) {
      const currentPoint: Vector2 = points[i].position;
      const currentPressure: number = points[i].thickness;
      const lastPoint: Vector2 = points[i - 1].position;
      const lastPressure: number = points[i - 1].thickness;

      let A, B, C, D: Vector2;
      const dir = new Vector2().subVectors(currentPoint, lastPoint);
      const perpendicular = this.perp(dir).normalize();

      if (newLine) {
        A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
        B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
        newLine = false;
      } else {
        A = oldA;
        B = oldB;
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        oldA = D;
        oldB = C;
      }

      vertices.push(
        A.x, A.y, 2,
        B.x, B.y, 2,
        C.x, C.y, 2
      );

      vertices.push(
        C.x, C.y, 2,
        D.x, D.y, 2,
        A.x, A.y, 2
      );
    }

    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).onUpload(disposeArray));

    return geometry;
  }


  private perp(vec: Vector2): Vector2 {
    const vector = new Vector2(0);
    const tmp = vec.y;
    vector.y = -vec.x;
    vector.x = tmp;
    return vector;
  }
}
