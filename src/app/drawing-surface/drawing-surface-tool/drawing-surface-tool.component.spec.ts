import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DrawingSurfaceToolComponent} from './drawing-surface-tool.component';

describe('DrawingSurfaceToolComponent', () => {
  let component: DrawingSurfaceToolComponent;
  let fixture: ComponentFixture<DrawingSurfaceToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DrawingSurfaceToolComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingSurfaceToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
