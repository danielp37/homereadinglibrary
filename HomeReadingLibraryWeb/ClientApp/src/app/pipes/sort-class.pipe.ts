import { ClassWithVolunteers } from './../entities/class-with-volunteers';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortClass'
})
export class SortClassPipe implements PipeTransform {

  transform(allClasses: ClassWithVolunteers[]): ClassWithVolunteers[] {
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
