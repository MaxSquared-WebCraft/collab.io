import {
  Color,
  Geometry,
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
import 'rxjs/add/operator/do';
import {ServerSocket} from "./websocket.service";

declare let THREE: any;

@Injectable()
export class RenderService {
  initialized = false;
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

  constructor(private serverSocket: ServerSocket) {
    this.serverSocket.connect();
  }

  public init(elementRef: ElementRef) {
    this.elementRef = elementRef;
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, width, 0, height, 1, 1000);
    this.camera.position.set(0, 0, -500);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x666666);

    this.elementRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, elementRef.nativeElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = false;

    this.mouseDown$ = Observable
      .fromEvent(elementRef.nativeElement, 'mousedown')
      .share()
      .map<any, Point>(this.mapMouseToScreen.bind(this))
      .do((point) => {
        this.mouseIsDown = true;
        return point;
      });

    this.mouseMove$ = Observable
      .fromEvent(elementRef.nativeElement, 'mousemove')
      .share()
      .map<any, Point>(this.mapMouseToScreen.bind(this));

    this.mouseDrawing$ = this.mouseMove$
      .filter(() => this.mouseIsDown);

    this.mouseUp$ = Observable
      .fromEvent(elementRef.nativeElement, 'mouseup')
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

    this.addStats();
    this.calculateFrame();
    this.render();
    this.initialized = true;
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

  public addMeshToScene(mesh: Mesh) {
    this.scene.add(mesh);
    this.render();
  }

  public calculateFrame() {
    this.stats.update();
    this.controls.update();
    this.render(); //dont render all the time just render when scene changed
    requestAnimationFrame(_ => this.calculateFrame());
  }

  public onResize() {
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;
    //(0, width, 0, height, 1, 1000);
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /********************************************/

  public updateGeometry(newGeometry: Geometry) {
    if (!this.liveStrokeMesh) {
      this.liveStrokeMesh = new Mesh(newGeometry, new MeshBasicMaterial({
        color: 0x000000
      }));
      this.scene.add(this.liveStrokeMesh);
    }

    this.liveStrokeMesh.geometry.dispose();
    this.liveStrokeMesh.geometry = newGeometry.clone();
    this.render();
  }

  public updateColor(color: Color) {
    if (!this.liveStrokeMesh) {
      this.liveStrokeMesh = new Mesh(new Geometry(), new MeshBasicMaterial({
        color: color.getHex()
      }));
      this.scene.add(this.liveStrokeMesh);
    }

    // this.liveStrokeMesh.material.dispose();
    this.liveStrokeMesh.material = new MeshBasicMaterial({
      color: color.getHex()
    });
    this.render();
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
}
