import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
  selector: 'mnb-drawing-surface-controls',
  templateUrl: './drawing-surface-controls.component.html',
  styleUrls: ['./drawing-surface-controls.component.scss']
})
export class DrawingSurfaceControlsComponent implements OnInit {


  constructor(private element: ElementRef) {
  }

  ngOnInit() {
  }
}
