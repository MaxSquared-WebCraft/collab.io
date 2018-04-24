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
  iconColor: string = "#FFFFFF";

  @Output() onSelectedColorChanged = new BehaviorSubject<string>('#000000');

  constructor() {
  }

  ngOnInit() {
    this.arrayColors[0] = '#000000';
    this.arrayColors[1] = '#2883e9';
    this.arrayColors[2] = '#e920e9';
    this.arrayColors[3] = '#FF0000';
    this.arrayColors[4] = '#00FF00';
    this.arrayColors[5] = '#004400';
  }

  onColorSelected(idx: number) {
    this.selectedColorIdx = idx;
    this.onSelectedColorChanged.next(this.arrayColors[idx]);
    this.iconColor = this.pickTextColorBasedOnBgColorSimple(this.arrayColors[idx]);
  }

  pickTextColorBasedOnBgColorSimple(bgColor: string): string {
    console.log(bgColor);
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    console.log(r, g, b, (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186));
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 120) ? "#000000" : "#FFFFFF";
  }
}
