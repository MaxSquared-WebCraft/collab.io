import { AfterContentInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent as observableFromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, groupBy, map, mergeMap, share, startWith, takeUntil } from 'rxjs/operators';
import { Color, Vector2, Vector3 } from 'three';
import { RendererComponent } from './renderer.component';
import { GroupedObservable } from 'rxjs/internal-compatibility';
import { Subject } from 'rxjs/Subject';
import { Point } from '../drawing-surface/shared/models/point.model';
import { SocketService } from '../shared/services/websocket.service';
import { AuthService } from '../shared/services/auth.service';
import { SocketMessage } from '../shared/models/socket-message.model';

@Component({
  selector: 'three',
  template: `
    <three-renderer [height]="height" [width]="width" [updateCallback$]="update$">
      <three-orbit-controls [updateCallback$]="update$"></three-orbit-controls>
      <three-scene [meshesUpdated]="update$">
        <three-orthographic-camera [height]="height" [width]="width"
                                   [positions]="[0, 0, 0]"></three-orthographic-camera>
        <three-stroke *ngFor="let obs$ of activeStrokes" [strokeInput$]="obs$" [updateCallback$]="update$"
                      [currentColor]="color">
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

  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {

    const normalizeInput = (changes: Observable<PointerEvent>) => changes.pipe(
      map((e: PointerEvent) => {
        e.preventDefault();
        return e;
      }),
      map((e: PointerEvent) => new Point(
        e.pointerId,
        Date.now(),
        new Vector2(e.pageX, e.pageY),
        e.pressure ? e.pressure : 0.5)
      ),
      distinctUntilChanged()
    );

    const transformPointToSocketMsg = (type: string) => map((point: Point): SocketMessage => {
      const user = this.authService.getUserFromToken();
      return new SocketMessage(point, user, type);
    });

    const filterForType = (type: string) => filter((message: SocketMessage) => message.type === type);

    const transformSocketMessageToPoint = map((message: SocketMessage) => {
      const point = message.point;
      return new Point(
        point.identifier,
        point.time,
        new Vector2(point.position.x, point.position.y),
        point.thickness,
      )
    });

    this.mouseDown$ = merge(
      observableFromEvent(this.canvas.nativeElement, 'pointerdown').pipe(normalizeInput),
    ).pipe(/* is the share needed here? */map<Point, Point>(this.mapMouseToScreen.bind(this)), share());

    this.mouseMove$ = merge(
      observableFromEvent(this.canvas.nativeElement, 'pointermove').pipe(normalizeInput),
    ).pipe(/* is the share needed here? */map<Point, Point>(this.mapMouseToScreen.bind(this)), share());

    this.mouseUp$ = merge(
      observableFromEvent(this.canvas.nativeElement, 'pointerup').pipe(normalizeInput),
      observableFromEvent(this.canvas.nativeElement, 'pointerleave').pipe(normalizeInput),
      observableFromEvent(this.canvas.nativeElement, 'pointerout').pipe(normalizeInput),
    ).pipe(/* is the share needed here? */map<Point, Point>(this.mapMouseToScreen.bind(this)), share());

    this.mouseDown$.pipe(transformPointToSocketMsg('mouseDown')).subscribe(this.socketService.send);
    this.mouseMove$.pipe(transformPointToSocketMsg('mouseMove')).subscribe(this.socketService.send);
    this.mouseUp$.pipe(transformPointToSocketMsg('mouseUp')).subscribe(this.socketService.send);

    const socketMouseDown$ = this.socketService.messages.pipe(
      filterForType('mouseDown'),
      transformSocketMessageToPoint,
      share(),
    );

    const socketMouseMove$ = this.socketService.messages.pipe(
      filterForType('mouseMove'),
      transformSocketMessageToPoint,
      share(),
    );

    const socketMouseUp$ = this.socketService.messages.pipe(
      filterForType('mouseUp'),
      transformSocketMessageToPoint,
      share(),
    );

    merge(socketMouseDown$, this.mouseDown$).subscribe((test) => console.log('compare mouse down', test));

    /**
     * Moves
     * You can think of these as individual drags of your pointer.
     * Each one is an observable which yields the events it is comprised of.
     * Keep in mind that the first and last event of a group may be the same event.
     **/

    this.mouseMoves$ = merge(this.mouseDown$, socketMouseDown$)
      .pipe(
        mergeMap((e: Point) => merge(this.mouseMove$, socketMouseMove$).pipe(
          filter((b: Point) => b.identifier === e.identifier),
          takeUntil(merge(this.mouseUp$, socketMouseUp$).pipe(filter((b) => b.identifier === e.identifier))),
          startWith(e)
        ))
      ).pipe(
        groupBy(
          (p: Point) => p.identifier,
          (p: Point) => p,
          (group: any) => merge(this.mouseUp$, socketMouseUp$).pipe(
            filter((e: Point) => e.identifier === group.key)
          )
        ),
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
