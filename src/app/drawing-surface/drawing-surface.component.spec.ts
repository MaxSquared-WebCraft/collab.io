import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DrawingSurfaceComponent} from './drawing-surface.component';

describe('DrawingSurfaceComponent', () => {
  let component: DrawingSurfaceComponent;
  let fixture: ComponentFixture<DrawingSurfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DrawingSurfaceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingSurfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
