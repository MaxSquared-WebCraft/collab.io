import {AfterContentInit, ContentChild, ContentChildren, Directive, Input} from '@angular/core';
import * as THREE from 'three';

import {StrokeComponent} from './objects/stroke-component.directive';
import {OrthograpicCameraDirective} from './cameras/orthograpic-camera-component.directive';
import {Observable} from 'rxjs/Observable';

@Directive({ selector: 'three-scene' })
export class SceneComponent implements AfterContentInit {

  @Input() meshesUpdated: Observable<void>;

  @ContentChild(OrthograpicCameraDirective) cameraComp: any;
  @ContentChildren(StrokeComponent) strokeComps: any;

  scene: THREE.Scene = new THREE.Scene();

  get camera() {
    return this.cameraComp.camera;
  }

  ngAfterContentInit() {
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    const meshes = [
      ...this.strokeComps.toArray(),
    ];

    for (const mesh of meshes) {
      if (mesh && mesh.object) {
        this.scene.add(mesh.object);
      } else if (mesh && mesh.attachScene) {
        mesh.attachScene(this.scene);
      }
    }

    this.meshesUpdated.subscribe(
      () => this.queryForUpdates()
    );
  }

  queryForUpdates(): void {
    const meshes = [
      ...this.strokeComps.toArray(),
    ];

    for (const mesh of meshes) {
      if (mesh && mesh.object) {
        this.scene.add(mesh.object);
      } else if (mesh && mesh.attachScene) {
        mesh.attachScene(this.scene);
      }
    }
  }
}
