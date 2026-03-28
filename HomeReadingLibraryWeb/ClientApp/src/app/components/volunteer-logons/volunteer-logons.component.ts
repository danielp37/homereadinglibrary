import {DayOfWeek} from '../../entities/day-of-week.enum';
import { VolunteerWithLogons } from './../../entities/volunteer-with-logons';
import { BaggyBookService } from './../../services/baggy-book.service';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';

@Component({
    standalone: false,
  selector: 'app-volunteer-logons',
  templateUrl: './volunteer-logons.component.html',
  styleUrls: ['./volunteer-logons.component.css']
})
export class VolunteerLogonsComponent implements OnInit {

  defaultDaysBack = 14;
  volunteersWithLogons: VolunteerWithLogons[];

  constructor(
    private baggyBookService: BaggyBookService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.volunteersWithLogons = new Array<VolunteerWithLogons>();
   }

  ngOnInit() {
      this.getVolunteerLoginsSinceDate(this.defaultDaysBack);
  }

  public getVolunteerLoginsSinceDate(daysBack: number) {
    this.baggyBookService.getVolunteerLoginsSinceDate(daysBack)
      .subscribe(volunteers => {
        this.ngZone.run(() => {
          this.volunteersWithLogons = [...volunteers];
          this.cdr.detectChanges();
        });
      });
  }

  private getDayOfWeekString(dayOfWeek: DayOfWeek): string {
    return DayOfWeek[dayOfWeek];
  }
}
