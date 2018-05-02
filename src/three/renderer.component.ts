import { Directive, ElementRef, Input, ContentChild } from '@angular/core';
import * as THREE from 'three';

import { SceneComponent } from './scene.component';
import { OrbitControlsComponent } from './controls/orbit.component';

@Directive({ selector: 'three-renderer' })
export class RendererComponent {

  @Input() height: number;
  @Input() width: number;
  @Input() isVRMode = false;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(OrbitControlsComponent) orbitComponent: OrbitControlsComponent;

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true
  });

  get scene() {
    return this.sceneComp.scene;
  }

  get camera() {
    return this.sceneComp.camera;
  }

  constructor(private element: ElementRef) {
  }

  ngOnChanges(changes) {

    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;
    if(widthChng || heightChng) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  ngAfterContentInit() {
    this.renderer.setSize(this.width, this.height);
    this.element.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    this.orbitComponent.setupControls(this.camera, this.renderer);

    this.render();
  }

  render() {
    this.orbitComponent.updateControls(this.scene, this.camera);
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }
}
