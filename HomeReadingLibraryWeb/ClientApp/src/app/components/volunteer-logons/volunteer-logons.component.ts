import {DayOfWeek} from '../../entities/day-of-week.enum';
import { VolunteerWithLogons } from './../../entities/volunteer-with-logons';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-volunteer-logons',
  templateUrl: './volunteer-logons.component.html',
  styleUrls: ['./volunteer-logons.component.css']
})
export class VolunteerLogonsComponent implements OnInit {

  defaultDaysBack = 14;
  volunteersWithLogons: VolunteerWithLogons[];

  constructor(
    private baggyBookService: BaggyBookService
  ) {
    this.volunteersWithLogons = new Array<VolunteerWithLogons>();
   }

  ngOnInit() {
      this.getVolunteerLoginsSinceDate(this.defaultDaysBack);
  }

  public getVolunteerLoginsSinceDate(daysBack: number) {
    this.baggyBookService.getVolunteerLoginsSinceDate(daysBack)
      .subscribe(volunteers => this.volunteersWithLogons = volunteers);
  }

  private getDayOfWeekString(dayOfWeek: DayOfWeek): string {
    return DayOfWeek[dayOfWeek];
  }
}
