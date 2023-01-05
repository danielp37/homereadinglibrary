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
  classStats: {} | ClassStatistics;

  constructor(
    private baggyBookService: BaggyBookService
  ) {
    this.selectedMonth = "YTD"
  }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
    this.months = new Array<Month>();
    this.months.push(new Month("September 2022", "202209"));
    this.months.push(new Month("October 2022", "202210"));
    this.months.push(new Month("November 2022", "202211"));
    this.months.push(new Month("December 2022", "202212"));
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
