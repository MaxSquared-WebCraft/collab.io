import {Directive, Input, OnInit} from '@angular/core';
import * as THREE from 'three';
import {BufferAttribute, Color, Mesh, MeshBasicMaterial, Vector2} from 'three';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../drawing-surface/shared/models/point.model';

const MAX_POINTS = 25000;

@Directive({selector: 'three-stroke'})
export class StrokeComponent implements OnInit {
  object: THREE.Mesh;
  debugMesh: THREE.Mesh;

  @Input() strokeInput$: Observable<Point>;
  @Input() updateCallback$: Subject<Point>;
  @Input() currentColor = new Color(0xFF0000);

  private verticesIdx = 0;
  private indicesIdx = 0;
  private verticesCount = 0;
  private finalized = false;
  private new = true;

  private lastPoint: Point;
  private controlPoint: Point;

  ngOnInit() {
    this.strokeInput$.subscribe(
      (point: Point) => this.updateGeometry(point),
      null,
      () => this.updateGeometry(this.lastPoint, true)
    );
  }

  updateGeometry(point: Point, strokeEnd: boolean = false): void {
    const obj = this.getBuffers();
    const vertices: any = obj.vertices || [];
    const indices: any = obj.indices || [];

    if (!this.lastPoint) {
      this.lastPoint = point;
      this.new = true;
      return;
    }

    if (!this.controlPoint) {
      this.createPoint(this.lastPoint, point, vertices, indices);
      this.controlPoint = this.lastPoint;
      return;
    }

    if (strokeEnd) {
      this.createPoint(point, this.lastPoint, vertices, indices);
    } else {
      const renderList = [];
      const prev2 = this.lastPoint;
      const prev1 = this.controlPoint;
      const cur = point;

      const midPoint1 = prev1.position.clone().add(prev2.position).multiplyScalar(0.5);
      const midPoint2 = cur.position.clone().add(prev1.position).multiplyScalar(0.5);

      const segmentDistance = 2;
      const distance = midPoint1.distanceTo(midPoint2);
      const numberOfSegments = Math.max(Math.floor(distance / segmentDistance), 8);

      let t = 0.0;
      const step = 1.0 / numberOfSegments;
      for (let j = 0; j < numberOfSegments; j++) {
        const newPoint = new Point(0, 0, new Vector2(0, 0), 0.1);

        newPoint.position = midPoint1.clone().multiplyScalar(Math.pow(1 - t, 2))
          .add(prev1.position.clone().multiplyScalar(2.0 * (1 - t) * t))
          .add(midPoint2.clone().multiplyScalar(t * t));

        newPoint.thickness =
          (Math.pow(1 - t, 2) * ((prev1.thickness + prev2.thickness) * 0.5) +
            2.0 * (1 - t) * t * prev1.thickness + t * t * ((cur.thickness + prev1.thickness) * 0.5));

        renderList.push(newPoint);
        t += step;
      }

      for (let i = 1; i < renderList.length; i++) {
        const currentPoint: Vector2 = renderList[i].position;
        const currentPressure: number = renderList[i].thickness;
        const lastPoint: Vector2 = renderList[i - 1].position;
        const lastPressure: number = renderList[i - 1].thickness;

        let A, B, C, D: Vector2;
        const dir = new Vector2().subVectors(currentPoint, lastPoint);
        const perpendicular = this.perp(dir).normalize();

        if (this.new) {
          A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
          B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
          C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
          D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));
          this.new = false;

          vertices[this.verticesIdx++] = A.x;
          vertices[this.verticesIdx++] = A.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          vertices[this.verticesIdx++] = B.x;
          vertices[this.verticesIdx++] = B.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          vertices[this.verticesIdx++] = C.x;
          vertices[this.verticesIdx++] = C.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          vertices[this.verticesIdx++] = D.x;
          vertices[this.verticesIdx++] = D.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          const vertCount = this.verticesIdx / 3 - 4;

          indices[this.indicesIdx++] = vertCount + 1;  // 1
          indices[this.indicesIdx++] = vertCount + 2;  // 2
          indices[this.indicesIdx++] = vertCount;      // 0

          indices[this.indicesIdx++] = vertCount;  // 0
          indices[this.indicesIdx++] = vertCount + 2;  // 2
          indices[this.indicesIdx++] = vertCount + 3;  // 3

        } else {
          C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
          D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

          vertices[this.verticesIdx++] = C.x;
          vertices[this.verticesIdx++] = C.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          vertices[this.verticesIdx++] = D.x;
          vertices[this.verticesIdx++] = D.y;
          vertices[this.verticesIdx++] = 2;
          this.verticesCount++;

          const vertCount = this.verticesIdx / 3 - 4;

          indices[this.indicesIdx++] = vertCount + 1;  // 1
          indices[this.indicesIdx++] = vertCount;      // 0
          indices[this.indicesIdx++] = vertCount + 2;  // 2

          indices[this.indicesIdx++] = vertCount + 2;  // 2
          indices[this.indicesIdx++] = vertCount + 3;  // 3
          indices[this.indicesIdx++] = vertCount + 1;  // 0
        }
      }

