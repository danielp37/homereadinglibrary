import { Class } from './../../entities/class';
import { NgForm } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Output, EventEmitter, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.css']
})
export class AddClassComponent implements OnInit {
  @Output()classAdded = new EventEmitter<Class>();
  status: string;
  errorStatus: string;

  constructor(
    private baggyBookService: BaggyBookService,
    private renderer: Renderer2) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    //Does nothing
  }

  addNewClass(f: NgForm) {
    this.baggyBookService.addClass(f.value.teacherName, f.value.grade)
      .subscribe({ 
        next: cls => {
          this.classAdded.emit(cls);
          f.resetForm();
          this.status = `Class ${cls.teacherName} successfully added!`
          setTimeout(() => this.status = '', 2000);
          this.focusTeacherName();
        },
        error: error => {
          this.errorStatus = `Error: ${error}`;
          setTimeout(() => this.errorStatus = '', 10000);
        }
      });
  }

  focusTeacherName() {
    setTimeout(() => {
      const element = this.renderer.selectRootElement('#teacherName');
      element.focus();
    }, 300);
  }
}
