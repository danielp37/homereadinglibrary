import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortDate'
})
export class SortDatePipe implements PipeTransform {

  transform(values: any[], args?: any): any {
    const sortedValues = values.slice(0);
    sortedValues.sort((val1, val2) => {
      if (val1[args] < val2[args]) { return -1 };
      if (val1[args] > val2[args]) { return 1 };

      return 0;
    })

    return sortedValues;
  }

}
