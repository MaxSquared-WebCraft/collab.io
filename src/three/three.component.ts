import {AfterContentInit, Component, HostListener, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {fromEvent as observableFromEvent, merge, Observable} from 'rxjs';
import {distinctUntilChanged, filter, groupBy, map, mergeMap, share, startWith, takeUntil} from 'rxjs/operators';
import {Point} from '../utils/point.model';
import {Vector2, Vector3} from 'three';
import {RendererComponent} from './renderer.component';
import {GroupedObservable} from 'rxjs/internal-compatibility';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'three',
  template: `
    <three-renderer [height]="height" [width]="width" [updateCallback$]="update$">
      <three-orbit-controls [updateCallback$]="update$"></three-orbit-controls>
      <three-scene [meshesUpdated]="update$">
        <three-orthographic-camera [height]="height" [width]="width" [positions]="[-50, 0, 0]"></three-orthographic-camera>
        <three-stroke *ngFor="let obs$ of activeStrokes" [strokeInput$]="obs$" [updateCallback$]="update$"></three-stroke>
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
  mouseMoves$: Observable<GroupedObservable<any, any>>;
  mouseUp$: Observable<Point>;
  update$: Subject<void> = new Subject<void>();

  finishedStrokes: any[] = [];
  activeStrokes: Observable<Point[]>[] = [];

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
    // this.mouseMove$.subscribe(
    //   (point: Point) => this.serverSocket.send(JSON.stringify({
    //     type: 'mouseMoved',
    //     data: {
    //       position: point.position,
    //     }
    //   }))
    // );
    // const normalizeTouch = (changes: Observable<TouchEvent>) => changes.pipe(
    //   map((e: TouchEvent) => { e.preventDefault(); return e; }),
    //   flatMap((e: TouchEvent | any) => {
    //     return fromArray(e.originalEvent.changedTouches).pipe(
    //       map((touch: Touch) =>
    //         new Point(touch.identifier, new Date().getUTCMilliseconds(), new Vector2(touch.pageX, touch.pageY), 1)
    //       )
    //     );
    //   }),
    //   distinctUntilChanged()
    // );
    //
    // const normalizeMouse = (changes: Observable<MouseEvent>) => changes.pipe(
    //   map((e: MouseEvent) => { e.preventDefault(); return e; }),
    //   map((e: MouseEvent) => new Point(0, new Date().getUTCMilliseconds(), new Vector2(e.pageX, e.pageY), 1)),
    //   distinctUntilChanged()
    // );

    const normalizeInput = (changes: Observable<PointerEvent>) => changes.pipe(
      map((e: PointerEvent) => {
        e.preventDefault();
        return e;
      }),
      // filter((e: PointerEvent) => e.pointerType === 'pen'),
      map((e: PointerEvent) => new Point(e.pointerId, Date.now(),
        new Vector2(e.pageX, e.pageY), e.pressure ? e.pressure : 0.5)),
      distinctUntilChanged()
    );

    this.mouseDown$ = merge(
      // observableFromEvent(this.canvas.nativeElement, 'mousedown').pipe(normalizeMouse),
      // observableFromEvent(this.canvas.nativeElement, 'touchstart').pipe(normalizeTouch),
      observableFromEvent(this.canvas.nativeElement, 'pointerdown').pipe(normalizeInput),
    ).pipe(share(), map<Point, Point>(this.mapMouseToScreen.bind(this)));

    this.mouseMove$ = merge(
      // observableFromEvent(this.canvas.nativeElement, 'mousemove').pipe(normalizeMouse),
      // observableFromEvent(this.canvas.nativeElement, 'touchmove').pipe(normalizeTouch),
      observableFromEvent(this.canvas.nativeElement, 'pointermove').pipe(normalizeInput)
    ).pipe(share(), map<Point, Point>(this.mapMouseToScreen.bind(this)));

    this.mouseUp$ = merge(
      // observableFromEvent(this.canvas.nativeElement, 'mouseup').pipe(normalizeMouse),
      // observableFromEvent(this.canvas.nativeElement, 'touchend').pipe(normalizeTouch),
      observableFromEvent(this.canvas.nativeElement, 'pointerup').pipe(normalizeInput),
      observableFromEvent(this.canvas.nativeElement, 'pointerleave').pipe(normalizeInput)
    ).pipe(share(), map<Point, Point>(this.mapMouseToScreen.bind(this)));

    /**
     * Moves
     * You can think of these as individual drags of your pointer.
     * Each one is an observable which yields the events it is comprised of.
     * Keep in mind that the first and last event of a group may be the same event.
     **/

    this.mouseMoves$ = this.mouseDown$.pipe(
      mergeMap((e: Point) => this.mouseMove$.pipe(
        filter((b: Point) => b.identifier === e.identifier),
        takeUntil(this.mouseUp$.pipe(filter((b) => b.identifier === e.identifier))),
        startWith(e)
      ))
    ).pipe(
      groupBy((p: Point) => p.identifier, (p: Point) => p, (group: any) =>
        this.mouseUp$.pipe(filter((e: Point) => e.identifier === group.key))),
      share()
    );

    this.mouseMoves$.subscribe((g: any) => {
      this.activeStrokes.push(g);

      // g.pipe(first()).subscribe(function (e) {
      //   console.log('start', e);
      // });
      //
      // g.pipe(last()).subscribe((e) => {
      //   console.log('end', e);
      //   // this.activeStrokes.splice(this.activeStrokes.indexOf(g), 1);
      //   // remove from active array
      // });
      //
      // g.subscribe(function (e) {
      //   console.log('move', e);
      // });

      // g.pipe(count()).subscribe(function (x) {
      //   console.log('Count: ' + x);
      // });

    });

    this.mouseMoves$.pipe(
      mergeMap((groups) => groups) // .pipe(reduce((acc, curr) => [...acc, ...curr], [])))
    ).subscribe(
      (stroke: Point[]) => this.finishedStrokes.push(stroke)
    );
  }

  mapMouseToScreen(event: Point): Point {
    const mouse = new Vector3();
    mouse.x = (event.position.x / this.width) * 2 - 1;
    mouse.y = -(event.position.y / this.height) * 2 + 1;
    mouse.z = 2;
    mouse.unproject(this.canvas.camera);
    event.position = new Vector2(mouse.x, mouse.y);
    return event;
  }

  mapScreenToMouse(event: Point): Point {
    const mouse = new Vector3(event.position.x, event.position.y, 0);
    mouse.project(this.canvas.camera);
    const widthHalf = this.width / 2;
    const heightHalf = this.height / 2;
    mouse.x = (mouse.x * widthHalf) + widthHalf;
    mouse.y = -(mouse.y * heightHalf) + heightHalf;
    event.position = new Vector2(mouse.x, mouse.y);
    return event;
  }
}
