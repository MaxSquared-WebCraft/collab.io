import {AfterContentInit, Component, HostListener, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {fromEvent as observableFromEvent, Observable} from 'rxjs';
import {filter, map, share, tap} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {Point} from '../utils/point.model';
import {Vector2, Vector3} from 'three';
import {RendererComponent} from './renderer.component';

@Component({
  selector: 'three',
  template: `
    <three-renderer [height]="height" [width]="width">
      <three-orbit-controls></three-orbit-controls>
      <three-scene>
        <three-perspective-camera [height]="height" [width]="width" [positions]="[-50, 0, 0]"></three-perspective-camera>
        <three-point-light></three-point-light>
        <three-sphere></three-sphere>
        <three-skybox></three-skybox>
      </three-scene>
    </three-renderer>
  `
})
export class ThreeComponent implements OnInit, AfterContentInit, OnChanges {

  @Input() ngModel: any;
  @Input() image: any;

  @Input() height: number;
  @Input() width: number;

  mouseDown$: Observable<Point>;
  mouseMove$: Observable<Point>;
  mouseDrawing$: Observable<Point>;
  mouseUp$: Observable<Point>;
  mouseIsDown = false; // TODO: remove this and refactor subscribe

  @ViewChild(RendererComponent) canvas: RendererComponent;

  @HostListener('window:resize')
  resetWidthHeight() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
  }

  ngOnInit(): void {
    this.resetWidthHeight();
  }

  ngOnChanges(changes): void {
    if (changes.ngModel && changes.ngModel.currentValue) {
      console.log('changes', changes);
    }
  }

  ngAfterContentInit(): void {
    // filter for left mouse only
    this.mouseDown$ = observableFromEvent(this.canvas.nativeElement, 'pointerdown').pipe(
      share(),
      tap((point) => {
        console.log(point);
      }),
      map<any, Point>((e: PointerEvent) => this.mapMouseToScreen(e)),
      tap((point) => {
        console.log(point);
        this.mouseIsDown = true;
        return point;
      })
    );

    this.mouseMove$ = observableFromEvent(this.canvas.nativeElement, 'pointermove').pipe(
      share(),
      tap((point) => {
        console.log(point);
      }),
      map<any, Point>((e: PointerEvent) => this.mapMouseToScreen(e))
    );

    this.mouseDrawing$ = this.mouseMove$.pipe(
      filter(() => this.mouseIsDown));

    this.mouseUp$ = observableFromEvent(this.canvas.nativeElement, 'pointerup').pipe(
      share(),
      map<any, Point>((e: PointerEvent) => this.mapMouseToScreen(e)),
      tap((point) => {
        this.mouseIsDown = false;
        return point;
      })
    );

    // this.mouseMove$.subscribe(
    //   (point: Point) => this.serverSocket.send(JSON.stringify({
    //     type: 'mouseMoved',
    //     data: {
    //       position: point.position,
    //     }
    //   }))
    // );
  }


  mapMouseToScreen(event: PointerEvent): Point {
    const mouse = new Vector3();
    mouse.x = (event.offsetX / this.width) * 2 - 1;
    mouse.y = -(event.offsetY / this.height) * 2 + 1;
    mouse.z = 2;
    mouse.unproject(this.canvas.camera);
    return new Point(new Vector2(mouse.x, mouse.y), event.pressure ? event.pressure : 0.5);
  }

  mapScreenToMouse(event: Point): Point {
    const mouse = new Vector3(event.position.x, event.position.y, 0);
    mouse.project(this.canvas.camera);
    const widthHalf = this.width / 2;
    const heightHalf = this.height / 2;
    mouse.x = (mouse.x * widthHalf) + widthHalf;
    mouse.y = -(mouse.y * heightHalf) + heightHalf;

    return new Point(new Vector2(mouse.x, mouse.y), 1);
  }
}
