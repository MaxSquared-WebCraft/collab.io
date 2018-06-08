import {Component, HostListener, ViewChild} from '@angular/core';
import {Color} from 'three';
import {ThreeComponent} from '../three/three.component';

@Component({
  selector: 'mnb-drawing-surface',
  templateUrl: './drawing-surface.component.html',
  styleUrls: ['./drawing-surface.component.scss']
})
export class DrawingSurfaceComponent {
  @ViewChild(ThreeComponent) threeComponent: ThreeComponent;
  width: number;
  height: number;

  constructor() {
    this.height = window.innerHeight - 2 * 60;
    this.width = window.innerWidth;
  }

  @HostListener('window:resize')
  resetWidthHeight() {
    this.height = window.innerHeight - 2 * 60;
    this.width = window.innerWidth;
  }

  colorChanged(color: string) {
    if (this.threeComponent) {
      this.threeComponent.color = new Color(color);
    }
  }
}
