import {Directive, Input, OnChanges, OnInit} from '@angular/core';
import * as THREE from 'three';

@Directive({selector: 'three-orthographic-camera'})
export class OrthograpicCameraDirective implements OnInit, OnChanges {

  @Input() height: number;
  @Input() width: number;
  @Input() positions = [0, 0, 0];
  camera: THREE.OrthographicCamera;

  ngOnInit() {
    this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 1, 1000);
    this.camera.position.set(0, 0, -100);
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;

    if (widthChng || heightChng) {
      this.updateAspect(widthChng, heightChng);
    }
  }

  updateAspect(width: number, height: number) {
    if (this.camera) {
      this.camera.right = width;
      this.camera.bottom = height;
      this.camera.updateProjectionMatrix();
    }
  }
}
