import {Component, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
  selector: 'mnb-drawing-surface-tool',
  templateUrl: './drawing-surface-tool.component.html',
  styleUrls: ['./drawing-surface-tool.component.scss']
})
export class DrawingSurfaceToolComponent implements OnInit {
  public arrayColors: any = [];
  public selectedColorIdx = 0;

  @Output() onSelectedColorChanged = new BehaviorSubject<string>('#000000');

  constructor() {
  }

  ngOnInit() {
    this.arrayColors[0] = '#000000';
    this.arrayColors[1] = '#2883e9';
    this.arrayColors[2] = '#e920e9';
    this.arrayColors[3] = 'rgb(255,245,0)';
    this.arrayColors[4] = 'rgb(236,64,64)';
    this.arrayColors[5] = 'rgba(45,208,45,1)';
  }

  onColorSelected(idx: number) {
    console.log('change');
    this.selectedColorIdx = idx;
    this.onSelectedColorChanged.next(this.arrayColors[idx]);
  }
}
