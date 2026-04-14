import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { BaggyBookService } from 'src/app/services/baggy-book.service';
import { Class } from 'src/app/entities/class';
import { ClassStatistics } from 'src/app/entities/class-statistics';
import { Month } from 'src/app/entities/Month';

@Component({
    standalone: false,
  selector: 'app-class-stats',
  templateUrl: './class-stats.component.html',
  styleUrls: ['./class-stats.component.scss']
})
export class ClassStatsComponent implements OnInit {

  classes: Class[];
  months: Month[];
  selectedClassId: string;
  selectedMonth: string;
  classStats: unknown | ClassStatistics;

  constructor(
    private baggyBookService: BaggyBookService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedMonth = "YTD"
  }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .subscribe(classes => {
        this.ngZone.run(() => {
          this.classes = [...classes];
          this.cdr.detectChanges();
        });
      });
    this.months = new Array<Month>();

    const d: Date = new Date(Date.now());
    const curMonth: number = d.getMonth() + 1; //Month is zero based
    const startYear: number = curMonth < 9 ? d.getFullYear() - 1 : d.getFullYear();
    const curMonthYear: number = d.getFullYear() * 100 + curMonth;
    const months: number[] = [9, 10, 11, 12, 1, 2, 3, 4, 5];
    months.forEach(month => {
      const year = (month < 9 ? (startYear + 1) : startYear);
      const monthYear: number =  year * 100 + month;
      if (monthYear < curMonthYear) {
        const d1: Date = new Date(year, month - 1, 1);
        this.months.push(new Month(`${d1.toLocaleDateString('default', { month: 'long'})} ${year}`, `${monthYear}`))
      }
    });
  }

  displayClassStatsForCurrentTeacher() {
    if(this.selectedClassId)
    {
      this.baggyBookService.getClassStatistics(this.selectedClassId, this.selectedMonth)
        .subscribe(classStats => {
          this.ngZone.run(() => {
            this.classStats = classStats;
            this.cdr.detectChanges();
          });
        });
    }
    else
    {
      this.classStats = undefined;
    }
  }

}
