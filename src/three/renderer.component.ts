import {AfterContentInit, ContentChild, Directive, ElementRef, Input, OnChanges} from '@angular/core';
import * as THREE from 'three';


import {SceneComponent} from './scene.component';
import {OrbitControlsComponent} from './controls/orbit.component';
import {Subject} from 'rxjs/Subject';
import {Point} from '../utils/point.model';

@Directive({ selector: 'three-renderer' })
export class RendererComponent implements OnChanges, AfterContentInit {

  @Input() height: number;
  @Input() width: number;
  @Input() isVRMode = false;
  @Input() updateCallback$: Subject<Point>;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(OrbitControlsComponent) orbitComponent: OrbitControlsComponent;

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: false
  });


  get scene() {
    return this.sceneComp.scene;
  }

  get camera() {
    return this.sceneComp.camera;
  }

  get nativeElement() {
    return this.element.nativeElement;
  }

  constructor(private element: ElementRef) {
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;
    if (widthChng || heightChng) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  ngAfterContentInit() {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xFFFFFF);
    this.element.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    this.orbitComponent.setupControls(this.camera, this.renderer);

    this.updateCallback$.subscribe(
      () => this.renderer.render(this.scene, this.camera)
    );

    this.render();
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    this.orbitComponent.updateControls(this.scene, this.camera);
    this.camera.lookAt(this.scene.position);
    // this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }
}
