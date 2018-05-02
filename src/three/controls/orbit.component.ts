import { Directive, Input } from '@angular/core';
import {
  BufferAttribute,
  Color,
  Mesh,
  MeshBasicMaterial,
  OrbitControls,
  OrthographicCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  WireframeGeometry
} from 'three';
declare let THREE: any;

@Directive({ selector: 'three-orbit-controls' })
export class OrbitControlsComponent {

  controls: OrbitControls;

  setupControls(camera, renderer) {
    this.controls = new THREE.OrbitControls(camera, renderer.domElement);
  }

  updateControls(scene, camera) {
    this.controls.update();
  }

}
