import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DrawingSurfaceControlsComponent} from './drawing-surface-controls.component';

describe('DrawingSurfaceControlsComponent', () => {
  let component: DrawingSurfaceControlsComponent;
  let fixture: ComponentFixture<DrawingSurfaceControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DrawingSurfaceControlsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingSurfaceControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
