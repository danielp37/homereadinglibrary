import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from 'src/app/services/baggy-book.service';
import { Class } from 'src/app/entities/class';
import { ClassStatistics } from 'src/app/entities/class-statistics';
import { Month } from 'src/app/entities/Month';

@Component({
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
    private baggyBookService: BaggyBookService
  ) {
    this.selectedMonth = "YTD"
  }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .subscribe(classes => this.classes = classes);
    this.months = new Array<Month>();
    // this.months.push(new Month("September 2022", "202209"));
    // this.months.push(new Month("October 2022", "202210"));
    // this.months.push(new Month("November 2022", "202211"));
    // this.months.push(new Month("December 2022", "202212"));
    // this.months.push(new Month("January 2023", "202301"));

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
        .subscribe(classStats => this.classStats = classStats);
    }
    else
    {
      this.classStats = undefined;
    }
  }

}
