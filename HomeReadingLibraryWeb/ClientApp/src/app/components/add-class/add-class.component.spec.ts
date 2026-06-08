import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { AddClassComponent } from './add-class.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('AddClassComponent', () => {
  let component: AddClassComponent;
  let fixture: ComponentFixture<AddClassComponent>;

  beforeEach(waitForAsync(() => {
    const mockRenderer2 = {
      selectRootElement: jasmine.createSpy('selectRootElement').and.returnValue({ focus: jasmine.createSpy('focus') })
    };

    TestBed.configureTestingModule({
      declarations: [ AddClassComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: jasmine.createSpyObj('BaggyBookService', ['addClass']) },
        { provide: Renderer2, useValue: mockRenderer2 }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
