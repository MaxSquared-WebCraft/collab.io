import {Directive, Input} from '@angular/core';
import {OrbitControls} from 'three';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../utils/point.model';

declare let THREE: any;

@Directive({ selector: 'three-orbit-controls' })
export class OrbitControlsComponent {

  @Input() updateCallback$: Subject<Point>;
  controls: OrbitControls;

  setupControls(camera, renderer) {
    this.controls = new THREE.OrbitControls(camera, renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = false;
    this.controls.enableDamping = true;
    this.controls.addEventListener('change', () => this.updateCallback$.next());
  }

  updateControls(scene, camera) {
    this.controls.update();
  }
}
