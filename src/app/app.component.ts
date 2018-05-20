import {Component, ElementRef} from '@angular/core';
import {requestFullScreen} from '../utils/fullscreen';
import './app.scss';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  image: any;
  audioData: any;
  isFullScreen = false;

  constructor(private element: ElementRef) {
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;

    if (!this.isFullScreen) {
      requestFullScreen(this.element.nativeElement);
    }
  }

}
