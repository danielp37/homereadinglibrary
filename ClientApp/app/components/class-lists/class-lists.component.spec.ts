import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassListsComponent } from './class-lists.component';

describe('ClassListsComponent', () => {
  let component: ClassListsComponent;
  let fixture: ComponentFixture<ClassListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
