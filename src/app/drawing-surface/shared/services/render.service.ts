import {
  Color,
  Mesh,
  MeshBasicMaterial,
  OrbitControls,
  OrthographicCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import * as Stats from 'stats.js';
import {ElementRef, Injectable} from '@angular/core';
import {Point} from '../models/point.model';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import {ServerSocket} from "./websocket.service";

declare let THREE: any;
const MAX_POINTS = 1000000;

@Injectable()
export class RenderService {
  initialized = false;
  keyDown$: Observable<any>;
  mouseZoom$: Observable<any>;
  mouseDown$: Observable<Point>;
  mouseMove$: Observable<Point>;
  mouseDrawing$: Observable<Point>;
  mouseUp$: Observable<Point>;
  private stats: any;
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private mouseIsDown = false;
  private elementRef: ElementRef;
  private liveStrokeMesh: Mesh;
  private currentIndex = 0;
  private lastPoint;
  private controlPoint;
  private newLine = false;
  private oldA: Vector2;
  private oldB: Vector2;
  private currentColor = new Color(0x000000);

  constructor(private serverSocket: ServerSocket) {
    this.serverSocket.connect();
  }

  public init(elementRef: ElementRef) {
    this.elementRef = elementRef;
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, width, 0, height, 1, 1000);
    this.camera.position.set(0, 0, -100);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xFFFFFF);

    this.elementRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, elementRef.nativeElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = false;

    this.mouseDown$ = Observable
      .fromEvent(elementRef.nativeElement, 'pointerdown')
      .share()
      .map<any, Point>(this.mapMouseToScreen.bind(this))
      .do((point) => {
        this.mouseIsDown = true;
        return point;
      });

    this.mouseMove$ = Observable
      .fromEvent(elementRef.nativeElement, 'pointermove')
      .share()
      .map<any, Point>(this.mapMouseToScreen.bind(this));

    this.mouseDrawing$ = this.mouseMove$
      .filter(() => this.mouseIsDown);

    this.mouseUp$ = Observable
      .fromEvent(elementRef.nativeElement, 'pointerup')
      .share()
      .map<any, Point>(this.mapMouseToScreen.bind(this))
      .do((point) => {
        this.mouseIsDown = false;
        return point;
      });

    this.mouseMove$.subscribe(
      (point: Point) => this.serverSocket.send(JSON.stringify({
        type: "mouseMoved",
        data: {
          position: point.position,
        }
      }))
    );

    this.mouseZoom$ = Observable.fromEvent(elementRef.nativeElement, 'wheel').share();
    this.keyDown$ = Observable.fromEvent(window, 'keydown').share();


    this.mouseZoom$
      .debounceTime(60)
      .subscribe(
        () => this.render()
      );

    this.keyDown$
      .subscribe(
        () => this.render()
      );

    this.addStats();
    this.calculateFrame();
    this.initialized = true;
    setTimeout(() => this.onResize(), 300); // wait till view if fully initialized and fit to screen
    window.addEventListener('resize', _ => this.onResize());
  }

  public addStats() {
    this.stats = <any>new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = 56;
    // this.stats.dom.style.float = 'left';
    this.elementRef.nativeElement.appendChild(this.stats.dom);
    // document.body.appendChild(this.stats.domElement);
  }

  public calculateFrame() {
    this.stats.update();
    this.controls.update();
    // this.render(); //dont render all the time just render when scene changed
    requestAnimationFrame(_ => this.calculateFrame());
  }

  public onResize() {
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.render();
  }

  /********************************************/

  public updateColor(color: Color) {
    this.currentColor = color;
  }

  mapMouseToScreen(event: PointerEvent): Point {
    const mouse = new Vector3();
    mouse.x = (event.offsetX / this.elementRef.nativeElement.offsetWidth) * 2 - 1;
    mouse.y = -(event.offsetY / this.elementRef.nativeElement.offsetHeight) * 2 + 1;
    mouse.z = 2;
    mouse.unproject(this.camera);
    return new Point(new Vector2(mouse.x, mouse.y), event.pressure ? event.pressure : 0.5);
  }

  mapScreenToMouse(event: Point): Point {
    let mouse = new Vector3(event.position.x, event.position.y, 0);
    // mouse = mouse.setFromMatrixPosition(this.camera.modelViewMatrix);
    mouse.project(this.camera);
    let widthHalf = this.elementRef.nativeElement.offsetWidth / 2;
    let heightHalf = this.elementRef.nativeElement.offsetHeight / 2;
    mouse.x = (mouse.x * widthHalf) + widthHalf;
    mouse.y = -(mouse.y * heightHalf) + heightHalf;

    return new Point(new Vector2(mouse.x, mouse.y), 1);
  }

  /********************************************/

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  /********************************************/

  startNewMeshOrGetBufferArray(forceNewMesh: boolean = false) {
    let vertices: any;

    if (forceNewMesh || !this.liveStrokeMesh) {
      const geometry = new THREE.BufferGeometry();
      vertices = new Float32Array(MAX_POINTS * 3);
      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new MeshBasicMaterial({color: this.currentColor.getHex(), side: THREE.FrontSide});
      this.liveStrokeMesh = new Mesh(geometry, material);
      this.scene.add(this.liveStrokeMesh);
      this.lastPoint = null;
      this.controlPoint = null;
      this.currentIndex = 0;
      return vertices;
    } else {
      return this.liveStrokeMesh.geometry.attributes.position.array;
    }
  }

  updateGeometry(point: Point, newStroke: boolean = false): void {
    const vertices: any = this.startNewMeshOrGetBufferArray(newStroke);

    if (!this.lastPoint) {
      this.lastPoint = point;
      this.newLine = true;
      return;
    }

    if (!this.controlPoint) {
      this.controlPoint = this.lastPoint;
      return
    }

    const renderList = [];
    const prev2 = this.lastPoint;
    const prev1 = this.controlPoint;
    const cur = point;

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

    for (let i = 1; i < renderList.length; i++) {
      const currentPoint: Vector2 = renderList[i].position;
      const currentPressure: number = renderList[i].thickness;
      const lastPoint: Vector2 = renderList[i - 1].position;
      const lastPressure: number = renderList[i - 1].thickness;

      let A, B, C, D: Vector2;
      const dir = new Vector2().subVectors(currentPoint, lastPoint);
      const perpendicular = this.perp(dir).normalize();

      if (this.newLine) {
        A = new Vector2().subVectors(lastPoint.clone(), perpendicular.clone().multiplyScalar(lastPressure));
        B = lastPoint.clone().add(perpendicular.clone().multiplyScalar(lastPressure));
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        this.oldA = D;
        this.oldB = C;
        this.newLine = false;
      } else {
        A = this.oldA;
        B = this.oldB;
        C = currentPoint.clone().add(perpendicular.clone().multiplyScalar(currentPressure));
        D = new Vector2().subVectors(currentPoint.clone(), perpendicular.clone().multiplyScalar(currentPressure));

        this.oldA = D;
        this.oldB = C;
      }

      vertices[this.currentIndex++] = A.x;
      vertices[this.currentIndex++] = A.y;
      vertices[this.currentIndex++] = 2;

      vertices[this.currentIndex++] = B.x;
      vertices[this.currentIndex++] = B.y;
      vertices[this.currentIndex++] = 2;

      vertices[this.currentIndex++] = C.x;
      vertices[this.currentIndex++] = C.y;
      vertices[this.currentIndex++] = 2;

      vertices[this.currentIndex++] = C.x;
      vertices[this.currentIndex++] = C.y;
      vertices[this.currentIndex++] = 2;

      vertices[this.currentIndex++] = D.x;
      vertices[this.currentIndex++] = D.y;
      vertices[this.currentIndex++] = 2;

      vertices[this.currentIndex++] = A.x;
      vertices[this.currentIndex++] = A.y;
      vertices[this.currentIndex++] = 2;
    }

    const temp = this.controlPoint;
    this.controlPoint = point;
    this.lastPoint = temp;

    this.liveStrokeMesh.geometry.setDrawRange(0, this.currentIndex);
    this.liveStrokeMesh.geometry.attributes.position.needsUpdate = true;
    this.render();
  }

  private perp(vec: Vector2): Vector2 {
    const vector = new Vector2(0);
    const tmp = vec.y;
    vector.y = -vec.x;
    vector.x = tmp;
    return vector;
  }
}
