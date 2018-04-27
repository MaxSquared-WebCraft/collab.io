import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Color} from 'three';
import 'rxjs/add/operator/distinctUntilChanged';
import {SimplifyService} from "./shared/services/simplify.service";
import {RenderService} from "./shared/services/render.service";
import {Point} from "./shared/models/point.model";

const minDistance = 0.5;

@Component({
  selector: 'mnb-drawing-surface',
  templateUrl: './drawing-surface.component.html',
  styleUrls: ['./drawing-surface.component.scss']
})
export class DrawingSurfaceComponent implements AfterViewInit {
  @ViewChild('container')
  private elementRef: ElementRef;
  private currentColor: string;

  constructor(private simplifyService: SimplifyService,
              private renderService: RenderService) {
  }

  ngAfterViewInit() {
    if (this.elementRef) {
      this.renderService.init(this.elementRef);
      this.renderService.mouseUp$.distinctUntilChanged(this.comparer).subscribe(this.mouseUp.bind(this));
      this.renderService.mouseDrawing$.distinctUntilChanged(this.comparer).subscribe(this.mouseMove.bind(this));
      this.renderService.mouseDown$.distinctUntilChanged(this.comparer).subscribe(this.mouseDown.bind(this));
    }
  }

  colorChanged(color: string) {
    this.currentColor = color;
    if (this.renderService.initialized) {
      this.renderService.updateColor(new Color(color));
    }
  }

  mouseDown(point: Point) {
    // this.currentStroke = new Stroke(new Color(this.currentColor));
    // this.currentStroke.points.push(point);
    this.renderService.updateGeometry(point, true);
  }

  mouseMove(point: Point) {
    // this.currentStroke.points.push(point);
    this.renderService.updateGeometry(point);
  }

  mouseUp(point: Point) {
    // this.currentStroke.points.push(point);
    // const oldPointCount = this.currentStroke.points.length;
    // this.currentStroke.points = this.simplifyService.simplify(this.currentStroke.points, 0.5);
    // console.log('Points reduced from ' + oldPointCount + ' to ' + this.currentStroke.points.length);

    // const mesh = this.renderService.addStrokeBufferGeometry(this.currentStroke);
    // if (mesh) {
    //   this.renderService.addMeshToScene(mesh);
    // }
    // this.renderService.updateGeometry(this.renderService.updateGeometry(new Stroke(new Color('#000000'))));
    this.renderService.updateGeometry(point);
  }

  comparer(point1: Point, point2: Point) {
    return point1.position.x === point2.position.x &&
      point1.position.y === point2.position.y &&
      point1.thickness === point2.thickness;
  }

  private getSqSegDist(p: Point, p1: Point, p2: Point) {
    let x = p1.position.x,
      y = p1.position.y,
      dx = p2.position.x - x,
      dy = p2.position.y - y;

    if (dx !== 0 || dy !== 0) {

      let t = ((p.position.x - x) * dx + (p.position.y - y) * dy) / (dx * dx + dy * dy);

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
}
