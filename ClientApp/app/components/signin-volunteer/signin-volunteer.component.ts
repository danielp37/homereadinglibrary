import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Volunteer } from '../../entities/Volunteer';
import { Class } from '../../entities/class';
import { DayOfWeek } from '../../entities/day-of-week.enum';

@Component({
  selector: 'app-signin-volunteer',
  templateUrl: './signin-volunteer.component.html',
  styleUrls: ['./signin-volunteer.component.css']
})
export class SigninVolunteerComponent implements OnInit {

  classes: Class[];
  volunteers: Volunteer[];

  constructor(
    private baggyBookService: BaggyBookService
  ) { }

  getDayOfWeek(volunteer: Volunteer, cls: Class): string {
    const volunteerForClass = volunteer.volunteerForClass.find(v4c => v4c.classId === cls.classId);
    if (volunteerForClass !== undefined) {
      return DayOfWeek[volunteerForClass.dayOfWeek];
    }

    return 'No Day of Week selected';
  }

  ngOnInit() {
    const c = this.baggyBookService.getClasses();
    const v = this.baggyBookService.getVolunteers();
    Promise.all([c, v]).then(values => {
      const classes = values[0] as Class[];
      const volunteers = values[1] as Volunteer[];
      classes.forEach(classObj => {
          if (classObj.volunteers === undefined) {
            classObj.volunteers = [];
          }
      });

      volunteers.forEach(volunteer => {
        volunteer.volunteerForClass.forEach( v4c => {
          const classObj = classes.find(cls => cls.classId === v4c.classId);
          if (classObj !== undefined) {
            classObj.volunteers.push(volunteer);
          }
        });
      });

      this.classes = classes;
      this.volunteers = volunteers;
    });
  }

}
