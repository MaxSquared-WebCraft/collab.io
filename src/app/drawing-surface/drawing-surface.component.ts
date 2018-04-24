import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Color} from 'three';
import 'rxjs/add/operator/distinctUntilChanged';
import {Stroke} from "./shared/models/stroke.model";
import {SimplifyService} from "./shared/services/simplify.service";
import {PolygonService} from "./shared/services/polygon.service";
import {RenderService} from "./shared/services/render.service";
import {Point} from "./shared/models/point.model";

@Component({
  selector: 'mnb-drawing-surface',
  templateUrl: './drawing-surface.component.html',
  styleUrls: ['./drawing-surface.component.css']
})
export class DrawingSurfaceComponent implements AfterViewInit {
  @ViewChild('container')
  private elementRef: ElementRef;
  private currentStroke: Stroke = new Stroke(new Color(100, 100, 100));
  private currentColor: string;

  constructor(private simplifyService: SimplifyService,
              private renderService: RenderService,
              private polygonService: PolygonService) {
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

  mouseUp(point: Point) {
    this.currentStroke.points.push(point);
    const oldPointCount = this.currentStroke.points.length;
    // this.currentStroke.points = this.simplifyService.simplify(this.currentStroke.points, 0.5);
    // console.log('Points reduced from ' + oldPointCount + ' to ' + this.currentStroke.points.length);

    const mesh = this.polygonService.addStroke(this.currentStroke);
    if (mesh) {
      this.renderService.addMeshToScene(mesh);
    }
    this.renderService.updateGeometry(this.polygonService.getLiveStrokeGeometry(new Stroke(new Color('#000000'))));
  }

  mouseMove(point: Point) {
    this.currentStroke.points.push(point);
    this.renderService.updateGeometry(this.polygonService.getLiveStrokeGeometry(this.currentStroke));
  }

  mouseDown(point: Point) {
    this.currentStroke = new Stroke(new Color(this.currentColor));
    this.currentStroke.points.push(point);
  }

  comparer(point1: Point, point2: Point) {
    return point1.position.x === point2.position.x &&
      point1.position.y === point2.position.y &&
      point1.thickness === point2.thickness;
  }
}