      const temp = this.controlPoint;
      this.controlPoint = point;
      this.lastPoint = temp;
    }

    const tempGeo: any = this.object.geometry;
    tempGeo.getIndex().needsUpdate = true;
    tempGeo.attributes.position.needsUpdate = true;
    tempGeo.setDrawRange(0, this.verticesIdx);
    this.updateCallback$.next();
  }

  createPoint(lastPoint: Point, point: Point, vertices: any[], indices: any[]) {
    function perp(vec: Vector2): Vector2 {
      const vector = new Vector2(0);
      const tmp = vec.y;
      vector.y = -vec.x;
      vector.x = tmp;
      return vector;
    }

    const numberOfSegments = 32;
    const anglePerSegment = (Math.PI * 2) / (numberOfSegments - 1);

    const dir = new Vector2().subVectors(point.position, lastPoint.position);
    const pendicular = perp(dir).normalize();

    let angle = Math.acos(pendicular.dot(new Vector2(0, 1)));
    const rightDot = pendicular.dot(new Vector2(1, 0));
    if (rightDot < 0) {
      angle *= -1;
    }

    let prevPoint = point.position;
    let prevDir = new Vector2(Math.sin(0), Math.cos(0));

    const startCount = this.verticesCount;

    for (let i = 0; i < numberOfSegments; ++i) {
      const direction = new Vector2(Math.sin(angle), Math.cos(angle));
      const curPoint = new Vector2(point.position.x + direction.x * point.thickness, point.position.y + point.thickness * direction.y);

      vertices[this.verticesIdx++] = prevPoint.x;
      vertices[this.verticesIdx++] = prevPoint.y;
      vertices[this.verticesIdx++] = 2;
      this.verticesCount++;

      vertices[this.verticesIdx++] = point.position.x;
      vertices[this.verticesIdx++] = point.position.y;
      vertices[this.verticesIdx++] = 2;

      this.verticesCount++;

      vertices[this.verticesIdx++] = curPoint.x;
      vertices[this.verticesIdx++] = curPoint.y;
      vertices[this.verticesIdx++] = 2;
      this.verticesCount++;

      prevPoint = curPoint;
      prevDir = direction;
      angle += anglePerSegment;
    }

    for (let i = 0; i < numberOfSegments; i++) {
      indices[this.indicesIdx++] = startCount + i * 3;  // 1
      indices[this.indicesIdx++] = startCount + (i * 3) + 1;      // 0
      indices[this.indicesIdx++] = startCount + (i * 3) + 2;  // 2
    }
  }

  perp(vec: Vector2): Vector2 {
    const vector = new Vector2(0);
    const tmp = vec.y;
    vector.y = -vec.x;
    vector.x = tmp;
    return vector;
  }

  private finalizeMesh(): void {
    function disposeArray() {
      this.array = null;
    }

    if (this.finalized) {
      return;
    }

    const tempGeo: any = this.object.geometry;
    const vertices = tempGeo.attributes.position.array.slice(0, this.verticesIdx);
    const indices = tempGeo.index.array.slice(0, this.indicesIdx);
    tempGeo.index = new BufferAttribute(indices, 1);
    tempGeo.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).onUpload(disposeArray));
    tempGeo.setDrawRange(0, this.verticesIdx);
    this.finalized = true;
  }

  private getBuffers() {
    let vertices: any;
    let indices: any;

    if (!this.object) {
      vertices = new Float32Array(MAX_POINTS * 3);
      indices = new Uint32Array(MAX_POINTS * 3); // TODO: Try with UInt16

      const geometry = new THREE.BufferGeometry();
      geometry.index = new BufferAttribute(indices, 1);
      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setDrawRange(0, 0);

      this.object = new Mesh(geometry, new MeshBasicMaterial({
        color: this.currentColor.getHex(), // TODO: Get color from tools service
        side: THREE.FrontSide
      }));

      // console.log(this.renderer.info);

      return {vertices, indices};
    } else {
      const tempGeo: any = this.object.geometry;

      // if (environment.debug) {
      //   const edges = new WireframeGeometry(tempGeo.clone());
      //   var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x00FF00}));
      //   this.scene.add(line);
      // }

      return {vertices: tempGeo.attributes.position.array, indices: tempGeo.index.array};
    }
  }
}
