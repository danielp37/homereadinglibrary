import { BaggyBookService } from '../../services/baggy-book.service';
import {Router} from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Volunteer } from '../../entities/volunteer';
import { VolunteerForClass } from '../../entities/volunteer-for-class';
import { Class } from '../../entities/class';
import { DayOfWeek } from '../../entities/day-of-week.enum';

@Component({
  selector: 'app-signup-volunteer',
  templateUrl: './signup-volunteer.component.html',
  styleUrls: ['./signup-volunteer.component.css'],
  providers: [BaggyBookService]
})
export class SignupVolunteerComponent implements OnInit {

  DayOfWeek: typeof DayOfWeek = DayOfWeek;
  classes: Class[];
  volunteerForClasses: VolunteerForClass[];

  onSubmit(signupVolunteer: NgForm) {
    const volunteer = Object.assign({}, signupVolunteer.value) as Volunteer;
    volunteer.volunteerForClass = this.volunteerForClasses;
    this.baggyBookService.createVolunteer(volunteer)
      .then(() => this.gotoVolunteerSignIn());
  }

  gotoVolunteerSignIn(): void {
    this.router.navigateByUrl('/signin');
  }

  addVolunteerForClass(): void {
    this.volunteerForClasses.push(new VolunteerForClass());
  }

  removeVolunteerForClass(): void {
    this.volunteerForClasses.pop();
  }

  constructor(
      private baggyBookService: BaggyBookService,
      private router: Router
      ) {
        this.volunteerForClasses = [];
       }

  ngOnInit() {
    this.baggyBookService.getClasses(2018)
      .then(classes => this.classes = classes);
  }

}
