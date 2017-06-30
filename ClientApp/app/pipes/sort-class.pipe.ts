import { Pipe, PipeTransform } from '@angular/core';
import { Class } from '../entities/class';

@Pipe({
  name: 'sortClass'
})
export class SortClassPipe implements PipeTransform {

  transform(allClasses: Class[]): Class[] {
    const sortedClasses = allClasses.slice(0);
    sortedClasses.sort((cls1, cls2) => {
        if (cls1.grade < cls2.grade) { return -1; }
        if (cls1.grade > cls2.grade) { return 1; }
        if (cls1.teacherName < cls2.teacherName) { return -1; }
        if (cls1.teacherName > cls2.teacherName) { return 1; }
        return 0;
    });

    return sortedClasses;
  }

}
