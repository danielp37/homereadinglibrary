import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClassStatsComponent } from './class-stats.component';

describe('ClassStatsComponent', () => {
  let component: ClassStatsComponent;
  let fixture: ComponentFixture<ClassStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
