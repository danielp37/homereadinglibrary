import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortName'
})
export class SortNamePipe implements PipeTransform {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  transform(allObjs: ObjectWithFirstAndLastName[], args?: any): any[] {
    const sortedObjs = allObjs ? allObjs.slice(0) : [];
    sortedObjs.sort((obj1, obj2) => {
        if (obj1.lastName < obj2.lastName) { return -1; }
        if (obj1.lastName > obj2.lastName) { return 1; }
        if (obj1.firstName < obj2.firstName) { return -1; }
        if (obj1.firstName > obj2.firstName) { return 1; }
        return 0;
    });

    return sortedObjs;
  }

}

interface ObjectWithFirstAndLastName {
  firstName: string;
  lastName: string;
}
