import {Directive} from '@angular/core';
import {OrbitControls} from 'three';

declare let THREE: any;

@Directive({ selector: 'three-orbit-controls' })
export class OrbitControlsComponent {

  controls: OrbitControls;

  setupControls(camera, renderer) {
    this.controls = new THREE.OrbitControls(camera, renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = false;
    this.controls.enableDamping = true;
  }

  updateControls(scene, camera) {
    this.controls.update();
  }
}
