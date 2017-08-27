import { Class } from './../../entities/class';
import { NgForm } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.css']
})
export class AddClassComponent implements OnInit {
  @Output()onClassAdded = new EventEmitter<Class>();
  status: string;

  constructor(private baggyBookService: BaggyBookService) { }

  ngOnInit() {
  }

  addNewClass(f: NgForm) {
    this.baggyBookService.addClass(f.value.teacherName, f.value.grade)
      .then(cls => {
        this.onClassAdded.emit(cls);
        f.resetForm();
        this.status = `Class ${cls.teacherName} successfully added!`
        setTimeout(() => this.status = '', 2000);
      });
  }
}
