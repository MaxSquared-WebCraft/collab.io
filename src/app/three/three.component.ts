import {AfterContentInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {fromEvent as observableFromEvent, merge, Observable} from 'rxjs';
import {distinctUntilChanged, filter, groupBy, map, mergeMap, share, startWith, takeUntil, tap} from 'rxjs/operators';
import {Color, Vector2, Vector3} from 'three';
import {RendererComponent} from './renderer.component';
import {GroupedObservable} from 'rxjs/internal-compatibility';
import {Subject} from 'rxjs/Subject';
import {Point} from '../drawing-surface/shared/models/point.model';

@Component({
  selector: 'three',
  template: `
    <three-renderer [height]="height" [width]="width" [updateCallback$]="update$">
      <three-orbit-controls [updateCallback$]="update$"></three-orbit-controls>
      <three-scene [meshesUpdated]="update$">
        <three-orthographic-camera [height]="height" [width]="width" [positions]="[0, 0, 0]"></three-orthographic-camera>
        <three-stroke *ngFor="let obs$ of activeStrokes" [strokeInput$]="obs$" [updateCallback$]="update$" [currentColor]="color">
        </three-stroke>
      </three-scene>
    </three-renderer>
  `
})
export class ThreeComponent implements OnInit, AfterContentInit {
  @Input() height: number;
  @Input() width: number;

  mouseDown$: Observable<Point>;
  mouseMove$: Observable<Point>;
  mouseMoves$: Observable<GroupedObservable<any, any>>;
  mouseUp$: Observable<Point>;
  update$: Subject<void> = new Subject<void>();

  finishedStrokes: any[] = [];
  activeStrokes: Observable<Point[]>[] = [];
  color: Color = new Color(0x000000);

  @ViewChild(RendererComponent) canvas: RendererComponent;

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    const normalizeInput = (changes: Observable<PointerEvent>) => changes.pipe(
      map((e: PointerEvent) => {
        e.preventDefault();
        return e;
      }),
      map((e: PointerEvent) => new Point(e.pointerId, Date.now(),
        new Vector2(e.pageX, e.pageY), e.pressure ? e.pressure : 0.5)),
      tap((point: Point) => console.log(point)),
      distinctUntilChanged()
    );

    this.mouseDown$ = merge(
      observableFromEvent(this.canvas.nativeElement, 'pointerdown').pipe(normalizeInput),
    ).pipe(share(), map<Point, Point>(this.mapMouseToScreen.bind(this)));

    this.mouseMove$ = merge(
      observableFromEvent(this.canvas.nativeElement, 'pointermove').pipe(normalizeInput)
    ).pipe(share(), map<Point, Point>(this.mapMouseToScreen.bind(this)));

    this.mouseUp$ = merge(
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
    });

    this.mouseMoves$.pipe(
      mergeMap((groups) => groups)
    ).subscribe((stroke: Point[]) => this.finishedStrokes.push(stroke));
  }

  mapMouseToScreen(event: Point): Point {
    const mouse = new Vector3();
    mouse.x = (event.position.x / this.width) * 2 - 1;
    mouse.y = -((event.position.y - 60) / this.height) * 2 + 1;
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
