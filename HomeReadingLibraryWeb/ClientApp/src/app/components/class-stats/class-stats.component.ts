import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from 'src/app/services/baggy-book.service';
import { Class } from 'src/app/entities/class';
import { ClassStatistics } from 'src/app/entities/class-statistics';

@Component({
  selector: 'app-class-stats',
  templateUrl: './class-stats.component.html',
  styleUrls: ['./class-stats.component.scss']
})
export class ClassStatsComponent implements OnInit {

  classes: Class[];
  selectedClassId: string;
  classStats: {} | ClassStatistics;

  constructor(
    private baggyBookService: BaggyBookService
  ) { }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
  }

  displayClassStatsForCurrentTeacher() {
    if(this.selectedClassId)
    {
      this.baggyBookService.getClassStatistics(this.selectedClassId)
        .subscribe(classStats => this.classStats = classStats);
    }
    else
    {
      this.classStats = undefined;
    }
  }

}
